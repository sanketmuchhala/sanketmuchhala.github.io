
document.addEventListener('DOMContentLoaded', () => {
    console.log('Catch Me game script loaded');
    const hero = document.getElementById('hero');
    const originalDp = document.getElementById('profile-image');

    console.log('Hero element:', hero);
    console.log('Profile image element:', originalDp);

    if (!hero || !originalDp) {
        console.log('Required elements not found, exiting game');
        return;
    }

    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    console.log('Reduced motion preference:', isReducedMotion);

    let mover;
    let exitButton;
    let toast;
    let bounds, moverState, mousePos, animationFrameId;

    function initGame() {
        console.log('Initializing game...');
        hero.classList.add('hero-rink');

        // Clone DP
        mover = originalDp.cloneNode(true);
        mover.id = 'dp-mover';
        mover.classList.add('dp-mover');
        mover.style.width = `${originalDp.offsetWidth}px`;
        mover.style.height = `${originalDp.offsetHeight}px`;
        
        const dpComputedStyle = window.getComputedStyle(originalDp);
        mover.style.border = dpComputedStyle.border;
        mover.style.borderRadius = dpComputedStyle.borderRadius;

        console.log('Mover created with dimensions:', mover.style.width, 'x', mover.style.height);

        originalDp.style.visibility = 'hidden';
        hero.appendChild(mover);

        // Create Exit Button
        exitButton = document.createElement('button');
        exitButton.innerHTML = '&times;';
        exitButton.className = 'cm-exit';
        exitButton.setAttribute('aria-label', 'Exit game');
        hero.appendChild(exitButton);
        exitButton.addEventListener('click', exitGame);

        // Create Toast
        toast = document.createElement('div');
        toast.className = 'cm-toast';
        toast.innerHTML = `
            <p>You caught me — have a coffee!</p>
            <div class="coffee">☕</div>
            <button id="play-again">Play again</button>
            <button id="exit-game">Exit</button>
        `;
        hero.appendChild(toast);
        document.getElementById('play-again').addEventListener('click', () => {
            toast.style.display = 'none';
            resetMover();
            requestAnimationFrame(animate);
        });
        document.getElementById('exit-game').addEventListener('click', exitGame);

        if (isReducedMotion) {
            console.log('Reduced motion detected, but continuing with game anyway');
            exitButton.style.display = 'none';
        }
        
        mover.addEventListener('click', onCatch);

        resetMover();
        console.log('Starting animation...');
        requestAnimationFrame(animate);
    }

    function exitGame() {
        if(animationFrameId) cancelAnimationFrame(animationFrameId);
        if(mover) mover.remove();
        if(exitButton) exitButton.remove();
        if(toast) toast.remove();
        originalDp.style.visibility = 'visible';
        hero.classList.remove('hero-rink');
        document.removeEventListener('mousemove', trackMouse);
        window.removeEventListener('resize', onResize);
    }

    function resetMover() {
        bounds = hero.getBoundingClientRect();
        const moverSize = mover.getBoundingClientRect();

        moverState = {
            x: bounds.width / 2,
            y: bounds.height / 2,
            vx: (Math.random() - 0.5) * 150,
            vy: (Math.random() - 0.5) * 150,
            w: moverSize.width,
            h: moverSize.height,
        };
    }

    let lastTime = 0;
    function animate(currentTime) {
        if (lastTime === 0) {
            lastTime = currentTime;
        }
        const dt = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        updatePosition(dt);

        mover.style.transform = `translate3d(${moverState.x - moverState.w / 2}px, ${moverState.y - moverState.h / 2}px, 0)`;
        animationFrameId = requestAnimationFrame(animate);
    }

    function updatePosition(dt) {
        // Evasion
        if (mousePos) {
            const dx = moverState.x - mousePos.x;
            const dy = moverState.y - mousePos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 180) {
                const angle = Math.atan2(dy, dx);
                const acceleration = 1000 / (distance * 0.1 + 1);
                moverState.vx += Math.cos(angle) * acceleration * dt;
                moverState.vy += Math.sin(angle) * acceleration * dt;
            }
        }

        // Speed cap
        const speed = Math.sqrt(moverState.vx * moverState.vx + moverState.vy * moverState.vy);
        const maxSpeed = 180;
        if (speed > maxSpeed) {
            moverState.vx = (moverState.vx / speed) * maxSpeed;
            moverState.vy = (moverState.vy / speed) * maxSpeed;
        }

        moverState.x += moverState.vx * dt;
        moverState.y += moverState.vy * dt;

        // Wall collision
        const restitution = 0.98;
        if (moverState.x - moverState.w / 2 < 0) {
            moverState.x = moverState.w / 2;
            moverState.vx *= -restitution;
        } else if (moverState.x + moverState.w / 2 > bounds.width) {
            moverState.x = bounds.width - moverState.w / 2;
            moverState.vx *= -restitution;
        }

        if (moverState.y - moverState.h / 2 < 0) {
            moverState.y = moverState.h / 2;
            moverState.vy *= -restitution;
        } else if (moverState.y + moverState.h / 2 > bounds.height) {
            moverState.y = bounds.height - moverState.h / 2;
            moverState.vy *= -restitution;
        }
    }

    function onCatch() {
        cancelAnimationFrame(animationFrameId);
        toast.style.display = 'block';
    }

    function trackMouse(e) {
        const rect = hero.getBoundingClientRect();
        mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function onResize() {
        bounds = hero.getBoundingClientRect();
        // Clamp mover to new bounds
        moverState.x = Math.max(moverState.w / 2, Math.min(moverState.x, bounds.width - moverState.w / 2));
        moverState.y = Math.max(moverState.h / 2, Math.min(moverState.y, bounds.height - moverState.h / 2));
    }
    
    document.addEventListener('mousemove', trackMouse);
    window.addEventListener('resize', onResize);

    initGame();
});
