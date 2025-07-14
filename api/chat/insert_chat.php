<?php
session_start();
require_once("../bdd.php");
header('Content-Type: application/json');

if(!isset($_SESSION["LOGGED_USER"])){
    echo json_encode(['success' => false, 'message' => 'Non connecté']);
    exit;
}

if($_SERVER['REQUEST_METHOD'] !== 'POST'){
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if(!isset($input['incoming_id']) || !isset($input['message'])){
    echo json_encode(['success' => false, 'message' => 'Données manquantes']);
    exit;
}

try {
    $outgoing_id = $_SESSION["LOGGED_USER"]["id"];
    $incoming_id = $input['incoming_id'];
    $message = strip_tags($input['message']);
    
    // Insérer le message
    $stmt = $pdo->prepare("INSERT INTO messages (incoming_msg_id, outgoing_msg_id, msg) VALUES (?, ?, ?)");
    $stmt->execute([$incoming_id, $outgoing_id, $message]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Message envoyé'
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur lors de l\'envoi du message'
    ]);
}
?> 