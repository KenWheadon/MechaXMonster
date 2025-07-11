// Enhanced GeodeSystem - Per-click drops with varied rewards
class GeodeSystem {
  constructor(miningScreen) {
    this.miningScreen = miningScreen;
    this.nextPartIndex = 0; // For sequential part drops
    this.geodesFound = 0;
    this.geodesOpened = 0;
    this.rareFinds = 0;

    // Enhanced reward pools
    this.rewardPools = {
      common: {
        weight: 60,
        rewards: [
          { type: "currency", minAmount: 10, maxAmount: 50 },
          { type: "currency", minAmount: 5, maxAmount: 25 },
        ],
      },
      uncommon: {
        weight: 25,
        rewards: [
          { type: "currency", minAmount: 50, maxAmount: 150 },
          { type: "upgrade", upgradeType: "random", value: 0.01 },
          { type: "machine_boost", duration: 30000, multiplier: 1.5 },
        ],
      },
      rare: {
        weight: 12,
        rewards: [
          { type: "part", guaranteed: true },
          { type: "currency", minAmount: 100, maxAmount: 300 },
          { type: "upgrade", upgradeType: "best", value: 0.05 },
          { type: "machine_boost", duration: 60000, multiplier: 2.0 },
        ],
      },
      legendary: {
        weight: 3,
        rewards: [
          { type: "part", guaranteed: true },
          { type: "currency", minAmount: 500, maxAmount: 1000 },
          { type: "upgrade", upgradeType: "all", value: 0.02 },
          { type: "machine_boost", duration: 120000, multiplier: 3.0 },
          { type: "special", effect: "mega_combo" },
        ],
      },
    };
  }

  // Initialize geode system
  init() {
    this.nextPartIndex = 0;
    this.geodesFound = 0;
    this.geodesOpened = 0;
    this.rareFinds = 0;
  }

  // Generate geode drop on mining hit (called from timing system)
  generateGeodeOnHit(hitResult, machineId) {
    if (!hitResult || !machineId) return false;

    const machine = this.miningScreen.machineManager.getMachine(machineId);
    if (!machine) return false;

    // Calculate drop rate based on hit quality and upgrades
    const baseDropRate = this.getBaseDropRate(hitResult);
    const upgradeBonus = this.miningScreen.mineUpgrades.partDropRate;
    const comboBonus = this.miningScreen.activeMining.currentCombo * 0.001;
    const criticalBonus = hitResult.criticalHit ? 0.05 : 0;

    const totalDropRate =
      baseDropRate + upgradeBonus + comboBonus + criticalBonus;

    if (Math.random() < totalDropRate) {
      const geodeRarity = this.determineGeodeRarity(hitResult);
      machine.geodeCount++;
      machine.geodeRarity = geodeRarity; // Store rarity for visual effects

      this.geodesFound++;

      // Show different messages based on rarity
      this.showGeodeFoundMessage(geodeRarity);

      // Create rarity-specific effects
      this.createGeodeFoundEffect(machineId, geodeRarity);

      return true;
    }

    return false;
  }

  // Get base drop rate based on hit quality
  getBaseDropRate(hitResult) {
    switch (hitResult.type) {
      case "perfect":
        return 0.08; // 8% for perfect hits
      case "good":
        return 0.05; // 5% for good hits
      case "miss":
        return 0.02; // 2% even for misses
      default:
        return 0.05;
    }
  }

  // Determine geode rarity based on hit result and luck
  determineGeodeRarity(hitResult) {
    let rarityBonus = 0;

    // Perfect hits have better rarity chances
    if (hitResult.type === "perfect") {
      rarityBonus += 0.1;
    }

    // Critical hits boost rarity
    if (hitResult.criticalHit) {
      rarityBonus += 0.05;
    }

    // High combos improve rarity
    if (this.miningScreen.activeMining.currentCombo > 10) {
      rarityBonus += 0.02;
    }

    const rand = Math.random() - rarityBonus;

    if (rand < 0.03) return "legendary";
    if (rand < 0.15) return "rare";
    if (rand < 0.4) return "uncommon";
    return "common";
  }

