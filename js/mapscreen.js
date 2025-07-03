// MapScreen - Shows asteroid map with 5 mine locations
class MapScreen extends Screen {
  constructor(container) {
    super(container, "map");

    // MapScreen specific state
    this.selectedMine = null;
    this.currencies = {
      shells: 100, // Starting currency for testing
      coins: 0,
      bars: 0,
      bonds: 0,
      gems: 0,
      monster_shells: 0,
      monster_coins: 0,
      monster_bars: 0,
      monster_bonds: 0,
      monster_gems: 0,
    };
    this.unlockedMines = ["mine1"]; // Start with first mine unlocked
    this.activeMines = []; // Mines that have been built
    this.hoveredMine = null;

    // DOM element cache
    this.elements = {};

    console.log("🗺️ MapScreen created");
  }

  // Override init to add MapScreen specific initialization
  init() {
    this.render();
    this.cacheElements();
    this.setupEventListeners();
    this.startAnimations();
    this.initializeAudio();
    this.startParticleSystem();
    this.updateUI();
    this.isActive = true;

    console.log("✅ MapScreen initialized");
  }

  // Cache frequently accessed DOM elements
  cacheElements() {
    this.elements = {
      mineLocations: this.container.querySelectorAll(".mine-location"),
      currencyDisplay: this.container.querySelector(".currency-display"),
      mineTooltip: this.container.querySelector(".mine-tooltip"),
      backButton: this.container.querySelector(".back-button"),
      currencyValues: {},
      mineButtons: {},
      mineStatusElements: {},
    };

    // Cache currency display elements
    Object.keys(this.currencies).forEach((currency) => {
      this.elements.currencyValues[currency] = this.container.querySelector(
        `.currency-${currency}`
      );
    });

    // Cache mine-specific elements
    Object.keys(GAME_CONFIG.mines).forEach((mineId) => {
      this.elements.mineButtons[mineId] = this.container.querySelector(
        `.mine-button[data-mine="${mineId}"]`
      );
      this.elements.mineStatusElements[mineId] = this.container.querySelector(
        `.mine-status[data-mine="${mineId}"]`
      );
    });
  }

