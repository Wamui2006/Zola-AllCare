<?php
// backend/contact.php
declare(strict_types=1);
require_once __DIR__ . '/config.php';

// Basic helper
function val(string $key): string {
  return trim($_POST[$key] ?? '');
}

// Honeypot (basic bot trap)
if (!empty($_POST['website'])) {
  http_response_code(400);
  exit('Bad request');
}

// Validate required fields
$first   = val('first_name');
$last    = val('last_name');
$email   = val('email');
$service = val('service');
$message = val('message');
$phone   = val('phone');
$pref    = val('pref_contact');
$agree   = isset($_POST['consent']);
$subsidiary = val('subsidiary');       // from URL prefill (e.g., ZTalk, ZSpace, etc.)
$svcsel     = val('service_selected'); // from URL prefill (e.g., Adults, Workspace, etc.)

$errors = [];
if ($first === '')     $errors[] = 'first_name';
if ($last === '')      $errors[] = 'last_name';
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'email';
if ($service === '')   $errors[] = 'service';
if ($message === '')   $errors[] = 'message';
if (!$agree)           $errors[] = 'consent';

if (!empty($errors)) {
  http_response_code(422);
  // fallback for noscript: show a simple message
  echo 'Please complete all required fields.';
  exit;
}

// Optional: Save to DB if credentials provided
if (DB_HOST && DB_NAME && DB_USER) {
  try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    $pdo->exec("
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        email VARCHAR(150),
        phone VARCHAR(60),
        service VARCHAR(120),
        pref_contact VARCHAR(40),
        message TEXT,
        subsidiary VARCHAR(60),
        service_selected VARCHAR(120),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
    $stmt = $pdo->prepare("
      INSERT INTO contact_messages
      (first_name,last_name,email,phone,service,pref_contact,message,subsidiary,service_selected)
      VALUES (?,?,?,?,?,?,?,?,?)
    ");
    $stmt->execute([$first,$last,$email,$phone,$service,$pref,$message,$subsidiary,$svcsel]);
  } catch (Throwable $e) {
    // Log in real app; don’t block the user on DB errors
    // error_log($e->getMessage());
  }
}

// Email content
$subject = ZOLA_MAIL_SUBJECT;
$body = "New contact submission from zolacares.com\n\n"
      . "Name: {$first} {$last}\n"
      . "Email: {$email}\n"
      . "Phone: {$phone}\n"
      . "Service: {$service}\n"
      . "Preferred Contact: {$pref}\n"
      . "Subsidiary (prefill): {$subsidiary}\n"
      . "Service Selected (prefill): {$svcsel}\n"
      . "Message:\n{$message}\n";

$headers = [];
$headers[] = "From: " . ZOLA_MAIL_FROM;
$headers[] = "Reply-To: " . $email;
$headers[] = "MIME-Version: 1.0";
$headers[] = "Content-Type: text/plain; charset=UTF-8";

@mail(ZOLA_MAIL_TO, $subject, $body, implode("\r\n", $headers));

// Soft redirect to thank-you page
header('Location: /thank-you.html');
exit;
