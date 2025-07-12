// Game Configuration
const GAME_CONFIG = {
  // Game metadata
  title: "Mecha X Monster",
  version: "2.1.0",

  // Screen configurations
  screens: {
    start: {
      title: "Mecha X Monster",
      tagline: "Space Mining & Defense",
      subtitle: "Defend your mining operations from alien threats",
      buttonText: "START GAME",
    },

    "slime-defense": {
      title: "Slime Defense",
      subtitle: "Defend against alien slime invasion",
      playerStartHP: 10,
      maxPlayerHP: 10,
    },
  },

  // Animation settings
  animations: {
    starCount: 50,
    asteroidCount: 8,
    particleCount: 20,
    logoAnimationDuration: 3000,
    transitionDuration: 1000,
  },

  // Slime configurations for SlimeDefenseScreen
  slimes: {
    orange: {
      name: "Orange Slime",
      image: "images/slime-orange-1.png",
      hp: 2,
      coins: 1,
      speed: 1,
      color: "#FF8C00",
      description: "Basic slime with balanced stats",
    },
    teal: {
      name: "Teal Slime",
      image: "images/slime-teal-1.png",
      hp: 3,
      coins: 2,
      speed: 2,
      color: "#008B8B",
      description: "Fast slime with moderate health",
    },
    blue: {
      name: "Blue Slime",
      image: "images/slime-blue-1.png",
      hp: 5,
      coins: 5,
      speed: 1,
      color: "#0000FF",
      description: "Tough slime with high reward",
    },
    yellow: {
      name: "Yellow Slime",
      image: "images/slime-yellow-1.png",
      hp: 10,
      coins: 8,
      speed: 0.5,
      color: "#FFD700",
      description: "Heavily armored but slow",
    },
    alien: {
      name: "Alien Slime",
      image: "images/slime-alien-1.png",
      hp: 1,
      coins: 5,
      speed: 5,
      color: "#00FF00",
      description: "Fragile but extremely fast and valuable",
    },
  },

  // Audio configuration
  audio: {
    enabled: true,
    volume: {
      master: 0.7,
      music: 0.5,
      sfx: 0.8,
    },
    sounds: {
      "button-click": "audio/button-click.mp3",
      "logo-intro": "audio/logo-intro.mp3",
      "ui-appear": "audio/ui-appear.mp3",
      click: "audio/click.mp3",
      "game-complete": "audio/game-complete.mp3",
      "background-music": "audio/background-music.mp3",
      "energy-charge": "audio/energy-charge.mp3",
      "energy-full": "audio/energy-full.mp3",
      type: "audio/type.mp3",
      "game-start": "audio/game-start.mp3",
      "slime-hit": "audio/slime-hit.mp3",
      "slime-death": "audio/slime-death.mp3",
      "slime-escape": "audio/slime-escape.mp3",
      "game-over": "audio/game-over.mp3",
      success: "audio/success.mp3",
      "screen-transition": "audio/screen-transition.mp3",
      "ui-hover": "audio/ui-hover.mp3",
    },
  },

  // Visual settings
  visuals: {
    particles: {
      enabled: true,
      maxCount: 20,
      colors: ["#00ff88", "#00ccff", "#ffaa00", "#ff6b6b"],
      sizes: [1, 2, 3, 4],
    },

    effects: {
      screenShake: {
        enabled: true,
        duration: 300,
        intensity: 5,
      },

      backgroundParallax: {
        enabled: true,
        speed: 0.5,
      },

      bloom: {
        enabled: true,
        intensity: 0.8,
      },
    },
  },

  // Game difficulty settings
  difficulty: {
    normal: {
      slimeSpawnRate: 2000,
      slimeSpeedMultiplier: 1.0,
      slimeHPMultiplier: 1.0,
      playerHPMultiplier: 1.0,
      coinMultiplier: 1.0,
    },

    easy: {
      slimeSpawnRate: 3000,
      slimeSpeedMultiplier: 0.8,
      slimeHPMultiplier: 0.8,
      playerHPMultiplier: 1.5,
      coinMultiplier: 1.2,
    },

    hard: {
      slimeSpawnRate: 1500,
      slimeSpeedMultiplier: 1.3,
      slimeHPMultiplier: 1.2,
      playerHPMultiplier: 0.8,
      coinMultiplier: 1.5,
    },
  },

  // Mining system (for future screens)
  mines: {
    mine1: {
      name: "Rock Mine",
      currency: "shells",
      mecha: "green",
      unlocked: true,
      cost: 0,
      description: "Basic mining operation",
    },

    mine2: {
      name: "Ice Mine",
      currency: "shells",
      mecha: "blue",
      unlocked: false,
      cost: 100,
      description: "Frozen asteroid mining",
    },

    mine3: {
      name: "Crystal Mine",
      currency: "shells",
      mecha: "red",
      unlocked: false,
      cost: 250,
      description: "Rare crystal extraction",
    },

    mine4: {
      name: "Gas Mine",
      currency: "monster_shells",
      mecha: "yellow",
      unlocked: false,
      cost: 50,
      description: "Volatile gas harvesting",
    },

    mine5: {
      name: "Rare Earth Mine",
      currency: "monster_shells",
      mecha: "purple",
      unlocked: false,
      cost: 100,
      description: "Ultra-rare element mining",
    },
  },

  // Mecha configurations (for future screens)
  mechas: {
    green: {
      name: "Forest Guardian",
      type: "balanced",
      baseStats: {
        health: 100,
        attack: 25,
        defense: 20,
        speed: 15,
      },
      parts: ["green-1", "green-2", "green-3", "green-4", "green-5", "green-6"],
      description: "Balanced mecha suitable for most operations",
    },

    blue: {
      name: "Frost Titan",
      type: "tank",
      baseStats: {
        health: 150,
        attack: 20,
        defense: 35,
        speed: 10,
      },
      parts: ["blue-1", "blue-2", "blue-3", "blue-4", "blue-5", "blue-6"],
      description: "Heavy defensive mecha",
    },

    red: {
      name: "Flame Striker",
      type: "damage",
      baseStats: {
        health: 80,
        attack: 40,
        defense: 15,
        speed: 20,
      },
      parts: ["red-1", "red-2", "red-3", "red-4", "red-5", "red-6"],
      description: "High damage dealing mecha",
    },

    yellow: {
      name: "Lightning Ranger",
      type: "speed",
      baseStats: {
        health: 70,
        attack: 30,
        defense: 10,
        speed: 35,
      },
      parts: [
        "yellow-1",
        "yellow-2",
        "yellow-3",
        "yellow-4",
        "yellow-5",
        "yellow-6",
      ],
      description: "Fast and agile mecha",
    },

    purple: {
      name: "Void Phantom",
      type: "special",
      baseStats: {
        health: 120,
        attack: 35,
        defense: 25,
        speed: 25,
      },
      parts: [
        "purple-1",
        "purple-2",
        "purple-3",
        "purple-4",
        "purple-5",
        "purple-6",
      ],
      description: "Mysterious mecha with balanced high stats",
    },
  },

  // Performance settings
  performance: {
    maxParticles: 50,
    maxSlimes: 20,
    targetFPS: 60,
    enableVSync: true,
    qualitySettings: {
      high: {
        particles: true,
        shadows: true,
        bloom: true,
        antialiasing: true,
      },
      medium: {
        particles: true,
        shadows: false,
        bloom: true,
        antialiasing: false,
      },
      low: {
        particles: false,
        shadows: false,
        bloom: false,
        antialiasing: false,
      },
    },
  },

  // Development settings
  debug: {
    enabled: false,
    showFPS: false,
    showHitboxes: false,
    logLevel: "info", // "debug", "info", "warn", "error"
    enableConsoleCommands: true,
  },

  // Localization (for future expansion)
  localization: {
    defaultLanguage: "en",
    supportedLanguages: ["en"],
    texts: {
      en: {
        "start.title": "Mecha X Monster",
        "start.tagline": "Space Mining & Defense",
        "start.subtitle": "Defend your mining operations from alien threats",
        "start.startGame": "START GAME",
        "slimeDefense.title": "Slime Defense",
        "slimeDefense.gameOver": "Game Over!",
        "slimeDefense.playAgain": "Play Again",
        "slimeDefense.mainMenu": "Main Menu",
        "ui.loading": "Loading...",
        "ui.ready": "Ready!",
        "ui.error": "Error",
      },
    },
  },
};

