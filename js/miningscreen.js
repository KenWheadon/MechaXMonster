// MiningScreen - Handles mining operations for a specific mine
class MiningScreen extends Screen {
  constructor(container, mineId = "mine1") {
    super(container, "mining");

    // MiningScreen specific state
    this.mineId = mineId;
    this.mineConfig = GAME_CONFIG.mines[mineId];
    this.mechaConfig = GAME_CONFIG.mechas[this.mineConfig.mecha];

    // Mining state
    this.machines = [
      {
        id: "machine1",
        energyLevel: 0,
        maxEnergy: 100,
        isActive: false,
        geodeCount: 0,
        isAutoMining: false,
        upgrades: {
          timeReduction: 0,
          outputBonus: 0,
          outputMultiplier: 0,
          partDropRate: 0,
        },
        upgradeSpinCost: 10, // Starting cost for upgrades
        geodeDrawerOpen: false,
      },
    ];

    // Machine costs - updated per requirements
    this.machineCosts = [
      { shells: 0, monster_shells: 0 }, // Machine 1 (free)
      { shells: 25, monster_shells: 1 }, // Machine 2
      { shells: 50, monster_shells: 10 }, // Machine 3
      { shells: 500, monster_shells: 100 }, // Machine 4
    ];

    // Parts and currency state
    this.currency = 0;
    this.monsterCurrency = 0;
    this.collectedParts = [];
    this.nextPartIndex = 0; // For sequential part drops
    this.geodes = [];
    this.hasMecha = false;

    // UI state
    this.selectedMachine = null;
    this.isOpeningGeodes = false;
    this.activeSlotMachine = null;

    // DOM element cache
    this.elements = {};

    // Auto-mining intervals
    this.autoMiningIntervals = [];

    console.log(`⛏️ MiningScreen created for ${mineId}`);
  }

  // Override init to add MiningScreen specific initialization
  init() {
    this.render();
    this.cacheElements();
    this.setupEventListeners();
    this.setupMachineEventListeners();
    this.startAnimations();
    this.initializeAudio();
    this.startParticleSystem();
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
    this.machines.forEach((machine, index) => {
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
            <div class="mecha-display ${this.hasMecha ? "has-mecha" : ""}">
              <div class="mecha-container">
                <img src="images/mecha-${this.mineConfig.mecha}.png" alt="${
      this.mechaConfig.name
    }" class="mecha-image" style="opacity: ${this.hasMecha ? 1 : 0.2};" />
                <div class="mecha-glow"></div>
                <div class="mecha-status">
                  ${
                    this.hasMecha
                      ? '<span class="status-active">✅ Auto-Mining Active</span>'
                      : '<span class="status-inactive">🔧 Parts Needed</span>'
                  }
                </div>
              </div>
              <button class="build-mecha-button btn btn-primary hidden">
                <span>Build Mecha</span>
              </button>
            </div>

            <!-- Parts inventory -->
            <div class="parts-inventory">
              <h3>Mecha Parts</h3>
              <div class="parts-grid">
                ${this.renderPartsGrid()}
              </div>
              <div class="parts-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${
                    (this.collectedParts.length / 6) * 100
                  }%"></div>
                </div>
                <span class="progress-text">${
                  this.collectedParts.length
                }/6 Parts</span>
              </div>
            </div>

            <!-- Combat access (when mecha is built) -->
            <div class="combat-access ${this.hasMecha ? "" : "hidden"}">
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

        <!-- Slot Machine Modal -->
        <div class="slot-machine-modal hidden">
          <div class="modal-content">
            <div class="modal-header">
              <h2>Machine Upgrades</h2>
              <button class="close-slot-modal-button">×</button>
            </div>
            <div class="slot-machine-container">
              <div class="slot-machine">
                <div class="slot-reels">
                  <div class="slot-reel" data-reel="0">
                    <div class="reel-symbols"></div>
                  </div>
                  <div class="slot-reel" data-reel="1">
                    <div class="reel-symbols"></div>
                  </div>
                  <div class="slot-reel" data-reel="2">
                    <div class="reel-symbols"></div>
                  </div>
                </div>
                <div class="slot-result hidden">
                  <div class="result-text"></div>
                </div>
              </div>
              <div class="slot-controls">
                <div class="spin-cost">Cost: <span class="cost-amount">10</span> ${
                  this.mineConfig.currency
                }</div>
                <button class="spin-button btn btn-primary">Spin for Upgrade</button>
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
  }

