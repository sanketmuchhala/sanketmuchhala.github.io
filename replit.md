# Overview

This is a modern, responsive portfolio website for Sanket Muchhala, an AI/ML Engineer. The site showcases professional experience, skills, projects, and contact information through a sleek, dark-themed design with animated ribbon background effects. Built as a single-page application using pure HTML, CSS, and JavaScript, it's optimized for GitHub Pages hosting with no build dependencies required.

## Recent Changes (August 2025)
- Enhanced color palette with modern purple/indigo theme
- Improved ribbons animation for continuous smooth movement
- Added company logos to experience section (Progressive, IBM, Indiana University)
- Added university logos to education section
- Integrated user's GitHub profile image in hero section
- Fixed JavaScript navigation errors
- Optimized for GitHub Pages deployment

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Static HTML/CSS/JavaScript**: Pure frontend implementation using vanilla JavaScript for maximum performance and compatibility
- **Single Page Application (SPA)**: All content contained in one HTML file with JavaScript-powered navigation between sections
- **Mobile-First Responsive Design**: CSS Grid and Flexbox layout system with breakpoints for tablets and desktop devices
- **Component-Based Styling**: Modular CSS with CSS custom properties (variables) for consistent theming and maintainability

## Design System
- **CSS Custom Properties**: Centralized design tokens for colors, typography, spacing, and animations stored in `:root` variables
- **Dark Theme**: Professional dark color scheme optimized for modern UI trends and reduced eye strain
- **Typography System**: Inter font family with multiple weight variations for visual hierarchy
- **Animation Framework**: CSS transitions and transforms with cubic-bezier timing functions for smooth interactions

## Navigation System
- **Sticky Navigation**: Fixed header that adapts appearance based on scroll position
- **Mobile Hamburger Menu**: Collapsible navigation for mobile devices with JavaScript toggle functionality
- **Smooth Scrolling**: CSS scroll-behavior and JavaScript-powered section highlighting based on viewport position
- **Active Link Tracking**: Dynamic navigation state management that highlights current section

## Background Effects
- **Ribbons Animation**: Custom JavaScript class (`ribbons.js`) that creates animated low-poly ribbon effects across the entire background
- **Canvas-Based Rendering**: HTML5 Canvas API used for dynamic background animations with optimized performance
- **Responsive Animation**: Background effects that adapt to different screen sizes and scroll positions

## Performance Optimizations
- **External Font Loading**: Google Fonts with preconnect optimization for faster font loading
- **CDN Integration**: Font Awesome icons loaded from CDN for lightweight icon implementation
- **Efficient Event Handling**: Debounced scroll events and optimized DOM manipulation for smooth performance

# External Dependencies

## Fonts and Typography
- **Google Fonts**: Inter font family with multiple weights (300, 400, 500, 600, 700) loaded via CSS import
- **Font Awesome**: Version 6.4.0 icon library loaded from cdnjs.cloudflare.com CDN

## Browser APIs
- **HTML5 Canvas**: Used by the ribbons animation system for dynamic background rendering
- **Intersection Observer API**: Potential usage for scroll-based animations and section detection
- **CSS Custom Properties**: Modern CSS variables for theme management and responsive design

## Third-Party Resources
- **Google Fonts API**: For web font delivery and optimization
- **Cloudflare CDN**: Font Awesome icon library hosting for reliable global delivery

No backend services, databases, or server-side components are required as this is a purely client-side portfolio website.