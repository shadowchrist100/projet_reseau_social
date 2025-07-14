<?php
    session_start();
    require_once("bdd.php");

    // Définir le type de contenu de la réponse comme JSON
    header('Content-Type: application/json');   

    $response=[];
    if ($_SERVER["REQUEST_METHOD"]==="GET") 
    {
        // si l'utilisateur n'est pas connecté
        if (!isset($_SESSION["LOGGED_USER"])) 
        {
            http_response_code(401);
            echo json_encode(["error" => "Utilisateur non connecté"]);
            exit;
        }
        $post_id=$_GET["post_id"] ?? "";        
        // si les données ne sont pas vides
        if (!empty($post_id)) 
        {
            // formatage des données
            $post_id=strip_tags($post_id);

            try {
                $query = "
                    SELECT 
                        likes.user_id, 
                        users.nom, 
                        users.prenom, 
                        users.pseudo, 
                        users.profile_picture
                    FROM 
                        likes
                    JOIN 
                        users ON likes.user_id = users.id 
                    WHERE 
                        post_id=:post_id";
                $req=$pdo->prepare($query);
                $req->execute(["post_id"=>$post_id]);
                $likes=$req->fetchAll(PDO::FETCH_ASSOC);
                $response["success"]=true;
                $response["likes"]=$likes;
            } catch (PDOException $e) 
            {
                $response["error"]=$e->getMessage();
            }
        }
        else
        {
            $response["error"]="Données vides";
        }
    }
    else
    {
        $response["error"]="Méthode de requête invalide";
    }
    echo json_encode($response);
?>