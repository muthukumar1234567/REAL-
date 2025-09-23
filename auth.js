// Authentication JavaScript

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.apiBase = 'api/'; // PHP API base URL
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.setupEventListeners();
    }

    // Check if user is already logged in
    checkAuthStatus() {
        const token = localStorage.getItem('auth_token');
        const user = localStorage.getItem('user_data');
        
        if (token && user) {
            this.currentUser = JSON.parse(user);
            this.updateUI();
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(e.target);
            });
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister(e.target);
            });
        }

        // Profile form
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProfileUpdate(e.target);
            });
        }
    }

    // Handle login
    async handleLogin(form) {
        const formData = new FormData(form);
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        this.showLoading(true, 'login-btn');
        this.hideMessages();

        try {
            const response = await fetch(`${this.apiBase}login.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            if (result.success) {
                this.currentUser = result.user;
                localStorage.setItem('auth_token', result.token);
                localStorage.setItem('user_data', JSON.stringify(result.user));
                this.showMessage('success', 'Login successful! Redirecting...');
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                this.showMessage('error', result.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('error', 'Network error. Please try again.');
        } finally {
            this.showLoading(false, 'login-btn');
        }
    }

    // Handle registration
    async handleRegister(form) {
        const formData = new FormData(form);
        const registerData = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            password: formData.get('password'),
            confirm_password: formData.get('confirm_password')
        };

        // Validate passwords match
        if (registerData.password !== registerData.confirm_password) {
            this.showMessage('error', 'Passwords do not match');
            return;
        }

        this.showLoading(true, 'register-btn');
        this.hideMessages();

        try {
            const response = await fetch(`${this.apiBase}register.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registerData)
            });

            const result = await response.json();

            if (result.success) {
                this.showMessage('success', 'Registration successful! Please login.');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                this.showMessage('error', result.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showMessage('error', 'Network error. Please try again.');
        } finally {
            this.showLoading(false, 'register-btn');
        }
    }

    // Handle profile update
    async handleProfileUpdate(form) {
        const formData = new FormData(form);
        const profileData = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            email: formData.get('email'),
            phone: formData.get('phone')
        };

        try {
            const response = await fetch(`${this.apiBase}update_profile.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify(profileData)
            });

            const result = await response.json();

            if (result.success) {
                this.currentUser = { ...this.currentUser, ...profileData };
                localStorage.setItem('user_data', JSON.stringify(this.currentUser));
                this.showMessage('success', 'Profile updated successfully!');
            } else {
                this.showMessage('error', result.message || 'Profile update failed');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            this.showMessage('error', 'Network error. Please try again.');
        }
    }

    // Logout function
    logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        this.currentUser = null;
        window.location.href = 'index.html';
    }

    // Update UI based on auth status
    updateUI() {
        // Update user name in dashboard
        const userNameElement = document.getElementById('user-name');
        if (userNameElement && this.currentUser) {
            userNameElement.textContent = `Welcome, ${this.currentUser.first_name} ${this.currentUser.last_name}`;
        }

        // Update profile form
        if (this.currentUser) {
            const profileForm = document.getElementById('profile-form');
            if (profileForm) {
                document.getElementById('profile-first-name').value = this.currentUser.first_name || '';
                document.getElementById('profile-last-name').value = this.currentUser.last_name || '';
                document.getElementById('profile-email').value = this.currentUser.email || '';
                document.getElementById('profile-phone').value = this.currentUser.phone || '';
            }
        }
    }

    // Show loading state
    showLoading(show, buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            const btnText = button.querySelector('.btn-text');
            const loading = button.querySelector('.loading');
            
            if (show) {
                btnText.style.display = 'none';
                loading.classList.add('show');
                button.disabled = true;
            } else {
                btnText.style.display = 'inline';
                loading.classList.remove('show');
                button.disabled = false;
            }
        }
    }

    // Show message
    showMessage(type, message) {
        const errorDiv = document.getElementById('error-message');
        const successDiv = document.getElementById('success-message');
        
        if (type === 'error' && errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        } else if (type === 'success' && successDiv) {
            successDiv.textContent = message;
            successDiv.style.display = 'block';
        }
    }

    // Hide messages
    hideMessages() {
        const errorDiv = document.getElementById('error-message');
        const successDiv = document.getElementById('success-message');
        
        if (errorDiv) errorDiv.style.display = 'none';
        if (successDiv) successDiv.style.display = 'none';
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null && localStorage.getItem('auth_token') !== null;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Get auth token
    getAuthToken() {
        return localStorage.getItem('auth_token');
    }
}

// Initialize auth manager
const auth = new AuthManager();

// Global functions
function logout() {
    auth.logout();
}

function switchTab(tabName) {
    // Hide all tab panels
    const panels = document.querySelectorAll('.tab-panel');
    panels.forEach(panel => panel.classList.remove('active'));
    
    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => button.classList.remove('active'));
    
    // Show selected panel
    const selectedPanel = document.getElementById(tabName);
    if (selectedPanel) {
        selectedPanel.classList.add('active');
    }
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Protect dashboard page
if (window.location.pathname.includes('dashboard.html')) {
    if (!auth.isAuthenticated()) {
        window.location.href = 'login.html';
    } else {
        auth.updateUI();
    }
}
