// Enhanced Game Configuration and Constants with Level System
const GAME_CONFIG = {
  TOTAL_BATTLES: 3,
  TOTAL_LEVELS: 5,
  TRAINING_TIME: 20, // Increased from 15 for better scoring
  ANIMATION_DURATION: 1000,
  ENEMY_MOVE_DELAY: 1000,
  DAMAGE_NUMBER_DURATION: 1000,
  TRAINING_SPAWN_BASE_DELAY: 600, // Reduced for more frequent spawns
  TRAINING_SPAWN_MIN_DELAY: 200, // Much faster minimum spawn
  TRAINING_BUBBLE_LIFETIME: 4000, // Increased bubble lifetime
  SLOT_SPIN_DURATION: 100,
  SLOT_SPIN_COUNT_BASE: 10,
  BOOST_MULTIPLIER: 2.0, // UPDATED: 100% boost (was 1.5)
  SANITY_RECOVERY_PER_TURN: 1,
  SANITY_RECOVERY_BETWEEN_BATTLES: 3, // Increased recovery
  MALFUNCTION_SANITY_RECOVERY: 0.5,
  TRAINING_BONUS_THRESHOLD: 500, // Adjusted for 500-600 point range
  MAX_COMBO_MULTIPLIER: 10, // Increased max combo
  MAX_SIMULTANEOUS_BUBBLES: 6, // New: max bubbles on screen at once
  BUBBLE_BASE_POINTS: [1, 2, 3, 5, 8], // Points for different bubble sizes/types
};

// Expanded Fighter Templates with 5 fighters total
const FIGHTER_TEMPLATES = {
  vanilla: {
    name: "PinkMecha",
    sprite: "🍦",
    image: "images/mecha-green.png",
    hp: 100,
    maxHp: 100,
    attack: 15,
    defense: 10,
    sanity: 12,
    maxSanity: 12,
    moves: {
      light: {
        name: "Scoop Slam",
        icon: "🥄",
        description: "A classic vanilla strike",
      },
      heavy: {
        name: "Frozen Tip",
        icon: "✨",
        description: "Stab with just the tip",
      },
      heal: {
        name: "Face Cream",
        icon: "💖",
        description: "Restore vanilla smoothness",
      },
      boost: {
        name: "Sugar Rush",
        icon: "🍬",
        description: "Pure vanilla energy boost",
      },
    },
  },
  chocolate: {
    name: "YellowMecha",
    sprite: "🍫",
    image: "images/mecha-yellow.png",
    hp: 90,
    maxHp: 90,
    attack: 22, // Higher attack for glass cannon
    defense: 8,
    sanity: 10,
    maxSanity: 10,
    moves: {
      light: {
        name: "Cocoa Strike",
        icon: "🍫",
        description: "Quick chocolate chop",
      },
      heavy: {
        name: "Dark Twist",
        icon: "🌋",
        description: "Explosive cocoa power",
      },
      defend: {
        name: "Bitter Block",
        icon: "🛡️",
        description: "Bitter chocolate armor",
      },
      boost: {
        name: "Mocha Fury",
        icon: "☕",
        description: "Caffeine-powered rage",
      },
    },
  },
  strawberry: {
    name: "RedMecha",
    sprite: "🍓",
    image: "images/mecha-red.png",
    hp: 120, // Higher HP for tank
    maxHp: 120,
    attack: 12,
    defense: 18, // Higher defense
    sanity: 14,
    maxSanity: 14,
    moves: {
      light: { name: "Berry Bonk", icon: "🍓", description: "Sweet berry tap" },
      heavy: {
        name: "Jam Pop",
        icon: "💥",
        description: "Sticky strawberry blast",
      },
      heal: {
        name: "Berry Healing",
        icon: "🌸",
        description: "Sweet berry regeneration",
      },
      boost: {
        name: "Berry Blitz",
        icon: "⚡",
        description: "Natural sugar rush",
      },
    },
  },
  // NEW: Mint Ice Cream Fighter
  mint: {
    name: "BlueMecha",
    sprite: "🍃",
    image: "images/mecha-blue.png",
    hp: 110,
    maxHp: 110,
    attack: 18,
    defense: 12,
    sanity: 16, // High sanity for cool-headed fighter
    maxSanity: 16,
    moves: {
      light: {
        name: "Cool Breeze",
        icon: "🍃",
        description: "Refreshing mint strike",
      },
      heavy: {
        name: "Chip Crunch",
        icon: "💎",
        description: "Devastating chocolate chip attack",
      },
      defend: {
        name: "Frost Shield",
        icon: "❄️",
        description: "Icy mint protection",
      },
      boost: {
        name: "Menthol Rush",
        icon: "🌪️",
        description: "Invigorating mint power-up",
      },
    },
  },
  // NEW: PinkMecha Ice Cream Fighter
  pinkmecha: {
    name: "Pink Mecha",
    sprite: "🎭",
    image: "images/mecha-pink.png",
    hp: 105,
    maxHp: 105,
    attack: 16,
    defense: 14,
    sanity: 11,
    maxSanity: 11,
    moves: {
      light: {
        name: "Triple Strike",
        icon: "🎯",
        description: "Three flavors, one hit",
      },
      heavy: {
        name: "Flavor Fusion",
        icon: "🌀",
        description: "Combined power of all three",
      },
      heal: {
        name: "Layer Heal",
        icon: "🔄",
        description: "Restore each flavor layer",
      },
      defend: {
        name: "Unity Shield",
        icon: "🛡️",
        description: "Three flavors unite for defense",
      },
    },
  },
};

