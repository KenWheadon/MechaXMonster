// Battle Module - Combat System
class Battle {
  constructor(game) {
    this.game = game;
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Move button listeners
    const moveButtons = [
      "light-attack-btn",
      "heavy-attack-btn",
      "defend-btn",
      "rest-btn",
    ];
    moveButtons.forEach((btnId) => {
      const btn = document.getElementById(btnId);
      if (btn) {
        const moveType = btnId.replace("-btn", "").replace("-attack", "");
        btn.addEventListener("click", () => this.mechaMove(moveType));
      }
    });
  }

  startCombat() {
    this.game.gameState.combat.active = true;
    this.game.gameState.combat.battlePhase = 1;
    this.game.gameState.combat.turn = "player";

    // Initialize combat stats
    this.initializeCombatStats();

    // Switch to combat screen
    this.game.showScreen("combat-screen");
    this.setupCombatScreen();

    const config = this.game.getCurrentMineConfig();
    this.game.logMessage(
      `⚔️ Combat begins! ${config.mecha} Mecha vs ${config.monster}!`,
      "combat"
    );
  }

  initializeCombatStats() {
    const config = this.game.getCurrentMineConfig();
    const mechaData = this.game.getCurrentMechaData();

    // Calculate mecha stats based on built mechas
    const mechaBonus = mechaData.built;
    this.game.gameState.combat.mechaStats = {
      hp: GAME_CONFIG.BASE_MECHA_HP + mechaBonus * 25,
      maxHp: GAME_CONFIG.BASE_MECHA_HP + mechaBonus * 25,
      energy: GAME_CONFIG.BASE_MECHA_ENERGY + mechaBonus * 2,
      maxEnergy: GAME_CONFIG.BASE_MECHA_ENERGY + mechaBonus * 2,
      attack: GAME_CONFIG.BASE_MECHA_ATTACK + mechaBonus * 3,
      defense: GAME_CONFIG.BASE_MECHA_DEFENSE + mechaBonus * 2,
      defending: false,
    };

    // Calculate monster stats based on current mine (scaling difficulty)
    const mineLevel = this.game.gameState.currentMine;
    const monsterScaling = 1 + (mineLevel - 1) * 0.5;

    this.game.gameState.combat.monsterStats = {
      hp: Math.floor(80 * monsterScaling),
      maxHp: Math.floor(80 * monsterScaling),
      energy: Math.floor(10 * monsterScaling),
      maxEnergy: Math.floor(10 * monsterScaling),
      attack: Math.floor(12 * monsterScaling),
      defense: Math.floor(5 * monsterScaling),
      defending: false,
    };
  }

  setupCombatScreen() {
    const config = this.game.getCurrentMineConfig();
    const mechaStats = this.game.gameState.combat.mechaStats;
    const monsterStats = this.game.gameState.combat.monsterStats;

    // Update fighter names
    this.game.updateElement("mecha-name", `${config.mecha} Mecha`);
    this.game.updateElement("monster-name", config.monster);

    // Update mecha stats display
    this.updateFighterStats("mecha", mechaStats);
    this.updateFighterStats("monster", monsterStats);

    // Update combat UI
    this.updateCombatUI();
  }

  updateFighterStats(fighterType, stats) {
    // Update HP
    this.game.updateElement(`${fighterType}-hp`, stats.hp);
    this.game.updateElement(`${fighterType}-max-hp`, stats.maxHp);
    this.game.updateStatBar(`${fighterType}-hp-bar`, stats.hp, stats.maxHp);

    // Update Energy
    this.game.updateElement(`${fighterType}-energy`, stats.energy);
    this.game.updateElement(`${fighterType}-max-energy`, stats.maxEnergy);
    this.game.updateStatBar(
      `${fighterType}-energy-bar`,
      stats.energy,
      stats.maxEnergy
    );
  }

