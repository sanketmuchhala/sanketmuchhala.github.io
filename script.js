// Performance optimizations
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Enhanced mobile menu toggle with optimized animations
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Optimized staggered animation for menu items
        if (navMenu.classList.contains('active')) {
            const navItems = navMenu.querySelectorAll('.nav-item');
            navItems.forEach((item, index) => {
                requestAnimationFrame(() => {
                    item.style.animation = `fadeInUp 0.3s ease-out ${index * 0.05}s both`;
                });
            });
        }
    });
    
    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
    
    // Optimized navbar scroll effect with throttling
    const handleScroll = throttle(function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, 16); // ~60fps
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Optimized active navigation link based on scroll position
    const updateActiveNavLink = throttle(function() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (navLink) {
                    navLink.classList.add('active');
                }
            }
        });
    }, 100);
    
    window.addEventListener('scroll', updateActiveNavLink, { passive: true });
    updateActiveNavLink(); // Call once on load
    
    // Initialize ribbons background effect with performance optimization
    initializeRibbons();
    
    // Theme toggle functionality - improved for GitHub Pages
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    if (themeToggle && themeIcon) {
        // Initialize theme system
        initializeTheme();
        
        // Add click event listener
        themeToggle.addEventListener('click', function(e) {
            e.preventDefault();
            toggleTheme();
        });

        function initializeTheme() {
            try {
                // Check for saved theme preference or default to 'dark'
                const savedTheme = localStorage.getItem('portfolio-theme');
                const currentTheme = savedTheme || 'dark';
                
                // Apply theme to document root for better compatibility
                document.documentElement.setAttribute('data-theme', currentTheme);
                document.body.setAttribute('data-theme', currentTheme);
                
                updateThemeIcon(currentTheme);
            } catch (error) {
                console.warn('Theme initialization failed:', error);
                // Fallback to dark theme
                document.documentElement.setAttribute('data-theme', 'dark');
                document.body.setAttribute('data-theme', 'dark');
                updateThemeIcon('dark');
            }
        }

        function updateThemeIcon(theme) {
            if (theme === 'light') {
                themeIcon.className = 'fas fa-moon';
                themeToggle.setAttribute('aria-label', 'Switch to dark mode');
            } else {
                themeIcon.className = 'fas fa-sun';
                themeToggle.setAttribute('aria-label', 'Switch to light mode');
            }
        }

        function toggleTheme() {
            try {
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                // Apply theme
                document.documentElement.setAttribute('data-theme', newTheme);
                document.body.setAttribute('data-theme', newTheme);
                
                // Save to localStorage
                localStorage.setItem('portfolio-theme', newTheme);
                
                // Update icon
                updateThemeIcon(newTheme);
            } catch (error) {
                console.warn('Theme toggle failed:', error);
            }
        }
    }
});

// Optimized smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Optimized intersection observer for animations
document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.project-card, .skill-card, .experience-card, .blog-card');
    animateElements.forEach(el => observer.observe(el));
});

// Optimized lazy loading for images
document.addEventListener('DOMContentLoaded', function() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));
});

// Typing effect for hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Start typing effect after a short delay
setTimeout(() => {
    const nameElement = document.querySelector('.name');
    if (nameElement) {
        typeWriter(nameElement, 'Sanket Muchhala', 150);
    }
}, 1000);

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroText = document.querySelector('.hero-text');
    const heroImage = document.querySelector('.hero-image');
    
    if (heroText && heroImage && scrolled < window.innerHeight) {
        heroText.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroImage.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});

// Dynamic skill tag hover effects
document.querySelectorAll('.skill-tag').forEach(tag => {
    tag.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px) scale(1.05)';
    });
    
    tag.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Project card tilt effect
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
});

// Optimized ribbons background effect
function initializeRibbons() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let animationId;
    
    // Set canvas properties
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.opacity = '0.1';
    canvas.style.pointerEvents = 'none';
    
    document.body.appendChild(canvas);
    
    // Optimized resize handler
    const handleResize = debounce(() => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }, 250);
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Ribbon particles with optimized rendering
    const particles = [];
    const particleCount = Math.min(50, Math.floor(window.innerWidth / 20));
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1
        });
    }
    
    // Optimized animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            if (particle.y > canvas.height) particle.y = 0;
            
            // Draw particle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fill();
        });
        
        animationId = requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
    
    // Cleanup function
    window.addEventListener('beforeunload', () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    });
}

// Counter animation for stats
function animateCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const target = parseInt(stat.textContent.replace(/\D/g, ''));
        const suffix = stat.textContent.replace(/[0-9]/g, '');
        let current = 0;
        const increment = target / 100;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                stat.textContent = Math.round(current) + suffix;
                requestAnimationFrame(updateCounter);
            } else {
                stat.textContent = target + suffix;
            }
        };
        
        // Start animation when element is visible
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    counterObserver.unobserve(entry.target);
                }
            });
        });
        
        counterObserver.observe(stat);
    });
}

