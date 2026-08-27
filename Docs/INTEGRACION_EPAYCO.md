# Documentación Técnica: Integración de Pagos ePayco

Este documento detalla la arquitectura, endpoints, flujo de validación y configuración de la pasarela de pagos **ePayco** para Cambio Digital en entornos de producción con **Dokploy + Docker**.

---

## 1. Resumen de URLs para ePayco

Al crear o configurar un enlace o botón de pago en el panel de ePayco:

| Tipo | URL | Propósito |
| :--- | :--- | :--- |
| **URL de Respuesta** | `https://cambiodigital.net/pago/respuesta` | Redirección pública en el navegador del cliente tras completar o cancelar el pago. |
| **URL de Confirmación** | `https://cambiodigital.net/api/pagos/epayco/confirmacion` | Webhook servidor a servidor (`POST`) donde ePayco notifica y confirma las transacciones. |

---

## 2. Configuración del Botón de Pago Abierto en ePayco

Para cobros abiertos de diferentes servicios profesionales:

* **Nombre del Producto/Servicio:**
  `Servicios profesionales y soluciones digitales`
* **Descripción:**
  `Pago por servicios de desarrollo web, automatización, inteligencia artificial, soporte tecnológico, consultoría e implementaciones digitales prestadas por Cambio Digital.`
* **Moneda soportada:** USD / COP.
* **Tipo de Cobro:** Abierto / Valor libre o definido por cotización.
* **Método de Redirección:** `GET` (por defecto de ePayco con parámetro `ref_payco`).

---

## 3. URL de Respuesta (`/pago/respuesta`)

* **Ubicación en código:** `pago/respuesta.html`
* **Acceso web:** `https://cambiodigital.net/pago/respuesta`
* **Diseño e Integración:**
  * Estilizado con Tailwind CSS y el sistema de diseño de Cambio Digital.
  * Carga asíncrona del header y footer corporativos mediante `/assets/js/layout-loader.js`.
  * Soporte de modo Claro y Oscuro (`/assets/css/theme.css`).
  * Iconos vectoriales oficiales con Lucide Icons.
  * Responsivo y optimizado para impresión de comprobantes (`@media print`).

### Flujo de Verificación en Frontend (Inmune a CORS)
1. El cliente llega redirigido por ePayco con el parámetro `ref_payco` (ejemplo: `https://cambiodigital.net/pago/respuesta?ref_payco=987654321`).
2. La página consulta internamente nuestro backend seguro:
   ```http
   GET /api/pagos/epayco/estado?ref_payco={ref_payco}
   ```
   * Si la transacción ya fue procesada por el webhook, se devuelve inmediatamente desde la base de datos local verificada SQLite.
   * Si el webhook aún no ha llegado, el servidor consulta de forma segura la API oficial de ePayco (`https://secure.epayco.co/validation/v1/reference/{ref_payco}`) vía cURL server-side, eliminando cualquier bloqueo de CORS en el navegador.
3. La página renderiza el estado verificado:
   * **Código 1:** Transacción Aprobada (Badge verde de confirmación).
   * **Código 3:** Transacción Pendiente (Badge ámbar de espera).
   * **Código 2 o 4:** Transacción Rechazada / Fallida (Badge rojo explicativo).
   * **Sin referencia o error de API:** Pantalla informativa segura con botones de contacto y retorno.
4. Muestra detalles clave:
   * Concepto / Descripción.
   * Referencia ePayco.
   * Factura / Referencia comercial (si aplica).
   * Importe formateado con su divisa (USD o COP).
   * Fecha y hora de la transacción.
   * Franquicia / Banco.
5. Acciones:
   * **Volver al Inicio:** Regresa a la página principal (`/`).
   * **Soporte WhatsApp:** Abre conversación directa con la referencia del pago pre-cargada.
   * **Imprimir Comprobante:** Diálogo de impresión limpio sin elementos de navegación.

---

## 4. Endpoint de Confirmación Webhook (`/api/pagos/epayco/confirmacion`)

* **Ubicación en código:** `api/pagos/epayco/confirmacion.php` y `api/pagos/epayco/EpaycoHandler.php`
* **Acceso web:** `https://cambiodigital.net/api/pagos/epayco/confirmacion`
* **Método HTTP:** `POST` (Acepta `GET` como health check para monitoreo y verificación).

### 4.1. Validación Criptográfica de Autenticidad (Firma SHA-256)
ePayco calcula y envía una firma en `x_signature`. El backend valida dicha firma mediante:

