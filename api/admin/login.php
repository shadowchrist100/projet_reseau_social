<?php
header('Content-Type: application/json');
error_reporting(0); // Désactive l'affichage des erreurs

try {
    // Vérification méthode POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Méthode non autorisée', 405);
    }

    // Récupération des données JSON
    $input = json_decode(file_get_contents('php://input'), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Format de données invalide', 400);
    }

    // Validation des données
    if (empty($input['email']) || empty($input['password'])) {
        throw new Exception('Email et mot de passe requis', 400);
    }

    // Connexion DB (adaptez à votre configuration)
    require_once '../../config/database.php';
    
    // Requête préparée
    $stmt = $pdo->prepare("SELECT id, password, role FROM admins WHERE email = ? LIMIT 1");
    $stmt->execute([$input['email']]);
    $admin = $stmt->fetch();

    // Vérification mot de passe
    if (!$admin || !password_verify($input['password'], $admin['password'])) {
        throw new Exception('Identifiants incorrects', 401);
    }

    // Réponse succès
    echo json_encode([
        'success' => true,
        'token' => base64_encode(json_encode([
            'id' => $admin['id'],
            'role' => $admin['role'],
            'exp' => time() + 3600
        ])),
        'role' => $admin['role']
    ]);

} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>