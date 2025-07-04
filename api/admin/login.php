<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/auth.php';
require_once __DIR__ . '/../../utils/security.php';
require_once __DIR__ . '/../../utils/logging.php';
require_once __DIR__ . '/../../utils/jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit();
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        $input = $_POST;
    }
    
    $username = sanitizeInput($input['username'] ?? '');
    $password = $input['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Nom d\'utilisateur et mot de passe requis']);
        exit();
    }
    
    // Vérification des identifiants - adapter à la structure existante
    $stmt = $pdo->prepare("SELECT * FROM admins WHERE (username = ? OR email = ?) AND is_active = 1");
    $stmt->execute([$username, $username]);
    $admin = $stmt->fetch();
    
    if (!$admin || !password_verify($password, $admin['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Identifiants invalides']);
        exit();
    }
    
    // Mise à jour de la dernière connexion
    $stmt = $pdo->prepare("UPDATE admins SET last_login = NOW() WHERE id = ?");
    $stmt->execute([$admin['id']]);
    
    // Génération du token JWT
    $payload = [
        'id' => $admin['id'],
        'username' => $admin['username'] ?? $admin['email'],
        'email' => $admin['email'],
        'role' => $admin['role'],
        'first_name' => $admin['first_name'],
        'last_name' => $admin['last_name']
    ];
    
    $token = generateJWT($payload);
    
    // Log de l'action
    logAdminAction($admin['id'], 'LOGIN', 'Connexion réussie');
    
    echo json_encode([
        'success' => true,
        'token' => $token,
        'admin' => [
            'id' => $admin['id'],
            'username' => $admin['username'] ?? $admin['email'],
            'email' => $admin['email'],
            'role' => $admin['role'],
            'first_name' => $admin['first_name'],
            'last_name' => $admin['last_name'],
            'avatar' => $admin['avatar'] ?? null
        ]
    ]);
    
} catch (Exception $e) {
    error_log('Erreur login admin: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erreur interne du serveur']);
}
?>
