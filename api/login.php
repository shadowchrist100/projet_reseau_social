<?php
    session_start();
    require_once("bdd.php");
    // Définir le type de contenu de la réponse comme JSON
    header('Content-Type: application/json');

    // Récupérer les données de la requête fetch
    $name = $_POST['name'] ?? '';
    $pseudo = $_POST['pseudo'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    // Traitement des données
    $response=[];
    if (isset($name)&&isset($pseudo)&&isset($password)&&isset($email)) 
    {
        $name=strip_tags($name);
        $pseudo=strip_tags($pseudo);
        $email=strip_tags($email);
        // récupération des données dans la base de donnée
        try 
        {
            $req=$pdo->prepare("SELECT * FROM users WHERE nom=:nom");
            $req->execute(["nom"=>$name]);
            $user=$req->fetch(PDO::FETCH_ASSOC);
             
            // si l'utilisateur n'existe pas
            if (!$user) 
            {
                $response['error']="Mot de passe invalid ou email invalid";
            }
            // si l'utilisateur existe 
            else {
                // vérifier le mot de passe
                if (password_verify($password,$user['password_hash'])) 
                {
                    $_SESSION["LOGGED_USER"]=[
                        "name"=>$user["nom"],
                        "prenom"=>$user["prenom"],
                        "email"=>$user["email"],
                        "profile"=>$user["profile_picture"]
                    ];
                }
                else 
                {
                    $response['error']="Mot de passe invalid ou email invalid";
                }
            }
            echo json_encode($response);
        } catch (\Throwable $th) {
            throw $th;
            echo json_encode($th);
        }
    }
?>