  // Show geode found message based on rarity
  showGeodeFoundMessage(rarity) {
    const messages = {
      common: "Geode found! 💎",
      uncommon: "Shiny geode found! ✨💎",
      rare: "Rare geode found! 🌟💎",
      legendary: "LEGENDARY GEODE! 🏆💎✨",
    };

    const colors = {
      common: "info",
      uncommon: "success",
      rare: "warning",
      legendary: "error", // Uses error color (usually red/gold)
    };

    this.miningScreen.showTemporaryMessage(
      messages[rarity] || messages.common,
      colors[rarity] || colors.common
    );
  }

  // Create geode found effect based on rarity
  createGeodeFoundEffect(machineId, rarity) {
    const container = this.miningScreen.container.querySelector(
      `[data-machine="${machineId}"]`
    );
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const colors = {
      common: "rgba(100, 149, 237, 0.8)",
      uncommon: "rgba(50, 205, 50, 0.8)",
      rare: "rgba(255, 215, 0, 0.8)",
      legendary: "rgba(255, 20, 147, 0.9)",
    };

    const particleCount = {
      common: 6,
      uncommon: 10,
      rare: 15,
      legendary: 25,
    };

    this.miningScreen.createParticleBurst(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      particleCount[rarity] || 6,
      colors[rarity] || colors.common
    );

    // Legendary geodes get extra screen shake
    if (rarity === "legendary") {
      this.miningScreen.triggerScreenShake(500);
    }
  }

  // Open an individual geode with enhanced rewards
  openGeode(machineId) {
    const machine = this.miningScreen.machineManager.getMachine(machineId);
    if (!machine || machine.geodeCount === 0) return null;

    // Remove geode from machine
    if (!this.miningScreen.machineManager.removeGeode(machineId)) {
      return null;
    }

    // Generate enhanced reward
    const rarity = machine.geodeRarity || "common";
    const reward = this.generateEnhancedGeodeReward(rarity);

    // Apply reward
    this.applyEnhancedGeodeReward(reward);

    // Update stats
    this.geodesOpened++;
    if (rarity === "rare" || rarity === "legendary") {
      this.rareFinds++;
    }

    // Play collection sound based on rarity
    if (this.miningScreen.audioManager) {
      this.miningScreen.audioManager.playSound(`geode-open-${rarity}`);
    }

    return reward;
  }

  // Generate enhanced geode reward based on rarity
  generateEnhancedGeodeReward(rarity = "common") {
    const pool = this.rewardPools[rarity];
    if (!pool) return this.generateEnhancedGeodeReward("common");

    const rewardIndex = Math.floor(Math.random() * pool.rewards.length);
    const rewardTemplate = pool.rewards[rewardIndex];

    const reward = {
      rarity: rarity,
      ...rewardTemplate,
    };

    // Process specific reward types
    switch (reward.type) {
      case "currency":
        reward.amount = Math.floor(
          Math.random() * (reward.maxAmount - reward.minAmount + 1) +
            reward.minAmount
        );
        reward.message = `Found ${reward.amount} ${this.miningScreen.mineConfig.currency}!`;
        break;

      case "part":
        reward.partName = this.getNextNeededPart();
        reward.message = reward.partName
          ? `Mecha Part Found: ${reward.partName.toUpperCase()}!`
          : `Bonus ${this.miningScreen.mineConfig.currency}: +200`;
        break;

      case "upgrade":
        reward.upgradeType = this.selectUpgradeType(reward.upgradeType);
        reward.message = `Mine Upgrade Found: ${this.getUpgradeDisplayName(
          reward.upgradeType
        )}!`;
        break;

      case "machine_boost":
        reward.message = `Machine Boost Found: ${
          reward.multiplier
        }x for ${Math.floor(reward.duration / 1000)}s!`;
        break;

      case "special":
        reward.message = this.getSpecialEffectMessage(reward.effect);
        break;

      default:
        reward.message = "Mystery reward found!";
    }

    return reward;
  }

