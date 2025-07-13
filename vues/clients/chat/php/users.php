<?php
    session_start();
    include_once "config.php";
    
    // Vérifier si la session est active
    if(!isset($_SESSION['unique_id'])){
        echo "Session non valide";
        exit();
    }
    
    $outgoing_id = $_SESSION['unique_id'];
    $sql = "SELECT * FROM users WHERE NOT pseudo = {$outgoing_id} ORDER BY id DESC";
    $query = mysqli_query($conn, $sql);
    $output = "";
    if(mysqli_num_rows($query) == 0){
        $output .= "No users are available to chat";
    }elseif(mysqli_num_rows($query) > 0){
        include_once "data.php";
    }
    echo $output;
?>