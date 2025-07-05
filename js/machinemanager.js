// MachineManager - Handles individual mining machine logic
class MachineManager {
  constructor(miningScreen) {
    this.miningScreen = miningScreen;
    this.machines = [];
    this.autoMiningIntervals = [];
    this.machineCosts = [
      { shells: 0, monster_shells: 0 }, // Machine 1 (free)
      { shells: 25, monster_shells: 1 }, // Machine 2
      { shells: 50, monster_shells: 10 }, // Machine 3
      { shells: 500, monster_shells: 100 }, // Machine 4
    ];
  }

  // Initialize machines
  init() {
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
        upgradeSpinCost: 10,
        geodeDrawerOpen: false,
      },
    ];
  }

  // Get machine by ID
  getMachine(machineId) {
    return this.machines.find((m) => m.id === machineId);
  }

  // Get all machines
  getAllMachines() {
    return this.machines;
  }

  // Add energy to machine
  addEnergy(machineId, amount = 15) {
    const machine = this.getMachine(machineId);
    if (!machine || machine.isAutoMining) return false;

    machine.energyLevel = Math.min(
      machine.energyLevel + amount,
      machine.maxEnergy
    );
    machine.isActive = true;

    // Check if bar is full
    if (machine.energyLevel >= machine.maxEnergy) {
      this.completeMiningCycle(machine);
    }

    return true;
  }

  // Complete mining cycle
  completeMiningCycle(machine) {
    console.log(`💎 Mining cycle completed for ${machine.id}`);

    // Generate currency
    const baseCurrency =
      this.miningScreen.mineConfig.baseOutput *
      (this.miningScreen.hasMecha ? 2 : 1);
    const bonusCurrency = machine.upgrades.outputBonus;
    const multiplier =
      1 +
      machine.upgrades.outputMultiplier *
        Math.floor(this.miningScreen.currency / 100);
    const totalCurrency = Math.floor(
      (baseCurrency + bonusCurrency) * multiplier
    );

    this.miningScreen.currency += totalCurrency;

    // Check for geode drop
    const baseDropRate = this.miningScreen.mineId === "mine1" ? 0.5 : 0.05;
    const upgradedDropRate = Math.min(
      baseDropRate + machine.upgrades.partDropRate,
      1.0
    );

    if (Math.random() < upgradedDropRate) {
      machine.geodeCount++;
      this.miningScreen.showTemporaryMessage("Geode found! 💎", "success");
    }

    // Reset energy
    machine.energyLevel = 0;
    machine.isActive = false;

    // Update UI
    this.miningScreen.updateCurrencyDisplay();
    this.miningScreen.updateUI();

    // Play completion sound
    if (this.miningScreen.audioManager) {
      this.miningScreen.audioManager.playSound("mining-complete");
    }

    // Create completion effect
    this.miningScreen.createMiningCompleteEffect(machine.id);
  }

  // Toggle geode drawer
  toggleGeodeDrawer(machineId) {
    const machine = this.getMachine(machineId);
    if (!machine || machine.geodeCount === 0) return false;

    machine.geodeDrawerOpen = !machine.geodeDrawerOpen;
    return machine.geodeDrawerOpen;
  }

  // Remove geode from machine
  removeGeode(machineId) {
    const machine = this.getMachine(machineId);
    if (!machine || machine.geodeCount === 0) return false;

    machine.geodeCount--;

    // Close drawer if no more geodes
    if (machine.geodeCount === 0) {
      machine.geodeDrawerOpen = false;
    }

    return true;
  }

  // Check if machine can be purchased
  canPurchaseMachine(machineIndex) {
    if (this.machines.length > machineIndex) return false;

    const cost = this.machineCosts[machineIndex];
    return (
      this.miningScreen.currency >= cost.shells &&
      this.miningScreen.monsterCurrency >= cost.monster_shells
    );
  }

  // Purchase new machine
  purchaseMachine(machineIndex) {
    if (!this.canPurchaseMachine(machineIndex)) return false;

    const cost = this.machineCosts[machineIndex];

    // Deduct cost
    this.miningScreen.currency -= cost.shells;
    this.miningScreen.monsterCurrency -= cost.monster_shells;

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
    return true;
  }

  // Start auto-mining for machine
  startAutoMining(machine) {
    if (machine.isAutoMining) return;

    machine.isAutoMining = true;

    const baseInterval = 1000; // 1 second
    const timeReduction = machine.upgrades.timeReduction;
    const actualInterval = Math.max(baseInterval * (1 - timeReduction), 100);

    const interval = setInterval(() => {
      if (machine.energyLevel < machine.maxEnergy) {
        machine.energyLevel += 1; // 1% per second

        if (machine.energyLevel >= machine.maxEnergy) {
          this.completeMiningCycle(machine);
        }
      }
    }, actualInterval);

    this.autoMiningIntervals.push(interval);
  }

  // Start auto-mining for all machines
  startAutoMiningAll() {
    this.machines.forEach((machine) => {
      this.startAutoMining(machine);
    });
  }

  // Stop all auto-mining
  stopAutoMining() {
    this.autoMiningIntervals.forEach((interval) => clearInterval(interval));
    this.autoMiningIntervals = [];

    this.machines.forEach((machine) => {
      machine.isAutoMining = false;
    });
  }

  // Calculate machine upgrade cost
  getUpgradeCost(machineId) {
    const machine = this.getMachine(machineId);
    return machine ? machine.upgradeSpinCost : 0;
  }

  // Update machine upgrade cost after purchase
  updateUpgradeCost(machineId) {
    const machine = this.getMachine(machineId);
    if (machine) {
      machine.upgradeSpinCost = Math.floor(machine.upgradeSpinCost * 1.5);
    }
  }

  // Get machine purchase cost
  getMachineCost(machineIndex) {
    return this.machineCosts[machineIndex] || { shells: 0, monster_shells: 0 };
  }

  // Get available machines for purchase
  getAvailableMachines() {
    const available = [];
    for (let i = 1; i < 4; i++) {
      if (this.machines.length <= i) {
        available.push({
          index: i,
          cost: this.machineCosts[i],
          canAfford: this.canPurchaseMachine(i),
        });
      }
    }
    return available;
  }

  // Apply upgrade to machine
  applyUpgrade(machineId, upgradeType, value) {
    const machine = this.getMachine(machineId);
    if (!machine) return false;

    switch (upgradeType) {
      case "timeReduction":
        machine.upgrades.timeReduction = Math.min(
          machine.upgrades.timeReduction + value,
          0.95
        );
        break;
      case "outputBonus":
        machine.upgrades.outputBonus += value;
        break;
      case "outputMultiplier":
        machine.upgrades.outputMultiplier += value;
        break;
      case "partDropRate":
        machine.upgrades.partDropRate = Math.min(
          machine.upgrades.partDropRate + value,
          1.0
        );
        break;
      default:
        return false;
    }

    // Restart auto-mining if active to apply new time reduction
    if (machine.isAutoMining) {
      this.stopAutoMining();
      this.startAutoMiningAll();
    }

    return true;
  }

  // Get machine statistics
  getMachineStats(machineId) {
    const machine = this.getMachine(machineId);
    if (!machine) return null;

    return {
      energyLevel: machine.energyLevel,
      maxEnergy: machine.maxEnergy,
      isActive: machine.isActive,
      isAutoMining: machine.isAutoMining,
      geodeCount: machine.geodeCount,
      geodeDrawerOpen: machine.geodeDrawerOpen,
      upgrades: { ...machine.upgrades },
      upgradeCost: machine.upgradeSpinCost,
    };
  }

  // Reset all machines
  reset() {
    this.stopAutoMining();
    this.machines = [];
    this.init();
  }

  // Cleanup
  destroy() {
    this.stopAutoMining();
    this.machines = [];
  }
}

// Make available globally
window.MachineManager = MachineManager;

console.log("⚙️ MachineManager class loaded!");