// Utility functions for accessing config
const GameConfig = {
  get: (path, defaultValue = null) => {
    const keys = path.split(".");
    let current = GAME_CONFIG;

    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        return defaultValue;
      }
    }

    return current;
  },

  set: (path, value) => {
    const keys = path.split(".");
    let current = GAME_CONFIG;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== "object") {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  },

  getSlimeConfig: (slimeType) => {
    return GAME_CONFIG.slimes[slimeType] || null;
  },

  getMechaConfig: (mechaType) => {
    return GAME_CONFIG.mechas[mechaType] || null;
  },

  getAudioConfig: () => {
    return GAME_CONFIG.audio;
  },

  getDifficultyConfig: (difficulty = "normal") => {
    return GAME_CONFIG.difficulty[difficulty] || GAME_CONFIG.difficulty.normal;
  },

  isDebugEnabled: () => {
    return GAME_CONFIG.debug.enabled;
  },

  getPerformanceSettings: (quality = "high") => {
    return (
      GAME_CONFIG.performance.qualitySettings[quality] ||
      GAME_CONFIG.performance.qualitySettings.high
    );
  },
};

// Make available globally
window.GAME_CONFIG = GAME_CONFIG;
window.GameConfig = GameConfig;

console.log("🎮 Game configuration loaded successfully!");
console.log("📊 Available slimes:", Object.keys(GAME_CONFIG.slimes));
console.log("🤖 Available mechas:", Object.keys(GAME_CONFIG.mechas));
