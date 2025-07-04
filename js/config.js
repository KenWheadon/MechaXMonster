// Mecha X Monster - Game Configuration
// All game data and templates centralized here

const GAME_CONFIG = {
  // Game metadata
  title: "MECHA X MONSTER",
  version: "0.1.0",
  theme: "Everything at a Cost",

  // Screen configurations
  screens: {
    start: {
      title: "MECHA X MONSTER",
      tagline: "Can You Stop the Evil Slime?",
      subtitle: "Build mighty mechas and defend the asteroid colony!",
      buttonText: "🚀 Start Mining",
    },
    mining: {
      title: "Asteroid Mining Operation",
      defaultCurrency: 10,
      autoMineInterval: 5000, // 5 seconds
      geodeDropRate: 0.05, // 5% chance
    },
  },

  // Mine data structure
  mines: {
    mine1: {
      name: "Rock Mine",
      mecha: "green",
      monster: "yellow",
      currency: "shells",
      unlockCost: { shells: 0, monster_shells: 0 },
      baseOutput: 1,
      baseInterval: 10000,
    },
    mine2: {
      name: "Ice Mine",
      mecha: "yellow",
      monster: "teal",
      currency: "coins",
      unlockCost: { shells: 25, monster_shells: 0 },
      baseOutput: 1,
      baseInterval: 8000,
    },
    mine3: {
      name: "Crystal Mine",
      mecha: "red",
      monster: "blue",
      currency: "bars",
      unlockCost: { shells: 50, monster_shells: 1 },
      baseOutput: 1,
      baseInterval: 6000,
    },
    mine4: {
      name: "Gas Mine",
      mecha: "blue",
      monster: "orange",
      currency: "bonds",
      unlockCost: { shells: 500, monster_shells: 10 },
      baseOutput: 1,
      baseInterval: 4000,
    },
    mine5: {
      name: "Rare Earth Mine",
      mecha: "pink",
      monster: "black",
      currency: "gems",
      unlockCost: { shells: 1000, monster_shells: 25 },
      baseOutput: 1,
      baseInterval: 3000,
    },
  },

  // Mecha templates
  mechas: {
    green: {
      name: "Guardian Mech",
      parts: [
        "left_arm",
        "right_arm",
        "left_leg",
        "right_leg",
        "head",
        "torso",
      ],
      moves: ["light", "heal", "defend", "rest"],
      baseStats: { health: 100, energy: 50, attack: 15, defense: 20 },
    },
    yellow: {
      name: "Striker Mech",
      parts: [
        "left_arm",
        "right_arm",
        "left_leg",
        "right_leg",
        "head",
        "torso",
      ],
      moves: ["heavy", "boost", "heal", "rest"],
      baseStats: { health: 90, energy: 60, attack: 25, defense: 15 },
    },
    red: {
      name: "Assault Mech",
      parts: [
        "left_arm",
        "right_arm",
        "left_leg",
        "right_leg",
        "head",
        "torso",
      ],
      moves: ["light", "heavy", "defend", "heal"],
      baseStats: { health: 110, energy: 40, attack: 30, defense: 25 },
    },
    blue: {
      name: "Support Mech",
      parts: [
        "left_arm",
        "right_arm",
        "left_leg",
        "right_leg",
        "head",
        "torso",
      ],
      moves: ["heavy", "heal", "defend", "rest"],
      baseStats: { health: 120, energy: 70, attack: 10, defense: 30 },
    },
    pink: {
      name: "Elite Mech",
      parts: [
        "left_arm",
        "right_arm",
        "left_leg",
        "right_leg",
        "head",
        "torso",
      ],
      moves: ["defend", "boost", "light", "heavy"],
      baseStats: { health: 150, energy: 80, attack: 35, defense: 35 },
    },
  },

  // Combat move templates
  moves: {
    light: { name: "Light Attack", damage: 15, energyCost: 10, type: "attack" },
    heavy: { name: "Heavy Strike", damage: 25, energyCost: 20, type: "attack" },
    heal: { name: "Repair", healing: 20, energyCost: 15, type: "heal" },
    defend: {
      name: "Shield Up",
      defenseBoost: 10,
      energyCost: 5,
      type: "defense",
    },
    boost: {
      name: "Power Boost",
      attackBoost: 15,
      energyCost: 25,
      type: "buff",
    },
    rest: {
      name: "Energy Rest",
      energyRestore: 30,
      energyCost: 0,
      type: "utility",
    },
  },

  // Monster templates - Updated to use new slime naming pattern
  monsters: {
    yellow: {
      name: "Acidic Slime",
      imagePattern: "slime-yellow", // Will use slime-yellow-1.png, slime-yellow-2.png, etc.
      battles: [
        {
          difficulty: "easy",
          health: 30,
          moves: ["slime_splash"],
          ai: "simple",
        },
        {
          difficulty: "easy",
          health: 40,
          moves: ["slime_splash", "acid_spit"],
          ai: "simple",
        },
        {
          difficulty: "medium",
          health: 60,
          moves: ["slime_splash", "acid_spit", "slime_heal"],
          ai: "normal",
        },
        {
          difficulty: "hard",
          health: 80,
          moves: ["slime_splash", "acid_spit", "slime_heal", "toxic_cloud"],
          ai: "smart",
        },
        {
          difficulty: "boss",
          health: 120,
          moves: ["slime_splash", "acid_spit", "slime_heal", "toxic_cloud"],
          ai: "smart",
        },
      ],
    },
    teal: {
      name: "Frost Slime",
      imagePattern: "slime-teal",
      battles: [
        {
          difficulty: "easy",
          health: 35,
          moves: ["ice_shard"],
          ai: "simple",
        },
        {
          difficulty: "easy",
          health: 45,
          moves: ["ice_shard", "freeze_blast"],
          ai: "simple",
        },
        {
          difficulty: "medium",
          health: 65,
          moves: ["ice_shard", "freeze_blast", "ice_armor"],
          ai: "normal",
        },
        {
          difficulty: "hard",
          health: 85,
          moves: ["ice_shard", "freeze_blast", "ice_armor", "blizzard"],
          ai: "smart",
        },
        {
          difficulty: "boss",
          health: 130,
          moves: ["ice_shard", "freeze_blast", "ice_armor", "blizzard"],
          ai: "smart",
        },
      ],
    },
    blue: {
      name: "Crystal Slime",
      imagePattern: "slime-blue",
      battles: [
        {
          difficulty: "easy",
          health: 40,
          moves: ["crystal_spike"],
          ai: "simple",
        },
        {
          difficulty: "easy",
          health: 50,
          moves: ["crystal_spike", "gem_barrier"],
          ai: "simple",
        },
        {
          difficulty: "medium",
          health: 70,
          moves: ["crystal_spike", "gem_barrier", "crystal_heal"],
          ai: "normal",
        },
        {
          difficulty: "hard",
          health: 90,
          moves: [
            "crystal_spike",
            "gem_barrier",
            "crystal_heal",
            "shard_storm",
          ],
          ai: "smart",
        },
        {
          difficulty: "boss",
          health: 140,
          moves: [
            "crystal_spike",
            "gem_barrier",
            "crystal_heal",
            "shard_storm",
          ],
          ai: "smart",
        },
      ],
    },
    orange: {
      name: "Plasma Slime",
      imagePattern: "slime-orange",
      battles: [
        {
          difficulty: "easy",
          health: 45,
          moves: ["plasma_burst"],
          ai: "simple",
        },
        {
          difficulty: "easy",
          health: 55,
          moves: ["plasma_burst", "energy_drain"],
          ai: "simple",
        },
        {
          difficulty: "medium",
          health: 75,
          moves: ["plasma_burst", "energy_drain", "plasma_shield"],
          ai: "normal",
        },
        {
          difficulty: "hard",
          health: 95,
          moves: ["plasma_burst", "energy_drain", "plasma_shield", "ion_storm"],
          ai: "smart",
        },
        {
          difficulty: "boss",
          health: 150,
          moves: ["plasma_burst", "energy_drain", "plasma_shield", "ion_storm"],
          ai: "smart",
        },
      ],
    },
    black: {
      name: "Void Slime",
      imagePattern: "slime-black",
      battles: [
        {
          difficulty: "easy",
          health: 50,
          moves: ["void_strike"],
          ai: "simple",
        },
        {
          difficulty: "easy",
          health: 60,
          moves: ["void_strike", "darkness"],
          ai: "simple",
        },
        {
          difficulty: "medium",
          health: 80,
          moves: ["void_strike", "darkness", "void_heal"],
          ai: "normal",
        },
        {
          difficulty: "hard",
          health: 100,
          moves: ["void_strike", "darkness", "void_heal", "black_hole"],
          ai: "smart",
        },
        {
          difficulty: "boss",
          health: 160,
          moves: ["void_strike", "darkness", "void_heal", "black_hole"],
          ai: "smart",
        },
      ],
    },
  },

  // Upgrade templates - Updated with proper effects
  upgrades: {
    reduce_time: {
      name: "Speed Boost",
      description: "Reduce mining time by 10%",
      effect: 0.1, // 10% reduction
      type: "time_multiplier",
    },
    increase_output: {
      name: "Output Boost",
      description: "+1 currency per mine",
      effect: 1,
      type: "output_bonus",
    },
    output_multiplier: {
      name: "Efficiency",
      description: "+0.1% per 100 currency stored",
      effect: 0.001, // 0.1% per 100 currency
      type: "storage_multiplier",
    },
    part_drop_rate: {
      name: "Lucky Strike",
      description: "+1% mecha part drop rate",
      effect: 0.01,
      type: "drop_rate",
    },
    nothing: {
      name: "Nothing",
      description: "Better luck next time!",
      effect: 0,
      type: "nothing",
    },
  },

  // UI/Animation settings
  animations: {
    starCount: 50,
    asteroidCount: 8,
    fadeInDuration: 2000,
    buttonFloatDuration: 3000,
  },

  // Audio settings
  audio: {
    enabled: false, // Enabled after first user interaction
    volume: 0.5,
    sounds: {
      button_click: "button-click.mp3",
      mining_complete: "mining-complete.mp3",
      mecha_build: "mecha-build.mp3",
      combat_start: "combat-start.mp3",
      slot_spin: "slot-spin.mp3",
      upgrade_success: "upgrade-success.mp3",
      geode_open: "geode-open.mp3",
    },
  },

  // Exchange rates (intentionally unfavorable to discourage trading)
  exchangeRates: {
    shells: { coins: 0.8, bars: 0.6, bonds: 0.4, gems: 0.2 },
    coins: { shells: 1.2, bars: 0.7, bonds: 0.5, gems: 0.3 },
    bars: { shells: 1.5, coins: 1.3, bonds: 0.8, gems: 0.4 },
    bonds: { shells: 2.0, coins: 1.8, bars: 1.2, gems: 0.6 },
    gems: { shells: 4.0, coins: 3.5, bars: 2.5, bonds: 1.5 },
  },

  // Training currency exchange (also unfavorable)
  trainingRates: {
    currencyToTraining: 0.5, // 1 currency = 0.5 training credits
    trainingToCurrency: 2.0, // 1 training credit = 2 currency
  },

  // Machine purchase costs - Updated per requirements
  machineCosts: {
    machine1: { shells: 0, monster_shells: 0 }, // Free
    machine2: { shells: 25, monster_shells: 1 }, // 25 shells + 1 monster
    machine3: { shells: 50, monster_shells: 10 }, // 50 shells + 10 monster
    machine4: { shells: 500, monster_shells: 100 }, // 500 shells + 100 monster
  },
};

