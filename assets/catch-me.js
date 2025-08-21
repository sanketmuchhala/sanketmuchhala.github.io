/**
 * Catch Me If You Can - Game Logic
 * Interactive profile image game for portfolio site
 */

class CatchMeGame {
    constructor() {
        this.isGameActive = false;
        this.moveInterval = null;
        this.target = null;
        this.overlay = null;
        this.winModal = null;
        this.moveTimeout = 800; // Medium difficulty: 800ms between moves
        this.profileImage = null;
        this.tooltip = null;
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        this.findProfileImage();
        if (this.profileImage) {
            this.createTooltip();
            this.attachEventListeners();
            this.createGameOverlay();
        }
    }
    
    findProfileImage() {
        // Try multiple selectors to find the profile image
        const selectors = [
            '.profile-photo',
            '#profile-pic',
            '.profile-pic',
            'img[alt*="profile" i]',
            'img[alt*="dp" i]'
        ];
        
        for (const selector of selectors) {
            this.profileImage = document.querySelector(selector);
            if (this.profileImage) {
                break;
            }
        }
        
        if (!this.profileImage) {
            console.warn('Catch Me Game: Profile image not found');
        }
    }
    
    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'game-tooltip';
        this.tooltip.textContent = "Let's play a game — hit me up";
        this.tooltip.setAttribute('role', 'tooltip');
        this.tooltip.setAttribute('aria-hidden', 'true');
        
