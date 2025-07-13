<?php 
    session_start();
    if(isset($_SESSION['unique_id'])){
        include_once "config.php";
        
        if(isset($_POST['msg_id']) && isset($_POST['response'])){
            $msg_id = mysqli_real_escape_string($conn, $_POST['msg_id']);
            $response = mysqli_real_escape_string($conn, $_POST['response']);
            
            // Vérifier que la réponse est valide
            if($response == 'accepted' || $response == 'declined'){
                // Mettre à jour le statut de l'invitation
                $sql = mysqli_query($conn, "UPDATE messages SET invitation_status = '{$response}' WHERE msg_id = {$msg_id}") or die();
                
                if($sql){
                    echo "success";
                }else{
                    echo "error";
                }
            }else{
                echo "invalid_response";
            }
        }else{
            echo "missing_parameters";
        }
    }else{
        header("location: ../login.php");
    }
?> 