animateCounters();

// Add loading overlay removal
const loadingOverlay = document.createElement('div');
loadingOverlay.className = 'loading-overlay';
loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
document.body.appendChild(loadingOverlay);

// Remove loading overlay after everything is loaded
window.addEventListener('load', () => {
    setTimeout(() => {
        loadingOverlay.classList.add('hidden');
        setTimeout(() => {
            loadingOverlay.remove();
        }, 500);
    }, 1000);
});

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Add keyboard shortcuts for navigation
    if (e.altKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                document.querySelector('#home').scrollIntoView({ behavior: 'smooth' });
                break;
            case '2':
                e.preventDefault();
                document.querySelector('#about').scrollIntoView({ behavior: 'smooth' });
                break;
            case '3':
                e.preventDefault();
                document.querySelector('#skills').scrollIntoView({ behavior: 'smooth' });
                break;
            case '4':
                e.preventDefault();
                document.querySelector('#experience').scrollIntoView({ behavior: 'smooth' });
                break;
            case '5':
                e.preventDefault();
                document.querySelector('#projects').scrollIntoView({ behavior: 'smooth' });
                break;
            case '6':
                e.preventDefault();
                document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
                break;
        }
    }
});

// Dark mode toggle (future enhancement)
function toggleDarkMode() {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('darkMode', !document.body.classList.contains('light-mode'));
}

// Initialize dark mode based on user preference
function initializeDarkMode() {
    const darkModePreference = localStorage.getItem('darkMode');
    if (darkModePreference === 'false') {
        document.body.classList.add('light-mode');
    }
}

initializeDarkMode();

// Photography Section Functionality
function initializePhotography() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const photoItems = document.querySelectorAll('.photo-item, .masonry-item, .creative-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxCategory = document.getElementById('lightbox-category');

    // Filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter items
            photoItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeInUp 0.6s ease forwards';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Lightbox functionality
    photoItems.forEach(item => {
        item.addEventListener('click', function() {
            const img = this.querySelector('img');
            const title = this.querySelector('.photo-title, .creative-overlay h3')?.textContent || 'Photography';
            const category = this.getAttribute('data-category') || 'Art';
            
            if (img) {
                lightboxImg.src = img.src;
                lightboxTitle.textContent = title;
                lightboxCategory.textContent = category.charAt(0).toUpperCase() + category.slice(1);
                lightbox.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Close lightbox
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }
}

// Photo Collage Functionality for Main Page
function initializePhotoCollage() {
    const collageItems = document.querySelectorAll('.collage-item');
    
    // Add click functionality to open images in full view
    collageItems.forEach(item => {
        item.addEventListener('click', function() {
            const img = this.querySelector('img');
            if (img) {
                openImageModal(img.src, img.alt);
            }
        });
        
        // Add staggered animation on page load
        item.style.opacity = '0';
        item.style.transform = 'scale(0.8)';
    });
    
    // Animate collage items with staggered delay
    setTimeout(() => {
        collageItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
            }, index * 100);
        });
    }, 500);
}

// Open image modal for main page photography
function openImageModal(src, alt) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('imageModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'imageModal';
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="image-modal-content">
                <span class="image-modal-close">&times;</span>
                <img src="${src}" alt="${alt}">
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add close functionality
        const closeBtn = modal.querySelector('.image-modal-close');
        closeBtn.addEventListener('click', () => closeImageModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeImageModal();
        });
    } else {
        // Update existing modal
        const img = modal.querySelector('img');
        img.src = src;
        img.alt = alt;
    }
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close image modal
function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Close lightbox function (global for onclick)
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Typing animation for job titles
function initializeTypingAnimation() {
    const typingText = document.getElementById('typing-text');
    if (!typingText) return;
    
    const jobTitles = [
        'AI Engineer',
        'ML Engineer', 
        'Data Analyst'
    ];
    
    let currentIndex = 0;
    let currentText = '';
    let isDeleting = false;
    let typingSpeed = 150;
    
    function type() {
        const currentJobTitle = jobTitles[currentIndex];
        
        if (isDeleting) {
            // Delete text
            currentText = currentJobTitle.substring(0, currentText.length - 1);
            typingSpeed = 100;
        } else {
            // Type text
            currentText = currentJobTitle.substring(0, currentText.length + 1);
            typingSpeed = 150;
        }
        
        typingText.textContent = currentText;
        
        if (!isDeleting && currentText === currentJobTitle) {
            // Pause at end of typing
            typingSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && currentText === '') {
            // Move to next job title
            isDeleting = false;
            currentIndex = (currentIndex + 1) % jobTitles.length;
            typingSpeed = 500;
        }
        
        setTimeout(type, typingSpeed);
    }
    
    // Start the typing animation after a delay
    setTimeout(type, 1000);
}
