-- Real Estate Database Schema
CREATE DATABASE IF NOT EXISTS real_estate_db;
USE real_estate_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    property_type ENUM('sale', 'rent', 'lease') NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    location VARCHAR(255) NOT NULL,
    bedrooms INT DEFAULT 0,
    bathrooms INT DEFAULT 0,
    area INT DEFAULT 0,
    year_built INT DEFAULT NULL,
    description TEXT NOT NULL,
    features TEXT DEFAULT NULL,
    image_url VARCHAR(500) DEFAULT NULL,
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_location ON properties(location);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_users_email ON users(email);

-- Insert sample data
INSERT INTO users (first_name, last_name, email, phone, password) VALUES
('John', 'Doe', 'john@example.com', '+1234567890', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'), -- password: password
('Jane', 'Smith', 'jane@example.com', '+1234567891', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'), -- password: password
('Admin', 'User', 'admin@propfind.com', '+1234567892', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'); -- password: password

INSERT INTO properties (user_id, title, property_type, price, location, bedrooms, bathrooms, area, year_built, description, features, image_url, views) VALUES
(1, 'Modern Downtown Apartment', 'rent', 2500.00, 'New York, NY', 2, 2, 1200, 2020, 'Beautiful modern apartment in the heart of downtown with stunning city views. Recently renovated with high-end finishes.', 'City View, Modern Kitchen, Hardwood Floors, In-unit Laundry', 'https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=800', 15),
(2, 'Luxury Family Home', 'sale', 750000.00, 'Los Angeles, CA', 4, 3, 2800, 2018, 'Spacious family home with modern amenities in a quiet neighborhood. Perfect for families looking for comfort and style.', 'Swimming Pool, Large Garden, Garage, Modern Kitchen, Walk-in Closets', 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800', 23),
(1, 'Cozy Studio Apartment', 'rent', 1200.00, 'Chicago, IL', 1, 1, 500, 2019, 'Charming studio apartment perfect for young professionals. Great location with easy access to public transportation.', 'Close to Transit, Modern Appliances, High Ceilings, Natural Light', 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800', 8);
