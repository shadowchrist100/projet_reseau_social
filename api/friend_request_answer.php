<?php
    session_start();
    require_once("bdd.php");
    // Définir le type de contenu de la réponse comme JSON
    header('Content-Type: application/json');   

    $response = [];
    // vérification de la méthode de requête 
    if ($_SERVER["REQUEST_METHOD"]==="GET")
    {
        // si l'utilisateur n'est pas connecté
        if (!isset($_SESSION["LOGGED_USER"])) 
        {
            http_response_code(401);
            echo json_encode(["error" => "Utilisateur non connecté"]);
            exit;
        }
        $user_id=$_GET["user_id"] ?? "";
        $answer=$_GET["ans"] ?? "";
        // vérification du contenu envoyé
        if (!empty($user_id) && !empty($answer)) 
        {
            // formatage des données
            $user_id=strip_tags($user_id);
            $answer=strip_tags($answer);

            // mise à jour de la réponse à accepted ou declined
            $answer=($answer==TRUE)? "accepted": "declined";
            // pour enlever les "" 
                    $user_id = trim($user_id, '');
            try 
            {
                    try 
                    {
                        // enregistrement de la réponse d'ami
                        $req=$pdo->prepare("UPDATE  friendships SET status=:answer WHERE receiver_id=:receiver_id AND  sender_id=:sender_id");
                        $stmt=$req->execute(['answer'=>$answer,'receiver_id'=>$_SESSION["LOGGED_USER"]["id"], 'sender_id'=>$user_id]);
                        if ($stmt) 
                        {
                            $response["success"]=$answer;
                        }
                        else
                        {
                            $response["error"]="Impossible d'ajouter l'ami ";
                        }
                    } 
                    catch (PDOException $e) 
                    {
                        $response["error"]=$e->getMessage();
                    } 
            } catch (PDOException $e) 
            {
                $response["error"]=$e->getMessage();
            }
        }
        else {
            $response["error"]="Données vides";
        }
    }
    else
    {
        $response["error"]="Méthode invalide";
    }
    echo json_encode($response);
?>