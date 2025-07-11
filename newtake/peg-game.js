// Pachinko Game Controller
class PegGame {
    constructor(game) {
        this.game = game;
        this.isDropping = false;
        this.lastDropTime = 0;
        this.dropCooldown = 500; // 500ms cooldown between drops
        this.pegs = [];
        this.attackContainers = [];
        this.activeAnimations = [];
        this.cachedBoardRect = null;
        console.log('PegGame initialized');
    }

    setupBoard() {
        console.log('Setting up pachinko board');
        const board = document.getElementById('pachinko-board');
        if (!board) {
            console.error('Pachinko board not found!');
            return;
        }

        this.clearBoard();
        this.createPegs();
        this.setupAttackContainers();
        this.setupBoardEvents();
        
        // Cache board dimensions for physics calculations
        this.cachedBoardRect = board.getBoundingClientRect();
    }

    clearBoard() {
        const board = document.getElementById('pachinko-board');
        // Clear existing pegs
        board.querySelectorAll('.peg').forEach(peg => peg.remove());
        // Clear falling currency items
        board.querySelectorAll('.currency-item').forEach(item => item.remove());
    }

    createPegs() {
        const board = document.getElementById('pachinko-board');
        this.pegs = [];
        
        // Create a triangular peg pattern for better pachinko flow
        const rows = 4;
        const pegSpacing = 15;
        
        for (let row = 0; row < rows; row++) {
            const pegsInRow = row + 3;
            const rowWidth = pegsInRow * pegSpacing;
            const startX = (100 - rowWidth) / 2; // center the row
            
            for (let col = 0; col < pegsInRow; col++) {
                const peg = {
                    x: startX + (col * pegSpacing),
                    y: 15 + (row * 15),
                    radius: 15
                };
                this.pegs.push(peg);
                
                const pegElement = document.createElement('div');
                pegElement.className = 'peg';
                pegElement.style.left = peg.x + '%';
                pegElement.style.top = peg.y + '%';
                board.appendChild(pegElement);
            }
        }
    }

    setupAttackContainers() {
        const containersArea = document.getElementById('attack-containers');
        if (!containersArea) {
            console.error('Attack containers area not found!');
            return;
        }
        
        containersArea.innerHTML = '';
        this.attackContainers = [];
        
        // Add attack containers
        ATTACK_TEMPLATES.forEach((attack, index) => {
            const container = document.createElement('div');
            container.className = 'attack-container';
            container.innerHTML = `
                <div class="emoji">${attack.emoji}</div>
                <div style="font-size: 8px; margin-bottom: 2px;">${attack.name}</div>
                <div style="font-size: 10px; font-weight: bold;">${attack.damage} DMG</div>
            `;
            containersArea.appendChild(container);
            
            this.attackContainers.push({
                type: 'attack',
                data: attack,
                element: container
            });
        });
        
        // Add multiplier containers
        MULTIPLIER_TEMPLATES.forEach((multiplier, index) => {
            const container = document.createElement('div');
            container.className = 'attack-container multiplier-container';
            container.innerHTML = `
                <div class="emoji">✨</div>
                <div style="font-size: 8px; margin-bottom: 2px;">Multiplier</div>
                <div style="font-size: 12px; font-weight: bold;">${multiplier.name}</div>
            `;
            containersArea.appendChild(container);
            
            this.attackContainers.push({
                type: 'multiplier',
                data: multiplier,
                element: container
            });
        });
    }

    setupBoardEvents() {
        const board = document.getElementById('pachinko-board');
        
        // Remove existing event listeners using the bound function
        if (this.boundHandleBoardClick) {
            board.removeEventListener('click', this.boundHandleBoardClick);
        }
        
        // Bind function once and store reference
        this.boundHandleBoardClick = this.handleBoardClick.bind(this);
        
        // Add click listener for dropping currency
        board.addEventListener('click', this.boundHandleBoardClick);
    }

    handleBoardClick(e) {
        const currentTime = Date.now();
        
        // Debounce rapid clicks
        if (currentTime - this.lastDropTime < this.dropCooldown) {
            return;
        }
        
        if (this.game.gameState.currentScreen === 'game-screen' && !this.isDropping) {
            this.lastDropTime = currentTime;
            this.dropCurrency(e.clientX, e.clientY);
        }
    }

