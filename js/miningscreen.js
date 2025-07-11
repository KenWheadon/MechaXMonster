// Enhanced MiningScreen - Active mining with timing mini-game and combos
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

    // New active mining state
    this.activeMining = {
      isActive: false,
      currentMachine: null,
      targetZone: null,
      timeWindow: 1000, // 1 second timing window
      currentCombo: 0,
      maxCombo: 0,
      comboMultiplier: 1,
      perfectHits: 0,
      totalHits: 0,
      lastHitTime: 0,
      comboDecayTimer: null,
    };

    // Per-mine upgrades (applies to all machines)
    this.mineUpgrades = {
      timeReduction: 0,
      outputBonus: 0,
      outputMultiplier: 0,
      partDropRate: 0,
      comboBonus: 0,
      criticalChance: 0,
    };

    // Merchant system
    this.merchant = {
      geodeCost: 50,
      costMultiplier: 1.2,
      purchaseCount: 0,
    };

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

    console.log(`⛏️ Enhanced MiningScreen created for ${mineId}`);
  }

  // Override init to add enhanced initialization
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

    // Initialize mining mini-game
    this.initializeMiningGame();

    this.updateUI();
    this.isActive = true;

    console.log(`✅ Enhanced MiningScreen initialized for ${this.mineId}`);
  }

  // Initialize the timing-based mining mini-game
  initializeMiningGame() {
    this.activeMining.targetZone = {
      start: 0.2,
      end: 0.8,
      optimal: 0.5,
      perfectZone: 0.1, // +/- 0.1 around optimal for perfect hits
    };

    // Create timing indicator
    this.createTimingIndicator();
  }

  // Create timing indicator element
  createTimingIndicator() {
    const indicator = document.createElement("div");
    indicator.className = "mining-timing-indicator hidden";
    indicator.innerHTML = `
      <div class="timing-bar">
        <div class="timing-track"></div>
        <div class="timing-cursor"></div>
        <div class="timing-target-zone"></div>
        <div class="timing-perfect-zone"></div>
      </div>
      <div class="timing-feedback">
        <div class="combo-display">
          <span class="combo-text">Combo: <span class="combo-count">0</span></span>
          <span class="multiplier-text">x<span class="multiplier-value">1.0</span></span>
        </div>
        <div class="hit-feedback"></div>
      </div>
    `;
    this.container.appendChild(indicator);
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
      merchantButton: this.container.querySelector(".merchant-button"),
      timingIndicator: this.container.querySelector(".mining-timing-indicator"),
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
          comboDisplay: container.querySelector(".machine-combo-display"),
        };
      }
    });
  }

  // Override render method with enhanced UI
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
            <p>Active Mining • ${this.mechaConfig.name}</p>
            <div class="mine-stats">
              <span class="stat-item">Combo: <span class="combo-record">${
                this.activeMining.maxCombo
              }</span></span>
              <span class="stat-item">Efficiency: <span class="efficiency-rate">${Math.floor(
                this.activeMining.totalHits > 0
                  ? (this.activeMining.perfectHits /
                      this.activeMining.totalHits) *
                      100
                  : 0
              )}%</span></span>
            </div>
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
            <button class="merchant-button btn btn-special">
              <img src="images/icon-merchant.png" alt="Merchant" />
              <span>Geode Shop</span>
            </button>
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

            <!-- Mine-wide upgrades display -->
            <div class="mine-upgrades-display">
              <h3>Mine Upgrades (Apply to All Machines)</h3>
              <div class="upgrade-grid">
                ${this.renderMineUpgrades()}
              </div>
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
              <h2>Mine Upgrades (All Machines)</h2>
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
                <div class="spin-cost">Cost: <span class="cost-amount">50</span> ${
                  this.mineConfig.currency
                }</div>
                <button class="spin-button btn btn-primary">Spin for Mine Upgrade</button>
              </div>
            </div>
            
            <!-- Paytable -->
            <div class="slot-paytable">
              <!-- Paytable content will be rendered by SlotMachine class -->
            </div>
          </div>
        </div>

        <!-- Merchant Modal -->
        <div class="merchant-modal hidden">
          <div class="modal-content">
            <div class="modal-header">
              <h2>Geode Merchant</h2>
              <button class="close-merchant-modal-button">×</button>
            </div>
            <div class="merchant-content">
              <div class="merchant-description">
                <p>Purchase geodes containing mecha parts, upgrades, or bonus currency!</p>
                <p>Each geode guaranteed to contain valuable rewards.</p>
              </div>
              <div class="merchant-offer">
                <div class="geode-preview">
                  <img src="images/geode-${
                    this.mineConfig.mecha
                  }.png" alt="Geode" />
                  <div class="geode-glow"></div>
                </div>
                <div class="offer-details">
                  <div class="offer-price">
                    <span class="price-amount">${this.merchant.geodeCost}</span>
                    <img src="images/currency-${
                      this.mineConfig.currency
                    }.png" alt="${this.mineConfig.currency}" />
                  </div>
                  <button class="buy-geode-button btn btn-primary">Buy Geode</button>
                  <div class="purchase-history">
                    <small>Purchased: ${
                      this.merchant.purchaseCount
                    } geodes</small>
                  </div>
                </div>
              </div>
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

    // Inject enhanced CSS
    this.injectEnhancedCSS();
  }

  // Inject enhanced CSS for the new features
  injectEnhancedCSS() {
    const enhancedCSS = `
      /* Enhanced Mining UI */
      .mining-header .mine-stats {
        display: flex;
        gap: 20px;
        margin-top: 5px;
        font-size: 0.9em;
        opacity: 0.8;
      }

      .stat-item {
        color: #00ff88;
      }

      /* Timing Indicator */
      .mining-timing-indicator {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1000;
        background: rgba(0, 20, 40, 0.95);
        padding: 30px;
        border-radius: 15px;
        border: 2px solid #00ff88;
        box-shadow: 0 0 30px rgba(0, 255, 136, 0.3);
        min-width: 400px;
        text-align: center;
      }

      .timing-bar {
        position: relative;
        width: 100%;
        height: 40px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        margin-bottom: 20px;
        overflow: hidden;
      }

      .timing-track {
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, #ff4444 0%, #ffff44 20%, #44ff44 40%, #44ff44 60%, #ffff44 80%, #ff4444 100%);
        opacity: 0.3;
      }

      .timing-cursor {
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        background: #ffffff;
        box-shadow: 0 0 10px #ffffff;
        animation: timing-cursor-move 2s linear infinite;
      }

      @keyframes timing-cursor-move {
        0% { left: 0; }
        100% { left: calc(100% - 4px); }
      }

      .timing-target-zone {
        position: absolute;
        top: 0;
        left: 20%;
        width: 60%;
        height: 100%;
        background: rgba(68, 255, 68, 0.3);
        border: 2px solid #44ff44;
      }

      .timing-perfect-zone {
        position: absolute;
        top: 0;
        left: 45%;
        width: 10%;
        height: 100%;
        background: rgba(255, 255, 68, 0.5);
        border: 2px solid #ffff44;
      }

      .timing-feedback {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .combo-display {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }

      .combo-text {
        font-size: 1.2em;
        font-weight: bold;
        color: #00ff88;
      }

      .multiplier-text {
        font-size: 1.1em;
        color: #ffff44;
      }

      .hit-feedback {
        font-size: 1.5em;
        font-weight: bold;
        min-width: 100px;
        text-align: right;
      }

      .hit-perfect { color: #ffff44; }
      .hit-good { color: #44ff44; }
      .hit-miss { color: #ff4444; }

      /* Enhanced Machine UI */
      .machine-container {
        position: relative;
        border: 2px solid #333;
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 15px;
        background: linear-gradient(135deg, rgba(0, 20, 40, 0.8) 0%, rgba(0, 40, 80, 0.8) 100%);
        transition: all 0.3s ease;
      }

      .machine-container:hover {
        border-color: #00ff88;
        box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
      }

      .machine-container.active-mining {
        border-color: #ffff44;
        box-shadow: 0 0 25px rgba(255, 255, 68, 0.5);
        animation: mining-pulse 1s ease-in-out infinite alternate;
      }

      @keyframes mining-pulse {
        from { transform: scale(1); }
        to { transform: scale(1.02); }
      }

      .machine-combo-display {
        position: absolute;
        top: -10px;
        right: -10px;
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
        color: white;
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 0.8em;
        font-weight: bold;
        opacity: 0;
        transform: scale(0.8);
        transition: all 0.3s ease;
      }

      .machine-combo-display.active {
        opacity: 1;
        transform: scale(1);
      }

      .machine-button {
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
      }

      .machine-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 255, 136, 0.3);
      }

      .machine-button.ready-to-mine {
        background: linear-gradient(45deg, #00ff88, #00cc66);
        animation: ready-glow 2s ease-in-out infinite alternate;
      }

      @keyframes ready-glow {
        from { box-shadow: 0 0 10px rgba(0, 255, 136, 0.5); }
        to { box-shadow: 0 0 20px rgba(0, 255, 136, 0.8); }
      }

      /* Mine Upgrades Display */
      .mine-upgrades-display {
        background: rgba(0, 20, 40, 0.9);
        border: 2px solid #444;
        border-radius: 10px;
        padding: 20px;
        margin-top: 20px;
      }

      .upgrade-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-top: 15px;
      }

      .upgrade-item {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid #666;
        border-radius: 8px;
        padding: 10px;
        text-align: center;
      }

      .upgrade-item.active {
        border-color: #00ff88;
        background: rgba(0, 255, 136, 0.1);
      }

      .upgrade-name {
        font-weight: bold;
        color: #00ff88;
        margin-bottom: 5px;
      }

      .upgrade-level {
        font-size: 0.9em;
        opacity: 0.8;
      }

      /* Merchant Modal */
      .merchant-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1001;
      }

      .merchant-modal .modal-content {
        background: linear-gradient(135deg, #2c3e50, #34495e);
        border: 2px solid #00ff88;
        border-radius: 15px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 0 40px rgba(0, 255, 136, 0.3);
      }

      .merchant-content {
        text-align: center;
      }

      .merchant-description {
        margin-bottom: 20px;
        color: #ecf0f1;
        line-height: 1.6;
      }

      .merchant-offer {
        display: flex;
        align-items: center;
        gap: 20px;
        background: rgba(0, 0, 0, 0.3);
        padding: 20px;
        border-radius: 10px;
        margin-top: 20px;
      }

      .geode-preview {
        position: relative;
      }

      .geode-preview img {
        width: 80px;
        height: 80px;
        filter: brightness(1.2);
      }

      .geode-glow {
        position: absolute;
        top: -10px;
        left: -10px;
        right: -10px;
        bottom: -10px;
        background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
        border-radius: 50%;
        animation: geode-glow 2s ease-in-out infinite alternate;
      }

      @keyframes geode-glow {
        from { transform: scale(1); opacity: 0.3; }
        to { transform: scale(1.1); opacity: 0.6; }
      }

      .offer-details {
        flex: 1;
        text-align: left;
      }

      .offer-price {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 15px;
        font-size: 1.2em;
        font-weight: bold;
      }

      .price-amount {
        color: #f39c12;
      }

      .buy-geode-button {
        width: 100%;
        padding: 12px;
        font-size: 1.1em;
        margin-bottom: 10px;
      }

      .purchase-history {
        text-align: center;
        opacity: 0.7;
      }

      /* Enhanced particle effects */
      .particle-burst {
        position: fixed;
        pointer-events: none;
        z-index: 999;
      }

      .combo-particle {
        position: fixed;
        pointer-events: none;
        z-index: 998;
        font-size: 1.5em;
        font-weight: bold;
        color: #ffff44;
        animation: combo-float 1s ease-out forwards;
      }

      @keyframes combo-float {
        0% { transform: translateY(0) scale(1); opacity: 1; }
        100% { transform: translateY(-50px) scale(1.2); opacity: 0; }
      }

      /* Responsive design improvements */
      @media (max-width: 768px) {
        .mining-content {
          flex-direction: column;
        }
        
        .side-panel {
          width: 100%;
          margin-top: 20px;
        }
        
        .timing-indicator {
          min-width: 300px;
          padding: 20px;
        }
      }
    `;

    this.injectCSS("enhanced-mining-css", enhancedCSS);
  }

  renderMachines() {
    return this.machineManager
      .getAllMachines()
      .map(
        (machine, index) => `
        <div class="machine-container ${
          this.activeMining.currentMachine === machine.id ? "active-mining" : ""
        }" data-machine="${machine.id}">
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
            </div>
          </div>
          
          <!-- Combo Display -->
          <div class="machine-combo-display ${
            this.activeMining.currentCombo > 0 &&
            this.activeMining.currentMachine === machine.id
              ? "active"
              : ""
          }">
            ${this.activeMining.currentCombo}x Combo!
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
              
              <button class="machine-button btn btn-primary ${
                machine.energyLevel < 100 ? "ready-to-mine" : ""
              }" ${machine.isAutoMining ? "disabled" : ""}>
                ${machine.isAutoMining ? "Auto-Mining" : "Active Mine"}
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

  renderMineUpgrades() {
    const upgrades = [
      { key: "timeReduction", name: "Speed Boost", icon: "⚡" },
      { key: "outputBonus", name: "Output Boost", icon: "💰" },
      { key: "outputMultiplier", name: "Efficiency", icon: "🔧" },
      { key: "partDropRate", name: "Lucky Strike", icon: "💎" },
      { key: "comboBonus", name: "Combo Master", icon: "🎯" },
      { key: "criticalChance", name: "Critical Hit", icon: "💥" },
    ];

    return upgrades
      .map((upgrade) => {
        const level = Math.floor(this.mineUpgrades[upgrade.key] * 100);
        return `
        <div class="upgrade-item ${level > 0 ? "active" : ""}">
          <div class="upgrade-name">${upgrade.icon} ${upgrade.name}</div>
          <div class="upgrade-level">Level ${level}</div>
        </div>
      `;
      })
      .join("");
  }

  // Override setupEventListeners to add enhanced mining events
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

    // Merchant button
    if (this.elements.merchantButton) {
      this.elements.merchantButton.addEventListener("click", () => {
        this.showMerchantModal();
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

    // Mine upgrades button
    const mineUpgradesButton = this.container.querySelector(
      ".mine-upgrades-display"
    );
    if (mineUpgradesButton) {
      mineUpgradesButton.addEventListener("click", () => {
        this.showMineUpgradeModal();
      });
    }

    // Set up machine event listeners
    this.setupMachineEventListeners();

    // Set up timing game event listeners
    this.setupTimingGameEventListeners();

    // Set up merchant modal event listeners
    this.setupMerchantEventListeners();
  }

  // Setup timing game event listeners
  setupTimingGameEventListeners() {
    // Space bar or click to hit timing
    document.addEventListener("keydown", (e) => {
      if (e.code === "Space" && this.activeMining.isActive) {
        e.preventDefault();
        this.handleTimingHit();
      }
    });

    // Click on timing indicator to hit
    if (this.elements.timingIndicator) {
      this.elements.timingIndicator.addEventListener("click", () => {
        if (this.activeMining.isActive) {
          this.handleTimingHit();
        }
      });
    }
  }

  // Setup merchant modal event listeners
  setupMerchantEventListeners() {
    // Close merchant modal
    const closeMerchantButton = this.container.querySelector(
      ".close-merchant-modal-button"
    );
    if (closeMerchantButton) {
      closeMerchantButton.addEventListener("click", () => {
        this.hideMerchantModal();
      });
    }

    // Buy geode button
    const buyGeodeButton = this.container.querySelector(".buy-geode-button");
    if (buyGeodeButton) {
      buyGeodeButton.addEventListener("click", () => {
        this.handleGeodePurchase();
      });
    }

    // Close on background click
    const merchantModal = this.container.querySelector(".merchant-modal");
    if (merchantModal) {
      merchantModal.addEventListener("click", (e) => {
        if (e.target === merchantModal) {
          this.hideMerchantModal();
        }
      });
    }
  }

  // Setup machine-specific event listeners
  setupMachineEventListeners() {
    this.machineManager.getAllMachines().forEach((machine) => {
      const container = this.container.querySelector(
        `[data-machine="${machine.id}"]`
      );
      if (!container) return;

      // Machine button click - start timing game
      const machineButton = container.querySelector(".machine-button");
      if (machineButton) {
        machineButton.addEventListener("click", () => {
          this.startTimingGame(machine.id);
        });
      }

      // Geode button click
      const geodeButton = container.querySelector(".geode-button");
      if (geodeButton) {
        geodeButton.addEventListener("click", () => {
          this.handleGeodeClick(machine.id);
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

  // Start the timing-based mining game
  startTimingGame(machineId) {
    const machine = this.machineManager.getMachine(machineId);
    if (!machine || machine.isAutoMining || machine.energyLevel >= 100) {
      return;
    }

    // Set active mining state
    this.activeMining.isActive = true;
    this.activeMining.currentMachine = machineId;
    this.activeMining.lastHitTime = Date.now();

    // Show timing indicator
    if (this.elements.timingIndicator) {
      this.elements.timingIndicator.classList.remove("hidden");
    }

    // Update UI
    this.updateTimingIndicator();
    this.updateMachineUI(machineId);

    // Play start sound
    if (this.audioManager) {
      this.audioManager.playSound("mining-start");
    }

    console.log(`⚡ Started timing game for ${machineId}`);
  }

  // Handle timing hit attempt
  handleTimingHit() {
    if (!this.activeMining.isActive) return;

    const cursor =
      this.elements.timingIndicator?.querySelector(".timing-cursor");
    if (!cursor) return;

    const cursorPosition = this.getCurrentCursorPosition();
    const hitResult = this.calculateHitResult(cursorPosition);

    // Apply hit result
    this.applyHitResult(hitResult);

    // Update UI
    this.updateTimingIndicator();
    this.showHitFeedback(hitResult);

    // Check if mining should continue
    if (this.shouldContinueMining()) {
      this.resetTimingCursor();
    } else {
      this.endTimingGame();
    }
  }

  // Get current cursor position (0-1)
  getCurrentCursorPosition() {
    const cursor =
      this.elements.timingIndicator?.querySelector(".timing-cursor");
    if (!cursor) return 0;

    const computedStyle = window.getComputedStyle(cursor);
    const left = parseFloat(computedStyle.left);
    const parentWidth = cursor.parentElement.offsetWidth;

    return left / parentWidth;
  }

  // Calculate hit result based on cursor position
  calculateHitResult(position) {
    const { start, end, optimal, perfectZone } = this.activeMining.targetZone;

    let result = {
      type: "miss",
      score: 0,
      energyGain: 0,
      comboBonus: 0,
      criticalHit: false,
    };

    // Check if in target zone
    if (position >= start && position <= end) {
      // Check if perfect hit
      if (
        position >= optimal - perfectZone &&
        position <= optimal + perfectZone
      ) {
        result.type = "perfect";
        result.score = 100;
        result.energyGain = 25;
        this.activeMining.perfectHits++;
      } else {
        result.type = "good";
        result.score = 50;
        result.energyGain = 15;
      }

      // Combo bonus
      this.activeMining.currentCombo++;
      result.comboBonus = Math.floor(this.activeMining.currentCombo / 5) * 5;

      // Critical hit chance
      if (Math.random() < this.mineUpgrades.criticalChance) {
        result.criticalHit = true;
        result.energyGain *= 2;
        result.score *= 2;
      }

      // Update max combo
      if (this.activeMining.currentCombo > this.activeMining.maxCombo) {
        this.activeMining.maxCombo = this.activeMining.currentCombo;
      }

      // Reset combo decay timer
      this.resetComboDecayTimer();
    } else {
      // Miss
      result.type = "miss";
      result.score = 0;
      result.energyGain = 5; // Still gain some energy

      // Reduce combo
      this.activeMining.currentCombo = Math.max(
        0,
        this.activeMining.currentCombo - 1
      );
    }

    this.activeMining.totalHits++;
    return result;
  }

  // Apply hit result to game state
  applyHitResult(hitResult) {
    const machine = this.machineManager.getMachine(
      this.activeMining.currentMachine
    );
    if (!machine) return;

    // Apply energy gain with mine upgrades
    const totalEnergyGain =
      hitResult.energyGain * (1 + this.mineUpgrades.outputBonus);
    machine.energyLevel = Math.min(machine.energyLevel + totalEnergyGain, 100);

    // Check for geode drop on each hit
    this.checkGeodeDropOnHit(hitResult);

    // Update combo multiplier
    this.updateComboMultiplier();

    // Generate currency if machine is full
    if (machine.energyLevel >= 100) {
      this.completeMiningCycle(machine);
    }
  }

  // Check for geode drop on each hit
  checkGeodeDropOnHit(hitResult) {
    const baseDropRate = 0.05; // 5% base chance per hit
    const upgradeBonus = this.mineUpgrades.partDropRate;
    const comboBonus = this.activeMining.currentCombo * 0.001; // 0.1% per combo
    const criticalBonus = hitResult.criticalHit ? 0.1 : 0; // 10% bonus for critical hits

    const totalDropRate =
      baseDropRate + upgradeBonus + comboBonus + criticalBonus;

    if (Math.random() < totalDropRate) {
      const machine = this.machineManager.getMachine(
        this.activeMining.currentMachine
      );
      if (machine) {
        machine.geodeCount++;
        this.showTemporaryMessage("Geode found! 💎", "success");
        this.createGeodeFoundEffect();
      }
    }
  }

  // Update combo multiplier
  updateComboMultiplier() {
    const baseMultiplier = 1.0;
    const comboBonus = this.activeMining.currentCombo * 0.05; // 5% per combo
    const upgradeBonus = this.mineUpgrades.comboBonus;

    this.activeMining.comboMultiplier =
      baseMultiplier + comboBonus + upgradeBonus;
  }

  // Reset combo decay timer
  resetComboDecayTimer() {
    if (this.activeMining.comboDecayTimer) {
      clearTimeout(this.activeMining.comboDecayTimer);
    }

    this.activeMining.comboDecayTimer = setTimeout(() => {
      this.activeMining.currentCombo = 0;
      this.updateTimingIndicator();
    }, 3000); // 3 second decay
  }

  // Check if mining should continue
  shouldContinueMining() {
    const machine = this.machineManager.getMachine(
      this.activeMining.currentMachine
    );
    return machine && machine.energyLevel < 100;
  }

  // End the timing game
  endTimingGame() {
    this.activeMining.isActive = false;
    this.activeMining.currentMachine = null;

    // Hide timing indicator
    if (this.elements.timingIndicator) {
      this.elements.timingIndicator.classList.add("hidden");
    }

    // Update UI
    this.updateUI();

    // Play end sound
    if (this.audioManager) {
      this.audioManager.playSound("mining-complete");
    }
  }

  // Reset timing cursor animation
  resetTimingCursor() {
    const cursor =
      this.elements.timingIndicator?.querySelector(".timing-cursor");
    if (cursor) {
      cursor.style.animation = "none";
      cursor.offsetHeight; // Trigger reflow
      cursor.style.animation = "timing-cursor-move 2s linear infinite";
    }
  }

  // Update timing indicator UI
  updateTimingIndicator() {
    const comboCount =
      this.elements.timingIndicator?.querySelector(".combo-count");
    const multiplierValue =
      this.elements.timingIndicator?.querySelector(".multiplier-value");

    if (comboCount) {
      comboCount.textContent = this.activeMining.currentCombo;
    }

    if (multiplierValue) {
      multiplierValue.textContent =
        this.activeMining.comboMultiplier.toFixed(1);
    }
  }

  // Show hit feedback
  showHitFeedback(hitResult) {
    const feedbackElement =
      this.elements.timingIndicator?.querySelector(".hit-feedback");
    if (!feedbackElement) return;

    feedbackElement.className = "hit-feedback";
    feedbackElement.classList.add(`hit-${hitResult.type}`);

    let feedbackText = "";
    switch (hitResult.type) {
      case "perfect":
        feedbackText = "PERFECT!";
        break;
      case "good":
        feedbackText = "GOOD!";
        break;
      case "miss":
        feedbackText = "MISS!";
        break;
    }

    if (hitResult.criticalHit) {
      feedbackText += " CRITICAL!";
    }

    feedbackElement.textContent = feedbackText;

    // Create combo particles
    if (hitResult.type !== "miss") {
      this.createComboParticles(hitResult);
    }
  }

  // Create combo particles
  createComboParticles(hitResult) {
    const timingIndicator = this.elements.timingIndicator;
    if (!timingIndicator) return;

    const rect = timingIndicator.getBoundingClientRect();
    const particle = document.createElement("div");
    particle.className = "combo-particle";
    particle.textContent = `+${hitResult.energyGain}`;

    particle.style.left = `${rect.left + rect.width / 2}px`;
    particle.style.top = `${rect.top}px`;

    document.body.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 1000);
  }

  // Create geode found effect
  createGeodeFoundEffect() {
    const machine = this.machineManager.getMachine(
      this.activeMining.currentMachine
    );
    if (!machine) return;

    const container = this.container.querySelector(
      `[data-machine="${machine.id}"]`
    );
    if (container) {
      const rect = container.getBoundingClientRect();
      this.createParticleBurst(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        8,
        "rgba(255, 215, 0, 0.8)"
      );
    }
  }

  // Complete mining cycle with enhancements
  completeMiningCycle(machine) {
    console.log(`💎 Enhanced mining cycle completed for ${machine.id}`);

    // Generate currency with combo multiplier
    const baseCurrency =
      this.mineConfig.baseOutput * (this.mechaBuilder.hasMecha ? 2 : 1);
    const upgradeBonus = this.mineUpgrades.outputBonus;
    const comboBonus = baseCurrency * (this.activeMining.comboMultiplier - 1);
    const multiplier =
      1 + this.mineUpgrades.outputMultiplier * Math.floor(this.currency / 100);

    const totalCurrency = Math.floor(
      (baseCurrency + upgradeBonus + comboBonus) * multiplier
    );
    this.currency += totalCurrency;

    // Reset energy
    machine.energyLevel = 0;
    machine.isActive = false;

    // Update UI
    this.updateCurrencyDisplay();
    this.updateUI();

    // Show completion message
    this.showTemporaryMessage(
      `+${totalCurrency} ${this.mineConfig.currency}!`,
      "success"
    );

    // Create completion effect
    this.createMiningCompleteEffect(machine.id);
  }

  // Show merchant modal
  showMerchantModal() {
    const merchantModal = this.container.querySelector(".merchant-modal");
    if (merchantModal) {
      merchantModal.classList.remove("hidden");
      this.updateMerchantDisplay();
    }
  }

  // Hide merchant modal
  hideMerchantModal() {
    const merchantModal = this.container.querySelector(".merchant-modal");
    if (merchantModal) {
      merchantModal.classList.add("hidden");
    }
  }

  // Update merchant display
  updateMerchantDisplay() {
    const priceAmount = this.container.querySelector(".price-amount");
    const purchaseHistory = this.container.querySelector(
      ".purchase-history small"
    );
    const buyButton = this.container.querySelector(".buy-geode-button");

    if (priceAmount) {
      priceAmount.textContent = this.merchant.geodeCost;
    }

    if (purchaseHistory) {
      purchaseHistory.textContent = `Purchased: ${this.merchant.purchaseCount} geodes`;
    }

    if (buyButton) {
      buyButton.disabled = this.currency < this.merchant.geodeCost;
    }
  }

  // Handle geode purchase
  handleGeodePurchase() {
    if (this.currency < this.merchant.geodeCost) {
      this.showTemporaryMessage("Not enough currency!", "warning");
      return;
    }

    // Deduct cost
    this.currency -= this.merchant.geodeCost;
    this.merchant.purchaseCount++;

    // Increase cost for next purchase
    this.merchant.geodeCost = Math.floor(
      this.merchant.geodeCost * this.merchant.costMultiplier
    );

    // Generate geode reward
    const reward = this.generateMerchantGeodeReward();
    this.applyGeodeReward(reward);

    // Update displays
    this.updateCurrencyDisplay();
    this.updateMerchantDisplay();

    // Show success message
    this.showTemporaryMessage(reward.message, "success");

    // Play purchase sound
    if (this.audioManager) {
      this.audioManager.playSound("geode-purchase");
    }

    // Create purchase effect
    this.createGeodePurchaseEffect();
  }

  // Generate merchant geode reward
  generateMerchantGeodeReward() {
    const rand = Math.random();

    if (rand < 0.3) {
      // 30% chance for mecha part
      const mechaType = this.mineConfig.mecha;
      const missingParts = this.partsInventory.getMissingParts();

      if (missingParts.length > 0) {
        const partName =
          missingParts[Math.floor(Math.random() * missingParts.length)];
        return {
          type: "part",
          partName: partName,
          message: `Mecha Part Found: ${partName.toUpperCase()}!`,
        };
      }
    } else if (rand < 0.6) {
      // 30% chance for upgrade
      return {
        type: "upgrade",
        upgradeType: this.getRandomUpgradeType(),
        message: "Mine Upgrade Found!",
      };
    }

    // 40% chance for bonus currency
    const bonus = Math.floor(Math.random() * 100) + 50;
    return {
      type: "currency",
      amount: bonus,
      message: `Bonus ${this.mineConfig.currency}: +${bonus}`,
    };
  }

  // Get random upgrade type
  getRandomUpgradeType() {
    const upgradeTypes = [
      "timeReduction",
      "outputBonus",
      "outputMultiplier",
      "partDropRate",
      "comboBonus",
      "criticalChance",
    ];
    return upgradeTypes[Math.floor(Math.random() * upgradeTypes.length)];
  }

  // Apply geode reward
  applyGeodeReward(reward) {
    switch (reward.type) {
      case "part":
        this.partsInventory.collectPart(reward.partName, "merchant");
        this.checkMechaBuildability();
        break;

      case "currency":
        this.currency += reward.amount;
        this.updateCurrencyDisplay();
        break;

      case "upgrade":
        this.applyMineUpgrade(reward.upgradeType, 0.05); // 5% upgrade
        break;
    }
  }

  // Apply mine upgrade
  applyMineUpgrade(upgradeType, value) {
    switch (upgradeType) {
      case "timeReduction":
        this.mineUpgrades.timeReduction = Math.min(
          this.mineUpgrades.timeReduction + value,
          0.95
        );
        break;
      case "outputBonus":
        this.mineUpgrades.outputBonus += Math.floor(value * 20); // Convert to integer
        break;
      case "outputMultiplier":
        this.mineUpgrades.outputMultiplier += value;
        break;
      case "partDropRate":
        this.mineUpgrades.partDropRate = Math.min(
          this.mineUpgrades.partDropRate + value,
          1.0
        );
        break;
      case "comboBonus":
        this.mineUpgrades.comboBonus += value;
        break;
      case "criticalChance":
        this.mineUpgrades.criticalChance = Math.min(
          this.mineUpgrades.criticalChance + value,
          0.5
        );
        break;
    }
  }

  // Show mine upgrade modal
  showMineUpgradeModal() {
    // Update the upgrade slot machine to work with mine-wide upgrades
    this.upgradeSlotMachine.showForMine();
  }

  // Create geode purchase effect
  createGeodePurchaseEffect() {
    const merchantButton = this.elements.merchantButton;
    if (merchantButton) {
      const rect = merchantButton.getBoundingClientRect();
      this.createParticleBurst(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        12,
        "rgba(255, 215, 0, 0.8)"
      );
    }
  }

  // Event handlers (enhanced)
  handleBackClick() {
    // Stop any active mining
    if (this.activeMining.isActive) {
      this.endTimingGame();
    }

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

  handleGeodeClick(machineId) {
    if (this.geodeSystem.toggleGeodeDrawer(machineId)) {
      console.log(`💎 Toggling geode drawer for ${machineId}`);
      this.updateMachineUI(machineId);
    }
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

  // UI update methods (enhanced)
  updateUI() {
    this.updateCurrencyDisplay();
    this.updateMachineUIs();
    this.updateMineStatsDisplay();
    this.partsInventory.updateDisplay();
    this.mechaBuilder.updateMechaDisplay();
  }

  updateMineStatsDisplay() {
    const comboRecord = this.container.querySelector(".combo-record");
    const efficiencyRate = this.container.querySelector(".efficiency-rate");

    if (comboRecord) {
      comboRecord.textContent = this.activeMining.maxCombo;
    }

    if (efficiencyRate) {
      const efficiency =
        this.activeMining.totalHits > 0
          ? (this.activeMining.perfectHits / this.activeMining.totalHits) * 100
          : 0;
      efficiencyRate.textContent = Math.floor(efficiency);
    }
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

    // Update active mining state
    container.classList.toggle(
      "active-mining",
      this.activeMining.currentMachine === machineId
    );

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
      machineButton.textContent = machine.isAutoMining
        ? "Auto-Mining"
        : "Active Mine";
      machineButton.classList.toggle(
        "ready-to-mine",
        machine.energyLevel < 100 && !machine.isAutoMining
      );
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

    // Update combo display
    const comboDisplay = container.querySelector(".machine-combo-display");
    if (comboDisplay) {
      comboDisplay.classList.toggle(
        "active",
        this.activeMining.currentCombo > 0 &&
          this.activeMining.currentMachine === machineId
      );
      comboDisplay.textContent = `${this.activeMining.currentCombo}x Combo!`;
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

  // Visual effects (enhanced)
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
      12,
      "rgba(255, 215, 0, 0.8)"
    );

    // Screen shake for completion
    this.triggerScreenShake(200);
  }

  // Override initializeAudio to add enhanced mining sounds
  initializeAudio() {
    super.initializeAudio();

    this.audioManager.sounds = {
      ...this.audioManager.sounds,
      "mining-start": null,
      "mining-hit-perfect": null,
      "mining-hit-good": null,
      "mining-hit-miss": null,
      "mining-complete": null,
      "combo-bonus": null,
      "critical-hit": null,
      "geode-found": null,
      "geode-purchase": null,
      "machine-purchase": null,
      "upgrade-applied": null,
    };
  }

  // Enhanced debug methods
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

  // Debug method to test combo system
  testComboSystem() {
    this.activeMining.currentCombo = 10;
    this.activeMining.maxCombo = 15;
    this.activeMining.perfectHits = 8;
    this.activeMining.totalHits = 10;
    this.updateMineStatsDisplay();
    this.showTemporaryMessage("Combo system test activated!", "success");
  }

  // Debug method to add mine upgrades
  addMineUpgrade(upgradeType, value) {
    this.applyMineUpgrade(upgradeType, value);
    this.updateUI();
    this.showTemporaryMessage(
      `Added ${upgradeType} upgrade: +${value}`,
      "success"
    );
  }

  // Debug method to force timing game
  debugStartTimingGame() {
    this.startTimingGame("machine1");
  }

  // Debug method to simulate perfect hits
  debugPerfectHit() {
    if (this.activeMining.isActive) {
      // Simulate perfect hit
      const perfectResult = {
        type: "perfect",
        score: 100,
        energyGain: 25,
        comboBonus: 5,
        criticalHit: Math.random() < 0.5,
      };
      this.applyHitResult(perfectResult);
      this.showHitFeedback(perfectResult);
      this.updateTimingIndicator();
    }
  }

  // Get enhanced mining statistics
  getMiningStats() {
    return {
      mineId: this.mineId,
      currency: this.currency,
      monsterCurrency: this.monsterCurrency,
      activeMining: { ...this.activeMining },
      mineUpgrades: { ...this.mineUpgrades },
      merchant: { ...this.merchant },
      machines: this.machineManager.getAllMachines().map((m) => ({
        id: m.id,
        energyLevel: m.energyLevel,
        geodeCount: m.geodeCount,
        isAutoMining: m.isAutoMining,
      })),
      parts: this.partsInventory.getPartStats(),
      mecha: this.mechaBuilder.getBuildStatus(),
    };
  }

  // Enhanced save/load functionality
  saveEnhancedState() {
    return {
      mineId: this.mineId,
      currency: this.currency,
      monsterCurrency: this.monsterCurrency,
      activeMining: {
        maxCombo: this.activeMining.maxCombo,
        perfectHits: this.activeMining.perfectHits,
        totalHits: this.activeMining.totalHits,
      },
      mineUpgrades: { ...this.mineUpgrades },
      merchant: { ...this.merchant },
      machines: this.machineManager.getAllMachines().map((m) => ({
        id: m.id,
        energyLevel: m.energyLevel,
        geodeCount: m.geodeCount,
        isAutoMining: m.isAutoMining,
      })),
      collectedParts: this.partsInventory.getAllParts(),
      hasMecha: this.mechaBuilder.hasMecha,
    };
  }

  loadEnhancedState(state) {
    if (!state) return;

    this.currency = state.currency || 0;
    this.monsterCurrency = state.monsterCurrency || 0;

    if (state.activeMining) {
      this.activeMining.maxCombo = state.activeMining.maxCombo || 0;
      this.activeMining.perfectHits = state.activeMining.perfectHits || 0;
      this.activeMining.totalHits = state.activeMining.totalHits || 0;
    }

    if (state.mineUpgrades) {
      this.mineUpgrades = { ...this.mineUpgrades, ...state.mineUpgrades };
    }

    if (state.merchant) {
      this.merchant = { ...this.merchant, ...state.merchant };
    }

    if (state.collectedParts) {
      state.collectedParts.forEach((part) => {
        this.partsInventory.addPart(part);
      });
    }

    if (state.hasMecha) {
      this.mechaBuilder.hasMecha = true;
    }

    // Update UI after loading
    this.updateUI();
  }

  // Override destroy to clean up enhanced mining elements
  destroy() {
    // Stop active mining
    if (this.activeMining.isActive) {
      this.endTimingGame();
    }

    // Clear combo decay timer
    if (this.activeMining.comboDecayTimer) {
      clearTimeout(this.activeMining.comboDecayTimer);
    }

    // Clean up modular components
    this.machineManager.destroy();
    this.upgradeSlotMachine.hide();
    this.geodeSystem.destroy();
    this.partsInventory.destroy();
    this.mechaBuilder.destroy();

    // Remove timing indicator
    const timingIndicator = this.container.querySelector(
      ".mining-timing-indicator"
    );
    if (timingIndicator) {
      timingIndicator.remove();
    }

    // Clear cached elements
    this.elements = {};

    // Reset enhanced mining state
    this.activeMining = {
      isActive: false,
      currentMachine: null,
      targetZone: null,
      timeWindow: 1000,
      currentCombo: 0,
      maxCombo: 0,
      comboMultiplier: 1,
      perfectHits: 0,
      totalHits: 0,
      lastHitTime: 0,
      comboDecayTimer: null,
    };

    this.mineUpgrades = {
      timeReduction: 0,
      outputBonus: 0,
      outputMultiplier: 0,
      partDropRate: 0,
      comboBonus: 0,
      criticalChance: 0,
    };

    this.selectedMachine = null;
    this.activeSlotMachine = null;

    // Call parent destroy method
    super.destroy();

    console.log("🗑️ Enhanced MiningScreen destroyed and cleaned up");
  }

  // Achievement system integration
  checkAchievements() {
    // Could integrate with achievement system
    if (this.activeMining.maxCombo >= 50) {
      this.showTemporaryMessage("Achievement: Combo Master!", "success");
    }

    if (
      this.activeMining.totalHits > 0 &&
      this.activeMining.perfectHits / this.activeMining.totalHits >= 0.9
    ) {
      this.showTemporaryMessage("Achievement: Precision Miner!", "success");
    }

    if (this.merchant.purchaseCount >= 10) {
      this.showTemporaryMessage("Achievement: Merchant's Friend!", "success");
    }
  }

  // Enhanced event handling for mobile
  setupMobileSupport() {
    // Touch events for timing game
    if (this.elements.timingIndicator) {
      this.elements.timingIndicator.addEventListener("touchstart", (e) => {
        e.preventDefault();
        if (this.activeMining.isActive) {
          this.handleTimingHit();
        }
      });
    }

    // Prevent zoom on double tap
    document.addEventListener("touchstart", (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    });
  }

  // Performance optimization
  optimizePerformance() {
    // Throttle UI updates
    if (this.updateThrottle) return;

    this.updateThrottle = true;
    requestAnimationFrame(() => {
      this.updateThrottle = false;
    });
  }

  // Accessibility improvements
  setupAccessibility() {
    // Add ARIA labels
    if (this.elements.timingIndicator) {
      this.elements.timingIndicator.setAttribute(
        "aria-label",
        "Mining timing game"
      );
      this.elements.timingIndicator.setAttribute("role", "application");
    }

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (this.activeMining.isActive && e.code === "Enter") {
        this.handleTimingHit();
      }
    });
  }

  // Initialize enhanced features
  initializeEnhancedFeatures() {
    this.setupMobileSupport();
    this.setupAccessibility();
    this.optimizePerformance();
  }

  // Call enhanced initialization in init method
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

    // Initialize enhanced features
    this.initializeMiningGame();
    this.initializeEnhancedFeatures();

    this.updateUI();
    this.isActive = true;

    console.log(`✅ Enhanced MiningScreen initialized for ${this.mineId}`);
  }
}

// Make available globally for debug system
window.MiningScreen = MiningScreen;

console.log("⛏️ Enhanced MiningScreen class loaded!");
