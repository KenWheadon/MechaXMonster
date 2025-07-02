// app.js - Main Game Controller using GameDemon ScreenManager
class MechaXMonster {
  constructor() {
    // Centralized mutable state using GameDemon GameState
    this.gameState = new GameState({
      storageKey: "mecha-x-monster-save",
      autoSave: true,
      saveInterval: 10000, // Save every 10 seconds
    });

    // Initialize game state structure
    this.initializeGameState();

    // Initialize GameDemon systems FIRST
    this.setupGameSystems();

    // Set up screens using ScreenManager
    this.setupScreens();

    // Initialize the game
    this.init();
  }

  initializeGameState() {
    // Set up default game state structure
    this.gameState.setDefaultState({
      // Game progression
      currentScreen: "start",
      gameStarted: false,
      tutorialCompleted: false,

      // Player currencies (5 types from 5 mines)
      currencies: {
        shells: 10, // Mine 1 - Green Mecha
        coins: 0, // Mine 2 - Yellow Mecha
        bars: 0, // Mine 3 - Red Mecha
        bonds: 0, // Mine 4 - Blue Mecha
        gems: 0, // Mine 5 - Pink Mecha
      },

      // Monster currencies (earned from combat)
      monsterCurrencies: {
        monsterShells: 0,
        monsterCoins: 0,
        monsterBars: 0,
        monsterBonds: 0,
        monsterGems: 0,
      },

      // Training currency
      trainingCredits: 0,

      // Mine states
      mines: {
        mine1: {
          unlocked: false,
          built: false,
          currency: "shells",
          mechaType: "green",
          monsterType: "yellowSlime",
        },
        // Other mines will be added as they're unlocked
      },

      // Mecha parts inventory
      mechaPartsInventory: {
        green: {
          leftArm: 0,
          rightArm: 0,
          leftLeg: 0,
          rightLeg: 0,
          head: 0,
          torso: 0,
        },
      },

      // Built mechas
      builtMechas: {
        green: 0,
        yellow: 0,
        red: 0,
        blue: 0,
        pink: 0,
      },

      // Achievement tracking
      achievements: {
        unlockedAchievements: [],
        progress: {},
      },

      // Settings
      settings: {
        soundEnabled: true,
        musicEnabled: true,
        animationsEnabled: true,
      },
    });

    // Load existing save data
    this.gameState.loadState();
  }

  setupGameSystems() {
    // Initialize Achievement System
    this.achievementManager = new AchievementManager(this, {
      enableDebugLogs: false,
    });

    // Initialize Audio System
    this.audioManager = new AudioManager({
      enableDebugLogs: false,
      backgroundVolume: 0.3,
      sfxVolume: 0.7,
    });

    this.audioUI = new AudioManagerUI(this.audioManager, {
      floatingButton: true,
      floatingButtonPosition: { bottom: "20px", right: "20px" },
    });

    // Initialize Popup System
    this.popupManager = new PopupManager(this);

    // Initialize Drawer System
    this.drawerManager = new DrawerManager();

    // Set up audio files
    this.setupAudio();

    // Set up achievements
    this.setupAchievements();
  }

  setupAudio() {
    this.audioManager.setAudioFiles({
      backgroundMusic: {
        menu: "audio/music/menu.mp3",
        mining: "audio/music/mining.mp3",
        combat: "audio/music/combat.mp3",
      },
      soundEffects: {
        click: "audio/sfx/click.mp3",
        mine: "audio/sfx/mine.mp3",
        collect: "audio/sfx/collect.mp3",
        build: "audio/sfx/build.mp3",
        partDrop: "audio/sfx/part-drop.mp3",
        achievement: "audio/sfx/achievement.mp3",
      },
    });

    // Initialize audio
    this.audioManager
      .init()
      .then(() => {
        this.audioManager.playBackgroundMusic("menu");
      })
      .catch((err) => {
        console.warn("Audio initialization failed:", err);
      });
  }

  setupAchievements() {
    // Use achievement templates from config
    this.achievementManager.initializeAchievements(
      "#achievements-container",
      ACHIEVEMENT_TEMPLATES
    );
  }

