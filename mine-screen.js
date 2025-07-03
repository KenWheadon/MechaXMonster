// Mine Screen Module - Mining Operations and Mecha Building
class MineScreen {
  constructor(game) {
    this.game = game;
    this.miningTimer = null;
  }

  init() {
    // Initialize mining screen
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Main mining machine interaction
    const mainMachine = document.getElementById("main-mining-machine");
    if (mainMachine) {
      mainMachine.addEventListener("click", () => this.interactMiningMachine());
    }

    // Collect resources button
    const collectBtn = document.getElementById("collect-btn");
    if (collectBtn) {
      collectBtn.addEventListener("click", () => this.collectResources());
    }

    // Build mecha button
    const buildBtn = document.getElementById("build-mecha-btn");
    if (buildBtn) {
      buildBtn.addEventListener("click", () => this.buildMecha());
    }
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

    // Start mining if not already active
    const mineData = this.game.getCurrentMineData();
    if (!mineData.active) {
      this.startMining();
    }

    // Update mining display
    this.updateMiningDisplay();

    this.game.logMessage(
      `🤖 AstroGuide: Welcome to ${config.name}! Mining operations ready.`
    );
  }

  startMining() {
    const mineData = this.game.getCurrentMineData();

    if (mineData.active) {
      return; // Already active
    }

    mineData.active = true;
    mineData.progress = 0;

    // Start mining loop
    this.miningTimer = setInterval(() => {
      this.processMiningTick();
    }, 1000); // Update every second

    // Add visual indicator
    const mainMachine = document.getElementById("main-mining-machine");
    if (mainMachine) {
      mainMachine.classList.add("active");
    }

    this.game.logMessage(
      "⛏️ Mining started! Operations running automatically."
    );
  }

  processMiningTick() {
    const mineData = this.game.getCurrentMineData();

    if (!mineData.active) {
      this.stopMining();
      return;
    }

    // Increment progress (10% per second for 10 second fills)
    mineData.progress += 10;

    if (mineData.progress >= 100) {
      // Complete a mining cycle
      mineData.progress = 0;

      const baseProduction = this.game.calculateMiningOutput();
      mineData.collected += baseProduction;
      mineData.geodes += GAME_CONFIG.GEODE_DROP_RATE;

      this.game.logMessage(
        `⛏️ Mining cycle complete! Collected ${baseProduction} resources and ${GAME_CONFIG.GEODE_DROP_RATE} geode(s).`
      );
    }

    this.updateMiningDisplay();
  }

  stopMining() {
    if (this.miningTimer) {
      clearInterval(this.miningTimer);
      this.miningTimer = null;
    }

    const mineData = this.game.getCurrentMineData();
    mineData.active = false;

    // Remove visual indicator
    const mainMachine = document.getElementById("main-mining-machine");
    if (mainMachine) {
      mainMachine.classList.remove("active");
    }
  }

  updateMiningDisplay() {
    const mineData = this.game.getCurrentMineData();
    const config = this.game.getCurrentMineConfig();

    // Update progress bar
    const progressBar = document.getElementById("mining-progress");
    if (progressBar) {
      progressBar.style.width = mineData.progress + "%";
    }

    // Update pending resources
    const currencyIcon = this.game.getCurrencyIcon(config.currency);
    this.game.updateElement(
      "pending-currency",
      `${mineData.collected} ${currencyIcon}`
    );
    this.game.updateElement("pending-geodes", `${mineData.geodes} 📦`);

    // Update collect button state
    const collectBtn = document.getElementById("collect-btn");
    if (collectBtn) {
      collectBtn.disabled = mineData.collected === 0 && mineData.geodes === 0;
    }
  }

  interactMiningMachine() {
    const mineData = this.game.getCurrentMineData();

    if (mineData.collected > 0 || mineData.geodes > 0) {
      this.collectResources();
    } else if (!mineData.active) {
      this.startMining();
    } else {
      this.game.logMessage(
        "🤖 AstroGuide: The mining machine is working! Wait for resources to be ready for collection."
      );
    }
  }

  collectResources() {
    const mineData = this.game.getCurrentMineData();
    const config = this.game.getCurrentMineConfig();

    let collected = false;

    // Collect currency
    if (mineData.collected > 0) {
      this.game.addCurrency(config.currency, mineData.collected);
      this.game.logMessage(
        `✅ Collected ${mineData.collected} ${this.game.getCurrencyIcon(
          config.currency
        )}!`,
        "success"
      );
      mineData.collected = 0;
      collected = true;
    }

    // Open geodes
    if (mineData.geodes > 0) {
      const result = this.game.openGeodes(mineData.geodes);
      this.game.logMessage(`📦 Opened ${mineData.geodes} geode(s)!`, "success");
      mineData.geodes = 0;
      collected = true;
    }

    if (collected) {
      this.updateCurrencyDisplays();
      this.updateMiningDisplay();
      this.updateMechaBuilding();
    }
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

        // Update monster info for current mine
        const monsterImg = combatReady.querySelector(".monster-image");
        const monsterName = combatReady.querySelector("div div");
        if (monsterImg && monsterName) {
          // Update monster display based on current mine
          this.updateMonsterDisplay(monsterImg, monsterName, config);
        }
      } else {
        combatReady.style.display = "none";
      }
    }
  }

  updateMonsterDisplay(imgElement, nameElement, config) {
    // Update monster image and name based on mine config
    const monsterImages = {
      1: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><ellipse cx='50' cy='60' rx='35' ry='25' fill='%23f1c40f'/><circle cx='40' cy='50' r='4' fill='%23000'/><circle cx='60' cy='50' r='4' fill='%23000'/></svg>",
      2: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><ellipse cx='50' cy='60' rx='35' ry='25' fill='%2317a2b8'/><circle cx='40' cy='50' r='4' fill='%23fff'/><circle cx='60' cy='50' r='4' fill='%23fff'/></svg>",
      3: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><ellipse cx='50' cy='60' rx='35' ry='25' fill='%233498db'/><circle cx='40' cy='50' r='4' fill='%23fff'/><circle cx='60' cy='50' r='4' fill='%23fff'/></svg>",
      4: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><ellipse cx='50' cy='60' rx='35' ry='25' fill='%23e67e22'/><circle cx='40' cy='50' r='4' fill='%23000'/><circle cx='60' cy='50' r='4' fill='%23000'/></svg>",
      5: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><ellipse cx='50' cy='60' rx='35' ry='25' fill='%23000'/><circle cx='40' cy='50' r='4' fill='%23fff'/><circle cx='60' cy='50' r='4' fill='%23fff'/></svg>",
    };

    imgElement.src =
      monsterImages[this.game.gameState.currentMine] || monsterImages[1];
    imgElement.alt = config.monster;

    if (nameElement) {
      nameElement.textContent = config.monster;
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
      mineData.machines++;

      this.game.logMessage(
        `⛏️ Purchased mining machine ${machineId}! Production increased.`,
        "success"
      );

      // Update machine display
      this.updateMachineDisplay(machineId);
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

  updateMachineDisplay(machineId) {
    const machineElement = document.getElementById(
      `mining-machine-${machineId}`
    );
    if (machineElement) {
      machineElement.classList.remove("locked");
      machineElement.innerHTML = `
                <div class="machine-status">
                    <h4>Excavator ${machineId}</h4>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${
                          Math.random() * 100
                        }%"></div>
                    </div>
                    <div>Status: Active</div>
                </div>
            `;
    }
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
    if (this.miningTimer) {
      clearInterval(this.miningTimer);
      this.miningTimer = null;
    }
  }
}
