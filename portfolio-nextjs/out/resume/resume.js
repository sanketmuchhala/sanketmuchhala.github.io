// Resume page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu functionality
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a nav link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
    
    // If I paste a RAW Markdown or JSON URL of my resume here, the page should render it.
    const RESUME_SOURCE_URL = ""; // I will paste a link later (e.g., GitHub raw .md or .json)
    
    // Load resume content from source if URL is provided
    if (RESUME_SOURCE_URL) {
        loadResumeFromSource(RESUME_SOURCE_URL);
    }
});

async function loadResumeFromSource(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const content = await response.text();
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            renderResumeFromJSON(JSON.parse(content));
        } else {
            renderResumeFromMarkdown(content);
        }
    } catch (error) {
        console.warn('Failed to load resume from source:', error);
        // Silently fail - keep existing HTML content
    }
}

function renderResumeFromJSON(data) {
    // Expect JSON with keys: summary, experience[], projects[], education[], skills, tech, certs, awards
    const content = document.querySelector('.resume-content');
    
    if (data.summary) {
        const summarySection = content.querySelector('.resume-section:first-of-type');
        if (summarySection) {
            summarySection.querySelector('p').textContent = data.summary;
        }
    }
    
    // Render other sections as needed
    // This is a basic implementation - expand based on your JSON structure
}

function renderResumeFromMarkdown(markdown) {
    // Basic Markdown to HTML conversion (very lightweight)
    let html = markdown
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
        .replace(/\n\n/g, '</p>\n<p>')
        .replace(/^(.+)$/gim, '<p>$1</p>');
    
    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    
    // This is a very basic implementation - you may want to use a proper Markdown parser
    // For now, it just provides the structure for you to paste content
}
