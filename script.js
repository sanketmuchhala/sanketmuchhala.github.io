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
    const animateElements = document.querySelectorAll('.skill-category, .project-card, .timeline-item, .stat-item, .skill-item');
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
                    // Enhanced animation settings for smoother continuous movement
                    colorSaturation: "70%",
                    colorBrightness: "55%",
                    colorAlpha: 0.8,
                    colorCycleSpeed: 12, // Further increased for more dynamic colors
                    verticalPosition: "random", // Mix it up for more variety
                    horizontalSpeed: 250, // Faster horizontal movement
                    ribbonCount: 5, // More ribbons for continuous motion
                    strokeSize: 0,
                    parallaxAmount: -0.3,
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
        method.addEventListener('click', function() {
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

// Apple Watch Style Skills Section
document.addEventListener('DOMContentLoaded', function() {
    initializeSkillsSection();
    
    function initializeSkillsSection() {
        const skillItems = document.querySelectorAll('.skill-item');
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        // Initialize skill items with staggered animation
        skillItems.forEach((item, index) => {
            item.style.setProperty('--index', index);
            item.style.animationDelay = `${index * 0.05}s`;
        });
        
        // Apple Watch style jiggle animation on hover
        skillItems.forEach(item => {
            let jiggleTimeout;
            
            item.addEventListener('mouseenter', function() {
                // Clear any existing jiggle
                clearTimeout(jiggleTimeout);
                
                // Add jiggle effect to surrounding items
                const allItems = Array.from(skillItems);
                const currentIndex = allItems.indexOf(this);
                
                allItems.forEach((otherItem, index) => {
                    const distance = Math.abs(index - currentIndex);
                    if (distance <= 2 && otherItem !== this) {
                        const intensity = 1 - (distance * 0.3);
                        otherItem.style.animation = `jiggle 0.3s ease-in-out ${Math.random() * 0.1}s`;
                        otherItem.style.transform = `scale(${1 + intensity * 0.05}) rotate(${(Math.random() - 0.5) * intensity * 2}deg)`;
                    }
                });
                
                // Reset animations after jiggle
                jiggleTimeout = setTimeout(() => {
                    allItems.forEach(item => {
                        if (item !== this) {
                            item.style.animation = '';
                            item.style.transform = '';
                        }
                    });
                }, 500);
            });
            
            item.addEventListener('mouseleave', function() {
                clearTimeout(jiggleTimeout);
            });
            
            // Click effect with zoom and ripple
            item.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Create ripple effect
                const ripple = document.createElement('div');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                    z-index: 1000;
                `;
                
                this.appendChild(ripple);
                
                // Remove ripple after animation
                setTimeout(() => {
                    ripple.remove();
                }, 600);
                
                // Add press effect
                this.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
                
                // Show skill details (optional enhancement)
                showSkillDetails(this);
            });
        });
        
        // Filter functionality
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Filter skill items with animation
                filterSkillItems(filter);
            });
        });
        
        // Random floating animation
        startFloatingAnimation();
    }
    
    function filterSkillItems(filter) {
        const skillItems = document.querySelectorAll('.skill-item');
        
        skillItems.forEach((item, index) => {
            const category = item.getAttribute('data-category');
            const shouldShow = filter === 'all' || category === filter;
            
            if (shouldShow) {
                item.style.display = 'flex';
                item.classList.remove('hidden');
                item.classList.add('show');
                
                // Staggered reveal animation
                setTimeout(() => {
                    item.style.transform = 'scale(1) rotateY(0deg)';
                    item.style.opacity = '1';
                }, index * 50);
            } else {
                item.classList.remove('show');
                item.classList.add('hidden');
                
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    }
    
    function startFloatingAnimation() {
        const skillItems = document.querySelectorAll('.skill-item');
        
        skillItems.forEach((item, index) => {
            const delay = index * 200;
            
            setTimeout(() => {
                item.style.animation = `float 6s ease-in-out infinite ${Math.random() * 2}s`;
            }, delay);
        });
    }
    
    function showSkillDetails(skillItem) {
        const skillName = skillItem.querySelector('.skill-name').textContent;
        const category = skillItem.getAttribute('data-category');
        
        // Create a subtle notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            background: var(--background-card);
            border: 2px solid var(--primary-color);
            border-radius: 20px;
            padding: 1rem 2rem;
            color: var(--text-primary);
            font-weight: 600;
            z-index: 10000;
            box-shadow: var(--shadow-large);
            animation: popIn 0.3s ease-out forwards;
        `;
        notification.textContent = `${skillName} - ${category.charAt(0).toUpperCase() + category.slice(1)}`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'popOut 0.3s ease-in forwards';
            setTimeout(() => notification.remove(), 300);
        }, 1500);
    }
    
    // Add CSS animations for the new effects
    const skillsStyleSheet = document.createElement('style');
    skillsStyleSheet.textContent = `
        @keyframes jiggle {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(1deg); }
            75% { transform: rotate(-1deg); }
        }
        
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            25% { transform: translateY(-5px) rotate(0.5deg); }
            50% { transform: translateY(-3px) rotate(0deg); }
            75% { transform: translateY(-7px) rotate(-0.5deg); }
        }
        
        @keyframes popIn {
            to {
                transform: translate(-50%, -50%) scale(1);
            }
        }
        
        @keyframes popOut {
            to {
                transform: translate(-50%, -50%) scale(0);
                opacity: 0;
            }
        }
        
        /* Honeycomb breathing effect */
        .skills-honeycomb::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 200%;
            height: 200%;
            transform: translate(-50%, -50%);
            background: radial-gradient(circle, rgba(var(--primary-color-rgb), 0.03) 0%, transparent 50%);
            animation: breathe 4s ease-in-out infinite;
            pointer-events: none;
            z-index: 0;
        }
        
        @keyframes breathe {
            0%, 100% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -50%) scale(1.1); }
        }
        
        .skills-honeycomb {
            position: relative;
        }
    `;
    
    document.head.appendChild(skillsStyleSheet);
});
