const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DEMOS_DIR = path.join(ROOT_DIR, 'demos');
const TEMPLATE_PATH = path.join(ROOT_DIR, 'Docs', 'PLANTILLA_DEMO_UNICA.html');
const MANIFEST_PATH = path.join(ROOT_DIR, 'assets', 'js', 'demos-data.js');
const MANIFEST_ANCHOR = '// CD_DEMOS_INSERT_ANCHOR';

const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

const STATUSES = ['active', 'coming-soon', 'draft', 'archived'];
const VISIBILITIES = ['public', 'unlisted', 'private'];
const TYPES = ['internal', 'external'];

const SHARED_BLOCKS = [
    ['iconsBlock', 'DEMO_SHARED_ICONS'],
    ['headBlock', 'DEMO_SHARED_HEAD'],
    ['chromeTopBlock', 'DEMO_SHARED_CHROME_TOP'],
    ['chromeBottomBlock', 'DEMO_SHARED_CHROME_BOTTOM'],
    ['footerScriptsBlock', 'DEMO_SHARED_FOOTER_SCRIPTS']
];

function readText(filePath) {
    return fs.readFileSync(filePath, 'utf8');
}

function writeText(filePath, content) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');
}

function dedentBlock(block) {
    const normalized = block.replace(/\r\n/g, '\n').replace(/^\n+|\n+$/g, '');
    const lines = normalized.split('\n');
    const indents = lines
        .filter((line) => line.trim().length > 0)
        .map((line) => line.match(/^\s*/)[0].length);
    const minIndent = indents.length ? Math.min(...indents) : 0;

    return lines
        .map((line) => line.slice(minIndent))
        .join('\n');
}

function extractBlock(source, startMarker, endMarker, label) {
    const startIndex = source.indexOf(startMarker);
    const endIndex = source.indexOf(endMarker);

    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
        throw new Error(`No se pudo extraer ${label} desde la plantilla.`);
    }

    return dedentBlock(source.slice(startIndex + startMarker.length, endIndex));
}

function loadTemplateDefinition() {
    const template = readText(TEMPLATE_PATH);
    const definition = { template };

    SHARED_BLOCKS.forEach(([key, marker]) => {
        definition[key] = extractBlock(template, `<!-- ${marker}_START -->`, `<!-- ${marker}_END -->`, `bloque ${marker}`);
    });

    if (!/<!-- DEMO_CONTENT_START -->[\s\S]*?<!-- DEMO_CONTENT_END -->/.test(template)) {
        throw new Error('La plantilla no contiene el bloque DEMO_CONTENT.');
    }

    return definition;
}

function replaceBlock(html, marker, replacement) {
    const pattern = new RegExp(`(<!-- ${marker}_START -->)[\\s\\S]*?(<!-- ${marker}_END -->)`);
    if (!pattern.test(html)) return null;
    return html.replace(pattern, `$1\n${dedentBlock(replacement)}\n$2`);
}

function formatDisplayDate(isoDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
        throw new Error('La fecha debe usar formato YYYY-MM-DD.');
    }

    const [year, month, day] = isoDate.split('-').map(Number);
    const monthLabel = MONTHS[month - 1];
    if (!monthLabel) {
        throw new Error('La fecha contiene un mes inválido.');
    }

    return `${String(day).padStart(2, '0')} ${monthLabel} ${year}`;
}

function slugify(input) {
    return input
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');
}

function parseCliArgs(argv) {
    const args = {};

    for (let index = 0; index < argv.length; index += 1) {
        const token = argv[index];
        if (!token.startsWith('--')) {
            continue;
        }

        const key = token.slice(2);
        const next = argv[index + 1];

        if (!next || next.startsWith('--')) {
            args[key] = true;
            continue;
        }

        args[key] = next;
        index += 1;
    }

    return args;
}

function replaceToken(content, token, value) {
    return content.split(token).join(value);
}

function robotsForVisibility(visibility) {
    return visibility === 'public' ? 'index, follow' : 'noindex, nofollow';
}