$$\text{Firma Calculada} = \text{hash('sha256', } \text{cust\_id} \cdot \text{'^'} \cdot \text{p\_key} \cdot \text{'^'} \cdot \text{ref\_payco} \cdot \text{'^'} \cdot \text{transaction\_id} \cdot \text{'^'} \cdot \text{amount} \cdot \text{'^'} \cdot \text{currency}\text{)}$$

La comparación se realiza con `hash_equals()` para prevenir ataques de temporización (*timing attacks*). Si la firma no coincide o faltan credenciales, la solicitud se rechaza con `HTTP 400 Bad Request`.

### 4.2. Idempotencia y Concurrencia (SQLite ACID)
* Se utiliza SQLite en modo WAL (`storage/epayco/transactions.db`) con transacciones ACID.
* La base de datos registra de forma atómica cada pago con bloqueo seguro de concurrencia.
* Si llega un payload duplicado con el mismo `ref_payco` y estado, el endpoint responde inmediatamente `HTTP 200 OK` con `"duplicate": true` sin repetir acciones.
* **Orden de ejecución seguro:** Las acciones posteriores (como despacho a n8n) se procesan antes de registrar el estado en firme, previniendo falsos positivos.

### 4.3. Bitácora Segura de Logs
* Se registran eventos en `storage/logs/epayco_webhook.log`.
* **Sanitización estricta:** Se eliminan o enmascaran automáticamente llaves privadas, tokens, tarjetas y contraseñas.
* El directorio `storage/` está protegido contra acceso web directo mediante `.htaccess` (`Require all denied`).

---

## 5. Configuración en Dokploy

### 5.1. Variables de Entorno en Dokploy
Configura estas variables en la pestaña **Environment Variables** de tu aplicación en Dokploy:

```env
# Credenciales oficiales de ePayco (Dashboard > Integraciones > Llaves API)
EPAYCO_CUSTOMER_ID=tu_p_cust_id_cliente
EPAYCO_SECRET_KEY=tu_p_key_secreta
EPAYCO_PUBLIC_KEY=tu_public_key_opcional

# Webhook n8n para CRM / Notificaciones (Opcional)
N8N_PAYMENTS_WEBHOOK_URL=https://n8n.cambiodigital.cloud/webhook/tu-id-webhook
```

### 5.2. Volumen Persistente (Persistent Volume)
Para que los logs (`storage/logs/`) y la base de datos de transacciones (`storage/epayco/transactions.db`) sobrevivan a reinicios, recreaciones y actualizaciones del contenedor:

* **En Dokploy > Application > Volumes & Mounts:**
  * **Type:** `Volume` (o `Bind Mount`)
  * **Volume Name / Host Path:** `cambiodigital_storage` (o la ruta en el host que asigne Dokploy)
  * **Container Mount Path:** `/var/www/html/storage`

### 5.3. Permisos y Propietario
* El contenedor ejecuta Apache/PHP con el usuario `www-data` (UID: 33, GID: 33).
* El script `docker-entrypoint.sh` se ejecuta automáticamente en cada inicio del contenedor para asegurar que `/var/www/html/storage/epayco` y `/var/www/html/storage/logs` existan y tengan permisos `755` y propietario `www-data:www-data`.
* No es necesario ejecutar `chmod 777`.

### 5.4. Comprobaciones Post-Deploy
Una vez desplegada la aplicación en Dokploy:

1. **Verificar Health Check del Webhook:**
   ```bash
   curl -i https://cambiodigital.net/api/pagos/epayco/confirmacion
   ```
   Debe devolver HTTP 200 con `status: active` y `env_ready: true`.

2. **Verificar Página de Respuesta:**
   Abrir en el navegador `https://cambiodigital.net/pago/respuesta` y confirmar que carga con el diseño de Cambio Digital.

3. **Verificar Seguridad de Acceso a Archivos:**
   ```bash
   curl -i https://cambiodigital.net/storage/epayco/transactions.db
   curl -i https://cambiodigital.net/storage/logs/epayco_webhook.log
   curl -i https://cambiodigital.net/Docs/INTEGRACION_EPAYCO.md
   ```
   Todas deben devolver **HTTP 403 Forbidden**.

4. **Escalabilidad y Múltiples Réplicas:**
   Si en el futuro se configuran 2 o más réplicas simultáneas de la aplicación en servidores distintos sin almacenamiento NFS/Ceph compartido, se recomienda migrar la persistencia de idempotencia a PostgreSQL / Redis centralizado.
