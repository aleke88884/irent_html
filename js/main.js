/**
 * iRent - Electric Tools Rental App
 * Main JavaScript File
 */

// Toggle favorite button
function toggleFavorite(button) {
    const icon = button.querySelector('i');
    button.classList.toggle('active');

    if (button.classList.contains('active')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        icon.style.color = 'var(--danger)';
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        icon.style.color = '';
    }
}

// Filter pills functionality
document.addEventListener('DOMContentLoaded', function() {
    const filterPills = document.querySelectorAll('.filter-pill');

    filterPills.forEach(pill => {
        pill.addEventListener('click', function() {
            filterPills.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
        });
    });
});

// Mobile menu toggle (for future implementation)
function toggleMobileMenu() {
    const nav = document.querySelector('.nav');
    nav.classList.toggle('active');
}

// Search functionality
function initSearch() {
    const searchInputs = document.querySelectorAll('.search-box input');

    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            // Implement search logic here
            console.log('Searching for:', query);
        });
    });
}

// Date picker calculation
function calculateRentalPrice() {
    const startDate = document.getElementById('start-date');
    const endDate = document.getElementById('end-date');

    if (startDate && endDate) {
        const start = new Date(startDate.value);
        const end = new Date(endDate.value);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        // Update price display
        const pricePerDay = 1500; // Example price
        const totalPrice = days * pricePerDay;

        const priceDisplay = document.querySelector('.price-value');
        if (priceDisplay) {
            priceDisplay.textContent = totalPrice.toLocaleString('ru-RU') + ' ₸';
        }

        const priceLabel = document.querySelector('.price-label');
        if (priceLabel) {
            priceLabel.textContent = `Итого за ${days} ${getDaysWord(days)}:`;
        }
    }
}

// Russian word forms for days
function getDaysWord(days) {
    const lastDigit = days % 10;
    const lastTwoDigits = days % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return 'дней';
    }

    if (lastDigit === 1) {
        return 'день';
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
        return 'дня';
    }

    return 'дней';
}

// Initialize date picker listeners
document.addEventListener('DOMContentLoaded', function() {
    const startDate = document.getElementById('start-date');
    const endDate = document.getElementById('end-date');

    if (startDate && endDate) {
        startDate.addEventListener('change', calculateRentalPrice);
        endDate.addEventListener('change', calculateRentalPrice);
    }
});

// Cart functionality
const cart = {
    items: [],

    addItem(item) {
        this.items.push(item);
        this.updateBadge();
        this.saveToStorage();
    },

    removeItem(index) {
        this.items.splice(index, 1);
        this.updateBadge();
        this.saveToStorage();
    },

    updateBadge() {
        const badges = document.querySelectorAll('.header-icon .badge');
        badges.forEach(badge => {
            badge.textContent = this.items.length;
        });
    },

    saveToStorage() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    },

    loadFromStorage() {
        const saved = localStorage.getItem('cart');
        if (saved) {
            this.items = JSON.parse(saved);
            this.updateBadge();
        }
    },

    getTotal() {
        return this.items.reduce((sum, item) => sum + item.price, 0);
    }
};

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
    cart.loadFromStorage();
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form validation
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    });

    return isValid;
}

// Phone number formatting
function formatPhone(input) {
    let value = input.value.replace(/\D/g, '');

    if (value.length > 0) {
        if (value[0] === '7' || value[0] === '8') {
            value = value.substring(1);
        }

        let formatted = '+7 ';
        if (value.length > 0) {
            formatted += '(' + value.substring(0, 3);
        }
        if (value.length > 3) {
            formatted += ') ' + value.substring(3, 6);
        }
        if (value.length > 6) {
            formatted += '-' + value.substring(6, 8);
        }
        if (value.length > 8) {
            formatted += '-' + value.substring(8, 10);
        }

        input.value = formatted;
    }
}

// Initialize phone formatting
document.addEventListener('DOMContentLoaded', function() {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function() {
            formatPhone(this);
        });
    });
});

// Loading state management
function showLoading(element) {
    element.classList.add('loading');
    element.disabled = true;
}

function hideLoading(element) {
    element.classList.remove('loading');
    element.disabled = false;
}

// Toast notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    toast.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--gray-900);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 3000;
        animation: slideUp 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add CSS animations for toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }

    @keyframes slideDown {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
    }
`;
document.head.appendChild(style);

// Pull to refresh (mobile)
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', function(e) {
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', function(e) {
    touchEndY = e.changedTouches[0].clientY;

    if (window.scrollY === 0 && touchEndY - touchStartY > 100) {
        // Trigger refresh
        console.log('Pull to refresh triggered');
        // location.reload();
    }
});

// Export functions for global use
window.toggleFavorite = toggleFavorite;
window.showToast = showToast;
window.validateForm = validateForm;
