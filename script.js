// Real Estate Website JavaScript

class RealEstateApp {
    constructor() {
        this.properties = [];
        this.filteredProperties = [];
        this.currentContact = null;
        this.apiBase = 'api/';
        this.init();
    }

    init() {
        this.loadProperties();
        this.setupEventListeners();
        this.displayProperties();
        this.updateStats();
        this.setupNavigation();
        this.updateNavigationForAuth();
    }

    // Load properties from API
    async loadProperties() {
        try {
            const response = await fetch(`${this.apiBase}get_properties.php`);
            const result = await response.json();
            
            if (result.success) {
                this.properties = result.data || [];
                this.filteredProperties = [...this.properties];
            } else {
                console.error('Failed to load properties:', result.message);
                // Fallback to local storage
                this.loadPropertiesFromLocal();
            }
        } catch (error) {
            console.error('Error loading properties:', error);
            // Fallback to local storage
            this.loadPropertiesFromLocal();
        }
    }

    // Fallback to local storage
    loadPropertiesFromLocal() {
        const saved = localStorage.getItem('realEstateProperties');
        if (saved) {
            this.properties = JSON.parse(saved);
            this.filteredProperties = [...this.properties];
        }
    }

    // Save properties to local storage (fallback)
    saveProperties() {
        localStorage.setItem('realEstateProperties', JSON.stringify(this.properties));
    }

    // Property Management
    addProperty(propertyData) {
        const property = {
            id: Date.now().toString(),
            ...propertyData,
            dateAdded: new Date().toISOString(),
            views: 0
        };
        this.properties.unshift(property);
        this.saveProperties();
        this.displayProperties();
        this.updateStats();
        return property;
    }

    async searchProperties() {
        const location = document.getElementById('location-search').value;
        const type = document.getElementById('property-type-search').value;
        const minPrice = document.getElementById('min-price').value;
        const maxPrice = document.getElementById('max-price').value;

        // Build query parameters
        const params = new URLSearchParams();
        if (location) params.append('location', location);
        if (type) params.append('property_type', type);
        if (minPrice) params.append('min_price', minPrice);
        if (maxPrice) params.append('max_price', maxPrice);

        try {
            const response = await fetch(`${this.apiBase}get_properties.php?${params.toString()}`);
            const result = await response.json();
            
            if (result.success) {
                this.filteredProperties = result.data || [];
            } else {
                console.error('Search failed:', result.message);
                // Fallback to client-side filtering
                this.filterPropertiesLocally(location, type, minPrice, maxPrice);
            }
        } catch (error) {
            console.error('Search error:', error);
            // Fallback to client-side filtering
            this.filterPropertiesLocally(location, type, minPrice, maxPrice);
        }

        this.displayProperties();
        this.scrollToProperties();
    }

    // Fallback client-side filtering
    filterPropertiesLocally(location, type, minPrice, maxPrice) {
        const min = parseFloat(minPrice) || 0;
        const max = parseFloat(maxPrice) || Infinity;

        this.filteredProperties = this.properties.filter(property => {
            const matchesLocation = !location || 
                property.location.toLowerCase().includes(location.toLowerCase());
            const matchesType = !type || property.propertyType === type;
            const matchesPrice = property.price >= min && property.price <= max;

            return matchesLocation && matchesType && matchesPrice;
        });
    }

