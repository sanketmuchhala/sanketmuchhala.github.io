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
        this.moveTimeout = 1200; // Initial difficulty: 1200ms between moves (easier start)
        this.profileImage = null;
        this.tooltip = null;
        
        // Game progression system
        this.catches = 0;
        this.level = 1;
        this.catchesPerLevel = 5;
        this.scorecard = null;
        this.maxLevel = 10;
        this.caughtTargets = []; // Array to store caught targets
        
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
        this.tooltip.textContent = "Let's play a game hit me";
        this.tooltip.setAttribute('role', 'tooltip');
        this.tooltip.setAttribute('aria-hidden', 'false');
        
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
        
        // Tooltip is now always visible to inform users about the game
        
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
        instructions.setAttribute('aria-live', 'polite');
        
        const instructionText = document.createElement('span');
        instructionText.textContent = 'Click the moving image to win!';
        
        const exitButton = document.createElement('button');
        exitButton.className = 'catch-me-exit';
        exitButton.textContent = 'Exit Game';
        exitButton.setAttribute('aria-label', 'Exit the catch me game');
        exitButton.addEventListener('click', () => this.endGame());
        
        instructions.appendChild(instructionText);
        instructions.appendChild(exitButton);
        
        // Create scorecard
        this.createScorecard();
        
        gameContainer.appendChild(instructions);
        gameContainer.appendChild(this.scorecard);
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
    
    createScorecard() {
        this.scorecard = document.createElement('div');
        this.scorecard.className = 'catch-me-scorecard';
        this.scorecard.setAttribute('aria-live', 'polite');
        
        const levelDisplay = document.createElement('div');
        levelDisplay.className = 'score-item';
        levelDisplay.innerHTML = '<span class="score-label">Level:</span> <span class="score-value" id="level-value">1</span>';
        
        const catchesDisplay = document.createElement('div');
        catchesDisplay.className = 'score-item';
        catchesDisplay.innerHTML = '<span class="score-label">Catches:</span> <span class="score-value" id="catches-value">0</span>';
        
        const progressDisplay = document.createElement('div');
        progressDisplay.className = 'score-item';
        progressDisplay.innerHTML = '<span class="score-label">Progress:</span> <span class="score-value" id="progress-value">0/5</span>';
        
        this.scorecard.appendChild(levelDisplay);
        this.scorecard.appendChild(catchesDisplay);
        this.scorecard.appendChild(progressDisplay);
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
        message.id = 'win-message';
        message.textContent = 'You caught me! Here\'s your reward.';
        
        const statsLine = document.createElement('p');
        statsLine.id = 'win-stats';
        statsLine.textContent = 'Amazing! You completed all levels!';
        statsLine.style.fontWeight = '600';
        statsLine.style.color = '#3b82f6';
        statsLine.style.marginTop = '10px';
        
        const funnyLine = document.createElement('p');
        funnyLine.textContent = 'Don\'t worry, these aren\'t website cookies - these are delicious!';
        funnyLine.style.fontStyle = 'italic';
        funnyLine.style.fontSize = '14px';
        funnyLine.style.opacity = '0.8';
        funnyLine.style.marginTop = '10px';
        
        // Add peekaboo image for friendly look
        const peekabooImg = document.createElement('img');
        peekabooImg.src = '/photos/peekaboo.jpg';
        peekabooImg.alt = 'Peekaboo celebration image';
        peekabooImg.style.cssText = `
            width: 80px;
            height: 80px;
            border-radius: 50%;
            margin: 10px auto;
            display: block;
            object-fit: cover;
            border: 2px solid rgba(255, 255, 255, 0.2);
        `;
        
        // CSS Cookie
        const cookie = document.createElement('div');
        cookie.className = 'cookie';
        cookie.setAttribute('aria-label', 'Chocolate chip cookie reward');
        
        const actions = document.createElement('div');
        actions.className = 'catch-me-actions';
        
        const playAgainBtn = document.createElement('button');
        playAgainBtn.className = 'catch-me-btn primary';
        playAgainBtn.textContent = 'Continue';
        // Don't add event listener here - will be set dynamically in showCatchWin
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'catch-me-btn';
        closeBtn.textContent = 'Exit';
        // Don't add event listener here - will be set dynamically in showCatchWin
        
        actions.appendChild(playAgainBtn);
        actions.appendChild(closeBtn);
        
        this.winModal.appendChild(title);
        this.winModal.appendChild(message);
        this.winModal.appendChild(statsLine);
        this.winModal.appendChild(peekabooImg);
        this.winModal.appendChild(funnyLine);
        this.winModal.appendChild(cookie);
        this.winModal.appendChild(actions);
        
        this.overlay.appendChild(this.winModal);
    }
    
    convertTargetToTrophy(target) {
        // Remove all event listeners by cloning the element
        const trophy = target.cloneNode(true);
        target.parentNode.replaceChild(trophy, target);
        
        // Add trophy styling and animation
        trophy.classList.add('catch-me-trophy');
        trophy.style.pointerEvents = 'none'; // Disable clicks
        trophy.style.cursor = 'default';
        trophy.style.animation = 'trophyRotate 4s linear infinite'; // Slower rotation for trophies
        trophy.style.opacity = '0.7'; // Slightly transparent to show they're caught
        trophy.style.border = '3px solid rgba(34, 197, 94, 0.8)'; // Green border for success
        trophy.style.boxShadow = '0 0 20px rgba(34, 197, 94, 0.5)'; // Green glow
        
        // Add to caught targets array
        this.caughtTargets.push(trophy);
        
        // Set current target to null so new one can be created
        this.target = null;
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
            // Clear any existing trophies from previous sessions
            this.caughtTargets.forEach(trophy => {
                if (trophy && trophy.parentNode) {
                    trophy.parentNode.removeChild(trophy);
                }
            });
            this.caughtTargets = [];
            
            // Reset game state for fresh start
            this.catches = 0;
            this.level = 1;
            this.moveTimeout = 1200;
            this.updateScorecard();
            
            this.isGameActive = true;
            this.overlay.classList.add('active');
            this.createTarget();
            this.startMoving();
            
            // Hide tooltip during game
            if (this.tooltip) {
                this.tooltip.style.display = 'none';
            }
            
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
        
        // Click handler - use once option to prevent multiple triggers
        this.target.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.winGame();
        }, { once: true });
        
        // Keyboard handler
        this.target.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                this.winGame();
            }
        }, { once: true });
        
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
        
        // Get responsive target size
        let targetSize = 120; // Desktop default
        if (window.innerWidth <= 768) {
            targetSize = 100; // Mobile
        }
        
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
        
        // Immediately stop the game
        this.isGameActive = false;
        if (this.moveInterval) {
            clearInterval(this.moveInterval);
            this.moveInterval = null;
        }
        
        // Convert target to trophy (keep in place, disable interaction, add trophy animation)
        if (this.target) {
            this.convertTargetToTrophy(this.target);
        }
        
        // Update score
        this.catches++;
        console.log(`Catch! New count: ${this.catches}, Level: ${this.level}`);
        this.updateScorecard();
        
        // Check if level up
        if (this.catches % this.catchesPerLevel === 0 && this.level < this.maxLevel) {
            console.log(`Level up! Moving to level ${this.level + 1}`);
            this.levelUp();
        }
        
        // Show win modal after every catch
        this.showCatchWin();
    }
    
    levelUp() {
        this.level++;
        // Increase difficulty: reduce move timeout by 80ms each level (min 400ms for medium difficulty)
        this.moveTimeout = Math.max(400, this.moveTimeout - 80);
        
        // Update move interval with new difficulty
        if (this.moveInterval) {
            clearInterval(this.moveInterval);
            this.startMoving();
        }
        
        // Show level up notification briefly
        this.showLevelUpNotification();
    }
    
    showCatchWin() {
        // Update win message for regular catch
        const message = document.getElementById('win-message');
        const statsLine = document.getElementById('win-stats');
        const title = document.getElementById('win-title');
        
        // Add variety to celebration titles
        const celebrationTitles = [
            'Great catch!', 'Nice one!', 'Got me!', 'Well done!', 'Excellent!', 
            'You did it!', 'Awesome!', 'Perfect catch!', 'Amazing!', 'Outstanding!'
        ];
        
        if (title) {
            const randomTitle = celebrationTitles[Math.floor(Math.random() * celebrationTitles.length)];
            title.textContent = randomTitle;
        }
        
        if (message) {
            message.textContent = 'You caught me! Here\'s your reward.';
        }
        
        if (statsLine) {
            const currentLevelProgress = this.catches % this.catchesPerLevel;
            const remaining = currentLevelProgress === 0 && this.catches > 0 ? this.catchesPerLevel : currentLevelProgress;
            
            if (this.level >= this.maxLevel) {
                statsLine.textContent = `Amazing! You completed all levels with ${this.catches} catches!`;
            } else if (this.catches % this.catchesPerLevel === 0) {
                statsLine.textContent = `Level ${this.level}! You're getting faster! Keep going!`;
            } else {
                statsLine.textContent = `Level ${this.level} - ${remaining}/${this.catchesPerLevel} catches. Keep it up!`;
            }
        }
        
        // Update button text for continue/exit choice
        const playAgainBtn = this.winModal.querySelector('.catch-me-btn.primary');
        const closeBtn = this.winModal.querySelector('.catch-me-btn:not(.primary)');
        
        if (playAgainBtn && closeBtn) {
            // Clear any existing event listeners
            playAgainBtn.onclick = null;
            closeBtn.onclick = null;
            
            if (this.level >= this.maxLevel) {
                // Final completion
                playAgainBtn.textContent = 'Play Again';
                closeBtn.textContent = 'Exit';
                playAgainBtn.onclick = () => {
                    console.log('Play Again clicked - restarting game');
                    this.restartGame();
                };
                closeBtn.onclick = () => {
                    console.log('Exit clicked - ending game');
                    this.endGame();
                };
            } else {
                // Continue playing
                playAgainBtn.textContent = 'Continue';
                closeBtn.textContent = 'Exit';
                playAgainBtn.onclick = () => {
                    console.log('Continue clicked - continuing game');
                    this.continueGame();
                };
                closeBtn.onclick = () => {
                    console.log('Exit clicked - ending game');
                    this.endGame();
                };
            }
        }
        
        this.winModal.style.display = 'block';
        
        // Focus the continue button for accessibility
        const firstButton = this.winModal.querySelector('.catch-me-btn');
        if (firstButton) {
            setTimeout(() => firstButton.focus(), 100);
        }
    }
    
    continueGame() {
        console.log(`Continue game called. Current catches: ${this.catches}, Level: ${this.level}`);
        this.winModal.style.display = 'none';
        
        // Don't remove old target - it's already converted to trophy
        // Just reset the target reference
        this.target = null;
        
        // Continue game with new target - NO RESET OF CATCHES OR LEVEL
        this.isGameActive = true;
        this.createTarget();
        this.startMoving();
    }
    
    showLevelUpNotification() {
        const notification = document.createElement('div');
        notification.className = 'level-up-notification';
        notification.textContent = `Level ${this.level}! Speed increased!`;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(59, 130, 246, 0.9);
            color: white;
            padding: 15px 25px;
            border-radius: 25px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 16px;
            font-weight: 600;
            z-index: 10003;
            backdrop-filter: blur(10px);
            animation: levelUpPulse 2s ease-out forwards;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 2000);
    }
    
    
    updateScorecard() {
        const levelValue = document.getElementById('level-value');
        const catchesValue = document.getElementById('catches-value');
        const progressValue = document.getElementById('progress-value');
        
        if (levelValue) {
            levelValue.textContent = this.level;
        }
        if (catchesValue) {
            catchesValue.textContent = this.catches;
        }
        if (progressValue) {
            const currentLevelProgress = this.catches % this.catchesPerLevel;
            const remaining = currentLevelProgress === 0 && this.catches > 0 ? this.catchesPerLevel : currentLevelProgress;
            progressValue.textContent = `${remaining}/${this.catchesPerLevel}`;
        }
        
        // Debug logging
        console.log(`Scorecard updated: Level ${this.level}, Catches ${this.catches}`);
    }
    
    restartGame() {
        this.winModal.style.display = 'none';
        
        // Remove old target
        if (this.target) {
            this.target.remove();
            this.target = null;
        }
        
        // Remove all trophy targets
        this.caughtTargets.forEach(trophy => {
            if (trophy && trophy.parentNode) {
                trophy.parentNode.removeChild(trophy);
            }
        });
        this.caughtTargets = [];
        
        // Reset game state
        this.catches = 0;
        this.level = 1;
        this.moveTimeout = 1200; // Reset to easier starting speed
        this.updateScorecard();
        
        // Clear any existing interval
        if (this.moveInterval) {
            clearInterval(this.moveInterval);
            this.moveInterval = null;
        }
        
        // Restart game
        this.isGameActive = true;
        this.createTarget();
        this.startMoving();
    }
    
    endGame() {
        this.isGameActive = false;
        clearInterval(this.moveInterval);
        
        // Clean up active target
        if (this.target) {
            this.target.remove();
            this.target = null;
        }
        
        // Keep trophies when exiting - they'll be cleared on next startGame()
        // Don't reset catches/level here - let them persist until new game starts
        
        this.winModal.style.display = 'none';
        this.overlay.classList.remove('active');
        
        // Show tooltip again when game ends
        if (this.tooltip) {
            this.tooltip.style.display = 'block';
        }
        
        // Return focus to profile image
        if (this.profileImage) {
            this.profileImage.focus();
        }
    }
}

// Initialize the game when script loads
new CatchMeGame();