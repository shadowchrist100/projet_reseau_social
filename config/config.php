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
define('DB_PASS', 'votre_mdp_mysql');

// 4. Connexion PDO 
try {
    $pdo = new PDO(
        "mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (PDOException $e) {
    die("Erreur DB: " . $e->getMessage());
}

// 5. Emails
define('MAIL_FROM', 'no-reply@monsite.com');
define('MAIL_FROM_NAME', 'Réseau Social');
?>