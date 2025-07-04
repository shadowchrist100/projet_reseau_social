<?php
require_once __DIR__ . '/../../config/database.php';

try {
    // Vérifier si la table admins existe
    $stmt = $pdo->query("SHOW TABLES LIKE 'admins'");
    if ($stmt->rowCount() == 0) {
        // Créer la table admins
        $sql = "CREATE TABLE admins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            first_name VARCHAR(50),
            last_name VARCHAR(50),
            role ENUM('admin', 'moderator') DEFAULT 'moderator',
            is_active BOOLEAN DEFAULT TRUE,
            avatar VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            last_login TIMESTAMP NULL
        )";
        
        $pdo->exec($sql);
        echo "Table 'admins' créée avec succès.\n";
        
        // Créer un admin par défaut
        $defaultPassword = password_hash('admin123', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO admins (username, email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute(['admin', 'admin@example.com', $defaultPassword, 'Admin', 'Principal', 'admin']);
        echo "Admin par défaut créé:\n";
        echo "Username: admin\n";
        echo "Password: admin123\n";
        echo "Email: admin@example.com\n";
    } else {
        echo "Table 'admins' existe déjà.\n";
    }
    
    // Vérifier si la table admin_logs existe
    $stmt = $pdo->query("SHOW TABLES LIKE 'admin_logs'");
    if ($stmt->rowCount() == 0) {
        // Créer la table admin_logs
        $sql = "CREATE TABLE admin_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            admin_id INT NOT NULL,
            action VARCHAR(100) NOT NULL,
            details TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
        )";
        
        $pdo->exec($sql);
        echo "Table 'admin_logs' créée avec succès.\n";
    } else {
        echo "Table 'admin_logs' existe déjà.\n";
    }
    
} catch (PDOException $e) {
    echo "Erreur: " . $e->getMessage() . "\n";
}
?> 