<?php 
    session_start();
    if(isset($_SESSION['unique_id'])){
        include_once "config.php";
        $outgoing_id = $_SESSION['unique_id'];
        $incoming_id = mysqli_real_escape_string($conn, $_POST['incoming_id']);
        $output = "";
        
        // Vérifier si la conversation est bloquée
        $check_blocked = mysqli_query($conn, "SELECT invitation_status FROM messages 
                                             WHERE (outgoing_msg_id = {$outgoing_id} AND incoming_msg_id = {$incoming_id})
                                             OR (outgoing_msg_id = {$incoming_id} AND incoming_msg_id = {$outgoing_id})
                                             AND is_first_message = 1 
                                             ORDER BY msg_id DESC LIMIT 1");
        
        $is_blocked = false;
        if(mysqli_num_rows($check_blocked) > 0){
            $blocked_result = mysqli_fetch_assoc($check_blocked);
            if($blocked_result['invitation_status'] == 'declined'){
                $is_blocked = true;
            }
        }
        
        if($is_blocked){
            $output .= '<div class="chat-blocked">
                        <div class="blocked-message">
                            <i class="fas fa-ban"></i>
                            <p>Cette conversation a été bloquée. Vous ne pouvez plus envoyer de messages.</p>
                        </div>
                        </div>';
        }else{
            $sql = "SELECT * FROM messages LEFT JOIN users ON users.pseudo = messages.outgoing_msg_id
                    WHERE (outgoing_msg_id = {$outgoing_id} AND incoming_msg_id = {$incoming_id})
                    OR (outgoing_msg_id = {$incoming_id} AND incoming_msg_id = {$outgoing_id}) ORDER BY msg_id";
            $query = mysqli_query($conn, $sql);
            if(mysqli_num_rows($query) > 0){
                $previous_sender = null;
                $user_image = '';
                
                while($row = mysqli_fetch_assoc($query)){
                    $current_sender = $row['outgoing_msg_id'];
                    
                    if($row['outgoing_msg_id'] === $outgoing_id){
                        // Message sortant (utilisateur actuel)
                        $output .= '<div class="chat outgoing">
                                    <div class="details">
                                        <p>'. $row['msg'] .'</p>
                                    </div>
                                    </div>';
                    }else{
                        // Message entrant (autre utilisateur)
                        $invitation_buttons = '';
                        // Si c'est le premier message et que l'invitation est en attente
                        if($row['is_first_message'] == 1 && $row['invitation_status'] == 'pending'){
                            $invitation_buttons = '<div class="invitation-buttons">
                                                    <button class="btn-accept" onclick="respondToInvitation('.$row['msg_id'].', \'accepted\')">
                                                        <i class="fas fa-check"></i> Accepter
                                                    </button>
                                                    <button class="btn-decline" onclick="respondToInvitation('.$row['msg_id'].', \'declined\')">
                                                        <i class="fas fa-times"></i> Décliner
                                                    </button>
                                                  </div>';
                        }
                        
                        // Afficher l'image seulement si c'est le premier message de cet utilisateur ou si l'expéditeur a changé
                        $show_image = ($previous_sender !== $current_sender);
                        
                        if($show_image){
                            $user_image = '<img src="php/images/'.$row['profile_picture'].'" alt="">';
                        }
                        
                        $output .= '<div class="chat incoming">
                                    '.$user_image.'
                                    <div class="details">
                                        <p>'. $row['msg'] .'</p>
                                        '.$invitation_buttons.'
                                    </div>
                                    </div>';
                        
                        $previous_sender = $current_sender;
                    }
                }
            }else{
                $output .= '<div class="text">No messages are available. Once you send message they will appear here.</div>';
            }
        }
        echo $output;
    }else{
        header("location: ../login.php");
    }
?>