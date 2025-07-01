<?php
    session_start();
    require_once("bdd.php");
    // Définir le type de contenu de la réponse comme JSON
    header('Content-Type: application/json');   

    $response = [];
    if ($_SERVER["REQUEST_METHOD"]==="GET") 
    {
        // Requête préparée pour éviter les injections SQL
        $posts = $pdo->query("SELECT * FROM posts ORDER BY created_at DESC")->fetchAll(PDO::FETCH_ASSOC);


        if ($posts) {
            // Récupère tous les user_id distincts
            $userIds = array_column($posts, 'user_id');
            $placeholders = implode(',', array_fill(0, count($userIds), '?'));
            
            // Requête préparée pour tous les utilisateurs en une fois
            $stmt = $pdo->prepare("SELECT * FROM users WHERE id IN ($placeholders)");
            $stmt->execute($userIds);
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC | PDO::FETCH_GROUP);
            
            // Associe chaque post à son utilisateur
            foreach ($posts as $post) {
                $post['user'] = $users[$post['user_id']][0] ?? null;
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
