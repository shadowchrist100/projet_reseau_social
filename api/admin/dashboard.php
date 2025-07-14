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
    // Vérification de l'authentification
    $currentAdmin = Auth::requireAuth();
    
    // Statistiques générales - adapter à la structure existante
    $stats = [];
    
    // Nombre total d'utilisateurs
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM users");
    $stats['total_users'] = $stmt->fetch()['total'];
    
    // Utilisateurs actifs (connectés dans les 30 derniers jours)
    $stmt = $pdo->query("SELECT COUNT(*) as active FROM users WHERE last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
    $stats['active_users'] = $stmt->fetch()['active'];
    
    // Nouveaux utilisateurs (inscrits dans les 7 derniers jours)
    $stmt = $pdo->query("SELECT COUNT(*) as new_users FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
    $stats['new_users'] = $stmt->fetch()['new_users'];
    
    // Nombre total de posts (utiliser posts au lieu d'articles)
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM posts");
    $stats['total_articles'] = $stmt->fetch()['total'];
    
    // Posts publiés aujourd'hui
    $stmt = $pdo->query("SELECT COUNT(*) as today FROM posts WHERE DATE(created_at) = CURDATE()");
    $stats['articles_today'] = $stmt->fetch()['today'];
    
    // Nombre d'administrateurs
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM admins WHERE is_active = 1");
    $stats['total_admins'] = $stmt->fetch()['total'];
    
    // Répartition par rôle
    $stmt = $pdo->query("SELECT role, COUNT(*) as count FROM admins WHERE is_active = 1 GROUP BY role");
    $roleStats = [];
    while ($row = $stmt->fetch()) {
        $roleStats[$row['role']] = $row['count'];
    }
    $stats['admin_roles'] = $roleStats;
    
    // Activité récente (derniers posts)
    $stmt = $pdo->prepare("
        SELECT p.id, p.content as title, p.created_at, u.first_name, u.last_name, u.username
        FROM posts p 
        JOIN users u ON p.user_id = u.id 
        ORDER BY p.created_at DESC 
        LIMIT 10
    ");
    $stmt->execute();
    $recentArticles = $stmt->fetchAll();
    
    // Utilisateurs récents
    $stmt = $pdo->prepare("
        SELECT id, username, first_name, last_name, email, created_at, is_active 
        FROM users 
        ORDER BY created_at DESC 
        LIMIT 10
    ");
    $stmt->execute();
    $recentUsers = $stmt->fetchAll();
    
    // Statistiques par mois (6 derniers mois)
    $monthlyStats = [];
    for ($i = 5; $i >= 0; $i--) {
        $month = date('Y-m', strtotime("-$i months"));
        $monthName = date('M Y', strtotime("-$i months"));
        
        // Nouveaux utilisateurs ce mois
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM users WHERE DATE_FORMAT(created_at, '%Y-%m') = ?");
        $stmt->execute([$month]);
        $newUsers = $stmt->fetch()['count'];
        
        // Nouveaux posts ce mois
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM posts WHERE DATE_FORMAT(created_at, '%Y-%m') = ?");
        $stmt->execute([$month]);
        $newArticles = $stmt->fetch()['count'];
        
        $monthlyStats[] = [
            'month' => $monthName,
            'users' => $newUsers,
            'articles' => $newArticles
        ];
    }
    
    // Logs récents d'administration
    $recentLogs = Logger::getAdminLogs(20);
    
    echo json_encode([
        'success' => true,
        'stats' => $stats,
        'recent_articles' => $recentArticles,
        'recent_users' => $recentUsers,
        'monthly_stats' => $monthlyStats,
        'recent_logs' => $recentLogs
    ]);
    
} catch (Exception $e) {
    Logger::log('ERROR', 'Erreur dashboard: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erreur interne du serveur']);
}
?>
