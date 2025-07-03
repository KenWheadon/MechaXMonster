// Mine Screen Module - Mining Operations and Mecha Building
class MineScreen {
  constructor(game) {
    this.game = game;
    this.miningTimers = {};
    this.particleSystem = null;
    this.geodeState = {
      active: false,
      currentIndex: 0,
      totalGeodes: 0,
      totalEarned: 0,
      rewards: [],
    };
  }

  init() {
    // Initialize mining screen
    this.setupEventListeners();
    this.initializeParticleSystem();
  }

  setupEventListeners() {
    // Build mecha button
    const buildBtn = document.getElementById("build-mecha-btn");
    if (buildBtn) {
      buildBtn.addEventListener("click", () => this.buildMecha());
    }
  }

  initializeParticleSystem() {
    // Simple particle system for collection effects
    this.particleSystem = {
      particles: [],
      canvas: null,
      ctx: null,
      running: false,
    };
  }

  setupMiningScreen() {
    const config = this.game.getCurrentMineConfig();

    // Update screen title
    document.getElementById(
      "mine-title"
    ).textContent = `${config.icon} ${config.name} Operations`;

    // Update currency displays
    this.updateCurrencyDisplays();

    // Update mecha building interface
    this.updateMechaBuilding();

    // Update mining machines display
    this.updateMiningMachinesDisplay();

    // Update mining display
    this.updateMiningDisplay();

    this.game.logMessage(
      `🤖 AstroGuide: Welcome to ${config.name}! Click machines to activate them.`
    );
  }

  updateMiningMachinesDisplay() {
    const mineData = this.game.getCurrentMineData();
    const config = this.game.getCurrentMineConfig();

    // Update main machine
    this.updateMachineDisplay(1, mineData.machines >= 1);

    // Update additional machines
    for (let i = 2; i <= 4; i++) {
      const owned = mineData.machines >= i;
      this.updateMachineDisplay(i, owned);

      if (!owned) {
        this.updateMachineCost(i);
      }
    }
  }

  updateMachineDisplay(machineId, owned) {
    const machineElement = document.getElementById(
      machineId === 1 ? "main-mining-machine" : `mining-machine-${machineId}`
    );

    if (!machineElement) return;

    const mineData = this.game.getCurrentMineData();
    const isActive =
      mineData.activeMachines && mineData.activeMachines[machineId];

    if (owned) {
      machineElement.classList.remove("locked");

      // Show appropriate buttons
      const activateBtn = document.getElementById(`activate-btn-${machineId}`);
      const upgradeBtn = document.getElementById(`upgrade-btn-${machineId}`);

      if (activateBtn) {
        activateBtn.style.display = isActive ? "none" : "inline-block";
      }
      if (upgradeBtn) {
        upgradeBtn.style.display = isActive ? "inline-block" : "none";
      }

      // Update machine status
      const statusElement = machineElement.querySelector(".machine-status");
      if (statusElement) {
        if (isActive) {
          statusElement.classList.remove("inactive");
          this.startMiningForMachine(machineId);
        } else {
          statusElement.classList.add("inactive");
        }
      }
    } else {
      machineElement.classList.add("locked");
    }
  }

  updateMachineCost(machineId) {
    const config = this.game.getCurrentMineConfig();
    const costs = CONFIG_UTILS.calculateMachineUpgradeCost(
      this.game.gameState.currentMine,
      machineId
    );

    const buyBtn = document.querySelector(
      `#mining-machine-${machineId} .machine-buy-btn`
    );
    if (buyBtn) {
      const monsterCurrencyKey = CONFIG_UTILS.getMonsterCurrencyKey(
        config.currency
      );
      const monsterIcon = this.game.getCurrencyIcon(monsterCurrencyKey);

      if (costs.monster > 0) {
        buyBtn.textContent = `Buy: ${
          costs.currency
        } ${this.game.getCurrencyIcon(config.currency)} + ${
          costs.monster
        } ${monsterIcon}`;
      } else {
        buyBtn.textContent = `Buy: ${
          costs.currency
        } ${this.game.getCurrencyIcon(config.currency)}`;
      }
    }
  }

