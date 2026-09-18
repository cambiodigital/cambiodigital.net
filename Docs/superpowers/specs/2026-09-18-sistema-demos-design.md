# Diseño — Sistema de Demos Comerciales de Cambio Digital

**Fecha:** 2026-09-18
**Estado:** Aprobado (el brief del cliente actúa como especificación de requisitos)
**Alcance:** Infraestructura reutilizable de demos + catálogo público `/demos` + plantilla + tooling + una demo semilla pública.

## 1. Objetivo

Crear una plataforma progresiva de demos comerciales dentro de cambiodigital.net para:
1. Enseñar a prospectos cómo podría verse o funcionar su solución.
2. Acelerar el cierre comercial.
3. Convertir cada demo en un activo reutilizable para vender soluciones similares.

## 2. Decisiones clave (y por qué)

| # | Decisión | Justificación |
|---|----------|---------------|
| D1 | Manifiesto de demos en **`assets/js/demos-data.js`** (`window.CD_DEMOS`), no JSON | `.htaccess` devuelve 403 para `.json`/`.md` en producción (línea 24). Un `.js` con array literal es servible, cacheable y editable a mano. Además entra en los globs de Tailwind (`assets/js/**/*.js`). |
| D2 | Catálogo **`demos/index.html`** renderizado client-side desde el manifiesto por **`assets/js/demos-catalog.js`** | Registrar una demo = 1 entrada en el manifiesto. Evita el triple trabajo manual del blog (archivo + tarjeta + sitemap). El catálogo no es página de contenido SEO-crítico; el `<head>` sigue siendo estático e indexable. |
| D3 | Demos internas viven en **`demos/{slug}/index.html`**, generadas desde **`Docs/PLANTILLA_DEMO_UNICA.html`** | Replica el patrón probado del blog (`npm run blog:new` + `PLANTILLA_BLOG_UNICA.html`). Routing automático vía `.htaccess` (reglas de directorio con index.html, ya usadas por `/pago`). |
| D4 | Los archivos generados **conservan los marcadores** `<!-- DEMO_SHARED_*_START/END -->` | A diferencia del blog (que los elimina y re-normaliza por regex), conservarlos hace que `demo:sync-template` sea un reemplazo directo de bloques: más simple y robusto. |
| D5 | Las demos internas **no cargan header/footer de marketing** | Una demo debe dar "sensación de producto terminado". Tienen chrome propio: barra superior con "← Demos", badge DEMO, toggle de tema y CTA comercial. Usan los mismos tokens CSS (theme.css) para consistencia de marca. |
| D6 | Visibilidad por defecto **`unlisted`** al crear demos | Privacidad por defecto: las demos personalizadas de clientes no aparecen en catálogo ni sitemap y nacen con `noindex,nofollow`. Convertir a público es un cambio explícito de 1 campo + sitemap. |
| D7 | Soporte de **demos externas** (`type: 'external'`) sin archivos locales | Para demos desplegadas fuera del sitio (Dokploy, Vercel del cliente, etc.): solo entrada en manifiesto con URL absoluta. |
| D8 | **Variantes** como array opcional de enlaces `{label, url}` por demo | Cubre "múltiples variantes cuando corresponda" (ej. plan básico/pro) sin inventar un nuevo tipo de página. El catálogo muestra la variante principal como CTA y las demás como enlaces secundarios. |
| D9 | Tooling npm: **`demo:new`**, **`demo:sync-template`**, **`demo:validate`** | Espejo de la familia `blog:*`. `demo:validate` (nuevo) verifica integridad del manifiesto: ids únicos, enums válidos, archivos existentes para internas, sin `unlisted` en sitemap. |
| D10 | Demo semilla: **`erp-dashboard`** (pública, genérica, interactiva) | Alineada con el servicio ERP Open Source. Datos 100% ficticios y marcados como demo. Demuestra el sistema extremo a extremo. |

## 3. Arquitectura