  renderMachines() {
    return this.machines
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
              ${this.renderGeodeList(machine)}
            </div>
          </div>
        </div>
        
        <div class="machine-main">
          <div class="machine-visual">
            <img src="images/mine-${
              index + 1
            }.png" alt="Mining Machine" class="machine-image" />
            <div class="machine-glow ${machine.isActive ? "active" : ""}"></div>
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

  renderGeodeList(machine) {
    if (machine.geodeCount === 0) {
      return '<div class="no-geodes">No geodes collected</div>';
    }

    let geodeHtml = "";
    for (let i = 0; i < machine.geodeCount; i++) {
      geodeHtml += `
        <div class="geode-item" data-geode="${i}">
          <img src="images/geode-${this.mineConfig.mecha}.png" alt="Geode" />
          <div class="geode-click-overlay">Click!</div>
        </div>
      `;
    }
    return geodeHtml;
  }

  renderMachinePurchases() {
    let html = "";
    for (let i = 1; i < 4; i++) {
      // Machines 2, 3, 4
      if (this.machines.length <= i) {
        const cost = this.machineCosts[i];
        const canAfford =
          this.currency >= cost.shells &&
          this.monsterCurrency >= cost.monster_shells;

        html += `
          <button class="purchase-machine-button btn btn-secondary" 
                  data-machine-index="${i}" 
                  ${canAfford ? "" : "disabled"}>
            <img src="images/icon-plus.png" alt="Add Machine" />
            <span>Add Machine ${i + 1}</span>
            <div class="purchase-cost">
              ${cost.shells} ${this.mineConfig.currency}
              ${
                cost.monster_shells > 0
                  ? `+ ${cost.monster_shells} Monster`
                  : ""
              }
            </div>
          </button>
        `;
      }
    }
    return html;
  }

