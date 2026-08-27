const crypto = require('crypto');
const http = require('http');

const BASE_URL = 'http://localhost:8088';
const CUST_ID = '123456';
const SECRET_KEY = 'test_p_key_secret_12345';

function calculateSignature(custId, pKey, refPayco, txId, amount, currency) {
    const raw = `${custId}^${pKey}^${refPayco}^${txId}^${amount}^${currency}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
}

function request(urlPath, options = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(urlPath, BASE_URL);
        const reqOpts = {
            method: options.method || 'GET',
            headers: options.headers || {},
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search
        };

        const req = http.request(reqOpts, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                let json = null;
                try {
                    json = JSON.parse(data);
                } catch (e) {}
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data,
                    json
                });
            });
        });

        req.on('error', reject);

        if (options.body) {
            req.write(options.body);
        }
        req.end();
    });
}

async function runTests() {
    console.log('========================================================');
    console.log('🚀 INICIANDO PRUEBAS AUTOMATIZADAS DE INTEGRACIÓN EPAYCO');
    console.log('========================================================\n');

    let passed = 0;
    let failed = 0;

    function assert(name, condition, extra = '') {
        if (condition) {
            console.log(`✅ [PASS] ${name}`);
            passed++;
        } else {
            console.error(`❌ [FAIL] ${name} ${extra}`);
            failed++;
        }
    }

    // 1. Health Check
    console.log('1. Probando Health Check GET /api/pagos/epayco/confirmacion');
    const health = await request('/api/pagos/epayco/confirmacion');
    assert('Health check status 200', health.statusCode === 200);
    assert('Health check env_ready is true', health.json && health.json.env_ready === true);
    assert('Health check storage is sqlite_acid', health.json && health.json.storage === 'sqlite_acid');

    // 2. URL de Respuesta
    console.log('\n2. Probando URL de Respuesta GET /pago/respuesta');
    const respPage = await request('/pago/respuesta');
    assert('Página de respuesta status 200', respPage.statusCode === 200);
    assert('Contiene HTML de Cambio Digital', respPage.body.includes('Pasarela Segura ePayco'));

    // 3. Webhook Válido
    console.log('\n3. Probando Webhook Válido POST /api/pagos/epayco/confirmacion');
    const tx1Ref = 'PAYCO_' + Date.now();
    const tx1Id = 'TX_' + Math.floor(Math.random() * 1000000);
    const amount = '150.00';
    const currency = 'USD';
    const sig1 = calculateSignature(CUST_ID, SECRET_KEY, tx1Ref, tx1Id, amount, currency);

    const validPayload = new URLSearchParams({
        x_cust_id_cliente: CUST_ID,
        x_ref_payco: tx1Ref,
        x_transaction_id: tx1Id,
        x_amount: amount,
        x_currency_code: currency,
        x_signature: sig1,
        x_cod_response: '1',
        x_response: 'Aprobada',
        x_id_invoice: 'INV-TEST-001',
        x_description: 'Servicios profesionales y soluciones digitales',
        x_customer_name: 'Cliente Prueba',
        x_customer_email: 'cliente@test.com',
        x_customer_phone: '+573001234567',
        x_franchise: 'VISA',
        x_bank_name: 'BANCOLOMBIA'
    }).toString();

    const webhook1 = await request('/api/pagos/epayco/confirmacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: validPayload
    });

    assert('Webhook válido responde HTTP 200', webhook1.statusCode === 200);
    assert('Webhook válido status es success', webhook1.json && webhook1.json.status === 'success');
    assert('Webhook confirma status_name Aprobada', webhook1.json && webhook1.json.status_name === 'Aprobada');

    // 4. Webhook Duplicado (Idempotencia)
    console.log('\n4. Probando Webhook Duplicado (Idempotencia)');
    const webhookDup = await request('/api/pagos/epayco/confirmacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: validPayload
    });

    assert('Webhook duplicado responde HTTP 200', webhookDup.statusCode === 200);
    assert('Detecta duplicado correctamente', webhookDup.json && webhookDup.json.duplicate === true);

    // 5. Webhook con Firma Inválida
    console.log('\n5. Probando Webhook con Firma Inválida');
    const badSigPayload = new URLSearchParams({
        x_cust_id_cliente: CUST_ID,
        x_ref_payco: 'PAYCO_BAD_' + Date.now(),
        x_transaction_id: 'TX_BAD',
        x_amount: '100.00',
        x_currency_code: 'USD',
        x_signature: 'invalid_sha256_signature_string',
        x_cod_response: '1',
        x_response: 'Aprobada'
    }).toString();

    const webhookBadSig = await request('/api/pagos/epayco/confirmacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: badSigPayload
    });

    assert('Firma inválida responde HTTP 400', webhookBadSig.statusCode === 400);
    assert('Mensaje de error correcto', webhookBadSig.json && webhookBadSig.json.message.includes('Invalid transaction signature'));

    // 6. Webhook Incompleto
    console.log('\n6. Probando Webhook Incompleto (sin x_ref_payco)');
    const emptyPayload = new URLSearchParams({ x_amount: '100' }).toString();
    const webhookEmpty = await request('/api/pagos/epayco/confirmacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: emptyPayload
    });

    assert('Payload incompleto responde HTTP 400', webhookEmpty.statusCode === 400);
    assert('No genera error 500', webhookEmpty.statusCode !== 500);

    // 7. Estado de Transacción Server-Side (GET /api/pagos/epayco/estado)
    console.log('\n7. Probando Consulta de Estado Server-Side (GET /api/pagos/epayco/estado)');
    const statusCheck = await request(`/api/pagos/epayco/estado?ref_payco=${tx1Ref}`);
    assert('Consulta de estado responde HTTP 200', statusCheck.statusCode === 200);
    assert('Recupera datos locales verificados', statusCheck.json && statusCheck.json.source === 'local_verified');
    assert('Monto coincide con el registrado', statusCheck.json && statusCheck.json.data && Number(statusCheck.json.data.x_amount) === 150);

    // 8. Concurrencia (5 Webhooks Simultáneos)
    console.log('\n8. Probando Concurrencia con 5 Webhooks Simultáneos');
    const concurrentPromises = Array.from({ length: 5 }).map((_, i) => {
        const cRef = `CONCURRENT_${Date.now()}_${i}`;
        const cTxId = `CTX_${i}`;
        const cSig = calculateSignature(CUST_ID, SECRET_KEY, cRef, cTxId, '200.00', 'USD');
        const cBody = new URLSearchParams({
            x_cust_id_cliente: CUST_ID,
            x_ref_payco: cRef,
            x_transaction_id: cTxId,
            x_amount: '200.00',
            x_currency_code: 'USD',
            x_signature: cSig,
            x_cod_response: '1',
            x_response: 'Aprobada'
        }).toString();

        return request('/api/pagos/epayco/confirmacion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: cBody
        });
    });

    const concurrentResults = await Promise.all(concurrentPromises);
    const allConcurrentOk = concurrentResults.every(r => r.statusCode === 200 && r.json && r.json.status === 'success');
    assert('Todos los 5 webhooks concurrentes procesados exitosamente (HTTP 200)', allConcurrentOk);

    // 9. Seguridad: Bloqueo de Carpetas y Archivos Sensibles
    console.log('\n9. Probando Reglas de Seguridad y Bloqueo de Acceso HTTP');
    const testStorage = await request('/storage/');
    assert('Acceso directo a /storage/ denegado (403 Forbidden)', testStorage.statusCode === 403);

    const testLogs = await request('/storage/logs/epayco_webhook.log');
    assert('Acceso a /storage/logs/epayco_webhook.log denegado (403 Forbidden)', testLogs.statusCode === 403);

    const testDb = await request('/storage/epayco/transactions.db');
    assert('Acceso a /storage/epayco/transactions.db denegado (403 Forbidden)', testDb.statusCode === 403);

    const testDocs = await request('/Docs/INTEGRACION_EPAYCO.md');
    assert('Acceso a /Docs/ denegado (403 Forbidden)', testDocs.statusCode === 403);

    const testEnv = await request('/.env');
    assert('Acceso a /.env denegado (403 Forbidden)', testEnv.statusCode === 403);

    console.log('\n========================================================');
    console.log(`🏁 RESULTADO: ${passed} PASADAS, ${failed} FALLIDAS`);
    console.log('========================================================');

    if (failed > 0) {
        process.exit(1);
    }
}

runTests().catch((err) => {
    console.error('Error ejecutando suite de pruebas:', err);
    process.exit(1);
});
