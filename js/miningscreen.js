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
      },
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

    // DOM element cache
    this.elements = {};

    // Auto-mining intervals
    this.autoMiningIntervals = [];

    // Debug flag
    this.debugMode = true;

    console.log(`⛏️ MiningScreen created for ${mineId}`);
  }

  // Debug logging helper
  debugLog(message, data = null) {
    if (this.debugMode) {
      console.log(`[DEBUG] ${message}`, data || "");
    }
  }

  // Override init to add MiningScreen specific initialization
  init() {
    this.debugLog("Starting MiningScreen initialization");

    this.render();
    this.debugLog("Render completed");

    this.cacheElements();
    this.debugLog("Elements cached");

    this.setupEventListeners();
    this.debugLog("Basic event listeners setup");

    this.setupMachineEventListeners();
    this.debugLog("Machine event listeners setup");

    this.startAnimations();
    this.debugLog("Animations started");

    this.initializeAudio();
    this.debugLog("Audio initialized");

    this.startParticleSystem();
    this.debugLog("Particle system started");

    this.updateUI();
    this.debugLog("UI updated");

    this.isActive = true;

    console.log(`✅ MiningScreen initialized for ${this.mineId}`);
  }

  // Cache frequently accessed DOM elements
  cacheElements() {
    this.debugLog("Starting element caching");

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
      geodeModal: this.container.querySelector(".geode-modal"),
      geodeResults: this.container.querySelector(".geode-results"),
      machines: {},
    };

    this.debugLog("Basic elements cached", {
      backButton: !!this.elements.backButton,
      currencyDisplay: !!this.elements.currencyDisplay,
      machineContainers: this.elements.machineContainers.length,
    });

    // Cache machine-specific elements with detailed debugging
    this.machines.forEach((machine, index) => {
      this.debugLog(`Caching elements for machine ${machine.id}`);

      const container = this.container.querySelector(
        `[data-machine="${machine.id}"]`
      );
      this.debugLog(`Machine container found: ${!!container}`, container);

      if (container) {
        const machineElements = {
          container,
          energyBar: container.querySelector(".energy-bar"),
          energyFill: container.querySelector(".energy-fill"),
          energyText: container.querySelector(".energy-text"),
          machineButton: container.querySelector(".machine-button"),
          geodeCounter: container.querySelector(".geode-counter"),
          geodeButton: container.querySelector(".geode-button"),
          autoMiningIndicator: container.querySelector(
            ".auto-mining-indicator"
          ),
        };

        this.debugLog(`Machine ${machine.id} elements:`, {
          energyBar: !!machineElements.energyBar,
          energyFill: !!machineElements.energyFill,
          energyText: !!machineElements.energyText,
          machineButton: !!machineElements.machineButton,
          geodeCounter: !!machineElements.geodeCounter,
          geodeButton: !!machineElements.geodeButton,
          autoMiningIndicator: !!machineElements.autoMiningIndicator,
        });

        this.elements.machines[machine.id] = machineElements;
      } else {
        this.debugLog(`ERROR: Container not found for machine ${machine.id}`);
      }
    });

    this.debugLog("Element caching completed", this.elements);
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
              <button class="purchase-machine-button btn btn-secondary" disabled>
                <img src="images/icon-plus.png" alt="Add Machine" />
                <span>Add Machine</span>
                <div class="purchase-cost">50 Monster Currency</div>
              </button>
            </div>
          </div>

          <!-- Side panel -->
          <div class="side-panel">
            <!-- Mecha display -->
            <div class="mecha-display ${this.hasMecha ? "has-mecha" : ""}">
              <div class="mecha-container">
                <img src="images/mecha-${this.mineConfig.mecha}.png" alt="${
      this.mechaConfig.name
    }" class="mecha-image" />
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
                <img src="images/slime-${this.mineConfig.monster.replace(
                  "_slime",
                  ""
                )}-1.png" alt="Fight Monster" />
                <span>Fight ${
                  GAME_CONFIG.monsters[this.mineConfig.monster].name
                }</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Geode opening modal -->
        <div class="geode-modal hidden">
          <div class="modal-content">
            <div class="modal-header">
              <h2>Opening Geodes</h2>
              <button class="close-modal-button">×</button>
            </div>
            <div class="geode-animation">
              <div class="geode-container">
                <img src="images/geode-${
                  this.mineConfig.mecha
                }.png" alt="Geode" class="geode-image" />
                <div class="geode-crack-effect"></div>
              </div>
            </div>
            <div class="geode-results"></div>
            <button class="collect-results-button btn btn-primary hidden">
              Collect All
            </button>
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
            } data-machine-id="${machine.id}">
              ${machine.isAutoMining ? "Auto-Mining" : "Mine"}
            </button>
          </div>
        </div>
      </div>
    `
      )
      .join("");
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
      this.debugLog("Back button event listener added");
    } else {
      this.debugLog("ERROR: Back button not found");
    }

    // Build mecha button
    if (this.elements.buildMechaButton) {
      this.elements.buildMechaButton.addEventListener("click", () => {
        this.handleBuildMecha();
      });
      this.debugLog("Build mecha button event listener added");
    }

    // Geode modal
    const closeModalBtn = this.container.querySelector(".close-modal-button");
    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", () => {
        this.closeGeodeModal();
      });
      this.debugLog("Close modal button event listener added");
    }

    const collectResultsBtn = this.container.querySelector(
      ".collect-results-button"
    );
    if (collectResultsBtn) {
      collectResultsBtn.addEventListener("click", () => {
        this.collectGeodeResults();
      });
      this.debugLog("Collect results button event listener added");
    }
  }

  // Enhanced machine event listeners with better debugging
  setupMachineEventListeners() {
    this.debugLog("Setting up machine event listeners");

    // Method 1: Try using cached elements
    Object.entries(this.elements.machines).forEach(
      ([machineId, machineElements]) => {
        this.debugLog(`Setting up events for machine ${machineId}`);

        if (machineElements && machineElements.machineButton) {
          this.debugLog(
            `Adding click listener to machine button for ${machineId}`
          );

          machineElements.machineButton.addEventListener("click", (e) => {
            this.debugLog(`Machine button clicked for ${machineId}`, e.target);
            this.handleMachineClick(machineId);
          });
        } else {
          this.debugLog(`ERROR: Machine button not found for ${machineId}`);
        }

        if (machineElements && machineElements.geodeButton) {
          this.debugLog(`Adding geode button listener for ${machineId}`);

          machineElements.geodeButton.addEventListener("click", (e) => {
            this.debugLog(`Geode button clicked for ${machineId}`, e.target);
            this.handleGeodeClick(machineId);
          });
        } else {
          this.debugLog(
            `Geode button not found for ${machineId} (this may be normal)`
          );
        }
      }
    );

    // Method 2: Fallback using document query selectors
    const machineButtons = this.container.querySelectorAll(".machine-button");
    this.debugLog(
      `Found ${machineButtons.length} machine buttons via fallback method`
    );

    machineButtons.forEach((button, index) => {
      const machineId = button.getAttribute("data-machine-id");
      this.debugLog(
        `Fallback: Adding listener to button ${index}, machine ID: ${machineId}`
      );

      button.addEventListener("click", (e) => {
        this.debugLog(`Fallback click handler triggered`, {
          button,
          machineId,
          target: e.target,
        });

        if (machineId) {
          this.handleMachineClick(machineId);
        } else {
          // Try to find machine ID from container
          const container = e.target.closest(".machine-container");
          if (container) {
            const containerMachineId = container.getAttribute("data-machine");
            this.debugLog(
              `Found machine ID from container: ${containerMachineId}`
            );
            if (containerMachineId) {
              this.handleMachineClick(containerMachineId);
            }
          }
        }
      });
    });

    // Method 3: Event delegation as ultimate fallback
    const machinesContainer = this.container.querySelector(
      ".machines-container"
    );
    if (machinesContainer) {
      this.debugLog("Setting up event delegation on machines container");

      machinesContainer.addEventListener("click", (e) => {
        if (
          e.target.classList.contains("machine-button") ||
          e.target.closest(".machine-button")
        ) {
          this.debugLog(
            "Event delegation caught machine button click",
            e.target
          );

          const button = e.target.classList.contains("machine-button")
            ? e.target
            : e.target.closest(".machine-button");
          const machineId = button.getAttribute("data-machine-id");
          const container = button.closest(".machine-container");
          const containerMachineId = container
            ? container.getAttribute("data-machine")
            : null;

          const finalMachineId = machineId || containerMachineId;
          this.debugLog(`Event delegation found machine ID: ${finalMachineId}`);

          if (finalMachineId) {
            this.handleMachineClick(finalMachineId);
          }
        }
      });
    }
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
    this.debugLog(`handleMachineClick called with machineId: ${machineId}`);

    const machine = this.machines.find((m) => m.id === machineId);
    if (!machine) {
      this.debugLog(`ERROR: Machine not found with ID ${machineId}`);
      return;
    }

    if (machine.isAutoMining) {
      this.debugLog(`Machine ${machineId} is auto-mining, ignoring click`);
      return;
    }

    console.log(`⚡ Machine ${machineId} clicked - processing...`);

    // Add energy (each click = 2 seconds worth)
    const energyGain = 2; // 2% per click (representing 2 seconds)
    machine.energyLevel = Math.min(
      machine.energyLevel + energyGain,
      machine.maxEnergy
    );
    machine.isActive = true;

    this.debugLog(
      `Machine ${machineId} energy increased by ${energyGain}%, now at ${machine.energyLevel}%`
    );

    // Update UI
    this.updateMachineUI(machine);

    // Check if bar is full
    if (machine.energyLevel >= machine.maxEnergy) {
      this.debugLog(`Machine ${machineId} energy full, completing cycle`);
      this.completeMiningCycle(machine);
    }

    // Play click sound
    if (this.audioManager) {
      this.audioManager.playSound("machine-click");
    }

    // Visual feedback
    this.createMachineClickEffect(machineId);

    // Show temporary feedback
    this.showTemporaryMessage(
      `Machine ${machineId.replace("machine", "")} energy: ${
        machine.energyLevel
      }%`,
      "info"
    );
  }

  completeMiningCycle(machine) {
    console.log(`💎 Mining cycle completed for ${machine.id}`);

    // Generate currency (auto-collected)
    const currencyGain = this.mineConfig.baseOutput * (this.hasMecha ? 2 : 1);
    this.currency += currencyGain;

    // Check for geode drop (25% for first mine, configurable)
    const dropRate = this.mineId === "mine1" ? 0.25 : 0.05;
    if (Math.random() < dropRate) {
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

    console.log(`💎 Opening geodes for ${machineId}`);

    // Collect geodes for opening
    this.geodes = Array(machine.geodeCount)
      .fill()
      .map(() => ({
        machineId,
        opened: false,
        result: null,
      }));

    machine.geodeCount = 0;
    this.updateMachineUI(machine);

    // Show geode modal
    this.showGeodeModal();
  }

  showGeodeModal() {
    const modal = this.elements.geodeModal;
    if (!modal) return;

    modal.classList.remove("hidden");
    this.isOpeningGeodes = true;

    // Start geode opening animation
    this.setManagedTimeout(() => {
      this.openGeodes();
    }, 1000);
  }

  closeGeodeModal() {
    const modal = this.elements.geodeModal;
    if (!modal) return;

    modal.classList.add("hidden");
    this.isOpeningGeodes = false;
    this.geodes = [];
  }

  openGeodes() {
    if (!this.elements.geodeResults) return;

    this.elements.geodeResults.innerHTML = "";
    const results = [];

    this.geodes.forEach((geode, index) => {
      // Determine result (25% mecha part, 75% bonus currency)
      const dropRate = this.mineId === "mine1" ? 0.25 : 0.05;
      if (Math.random() < dropRate) {
        // Sequential part drop
        const partName = `${this.mineConfig.mecha}-${
          (this.nextPartIndex % 6) + 1
        }`;

        // Only give part if we don't already have it
        if (!this.collectedParts.includes(partName)) {
          results.push({
            type: "part",
            item: partName,
            display: `Mecha Part: ${partName.toUpperCase()}`,
          });
          this.collectedParts.push(partName);
        } else {
          // Give bonus currency instead
          const bonus = Math.floor(Math.random() * 20) + 5;
          results.push({
            type: "currency",
            item: bonus,
            display: `Bonus ${this.mineConfig.currency}: +${bonus}`,
          });
          this.currency += bonus;
        }

        this.nextPartIndex++;
      } else {
        // Bonus currency
        const bonus = Math.floor(Math.random() * 20) + 5;
        results.push({
          type: "currency",
          item: bonus,
          display: `Bonus ${this.mineConfig.currency}: +${bonus}`,
        });
        this.currency += bonus;
      }
    });

    // Display results
    results.forEach((result, index) => {
      const resultElement = document.createElement("div");
      resultElement.className = `geode-result ${result.type}`;
      resultElement.innerHTML = `
        <div class="result-icon">
          ${
            result.type === "part"
              ? `<img src="images/${result.item}.png" alt="${result.item}" />`
              : `<img src="images/currency-${this.mineConfig.currency}.png" alt="currency" />`
          }
        </div>
        <div class="result-text">${result.display}</div>
      `;

      this.elements.geodeResults.appendChild(resultElement);
    });

    // Show collect button
    const collectBtn = this.container.querySelector(".collect-results-button");
    if (collectBtn) {
      collectBtn.classList.remove("hidden");
    }

    // Play geode opening sound
    if (this.audioManager) {
      this.audioManager.playSound("geode-open");
    }
  }

  collectGeodeResults() {
    this.closeGeodeModal();
    this.updateUI();

    if (this.audioManager) {
      this.audioManager.playSound("collect-items");
    }

    // Check if we can build mecha
    this.checkMechaBuildability();
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
    const interval = this.setManagedInterval(() => {
      if (machine.energyLevel < machine.maxEnergy) {
        machine.energyLevel += 1; // 1% per second

        if (machine.energyLevel >= machine.maxEnergy) {
          this.completeMiningCycle(machine);
        }

        this.updateMachineUI(machine);
      }
    }, 1000); // Every second

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
    };
  }

  // Debug methods
  addCurrency(amount) {
    this.currency += amount;
    this.updateCurrencyDisplay();
    this.showTemporaryMessage(
      `Added ${amount} ${this.mineConfig.currency}`,
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

  // Debug method to test machine clicks
  testMachineClick() {
    this.debugLog("Testing machine click...");
    this.handleMachineClick("machine1");
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
    this.geodes = [];

    // Call parent destroy method
    super.destroy();

    console.log("🗑️ MiningScreen destroyed and cleaned up");
  }
}

// Make available globally for debug system
window.MiningScreen = MiningScreen;

console.log("⛏️ MiningScreen class loaded!");
