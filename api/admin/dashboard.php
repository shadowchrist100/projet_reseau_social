<?php
header('Content-Type: application/json');
require_once '../../config/database.php';
require_once '../../utils/auth.php';

$admin = verifyAdminToken();
if (!$admin) {
    http_response_code(401);
    echo json_encode(['error' => 'Non autorisé']);
    exit;
}

// Récupération des statistiques
$usersCount = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
$articlesCount = $pdo->query("SELECT COUNT(*) FROM posts")->fetchColumn();
$moderatorsCount = $pdo->query("SELECT COUNT(*) FROM admins WHERE role = 'moderator'")->fetchColumn();

echo json_encode([
    'success' => true,
    'stats' => [
        'users' => $usersCount,
        'articles' => $articlesCount,
        'moderators' => $moderatorsCount
    ]
]);
?>