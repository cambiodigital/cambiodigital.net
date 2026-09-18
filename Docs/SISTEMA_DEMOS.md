# SISTEMA DE DEMOS — Guía operativa

Plataforma reutilizable de demos comerciales de Cambio Digital. Cada demo sirve para enseñar a un prospecto cómo podría verse su solución, acelerar el cierre y convertirse en activo reutilizable.

## Mapa del sistema

| Pieza | Rol |
|---|---|
| `demos/index.html` | Catálogo público en `/demos`. Renderiza desde el manifiesto; no hay tarjetas hardcodeadas. |
| `assets/js/demos-data.js` | **Manifiesto único** (`window.CD_DEMOS`). Registro de todas las demos con visibilidad, estado, categoría, etc. |
| `assets/js/demos-catalog.js` | Renderizador del catálogo (filtros + tarjetas). Infraestructura, no tocar por demo. |
| `Docs/PLANTILLA_DEMO_UNICA.html` | Fuente de verdad del shell de las demos internas (marcadores `DEMO_SHARED_*`). |
| `assets/js/demo-chrome.js` | Chrome compartido de las demos internas (título, tema, íconos). |
| `demos/{slug}/index.html` | Una demo interna concreta. Solo el bloque `DEMO_CONTENT` es específico. |
| `scripts/demo-*.js` | Tooling npm (`demo:new`, `demo:sync-template`, `demo:validate`). |

## Crear una demo nueva

```bash
# Interna (vive en demos/{slug}/) — visibilidad por defecto: unlisted
npm run demo:new -- --title "Panel ERP" --category "ERP" --tagline "..." --tags "ERP, Dashboard"

# Externa (app ya desplegada en otro dominio)
npm run demo:new -- --title "Chatbot ATC" --category "Chatbot" --type external --url "https://app.ejemplo.com"
```

> **Git Bash en Windows:** antepone `MSYS_NO_PATHCONV=1` para que no convierta rutas como `--image /assets/...`:
> `MSYS_NO_PATHCONV=1 npm run demo:new -- ... "/assets/images/demos/x.png"`

Opciones: `--slug`, `--description`, `--date`, `--visibility public|unlisted|private`, `--status active|coming-soon|draft|archived`, `--image`, `--client "Nombre"` (solo contexto interno), `--force`.

Después de crear:
1. Reemplazar el bloque `DEMO_CONTENT` en `demos/{slug}/index.html` con la experiencia interactiva.
2. `npm run build:css` (las clases nuevas de `demos/` se compilan por el globo de Tailwind).
3. `npm run demo:validate`.
4. Si quedó `public` + `active`: añadirla a `sitemap.xml`.

## Reglas de visibilidad

| Visibilidad | Catálogo | Sitemap | robots | Uso |
|---|---|---|---|---|
| `public` | Sí (tarjeta clicable) | Sí | `index, follow` | Demos genéricas reutilizables. |
| `unlisted` (default) | No | No | `noindex, nofollow` | Demos personalizadas de clientes; se comparten por enlace directo. |
| `private` | No | No | `noindex, nofollow` | Reservado para acceso autenticado futuro; hoy se comporta como unlisted. |

`status`: `active` (lista completa) · `coming-soon` (tarjeta fantasma si es pública) · `draft`/`archived` (ocultas).

**Convertir un demo de cliente en demo pública reutilizable:** despersonalizar el contenido (sin datos privados), cambiar `visibility: 'unlisted'` → `'public'` en el manifiesto, regenerar/corregir el meta robots del HTML (`index, follow`), añadirla a `sitemap.xml` y correr `npm run demo:validate`.

## Variantes

En el manifiesto, añade al entry:
```js
variants: [
    { label: 'Plan Básico', url: '/demos/mi-demo?variant=basico' },
    { label: 'Plan Pro', url: 'https://otra-app.cambiodigital.cloud' }
]
```
El catálogo muestra la variante principal como CTA y las demás como enlaces secundarios.

## Cambiar el diseño compartido de las demos

Como en el blog: editar `Docs/PLANTILLA_DEMO_UNICA.html` y ejecutar `npm run demo:sync-template`. El script reemplaza el contenido de cada bloque `DEMO_SHARED_*` en todas las `demos/**/index.html`. El bloque `DEMO_CONTENT` y los scripts específicos (fuera de los marcadores) nunca se tocan.

## Reglas de contenido

- Datos 100% ficticios, marcados como demo. Nunca información privada de clientes.
- No inventar dirección, teléfono, testimonios, resultados ni precios reales de clientes; usar placeholders explícitos.
- Una demo NO es el producto final: se simula persistencia, envíos, pagos, etc. Nunca engañar sobre funcionalidades contratadas.
- CTA estándar del chrome: "Quiero algo así" → `/#contacto`.

## Validación

`npm run demo:validate` verifica: schema completo, enums, ids únicos, kebab-case, existencia de archivos internos e imágenes locales, coherencia del meta robots con la visibilidad y que el sitemap solo incluya demos públicas activas.

## Especificación de diseño

Ver `Docs/superpowers/specs/2026-09-18-sistema-demos-design.md` para las decisiones de arquitectura (por qué el manifiesto es `.js`, rutas sin extensión, separación infra/específico, etc.).
