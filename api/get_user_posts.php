<?php
    session_start();
    require_once("bdd.php");
    // Définir le type de contenu de la réponse comme JSON
    header('Content-Type: application/json');   

    $response = [];
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
        if (!empty($user_id)) 
        {
            $user_id=strip_tags($user_id);
            try 
            {
                // pour enlever les "" 
                $user_id = trim($user_id, '"');
                
                // Requête préparée pour éviter les injections SQL
                $query = "
                        SELECT 
                            posts.*, 
                            users.nom, 
                            users.prenom, 
                            users.pseudo, 
                            users.profile_picture
                        FROM 
                            posts
                        JOIN 
                            users ON posts.user_id = users.id
                        WHERE 
                            posts.user_id = :user_id
                        ORDER BY 
                            posts.created_at DESC
                    ";

                $req = $pdo->prepare($query);
                $req->execute(["user_id"=>$user_id]);
                $posts = $req->fetchAll(PDO::FETCH_ASSOC);

                if ($posts) 
                {
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
            } catch (PDOException $e) 
                {
                    $response["error"].=$e->getMessage();
                }
            
        }
        

    }
    else
    {
        $response["error"].="Methode de reqête non autoriséé";
    }
    echo json_encode($response);
?>