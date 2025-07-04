<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/auth.php';
require_once __DIR__ . '/../../utils/logging.php';

// Vérification de l'authentification
$currentAdmin = Auth::requireAuth();

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Récupération des utilisateurs avec pagination et filtres
        $page = max(1, intval($_GET['page'] ?? 1));
        $limit = max(1, min(100, intval($_GET['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;
        
        // Construction de la requête avec filtres
        $whereConditions = [];
        $params = [];
        
        if (!empty($_GET['search'])) {
            $search = '%' . $_GET['search'] . '%';
            $whereConditions[] = "(username LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)";
            $params = array_merge($params, [$search, $search, $search, $search]);
        }
        
        if (isset($_GET['status']) && $_GET['status'] !== '') {
            $whereConditions[] = "is_active = ?";
            $params[] = intval($_GET['status']);
        }
        
        if (isset($_GET['verified']) && $_GET['verified'] !== '') {
            $whereConditions[] = "is_verified = ?";
            $params[] = intval($_GET['verified']);
        }
        
        if (!empty($_GET['date'])) {
            switch ($_GET['date']) {
                case 'today':
                    $whereConditions[] = "DATE(created_at) = CURDATE()";
                    break;
                case 'week':
                    $whereConditions[] = "created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
                    break;
                case 'month':
                    $whereConditions[] = "created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
                    break;
            }
        }
        
        $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
        
        // Requête pour compter le total
        $countQuery = "SELECT COUNT(*) as total FROM users $whereClause";
        $stmt = $pdo->prepare($countQuery);
        $stmt->execute($params);
        $total = $stmt->fetch()['total'];
        
        // Requête pour récupérer les utilisateurs
        $query = "SELECT id, username, first_name, last_name, email, avatar, bio, 
                         is_active, is_verified, last_login, created_at 
                  FROM users $whereClause 
                  ORDER BY created_at DESC 
                  LIMIT ? OFFSET ?";
        
        $stmt = $pdo->prepare($query);
        $stmt->execute(array_merge($params, [$limit, $offset]));
        $users = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'users' => $users,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => ceil($total / $limit),
                'total' => $total,
                'per_page' => $limit
            ]
        ]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Modification d'un utilisateur
        $input = json_decode(file_get_contents('php://input'), true);
        $userId = intval($input['id']);
        
        $stmt = $pdo->prepare("
            UPDATE users 
            SET username = ?, email = ?, first_name = ?, last_name = ?, 
                bio = ?, is_active = ?, is_verified = ?, updated_at = NOW()
            WHERE id = ?
        ");
        
        $stmt->execute([
            $input['username'],
            $input['email'],
            $input['first_name'],
            $input['last_name'],
            $input['bio'],
            intval($input['is_active']),
            intval($input['is_verified']),
            $userId
        ]);
        
        Logger::logAdminAction($currentAdmin['id'], 'UPDATE_USER', 'user', $userId, 'Modification utilisateur');
        
        echo json_encode(['success' => true, 'message' => 'Utilisateur modifié avec succès']);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        // Suppression d'un utilisateur
        $input = json_decode(file_get_contents('php://input'), true);
        $userId = intval($input['id']);
        
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        
        Logger::logAdminAction($currentAdmin['id'], 'DELETE_USER', 'user', $userId, 'Suppression utilisateur');
        
        echo json_encode(['success' => true, 'message' => 'Utilisateur supprimé avec succès']);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
        // Actions spécifiques (toggle status, etc.)
        $input = json_decode(file_get_contents('php://input'), true);
        $userId = intval($input['id']);
        $action = $input['action'];
        
        if ($action === 'toggle_status') {
            $stmt = $pdo->prepare("UPDATE users SET is_active = NOT is_active WHERE id = ?");
            $stmt->execute([$userId]);
            
            Logger::logAdminAction($currentAdmin['id'], 'TOGGLE_USER_STATUS', 'user', $userId, 'Changement statut utilisateur');
            
            echo json_encode(['success' => true, 'message' => 'Statut modifié avec succès']);
        }
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Actions en lot
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'];
        $userIds = $input['user_ids'];
        
        if (!is_array($userIds) || empty($userIds)) {
            throw new Exception('IDs utilisateurs invalides');
        }
        
        $placeholders = str_repeat('?,', count($userIds) - 1) . '?';
        
        switch ($action) {
            case 'bulk_activate':
                $stmt = $pdo->prepare("UPDATE users SET is_active = 1 WHERE id IN ($placeholders)");
                $stmt->execute($userIds);
                $actionLog = 'Activation en lot';
                break;
                
            case 'bulk_deactivate':
                $stmt = $pdo->prepare("UPDATE users SET is_active = 0 WHERE id IN ($placeholders)");
                $stmt->execute($userIds);
                $actionLog = 'Désactivation en lot';
                break;
                
            case 'bulk_delete':
                $stmt = $pdo->prepare("DELETE FROM users WHERE id IN ($placeholders)");
                $stmt->execute($userIds);
                $actionLog = 'Suppression en lot';
                break;
                
            default:
                throw new Exception('Action non reconnue');
        }
        
        Logger::logAdminAction($currentAdmin['id'], 'BULK_ACTION', 'user', null, $actionLog . ' - ' . count($userIds) . ' utilisateurs');
        
        echo json_encode(['success' => true, 'message' => 'Action effectuée avec succès']);
    }
    
} catch (Exception $e) {
    Logger::log('ERROR', 'Erreur gestion utilisateurs: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erreur interne du serveur']);
}
?>
