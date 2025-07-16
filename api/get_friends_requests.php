<?php
    session_start();
    require_once("bdd.php");
    // Définir le type de contenu de la réponse comme JSON
    header('Content-Type: application/json');

    // Récupérer les données de la requête fetch
    if($_SERVER["REQUEST_METHOD"]==="GET")
    {
        if (!isset($_SESSION["LOGGED_USER"])) 
        {
            http_response_code(401);
            echo json_encode(["error" => "Utilisateur non connecté"]);
            exit;
        }
        $user_id=$_GET["user_id"] ?? "";  
        $response=[];
       // si les données ne sont pas vides
        if (!empty($user_id)) 
        {
            // formatage des données
            $user_id=strip_tags($user_id);

                // récupérer les demandes d'amis envoyés à l'utilisateur
            try {
                $query = "
                    SELECT 
                        users.id,
                        users.nom,
                        users.prenom, 
                        users.pseudo,
                        users.profile_picture
                    FROM 
                        friendships
                    JOIN 
                        users ON 
                        (friendships.receiver_id = :user_id AND friendships.sender_id = users.id)
                    WHERE 
                        status='pending'";
                $req=$pdo->prepare($query);
                $req->execute(["user_id"=>$user_id]);
                $friends_requests=$req->fetchAll(PDO::FETCH_ASSOC);
                if ($friends_requests) 
                {
                    $response["success"]=true;
                    $response["friends_requests"]=$friends_requests;
                }
                else
                {
                    $response["error"]="Aucun requête d'ami  trouvée";
                }
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