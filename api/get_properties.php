<?php
require_once 'config.php';

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get query parameters
    $location = $_GET['location'] ?? '';
    $property_type = $_GET['property_type'] ?? '';
    $min_price = $_GET['min_price'] ?? '';
    $max_price = $_GET['max_price'] ?? '';
    
    // Build query
    $query = "SELECT p.id, p.title, p.property_type, p.price, p.location, p.bedrooms, p.bathrooms, p.area, p.year_built, p.description, p.features, p.image_url, p.views, p.created_at,
                     u.first_name, u.last_name, u.phone, u.email
              FROM properties p
              JOIN users u ON p.user_id = u.id
              WHERE 1=1";
    
    $params = [];
    
    // Add filters
    if (!empty($location)) {
        $query .= " AND p.location LIKE :location";
        $params[':location'] = '%' . $location . '%';
    }
    
    if (!empty($property_type)) {
        $query .= " AND p.property_type = :property_type";
        $params[':property_type'] = $property_type;
    }
    
    if (!empty($min_price) && is_numeric($min_price)) {
        $query .= " AND p.price >= :min_price";
        $params[':min_price'] = floatval($min_price);
    }
    
    if (!empty($max_price) && is_numeric($max_price)) {
        $query .= " AND p.price <= :max_price";
        $params[':max_price'] = floatval($max_price);
    }
    
    $query .= " ORDER BY p.created_at DESC";
    
    $stmt = $db->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();
    
    $properties = $stmt->fetchAll();
    
    // Format properties for frontend
    $formatted_properties = array_map(function($property) {
        return [
            'id' => $property['id'],
            'title' => $property['title'],
            'propertyType' => $property['property_type'],
            'price' => floatval($property['price']),
            'location' => $property['location'],
            'bedrooms' => intval($property['bedrooms']),
            'bathrooms' => intval($property['bathrooms']),
            'area' => intval($property['area']),
            'yearBuilt' => $property['year_built'] ? intval($property['year_built']) : null,
            'description' => $property['description'],
            'features' => $property['features'],
            'imageUrl' => $property['image_url'],
            'views' => intval($property['views']),
            'contactName' => $property['first_name'] . ' ' . $property['last_name'],
            'contactPhone' => $property['phone'],
            'contactEmail' => $property['email'],
            'dateAdded' => $property['created_at']
        ];
    }, $properties);
    
    sendSuccess('Properties retrieved successfully', $formatted_properties);
    
} catch (Exception $e) {
    error_log("Get properties error: " . $e->getMessage());
    sendError('An error occurred while retrieving properties');
}
?>
