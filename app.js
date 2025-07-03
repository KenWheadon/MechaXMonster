// Main Game State and Core Functions
class Game {
  constructor() {
    this.gameState = {
      currentMine: 1,
      currentScreen: "start-screen",

      // Currency system
      currencies: {
        shells: 0,
        coins: 0,
        bars: 0,
        bonds: 0,
        gems: 0,
        monsterShells: 0,
        monsterCoins: 0,
        monsterBars: 0,
        monsterBonds: 0,
        monsterGems: 0,
      },

      // Mecha system - track built mechas and parts for each mine
      mechas: {},

      // Mining system
      mining: {},

      // Progression
      unlockedMines: [1],
      defeatedBosses: [],

      // Combat state
      combat: {
        active: false,
        battlePhase: 1,
        mechaStats: {},
        monsterStats: {},
        turn: "player",
      },

      // Training state
      training: {
        active: false,
        score: 0,
        combo: 0,
        timeLeft: 15,
        currency: 0,
        upgradeCosts: { ...TRAINING_UPGRADES },
        slotCost: 10,
      },
    };

    // Initialize mine-specific data
    for (let i = 1; i <= 5; i++) {
      this.gameState.mechas[i] = {
        built: 0,
        parts: {
          head: false,
          leftArm: false,
          rightArm: false,
          torso: false,
          leftLeg: false,
          rightLeg: false,
        },
      };

      this.gameState.mining[i] = {
        active: false,
        progress: 0,
        collected: 0,
        geodes: 0,
        machines: i === 1 ? 1 : 0, // Start with 1 machine in mine 1
        upgradeLevel: 0,
        upgradeCost: GAME_CONFIG.UPGRADE_BASE_COST,
        activeMachines: {}, // Track which machines are active
        machineData: {}, // Track individual machine data
      };
    }

    // Initialize modules - delay to ensure classes are loaded
    this.initializeModules();
  }

  initializeModules() {
    this.startScreen = new StartScreen(this);
    this.mapScreen = new MapScreen(this);
    this.mineScreen = new MineScreen(this);
    this.battle = new Battle(this);
    this.training = new Training(this);

    // Bind global functions
    window.game = this;
    this.bindGlobalFunctions();
  }

  bindGlobalFunctions() {
    // Make key functions globally available for onclick handlers
    window.startGame = () => {
      if (this.startScreen) {
        this.startScreen.startGame();
      }
    };
    window.selectMine = (mineId) => {
      if (this.mapScreen) {
        this.mapScreen.selectMine(mineId);
      }
    };
    window.returnToMineSelection = () =>
      this.showScreen("mine-selection-screen");
    window.returnToMining = () => this.showScreen("mining-screen");

    // Mining functions
    window.interactMiningMachine = () => {
      if (this.mineScreen) {
        this.mineScreen.interactMiningMachine();
      }
    };
    window.collectResources = () => {
      if (this.mineScreen) {
        this.mineScreen.collectResources();
      }
    };
    window.buyMiningMachine = (machineId) => {
      if (this.mineScreen) {
        this.mineScreen.buyMiningMachine(machineId);
      }
    };

    // New machine management functions
    window.activateMiningMachine = (machineId) => {
      if (this.mineScreen) {
        this.mineScreen.activateMiningMachine(machineId);
      }
    };

    window.upgradeMiningMachine = (machineId) => {
      if (this.mineScreen) {
        this.mineScreen.upgradeMiningMachine(machineId);
      }
    };

    // Geode functions
    window.openSingleGeode = () => {
      if (this.mineScreen) {
        this.mineScreen.openSingleGeode();
      }
    };

    window.finishGeodeOpening = () => {
      if (this.mineScreen) {
        this.mineScreen.finishGeodeOpening();
      }
    };

    window.buildMecha = () => {
      if (this.mineScreen) {
        this.mineScreen.buildMecha();
      }
    };
    window.openUpgrades = () => {
      if (this.mineScreen) {
        this.mineScreen.openUpgrades();
      }
    };
    window.spinUpgradeSlots = () => {
      if (this.mineScreen) {
        this.mineScreen.spinUpgradeSlots();
      }
    };

    // Combat functions
    window.startCombat = () => {
      if (this.battle) {
        this.battle.startCombat();
      }
    };
    window.mechaMove = (moveType) => {
      if (this.battle) {
        this.battle.mechaMove(moveType);
      }
    };
    window.startFinalBoss = () => {
      if (this.battle) {
        this.battle.startFinalBoss();
      }
    };

    // Training functions
    window.buyTrainingUpgrade = (type) => {
      if (this.training) {
        this.training.buyTrainingUpgrade(type);
      }
    };
    window.spinTrainingSlots = () => {
      if (this.training) {
        this.training.spinTrainingSlots();
      }
    };
    window.continueAfterTraining = () => {
      if (this.training) {
        this.training.continueAfterTraining();
      }
    };

    // Utility functions
    window.showExchangeOptions = (currency) =>
      this.showExchangeOptions(currency);
  }

