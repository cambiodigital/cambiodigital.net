# Flujo de Blog

- Para crear un blog nuevo, no duplicar posts manualmente. Usar siempre `npm run blog:new -- ...` para que el archivo nazca desde `Docs/PLANTILLA_BLOG_UNICA.html`.
- La plantilla fuente de verdad para posts es `Docs/PLANTILLA_BLOG_UNICA.html`.
- Si cambia la plantilla o hay que ajustar el diseño común de los posts, actualizar esa plantilla y ejecutar `npm run blog:sync-template` para propagar el shell compartido a todos los archivos de `blog/*.html`.
- El comportamiento visual compartido del blog vive en `assets/js/blog-post.js` y `assets/js/layout-loader.js`; no reimplementar esas piezas dentro de cada post.
- Si se solicita un nuevo blog desde el chat, el flujo correcto es: crear con `blog:new`, completar el contenido y, si la base cambió, resincronizar con `blog:sync-template`.

# Flujo de Presupuestos

- **Regla de oro**: todo presupuesto vive dentro de `presupuestos/{Cliente}/`. NUNCA crear presupuestos sueltos en la raíz de `presupuestos/`.
- La guía completa de formato, nomenclatura, precios, monedas y estructura está en `presupuestos/REGLAS_PRESUPUESTOS.md`. Leerla SIEMPRE antes de crear o modificar un presupuesto.
- Las fuentes de verdad para precios son `Docs/Lista de precios.md` y `presupuestos/SERVICIOS_CATALOGO_Y_CLASIFICACION.md`. No inventar precios.
- Nombre de archivo: `Presupuesto-[Descripción]-[Cliente]-[AAAA-MM-DD].md` o `Propuesta-[Descripción]-[Cliente]-[AAAA-MM-DD].md`.
- Si el cliente es nuevo, crear su carpeta `presupuestos/{Nombre Cliente}/` y arrancar ahí.
- Moneda por defecto: USD. Solo usar COP si el cliente está en Colombia, siempre con TRM de referencia.
- Forma de pago estándar: 50% al inicio + 50% contra entrega validada.