// Level Configuration System
const LEVEL_CONFIG = {
  1: {
    name: "Beginner's Freeze",
    description: "Start your monster fight",
    difficulty: "Easy",
    availableFighters: ["vanilla", "chocolate"],
    enemyMultiplier: 0.8, // Easier enemies
    background: "level_1_bg.png",
  },
  2: {
    name: "Sweet Showdown",
    description: "More flavors join the fight",
    difficulty: "Easy-Medium",
    availableFighters: ["vanilla", "chocolate", "strawberry"],
    enemyMultiplier: 0.9,
    background: "level_2_bg.png",
  },
  3: {
    name: "Frozen Conflict",
    description: "The cool fighter enters",
    difficulty: "Medium",
    availableFighters: ["vanilla", "chocolate", "strawberry", "mint"],
    enemyMultiplier: 1.0, // Normal difficulty
    background: "level_3_bg.png",
  },
  4: {
    name: "Flavor Fusion",
    description: "All fighters unite",
    difficulty: "Medium-Hard",
    availableFighters: [
      "vanilla",
      "chocolate",
      "strawberry",
      "mint",
      "pinkmecha",
    ],
    enemyMultiplier: 1.1,
    background: "level_4_bg.png",
  },
  5: {
    name: "Ultimate Freeze",
    description: "The final challenge",
    difficulty: "Hard",
    availableFighters: [
      "vanilla",
      "chocolate",
      "strawberry",
      "mint",
      "pinkmecha",
    ],
    enemyMultiplier: 1.3, // Much harder
    background: "level_5_bg.png",
  },
};

