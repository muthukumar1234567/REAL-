// Dashboard JavaScript

class DashboardManager {
    constructor() {
        this.properties = [];
        this.apiBase = 'api/';
        this.init();
    }

    init() {
        this.loadUserProperties();
        this.setupEventListeners();
    }

    // Setup event listeners
    setupEventListeners() {
        // Property form submission
        const propertyForm = document.getElementById('property-form');
        if (propertyForm) {
            propertyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePropertySubmission(e.target);
            });
        }
    }

    // Load user's properties
    async loadUserProperties() {
        try {
            const response = await fetch(`${this.apiBase}get_user_properties.php`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });

            const result = await response.json();

            if (result.success) {
                this.properties = result.properties || [];
                this.displayUserProperties();
                this.updateStats();
            } else {
                console.error('Failed to load properties:', result.message);
            }
        } catch (error) {
            console.error('Error loading properties:', error);
        }
    }

    // Display user's properties
    displayUserProperties() {
        const grid = document.getElementById('my-properties-grid');
        const noProperties = document.getElementById('no-my-properties');
        
        if (this.properties.length === 0) {
            grid.style.display = 'none';
            noProperties.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        noProperties.style.display = 'none';

        grid.innerHTML = this.properties.map(property => 
            this.createPropertyCard(property)
        ).join('');
    }

    // Create property card for dashboard
    createPropertyCard(property) {
        const features = property.features ? property.features.split(',').map(f => f.trim()) : [];
        const imageUrl = property.image_url || '';
        const imageDisplay = imageUrl ? 
            `<img src="${imageUrl}" alt="${property.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
             <i class="fas fa-home" style="display: none;"></i>` :
            `<i class="fas fa-home"></i>`;

        return `
            <div class="property-card">
                <div class="property-image">
                    ${imageDisplay}
                    <div class="property-type-badge type-${property.property_type}">
                        For ${property.property_type === 'sale' ? 'Sale' : property.property_type === 'rent' ? 'Rent' : 'Lease'}
                    </div>
                </div>
                <div class="property-info">
                    <h3 class="property-title">${property.title}</h3>
                    <p class="property-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${property.location}
                    </p>
                    <div class="property-price">
                        $${this.formatPrice(property.price)}${property.property_type === 'rent' ? '/month' : property.property_type === 'lease' ? '/month' : ''}
                    </div>
                    <div class="property-details">
                        ${property.bedrooms ? `<div class="property-detail"><i class="fas fa-bed"></i> ${property.bedrooms} beds</div>` : ''}
                        ${property.bathrooms ? `<div class="property-detail"><i class="fas fa-bath"></i> ${property.bathrooms} baths</div>` : ''}
                        ${property.area ? `<div class="property-detail"><i class="fas fa-ruler-combined"></i> ${property.area} sq ft</div>` : ''}
                    </div>
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
                        <button class="btn btn-secondary" onclick="dashboard.editProperty('${property.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger" onclick="dashboard.deleteProperty('${property.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Handle property form submission
    async handlePropertySubmission(form) {
        const title = document.getElementById('title').value;
        const property_type = document.getElementById('property-type').value;
        const price = parseFloat(document.getElementById('price').value);
        const location = document.getElementById('location').value;
        const bedrooms = parseInt(document.getElementById('bedrooms').value) || 0;
        const bathrooms = parseInt(document.getElementById('bathrooms').value) || 0;
        const area = parseInt(document.getElementById('area').value) || 0;
        const year_built = parseInt(document.getElementById('year-built').value) || '';
        const description = document.getElementById('description').value;
        const features = document.getElementById('features').value;
        const imageFileInput = document.getElementById('image-file');
        const imageFile = imageFileInput && imageFileInput.files && imageFileInput.files[0] ? imageFileInput.files[0] : null;

        if (!title || !property_type || !price || !location || !description) {
            alert('Please fill in all required fields.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('property_type', property_type);
        formData.append('price', price);
        formData.append('location', location);
        formData.append('bedrooms', bedrooms);
        formData.append('bathrooms', bathrooms);
        formData.append('area', area);
        if (year_built !== '') formData.append('year_built', year_built);
        formData.append('description', description);
        formData.append('features', features);
        if (imageFile) formData.append('image', imageFile);

        try {
            const response = await fetch(`${this.apiBase}add_property.php`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showMessage('success', 'Property added successfully!');
                form.reset();
                this.loadUserProperties();
            } else {
                this.showMessage('error', result.message || 'Failed to add property');
            }
        } catch (error) {
            console.error('Error adding property:', error);
            this.showMessage('error', 'Network error. Please try again.');
        }
    }

    // Edit property
    editProperty(propertyId) {
        const property = this.properties.find(p => p.id === propertyId);
        if (!property) return;

        // Switch to add property tab
        switchTab('add-property');
        
        // Fill form with property data
        document.getElementById('title').value = property.title;
        document.getElementById('property-type').value = property.property_type;
        document.getElementById('price').value = property.price;
        document.getElementById('location').value = property.location;
        document.getElementById('bedrooms').value = property.bedrooms || '';
        document.getElementById('bathrooms').value = property.bathrooms || '';
        document.getElementById('area').value = property.area || '';
        document.getElementById('year-built').value = property.year_built || '';
        document.getElementById('description').value = property.description;
        document.getElementById('features').value = property.features || '';
        const imageFileInput = document.getElementById('image-file');
        if (imageFileInput) imageFileInput.value = '';

        // Store property ID for update
        document.getElementById('property-form').dataset.propertyId = propertyId;
    }

    // Delete property
    async deleteProperty(propertyId) {
        if (!confirm('Are you sure you want to delete this property?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}delete_property.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({ property_id: propertyId })
            });

            const result = await response.json();

            if (result.success) {
                this.showMessage('success', 'Property deleted successfully!');
                this.loadUserProperties(); // Reload properties
            } else {
                this.showMessage('error', result.message || 'Failed to delete property');
            }
        } catch (error) {
            console.error('Error deleting property:', error);
            this.showMessage('error', 'Network error. Please try again.');
        }
    }

    // Update statistics
    updateStats() {
        const totalElement = document.getElementById('total-properties');
        const forSaleElement = document.getElementById('for-sale');
        const forRentElement = document.getElementById('for-rent');
        const totalViewsElement = document.getElementById('total-views');

        const stats = this.properties.reduce((acc, property) => {
            acc.total++;
            if (property.property_type === 'sale') acc.forSale++;
            else if (property.property_type === 'rent') acc.forRent++;
            else if (property.property_type === 'lease') acc.forRent++;
            acc.totalViews += property.views || 0;
            return acc;
        }, { total: 0, forSale: 0, forRent: 0, totalViews: 0 });

        if (totalElement) totalElement.textContent = stats.total;
        if (forSaleElement) forSaleElement.textContent = stats.forSale;
        if (forRentElement) forRentElement.textContent = stats.forRent;
        if (totalViewsElement) totalViewsElement.textContent = stats.totalViews;
    }

    // Show message
    showMessage(type, message) {
        // Create message element if it doesn't exist
        let messageDiv = document.querySelector('.dashboard-message');
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.className = 'dashboard-message';
            messageDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                color: white;
                font-weight: bold;
                z-index: 1000;
                max-width: 300px;
            `;
            document.body.appendChild(messageDiv);
        }

        messageDiv.style.backgroundColor = type === 'success' ? '#2ecc71' : '#e74c3c';
        messageDiv.textContent = message;
        messageDiv.style.display = 'block';

        // Hide after 3 seconds
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }

    // Utility functions
    formatPrice(price) {
        return new Intl.NumberFormat('en-US').format(price);
    }

    truncateText(text, length) {
        return text.length > length ? text.substring(0, length) + '...' : text;
    }
}

// Initialize dashboard manager
const dashboard = new DashboardManager();
