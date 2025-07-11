// Level Select Screen Controller
class LevelSelectScreen {
    constructor(game) {
        this.game = game;
        console.log('LevelSelectScreen initialized');
    }

    setupEventListeners() {
        // Event listeners are handled by the main game controller
        // This method is here for consistency with the framework pattern
    }

    updateUI() {
        console.log('Updating level select UI');
        const levelGrid = document.getElementById('level-grid');
        if (!levelGrid) {
            console.error('Level grid not found!');
            return;
        }

        levelGrid.innerHTML = '';

        for (let i = 1; i <= GAME_CONFIG.LEVEL_COUNT; i++) {
            const level = LEVEL_TEMPLATES[i];
            const isUnlocked = this.game.gameState.unlockedLevels.includes(i);
            
            const levelCard = document.createElement('div');
            levelCard.className = `level-card ${isUnlocked ? '' : 'locked'}`;
            levelCard.innerHTML = this.createLevelCardHTML(level, i, isUnlocked);
            
            levelGrid.appendChild(levelCard);
        }
    }

    createLevelCardHTML(level, levelId, isUnlocked) {
        const mechaEmoji = `<div style="font-size: 60px; margin-bottom: 10px;">${level.mecha.emoji}</div>`;
        const levelInfo = `
            <h3>${level.name}</h3>
            <p>${level.mecha.name}</p>
            <p>vs ${level.slime.name}</p>
        `;
        
        const actionButton = isUnlocked ? 
            `<button data-action="start-level" data-level="${levelId}">Enter Battle</button>` : 
            `<p style="color: #ffd700; font-weight: bold;">🔒 Unlock: ${level.unlockCost} coins</p>`;

        return mechaEmoji + levelInfo + actionButton;
    }

    handleLevelSelection(levelId) {
        console.log('Level selected:', levelId);
        const level = LEVEL_TEMPLATES[levelId];
        
        if (!this.game.gameState.unlockedLevels.includes(levelId)) {
            // Check if player can afford to unlock the level
            if (this.game.gameState.currency >= level.unlockCost) {
                this.showUnlockConfirmation(levelId);
            } else {
                this.game.showPopup("Insufficient Coins!", `You need ${level.unlockCost} coins to unlock this level.`);
            }
            return;
        }

        // Start the level
        this.game.startLevel(levelId);
    }

    showUnlockConfirmation(levelId) {
        const level = LEVEL_TEMPLATES[levelId];
        const popup = document.createElement('div');
        popup.className = 'popup';
        
        // Create bound function for the confirmation
        const boundConfirmUnlock = () => {
            this.confirmUnlock(levelId);
            popup.remove();
        };
        
        popup.innerHTML = `
            <h2>Unlock Level?</h2>
            <p>Unlock ${level.name} for ${level.unlockCost} coins?</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="this.parentElement.parentElement.remove()">Cancel</button>
                <button id="confirm-unlock-btn">Unlock</button>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Add event listener properly
        const confirmBtn = popup.querySelector('#confirm-unlock-btn');
        confirmBtn.addEventListener('click', boundConfirmUnlock);
    }

    confirmUnlock(levelId) {
        const level = LEVEL_TEMPLATES[levelId];
        
        if (this.game.gameState.currency >= level.unlockCost) {
            this.game.gameState.currency -= level.unlockCost;
            this.game.gameState.unlockedLevels.push(levelId);
            this.game.updateCurrency();
            this.updateUI();
            this.game.showPopup("Level Unlocked!", `${level.name} is now available!`);
        }
    }

    // Helper method to get level progress
    getLevelProgress(levelId) {
        // This could be expanded to track completion status
        return this.game.gameState.unlockedLevels.includes(levelId) ? 'unlocked' : 'locked';
    }
}