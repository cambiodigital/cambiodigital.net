const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT_DIR, 'blog');
const TEMPLATE_PATH = path.join(ROOT_DIR, 'Docs', 'PLANTILLA_BLOG_UNICA.html');

const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

function readText(filePath) {
    return fs.readFileSync(filePath, 'utf8');
}

function writeText(filePath, content) {
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

function indentBlock(block, indent) {
    const prefix = typeof indent === 'number' ? ' '.repeat(indent) : indent;
    return dedentBlock(block)
        .split('\n')
        .map((line) => (line.length ? prefix + line : ''))
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

function extractMatch(source, regex, label, groupIndex = 1) {
    const match = source.match(regex);
    if (!match) {
        throw new Error(`No se pudo encontrar ${label} en la plantilla.`);
    }
    return match[groupIndex];
}

function loadTemplateDefinition() {
    const template = readText(TEMPLATE_PATH);

    return {
        template,
        iconsBlock: extractBlock(template, '<!-- BLOG_SHARED_ICONS_START -->', '<!-- BLOG_SHARED_ICONS_END -->', 'bloque de iconos'),
        headBlock: extractBlock(template, '<!-- BLOG_SHARED_HEAD_START -->', '<!-- BLOG_SHARED_HEAD_END -->', 'bloque head compartido'),
        footerScriptsBlock: extractBlock(template, '<!-- BLOG_SHARED_FOOTER_SCRIPTS_START -->', '<!-- BLOG_SHARED_FOOTER_SCRIPTS_END -->', 'bloque de scripts compartidos'),
        bodyClass: extractMatch(template, /<body class="([^"]+)">/, 'body class'),
        mainClass: extractMatch(template, /<main class="([^"]+)">/, 'main class'),
        articleClass: extractMatch(template, /<article class="([^"]+)">/, 'article class'),
        titleClass: extractMatch(template, /<h1 class="([^"]+)">TITULO_VISIBLE<\/h1>/, 'title class'),
        metaClass: extractMatch(template, /<div class="([^"]+)">\s*<span>26 MAR 2026<\/span>/, 'meta class'),
        backLinkBlock: dedentBlock(extractMatch(template, /(<a href="\/blog\.html"[\s\S]*?<\/a>)/, 'enlace de regreso', 1)),
        contentBlock: extractBlock(template, '<!-- BLOG_CONTENT_START -->', '<!-- BLOG_CONTENT_END -->', 'bloque de contenido')
    };
}

