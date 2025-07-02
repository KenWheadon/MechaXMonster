// config.js - Game Configuration following GameDemon Framework
// Externalize ALL game data following the configuration-driven pattern

const GAME_CONFIG = {
  // Game constants
  GAME_NAME: "Mecha X Monster",
  VERSION: "1.0.0",

  // Mine configuration
  MINE_COUNT: 5,
  MACHINES_PER_MINE: 4,
  MECHA_PARTS_COUNT: 6,

  // Currency settings
  STARTING_SHELLS: 10,
  MINE1_BUILD_COST: 10,

  // Mining settings
  BASE_FILL_TIME: 10000, // 10 seconds
  BASE_PRODUCTION: 1,
  BASE_PART_DROP_RATE: 0.01, // 1%

  // Combat settings
  BATTLES_PER_FIGHT: 3,
  TRAINING_TIME: 12000, // 12 seconds

  // Audio settings
  DEFAULT_SFX_VOLUME: 0.7,
  DEFAULT_MUSIC_VOLUME: 0.3,
};

// Template pattern for mine data
const MINE_TEMPLATES = {
  mine1: {
    id: "mine1",
    name: "Starter Mine",
    currency: "shells",
    currencyIcon: "🐚",
    mechaType: "green",
    mechaName: "GreenBot",
    monsterType: "yellowSlime",
    monsterName: "Yellow Slime",
    buildCost: 10,
    machines: [
      { cost: 0, production: 1, fillTime: 10000 },
      { cost: 25, production: 2, fillTime: 8000 },
      { cost: 100, production: 5, fillTime: 6000 },
      { cost: 500, production: 10, fillTime: 4000 },
    ],
  },
  mine2: {
    id: "mine2",
    name: "Ice Mine",
    currency: "coins",
    currencyIcon: "🪙",
    mechaType: "yellow",
    mechaName: "IceBot",
    monsterType: "tealSlime",
    monsterName: "Teal Slime",
    buildCost: 100,
    unlockRequirements: {
      monsterBars: 2,
      coins: 100,
      shells: 500,
    },
  },
  mine3: {
    id: "mine3",
    name: "Lava Mine",
    currency: "bars",
    currencyIcon: "📊",
    mechaType: "red",
    mechaName: "FireBot",
    monsterType: "blueSlime",
    monsterName: "Blue Slime",
    buildCost: 500,
  },
  mine4: {
    id: "mine4",
    name: "Crystal Mine",
    currency: "bonds",
    currencyIcon: "💎",
    mechaType: "blue",
    mechaName: "CrystalBot",
    monsterType: "orangeSlime",
    monsterName: "Orange Slime",
    buildCost: 2000,
  },
  mine5: {
    id: "mine5",
    name: "Void Mine",
    currency: "gems",
    currencyIcon: "💎",
    mechaType: "pink",
    mechaName: "VoidBot",
    monsterType: "blackSlime",
    monsterName: "Black Slime",
    buildCost: 10000,
  },
};

// Mecha part templates
const MECHA_PART_TEMPLATES = {
  green: {
    leftArm: { name: "Green Left Arm", icon: "🦾" },
    rightArm: { name: "Green Right Arm", icon: "🦾" },
    leftLeg: { name: "Green Left Leg", icon: "🦵" },
    rightLeg: { name: "Green Right Leg", icon: "🦵" },
    head: { name: "Green Head", icon: "🤖" },
    torso: { name: "Green Torso", icon: "🤖" },
  },
  // Other mecha types will be added as needed
};

// Combat move templates
const COMBAT_MOVES = {
  light_attack: {
    id: "light_attack",
    name: "Quick Strike",
    type: "attack",
    energyCost: 2,
    power: 25,
    effects: ["damage"],
    description: "Fast attack with moderate damage",
  },
  heavy_attack: {
    id: "heavy_attack",
    name: "Power Strike",
    type: "attack",
    energyCost: 4,
    power: 50,
    effects: ["damage"],
    description: "Slow attack with high damage",
  },
  defend: {
    id: "defend",
    name: "Defend",
    type: "defense",
    energyCost: 1,
    effects: ["block_next_attack"],
    description: "Block the next incoming attack",
  },
  heal: {
    id: "heal",
    name: "Repair",
    type: "recovery",
    energyCost: 3,
    power: 30,
    effects: ["restore_hp"],
    description: "Restore 30% of maximum health",
  },
  boost: {
    id: "boost",
    name: "Power Up",
    type: "buff",
    energyCost: 2,
    power: 50,
    effects: ["boost_damage"],
    duration: 3,
    description: "Increase damage by 50% for 3 turns",
  },
  rest: {
    id: "rest",
    name: "Recharge",
    type: "recovery",
    energyCost: 0,
    power: 40,
    effects: ["restore_energy"],
    description: "Restore 40% of maximum energy",
  },
};