  // Get next needed part or return null if complete
  getNextNeededPart() {
    const missingParts = this.miningScreen.partsInventory.getMissingParts();
    if (missingParts.length === 0) return null;

    // Try to give parts in order
    const mechaType = this.miningScreen.mineConfig.mecha;
    for (let i = 1; i <= 6; i++) {
      const partName = `${mechaType}-${i}`;
      if (missingParts.includes(partName)) {
        return partName;
      }
    }

    // Fallback to random missing part
    return missingParts[Math.floor(Math.random() * missingParts.length)];
  }

  // Select upgrade type based on strategy
  selectUpgradeType(strategy) {
    const availableUpgrades = [
      "timeReduction",
      "outputBonus",
      "outputMultiplier",
      "partDropRate",
      "comboBonus",
      "criticalChance",
    ];

    switch (strategy) {
      case "random":
        return availableUpgrades[
          Math.floor(Math.random() * availableUpgrades.length)
        ];

      case "best":
        // Return the upgrade with the lowest current value
        const upgrades = this.miningScreen.mineUpgrades;
        return availableUpgrades.reduce((best, current) =>
          (upgrades[current] || 0) < (upgrades[best] || 0) ? current : best
        );

      case "all":
        return "all"; // Special case for applying to all upgrades

      default:
        return strategy; // Direct upgrade type
    }
  }

  // Get display name for upgrade type
  getUpgradeDisplayName(upgradeType) {
    const names = {
      timeReduction: "Speed Boost",
      outputBonus: "Output Boost",
      outputMultiplier: "Efficiency",
      partDropRate: "Lucky Strike",
      comboBonus: "Combo Power",
      criticalChance: "Critical Hit",
      all: "All Upgrades",
    };
    return names[upgradeType] || upgradeType;
  }

  // Get special effect message
  getSpecialEffectMessage(effect) {
    const messages = {
      mega_combo: "Mega Combo Activated: Next 10 hits are guaranteed perfect!",
      time_warp: "Time Warp: All machines work 5x faster for 30 seconds!",
      golden_touch: "Golden Touch: Next 5 geodes are guaranteed legendary!",
      part_magnet: "Part Magnet: All missing parts found instantly!",
    };
    return messages[effect] || "Special effect activated!";
  }

  // Apply enhanced geode reward
  applyEnhancedGeodeReward(reward) {
    switch (reward.type) {
      case "currency":
        this.miningScreen.currency += reward.amount;
        this.miningScreen.updateCurrencyDisplay();
        break;

      case "part":
        if (reward.partName) {
          this.miningScreen.partsInventory.collectPart(
            reward.partName,
            "geode"
          );
          this.miningScreen.checkMechaBuildability();
        } else {
          // Give bonus currency if no parts needed
          this.miningScreen.currency += 200;
          this.miningScreen.updateCurrencyDisplay();
        }
        break;

      case "upgrade":
        this.applyUpgradeReward(reward);
        break;

      case "machine_boost":
        this.applyMachineBoost(reward);
        break;

      case "special":
        this.applySpecialEffect(reward);
        break;
    }

    // Show reward message with rarity styling
    const messageType = this.getRarityMessageType(reward.rarity);
    this.miningScreen.showTemporaryMessage(reward.message, messageType, 4000);

    // Create reward-specific effects
    this.createRewardEffect(reward);
  }

  // Apply upgrade reward
  applyUpgradeReward(reward) {
    if (reward.upgradeType === "all") {
      // Apply to all upgrades
      Object.keys(this.miningScreen.mineUpgrades).forEach((upgradeType) => {
        this.miningScreen.applyMineUpgrade(upgradeType, reward.value);
      });
    } else {
      // Apply to specific upgrade
      this.miningScreen.applyMineUpgrade(reward.upgradeType, reward.value);
    }
  }

  // Apply machine boost
  applyMachineBoost(reward) {
    this.miningScreen.machineManager.boostAllMachinesEfficiency(
      reward.multiplier - 1, // Convert multiplier to boost amount
      reward.duration
    );
  }

  // Apply special effect
  applySpecialEffect(reward) {
    switch (reward.effect) {
      case "mega_combo":
        this.miningScreen.activeMining.guaranteedPerfectHits = 10;
        break;

      case "time_warp":
        this.applyTimeWarp(30000); // 30 seconds
        break;

      case "golden_touch":
        this.guaranteedLegendaryGeodes = 5;
        break;

      case "part_magnet":
        this.applyPartMagnet();
        break;
    }
  }