  activateMiningMachine(machineId) {
    const mineData = this.game.getCurrentMineData();

    // Initialize activeMachines if needed
    if (!mineData.activeMachines) {
      mineData.activeMachines = {};
    }

    // Check if machine is owned
    if (mineData.machines < machineId) {
      this.game.logMessage("❌ Machine not owned!");
      return;
    }

    // Activate the machine
    mineData.activeMachines[machineId] = true;
    this.updateMachineDisplay(machineId, true);
    this.startMiningForMachine(machineId);

    this.game.logMessage(
      `⚡ Mining machine ${machineId} activated!`,
      "success"
    );
  }

  startMiningForMachine(machineId) {
    // Clear any existing timer for this machine
    if (this.miningTimers[machineId]) {
      clearInterval(this.miningTimers[machineId]);
    }

    const mineData = this.game.getCurrentMineData();

    // Initialize machine data if needed
    if (!mineData.machineData) {
      mineData.machineData = {};
    }
    if (!mineData.machineData[machineId]) {
      mineData.machineData[machineId] = {
        progress: 0,
        collected: 0,
        geodes: 0,
      };
    }

    // Start mining loop for this machine
    this.miningTimers[machineId] = setInterval(() => {
      this.processMiningTickForMachine(machineId);
    }, 1000); // Update every second

    this.game.logMessage(`⛏️ Machine ${machineId} mining started!`);
  }

  processMiningTickForMachine(machineId) {
    const mineData = this.game.getCurrentMineData();
    const machineData = mineData.machineData[machineId];

    if (!machineData) return;

    // Increment progress (10% per second for 10 second fills)
    machineData.progress += 10;

    if (machineData.progress >= 100) {
      // Complete a mining cycle
      machineData.progress = 0;

      const baseProduction = this.game.calculateMiningOutput();
      machineData.collected += baseProduction;
      machineData.geodes += GAME_CONFIG.GEODE_DROP_RATE;

      this.game.logMessage(
        `⛏️ Machine ${machineId} cycle complete! Collected ${baseProduction} resources and ${GAME_CONFIG.GEODE_DROP_RATE} geode(s).`
      );
    }

    this.updateMiningDisplay();
  }

  updateMiningDisplay() {
    const mineData = this.game.getCurrentMineData();
    const config = this.game.getCurrentMineConfig();

    // Calculate totals from all machines
    let totalCollected = 0;
    let totalGeodes = 0;
    let totalProgress = 0;
    let activeMachines = 0;

    if (mineData.machineData) {
      Object.values(mineData.machineData).forEach((machineData) => {
        totalCollected += machineData.collected || 0;
        totalGeodes += machineData.geodes || 0;
        totalProgress += machineData.progress || 0;
        activeMachines++;
      });
    }

    // Add legacy data
    totalCollected += mineData.collected || 0;
    totalGeodes += mineData.geodes || 0;

    // Update progress bar (average of active machines)
    const progressBar = document.getElementById("mining-progress");
    if (progressBar) {
      const avgProgress =
        activeMachines > 0
          ? totalProgress / activeMachines
          : mineData.progress || 0;
      progressBar.style.width = avgProgress + "%";
    }

    // Update pending resources
    const currencyIcon = this.game.getCurrencyIcon(config.currency);
    this.game.updateElement(
      "pending-currency",
      `${totalCollected} ${currencyIcon}`
    );
    this.game.updateElement("pending-geodes", `${totalGeodes} 📦`);

    // Update collect button state
    const collectBtn = document.getElementById("collect-btn");
    if (collectBtn) {
      collectBtn.disabled = totalCollected === 0 && totalGeodes === 0;
    }
  }

  interactMiningMachine() {
    // This is now handled by specific machine activation/collection
    this.collectResources();
  }

