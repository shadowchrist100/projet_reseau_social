<?php
    session_start();
    require_once("bdd.php");
    // Définir le type de contenu de la réponse comme JSON
    header('Content-Type: application/json');

    // Récupérer les données de la requête fetch
    if($_SERVER["REQUEST_METHOD"]==="GET")
    {
        // si l'utilisateur n'est pas connecté
        if (!isset($_SESSION["LOGGED_USER"])) 
        {
            http_response_code(401);
            echo json_encode(["error" => "Utilisateur non connecté"]);
            exit;
        }
        $user_id=$_GET["user_id"] ?? "";
        if (!empty($user_id)) 
        {
            $user_id=strip_tags($user_id);
            $response=[];
            if ($user_id===$_SESSION["LOGGED_USER"]) 
            {
                $response=$_SESSION["LOGGED_USER"];
            }
            else
            {
                // echo json_encode($user_id);
                // exit;
                try 
                {
                    // pour enlever les "" 
                    $user_id = trim($user_id, '"');
                    $req=$pdo->prepare("SELECT * FROM users WHERE id=:user_id");
                    $req->execute(["user_id"=>$user_id]);
                    $user=$req->fetch(PDO::FETCH_ASSOC);
                    // faire une requête pour savoir l'état de la relation entre l'utilisateur et celui dont on veut voir le profil
                    $req=$pdo->prepare("SELECT status FROM friendships WHERE (sender_id=:me AND receiver_id=:other) OR (sender_id=:other AND receiver_id=:me) LIMIT 1") ;
                    $req->execute(["me"=>$_SESSION["LOGGED_USER"]["id"],"other"=>$user_id]);
                    $status=$req->fetch(PDO::FETCH_ASSOC);
                    $user["status"]=$status["status"] ?? "none";
                    $response["user"]=$user;
                } catch (PDOException $e) 
                {
                    $response["error"]=$e->getMessage();
                }
            }
        }
        else
        {
            $response["error"].="Aucun utilisateur sélectionné";
        }
    }
    else
    {
        $response["error"].="Methode invalide";
    }
    echo json_encode($response)
?>