```
Docs/
  PLANTILLA_DEMO_UNICA.html        ← fuente de verdad del shell de demos internas
  SISTEMA_DEMOS.md                 ← guía operativa (cómo registrar/convertir demos)
demos/
  index.html                       ← catálogo público (/demos)
  {slug}/
    index.html                     ← demo interna (generada con demo:new)
assets/js/
  demos-data.js                    ← manifiesto window.CD_DEMOS (registro único)
  demos-catalog.js                 ← render + filtros del catálogo (infra reutilizable)
  demo-chrome.js                   ← chrome compartido de demos internas (título, tema)
scripts/
  demo-template-utils.js           ← utilidades (leer plantilla, tokens, registro en manifiesto)
  demo-new.js                      ← npm run demo:new
  demo-sync-template.js            ← npm run demo:sync-template
  demo-validate.js                 ← npm run demo:validate
```

**Separación infraestructura vs. específico:**
- Infra reutilizable: catálogo, manifiesto, renderizador, plantilla, scripts, `demo-chrome.js`.
- Específico de cada demo: todo lo que hay bajo `demos/{slug}/` y su entrada en el manifiesto.

## 4. Schema del manifiesto (`window.CD_DEMOS`)

```js
{
  id: 'erp-dashboard',          // único, kebab-case
  title: 'Panel de Control ERP',
  tagline: '...',               // 1 línea para la tarjeta
  description: '...',           // opcional, más largo
  category: 'ERP',              // categoría principal (filtros del catálogo)
  tags: ['ERP', 'Dashboard'],   // chips
  date: '2026-09-18',           // YYYY-MM-DD
  status: 'active',             // 'active' | 'coming-soon' | 'draft' | 'archived'
  visibility: 'public',         // 'public' | 'unlisted' | 'private'
  type: 'internal',             // 'internal' | 'external'
  url: '/demos/erp-dashboard',  // ruta interna (sin extensión) o URL absoluta
  image: '/assets/images/demos/erp-dashboard.png', // opcional (fallback: placeholder)
  client: null,                 // string solo si es personalizada (contexto interno)
  variants: []                  // opcional: [{ label, url }]
}
```

Reglas del catálogo:
- Se listan: `visibility === 'public' && status === 'active'` (tarjeta completa, clicable).
- `coming-soon` pública: tarjeta fantasma con badge "PRÓXIMAMENTE", sin enlace.
- `unlisted` / `private` / `draft` / `archived`: nunca se listan.
- Orden: fecha descendente.

Reglas SEO:
- Solo demos `public` + `active` van a `sitemap.xml`.
- La plantilla genera `noindex,nofollow` salvo que la demo sea `public`.

## 5. Páginas

### 5.1 Catálogo `/demos`
Anatomía estándar del sitio (guía de estilos): head completo con OG/Twitter/canonical `https://cambiodigital.net/demos`, body con cursor/grid/`#header-container`/`#footer-container`, hero estilo casos.html (badge + h1 + subtítulo), filtros por categoría (dinámicos desde el manifiesto, patrón `filterCases`), grid `md:grid-cols-2 lg:grid-cols-3` de tarjetas, estado vacío, `<noscript>`, CTA final. Scripts al pie en orden: `demos-data.js`, `demos-catalog.js`, `clickable-cards.js`, `animations.js`, `layout-loader.js`.

Tarjeta: preview (imagen o placeholder generado con las iniciales/categoría), eyebrow `font-mono` con categoría, título, tagline, chips de tags, fecha `font-mono`, CTA "VER DEMO" (`btn-secondary` full-width, patrón blog) con icono `external-link` si es externa, variantes como enlaces secundarios. Tarjeta completa clicable vía `setupClickableCards`.