  updateCombatUI() {
    const mechaStats = this.game.gameState.combat.mechaStats;
    const isPlayerTurn = this.game.gameState.combat.turn === "player";

    // Update move button states based on energy and turn
    document.getElementById("light-attack-btn").disabled =
      !isPlayerTurn || mechaStats.energy < COMBAT_MOVES.light.energyCost;
    document.getElementById("heavy-attack-btn").disabled =
      !isPlayerTurn || mechaStats.energy < COMBAT_MOVES.heavy.energyCost;
    document.getElementById("defend-btn").disabled =
      !isPlayerTurn || mechaStats.energy < COMBAT_MOVES.defend.energyCost;
    document.getElementById("rest-btn").disabled = !isPlayerTurn;
  }

  mechaMove(moveType) {
    if (this.game.gameState.combat.turn !== "player") {
      return;
    }

    const moveConfig =
      COMBAT_MOVES[moveType] || COMBAT_MOVES[moveType.replace("-", "")];
    if (!moveConfig) {
      this.game.logMessage(`❌ Invalid move: ${moveType}`, "combat");
      return;
    }

    const mechaStats = this.game.gameState.combat.mechaStats;
    const monsterStats = this.game.gameState.combat.monsterStats;

    // Check energy cost
    if (mechaStats.energy < moveConfig.energyCost) {
      this.game.logMessage("❌ Not enough energy!", "combat");
      return;
    }

    // Execute the move
    this.executeMechaMove(moveType, moveConfig);

    // Update UI
    this.updateFighterStats("mecha", mechaStats);
    this.updateFighterStats("monster", monsterStats);

    // Check for victory
    if (monsterStats.hp <= 0) {
      this.winCombat();
      return;
    }

    // Switch to monster turn
    this.game.gameState.combat.turn = "monster";
    this.updateCombatUI();

    setTimeout(() => this.monsterTurn(), 1500);
  }

  executeMechaMove(moveType, moveConfig) {
    const mechaStats = this.game.gameState.combat.mechaStats;
    const monsterStats = this.game.gameState.combat.monsterStats;
    const config = this.game.getCurrentMineConfig();

    // Consume energy
    mechaStats.energy -= moveConfig.energyCost;

    // Add attack animation
    this.game.addSpriteAnimation("mecha-sprite", "attacking");

    let message = `${config.mecha} Mecha uses ${moveConfig.name}!`;

    switch (moveType) {
      case "light":
      case "light-attack":
        const lightDamage =
          moveConfig.baseDamage +
          mechaStats.attack +
          Math.floor(Math.random() * 10);
        const finalLightDamage = Math.max(
          1,
          lightDamage -
            (monsterStats.defending
              ? monsterStats.defense * 2
              : monsterStats.defense)
        );

        if (!monsterStats.defending) {
          monsterStats.hp = Math.max(0, monsterStats.hp - finalLightDamage);
          message += ` Deals ${finalLightDamage} damage!`;
          this.game.addSpriteAnimation("monster-sprite", "hit");
        } else {
          message += ` Blocked by monster's defense!`;
        }
        break;

      case "heavy":
      case "heavy-attack":
        const heavyDamage =
          moveConfig.baseDamage +
          mechaStats.attack +
          Math.floor(Math.random() * 15);
        const finalHeavyDamage = Math.max(
          1,
          heavyDamage -
            (monsterStats.defending
              ? monsterStats.defense * 2
              : monsterStats.defense)
        );

        if (!monsterStats.defending) {
          monsterStats.hp = Math.max(0, monsterStats.hp - finalHeavyDamage);
          message += ` Deals ${finalHeavyDamage} damage!`;
          this.game.addSpriteAnimation("monster-sprite", "hit");
        } else {
          message += ` Blocked by monster's defense!`;
        }
        break;

      case "defend":
        mechaStats.defending = true;
        mechaStats.defense += moveConfig.defenseBoost;
        message += ` Defense increased!`;
        break;

      case "rest":
        const energyRestore = Math.floor(
          mechaStats.maxEnergy * moveConfig.energyRestore
        );
        mechaStats.energy = Math.min(
          mechaStats.maxEnergy,
          mechaStats.energy + energyRestore
        );
        message += ` Energy restored by ${energyRestore}!`;
        break;
    }

    this.game.logMessage(message, "combat");
  }

