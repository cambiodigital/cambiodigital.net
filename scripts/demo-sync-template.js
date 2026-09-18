const fs = require('fs');
const path = require('path');
const {
    DEMOS_DIR,
    SHARED_BLOCKS,
    loadTemplateDefinition,
    readText,
    replaceBlock,
    writeText
} = require('./demo-template-utils');

const CATALOG_PAGE = path.join(DEMOS_DIR, 'index.html');

function findDemoPages(dir, accumulated = []) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
        const entryPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            findDemoPages(entryPath, accumulated);
        } else if (entry.isFile() && entry.name === 'index.html' && entryPath !== CATALOG_PAGE) {
            accumulated.push(entryPath);
        }
    });
    return accumulated;
}

function main() {
    const templateDefinition = loadTemplateDefinition();
    const demoPages = findDemoPages(DEMOS_DIR);

    if (demoPages.length === 0) {
        console.log('No hay demos internas que sincronizar.');
        return;
    }

    let updatedCount = 0;
    demoPages.forEach((demoPage) => {
        const original = readText(demoPage);
        let output = original;
        let changed = false;

        SHARED_BLOCKS.forEach(([key, marker]) => {
            const result = replaceBlock(output, marker, templateDefinition[key]);
            if (result !== null && result !== output) {
                output = result;
                changed = true;
            }
        });

        if (changed) {
            writeText(demoPage, `${output.trim()}\n`);
            updatedCount += 1;
            console.log(`Actualizada: ${path.relative(process.cwd(), demoPage)}`);
        }
    });

    console.log(`\n${updatedCount} de ${demoPages.length} demos sincronizadas con Docs/PLANTILLA_DEMO_UNICA.html.`);
}

try {
    main();
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