  // Apply time warp effect
  applyTimeWarp(duration) {
    const originalInterval = 1000;
    const warpInterval = 200; // 5x faster

    // Store original auto-mining intervals
    this.miningScreen.machineManager.stopAutoMining();

    // Start super-fast auto-mining
    this.miningScreen.machineManager.getAllMachines().forEach((machine) => {
      if (machine.isAutoMining) {
        const interval = setInterval(() => {
          if (machine.energyLevel < machine.maxEnergy) {
            machine.energyLevel += 5; // Faster energy gain
            if (machine.energyLevel >= machine.maxEnergy) {
              this.miningScreen.machineManager.completeMiningCycle(machine);
            }
          }
        }, warpInterval);

        setTimeout(() => {
          clearInterval(interval);
          // Restart normal auto-mining
          this.miningScreen.machineManager.startAutoMiningAll();
        }, duration);
      }
    });
  }

  // Apply part magnet effect
  applyPartMagnet() {
    const missingParts = this.miningScreen.partsInventory.getMissingParts();
    missingParts.forEach((partName) => {
      this.miningScreen.partsInventory.collectPart(partName, "part_magnet");
    });
    this.miningScreen.checkMechaBuildability();
  }

  // Get message type based on rarity
  getRarityMessageType(rarity) {
    const types = {
      common: "info",
      uncommon: "success",
      rare: "warning",
      legendary: "error",
    };
    return types[rarity] || "info";
  }

  // Create reward-specific visual effects
  createRewardEffect(reward) {
    const colors = {
      currency: "rgba(255, 215, 0, 0.8)",
      part: "rgba(0, 255, 136, 0.8)",
      upgrade: "rgba(138, 43, 226, 0.8)",
      machine_boost: "rgba(255, 69, 0, 0.8)",
      special: "rgba(255, 20, 147, 0.9)",
    };

    // Create screen-wide effect for rare rewards
    if (reward.rarity === "rare" || reward.rarity === "legendary") {
      this.miningScreen.triggerScreenShake(300);
    }

    // Create particles based on reward type
    const particleColor = colors[reward.type] || colors.currency;
    const particleCount = reward.rarity === "legendary" ? 20 : 10;

    // Create particles at center of screen
    this.miningScreen.createParticleBurst(
      window.innerWidth / 2,
      window.innerHeight / 2,
      particleCount,
      particleColor
    );
  }

  // Render enhanced geode drawer content
  renderGeodeDrawer(machine) {
    if (machine.geodeCount === 0) {
      return '<div class="no-geodes">No geodes collected</div>';
    }

    const mechaType = this.miningScreen.mineConfig.mecha;
    let geodeHtml = "";

    for (let i = 0; i < machine.geodeCount; i++) {
      const rarity = machine.geodeRarity || "common";
      const rarityClass = `geode-${rarity}`;

      geodeHtml += `
        <div class="geode-item ${rarityClass}" data-geode="${i}" data-machine="${
        machine.id
      }">
          <img src="images/geode-${mechaType}-${rarity}.png" alt="${rarity} Geode" />
          <div class="geode-rarity-indicator ${rarityClass}">
            ${this.getRaritySymbol(rarity)}
          </div>
          <div class="geode-click-overlay">Click!</div>
          <div class="geode-glow ${rarityClass}"></div>
        </div>
      `;
    }

    return geodeHtml;
  }

  // Get rarity symbol for display
  getRaritySymbol(rarity) {
    const symbols = {
      common: "💎",
      uncommon: "✨",
      rare: "🌟",
      legendary: "🏆",
    };
    return symbols[rarity] || symbols.common;
  }

  // Handle enhanced geode click from UI
  handleGeodeClick(geodeElement) {
    const machineId = geodeElement.dataset.machine;
    const reward = this.openGeode(machineId);

    if (reward) {
      // Remove clicked geode element with animation
      geodeElement.classList.add("opening");

      setTimeout(() => {
        geodeElement.remove();
      }, 500);

      // Update machine UI
      this.miningScreen.updateUI();

      // Create enhanced visual effect
      this.createGeodeOpenEffect(geodeElement, reward);
    }
  }

