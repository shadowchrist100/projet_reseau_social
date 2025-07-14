<?php
try {
    $pdo = new PDO('mysql:host=ballast.proxy.rlwy.net;port=55510;dbname=railway;charset=utf8',
    'root', 'MLoGMGGmfEdxkPOMSjbFZxepTAYEpVhs');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch (PDOException $e) {
    echo "Erreur de connexion : " . $e->getMessage();
    }
?>
