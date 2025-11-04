<?php
/**
 * ===========================================================
 *  Zola AllCare — backend/config.php
 *  Loads settings from zola.env (emails + optional database)
 * ===========================================================
 */

$envPath = dirname(__DIR__) . '/zola.env'; // ← reads your existing file
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Skip comments (lines starting with #)
        if (str_starts_with(trim($line), '#')) continue;

        // Split at the first '='
        [$key, $value] = array_pad(explode('=', $line, 2), 2, '');
        $key = trim($key);
        $value = trim($value);

        if ($key !== '') $_ENV[$key] = $value;
    }
} else {
    // safety fallback
    error_log('⚠️  Missing zola.env file — please create one in the root folder.');
}

/* -----------------------------------------------------------
   EMAIL CONFIGURATION
------------------------------------------------------------ */
define('ZOLA_MAIL_TO',      $_ENV['ZOLA_MAIL_TO']      ?? 'contact@zolacares.com');
define('ZOLA_MAIL_FROM',    $_ENV['ZOLA_MAIL_FROM']    ?? 'no-reply@zolacares.com');
define('ZOLA_MAIL_SUBJECT', $_ENV['ZOLA_MAIL_SUBJECT'] ?? 'New contact from zolacares.com');

/* -----------------------------------------------------------
   DATABASE CONFIGURATION  (optional)
------------------------------------------------------------ */
define('DB_HOST', $_ENV['DB_HOST'] ?? '');
define('DB_NAME', $_ENV['DB_NAME'] ?? '');
define('DB_USER', $_ENV['DB_USER'] ?? '');
define('DB_PASS', $_ENV['DB_PASS'] ?? '');