  monsterTurn() {
    const mechaStats = this.game.gameState.combat.mechaStats;
    const monsterStats = this.game.gameState.combat.monsterStats;
    const config = this.game.getCurrentMineConfig();

    // Reset monster defending state
    if (monsterStats.defending) {
      monsterStats.defending = false;
      monsterStats.defense -= COMBAT_MOVES.defend.defenseBoost;
    }

    // Simple AI - choose move based on situation
    let chosenMove = this.chooseMonsterMove();
    let moveConfig = COMBAT_MOVES[chosenMove];

    // Check if monster has enough energy
    if (monsterStats.energy < moveConfig.energyCost) {
      chosenMove = "rest";
      moveConfig = COMBAT_MOVES.rest;
    }

    // Execute monster move
    this.executeMonsterMove(chosenMove, moveConfig);

    // Update UI
    this.updateFighterStats("mecha", mechaStats);
    this.updateFighterStats("monster", monsterStats);

    // Check for defeat
    if (mechaStats.hp <= 0) {
      this.loseCombat();
      return;
    }

    // Reset mecha defending state
    if (mechaStats.defending) {
      mechaStats.defending = false;
      mechaStats.defense -= COMBAT_MOVES.defend.defenseBoost;
    }

    // Return to player turn
    this.game.gameState.combat.turn = "player";
    this.updateCombatUI();
  }

  chooseMonsterMove() {
    const monsterStats = this.game.gameState.combat.monsterStats;
    const mechaStats = this.game.gameState.combat.mechaStats;

    // Simple AI logic
    if (monsterStats.energy < 4) {
      return "rest"; // Need energy
    }

    if (monsterStats.hp < monsterStats.maxHp * 0.3) {
      return "defend"; // Low health, play defensive
    }

    if (mechaStats.hp < mechaStats.maxHp * 0.5) {
      return "heavy"; // Player is weak, go for kill
    }

    // Random choice between attacks
    return Math.random() < 0.6 ? "light" : "heavy";
  }

  executeMonsterMove(moveType, moveConfig) {
    const mechaStats = this.game.gameState.combat.mechaStats;
    const monsterStats = this.game.gameState.combat.monsterStats;
    const config = this.game.getCurrentMineConfig();

    // Consume energy
    monsterStats.energy -= moveConfig.energyCost;

    // Add attack animation
    this.game.addSpriteAnimation("monster-sprite", "attacking");

    let message = `${config.monster} uses ${moveConfig.name}!`;

    switch (moveType) {
      case "light":
        const lightDamage =
          moveConfig.baseDamage +
          monsterStats.attack +
          Math.floor(Math.random() * 8);
        const finalLightDamage = Math.max(
          1,
          lightDamage -
            (mechaStats.defending ? mechaStats.defense * 2 : mechaStats.defense)
        );

        if (!mechaStats.defending) {
          mechaStats.hp = Math.max(0, mechaStats.hp - finalLightDamage);
          message += ` Deals ${finalLightDamage} damage!`;
          this.game.addSpriteAnimation("mecha-sprite", "hit");
        } else {
          message += ` Blocked by mecha's defense!`;
        }
        break;

      case "heavy":
        const heavyDamage =
          moveConfig.baseDamage +
          monsterStats.attack +
          Math.floor(Math.random() * 12);
        const finalHeavyDamage = Math.max(
          1,
          heavyDamage -
            (mechaStats.defending ? mechaStats.defense * 2 : mechaStats.defense)
        );

        if (!mechaStats.defending) {
          mechaStats.hp = Math.max(0, mechaStats.hp - finalHeavyDamage);
          message += ` Deals ${finalHeavyDamage} damage!`;
          this.game.addSpriteAnimation("mecha-sprite", "hit");
        } else {
          message += ` Blocked by mecha's defense!`;
        }
        break;

      case "defend":
        monsterStats.defending = true;
        monsterStats.defense += moveConfig.defenseBoost;
        message += ` Defense increased!`;
        break;

      case "rest":
        const energyRestore = Math.floor(
          monsterStats.maxEnergy * moveConfig.energyRestore
        );
        monsterStats.energy = Math.min(
          monsterStats.maxEnergy,
          monsterStats.energy + energyRestore
        );
        message += ` Energy restored by ${energyRestore}!`;
        break;
    }

    this.game.logMessage(message, "combat");
  }

