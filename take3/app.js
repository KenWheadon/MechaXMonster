// Main Application Controller
class App {
  constructor() {
    this.currentScreen = null;
    this.gameContainer = null;
    this.screens = new Map();
    this.isInitialized = false;
    this.gameState = {
      playerName: "",
      totalScore: 0,
      totalCoins: 0,
      gamesPlayed: 0,
      bestScore: 0,
      achievements: [],
      settings: {
        soundEnabled: true,
        musicEnabled: true,
        difficulty: "normal",
      },
    };

    console.log("🎮 Mecha X Monster App initialized");
  }

  // Initialize the application
  async init() {
    if (this.isInitialized) return;

    try {
      console.log("🚀 Initializing Mecha X Monster...");

      // Get game container
      this.gameContainer = document.getElementById("game-container");
      if (!this.gameContainer) {
        throw new Error("Game container not found");
      }

      // Load game state from localStorage
      this.loadGameState();

      // Register available screens
      this.registerScreens();

      // Show start screen
      await this.showScreen("start");

      // Set up global event listeners
      this.setupGlobalEventListeners();

      this.isInitialized = true;
      console.log("✅ App initialized successfully");
    } catch (error) {
      console.error("❌ App initialization failed:", error);
      this.showError("Failed to initialize game: " + error.message);
    }
  }

  // Register available screens
  registerScreens() {
    this.screens.set("start", {
      className: "StartScreen",
      file: "startscreen.js",
      title: "Start Screen",
    });

    this.screens.set("slime-defense", {
      className: "SlimeDefenseScreen",
      file: "slimedefensescreen.js",
      title: "Slime Defense",
    });

    console.log(`📱 Registered ${this.screens.size} screens`);
  }

  // Show a specific screen
  async showScreen(screenName, options = {}) {
    try {
      console.log(`🔄 Transitioning to ${screenName} screen...`);

      // Get screen config
      const screenConfig = this.screens.get(screenName);
      if (!screenConfig) {
        throw new Error(`Screen "${screenName}" not found`);
      }

      // Destroy current screen
      if (this.currentScreen) {
        console.log(
          `🗑️ Destroying current screen: ${this.currentScreen.constructor.name}`
        );
        this.currentScreen.destroy();
        this.currentScreen = null;
      }

      // Clear container
      this.gameContainer.innerHTML = "";

      // Load screen class if not already loaded
      if (!window[screenConfig.className]) {
        console.log(`📦 Loading ${screenConfig.file}...`);
        await this.loadScript(screenConfig.file);
      }

      // Create new screen instance
      const ScreenClass = window[screenConfig.className];
      if (!ScreenClass) {
        throw new Error(
          `Screen class ${screenConfig.className} not found after loading`
        );
      }

      // Handle special cases for screen construction
      if (screenName === "mining" && options.mineId) {
        this.currentScreen = new ScreenClass(
          this.gameContainer,
          options.mineId
        );
      } else {
        this.currentScreen = new ScreenClass(this.gameContainer);
      }

      // Set up screen event listeners for transitions
      this.setupScreenTransitions();

      // Initialize the screen
      this.currentScreen.init();

      console.log(`✅ Successfully loaded ${screenName} screen`);
    } catch (error) {
      console.error(`❌ Failed to load ${screenName} screen:`, error);
      this.showError(`Failed to load ${screenName}: ${error.message}`);
    }
  }

  // Set up screen transition event listeners
  setupScreenTransitions() {
    if (!this.currentScreen) return;

    // Handle start screen transitions
    if (this.currentScreen.constructor.name === "StartScreen") {
      // Override the handleStartClick method to transition to slime defense
      const originalHandleStartClick = this.currentScreen.handleStartClick.bind(
        this.currentScreen
      );

      this.currentScreen.handleStartClick = () => {
        console.log("🎯 Start button clicked - transitioning to Slime Defense");

        // Play sound effect
        if (this.currentScreen.audioManager) {
          this.currentScreen.audioManager.playSound("button-click");
        }

        // Show transition effect
        this.showTransitionEffect("Starting Slime Defense...");

        // Transition to slime defense after a short delay
        setTimeout(() => {
          this.showScreen("slime-defense");
        }, 1000);
      };
    }

    // Handle slime defense screen transitions
    if (this.currentScreen.constructor.name === "SlimeDefenseScreen") {
      // Override menu button click to go back to start
      const menuButton =
        this.currentScreen.container.querySelector(".menu-button");
      if (menuButton) {
        menuButton.addEventListener("click", () => {
          console.log("🏠 Menu button clicked - returning to start screen");
          this.showScreen("start");
        });
      }

      // Hook into game over to update global stats
      const originalEndGame = this.currentScreen.endGame.bind(
        this.currentScreen
      );
      this.currentScreen.endGame = () => {
        // Update global game state
        this.gameState.gamesPlayed++;
        this.gameState.totalScore += this.currentScreen.score;
        this.gameState.totalCoins += this.currentScreen.coins;

        if (this.currentScreen.score > this.gameState.bestScore) {
          this.gameState.bestScore = this.currentScreen.score;
        }

        // Save game state
        this.saveGameState();

        // Call original endGame
        originalEndGame();
      };
    }
  }

