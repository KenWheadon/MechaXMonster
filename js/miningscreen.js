// MiningScreen - Refactored to use modular components
class MiningScreen extends Screen {
  constructor(container, mineId = "mine1") {
    super(container, "mining");

    // MiningScreen specific state
    this.mineId = mineId;
    this.mineConfig = GAME_CONFIG.mines[mineId];

    // Validate mineConfig exists
    if (!this.mineConfig) {
      throw new Error(`Mine configuration not found for ${mineId}`);
    }

    this.mechaConfig = GAME_CONFIG.mechas[this.mineConfig.mecha];

    // Validate mechaConfig exists
    if (!this.mechaConfig) {
      throw new Error(
        `Mecha configuration not found for ${this.mineConfig.mecha}`
      );
    }

    // Core currency state
    this.currency = 0;
    this.monsterCurrency = 0;

    // UI state
    this.selectedMachine = null;
    this.activeSlotMachine = null;

    // DOM element cache
    this.elements = {};

    // Initialize modular components
    this.machineManager = new MachineManager(this);
    this.upgradeSlotMachine = new MachineUpgradeSlotMachine(
      this.container,
      this
    );
    this.geodeSystem = new GeodeSystem(this);
    this.partsInventory = new PartsInventory(this);
    this.mechaBuilder = new MechaBuilder(this);

    console.log(`⛏️ MiningScreen created for ${mineId}`);
  }

  // Override init to add MiningScreen specific initialization
  init() {
    this.render();
    this.cacheElements();
    this.setupEventListeners();
    this.startAnimations();
    this.initializeAudio();
    this.startParticleSystem();

    // Initialize modular components
    this.machineManager.init();
    this.upgradeSlotMachine.init();
    this.geodeSystem.init();
    this.partsInventory.init();
    this.mechaBuilder.init();

    this.updateUI();
    this.isActive = true;

    console.log(`✅ MiningScreen initialized for ${this.mineId}`);
  }

  // Cache frequently accessed DOM elements
  cacheElements() {
    this.elements = {
      backButton: this.container.querySelector(".back-button"),
      currencyDisplay: this.container.querySelector(".currency-value"),
      monsterCurrencyDisplay: this.container.querySelector(
        ".monster-currency-value"
      ),
      miningArea: this.container.querySelector(".mining-area"),
      machineContainers: this.container.querySelectorAll(".machine-container"),
      partsInventory: this.container.querySelector(".parts-inventory"),
      partsGrid: this.container.querySelector(".parts-grid"),
      buildMechaButton: this.container.querySelector(".build-mecha-button"),
      mechaDisplay: this.container.querySelector(".mecha-display"),
      slotMachineModal: this.container.querySelector(".slot-machine-modal"),
      machines: {},
    };

    // Cache machine-specific elements
    this.machineManager.getAllMachines().forEach((machine, index) => {
      const container = this.container.querySelector(
        `[data-machine="${machine.id}"]`
      );
      if (container) {
        this.elements.machines[machine.id] = {
          container,
          energyBar: container.querySelector(".energy-bar"),
          energyFill: container.querySelector(".energy-fill"),
          energyText: container.querySelector(".energy-text"),
          machineButton: container.querySelector(".machine-button"),
          geodeCounter: container.querySelector(".geode-counter"),
          geodeButton: container.querySelector(".geode-button"),
          upgradeButton: container.querySelector(".upgrade-button"),
          geodeDrawer: container.querySelector(".geode-drawer"),
          autoMiningIndicator: container.querySelector(
            ".auto-mining-indicator"
          ),
        };
      }
    });
  }

