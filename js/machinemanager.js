// Enhanced MachineManager - Works with per-mine upgrades instead of per-machine
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
        geodeDrawerOpen: false,
        // Remove per-machine upgrades - now handled at mine level
        efficiency: 1.0, // Base efficiency multiplier
        lastActiveTime: 0,
        totalMined: 0,
        perfectHits: 0,
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

  // Add energy to machine with enhanced mechanics
  addEnergy(machineId, amount = 15) {
    const machine = this.getMachine(machineId);
    if (!machine || machine.isAutoMining) return false;

    // Apply mine-wide upgrades to energy gain
    const mineUpgrades = this.miningScreen.mineUpgrades;
    const upgradeMultiplier = 1 + mineUpgrades.outputBonus * 0.1;
    const enhancedAmount = Math.floor(amount * upgradeMultiplier);

    machine.energyLevel = Math.min(
      machine.energyLevel + enhancedAmount,
      machine.maxEnergy
    );
    machine.isActive = true;
    machine.lastActiveTime = Date.now();

    // Check if bar is full
    if (machine.energyLevel >= machine.maxEnergy) {
      this.completeMiningCycle(machine);
    }

    return true;
  }

  // Enhanced mining cycle completion
  completeMiningCycle(machine) {
    console.log(`💎 Enhanced mining cycle completed for ${machine.id}`);

    // Get mine-wide upgrades
    const mineUpgrades = this.miningScreen.mineUpgrades;

    // Generate currency with mine-wide bonuses
    const baseCurrency = this.miningScreen.mineConfig.baseOutput;
    const mechaBonus = this.miningScreen.mechaBuilder.hasMecha ? 2 : 1;
    const upgradeBonus = mineUpgrades.outputBonus;
    const multiplier =
      1 +
      mineUpgrades.outputMultiplier *
        Math.floor(this.miningScreen.currency / 100);
    const efficiencyBonus = machine.efficiency;

    const totalCurrency = Math.floor(
      (baseCurrency * mechaBonus + upgradeBonus) * multiplier * efficiencyBonus
    );

    this.miningScreen.currency += totalCurrency;
    machine.totalMined += totalCurrency;

    // Enhanced geode drop calculation
    const baseDropRate = this.miningScreen.mineId === "mine1" ? 0.05 : 0.03;
    const upgradedDropRate = Math.min(
      baseDropRate + mineUpgrades.partDropRate,
      0.95 // Cap at 95%
    );

    if (Math.random() < upgradedDropRate) {
      machine.geodeCount++;
      this.miningScreen.showTemporaryMessage("Geode found! 💎", "success");
    }

    // Reset energy and state
    machine.energyLevel = 0;
    machine.isActive = false;

    // Update machine efficiency based on performance
    this.updateMachineEfficiency(machine);

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

  // Update machine efficiency based on performance
  updateMachineEfficiency(machine) {
    const timeSinceLastActive = Date.now() - machine.lastActiveTime;
    const optimalTime = 2000; // 2 seconds is optimal

    if (timeSinceLastActive < optimalTime) {
      // Reward quick successive mining
      machine.efficiency = Math.min(machine.efficiency + 0.05, 2.0);
    } else if (timeSinceLastActive > optimalTime * 3) {
      // Penalize long breaks
      machine.efficiency = Math.max(machine.efficiency - 0.02, 0.5);
    }
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
      geodeDrawerOpen: false,
      efficiency: 1.0,
      lastActiveTime: 0,
      totalMined: 0,
      perfectHits: 0,
    };

    this.machines.push(newMachine);

    // If mecha is built, start auto-mining for new machine
    if (this.miningScreen.mechaBuilder.hasMecha) {
      this.startAutoMining(newMachine);
    }

    return true;
  }

  // Enhanced auto-mining with mine-wide upgrades
  startAutoMining(machine) {
    if (machine.isAutoMining) return;

    machine.isAutoMining = true;

    // Apply mine-wide time reduction
    const mineUpgrades = this.miningScreen.mineUpgrades;
    const baseInterval = 1000; // 1 second base
    const timeReduction = mineUpgrades.timeReduction;
    const actualInterval = Math.max(baseInterval * (1 - timeReduction), 100);

    const interval = setInterval(() => {
      if (machine.energyLevel < machine.maxEnergy) {
        // Auto-mining gains energy faster but with less efficiency
        const energyGain = Math.floor(2 + mineUpgrades.outputBonus * 0.5);
        machine.energyLevel = Math.min(
          machine.energyLevel + energyGain,
          machine.maxEnergy
        );

        if (machine.energyLevel >= machine.maxEnergy) {
          // Reduce efficiency for auto-mining
          machine.efficiency = Math.max(machine.efficiency * 0.9, 0.7);
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

  // Get machine statistics with enhanced metrics
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
      efficiency: machine.efficiency,
      totalMined: machine.totalMined,
      perfectHits: machine.perfectHits,
      lastActiveTime: machine.lastActiveTime,
      // Mine-wide upgrades affect all machines
      appliedUpgrades: { ...this.miningScreen.mineUpgrades },
    };
  }

  // Get all machines statistics
  getAllMachineStats() {
    return this.machines.map((machine) => this.getMachineStats(machine.id));
  }

  // Calculate total mining output with mine bonuses
  calculateTotalOutput() {
    const mineUpgrades = this.miningScreen.mineUpgrades;
    const baseCurrency = this.miningScreen.mineConfig.baseOutput;
    const mechaBonus = this.miningScreen.mechaBuilder.hasMecha ? 2 : 1;
    const upgradeBonus = mineUpgrades.outputBonus;
    const multiplier =
      1 +
      mineUpgrades.outputMultiplier *
        Math.floor(this.miningScreen.currency / 100);

    return Math.floor((baseCurrency * mechaBonus + upgradeBonus) * multiplier);
  }

  // Calculate mining speed with mine bonuses
  calculateMiningSpeed() {
    const mineUpgrades = this.miningScreen.mineUpgrades;
    const baseSpeed = 1.0; // Base speed multiplier
    const speedBonus = 1 + mineUpgrades.timeReduction;

    return baseSpeed * speedBonus;
  }

  // Calculate geode drop rate with mine bonuses
  calculateGeodeDropRate() {
    const mineUpgrades = this.miningScreen.mineUpgrades;
    const baseRate = this.miningScreen.mineId === "mine1" ? 0.05 : 0.03;
    const upgradeBonus = mineUpgrades.partDropRate;

    return Math.min(baseRate + upgradeBonus, 0.95);
  }

  // Boost machine efficiency (for special events or bonuses)
  boostMachineEfficiency(machineId, amount = 0.1, duration = 30000) {
    const machine = this.getMachine(machineId);
    if (!machine) return false;

    const originalEfficiency = machine.efficiency;
    machine.efficiency = Math.min(machine.efficiency + amount, 3.0);

    // Reset after duration
    setTimeout(() => {
      machine.efficiency = originalEfficiency;
    }, duration);

    return true;
  }

  // Boost all machines efficiency
  boostAllMachinesEfficiency(amount = 0.1, duration = 30000) {
    this.machines.forEach((machine) => {
      this.boostMachineEfficiency(machine.id, amount, duration);
    });
  }

  // Get machine performance rating
  getMachinePerformanceRating(machineId) {
    const machine = this.getMachine(machineId);
    if (!machine) return 0;

    const factors = [
      machine.efficiency,
      machine.totalMined / 1000, // Mining volume
      machine.geodeCount / 10, // Geode collection
      machine.perfectHits / 100, // Perfect hits
    ];

    const avgFactor =
      factors.reduce((sum, factor) => sum + Math.min(factor, 1), 0) /
      factors.length;
    return Math.floor(avgFactor * 100);
  }

  // Get top performing machine
  getTopPerformingMachine() {
    if (this.machines.length === 0) return null;

    return this.machines.reduce((best, current) => {
      const bestRating = this.getMachinePerformanceRating(best.id);
      const currentRating = this.getMachinePerformanceRating(current.id);
      return currentRating > bestRating ? current : best;
    });
  }

  // Reset machine performance data
  resetMachinePerformance(machineId) {
    const machine = this.getMachine(machineId);
    if (!machine) return false;

    machine.totalMined = 0;
    machine.perfectHits = 0;
    machine.efficiency = 1.0;
    machine.lastActiveTime = 0;

    return true;
  }

  // Reset all machines performance
  resetAllMachinesPerformance() {
    this.machines.forEach((machine) => {
      this.resetMachinePerformance(machine.id);
    });
  }

  // Sync machine with active mining system
  syncWithActiveMining(machineId, timingResult) {
    const machine = this.getMachine(machineId);
    if (!machine) return;

    // Update perfect hits counter
    if (timingResult.type === "perfect") {
      machine.perfectHits++;
    }

    // Update efficiency based on timing performance
    if (timingResult.type === "perfect") {
      machine.efficiency = Math.min(machine.efficiency + 0.02, 2.0);
    } else if (timingResult.type === "miss") {
      machine.efficiency = Math.max(machine.efficiency - 0.01, 0.5);
    }

    machine.lastActiveTime = Date.now();
  }

  // Get machine readiness for active mining
  getMachineReadiness(machineId) {
    const machine = this.getMachine(machineId);
    if (!machine) return 0;

    if (machine.isAutoMining) return 0; // Auto-mining machines aren't ready for active mining
    if (machine.energyLevel >= 100) return 0; // Full machines don't need active mining

    // Return readiness percentage (0-100)
    return 100 - machine.energyLevel;
  }

  // Get best machine for active mining
  getBestMachineForActiveMining() {
    const availableMachines = this.machines.filter(
      (m) => !m.isAutoMining && m.energyLevel < 100
    );

    if (availableMachines.length === 0) return null;

    // Return machine with highest readiness score
    return availableMachines.reduce((best, current) => {
      const bestReadiness = this.getMachineReadiness(best.id);
      const currentReadiness = this.getMachineReadiness(current.id);
      return currentReadiness > bestReadiness ? current : best;
    });
  }

  // Emergency stop all machines
  emergencyStopAll() {
    this.stopAutoMining();
    this.machines.forEach((machine) => {
      machine.isActive = false;
      machine.energyLevel = 0;
    });
  }

  // Repair machine (restore efficiency)
  repairMachine(machineId) {
    const machine = this.getMachine(machineId);
    if (!machine) return false;

    machine.efficiency = 1.0;
    machine.energyLevel = 0;
    machine.isActive = false;

    return true;
  }

  // Repair all machines
  repairAllMachines() {
    this.machines.forEach((machine) => {
      this.repairMachine(machine.id);
    });
  }

  // Check if any machine needs attention
  needsAttention() {
    return this.machines.some(
      (machine) =>
        machine.efficiency < 0.8 ||
        machine.geodeCount > 10 ||
        (!machine.isAutoMining && machine.energyLevel < 50)
    );
  }

  // Get attention alerts
  getAttentionAlerts() {
    const alerts = [];

    this.machines.forEach((machine) => {
      if (machine.efficiency < 0.8) {
        alerts.push(
          `${machine.id} running at low efficiency (${Math.floor(
            machine.efficiency * 100
          )}%)`
        );
      }
      if (machine.geodeCount > 10) {
        alerts.push(
          `${machine.id} has many geodes to collect (${machine.geodeCount})`
        );
      }
      if (!machine.isAutoMining && machine.energyLevel < 50) {
        alerts.push(`${machine.id} could use some active mining`);
      }
    });

    return alerts;
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

console.log("⚙️ Enhanced MachineManager class loaded!");
