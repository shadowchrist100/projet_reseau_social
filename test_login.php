<?php
// Test simple de l'API login admin
$url = 'http://localhost/projet_reseau_social/api/admin/login.php';

$data = [
    'username' => 'admin',
    'password' => 'admin123'
];

$options = [
    'http' => [
        'header' => "Content-type: application/json\r\n",
        'method' => 'POST',
        'content' => json_encode($data)
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

echo "Réponse de l'API:\n";
echo $result . "\n";

if ($result === false) {
    echo "Erreur lors de l'appel à l'API\n";
}
?> 