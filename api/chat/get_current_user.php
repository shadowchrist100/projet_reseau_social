<?php
session_start();
require_once("../bdd.php");
header('Content-Type: application/json');

if(isset($_SESSION["LOGGED_USER"])){
    $user = $_SESSION["LOGGED_USER"];
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $user['id'],
            'pseudo' => $user['pseudo'],
            'nom' => $user['name'],
            'prenom' => $user['prenom'],
            'email' => $user['email'],
            'profile_picture' => $user['profile']
        ]
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Non connecté'
    ]);
}
?> 