// Rebalanced Enemy Templates for proper difficulty curve - now adjusted per level
const ENEMY_TEMPLATES = [
  {
    name: "Melty Mike",
    sprite: "🌊",
    image: "images/enemy_1.png",
    hp: 90,
    maxHp: 90,
    attack: 15,
    defense: 5,
    sanity: 10,
    maxSanity: 10,
    pattern: ["light", "light", "defend", "heavy"],
  },
  {
    name: "Freezer Burn Fred",
    sprite: "❄️",
    image: "images/enemy_2.png",
    hp: 160,
    maxHp: 180,
    attack: 20,
    defense: 25,
    sanity: 14,
    maxSanity: 14,
    pattern: ["heavy", "defend", "light", "defend", "boost"],
  },
  {
    name: "Sour Sam",
    sprite: "🍋",
    image: "images/enemy_3.png",
    hp: 300,
    maxHp: 300,
    attack: 35,
    defense: 10,
    sanity: 18,
    maxSanity: 18,
    pattern: ["boost", "heavy", "light", "light", "defend"],
  },
  {
    name: "Rocky Road Roger",
    sprite: "🗿",
    image: "images/enemy_4.png",
    hp: 420,
    maxHp: 420,
    attack: 50,
    defense: 30,
    sanity: 40,
    maxSanity: 40,
    pattern: ["defend", "boost", "heavy", "light", "heavy"],
  },
  {
    name: "Brain Freeze Boss",
    sprite: "🧠",
    image: "images/enemy_5.png",
    hp: 650,
    maxHp: 650,
    attack: 55,
    defense: 50,
    sanity: 10,
    maxSanity: 30,
    pattern: ["boost", "heavy", "heavy", "defend", "light", "defend"],
  },
];

// Enhanced Move definitions with heal move added
const MOVE_DEFINITIONS = {
  light: {
    name: "Quick Strike",
    damage: 25, // Increased base damage
    baseCost: 2,
    description: "Reliable damage, predictable cost",
    sanityCosts: {
      vsLight: 2,
      vsHeavy: 3,
      vsDefend: 1,
      vsBoost: 2,
    },
  },
  heavy: {
    name: "Power Blast",
    damage: 50, // Increased base damage
    baseCost: 4,
    description: "Big damage, risky if countered",
    sanityCosts: {
      vsLight: 2,
      vsHeavy: 3,
      vsDefend: 6,
      vsBoost: 0,
    },
  },
  defend: {
    name: "Shield",
    damage: 0,
    baseCost: 1,
    description: "FREE if they attack, costly if not",
    sanityCosts: {
      vsLight: 0,
      vsHeavy: 0,
      vsDefend: 2,
      vsBoost: 3,
    },
  },
  boost: {
    name: "Power Up",
    damage: 0,
    baseCost: 3,
    description: "+100% damage next 3 turns", // UPDATED description
    sanityCosts: {
      vsLight: 3,
      vsHeavy: 5,
      vsDefend: 1,
      vsBoost: 1,
    },
  },
  heal: {
    // NEW: Heal move definition
    name: "Heal",
    damage: 0,
    baseCost: 3,
    description: "Restore 30% of max HP",
    sanityCosts: {
      vsLight: 4,
      vsHeavy: 5,
      vsDefend: 2,
      vsBoost: 3,
    },
  },
};

// Fighter dialogue for talk mechanic - expanded for new fighters
const FIGHTER_STATEMENTS = {
  vanilla: [
    "I'm feeling a bit vanilla right now...",
    "Sometimes I wonder if I'm too plain.",
    "I need to keep my cool!",
    "Classic never goes out of style, right?",
  ],
  chocolate: [
    "I'm melting under the pressure!",
    "Dark thoughts are creeping in...",
    "I feel bitter about this battle.",
    "My strength is fading like cocoa in the sun!",
  ],
  strawberry: [
    "I'm not feeling so sweet anymore...",
    "Everything's getting berry difficult!",
    "My defenses are crumbling like shortcake!",
    "I need to preserve my strength!",
  ],
  mint: [
    "I'm losing my cool...",
    "The heat is making me wilt!",
    "My refreshing spirit is fading!",
    "I need to stay chill!",
  ],
  pinkmecha: [
    "My layers are falling apart!",
    "I can't keep my flavors together!",
    "Unity is harder than it looks!",
    "Three minds, one confused fighter!",
  ],
};

