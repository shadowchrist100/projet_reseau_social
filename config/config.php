<?php


// 1. Sécurité 
header("X-Frame-Options: DENY");
header("X-Content-Type-Options: nosniff");
header("X-XSS-Protection: 1; mode=block");

// 2. Clé JWT (à générer avec openssl rand -base64 32)
define('JWT_SECRET', 'votre_cle_32_caracteres_ici!!');

// 3. Base de données
define('DB_HOST', 'localhost');
define('DB_NAME', 'social_network');
define('DB_USER', 'root');
define('DB_PASS', '');

// 4. Connexion PDO 
require_once __DIR__ . '/database.php';

// 5. Emails
define('MAIL_FROM', 'no-reply@monsite.com');
define('MAIL_FROM_NAME', 'Réseau Social');
?>