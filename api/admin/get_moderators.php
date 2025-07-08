<?php
require_once '../../config/database.php';

try {
    $stmt = $pdo->prepare("SELECT a.id, a.username, a.email, a.created_at
                           FROM admins a
                           WHERE a.role = 'moderator'");
    $stmt->execute();
    $moderators = $stmt->fetchAll();
    echo json_encode(['success' => true, 'moderators' => $moderators]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
