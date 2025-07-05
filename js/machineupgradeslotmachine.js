// MachineUpgradeSlotMachine - Specific implementation for machine upgrades
class MachineUpgradeSlotMachine extends SlotMachine {
  constructor(container, miningScreen) {
    // Verify that SlotMachine exists and is properly loaded
    if (typeof SlotMachine === "undefined") {
      throw new Error("SlotMachine base class not loaded");
    }

    // MUST call super() first before accessing 'this'
    super(container);

    // Verify that configure method exists
    if (typeof this.configure !== "function") {
      throw new Error("SlotMachine configure method not available");
    }

    this.miningScreen = miningScreen;
    this.activeMachineId = null;
    this.baseCost = 10;
    this.costMultiplier = 1.5;

    // Configure upgrade-specific symbols AFTER super() call
    this.configure({
      symbols: [
        {
          name: "time_reduction",
          emoji: "⚡",
          image: "images/upgrade-speed.png",
          weight: 25,
          upgradeType: "timeReduction",
          upgradeValue: 0.05, // 5% time reduction
          color: "#FFD700",
        },
        {
          name: "output_bonus",
          emoji: "💰",
          image: "images/upgrade-output.png",
          weight: 30,
          upgradeType: "outputBonus",
          upgradeValue: 1, // +1 output
          color: "#4CAF50",
        },
        {
          name: "output_multiplier",
          emoji: "🔧",
          image: "images/upgrade-efficiency.png",
          weight: 20,
          upgradeType: "outputMultiplier",
          upgradeValue: 0.001, // 0.1% per 100 stored
          color: "#2196F3",
        },
        {
          name: "part_drop_rate",
          emoji: "💎",
          image: "images/upgrade-luck.png",
          weight: 15,
          upgradeType: "partDropRate",
          upgradeValue: 0.01, // +1% drop rate
          color: "#E91E63",
        },
        {
          name: "currency_bonus",
          emoji: "🪙",
          image: "images/upgrade-currency.png",
          weight: 10,
          upgradeType: "currency",
          upgradeValue: 100, // +100 currency
          color: "#FF9800",
        },
      ],
      winChance: 0.3, // 30% win chance for upgrades
      useImages: true,
    });

    // Set up callbacks
    this.setCallbacks({
      onSpin: this.handleSpin.bind(this),
      onResult: this.handleResult.bind(this),
      onWin: this.handleWin.bind(this),
      onLose: this.handleLose.bind(this),
    });

    // Track consecutive losses for achievements
    this.consecutiveLosses = 0;
  }

  // Initialize with paytable rendering
  init() {
    super.init();
    this.cacheAdditionalElements();
    this.renderPaytable();
    this.updateUI();
  }

  // Cache additional elements specific to upgrades
  cacheAdditionalElements() {
    this.elements = {
      ...this.elements,
      costDisplay: this.container.querySelector(".cost-amount"),
      paytable: this.container.querySelector(".slot-paytable"),
    };
  }

  // Show slot machine for specific machine
  showForMachine(machineId) {
    this.activeMachineId = machineId;
    this.updateUI();
    this.show();
  }

  // Handle spin attempt
  handleSpin(slotMachine) {
    if (!this.activeMachineId) {
      this.miningScreen.showTemporaryMessage("No machine selected!", "warning");
      return false;
    }

    const cost = this.getCurrentCost();

    // Check if player can afford
    if (this.miningScreen.currency < cost) {
      this.miningScreen.showTemporaryMessage(
        `Not enough currency! Need ${cost}`,
        "warning"
      );
      return false;
    }

    // Deduct cost
    this.miningScreen.currency -= cost;
    this.miningScreen.updateCurrencyDisplay();

    return true;
  }

  // Handle spin result
  handleResult(result, slotMachine) {
    console.log("Upgrade slot result:", result);

    // Update UI after result
    this.updateUI();
  }

  // Handle winning result
  handleWin(result, slotMachine) {
    this.consecutiveLosses = 0;

    const symbol = this.getSymbol(result.symbol);
    if (!symbol) return;

    // Apply upgrade to machine
    this.applyUpgrade(symbol);

    // Show success message
    const upgradeName = this.getUpgradeName(symbol);
    this.showResult(`🎉 ${upgradeName}!`, symbol.color);

    // Highlight paytable row
    this.highlightPaytableRow(symbol.name);

    // Play success sound
    if (this.miningScreen.audioManager) {
      this.miningScreen.audioManager.playSound("upgrade-success");
    }

    // Check for achievements
    this.checkUpgradeAchievements(symbol);
  }

  // Handle losing result
  handleLose(result, slotMachine) {
    this.consecutiveLosses++;

    this.showResult("No upgrade - try again!", "#999");

    // Achievement for consecutive losses
    if (this.consecutiveLosses >= 3) {
      this.miningScreen.showTemporaryMessage("Unlucky streak! 🎰", "warning");
    }
  }

  // Apply upgrade to active machine
  applyUpgrade(symbol) {
    const machine = this.miningScreen.machineManager.getMachine(
      this.activeMachineId
    );
    if (!machine) return;

    switch (symbol.upgradeType) {
      case "timeReduction":
        this.miningScreen.machineManager.applyUpgrade(
          this.activeMachineId,
          "timeReduction",
          symbol.upgradeValue
        );
        break;
      case "outputBonus":
        this.miningScreen.machineManager.applyUpgrade(
          this.activeMachineId,
          "outputBonus",
          symbol.upgradeValue
        );
        break;
      case "outputMultiplier":
        this.miningScreen.machineManager.applyUpgrade(
          this.activeMachineId,
          "outputMultiplier",
          symbol.upgradeValue
        );
        break;
      case "partDropRate":
        this.miningScreen.machineManager.applyUpgrade(
          this.activeMachineId,
          "partDropRate",
          symbol.upgradeValue
        );
        break;
      case "currency":
        this.miningScreen.currency += symbol.upgradeValue;
        this.miningScreen.updateCurrencyDisplay();
        break;
    }

    // Update machine upgrade cost
    this.miningScreen.machineManager.updateUpgradeCost(this.activeMachineId);
  }

