<?php
require_once 'jwt.php';

function verifyAdminToken() {
    if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
        return false;
    }

    $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        return false;
    }

    $token = $matches[1];
    try {
        $decoded = verifyJWT($token);
        return $decoded;
    } catch (Exception $e) {
        return false;
    }
}

function verifyModeratorToken() {
    $admin = verifyAdminToken();
    if (!$admin || ($admin['role'] !== 'moderator' && $admin['role'] !== 'admin')) {
        return false;
    }
    return $admin;
}
?>