<?php
    // Vérifier si la session est active et si unique_id existe
    if(!isset($_SESSION['unique_id'])){
        echo "Session non valide";
        exit();
    }
    
    $outgoing_id = $_SESSION['unique_id'];
    
    while($row = mysqli_fetch_assoc($query)){
        $sql2 = "SELECT * FROM messages WHERE (incoming_msg_id = {$row['pseudo']}
                OR outgoing_msg_id = {$row['pseudo']}) AND (outgoing_msg_id = {$outgoing_id} 
                OR incoming_msg_id = {$outgoing_id}) ORDER BY msg_id DESC LIMIT 1";
        $query2 = mysqli_query($conn, $sql2);
        $row2 = mysqli_fetch_assoc($query2);
        (mysqli_num_rows($query2) > 0) ? $result = $row2['msg'] : $result ="No message available";
        (strlen($result) > 28) ? $msg =  substr($result, 0, 28) . '...' : $msg = $result;
        if(isset($row2['outgoing_msg_id'])){
            ($outgoing_id == $row2['outgoing_msg_id']) ? $you = "You: " : $you = "";
        }else{
            $you = "";
        }
        ($outgoing_id == $row['pseudo']) ? $hid_me = "hide" : $hid_me = "";

        $output .= '<a href="chat.php?user_id='. $row['pseudo'] .'">
                    <div class="content">
                    <img src="php/images/'. $row['profile_picture'] .'" alt="">
                    <div class="details">
                        <span>'. $row['prenom']. " " . $row['nom'] .'</span>
                        <p>'. $you . $msg .'</p>
                    </div>
                    </div>
                    <div class="status-dot"><i class="fas fa-circle"></i></div>
                </a>';
    }
?>