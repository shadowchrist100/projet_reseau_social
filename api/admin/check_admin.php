<?php
require_once __DIR__ . '/../../config/config.php';

try {
    $stmt = $pdo->query("SELECT id, username, email, role, is_active FROM admins");
    $admins = $stmt->fetchAll();
    
    if (empty($admins)) {
        echo "Aucun administrateur trouvé dans la base de données.\n";
        echo "Création d'un admin par défaut...\n";
        
        $defaultPassword = password_hash('admin123', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO admins (username, email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute(['admin', 'admin@example.com', $defaultPassword, 'Admin', 'Principal', 'admin']);
        
        echo "Admin par défaut créé:\n";
        echo "Username: admin\n";
        echo "Password: admin123\n";
        echo "Email: admin@example.com\n";
    } else {
        echo "Administrateurs trouvés:\n";
        foreach ($admins as $admin) {
            echo "- ID: {$admin['id']}, Username: {$admin['username']}, Email: {$admin['email']}, Role: {$admin['role']}, Actif: " . ($admin['is_active'] ? 'Oui' : 'Non') . "\n";
        }
    }
    
} catch (Exception $e) {
    echo "Erreur: " . $e->getMessage() . "\n";
}
?> 