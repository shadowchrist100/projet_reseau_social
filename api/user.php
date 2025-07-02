<?php
    session_start();
    require_once("bdd.php");
    // Définir le type de contenu de la réponse comme JSON
    header('Content-Type: application/json');

    // Récupérer les données de la requête fetch
    if($_SERVER["REQUEST_METHOD"]==="GET")
    {
        $response=[];
        if (isset($_SESSION["LOGGED_USER"])) 
        {
           $response=$_SESSION["LOGGED_USER"];
        }
        else
        {
            $response["error"]="Utilisateur non connecté";
        }
    }
    echo json_encode($response)
?>
