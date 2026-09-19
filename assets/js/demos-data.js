/**
 * MANIFIESTO DE DEMOS — Cambio Digital
 * -----------------------------------------------------------------------------
 * Registro único de todas las demos comerciales del sitio.
 * El catálogo /demos renderiza desde aquí; NO existen tarjetas hardcodeadas.
 *
 * Cómo registrar una demo (forma recomendada):
 *   npm run demo:new -- --title "Mi Demo" --category ERP [--visibility public]
 *
 * Schema de cada entrada:
 *   id          string  único, kebab-case. Para demos internas debe coincidir
 *                       con el directorio demos/{id}/.
 *   title       string  título comercial.
 *   tagline     string  una línea para la tarjeta del catálogo.
 *   description string  (opcional) descripción extendida.
 *   category    string  categoría principal (define los filtros del catálogo).
 *   tags        string[] chips informativos.
 *   date        string  YYYY-MM-DD de publicación/actualización.
 *   status      'active' | 'coming-soon' | 'draft' | 'archived'
 *                       El catálogo lista 'active' completa y 'coming-soon'
 *                       como tarjeta fantasma (solo si además es pública).
 *   visibility  'public' | 'unlisted' | 'private'
 *                       public   → aparece en /demos y puede indexarse.
 *                       unlisted → solo con enlace directo (noindex, sin
 *                                  catálogo ni sitemap). Default de demo:new.
 *                       private  → reservado para acceso futuro con autenticación;
 *                                  hoy se comporta como unlisted.
 *   type        'internal' | 'external'
 *                       internal → vive en demos/{id}/index.html.
 *                       external → aplicación desplegada fuera de este sitio.
 *   url         string  '/demos/{id}' (interna, sin extensión) o URL absoluta
 *                       (externa). El CTA del catálogo usa esta URL.
 *   image       string  (opcional) ruta local u URL de la imagen preview.
 *                       Si se omite, el catálogo genera un placeholder con el
 *                       ícono de la categoría.
 *   client      string|null  solo para demos personalizadas de un cliente
 *                            (contexto interno, nunca se muestra en público).
 *   variants    Array<{label, url}>  (opcional) variantes comercializables de
 *                            la misma demo (ej. plan básico / pro). Se muestran
 *                            como enlaces secundarios en la tarjeta.
 *
 * Reglas de oro:
 *   - Nunca registrar datos privados de clientes en demos públicas.
 *   - Demo nueva sin aprobar => visibility 'unlisted'.
 *   - Tras editar este archivo ejecutar `npm run demo:validate`.
 */
(function () {
    'use strict';

    window.CD_DEMOS = [
        {
            id: 'erp-dashboard',
            title: 'Panel de Control ERP',
            tagline: 'Ventas, inventario y clientes de tu negocio en una sola pantalla, en tiempo real.',
            description: 'Demo interactiva de un panel ERP para pymes: indicadores, pedidos, inventario y clientes con datos ficticios.',
            category: 'ERP',
            tags: ['ERP', 'Dashboard', 'Inventario'],
            date: '2026-09-18',
            status: 'active',
            visibility: 'public',
            type: 'internal',
            url: '/demos/erp-dashboard',
            image: '/assets/images/demos/erp-dashboard.png',
            client: null,
            variants: []
        },
        {
            id: 'marcela-cuenca',
            title: 'Web Marcela Cuenca',
            tagline: 'Propuesta A/B de la nueva web de Marcela Cuenca: autoridad local y conversión moderna.',
            description: 'Demo personalizada para Marcela Cuenca, abogada de Extranjería y Familia. Variante A (autoridad local) y B (conversión moderna) con datos de contacto reales y simulaciones marcadas como demo.',
            category: 'Web corporativa',
            tags: ['Web', 'Abogados', 'Propuesta A/B'],
            date: '2026-09-18',
            status: 'active',
            visibility: 'unlisted',
            type: 'internal',
            url: '/demos/marcela-cuenca',
            image: null,
            client: 'Marcela Cuenca',
            variants: [
                { label: 'Propuesta A — Autoridad local', url: '/demos/marcela-cuenca?variant=a' },
                { label: 'Propuesta B — Conversión moderna', url: '/demos/marcela-cuenca?variant=b' }
            ]
        },
        {
            id: 'asesoria-migratoria',
            title: 'Asesoría Migratoria',
            tagline: 'Web interactiva para despachos y asesores migratorios: orientación inicial, captación de consultas y reserva de citas.',
            description: 'Demo genérica de una web de asesoría migratoria y extranjería: orientador interactivo de situaciones (¿Cómo podemos orientarte?), agenda de primera consulta simulada, resumen del caso vía WhatsApp y panel de resultados para el despacho. Marca ficticia: Horizonte Migratorio. Datos 100% ficticios.',
            category: 'Web / Automatización',
            tags: ['Web', 'UX', 'Orientación interactiva', 'Captación', 'Agenda', 'WhatsApp'],
            date: '2026-09-18',
            status: 'active',
            visibility: 'public',
            type: 'internal',
            url: '/demos/asesoria-migratoria',
            image: '/assets/images/demos/asesoria-migratoria.png',
            client: null,
            variants: []
        },
        {
            id: 'consultoria-migratoria',
            title: 'Consultoría Migratoria',
            tagline: 'Landing premium de consultoría migratoria en España: orientador interactivo, agenda simulada, dashboard de rendimiento y captación multicanal. Marca ficticia: Vía Migratoria.',
            description: 'Demo genérica y reutilizable de una web premium de consultoría migratoria en España: topbar de contacto, hero con formulario rápido, servicios, situaciones reales con fotografía, orientador interactivo de varias preguntas, agenda online simulada, testimonios, reseñas, dashboard de analítica para el despacho, guías tipo landing, newsletter, agente IA, FAQ y contacto. Marca ficticia: Vía Migratoria. Datos 100% ficticios.',
            category: 'Web / Automatización',
            tags: ['Web', 'Conversión', 'Orientador', 'Agenda', 'Dashboard', 'WhatsApp', 'Newsletter'],
            date: '2026-09-19',
            status: 'active',
            visibility: 'public',
            type: 'internal',
            url: '/demos/consultoria-migratoria',
            image: '/assets/images/demos/consultoria-migratoria.png',
            client: null,
            variants: []
        },
        // CD_DEMOS_INSERT_ANCHOR — demo:new inserta las nuevas demos justo encima de esta línea
    ];
})();
