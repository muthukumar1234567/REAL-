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

// Detect content type and collect input accordingly (supports JSON and multipart/form-data)
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
$isMultipart = stripos($contentType, 'multipart/form-data') !== false || !empty($_FILES);

if ($isMultipart) {
    $source = $_POST;
} else {
    $raw = file_get_contents('php://input');
    $source = $raw ? json_decode($raw, true) : null;
}

if (!$source || !is_array($source)) {
    sendError('Invalid input data');
}

// Validate required fields
$required_fields = ['title', 'property_type', 'price', 'location', 'description'];
foreach ($required_fields as $field) {
    if (!isset($source[$field]) || trim((string)$source[$field]) === '') {
        sendError("Field '$field' is required");
    }
}

$title = trim($source['title']);
$property_type = $source['property_type'];
$price = floatval($source['price']);
$location = trim($source['location']);
$bedrooms = isset($source['bedrooms']) ? intval($source['bedrooms']) : 0;
$bathrooms = isset($source['bathrooms']) ? intval($source['bathrooms']) : 0;
$area = isset($source['area']) ? intval($source['area']) : 0;
$year_built = isset($source['year_built']) && $source['year_built'] !== '' ? intval($source['year_built']) : null;
$description = trim($source['description']);
$features = isset($source['features']) ? trim($source['features']) : null;

// Handle image: either uploaded file (preferred) or provided URL
$image_url = null;
if ($isMultipart && isset($_FILES['image']) && is_array($_FILES['image']) && $_FILES['image']['error'] !== UPLOAD_ERR_NO_FILE) {
    $file = $_FILES['image'];
    if ($file['error'] !== UPLOAD_ERR_OK) {
        sendError('Image upload failed');
    }

    // Validate mime type and size (max ~5MB)
    $allowedTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/gif' => 'gif', 'image/webp' => 'webp'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    if (!isset($allowedTypes[$mimeType])) {
        sendError('Unsupported image type');
    }
    if ($file['size'] > 5 * 1024 * 1024) {
        sendError('Image too large (max 5MB)');
    }

    // Ensure uploads directory exists (store at project root /uploads)
    $uploadsDir = realpath(__DIR__ . '/..') . DIRECTORY_SEPARATOR . 'uploads';
    if (!is_dir($uploadsDir)) {
        if (!mkdir($uploadsDir, 0755, true)) {
            sendError('Failed to create uploads directory');
        }
    }

    // Create unique filename
    $ext = $allowedTypes[$mimeType];
    $safeTitle = preg_replace('/[^a-zA-Z0-9_-]/', '-', strtolower(substr($title, 0, 60)));
    $filename = $safeTitle . '-' . time() . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
    $targetPath = $uploadsDir . DIRECTORY_SEPARATOR . $filename;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        sendError('Failed to save uploaded image');
    }

    // Public URL relative to project root for frontend pages like dashboard.html
    $image_url = 'uploads/' . $filename;
} else if (isset($source['image_url']) && trim((string)$source['image_url']) !== '') {
    $image_url = trim($source['image_url']);
}

// Validate property type
if (!in_array($property_type, ['sale', 'rent', 'lease'])) {
    sendError('Invalid property type');
}

// Validate price
if ($price <= 0) {
    sendError('Price must be greater than 0');
}

// Validate year built if provided
if ($year_built && ($year_built < 1800 || $year_built > date('Y'))) {
    sendError('Invalid year built');
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Insert property
    $query = "INSERT INTO properties (user_id, title, property_type, price, location, bedrooms, bathrooms, area, year_built, description, features, image_url) 
              VALUES (:user_id, :title, :property_type, :price, :location, :bedrooms, :bathrooms, :area, :year_built, :description, :features, :image_url)";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user['user_id']);
    $stmt->bindParam(':title', $title);
    $stmt->bindParam(':property_type', $property_type);
    $stmt->bindParam(':price', $price);
    $stmt->bindParam(':location', $location);
    $stmt->bindParam(':bedrooms', $bedrooms);
    $stmt->bindParam(':bathrooms', $bathrooms);
    $stmt->bindParam(':area', $area);
    $stmt->bindParam(':year_built', $year_built);
    $stmt->bindParam(':description', $description);
    $stmt->bindParam(':features', $features);
    $stmt->bindParam(':image_url', $image_url);
    
    if ($stmt->execute()) {
        $property_id = $db->lastInsertId();
        sendSuccess('Property added successfully', ['property_id' => $property_id]);
    } else {
        sendError('Failed to add property');
    }
    
} catch (Exception $e) {
    error_log("Add property error: " . $e->getMessage());
    sendError('An error occurred while adding property');
}
?>