  // Override render method
  render() {
    // Validate required configs before rendering
    if (!this.mineConfig || !this.mechaConfig) {
      const errorHtml = `
        <div class="mining-screen screen active">
          <div class="error-content" style="padding: 50px; text-align: center;">
            <h2 style="color: #ff6b6b;">Configuration Error</h2>
            <p>Missing mine or mecha configuration for ${this.mineId}</p>
            <p>mineConfig: ${this.mineConfig ? "✅" : "❌"}</p>
            <p>mechaConfig: ${this.mechaConfig ? "✅" : "❌"}</p>
          </div>
        </div>
      `;
      this.container.innerHTML = errorHtml;
      return;
    }

    const html = `
      <div class="mining-screen screen active">
        <!-- Multi-layer background system -->
        <div class="background-layer background-image" style="background-image: url('images/mine-background-${
          this.mineConfig.mecha
        }.png');"></div>
        <div class="background-layer nebula-layer"></div>
        <div class="stars-layer"></div>
        <div class="asteroids-layer"></div>
        <div class="particles-layer"></div>
        
        <!-- Header -->
        <div class="mining-header">
          <button class="back-button btn btn-secondary">
            <img src="images/btn-retry.png" alt="Back" />
            <span>Back to Map</span>
          </button>
          
          <div class="mine-title">
            <h1>${this.mineConfig.name}</h1>
            <p>Mining ${this.mineConfig.currency} • ${this.mechaConfig.name}</p>
          </div>
          
          <div class="currency-display">
            <div class="currency-item">
              <img src="images/currency-${this.mineConfig.currency}.png" alt="${
      this.mineConfig.currency
    }" />
              <span class="currency-value">0</span>
            </div>
            <div class="currency-item">
              <img src="images/currency-monster_${
                this.mineConfig.currency
              }.png" alt="monster currency" />
              <span class="monster-currency-value">0</span>
            </div>
          </div>
        </div>

        <!-- Main mining content -->
        <div class="mining-content">
          <!-- Mining area -->
          <div class="mining-area">
            <div class="machines-container">
              ${this.renderMachines()}
            </div>
            
            <!-- Purchase additional machines -->
            <div class="machine-purchase">
              ${this.renderMachinePurchases()}
            </div>
          </div>

          <!-- Side panel -->
          <div class="side-panel">
            <!-- Mecha display -->
            ${this.mechaBuilder.renderMechaDisplay()}

            <!-- Parts inventory -->
            <div class="parts-inventory">
              <h3>Mecha Parts</h3>
              <div class="parts-grid">
                ${this.partsInventory.renderPartsGrid()}
              </div>
              <div class="parts-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${this.partsInventory.getCompletionPercentage()}%"></div>
                </div>
                <span class="progress-text">${
                  this.partsInventory.getAllParts().length
                }/6 Parts</span>
              </div>
            </div>

            <!-- Combat access (when mecha is built) -->
            <div class="combat-access ${
              this.mechaBuilder.isCombatReady() ? "" : "hidden"
            }">
              <button class="combat-button btn btn-combat">
                <img src="images/slime-${
                  this.mineConfig.monster
                }-1.png" alt="Fight Monster" />
                <span>Fight ${
                  GAME_CONFIG.monsters[this.mineConfig.monster].name
                }</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Enhanced Slot Machine Modal -->
        <div class="slot-machine-modal hidden">
          <div class="modal-content">
            <div class="modal-header">
              <h2>Machine Upgrades</h2>
              <button class="close-slot-modal-button">×</button>
            </div>
            <div class="slot-machine-container">
              <!-- Slot Machine -->
              <div class="slot-machine">
                <div class="slot-reels">
                  <div class="slot-reel" data-reel="0">
                    <div class="reel-symbols">
                      <img src="images/currency-shells.png" alt="shells" class="reel-symbol">
                    </div>
                  </div>
                  <div class="slot-reel" data-reel="1">
                    <div class="reel-symbols">
                      <img src="images/currency-coins.png" alt="coins" class="reel-symbol">
                    </div>
                  </div>
                  <div class="slot-reel" data-reel="2">
                    <div class="reel-symbols">
                      <img src="images/currency-bars.png" alt="bars" class="reel-symbol">
                    </div>
                  </div>
                </div>
                <div class="slot-result hidden">
                  <div class="result-text"></div>
                </div>
              </div>
              
              <!-- Slot Controls -->
              <div class="slot-controls">
                <div class="spin-cost">Cost: <span class="cost-amount">10</span> ${
                  this.mineConfig.currency
                }</div>
                <button class="spin-button btn btn-primary">Spin for Upgrade</button>
              </div>
            </div>
            
            <!-- Paytable -->
            <div class="slot-paytable">
              <!-- Paytable content will be rendered by SlotMachine class -->
            </div>
          </div>
        </div>

        <!-- Loading overlay -->
        <div class="loading-overlay hidden">
          <div class="loading-content">
            <div class="loading-spinner"></div>
            <div class="loading-text">INITIALIZING MINING EQUIPMENT...</div>
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  renderMachines() {
    return this.machineManager
      .getAllMachines()
      .map(
        (machine, index) => `
        <div class="machine-container" data-machine="${machine.id}">
          <div class="machine-header">
            <div class="machine-number">Machine ${index + 1}</div>
            <div class="machine-controls-header">
              <div class="geode-counter ${
                machine.geodeCount > 0 ? "has-geodes" : ""
              }">
                <button class="geode-button" ${
                  machine.geodeCount > 0 ? "" : "disabled"
                }>
                  <img src="images/geode-${
                    this.mineConfig.mecha
                  }.png" alt="Geodes" />
                  <span class="geode-count">${machine.geodeCount}</span>
                </button>
              </div>
              <button class="upgrade-button btn btn-secondary">
                <img src="images/icon-upgrade.png" alt="Upgrade" />
                <span>Upgrade</span>
              </button>
            </div>
          </div>
          
          <!-- Geode Drawer -->
          <div class="geode-drawer ${machine.geodeDrawerOpen ? "open" : ""}">
            <div class="geode-drawer-content">
              <div class="geode-title">Click geodes to open:</div>
              <div class="geode-list">
                ${this.geodeSystem.renderGeodeDrawer(machine)}
              </div>
            </div>
          </div>
          
          <div class="machine-main">
            <div class="machine-visual">
              <img src="images/mine-${
                index + 1
              }.png" alt="Mining Machine" class="machine-image" />
              <div class="machine-glow ${
                machine.isActive ? "active" : ""
              }"></div>
              <div class="auto-mining-indicator ${
                machine.isAutoMining ? "active" : ""
              }" title="Auto-Mining Active">
                <div class="auto-indicator-pulse"></div>
                <span>AUTO</span>
              </div>
            </div>
            
            <div class="machine-controls">
              <div class="energy-bar">
                <div class="energy-fill" style="width: ${
                  machine.energyLevel
                }%"></div>
                <div class="energy-text">${machine.energyLevel}%</div>
              </div>
              
              <button class="machine-button btn btn-primary" ${
                machine.isAutoMining ? "disabled" : ""
              }>
                ${machine.isAutoMining ? "Auto-Mining" : "Mine"}
              </button>
            </div>
          </div>
        </div>
      `
      )
      .join("");
  }

  renderMachinePurchases() {
    const availableMachines = this.machineManager.getAvailableMachines();

    return availableMachines
      .map((machineData) => {
        const cost = machineData.cost;
        return `
        <button class="purchase-machine-button btn btn-secondary" 
                data-machine-index="${machineData.index}" 
                ${machineData.canAfford ? "" : "disabled"}>
          <img src="images/icon-plus.png" alt="Add Machine" />
          <span>Add Machine ${machineData.index + 1}</span>
          <div class="purchase-cost">
            ${cost.shells} ${this.mineConfig.currency}
            ${cost.monster_shells > 0 ? `+ ${cost.monster_shells} Monster` : ""}
          </div>
        </button>
      `;
      })
      .join("");
  }

  // Override setupEventListeners to add MiningScreen specific events
  setupEventListeners() {
    super.setupEventListeners();

    // Back button
    if (this.elements.backButton) {
      this.elements.backButton.addEventListener("click", () => {
        this.handleBackClick();
      });
    }

    // Build mecha button
    if (this.elements.buildMechaButton) {
      this.elements.buildMechaButton.addEventListener("click", () => {
        this.mechaBuilder.handleBuildClick();
      });
    }

    // Machine purchase buttons
    const purchaseButtons = this.container.querySelectorAll(
      ".purchase-machine-button"
    );
    purchaseButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const machineIndex = parseInt(e.currentTarget.dataset.machineIndex);
        this.handleMachinePurchase(machineIndex);
      });
    });

    // Set up machine event listeners
    this.setupMachineEventListeners();
  }

  // Setup machine-specific event listeners
  setupMachineEventListeners() {
    this.machineManager.getAllMachines().forEach((machine) => {
      const container = this.container.querySelector(
        `[data-machine="${machine.id}"]`
      );
      if (!container) return;

      // Machine button click
      const machineButton = container.querySelector(".machine-button");
      if (machineButton) {
        machineButton.addEventListener("click", () => {
          this.handleMachineClick(machine.id);
        });
      }

      // Geode button click
      const geodeButton = container.querySelector(".geode-button");
      if (geodeButton) {
        geodeButton.addEventListener("click", () => {
          this.handleGeodeClick(machine.id);
        });
      }

      // Upgrade button click
      const upgradeButton = container.querySelector(".upgrade-button");
      if (upgradeButton) {
        upgradeButton.addEventListener("click", () => {
          this.handleUpgradeClick(machine.id);
        });
      }
    });

    // Set up geode item click listeners
    const geodeItems = this.container.querySelectorAll(".geode-item");
    geodeItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        this.geodeSystem.handleGeodeClick(e.currentTarget);
      });
    });
  }

  // Event handlers
  handleBackClick() {
    console.log("🔙 Back to map clicked");

    if (this.audioManager) {
      this.audioManager.playSound("button-click");
    }

    this.showTemporaryMessage("Returning to map...", "info");

    // In full game, this would transition back to map screen
    this.setManagedTimeout(() => {
      this.showTemporaryMessage("Map transition would happen here", "success");
    }, 1000);
  }

  handleMachineClick(machineId) {
    if (this.machineManager.addEnergy(machineId)) {
      // Play click sound
      if (this.audioManager) {
        this.audioManager.playSound("machine-click");
      }

      // Update UI
      this.updateMachineUI(machineId);

      // Visual feedback
      this.createMachineClickEffect(machineId);
    }
  }

  handleGeodeClick(machineId) {
    if (this.geodeSystem.toggleGeodeDrawer(machineId)) {
      console.log(`💎 Toggling geode drawer for ${machineId}`);
      this.updateMachineUI(machineId);
    }
  }

  handleUpgradeClick(machineId) {
    console.log(`🔧 Upgrade clicked for ${machineId}`);

    const upgradeCost = this.machineManager.getUpgradeCost(machineId);

    // Check if player can afford
    if (this.currency < upgradeCost) {
      this.showTemporaryMessage("Not enough currency for upgrade!", "warning");
      return;
    }

    // Show upgrade slot machine modal
    this.upgradeSlotMachine.showForMachine(machineId);
  }

  handleMachinePurchase(machineIndex) {
    if (this.machineManager.purchaseMachine(machineIndex)) {
      // Update currency displays
      this.updateCurrencyDisplay();

      // Re-render and update
      this.render();
      this.cacheElements();
      this.setupEventListeners();
      this.updateUI();

      this.showTemporaryMessage(
        `Machine ${machineIndex + 1} purchased!`,
        "success"
      );
    } else {
      this.showTemporaryMessage("Not enough currency!", "warning");
    }
  }

  // UI update methods
  updateUI() {
    this.updateCurrencyDisplay();
    this.updateMachineUIs();
    this.partsInventory.updateDisplay();
    this.mechaBuilder.updateMechaDisplay();
  }

  updateCurrencyDisplay() {
    if (this.elements.currencyDisplay) {
      this.elements.currencyDisplay.textContent = this.currency;
    }
    if (this.elements.monsterCurrencyDisplay) {
      this.elements.monsterCurrencyDisplay.textContent = this.monsterCurrency;
    }
  }

  updateMachineUIs() {
    this.machineManager.getAllMachines().forEach((machine) => {
      this.updateMachineUI(machine.id);
    });
  }

  updateMachineUI(machineId) {
    const machine = this.machineManager.getMachine(machineId);
    if (!machine) return;

    const container = this.container.querySelector(
      `[data-machine="${machineId}"]`
    );
    if (!container) return;

    // Update energy bar
    const energyFill = container.querySelector(".energy-fill");
    const energyText = container.querySelector(".energy-text");
    if (energyFill) energyFill.style.width = `${machine.energyLevel}%`;
    if (energyText) energyText.textContent = `${machine.energyLevel}%`;

    // Update machine glow
    const machineGlow = container.querySelector(".machine-glow");
    if (machineGlow) {
      machineGlow.classList.toggle("active", machine.isActive);
    }

    // Update auto-mining indicator
    const autoIndicator = container.querySelector(".auto-mining-indicator");
    const machineButton = container.querySelector(".machine-button");
    if (autoIndicator) {
      autoIndicator.classList.toggle("active", machine.isAutoMining);
    }
    if (machineButton) {
      machineButton.disabled = machine.isAutoMining;
      machineButton.textContent = machine.isAutoMining ? "Auto-Mining" : "Mine";
    }

    // Update geode counter
    const geodeCounter = container.querySelector(".geode-counter");
    const geodeCount = container.querySelector(".geode-count");
    const geodeButton = container.querySelector(".geode-button");

    if (geodeCount) geodeCount.textContent = machine.geodeCount;
    if (geodeCounter) {
      geodeCounter.classList.toggle("has-geodes", machine.geodeCount > 0);
    }
    if (geodeButton) {
      geodeButton.disabled = machine.geodeCount === 0;
    }

    // Update geode drawer
    const geodeDrawer = container.querySelector(".geode-drawer");
    if (geodeDrawer) {
      geodeDrawer.classList.toggle("open", machine.geodeDrawerOpen);

      if (machine.geodeDrawerOpen) {
        const geodeList = geodeDrawer.querySelector(".geode-list");
        if (geodeList) {
          geodeList.innerHTML = this.geodeSystem.renderGeodeDrawer(machine);

          // Re-add event listeners to new geode items
          const geodeItems = geodeList.querySelectorAll(".geode-item");
          geodeItems.forEach((item) => {
            item.addEventListener("click", (e) => {
              this.geodeSystem.handleGeodeClick(e.currentTarget);
            });
          });
        }
      }
    }
  }

  // Check if mecha can be built
  checkMechaBuildability() {
    if (this.partsInventory.isComplete() && !this.mechaBuilder.hasMecha) {
      const buildButton = this.container.querySelector(".build-mecha-button");
      if (buildButton) {
        buildButton.classList.remove("hidden");
      }
      this.showTemporaryMessage(
        "All parts collected! Ready to build mecha!",
        "success"
      );
    }
  }

  // Visual effects
  createMachineClickEffect(machineId) {
    const container = this.container.querySelector(
      `[data-machine="${machineId}"]`
    );
    if (!container) return;

    const machineButton = container.querySelector(".machine-button");
    if (!machineButton) return;

    const rect = machineButton.getBoundingClientRect();
    this.createParticleBurst(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      4,
      "rgba(0, 255, 136, 0.8)"
    );
  }

  createMiningCompleteEffect(machineId) {
    const container = this.container.querySelector(
      `[data-machine="${machineId}"]`
    );
    if (!container) return;

    const rect = container.getBoundingClientRect();
    this.createParticleBurst(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      8,
      "rgba(255, 215, 0, 0.8)"
    );
  }

  // Override initializeAudio to add MiningScreen specific sounds
  initializeAudio() {
    super.initializeAudio();

    this.audioManager.sounds = {
      ...this.audioManager.sounds,
      "machine-click": null,
      "mining-complete": null,
      "geode-open": null,
      "collect-items": null,
      "mecha-built": null,
      "auto-mining-ambient": null,
      "slot-spin": null,
      "upgrade-success": null,
    };
  }

  // Debug methods (kept minimal for testing)
  addCurrency(amount) {
    this.currency += amount;
    this.updateCurrencyDisplay();
    this.showTemporaryMessage(
      `Added ${amount} ${this.mineConfig.currency}`,
      "success"
    );
  }

  addMonsterCurrency(amount) {
    this.monsterCurrency += amount;
    this.updateCurrencyDisplay();
    this.showTemporaryMessage(
      `Added ${amount} monster ${this.mineConfig.currency}`,
      "success"
    );
  }

  addPart(partName) {
    if (this.partsInventory.collectPart(partName, "debug")) {
      this.checkMechaBuildability();
    }
  }

  addGeode(machineId = "machine1") {
    if (this.geodeSystem.addGeodes(machineId, 1)) {
      this.updateMachineUI(machineId);
    }
  }

  // Override destroy to clean up MiningScreen specific elements
  destroy() {
    // Clean up modular components
    this.machineManager.destroy();
    this.upgradeSlotMachine.hide();
    this.geodeSystem.destroy();
    this.partsInventory.destroy();
    this.mechaBuilder.destroy();

    // Clear cached elements
    this.elements = {};

    // Reset MiningScreen specific state
    this.selectedMachine = null;
    this.activeSlotMachine = null;

    // Call parent destroy method
    super.destroy();

    console.log("🗑️ MiningScreen destroyed and cleaned up");
  }
}

// Make available globally for debug system
window.MiningScreen = MiningScreen;

console.log("⛏️ MiningScreen class loaded!");