### 5.2 Demo interna `/demos/{slug}`
- Sin `#header-container` ni `layout-loader.js`. Sin cursor decorativo.
- Barra superior fija (glass): "← Demos" (`/demos`), título (inyectado desde `<meta name="demo-title">`), badge "DEMO" (`badge-accent`), toggle de tema, CTA "Quiero algo así" (`btn-primary` → `/#contacto`).
- Contenido libre de la demo entre marcadores `<!-- DEMO_CONTENT_START/END -->`.
- Franja inferior: aviso "Demo con datos ficticios — así podría verse tu solución" + enlaces a servicio relacionado y contacto.
- Scripts compartidos al pie: `demo-chrome.js` (llama a `initThemeToggle()`, llena títulos, no-op si falta algo).

### 5.3 Plantilla `Docs/PLANTILLA_DEMO_UNICA.html`
Marcadores conservados en los archivos generados: `DEMO_SHARED_ICONS`, `DEMO_SHARED_HEAD`, `DEMO_SHARED_CHROME_TOP`, `DEMO_SHARED_CHROME_BOTTOM`, `DEMO_SHARED_FOOTER_SCRIPTS`, más `DEMO_CONTENT`. Tokens estilo blog: `TITULO_DEMO`, `SLUG_DEMO`, `DESCRIPCION_DEMO`, `YYYY-MM-DD`, `META_ROBOTS`, `Categoria`, `URL_DEMO`.

## 6. Tooling

- `npm run demo:new -- --title "..." --slug x --category ERP --description "..." [--tags "a,b"] [--visibility public|unlisted] [--status active|draft] [--type internal|external] [--url https://...] [--client "..."] [--image path] [--force]`
  - `internal`: crea `demos/{slug}/index.html` desde la plantilla con tokens reemplazados.
  - `external`: exige `--url`; no crea archivos.
  - Registra la entrada en `assets/js/demos-data.js` (rechaza ids duplicados sin `--force`).
  - Imprime pasos siguientes (build:css, sitemap si pública, content a rellenar).
- `npm run demo:sync-template`: reemplaza el contenido de cada bloque `DEMO_SHARED_*` en todas las `demos/**/index.html` desde la plantilla.
- `npm run demo:validate`: valida manifiesto (schema, enums, ids únicos, URLs internas empiezan por `/demos/`, existencia de archivos internos e imágenes locales, fecha válida) y que el sitemap no referencie demos no públicas.

## 7. Integraciones

- `tailwind.config.js`: añadir `'./demos/**/*.html'` a `content` + `npm run build:css`.
- `partials/header.html`: enlace `/DEMOS` (desktop y móvil) tras `/CASOS`.
- `partials/footer.html`: "Demos" en columna Navegación.
- `sitemap.xml`: `/demos` (0.7) + demos públicas activas (0.6). Extensionless.
- `AGENTS.md`: sección "Flujo de Demos" (espejo de la del blog).
- `Docs/SISTEMA_DEMOS.md`: guía completa.

## 8. Seguridad y privacidad

- Default `unlisted` + `noindex` para demos nuevas.
- Nunca datos reales de clientes en demos públicas; placeholders explícitos cuando falte información.
- `demo:validate` falla si una demo interna no existe o si hay ids duplicados.

## 9. Verificación (definición de hecho)

1. `npm run build:css` OK y el CSS generado incluye clases de `demos/`.
2. `npm run demo:validate` OK.
3. Servido local desde raíz: `/demos` lista la demo semilla, filtros funcionan, `/demos/erp-dashboard` interactiva (tabs, filtros de pedidos, modal de pedido simulado).
4. Consola sin errores en `/`, `/demos`, demo semilla (desktop y móvil 375px) vía Playwright/Edge.
5. Header/footer/partial intactos en páginas existentes (spot-check `/` y `/casos.html`).
6. Demo `unlisted` de prueba no aparece en catálogo y tiene `noindex` (validado con demo:new en seco y luego reversión).

## 10. Fuera de alcance (V1)

- Autenticación para `private` (el valor ya está reservado en el schema).
- Viewer con iframe para demos externas (X-Frame-Options impredecible).
- Analytics específico de demos (no hay GA activo en el sitio).
- Backend/persistencia real: todo se simula, como exige la naturaleza de demo.
