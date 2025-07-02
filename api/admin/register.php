<?php
header('Content-Type: application/json');
require_once '../../config/database.php';
require_once '../../utils/validation.php';

$data = json_decode(file_get_contents('php://input'), true);

// Validation
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email invalide']);
    exit;
}

if (strlen($data['password']) < 8) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Le mot de passe doit faire 8 caractères minimum']);
    exit;
}

if (!in_array($data['role'], ['admin', 'moderator'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Rôle invalide']);
    exit;
}

try {
    // Vérifier si l'email existe déjà
    $stmt = $pdo->prepare("SELECT id FROM admins WHERE email = ?");
    $stmt->execute([$data['email']]);
    
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Cet email est déjà utilisé']);
        exit;
    }

    // Hacher le mot de passe
    $hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT);

    // Créer l'admin
    $stmt = $pdo->prepare("INSERT INTO admins (email, password, role) VALUES (?, ?, ?)");
    $stmt->execute([$data['email'], $hashedPassword, $data['role']]);

    // Journalisation
    file_put_contents('../../logs/admin_registrations.log', 
        date('Y-m-d H:i:s') . " - Nouvel admin: " . $data['email'] . " (" . $data['role'] . ")\n", 
        FILE_APPEND);

    echo json_encode(['success' => true, 'message' => 'Compte admin créé avec succès']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur de base de données']);
}
?>