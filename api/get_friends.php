<?php
session_start();
require_once("bdd.php");

header('Content-Type: application/json');   

$response = [];

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    if (!isset($_SESSION["LOGGED_USER"])) {
        http_response_code(401);
        echo json_encode(["error" => "Utilisateur non connecté"]);
        exit;
    }

    $user_id = $_GET["user_id"] ?? "";        

    if (!empty($user_id)) {
        $user_id = strip_tags($user_id);

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
                    users ON (
                        (friendships.receiver_id = users.id AND friendships.sender_id = :user_id) OR
                        (friendships.sender_id = users.id AND friendships.receiver_id = :user_id)
                    )
                WHERE 
                    friendships.status = 'accepted'";
             
           // pour enlever les "" 
                    $user_id = trim($user_id, '"');
            $req = $pdo->prepare($query);
            $req->execute(["user_id" => $user_id]);
            $friends = $req->fetchAll(PDO::FETCH_ASSOC);

            if ($friends) {
                $response["success"] = true;
                $response["friends"] = $friends;
            } else {
                $response["error"] = "Aucun ami trouvé ".$user_id;
            }
        } catch (PDOException $e) {
            $response["error"] = $e->getMessage();
        }
    } else {
        $response["error"] = "Données vides";
    }
} else {
    $response["error"] = "Méthode de requête invalide";
}

echo json_encode($response);
?>
