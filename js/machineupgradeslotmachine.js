// MineUpgradeSlotMachine - Updated for mine-wide upgrades instead of per-machine
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
    this.baseCost = 50; // Higher base cost for mine-wide upgrades
    this.costMultiplier = 1.3; // Slower cost increase

    // Configure mine-wide upgrade symbols
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
          description: "Reduces mining time for all machines",
        },
        {
          name: "output_bonus",
          emoji: "💰",
          image: "images/upgrade-output.png",
          weight: 30,
          upgradeType: "outputBonus",
          upgradeValue: 2, // +2 output for all machines
          color: "#4CAF50",
          description: "Increases currency output for all machines",
        },
        {
          name: "output_multiplier",
          emoji: "🔧",
          image: "images/upgrade-efficiency.png",
          weight: 20,
          upgradeType: "outputMultiplier",
          upgradeValue: 0.005, // 0.5% per 100 stored
          color: "#2196F3",
          description: "Increases efficiency based on stored currency",
        },
        {
          name: "part_drop_rate",
          emoji: "💎",
          image: "images/upgrade-luck.png",
          weight: 20,
          upgradeType: "partDropRate",
          upgradeValue: 0.02, // +2% drop rate
          color: "#E91E63",
          description: "Increases geode drop rate for all machines",
        },
        {
          name: "combo_bonus",
          emoji: "🎯",
          image: "images/upgrade-combo.png",
          weight: 15,
          upgradeType: "comboBonus",
          upgradeValue: 0.05, // +5% combo effectiveness
          color: "#FF9800",
          description: "Increases combo bonus effectiveness",
        },
        {
          name: "critical_chance",
          emoji: "💥",
          image: "images/upgrade-critical.png",
          weight: 10,
          upgradeType: "criticalChance",
          upgradeValue: 0.02, // +2% critical hit chance
          color: "#9C27B0",
          description: "Increases critical hit chance in active mining",
        },
      ],
      winChance: 0.35, // 35% win chance for mine upgrades
      useImages: true,
    });

    // Set up callbacks
    this.setCallbacks({
      onSpin: this.handleSpin.bind(this),
      onResult: this.handleResult.bind(this),
      onWin: this.handleWin.bind(this),
      onLose: this.handleLose.bind(this),
    });

    // Track stats
    this.totalSpins = 0;
    this.totalWins = 0;
    this.consecutiveLosses = 0;
    this.upgradeHistory = [];
  }

  // Initialize with enhanced paytable
  init() {
    super.init();
    this.cacheAdditionalElements();
    this.renderEnhancedPaytable();
    this.updateUI();
  }

  // Cache additional elements specific to mine upgrades
  cacheAdditionalElements() {
    this.elements = {
      ...this.elements,
      costDisplay: this.container.querySelector(".cost-amount"),
      paytable: this.container.querySelector(".slot-paytable"),
      upgradeStats: this.container.querySelector(".upgrade-stats"),
      mineTitle: this.container.querySelector(".modal-header h2"),
    };
  }

  // Show slot machine for mine-wide upgrades
  showForMine() {
    this.updateUI();
    this.show();

    // Update modal title
    if (this.elements.mineTitle) {
      this.elements.mineTitle.textContent = `${this.miningScreen.mineConfig.name} - Mine Upgrades`;
    }
  }

  // Handle spin attempt
  handleSpin(slotMachine) {
    const cost = this.getCurrentCost();

    // Check if player can afford
    if (this.miningScreen.currency < cost) {
      this.miningScreen.showTemporaryMessage(
        `Not enough currency! Need ${cost} ${this.miningScreen.mineConfig.currency}`,
        "warning"
      );
      return false;
    }

    // Deduct cost
    this.miningScreen.currency -= cost;
    this.miningScreen.updateCurrencyDisplay();

    // Update stats
    this.totalSpins++;

    return true;
  }

  // Handle spin result
  handleResult(result, slotMachine) {
    console.log("Mine upgrade slot result:", result);

    // Update UI after result
    this.updateUI();
    this.updateUpgradeStats();
  }

  // Handle winning result
  handleWin(result, slotMachine) {
    this.consecutiveLosses = 0;
    this.totalWins++;

    const symbol = this.getSymbol(result.symbol);
    if (!symbol) return;

    // Apply mine-wide upgrade
    this.applyMineUpgrade(symbol);

    // Record upgrade history
    this.upgradeHistory.push({
      symbol: symbol.name,
      timestamp: Date.now(),
      spinNumber: this.totalSpins,
    });

    // Show success message
    const upgradeName = this.getUpgradeName(symbol);
    this.showResult(`🎉 Mine Upgrade: ${upgradeName}!`, symbol.color);

    // Highlight paytable row
    this.highlightPaytableRow(symbol.name);

    // Play success sound
    if (this.miningScreen.audioManager) {
      this.miningScreen.audioManager.playSound("upgrade-success");
    }

    // Create mine-wide upgrade effect
    this.createMineUpgradeEffect(symbol);

    // Check for achievements
    this.checkUpgradeAchievements(symbol);
  }

  // Handle losing result
  handleLose(result, slotMachine) {
    this.consecutiveLosses++;

    this.showResult("No upgrade - try again!", "#999");

    // Consolation for consecutive losses
    if (this.consecutiveLosses >= 3) {
      this.miningScreen.showTemporaryMessage(
        "Bad luck streak! Next spin has better odds! 🎰",
        "warning"
      );

      // Temporarily boost win chance
      this.configure({
        ...this.config,
        winChance: Math.min(this.config.winChance + 0.1, 0.8),
      });
    }

    if (this.consecutiveLosses >= 5) {
      // Give small consolation prize
      this.miningScreen.currency += Math.floor(this.getCurrentCost() * 0.3);
      this.miningScreen.updateCurrencyDisplay();
      this.miningScreen.showTemporaryMessage(
        "Consolation prize: some currency back!",
        "info"
      );
    }
  }

  // Apply mine-wide upgrade
  applyMineUpgrade(symbol) {
    const currentLevel =
      this.miningScreen.mineUpgrades[symbol.upgradeType] || 0;
    const newLevel = currentLevel + symbol.upgradeValue;

    // Apply upgrade with caps
    switch (symbol.upgradeType) {
      case "timeReduction":
        this.miningScreen.mineUpgrades.timeReduction = Math.min(newLevel, 0.9); // Max 90% reduction
        break;
      case "outputBonus":
        this.miningScreen.mineUpgrades.outputBonus = Math.min(newLevel, 100); // Max +100 bonus
        break;
      case "outputMultiplier":
        this.miningScreen.mineUpgrades.outputMultiplier = Math.min(
          newLevel,
          0.5
        ); // Max 50% multiplier
        break;
      case "partDropRate":
        this.miningScreen.mineUpgrades.partDropRate = Math.min(newLevel, 0.95); // Max 95% drop rate
        break;
      case "comboBonus":
        this.miningScreen.mineUpgrades.comboBonus = Math.min(newLevel, 1.0); // Max +100% combo effectiveness
        break;
      case "criticalChance":
        this.miningScreen.mineUpgrades.criticalChance = Math.min(newLevel, 0.5); // Max 50% critical chance
        break;
    }

    // Update mining screen UI to reflect new upgrades
    this.miningScreen.updateUI();

    // Restart auto-mining with new upgrades if mecha is active
    if (this.miningScreen.mechaBuilder.hasMecha) {
      this.miningScreen.machineManager.stopAutoMining();
      this.miningScreen.machineManager.startAutoMiningAll();
    }
  }

  // Get current cost based on total upgrades
  getCurrentCost() {
    const totalUpgrades = Object.values(this.miningScreen.mineUpgrades).reduce(
      (sum, value) => sum + Math.floor(value * 100),
      0
    );

    return Math.floor(
      this.baseCost * Math.pow(this.costMultiplier, totalUpgrades / 10)
    );
  }

  // Update UI elements
  updateUI() {
    this.updateCostDisplay();
    this.updateSpinButton();
    this.updateUpgradeStats();
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
        ? "Spin for Mine Upgrade"
        : "Not Enough Currency";
    }
  }

  // Update upgrade statistics display
  updateUpgradeStats() {
    if (!this.elements.upgradeStats) return;

    const winRate =
      this.totalSpins > 0
        ? ((this.totalWins / this.totalSpins) * 100).toFixed(1)
        : 0;
    const currentUpgrades = this.miningScreen.mineUpgrades;

    this.elements.upgradeStats.innerHTML = `
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-label">Total Spins</div>
          <div class="stat-value">${this.totalSpins}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Win Rate</div>
          <div class="stat-value">${winRate}%</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Total Upgrades</div>
          <div class="stat-value">${
            Object.values(currentUpgrades).filter((v) => v > 0).length
          }</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Next Cost</div>
          <div class="stat-value">${this.getCurrentCost()}</div>
        </div>
      </div>
    `;
  }

  // Render enhanced paytable with mine upgrade info
  renderEnhancedPaytable() {
    if (!this.elements.paytable) return;

    const paytableHTML = `
      <div class="paytable-header">
        <h4>Mine Upgrade Paytable</h4>
        <div class="paytable-note">Win 3 matching symbols for mine-wide upgrades!</div>
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
            <div class="paytable-info">
              <div class="paytable-reward" style="color: ${symbol.color}">
                ${this.getUpgradeName(symbol)}
              </div>
              <div class="paytable-description">
                ${symbol.description}
              </div>
              <div class="paytable-current">
                Current: ${this.getCurrentUpgradeLevel(symbol.upgradeType)}
              </div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
      <div class="paytable-footer">
        <div class="paytable-note">Cost increases with total mine upgrades</div>
        <div class="paytable-note">Upgrades apply to ALL machines in this mine</div>
      </div>
      <div class="upgrade-stats">
        <!-- Stats will be populated by updateUpgradeStats() -->
      </div>
    `;

    this.elements.paytable.innerHTML = paytableHTML;
  }

  // Get current upgrade level for display
  getCurrentUpgradeLevel(upgradeType) {
    const currentValue = this.miningScreen.mineUpgrades[upgradeType] || 0;

    switch (upgradeType) {
      case "timeReduction":
        return `${Math.floor(currentValue * 100)}% faster`;
      case "outputBonus":
        return `+${Math.floor(currentValue)} currency`;
      case "outputMultiplier":
        return `+${(currentValue * 100).toFixed(1)}% efficiency`;
      case "partDropRate":
        return `+${Math.floor(currentValue * 100)}% drop rate`;
      case "comboBonus":
        return `+${Math.floor(currentValue * 100)}% combo power`;
      case "criticalChance":
        return `${Math.floor(currentValue * 100)}% critical chance`;
      default:
        return "Level 0";
    }
  }

  // Get upgrade name for display
  getUpgradeName(symbol) {
    const names = {
      time_reduction: "Speed Boost (+5%)",
      output_bonus: "Output Boost (+2)",
      output_multiplier: "Efficiency (+0.5%)",
      part_drop_rate: "Lucky Strike (+2%)",
      combo_bonus: "Combo Power (+5%)",
      critical_chance: "Critical Hit (+2%)",
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

  // Create mine upgrade effect
  createMineUpgradeEffect(symbol) {
    // Create screen-wide effect
    this.miningScreen.triggerScreenShake(400);

    // Create particles at all machines
    this.miningScreen.machineManager.getAllMachines().forEach((machine) => {
      const container = this.miningScreen.container.querySelector(
        `[data-machine="${machine.id}"]`
      );
      if (container) {
        const rect = container.getBoundingClientRect();
        this.miningScreen.createParticleBurst(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
          8,
          symbol.color
        );
      }
    });

    // Show mine-wide upgrade message
    this.miningScreen.showTemporaryMessage(
      `Mine Upgrade Applied to All Machines! ${symbol.emoji}`,
      "success",
      4000
    );
  }

  // Check for upgrade-related achievements
  checkUpgradeAchievements(symbol) {
    const upgrades = this.miningScreen.mineUpgrades;

    // Check for maxed out upgrades
    if (upgrades.timeReduction >= 0.8) {
      this.miningScreen.showTemporaryMessage(
        "Achievement: Speed Demon!",
        "success"
      );
    }

    if (upgrades.outputBonus >= 50) {
      this.miningScreen.showTemporaryMessage(
        "Achievement: Production Master!",
        "success"
      );
    }

    if (upgrades.partDropRate >= 0.5) {
      this.miningScreen.showTemporaryMessage(
        "Achievement: Lucky Miner!",
        "success"
      );
    }

    // Check for balanced upgrades
    const nonZeroUpgrades = Object.values(upgrades).filter((v) => v > 0).length;
    if (nonZeroUpgrades >= 6) {
      this.miningScreen.showTemporaryMessage(
        "Achievement: Balanced Approach!",
        "success"
      );
    }

    // Check for win streaks
    if (this.totalWins >= 10) {
      this.miningScreen.showTemporaryMessage(
        "Achievement: Upgrade Collector!",
        "success"
      );
    }
  }

  // Get upgrade recommendations
  getUpgradeRecommendations() {
    const upgrades = this.miningScreen.mineUpgrades;
    const recommendations = [];

    // Recommend based on current situation
    if (
      this.miningScreen.activeMining.totalHits > 50 &&
      upgrades.comboBonus < 0.3
    ) {
      recommendations.push("combo_bonus");
    }

    if (
      this.miningScreen.mechaBuilder.hasMecha &&
      upgrades.timeReduction < 0.5
    ) {
      recommendations.push("time_reduction");
    }

    if (this.miningScreen.currency > 1000 && upgrades.outputMultiplier < 0.2) {
      recommendations.push("output_multiplier");
    }

    if (upgrades.partDropRate < 0.3) {
      recommendations.push("part_drop_rate");
    }

    return recommendations;
  }

  // Get upgrade efficiency rating
  getUpgradeEfficiency() {
    const upgrades = this.miningScreen.mineUpgrades;
    const totalSpent = this.totalSpins * (this.baseCost * 0.8); // Estimated average cost
    const totalBenefit = Object.values(upgrades).reduce(
      (sum, value) => sum + value * 100,
      0
    );

    return totalSpent > 0 ? ((totalBenefit / totalSpent) * 100).toFixed(1) : 0;
  }

  // Reset upgrade stats
  resetStats() {
    this.totalSpins = 0;
    this.totalWins = 0;
    this.consecutiveLosses = 0;
    this.upgradeHistory = [];
    this.updateUpgradeStats();
  }

  // Export upgrade data
  exportUpgradeData() {
    return {
      totalSpins: this.totalSpins,
      totalWins: this.totalWins,
      winRate: this.totalSpins > 0 ? this.totalWins / this.totalSpins : 0,
      upgradeHistory: this.upgradeHistory,
      currentUpgrades: { ...this.miningScreen.mineUpgrades },
      efficiency: this.getUpgradeEfficiency(),
      recommendations: this.getUpgradeRecommendations(),
    };
  }

  // Override hide to reset consecutive losses bonus
  hide() {
    super.hide();

    // Reset win chance if it was boosted
    if (this.consecutiveLosses >= 3) {
      this.configure({
        ...this.config,
        winChance: 0.35, // Reset to default
      });
    }
  }
}

// Make available globally
window.MachineUpgradeSlotMachine = MachineUpgradeSlotMachine;

console.log("🔧 Mine-Wide Upgrade Slot Machine class loaded!");