  // Get current cost based on machine upgrades
  getCurrentCost() {
    if (!this.activeMachineId) return this.baseCost;

    const machine = this.miningScreen.machineManager.getMachine(
      this.activeMachineId
    );
    if (!machine) return this.baseCost;

    // Calculate cost based on total upgrades applied
    const totalUpgrades = Object.values(machine.upgrades).reduce(
      (sum, value) => {
        return sum + Math.floor(value * 100); // Convert percentages to counts
      },
      0
    );

    return Math.floor(
      this.baseCost * Math.pow(this.costMultiplier, totalUpgrades)
    );
  }

  // Update UI elements
  updateUI() {
    this.updateCostDisplay();
    this.updateSpinButton();
  }

  // Update cost display
  updateCostDisplay() {
    if (this.elements.costDisplay) {
      this.elements.costDisplay.textContent = this.getCurrentCost();
    }
  }

  // Update spin button state
  updateSpinButton() {
    super.updateSpinButton();

    if (this.elements.spinButton && !this.isCurrentlySpinning()) {
      const canAfford = this.miningScreen.currency >= this.getCurrentCost();
      this.elements.spinButton.disabled = !canAfford;
      this.elements.spinButton.textContent = canAfford
        ? "Spin for Upgrade"
        : "Not Enough Currency";
    }
  }

  // Render paytable
  renderPaytable() {
    if (!this.elements.paytable) return;

    const paytableHTML = `
      <div class="paytable-header">
        <h4>Upgrade Paytable</h4>
        <div class="paytable-note">Win 3 matching symbols for upgrades!</div>
      </div>
      <div class="paytable-grid">
        ${this.config.symbols
          .map(
            (symbol) => `
          <div class="paytable-row" data-symbol="${symbol.name}">
            <div class="paytable-symbols">
              <img src="${symbol.image}" alt="${
              symbol.name
            }" class="paytable-symbol">
              <img src="${symbol.image}" alt="${
              symbol.name
            }" class="paytable-symbol">
              <img src="${symbol.image}" alt="${
              symbol.name
            }" class="paytable-symbol">
            </div>
            <div class="paytable-reward" style="color: ${symbol.color}">
              ${this.getUpgradeName(symbol)}
            </div>
          </div>
        `
          )
          .join("")}
      </div>
      <div class="paytable-footer">
        <div class="paytable-note">Cost increases with each upgrade applied to this machine</div>
      </div>
    `;

    this.elements.paytable.innerHTML = paytableHTML;
  }

  // Get upgrade name for display
  getUpgradeName(symbol) {
    const names = {
      time_reduction: "Speed Boost (+5%)",
      output_bonus: "Output Boost (+1)",
      output_multiplier: "Efficiency (+0.1%)",
      part_drop_rate: "Lucky Strike (+1%)",
      currency_bonus: "Currency Bonus (+100)",
    };
    return names[symbol.name] || symbol.name;
  }

  // Highlight winning paytable row
  highlightPaytableRow(symbolName) {
    const rows = this.elements.paytable?.querySelectorAll(".paytable-row");
    if (!rows) return;

    rows.forEach((row) => row.classList.remove("paytable-winner"));

    const winningRow = this.elements.paytable.querySelector(
      `[data-symbol="${symbolName}"]`
    );
    if (winningRow) {
      winningRow.classList.add("paytable-winner");

      setTimeout(() => {
        winningRow.classList.remove("paytable-winner");
      }, 3000);
    }
  }

  // Check for upgrade-related achievements
  checkUpgradeAchievements(symbol) {
    // Could add achievements for specific upgrades or combinations
    console.log(`Upgrade applied: ${symbol.name}`);
  }

  // Get machine upgrade statistics
  getMachineUpgradeStats(machineId) {
    const machine = this.miningScreen.machineManager.getMachine(machineId);
    if (!machine) return null;

    return {
      machineId,
      upgrades: { ...machine.upgrades },
      currentCost: this.getCurrentCost(),
      totalUpgrades: Object.values(machine.upgrades).reduce(
        (sum, value) => sum + Math.floor(value * 100),
        0
      ),
    };
  }

  // Reset for new machine
  resetForMachine(machineId) {
    this.activeMachineId = machineId;
    this.consecutiveLosses = 0;
    this.updateUI();
  }

  // Override hide to clear active machine
  hide() {
    super.hide();
    this.activeMachineId = null;
  }

  // Get upgrade recommendations based on machine state
  getUpgradeRecommendations(machineId) {
    const machine = this.miningScreen.machineManager.getMachine(machineId);
    if (!machine) return [];

    const recommendations = [];

    // Recommend based on current upgrade levels
    if (machine.upgrades.timeReduction < 0.5) {
      recommendations.push("time_reduction");
    }
    if (machine.upgrades.outputBonus < 10) {
      recommendations.push("output_bonus");
    }
    if (machine.upgrades.partDropRate < 0.1) {
      recommendations.push("part_drop_rate");
    }

    return recommendations;
  }
}

// Make available globally
window.MachineUpgradeSlotMachine = MachineUpgradeSlotMachine;

console.log("🔧 MachineUpgradeSlotMachine class loaded!");
