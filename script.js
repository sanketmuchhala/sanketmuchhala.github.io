// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Enhanced mobile menu toggle with animations
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Add staggered animation for menu items
        if (navMenu.classList.contains('active')) {
            const navItems = navMenu.querySelectorAll('.nav-item');
            navItems.forEach((item, index) => {
                item.style.animation = `fadeInUp 0.3s ease-out ${index * 0.1}s both`;
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
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Active navigation link based on scroll position
    function updateActiveNavLink() {
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
    }
    
    window.addEventListener('scroll', updateActiveNavLink);
    updateActiveNavLink(); // Call once on load
    
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
                
                console.log('Theme initialized:', currentTheme);
            } catch (error) {
                console.warn('Theme initialization failed, using default dark theme:', error);
                setTheme('dark');
            }
        }

        function toggleTheme() {
            try {
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                setTheme(newTheme);
                console.log('Theme switched to:', newTheme);
            } catch (error) {
                console.error('Theme toggle failed:', error);
            }
        }

        function setTheme(theme) {
            // Apply to both document root and body for maximum compatibility
            document.documentElement.setAttribute('data-theme', theme);
            document.body.setAttribute('data-theme', theme);
            
            // Save to localStorage with a prefixed key
            try {
                localStorage.setItem('portfolio-theme', theme);
            } catch (error) {
                console.warn('Failed to save theme preference:', error);
            }
            
            updateThemeIcon(theme);
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
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 70; // Account for fixed navbar
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.skill-category, .project-card, .timeline-item, .stat-item');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
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
    
    // Initialize ribbons background effect
    function initializeRibbons() {
        try {
            if (typeof Ribbons !== 'undefined') {
                new Ribbons({
                    // Slower animation settings for more relaxed movement
                    colorSaturation: "70%",
                    colorBrightness: "55%",
                    colorAlpha: 0.8,
                    colorCycleSpeed: 6, // Reduced for slower color changes
                    verticalPosition: "random", // Mix it up for more variety
                    horizontalSpeed: 120, // Slower horizontal movement
                    ribbonCount: 4, // Fewer ribbons for less busy animation
                    strokeSize: 0,
                    parallaxAmount: -0.2, // Reduced parallax effect
                    animateSections: true
                });
                console.log('Ribbons background initialized successfully');
            } else {
                console.warn('Ribbons class not found');
            }
        } catch (error) {
            console.error('Could not initialize ribbons background:', error);
        }
    }
    
    // Initialize ribbons immediately when DOM is ready
    initializeRibbons();
    
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
    
    // Performance optimization - throttle scroll events
    let ticking = false;
    
    function throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;
        return function (...args) {
            const currentTime = Date.now();
            
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }
    
    // Apply throttling to scroll events
    const throttledScrollHandler = throttle(() => {
        updateActiveNavLink();
    }, 16); // ~60fps
    
    window.addEventListener('scroll', throttledScrollHandler);
    
    // Easter egg - console message
    console.log(`
    🚀 Welcome to Sanket Muchhala's Portfolio!
    
    Built with:
    • Vanilla HTML, CSS, and JavaScript
    • Animated Ribbons Background
    • Responsive Design
    • Modern UI/UX
    
    Interested in collaborating? Let's connect!
    📧 muchhalasanket@gmail.com
    `);
});

// Service Worker registration for better performance (disabled to avoid 404 errors)
/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
*/

// Handle contact form interactions (if form is added later)
function handleContactForm() {
    const contactMethods = document.querySelectorAll('.contact-method');
    
    contactMethods.forEach(method => {
        method.addEventListener('click', function(e) {
            // Add click animation
            this.style.transform = 'translateX(15px) scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'translateX(10px) scale(1)';
            }, 150);
        });
    });
}

handleContactForm();

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

// Progressive image loading for better performance
function initializeProgressiveImageLoading() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        lazyImages.forEach(img => img.classList.add('loaded'));
    }
}

// Initialize photography when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializePhotography();
    initializePhotoCollage();
    initializeProgressiveImageLoading();
    initializeTypingAnimation();
});

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