        const profileContainer = this.profileImage.closest('.profile-image');
        if (profileContainer) {
            profileContainer.style.position = 'relative';
            profileContainer.appendChild(this.tooltip);
        }
    }
    
    attachEventListeners() {
        this.profileImage.addEventListener('click', (e) => {
            e.preventDefault();
            this.startGame();
        });
        
        // Show/hide tooltip
        const profileContainer = this.profileImage.closest('.profile-image');
        if (profileContainer) {
            profileContainer.addEventListener('mouseenter', () => {
                if (!this.isGameActive && this.tooltip) {
                    this.tooltip.setAttribute('aria-hidden', 'false');
                }
            });
            
            profileContainer.addEventListener('mouseleave', () => {
                if (this.tooltip) {
                    this.tooltip.setAttribute('aria-hidden', 'true');
                }
            });
        }
        
        // Keyboard accessibility
        this.profileImage.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.startGame();
            }
        });
        
        // Ensure profile image is focusable
        if (!this.profileImage.hasAttribute('tabindex')) {
            this.profileImage.setAttribute('tabindex', '0');
        }
    }
    
    createGameOverlay() {
        // Main overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'catch-me-overlay';
        this.overlay.setAttribute('role', 'dialog');
        this.overlay.setAttribute('aria-modal', 'true');
        this.overlay.setAttribute('aria-labelledby', 'game-title');
        
        // Game container
        const gameContainer = document.createElement('div');
        gameContainer.className = 'catch-me-game';
        
        // Instructions
        const instructions = document.createElement('div');
        instructions.className = 'catch-me-instructions';
        instructions.id = 'game-title';
        instructions.textContent = 'Click the moving image to win!';
        instructions.setAttribute('aria-live', 'polite');
        
        gameContainer.appendChild(instructions);
        this.overlay.appendChild(gameContainer);
        
        // Win modal
        this.createWinModal();
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isGameActive) {
                this.endGame();
            }
        });
        
        document.body.appendChild(this.overlay);
    }
    
    createWinModal() {
        this.winModal = document.createElement('div');
        this.winModal.className = 'catch-me-win';
        this.winModal.setAttribute('role', 'dialog');
        this.winModal.setAttribute('aria-labelledby', 'win-title');
        this.winModal.style.display = 'none';
        
        const title = document.createElement('h2');
        title.id = 'win-title';
        title.textContent = 'Congrats — have a cookie';
        
        const message = document.createElement('p');
        message.textContent = 'You caught me! Here\'s your well-deserved reward.';
        
        // CSS Cookie
        const cookie = document.createElement('div');
        cookie.className = 'cookie';
        cookie.setAttribute('aria-label', 'Chocolate chip cookie reward');
        
        const actions = document.createElement('div');
        actions.className = 'catch-me-actions';
        
        const playAgainBtn = document.createElement('button');
        playAgainBtn.className = 'catch-me-btn primary';
        playAgainBtn.textContent = 'Play Again';
        playAgainBtn.addEventListener('click', () => this.restartGame());
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'catch-me-btn';
        closeBtn.textContent = 'Close';
        closeBtn.addEventListener('click', () => this.endGame());
        
        actions.appendChild(playAgainBtn);
        actions.appendChild(closeBtn);
        
        this.winModal.appendChild(title);
        this.winModal.appendChild(message);
        this.winModal.appendChild(cookie);
        this.winModal.appendChild(actions);
        
        this.overlay.appendChild(this.winModal);
    }
    
    startGame() {
        if (this.isGameActive) return;
        
        // Bounce animation
        this.profileImage.classList.add('profile-bouncing');
        setTimeout(() => {
            this.profileImage.classList.remove('profile-bouncing');
        }, 600);
        
        // Start game after bounce
        setTimeout(() => {
            this.isGameActive = true;
            this.overlay.classList.add('active');
            this.createTarget();
            this.startMoving();
            
            // Focus management
            this.overlay.focus();
        }, 700);
    }
    
    createTarget() {
        this.target = document.createElement('img');
        this.target.className = 'catch-me-target';
        this.target.src = this.profileImage.src;
        this.target.alt = 'Moving target - click to catch!';
        this.target.setAttribute('tabindex', '0');
        this.target.setAttribute('role', 'button');
        this.target.setAttribute('aria-label', 'Catch the moving profile image');
        
        // Click handler
        this.target.addEventListener('click', () => this.winGame());
        
        // Keyboard handler
        this.target.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.winGame();
            }
        });
        
        const gameContainer = this.overlay.querySelector('.catch-me-game');
        gameContainer.appendChild(this.target);
        
        // Initial position
        this.moveTarget();
    }
    
    startMoving() {
        this.moveInterval = setInterval(() => {
            if (this.isGameActive && this.target) {
                this.moveTarget();
            }
        }, this.moveTimeout);
    }
    
    moveTarget() {
        if (!this.target) return;
        
        const gameContainer = this.overlay.querySelector('.catch-me-game');
        const containerRect = gameContainer.getBoundingClientRect();
        const targetSize = 120; // Target size from CSS
        
        // Calculate safe boundaries
        const maxX = containerRect.width - targetSize - 20;
        const maxY = containerRect.height - targetSize - 80; // Account for instructions
        const minX = 20;
        const minY = 80;
        
        // Ensure boundaries are valid
        const safeMaxX = Math.max(minX, maxX);
        const safeMaxY = Math.max(minY, maxY);
        
        const x = Math.random() * (safeMaxX - minX) + minX;
        const y = Math.random() * (safeMaxY - minY) + minY;
        
        this.target.style.left = x + 'px';
        this.target.style.top = y + 'px';
    }
    
    winGame() {
        if (!this.isGameActive) return;
        
        this.isGameActive = false;
        clearInterval(this.moveInterval);
        
        // Hide target and show win modal
        if (this.target) {
            this.target.style.display = 'none';
        }
        
        this.winModal.style.display = 'block';
        
        // Focus the first button for accessibility
        const firstButton = this.winModal.querySelector('.catch-me-btn');
        if (firstButton) {
            setTimeout(() => firstButton.focus(), 100);
        }
    }
    
    restartGame() {
        this.winModal.style.display = 'none';
        
        // Remove old target
        if (this.target) {
            this.target.remove();
            this.target = null;
        }
        
        // Restart game
        this.isGameActive = true;
        this.createTarget();
        this.startMoving();
    }
    
    endGame() {
        this.isGameActive = false;
        clearInterval(this.moveInterval);
        
        // Clean up
        if (this.target) {
            this.target.remove();
            this.target = null;
        }
        
        this.winModal.style.display = 'none';
        this.overlay.classList.remove('active');
        
        // Return focus to profile image
        if (this.profileImage) {
            this.profileImage.focus();
        }
    }
}

// Initialize the game when script loads
new CatchMeGame();