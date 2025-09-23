<?php
// Database setup script for Real Estate Website
// Run this script once to set up the database and tables

// Database configuration
$host = 'localhost';
$dbname = 'real_estate_db';
$username = 'root';
$password = '';

try {
    // Connect to MySQL server (without database)
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<h2>Real Estate Website Database Setup</h2>";
    echo "<p>Setting up database and tables...</p>";
    
    // Read and execute schema file
    $schema = file_get_contents('api/schema.sql');
    $statements = explode(';', $schema);
    
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (!empty($statement)) {
            $pdo->exec($statement);
        }
    }
    
    echo "<p style='color: green;'>✅ Database setup completed successfully!</p>";
    echo "<p>You can now:</p>";
    echo "<ul>";
    echo "<li>Access the website at <a href='index.html'>index.html</a></li>";
    echo "<li>Login with sample accounts:</li>";
    echo "<ul>";
    echo "<li>Email: john@example.com, Password: password</li>";
    echo "<li>Email: jane@example.com, Password: password</li>";
    echo "<li>Email: admin@propfind.com, Password: password</li>";
    echo "</ul>";
    echo "<li>Or register a new account</li>";
    echo "</ul>";
    
    echo "<p><strong>Note:</strong> You can delete this setup.php file after successful setup for security.</p>";
    
} catch (PDOException $e) {
    echo "<p style='color: red;'>❌ Database setup failed: " . $e->getMessage() . "</p>";
    echo "<p>Please check your database configuration in api/config.php</p>";
}
?>