// Utility functions for working with config data
const CONFIG_UTILS = {
  // Get random element from array
  getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  },

  // Create entity from template
  createEntity(templateName, entityType = "mechas") {
    const template = GAME_CONFIG[entityType][templateName];
    if (!template) {
      console.error(`Template ${templateName} not found in ${entityType}`);
      return null;
    }
    return { ...template }; // Deep clone to avoid reference issues
  },

  // Get mine by index (1-5)
  getMineByIndex(index) {
    const mineKey = `mine${index}`;
    return GAME_CONFIG.mines[mineKey] || null;
  },

  // Calculate exchange value
  calculateExchange(fromCurrency, toCurrency, amount) {
    const rates = GAME_CONFIG.exchangeRates;
    if (!rates[fromCurrency] || !rates[fromCurrency][toCurrency]) {
      return 0;
    }
    return Math.floor(amount * rates[fromCurrency][toCurrency]);
  },

  // Validate mecha parts completion
  validateMechaParts(collectedParts, mechaType) {
    const requiredParts = GAME_CONFIG.mechas[mechaType].parts;
    return requiredParts.every((part) => collectedParts.includes(part));
  },

  // Get upgrade by type
  getUpgrade(upgradeType) {
    return GAME_CONFIG.upgrades[upgradeType] || null;
  },

  // Get monster image path based on new naming pattern
  getMonsterImagePath(monsterType, imageIndex = 1) {
    const monster = GAME_CONFIG.monsters[monsterType];
    if (!monster || !monster.imagePattern) {
      console.error(`Monster ${monsterType} not found or missing imagePattern`);
      return `images/slime-${monsterType}-1.png`; // fallback
    }
    return `images/${monster.imagePattern}-${imageIndex}.png`;
  },

  // Get random monster image for variety
  getRandomMonsterImage(monsterType) {
    const imageIndex = Math.floor(Math.random() * 3) + 1; // 1-3
    return this.getMonsterImagePath(monsterType, imageIndex);
  },

  // Get machine cost by index
  getMachineCost(machineIndex) {
    const costKey = `machine${machineIndex + 1}`;
    return (
      GAME_CONFIG.machineCosts[costKey] || { shells: 0, monster_shells: 0 }
    );
  },

  // Check if upgrade is available (not at maximum)
  canUpgrade(upgradeType, currentLevel) {
    // Define maximum levels for each upgrade type
    const maxLevels = {
      reduce_time: 10, // Maximum 100% reduction (never reaches 0)
      increase_output: 50, // Maximum +50 bonus output
      output_multiplier: 100, // Maximum 10% multiplier
      part_drop_rate: 95, // Maximum 95% (never reaches 100%)
    };

    const maxLevel = maxLevels[upgradeType] || 1;
    return currentLevel < maxLevel;
  },

  // Get upgrade symbol for slot machine
  getUpgradeSymbol(upgradeType) {
    const symbols = {
      reduce_time: "⚡",
      increase_output: "💰",
      output_multiplier: "🔧",
      part_drop_rate: "💎",
      nothing: "❌",
    };
    return symbols[upgradeType] || "❓";
  },

  // Calculate adjusted mining interval based on upgrades
  calculateMiningInterval(baseInterval, timeReduction) {
    const reduction = Math.min(timeReduction, 0.95); // Cap at 95% reduction
    return Math.max(baseInterval * (1 - reduction), 100); // Minimum 100ms
  },

  // Calculate total currency output including upgrades
  calculateCurrencyOutput(baseOutput, upgrades, storedCurrency, hasMecha) {
    let totalOutput = baseOutput;

    // Apply mecha bonus
    if (hasMecha) {
      totalOutput *= 2;
    }

    // Apply output bonus
    totalOutput += upgrades.outputBonus || 0;

    // Apply storage multiplier
    const storageMultiplier =
      (upgrades.outputMultiplier || 0) * Math.floor(storedCurrency / 100);
    totalOutput *= 1 + storageMultiplier;

    return Math.floor(totalOutput);
  },

  // Calculate geode drop rate including upgrades
  calculateGeodeDropRate(baseDropRate, upgrades) {
    const bonusRate = upgrades.partDropRate || 0;
    return Math.min(baseDropRate + bonusRate, 1.0); // Cap at 100%
  },
};

// Export for use in other files (if using modules)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { GAME_CONFIG, CONFIG_UTILS };
}

console.log("📋 Game configuration loaded");