  // Create enhanced visual effect for geode opening
  createGeodeOpenEffect(geodeElement, reward) {
    const rect = geodeElement.getBoundingClientRect();
    const colors = {
      common: "rgba(100, 149, 237, 0.8)",
      uncommon: "rgba(50, 205, 50, 0.8)",
      rare: "rgba(255, 215, 0, 0.8)",
      legendary: "rgba(255, 20, 147, 0.9)",
    };

    const particleCount = {
      common: 8,
      uncommon: 12,
      rare: 16,
      legendary: 24,
    };

    this.miningScreen.createParticleBurst(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      particleCount[reward.rarity] || 8,
      colors[reward.rarity] || colors.common
    );

    // Add floating text effect
    this.createFloatingText(
      rect.left + rect.width / 2,
      rect.top,
      reward.message,
      colors[reward.rarity] || colors.common
    );
  }

  // Create floating text effect
  createFloatingText(x, y, text, color) {
    const floatingText = document.createElement("div");
    floatingText.className = "floating-reward-text";
    floatingText.textContent = text;
    floatingText.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      color: ${color};
      font-weight: bold;
      font-size: 1.2em;
      pointer-events: none;
      z-index: 1000;
      transform: translateX(-50%);
      animation: floatUp 2s ease-out forwards;
    `;

    document.body.appendChild(floatingText);

    setTimeout(() => {
      floatingText.remove();
    }, 2000);
  }

  // Get geode statistics
  getGeodeStats() {
    const totalGeodes = this.miningScreen.machineManager
      .getAllMachines()
      .reduce((sum, machine) => sum + machine.geodeCount, 0);

    return {
      totalGeodes,
      geodesFound: this.geodesFound,
      geodesOpened: this.geodesOpened,
      rareFinds: this.rareFinds,
      openRate:
        this.geodesFound > 0
          ? ((this.geodesOpened / this.geodesFound) * 100).toFixed(1)
          : 0,
      rareRate:
        this.geodesOpened > 0
          ? ((this.rareFinds / this.geodesOpened) * 100).toFixed(1)
          : 0,
      machines: this.miningScreen.machineManager
        .getAllMachines()
        .map((machine) => ({
          id: machine.id,
          geodeCount: machine.geodeCount,
          rarity: machine.geodeRarity || "common",
        })),
    };
  }

  // Purchase geode from merchant (enhanced)
  purchaseGeodeFromMerchant(cost) {
    if (this.miningScreen.currency < cost) return false;

    this.miningScreen.currency -= cost;

    // Merchant geodes have better rarity chances
    const rarity = this.determineMerchantGeodeRarity();
    const reward = this.generateEnhancedGeodeReward(rarity);

    this.applyEnhancedGeodeReward(reward);
    this.geodesFound++;
    this.geodesOpened++;

    return reward;
  }

  // Determine merchant geode rarity (better odds than mining)
  determineMerchantGeodeRarity() {
    const rand = Math.random();

    if (rand < 0.05) return "legendary";
    if (rand < 0.2) return "rare";
    if (rand < 0.5) return "uncommon";
    return "common";
  }

  // Auto-open geodes feature
  autoOpenGeodes(machineId) {
    const machine = this.miningScreen.machineManager.getMachine(machineId);
    if (!machine || machine.geodeCount === 0) return;

    let opened = 0;
    const maxOpen = Math.min(machine.geodeCount, 5); // Open up to 5 at once

    const openNext = () => {
      if (opened < maxOpen && machine.geodeCount > 0) {
        const reward = this.openGeode(machineId);
        if (reward) {
          opened++;
          setTimeout(openNext, 200); // 200ms delay between opens
        }
      }
    };

    openNext();
  }

  // Boost geode drop rates temporarily
  boostGeodeDropRates(multiplier = 2, duration = 30000) {
    const originalDropRate = this.miningScreen.mineUpgrades.partDropRate;
    this.miningScreen.mineUpgrades.partDropRate *= multiplier;

    setTimeout(() => {
      this.miningScreen.mineUpgrades.partDropRate = originalDropRate;
    }, duration);

    this.miningScreen.showTemporaryMessage(
      `Geode drop rates boosted ${multiplier}x for ${duration / 1000}s!`,
      "success"
    );
  }

  // Check for geode-related achievements
  checkGeodeAchievements() {
    if (this.geodesFound >= 100) {
      this.miningScreen.showTemporaryMessage(
        "Achievement: Geode Hunter!",
        "success"
      );
    }

    if (this.rareFinds >= 10) {
      this.miningScreen.showTemporaryMessage(
        "Achievement: Rare Collector!",
        "success"
      );
    }

    if (this.geodesOpened >= 50) {
      this.miningScreen.showTemporaryMessage(
        "Achievement: Geode Cracker!",
        "success"
      );
    }
  }

  // Get geode value estimation
  getGeodeValue(rarity) {
    const values = {
      common: 25,
      uncommon: 75,
      rare: 200,
      legendary: 500,
    };
    return values[rarity] || values.common;
  }

  // Export geode data
  exportGeodeData() {
    return {
      stats: this.getGeodeStats(),
      rewardPools: this.rewardPools,
      nextPartIndex: this.nextPartIndex,
      guaranteedLegendaryGeodes: this.guaranteedLegendaryGeodes || 0,
    };
  }

  // Reset geode system
  reset() {
    this.nextPartIndex = 0;
    this.geodesFound = 0;
    this.geodesOpened = 0;
    this.rareFinds = 0;
    this.guaranteedLegendaryGeodes = 0;

    // Clear all geodes from machines
    this.miningScreen.machineManager.getAllMachines().forEach((machine) => {
      machine.geodeCount = 0;
      machine.geodeDrawerOpen = false;
      machine.geodeRarity = "common";
    });
  }

  // Cleanup
  destroy() {
    this.reset();
  }
}

// Add CSS for enhanced geode effects
const enhancedGeodeCSS = `
  .geode-item {
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .geode-item:hover {
    transform: scale(1.1);
  }

  .geode-item.opening {
    animation: geodeOpen 0.5s ease-out forwards;
  }

  @keyframes geodeOpen {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.3); opacity: 0.8; }
    100% { transform: scale(0); opacity: 0; }
  }