// Talk responses for sanity restoration
const TALK_RESPONSES = [
  { text: "You're the coolest fighter I know!", success: true, sanity: 3 },
  { text: "Stay strong, we're winning this!", success: true, sanity: 4 },
  { text: "Don't melt down on me now!", success: false, sanity: 1 },
  { text: "Remember why we're fighting!", success: true, sanity: 3 },
  {
    text: "You're making me hungry... wait, that's not helping!",
    success: false,
    sanity: 0,
  },
  { text: "Channel your inner freeze!", success: true, sanity: 2 },
  { text: "Think of happy sundaes!", success: true, sanity: 3 },
  { text: "Just chill out! Get it? Chill?", success: false, sanity: 1 },
];

// Malfunction messages for sanity crisis
const MALFUNCTION_MESSAGES = [
  "I'm just a puddle now!",
  "The sprinkles are whispering secrets!",
  "I can see through time!",
  "Everything tastes like purple!",
  "I am become dairy, destroyer of cones!",
];

// Talk-down dialogue options
const TALKDOWN_OPTIONS = [
  { text: "You're still solid! Feel your cone!", success: true },
  { text: "The sprinkles aren't real, focus on my voice!", success: true },
  { text: "SNAP OUT OF IT!", success: false },
  {
    text: "Just calm down and breathe... wait, can ice cream breathe?",
    success: false,
  },
  { text: "Remember your training! You're stronger than this!", success: true },
  { text: "Think of all the happy customers you've served!", success: true },
];

// Simple Slot machine configuration with equal chances and 20% loss rate
const SLOT_CONFIG = {
  symbols: [
    { emoji: "🍦", name: "vanilla", image: "images/slot_vanilla.png" },
    { emoji: "🍫", name: "chocolate", image: "images/slot_chocolate.png" },
    { emoji: "🍓", name: "strawberry", image: "images/slot_strawberry.png" },
    { emoji: "🍨", name: "soft", image: "images/slot_soft.png" },
    { emoji: "🧊", name: "ice", image: "images/slot_ice.png" },
    { emoji: "🪙", name: "coin", image: "images/slot_coin.png" },
  ],
  // Simple results array - 80% win rate (equal chances for each symbol), 20% loss rate
  results: [
    // Wins (80% total, ~13.33% each)
    { type: "win", symbol: "vanilla" },
    { type: "win", symbol: "vanilla" },
    { type: "win", symbol: "vanilla" },
    { type: "win", symbol: "chocolate" },
    { type: "win", symbol: "chocolate" },
    { type: "win", symbol: "chocolate" },
    { type: "win", symbol: "strawberry" },
    { type: "win", symbol: "strawberry" },
    { type: "win", symbol: "strawberry" },
    { type: "win", symbol: "soft" },
    { type: "win", symbol: "soft" },
    { type: "win", symbol: "ice" },
    { type: "win", symbol: "ice" },
    { type: "win", symbol: "coin" },
    { type: "win", symbol: "coin" },
    { type: "win", symbol: "coin" },
    { type: "win", symbol: "coin" },
    { type: "win", symbol: "coin" },
    // Losses (20% total)
    { type: "loss" },
    { type: "loss" },
    { type: "loss" },
    { type: "loss" },
    { type: "loss" },
  ],
  rewards: {
    triple: {
      vanilla: { name: "VANILLA VICTORY!", attack: 5, color: "#f5e6d3" }, // Increased from 3 to 5
      chocolate: { name: "CHOCOLATE CHAMPION!", defense: 5, color: "#8b4513" }, // Increased from 3 to 5
      strawberry: { name: "STRAWBERRY SUPREME!", hp: 40, color: "#ff6b6b" }, // Increased from 25 to 40
      soft: { name: "SOFT SERVE SUCCESS!", sanity: 5, color: "#ffeaa7" }, // Increased from 3 to 5
      ice: {
        name: "ICE COLD JACKPOT!",
        attack: 3,
        defense: 3,
        sanity: 3,
        hp: 30, // Increased from 20 to 30
        color: "#48dbfb",
      },
      coin: { name: "COIN JACKPOT!", points: 100, color: "#fdcb6e" }, // Increased from 50 to 100
    },
  },
};

