<?php
    session_start();
    require_once("bdd.php");
    // Définir le type de contenu de la réponse comme JSON
    header('Content-Type: application/json');   

    $response = [];
    // vérification de la méthode de requête 
    if ($_SERVER["REQUEST_METHOD"]==="POST")
    {
        // si l'utilisateur n'est pas connecté
        if (!isset($_SESSION["LOGGED_USER"])) 
        {
            http_response_code(401);
            echo json_encode(["error" => "Utilisateur non connecté"]);
            exit;
        }
        $user_id=$_POST["user_id"] ?? "";
        
        // vérification du contenu envoyé
        if (!empty($user_id)) 
        {
            // formatage des données
            $user_id=strip_tags($user_id);
            try 
            {
                // vérifier si l'utilisateur a déja envoyé une invitation à l'autre ou vice versa 
                $req= $pdo->prepare("
                    SELECT * FROM friendships 
                    WHERE 
                    (sender_id = :me AND receiver_id = :other) 
                    OR 
                    (sender_id = :other AND receiver_id = :me)
                ");
                $req->execute(["me"=>$_SESSION["LOGGED_USER"]["id"],"other"=>$user_id]);
                // si la requête renvoi des valeurs alors une demande existe déja
                if ($req->fetch()) 
                {
                    $response["error"]="Demande déja existante";
                }
                else
                {
                    try 
                    {
                        // enregistrement des données de la demande dans la table friendships
                        $req=$pdo->prepare("INSERT INTO friendships(sender_id,receiver_id,status) VALUES(:me,other,:status)");
                        $stmt=$req->execute(["me"=>$_SESSION["LOGGED_USER"]["id"],"other"=>$user_id,"status"=>"pending"]);

                        if ($stmt) 
                        {
                            $response["success"]="Demande bien ajouté";
                        }
                        else
                        {
                            $response["error"]="Impossible d'ajouter la demande";
                        }
                    } catch (PDOException $e) 
                    {
                        $response["error"]=$e>getMessage();
                    }
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