  setupScreens() {
    // Initialize ScreenManager with integrations
    this.screenManager = new ScreenManager({
      defaultScreen: "start",
      enableHistory: true,
      integrations: {
        achievements: this.achievementManager,
        drawer: this.drawerManager,
      },
      onScreenChange: (current, previous) => {
        this.onScreenChanged(current, previous);
      },
    });

    // Register Start Screen
    this.screenManager.registerScreen("start", {
      type: "start",
      title: "", // No title, we'll use custom content
      content: `
                <img src="images/logo.png" alt="Mecha X Monster" class="start-logo">
            `,
      background: {
        type: "image",
        value: "images/map-background.png",
      },
      buttons: [
        {
          label: "▶ Start Game",
          primary: true,
          callback: (screen, button, index) => {
            this.startGame();
          },
        },
      ],
    });

    // Register Map Screen
    this.screenManager.registerScreen("map", {
      type: "custom",
      title: "Asteroid Mining Colony",
      subtitle: "Select a location to begin mining operations",
      content: this.generateMapContent(),
      background: {
        type: "image",
        value: "images/map-background.png",
      },
      buttons: this.generateMapButtons(),
      onShow: (screen) => {
        this.onMapScreenShow(screen);
      },
    });
  }

  generateMapContent() {
    // Generate currency display
    const currencies = this.gameState.get("currencies", {});
    const currencyDisplay = Object.entries(currencies)
      .filter(([_, amount]) => amount > 0)
      .map(([type, amount]) => {
        const icon = this.getCurrencyIcon(type);
        return `
                    <div class="currency-item">
                        <span>${icon} ${this.formatCurrencyName(type)}:</span>
                        <span class="currency-value" id="${type}-amount">${amount}</span>
                    </div>
                `;
      })
      .join("");

    return `
            <div class="currency-display">
                <div style="font-weight: bold; margin-bottom: 10px; color: #48dbfb;">Resources</div>
                ${
                  currencyDisplay ||
                  '<div style="opacity: 0.7;">No resources yet</div>'
                }
            </div>
            <div class="mine-locations" id="mine-locations">
                ${this.generateMineLocations()}
            </div>
        `;
  }

  generateMineLocations() {
    const mines = this.gameState.get("mines", {});
    const mine1 = mines.mine1 || {};

    let mineHtml = "";

    // Mine 1 - Conditional based on state
    if (!mine1.unlocked) {
      mineHtml += `
                <button class="mine-button mine-button--unlock" data-mine="mine1" data-action="unlock">
                    <div class="mine-icon">🌱</div>
                    <div>Build Port (Free)</div>
                </button>
            `;
    } else if (!mine1.built) {
      mineHtml += `
                <button class="mine-button mine-button--build" data-mine="mine1" data-action="build">
                    <div class="mine-icon">🌱</div>
                    <div>Build Mine (10 Shells)</div>
                </button>
            `;
    } else {
      mineHtml += `
                <button class="mine-button mine-button--enter" data-mine="mine1" data-action="enter">
                    <div class="mine-icon">🌱</div>
                    <div>Enter Mine</div>
                </button>
            `;
    }

    // Future mines - locked
    const futureMines = [
      { id: "mine2", name: "Ice Mine", icon: "❄️" },
      { id: "mine3", name: "Lava Mine", icon: "🌋" },
      { id: "mine4", name: "Crystal Mine", icon: "💎" },
      { id: "mine5", name: "Void Mine", icon: "🌌" },
    ];

    futureMines.forEach((mine) => {
      mineHtml += `
                <div class="mine-button mine-button--locked">
                    <div class="mine-icon">${mine.icon}</div>
                    <div>${mine.name}</div>
                    <div style="font-size: 0.8rem; color: #aaa;">Locked</div>
                </div>
            `;
    });

    return mineHtml;
  }

  generateMapButtons() {
    // Map screen doesn't need traditional buttons since we have custom mine buttons
    // But we can add utility buttons
    return [
      {
        label: "← Back to Start",
        secondary: true,
        callback: (screen, button, index) => {
          this.screenManager.showScreen("start");
        },
      },
    ];
  }

  onMapScreenShow(screen) {
    // Update the map content when shown
    screen.update({
      content: this.generateMapContent(),
    });

    // Attach mine button listeners
    this.attachMineButtonListeners();
  }

