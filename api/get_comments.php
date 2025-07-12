<?php
    session_start();
    require_once("bdd.php");
    // Définir le type de contenu de la réponse comme JSON
    header('Content-Type: application/json');   

    $response = [];
    if ($_SERVER["REQUEST_METHOD"]==="GET") 
    {
        // Requête préparée pour éviter les injections SQL
        $query = "
                SELECT 
                    comments.*, 
                    users.nom, 
                    users.prenom, 
                    users.pseudo, 
                    users.profile_picture,
                    posts.user_id,
                FROM 
                    comments
                JOIN 
                    users ON comments.user_id = users.id
                ORDER BY 
                    comments.created_at DESC
                WHERE
                    comments.post_id=:post_id
            ";

            $posts = $pdo->query($query)->fetchAll(PDO::FETCH_ASSOC);


        if ($posts) {
            foreach ($posts as $post) 
            {
                // vérifier si l'utilisateur a liké le post
                $req = $pdo->prepare("SELECT user_id FROM likes WHERE post_id = :post_id");
                $req->execute(["post_id" => $post["id"]]);
                $users = $req->fetchAll(PDO::FETCH_ASSOC);
                $post["liked_by_user"] = in_array($_SESSION["LOGGED_USER"]["id"], array_column($users, "user_id"));
                $response[] = $post;
            }
        }
        else
        {
            $response["error"]="Aucune publication trouvée";
        }

    }
    else
    {
        $response["error"]="Methode de reqête non autoriséé";
    }
    echo json_encode($response);
?>