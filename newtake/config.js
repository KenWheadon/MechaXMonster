// Game Configuration
const GAME_CONFIG = {
    STARTING_CURRENCY: 5,
    LEVEL_COUNT: 5,
    PACHINKO_BOARD_WIDTH: 600,
    PACHINKO_BOARD_HEIGHT: 400,
    PEG_COUNT: 12,
    CONTAINER_COUNT: 6,
    GRAVITY: 0.5,
    BOUNCE_FACTOR: 0.7,
    PHYSICS_TIMEOUT: 10000,
    ANIMATION_DURATION: 1000
};

// Level Templates
const LEVEL_TEMPLATES = {
    1: {
        name: "Tiger Plains",
        mecha: { emoji: "🐅", name: "Tiger Mecha" },
        slime: { emoji: "🟢", name: "Bubble Slime", baseHealth: 50 },
        unlockCost: 0
    },
    2: {
        name: "Bunny Hills",
        mecha: { emoji: "🐰", name: "Bunny Mecha" },
        slime: { emoji: "🔵", name: "Wiggly Slime", baseHealth: 60 },
        unlockCost: 20
    },
    3: {
        name: "Octopus Depths",
        mecha: { emoji: "🐙", name: "Octopus Mecha" },
        slime: { emoji: "🟣", name: "Spiky Slime", baseHealth: 70 },
        unlockCost: 30
    },
    4: {
        name: "Dragon Peak",
        mecha: { emoji: "🐉", name: "Dragon Mecha" },
        slime: { emoji: "🟡", name: "Golden Slime", baseHealth: 80 },
        unlockCost: 40
    },
    5: {
        name: "Phoenix Crater",
        mecha: { emoji: "🔥", name: "Phoenix Mecha" },
        slime: { emoji: "🟠", name: "Magma Slime", baseHealth: 90 },
        unlockCost: 50
    }
};

// Attack Templates
const ATTACK_TEMPLATES = [
    { name: "Laser Blast", damage: 10, emoji: "⚡" },
    { name: "Rocket Punch", damage: 15, emoji: "🚀" },
    { name: "Tail Spin", damage: 12, emoji: "🌪️" }
];

// Multiplier Templates
const MULTIPLIER_TEMPLATES = [
    { name: "x2", multiplier: 2 },
    { name: "x3", multiplier: 3 },
    { name: "x1", multiplier: 1 }
];

// Cosmetic Templates
const COSMETIC_TEMPLATES = {
    excavator: {
        name: "Twinkling Stars",
        cost: 5,
        emoji: "⭐",
        description: "Add sparkly stars to the background"
    },
    disco: {
        name: "Disco Lights",
        cost: 10,
        emoji: "🕺",
        description: "Flashy disco lighting effects"
    },
    duck: {
        name: "Space Duck",
        cost: 15,
        emoji: "🦆",
        description: "A giant rubber duck floats by"
    }
};

// Utility Functions
const CONFIG_UTILS = {
    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    },
    
    createEntity(templateName) {
        return { ...LEVEL_TEMPLATES[templateName] };
    },
    
    calculateSlimeHealth(baseHealth, wave) {
        return baseHealth + (wave - 1) * 10;
    },
    
    calculateCoinsEarned(wave) {
        return (wave - 1) * 2 + 5;
    }
};