// Enhanced training rewards balanced for 500-600 points
const TRAINING_REWARDS = {
  attack: {
    name: "+8 Attack", // Increased from +5
    description: "Increase your attack power significantly",
    icon: "images/upgrade_attack.png",
    apply: (player) => {
      player.attack += 8; // Increased from 5
    },
  },
  defense: {
    name: "+8 Defense", // Increased from +5
    description: "Increase your defense power significantly",
    icon: "images/upgrade_defense.png",
    apply: (player) => {
      player.defense += 8; // Increased from 5
    },
  },
  sanity: {
    name: "+3 Max Sanity", // Increased from +2
    description: "Increase your maximum sanity",
    icon: "images/upgrade_sanity.png",
    apply: (player) => {
      player.maxSanity += 3; // Increased from 2
      player.sanity = Math.min(player.sanity + 3, player.maxSanity);
    },
  },
  health: {
    name: "+40 Max HP", // Increased from +25
    description: "Increase your maximum health significantly",
    icon: "images/upgrade_health.png",
    apply: (player) => {
      player.maxHp += 40; // Increased from 25
      player.hp = Math.min(player.hp + 40, player.maxHp);
    },
  },
};

// Enhanced Bubble Types for training mini-game
const BUBBLE_TYPES = [
  {
    type: "vanilla",
    emoji: "🍦",
    image: "images/cone_vanilla.png",
    basePoints: 1,
    size: "small",
    color: "rgba(255,248,220,0.8)",
    weight: 40, // Most common
  },
  {
    type: "chocolate",
    emoji: "🍫",
    image: "images/cone_chocolate.png",
    basePoints: 2,
    size: "medium",
    color: "rgba(139,69,19,0.8)",
    weight: 30,
  },
  {
    type: "strawberry",
    emoji: "🍓",
    image: "images/cone_strawberry.png",
    basePoints: 3,
    size: "medium",
    color: "rgba(255,105,180,0.8)",
    weight: 20,
  },
  {
    type: "special",
    emoji: "🌟",
    image: "images/cone_special.png",
    basePoints: 5,
    size: "large",
    color: "rgba(255,215,0,0.8)",
    weight: 8, // Rare
  },
  {
    type: "bonus",
    emoji: "💎",
    image: "images/cone_bonus.png",
    basePoints: 10,
    size: "large",
    color: "rgba(72,219,251,0.8)",
    weight: 2, // Very rare
  },
];

// Training cone images and data (fallback for compatibility)
const TRAINING_CONES = [
  { emoji: "🍦", image: "images/cone_vanilla.png" },
  { emoji: "🍨", image: "images/cone_special.png" },
  { emoji: "🍧", image: "images/cone_strawberry.png" },
  { emoji: "🍋", image: "images/cone_chocolate.png" },
  { emoji: "💎", image: "images/cone_bonus.png" },
];

