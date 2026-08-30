# GUÍA DE ESTILOS - PÁGINAS CAMBIO DIGITAL

## Objetivo
Este documento establece los estándares de diseño y código para mantener consistencia visual y funcional en todas las páginas del sitio web de Cambio Digital.

---

## 1. ESTRUCTURA HTML BASE

### `<head>` Obligatorio
```html
<!DOCTYPE html>
<html lang="es" class="scroll-smooth overflow-x-hidden">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Título] | Cambio Digital</title>
    <meta name="description" content="[Descripción de 150-160 caracteres]">
    <meta name="keywords" content="[palabras clave separadas por comas]">
    <meta name="author" content="Cambio Digital">
    <meta name="robots" content="index, follow"> <!-- Usar "noindex, nofollow" para páginas privadas -->
    <meta name="theme-color" content="#1c2143">
    <link rel="manifest" href="/manifest.json">
    <link rel="canonical" href="https://cambiodigital.net/[ruta]">
    <link rel="icon" type="image/png" href="/assets/favicon.png">
    <link rel="icon" type="image/png" media="(prefers-color-scheme: light)" href="/assets/images/LogoCDFondoClaro.png">
    <link rel="icon" type="image/png" media="(prefers-color-scheme: dark)" href="/assets/images/LogoCDFondoOscuro.png">

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://cambiodigital.net/[ruta]">
    <meta property="og:title" content="[Título completo]">
    <meta property="og:description" content="[Descripción]">
    <meta property="og:image" content="https://cambiodigital.net/assets/images/LogoCDFondoClaro.png">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://cambiodigital.net/[ruta]">
    <meta property="twitter:title" content="[Título]">
    <meta property="twitter:description" content="[Descripción]">
    <meta property="twitter:image" content="https://cambiodigital.net/assets/images/LogoCDFondoClaro.png">
    
    <!-- CSS - SIEMPRE EN ESTE ORDEN -->
    <link rel="stylesheet" href="/assets/css/tailwind.generated.css">
    <link rel="stylesheet" href="/assets/css/theme.css">

    <!-- Google Fonts - OBLIGATORIAS -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
    
    <!-- Lucide Icons - OBLIGATORIO -->
    <script src="/assets/js/lucide.min.js"></script>
</head>
```

---

## 2. ESTRUCTURA `<body>` ESTÁNDAR

### Clases Obligatorias del Body
```html
<body class="font-sans antialiased overflow-x-hidden bg-cd-base text-cd-cream selection:bg-cd-magenta selection:text-white">
```