  collectResources() {
    const mineData = this.game.getCurrentMineData();
    const config = this.game.getCurrentMineConfig();

    let totalCollected = 0;
    let totalGeodes = 0;

    // Collect from all active machines
    if (mineData.machineData) {
      Object.values(mineData.machineData).forEach((machineData) => {
        totalCollected += machineData.collected || 0;
        totalGeodes += machineData.geodes || 0;
        machineData.collected = 0;
        machineData.geodes = 0;
      });
    }

    // Collect legacy data
    totalCollected += mineData.collected || 0;
    totalGeodes += mineData.geodes || 0;
    mineData.collected = 0;
    mineData.geodes = 0;

    let collected = false;

    // Collect currency with particle effect
    if (totalCollected > 0) {
      this.game.addCurrency(config.currency, totalCollected);
      this.game.logMessage(
        `✅ Collected ${totalCollected} ${this.game.getCurrencyIcon(
          config.currency
        )}!`,
        "success"
      );

      // Trigger particle effect
      this.triggerParticleEffect(config.currency, totalCollected);
      collected = true;
    }

    // Open geodes with mini-game
    if (totalGeodes > 0) {
      this.startGeodeMiniGame(totalGeodes);
      collected = true;
    }

    if (collected) {
      this.updateCurrencyDisplays();
      this.updateMiningDisplay();
      this.updateMechaBuilding();
    }
  }

