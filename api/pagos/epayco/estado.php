<?php
/**
 * Cambio Digital - ePayco Transaction Status Verification Endpoint
 * 
 * Target URL:
 * https://cambiodigital.net/api/pagos/epayco/estado?ref_payco=XXXXX
 * 
 * Validates transaction status server-side to avoid browser CORS issues.
 */

declare(strict_types=1);

date_default_timezone_set('America/Bogota');

require_once __DIR__ . '/EpaycoHandler.php';

$handler = new EpaycoHandler();
$handler->handleStatusCheck();
