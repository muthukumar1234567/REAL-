# Real Estate Website with Login & Dashboard

A modern, responsive real estate website with user authentication, property management, and a PHP backend with MySQL database.

## Features

### Frontend
- **Modern UI/UX**: Clean, responsive design with smooth animations
- **Property Search**: Advanced filtering by location, type, and price
- **User Authentication**: Login and registration system
- **Dashboard**: Personal dashboard for property management
- **Property Management**: Add, edit, and delete properties
- **Contact System**: Direct contact with property owners

### Backend
- **PHP API**: RESTful API endpoints for all operations
- **MySQL Database**: Secure data storage with proper relationships
- **JWT Authentication**: Secure token-based authentication
- **CORS Support**: Cross-origin resource sharing enabled
- **Input Validation**: Server-side validation for all inputs

## Setup Instructions

### Prerequisites
- Web server (Apache/Nginx)
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Modern web browser

### Installation

1. **Clone/Download** the project files to your web server directory

2. **Database Setup**:
   - Open `api/config.php` and update database credentials if needed
   - Run the setup script by visiting `http://your-domain/setup.php`
   - Or manually import `api/schema.sql` into your MySQL database

3. **Configure Database** (if needed):
   ```php
   // In api/config.php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'real_estate_db');
   define('DB_USER', 'your_username');
   define('DB_PASS', 'your_password');
   ```

4. **Set Permissions**:
   - Ensure your web server can read/write to the project directory
   - Make sure PHP can connect to MySQL

5. **Access the Website**:
   - Open `index.html` in your web browser
   - The website will automatically load properties from the database

### Default Login Credentials

After setup, you can login with these sample accounts:
- **Email**: john@example.com, **Password**: password
- **Email**: jane@example.com, **Password**: password  
- **Email**: admin@propfind.com, **Password**: password

## File Structure

```
Real-estate-main/
├── index.html              # Main homepage
├── login.html              # Login page
├── register.html           # Registration page
├── dashboard.html          # User dashboard
├── style.css              # Main stylesheet
├── script.js              # Main JavaScript
├── auth.js                # Authentication JavaScript
├── dashboard.js           # Dashboard JavaScript
├── setup.php              # Database setup script
├── api/                   # Backend API
│   ├── config.php         # Database configuration
│   ├── schema.sql         # Database schema
│   ├── login.php          # Login endpoint
│   ├── register.php       # Registration endpoint
│   ├── add_property.php   # Add property endpoint
│   ├── get_properties.php # Get properties endpoint
│   ├── get_user_properties.php # Get user properties
│   ├── delete_property.php # Delete property endpoint
│   └── update_profile.php # Update profile endpoint
└── README.md              # This file
```

## API Endpoints

### Authentication
- `POST /api/login.php` - User login
- `POST /api/register.php` - User registration

### Properties
- `GET /api/get_properties.php` - Get all properties (with optional filters)
- `GET /api/get_user_properties.php` - Get user's properties (requires auth)
- `POST /api/add_property.php` - Add new property (requires auth)
- `POST /api/delete_property.php` - Delete property (requires auth)

### User Management
- `POST /api/update_profile.php` - Update user profile (requires auth)

## Usage

### For Visitors
1. Browse properties on the homepage
2. Use search filters to find specific properties
3. Contact property owners directly
4. Register for an account to add properties

### For Registered Users
1. Login to access your dashboard
2. View your property statistics
3. Add new properties
4. Edit or delete your existing properties
5. Update your profile information

## Security Features

- **Password Hashing**: All passwords are securely hashed using PHP's password_hash()
- **JWT Tokens**: Secure authentication tokens with expiration
- **Input Validation**: Both client-side and server-side validation
- **SQL Injection Protection**: Prepared statements for all database queries
- **CORS Headers**: Proper cross-origin resource sharing configuration

## Customization

### Styling
- Modify `style.css` for visual changes
- Update color schemes, fonts, and layouts as needed

### Functionality
- Add new property fields in the database schema
- Extend API endpoints for additional features
- Modify JavaScript for enhanced user interactions

### Database
- Add new tables for additional features
- Modify existing tables for new requirements
- Update API endpoints accordingly

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Check database credentials in `api/config.php`
   - Ensure MySQL service is running
   - Verify database exists

2. **Properties Not Loading**:
   - Check browser console for JavaScript errors
   - Verify API endpoints are accessible
   - Check database connection

3. **Login Not Working**:
   - Verify JWT secret in `api/config.php`
   - Check if user exists in database
   - Check browser console for errors

4. **CORS Errors**:
   - Ensure API files are served from the same domain
   - Check CORS headers in `api/config.php`

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review browser console for JavaScript errors
3. Check server error logs for PHP errors
4. Verify database connectivity and permissions

## License

This project is open source and available under the MIT License.
