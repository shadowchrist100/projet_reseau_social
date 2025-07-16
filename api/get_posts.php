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
                    p.id AS id,
                    p.content AS content,
                    p.image_path,
                    p.created_at AS created_at,

                    u.id AS user_id,
                    u.nom AS nom,
                    u.prenom AS prenom,
                    u.profile_picture AS profile_picture,

                    c.id AS comment_id,
                    c.content AS comment_content,
                    c.created_at AS comment_created_at,
                    
                    cu.id AS comment_user_id,
                    cu.nom AS comment_nom,
                    cu.prenom AS comment_prenom,
                    cu.profile_picture AS comment_profile

                FROM posts p

                JOIN users u ON p.user_id = u.id

                LEFT JOIN comments c ON c.id = (
                    SELECT id FROM comments
                    WHERE post_id = p.id
                    ORDER BY created_at DESC
                    LIMIT 1
                )

                LEFT JOIN users cu ON c.user_id = cu.id

                ORDER BY p.created_at DESC

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














<?php
// session_start();
// require_once("bdd.php");

// header('Content-Type: application/json');

// $response = [];

// if ($_SERVER["REQUEST_METHOD"] === "GET") {
//     try {
//         // Requête JOIN pour récupérer posts + infos utilisateurs associés
//         $query = "
//             SELECT 
//                 posts.id, posts.message, posts.image, posts.created_at, posts.user_id,
//                 users.pseudo, users.profile
//             FROM posts
//             JOIN users ON users.id = posts.user_id
//             ORDER BY posts.created_at DESC
//         ";

//         $stmt = $pdo->query($query);
//         $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

//         if ($posts) {
//             foreach ($posts as &$post) {
//                 // Regrouper les données utilisateur dans une sous-clé "user"
//                 $post['user'] = [
//                     'id' => $post['user_id'],
//                     'pseudo' => $post['pseudo'],
//                     'profile' => $post['profile']
//                 ];

//                 // Optionnel : retirer les champs redondants
//                 unset($post['pseudo'], $post['profile']);
//             }

//             $response = $posts;
//         } else {
//             $response["error"] = "Aucune publication trouvée";
//         }

//     } catch (Exception $e) {
//         $response["error"] = "Erreur serveur : " . $e->getMessage();
//     }

// } else {
//     $response["error"] = "Méthode de requête non autorisée";
// }

// echo json_encode($response);
?>