<?php
    session_start();
    require_once("bdd.php");
    // Définir le type de contenu de la réponse comme JSON
    header('Content-Type: application/json');   

    $response = [];
    if ($_SERVER["REQUEST_METHOD"]==="GET") 
    {
        $post_id=$_GET["post_id"];
        if (!empty($post_id)) 
        {
            $post_id=strip_tags($post_id);
            // Requête préparée pour éviter les injections SQL

            try 
            {
                 // Récuperation des commentaires pour le post ainsi que les informations de l'utilisateur ayant posté
                $query = "
                    SELECT 
                        comments.*, 
                        users.nom, 
                        users.prenom, 
                        users.pseudo, 
                        users.profile_picture
                    FROM 
                        comments
                    JOIN 
                        users ON comments.user_id = users.id
                    WHERE 
                        comments.post_id = :post_id
                    ORDER BY 
                        comments.created_at DESC
                ";
                $stmt=$pdo->prepare($query);
                $stmt->execute(["post_id"=>$post_id]);
                $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
                if ($stmt) 
                {
                    $response["success"]=TRUE;
                    $response["comments"]=$comments;
                }
                else
                {
                    $response["error"]="Pas de commentaire trouvée";
                }
                
            } catch (PDOException $e) 
            {
                $response["error"]=$e->getMessage();
            }
        }
        else
        {
            $response["error"]="Post vide";
        }
    }
    else
    {
        $response["error"]="Methode de reqête non autoriséé";
    }
    echo json_encode($response);
?>