// Updated Achievement system configuration with new fighters
const ACHIEVEMENTS = {
  // Enemy defeat achievements
  enemy_1: {
    icon: "🌊",
    name: "Wave Rider",
    description: "Defeat Melty Mike",
    unlocked: false,
  },
  enemy_2: {
    icon: "❄️",
    name: "Ice Breaker",
    description: "Defeat Freezer Burn Fred",
    unlocked: false,
  },
  enemy_3: {
    icon: "🍋",
    name: "Sour Power",
    description: "Defeat Sour Sam",
    unlocked: false,
  },
  enemy_4: {
    icon: "🗿",
    name: "Rock Crusher",
    description: "Defeat Rocky Road Roger",
    unlocked: false,
  },
  enemy_5: {
    icon: "🧠",
    name: "Mind Over Matter",
    description: "Defeat Brain Freeze Boss",
    unlocked: false,
  },

  // Character victory achievements - updated for all 5 fighters
  vanilla_victory: {
    icon: "🍦",
    name: "PinkMecha Champion",
    description: "Beat the game with PinkMecha",
    unlocked: false,
  },
  chocolate_victory: {
    icon: "🍫",
    name: "YellowMecha Champion",
    description: "Beat the game with YellowMecha",
    unlocked: false,
  },
  strawberry_victory: {
    icon: "🍓",
    name: "RedMecha Champion",
    description: "Beat the game with RedMecha",
    unlocked: false,
  },
  mint_victory: {
    icon: "🍃",
    name: "Mint Champion",
    description: "Beat the game with BlueMecha",
    unlocked: false,
  },
  pinkmecha_victory: {
    icon: "🎭",
    name: "PinkMecha Champion",
    description: "Beat the game with PinkMecha",
    unlocked: false,
  },

  // Level completion achievements
  level_1_complete: {
    icon: "🥉",
    name: "First Freeze",
    description: "Complete Level 1",
    unlocked: false,
  },
  level_2_complete: {
    icon: "🥈",
    name: "Sweet Success",
    description: "Complete Level 2",
    unlocked: false,
  },
  level_3_complete: {
    icon: "🥇",
    name: "Frozen Master",
    description: "Complete Level 3",
    unlocked: false,
  },
  level_4_complete: {
    icon: "💎",
    name: "Fusion Fighter",
    description: "Complete Level 4",
    unlocked: false,
  },
  level_5_complete: {
    icon: "👑",
    name: "Ultimate Champion",
    description: "Complete Level 5",
    unlocked: false,
  },

  // Stat milestone achievements
  attack_100: {
    icon: "⚔️",
    name: "Power House",
    description: "Train Attack above 100",
    unlocked: false,
  },
  defense_100: {
    icon: "🛡️",
    name: "Immovable",
    description: "Train Defense above 100",
    unlocked: false,
  },
  sanity_100: {
    icon: "🧠",
    name: "Zen Master",
    description: "Train Sanity above 100",
    unlocked: false,
  },
  hp_300: {
    icon: "❤️",
    name: "Tank Mode",
    description: "Train HP above 300",
    unlocked: false,
  },

  // Focused training achievements
  attack_only: {
    icon: "🎯",
    name: "Attack Focus",
    description: "Only train Attack in a session",
    unlocked: false,
  },
  defense_only: {
    icon: "🎯",
    name: "Defense Focus",
    description: "Only train Defense in a session",
    unlocked: false,
  },
  sanity_only: {
    icon: "🎯",
    name: "Sanity Focus",
    description: "Only train Sanity in a session",
    unlocked: false,
  },
  health_only: {
    icon: "🎯",
    name: "Health Focus",
    description: "Only train Health in a session",
    unlocked: false,
  },

  // Slot machine achievements
  slot_vanilla: {
    icon: "🍦",
    name: "PinkMecha Slots",
    description: "Win PinkMecha jackpot",
    unlocked: false,
  },
  slot_chocolate: {
    icon: "🍫",
    name: "YellowMecha Slots",
    description: "Win YellowMecha jackpot",
    unlocked: false,
  },
  slot_strawberry: {
    icon: "🍓",
    name: "RedMecha Slots",
    description: "Win RedMecha jackpot",
    unlocked: false,
  },
  slot_soft: {
    icon: "🍨",
    name: "Soft Serve Slots",
    description: "Win Soft Serve jackpot",
    unlocked: false,
  },
  slot_ice: {
    icon: "🧊",
    name: "Ice Slots",
    description: "Win Ice jackpot",
    unlocked: false,
  },
  slot_coin: {
    icon: "🪙",
    name: "Coin Slots",
    description: "Win Coin jackpot",
    unlocked: false,
  },
  slot_unlucky: {
    icon: "💸",
    name: "Unlucky Streak",
    description: "Lose 3 slot spins in a row",
    unlocked: false,
  },
};

