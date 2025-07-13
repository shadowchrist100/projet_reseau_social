-- Ajout de la table messages pour le chat dans la base de données social_network
USE social_network;

-- Table des messages pour le chat
CREATE TABLE
    IF NOT EXISTS `messages` (
        `msg_id` int (11) NOT NULL AUTO_INCREMENT,
        `incoming_msg_id` int (11) NOT NULL,
        `outgoing_msg_id` int (11) NOT NULL,
        `msg` varchar(1000) NOT NULL,
        `is_first_message` tinyint (1) DEFAULT 0,
        `invitation_status` enum ('pending', 'accepted', 'declined') DEFAULT 'pending',
        `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`msg_id`),
        KEY `incoming_msg_id` (`incoming_msg_id`),
        KEY `outgoing_msg_id` (`outgoing_msg_id`),
        KEY `conversation` (`incoming_msg_id`, `outgoing_msg_id`),
        FOREIGN KEY (`incoming_msg_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
        FOREIGN KEY (`outgoing_msg_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Index pour optimiser les performances
CREATE INDEX idx_messages_conversation ON messages (incoming_msg_id, outgoing_msg_id);

CREATE INDEX idx_messages_timestamp ON messages (created_at);

-- Message de confirmation
SELECT
    'Table messages ajoutée avec succès à la base de données social_network!' as message;