  triggerParticleEffect(currencyType, amount) {
    // Create particle container if it doesn't exist
    let particleContainer = document.getElementById("particle-container");
    if (!particleContainer) {
      particleContainer = document.createElement("div");
      particleContainer.id = "particle-container";
      particleContainer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1000;
      `;
      document.querySelector(".mining-area").appendChild(particleContainer);
    }

    // Get currency icon and color
    const currencyIcons = {
      shells: { emoji: "🐚", color: "#f39c12" },
      coins: { emoji: "🪙", color: "#e67e22" },
      bars: { emoji: "🥇", color: "#f1c40f" },
      bonds: { emoji: "📜", color: "#8e44ad" },
      gems: { emoji: "💎", color: "#e91e63" },
    };

    const currency = currencyIcons[currencyType] || currencyIcons.shells;

    // Create particles
    for (let i = 0; i < Math.min(amount, 20); i++) {
      setTimeout(() => {
        this.createParticle(particleContainer, currency);
      }, i * 50);
    }
  }

  createParticle(container, currency) {
    const particle = document.createElement("div");
    particle.textContent = currency.emoji;
    particle.style.cssText = `
      position: absolute;
      font-size: 24px;
      color: ${currency.color};
      left: ${Math.random() * 80 + 10}%;
      top: 50%;
      animation: particleFloat 2s ease-out forwards;
      pointer-events: none;
    `;

    container.appendChild(particle);

    // Remove particle after animation
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 2000);
  }

  startGeodeMiniGame(geodeCount) {
    this.geodeState = {
      active: true,
      currentIndex: 0,
      totalGeodes: geodeCount,
      totalEarned: 0,
      rewards: [],
    };

    // Show popup
    const popup = document.getElementById("geode-popup");
    if (popup) {
      popup.style.display = "flex";
      this.updateGeodeDisplay();
    }

    this.game.logMessage(`🎁 Opening ${geodeCount} geodes!`, "success");
  }

  updateGeodeDisplay() {
    const remaining =
      this.geodeState.totalGeodes - this.geodeState.currentIndex;

    document.getElementById("geodes-remaining").textContent = remaining;
    document.getElementById("total-currency-earned").textContent =
      this.geodeState.totalEarned;

    const openBtn = document.getElementById("open-geode-btn");
    const continueBtn = document.getElementById("geode-continue-btn");

    if (remaining > 0) {
      openBtn.style.display = "inline-block";
      continueBtn.style.display = "none";
    } else {
      openBtn.style.display = "none";
      continueBtn.style.display = "inline-block";
    }
  }

  openSingleGeode() {
    if (this.geodeState.currentIndex >= this.geodeState.totalGeodes) {
      return;
    }

    // Simulate geode opening with same logic as before
    let partsFound = 0;
    let bonusCurrency = 0;

    if (Math.random() < GAME_CONFIG.MECHA_PART_DROP_RATE) {
      // 5% chance for mecha part
      const randomPart =
        MECHA_PARTS[Math.floor(Math.random() * MECHA_PARTS.length)];

      if (!this.game.getCurrentMechaData().parts[randomPart]) {
        this.game.getCurrentMechaData().parts[randomPart] = true;
        partsFound++;
        this.showCurrentReward(`🎉 Found mecha part: ${randomPart}!`);
      } else {
        // Already have this part, give bonus currency instead
        bonusCurrency += Math.floor(Math.random() * 10) + 5;
        this.showCurrentReward(`💰 Bonus currency: ${bonusCurrency}`);
      }
    } else {
      // 95% chance for bonus currency
      bonusCurrency += Math.floor(Math.random() * 20) + 1;
      this.showCurrentReward(`💰 Currency: ${bonusCurrency}`);
    }

    if (bonusCurrency > 0) {
      const config = this.game.getCurrentMineConfig();
      this.game.addCurrency(config.currency, bonusCurrency);
      this.geodeState.totalEarned += bonusCurrency;
    }

    // Add geode opening animation
    const geodeImg = document.getElementById("current-geode");
    if (geodeImg) {
      geodeImg.style.animation = "geodeShake 0.5s ease-in-out";
      setTimeout(() => {
        geodeImg.style.animation = "";
      }, 500);
    }

    this.geodeState.currentIndex++;
    this.updateGeodeDisplay();

    if (partsFound > 0) {
      this.updateMechaBuilding();
    }
  }

  showCurrentReward(text) {
    const rewardElement = document.getElementById("current-reward");
    if (rewardElement) {
      rewardElement.textContent = text;
      rewardElement.style.animation = "rewardPulse 0.8s ease-out";
      setTimeout(() => {
        rewardElement.style.animation = "";
      }, 800);
    }
  }

  finishGeodeOpening() {
    // Hide popup
    const popup = document.getElementById("geode-popup");
    if (popup) {
      popup.style.display = "none";
    }

    // Reset state
    this.geodeState.active = false;

    // Update displays
    this.updateCurrencyDisplays();
    this.updateMiningDisplay();

    this.game.logMessage(
      `🎁 Geode opening complete! Total earned: ${this.geodeState.totalEarned}`,
      "success"
    );
  }

  updateCurrencyDisplays() {
    const config = this.game.getCurrentMineConfig();
    const monsterCurrencyKey = CONFIG_UTILS.getMonsterCurrencyKey(
      config.currency
    );

    this.game.updateElement(
      "total-currency",
      this.game.gameState.currencies[config.currency]
    );
    this.game.updateElement(
      "monster-currency",
      this.game.gameState.currencies[monsterCurrencyKey] || 0
    );
  }

  updateMechaBuilding() {
    const mechaData = this.game.getCurrentMechaData();
    const config = this.game.getCurrentMineConfig();
    const parts = mechaData.parts;

    // Update mecha image based on current mine
    const mechaImg = document.getElementById("mecha-image");
    if (mechaImg) {
      const mechaImages = {
        1: "images/mecha-green.png",
        2: "images/mecha-yellow.png",
        3: "images/mecha-red.png",
        4: "images/mecha-blue.png",
        5: "images/mecha-pink.png",
      };
      mechaImg.src =
        mechaImages[this.game.gameState.currentMine] || mechaImages[1];
    }

    // Update part slots visual state
    Object.keys(parts).forEach((partType) => {
      const slotId = `part-${partType
        .replace(/([A-Z])/g, "-$1")
        .toLowerCase()}`;
      const slot = document.getElementById(slotId);

      if (slot) {
        if (parts[partType]) {
          slot.classList.add("filled");
          slot.style.background = "rgba(46, 204, 113, 0.3)";
        } else {
          slot.classList.remove("filled");
          slot.style.background = "rgba(0, 0, 0, 0.3)";
        }
      }
    });

    // Update build button state
    const buildBtn = document.getElementById("build-mecha-btn");
    if (buildBtn) {
      const canBuild = this.game.canBuildMecha();
      buildBtn.disabled = !canBuild;

      if (canBuild) {
        buildBtn.textContent = "Build Mecha (All Parts Ready!)";
        buildBtn.style.background = "var(--mecha-gradient)";
      } else {
        const missingParts = Object.values(parts).filter(
          (hasPart) => !hasPart
        ).length;
        buildBtn.textContent = `Build Mecha (Need ${missingParts} more parts)`;
        buildBtn.style.background = "var(--background-overlay)";
      }
    }

    // Update production multiplier display
    const multiplier = mechaData.built + 1;
    this.game.updateElement(
      "mecha-multiplier",
      `Production Bonus: x${multiplier}`
    );

    // Update combat ready status
    const combatReady = document.getElementById("combat-ready");
    if (combatReady) {
      if (mechaData.built > 0) {
        combatReady.style.display = "block";
        this.updateMonsterDisplay(combatReady, config);
      } else {
        combatReady.style.display = "none";
      }
    }
  }

  updateMonsterDisplay(combatReady, config) {
    const monsterImg = combatReady.querySelector(".monster-image");
    const monsterNameDiv = combatReady.querySelector("div div");

    if (monsterImg) {
      const monsterImages = {
        1: "images/slime-yellow-1.png",
        2: "images/slime-teal-1.png",
        3: "images/slime-blue-1.png",
        4: "images/slime-orange-1.png",
        5: "images/slime-alien-1.png",
      };
      monsterImg.src =
        monsterImages[this.game.gameState.currentMine] || monsterImages[1];
    }

    if (monsterNameDiv) {
      monsterNameDiv.textContent = config.monster;
    }
  }

  buildMecha() {
    if (this.game.buildMecha()) {
      this.updateMechaBuilding();
      this.updateCurrencyDisplays();
    }
  }

  buyMiningMachine(machineId) {
    const mineData = this.game.getCurrentMineData();
    const config = this.game.getCurrentMineConfig();
    const cost = CONFIG_UTILS.calculateMachineUpgradeCost(
      this.game.gameState.currentMine,
      machineId
    );

    const currencyKey = config.currency;
    const monsterCurrencyKey = CONFIG_UTILS.getMonsterCurrencyKey(currencyKey);

    // Check if player can afford the machine
    if (
      this.game.hasCurrency(currencyKey, cost.currency) &&
      this.game.hasCurrency(monsterCurrencyKey, cost.monster)
    ) {
      // Purchase the machine
      this.game.spendCurrency(currencyKey, cost.currency);
      this.game.spendCurrency(monsterCurrencyKey, cost.monster);
      mineData.machines = Math.max(mineData.machines, machineId);

      this.game.logMessage(
        `⛏️ Purchased mining machine ${machineId}! Click to activate it.`,
        "success"
      );

      // Update machine display
      this.updateMachineDisplay(machineId, true);
      this.updateCurrencyDisplays();
    } else {
      this.game.logMessage(
        `❌ Not enough resources! Need ${
          cost.currency
        } ${this.game.getCurrencyIcon(currencyKey)} and ${
          cost.monster
        } ${this.game.getCurrencyIcon(monsterCurrencyKey)}`
      );
    }
  }

  upgradeMiningMachine(machineId) {
    // Placeholder for machine upgrades
    this.game.logMessage(`⚡ Machine ${machineId} upgrade coming soon!`);
  }

  openUpgrades() {
    this.game.showScreen("upgrades-screen");
    this.updateUpgradeCost();
  }

  updateUpgradeCost() {
    const mineData = this.game.getCurrentMineData();
    this.game.updateElement("upgrade-cost", mineData.upgradeCost);
  }

  spinUpgradeSlots() {
    const mineData = this.game.getCurrentMineData();
    const config = this.game.getCurrentMineConfig();
    const cost = mineData.upgradeCost;

    if (!this.game.hasCurrency(config.currency, cost)) {
      this.game.logMessage(
        `❌ Not enough ${this.game.getCurrencyIcon(
          config.currency
        )}! Need ${cost}`,
        "combat"
      );
      return;
    }

    // Pay for the upgrade
    this.game.spendCurrency(config.currency, cost);
    mineData.upgradeCost = Math.floor(
      mineData.upgradeCost * GAME_CONFIG.UPGRADE_COST_MULTIPLIER
    );

    // Animate slots
    const slots = ["upgrade-slot-1", "upgrade-slot-2", "upgrade-slot-3"];
    let spinCount = 0;

    const spinInterval = setInterval(() => {
      slots.forEach((slotId) => {
        const slot = document.getElementById(slotId);
        if (slot) {
          slot.textContent = CONFIG_UTILS.getRandomUpgradeSymbol();
        }
      });

      spinCount++;
      if (spinCount > 15) {
        clearInterval(spinInterval);
        this.resolveUpgradeSlots();
      }
    }, 100);

    this.updateUpgradeCost();
    this.updateCurrencyDisplays();
  }

  resolveUpgradeSlots() {
    const slot1 = document.getElementById("upgrade-slot-1").textContent;
    const slot2 = document.getElementById("upgrade-slot-2").textContent;
    const slot3 = document.getElementById("upgrade-slot-3").textContent;

    const resultDiv = document.getElementById("upgrade-result");
    const mineData = this.game.getCurrentMineData();

    // Simple upgrade resolution
    if (slot1 === "❌" && slot2 === "❌" && slot3 === "❌") {
      resultDiv.innerHTML = `<span style="color: #e74c3c;">Nothing happened!</span>`;
      this.game.logMessage("💥 Upgrade failed - nothing happened!", "combat");
    } else {
      // Count successful symbols
      const nonFailCount = [slot1, slot2, slot3].filter(
        (symbol) => symbol !== "❌"
      ).length;

      if (nonFailCount >= 2) {
        const upgrades = [];

        if ([slot1, slot2, slot3].includes("⚡")) {
          mineData.upgradeLevel++;
          upgrades.push("Mining Speed +10%");
        }
        if ([slot1, slot2, slot3].includes("💰")) {
          mineData.upgradeLevel++;
          upgrades.push("Currency Output +1");
        }
        if ([slot1, slot2, slot3].includes("🔧")) {
          mineData.upgradeLevel++;
          upgrades.push("Mecha Part Drop +1%");
        }
        if ([slot1, slot2, slot3].includes("📈")) {
          mineData.upgradeLevel++;
          upgrades.push("Output Multiplier +0.1x");
        }

        if (upgrades.length > 0) {
          resultDiv.innerHTML = `<span style="color: #27ae60;">🎉 Success! ${upgrades.join(
            ", "
          )}</span>`;
          this.game.logMessage(
            `🔧 Mine upgraded! ${upgrades.join(", ")}`,
            "success"
          );
        }
      } else {
        resultDiv.innerHTML = `<span style="color: #f39c12;">Partial success - minor improvement!</span>`;
        this.game.logMessage("🔧 Minor mining improvement!", "success");
      }
    }
  }

  clearMiningTimers() {
    Object.values(this.miningTimers).forEach((timer) => {
      if (timer) {
        clearInterval(timer);
      }
    });
    this.miningTimers = {};
  }

  // Utility method to stop specific machine
  stopMiningForMachine(machineId) {
    if (this.miningTimers[machineId]) {
      clearInterval(this.miningTimers[machineId]);
      delete this.miningTimers[machineId];
    }

    const mineData = this.game.getCurrentMineData();
    if (mineData.activeMachines) {
      mineData.activeMachines[machineId] = false;
    }

    this.updateMachineDisplay(machineId, true);
  }

  // Get total production from all active machines
  getTotalProduction() {
    const mineData = this.game.getCurrentMineData();
    let totalProduction = 0;

    if (mineData.activeMachines) {
      Object.keys(mineData.activeMachines).forEach((machineId) => {
        if (mineData.activeMachines[machineId]) {
          totalProduction += this.game.calculateMiningOutput();
        }
      });
    }

    return Math.max(totalProduction, this.game.calculateMiningOutput());
  }

  // Enhanced machine management
  getMachineStatus(machineId) {
    const mineData = this.game.getCurrentMineData();
    return {
      owned: mineData.machines >= machineId,
      active: mineData.activeMachines && mineData.activeMachines[machineId],
      data: mineData.machineData && mineData.machineData[machineId],
    };
  }

  // Initialize machine data structure for new mines
  initializeMachineData() {
    const mineData = this.game.getCurrentMineData();

    if (!mineData.activeMachines) {
      mineData.activeMachines = {};
    }

    if (!mineData.machineData) {
      mineData.machineData = {};
    }
  }
}
