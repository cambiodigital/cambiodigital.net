/**
 * Demos Catalog — renderiza el catálogo /demos desde el manifiesto window.CD_DEMOS
 * (assets/js/demos-data.js). Infraestructura reutilizable: no contiene datos
 * específicos de ninguna demo.
 *
 * Requiere en la página:
 *   - #demos-filters  → contenedor de los botones de filtro por categoría.
 *   - #demos-grid     → contenedor de las tarjetas.
 *   - #demos-empty    → estado vacío (oculto por defecto).
 *   - filterDemos(cat) se expone global para los onclick de los botones.
 */
(function () {
    'use strict';

    var GRID_SELECTOR = '#demos-grid';
    var FILTERS_SELECTOR = '#demos-filters';
    var EMPTY_SELECTOR = '#demos-empty';

    var MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

    var CATEGORY_ICONS = {
        'erp': 'layout-dashboard',
        'crm': 'users',
        'chatbot': 'message-circle',
        'web': 'globe',
        'ia': 'sparkles',
        'automatizacion': 'workflow',
        'ecommerce': 'shopping-cart',
        'reportes': 'bar-chart-3'
    };

    function getDemos() {
        return Array.isArray(window.CD_DEMOS) ? window.CD_DEMOS : [];
    }

    function isListable(demo) {
        return Boolean(demo) && demo.visibility === 'public' &&
            (demo.status === 'active' || demo.status === 'coming-soon');
    }

    function getListableDemos() {
        return getDemos()
            .filter(isListable)
            .sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function normalizeCategoryToken(category) {
        return String(category || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    }

    function categoryIcon(category) {
        return CATEGORY_ICONS[normalizeCategoryToken(category)] || 'monitor-play';
    }

    function formatDisplayDate(isoDate) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate || '')) return '';
        var parts = isoDate.split('-');
        var day = String(Number(parts[2])).padStart(2, '0');
        return day + ' ' + MONTHS[Number(parts[1]) - 1] + ' ' + parts[0];
    }

    function isExternal(demo) {
        return demo.type === 'external' || /^https?:\/\//i.test(demo.url || '');
    }

    function demoHref(demo) {
        return demo.url || (demo.type === 'internal' ? '/demos/' + demo.id : '#');
    }

    function linkAttributes(demo) {
        return isExternal(demo)
            ? ' target="_blank" rel="noopener noreferrer"'
            : '';
    }

    function buildPreview(demo) {
        var icon = categoryIcon(demo.category);

        if (demo.image) {
            return '' +
                '<div class="h-40 rounded-lg overflow-hidden mb-4" style="border: 1px solid var(--cd-border);">' +
                    '<img src="' + escapeHtml(demo.image) + '" alt="Vista previa de la demo ' + escapeHtml(demo.title) + '" loading="lazy" width="800" height="450" class="w-full h-full object-cover">' +
                '</div>';
        }

        return '' +
            '<div class="h-40 rounded-lg mb-4 flex items-center justify-center" style="background: linear-gradient(135deg, var(--cd-surface), var(--cd-purple-dark)); border: 1px solid var(--cd-border);">' +
                '<i data-lucide="' + icon + '" class="w-10 h-10" style="color: var(--cd-highlight-color);"></i>' +
            '</div>';
    }

    function buildTagChips(demo) {
        if (!Array.isArray(demo.tags) || demo.tags.length === 0) return '';
        return '<div class="flex flex-wrap gap-1 mb-4">' + demo.tags.map(function (tag) {
            return '<span class="text-xs px-2 py-0.5 rounded-full" style="background: var(--cd-surface);">' + escapeHtml(tag) + '</span>';
        }).join('') + '</div>';
    }

    function buildVariantLinks(demo) {
        if (!Array.isArray(demo.variants) || demo.variants.length === 0) return '';
        var links = demo.variants.map(function (variant) {
            var external = /^https?:\/\//i.test(variant.url || '');
            return '<a href="' + escapeHtml(variant.url) + '"' + (external ? ' target="_blank" rel="noopener noreferrer"' : '') +
                ' class="text-xs px-2 py-1 rounded-full border font-mono transition-colors hover:text-cd-highlight" style="border-color: var(--cd-border);">' +
                escapeHtml(variant.label) + '</a>';
        }).join('');
        return '<div class="flex flex-wrap items-center gap-2 mt-3"><span class="font-mono text-xs text-cd-text-dim">VARIANTES:</span>' + links + '</div>';
    }

    function buildCard(demo) {
        var comingSoon = demo.status === 'coming-soon';
        var href = demoHref(demo);
        var attrs = linkAttributes(demo);
        var categoryTokens = [normalizeCategoryToken(demo.category)]
            .concat((demo.tags || []).map(normalizeCategoryToken))
            .filter(Boolean)
            .join(' ');

        var cta;
        if (comingSoon) {
            cta = '<span class="btn-secondary w-full justify-center mt-4 cursor-default opacity-60">PRÓXIMAMENTE <i data-lucide="clock" class="w-4 h-4"></i></span>';
        } else {
            cta = '<a href="' + escapeHtml(href) + '"' + attrs + ' class="btn-secondary w-full justify-center mt-4">' +
                'VER DEMO <i data-lucide="' + (isExternal(demo) ? 'external-link' : 'arrow-right') + '" class="w-4 h-4"></i></a>';
        }

        var titleLink = comingSoon
            ? '<span class="font-bold text-xl mb-2 block">' + escapeHtml(demo.title) + '</span>'
            : '<h3 class="font-bold text-xl mb-2"><a href="' + escapeHtml(href) + '"' + attrs + ' class="hover:text-cd-highlight transition-colors">' + escapeHtml(demo.title) + '</a></h3>';

        return '' +
            '<article class="reveal card-modern card-hover p-6 flex flex-col' + (comingSoon ? ' opacity-75' : '') + '" data-category="' + escapeHtml(categoryTokens) + '">' +
                buildPreview(demo) +
                '<span class="font-mono text-xs border-b-2 inline-block w-max mb-3 pb-1" style="border-color: var(--cd-highlight-color);">' + escapeHtml((demo.category || 'DEMO').toUpperCase()) + '</span>' +
                titleLink +
                '<p class="text-sm text-cd-text-muted mb-4 flex-grow">' + escapeHtml(demo.tagline || demo.description || '') + '</p>' +
                buildTagChips(demo) +
                '<p class="font-mono text-xs text-cd-text-dim">' + escapeHtml(formatDisplayDate(demo.date)) + '</p>' +
                cta +
                (comingSoon ? '' : buildVariantLinks(demo)) +
            '</article>';
    }

    function buildFilters(demos) {
        var counts = {};
        var labels = {};
        demos.forEach(function (demo) {
            var token = normalizeCategoryToken(demo.category);
            if (!token) return;
            counts[token] = (counts[token] || 0) + 1;
            if (!labels[token]) labels[token] = demo.category;
        });

        var categories = Object.keys(counts).sort(function (a, b) {
            return counts[b] - counts[a] || a.localeCompare(b);
        });

        var buttons = ['<button onclick="filterDemos(\'all\')" class="filter-btn badge badge-accent" data-filter="all">Todos</button>'];
        categories.forEach(function (token) {
            buttons.push('<button onclick="filterDemos(\'' + token.replace(/'/g, "\\'") + '\')" class="filter-btn badge" data-filter="' + token + '">' + escapeHtml(labels[token]) + '</button>');
        });
        return buttons.join('\n');
    }

    function render() {
        var grid = document.querySelector(GRID_SELECTOR);
        if (!grid) return;

        var demos = getListableDemos();
        var filtersContainer = document.querySelector(FILTERS_SELECTOR);
        var emptyContainer = document.querySelector(EMPTY_SELECTOR);

        if (demos.length === 0) {
            if (filtersContainer) filtersContainer.style.display = 'none';
            if (emptyContainer) emptyContainer.classList.remove('hidden');
            return;
        }

        if (filtersContainer) filtersContainer.innerHTML = buildFilters(demos);
        grid.innerHTML = demos.map(buildCard).join('\n');

        if (typeof window.setupClickableCards === 'function') {
            window.setupClickableCards([{ cardSelector: GRID_SELECTOR + ' > article', linkSelector: '.btn-secondary[href]' }]);
        }
    }

    function buildCompactCard(demo) {
        var href = demoHref(demo);
        var attrs = linkAttributes(demo);
        var icon = isExternal(demo) ? 'external-link' : 'arrow-right';

        var preview;
        if (demo.image) {
            preview = '<img src="' + escapeHtml(demo.image) + '" alt="Vista previa de la demo ' + escapeHtml(demo.title) + '" loading="lazy" width="800" height="450" class="w-full h-32 object-cover rounded-lg mb-4">';
        } else {
            preview = '<div class="h-32 rounded-lg mb-4 flex items-center justify-center" style="background: linear-gradient(135deg, var(--cd-surface), var(--cd-purple-dark)); border: 1px solid var(--cd-border);"><i data-lucide="' + categoryIcon(demo.category) + '" class="w-8 h-8" style="color: var(--cd-highlight-color);"></i></div>';
        }

        return '' +
            '<article class="card-modern card-hover p-6 flex flex-col">' +
                preview +
                '<span class="font-mono text-xs border-b-2 inline-block w-max mb-3 pb-1" style="border-color: var(--cd-highlight-color);">' + escapeHtml((demo.category || 'DEMO').toUpperCase()) + '</span>' +
                '<h3 class="font-bold text-lg mb-2"><a href="' + escapeHtml(href) + '"' + attrs + ' class="hover:text-cd-highlight transition-colors">' + escapeHtml(demo.title) + '</a></h3>' +
                '<p class="text-sm text-cd-text-muted mb-4 flex-grow">' + escapeHtml(demo.tagline || '') + '</p>' +
                '<a href="' + escapeHtml(href) + '"' + attrs + ' class="text-sm font-semibold hover:underline inline-flex items-center gap-1" style="color: var(--cd-highlight-color);">Ver demo <i data-lucide="' + icon + '" class="w-3.5 h-3.5"></i></a>' +
            '</article>';
    }

    /**
     * Renderiza las demos públicas más recientes (sección "Demos recientes" de la home).
     * Se usa fuera del catálogo: window.renderRecentDemos('#grid', 3).
     * Si no hay demos públicas, oculta el contenedor de la sección indicado en sectionSelector.
     */
    window.renderRecentDemos = function (gridSelector, limit, sectionSelector) {
        var grid = document.querySelector(gridSelector);
        if (!grid) return;

        var demos = getDemos()
            .filter(function (demo) { return demo && demo.visibility === 'public' && demo.status === 'active'; })
            .sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); })
            .slice(0, limit || 3);

        if (demos.length === 0) {
            var section = sectionSelector ? document.querySelector(sectionSelector) : null;
            if (section) section.style.display = 'none';
            return;
        }

        grid.innerHTML = demos.map(buildCompactCard).join('');

        if (typeof window.setupClickableCards === 'function') {
            window.setupClickableCards([{ cardSelector: gridSelector + ' > article', linkSelector: 'h3 a[href]' }]);
        }
        if (typeof window.refreshLucideIcons === 'function') {
            window.refreshLucideIcons();
        } else if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    };

    window.filterDemos = function (category) {
        var cards = document.querySelectorAll(GRID_SELECTOR + ' > article');
        var buttons = document.querySelectorAll('.filter-btn');
        buttons.forEach(function (btn) {
            btn.classList.remove('badge-accent');
            if (btn.dataset.filter === category) btn.classList.add('badge-accent');
        });
        cards.forEach(function (card) {
            var matches = category === 'all' || (' ' + card.dataset.category + ' ').indexOf(' ' + category + ' ') !== -1;
            card.style.display = matches ? '' : 'none';
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        render();
        if (typeof window.refreshLucideIcons === 'function') {
            window.refreshLucideIcons();
        } else if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    });
})();