  // Override render method
  render() {
    const html = `
      <div class="map-screen screen active">
        <!-- Multi-layer background system -->
        <div class="background-layer background-image" style="background-image: url('images/asteroid-map.png');"></div>
        <div class="background-layer nebula-layer"></div>
        <div class="stars-layer"></div>
        <div class="asteroids-layer"></div>
        <div class="particles-layer"></div>
        
        <!-- Header with currency display -->
        <div class="map-header">
          <button class="back-button btn btn-secondary">
            <img src="images/btn-retry.png" alt="Back" />
            <span>Back to Start</span>
          </button>
          
          <div class="currency-display">
            <div class="currency-grid">
              ${Object.keys(this.currencies)
                .map(
                  (currency) => `
                <div class="currency-item">
                  <img src="images/currency-${currency}.png" alt="${currency}" class="currency-icon" />
                  <span class="currency-value currency-${currency}">0</span>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        </div>

        <!-- Main map content -->
        <div class="map-content">
          <div class="map-title">
            <h1>Asteroid Mining Complex</h1>
            <p>Choose your mining operation</p>
          </div>

          <!-- Mine locations -->
          <div class="mine-locations">
            ${Object.entries(GAME_CONFIG.mines)
              .map(
                ([mineId, mineConfig], index) => `
              <div class="mine-location ${this.getMineLocationClass(mineId)}" 
                   data-mine="${mineId}" 
                   style="--mine-index: ${index}">
                
                <!-- Mine visual -->
                <div class="mine-visual">
                  <img src="images/mine-${mineConfig.mecha}.png" alt="${
                  mineConfig.name
                }" class="mine-image" />
                  <div class="mine-glow"></div>
                  <div class="mine-pulse"></div>
                </div>

                <!-- Mine info -->
                <div class="mine-info">
                  <h3 class="mine-name">${mineConfig.name}</h3>
                  <div class="mine-currency">
                    <img src="images/currency-${
                      mineConfig.currency
                    }.png" alt="${
                  mineConfig.currency
                }" class="currency-icon-small" />
                    <span>+${mineConfig.baseOutput}/mine</span>
                  </div>
                  <div class="mine-status" data-mine="${mineId}">
                    ${this.getMineStatusHTML(mineId)}
                  </div>
                </div>

                <!-- Mine action button -->
                <button class="mine-button btn ${this.getMineButtonClass(
                  mineId
                )}" 
                        data-mine="${mineId}" 
                        ${this.isMineUnlocked(mineId) ? "" : "disabled"}>
                  ${this.getMineButtonText(mineId)}
                </button>

                <!-- Unlock cost overlay (for locked mines) -->
                ${
                  !this.isMineUnlocked(mineId)
                    ? `
                  <div class="unlock-overlay">
                    <div class="unlock-cost">
                      ${Object.entries(mineConfig.unlockCost)
                        .map(([currency, amount]) =>
                          amount > 0
                            ? `
                          <div class="cost-item">
                            <img src="images/currency-${currency}.png" alt="${currency}" />
                            <span>${amount}</span>
                          </div>
                        `
                            : ""
                        )
                        .join("")}
                    </div>
                  </div>
                `
                    : ""
                }
              </div>
            `
              )
              .join("")}
          </div>
        </div>

        <!-- Mine tooltip -->
        <div class="mine-tooltip hidden">
          <div class="tooltip-content">
            <h4 class="tooltip-title">Mine Name</h4>
            <p class="tooltip-description">Mine description</p>
            <div class="tooltip-stats">
              <div class="stat">Currency: <span class="stat-value">Type</span></div>
              <div class="stat">Output: <span class="stat-value">Amount</span></div>
              <div class="stat">Mecha: <span class="stat-value">Type</span></div>
              <div class="stat">Monster: <span class="stat-value">Type</span></div>
            </div>
          </div>
        </div>

        <!-- Loading overlay -->
        <div class="loading-overlay hidden">
          <div class="loading-content">
            <div class="loading-spinner"></div>
            <div class="loading-text">ENTERING MINE...</div>
            <div class="loading-progress">
              <div class="progress-bar">
                <div class="progress-fill"></div>
              </div>
              <div class="progress-percentage">0%</div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  // Helper methods for mine states
  getMineLocationClass(mineId) {
    const classes = ["mine-location"];

    if (this.isMineUnlocked(mineId)) {
      classes.push("unlocked");
    } else {
      classes.push("locked");
    }

    if (this.activeMines.includes(mineId)) {
      classes.push("active");
    }

    return classes.join(" ");
  }

  getMineButtonClass(mineId) {
    if (!this.isMineUnlocked(mineId)) {
      return "btn-secondary";
    }

    if (this.activeMines.includes(mineId)) {
      return "btn-primary";
    }

    return "btn-unlock";
  }

  getMineButtonText(mineId) {
    if (!this.isMineUnlocked(mineId)) {
      return "LOCKED";
    }

    if (this.activeMines.includes(mineId)) {
      return "ENTER MINE";
    }

    return "BUILD MINE";
  }

  getMineStatusHTML(mineId) {
    if (!this.isMineUnlocked(mineId)) {
      return '<span class="status-locked">🔒 Locked</span>';
    }

    if (this.activeMines.includes(mineId)) {
      return '<span class="status-active">✅ Active</span>';
    }

    return '<span class="status-available">🔧 Ready to Build</span>';
  }

  isMineUnlocked(mineId) {
    return this.unlockedMines.includes(mineId);
  }

  canAffordMine(mineId) {
    const mineConfig = GAME_CONFIG.mines[mineId];
    if (!mineConfig) return false;

    return Object.entries(mineConfig.unlockCost).every(([currency, cost]) => {
      return this.currencies[currency] >= cost;
    });
  }

  // Override setupEventListeners to add MapScreen specific events
  setupEventListeners() {
    super.setupEventListeners();

    // Back button
    if (this.elements.backButton) {
      this.elements.backButton.addEventListener("click", () => {
        this.handleBackClick();
      });
    }

    // Mine location hover effects
    this.elements.mineLocations.forEach((location) => {
      location.addEventListener("mouseenter", (e) => {
        this.handleMineHover(e.currentTarget.dataset.mine);
      });

      location.addEventListener("mouseleave", () => {
        this.handleMineLeave();
      });
    });

    // Mine button clicks
    Object.values(this.elements.mineButtons).forEach((button) => {
      if (button) {
        button.addEventListener("click", (e) => {
          this.handleMineClick(e.currentTarget.dataset.mine);
        });
      }
    });
  }

  // Override keyboard handling
  handleKeydown(e) {
    super.handleKeydown(e);

    if (e.code === "Escape") {
      this.handleBackClick();
    }

    // Number keys 1-5 for mine selection
    if (e.code >= "Digit1" && e.code <= "Digit5") {
      const mineIndex = parseInt(e.code.slice(-1)) - 1;
      const mineId = `mine${mineIndex + 1}`;
      if (GAME_CONFIG.mines[mineId]) {
        this.handleMineClick(mineId);
      }
    }
  }

  // Event handlers
  handleBackClick() {
    console.log("🔙 Back button clicked");

    if (this.audioManager) {
      this.audioManager.playSound("button-click");
    }

    this.showTemporaryMessage("Returning to Start Screen...", "info");

    // In full game, this would transition to previous screen
    // For now, just show a message
    this.setManagedTimeout(() => {
      this.showTemporaryMessage("Back navigation would happen here", "success");
    }, 1000);
  }

  handleMineHover(mineId) {
    if (this.hoveredMine === mineId) return;

    this.hoveredMine = mineId;
    const mineConfig = GAME_CONFIG.mines[mineId];

    if (!mineConfig) return;

    // Update tooltip content
    const tooltip = this.elements.mineTooltip;
    if (tooltip) {
      tooltip.querySelector(".tooltip-title").textContent = mineConfig.name;
      tooltip.querySelector(
        ".tooltip-description"
      ).textContent = `Mine ${mineConfig.currency} and collect ${mineConfig.mecha} mecha parts`;

      const stats = tooltip.querySelectorAll(".stat-value");
      stats[0].textContent = mineConfig.currency;
      stats[1].textContent = `${mineConfig.baseOutput}/cycle`;
      stats[2].textContent = GAME_CONFIG.mechas[mineConfig.mecha].name;
      stats[3].textContent =
        GAME_CONFIG.monsters[mineConfig.monster]?.name || "Unknown";

      // Position tooltip near cursor
      tooltip.classList.remove("hidden");
    }

    // Play hover sound
    if (this.audioManager) {
      this.audioManager.playSound("ui-hover");
    }
  }

  handleMineLeave() {
    this.hoveredMine = null;

    if (this.elements.mineTooltip) {
      this.elements.mineTooltip.classList.add("hidden");
    }
  }

  handleMineClick(mineId) {
    console.log(`🏭 Mine ${mineId} clicked`);

    const mineConfig = GAME_CONFIG.mines[mineId];
    if (!mineConfig) return;

    // Check if mine is unlocked
    if (!this.isMineUnlocked(mineId)) {
      this.showTemporaryMessage(
        "Mine is locked! Check unlock requirements.",
        "warning"
      );
      this.triggerScreenShake(200);
      return;
    }

    // Check if mine is already active
    if (this.activeMines.includes(mineId)) {
      this.enterMine(mineId);
      return;
    }

    // Try to build/unlock mine
    if (this.canAffordMine(mineId)) {
      this.buildMine(mineId);
    } else {
      this.showUnlockRequirements(mineId);
    }
  }

  buildMine(mineId) {
    const mineConfig = GAME_CONFIG.mines[mineId];

    console.log(`🔨 Building mine ${mineId}`);

    // Deduct costs
    Object.entries(mineConfig.unlockCost).forEach(([currency, cost]) => {
      if (cost > 0) {
        this.currencies[currency] -= cost;
      }
    });

    // Add to active mines
    this.activeMines.push(mineId);

    // Update UI
    this.updateUI();

    // Play success sound and show message
    if (this.audioManager) {
      this.audioManager.playSound("mine-built");
    }

    this.showSuccessMessage(
      `🏭 ${mineConfig.name} built successfully!\nReady for mining operations.`
    );

    // Create particle effect
    const mineButton = this.elements.mineButtons[mineId];
    if (mineButton) {
      const rect = mineButton.getBoundingClientRect();
      this.createParticleBurst(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        15,
        "rgba(0, 255, 136, 0.8)"
      );
    }
  }

  enterMine(mineId) {
    console.log(`⛏️ Entering mine ${mineId}`);

    if (this.audioManager) {
      this.audioManager.playSound("mine-enter");
    }

    // Show loading screen
    this.showLoadingScreen();

    // Simulate loading
    this.simulateLoading(() => {
      this.showSuccessMessage(`Entering ${GAME_CONFIG.mines[mineId].name}...`);
      // In full game, this would transition to mining screen
      console.log(`🔄 Would transition to mining screen for ${mineId}`);
    });
  }

  showUnlockRequirements(mineId) {
    const mineConfig = GAME_CONFIG.mines[mineId];
    const requirements = Object.entries(mineConfig.unlockCost)
      .filter(([currency, cost]) => cost > 0)
      .map(([currency, cost]) => `${cost} ${currency}`)
      .join(", ");

    this.showTemporaryMessage(
      `Unlock requirements: ${requirements}`,
      "info",
      4000
    );
  }

  // UI Update methods
  updateUI() {
    this.updateCurrencyDisplay();
    this.updateMineStates();
  }

  updateCurrencyDisplay() {
    Object.entries(this.currencies).forEach(([currency, amount]) => {
      const element = this.elements.currencyValues[currency];
      if (element) {
        element.textContent = amount;

        // Add animation for currency changes
        element.classList.add("currency-updated");
        this.setManagedTimeout(() => {
          element.classList.remove("currency-updated");
        }, 500);
      }
    });
  }

  updateMineStates() {
    Object.keys(GAME_CONFIG.mines).forEach((mineId) => {
      const location = this.container.querySelector(
        `.mine-location[data-mine="${mineId}"]`
      );
      const button = this.elements.mineButtons[mineId];
      const status = this.elements.mineStatusElements[mineId];

      if (location) {
        location.className = `mine-location ${this.getMineLocationClass(
          mineId
        )}`;
      }

      if (button) {
        button.className = `mine-button btn ${this.getMineButtonClass(mineId)}`;
        button.textContent = this.getMineButtonText(mineId);
        button.disabled = !this.isMineUnlocked(mineId);
      }

      if (status) {
        status.innerHTML = this.getMineStatusHTML(mineId);
      }
    });
  }

  // Override initializeAudio to add MapScreen specific sounds
  initializeAudio() {
    super.initializeAudio();

    // Add MapScreen specific sounds
    this.audioManager.sounds = {
      ...this.audioManager.sounds,
      "ui-hover": null,
      "mine-built": null,
      "mine-enter": null,
      "map-ambient": null,
    };
  }

  // Debug methods for testing
  addCurrency(currency, amount) {
    if (this.currencies.hasOwnProperty(currency)) {
      this.currencies[currency] += amount;
      this.updateUI();
      this.showTemporaryMessage(`Added ${amount} ${currency}`, "success");
    }
  }

  unlockMine(mineId) {
    if (!this.unlockedMines.includes(mineId)) {
      this.unlockedMines.push(mineId);
      this.updateUI();
      this.showTemporaryMessage(`Unlocked ${mineId}`, "success");
    }
  }

  unlockAllMines() {
    Object.keys(GAME_CONFIG.mines).forEach((mineId) => {
      if (!this.unlockedMines.includes(mineId)) {
        this.unlockedMines.push(mineId);
      }
    });
    this.updateUI();
    this.showTemporaryMessage("All mines unlocked!", "success");
  }

  setCurrency(currency, amount) {
    if (this.currencies.hasOwnProperty(currency)) {
      this.currencies[currency] = amount;
      this.updateUI();
      this.showTemporaryMessage(`Set ${currency} to ${amount}`, "info");
    }
  }

  // Override destroy to clean up MapScreen specific elements
  destroy() {
    // Clear cached elements
    this.elements = {};

    // Reset MapScreen specific state
    this.selectedMine = null;
    this.hoveredMine = null;

    // Call parent destroy method
    super.destroy();

    console.log("🗑️ MapScreen destroyed and cleaned up");
  }
}

// Make available globally for debug system
window.MapScreen = MapScreen;

console.log("🗺️ MapScreen class loaded!");
