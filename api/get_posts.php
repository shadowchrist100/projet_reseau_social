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
                    posts.*, 
                    users.nom, 
                    users.prenom, 
                    users.pseudo, 
                    users.profile_picture
                FROM 
                    posts
                JOIN 
                    users ON posts.user_id = users.id
                ORDER BY 
                    posts.created_at DESC
            ";

            $posts = $pdo->query($query)->fetchAll(PDO::FETCH_ASSOC);


        if ($posts) {
            // // Récupère tous les user_id distincts
            // $userIds = array_column($posts, 'user_id');
            // $placeholders = implode(',', array_fill(0, count($userIds), '?'));
            
            // // Requête préparée pour tous les utilisateurs en une fois
            // $stmt = $pdo->prepare("SELECT * FROM users WHERE id IN ($placeholders)");
            // $stmt->execute($userIds);
            // $users = $stmt->fetchAll(PDO::FETCH_ASSOC | PDO::FETCH_GROUP);
            
            // Associe chaque post à son utilisateur
            foreach ($posts as $post) {
                // $post['user'] = $users[$post['user_id']][0] ?? null;
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