# Documentación de Replicación: Cambio Digital

## 1. Información de la Empresa

*   **Nombre Comercial:** Cambio Digital (CD)
*   **Slogan:** "Transformación digital radical." / "Vende Más. Trabaja Menos."
*   **Ubicación:** Manizales, Colombia (Operación "Worldwide").
*   **Misión:** Construir ecosistemas de negocio automatizados (CRM, IA, Soporte IT) para que los clientes se enfoquen en vender mientras la tecnología se maneja sola.
*   **Propuesta de Valor:** Recuperación de tiempo (+10 horas/semana), respuesta inmediata a clientes (0 mensajes perdidos) y soporte técnico sin sorpresas.
*   **Equipo Clave:**
    *   **Jhony Alvarez:** Aliado en Escalar (Operaciones/Estrategia).
    *   **Jimmy Ospina:** Arquitecto de Eficiencia (Automatización).
    *   **Juan S. Galeano:** Creador de IA (Desarrollo IA).

## 2. Catálogo de Productos y Servicios

### Servicios Recurrentes (Suscripción)
1.  **IT Partner (Soporte Técnico)**
    *   **Descripción:** Departamento de TI externo. Soporte, monitoreo y mantenimiento.
    *   **Características:** Respuesta prioritaria, revisión de salud semanal, capacitación mensual, monitoreo 24/7.
    *   **SKU:** `IT_PARTNER_SUBSCRIPTION`

2.  **Social CRM Pack**
    *   **Descripción:** Centralización de mensajería (IG, FB, WA) y gestión de CRM.
    *   **Beneficio:** Respuesta 24/7, organización de leads, cero ventas perdidas por olvido.
    *   **SKU:** `SOCIAL_CRM_PACK`

3.  **AI Agents Pack**
    *   **Descripción:** Agentes de IA para ventas y atención al cliente.
    *   **Beneficio:** Ventas 24/7 sin coste de nómina, calificación automática de leads.
    *   **SKU:** `AI_AGENTS_PACK`

4.  **Web Dev Pack**
    *   **Descripción:** Desarrollo web enfocado en conversión (E-commerce, Landing Pages).
    *   **Beneficio:** Máquina de ventas online, no solo "páginas bonitas".
    *   **SKU:** `WEB_DEV_PACK`

### Servicios Puntuales (Proyectos)
*   **Desarrollo Web a Medida:** Páginas corporativas, tiendas online avanzadas.
*   **Implementación de Chatbots:** Flujos de conversación automatizados.
*   **Hosting & Dominio:** Infraestructura anual.

## 3. Estructura de Precios

### IT Partner (Soporte)
| Plan | Precio | Frecuencia | Inclusión Clave |
| :--- | :--- | :--- | :--- |
| **Fase Estabilización** | **$300 USD** | Pago Único (3 meses) | Inventario, monitoreo, backups, optimización inicial. |
| **Estándar** | **$100 USD** | Mensual (tras fase 1) | Soporte < 2h, 1 revisión/sem, 2h capacitación. |
| **Evolución** | **$200 USD** | Mensual | Soporte VIP inmediato, 2 revisiones/sem, 4h capacitación, 1 config nueva/mes. |

*Nota: Los planes requieren pago trimestral al inicio (Fase de Estabilización).*

### Cotizador "A Medida" (Precios Base)
| Servicio | Precio Base | Valor Mercado (Referencia) | Extras Disponibles |
| :--- | :--- | :--- | :--- |
| **Página Esencial** | $400 USD | $650 USD | Redacción ($50), Formulario Avanzado ($20). |
| **Página Personalizada**| $800 USD | $1200 USD | Chatbot Básico ($150), Sección Extra ($40 c/u). |
| **Tienda Avanzada** | $2400 USD | $3500 USD | Carga Prioritaria ($200). |
| **Chatbot Esencial** | $180 USD | $300 USD | IA GPT ($50/mes), WhatsApp API ($30/mes). |
| **Hosting & Dominio** | $260 USD | $350 USD | 50GB Extra ($50). |

## 4. Arquitectura del Sitio Web

