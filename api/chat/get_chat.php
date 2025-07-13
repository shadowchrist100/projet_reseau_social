<?php
session_start();
require_once("../bdd.php");
header('Content-Type: application/json');

if(!isset($_SESSION["LOGGED_USER"])){
    echo json_encode(['success' => false, 'message' => 'Non connecté']);
    exit;
}

if(!isset($_GET['outgoing_id']) || !isset($_GET['incoming_id'])){
    echo json_encode(['success' => false, 'message' => 'Paramètres manquants']);
    exit;
}

try {
    $outgoing_id = $_GET['outgoing_id'];
    $incoming_id = $_GET['incoming_id'];
    
    // Récupérer les messages entre les deux utilisateurs
    $stmt = $pdo->prepare("
        SELECT * FROM messages 
        WHERE (outgoing_msg_id = ? AND incoming_msg_id = ?) 
        OR (outgoing_msg_id = ? AND incoming_msg_id = ?) 
        ORDER BY created_at ASC
    ");
    $stmt->execute([$outgoing_id, $incoming_id, $incoming_id, $outgoing_id]);
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'messages' => $messages
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur lors de la récupération des messages'
    ]);
}
?> 