    // Display Functions
    displayProperties() {
        const grid = document.getElementById('properties-grid');
        const noProperties = document.getElementById('no-properties');
        const countElement = document.getElementById('displayed-count');
        
        countElement.textContent = this.filteredProperties.length;

        if (this.filteredProperties.length === 0) {
            grid.style.display = 'none';
            noProperties.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        noProperties.style.display = 'none';

        grid.innerHTML = this.filteredProperties.map(property => 
            this.createPropertyCard(property)
        ).join('');
    }

    createPropertyCard(property) {
        const features = property.features ? property.features.split(',').map(f => f.trim()) : [];
        const imageUrl = property.imageUrl || property.image_url || '';
        const imageDisplay = imageUrl ? 
            `<img src="${imageUrl}" alt="${property.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
             <i class="fas fa-home" style="display: none;"></i>` :
            `<i class="fas fa-home"></i>`;

        return `
            <div class="property-card fade-in">
                <div class="property-image">
                    ${imageDisplay}
                    <div class="property-type-badge type-${property.propertyType || property.property_type}">
                        For ${(property.propertyType || property.property_type) === 'sale' ? 'Sale' : (property.propertyType || property.property_type) === 'rent' ? 'Rent' : 'Lease'}
                    </div>
                </div>
                <div class="property-info">
                    <h3 class="property-title">${property.title}</h3>
                    <p class="property-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${property.location}
                    </p>
                    <div class="property-price">
                        $${this.formatPrice(property.price)}${(property.propertyType || property.property_type) === 'rent' ? '/month' : (property.propertyType || property.property_type) === 'lease' ? '/month' : ''}
                    </div>
                    ${this.createPropertyDetails(property)}
                    <p class="property-description">${this.truncateText(property.description, 100)}</p>
                    ${features.length > 0 ? `
                        <div class="property-features">
                            <div class="features-list">
                                ${features.slice(0, 3).map(feature => 
                                    `<span class="feature-tag">${feature}</span>`
                                ).join('')}
                                ${features.length > 3 ? `<span class="feature-tag">+${features.length - 3} more</span>` : ''}
                            </div>
                        </div>
                    ` : ''}
                    <div class="property-actions">
                        <button class="btn btn-primary" onclick="app.showContact('${property.id}')">
                            <i class="fas fa-phone"></i> Contact Seller
                        </button>
                        <button class="btn btn-secondary" onclick="app.viewProperty('${property.id}')">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    createPropertyDetails(property) {
        const details = [];
        if (property.bedrooms) details.push(`<div class="property-detail"><i class="fas fa-bed"></i> ${property.bedrooms} beds</div>`);
        if (property.bathrooms) details.push(`<div class="property-detail"><i class="fas fa-bath"></i> ${property.bathrooms} baths</div>`);
        if (property.area) details.push(`<div class="property-detail"><i class="fas fa-ruler-combined"></i> ${property.area} sq ft</div>`);
        
        return details.length > 0 ? `<div class="property-details">${details.join('')}</div>` : '';
    }

    // Contact Functions
    showContact(propertyId) {
        const property = this.properties.find(p => p.id == propertyId);
        if (!property) return;

        this.currentContact = property;
        const modal = document.getElementById('contact-modal');
        const contactDetails = document.getElementById('contact-details');

        const contactName = property.contactName || (property.first_name && property.last_name ? `${property.first_name} ${property.last_name}` : 'N/A');
        const contactPhone = property.contactPhone || property.phone || 'N/A';
        const contactEmail = property.contactEmail || property.email || 'N/A';

        contactDetails.innerHTML = `
            <div class="contact-info">
                <h4>${property.title}</h4>
                <p><i class="fas fa-user"></i> ${contactName}</p>
                <p><i class="fas fa-phone"></i> ${contactPhone}</p>
                <p><i class="fas fa-envelope"></i> ${contactEmail}</p>
                <p><i class="fas fa-dollar-sign"></i> $${this.formatPrice(property.price)}</p>
            </div>
        `;

        modal.style.display = 'block';
    }

    closeModal() {
        const modal = document.getElementById('contact-modal');
        modal.style.display = 'none';
        this.currentContact = null;
    }

    callSeller() {
        if (this.currentContact) {
            const phone = this.currentContact.contactPhone || this.currentContact.phone;
            if (phone && phone !== 'N/A') {
                window.location.href = `tel:${phone}`;
            }
        }
    }

    emailSeller() {
        if (this.currentContact) {
            const email = this.currentContact.contactEmail || this.currentContact.email;
            const name = this.currentContact.contactName || (this.currentContact.first_name && this.currentContact.last_name ? `${this.currentContact.first_name} ${this.currentContact.last_name}` : 'Seller');
            
            if (email && email !== 'N/A') {
                const subject = encodeURIComponent(`Inquiry about: ${this.currentContact.title}`);
                const body = encodeURIComponent(`Hi ${name},\n\nI'm interested in your property: ${this.currentContact.title}\nLocation: ${this.currentContact.location}\nPrice: $${this.formatPrice(this.currentContact.price)}\n\nPlease contact me with more details.\n\nThank you!`);
                window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
            }
        }
    }

    viewProperty(propertyId) {
        const property = this.properties.find(p => p.id === propertyId);
        if (!property) return;

        // Increment views
        property.views = (property.views || 0) + 1;
        this.saveProperties();

        // Create detailed view (you can expand this)
        alert(`Property Details:\n\nTitle: ${property.title}\nLocation: ${property.location}\nPrice: $${this.formatPrice(property.price)}\nDescription: ${property.description}\n\nContact: ${property.contactName}\nPhone: ${property.contactPhone}\nEmail: ${property.contactEmail}`);
    }

    // Form Handling
    setupEventListeners() {
        // Property form submission
        const propertyForm = document.getElementById('property-form');
        propertyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePropertySubmission(e.target);
        });

        // Search functionality
        const searchButton = document.querySelector('.search-form .btn');
        searchButton.addEventListener('click', () => this.searchProperties());

        // Search on Enter key
        const searchInputs = document.querySelectorAll('.search-form input, .search-form select');
        searchInputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchProperties();
                }
            });
        });

        // Modal close functionality
        const modal = document.getElementById('contact-modal');
        const closeBtn = document.querySelector('.close');
        
        closeBtn.addEventListener('click', () => this.closeModal());
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Navigation
        this.setupNavigation();

        // Mobile menu toggle
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    handlePropertySubmission(form) {
        const formData = new FormData(form);
        
        const propertyData = {
            title: formData.get('title') || document.getElementById('title').value,
            propertyType: formData.get('property-type') || document.getElementById('property-type').value,
            price: parseFloat(document.getElementById('price').value),
            location: document.getElementById('location').value,
            bedrooms: parseInt(document.getElementById('bedrooms').value) || 0,
            bathrooms: parseInt(document.getElementById('bathrooms').value) || 0,
            area: parseInt(document.getElementById('area').value) || 0,
            yearBuilt: parseInt(document.getElementById('year-built').value) || null,
            description: document.getElementById('description').value,
            features: document.getElementById('features').value,
            contactName: document.getElementById('contact-name').value,
            contactPhone: document.getElementById('contact-phone').value,
            contactEmail: document.getElementById('contact-email').value,
            imageUrl: document.getElementById('image-url').value
        };

        // Validate required fields
        if (!propertyData.title || !propertyData.propertyType || !propertyData.price || 
            !propertyData.location || !propertyData.description || 
            !propertyData.contactName || !propertyData.contactPhone || !propertyData.contactEmail) {
            alert('Please fill in all required fields.');
            return;
        }

        // Add property
        this.addProperty(propertyData);

        // Show success message
        this.showSuccessMessage('Property added successfully!');

        // Reset form
        form.reset();

        // Scroll to properties section
        this.scrollToProperties();
    }

    // Navigation
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all links
                navLinks.forEach(l => l.classList.remove('active'));
                
                // Add active class to clicked link
                link.classList.add('active');
                
                // Smooth scroll to section
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Update active nav on scroll
        window.addEventListener('scroll', () => {
            this.updateActiveNavigation();
        });
    }

    updateActiveNavigation() {
        const sections = ['home', 'search', 'add-property', 'about'];
        const navLinks = document.querySelectorAll('.nav-link');
        
        let current = '';
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 150 && rect.bottom >= 150) {
                    current = sectionId;
                }
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    // Utility Functions
    formatPrice(price) {
        return new Intl.NumberFormat('en-US').format(price);
    }

    truncateText(text, length) {
        return text.length > length ? text.substring(0, length) + '...' : text;
    }

    scrollToProperties() {
        const propertiesSection = document.querySelector('.properties-section');
        propertiesSection.scrollIntoView({ behavior: 'smooth' });
    }

    showSuccessMessage(message) {
        // Create or get success message element
        let successDiv = document.querySelector('.success-message');
        if (!successDiv) {
            successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            const propertyForm = document.getElementById('property-form');
            propertyForm.parentNode.insertBefore(successDiv, propertyForm);
        }
        
        successDiv.textContent = message;
        successDiv.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            successDiv.classList.remove('show');
        }, 3000);
    }

    updateStats() {
        const totalElement = document.getElementById('total-properties');
        const forSaleElement = document.getElementById('for-sale');
        const forRentElement = document.getElementById('for-rent');

        const stats = this.properties.reduce((acc, property) => {
            acc.total++;
            const propType = property.propertyType || property.property_type;
            if (propType === 'sale') acc.forSale++;
            else if (propType === 'rent') acc.forRent++;
            else if (propType === 'lease') acc.forRent++; // Count lease as rent for stats
            return acc;
        }, { total: 0, forSale: 0, forRent: 0 });

        if (totalElement) totalElement.textContent = stats.total;
        if (forSaleElement) forSaleElement.textContent = stats.forSale;
        if (forRentElement) forRentElement.textContent = stats.forRent;
    }

    // Update navigation for authentication
    updateNavigationForAuth() {
        const navMenu = document.querySelector('.nav-menu');
        if (!navMenu) return;

        // Check if user is logged in
        const isLoggedIn = localStorage.getItem('auth_token') !== null;
        const userData = localStorage.getItem('user_data');
        const user = userData ? JSON.parse(userData) : null;

        // Remove existing auth links
        const existingAuthLinks = navMenu.querySelectorAll('.auth-link');
        existingAuthLinks.forEach(link => link.remove());

        if (isLoggedIn && user) {
            // Add dashboard and logout links
            const dashboardLink = document.createElement('a');
            dashboardLink.href = 'dashboard.html';
            dashboardLink.className = 'nav-link auth-link';
            dashboardLink.innerHTML = '<i class="fas fa-tachometer-alt"></i> Dashboard';
            navMenu.appendChild(dashboardLink);

            const logoutLink = document.createElement('a');
            logoutLink.href = '#';
            logoutLink.className = 'nav-link auth-link';
            logoutLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
            logoutLink.onclick = (e) => {
                e.preventDefault();
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_data');
                window.location.reload();
            };
            navMenu.appendChild(logoutLink);

            // Update add property link to go to dashboard
            const addPropertyLink = navMenu.querySelector('a[href="#add-property"]');
            if (addPropertyLink) {
                addPropertyLink.href = 'dashboard.html';
                addPropertyLink.innerHTML = '<i class="fas fa-plus"></i> Add Property';
            }
        } else {
            // Add login and register links
            const loginLink = document.createElement('a');
            loginLink.href = 'login.html';
            loginLink.className = 'nav-link auth-link';
            loginLink.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
            navMenu.appendChild(loginLink);

            const registerLink = document.createElement('a');
            registerLink.href = 'register.html';
            registerLink.className = 'nav-link auth-link';
            registerLink.innerHTML = '<i class="fas fa-user-plus"></i> Register';
            navMenu.appendChild(registerLink);
        }
    }

    // Public methods for global access
    static searchProperties() {
        app.searchProperties();
    }

    static showContact(propertyId) {
        app.showContact(propertyId);
    }

    static viewProperty(propertyId) {
        app.viewProperty(propertyId);
    }

    static callSeller() {
        app.callSeller();
    }

    static emailSeller() {
        app.emailSeller();
    }
}