### Mapa del Sitio
1.  **Home (`/index.html`)**
    *   Hero (Video background + Propuesta valor)
    *   Marquee (Cinta de texto en movimiento)
    *   Quiénes Somos (Misión)
    *   Paquetes (Grid de servicios principales)
    *   Proyectos (Casos de éxito: Angela's Vacation, Compusum, Vioka, etc.)
    *   Reseñas (Testimonios)
    *   Blog Preview (Últimos artículos)
    *   Contacto (Formulario dinámico)
    *   Equipo
2.  **Landing IT Partner (`/servicios/it-partner.html`)**
    *   Detalle específico del servicio de soporte, tabla comparativa "Sin vs Con nosotros", FAQ y Pricing específico.
3.  **Portal Cliente (`/servicios/bienvenida.html`)**
    *   Página privada para onboarding de nuevos clientes.
    *   Enlaces a canales de soporte (WhatsApp, Google Chat).
    *   Formulario de solicitud de servicios (Ticket inicial).
4.  **Blog (`/blog.html`)**
    *   Índice de artículos y detalle de posts (ej: `5-cosas-competencia-ia-crm-2026.html`).
5.  **Cotizador (`/COTIZADOR_PLAN_A_MEDIDA.html`)**
    *   Herramienta interactiva JS para cálculo de presupuesto en tiempo real.

## 5. Recursos Visuales

### Inventario Gráfico
*   **Logotipos:**
    *   `assets/images/LogoCDFondoClaro.png` (Para fondos claros)
    *   `assets/images/LogoCDFondoOscuro.png` (Para fondos oscuros/header)
*   **Iconografía:**
    *   Librería: **Lucide Icons** (archivo local `/assets/js/lucide.min.js`, sin CDN).
    *   Usos: `shield-check`, `zap`, `users`, `message-circle`, etc.
*   **Tipografía:**
    *   Fuentes: **Inter** (Textos generales) y **Space Mono** (Datos técnicos/código).
    *   Origen: Google Fonts.
*   **Multimedia:**
    *   Video Hero: `https://cambiodigital.net/media/videoiacrm.mp4` (Video de fondo en loop).
    *   Imágenes de Stock: Se utilizan enlaces directos a **Unsplash** en el código (ej: equipos, oficinas, dashboards).

## 6. Información de Contacto y Legal

*   **Canales de Atención:**
    *   **WhatsApp:** +57 312 290 8416 (Principal canal de ventas y soporte rápido).
    *   **Email:** `contacto@cambiodigital.net` (General), `ventas@cambiodigital.net` (Comercial).
    *   **Google Chat:** Grupos privados para clientes activos.
*   **Horarios:**
    *   Lunes a Viernes: 8:00 AM - 6:00 PM (Hora Colombia).
    *   Soporte Crítico: Monitoreo 24/7 automatizado.
*   **Términos Legales (Resumen del Borrador):**
    *   **Permanencia:** Mínimo 3 meses (Fase de Estabilización) para servicio IT Partner.
    *   **Cancelación:** Preaviso de 30 días tras el periodo inicial.
    *   **Pagos:** Por adelantado. Suspensión de servicio tras 5 días de mora (+ tarifa de reactivación $25).
    *   **Confidencialidad:** Acuerdo estricto de no divulgación de datos del cliente.

## 7. Datos Relevantes del Negocio

### Proceso de Compra
1.  **Lead:** Llega vía Web, Blog o Referido.
2.  **Conversión:**
    *   **Directa:** Enlaces de pago Stripe para planes estandarizados (IT Partner).
    *   **Consultiva:** Botón de WhatsApp para servicios a medida o dudas.
    *   **Cotizador:** Herramienta interactiva que envía los datos a n8n para seguimiento comercial.
3.  **Onboarding:** Redirección a `/servicios/bienvenida.html` para registro inicial y acceso a canales de soporte.

### Stack Tecnológico y Automatización
*   **Frontend:** HTML5, Tailwind CSS (generado), JavaScript Vanilla.
*   **Integraciones (Backend Low-Code):**
    *   **n8n:** Orquestador principal de flujos.
    *   **Webhook:** `https://n8n.cambiodigital.cloud/webhook/...` (Recibe formularios de contacto, solicitudes de servicio y cotizaciones).
    *   **Stripe:** Pasarela de pagos (`buy.stripe.com` links).
*   **Herramientas Externas:** Google Chat (Comunidad/Soporte), Google Drive (Gestión documental).

### Casos de Éxito Referenciados
*   **Angela's Vacation (USA):** Turismo. Ahorro de 75% de tiempo en soporte.
*   **Compusum (COL):** Seguridad. Respuesta a incidentes reducida de 2h a instantánea.
*   **Vioka (Pereira):** Retail. 40% clientes recurrentes gracias a atención 24/7.
*   **Clínica Santa Clara (COL):** Salud. Reducción de ausentismo (no-shows) del 25% al 8%.
*   **Rey Oblea (MEX):** Alimentos. Chatbot "Oblein" reduce tiempo de pedido de 30min a 2min.
