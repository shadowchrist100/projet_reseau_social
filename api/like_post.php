<?php
    session_start();
    require_once("bdd.php");
    // Définir le type de contenu de la réponse comme JSON
    header('Content-Type: application/json');   

    $response = [];
    if ($_SERVER["REQUEST_METHOD"]==="POST")
    {
        if (!isset($_SESSION["LOGGED_USER"])) 
        {
            http_response_code(401);
            echo json_encode(["error" => "Utilisateur non connecté"]);
            exit;
        }
        $post_id=$_POST["post_id"] ?? "";
        $user_id=$_POST["user_id"] ?? "";
        if (!empty($post_id) && !empty($user_id)) 
        {
            $post_id=strip_tags($post_id);
            $user_id=strip_tags($user_id);
            try 
            {
                $req=$pdo->prepare("INSERT INTO likes(post_id,user_id) VALUES(:post_id,:user_id)");
                $stmt=$req->execute(["post_id"=>$post_id,"user_id"=>$user_id]);
                if ($stmt) 
                {
                    $response["success"]="Like bien appliqué";
                    try 
                    {
                        $req=$pdo->querry("SELECT user_id FROM posts WHERE post_id=:post_id ORDER BY DESC");
                        $users=$req->fetchAll(PDO::FETCH_ASSOC);
                    } catch (\Throwable $th) {
                        //throw $th;
                    }
                }
                else
                {
                    $response["error"]="Impossible d'enregistré le like";
                }
            } catch (PDOException $e) {
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