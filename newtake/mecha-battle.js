// Mecha Battle Controller
class MechaBattle {
    constructor(game) {
        this.game = game;
        this.animationStylesAdded = false;
        console.log('MechaBattle initialized');
    }

    setupBattleArea() {
        console.log('Setting up battle area');
        const level = LEVEL_TEMPLATES[this.game.gameState.currentLevel];
        const mechaElement = document.getElementById('mecha');
        const slimeElement = document.getElementById('slime');
        
        if (mechaElement) {
            mechaElement.textContent = level.mecha.emoji;
        }
        if (slimeElement) {
            slimeElement.textContent = level.slime.emoji;
        }
        
        // Add animation styles only once
        this.ensureAnimationStyles();
        
        this.updateHealthBar();
        this.updateLevelInfo();
    }

    ensureAnimationStyles() {
        if (!this.animationStylesAdded) {
            const style = document.createElement('style');
            style.id = 'battle-animations';
            style.textContent = `
                @keyframes damageFloat {
                    0% { transform: translateY(0); opacity: 1; }
                    100% { transform: translateY(-50px); opacity: 0; }
                }
                @keyframes multiplierPulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 0; }
                }
                .damage-float {
                    animation: damageFloat 1s ease-out forwards;
                }
                .multiplier-pulse {
                    animation: multiplierPulse 1s ease-out forwards;
                }
            `;
            document.head.appendChild(style);
            this.animationStylesAdded = true;
        }
    }

    updateLevelInfo() {
        const level = LEVEL_TEMPLATES[this.game.gameState.currentLevel];
        const levelInfoElement = document.getElementById('current-level');
        const waveInfoElement = document.getElementById('current-wave');
        
        if (levelInfoElement) {
            levelInfoElement.textContent = `Level ${this.game.gameState.currentLevel}: ${level.name}`;
        }
        if (waveInfoElement) {
            waveInfoElement.textContent = `Wave ${this.game.gameState.currentWave}`;
        }
    }

    updateHealthBar() {
        const healthPercent = (this.game.gameState.slimeHealth / this.game.gameState.maxSlimeHealth) * 100;
        const healthFill = document.getElementById('slime-health');
        
        if (healthFill) {
            healthFill.style.width = healthPercent + '%';
        }
    }

    performAttack(attackData) {
        console.log('Performing attack:', attackData.name);
        const damage = attackData.damage * this.game.gameState.currentMultiplier;
        this.game.gameState.slimeHealth -= damage;
        
        // Reset multiplier after attack
        this.game.gameState.currentMultiplier = 1;
        
        // Animate attack
        this.playAttackAnimation();
        
        // Update UI
        this.updateHealthBar();
        this.playAttackSound();
        
        // Show damage number
        this.showDamageNumber(damage);
        
        // Check if slime is defeated
        if (this.game.gameState.slimeHealth <= 0) {
            this.handleSlimeDefeat();
        }
    }

    applyMultiplier(multiplierData) {
        console.log('Applying multiplier:', multiplierData.name);
        this.game.gameState.currentMultiplier *= multiplierData.multiplier;
        this.game.showPopup("Multiplier!", `Next attack: x${this.game.gameState.currentMultiplier}`);
        this.playPowerUpSound();
        
        // Visual feedback for multiplier
        this.showMultiplierEffect();
    }

    playAttackAnimation() {
        const mecha = document.getElementById('mecha');
        const slime = document.getElementById('slime');
        
        if (mecha) {
            mecha.classList.add('attack-animation');
            setTimeout(() => {
                mecha.classList.remove('attack-animation');
            }, 500);
        }
        
        if (slime) {
            slime.classList.add('damage-animation');
            setTimeout(() => {
                slime.classList.remove('damage-animation');
            }, 500);
        }
    }

    showDamageNumber(damage) {
        const battleArea = document.getElementById('battle-area');
        const damageNumber = document.createElement('div');
        damageNumber.textContent = `-${damage}`;
        damageNumber.className = 'damage-float';
        damageNumber.style.cssText = `
            position: absolute;
            top: 50%;
            right: 30%;
            color: #ff6b6b;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 2px 2px 0px #000;
            z-index: 100;
            pointer-events: none;
        `;
        
        battleArea.appendChild(damageNumber);
        
        setTimeout(() => {
            if (damageNumber.parentNode) {
                damageNumber.remove();
            }
        }, GAME_CONFIG.ANIMATION_DURATION);
    }

    showMultiplierEffect() {
        const battleArea = document.getElementById('battle-area');
        const multiplierEffect = document.createElement('div');
        multiplierEffect.textContent = `x${this.game.gameState.currentMultiplier}`;
        multiplierEffect.className = 'multiplier-pulse';
        multiplierEffect.style.cssText = `
            position: absolute;
            top: 20%;
            left: 20%;
            color: #ffd700;
            font-size: 36px;
            font-weight: bold;
            text-shadow: 2px 2px 0px #000;
            z-index: 100;
            pointer-events: none;
        `;
        
        battleArea.appendChild(multiplierEffect);
        
        setTimeout(() => {
            if (multiplierEffect.parentNode) {
                multiplierEffect.remove();
            }
        }, GAME_CONFIG.ANIMATION_DURATION);
    }

    handleSlimeDefeat() {
        console.log('Slime defeated!');
        const coinsEarned = CONFIG_UTILS.calculateCoinsEarned(this.game.gameState.currentWave);
        this.game.gameState.currency += coinsEarned;
        this.game.updateCurrency();
        
        this.game.showPopup("Victory!", `Slime defeated! You earned ${coinsEarned} coins!`);
        this.playVictorySound();
        
        // Check if this is wave 10
        if (this.game.gameState.currentWave >= 10) {
            this.handleLevelComplete();
            return;
        }
        
        // Move to next wave
        this.game.gameState.currentWave++;
        this.resetSlimeHealth();
        this.updateLevelInfo();
        this.updateHealthBar();
    }

    handleLevelComplete() {
        console.log('Level complete!');
        const nextLevel = this.game.gameState.currentLevel + 1;
        
        if (nextLevel <= GAME_CONFIG.LEVEL_COUNT && !this.game.gameState.unlockedLevels.includes(nextLevel)) {
            this.game.gameState.unlockedLevels.push(nextLevel);
            this.game.showPopup("Level Complete!", `Level ${nextLevel} unlocked!`);
        } else {
            this.game.showPopup("Level Complete!", "Congratulations! You've mastered this level!");
        }
        
        setTimeout(() => {
            this.game.showScreen('level-select-screen');
            this.game.levelSelectScreen.updateUI();
        }, 2000);
    }

    resetSlimeHealth() {
        const level = LEVEL_TEMPLATES[this.game.gameState.currentLevel];
        this.game.gameState.maxSlimeHealth = CONFIG_UTILS.calculateSlimeHealth(level.slime.baseHealth, this.game.gameState.currentWave);
        this.game.gameState.slimeHealth = this.game.gameState.maxSlimeHealth;
    }

    // Sound effects
    playAttackSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 400;
            gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            console.warn('Audio failed:', e);
        }
    }

    playVictorySound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 600;
            gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.warn('Audio failed:', e);
        }
    }

    playPowerUpSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 1000;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) {
            console.warn('Audio failed:', e);
        }
    }

    // Get current battle status
    getBattleStatus() {
        return {
            slimeHealth: this.game.gameState.slimeHealth,
            maxSlimeHealth: this.game.gameState.maxSlimeHealth,
            currentWave: this.game.gameState.currentWave,
            currentMultiplier: this.game.gameState.currentMultiplier,
            level: this.game.gameState.currentLevel
        };
    }
}