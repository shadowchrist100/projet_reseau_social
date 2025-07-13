-- Script de nettoyage : Suppression de la base de données chatapp indépendante
-- Ce script supprime la base de données chatapp qui n'est plus nécessaire
-- car le chat est maintenant intégré dans la base de données social_network
-- Supprimer la base de données chatapp si elle existe
DROP DATABASE IF EXISTS `chatapp`;

-- Message de confirmation
SELECT
    'Base de données chatapp supprimée avec succès!' as message;