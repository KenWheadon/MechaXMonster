// GeodeSystem - Handles geode collection and opening mechanics
class GeodeSystem {
  constructor(miningScreen) {
    this.miningScreen = miningScreen;
    this.nextPartIndex = 0; // For sequential part drops
  }

  // Initialize geode system
  init() {
    this.nextPartIndex = 0;
  }

  // Generate geode drop for a machine
  generateGeodeDrop(machineId, baseDropRate = 0.05) {
    const machine = this.miningScreen.machineManager.getMachine(machineId);
    if (!machine) return false;

    const upgradedDropRate = Math.min(
      baseDropRate + machine.upgrades.partDropRate,
      1.0
    );

    if (Math.random() < upgradedDropRate) {
      machine.geodeCount++;
      return true;
    }

    return false;
  }

  // Open an individual geode
  openGeode(machineId) {
    const machine = this.miningScreen.machineManager.getMachine(machineId);
    if (!machine || machine.geodeCount === 0) return null;

    // Remove geode from machine
    if (!this.miningScreen.machineManager.removeGeode(machineId)) {
      return null;
    }

    // Generate reward
    const reward = this.generateGeodeReward();

    // Apply reward
    this.applyGeodeReward(reward);

    // Play collection sound
    if (this.miningScreen.audioManager) {
      this.miningScreen.audioManager.playSound("geode-open");
    }

    return reward;
  }

  // Generate reward from geode opening
  generateGeodeReward() {
    const dropRate = this.miningScreen.mineId === "mine1" ? 0.25 : 0.05;
    const mechaType = this.miningScreen.mineConfig.mecha;
    const currencyType = this.miningScreen.mineConfig.currency;

    if (Math.random() < dropRate) {
      // Try to give sequential part
      const partName = `${mechaType}-${(this.nextPartIndex % 6) + 1}`;

      // Only give part if we don't already have it
      if (!this.miningScreen.collectedParts.includes(partName)) {
        this.nextPartIndex++;
        return {
          type: "part",
          partName: partName,
          message: `Mecha Part Found: ${partName.toUpperCase()}!`,
        };
      }
    }

    // Give bonus currency instead
    const bonus = Math.floor(Math.random() * 20) + 5;
    return {
      type: "currency",
      amount: bonus,
      message: `Bonus ${currencyType}: +${bonus}`,
    };
  }

  // Apply geode reward to game state
  applyGeodeReward(reward) {
    switch (reward.type) {
      case "part":
        this.miningScreen.collectedParts.push(reward.partName);
        this.miningScreen.updatePartsDisplay();
        this.miningScreen.checkMechaBuildability();
        break;

      case "currency":
        this.miningScreen.currency += reward.amount;
        this.miningScreen.updateCurrencyDisplay();
        break;
    }

    // Show reward message
    this.miningScreen.showTemporaryMessage(reward.message, "success");
  }

  // Render geode drawer content
  renderGeodeDrawer(machine) {
    if (machine.geodeCount === 0) {
      return '<div class="no-geodes">No geodes collected</div>';
    }

    const mechaType = this.miningScreen.mineConfig.mecha;
    let geodeHtml = "";
    for (let i = 0; i < machine.geodeCount; i++) {
      geodeHtml += `
        <div class="geode-item" data-geode="${i}" data-machine="${machine.id}">
          <img src="images/geode-${mechaType}.png" alt="Geode" />
          <div class="geode-click-overlay">Click!</div>
        </div>
      `;
    }
    return geodeHtml;
  }

  // Handle geode click from UI
  handleGeodeClick(geodeElement) {
    const machineId = geodeElement.dataset.machine;
    const reward = this.openGeode(machineId);

    if (reward) {
      // Remove clicked geode element
      geodeElement.remove();

      // Update machine UI
      this.miningScreen.updateUI();

      // Create visual effect
      this.createGeodeOpenEffect(geodeElement);
    }
  }

  // Create visual effect for geode opening
  createGeodeOpenEffect(geodeElement) {
    const rect = geodeElement.getBoundingClientRect();
    this.miningScreen.createParticleBurst(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      8,
      "rgba(255, 215, 0, 0.8)"
    );
  }

  // Get geode count for machine
  getGeodeCount(machineId) {
    const machine = this.miningScreen.machineManager.getMachine(machineId);
    return machine ? machine.geodeCount : 0;
  }

  // Check if machine has geodes
  hasGeodes(machineId) {
    return this.getGeodeCount(machineId) > 0;
  }

  // Toggle geode drawer for machine
  toggleGeodeDrawer(machineId) {
    return this.miningScreen.machineManager.toggleGeodeDrawer(machineId);
  }

  // Get geode drawer state
  isGeodeDrawerOpen(machineId) {
    const machine = this.miningScreen.machineManager.getMachine(machineId);
    return machine ? machine.geodeDrawerOpen : false;
  }

  // Add geodes to machine (for debugging/testing)
  addGeodes(machineId, count = 1) {
    const machine = this.miningScreen.machineManager.getMachine(machineId);
    if (machine) {
      machine.geodeCount += count;
      return true;
    }
    return false;
  }

  // Calculate drop rate for machine
  calculateDropRate(machineId, baseRate = 0.05) {
    const machine = this.miningScreen.machineManager.getMachine(machineId);
    if (!machine) return baseRate;

    return Math.min(baseRate + machine.upgrades.partDropRate, 1.0);
  }

  // Get geode statistics
  getGeodeStats() {
    const totalGeodes = this.miningScreen.machineManager
      .getAllMachines()
      .reduce((sum, machine) => sum + machine.geodeCount, 0);

    return {
      totalGeodes,
      nextPartIndex: this.nextPartIndex,
      machines: this.miningScreen.machineManager
        .getAllMachines()
        .map((machine) => ({
          id: machine.id,
          geodeCount: machine.geodeCount,
          dropRate: this.calculateDropRate(machine.id),
        })),
    };
  }

  // Reset geode system
  reset() {
    this.nextPartIndex = 0;

    // Clear all geodes from machines
    this.miningScreen.machineManager.getAllMachines().forEach((machine) => {
      machine.geodeCount = 0;
      machine.geodeDrawerOpen = false;
    });
  }

  // Cleanup
  destroy() {
    this.reset();
  }
}

// Make available globally
window.GeodeSystem = GeodeSystem;

console.log("💎 GeodeSystem class loaded!");
