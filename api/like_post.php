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
        $post_id=$_POST["post_id"] ?? "";
        
        // vérification du contenu envoyé
        if (!empty($post_id)) 
        {
            // formatage des données
            $post_id=strip_tags($post_id);
            try 
            {
                // vérifier si l'utilisateur a déja liké le post
                $req = $pdo->prepare("SELECT user_id FROM likes WHERE post_id = :post_id");
                $req->execute(["post_id" => $post_id]);
                $users = $req->fetchAll(PDO::FETCH_ASSOC);
                $has_liked=in_array($_SESSION["LOGGED_USER"]["id"], array_column($users,"user_id"));
                if ($has_liked) 
                {
                    $req=$pdo->prepare("DELETE  FROM likes WHERE user_id=:user_id AND post_id=:post_id");
                    $req->execute(["user_id"=>$_SESSION["LOGGED_USER"]["id"],"post_id"=>$post_id]);
                    $response["success"]="Like bien supprimé";
                }
                else
                {
                    try 
                    {
                        // enregistrement des données du like dans la table likes
                        $req=$pdo->prepare("INSERT INTO likes(post_id,user_id) VALUES(:post_id,:user_id)");
                        $stmt=$req->execute(["post_id"=>$post_id,"user_id"=>$_SESSION["LOGGED_USER"]["id"]]);
                        if ($stmt) 
                        {
                            $response["success"]="Like bien appliqué";
                        }
                        else
                        {
                            $response["error"]="Impossible d'enregistré le like";
                        }
                    } 
                    catch (PDOException $e) 
                    {
                        $response["error"]=$e->getMessage();
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