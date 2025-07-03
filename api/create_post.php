<?php
    session_start();
    require_once("bdd.php");

    // Définir le type de contenu de la réponse comme JSON
    header('Content-Type: application/json');
    $response=[];
    // récupérer les informations du formulaire provenant de la requête fetch
    if ($_SERVER["REQUEST_METHOD"]==="POST") 
    {
        if (!isset($_SESSION["LOGGED_USER"])) 
        {
            http_response_code(401);
            echo json_encode(["error" => "Utilisateur non connecté"]);
            exit;
        }
        
        $content=$_POST["post_text"] ?? "";
        $image=$_FILES["post_image"] ?? "";
        $file_name="";
        if (!empty($content) || !empty($image)) 
        {
            // échapement des données du formulaire
            $content=strip_tags($content);
            if (!empty($image) && $image["error"]!==4) //pour vérifier si aucun fichier n'est envoyé
            {
                if ($image["error"]===0) 
                {
                    $file_info=pathinfo($image["name"]);
                    $file_extension=$file_info["extension"];
                    
                    $extensions_autorisees = array('jpg', 'jpeg', 'gif', 'png','webp','avif');

                    $is_extension_valide=(in_array($file_extension,$extensions_autorisees) ? true:false);
                    if ($is_extension_valide) 
                    {
                        // enregistrement de l'image
                        
                        $file_name=$_SESSION["LOGGED_USER"]["id"]."_post_picture.".time().".".$file_extension;
                        if (is_uploaded_file($image["tmp_name"])) 
                        {
                            move_uploaded_file($image["tmp_name"],"../uploads/posts/".$file_name);
                        }
                            
                        if (move_uploaded_file($image["tmp_name"],"../uploads/posts/".$file_name)) 
                        {
                            $response["success"]="Stockage du fichier réussie";
                        }  
                        else 
                        {
                            $response["files_error"]="Impossible de stocker le fichier";
                        }
                    }
                    else
                    {
                        $response["files_error"].=" Extension du fichier invalid";
                    }
                }
                else
                {
                    $response["files_error"].="Erreur de chargement du fichier";
                }
            }
            try 
            {
                $req=$pdo->prepare("INSERT INTO posts(user_id,content,image_path) VALUES(:user_id,:content,:image) ");
                $stmt=$req->execute([
                "user_id"=>$_SESSION["LOGGED_USER"]["id"],
                "content"=>$content,
                "image"=>$file_name
                ]);
                if ($stmt) 
                {
                    $response["success"]="Votre publication  a été crée avec success";
                }
                else 
                {
                    $response["error"]="Echec lors de la création de la publication";
                }

            } catch (PDOException $e) 
            {
                $response["error"]=$e->getMessage();
            }
            
        }
        else 
        {
            $response["error"]="Publication vide";
        }
    }
    else
    {
        $response["error"]="Methode invalide";
    }
    $response["post"]=[
        "nom"=>$_SESSION["LOGGED_USER"]["name"],
        "profile_picture"=>$_SESSION["LOGGED_USER"]["profile"],
        "prenom"=>$_SESSION["LOGGED_USER"]["prenom"],
        "created_at"=>"now",
        "content"=>$content,
        "image_path"=>$file_name
    ];
    echo json_encode($response);
    exit;
?>