**Explicación:**
- `font-sans` - Usa familia Inter para texto general
- `antialiased` - Mejora renderizado de fuentes
- `overflow-x-hidden` - Previene scroll horizontal
- `bg-cd-base` - **FONDO OSCURO** (azul oscuro #1c2143)
- `text-cd-cream` - **TEXTO CLARO** (crema #f8f8f0)
- `selection:bg-cd-magenta` - Color de selección de texto

### Elementos Obligatorios del Body (en orden)
```html
<body class="font-sans antialiased overflow-x-hidden bg-cd-base text-cd-cream selection:bg-cd-magenta selection:text-white">
    <!-- 1. Cursor Personalizado -->
    <div id="cursor-outline"></div>
    <div id="cursor-dot"></div>

    <!-- 2. Grid de Fondo -->
    <div class="fixed inset-0 z-0 bg-grid"></div>

    <!-- 3. Header (Partial) -->
    <div id="header-container"></div>

    <!-- 4. Contenido Principal -->
    <main class="relative z-10 pt-24 pb-16 min-h-screen">
        <!-- Tu contenido aquí -->
    </main>

    <!-- 5. Footer (Partial) -->
    <div id="footer-container"></div>

    <!-- 6. Scripts (ver sección 4) -->
    <script src="/assets/js/layout-loader.js"></script>
    <script>
        // Custom Scripts para esta página específica
        // NOTA: Header, Footer y Menú Móvil se manejan en layout-loader.js
    </script>
</body>
```

---

## 3. PALETA DE COLORES Y CLASES

### Colores Principales (Variables CSS en `/assets/css/theme.css`)
Las variables se adaptan automáticamente según el atributo `data-theme` ("light" o "dark").

**Modo Oscuro (Default):**
```css
--cd-base: #0f172a;           /* Fondo principal */
--cd-cream: #f1f5f9;          /* Texto principal */
--cd-surface: #1e293b;        /* Fondo de tarjetas/paneles */
--hero-overlay-start: rgba(15, 23, 42, 0.6); /* Overlay oscuro para video */
```

**Modo Claro:**
```css
--cd-base: #f8fafc;           /* Fondo claro */
--cd-cream: #0f172a;          /* Texto oscuro */
--cd-surface: #ffffff;        /* Fondo blanco */
--hero-overlay-start: rgba(248, 250, 252, 0.85); /* Overlay claro para video */
```

### Jerarquía de Fondos
1. **Fondo de página:** `bg-cd-base` (adaptable)
2. **Tarjetas:** `card-modern` (adaptable: oscuro en dark mode, blanco en light mode)
3. **Hero:** `bg-cd-base-dark` con overlay adaptable.

### ⚠️ REGLA CRÍTICA: CONTRASTE Y ACCESIBILIDAD
- **Texto:** Usar siempre clases semánticas (`text-cd-cream`, `text-cd-text-muted`) en lugar de colores fijos (blanco/negro) para asegurar legibilidad en ambos modos.
- **Excepción:** En secciones con fondo oscuro fijo (como el Hero con video), usar `text-white` o asegurar que el overlay aclare el fondo lo suficiente en modo claro si el texto se oscurece.
- **Ratio:** Mantener un contraste mínimo de **4.5:1 (WCAG AA)** para texto normal.

---

## 3.1. MODO CLARO/OSCURO (DARK/LIGHT MODE)

### Implementación
El cambio de tema se maneja vía `assets/js/theme-toggle.js` y variables CSS.
- **Botón:** Incluir `.theme-toggle` en el header.
- **Logo:** El logo se adapta automáticamente:
  - Modo Oscuro: Logo blanco (sin filtro).
  - Modo Claro: Logo negro (filtro `brightness(0)`).
  - **CSS:** `header img { filter: var(--logo-filter); }`

### Transiciones
Todos los elementos tienen `transition: background-color 0.3s, color 0.3s` para suavizar el cambio de tema.

---

## 4. COMPONENTES MODERNOS (Theme v2)

### Tarjeta Moderna (`card-modern`)
Reemplaza a la tarjeta brutalist antigua.
```html
<div class="card-modern p-8">
    <h2 class="font-bold text-xl mb-4">Título</h2>
    <p class="text-cd-text-muted">Contenido...</p>
</div>
```

### Botón Primario (`btn-primary`)
Adaptable y con hover effects.
```html
<button class="btn-primary">
    Texto del Botón <i data-lucide="arrow-right"></i>
</button>
```

### Banner Hero con Video
Debe incluir fallback para errores de carga y overlay adaptable.
```html
<div class="relative ... bg-cd-base-dark">
    <!-- Fallback Image (Oculto por defecto) -->
    <div id="hero-fallback" class="hidden ..." style="background-image: url(...)"></div>
    
    <!-- Video con manejo de error -->
    <video onerror="this.style.display='none'; document.getElementById('hero-fallback').classList.remove('hidden');" ...>
        ...
    </video>
    
    <!-- Overlay Adaptable -->
    <div class="hero-overlay"></div>
</div>
```

---

### Botón de Enlace
```html
<a href="#" class="btn-press bg-cd-lavender text-white font-bold py-3 px-6 border-hard shadow-hard hover:bg-cd-magenta inline-flex items-center gap-2">
    <i data-lucide="arrow-right" class="w-5 h-5"></i>
    Ver Más
</a>
```

### Input de Formulario
```html
<input 
    type="text" 
    class="w-full px-4 py-3 border-hard focus:outline-none focus:ring-2 focus:ring-cd-lavender font-mono"
    placeholder="Escribe aquí..."
>
```

### Sección de Contenido
```html
<section class="container mx-auto px-4 mb-16">
    <div class="max-w-4xl mx-auto">
        <!-- Contenido centrado con ancho máximo -->
    </div>
</section>
```

---

## 5. SCRIPTS OBLIGATORIOS

### JavaScript Base (antes de `</body>`)
```html
<!-- Scripts -->
<script src="/assets/js/config.js"></script>
<script>
    // Custom Cursor - OBLIGATORIO
    const cursorDot = document.getElementById('cursor-dot');
    const cursorOutline = document.getElementById('cursor-outline');
    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    function animateCursor() {
        outlineX += (mouseX - outlineX) * 0.15;
        outlineY += (mouseY - outlineY) * 0.15;
        cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px)`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
</script>

<!-- CARGADOR DE LAYOUT (OBLIGATORIO) -->
<!-- Se encarga de cargar Header, Footer y lógica del menú móvil -->
<script src="/assets/js/layout-loader.js"></script>
```

---

## 6. TIPOGRAFÍA

### Fuentes
- **Títulos:** `font-black` (Inter Black 900)
- **Subtítulos:** `font-bold` (Inter Bold 700)
- **Cuerpo:** `font-sans` (Inter Regular 400)
- **Mono/Code:** `font-mono` (Space Mono 400/700)

### Tamaños de Texto
```html
<h1 class="font-black text-4xl md:text-5xl uppercase">Título Principal</h1>
<h2 class="font-black text-3xl uppercase">Subtítulo</h2>
<h3 class="font-bold text-xl uppercase">Sección</h3>
<p class="text-base">Cuerpo de texto normal</p>
<p class="text-sm text-gray-600">Texto secundario</p>
<p class="text-xs">Nota al pie</p>
```

---

## 7. ESPACIADO Y LAYOUT

### Contenedores
```html
<!-- Página completa -->
<main class="relative z-10 pt-24 pb-16 min-h-screen">
    <!-- Sección -->
    <section class="container mx-auto px-4 mb-16">
        <!-- Contenido centrado -->
        <div class="max-w-4xl mx-auto">
            <!-- Tu contenido -->
        </div>
    </section>
</main>
```

### Espaciado Vertical
- Entre secciones: `mb-16` (4rem)
- Entre tarjetas: `mb-8` (2rem)
- Entre párrafos: `mb-4` (1rem)
- Padding de tarjetas: `p-8` (2rem) o `p-6` (1.5rem)

---

## 8. ICONOS (LUCIDE)

### Uso Correcto
```html
<!-- Icono inline -->
<i data-lucide="check" class="w-5 h-5 text-cd-lavender"></i>

<!-- Icono en botón -->
<button class="flex items-center gap-2">
    <i data-lucide="send" class="w-5 h-5"></i>
    <span>Enviar</span>
</button>

<!-- IMPORTANTE: Llamar lucide.createIcons() después de cargar contenido dinámico -->
<script>
    lucide.createIcons();
</script>
```

---

## 9. RESPONSIVE DESIGN

### Breakpoints (Tailwind)
- `sm`: 640px (móvil grande)
- `md`: 768px (tablet)
- `lg`: 1024px (desktop)
- `xl`: 1280px (desktop grande)

### Grid Responsive
```html
<!-- 1 columna en móvil, 2 en desktop -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>Columna 1</div>
    <div>Columna 2</div>
</div>
```

### Texto Responsive
```html
<h1 class="text-4xl md:text-5xl">Título adaptable</h1>
<p class="text-sm md:text-base">Párrafo adaptable</p>
```

---

## 10. CHECKLIST PARA NUEVA PÁGINA

- [ ] `<head>` completo con metas, OG, y Twitter Cards
- [ ] CSS en orden: tailwind.generated.css → theme.css
- [ ] Google Fonts cargadas (Inter + Space Mono)
- [ ] Lucide Icons script incluido
- [ ] Body con clases: `bg-cd-base text-cd-cream`
- [ ] Cursor personalizado (`#cursor-dot` + `#cursor-outline`)
- [ ] Grid de fondo (`bg-grid`)
- [ ] Header container (`#header-container`)
- [ ] Main con `relative z-10 pt-24 pb-16`
- [ ] Footer container (`#footer-container`)
- [ ] JavaScript del cursor incluido
- [ ] Fetch de header/footer incluido
- [ ] `lucide.createIcons()` al final del DOMContentLoaded
- [ ] Uso de componentes `card-modern` y `btn-primary` (Theme v2)
- [ ] **Verificar modo claro/oscuro:** Contrastes correctos en ambos temas.
- [ ] **Banner:** Fallback de imagen configurado correctamente.
- [ ] **Logo:** Filtro automático funcionando en header.

---

## 11. TESTING VISUAL

Para validar los cambios de estilo y contraste:
1. Abrir `/test-visual.html` en el navegador.
2. Usar el botón de toggle en la esquina superior derecha.
3. Verificar:
   - Legibilidad de textos en tarjetas (Surface vs Text).
   - Contraste del Banner Hero (Video/Imagen vs Texto).
   - Visibilidad del Logo (Blanco en Dark, Negro en Light).
   - Transiciones suaves de color.

---

## 12. ANTIPATRONES (EVITAR)

❌ **NO HACER:**
```html
<!-- 1. Elementos oscuros sobre fondo oscuro -->
<body class="bg-cd-base">
    <div class="bg-cd-base text-white">Invisible</div>
</body>

<!-- 2. Olvidar cargar Lucide Icons -->
<i data-lucide="check"></i>
<!-- Sin lucide.createIcons() = no se renderiza -->

<!-- 3. CSS en orden incorrecto -->
<link rel="stylesheet" href="/assets/css/theme.css">
<link rel="stylesheet" href="/assets/css/tailwind.generated.css">
<!-- Theme debe ir DESPUÉS de Tailwind -->

<!-- 4. Olvidar cursor personalizado -->
<body class="bg-cd-base">
    <!-- Falta #cursor-dot y #cursor-outline -->
</body>

<!-- 5. Main sin z-index relativo -->
<main class="pt-24">
    <!-- Falta relative z-10 para estar sobre bg-grid -->
</main>
```

---

## 12. PLANTILLA COMPLETA DE PÁGINA

Ver archivos de referencia:
- `/servicios/success/it-partner-estandar.html`
- `/servicios/success/it-partner-evolucion.html`
- `/bienvenida.html`
- `/index.html`

Estos archivos contienen implementaciones completas y validadas del sistema de diseño.

---

## 13. SOPORTE Y MANTENIMIENTO

Si encuentras inconsistencias:
1. Verificar que la página sigue esta guía
2. Comparar con archivos de referencia
3. Revisar `/assets/css/theme.css` para variables actualizadas
4. Probar en múltiples navegadores (Chrome, Firefox, Safari)

---

**Última actualización:** Febrero 2026
**Mantenido por:** Equipo Cambio Digital
