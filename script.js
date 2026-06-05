// Utilities
const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        if (!inThrottle) {
            func.apply(this, arguments);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close mobile menu on outside click
    document.addEventListener('click', function(e) {
        if (hamburger && !hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // Navbar scroll effect
    const handleScroll = throttle(function() {
        if (navbar) {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        }
    }, 16);

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Active nav link tracking
    const updateActiveNav = throttle(function() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-link[href*="#${id}"]`);

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(l => l.classList.remove('active'));
                if (link) link.classList.add('active');
            }
        });
    }, 100);

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    if (themeToggle && themeIcon) {
        // Initialize theme
        const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateIcon(savedTheme);

        themeToggle.addEventListener('click', function(e) {
            e.preventDefault();
            const current = document.documentElement.getAttribute('data-theme') || 'dark';
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('portfolio-theme', next);
            updateIcon(next);
        });

        function updateIcon(theme) {
            themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            themeToggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
        }
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ---- Scroll-triggered animations ----

    // 1. Mark sections (except hero) for entrance animation
    document.querySelectorAll('section').forEach(el => {
        if (!el.classList.contains('hero')) {
            el.classList.add('animate-on-scroll');
        }
    });

    // 2. Mark cards for staggered entrance
    const projectsGrid = document.querySelector('.projects-grid');
    if (projectsGrid) {
        projectsGrid.classList.add('stagger-children');
        projectsGrid.querySelectorAll('.project-card').forEach(card => {
            card.classList.add('animate-on-scroll');
        });
    }

    // Blog list items
    const blogItems = document.querySelectorAll('.blog-list-item');
    blogItems.forEach((item, i) => {
        item.classList.add('animate-on-scroll');
        item.style.transitionDelay = `${i * 60}ms`;
    });

    // 3. Mark timeline items for staggered animation
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, i) => {
        item.style.transitionDelay = `${i * 150}ms`;
    });

    // 3b. Mark education items for staggered animation
    const eduItems = document.querySelectorAll('.education-item');
    eduItems.forEach((item, i) => {
        item.classList.add('animate-on-scroll');
        item.style.transitionDelay = `${i * 150}ms`;
    });

    // 4. Mark skill items for cascading entrance
    const skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach((item, i) => {
        item.classList.add('animate-on-scroll');
        item.style.transitionDelay = `${Math.min(i * 40, 600)}ms`;
    });

    // 5. Mark certification list items
    const certItems = document.querySelectorAll('.cert-list-item');
    certItems.forEach((item, i) => {
        item.classList.add('animate-on-scroll');
        item.style.transitionDelay = `${i * 60}ms`;
    });

    // 7. Create intersection observer
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                animationObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    // 8. Observe all animate-on-scroll elements
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        animationObserver.observe(el);
    });

    // 9. Also observe timeline items (they use their own visible class system)
    timelineItems.forEach(item => {
        animationObserver.observe(item);
    });

    // ---- Motion Design ----

    // Cursor spotlight: a large soft radial glow that lazily follows the pointer
    (function initCursorSpotlight() {
        if (!window.matchMedia('(pointer: fine)').matches) return;
        const el = document.createElement('div');
        el.className = 'cursor-spotlight';
        document.body.appendChild(el);
        let mx = window.innerWidth / 2, my = window.innerHeight / 2;
        let cx = mx, cy = my;
        document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
        (function loop() {
            cx += (mx - cx) * 0.075;
            cy += (my - cy) * 0.075;
            el.style.left = cx + 'px';
            el.style.top  = cy + 'px';
            requestAnimationFrame(loop);
        })();
    })();

    // Card 3D tilt: project / timeline / education cards respond to cursor position
    (function initCardTilt() {
        if (!window.matchMedia('(pointer: fine)').matches) return;
        document.querySelectorAll('.project-card, .timeline-card, .education-item').forEach(card => {
            card.classList.add('js-tilt');
            card.addEventListener('mouseenter', () => {
                card.style.transition = 'transform 0.1s ease, border-color 0.3s ease, box-shadow 0.3s ease';
            });
            card.addEventListener('mousemove', e => {
                const r = card.getBoundingClientRect();
                const x = (e.clientX - r.left)  / r.width  - 0.5;
                const y = (e.clientY - r.top)    / r.height - 0.5;
                card.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateZ(8px)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transition = 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease';
                card.style.transform = '';
            });
        });
    })();

    // Magnetic social links: icons follow the cursor slightly within their hit area
    (function initMagneticLinks() {
        if (!window.matchMedia('(pointer: fine)').matches) return;
        document.querySelectorAll('.hero-social-link').forEach(el => {
            el.addEventListener('mouseenter', () => {
                el.style.transition = 'transform 0.1s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease';
            });
            el.addEventListener('mousemove', e => {
                const r  = el.getBoundingClientRect();
                const dx = (e.clientX - (r.left + r.width  / 2)) * 0.36;
                const dy = (e.clientY - (r.top  + r.height / 2)) * 0.36;
                el.style.transform = `translate(${dx}px, ${dy}px) scale(1.12)`;
            });
            el.addEventListener('mouseleave', () => {
                el.style.transition = 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease';
                el.style.transform = '';
            });
        });
    })();

    // ---- ClaudOS MacBook Modal ----
    const claudosOverlay = document.getElementById('claudos-overlay');
    const claudosIframe = document.getElementById('claudos-iframe');
    const claudosClose = document.getElementById('claudos-close');
    const heroPhoto = document.querySelector('.hero-photo-wrap') || document.querySelector('.hero-photo');

    function closeClaudos() {
        if (claudosOverlay) {
            claudosOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (heroPhoto && claudosOverlay) {
        heroPhoto.addEventListener('click', function() {
            // Lazy-load iframe on first open
            if (claudosIframe && !claudosIframe.src.includes('claudos')) {
                claudosIframe.src = claudosIframe.dataset.src;
            }
            claudosOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        if (claudosClose) {
            claudosClose.addEventListener('click', closeClaudos);
        }

        claudosOverlay.addEventListener('click', function(e) {
            if (e.target === claudosOverlay) {
                closeClaudos();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && claudosOverlay.classList.contains('active')) {
                closeClaudos();
            }
        });
    }

    // ---- Project Screenshot Carousel ----
    const carousels = document.querySelectorAll('.project-carousel');
    
    carousels.forEach(carousel => {
        const slides = carousel.querySelectorAll('.carousel-slide');
        const indicators = carousel.querySelectorAll('.indicator');
        const nextBtn = carousel.querySelector('.next');
        const prevBtn = carousel.querySelector('.prev');
        let currentIndex = 0;
        let interval;
        
        if (slides.length <= 1) return; // No need for carousel logic if only 1 image
        
        function goToSlide(index) {
            slides[currentIndex].classList.remove('active');
            indicators[currentIndex].classList.remove('active');
            
            currentIndex = (index + slides.length) % slides.length;
            
            slides[currentIndex].classList.add('active');
            indicators[currentIndex].classList.add('active');
        }
        
        function nextSlide() { goToSlide(currentIndex + 1); }
        function prevSlide() { goToSlide(currentIndex - 1); }
        
        if (nextBtn) nextBtn.addEventListener('click', (e) => { e.preventDefault(); nextSlide(); });
        if (prevBtn) prevBtn.addEventListener('click', (e) => { e.preventDefault(); prevSlide(); });
        
        indicators.forEach((indicator, i) => {
            indicator.addEventListener('click', (e) => {
                e.preventDefault();
                goToSlide(i);
            });
        });
        
        // Auto rotate
        function startAuto() {
            interval = setInterval(nextSlide, 5000);
        }
        
        function stopAuto() {
            clearInterval(interval);
        }
        
        carousel.addEventListener('mouseenter', stopAuto);
        carousel.addEventListener('mouseleave', startAuto);
        
        startAuto();
    });
});

