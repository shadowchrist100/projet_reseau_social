<?php 
    session_start();
    if(isset($_SESSION['unique_id'])){
        include_once "config.php";
        $outgoing_id = $_SESSION['unique_id'];
        $incoming_id = mysqli_real_escape_string($conn, $_POST['incoming_id']);
        $message = mysqli_real_escape_string($conn, $_POST['message']);
        
        if(!empty($message)){
            // Vérifier si la conversation n'est pas bloquée
            $check_blocked = mysqli_query($conn, "SELECT invitation_status FROM messages 
                                                 WHERE (outgoing_msg_id = {$outgoing_id} AND incoming_msg_id = {$incoming_id})
                                                 OR (outgoing_msg_id = {$incoming_id} AND incoming_msg_id = {$outgoing_id})
                                                 AND is_first_message = 1 
                                                 ORDER BY msg_id DESC LIMIT 1");
            
            if(mysqli_num_rows($check_blocked) > 0){
                $blocked_result = mysqli_fetch_assoc($check_blocked);
                if($blocked_result['invitation_status'] == 'declined'){
                    echo "blocked";
                    exit();
                }
            }
            
            // Vérifier s'il s'agit du premier message entre ces deux utilisateurs
            $check_first = mysqli_query($conn, "SELECT COUNT(*) as message_count FROM messages 
                                               WHERE (outgoing_msg_id = {$outgoing_id} AND incoming_msg_id = {$incoming_id})
                                               OR (outgoing_msg_id = {$incoming_id} AND incoming_msg_id = {$outgoing_id})");
            $count_result = mysqli_fetch_assoc($check_first);
            $is_first_message = ($count_result['message_count'] == 0) ? 1 : 0;
            
            $sql = mysqli_query($conn, "INSERT INTO messages (incoming_msg_id, outgoing_msg_id, msg, is_first_message)
                                        VALUES ({$incoming_id}, {$outgoing_id}, '{$message}', {$is_first_message})") or die();
            
            if($sql){
                echo "success";
            }else{
                echo "error";
            }
        }
    }else{
        header("location: ../login.php");
    }
?>