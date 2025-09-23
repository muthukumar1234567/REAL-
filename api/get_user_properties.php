<?php
require_once 'config.php';

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

// Check authentication
$user = getAuthUser();
if (!$user) {
    sendError('Authentication required', 401);
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get user's properties
    $query = "SELECT id, title, property_type, price, location, bedrooms, bathrooms, area, year_built, description, features, image_url, views, created_at, updated_at 
              FROM properties 
              WHERE user_id = :user_id 
              ORDER BY created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user['user_id']);
    $stmt->execute();
    
    $properties = $stmt->fetchAll();
    
    // Format properties for frontend
    $formatted_properties = array_map(function($property) {
        return [
            'id' => $property['id'],
            'title' => $property['title'],
            'property_type' => $property['property_type'],
            'price' => floatval($property['price']),
            'location' => $property['location'],
            'bedrooms' => intval($property['bedrooms']),
            'bathrooms' => intval($property['bathrooms']),
            'area' => intval($property['area']),
            'year_built' => $property['year_built'] ? intval($property['year_built']) : null,
            'description' => $property['description'],
            'features' => $property['features'],
            'image_url' => $property['image_url'],
            'views' => intval($property['views']),
            'created_at' => $property['created_at'],
            'updated_at' => $property['updated_at']
        ];
    }, $properties);
    
    sendSuccess('Properties retrieved successfully', $formatted_properties);
    
} catch (Exception $e) {
    error_log("Get user properties error: " . $e->getMessage());
    sendError('An error occurred while retrieving properties');
}
?>
