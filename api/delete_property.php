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

if (!$input || !isset($input['property_id'])) {
    sendError('Property ID is required');
}

$property_id = intval($input['property_id']);

if ($property_id <= 0) {
    sendError('Invalid property ID');
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if property exists and belongs to user
    $query = "SELECT id FROM properties WHERE id = :property_id AND user_id = :user_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':property_id', $property_id);
    $stmt->bindParam(':user_id', $user['user_id']);
    $stmt->execute();
    
    if (!$stmt->fetch()) {
        sendError('Property not found or access denied');
    }
    
    // Delete property
    $query = "DELETE FROM properties WHERE id = :property_id AND user_id = :user_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':property_id', $property_id);
    $stmt->bindParam(':user_id', $user['user_id']);
    
    if ($stmt->execute()) {
        sendSuccess('Property deleted successfully');
    } else {
        sendError('Failed to delete property');
    }
    
} catch (Exception $e) {
    error_log("Delete property error: " . $e->getMessage());
    sendError('An error occurred while deleting property');
}
?>
