<?php
/**
 * Cambio Digital - ePayco Webhook Confirmation Endpoint
 * 
 * Target URL for ePayco server-to-server confirmation:
 * https://cambiodigital.net/api/pagos/epayco/confirmacion
 */

declare(strict_types=1);

// Prevent direct script execution issues and set timezone
date_default_timezone_set('America/Bogota');

require_once __DIR__ . '/EpaycoHandler.php';

$handler = new EpaycoHandler();
$handler->handleRequest();