// Audio configuration (keeping original)
const AUDIO_CONFIG = {
  music: {
    menu: "audio/music_menu.mp3",
    battle: "audio/music_battle.mp3",
    training: "audio/music_training.mp3",
    victory: "audio/music_victory.mp3",
    gameOver: "audio/music_game_over.mp3",
  },
  sounds: {
    // UI Sounds
    buttonClick: "audio/ui_button_click.mp3",
    buttonHover: "audio/ui_button_hover.mp3",
    screenTransition: "audio/ui_screen_transition.mp3",

    // Fighter Selection
    fighterSelect: "audio/fighter_select.mp3",

    // Battle Sounds
    battleStart: "audio/battle_start.mp3",
    battleWin: "audio/battle_win.mp3",
    takeDamage: "audio/take_damage.mp3",
    dealDamage: "audio/deal_damage.mp3",
    heal: "audio/heal.mp3",

    // Move sounds
    light: "audio/attack_light.mp3",
    heavy: "audio/attack_heavy.mp3",
    defend: "audio/defend.mp3",
    boost: "audio/boost.mp3",
    heal: "audio/heal.mp3", // NEW: Heal sound

    // Talk System
    talkStart: "audio/talk_start.mp3",
    talkSuccess: "audio/talk_success.mp3",
    talkFail: "audio/talk_fail.mp3",

    // Malfunction
    malfunction: "audio/malfunction.mp3",
    malfunctionRecover: "audio/malfunction_recover.mp3",

    // Training
    trainingStart: "audio/training_start.mp3",
    bubbleClick: "audio/cone_click.mp3", // Renamed from coneClick
    comboIncrease: "audio/combo_increase.mp3",
    trainingComplete: "audio/training_complete.mp3",

    // Slot machine sounds
    spin: "audio/slot_spin.mp3",
    win: "audio/slot_win.mp3",
    jackpot: "audio/slot_jackpot.mp3",

    // Upgrades
    upgradeApply: "audio/upgrade_apply.mp3",

    // Game End
    gameOverSound: "audio/game_over_sound.mp3",
    victorySound: "audio/victory_sound.mp3",

    // Achievement sound
    achievementUnlock: "audio/achievement_unlock.mp3",
  },
};

