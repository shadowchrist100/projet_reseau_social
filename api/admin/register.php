<?php
header('Content-Type: application/json');

// 1. Configuration de la base de données
$host = 'localhost'; // ou votre adresse de serveur
$dbname = 'social_network';
$username = 'root';
$password = '';

// 2. Connexion à la base de données avec PDO
// try {
//     $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
//     $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
// } catch(PDOException $e) {
//       echo json_encode([
//         'success' => false,
//         'message' => 'Erreur de connexion à la base de données',
//         'details' => $e->getMessage()
//     ]);
//     exit;
//     echo json_encode(['success' => false, 'message' => 'Erreur de connexion à la base de données']);
//     exit;
// }
try {
    $conn = new PDO('mysql:host=127.0.0.1;dbname=social_network;charset=utf8',
    'root', '');
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch (PDOException $e) {
    echo "Erreur de connexion : " . $e->getMessage();
    }

// 3. Récupération des données du formulaire
$data = json_decode(file_get_contents('php://input'), true);

// 4. Validation des données
if (empty($data['firstName']) || empty($data['lastName']) || empty($data['username']) || empty($data['email']) || empty($data['password']) || empty($data['role'])) {
    echo json_encode(['success' => false, 'message' => 'Tous les champs sont requis']);
    exit;
}

if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Email invalide']);
    exit;
}

if (strlen($data['password']) < 8) {
    echo json_encode(['success' => false, 'message' => 'Le mot de passe doit contenir au moins 8 caractères']);
    exit;
}

// 5. Vérification si l'email ou le username existe déjà
$stmt = $conn->prepare("SELECT id FROM admins WHERE email = :email OR username = :username");
$stmt->bindParam(':email', $data['email']);
$stmt->bindParam(':username', $data['username']);
$stmt->execute();

if ($stmt->rowCount() > 0) {
    echo json_encode(['success' => false, 'message' => 'Cet email ou ce nom d\'utilisateur est déjà utilisé']);
    exit;
}

// 6. Hashage du mot de passe
$hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

// 7. Insertion dans la base de données
try {
    $stmt = $conn->prepare("INSERT INTO admins (first_name, last_name, username, email, password, role, created_at) 
                           VALUES (:firstName, :lastName, :username, :email, :password, :role, NOW())");
    
    $stmt->bindParam(':firstName', $data['firstName']);
    $stmt->bindParam(':lastName', $data['lastName']);
    $stmt->bindParam(':username', $data['username']);
    $stmt->bindParam(':email', $data['email']);
    $stmt->bindParam(':password', $hashedPassword);
    $stmt->bindParam(':role', $data['role']);
    
    $stmt->execute();
    
    echo json_encode(['success' => true, 'message' => 'Compte administrateur créé avec succès']);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur lors de la création du compte: ' . $e->getMessage()]);
}