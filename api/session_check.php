<?php
    session_start();
    header('Content-Type: application/json');


    if (isset($_SESSION["LOGGED_USER"])) 
    {
        echo json_encode(['authenticated'=>true]);
    
    }
    else
    {
        echo json_encode(["autenticated"=>false]);
    }
?>