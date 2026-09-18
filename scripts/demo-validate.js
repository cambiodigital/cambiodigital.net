const fs = require('fs');
const path = require('path');
const {
    DEMOS_DIR,
    MANIFEST_PATH,
    ROOT_DIR,
    STATUSES,
    VISIBILITIES,
    TYPES,
    loadManifestDemos
} = require('./demo-template-utils');

const REQUIRED_FIELDS = ['id', 'title', 'tagline', 'category', 'date', 'url'];
const SITEMAP_PATH = path.join(ROOT_DIR, 'sitemap.xml');

function validateDemos(demos) {
    const errors = [];
    const seenIds = new Set();

    demos.forEach((demo, index) => {
        const label = demo && demo.id ? `demo "${demo.id}"` : `entrada #${index + 1}`;

        REQUIRED_FIELDS.forEach((field) => {
            if (!demo || !demo[field]) {
                errors.push(`${label}: falta el campo obligatorio "${field}".`);
            }
        });

        if (!demo || !demo.id) return;

        if (seenIds.has(demo.id)) {
            errors.push(`Id duplicado: "${demo.id}".`);
        }
        seenIds.add(demo.id);

        if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(demo.id)) {
            errors.push(`${label}: el id debe ser kebab-case.`);
        }
        if (!STATUSES.includes(demo.status)) {
            errors.push(`${label}: status inválido "${demo.status}". Valores: ${STATUSES.join(', ')}.`);
        }
        if (!VISIBILITIES.includes(demo.visibility)) {
            errors.push(`${label}: visibility inválida "${demo.visibility}". Valores: ${VISIBILITIES.join(', ')}.`);
        }
        if (!TYPES.includes(demo.type)) {
            errors.push(`${label}: type inválido "${demo.type}". Valores: ${TYPES.join(', ')}.`);
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(demo.date || '')) {
            errors.push(`${label}: date debe ser YYYY-MM-DD.`);
        }
        if (!Array.isArray(demo.tags)) {
            errors.push(`${label}: tags debe ser un array.`);
        }
        if (demo.variants != null && !Array.isArray(demo.variants)) {
            errors.push(`${label}: variants debe ser un array.`);
        }

        if (demo.type === 'internal') {
            if (demo.url !== `/demos/${demo.id}`) {
                errors.push(`${label}: las demos internas deben usar url "/demos/${demo.id}" (recibido: "${demo.url}").`);
            }
            const demoPage = path.join(DEMOS_DIR, demo.id, 'index.html');
            if (!fs.existsSync(demoPage)) {
                errors.push(`${label}: no existe ${path.relative(ROOT_DIR, demoPage)}.`);
            }
            const robotsMatch = /<meta name="robots" content="([^"]+)">/.exec(fs.existsSync(path.join(DEMOS_DIR, demo.id, 'index.html')) ? fs.readFileSync(path.join(DEMOS_DIR, demo.id, 'index.html'), 'utf8') : '');
            const robotsIndexable = Boolean(robotsMatch && !/noindex/i.test(robotsMatch[1]) && /(^|\s)index/i.test(robotsMatch[1]));
            if (robotsMatch && demo.visibility === 'public' && !robotsIndexable) {
                errors.push(`${label}: es pública pero su HTML tiene robots "${robotsMatch[1]}". Regenera o corrige el meta robots.`);
            }
            if (robotsMatch && demo.visibility !== 'public' && robotsIndexable) {
                errors.push(`${label}: NO es pública pero su HTML es indexable ("${robotsMatch[1]}").`);
            }
        }

        if (demo.type === 'external' && !/^https?:\/\//i.test(demo.url || '')) {
            errors.push(`${label}: las demos externas requieren url absoluta http(s).`);
        }

        if (demo.image && typeof demo.image === 'string' && demo.image.startsWith('/')) {
            const imagePath = path.join(ROOT_DIR, demo.image.replace(/^\//, ''));
            if (!fs.existsSync(imagePath)) {
                errors.push(`${label}: no existe la imagen preview "${demo.image}".`);
            }
        }
    });

    return errors;
}

function validateSitemap(demos) {
    const errors = [];
    const sitemap = fs.existsSync(SITEMAP_PATH) ? fs.readFileSync(SITEMAP_PATH, 'utf8') : '';

    demos.forEach((demo) => {
        if (demo.type !== 'internal') return;

        const inSitemap = sitemap.includes(`cambiodigital.net/demos/${demo.id}`);
        const shouldBeIndexed = demo.visibility === 'public' && demo.status === 'active';

        if (shouldBeIndexed && !inSitemap) {
            errors.push(`sitemap.xml: falta la demo pública "${demo.id}" (${demo.url}).`);
        }
        if (!shouldBeIndexed && inSitemap) {
            errors.push(`sitemap.xml: contiene la demo NO pública "${demo.id}". Elimínala del sitemap.`);
        }
    });

    const hasCatalog = sitemap.includes('cambiodigital.net/demos');
    if (!hasCatalog && demos.some((demo) => demo.visibility === 'public')) {
        errors.push('sitemap.xml: falta la URL del catálogo /demos.');
    }

    return errors;
}

function main() {
    let demos;
    try {
        demos = loadManifestDemos();
    } catch (error) {
        console.error(`Error leyendo el manifiesto (${path.relative(ROOT_DIR, MANIFEST_PATH)}): ${error.message}`);
        process.exit(1);
    }

    const errors = [...validateDemos(demos), ...validateSitemap(demos)];

    if (errors.length > 0) {
        console.error(`Se encontraron ${errors.length} problema(s):`);
        errors.forEach((error) => console.error(`  - ${error}`));
        process.exit(1);
    }

    const publicCount = demos.filter((demo) => demo.visibility === 'public' && demo.status === 'active').length;
    console.log(`OK: ${demos.length} demo(s) válidas (${publicCount} pública(s) en catálogo).`);
}

main();
