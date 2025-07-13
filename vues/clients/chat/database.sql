-- ChatApp Database Schema
-- Création de la base de données pour l'application de chat SPA
-- Créer la base de données
CREATE DATABASE IF NOT EXISTS `chatapp` DEFAULT CHARACTER
SET
    utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `chatapp`;

-- Table des utilisateurs
CREATE TABLE
    `users` (
        `id` int (11) NOT NULL AUTO_INCREMENT,
        `pseudo` int (255) NOT NULL,
        `prenom` varchar(255) NOT NULL,
        `nom` varchar(255) NOT NULL,
        `email` varchar(255) NOT NULL,
        `password_hash` varchar(255) NOT NULL,
        `profile_picture` varchar(255) NOT NULL,
        `status` varchar(255) DEFAULT 'Active now',
        `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        UNIQUE KEY `pseudo` (`pseudo`),
        UNIQUE KEY `email` (`email`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Table des messages
CREATE TABLE
    `messages` (
        `msg_id` int (11) NOT NULL AUTO_INCREMENT,
        `incoming_msg_id` int (255) NOT NULL,
        `outgoing_msg_id` int (255) NOT NULL,
        `msg` varchar(1000) NOT NULL,
        `is_first_message` tinyint (1) DEFAULT 0,
        `invitation_status` enum ('pending', 'accepted', 'declined') DEFAULT 'pending',
        `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`msg_id`),
        KEY `incoming_msg_id` (`incoming_msg_id`),
        KEY `outgoing_msg_id` (`outgoing_msg_id`),
        KEY `conversation` (`incoming_msg_id`, `outgoing_msg_id`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Index pour optimiser les performances
CREATE INDEX idx_messages_conversation ON messages (incoming_msg_id, outgoing_msg_id);

CREATE INDEX idx_messages_timestamp ON messages (created_at);

-- Insérer quelques utilisateurs de test (optionnel)
-- INSERT INTO users (pseudo, prenom, nom, email, password_hash, profile_picture) VALUES
-- (123456789, 'John', 'Doe', 'john@example.com', MD5('password123'), 'default.jpg'),
-- (987654321, 'Jane', 'Smith', 'jane@example.com', MD5('password123'), 'default.jpg');
-- Afficher un message de confirmation
SELECT
    'Base de données ChatApp créée avec succès!' as message;