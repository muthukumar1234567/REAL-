<?php
require_once 'config.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

// Get input data
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    sendError('Invalid input data');
}

// Validate required fields
$required_fields = ['first_name', 'last_name', 'email', 'phone', 'password', 'confirm_password'];
foreach ($required_fields as $field) {
    if (!isset($input[$field]) || empty(trim($input[$field]))) {
        sendError("Field '$field' is required");
    }
}

$first_name = trim($input['first_name']);
$last_name = trim($input['last_name']);
$email = trim($input['email']);
$phone = trim($input['phone']);
$password = $input['password'];
$confirm_password = $input['confirm_password'];

// Validate input
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendError('Invalid email format');
}

if (strlen($password) < 6) {
    sendError('Password must be at least 6 characters long');
}

if ($password !== $confirm_password) {
    sendError('Passwords do not match');
}

// Validate phone number (basic validation)
if (!preg_match('/^[\+]?[0-9\s\-\(\)]{10,}$/', $phone)) {
    sendError('Invalid phone number format');
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if email already exists
    $query = "SELECT id FROM users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    
    if ($stmt->fetch()) {
        sendError('Email already registered');
    }
    
    // Hash password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert new user
    $query = "INSERT INTO users (first_name, last_name, email, phone, password) VALUES (:first_name, :last_name, :email, :phone, :password)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':first_name', $first_name);
    $stmt->bindParam(':last_name', $last_name);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':phone', $phone);
    $stmt->bindParam(':password', $hashed_password);
    
    if ($stmt->execute()) {
        sendSuccess('Registration successful');
    } else {
        sendError('Registration failed');
    }
    
} catch (Exception $e) {
    error_log("Registration error: " . $e->getMessage());
    sendError('An error occurred during registration');
}
?>