// Enhanced utility functions
const CONFIG_UTILS = {
  /**
   * Get a random element from an array
   */
  getRandomElement(array) {
    if (!Array.isArray(array) || array.length === 0) {
      console.warn("getRandomElement called with invalid array:", array);
      return null;
    }
    return array[Math.floor(Math.random() * array.length)];
  },

  /**
   * Get a simple random slot result using the new results array
   */
  getSlotResult() {
    return this.getRandomElement(SLOT_CONFIG.results);
  },

  /**
   * Get a weighted random symbol for slot machine (for reel spinning animation)
   */
  getWeightedSlotSymbol() {
    return this.getRandomElement(SLOT_CONFIG.symbols);
  },

  /**
   * Get a weighted random bubble type for training
   */
  getWeightedBubbleType() {
    const totalWeight = BUBBLE_TYPES.reduce(
      (sum, bubble) => sum + bubble.weight,
      0
    );
    let random = Math.random() * totalWeight;

    for (let i = 0; i < BUBBLE_TYPES.length; i++) {
      random -= BUBBLE_TYPES[i].weight;
      if (random <= 0) return BUBBLE_TYPES[i];
    }

    return BUBBLE_TYPES[0];
  },

  /**
   * Get a random training cone
   */
  getRandomTrainingCone() {
    return this.getRandomElement(TRAINING_CONES);
  },

  /**
   * Validate fighter type
   */
  isValidFighterType(fighterType) {
    return fighterType && FIGHTER_TEMPLATES.hasOwnProperty(fighterType);
  },

  /**
   * Validate move type
   */
  isValidMoveType(moveType) {
    return moveType && MOVE_DEFINITIONS.hasOwnProperty(moveType);
  },

  /**
   * Get level configuration
   */
  getLevelConfig(levelNumber) {
    if (levelNumber < 1 || levelNumber > GAME_CONFIG.TOTAL_LEVELS) {
      console.error(`Invalid level number: ${levelNumber}`);
      return null;
    }
    return LEVEL_CONFIG[levelNumber];
  },

  /**
   * Get enemy template for battle number with level scaling
   */
  getEnemyTemplate(battleNumber, levelNumber = 1) {
    if (battleNumber < 1 || battleNumber > ENEMY_TEMPLATES.length) {
      console.error(`Invalid battle number: ${battleNumber}`);
      return null;
    }

    const levelConfig = this.getLevelConfig(levelNumber);
    const baseEnemy = { ...ENEMY_TEMPLATES[battleNumber - 1] };

    if (levelConfig && levelConfig.enemyMultiplier !== 1.0) {
      // Scale enemy stats based on level difficulty
      baseEnemy.hp = Math.floor(baseEnemy.hp * levelConfig.enemyMultiplier);
      baseEnemy.maxHp = Math.floor(
        baseEnemy.maxHp * levelConfig.enemyMultiplier
      );
      baseEnemy.attack = Math.floor(
        baseEnemy.attack * levelConfig.enemyMultiplier
      );
      baseEnemy.defense = Math.floor(
        baseEnemy.defense * levelConfig.enemyMultiplier
      );
      baseEnemy.sanity = Math.floor(
        baseEnemy.sanity * levelConfig.enemyMultiplier
      );
      baseEnemy.maxSanity = Math.floor(
        baseEnemy.maxSanity * levelConfig.enemyMultiplier
      );
    }

    return baseEnemy;
  },

  /**
   * Clamp a value between min and max
   */
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  /**
   * Calculate damage with defense reduction
   */
  calculateDamage(baseDamage, defense = 0) {
    return Math.max(1, baseDamage - defense);
  },

  /**
   * Calculate total attack damage including player's attack stat
   */
  calculateTotalDamage(moveType, playerAttack) {
    const move = MOVE_DEFINITIONS[moveType];
    if (!move || move.damage === 0) return 0;
    return move.damage + playerAttack;
  },

  /**
   * Play audio file with error handling
   */
  playAudio(audioPath, volume = 1) {
    try {
      const audio = new Audio(audioPath);
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.play().catch((error) => {
        console.warn(`Could not play audio: ${audioPath}`, error);
      });
    } catch (error) {
      console.warn(`Error creating audio: ${audioPath}`, error);
    }
  },

  /**
   * Update image source with error handling
   */
  updateImage(imgElement, imagePath, altText = "") {
    if (!imgElement) return;

    imgElement.onerror = () => {
      console.warn(`Could not load image: ${imagePath}`);
    };

    imgElement.src = imagePath;
    if (altText) {
      imgElement.alt = altText;
    }
  },

  /**
   * Save achievements to localStorage
   */
  saveAchievements(achievements) {
    try {
      localStorage.setItem(
        "iceCreamFighterAchievements",
        JSON.stringify(achievements)
      );
    } catch (error) {
      console.warn("Could not save achievements:", error);
    }
  },

  /**
   * Load achievements from localStorage
   */
  loadAchievements() {
    try {
      const saved = localStorage.getItem("iceCreamFighterAchievements");
      if (saved) {
        const loadedAchievements = JSON.parse(saved);
        // Merge with default achievements to add any new ones
        return { ...ACHIEVEMENTS, ...loadedAchievements };
      }
    } catch (error) {
      console.warn("Could not load achievements:", error);
    }
    return { ...ACHIEVEMENTS };
  },
};

// Export for use in other files (if using modules)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    GAME_CONFIG,
    FIGHTER_TEMPLATES,
    ENEMY_TEMPLATES,
    LEVEL_CONFIG,
    MOVE_DEFINITIONS,
    FIGHTER_STATEMENTS,
    TALK_RESPONSES,
    MALFUNCTION_MESSAGES,
    TALKDOWN_OPTIONS,
    TRAINING_CONES,
    BUBBLE_TYPES,
    SLOT_CONFIG,
    TRAINING_REWARDS,
    ACHIEVEMENTS,
    AUDIO_CONFIG,
    CONFIG_UTILS,
  };
}
