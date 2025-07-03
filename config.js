// Mecha X Monster Game Configuration
const GAME_CONFIG = {
  // Mining Settings
  MINING_FILL_TIME: 10000, // 10 seconds per fill
  MINING_BASE_OUTPUT: 1,
  GEODE_DROP_RATE: 1, // 1 geode per fill
  MECHA_PART_DROP_RATE: 0.05, // 5% chance from geodes

  // Training Settings
  TRAINING_TIME: 15, // seconds
  BUBBLE_SPAWN_RATE: 0.7, // probability per interval
  MAX_BUBBLES: 6,
  BUBBLE_LIFETIME: 3000, // milliseconds

  // Combat Settings
  BATTLES_PER_MINE: 5,
  BASE_MECHA_HP: 100,
  BASE_MECHA_ENERGY: 12,
  BASE_MECHA_ATTACK: 15,
  BASE_MECHA_DEFENSE: 8,

  // Upgrade Settings
  UPGRADE_BASE_COST: 25,
  UPGRADE_COST_MULTIPLIER: 1.5,

  // Currency Exchange
  EXCHANGE_RATE: 0.5, // Poor rates as specified in GDD

  // Final Boss
  FINAL_BOSS_HP: 1000,
  FINAL_BOSS_ENERGY: 50,
  FINAL_BOSS_ATTACK: 40,
  FINAL_BOSS_DEFENSE: 20,

  ULTIMATE_MECHA_HP: 500,
  ULTIMATE_MECHA_ENERGY: 30,
  ULTIMATE_MECHA_ATTACK: 50,
  ULTIMATE_MECHA_DEFENSE: 25,
};

// Mine Configuration - matches GDD specification
const MINE_CONFIG = {
  1: {
    name: "Rock Mine",
    currency: "shells",
    mecha: "Green",
    monster: "Yellow Slime",
    unlockCost: 0,
    icon: "🪨",
    monsterIcon: "🟡",
  },
  2: {
    name: "Ice Mine",
    currency: "coins",
    mecha: "Yellow",
    monster: "Teal Slime",
    unlockCost: 20,
    icon: "❄️",
    monsterIcon: "🔵",
  },
  3: {
    name: "Lava Mine",
    currency: "bars",
    mecha: "Red",
    monster: "Blue Slime",
    unlockCost: 100,
    icon: "🔥",
    monsterIcon: "🔷",
  },
  4: {
    name: "Crystal Mine",
    currency: "bonds",
    mecha: "Blue",
    monster: "Orange Slime",
    unlockCost: 500,
    icon: "💎",
    monsterIcon: "🟠",
  },
  5: {
    name: "Plasma Mine",
    currency: "gems",
    mecha: "Pink",
    monster: "Black Slime",
    unlockCost: 2000,
    icon: "🌟",
    monsterIcon: "⚫",
  },
};

// Mecha part types - exactly 6 as specified in GDD
const MECHA_PARTS = [
  "head",
  "leftArm",
  "rightArm",
  "torso",
  "leftLeg",
  "rightLeg",
];

// Combat moves - matches GDD mecha move specifications
const COMBAT_MOVES = {
  light: {
    name: "Light Attack",
    energyCost: 2,
    baseDamage: 15,
    icon: "⚡",
  },
  heavy: {
    name: "Heavy Attack",
    energyCost: 4,
    baseDamage: 25,
    icon: "💥",
  },
  defend: {
    name: "Defend",
    energyCost: 1,
    defenseBoost: 5,
    icon: "🛡️",
  },
  rest: {
    name: "Rest",
    energyCost: 0,
    energyRestore: 0.4, // 40% of max energy
    icon: "💤",
  },
};

// Training bubble types for variety
const BUBBLE_TYPES = [
  { emoji: "🎯", points: 1, weight: 40 },
  { emoji: "⚡", points: 3, weight: 30 },
  { emoji: "🔥", points: 5, weight: 20 },
  { emoji: "❄️", points: 3, weight: 30 },
  { emoji: "💎", points: 10, weight: 5 },
];

// Mining machine costs as specified in GDD
const MACHINE_COSTS = {
  2: { currency: 25, monster: 0 },
  3: { currency: 50, monster: 1 },
  4: { currency: 500, monster: 10 },
};

// Training upgrade costs
const TRAINING_UPGRADES = {
  attack: { baseCost: 50, increment: 25, bonus: 5 },
  defense: { baseCost: 50, increment: 25, bonus: 5 },
  hp: { baseCost: 75, increment: 30, bonus: 25 },
  energy: { baseCost: 40, increment: 20, bonus: 2 },
};

// Slot machine symbols for upgrades
const UPGRADE_SYMBOLS = ["⚡", "💰", "🔧", "📈", "❌"];
const TRAINING_SLOT_SYMBOLS = ["🎯", "⚔️", "🛡️", "❤️", "⚡", "💎"];

// Currency icons for display
const CURRENCY_ICONS = {
  shells: "🐚",
  coins: "🪙",
  bars: "🥇",
  bonds: "📜",
  gems: "💎",
  monsterShells: "🐚👹",
  monsterCoins: "🪙👹",
  monsterBars: "🥇👹",
  monsterBonds: "📜👹",
  monsterGems: "💎👹",
};

// Utility functions
const CONFIG_UTILS = {
  getCurrencyIcon: function (currency) {
    return CURRENCY_ICONS[currency] || "❓";
  },

  getRandomBubbleType: function () {
    const totalWeight = BUBBLE_TYPES.reduce(
      (sum, bubble) => sum + bubble.weight,
      0
    );
    let random = Math.random() * totalWeight;

    for (let bubble of BUBBLE_TYPES) {
      random -= bubble.weight;
      if (random <= 0) return bubble;
    }

    return BUBBLE_TYPES[0];
  },

  getRandomUpgradeSymbol: function () {
    return UPGRADE_SYMBOLS[Math.floor(Math.random() * UPGRADE_SYMBOLS.length)];
  },

  getRandomTrainingSymbol: function () {
    return TRAINING_SLOT_SYMBOLS[
      Math.floor(Math.random() * TRAINING_SLOT_SYMBOLS.length)
    ];
  },

  calculateMachineUpgradeCost: function (mineId, machineNumber) {
    const config = MINE_CONFIG[mineId];
    const costs = MACHINE_COSTS[machineNumber];
    return costs || { currency: 0, monster: 0 };
  },

  getMonsterCurrencyKey: function (baseCurrency) {
    return (
      "monster" + baseCurrency.charAt(0).toUpperCase() + baseCurrency.slice(1)
    );
  },

  calculateCombatReward: function (won) {
    const baseReward = 20;
    const bonusReward = won ? 50 : 0;
    return baseReward + bonusReward;
  },
};