  renderPartsGrid() {
    const parts = ["1", "2", "3", "4", "5", "6"];
    return parts
      .map((partNum) => {
        const partName = `${this.mineConfig.mecha}-${partNum}`;
        const haspart = this.collectedParts.includes(partName);

        return `
        <div class="part-slot ${haspart ? "collected" : ""}">
          <img src="images/${partName}.png" alt="Part ${partNum}" class="part-image" />
          <div class="part-overlay ${haspart ? "hidden" : ""}">
            <span>?</span>
          </div>
          ${haspart ? '<div class="part-collected-indicator">✓</div>' : ""}
        </div>
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
        this.handleBuildMecha();
      });
    }

    // Slot machine modal
    const closeSlotModalBtn = this.container.querySelector(
      ".close-slot-modal-button"
    );
    if (closeSlotModalBtn) {
      closeSlotModalBtn.addEventListener("click", () => {
        this.closeSlotMachineModal();
      });
    }

    const spinButton = this.container.querySelector(".spin-button");
    if (spinButton) {
      spinButton.addEventListener("click", () => {
        this.handleSlotMachineSpin();
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
  }

  // Clean machine event listeners - single method only
  setupMachineEventListeners() {
    Object.entries(this.elements.machines).forEach(
      ([machineId, machineElements]) => {
        if (machineElements && machineElements.machineButton) {
          machineElements.machineButton.addEventListener("click", (e) => {
            this.handleMachineClick(machineId);
          });
        }

        if (machineElements && machineElements.geodeButton) {
          machineElements.geodeButton.addEventListener("click", (e) => {
            this.handleGeodeClick(machineId);
          });
        }

        if (machineElements && machineElements.upgradeButton) {
          machineElements.upgradeButton.addEventListener("click", (e) => {
            this.handleUpgradeClick(machineId);
          });
        }
      }
    );

    // Set up geode item click listeners
    const geodeItems = this.container.querySelectorAll(".geode-item");
    geodeItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        this.handleIndividualGeodeClick(e.currentTarget);
      });
    });
  }

  // Event handlers
  handleBackClick() {
    console.log("🔙 Back to map clicked");

    if (this.audioManager) {
      this.audioManager.playSound("button-click");
    }

    // Stop all auto-mining
    this.stopAllAutoMining();

    this.showTemporaryMessage("Returning to map...", "info");

    // In full game, this would transition back to map screen
    this.setManagedTimeout(() => {
      this.showTemporaryMessage("Map transition would happen here", "success");
    }, 1000);
  }

  handleMachineClick(machineId) {
    const machine = this.machines.find((m) => m.id === machineId);
    if (!machine || machine.isAutoMining) return;

    console.log(`⚡ Machine ${machineId} clicked`);

    // Add energy (each click = 2 seconds worth)
    const energyGain = 15; // 2% per click (representing 2 seconds)
    machine.energyLevel = Math.min(
      machine.energyLevel + energyGain,
      machine.maxEnergy
    );
    machine.isActive = true;

    // Update UI
    this.updateMachineUI(machine);

    // Check if bar is full
    if (machine.energyLevel >= machine.maxEnergy) {
      this.completeMiningCycle(machine);
    }

    // Play click sound
    if (this.audioManager) {
      this.audioManager.playSound("machine-click");
    }

    // Visual feedback
    this.createMachineClickEffect(machineId);
  }

  completeMiningCycle(machine) {
    console.log(`💎 Mining cycle completed for ${machine.id}`);

    // Generate currency (auto-collected)
    const baseCurrency = this.mineConfig.baseOutput * (this.hasMecha ? 2 : 1);
    const bonusCurrency = machine.upgrades.outputBonus;
    const multiplier =
      1 + machine.upgrades.outputMultiplier * Math.floor(this.currency / 100);
    const totalCurrency = Math.floor(
      (baseCurrency + bonusCurrency) * multiplier
    );

    this.currency += totalCurrency;

    // Check for geode drop with upgraded drop rate
    const baseDropRate = this.mineId === "mine1" ? 0.5 : 0.05;
    const upgradedDropRate = Math.min(
      baseDropRate + machine.upgrades.partDropRate,
      1.0
    );

    if (Math.random() < upgradedDropRate) {
      machine.geodeCount++;
      this.showTemporaryMessage("Geode found! 💎", "success");
    }

    // Reset energy bar
    machine.energyLevel = 0;
    machine.isActive = false;

    // Update UI
    this.updateMachineUI(machine);
    this.updateCurrencyDisplay();

    // Play completion sound
    if (this.audioManager) {
      this.audioManager.playSound("mining-complete");
    }

    // Create completion effect
    this.createMiningCompleteEffect(machine.id);
  }

  handleGeodeClick(machineId) {
    const machine = this.machines.find((m) => m.id === machineId);
    if (!machine || machine.geodeCount === 0) return;

    console.log(`💎 Toggling geode drawer for ${machineId}`);

    // Toggle drawer
    machine.geodeDrawerOpen = !machine.geodeDrawerOpen;
    this.updateMachineUI(machine);
  }

  handleIndividualGeodeClick(geodeElement) {
    console.log("🎯 Individual geode clicked");

    // Get the machine this geode belongs to
    const machineContainer = geodeElement.closest(".machine-container");
    const machineId = machineContainer.dataset.machine;
    const machine = this.machines.find((m) => m.id === machineId);

    if (!machine) return;

    // Generate reward
    const dropRate = this.mineId === "mine1" ? 0.25 : 0.05;
    if (Math.random() < dropRate) {
      // Sequential part drop
      const partName = `${this.mineConfig.mecha}-${
        (this.nextPartIndex % 6) + 1
      }`;

      // Only give part if we don't already have it
      if (!this.collectedParts.includes(partName)) {
        this.collectedParts.push(partName);
        this.showTemporaryMessage(
          `Mecha Part Found: ${partName.toUpperCase()}!`,
          "success"
        );
      } else {
        // Give bonus currency instead
        const bonus = Math.floor(Math.random() * 20) + 5;
        this.currency += bonus;
        this.showTemporaryMessage(
          `Bonus ${this.mineConfig.currency}: +${bonus}`,
          "success"
        );
      }

      this.nextPartIndex++;
    } else {
      // Bonus currency
      const bonus = Math.floor(Math.random() * 20) + 5;
      this.currency += bonus;
      this.showTemporaryMessage(
        `Bonus ${this.mineConfig.currency}: +${bonus}`,
        "success"
      );
    }

    // Remove this geode
    machine.geodeCount--;
    geodeElement.remove();

    // Update UI
    this.updateMachineUI(machine);
    this.updateCurrencyDisplay();
    this.updatePartsDisplay();
    this.checkMechaBuildability();

    // Play collection sound
    if (this.audioManager) {
      this.audioManager.playSound("geode-open");
    }

    // Close drawer if no more geodes
    if (machine.geodeCount === 0) {
      machine.geodeDrawerOpen = false;
      this.updateMachineUI(machine);
    }
  }

  handleUpgradeClick(machineId) {
    console.log(`🔧 Upgrade clicked for ${machineId}`);

    const machine = this.machines.find((m) => m.id === machineId);
    if (!machine) return;

    // Check if player can afford
    if (this.currency < machine.upgradeSpinCost) {
      this.showTemporaryMessage("Not enough currency for upgrade!", "warning");
      return;
    }

    this.activeSlotMachine = machineId;
    this.showSlotMachineModal(machine);
  }

  handleMachinePurchase(machineIndex) {
    const cost = this.machineCosts[machineIndex];

    if (
      this.currency >= cost.shells &&
      this.monsterCurrency >= cost.monster_shells
    ) {
      // Deduct cost
      this.currency -= cost.shells;
      this.monsterCurrency -= cost.monster_shells;

      // Add new machine
      const newMachine = {
        id: `machine${machineIndex + 1}`,
        energyLevel: 0,
        maxEnergy: 100,
        isActive: false,
        geodeCount: 0,
        isAutoMining: false,
        upgrades: {
          timeReduction: 0,
          outputBonus: 0,
          outputMultiplier: 0,
          partDropRate: 0,
        },
        upgradeSpinCost: 10,
        geodeDrawerOpen: false,
      };

      this.machines.push(newMachine);

      // Re-render and update
      this.render();
      this.cacheElements();
      this.setupEventListeners();
      this.setupMachineEventListeners();
      this.updateUI();

      this.showTemporaryMessage(
        `Machine ${machineIndex + 1} purchased!`,
        "success"
      );
    } else {
      this.showTemporaryMessage("Not enough currency!", "warning");
    }
  }

  showSlotMachineModal(machine) {
    const modal =
      this.elements.slotMachineModal ||
      this.container.querySelector(".slot-machine-modal");
    if (!modal) return;

    // Update cost display
    const costElement = modal.querySelector(".cost-amount");
    if (costElement) {
      costElement.textContent = machine.upgradeSpinCost;
    }

    // Initialize reels
    this.initializeSlotReels();

    modal.classList.remove("hidden");
  }

  closeSlotMachineModal() {
    const modal =
      this.elements.slotMachineModal ||
      this.container.querySelector(".slot-machine-modal");
    if (modal) {
      modal.classList.add("hidden");
    }
    this.activeSlotMachine = null;
  }

  initializeSlotReels() {
    const symbols = ["⚡", "💎", "🔧", "💰", "❌"];
    const reels = this.container.querySelectorAll(".slot-reel");

    reels.forEach((reel) => {
      const symbolsContainer = reel.querySelector(".reel-symbols");
      symbolsContainer.innerHTML = "";

      // Create multiple symbols for spinning effect
      for (let i = 0; i < 10; i++) {
        const symbol = document.createElement("div");
        symbol.className = "reel-symbol";
        symbol.textContent =
          symbols[Math.floor(Math.random() * symbols.length)];
        symbolsContainer.appendChild(symbol);
      }
    });
  }

  handleSlotMachineSpin() {
    const machine = this.machines.find((m) => m.id === this.activeSlotMachine);
    if (!machine || this.currency < machine.upgradeSpinCost) return;

    // Deduct cost
    this.currency -= machine.upgradeSpinCost;
    this.updateCurrencyDisplay();

    // Spin animation
    this.playSlotMachineAnimation().then((result) => {
      this.applySlotMachineResult(machine, result);
      // Increase cost for next spin
      machine.upgradeSpinCost = Math.floor(machine.upgradeSpinCost * 1.5);
    });
  }

  playSlotMachineAnimation() {
    return new Promise((resolve) => {
      const reels = this.container.querySelectorAll(".slot-reel");
      const symbols = ["⚡", "💎", "🔧", "💰", "❌"];
      const finalSymbols = [];

      // Determine final result
      const upgradeTypes = [
        "reduce_time",
        "increase_output",
        "output_multiplier",
        "part_drop_rate",
        "nothing",
      ];
      const selectedUpgrade =
        upgradeTypes[Math.floor(Math.random() * upgradeTypes.length)];

      // Set symbols based on upgrade type
      const upgradeSymbols = {
        reduce_time: "⚡",
        increase_output: "💰",
        output_multiplier: "🔧",
        part_drop_rate: "💎",
        nothing: "❌",
      };

      // Generate final symbols (match = successful upgrade)
      const shouldMatch = Math.random() < 0.3; // 30% chance of matching
      if (shouldMatch) {
        const symbol = upgradeSymbols[selectedUpgrade];
        finalSymbols.push(symbol, symbol, symbol);
      } else {
        // Random non-matching symbols
        finalSymbols.push(
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)]
        );
      }

      // Animate each reel
      reels.forEach((reel, index) => {
        const symbolsContainer = reel.querySelector(".reel-symbols");

        // Spin animation
        symbolsContainer.style.animation = `slotSpin ${
          1 + index * 0.5
        }s ease-out forwards`;

        setTimeout(() => {
          // Set final symbol
          const finalSymbol = symbolsContainer.querySelector(".reel-symbol");
          if (finalSymbol) {
            finalSymbol.textContent = finalSymbols[index];
          }
        }, (1 + index * 0.5) * 1000);
      });

      // Resolve with result after all reels stop
      setTimeout(() => {
        resolve({
          symbols: finalSymbols,
          matched: shouldMatch,
          upgradeType: shouldMatch ? selectedUpgrade : "nothing",
        });
      }, 2500);
    });
  }

  applySlotMachineResult(machine, result) {
    const resultDiv = this.container.querySelector(".slot-result");
    const resultText = this.container.querySelector(".result-text");

    if (result.matched && result.upgradeType !== "nothing") {
      // Apply upgrade
      const upgrade = GAME_CONFIG.upgrades[result.upgradeType];

      switch (result.upgradeType) {
        case "reduce_time":
          machine.upgrades.timeReduction += Math.abs(upgrade.effect);
          break;
        case "increase_output":
          machine.upgrades.outputBonus += upgrade.effect;
          break;
        case "output_multiplier":
          machine.upgrades.outputMultiplier += upgrade.effect;
          break;
        case "part_drop_rate":
          machine.upgrades.partDropRate += upgrade.effect;
          break;
      }

      resultText.textContent = `SUCCESS! ${upgrade.name}: ${upgrade.description}`;
      resultDiv.className = "slot-result success";
      this.showTemporaryMessage(`Upgrade applied: ${upgrade.name}!`, "success");
    } else {
      resultText.textContent = "No upgrade - Better luck next time!";
      resultDiv.className = "slot-result failure";
      this.showTemporaryMessage("No upgrade this time!", "warning");
    }

    resultDiv.classList.remove("hidden");

    // Hide result after 3 seconds
    setTimeout(() => {
      resultDiv.classList.add("hidden");
      this.closeSlotMachineModal();
    }, 3000);
  }

  checkMechaBuildability() {
    const requiredParts = ["1", "2", "3", "4", "5", "6"].map(
      (num) => `${this.mineConfig.mecha}-${num}`
    );
    const canBuild = requiredParts.every((part) =>
      this.collectedParts.includes(part)
    );

    if (canBuild && !this.hasMecha) {
      this.elements.buildMechaButton?.classList.remove("hidden");
      this.showTemporaryMessage(
        "All parts collected! Ready to build mecha!",
        "success"
      );
    }
  }

  handleBuildMecha() {
    console.log("🤖 Building mecha");

    // Remove parts from inventory
    const requiredParts = ["1", "2", "3", "4", "5", "6"].map(
      (num) => `${this.mineConfig.mecha}-${num}`
    );
    this.collectedParts = this.collectedParts.filter(
      (part) => !requiredParts.includes(part)
    );

    // Set mecha as built
    this.hasMecha = true;

    // Enable auto-mining for all machines
    this.machines.forEach((machine) => {
      machine.isAutoMining = true;
      this.startAutoMining(machine);
    });

    // Update UI
    this.updateUI();

    // Play build sound and show success
    if (this.audioManager) {
      this.audioManager.playSound("mecha-built");
    }

    this.showSuccessMessage(
      "🤖 Mecha built successfully!\nAuto-mining enabled for all machines!"
    );

    // Create build effect
    this.createMechaBuildEffect();
  }

  startAutoMining(machine) {
    const baseInterval = 1000; // 1 second
    const timeReduction = machine.upgrades.timeReduction;
    const actualInterval = Math.max(baseInterval * (1 - timeReduction), 100);

    const interval = this.setManagedInterval(() => {
      if (machine.energyLevel < machine.maxEnergy) {
        machine.energyLevel += 1; // 1% per second

        if (machine.energyLevel >= machine.maxEnergy) {
          this.completeMiningCycle(machine);
        }

        this.updateMachineUI(machine);
      }
    }, actualInterval);

    this.autoMiningIntervals.push(interval);
  }

  stopAllAutoMining() {
    this.autoMiningIntervals.forEach((interval) => clearInterval(interval));
    this.autoMiningIntervals = [];
  }

  // UI update methods
  updateUI() {
    this.updateCurrencyDisplay();
    this.updateMachineUIs();
    this.updatePartsDisplay();
    this.updateMechaDisplay();
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
    this.machines.forEach((machine) => {
      this.updateMachineUI(machine);
    });
  }

  updateMachineUI(machine) {
    const elements = this.elements.machines[machine.id];
    if (!elements) return;

    // Update energy bar
    if (elements.energyFill) {
      elements.energyFill.style.width = `${machine.energyLevel}%`;
    }
    if (elements.energyText) {
      elements.energyText.textContent = `${machine.energyLevel}%`;
    }

    // Update machine glow
    const machineGlow = elements.container.querySelector(".machine-glow");
    if (machineGlow) {
      if (machine.isActive) {
        machineGlow.classList.add("active");
      } else {
        machineGlow.classList.remove("active");
      }
    }

    // Update auto-mining indicator
    if (elements.autoMiningIndicator) {
      if (machine.isAutoMining) {
        elements.autoMiningIndicator.classList.add("active");
        if (elements.machineButton) {
          elements.machineButton.disabled = true;
          elements.machineButton.textContent = "Auto-Mining";
        }
      } else {
        elements.autoMiningIndicator.classList.remove("active");
        if (elements.machineButton) {
          elements.machineButton.disabled = false;
          elements.machineButton.textContent = "Mine";
        }
      }
    }

    // Update geode counter
    const geodeCounter = elements.container.querySelector(".geode-counter");
    const geodeCount = elements.container.querySelector(".geode-count");
    const geodeButton = elements.container.querySelector(".geode-button");

    if (geodeCount) {
      geodeCount.textContent = machine.geodeCount;
    }

    if (geodeCounter) {
      if (machine.geodeCount > 0) {
        geodeCounter.classList.add("has-geodes");
        if (geodeButton) geodeButton.disabled = false;
      } else {
        geodeCounter.classList.remove("has-geodes");
        if (geodeButton) geodeButton.disabled = true;
      }
    }

    // Update geode drawer
    const geodeDrawer = elements.container.querySelector(".geode-drawer");
    if (geodeDrawer) {
      if (machine.geodeDrawerOpen) {
        geodeDrawer.classList.add("open");
        // Update geode list
        const geodeList = geodeDrawer.querySelector(".geode-list");
        if (geodeList) {
          geodeList.innerHTML = this.renderGeodeList(machine);
          // Re-add event listeners to new geode items
          const geodeItems = geodeList.querySelectorAll(".geode-item");
          geodeItems.forEach((item) => {
            item.addEventListener("click", (e) => {
              this.handleIndividualGeodeClick(e.currentTarget);
            });
          });
        }
      } else {
        geodeDrawer.classList.remove("open");
      }
    }
  }

  updatePartsDisplay() {
    if (this.elements.partsGrid) {
      this.elements.partsGrid.innerHTML = this.renderPartsGrid();
    }

    // Update progress bar
    const progressFill = this.container.querySelector(
      ".parts-progress .progress-fill"
    );
    const progressText = this.container.querySelector(
      ".parts-progress .progress-text"
    );

    if (progressFill) {
      progressFill.style.width = `${(this.collectedParts.length / 6) * 100}%`;
    }

    if (progressText) {
      progressText.textContent = `${this.collectedParts.length}/6 Parts`;
    }
  }

  updateMechaDisplay() {
    const mechaDisplay = this.elements.mechaDisplay;
    if (!mechaDisplay) return;

    const mechaImage = mechaDisplay.querySelector(".mecha-image");
    if (mechaImage) {
      mechaImage.style.opacity = this.hasMecha ? "1" : "0.2";
    }

    if (this.hasMecha) {
      mechaDisplay.classList.add("has-mecha");
      mechaDisplay.querySelector(".mecha-status").innerHTML =
        '<span class="status-active">✅ Auto-Mining Active</span>';
    } else {
      mechaDisplay.classList.remove("has-mecha");
      mechaDisplay.querySelector(".mecha-status").innerHTML =
        '<span class="status-inactive">🔧 Parts Needed</span>';
    }
  }

  // Visual effects
  createMachineClickEffect(machineId) {
    const machine = this.elements.machines[machineId];
    if (!machine) return;

    const rect = machine.machineButton.getBoundingClientRect();
    this.createParticleBurst(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      4,
      "rgba(0, 255, 136, 0.8)"
    );
  }

  createMiningCompleteEffect(machineId) {
    const machine = this.elements.machines[machineId];
    if (!machine) return;

    const rect = machine.container.getBoundingClientRect();
    this.createParticleBurst(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      8,
      "rgba(255, 215, 0, 0.8)"
    );
  }

  createMechaBuildEffect() {
    const mechaDisplay = this.elements.mechaDisplay;
    if (!mechaDisplay) return;

    const rect = mechaDisplay.getBoundingClientRect();
    this.createParticleBurst(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      20,
      "rgba(0, 255, 136, 0.8)"
    );

    this.triggerScreenShake(500);
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
    if (!this.collectedParts.includes(partName)) {
      this.collectedParts.push(partName);
      this.updatePartsDisplay();
      this.checkMechaBuildability();
    }
  }

  addGeode(machineId = "machine1") {
    const machine = this.machines.find((m) => m.id === machineId);
    if (machine) {
      machine.geodeCount++;
      this.updateMachineUI(machine);
    }
  }

  // Override destroy to clean up MiningScreen specific elements
  destroy() {
    // Stop auto-mining
    this.stopAllAutoMining();

    // Clear cached elements
    this.elements = {};

    // Reset MiningScreen specific state
    this.selectedMachine = null;
    this.isOpeningGeodes = false;
    this.activeSlotMachine = null;
    this.geodes = [];

    // Call parent destroy method
    super.destroy();

    console.log("🗑️ MiningScreen destroyed and cleaned up");
  }
}

// Make available globally for debug system
window.MiningScreen = MiningScreen;

console.log("⛏️ MiningScreen class loaded!");
