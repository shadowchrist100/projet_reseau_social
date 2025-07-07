<?php
// Vérifier si les constantes ne sont pas déjà définies
if (!defined('DB_HOST')) {
    define('DB_HOST', 'localhost');
}
if (!defined('DB_NAME')) {
    define('DB_NAME', 'social_network');
}
if (!defined('DB_USER')) {
    define('DB_USER', 'root');
}
if (!defined('DB_PASS')) {
    define('DB_PASS', '');
}

try {
    $pdo = new PDO(
        "mysql:host=".DB_HOST.";dbname=".DB_NAME,
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (PDOException $e) {
    error_log("Erreur DB: " . $e->getMessage());
    throw new Exception("Erreur de connexion à la base de données");
}
?>