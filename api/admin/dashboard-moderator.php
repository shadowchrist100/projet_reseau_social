<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/auth.php';
require_once __DIR__ . '/../../utils/logging.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit();
}

try {
    // Vérification de l'authentification (modérateur ou admin)
    $currentUser = Auth::requireAuth();
    
    if (!in_array($currentUser['role'], [ROLE_MODERATOR, ROLE_ADMIN])) {
        http_response_code(403);
        echo json_encode(['error' => 'Accès refusé - Droits de modération requis']);
        exit();
    }
    
    // Statistiques de modération
    $stats = [];
    
    // Signalements total et en attente
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM reports");
    $stats['total_reports'] = $stmt->fetch()['total'];
    
    $stmt = $pdo->query("SELECT COUNT(*) as pending FROM reports WHERE status = 'pending'");
    $stats['pending_reports'] = $stmt->fetch()['pending'];
    
    // Articles modérés par ce modérateur
    $stmt = $pdo->prepare("SELECT COUNT(*) as moderated FROM moderation_actions WHERE moderator_id = ? AND action_type = 'moderate_article'");
    $stmt->execute([$currentUser['id']]);
    $stats['moderated_articles'] = $stmt->fetch()['moderated'];
    
    // Articles modérés cette semaine
    $stmt = $pdo->prepare("SELECT COUNT(*) as this_week FROM moderation_actions WHERE moderator_id = ? AND action_type = 'moderate_article' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
    $stmt->execute([$currentUser['id']]);
    $stats['articles_this_week'] = $stmt->fetch()['this_week'];
    
    // Utilisateurs suspendus
    $stmt = $pdo->query("SELECT COUNT(*) as suspended FROM users WHERE is_active = 0");
    $stats['suspended_users'] = $stmt->fetch()['suspended'];
    
    // Suspensions aujourd'hui
    $stmt = $pdo->query("SELECT COUNT(*) as today FROM moderation_actions WHERE action_type = 'suspend_user' AND DATE(created_at) = CURDATE()");
    $stats['suspensions_today'] = $stmt->fetch()['today'];
    
    // Signalements résolus ce mois
    $stmt = $pdo->query("SELECT COUNT(*) as resolved FROM reports WHERE status = 'resolved' AND MONTH(updated_at) = MONTH(NOW())");
    $stats['resolved_reports'] = $stmt->fetch()['resolved'];
    
    // Compteurs pour actions rapides
    $quickActions = [];
    
    // Signalements urgents (priorité haute)
    $stmt = $pdo->query("SELECT COUNT(*) as urgent FROM reports WHERE status = 'pending' AND priority = 'high'");
    $quickActions['urgent_reports'] = $stmt->fetch()['urgent'];
    
    // Articles signalés
    $stmt = $pdo->query("SELECT COUNT(DISTINCT article_id) as reported FROM reports WHERE target_type = 'article' AND status = 'pending'");
    $quickActions['reported_articles'] = $stmt->fetch()['reported'];
    
    // Utilisateurs suspects (plusieurs signalements)
    $stmt = $pdo->query("SELECT COUNT(DISTINCT target_id) as suspicious FROM reports WHERE target_type = 'user' AND status = 'pending' GROUP BY target_id HAVING COUNT(*) >= 3");
    $quickActions['suspicious_users'] = $stmt->rowCount();
    
    // Signalements récents
    $stmt = $pdo->prepare("
        SELECT r.*, u.first_name as reporter_name, 
               CASE 
                   WHEN r.target_type = 'article' THEN a.title
                   WHEN r.target_type = 'user' THEN CONCAT(tu.first_name, ' ', tu.last_name)
                   ELSE r.target_type
               END as reported_content
        FROM reports r
        LEFT JOIN users u ON r.reporter_id = u.id
        LEFT JOIN articles a ON r.target_type = 'article' AND r.target_id = a.id
        LEFT JOIN users tu ON r.target_type = 'user' AND r.target_id = tu.id
        WHERE r.status = 'pending'
        ORDER BY r.created_at DESC
        LIMIT 10
    ");
    $stmt->execute();
    $recentReports = $stmt->fetchAll();
    
    // Articles à modérer
    $stmt = $pdo->prepare("
        SELECT a.*, u.first_name as author_first_name, u.last_name as author_last_name,
               COUNT(r.id) as reports_count
        FROM articles a
        JOIN users u ON a.user_id = u.id
        LEFT JOIN reports r ON r.target_type = 'article' AND r.target_id = a.id AND r.status = 'pending'
        WHERE a.is_published = 1
        GROUP BY a.id
        HAVING reports_count > 0 OR a.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ORDER BY reports_count DESC, a.created_at DESC
        LIMIT 10
    ");
    $stmt->execute();
    $articlesToModerate = $stmt->fetchAll();
    
    // Activité de modération (7 derniers jours)
    $moderationActivity = [];
    for ($i = 6; $i >= 0; $i--) {
        $date = date('Y-m-d', strtotime("-$i days"));
        $dateLabel = date('d/m', strtotime("-$i days"));
        
        // Signalements traités ce jour
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM reports WHERE DATE(updated_at) = ? AND status != 'pending'");
        $stmt->execute([$date]);
        $reportsHandled = $stmt->fetch()['count'];
        
        // Articles modérés ce jour
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM moderation_actions WHERE DATE(created_at) = ? AND action_type = 'moderate_article'");
        $stmt->execute([$date]);
        $articlesModerated = $stmt->fetch()['count'];
        
        // Utilisateurs suspendus ce jour
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM moderation_actions WHERE DATE(created_at) = ? AND action_type = 'suspend_user'");
        $stmt->execute([$date]);
        $usersSuspended = $stmt->fetch()['count'];
        
        $moderationActivity[] = [
            'date' => $dateLabel,
            'reports_handled' => $reportsHandled,
            'articles_moderated' => $articlesModerated,
            'users_suspended' => $usersSuspended
        ];
    }
    
    // Mes actions récentes
    $stmt = $pdo->prepare("
        SELECT action_type as action, details, created_at
        FROM moderation_actions
        WHERE moderator_id = ?
        ORDER BY created_at DESC
        LIMIT 10
    ");
    $stmt->execute([$currentUser['id']]);
    $myActions = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'stats' => $stats,
        'quick_actions' => $quickActions,
        'recent_reports' => $recentReports,
        'articles_to_moderate' => $articlesToModerate,
        'moderation_activity' => $moderationActivity,
        'my_actions' => $myActions
    ]);
    
} catch (Exception $e) {
    Logger::log('ERROR', 'Erreur dashboard modérateur: ' . $e->getMessage());
    http_response_code(
    Logger::log('ERROR', 'Erreur dashboard modérateur: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erreur interne du serveur']);
}
?>
