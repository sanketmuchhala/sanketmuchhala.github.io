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
        this.catchesPerLevel = 3; // Now 3 catches per level
        this.scorecard = null;
        this.maxLevel = 5; // End game at 5 levels
        this.caughtTargets = []; // Array to store caught targets
        
        // Pokemon data for the game
        this.pokemon = [
            { name: 'Pikachu', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png', sound: 'Pika pi!' },
            { name: 'Charmander', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png', sound: 'Char char!' },
            { name: 'Squirtle', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png', sound: 'Squirtle squirt!' },
            { name: 'Bulbasaur', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png', sound: 'Bulba bulba!' },
            { name: 'Eevee', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png', sound: 'Eevee!' },
            { name: 'Snorlax', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png', sound: 'Snorlax!' },
            { name: 'Mewtwo', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png', sound: 'Mewtwo!' },
            { name: 'Mew', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png', sound: 'Mew mew!' },
            { name: 'Charizard', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png', sound: 'Charizard!' },
            { name: 'Blastoise', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png', sound: 'Blastoise!' },
            { name: 'Venusaur', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png', sound: 'Venusaur!' },
            { name: 'Jigglypuff', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png', sound: 'Jiggly puff!' },
            { name: 'Psyduck', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/54.png', sound: 'Psy duck!' },
            { name: 'Machamp', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/68.png', sound: 'Machamp!' },
            { name: 'Gengar', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png', sound: 'Gengar!' }
        ];
        this.currentPokemonIndex = 0;
        
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
        this.tooltip.textContent = "Let's play Pokemon Come - Hit me!";
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
        instructionText.textContent = 'Pokemon Come - Click the Pokemon to catch them!';
        
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
        progressDisplay.innerHTML = '<span class="score-label">Progress:</span> <span class="score-value" id="progress-value">0/3</span>';
        
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
        funnyLine.id = 'win-funny-line';
        funnyLine.textContent = 'Don\'t worry, these aren\'t website cookies - these are delicious!';
        funnyLine.style.fontStyle = 'italic';
        funnyLine.style.fontSize = '14px';
        funnyLine.style.opacity = '0.8';
        funnyLine.style.marginTop = '10px';
        
        // Add profile image for friendly look
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
        
        // CSS Pokeball
        const pokeball = document.createElement('div');
        pokeball.className = 'pokeball';
        pokeball.setAttribute('aria-label', 'Pokeball reward');
        
        // CSS Pokedex for final level
        const pokedex = document.createElement('div');
        pokedex.className = 'pokedex';
        pokedex.setAttribute('aria-label', 'Complete Pokedex with all caught Pokemon');
        pokedex.style.display = 'none'; // Hidden by default
        
        // Add Pokedex light indicator
        const pokedexLight = document.createElement('div');
        pokedexLight.className = 'pokedex-light';
        pokedex.appendChild(pokedexLight);
        
        // Create Pokemon grid inside Pokedex
        const pokemonGrid = document.createElement('div');
        pokemonGrid.className = 'pokedex-grid';
        
        // Add all 15 Pokemon to the grid
        this.pokemon.forEach(pokemon => {
            const pokemonMini = document.createElement('div');
            pokemonMini.className = 'pokemon-mini';
            pokemonMini.style.backgroundImage = `url('${pokemon.image}')`;
            pokemonMini.setAttribute('title', pokemon.name);
            pokemonGrid.appendChild(pokemonMini);
        });
        
        pokedex.appendChild(pokemonGrid);
        
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
        this.winModal.appendChild(pokeball);
        this.winModal.appendChild(pokedex);
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
        trophy.style.animation = 'none'; // Remove rotation for trophies
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
        // Get current Pokemon
        const currentPokemon = this.pokemon[this.currentPokemonIndex];
        
        this.target = document.createElement('img');
        this.target.className = 'catch-me-target';
        this.target.src = currentPokemon.image;
        this.target.alt = `Moving ${currentPokemon.name} - click to catch!`;
        this.target.setAttribute('tabindex', '0');
        this.target.setAttribute('role', 'button');
        this.target.setAttribute('aria-label', `Catch the moving ${currentPokemon.name}`);
        
        // Store Pokemon data on the target for later use
        this.target.pokemonData = currentPokemon;
        
        // Click handler - use once option to prevent multiple triggers
        this.target.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.catchPokemon(this.target.pokemonData);
        }, { once: true });
        
        // Keyboard handler
        this.target.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                this.catchPokemon(this.target.pokemonData);
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
    
    catchPokemon(pokemonData) {
        if (!this.isGameActive) return;
        
        // Show Pokemon caught message
        this.showPokemonCaught(pokemonData);
        
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
        
        // Move to next Pokemon
        this.currentPokemonIndex = (this.currentPokemonIndex + 1) % this.pokemon.length;
        
        // Update score
        this.catches++;
        console.log(`Caught ${pokemonData.name}! New count: ${this.catches}, Level: ${this.level}`);
        this.updateScorecard();
        
        // Check if level up
        if (this.catches % this.catchesPerLevel === 0 && this.level < this.maxLevel) {
            console.log(`Level up! Moving to level ${this.level + 1}`);
            this.levelUp();
        }
        
        // Show win modal after every catch
        this.showCatchWin();
    }
    
    showPokemonCaught(pokemonData) {
        // Create Pokemon caught notification
        const caughtDisplay = document.createElement('div');
        caughtDisplay.innerHTML = `
            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">
                You caught ${pokemonData.name}!
            </div>
            <div style="font-size: 14px; font-style: italic; opacity: 0.9;">
                "${pokemonData.sound}"
            </div>
        `;
        caughtDisplay.style.cssText = `
            position: fixed;
            top: 15%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(59, 130, 246, 0.95);
            color: white;
            padding: 16px 24px;
            border-radius: 15px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            text-align: center;
            z-index: 10004;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            border: 2px solid rgba(255, 255, 255, 0.2);
            max-width: 280px;
            animation: pokemonCaughtFade 3s ease-out forwards;
        `;
        
        document.body.appendChild(caughtDisplay);
        
        setTimeout(() => {
            if (caughtDisplay.parentNode) {
                caughtDisplay.parentNode.removeChild(caughtDisplay);
            }
        }, 3000);
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
            'Pokemon caught!', 'Great catch!', 'Gotcha!', 'Well done trainer!', 'Excellent!', 
            'You did it!', 'Awesome catch!', 'Perfect!', 'Amazing trainer!', 'Outstanding!'
        ];
        
        if (title) {
            const randomTitle = celebrationTitles[Math.floor(Math.random() * celebrationTitles.length)];
            title.textContent = randomTitle;
        }
        
        if (message) {
            const currentPokemon = this.pokemon[(this.currentPokemonIndex - 1 + this.pokemon.length) % this.pokemon.length];
            message.textContent = `${currentPokemon.name} was caught! Here's your reward.`;
        }
        
        if (statsLine) {
            const currentLevelProgress = this.catches % this.catchesPerLevel;
            const remaining = currentLevelProgress === 0 && this.catches > 0 ? this.catchesPerLevel : currentLevelProgress;
            
            if (this.level >= this.maxLevel) {
                statsLine.textContent = `Amazing! You completed all 5 levels with ${this.catches} catches! Time for a latte!`;
            } else if (this.catches % this.catchesPerLevel === 0) {
                statsLine.textContent = `Level ${this.level}! You're getting faster! Keep going!`;
            } else {
                statsLine.textContent = `Level ${this.level} - ${remaining}/${this.catchesPerLevel} catches. Keep it up!`;
            }
        }
        
        // Show appropriate reward based on level
        const pokeball = this.winModal.querySelector('.pokeball');
        const pokedex = this.winModal.querySelector('.pokedex');
        const funnyLine = document.getElementById('win-funny-line');
        
        if (this.level >= this.maxLevel) {
            // Final level - show pokedex
            if (pokeball) pokeball.style.display = 'none';
            if (pokedex) pokedex.style.display = 'block';
            if (funnyLine) funnyLine.textContent = 'Congratulations! You\'ve completed your Pokedex with all 15 Pokemon!';
        } else {
            // Regular levels - show pokeball
            if (pokeball) pokeball.style.display = 'block';
            if (pokedex) pokedex.style.display = 'none';
            if (funnyLine) funnyLine.textContent = 'Great Pokemon trainer! Here\'s a Pokeball as your reward!';
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