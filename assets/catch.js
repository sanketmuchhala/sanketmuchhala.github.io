/*
 * Catch Me If You Can Game Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    const hero = document.getElementById('hero');
    const profileImage = document.getElementById('profile-image');
    if (!hero || !profileImage) return;

    const heroContent = hero.querySelector('.hero-content');
    let gameLayer = null;
    let movingDp = null;
    let toast = null;
    let bubble = null;
    let animationFrameId = null;

    // --- Game State ---
    let gameState = 'off'; // 'off', 'playing', 'caught'

    // --- Physics & Movement ---
    let pos = { x: 0, y: 0 };
    let vel = { x: 0, y: 0 };
    let mousePos = { x: -1000, y: -1000 };
    let viewport = { width: 0, height: 0 };
    let dpSize = { width: 0, height: 0 };

    const BASE_SPEED = 160; // px/sec
    const DAMPING = 0.996;
    const RESTITUTION = 0.98;
    const EVASIVE_FORCE = 0.5;
    const EVASIVE_RADIUS = 160;
    const WIGGLE_STRENGTH = 0.1;

    // --- Accessibility ---
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = motionQuery.matches;

    function initGame() {
        // Add a tooltip hint to the profile image
        const parent = profileImage.parentElement;
        if (parent && !parent.classList.contains('profile-image-container')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'profile-image-container';
            parent.insertBefore(wrapper, profileImage);
            wrapper.appendChild(profileImage);

            const tooltip = document.createElement('span');
            tooltip.className = 'profile-image-tooltip';
            tooltip.innerHTML = '🎮 Click to play!';
            wrapper.appendChild(tooltip);
        }

        profileImage.addEventListener('click', startGame);
        motionQuery.addEventListener('change', () => {
            prefersReducedMotion = motionQuery.matches;
        });
    }

    function startGame() {
        if (gameState !== 'off') return;
        gameState = 'playing';

        // 1. Get initial dimensions
        const rect = profileImage.getBoundingClientRect();
        dpSize = { width: rect.width, height: rect.height };
        viewport = { width: window.innerWidth, height: window.innerHeight };

        // 2. Hide hero content
        if (heroContent) {
            heroContent.classList.add('is-hidden');
        }

        // 3. Create and inject game UI
        createGameLayer();

        // 4. Position the moving DP
        pos = { x: viewport.width / 2, y: viewport.height / 2 };
        const speed = (Math.min(viewport.width, viewport.height) / 1000) * BASE_SPEED;
        vel = { 
            x: (Math.random() - 0.5) * 2 * speed,
            y: (Math.random() - 0.5) * 2 * speed
        };

        // 5. Add event listeners
        window.addEventListener('resize', onResize);
        document.addEventListener('visibilitychange', onVisibilityChange);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('touchmove', onTouchMove);

        // 6. Start the game loop
        if (!prefersReducedMotion) {
            animationFrameId = requestAnimationFrame(gameLoop);
        } else {
            // Handle reduced motion: DP is static, show note
            movingDp.style.transform = `translate3d(${pos.x - dpSize.width/2}px, ${pos.y - dpSize.height/2}px, 0)`;
            const note = document.createElement('p');
            note.className = 'reduced-motion-note';
            note.innerHTML = '🎯 Motion reduced for accessibility. I\'ll stay still—click me when ready!';
            gameLayer.appendChild(note);
        }
    }

    function createGameLayer() {
        gameLayer = document.createElement('div');
        gameLayer.className = 'game-layer';

        const title = document.createElement('h2');
        title.className = 'cm-title';
        title.textContent = 'Catch Me If You Can';

        const subtext = document.createElement('p');
        subtext.className = 'cm-sub';
        subtext.innerHTML = '✨ Click the moving photo to catch me! I\'ll try to dodge your cursor... let\'s see if you can keep up! 🏃‍♂️';

        const exitButton = document.createElement('button');
        exitButton.className = 'cm-exit';
        exitButton.innerHTML = '&times;';
        exitButton.setAttribute('aria-label', 'Exit game');
        exitButton.onclick = exitGame;

        movingDp = document.createElement('div');
        movingDp.className = 'cm-dp';
        movingDp.style.width = `${dpSize.width}px`;
        movingDp.style.height = `${dpSize.height}px`;
        
        // Clone profile image styles (like the border ring)
        const computedStyle = window.getComputedStyle(profileImage);
        movingDp.style.border = computedStyle.border;
        movingDp.style.boxShadow = computedStyle.boxShadow;

        const img = document.createElement('img');
        img.src = profileImage.src;
        img.alt = 'Moving target to catch';
        movingDp.appendChild(img);

        movingDp.addEventListener('click', handleCatch);

        gameLayer.append(title, subtext, exitButton, movingDp);
        document.body.appendChild(gameLayer);
    }

    let lastTime = 0;
    function gameLoop(timestamp) {
        if (gameState !== 'playing') return;

        const dt = (timestamp - (lastTime || timestamp)) / 1000;
        lastTime = timestamp;

        // 1. Calculate forces
        // Evasive force
        const dx = pos.x - mousePos.x;
        const dy = pos.y - mousePos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < EVASIVE_RADIUS) {
            const angle = Math.atan2(dy, dx);
            const force = (EVASIVE_RADIUS - dist) / EVASIVE_RADIUS * EVASIVE_FORCE;
            vel.x += Math.cos(angle) * force;
            vel.y += Math.sin(angle) * force;
        }

        // Random wiggle
        vel.x += (Math.random() - 0.5) * WIGGLE_STRENGTH;
        vel.y += (Math.random() - 0.5) * WIGGLE_STRENGTH;

        // 2. Apply damping
        vel.x *= DAMPING;
        vel.y *= DAMPING;

        // 3. Update position
        pos.x += vel.x * dt * 60; // Scale by 60fps factor
        pos.y += vel.y * dt * 60;

        // 4. Handle wall collisions
        if (pos.x - dpSize.width / 2 < 0) { pos.x = dpSize.width / 2; vel.x *= -RESTITUTION; }
        if (pos.x + dpSize.width / 2 > viewport.width) { pos.x = viewport.width - dpSize.width / 2; vel.x *= -RESTITUTION; }
        if (pos.y - dpSize.height / 2 < 0) { pos.y = dpSize.height / 2; vel.y *= -RESTITUTION; }
        if (pos.y + dpSize.height / 2 > viewport.height) { pos.y = viewport.height - dpSize.height / 2; vel.y *= -RESTITUTION; }

        // Safety checks
        if (isNaN(pos.x) || !isFinite(pos.x)) { pos.x = viewport.width / 2; vel.x = 0; }
        if (isNaN(pos.y) || !isFinite(pos.y)) { pos.y = viewport.height / 2; vel.y = 0; }

        // 5. Update transform
        movingDp.style.transform = `translate3d(${pos.x - dpSize.width/2}px, ${pos.y - dpSize.height/2}px, 0)`;

        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function handleCatch() {
        if (gameState !== 'playing') return;
        gameState = 'caught';

        // Stop movement
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;

        // Show toast and bubble
        createCaughtUI();
    }

    function createCaughtUI() {
        toast = document.createElement('div');
        toast.className = 'cm-toast';
        toast.innerHTML = `
            <h3>🎉 You caught me!</h3>
            <span class="cookie-emoji">🍪</span>
            <p>Impressive reflexes! Here's your well-deserved cookie 🏆</p>
            <div class="cm-toast-buttons">
                <button id="play-again-btn" class="btn btn-primary">🎮 Play Again</button>
                <button id="exit-game-btn" class="btn btn-secondary">✨ Exit</button>
            </div>
        `;
        document.body.appendChild(toast);
        toast.querySelector('#play-again-btn').onclick = playAgain;
        toast.querySelector('#exit-game-btn').onclick = exitGame;

        bubble = document.createElement('div');
        bubble.className = 'cm-bubble';
        bubble.setAttribute('role', 'status');
        bubble.setAttribute('aria-live', 'polite');
        bubble.innerHTML = '😄 Don\'t worry—these aren\'t those kinds of website cookies! <br>This one\'s way tastier! 🍪✨';
        document.body.appendChild(bubble);
        positionBubble();
        setTimeout(() => bubble.classList.add('visible'), 100); // Animate in
    }

    function positionBubble() {
        if (!bubble || !movingDp) return;
        const dpRect = movingDp.getBoundingClientRect();
        const bubbleRect = bubble.getBoundingClientRect();

        let top = dpRect.top - bubbleRect.height - 10;
        let left = dpRect.left + dpRect.width / 2 - bubbleRect.width / 2;

        // Adjust if out of viewport
        if (top < 10) top = dpRect.bottom + 10;
        if (left < 10) left = 10;
        if (left + bubbleRect.width > viewport.width - 10) left = viewport.width - bubbleRect.width - 10;

        bubble.style.top = `${top}px`;
        bubble.style.left = `${left}px`;
    }

    function playAgain() {
        // Reset UI
        if (toast) toast.remove();
        if (bubble) bubble.remove();
        toast = null;
        bubble = null;

        // Reset game state
        gameState = 'playing';
        
        // Reset position and velocity instead of calling startGame()
        pos = { x: viewport.width / 2, y: viewport.height / 2 };
        const speed = (Math.min(viewport.width, viewport.height) / 1000) * BASE_SPEED;
        vel = { 
            x: (Math.random() - 0.5) * 2 * speed,
            y: (Math.random() - 0.5) * 2 * speed
        };
        
        // Restart the game loop if motion is allowed
        if (!prefersReducedMotion) {
            lastTime = 0;
            animationFrameId = requestAnimationFrame(gameLoop);
        }
    }

    function exitGame() {
        // Stop loop
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;

        // Remove game elements
        if (gameLayer) gameLayer.remove();
        if (toast) toast.remove();
        if (bubble) bubble.remove();
        gameLayer = null;
        toast = null;
        bubble = null;

        // Restore hero content
        if (heroContent) {
            heroContent.classList.remove('is-hidden');
        }

        // Remove event listeners
        window.removeEventListener('resize', onResize);
        document.removeEventListener('visibilitychange', onVisibilityChange);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('touchmove', onTouchMove);

        // Reset state and focus
        gameState = 'off';
        profileImage.focus();
    }

    // --- Event Handlers ---
    function onResize() {
        viewport = { width: window.innerWidth, height: window.innerHeight };
        if (gameState === 'caught') {
            positionBubble();
        }
    }

    function onVisibilityChange() {
        if (document.hidden) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        } else if (gameState === 'playing' && !animationFrameId) {
            lastTime = 0; // Reset time to avoid large jump
            animationFrameId = requestAnimationFrame(gameLoop);
        }
    }

    function onMouseMove(e) {
        mousePos = { x: e.clientX, y: e.clientY };
    }

    function onTouchMove(e) {
        if (e.touches.length > 0) {
            mousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    }

    // --- Let's go! ---
    initGame();
});
