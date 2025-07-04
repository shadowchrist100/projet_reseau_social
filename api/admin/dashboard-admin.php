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
    // Vérification des droits administrateur
    $currentUser = Auth::requireRole(ROLE_ADMIN);
    
    // Statistiques générales
    $stats = [];
    
    // Nombre total d'utilisateurs
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM users");
    $stats['total_users'] = $stmt->fetch()['total'];
    
    // Nouveaux utilisateurs cette semaine
    $stmt = $pdo->query("SELECT COUNT(*) as new_users FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
    $stats['new_users'] = $stmt->fetch()['new_users'];
    
    // Nombre total d'articles
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM articles");
    $stats['total_articles'] = $stmt->fetch()['total'];
    
    // Articles publiés aujourd'hui
    $stmt = $pdo->query("SELECT COUNT(*) as today FROM articles WHERE DATE(created_at) = CURDATE()");
    $stats['articles_today'] = $stmt->fetch()['today'];
    
    // Nombre total d'administrateurs et modérateurs
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM admins WHERE is_active = 1");
    $stats['total_admins'] = $stmt->fetch()['total'];
    
    // Administrateurs actifs (connectés dans les 24h)
    $stmt = $pdo->query("SELECT COUNT(*) as active FROM admins WHERE last_login >= DATE_SUB(NOW(), INTERVAL 24 HOUR) AND is_active = 1");
    $stats['active_admins'] = $stmt->fetch()['active'];
    
    // Charge système simulée (en production, utiliser des métriques réelles)
    $stats['system_load'] = rand(15, 45);
    $stats['server_status'] = $stats['system_load'] < 60 ? 'Optimal' : 'Surveillance';
    
    // Métriques avancées
    $metrics = [];
    
    // Taux de croissance (comparaison avec le mois précédent)
    $stmt = $pdo->query("
        SELECT 
            COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as current_month,
            COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as previous_month
        FROM users
    ");
    $growth = $stmt->fetch();
    $metrics['growth_rate'] = $growth['previous_month'] > 0 ? 
        round((($growth['current_month'] - $growth['previous_month']) / $growth['previous_month']) * 100, 1) : 0;
    
    // Taux d'engagement (utilisateurs actifs / total)
    $stmt = $pdo->query("SELECT COUNT(*) as active FROM users WHERE last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
    $activeUsers = $stmt->fetch()['active'];
    $metrics['engagement_rate'] = $stats['total_users'] > 0 ? 
        round(($activeUsers / $stats['total_users']) * 100, 1) : 0;
    
    // Score de sécurité simulé
    $metrics['security_score'] = rand(85, 98);
    
    // Utilisation du stockage simulée
    $metrics['storage_used'] = round(rand(1000, 5000) / 1000, 1) . 'GB';
    
    // Alertes système
    $alerts = [];
    
    // Vérifier les alertes critiques
    if ($stats['system_load'] > 80) {
        $alerts[] = [
            'id' => 1,
            'level' => 'warning',
            'title' => 'Charge système élevée',
            'message' => 'La charge système dépasse 80%. Surveillance recommandée.',
            'created_at' => date('Y-m-d H:i:s'),
            'action_url' => 'system-monitoring.html'
        ];
    }
    
    if ($metrics['security_score'] < 90) {
        $alerts[] = [
            'id' => 2,
            'level' => 'warning',
            'title' => 'Score de sécurité',
            'message' => 'Le score de sécurité est en dessous du seuil recommandé.',
            'created_at' => date('Y-m-d H:i:s'),
            'action_url' => 'security.html'
        ];
    }
    
    // Activité récente
    $recentActivity = [];
    
    // Nouveaux utilisateurs récents
    $stmt = $pdo->prepare("
        SELECT id, username, first_name, last_name, created_at
        FROM users 
        ORDER BY created_at DESC 
        LIMIT 5
    ");
    $stmt->execute();
    $recentActivity['users'] = $stmt->fetchAll();
    
    // Articles récents
    $stmt = $pdo->prepare("
        SELECT a.id, a.title, a.created_at, u.first_name as author_first_name, u.last_name as author_last_name
        FROM articles a 
        JOIN users u ON a.user_id = u.id 
        ORDER BY a.created_at DESC 
        LIMIT 5
    ");
    $stmt->execute();
    $recentActivity['articles'] = $stmt->fetchAll();
    
    // Actions administratives récentes
    $stmt = $pdo->prepare("
        SELECT al.action, al.created_at, a.first_name, a.last_name,
               CONCAT(a.first_name, ' ', a.last_name) as admin_name
        FROM admin_logs al 
        JOIN admins a ON al.admin_id = a.id 
        ORDER BY al.created_at DESC 
        LIMIT 5
    ");
    $stmt->execute();
    $recentActivity['admin_actions'] = $stmt->fetchAll();
    
    // Données pour graphique de plateforme (30 derniers jours)
    $platformData = [];
    for ($i = 29; $i >= 0; $i--) {
        $date = date('Y-m-d', strtotime("-$i days"));
        $dateLabel = date('d/m', strtotime("-$i days"));
        
        // Nouveaux utilisateurs ce jour
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = ?");
        $stmt->execute([$date]);
        $newUsers = $stmt->fetch()['count'];
        
        // Nouveaux articles ce jour
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM articles WHERE DATE(created_at) = ?");
        $stmt->execute([$date]);
        $newArticles = $stmt->fetch()['count'];
        
        $platformData[] = [
            'date' => $dateLabel,
            'users' => $newUsers,
            'articles' => $newArticles
        ];
    }
    
    // Données pour graphique utilisateurs
    $stmt = $pdo->query("SELECT COUNT(*) as active FROM users WHERE is_active = 1 AND last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
    $activeUsers = $stmt->fetch()['active'];
    
    $stmt = $pdo->query("SELECT COUNT(*) as inactive FROM users WHERE is_active = 1 AND (last_login < DATE_SUB(NOW(), INTERVAL 30 DAY) OR last_login IS NULL)");
    $inactiveUsers = $stmt->fetch()['inactive'];
    
    $stmt = $pdo->query("SELECT COUNT(*) as suspended FROM users WHERE is_active = 0");
    $suspendedUsers = $stmt->fetch()['suspended'];
    
    $usersData = [
        'active' => $activeUsers,
        'inactive' => $inactiveUsers,
        'suspended' => $suspendedUsers
    ];
    
    // Logs système récents
    $systemLogs = [];
    
    // Simuler quelques logs système
    $logTypes = ['INFO', 'WARNING', 'ERROR'];
    $logMessages = [
        'INFO' => ['Sauvegarde automatique effectuée', 'Mise à jour de sécurité appliquée', 'Nettoyage des fichiers temporaires'],
        'WARNING' => ['Tentative de connexion suspecte détectée', 'Utilisation mémoire élevée', 'Délai de réponse API augmenté'],
        'ERROR' => ['Erreur de connexion base de données', 'Échec envoi email', 'Erreur traitement image']
    ];
    
    for ($i = 0; $i < 10; $i++) {
        $level = $logTypes[array_rand($logTypes)];
        $message = $logMessages[$level][array_rand($logMessages[$level])];
        
        $systemLogs[] = [
            'level' => $level,
            'message' => $message,
            'created_at' => date('Y-m-d H:i:s', strtotime("-" . rand(1, 1440) . " minutes"))
        ];
    }
    
    // Trier les logs par date
    usort($systemLogs, function($a, $b) {
        return strtotime($b['created_at']) - strtotime($a['created_at']);
    });
    
    echo json_encode([
        'success' => true,
        'stats' => $stats,
        'metrics' => $metrics,
        'alerts' => $alerts,
        'recent_activity' => $recentActivity,
        'platform_data' => $platformData,
        'users_data' => $usersData,
        'system_logs' => $systemLogs
    ]);
    
} catch (Exception $e) {
    Logger::log('ERROR', 'Erreur dashboard admin: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erreur interne du serveur']);
}
?>