function absoluteUrl(urlPath) {
    if (/^https?:\/\//i.test(urlPath)) return urlPath;
    return `https://cambiodigital.net${urlPath.startsWith('/') ? '' : '/'}${urlPath}`;
}

function buildDemoFromTemplate(options, templateDefinition = loadTemplateDefinition()) {
    let output = templateDefinition.template;
    const slug = String(options.slug || options.id || '');
    const title = options.title;
    const description = options.description;
    const isoDate = options.date;
    const category = options.category;

    const tokenMap = new Map([
        ['TITULO_DEMO', title],
        ['SLUG_DEMO', slug],
        ['DESCRIPCION_DEMO', description],
        ['META_ROBOTS', robotsForVisibility(options.visibility)],
        ['URL_IMAGEN_DEMO', options.image ? absoluteUrl(options.image) : 'https://cambiodigital.net/assets/og-home.png'],
        ['YYYY-MM-DD', isoDate],
        ['Categoria', category]
    ]);

    tokenMap.forEach((value, token) => {
        output = replaceToken(output, token, value);
    });

    return `${output.trim()}\n`;
}

function escapeRegExp(input) {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function manifestEntryExists(manifestContent, id) {
    return new RegExp(`id:\\s*'${escapeRegExp(id)}'`).test(manifestContent);
}

function jsString(value) {
    return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function formatManifestEntry(demo) {
    const lines = [
        '{',
        `            id: '${demo.id}',`,
        `            title: ${jsString(demo.title)},`,
        `            tagline: ${jsString(demo.tagline)},`,
        `            description: ${jsString(demo.description)},`,
        `            category: ${jsString(demo.category)},`,
        `            tags: [${demo.tags.map((tag) => jsString(tag)).join(', ')}],`,
        `            date: '${demo.date}',`,
        `            status: '${demo.status}',`,
        `            visibility: '${demo.visibility}',`,
        `            type: '${demo.type}',`,
        `            url: '${demo.url}',`,
        `            image: ${demo.image ? jsString(demo.image) : 'null'},`,
        `            client: ${demo.client ? jsString(demo.client) : 'null'},`,
        `            variants: []`
    ];

    const extraVariants = Array.isArray(demo.variants) && demo.variants.length > 0
        ? demo.variants.map((variant) => `{ label: ${jsString(variant.label)}, url: ${jsString(variant.url)} }`).join(', ')
        : '';
    if (extraVariants) {
        lines[lines.length - 1] = `            variants: [${extraVariants}]`;
    }

    lines.push('        },');
    return lines.join('\n');
}

function insertDemoInManifest(demo) {
    const manifestContent = readText(MANIFEST_PATH);
    const anchorPattern = new RegExp(`^(\\s*)${escapeRegExp(MANIFEST_ANCHOR)}.*$`, 'm');

    if (!anchorPattern.test(manifestContent)) {
        throw new Error(`No se encontró el ancla ${MANIFEST_ANCHOR} en ${MANIFEST_PATH}.`);
    }

    const updated = manifestContent.replace(anchorPattern, (match, indent) => {
        return `${indent}${formatManifestEntry(demo)}\n${match}`;
    });

    writeText(MANIFEST_PATH, updated);
}

function loadManifestDemos() {
    const window = {};
    const loader = new Function('window', `${readText(MANIFEST_PATH)}; return window.CD_DEMOS;`);
    const demos = loader(window);

    if (!Array.isArray(demos)) {
        throw new Error('El manifiesto no expone un array window.CD_DEMOS.');
    }

    return demos;
}

function parseTagsArg(rawTags) {
    if (!rawTags || rawTags === true) return [];
    return String(rawTags)
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
}

module.exports = {
    DEMOS_DIR,
    MANIFEST_PATH,
    MONTHS,
    ROOT_DIR,
    STATUSES,
    VISIBILITIES,
    TYPES,
    SHARED_BLOCKS,
    TEMPLATE_PATH,
    buildDemoFromTemplate,
    formatDisplayDate,
    insertDemoInManifest,
    loadManifestDemos,
    loadTemplateDefinition,
    manifestEntryExists,
    parseCliArgs,
    parseTagsArg,
    readText,
    replaceBlock,
    robotsForVisibility,
    slugify,
    writeText
};
