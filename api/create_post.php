<?php
    session_start();
    require_once("bdd.php");

    // Définir le type de contenu de la réponse comme JSON
    header('Content-Type: application/json');
    
    // récupérer les informations du formulaire provenant de la requête fetch
    if ($_SERVER["REQUEST_METHOD"]==="POST") 
    {
        $content=$_POST["post_text"] ?? "";
        $image=$_FILES["post_image"] ?? "";
        $response=[];
        if (!empty($content) || !empty($image)) 
        {
            // échapement des données du formulaire
            $content=strip_tags($content);
            if (!empty($image)) 
            {
                if ($image["error"]==0) 
                {
                    $file_info=pathinfo($image["name"]);
                    $file_extension=$file_info["extension"];
                    $extensions_autorisees = array('jpg', 'jpeg', 'gif', 'png');
                    $is_extension_valide=(in_array($file_extension,$extensions_autorisees) ? true:false);
                    if ($is_extension_valide) 
                    {
                        // enregistrement de l'image
                        $file_name=$_SESSION["LOGGED_USER"]["id"]."_post_picture.".time().$file_extension;
                        
                        if (move_uploaded_file($image["tmp_name"],"../uploads/posts/".$file_name)) 
                        {
                            $response["success"]="Stockage du fichier réussie";
                        }  
                        else 
                        {
                            $response["error"]="Impossible de stocker le fichier";
                        }
                    }
                    else
                    {
                        $response["error"]="Extension du fichier invalid";
                    }
                }
                else
                {
                    $response["error"]="Erreur de chargement du fichier";
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

            } catch (PDOECXCEPTION $e) 
            {
                $response["error"]=$e->getMessage();
            }
            if ($stmt) 
            {
                $response["success"]="Votre publication  a été crée avec success";
            }
            else 
            {
                $response["error"]="Echec lors de la création de la publication";
            }
            
        }
        else 
        {
            $response["error"]="Publication vide";
        }
        echo json_encode($response);
    }
?>