  attachMineButtonListeners() {
    // Find mine buttons and attach listeners
    const mineButtons = document.querySelectorAll("[data-mine]");

    mineButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const mine = e.target.closest("[data-mine]").dataset.mine;
        const action = e.target.closest("[data-action]").dataset.action;
        this.handleMineAction(mine, action);
      });
    });
  }

  handleMineAction(mine, action) {
    switch (`${mine}-${action}`) {
      case "mine1-unlock":
        this.unlockMine1();
        break;
      case "mine1-build":
        this.buildMine1();
        break;
      case "mine1-enter":
        this.enterMine1();
        break;
      default:
        console.warn("Unknown mine action:", mine, action);
    }
  }

  unlockMine1() {
    // Unlock the first mine for free
    this.gameState.set("mines.mine1.unlocked", true);

    // Trigger achievement
    this.achievementManager?.unlockAchievement("first_mine");

    // Play sound
    this.audioManager?.playSoundEffect("build", 0.8);

    // Show tutorial message
    this.popupManager?.showAlert(
      "Port construction complete! Now you can build a mining operation.",
      { title: "Port Built!", icon: "🚀" }
    );

    // Refresh the map screen
    this.refreshMapScreen();
  }

  buildMine1() {
    const shellsNeeded = 10;
    const currentShells = this.gameState.get("currencies.shells", 0);

    if (currentShells >= shellsNeeded) {
      // Spend shells and build mine
      this.gameState.set("currencies.shells", currentShells - shellsNeeded);
      this.gameState.set("mines.mine1.built", true);

      // Play sound
      this.audioManager?.playSoundEffect("build", 0.8);

      // Show success message
      this.popupManager?.showAlert(
        'Mining operation is ready! Click "Enter Mine" to start collecting resources.',
        { title: "Mine Built!", icon: "⛏️" }
      );

      // Refresh the map screen
      this.refreshMapScreen();
    } else {
      // Not enough shells
      this.popupManager?.showAlert(
        `You need ${shellsNeeded} shells to build this mine. You have ${currentShells}.`,
        { title: "Insufficient Resources", icon: "❌" }
      );
    }
  }

  enterMine1() {
    // Navigate to mining screen (will be implemented later)
    this.popupManager?.showAlert("Mining screen will be implemented next!", {
      title: "Coming Soon",
      icon: "🚧",
    });
  }

  refreshMapScreen() {
    // Refresh the current map screen content
    const currentScreen = this.screenManager.getCurrentScreen();
    if (currentScreen && currentScreen.id === "map") {
      this.onMapScreenShow(currentScreen);
    }
  }

  getCurrencyIcon(currencyType) {
    const icons = {
      shells: "🐚",
      coins: "🪙",
      bars: "📊",
      bonds: "💎",
      gems: "💎",
    };
    return icons[currencyType] || "💰";
  }

  formatCurrencyName(type) {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  startGame() {
    // Mark game as started
    this.gameState.set("gameStarted", true);
    this.gameState.set("gameStartTime", Date.now());

    // Navigate to map screen using ScreenManager
    this.screenManager.showScreen("map");

    // Play start sound
    this.audioManager?.playSoundEffect("collect", 0.8);

    // Trigger achievement for starting the game
    this.achievementManager?.onGameEvent("gameStarted", {
      timestamp: Date.now(),
    });
  }

  onScreenChanged(current, previous) {
    // Update audio based on screen
    if (current) {
      switch (current.id) {
        case "start":
          this.audioManager?.playBackgroundMusic("menu", true);
          break;
        case "map":
          this.audioManager?.playBackgroundMusic("mining", true);
          break;
      }
    }

    // Update game state
    this.gameState.set("currentScreen", current?.id || "start");
  }

  init() {
    // Determine starting screen based on game state
    const gameStarted = this.gameState.get("gameStarted", false);
    const startingScreen = gameStarted ? "map" : "start";

    // Show the appropriate starting screen
    this.screenManager.showScreen(startingScreen);

    // Set up auto-save
    this.startAutoSave();
  }

  startAutoSave() {
    // Auto-save every 30 seconds
    setInterval(() => {
      this.gameState.saveState();
    }, 30000);
  }

  // Utility methods for currency management
  addCurrency(type, amount) {
    const current = this.gameState.get(`currencies.${type}`, 0);
    this.gameState.set(`currencies.${type}`, current + amount);
  }

  spendCurrency(type, amount) {
    const current = this.gameState.get(`currencies.${type}`, 0);
    if (current >= amount) {
      this.gameState.set(`currencies.${type}`, current - amount);
      return true;
    }
    return false;
  }

  getCurrency(type) {
    return this.gameState.get(`currencies.${type}`, 0);
  }

  // Debug methods
  debugGameState() {
    console.log("Current Game State:", this.gameState.getState());
    console.log("Screen Manager Status:", this.screenManager.getStatus());
  }

  resetGame() {
    this.gameState.reset();
    this.screenManager.showScreen("start");
  }
}

// Make available globally for debugging
window.MechaXMonster = MechaXMonster;
