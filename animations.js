/* Animations JavaScript - Progressive enhancement for polished interactions */

(function() {
    'use strict';

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        return; // Exit early if user prefers reduced motion
    }

    // Initialize all animations when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAnimations);
    } else {
        initAnimations();
    }

    function initAnimations() {
        initScrollReveal();
        initDropdownNavigation();
        initSmoothScrolling();
        enhanceTypingAnimation();
    }

    // Enhanced scroll-reveal animations using IntersectionObserver
    function initScrollReveal() {
        const observerOptions = {
            threshold: 0.05,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add delay for staggered effect
                    const delay = parseInt(entry.target.dataset.delay) || 0;
                    setTimeout(() => {
                        entry.target.classList.add('is-visible');
                    }, delay);
                    observer.unobserve(entry.target); // Animate only once
                }
            });
        }, observerOptions);

        // Animation type mapping for variety
        const animationTypes = ['fade-in-up', 'fade-in-left', 'fade-in-right', 'scale-in'];
        
        // Add varied animations to sections
        const sections = document.querySelectorAll('section[data-animate]');
        sections.forEach((section, index) => {
            const animationType = animationTypes[index % animationTypes.length];
            section.classList.add(animationType);
            section.dataset.delay = index * 200; // Stagger sections
            observer.observe(section);
        });

        // Auto-add animations to cards and interactive elements
        const autoAnimateSelectors = [
            { selector: '.section-header', animation: 'fade-in-up', baseDelay: 0 },
            { selector: '.project-card', animation: 'scale-in', baseDelay: 100 },
            { selector: '.skill-category', animation: 'fade-in-up', baseDelay: 150 },
            { selector: '.timeline-item', animation: 'fade-in-left', baseDelay: 200 },
            { selector: '.blog-card', animation: 'fade-in-right', baseDelay: 100 },
            { selector: '.cert-card', animation: 'scale-in', baseDelay: 150 },
            { selector: '.stat-item', animation: 'scale-in', baseDelay: 100 },
            { selector: '.collage-item', animation: 'scale-in', baseDelay: 80 }
        ];

        autoAnimateSelectors.forEach(({ selector, animation, baseDelay }) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((el, index) => {
                if (!el.hasAttribute('data-animate')) {
                    el.setAttribute('data-animate', '');
                    el.classList.add(animation);
                    el.dataset.delay = baseDelay + (index * 150); // Stagger within groups
                    observer.observe(el);
                }
            });
        });

        // Special handling for hero elements with entrance animations
        const heroElements = [
            { selector: '.hero-title', delay: 0 },
            { selector: '.hero-subtitle', delay: 300 },
            { selector: '.hero-description', delay: 600 },
            { selector: '.hero-buttons', delay: 900 },
            { selector: '.hero-image', delay: 1200, animation: 'scale-in' }
        ];

        heroElements.forEach(({ selector, delay, animation = 'fade-in-up' }) => {
            const element = document.querySelector(selector);
            if (element && !element.hasAttribute('data-animate')) {
                element.setAttribute('data-animate', '');
                element.classList.add(animation);
                element.dataset.delay = delay;
                observer.observe(element);
            }
        });
    }

    // Enhanced dropdown navigation with keyboard support
    function initDropdownNavigation() {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');
        
        if (!hamburger || !navMenu) return;

        // Click handler for hamburger
        hamburger.addEventListener('click', toggleDropdown);
        
        // Keyboard handler for hamburger
        hamburger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleDropdown();
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                closeDropdown();
            }
        });

        // Close dropdown with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeDropdown();
            }
        });

        // Close dropdown when clicking on nav links
        navLinks.forEach(link => {
            link.addEventListener('click', closeDropdown);
        });

        // Keyboard navigation within dropdown
        navMenu.addEventListener('keydown', (e) => {
            const focusableElements = navMenu.querySelectorAll('.nav-link, button');
            const focusedIndex = Array.from(focusableElements).indexOf(document.activeElement);

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    const nextIndex = (focusedIndex + 1) % focusableElements.length;
                    focusableElements[nextIndex].focus();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    const prevIndex = focusedIndex > 0 ? focusedIndex - 1 : focusableElements.length - 1;
                    focusableElements[prevIndex].focus();
                    break;
                case 'Home':
                    e.preventDefault();
                    focusableElements[0].focus();
                    break;
                case 'End':
                    e.preventDefault();
                    focusableElements[focusableElements.length - 1].focus();
                    break;
            }
        });

        function toggleDropdown() {
            const isOpen = navMenu.classList.contains('active');
            if (isOpen) {
                closeDropdown();
            } else {
                openDropdown();
            }
        }

        function openDropdown() {
            hamburger.classList.add('active');
            navMenu.classList.add('active');
            hamburger.setAttribute('aria-expanded', 'true');
            navMenu.setAttribute('role', 'menu');
            
            // Set focus to first nav link after animation
            setTimeout(() => {
                const firstLink = navMenu.querySelector('.nav-link');
                if (firstLink) firstLink.focus();
            }, 50);
        }

        function closeDropdown() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            navMenu.removeAttribute('role');
            
            // Return focus to hamburger
            if (document.activeElement !== hamburger && navMenu.contains(document.activeElement)) {
                hamburger.focus();
            }
        }

        // Initialize ARIA attributes
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-controls', 'nav-menu');
        hamburger.setAttribute('aria-label', 'Toggle navigation menu');
    }

    // Enhanced smooth scrolling with offset for sticky header
    function initSmoothScrolling() {
        const navbarHeight = document.getElementById('navbar')?.offsetHeight || 70;
        
        // Handle anchor links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;

            const href = link.getAttribute('href');
            if (href === '#') return;

            const targetElement = document.querySelector(href);
            if (!targetElement) return;

            e.preventDefault();
            
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Update URL without causing scroll jump
            if (history.pushState) {
                history.pushState(null, null, href);
            }

            // Handle focus for accessibility
            targetElement.setAttribute('tabindex', '-1');
            targetElement.focus();
            targetElement.addEventListener('blur', () => {
                targetElement.removeAttribute('tabindex');
            }, { once: true });
        });

        // Handle direct hash navigation (e.g., page load with hash)
        if (window.location.hash) {
            setTimeout(() => {
                const target = document.querySelector(window.location.hash);
                if (target) {
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
    }

    // Enhanced typing animation for hero section
    function enhanceTypingAnimation() {
        const typingElement = document.getElementById('typing-text');
        const cursorElement = document.querySelector('.typing-cursor');
        
        if (!typingElement || !cursorElement) return;

        // Enhanced cursor blinking
        cursorElement.style.animation = 'cursorBlink 1s infinite';
        
        // Add CSS for enhanced cursor animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes cursorBlink {
                0%, 50% { opacity: 1; transform: scale(1); }
                51%, 100% { opacity: 0; transform: scale(1.1); }
            }
            
            .typing-text {
                position: relative;
            }
            
            .typing-text::after {
                content: '';
                position: absolute;
                right: -5px;
                top: 0;
                bottom: 0;
                width: 2px;
                background: currentColor;
                animation: cursorPulse 1.5s infinite;
            }
            
            @keyframes cursorPulse {
                0%, 100% { 
                    opacity: 0;
                    transform: scaleY(1);
                }
                50% { 
                    opacity: 1;
                    transform: scaleY(1.2);
                }
            }
            
            .hero-subtitle {
                position: relative;
                overflow: hidden;
            }
            
            .hero-subtitle::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
                animation: textShimmer 3s infinite;
            }
            
            @keyframes textShimmer {
                0% { left: -100%; }
                50% { left: 100%; }
                100% { left: -100%; }
            }
        `;
        document.head.appendChild(style);

        // Add floating letters effect on hover
        const heroTitle = document.querySelector('.hero-title .name');
        if (heroTitle) {
            const text = heroTitle.textContent;
            heroTitle.innerHTML = text.split('').map((char, i) => 
                `<span class="letter" style="animation-delay: ${i * 100}ms">${char}</span>`
            ).join('');

            // Add letter animation CSS
            const letterStyle = document.createElement('style');
            letterStyle.textContent = `
                .letter {
                    display: inline-block;
                    transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
                }
                
                .hero-title .name:hover .letter {
                    animation: letterFloat 600ms cubic-bezier(0.16, 1, 0.3, 1) both;
                }
                
                @keyframes letterFloat {
                    0%, 100% {
                        transform: translateY(0) rotateZ(0deg);
                    }
                    50% {
                        transform: translateY(-10px) rotateZ(5deg);
                    }
                }
                
                .letter:nth-child(odd) {
                    animation-direction: reverse;
                }
            `;
            document.head.appendChild(letterStyle);
        }
    }

})();