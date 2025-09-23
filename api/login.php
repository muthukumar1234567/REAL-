<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once 'config.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

// Get input data
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['email']) || !isset($input['password'])) {
    sendError('Email and password are required');
}

$email = trim($input['email']);
$password = $input['password'];

// Validate input
if (empty($email) || empty($password)) {
    sendError('Email and password cannot be empty');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendError('Invalid email format');
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Prepare query
    $query = "SELECT id, first_name, last_name, email, phone, password FROM users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    
    $user = $stmt->fetch();
    
    if (!$user) {
        sendError('Invalid email or password');
    }
    
    // Verify password
    if (!password_verify($password, $user['password'])) {
        sendError('Invalid email or password');
    }
    
    // Remove password from user data
    unset($user['password']);
    
    // Generate JWT token
    $payload = [
        'user_id' => $user['id'],
        'email' => $user['email'],
        'iat' => time(),
        'exp' => time() + (24 * 60 * 60) // 24 hours
    ];
    
    $token = generateJWT($payload);
    
    // Return success response
    sendSuccess('Login successful', [
        'user' => $user,
        'token' => $token
    ]);
    
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    sendError('An error occurred during login');
}
?>
