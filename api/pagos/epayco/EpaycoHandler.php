<?php
/**
 * Cambio Digital - ePayco Payment Confirmation & Verification Handler
 * 
 * Manages webhook validation, SHA-256 signature verification,
 * SQLite ACID idempotency tracking, secure logging, downstream event dispatching,
 * and server-side payment status validation for the response page.
 */

declare(strict_types=1);

class EpaycoHandler
{
    private static $envLoaded = false;
    private $customerId;
    private $secretKey;
    private $publicKey;
    private $n8nWebhookUrl;
    private $storageDir;
    private $logsDir;
    private $dbFile;
    private $logFile;
    private $pdo = null;

    public function __construct()
    {
        $this->loadEnvironment();

        $this->customerId    = $this->getEnvVar(['EPAYCO_CUSTOMER_ID', 'P_CUST_ID_CLIENTE', 'EPAYCO_CUST_ID']);
        $this->secretKey     = $this->getEnvVar(['EPAYCO_SECRET_KEY', 'P_KEY', 'EPAYCO_P_KEY']);
        $this->publicKey     = $this->getEnvVar(['EPAYCO_PUBLIC_KEY', 'PUBLIC_KEY', 'EPAYCO_P_PUBLIC_KEY']);
        $this->n8nWebhookUrl = $this->getEnvVar(['N8N_PAYMENTS_WEBHOOK_URL', 'N8N_WEBHOOK_URL']);

        $baseDir = dirname(__DIR__, 3);
        $this->storageDir = $baseDir . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'epayco';
        $this->logsDir    = $baseDir . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'logs';
        $this->dbFile     = $this->storageDir . DIRECTORY_SEPARATOR . 'transactions.db';
        $this->logFile    = $this->logsDir . DIRECTORY_SEPARATOR . 'epayco_webhook.log';

        $this->ensureDirectories();
        $this->initDatabase();
    }

    /**
     * Entry point for processing webhook HTTP requests (POST / GET).
     */
    public function handleRequest(): void
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        // Health check on GET
        if ($method === 'GET') {
            $this->sendJsonResponse(200, [
                'status'    => 'active',
                'service'   => 'Cambio Digital - ePayco Confirmation Webhook',
                'version'   => '2.0.0',
                'timestamp' => date('c'),
                'env_ready' => !empty($this->customerId) && !empty($this->secretKey),
                'storage'   => 'sqlite_acid'
            ]);
            return;
        }

        if ($method !== 'POST') {
            $this->sendJsonResponse(405, [
                'status'  => 'error',
                'message' => 'Method Not Allowed. Webhook expects POST.'
            ]);
            return;
        }

        $startTime = microtime(true);
        $clientIp  = $this->getClientIp();