  winCombat() {
    // Check if this is the final boss
    if (this.checkFinalBossVictory()) {
      return;
    }

    // Regular combat victory logic
    const config = this.game.getCurrentMineConfig();
    const reward = CONFIG_UTILS.calculateCombatReward(true);
    const monsterCurrencyKey = CONFIG_UTILS.getMonsterCurrencyKey(
      config.currency
    );

    // Award monster currency
    this.game.addCurrency(monsterCurrencyKey, reward);

    this.game.logMessage(
      `🎉 Victory! Earned ${reward} ${this.game.getCurrencyIcon(
        monsterCurrencyKey
      )}!`,
      "success"
    );

    // Mark boss as defeated (first time only)
    this.game.defeatBoss(this.game.gameState.currentMine);

    // Check if all bosses defeated for final boss unlock
    if (this.game.gameState.defeatedBosses.length >= 5) {
      setTimeout(() => {
        this.game.showScreen("final-boss-screen");
      }, 2000);
      return;
    }

    // Advance to next battle phase or complete mine
    this.advanceBattlePhase();
  }

  loseCombat() {
    const config = this.game.getCurrentMineConfig();
    const baseReward = CONFIG_UTILS.calculateCombatReward(false);
    const monsterCurrencyKey = CONFIG_UTILS.getMonsterCurrencyKey(
      config.currency
    );

    // Still get base reward but lose mecha
    this.game.addCurrency(monsterCurrencyKey, baseReward);

    // Destroy one mecha
    const mechaData = this.game.getCurrentMechaData();
    if (mechaData.built > 0) {
      mechaData.built--;
      this.game.logMessage(
        `💥 ${
          config.mecha
        } Mecha destroyed! Earned ${baseReward} ${this.game.getCurrencyIcon(
          monsterCurrencyKey
        )}`,
        "combat"
      );
    }

    // Advance to next battle phase
    this.advanceBattlePhase();
  }

  advanceBattlePhase() {
    this.game.gameState.combat.battlePhase++;

    if (this.game.gameState.combat.battlePhase > GAME_CONFIG.BATTLES_PER_MINE) {
      // Completed all battles for this mine
      this.game.logMessage(
        "🏆 All battles completed for this mine!",
        "success"
      );
      setTimeout(() => {
        this.game.showScreen("mining-screen");
      }, 2000);
    } else {
      // Proceed to training before next battle
      setTimeout(() => {
        this.game.showScreen("training-screen");
        this.game.training.startTraining();
      }, 2000);
    }
  }

