/**
 * Demo Chrome — comportamiento compartido de todas las demos internas.
 * Infraestructura reutilizable: no contiene lógica específica de ninguna demo.
 *
 * - Rellena los elementos [data-demo-title] desde <meta name="demo-title">.
 * - Activa el toggle de tema (las demos no cargan layout-loader.js).
 * - Refresca los íconos de Lucide si el script diferido ya está disponible.
 */
(function () {
    'use strict';

    function fillDemoTitles() {
        var meta = document.querySelector('meta[name="demo-title"]');
        var title = meta ? meta.getAttribute('content') : document.title;
        document.querySelectorAll('[data-demo-title]').forEach(function (element) {
            element.textContent = title || '';
        });
    }

    function initTheme() {
        if (typeof window.initThemeToggle === 'function') {
            window.initThemeToggle();
        }
    }

    function initIcons() {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    }

    fillDemoTitles();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            initTheme();
            initIcons();
        });
    } else {
        initTheme();
        initIcons();
    }

    window.addEventListener('load', initIcons);
})();