        try {
            $payload = $this->extractPayload();

            if (empty($payload)) {
                $this->logEvent('ERROR', 'Empty payload received', ['ip' => $clientIp]);
                $this->sendJsonResponse(400, [
                    'status'  => 'error',
                    'message' => 'Payload is empty or invalid format.'
                ]);
                return;
            }

            // Verify essential fields
            $refPayco       = trim((string)($payload['x_ref_payco'] ?? $payload['ref_payco'] ?? ''));
            $transactionId  = trim((string)($payload['x_transaction_id'] ?? $payload['transaction_id'] ?? ''));
            $amount         = trim((string)($payload['x_amount'] ?? $payload['amount'] ?? ''));
            $currency       = trim((string)($payload['x_currency_code'] ?? $payload['currency'] ?? 'USD'));
            $receivedSig    = trim((string)($payload['x_signature'] ?? $payload['signature'] ?? ''));
            $responseCode   = (int)($payload['x_cod_response'] ?? $payload['x_cod_transaction_state'] ?? 0);
            $responseState  = trim((string)($payload['x_response'] ?? $payload['x_transaction_state'] ?? 'Desconocido'));

            if (empty($refPayco)) {
                $this->logEvent('ERROR', 'Missing x_ref_payco in payload', ['ip' => $clientIp, 'payload' => $this->sanitizeData($payload)]);
                $this->sendJsonResponse(400, [
                    'status'  => 'error',
                    'message' => 'Missing transaction reference (x_ref_payco).'
                ]);
                return;
            }

            // Signature verification
            $signatureValid = $this->validateSignature($payload);
            if (!$signatureValid) {
                $this->logEvent('WARNING', 'Invalid signature verification', [
                    'ip'             => $clientIp,
                    'ref_payco'      => $refPayco,
                    'received_sig'   => $receivedSig,
                    'transaction_id' => $transactionId
                ]);

                $this->sendJsonResponse(400, [
                    'status'  => 'error',
                    'message' => 'Invalid transaction signature.'
                ]);
                return;
            }

            // Normalize status
            $statusName = $this->resolveStatusName($responseCode, $responseState);

            // Idempotency check with SQLite ACID lock
            if ($this->isAlreadyProcessed($refPayco, $responseCode)) {
                $this->logEvent('INFO', 'Duplicate notification received (Idempotent)', [
                    'ref_payco'     => $refPayco,
                    'status'        => $statusName,
                    'code'          => $responseCode,
                    'duration_ms'   => round((microtime(true) - $startTime) * 1000, 2)
                ]);

                $this->sendJsonResponse(200, [
                    'status'    => 'success',
                    'message'   => 'Notification already processed (idempotent)',
                    'ref_payco' => $refPayco,
                    'duplicate' => true
                ]);
                return;
            }

            // Structured transaction record
            $transactionRecord = [
                'ref_payco'        => $refPayco,
                'transaction_id'   => $transactionId,
                'invoice'          => (string)($payload['x_id_invoice'] ?? $payload['invoice'] ?? ''),
                'description'      => (string)($payload['x_description'] ?? 'Pago de servicios Cambio Digital'),
                'amount'           => (float)$amount,
                'currency'         => $currency,
                'status_code'      => $responseCode,
                'status_name'      => $statusName,
                'response_reason'  => (string)($payload['x_response_reason_text'] ?? ''),
                'franchise'        => (string)($payload['x_franchise'] ?? ''),
                'bank_name'        => (string)($payload['x_bank_name'] ?? ''),
                'approval_code'    => (string)($payload['x_approval_code'] ?? ''),
                'transaction_date' => (string)($payload['x_transaction_date'] ?? $payload['x_fecha_transaccion'] ?? date('Y-m-d H:i:s')),
                'client' => [
                    'name'     => (string)($payload['x_customer_name'] ?? $payload['x_name'] ?? ''),
                    'email'    => (string)($payload['x_customer_email'] ?? $payload['x_email'] ?? ''),
                    'phone'    => (string)($payload['x_customer_phone'] ?? $payload['x_phone'] ?? ''),
                    'document' => (string)($payload['x_customer_document'] ?? $payload['x_document'] ?? '')
                ],
                'metadata' => [
                    'extra1' => (string)($payload['x_extra1'] ?? ''),
                    'extra2' => (string)($payload['x_extra2'] ?? ''),
                    'extra3' => (string)($payload['x_extra3'] ?? '')
                ],
                'processed_at' => date('c'),
                'client_ip'    => $clientIp
            ];

            // 1. Dispatch downstream actions (e.g. n8n, CRM) BEFORE committing processed state
            $this->dispatchToDownstream($transactionRecord);

            // 2. Persist record in SQLite atomically
            $this->saveTransactionRecord($transactionRecord);

            // 3. Log event
            $this->logEvent('INFO', 'Payment notification processed successfully', [
                'ref_payco'    => $refPayco,
                'status'       => $statusName,
                'amount'       => $amount,
                'currency'     => $currency,
                'client_email' => $transactionRecord['client']['email'],
                'duration_ms'  => round((microtime(true) - $startTime) * 1000, 2)
            ]);

            $this->sendJsonResponse(200, [
                'status'      => 'success',
                'message'     => 'Transaction confirmation processed successfully',
                'ref_payco'   => $refPayco,
                'status_name' => $statusName,
                'timestamp'   => date('c')
            ]);

        } catch (Throwable $e) {
            $this->logEvent('CRITICAL', 'Unhandled exception during webhook processing', [
                'error' => $e->getMessage(),
                'file'  => $e->getFile(),
                'line'  => $e->getLine(),
                'ip'    => $clientIp
            ]);

            $this->sendJsonResponse(500, [
                'status'  => 'error',
                'message' => 'Internal server error while processing confirmation.'
            ]);
        }
    }

    /**
     * Server-side transaction verification endpoint for the response page.
     * Prevents CORS issues and provides fallback to local DB.
     */
    public function handleStatusCheck(): void
    {
        $refPayco = trim((string)($_GET['ref_payco'] ?? $_GET['x_ref_payco'] ?? ''));

        if (empty($refPayco)) {
            $this->sendJsonResponse(400, [
                'success' => false,
                'message' => 'Parámetro ref_payco requerido.'
            ]);
            return;
        }

        // 1. First check local SQLite store
        $localRecord = $this->getLocalTransaction($refPayco);
        if ($localRecord !== null) {
            $this->sendJsonResponse(200, [
                'success' => true,
                'source'  => 'local_verified',
                'data'    => [
                    'x_ref_payco'            => $localRecord['ref_payco'],
                    'x_transaction_id'       => $localRecord['transaction_id'],
                    'x_id_invoice'           => $localRecord['invoice'],
                    'x_description'          => $localRecord['description'],
                    'x_amount'               => $localRecord['amount'],
                    'x_currency_code'        => $localRecord['currency'],
                    'x_cod_response'         => (int)$localRecord['status_code'],
                    'x_response'             => $localRecord['status_name'],
                    'x_response_reason_text' => $localRecord['response_reason'],
                    'x_franchise'            => $localRecord['franchise'],
                    'x_bank_name'            => $localRecord['bank_name'],
                    'x_approval_code'        => $localRecord['approval_code'],
                    'x_transaction_date'     => $localRecord['transaction_date'],
                    'x_customer_name'        => $localRecord['client_name'] ?? '',
                    'x_customer_email'       => $localRecord['client_email'] ?? ''
                ]
            ]);
            return;
        }

        // 2. Query ePayco validation API server-side
        $remoteData = $this->queryEpaycoValidationApi($refPayco);
        if ($remoteData !== null) {
            $this->sendJsonResponse(200, [
                'success' => true,
                'source'  => 'epayco_api',
                'data'    => $remoteData
            ]);
            return;
        }

        $this->sendJsonResponse(404, [
            'success' => false,
            'message' => 'No se pudo verificar la transacción con ePayco.'
        ]);
    }

    /**
     * Queries ePayco's public validation API server-side via cURL.
     */
    private function queryEpaycoValidationApi(string $refPayco): ?array
    {
        $url = 'https://secure.epayco.co/validation/v1/reference/' . urlencode($refPayco);
        $ch  = curl_init($url);

        if (!$ch) {
            return null;
        }

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 8,
            CURLOPT_CONNECTTIMEOUT => 4,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_HTTPHEADER     => [
                'Accept: application/json',
                'User-Agent: CambioDigital-EpaycoProxy/2.0'
            ]
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200 && !empty($response)) {
            $json = json_decode((string)$response, true);
            if (is_array($json)) {
                if (isset($json['data']) && is_array($json['data'])) {
                    return $json['data'];
                }
                if (isset($json['success']) && $json['success'] === true) {
                    return $json;
                }
            }
        }

        return null;
    }

    /**
     * Extracts payload from POST parameters or JSON body.
     */
    private function extractPayload(): array
    {
        if (!empty($_POST)) {
            return $_POST;
        }

        $rawBody = file_get_contents('php://input');
        if (!empty($rawBody)) {
            $jsonData = json_decode($rawBody, true);
            if (is_array($jsonData)) {
                return $jsonData;
            }

            parse_str($rawBody, $parsed);
            if (is_array($parsed) && !empty($parsed)) {
                return $parsed;
            }
        }

        return [];
    }

    /**
     * Validates ePayco SHA-256 signature according to official spec:
     * hash('sha256', cust_id ^ secret_key ^ ref_payco ^ transaction_id ^ amount ^ currency_code)
     */
    public function validateSignature(array $payload): bool
    {
        $receivedSig = trim((string)($payload['x_signature'] ?? $payload['signature'] ?? ''));
        if (empty($receivedSig)) {
            return false;
        }

        $custId = trim((string)($this->customerId ?: ($payload['x_cust_id_cliente'] ?? '')));
        $pKey   = trim((string)$this->secretKey);

        if (empty($pKey) || empty($custId)) {
            $this->logEvent('ALERT', 'EPAYCO_SECRET_KEY or EPAYCO_CUSTOMER_ID is not configured in server environment.');
            return false;
        }

        $refPayco      = trim((string)($payload['x_ref_payco'] ?? $payload['ref_payco'] ?? ''));
        $transactionId = trim((string)($payload['x_transaction_id'] ?? $payload['transaction_id'] ?? ''));
        $amount        = trim((string)($payload['x_amount'] ?? $payload['amount'] ?? ''));
        $currency      = trim((string)($payload['x_currency_code'] ?? $payload['currency'] ?? ''));

        // Raw amount comparison
        $signatureString1 = $custId . '^' . $pKey . '^' . $refPayco . '^' . $transactionId . '^' . $amount . '^' . $currency;
        $calculated1 = hash('sha256', $signatureString1);

        if (hash_equals(strtolower($calculated1), strtolower($receivedSig))) {
            return true;
        }

        // Decimal formatting comparison (e.g. 150 vs 150.00)
        $formattedAmount = number_format((float)$amount, 2, '.', '');
        $signatureString2 = $custId . '^' . $pKey . '^' . $refPayco . '^' . $transactionId . '^' . $formattedAmount . '^' . $currency;
        $calculated2 = hash('sha256', $signatureString2);

        return hash_equals(strtolower($calculated2), strtolower($receivedSig));
    }

    /**
     * Resolves human-readable status name.
     */
    public function resolveStatusName(int $code, string $fallback = ''): string
    {
        switch ($code) {
            case 1:
                return 'Aprobada';
            case 2:
                return 'Rechazada';
            case 3:
                return 'Pendiente';
            case 4:
                return 'Fallida / Cancelada';
            case 6:
                return 'Reversada';
            case 7:
                return 'Retenida';
            default:
                return !empty($fallback) ? $fallback : 'Desconocido';
        }
    }

    /**
     * Initializes SQLite database and table structure with WAL mode.
     */
    private function initDatabase(): void
    {
        if ($this->pdo !== null) {
            return;
        }

        try {
            $this->pdo = new PDO('sqlite:' . $this->dbFile);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

            // Enable WAL mode and 5s timeout for high concurrent throughput
            $this->pdo->exec('PRAGMA journal_mode = WAL;');
            $this->pdo->exec('PRAGMA busy_timeout = 5000;');

            $this->pdo->exec('CREATE TABLE IF NOT EXISTS epayco_transactions (
                ref_payco TEXT PRIMARY KEY,
                transaction_id TEXT,
                invoice TEXT,
                description TEXT,
                amount REAL,
                currency TEXT,
                status_code INTEGER,
                status_name TEXT,
                response_reason TEXT,
                franchise TEXT,
                bank_name TEXT,
                approval_code TEXT,
                transaction_date TEXT,
                client_name TEXT,
                client_email TEXT,
                client_phone TEXT,
                client_document TEXT,
                extra1 TEXT,
                extra2 TEXT,
                extra3 TEXT,
                client_ip TEXT,
                created_at TEXT,
                updated_at TEXT
            );
            CREATE INDEX IF NOT EXISTS idx_status ON epayco_transactions(status_code);');

        } catch (Throwable $e) {
            $this->logEvent('ERROR', 'Failed to initialize SQLite database', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Checks if transaction reference and status have already been processed in SQLite.
     */
    private function isAlreadyProcessed(string $refPayco, int $statusCode): bool
    {
        if ($this->pdo === null) {
            return false;
        }

        try {
            $stmt = $this->pdo->prepare('SELECT status_code FROM epayco_transactions WHERE ref_payco = :ref_payco LIMIT 1');
            $stmt->execute([':ref_payco' => $refPayco]);
            $row = $stmt->fetch();

            if ($row && (int)$row['status_code'] === $statusCode) {
                return true;
            }
        } catch (Throwable $e) {
            $this->logEvent('ERROR', 'Error checking idempotency in SQLite', ['error' => $e->getMessage()]);
        }

        return false;
    }

    /**
     * Persists transaction record in SQLite atomically.
     */
    private function saveTransactionRecord(array $record): void
    {
        if ($this->pdo === null) {
            return;
        }

        try {
            $sql = 'INSERT INTO epayco_transactions (
                ref_payco, transaction_id, invoice, description, amount, currency,
                status_code, status_name, response_reason, franchise, bank_name,
                approval_code, transaction_date, client_name, client_email, client_phone,
                client_document, extra1, extra2, extra3, client_ip, created_at, updated_at
            ) VALUES (
                :ref_payco, :transaction_id, :invoice, :description, :amount, :currency,
                :status_code, :status_name, :response_reason, :franchise, :bank_name,
                :approval_code, :transaction_date, :client_name, :client_email, :client_phone,
                :client_document, :extra1, :extra2, :extra3, :client_ip, :created_at, :updated_at
            )
            ON CONFLICT(ref_payco) DO UPDATE SET
                status_code = excluded.status_code,
                status_name = excluded.status_name,
                response_reason = excluded.response_reason,
                updated_at = excluded.updated_at;';

            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':ref_payco'        => $record['ref_payco'],
                ':transaction_id'   => $record['transaction_id'],
                ':invoice'          => $record['invoice'],
                ':description'      => $record['description'],
                ':amount'           => $record['amount'],
                ':currency'         => $record['currency'],
                ':status_code'      => $record['status_code'],
                ':status_name'      => $record['status_name'],
                ':response_reason'  => $record['response_reason'],
                ':franchise'        => $record['franchise'],
                ':bank_name'        => $record['bank_name'],
                ':approval_code'    => $record['approval_code'],
                ':transaction_date' => $record['transaction_date'],
                ':client_name'      => $record['client']['name'],
                ':client_email'     => $record['client']['email'],
                ':client_phone'     => $record['client']['phone'],
                ':client_document'  => $record['client']['document'],
                ':extra1'           => $record['metadata']['extra1'],
                ':extra2'           => $record['metadata']['extra2'],
                ':extra3'           => $record['metadata']['extra3'],
                ':client_ip'        => $record['client_ip'],
                ':created_at'       => date('c'),
                ':updated_at'       => date('c')
            ]);

        } catch (Throwable $e) {
            $this->logEvent('ERROR', 'Error saving transaction record in SQLite', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Gets a verified transaction from SQLite.
     */
    private function getLocalTransaction(string $refPayco): ?array
    {
        if ($this->pdo === null) {
            return null;
        }

        try {
            $stmt = $this->pdo->prepare('SELECT * FROM epayco_transactions WHERE ref_payco = :ref_payco LIMIT 1');
            $stmt->execute([':ref_payco' => $refPayco]);
            $row = $stmt->fetch();
            return $row ?: null;
        } catch (Throwable $e) {
            return null;
        }
    }

    /**
     * Dispatches notification to downstream webhook (e.g., n8n) if configured.
     */
    private function dispatchToDownstream(array $record): void
    {
        if (empty($this->n8nWebhookUrl)) {
            return;
        }

        $ch = curl_init($this->n8nWebhookUrl);
        if (!$ch) {
            return;
        }

        $payloadJson = json_encode([
            'source'      => 'epayco_webhook',
            'event'       => 'payment_confirmed',
            'transaction' => $record,
            'timestamp'   => date('c')
        ]);

        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payloadJson,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'X-Cambio-Digital-Source: epayco-webhook'
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 4,
            CURLOPT_CONNECTTIMEOUT => 2,
            CURLOPT_SSL_VERIFYPEER => true
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $this->logEvent('INFO', 'Downstream dispatch to n8n completed', [
            'ref_payco' => $record['ref_payco'],
            'http_code' => $httpCode
        ]);
    }

    /**
     * Logs an event safely without sensitive data.
     */
    public function logEvent(string $level, string $message, array $context = []): void
    {
        $sanitizedContext = $this->sanitizeData($context);
        $logEntry = sprintf(
            "[%s] [%s] %s %s\n",
            date('Y-m-d H:i:s'),
            strtoupper($level),
            $message,
            !empty($sanitizedContext) ? json_encode($sanitizedContext, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) : ''
        );

        @file_put_contents($this->logFile, $logEntry, FILE_APPEND | LOCK_EX);
    }

    /**
     * Sanitizes sensitive fields from being logged.
     */
    private function sanitizeData(array $data): array
    {
        $sensitiveKeys = [
            'x_key', 'p_key', 'secret_key', 'password', 'token', 'card', 'cvv', 'pan',
            'x_cardnumber', 'x_cvv', 'x_pin'
        ];

        $cleaned = [];
        foreach ($data as $k => $v) {
            $keyLower = strtolower($k);
            if (in_array($keyLower, $sensitiveKeys, true) || strpos($keyLower, 'key') !== false || strpos($keyLower, 'secret') !== false) {
                $cleaned[$k] = '***REDACTED***';
            } elseif (is_array($v)) {
                $cleaned[$k] = $this->sanitizeData($v);
            } else {
                $cleaned[$k] = $v;
            }
        }
        return $cleaned;
    }

    /**
     * Outputs JSON response with proper HTTP status and headers.
     */
    private function sendJsonResponse(int $httpCode, array $data): void
    {
        if (!headers_sent()) {
            http_response_code($httpCode);
            header('Content-Type: application/json; charset=utf-8');
            header('X-Content-Type-Options: nosniff');
            header('Cache-Control: no-store, no-cache, must-revalidate');
        }
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    /**
     * Ensures required storage directories exist.
     */
    private function ensureDirectories(): void
    {
        if (!is_dir($this->storageDir)) {
            @mkdir($this->storageDir, 0755, true);
        }
        if (!is_dir($this->logsDir)) {
            @mkdir($this->logsDir, 0755, true);
        }
    }

    /**
     * Helper to read environment variables directly from Docker/Dokploy environment.
     */
    private function getEnvVar(array $keys): string
    {
        foreach ($keys as $key) {
            $val = getenv($key);
            if ($val !== false && $val !== '') {
                return (string)$val;
            }
            if (isset($_ENV[$key]) && $_ENV[$key] !== '') {
                return (string)$_ENV[$key];
            }
            if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') {
                return (string)$_SERVER[$key];
            }
        }
        return '';
    }

    /**
     * Optionally loads .env or .env.php file if present (not required in Docker/Dokploy).
     */
    private function loadEnvironment(): void
    {
        if (self::$envLoaded) {
            return;
        }
        self::$envLoaded = true;

        $baseDir = dirname(__DIR__, 3);

        $envPhp = $baseDir . DIRECTORY_SEPARATOR . '.env.php';
        if (file_exists($envPhp)) {
            $loadedVars = @include $envPhp;
            if (is_array($loadedVars)) {
                foreach ($loadedVars as $k => $v) {
                    if (getenv($k) === false) {
                        putenv("$k=$v");
                        $_ENV[$k] = $v;
                        $_SERVER[$k] = $v;
                    }
                }
                return;
            }
        }

        $envFile = $baseDir . DIRECTORY_SEPARATOR . '.env';
        if (file_exists($envFile)) {
            $lines = @file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            if ($lines !== false) {
                foreach ($lines as $line) {
                    $line = trim($line);
                    if ($line === '' || strpos($line, '#') === 0 || strpos($line, '=') === false) {
                        continue;
                    }
                    [$key, $value] = explode('=', $line, 2);
                    $key   = trim($key);
                    $value = trim($value, " \t\n\r\0\x0B\"'");
                    if (getenv($key) === false) {
                        putenv("$key=$value");
                        $_ENV[$key] = $value;
                        $_SERVER[$key] = $value;
                    }
                }
            }
        }
    }

    /**
     * Returns sanitized client IP address.
     */
    private function getClientIp(): string
    {
        $headers = [
            'HTTP_CF_CONNECTING_IP',
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'REMOTE_ADDR'
        ];

        foreach ($headers as $h) {
            if (!empty($_SERVER[$h])) {
                $ips = explode(',', $_SERVER[$h]);
                $ip = trim($ips[0]);
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }

        return '127.0.0.1';
    }
}
