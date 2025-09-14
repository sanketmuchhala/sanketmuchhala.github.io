/**
 * Fullscreen Slideshow Functionality
 * Provides fullscreen viewing for project slideshows with touch/swipe support
 */

class FullscreenSlideshow {
  constructor() {
    this.overlay = null;
    this.currentSlide = 0;
    this.totalSlides = 0;
    this.slides = [];
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.isAnimating = false;
    this.gestureHintShown = false;
    
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupSlideshows());
    } else {
      this.setupSlideshows();
    }
  }

  setupSlideshows() {
    const slideshows = document.querySelectorAll('.project-slideshow');
    
    slideshows.forEach(slideshow => {
      const images = slideshow.querySelectorAll('.slide img');
      
      images.forEach((img, index) => {
        // Add click handler to open fullscreen
        img.addEventListener('click', (e) => {
          e.preventDefault();
          this.openFullscreen(slideshow, index);
        });
        
        // Add keyboard support
        img.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.openFullscreen(slideshow, index);
          }
        });
        
        // Make images focusable for accessibility
        img.setAttribute('tabindex', '0');
        img.setAttribute('role', 'button');
        img.setAttribute('aria-label', `View image ${index + 1} in fullscreen`);
      });
    });
  }

  openFullscreen(slideshow, startIndex = 0) {
    this.currentSlide = startIndex;
    this.slides = Array.from(slideshow.querySelectorAll('.slide img'));
    this.totalSlides = this.slides.length;
    
    this.createOverlay();
    this.populateFullscreenSlides();
    this.showFullscreen();
    this.updateSlideDisplay();
    this.showGestureHint();
    
    // Prevent body scroll
    document.body.classList.add('fullscreen-active');
    
    // Focus management for accessibility
    this.overlay.focus();
  }

  createOverlay() {
    // Remove existing overlay if any
    const existingOverlay = document.querySelector('.fullscreen-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    this.overlay = document.createElement('div');
    this.overlay.className = 'fullscreen-overlay';
    this.overlay.setAttribute('role', 'dialog');
    this.overlay.setAttribute('aria-label', 'Fullscreen image viewer');
    this.overlay.setAttribute('tabindex', '-1');
    
    this.overlay.innerHTML = `
      <div class="fullscreen-container">
        <div class="fullscreen-controls">
          <button class="fullscreen-btn fullscreen-prev" aria-label="Previous image">
            &#10094;
          </button>
          <button class="fullscreen-btn fullscreen-next" aria-label="Next image">
            &#10095;
          </button>
        </div>
        <button class="fullscreen-close" aria-label="Close fullscreen">
          &#10005;
        </button>
        <div class="fullscreen-dots"></div>
        <div class="fullscreen-counter"></div>
      </div>
    `;
    
    document.body.appendChild(this.overlay);
    this.attachEventListeners();
  }

  populateFullscreenSlides() {
    const container = this.overlay.querySelector('.fullscreen-container');
    const dotsContainer = this.overlay.querySelector('.fullscreen-dots');
    
    // Clear existing slides
    const existingSlides = container.querySelectorAll('.fullscreen-slide');
    existingSlides.forEach(slide => slide.remove());
    
    // Create fullscreen slides
    this.slides.forEach((img, index) => {
      const slide = document.createElement('img');
      slide.className = 'fullscreen-slide';
      slide.src = img.src;
      slide.alt = img.alt;
      slide.loading = 'lazy';
      
      // Add loading state
      slide.addEventListener('load', () => {
        slide.classList.add('loaded');
      });
      
      container.insertBefore(slide, container.firstChild);
      
      // Create dots
      const dot = document.createElement('span');
      dot.className = 'fullscreen-dot';
      dot.setAttribute('aria-label', `Go to image ${index + 1}`);
      dot.addEventListener('click', () => this.goToSlide(index));
      dotsContainer.appendChild(dot);
    });
  }

  attachEventListeners() {
    // Navigation buttons
    this.overlay.querySelector('.fullscreen-prev').addEventListener('click', () => this.previousSlide());
    this.overlay.querySelector('.fullscreen-next').addEventListener('click', () => this.nextSlide());
    this.overlay.querySelector('.fullscreen-close').addEventListener('click', () => this.closeFullscreen());
    
    // Keyboard navigation
    this.overlay.addEventListener('keydown', (e) => this.handleKeydown(e));
    
    // Touch/swipe support
    this.overlay.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
    this.overlay.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
    
    // Click outside to close
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.closeFullscreen();
      }
    });
    
    // Prevent image clicks from closing
    this.overlay.addEventListener('click', (e) => {
      if (e.target.classList.contains('fullscreen-slide')) {
        e.stopPropagation();
      }
    });
  }

  showFullscreen() {
    this.overlay.classList.add('active');
    
    // Animate in
    requestAnimationFrame(() => {
      this.overlay.style.opacity = '0';
      this.overlay.style.transform = 'scale(0.9)';
      
      requestAnimationFrame(() => {
        this.overlay.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        this.overlay.style.opacity = '1';
        this.overlay.style.transform = 'scale(1)';
      });
    });
  }

  closeFullscreen() {
    this.overlay.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    this.overlay.style.opacity = '0';
    this.overlay.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
      this.overlay.remove();
      document.body.classList.remove('fullscreen-active');
    }, 300);
  }

  nextSlide() {
    if (this.isAnimating) return;
    
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
    this.updateSlideDisplay();
  }

  previousSlide() {
    if (this.isAnimating) return;
    
    this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    this.updateSlideDisplay();
  }

  goToSlide(index) {
    if (this.isAnimating || index === this.currentSlide) return;
    
    this.currentSlide = index;
    this.updateSlideDisplay();
  }

  updateSlideDisplay() {
    const slides = this.overlay.querySelectorAll('.fullscreen-slide');
    const dots = this.overlay.querySelectorAll('.fullscreen-dot');
    const counter = this.overlay.querySelector('.fullscreen-counter');
    
    // Update slides
    slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === this.currentSlide);
    });
    
    // Update dots
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentSlide);
    });
    
    // Update counter
    if (counter) {
      counter.textContent = `${this.currentSlide + 1} / ${this.totalSlides}`;
    }
  }

  handleKeydown(e) {
    switch (e.key) {
      case 'Escape':
        this.closeFullscreen();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.previousSlide();
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.nextSlide();
        break;
      case ' ':
        e.preventDefault();
        this.nextSlide();
        break;
    }
  }

  handleTouchStart(e) {
    this.touchStartX = e.touches[0].clientX;
  }

  handleTouchEnd(e) {
    this.touchEndX = e.changedTouches[0].clientX;
    this.handleSwipe();
  }

  handleSwipe() {
    const swipeThreshold = 50;
    const diff = this.touchStartX - this.touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        this.nextSlide();
      } else {
        this.previousSlide();
      }
    }
  }

  showGestureHint() {
    if (this.gestureHintShown) return;
    
    const hint = document.createElement('div');
    hint.className = 'fullscreen-gesture-hint';
    hint.innerHTML = 'Swipe to navigate • Tap outside to close';
    this.overlay.querySelector('.fullscreen-container').appendChild(hint);
    
    this.gestureHintShown = true;
    
    setTimeout(() => {
      if (hint.parentNode) {
        hint.remove();
      }
    }, 3000);
  }
}

// Initialize fullscreen slideshow when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new FullscreenSlideshow();
});

// Also initialize if script is loaded after DOM is ready
if (document.readyState !== 'loading') {
  new FullscreenSlideshow();
}
