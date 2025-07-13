<?php
session_start();
require_once("../bdd.php");
header('Content-Type: application/json');

if(!isset($_SESSION["LOGGED_USER"])){
    echo json_encode(['success' => false, 'message' => 'Non connecté']);
    exit;
}

try {
    $current_user_id = $_SESSION["LOGGED_USER"]["id"];
    
    // Récupérer tous les utilisateurs sauf l'utilisateur connecté
    $stmt = $pdo->prepare("SELECT id, pseudo, nom, prenom, email, profile_picture FROM users WHERE id != ? ORDER BY nom, prenom");
    $stmt->execute([$current_user_id]);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'users' => $users
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur lors de la récupération des utilisateurs'
    ]);
}
?> 