  startFinalBoss() {
    this.game.gameState.combat.active = true;
    this.game.gameState.combat.turn = "player";

    // Set up ultimate mecha stats
    this.game.gameState.combat.mechaStats = {
      hp: GAME_CONFIG.ULTIMATE_MECHA_HP,
      maxHp: GAME_CONFIG.ULTIMATE_MECHA_HP,
      energy: GAME_CONFIG.ULTIMATE_MECHA_ENERGY,
      maxEnergy: GAME_CONFIG.ULTIMATE_MECHA_ENERGY,
      attack: GAME_CONFIG.ULTIMATE_MECHA_ATTACK,
      defense: GAME_CONFIG.ULTIMATE_MECHA_DEFENSE,
      defending: false,
    };

    // Set up final boss stats
    this.game.gameState.combat.monsterStats = {
      hp: GAME_CONFIG.FINAL_BOSS_HP,
      maxHp: GAME_CONFIG.FINAL_BOSS_HP,
      energy: GAME_CONFIG.FINAL_BOSS_ENERGY,
      maxEnergy: GAME_CONFIG.FINAL_BOSS_ENERGY,
      attack: GAME_CONFIG.FINAL_BOSS_ATTACK,
      defense: GAME_CONFIG.FINAL_BOSS_DEFENSE,
      defending: false,
    };

    this.game.showScreen("combat-screen");

    // Update display for final boss
    this.game.updateElement("mecha-name", "Ultimate Mecha");
    this.game.updateElement("monster-name", "👑 Slime King 👑");

    this.updateFighterStats("mecha", this.game.gameState.combat.mechaStats);
    this.updateFighterStats("monster", this.game.gameState.combat.monsterStats);

    this.updateCombatUI();
    this.game.logMessage(
      "👑 The final battle begins! Defeat the Slime King!",
      "combat"
    );
  }

  // Override win condition for final boss
  checkFinalBossVictory() {
    const monsterStats = this.game.gameState.combat.monsterStats;

    if (
      monsterStats.maxHp >= GAME_CONFIG.FINAL_BOSS_HP &&
      monsterStats.hp <= 0
    ) {
      // Final boss defeated
      this.game.logMessage(
        "🎉 SLIME KING DEFEATED! THE COLONY IS SAVED!",
        "success"
      );
      setTimeout(() => {
        this.game.showScreen("victory-screen");
      }, 2000);
      return true;
    }

    return false;
  }

  // Combat state management
  resetCombat() {
    this.game.gameState.combat = {
      active: false,
      battlePhase: 1,
      mechaStats: {},
      monsterStats: {},
      turn: "player",
    };
  }

  // Helper function to get move type from button ID
  getMoveTypeFromButton(buttonId) {
    const moveMap = {
      "light-attack-btn": "light",
      "heavy-attack-btn": "heavy",
      "defend-btn": "defend",
      "rest-btn": "rest",
    };

    return moveMap[buttonId] || buttonId.replace("-btn", "");
  }

  // Combat difficulty scaling
  calculateMonsterDifficulty(mineLevel, battlePhase) {
    const baseScaling = 1 + (mineLevel - 1) * 0.3;
    const phaseScaling = 1 + (battlePhase - 1) * 0.1;
    return baseScaling * phaseScaling;
  }

  // Enhanced monster AI for different difficulty levels
  chooseMonsterMoveAdvanced() {
    const monsterStats = this.game.gameState.combat.monsterStats;
    const mechaStats = this.game.gameState.combat.mechaStats;
    const battlePhase = this.game.gameState.combat.battlePhase;

    // Higher difficulty = smarter AI
    if (battlePhase >= 4) {
      // Smart AI for later battles
      return this.smartMonsterAI(monsterStats, mechaStats);
    } else if (battlePhase >= 2) {
      // Moderate AI
      return this.moderateMonsterAI(monsterStats, mechaStats);
    } else {
      // Simple AI for first battle
      return this.simpleMonsterAI(monsterStats, mechaStats);
    }
  }

  simpleMonsterAI(monsterStats, mechaStats) {
    if (monsterStats.energy < 2) return "rest";
    return Math.random() < 0.7 ? "light" : "heavy";
  }

  moderateMonsterAI(monsterStats, mechaStats) {
    if (monsterStats.energy < 4) return "rest";

    if (monsterStats.hp < monsterStats.maxHp * 0.4) {
      return Math.random() < 0.5 ? "defend" : "heavy";
    }

    if (mechaStats.hp < mechaStats.maxHp * 0.3) {
      return "heavy"; // Go for the kill
    }

    // Balanced choice
    const choice = Math.random();
    if (choice < 0.4) return "light";
    if (choice < 0.7) return "heavy";
    if (choice < 0.9) return "defend";
    return "rest";
  }

