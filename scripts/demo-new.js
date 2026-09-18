const fs = require('fs');
const path = require('path');
const {
    DEMOS_DIR,
    STATUSES,
    VISIBILITIES,
    TYPES,
    buildDemoFromTemplate,
    insertDemoInManifest,
    manifestEntryExists,
    parseCliArgs,
    parseTagsArg,
    readText,
    slugify,
    writeText
} = require('./demo-template-utils');

function printUsage() {
    console.log([
        'Uso:',
        '  npm run demo:new -- --title "Panel ERP" --category "ERP" --description "..."',
        '',
        'Opciones:',
        '  --slug "erp-dashboard"        por defecto se deriva del título',
        '  --tagline "Frase corta"       línea para la tarjeta del catálogo',
        '  --tags "ERP, Dashboard"       chips separados por coma',
        '  --date 2026-09-18             por defecto hoy',
        '  --visibility public|unlisted|private   (default: unlisted)',
        '  --status active|coming-soon|draft|archived   (default: active)',
        '  --type internal|external      (default: internal)',
        '  --url "https://..."           obligatorio si --type external',
        '  --image "/assets/images/demos/x.png"   preview opcional',
        '  --client "Nombre Cliente"     solo contexto interno, nunca público',
        '  --force                       sobrescribe el archivo HTML si existe',
        '',
        'Notas:',
        '  - Las demos internas se crean en demos/{slug}/index.html desde Docs/PLANTILLA_DEMO_UNICA.html.',
        '  - Las demos externas no crean archivos: solo registran la URL en el manifiesto.',
        '  - Tras editar el manifiesto a mano, ejecuta `npm run demo:validate`.',
        '  - Si creaste clases nuevas, ejecuta `npm run build:css`.',
        '  - Una demo public+active debe añadirse a sitemap.xml.'
    ].join('\n'));
}

function validateArgs(args) {
    const errors = [];

    if (!args.title) errors.push('Falta --title.');
    if (!args.category) errors.push('Falta --category.');

    if (args.status && !STATUSES.includes(args.status)) {
        errors.push(`--status inválido. Valores: ${STATUSES.join(', ')}.`);
    }
    if (args.visibility && !VISIBILITIES.includes(args.visibility)) {
        errors.push(`--visibility inválida. Valores: ${VISIBILITIES.join(', ')}.`);
    }
    if (args.type && !TYPES.includes(args.type)) {
        errors.push(`--type inválido. Valores: ${TYPES.join(', ')}.`);
    }
    if (args.date && !/^\d{4}-\d{2}-\d{2}$/.test(args.date)) {
        errors.push('--date debe usar formato YYYY-MM-DD.');
    }
    if (args.type === 'external' && !/^https?:\/\//i.test(args.url || '')) {
        errors.push('Las demos externas requieren --url con URL absoluta (http/https).');
    }

    return errors;
}

function main() {
    const args = parseCliArgs(process.argv.slice(2));

    if (args.help || args.h) {
        printUsage();
        process.exit(0);
    }

    const errors = validateArgs(args);
    if (errors.length > 0) {
        console.error(errors.join('\n'));
        console.error('');
        printUsage();
        process.exit(1);
    }

    const slug = args.slug ? slugify(args.slug) : slugify(args.title);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
        throw new Error(`El slug "${slug}" no es válido (usa kebab-case, ej. mi-demo-nueva).`);
    }

    const type = args.type || 'internal';
    const visibility = args.visibility || 'unlisted';
    const status = args.status || 'active';
    const url = type === 'external' ? args.url : `/demos/${slug}`;

    const demo = {
        id: slug,
        title: String(args.title),
        tagline: String(args.tagline || args.description || 'Demo interactiva de Cambio Digital.'),
        description: String(args.description || args.tagline || 'Demo interactiva de Cambio Digital.'),
        category: String(args.category),
        tags: parseTagsArg(args.tags),
        date: args.date || new Date().toISOString().slice(0, 10),
        status,
        visibility,
        type,
        url,
        image: args.image ? String(args.image) : null,
        client: args.client ? String(args.client) : null,
        variants: []
    };

    const manifestContent = readText(require('./demo-template-utils').MANIFEST_PATH);
    if (manifestEntryExists(manifestContent, demo.id)) {
        throw new Error(`Ya existe una demo con id "${demo.id}" en el manifiesto. Edítala a mano en assets/js/demos-data.js.`);
    }

    if (type === 'internal') {
        const outputPath = path.join(DEMOS_DIR, slug, 'index.html');
        if (!args.force && fs.existsSync(outputPath)) {
            throw new Error(`El archivo ya existe: ${outputPath}. Usa --force para sobrescribirlo.`);
        }
        writeText(outputPath, buildDemoFromTemplate(demo));
        console.log(`Demo creada desde plantilla única: ${outputPath}`);
    }

    insertDemoInManifest(demo);
    console.log(`Demo registrada en el manifiesto: assets/js/demos-data.js (id: ${demo.id})`);
    console.log('');
    console.log('Siguientes pasos:');
    if (type === 'internal') {
        console.log(`  1. Reemplaza el bloque DEMO_CONTENT en demos/${slug}/index.html con la experiencia interactiva.`);
    }
    console.log('  2. Ejecuta `npm run build:css` (las clases nuevas de demos/ deben compilarse).');
    console.log('  3. Ejecuta `npm run demo:validate` para verificar la integridad del registro.');
    if (visibility === 'public' && status === 'active') {
        console.log('  4. Añade la URL a sitemap.xml (es pública).');
    } else {
        console.log('  4. Recuerda: unlisted/private no va al catálogo ni al sitemap (noindex automático).');
    }
}

try {
    main();
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