    dropCurrency(clientX, clientY) {
        if (this.game.gameState.currency <= 0) {
            this.game.showPopup("Game Over!", "You ran out of coins! Your mecha has been destroyed!");
            this.game.showScreen('menu-screen');
            return;
        }

        // Use cached rect for better performance
        if (!this.cachedBoardRect) {
            const board = document.getElementById('pachinko-board');
            this.cachedBoardRect = board.getBoundingClientRect();
        }

        const x = clientX - this.cachedBoardRect.left;
        const y = 50; // Start from top

        this.game.gameState.currency--;
        this.isDropping = true;
        this.game.updateCurrency();

        const currencyItem = document.createElement('div');
        currencyItem.className = 'currency-item';
        currencyItem.style.left = x + 'px';
        currencyItem.style.top = y + 'px';
        
        const board = document.getElementById('pachinko-board');
        board.appendChild(currencyItem);

        this.simulatePhysics(currencyItem, x, y);
        this.playDropSound();
    }

    simulatePhysics(item, startX, startY) {
        let x = startX;
        let y = startY;
        let vx = (Math.random() - 0.5) * 4;
        let vy = 0;
        let animationId;
        
        // Add timeout-based cleanup to prevent memory leaks
        const cleanupTimeout = setTimeout(() => {
            if (item && item.parentNode) {
                item.remove();
            }
            this.isDropping = false;
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        }, GAME_CONFIG.PHYSICS_TIMEOUT); // Use config value
        
        const animate = () => {
            // Apply gravity
            vy += GAME_CONFIG.GRAVITY;
            x += vx;
            y += vy;
            
            // Check peg collisions using cached board dimensions
            this.pegs.forEach(peg => {
                const pegX = (peg.x / 100) * this.cachedBoardRect.width;
                const pegY = (peg.y / 100) * this.cachedBoardRect.height;
                
                const dx = x - pegX;
                const dy = y - pegY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < peg.radius + 15) {
                    // Bounce off peg
                    const angle = Math.atan2(dy, dx);
                    vx = Math.cos(angle) * 3;
                    vy = Math.sin(angle) * 3;
                    x = pegX + Math.cos(angle) * (peg.radius + 15);
                    y = pegY + Math.sin(angle) * (peg.radius + 15);
                }
            });
            
            // Check bounds
            if (x < 15) {
                x = 15;
                vx = Math.abs(vx);
            }
            if (x > this.cachedBoardRect.width - 15) {
                x = this.cachedBoardRect.width - 15;
                vx = -Math.abs(vx);
            }
            
            // Update position
            item.style.left = x + 'px';
            item.style.top = y + 'px';
            
            // Check if reached bottom
            if (y > this.cachedBoardRect.height - 140) {
                clearTimeout(cleanupTimeout);
                this.handleContainerHit(item, x);
                return;
            }
            
            // Store animation ID for cleanup
            animationId = requestAnimationFrame(animate);
            this.activeAnimations.push(animationId);
        };
        
        animate();
    }

    handleContainerHit(item, x) {
        // Calculate container positions dynamically
        const containerWidth = this.cachedBoardRect.width / this.attackContainers.length;
        const containerIndex = Math.floor(x / containerWidth);
        const clampedIndex = Math.max(0, Math.min(containerIndex, this.attackContainers.length - 1));
        
        const container = this.attackContainers[clampedIndex];
        
        if (container.type === 'attack') {
            this.game.mechaBattle.performAttack(container.data);
        } else if (container.type === 'multiplier') {
            this.game.mechaBattle.applyMultiplier(container.data);
        }
        
        // Flash container
        this.flashContainer(container.element);
        
        // Clean up
        if (item && item.parentNode) {
            item.remove();
        }
        this.isDropping = false;
    }

    flashContainer(containerElement) {
        const originalBackground = containerElement.style.background;
        containerElement.style.background = '#fff';
        setTimeout(() => {
            containerElement.style.background = originalBackground;
        }, 200);
    }

    playDropSound() {
        // Simple sound effect using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            console.warn('Audio failed:', e);
            // Provide visual feedback when audio fails
            this.showVisualFeedback('drop');
        }
    }

    showVisualFeedback(type) {
        const board = document.getElementById('pachinko-board');
        const feedback = document.createElement('div');
        feedback.textContent = type === 'drop' ? '💫' : '🎵';
        feedback.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 20px;
            z-index: 100;
            pointer-events: none;
            animation: fadeOut 0.5s ease-out forwards;
        `;
        
        board.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.remove();
            }
        }, 500);
    }

    // Clean up method
    destroy() {
        const board = document.getElementById('pachinko-board');
        if (board && this.boundHandleBoardClick) {
            board.removeEventListener('click', this.boundHandleBoardClick);
        }
        
        // Cancel any ongoing animations
        if (this.activeAnimations) {
            this.activeAnimations.forEach(id => cancelAnimationFrame(id));
            this.activeAnimations = [];
        }
        
        // Clean up currency items
        this.clearBoard();
    }
}