  smartMonsterAI(monsterStats, mechaStats) {
    // Advanced AI logic for final battles
    const hpRatio = monsterStats.hp / monsterStats.maxHp;
    const mechaHpRatio = mechaStats.hp / mechaStats.maxHp;
    const energyRatio = monsterStats.energy / monsterStats.maxEnergy;

    // Energy management
    if (energyRatio < 0.3) return "rest";

    // Defensive when low health
    if (hpRatio < 0.25) {
      return Math.random() < 0.6 ? "defend" : "heavy";
    }

    // Aggressive when player is weak
    if (mechaHpRatio < 0.3) {
      return monsterStats.energy >= 4 ? "heavy" : "light";
    }

    // Strategic choices based on energy and health
    if (hpRatio > 0.7 && energyRatio > 0.6) {
      return Math.random() < 0.6 ? "heavy" : "light";
    }

    if (hpRatio < 0.5) {
      return Math.random() < 0.4 ? "defend" : "light";
    }

    // Balanced approach
    const choice = Math.random();
    if (choice < 0.3) return "light";
    if (choice < 0.6) return "heavy";
    if (choice < 0.8) return "defend";
    return "rest";
  }

  // Battle statistics tracking
  getBattleStats() {
    return {
      currentBattle: this.game.gameState.combat.battlePhase,
      totalBattles: GAME_CONFIG.BATTLES_PER_MINE,
      currentMine: this.game.gameState.currentMine,
      defeatedBosses: this.game.gameState.defeatedBosses.length,
      mechaBuilt: this.game.getCurrentMechaData().built,
    };
  }

  // Enhanced logging for combat events
  logCombatEvent(event, details = {}) {
    const timestamp = new Date().toLocaleTimeString();
    const battleStats = this.getBattleStats();

    let message = `[${timestamp}] ${event}`;

    if (details.damage) {
      message += ` (${details.damage} damage)`;
    }

    if (details.healing) {
      message += ` (${details.healing} restored)`;
    }

    this.game.logMessage(message, "combat");
  }

  // Visual effects for combat
  addCombatEffect(effectType, target = "both") {
    const mechaSprite = document.getElementById("mecha-sprite");
    const monsterSprite = document.getElementById("monster-sprite");

    switch (effectType) {
      case "damage":
        if (target === "mecha" || target === "both") {
          this.game.addSpriteAnimation("mecha-sprite", "hit");
        }
        if (target === "monster" || target === "both") {
          this.game.addSpriteAnimation("monster-sprite", "hit");
        }
        break;

      case "attack":
        if (target === "mecha" || target === "both") {
          this.game.addSpriteAnimation("mecha-sprite", "attacking");
        }
        if (target === "monster" || target === "both") {
          this.game.addSpriteAnimation("monster-sprite", "attacking");
        }
        break;

      case "defend":
        // Add shield effect or similar
        if (target === "mecha") {
          mechaSprite.style.filter =
            "brightness(1.2) drop-shadow(0 0 10px #3498db)";
          setTimeout(() => {
            mechaSprite.style.filter = "";
          }, 1000);
        }
        if (target === "monster") {
          monsterSprite.style.filter =
            "brightness(1.2) drop-shadow(0 0 10px #e74c3c)";
          setTimeout(() => {
            monsterSprite.style.filter = "";
          }, 1000);
        }
        break;
    }
  }

  // Combat tutorial hints for new players
  showCombatHint() {
    const battlePhase = this.game.gameState.combat.battlePhase;
    const mechaStats = this.game.gameState.combat.mechaStats;

    if (battlePhase === 1) {
      this.game.logMessage(
        "💡 Tip: Use light attacks to conserve energy, heavy attacks for more damage!"
      );
    } else if (battlePhase === 2 && mechaStats.energy < 4) {
      this.game.logMessage(
        "💡 Tip: Use Rest to recover energy when you're running low!"
      );
    } else if (battlePhase === 3) {
      this.game.logMessage(
        "💡 Tip: Defend reduces incoming damage - use it when the monster is about to attack!"
      );
    }
  }
}
