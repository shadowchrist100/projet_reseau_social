<?php
    session_start();
    header('Content-Type: application/json');


    if (isset($_SESSION["LOGGED_USER"])) 
    {
        echo json_encode(['authenticated'=>true,
                            'role'=>$_SESSION["LOGGED_USER"]["role"]]);
    }
    else
    {
        echo json_encode(["autenticated"=>false]);
    }
?>