// Main Game Controller
class MechaSlimeGame {
    constructor() {
        console.log('Initializing MechaSlimeGame...');
        
        // Centralized game state
        this.gameState = {
            currentScreen: "menu-screen",
            currency: GAME_CONFIG.STARTING_CURRENCY,
            unlockedLevels: [1],
            ownedCosmetics: [],
            currentLevel: 1,
            currentWave: 1,
            currentMultiplier: 1,
            slimeHealth: 50,
            maxSlimeHealth: 50
        };

        // Initialize screen controllers
        this.levelSelectScreen = new LevelSelectScreen(this);
        this.pegGame = new PegGame(this);
        this.mechaBattle = new MechaBattle(this);
        this.shopScreen = new ShopScreen(this);

        this.init();
    }

    init() {
        console.log('Setting up game...');
        this.setupEventListeners();
        this.showScreen("menu-screen");
        this.updateCurrency();
        console.log('Game initialized successfully');
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.dataset.action) {
                this.handleAction(e.target.dataset.action, e.target);
            }
        });
    }

    handleAction(action, element) {
        console.log('Action triggered:', action);
        
        switch(action) {
            case 'show-menu':
                this.showScreen('menu-screen');
                break;
                
            case 'show-level-select':
                this.levelSelectScreen.updateUI();
                this.showScreen('level-select-screen');
                break;
                
            case 'show-shop':
                this.shopScreen.updateUI();
                this.showScreen('shop-screen');
                break;
                
            case 'start-level':
                const levelId = parseInt(element.dataset.level);
                this.startLevel(levelId);
                break;
                
            case 'buy-cosmetic':
                const cosmeticId = element.dataset.cosmetic;
                this.buyCosmetic(cosmeticId);
                break;
                
            default:
                console.log('Unknown action:', action);
        }
    }

    showScreen(screenId) {
        console.log('Switching to screen:', screenId);
        
        // Clean up previous screen
        if (this.gameState.currentScreen === 'game-screen') {
            this.pegGame.destroy();
        }
        
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.gameState.currentScreen = screenId;
            console.log('Screen switched successfully');
        } else {
            console.error('Screen not found:', screenId);
        }
    }

    startLevel(levelId) {
        console.log('Starting level:', levelId);
        
        if (!this.gameState.unlockedLevels.includes(levelId)) {
            this.showPopup("Level Locked!", "You need to unlock this level first!");
            return;
        }

        // Initialize level state
        this.gameState.currentLevel = levelId;
        this.gameState.currentWave = 1;
        this.gameState.currentMultiplier = 1;
        this.resetSlimeHealth();
        
        // Switch to game screen
        this.showScreen('game-screen');
        
        // Setup game components with race condition protection
        setTimeout(() => {
            // Verify we're still on the game screen before setting up
            if (this.gameState.currentScreen === 'game-screen') {
                this.pegGame.setupBoard();
                this.mechaBattle.setupBattleArea();
            }
        }, 100);
    }

    resetSlimeHealth() {
        const level = LEVEL_TEMPLATES[this.gameState.currentLevel];
        this.gameState.maxSlimeHealth = CONFIG_UTILS.calculateSlimeHealth(level.slime.baseHealth, this.gameState.currentWave);
        this.gameState.slimeHealth = this.gameState.maxSlimeHealth;
    }

    buyCosmetic(cosmeticId) {
        const cosmetic = COSMETIC_TEMPLATES[cosmeticId];
        
        if (this.gameState.currency >= cosmetic.cost && !this.gameState.ownedCosmetics.includes(cosmeticId)) {
            this.gameState.currency -= cosmetic.cost;
            this.gameState.ownedCosmetics.push(cosmeticId);
            this.updateCurrency();
            this.shopScreen.updateUI();
            this.showPopup("Purchase Successful!", `You bought ${cosmetic.name}!`);
        } else if (this.gameState.ownedCosmetics.includes(cosmeticId)) {
            this.showPopup("Already Owned!", "You already own this cosmetic!");
        } else {
            this.showPopup("Insufficient Coins!", `You need ${cosmetic.cost} coins to buy this item.`);
        }
    }

    updateCurrency() {
        const currencyElements = [
            document.getElementById('currency-count'),
            document.getElementById('currency-count-shop')
        ];
        
        currencyElements.forEach(element => {
            if (element) {
                element.textContent = this.gameState.currency;
            }
        });
    }

    showPopup(title, content) {
        const popup = document.createElement('div');
        popup.className = 'popup';
        popup.innerHTML = `
            <h2>${title}</h2>
            <p>${content}</p>
            <button onclick="this.parentElement.remove()">OK</button>
        `;
        document.body.appendChild(popup);
        
        // Auto-remove after 3 seconds with safety check
        setTimeout(() => {
            if (popup && popup.parentElement) {
                popup.remove();
            }
        }, 3000);
    }

    // Game state management
    saveGameState() {
        // Future feature: save to localStorage
        console.log('Game state saved:', this.gameState);
    }

    loadGameState() {
        // Future feature: load from localStorage
        console.log('Game state loaded');
    }

    // Debug methods
    getGameState() {
        return this.gameState;
    }

    addCurrency(amount) {
        this.gameState.currency += amount;
        this.updateCurrency();
    }

    unlockAllLevels() {
        for (let i = 1; i <= GAME_CONFIG.LEVEL_COUNT; i++) {
            if (!this.gameState.unlockedLevels.includes(i)) {
                this.gameState.unlockedLevels.push(i);
            }
        }
        this.levelSelectScreen.updateUI();
    }
}