  .geode-rarity-indicator {
    position: absolute;
    top: -5px;
    right: -5px;
    font-size: 0.8em;
    padding: 2px 4px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.7);
  }

  .geode-rarity-indicator.geode-common { color: #6495ED; }
  .geode-rarity-indicator.geode-uncommon { color: #32CD32; }
  .geode-rarity-indicator.geode-rare { color: #FFD700; }
  .geode-rarity-indicator.geode-legendary { color: #FF1493; }

  .geode-glow {
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    border-radius: 50%;
    opacity: 0.5;
    animation: geodeGlow 2s ease-in-out infinite alternate;
  }

  .geode-glow.geode-common { background: radial-gradient(circle, rgba(100, 149, 237, 0.3) 0%, transparent 70%); }
  .geode-glow.geode-uncommon { background: radial-gradient(circle, rgba(50, 205, 50, 0.3) 0%, transparent 70%); }
  .geode-glow.geode-rare { background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%); }
  .geode-glow.geode-legendary { background: radial-gradient(circle, rgba(255, 20, 147, 0.3) 0%, transparent 70%); }

  @keyframes geodeGlow {
    from { transform: scale(1); opacity: 0.3; }
    to { transform: scale(1.1); opacity: 0.6; }
  }

  .floating-reward-text {
    font-family: 'Arial', sans-serif;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }

  @keyframes floatUp {
    0% {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    100% {
      transform: translateX(-50%) translateY(-50px);
      opacity: 0;
    }
  }
`;

// Inject the CSS
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.textContent = enhancedGeodeCSS;
  document.head.appendChild(styleElement);
}

// Make available globally
window.GeodeSystem = GeodeSystem;

console.log("💎 Enhanced GeodeSystem class loaded!");
