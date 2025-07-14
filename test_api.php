<?php
// Test simple de l'API
echo "Test de l'API login admin...\n";

// Simuler une requête POST
$_SERVER['REQUEST_METHOD'] = 'POST';
$_POST = [
    'username' => 'admin',
    'password' => 'admin123'
];

// Capturer la sortie sans headers
ob_start();
// Désactiver temporairement les headers
$original_headers = headers_list();
if (function_exists('header_remove')) {
    header_remove();
}

include 'api/admin/login.php';
$output = ob_get_clean();

echo "Réponse de l'API:\n";
echo $output . "\n";

// Vérifier si c'est du JSON valide
$decoded = json_decode($output, true);
if (json_last_error() === JSON_ERROR_NONE) {
    echo "✅ Réponse JSON valide\n";
    print_r($decoded);
} else {
    echo "❌ Erreur JSON: " . json_last_error_msg() . "\n";
}
?> 