  // Core game functions
  showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.remove("active");
    });

    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
      targetScreen.classList.add("active");
      this.gameState.currentScreen = screenId;
    }

    // Update screen-specific data
    this.updateCurrentScreen();
  }

  updateCurrentScreen() {
    switch (this.gameState.currentScreen) {
      case "mine-selection-screen":
        this.mapScreen.updateMineSelection();
        break;
      case "mining-screen":
        this.mineScreen.setupMiningScreen();
        break;
      case "combat-screen":
        this.battle.updateCombatUI();
        break;
      case "training-screen":
        this.training.updateTrainingDisplay();
        break;
    }
  }

  // Logging system
  logMessage(message, type = "normal") {
    const logs = document.querySelectorAll(".game-log");
    logs.forEach((log) => {
      const entry = document.createElement("div");
      entry.className = `log-entry ${type}`;
      entry.textContent = message;
      log.appendChild(entry);
      log.scrollTop = log.scrollHeight;

      // Keep only last 20 messages
      while (log.children.length > 20) {
        log.removeChild(log.firstChild);
      }
    });
  }

  // Currency utilities
  getCurrencyIcon(currency) {
    return CONFIG_UTILS.getCurrencyIcon(currency);
  }

  hasCurrency(currency, amount) {
    return this.gameState.currencies[currency] >= amount;
  }

  spendCurrency(currency, amount) {
    if (this.hasCurrency(currency, amount)) {
      this.gameState.currencies[currency] -= amount;
      return true;
    }
    return false;
  }

  addCurrency(currency, amount) {
    this.gameState.currencies[currency] += amount;
  }

  // Mine utilities
  getCurrentMineConfig() {
    return MINE_CONFIG[this.gameState.currentMine];
  }

  getCurrentMineData() {
    return this.gameState.mining[this.gameState.currentMine];
  }

  getCurrentMechaData() {
    return this.gameState.mechas[this.gameState.currentMine];
  }

  // Exchange system
  showExchangeOptions(currency) {
    const amount = this.gameState.currencies[currency];
    const exchangeRate = GAME_CONFIG.EXCHANGE_RATE;
    const result = Math.floor(amount * exchangeRate);

    if (
      confirm(
        `Exchange ${amount} ${this.getCurrencyIcon(
          currency
        )} for ${result} shells? (${Math.floor(
          exchangeRate * 100
        )}% exchange rate)`
      )
    ) {
      this.gameState.currencies[currency] = 0;
      this.gameState.currencies.shells += result;
      this.mapScreen.updateTradingPost();
      this.logMessage(
        `💱 Exchanged ${amount} ${this.getCurrencyIcon(
          currency
        )} for ${result} shells`,
        "success"
      );
    }
  }

  // Progress tracking
  unlockMine(mineId) {
    if (!this.gameState.unlockedMines.includes(mineId)) {
      this.gameState.unlockedMines.push(mineId);
      const config = MINE_CONFIG[mineId];
      this.logMessage(`🎉 Unlocked ${config.name}!`, "success");
      return true;
    }
    return false;
  }

  defeatBoss(mineId) {
    if (!this.gameState.defeatedBosses.includes(mineId)) {
      this.gameState.defeatedBosses.push(mineId);
      const config = MINE_CONFIG[mineId];
      this.logMessage(
        `🏆 ${config.monster} defeated for the first time!`,
        "success"
      );

      // Check if all bosses defeated
      if (this.gameState.defeatedBosses.length >= 5) {
        setTimeout(() => {
          this.showScreen("final-boss-screen");
        }, 2000);
      }
      return true;
    }
    return false;
  }

  // Geode opening system - now handled by mine screen mini-game
  openGeodes(count) {
    // This is now handled by the geode mini-game
    return { partsFound: 0, bonusCurrency: 0 };
  }

  // Mecha building
  canBuildMecha() {
    const parts = this.getCurrentMechaData().parts;
    return Object.values(parts).every((hasPart) => hasPart);
  }

  buildMecha() {
    if (!this.canBuildMecha()) {
      this.logMessage("❌ Cannot build mecha - missing parts!");
      return false;
    }

    // Consume parts and build mecha
    const mechaData = this.getCurrentMechaData();
    Object.keys(mechaData.parts).forEach(
      (part) => (mechaData.parts[part] = false)
    );
    mechaData.built++;

    const config = this.getCurrentMineConfig();
    this.logMessage(
      `🤖 ${config.mecha} Mecha built! Production bonus increased to x${
        mechaData.built + 1
      }`,
      "success"
    );

    return true;
  }

  // Mining production calculation
  calculateMiningOutput() {
    const mineData = this.getCurrentMineData();
    const mechaData = this.getCurrentMechaData();

    // Base production * mecha multiplier * upgrade multiplier
    let baseOutput = GAME_CONFIG.MINING_BASE_OUTPUT;
    let mechaMultiplier = mechaData.built + 1;
    let upgradeMultiplier = 1 + mineData.upgradeLevel * 0.1;

    return Math.floor(baseOutput * mechaMultiplier * upgradeMultiplier);
  }

  // Utility functions
  updateElement(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = content;
    }
  }

  updateStatBar(barId, current, max) {
    const bar = document.getElementById(barId);
    if (bar) {
      const percentage = (current / max) * 100;
      bar.style.width = Math.max(0, percentage) + "%";
    }
  }

  // Animation helpers
  addSpriteAnimation(spriteId, animationClass) {
    const sprite = document.getElementById(spriteId);
    if (sprite) {
      sprite.classList.add(animationClass);
      setTimeout(() => {
        sprite.classList.remove(animationClass);
      }, 1000);
    }
  }

  // Game initialization
  init() {
    // Initialize modules first
    this.startScreen = new StartScreen(this);
    this.mapScreen = new MapScreen(this);
    this.mineScreen = new MineScreen(this);
    this.battle = new Battle(this);
    this.training = new Training(this);

    // Set global game reference
    window.game = this;

    // Bind global functions after modules are created
    this.bindGlobalFunctions();

    this.logMessage(
      "🤖 AstroGuide: Welcome to Mecha X Monster! Ready to start your adventure?"
    );

    // Set up initial UI state
    this.showScreen("start-screen");

    // Initialize all modules after they're created
    if (this.startScreen) this.startScreen.init();
    if (this.mapScreen) this.mapScreen.init();
    if (this.mineScreen) this.mineScreen.init();
    if (this.battle) this.battle.init();
    if (this.training) this.training.init();
  }

  // Reset game state for new game
  resetGame() {
    // Reset all currencies
    Object.keys(this.gameState.currencies).forEach((currency) => {
      this.gameState.currencies[currency] = 0;
    });

    // Reset all mines and mechas
    for (let i = 1; i <= 5; i++) {
      this.gameState.mechas[i] = {
        built: 0,
        parts: {
          head: false,
          leftArm: false,
          rightArm: false,
          torso: false,
          leftLeg: false,
          rightLeg: false,
        },
      };

      this.gameState.mining[i] = {
        active: false,
        progress: 0,
        collected: 0,
        geodes: 0,
        machines: i === 1 ? 1 : 0,
        upgradeLevel: 0,
        upgradeCost: GAME_CONFIG.UPGRADE_BASE_COST,
        activeMachines: {},
        machineData: {},
      };
    }

    // Reset progression
    this.gameState.unlockedMines = [1];
    this.gameState.defeatedBosses = [];
    this.gameState.currentMine = 1;

    // Reset combat and training
    this.gameState.combat = {
      active: false,
      battlePhase: 1,
      mechaStats: {},
      monsterStats: {},
      turn: "player",
    };

    this.gameState.training = {
      active: false,
      score: 0,
      combo: 0,
      timeLeft: 15,
      currency: 0,
      upgradeCosts: { ...TRAINING_UPGRADES },
      slotCost: 10,
    };

    // Clear any active timers
    this.mineScreen.clearMiningTimers();
    this.training.clearTrainingTimers();

    this.logMessage("🔄 Game reset! Starting fresh adventure.", "important");
  }

  // Enhanced mine management
  initializeMineData(mineId) {
    if (!this.gameState.mining[mineId].activeMachines) {
      this.gameState.mining[mineId].activeMachines = {};
    }
    if (!this.gameState.mining[mineId].machineData) {
      this.gameState.mining[mineId].machineData = {};
    }
  }

  // Get total active machines across all mines
  getTotalActiveMachines() {
    let total = 0;
    for (let i = 1; i <= 5; i++) {
      const mineData = this.gameState.mining[i];
      if (mineData.activeMachines) {
        total += Object.values(mineData.activeMachines).filter(
          (active) => active
        ).length;
      }
    }
    return total;
  }

  // Debug helper
  debugGameState() {
    console.log("=== Game State Debug ===");
    console.log("Current Mine:", this.gameState.currentMine);
    console.log("Unlocked Mines:", this.gameState.unlockedMines);
    console.log("Currencies:", this.gameState.currencies);
    console.log("Current Mine Data:", this.getCurrentMineData());
    console.log("Current Mecha Data:", this.getCurrentMechaData());
    console.log("========================");
  }
}

// Initialize game when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, initializing game...");

  // Check if all required classes are available
  if (typeof StartScreen === "undefined") {
    console.error("StartScreen class not found!");
    return;
  }
  if (typeof MapScreen === "undefined") {
    console.error("MapScreen class not found!");
    return;
  }
  if (typeof MineScreen === "undefined") {
    console.error("MineScreen class not found!");
    return;
  }
  if (typeof Battle === "undefined") {
    console.error("Battle class not found!");
    return;
  }
  if (typeof Training === "undefined") {
    console.error("Training class not found!");
    return;
  }

  // Small delay to ensure all scripts are loaded
  setTimeout(() => {
    try {
      window.mechaGame = new Game();
      window.mechaGame.init();
      console.log("Game initialized successfully!");

      // Debug helper - remove in production
      window.debug = () => window.mechaGame.debugGameState();
    } catch (error) {
      console.error("Error initializing game:", error);
    }
  }, 100);
});
