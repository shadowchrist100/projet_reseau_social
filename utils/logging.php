<?php
require_once 'database.php';

function logAdminAction($adminId, $action, $details = null) {
    global $pdo;
    
    $stmt = $pdo->prepare("INSERT INTO admin_logs (admin_id, action, details) VALUES (?, ?, ?)");
    $stmt->execute([$adminId, $action, $details]);
}
?>