// Shop Screen Controller (kept separate for modularity)
class ShopScreen {
    constructor(game) {
        this.game = game;
        console.log('ShopScreen initialized');
    }

    updateUI() {
        console.log('Updating shop UI');
        const cosmeticGrid = document.getElementById('cosmetic-grid');
        if (!cosmeticGrid) {
            console.error('Cosmetic grid not found!');
            return;
        }

        cosmeticGrid.innerHTML = '';

        Object.entries(COSMETIC_TEMPLATES).forEach(([id, cosmetic]) => {
            const isOwned = this.game.gameState.ownedCosmetics.includes(id);
            const canAfford = this.game.gameState.currency >= cosmetic.cost;
            
            const cosmeticCard = document.createElement('div');
            cosmeticCard.className = `cosmetic-card ${isOwned ? 'owned' : ''}`;
            cosmeticCard.innerHTML = this.createCosmeticCardHTML(cosmetic, id, isOwned, canAfford);
            
            cosmeticGrid.appendChild(cosmeticCard);
        });
    }

    createCosmeticCardHTML(cosmetic, id, isOwned, canAfford) {
        const emoji = `<div style="font-size: 60px; margin-bottom: 10px;">${cosmetic.emoji}</div>`;
        const info = `
            <h3>${cosmetic.name}</h3>
            <p>${cosmetic.description}</p>
        `;
        
        const actionButton = isOwned ? 
            '<p style="color: #4ecdc4; font-weight: bold;">✅ Owned</p>' : 
            `<button data-action="buy-cosmetic" data-cosmetic="${id}" ${canAfford ? '' : 'disabled'}>
                ${canAfford ? `Buy for ${cosmetic.cost} coins` : `Need ${cosmetic.cost} coins`}
            </button>`;

        return emoji + info + actionButton;
    }
}

// Global references for debugging
let game;
let levelSelectScreen;
let pegGame;
let mechaBattle;
let shopScreen;

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    game = new MechaSlimeGame();
    
    // Set global references for debugging
    levelSelectScreen = game.levelSelectScreen;
    pegGame = game.pegGame;
    mechaBattle = game.mechaBattle;
    shopScreen = game.shopScreen;
    
    console.log('Game fully initialized!');
});