  // Load external script
  loadScript(src) {
    return new Promise((resolve, reject) => {
      // Check if script already loaded
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  }

  // Show transition effect
  showTransitionEffect(message) {
    // Remove existing transition
    const existing = document.querySelector(".transition-overlay");
    if (existing) existing.remove();

    // Create transition overlay
    const overlay = document.createElement("div");
    overlay.className = "transition-overlay";
    overlay.innerHTML = `
      <div class="transition-content">
        <div class="transition-spinner"></div>
        <div class="transition-message">${message}</div>
      </div>
    `;

    // Add styles
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      backdrop-filter: blur(10px);
    `;

    const content = overlay.querySelector(".transition-content");
    content.style.cssText = `
      text-align: center;
      color: white;
    `;

    const spinner = overlay.querySelector(".transition-spinner");
    spinner.style.cssText = `
      width: 50px;
      height: 50px;
      border: 4px solid rgba(0, 255, 136, 0.3);
      border-top: 4px solid #00ff88;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    `;

    const messageEl = overlay.querySelector(".transition-message");
    messageEl.style.cssText = `
      font-size: 18px;
      font-weight: bold;
      color: #00ff88;
      text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
    `;

    document.body.appendChild(overlay);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.remove();
      }
    }, 3000);
  }

  // Show error message
  showError(message) {
    console.error("🚨 App Error:", message);

    // Remove existing error
    const existing = document.querySelector(".error-overlay");
    if (existing) existing.remove();

    // Create error overlay
    const overlay = document.createElement("div");
    overlay.className = "error-overlay";
    overlay.innerHTML = `
      <div class="error-content">
        <h2>❌ Error</h2>
        <p>${message}</p>
        <button class="error-button" onclick="location.reload()">Reload Game</button>
      </div>
    `;

    // Add styles
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10001;
      backdrop-filter: blur(10px);
    `;

    const content = overlay.querySelector(".error-content");
    content.style.cssText = `
      background: rgba(0, 0, 0, 0.95);
      padding: 40px;
      border-radius: 15px;
      border: 2px solid #ff4444;
      text-align: center;
      max-width: 400px;
      color: white;
    `;

    const button = overlay.querySelector(".error-button");
    button.style.cssText = `
      margin-top: 20px;
      padding: 10px 20px;
      background: #ff4444;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
    `;

    document.body.appendChild(overlay);
  }

  // Set up global event listeners
  setupGlobalEventListeners() {
    // Handle keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      // Global keyboard shortcuts
      if (e.ctrlKey && e.key === "r") {
        e.preventDefault();
        this.restart();
      }

      if (e.key === "F1") {
        e.preventDefault();
        this.showHelp();
      }
    });

    // Handle window beforeunload
    window.addEventListener("beforeunload", () => {
      this.saveGameState();
    });

    // Handle visibility change (save when tab becomes hidden)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.saveGameState();
      }
    });
  }

  // Load game state from localStorage
  loadGameState() {
    try {
      const saved = localStorage.getItem("mechaXMonsterGameState");
      if (saved) {
        const parsedState = JSON.parse(saved);
        this.gameState = { ...this.gameState, ...parsedState };
        console.log("💾 Game state loaded from localStorage");
      }
    } catch (error) {
      console.warn("⚠️ Failed to load game state:", error);
    }
  }

  // Save game state to localStorage
  saveGameState() {
    try {
      localStorage.setItem(
        "mechaXMonsterGameState",
        JSON.stringify(this.gameState)
      );
      console.log("💾 Game state saved to localStorage");
    } catch (error) {
      console.warn("⚠️ Failed to save game state:", error);
    }
  }

  // Restart the application
  restart() {
    console.log("🔄 Restarting application...");
    location.reload();
  }

  // Show help/controls
  showHelp() {
    const helpText = `
      🎮 Mecha X Monster - Controls
      
      General:
      • ESC - Back/Cancel
      • F1 - Show this help
      • Ctrl+R - Restart game
      
      Start Screen:
      • SPACE - Start game
      • Click elements to interact
      
      Slime Defense:
      • Click slimes to attack them
      • SPACE - Pause/Resume
      • R - Restart (when game over)
      
      Goal: Defend against slimes and earn coins!
    `;

    alert(helpText);
  }

  // Get current screen info
  getCurrentScreenInfo() {
    return {
      screenName: this.currentScreen?.constructor.name || "None",
      isActive: this.currentScreen?.isActive || false,
      gameState: this.gameState,
    };
  }

  // Public API for screen transitions
  goToScreen(screenName, options = {}) {
    return this.showScreen(screenName, options);
  }

  // Get game statistics
  getGameStats() {
    return {
      ...this.gameState,
      currentSession: {
        screenName: this.currentScreen?.constructor.name || "None",
        isActive: this.currentScreen?.isActive || false,
      },
    };
  }

  // Reset game state
  resetGameState() {
    this.gameState = {
      playerName: "",
      totalScore: 0,
      totalCoins: 0,
      gamesPlayed: 0,
      bestScore: 0,
      achievements: [],
      settings: {
        soundEnabled: true,
        musicEnabled: true,
        difficulty: "normal",
      },
    };
    this.saveGameState();
    console.log("🗑️ Game state reset");
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🌟 DOM loaded, initializing Mecha X Monster...");

  // Create global app instance
  window.app = new App();

  // Initialize the application
  await window.app.init();

  // Make app available for console debugging
  window.debug = {
    ...window.debug,
    app: () => window.app,
    info: () => window.app.getCurrentScreenInfo(),
    stats: () => window.app.getGameStats(),
    goTo: (screenName, options) => window.app.goToScreen(screenName, options),
    reset: () => window.app.resetGameState(),
  };

  console.log("🎉 Mecha X Monster ready to play!");
  console.log("💡 Use window.debug.app() for console access");
});

// Add CSS for transitions and effects
const transitionStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .transition-overlay {
    animation: fadeIn 0.3s ease-in;
  }
  
  .error-overlay {
    animation: fadeIn 0.3s ease-in;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .error-button:hover {
    background: #ff6666 !important;
    transform: translateY(-1px);
  }
`;

// Inject transition styles
const styleSheet = document.createElement("style");
styleSheet.textContent = transitionStyles;
document.head.appendChild(styleSheet);

console.log("🎮 Main App controller loaded!");