// Mecha moveset templates
const MECHA_MOVESETS = {
  green: ["light_attack", "heal", "defend", "rest"],
  yellow: ["heavy_attack", "boost", "heal", "rest"],
  red: ["light_attack", "heavy_attack", "defend", "heal"],
  blue: ["heavy_attack", "heal", "defend", "rest"],
  pink: ["defend", "boost", "light_attack", "heavy_attack"],
};

// Slot machine reward templates
const SLOT_REWARDS = {
  fill_time_reduction: {
    name: "Speed Boost",
    description: "Reduce mining time by 10%",
    icon: "⚡",
    effect: { type: "fillTimeReduction", value: 10 },
  },
  output_increase: {
    name: "Production Boost",
    description: "Increase output by 1 per cycle",
    icon: "📈",
    effect: { type: "outputIncrease", value: 1 },
  },
  part_drop_rate: {
    name: "Lucky Mining",
    description: "Increase part drop chance by 1%",
    icon: "🍀",
    effect: { type: "partDropRate", value: 1 },
  },
  output_multiplier: {
    name: "Wealth Multiplier",
    description: "Increase output based on stored currency",
    icon: "💰",
    effect: { type: "outputMultiplier", value: 0.1 },
  },
  nothing: {
    name: "Nothing",
    description: "Better luck next time!",
    icon: "💨",
    effect: null,
  },
};

// Achievement templates
const ACHIEVEMENT_TEMPLATES = {
  first_mine: {
    id: "first_mine",
    name: "First Steps",
    description: "Build your first mining operation",
    icon: "⛏️",
    points: 10,
    reward: { shells: 10 },
  },
  first_mecha: {
    id: "first_mecha",
    name: "Mecha Builder",
    description: "Build your first mecha",
    icon: "🤖",
    points: 25,
    reward: { shells: 25 },
  },
  first_victory: {
    id: "first_victory",
    name: "Monster Slayer",
    description: "Win your first battle",
    icon: "🏆",
    points: 50,
    reward: { monsterShells: 20 },
  },
  part_collector: {
    id: "part_collector",
    name: "Part Collector",
    description: "Collect 10 mecha parts",
    icon: "🔧",
    points: 15,
    progress: { target: 10, current: 0 },
  },
  currency_hoarder: {
    id: "currency_hoarder",
    name: "Resource Hoarder",
    description: "Accumulate 1000 shells",
    icon: "💎",
    points: 30,
    progress: { target: 1000, current: 0 },
  },
};

// Factory pattern utilities
const CONFIG_UTILS = {
  getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  },

  createMine(templateName) {
    const template = MINE_TEMPLATES[templateName];
    if (!template) return null;

    return {
      ...template,
      unlocked: templateName === "mine1", // Only mine1 starts unlocked
      built: false,
      upgrades: {
        fillTimeReduction: 0,
        outputIncrease: 0,
        outputMultiplier: 0,
        partDropRate: 1,
      },
    };
  },

  createMechaParts(mechaType) {
    const template = MECHA_PART_TEMPLATES[mechaType];
    if (!template) return {};

    const parts = {};
    Object.keys(template).forEach((partType) => {
      parts[partType] = 0;
    });
    return parts;
  },

  getMechaMoveset(mechaType) {
    return MECHA_MOVESETS[mechaType] || [];
  },

  getRandomSlotReward() {
    const rewards = Object.keys(SLOT_REWARDS);
    const weights = [15, 20, 5, 10, 50]; // Weighted probability

    let totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < rewards.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return SLOT_REWARDS[rewards[i]];
      }
    }

    return SLOT_REWARDS.nothing;
  },

  formatCurrency(amount) {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + "M";
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(1) + "K";
    }
    return amount.toString();
  },

  calculateMiningOutput(baseProd, upgrades, storedCurrency) {
    let output = baseProd + upgrades.outputIncrease;
    output *= 1 + upgrades.outputMultiplier * Math.floor(storedCurrency / 100);
    return Math.floor(output);
  },

  calculateFillTime(baseTime, upgrades) {
    const reduction = upgrades.fillTimeReduction / 100;
    return Math.floor(baseTime * (1 - reduction));
  },

  calculatePartDropChance(baseRate, upgrades) {
    return Math.min(100, baseRate + upgrades.partDropRate) / 100;
  },
};

// Export for use in other modules
if (typeof window !== "undefined") {
  window.GAME_CONFIG = GAME_CONFIG;
  window.MINE_TEMPLATES = MINE_TEMPLATES;
  window.MECHA_PART_TEMPLATES = MECHA_PART_TEMPLATES;
  window.COMBAT_MOVES = COMBAT_MOVES;
  window.MECHA_MOVESETS = MECHA_MOVESETS;
  window.SLOT_REWARDS = SLOT_REWARDS;
  window.ACHIEVEMENT_TEMPLATES = ACHIEVEMENT_TEMPLATES;
  window.CONFIG_UTILS = CONFIG_UTILS;
}
