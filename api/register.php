<?php
    session_start();
    require_once("bdd.php");

    // Définir le type de contenu de la réponse comme JSON
    header('Content-Type: application/json');
    
    // récupérer les informations du formulaire provenant de la requête fetch
    $name=$_POST["name"] ?? '';
    $prenom=$_POST["prenom"] ?? '';
    $pseudo = $_POST['pseudo'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $image=$_FILES["image"] ?? '';

    // vérification des informations et insertion dans la bd
    $response=[];
    if (isset($name) && isset($prenom) && isset($pseudo) && isset($email) && isset($password) && isset($image)) 
    {
        if ($image["error"]==0) 
        {
            // échapper les données envoyées du formulaire
            $name=strip_tags($name);
            $prenom=strip_tags($prenom);
            $pseudo=strip_tags($pseudo);
            $email=strip_tags($email);
            $password=password_hash($password,PASSWORD_DEFAULT);

            // vérifier si le pseudo ou l'email n'ont pas déja été utilisé
            $is_pseudo_taken=$is_email_taken=false;
            $request=$pdo->prepare("SELECT * FROM users WHERE email=:email");
            $request->execute(["email"=>$email]);
            $user=$request->fetch(PDO::FETCH_ASSOC);
            $is_email_taken=$user !== false;

            $request=$pdo->prepare("SELECT * FROM users WHERE pseudo=:pseudo");
            $request->execute(["pseudo"=>$pseudo]);
            $user=$request->fetch(PDO::FETCH_ASSOC);
            $is_pseudo_taken=$user !== false;
            $is_credentials_valid=$is_email_taken && $is_pseudo_taken;
            if (!$is_credentials_valid) 
            {
                // vérification de l'extension du fichier
                $file_info=pathinfo($image["name"]);
                $file_extension=$file_info["extension"];
                $extensions_autorisees = array('jpg', 'jpeg', 'gif', 'png','webp','avif');
                $is_extension_valide=(in_array($file_extension,$extensions_autorisees) ? true:false);

                // si l'extension est valide uploader l'image et insérer les infos dans la bd 
                if ($is_extension_valide) 
                {
                    // enregistrement de l'image
                    $file_name=$pseudo."_profile_picture.".$file_extension;
                    
                    // insertion dans la bd si le fichier a bien été enregistré
                    if (move_uploaded_file($image["tmp_name"],"../uploads/".$file_name)) 
                    {
                        try {
                            $req=$pdo->prepare("INSERT INTO users(nom,prenom,pseudo,email,profile_picture,password_hash,role) VALUES (:name,:prenom,:pseudo,:email,:image,:password,:role)");
                            $stmt=$req->execute([
                                "name"=>$name,
                                "prenom"=>$prenom,
                                "pseudo"=>$pseudo,
                                "email"=>$email,
                                "image"=>$file_name,
                                "password"=>$password,
                                "role"=>"user"]);
                        } catch (PDOException $e) 
                        {
                            $response["error"]=$e->getMessage();
                        }
                        if ($stmt) 
                        {
                            $response["success"]="Votre compte a été crée avec success";
                        }
                        else 
                        {
                            $response["error"]="Echec lors de la création du compte";
                        }
                    }
                    else 
                    {
                        $response["error"]="Le fichier n'a pas pu être enregistré";
                    }
                }
                else 
                {
                    $response["error"]="Extension du fichier invalid ".$file_extension;
                }
            }
            else 
            {
               if ($is_email_taken) 
                {
                    $response["error"] = "Email déjà utilisé";
                } 
                elseif ($is_pseudo_taken) 
                {
                    $response["error"] = "Pseudo déjà utilisé";
                } 
                else 
                {
                    $response["success"] = true;
                }

            }   
        }
        else 
        {
            $response["error"]="Erreur de chargement du fichier";
        }
    }
    else
    {
        $response["error"]="Champs invalid";
    }
    echo json_encode($response);
?>
