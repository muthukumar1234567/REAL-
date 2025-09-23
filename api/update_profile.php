<?php
require_once 'config.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

// Check authentication
$user = getAuthUser();
if (!$user) {
    sendError('Authentication required', 401);
}

// Get input data
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    sendError('Invalid input data');
}

// Validate required fields
$required_fields = ['first_name', 'last_name', 'email', 'phone'];
foreach ($required_fields as $field) {
    if (!isset($input[$field]) || empty(trim($input[$field]))) {
        sendError("Field '$field' is required");
    }
}

$first_name = trim($input['first_name']);
$last_name = trim($input['last_name']);
$email = trim($input['email']);
$phone = trim($input['phone']);

// Validate input
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendError('Invalid email format');
}

// Validate phone number (basic validation)
if (!preg_match('/^[\+]?[0-9\s\-\(\)]{10,}$/', $phone)) {
    sendError('Invalid phone number format');
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if email is already taken by another user
    $query = "SELECT id FROM users WHERE email = :email AND id != :user_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':user_id', $user['user_id']);
    $stmt->execute();
    
    if ($stmt->fetch()) {
        sendError('Email already taken by another user');
    }
    
    // Update user profile
    $query = "UPDATE users SET first_name = :first_name, last_name = :last_name, email = :email, phone = :phone, updated_at = CURRENT_TIMESTAMP WHERE id = :user_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':first_name', $first_name);
    $stmt->bindParam(':last_name', $last_name);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':phone', $phone);
    $stmt->bindParam(':user_id', $user['user_id']);
    
    if ($stmt->execute()) {
        // Return updated user data
        $updated_user = [
            'id' => $user['user_id'],
            'first_name' => $first_name,
            'last_name' => $last_name,
            'email' => $email,
            'phone' => $phone
        ];
        
        sendSuccess('Profile updated successfully', $updated_user);
    } else {
        sendError('Failed to update profile');
    }
    
} catch (Exception $e) {
    error_log("Update profile error: " . $e->getMessage());
    sendError('An error occurred while updating profile');
}
?>
