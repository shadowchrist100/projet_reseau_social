<?php
    session_start();
    require_once("bdd.php");
    // Définir le type de contenu de la réponse comme JSON
    header('Content-Type: application/json');   

    $response = [];
    if ($_SERVER["REQUEST_METHOD"]==="POST") 
    {
        // si l'utilisateur n'est pas connecté
        if (!isset($_SESSION["LOGGED_USER"])) 
        {
            http_response_code(401);
            echo json_encode(["error" => "Utilisateur non connecté"]);
            exit;
        }

        // récupération des données 
        $post_id=$_POST["post_id"] ?? "";
        $content=$_POST["comment"] ?? "";

        // si les données ne sont pas vides 
        if (!empty($post_id) && !empty($content)) 
        {
            // formatage des données
            $post_id=strip_tags($post_id);
            $content=strip_tags($content);

            try {
                $req=$pdo->prepare("INSERT INTO comments(user_id,post_id,content) VALUES(:user_id,:post_id,:content)");
                $stmt=$req->execute([
                    "user_id"=>$_SESSION["LOGGED_USER"]["id"],
                    "post_id"=>$post_id,
                    "content"=>$content
                ]);
                if ($stmt) 
                {
                    $response["success"]="Commentaire ajoutée";
                }
                else
                {
                    $response["error"]="Impossible d'ajouter le commentaire";
                }
            } catch (PDOException $e) 
            {
                $response["error"]=$e->getMessage();
            }
        }
        else
        {
            $response["error"]="Données de commentaire vide";
        }
    }
    else
    {
        $response["error"]="Methode de requête invalide";
    }
    echo json_encode($response);
?>
