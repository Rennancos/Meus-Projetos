// Initialize all components when DOM is fully loaded
document.addEventListener("DOMContentLoaded", async function() {
    try {
        await Promise.all([
            initMobileMenu(),
            initSmoothScrolling(),
            initIntersectionObserver(),
            initSocialLinks(),
            initCarousel(),
            initPopups()
        ]);
        console.log('All components initialized successfully');
    } catch (error) {
        console.error('Error initializing components:', error);
    }
});

// Mobile menu functionality
function initMobileMenu() {
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (!mobileMenuButton || !mobileMenu) {
        console.warn('Mobile menu elements not found');
        return Promise.resolve(); // Return resolved promise for Promise.all
    }
    
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });
    
    return Promise.resolve();
}

// Smooth scrolling functionality
function initSmoothScrolling() {
    const anchors = document.querySelectorAll('a[href^="#"]');
    
    if (anchors.length === 0) {
        console.warn('No anchor links found for smooth scrolling');
        return Promise.resolve(); // Return resolved promise for Promise.all
    }
    
    anchors.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            } else {
                console.warn(`Target element ${targetId} not found`);
            }
        });
    });
    
    return Promise.resolve();
}

// Updated menu categories
const cardapios = [
    { id: 'fitness', name: 'Marmitas Fitness', description: 'Refeições balanceadas para uma vida saudável' },
    { id: 'lowcarb', name: 'Marmitas Low Carb', description: 'Opções com baixo teor de carboidratos' },
    { id: 'proteica', name: 'Marmitas Proteicas', description: 'Alto teor de proteínas para ganho muscular' },
    { id: 'vegetariana', name: 'Marmitas Vegetarianas', description: 'Opções sem carne' },
    { id: 'zerolactose', name: 'Marmitas Zero Lactose', description: 'Sem derivados de leite' },
    { id: 'vegana', name: 'Marmitas Veganas', description: 'Totalmente livre de produtos animais' }
];

// Function to render cardapios categories to the DOM
function renderCardapios() {
    const cardapioContainer = document.getElementById('cardapio-container');
    
    if (!cardapioContainer) {
        console.error('Cardapio container element not found');
        return;
    }
    
    cardapioContainer.innerHTML = '';
    
    cardapios.forEach(category => {
        const categoryBox = document.createElement('div');
        categoryBox.className = 'category-box';
        categoryBox.setAttribute('data-category', category.id);
        categoryBox.setAttribute('tabindex', '0');
        categoryBox.setAttribute('role', 'button');
        categoryBox.setAttribute('aria-label', `Ver ${category.name}`);
        
        categoryBox.innerHTML = `
            <div class="category-icon">
                <img src="images/icons/${category.id}.svg" alt="${category.name}" onerror="this.src='images/icons/default.svg'">
            </div>
            <h3>${category.name}</h3>
            <p>${category.description}</p>
        `;
        
        cardapioContainer.appendChild(categoryBox);
        createCategoryPopup(category);
    });
}

// Function to create popup for each category
function createCategoryPopup(category) {
    const popupsContainer = document.getElementById('popups-container');
    
    if (!popupsContainer) {
        console.error('Popups container element not found');
        return;
    }
    
    const existingPopup = document.getElementById(`popup-${category.id}`);
    if (existingPopup) return;
    
    const popup = document.createElement('div');
    popup.id = `popup-${category.id}`;
    popup.className = 'popup';
    popup.setAttribute('aria-hidden', 'true');
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-labelledby', `popup-title-${category.id}`);
    
    popup.innerHTML = `
        <div class="popup-content">
            <button class="close-popup" aria-label="Fechar">×</button>
            <h2 id="popup-title-${category.id}">${category.name}</h2>
            <div class="popup-items" id="popup-items-${category.id}">
                <p>Carregando opções de ${category.name}...</p>
            </div>
        </div>
    `;
    
    popupsContainer.appendChild(popup);
}

// Enhanced popup system
function initPopups() {
    return new Promise((resolve) => {
        const popupOverlay = document.createElement('div');
        popupOverlay.id = 'popup-overlay';
        document.body.appendChild(popupOverlay);
        
        renderCardapios();
        
        const categoryBoxes = document.querySelectorAll('.category-box');
        const closeButtons = document.querySelectorAll('.close-popup');
        
        if (categoryBoxes.length === 0) {
            console.warn('No category boxes found for popups');
        }
        
        const closeAllPopups = () => {
            const activePopups = document.querySelectorAll('.popup[style*="display: block"]');
            activePopups.forEach(popup => {
                popup.style.opacity = '0';
                popup.style.transform = 'translateY(20px)';
                popup.setAttribute('aria-hidden', 'true');
                setTimeout(() => popup.style.display = 'none', 300);
            });
            
            popupOverlay.style.opacity = '0';
            setTimeout(() => {
                popupOverlay.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        };

        const openPopup = (category) => {
            const popup = document.getElementById(`popup-${category}`);
            if (!popup) {
                console.error(`Popup not found for category: ${category}`);
                return;
            }

            popupOverlay.style.display = 'block';
            popup.style.display = 'block';
            
            requestAnimationFrame(() => {
                popupOverlay.style.opacity = '1';
                popup.style.opacity = '1';
                popup.style.transform = 'translateY(0)';
            });
            
            document.body.style.overflow = 'hidden';
            popup.setAttribute('aria-hidden', 'false');
            
            const firstFocusable = popup.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            firstFocusable?.focus();
        };

        categoryBoxes.forEach(box => {
            box.addEventListener('click', () => {
                const category = box.getAttribute('data-category');
                openPopup(category);
            });
            
            box.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openPopup(box.getAttribute('data-category'));
                }
            });
        });
        
        closeButtons.forEach(button => button.addEventListener('click', closeAllPopups));
        popupOverlay.addEventListener('click', (e) => {
            if (e.target === popupOverlay) closeAllPopups();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeAllPopups();
        });
        
        resolve();
    });
}

function initIntersectionObserver() {
    return new Promise((resolve) => {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        if (elements.length === 0) {
            console.warn('No elements found for intersection observer');
            return resolve();
        }
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        elements.forEach(el => observer.observe(el));
        resolve();
    });
}

function initSocialLinks() {
    return new Promise((resolve) => {
        const socialLinks = document.querySelectorAll('.social-link');
        
        if (socialLinks.length === 0) {
            console.warn('No social links found');
            return resolve();
        }
        
        socialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                window.open(link.href, '_blank', 'noopener,noreferrer');
            });
        });
        
        resolve();
    });
}

function initCarousel() {
    return new Promise((resolve) => {
        const carousel = document.querySelector('.carousel');
        if (!carousel) {
            console.warn('Carousel element not found');
            return resolve();
        }
        
        const slides = carousel.querySelectorAll('.carousel-slide');
        if (slides.length === 0) {
            console.warn('No slides found in carousel');
            return resolve();
        }
        
        let currentSlide = 0;
        
        const showSlide = (index) => {
            slides.forEach(slide => slide.style.display = 'none');
            slides[index].style.display = 'block';
        };
        
        const nextSlide = () => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        };
        
        showSlide(0);
        setInterval(nextSlide, 5000);
        
        resolve();
    });
}
