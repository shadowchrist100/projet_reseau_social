<?php
session_start();
include_once "config.php";

header('Content-Type: application/json');

if(!isset($_SESSION['unique_id'])){
    echo json_encode([
        'success' => false,
        'message' => 'Non connecté'
    ]);
    exit();
}

if(isset($_GET['user_id'])){
    $user_id = mysqli_real_escape_string($conn, $_GET['user_id']);
    $sql = mysqli_query($conn, "SELECT * FROM users WHERE pseudo = {$user_id}");
    
    if(mysqli_num_rows($sql) > 0){
        $user = mysqli_fetch_assoc($sql);
        echo json_encode([
            'success' => true,
            'user' => $user
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Utilisateur non trouvé'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'ID utilisateur manquant'
    ]);
}
?> 