// Initialize the application
const app = new RealEstateApp();

// Global function access
window.searchProperties = () => app.searchProperties();
window.showContact = (id) => app.showContact(id);
window.viewProperty = (id) => app.viewProperty(id);
window.callSeller = () => app.callSeller();
window.emailSeller = () => app.emailSeller();

// Add some sample data if no properties exist
if (app.properties.length === 0) {
    // Sample properties
    const sampleProperties = [
        {
            title: "Modern Downtown Apartment",
            propertyType: "rent",
            price: 2500,
            location: "New York, NY",
            bedrooms: 2,
            bathrooms: 2,
            area: 1200,
            yearBuilt: 2020,
            description: "Beautiful modern apartment in the heart of downtown with stunning city views. Recently renovated with high-end finishes.",
            features: "City View, Modern Kitchen, Hardwood Floors, In-unit Laundry",
            contactName: "Sarah Johnson",
            contactPhone: "+1 555 123 4567",
            contactEmail: "sarah@realestate.com",
            imageUrl: "https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=800"
        },
        {
            title: "Luxury Family Home",
            propertyType: "sale",
            price: 750000,
            location: "Los Angeles, CA",
            bedrooms: 4,
            bathrooms: 3,
            area: 2800,
            yearBuilt: 2018,
            description: "Spacious family home with modern amenities in a quiet neighborhood. Perfect for families looking for comfort and style.",
            features: "Swimming Pool, Large Garden, Garage, Modern Kitchen, Walk-in Closets",
            contactName: "Mike Davis",
            contactPhone: "+1 555 987 6543",
            contactEmail: "mike@homes.com",
            imageUrl: "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800"
        },
        {
            title: "Cozy Studio Apartment",
            propertyType: "rent",
            price: 1200,
            location: "Chicago, IL",
            bedrooms: 1,
            bathrooms: 1,
            area: 500,
            yearBuilt: 2019,
            description: "Charming studio apartment perfect for young professionals. Great location with easy access to public transportation.",
            features: "Close to Transit, Modern Appliances, High Ceilings, Natural Light",
            contactName: "Emily Chen",
            contactPhone: "+1 555 456 7890",
            contactEmail: "emily@apartments.com",
            imageUrl: "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800"
        }
    ];

    sampleProperties.forEach(property => {
        app.addProperty(property);
    });
}