function stripTemplateMarkers(content) {
    return content.replace(/^\s*<!-- BLOG_[A-Z0-9_]+ -->\s*\n?/gm, '');
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

function buildPostFromTemplate(options) {
    const templateDefinition = loadTemplateDefinition();
    let output = templateDefinition.template;
    const slug = options.slug || slugify(options.title || 'nuevo-blog');
    const isoDate = options.date || new Date().toISOString().slice(0, 10);
    const displayDate = options['display-date'] || formatDisplayDate(isoDate);
    const title = options.title || 'TITULO_DEL_ARTICULO';
    const description = options.description || 'DESCRIPCION_DEL_ARTICULO';
    const imageUrl = options.image || 'URL_IMAGEN_1200';
    const keywords = options.keywords || 'PALABRAS_CLAVE_SEPARADAS_POR_COMAS';
    const category = options.category || 'Categoria';
    const readTime = options['read-time'] || '5 min lectura';
    const imageAlt = options['image-alt'] || title;
    const intro = options.intro || 'INTRO_DESTACADA';
    const opening = options.opening || 'PARRAFO_INICIAL';
    const sectionTitle = options['section-title'] || 'SUBTITULO';
    const sectionBody = options['section-body'] || 'DESARROLLO';
    const ctaTitle = options['cta-title'] || 'CTA_TITULO';
    const ctaDescription = options['cta-description'] || 'CTA_DESCRIPCION';
    const ctaButton = options['cta-button'] || 'CTA_BOTON';
    const contentFile = options['content-file'];

    const tokenMap = new Map([
        ['SLUG_DEL_ARTICULO', slug],
        ['TITULO_DEL_ARTICULO', title],
        ['TITULO_OG', options['og-title'] || title],
        ['TITULO_TWITTER', options['twitter-title'] || title],
        ['TITULO_SCHEMA', options['schema-title'] || title],
        ['TITULO_VISIBLE', options['visible-title'] || title],
        ['DESCRIPCION_DEL_ARTICULO', description],
        ['DESCRIPCION_OG', options['og-description'] || description],
        ['DESCRIPCION_TWITTER', options['twitter-description'] || description],
        ['DESCRIPCION_SCHEMA', options['schema-description'] || description],
        ['PALABRAS_CLAVE_SEPARADAS_POR_COMAS', keywords],
        ['URL_IMAGEN_1200', imageUrl],
        ['ALT_DE_LA_IMAGEN', imageAlt],
        ['YYYY-MM-DD', isoDate],
        ['26 MAR 2026', displayDate],
        ['5 min lectura', readTime],
        ['Categoria', category],
        ['INTRO_DESTACADA', intro],
        ['PARRAFO_INICIAL', opening],
        ['SUBTITULO', sectionTitle],
        ['DESARROLLO', sectionBody],
        ['CTA_TITULO', ctaTitle],
        ['CTA_DESCRIPCION', ctaDescription],
        ['CTA_BOTON', ctaButton]
    ]);

    tokenMap.forEach((value, token) => {
        output = replaceToken(output, token, value);
    });

    if (contentFile) {
        const resolvedContentPath = path.resolve(process.cwd(), contentFile);
        const customContent = readText(resolvedContentPath).trim();
        output = output.replace(/<!-- BLOG_CONTENT_START -->[\s\S]*?<!-- BLOG_CONTENT_END -->/, `<!-- BLOG_CONTENT_START -->\n${customContent}\n                <!-- BLOG_CONTENT_END -->`);
    }

    output = stripTemplateMarkers(output);

    return {
        slug,
        isoDate,
        displayDate,
        html: normalizeBlogPostHtml(output, templateDefinition)
    };
}

function insertBeforeFirst(content, markers, insertion) {
    const indexes = markers
        .map((marker) => ({ marker, index: content.indexOf(marker) }))
        .filter((entry) => entry.index !== -1)
        .sort((left, right) => left.index - right.index);

    if (indexes.length === 0) {
        throw new Error('No se encontró un punto válido para insertar el bloque compartido en <head>.');
    }

    const { index } = indexes[0];
    return `${content.slice(0, index).replace(/\s*$/, '')}\n\n${insertion}\n\n${content.slice(index)}`;
}

function normalizeBlogPostHtml(html, templateDefinition = loadTemplateDefinition()) {
    let output = html.replace(/\r\n/g, '\n');

    output = output.replace(/^\s*<link rel="icon"[^\n]*\n/gm, '');

    output = output.replace(/(<link rel="canonical" href="https:\/\/cambiodigital\.net\/blog\/[^"]+">)/, `$1\n${indentBlock(templateDefinition.iconsBlock, 4)}`);

    const sharedHeadPatterns = [
        /\s*<script>[\s\S]*?localStorage\.getItem\('cd-theme'\)[\s\S]*?<\/script>\s*/g,
        /\s*<link rel="stylesheet" href="\/assets\/css\/tailwind\.generated\.css">\s*/g,
        /\s*<link rel="stylesheet" href="\/assets\/css\/theme\.css">\s*/g,
        /\s*<!-- Google Fonts -->[\s\S]*?<\/noscript>\s*/g,
        /\s*<!-- Lucide Icons -->\s*<script src="\/assets\/js\/lucide\.min\.js"(?: defer)?><\/script>\s*/g,
        /\s*<!-- Theme Toggle \(in head to prevent flash\) -->\s*<script src="\/assets\/js\/theme-toggle\.js"(?: defer)?><\/script>\s*/g
    ];

    sharedHeadPatterns.forEach((pattern) => {
        output = output.replace(pattern, '\n');
    });

    output = insertBeforeFirst(output, ['<script type="application/ld+json">', '<style>', '</head>'], indentBlock(templateDefinition.headBlock, 4));

    output = output.replace(/<body class="[^"]*"[^>]*>/, `<body class="${templateDefinition.bodyClass}">`);
    output = output.replace(/<main class="[^"]*">/, `<main class="${templateDefinition.mainClass}">`);
    output = output.replace(/<article class="[^"]*">/, `<article class="${templateDefinition.articleClass}">`);

    output = output.replace(/(^[ \t]*)<a href="\/blog\.html"[\s\S]*?<\/a>/m, (match, indent) => indentBlock(templateDefinition.backLinkBlock, indent));
    output = output.replace(/<h1 class="[^"]*">/, `<h1 class="${templateDefinition.titleClass}">`);
    output = output.replace(/(<\/h1>\s*)<div class="[^"]*">/, `$1<div class="${templateDefinition.metaClass}">`);

    output = output.replace(/^\s*<script src="\/assets\/js\/blog-post\.js"><\/script>\s*$/gm, '');
    output = output.replace(/^\s*<script src="\/assets\/js\/layout-loader\.js"><\/script>\s*$/gm, '');

    output = output.replace(/(<div id="footer-container"><\/div>)/, `$1\n\n${indentBlock(templateDefinition.footerScriptsBlock, 4)}`);
    output = output.replace(/\n{3,}/g, '\n\n');

    return `${output.trim()}\n`;
}

module.exports = {
    BLOG_DIR,
    TEMPLATE_PATH,
    buildPostFromTemplate,
    formatDisplayDate,
    loadTemplateDefinition,
    normalizeBlogPostHtml,
    parseCliArgs,
    readText,
    slugify,
    writeText
};