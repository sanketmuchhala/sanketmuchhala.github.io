// Simple Photo Gallery JavaScript
class PhotoGallery {
    constructor() {
        this.photos = [];
        this.init();
    }
    
    init() {
        this.loadPhotos();
        this.setupEventListeners();
    }
    
    loadPhotos() {
        // Using stock images for the collage layout
        const photoFiles = [
            { 
                src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', 
                size: 'featured',
                title: 'Mountain Landscape'
            },
            { 
                src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop', 
                size: 'large',
                title: 'Forest Path'
            },
            { 
                src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', 
                size: 'medium',
                title: 'Mountain Peak'
            },
            { 
                src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop', 
                size: 'small',
                title: 'Forest Detail'
            },
            { 
                src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=200&fit=crop', 
                size: 'wide',
                title: 'Mountain Range'
            },
            { 
                src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=400&fit=crop', 
                size: 'tall',
                title: 'Tall Trees'
            }
        ];
        
        this.photos = photoFiles;
        this.renderPhotos();
    }
    
    renderPhotos() {
        const grid = document.getElementById('collageGrid');
        grid.innerHTML = '';
        
        this.photos.forEach((photo, index) => {
            const photoItem = document.createElement('div');
            photoItem.className = `photo-item ${photo.size}`;
            photoItem.setAttribute('data-index', index);
            
            const img = document.createElement('img');
            img.src = photo.src;
            img.alt = photo.title;
            img.loading = 'lazy';
            
            // Add error handling for images
            img.onerror = () => {
                photoItem.style.display = 'none';
                console.warn(`Failed to load image: ${photo.src}`);
            };
            
            photoItem.appendChild(img);
            grid.appendChild(photoItem);
            
            // Add click event to open modal
            photoItem.addEventListener('click', () => {
                this.openModal(index);
            });
        });
    }
    
    setupEventListeners() {
        // Modal controls
        document.getElementById('photoModal').addEventListener('click', (e) => {
            if (e.target.id === 'photoModal') {
                this.closeModal();
            }
        });
        
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('photoModal').style.display === 'block') {
                if (e.key === 'Escape') {
                    this.closeModal();
                }
            }
        });
    }
    
    openModal(photoIndex) {
        const modal = document.getElementById('photoModal');
        const modalImage = document.getElementById('modalImage');
        
        modalImage.src = this.photos[photoIndex].src;
        modal.style.display = 'block';
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
    
    closeModal() {
        const modal = document.getElementById('photoModal');
        modal.style.display = 'none';
        
        // Restore body scroll
        document.body.style.overflow = 'auto';
    }
}

// Initialize the gallery when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PhotoGallery();
});
