<?php
    session_start();
    $_SESSION["LOGGED_USER"]=null;
    echo json_encode(["success" => true]);
?>
