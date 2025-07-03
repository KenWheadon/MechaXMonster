// Training Module - Bubble Clicker Mini-game and Upgrades
class Training {
  constructor(game) {
    this.game = game;
    this.trainingTimer = null;
    this.bubbleSpawnTimer = null;
    this.activeBubbles = [];
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Training upgrade buttons
    const upgradeTypes = ["attack", "defense", "hp", "energy"];
    upgradeTypes.forEach((type) => {
      const btn = document.querySelector(
        `[onclick*="buyTrainingUpgrade('${type}')"]`
      );
      if (btn) {
        btn.addEventListener("click", () => this.buyTrainingUpgrade(type));
      }
    });

    // Slot machine button
    const slotBtn = document.querySelector('[onclick*="spinTrainingSlots"]');
    if (slotBtn) {
      slotBtn.addEventListener("click", () => this.spinTrainingSlots());
    }

    // Continue button
    const continueBtn = document.querySelector(
      '[onclick*="continueAfterTraining"]'
    );
    if (continueBtn) {
      continueBtn.addEventListener("click", () => this.continueAfterTraining());
    }

    // Bubble area click handling
    const bubbleArea = document.getElementById("bubble-area");
    if (bubbleArea) {
      bubbleArea.addEventListener("click", (e) => this.handleBubbleClick(e));
    }
  }

  startTraining() {
    // Reset training state
    this.game.gameState.training = {
      active: true,
      score: 0,
      combo: 0,
      timeLeft: GAME_CONFIG.TRAINING_TIME,
      currency: 0,
      upgradeCosts: { ...TRAINING_UPGRADES },
      slotCost: 10,
    };

    // Clear previous bubbles
    this.clearBubbles();

    // Update UI
    this.updateTrainingDisplay();

    // Hide training complete section
    const trainingComplete = document.getElementById("training-complete");
    if (trainingComplete) {
      trainingComplete.style.display = "none";
    }

    // Start training timer
    this.startTrainingTimer();

    // Start spawning bubbles
    this.startBubbleSpawning();

    this.game.logMessage(
      "🎯 Training started! Click the bubbles quickly!",
      "success"
    );
  }

  startTrainingTimer() {
    let timeLeft = GAME_CONFIG.TRAINING_TIME;

    this.trainingTimer = setInterval(() => {
      timeLeft--;
      this.game.gameState.training.timeLeft = timeLeft;
      this.game.updateElement("training-time", timeLeft);

      if (timeLeft <= 0) {
        this.endTraining();
      }
    }, 1000);
  }

  startBubbleSpawning() {
    this.bubbleSpawnTimer = setInterval(() => {
      if (this.game.gameState.training.active) {
        this.spawnBubble();
      }
    }, 600 + Math.random() * 400); // Spawn every 600-1000ms
  }

  spawnBubble() {
    const bubbleArea = document.getElementById("bubble-area");
    if (!bubbleArea || this.activeBubbles.length >= GAME_CONFIG.MAX_BUBBLES) {
      return;
    }

    // Get random bubble type
    const bubbleType = CONFIG_UTILS.getRandomBubbleType();

    // Create bubble element
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.dataset.points = bubbleType.points;
    bubble.textContent = bubbleType.emoji;

    // Position bubble randomly
    const maxX = bubbleArea.offsetWidth - 60;
    const maxY = bubbleArea.offsetHeight - 60;
    bubble.style.left = Math.random() * maxX + "px";
    bubble.style.top = Math.random() * maxY + "px";

    // Add to bubble area
    bubbleArea.appendChild(bubble);
    this.activeBubbles.push(bubble);

    // Remove bubble after lifetime
    setTimeout(() => {
      if (bubble.parentNode) {
        this.removeBubble(bubble, false);
      }
    }, GAME_CONFIG.BUBBLE_LIFETIME);
  }

  handleBubbleClick(event) {
    if (event.target.classList.contains("bubble")) {
      this.clickBubble(event.target);
    }
  }

  clickBubble(bubble) {
    if (!this.game.gameState.training.active) return;

    const points = parseInt(bubble.dataset.points) || 1;

    // Increment combo and calculate total points
    this.game.gameState.training.combo++;
    const comboMultiplier = Math.min(this.game.gameState.training.combo, 10);
    const totalPoints = points * comboMultiplier;

    // Add to score
    this.game.gameState.training.score += totalPoints;

    // Visual feedback
    this.showPointsGained(bubble, totalPoints);

    // Remove bubble
    this.removeBubble(bubble, true);

    // Update display
    this.updateTrainingDisplay();

    // Log combo milestones
    if (this.game.gameState.training.combo % 5 === 0) {
      this.game.logMessage(
        `🔥 Combo x${this.game.gameState.training.combo}! Keep it up!`,
        "success"
      );
    }
  }

  showPointsGained(bubble, points) {
    const pointsDisplay = document.createElement("div");
    pointsDisplay.textContent = `+${points}`;
    pointsDisplay.style.cssText = `
            position: absolute;
            left: ${bubble.style.left};
            top: ${bubble.style.top};
            color: #f39c12;
            font-weight: bold;
            font-size: 18px;
            pointer-events: none;
            z-index: 1000;
            animation: fadeIn 0.3s ease-out forwards;
        `;

    bubble.parentNode.appendChild(pointsDisplay);

    // Animate points floating up
    setTimeout(() => {
      pointsDisplay.style.transform = "translateY(-30px)";
      pointsDisplay.style.opacity = "0";
      pointsDisplay.style.transition = "all 0.8s ease-out";
    }, 100);

    // Remove after animation
    setTimeout(() => {
      if (pointsDisplay.parentNode) {
        pointsDisplay.parentNode.removeChild(pointsDisplay);
      }
    }, 1000);
  }

  removeBubble(bubble, wasClicked) {
    const index = this.activeBubbles.indexOf(bubble);
    if (index > -1) {
      this.activeBubbles.splice(index, 1);
    }

    if (bubble.parentNode) {
      bubble.parentNode.removeChild(bubble);
    }

    // Reset combo if bubble expired (not clicked)
    if (!wasClicked && this.game.gameState.training.combo > 0) {
      this.game.gameState.training.combo = 0;
      this.game.logMessage("💥 Combo lost! Click faster!", "combat");
      this.updateTrainingDisplay();
    }
  }

  clearBubbles() {
    const bubbleArea = document.getElementById("bubble-area");
    if (bubbleArea) {
      bubbleArea.innerHTML = "";
    }
    this.activeBubbles = [];
  }

  updateTrainingDisplay() {
    const training = this.game.gameState.training;

    this.game.updateElement("training-score", training.score);
    this.game.updateElement("training-combo", training.combo);
    this.game.updateElement("training-time", training.timeLeft);

    if (training.currency !== undefined) {
      this.game.updateElement("final-training-score", training.currency);
    }
  }

  endTraining() {
    // Stop training
    this.game.gameState.training.active = false;
    this.game.gameState.training.currency = this.game.gameState.training.score;

    // Clear timers
    this.clearTrainingTimers();

    // Clear remaining bubbles
    this.clearBubbles();

    // Show training complete section
    const trainingComplete = document.getElementById("training-complete");
    if (trainingComplete) {
      trainingComplete.style.display = "block";
    }

    // Update final score and costs
    this.updateTrainingUpgradeCosts();

    this.game.logMessage(
      `🎯 Training complete! Earned ${this.game.gameState.training.score} training currency.`,
      "success"
    );
  }

  updateTrainingUpgradeCosts() {
    const training = this.game.gameState.training;

    // Update upgrade costs display
    this.game.updateElement(
      "attack-cost",
      training.upgradeCosts.attack.baseCost
    );
    this.game.updateElement(
      "defense-cost",
      training.upgradeCosts.defense.baseCost
    );
    this.game.updateElement("hp-cost", training.upgradeCosts.hp.baseCost);
    this.game.updateElement(
      "energy-cost",
      training.upgradeCosts.energy.baseCost
    );
    this.game.updateElement("slot-cost", training.slotCost);
    this.game.updateElement("final-training-score", training.currency);
  }

  buyTrainingUpgrade(type) {
    const training = this.game.gameState.training;
    const upgradeConfig = training.upgradeCosts[type];
    const cost = upgradeConfig.baseCost;

    if (training.currency < cost) {
      this.game.logMessage(
        `❌ Not enough training currency! Need ${cost}`,
        "combat"
      );
      return;
    }

    // Purchase upgrade
    training.currency -= cost;
    upgradeConfig.baseCost += upgradeConfig.increment;

    // Apply upgrade to combat stats
    const mechaStats = this.game.gameState.combat.mechaStats;

    switch (type) {
      case "attack":
        mechaStats.attack += upgradeConfig.bonus;
        this.game.logMessage(
          `⚔️ Attack increased by ${upgradeConfig.bonus}!`,
          "success"
        );
        break;
      case "defense":
        mechaStats.defense += upgradeConfig.bonus;
        this.game.logMessage(
          `🛡️ Defense increased by ${upgradeConfig.bonus}!`,
          "success"
        );
        break;
      case "hp":
        mechaStats.maxHp += upgradeConfig.bonus;
        mechaStats.hp += upgradeConfig.bonus;
        this.game.logMessage(
          `❤️ HP increased by ${upgradeConfig.bonus}!`,
          "success"
        );
        break;
      case "energy":
        mechaStats.maxEnergy += upgradeConfig.bonus;
        mechaStats.energy += upgradeConfig.bonus;
        this.game.logMessage(
          `⚡ Energy increased by ${upgradeConfig.bonus}!`,
          "success"
        );
        break;
    }

    this.updateTrainingUpgradeCosts();
  }

  spinTrainingSlots() {
    const training = this.game.gameState.training;
    const cost = training.slotCost;

    if (training.currency < cost) {
      this.game.logMessage(
        `❌ Not enough training currency! Need ${cost}`,
        "combat"
      );
      return;
    }

    // Pay for spin
    training.currency -= cost;
    training.slotCost += 5; // Increase cost for next spin

    // Animate slots
    const slots = ["slot-1", "slot-2", "slot-3"];
    let spinCount = 0;

    const spinInterval = setInterval(() => {
      slots.forEach((slotId) => {
        const slot = document.getElementById(slotId);
        if (slot) {
          slot.textContent = CONFIG_UTILS.getRandomTrainingSymbol();
        }
      });

      spinCount++;
      if (spinCount > 20) {
        clearInterval(spinInterval);
        this.resolveTrainingSlots();
      }
    }, 100);

    this.updateTrainingUpgradeCosts();
  }

  resolveTrainingSlots() {
    const slot1 = document.getElementById("slot-1").textContent;
    const slot2 = document.getElementById("slot-2").textContent;
    const slot3 = document.getElementById("slot-3").textContent;

    const resultDiv = document.getElementById("slot-result");
    const training = this.game.gameState.training;
    const mechaStats = this.game.gameState.combat.mechaStats;

    if (slot1 === slot2 && slot2 === slot3) {
      // Triple match jackpot!
      let reward = "";

      switch (slot1) {
        case "⚔️":
          mechaStats.attack += 8;
          reward = "+8 Attack!";
          break;
        case "🛡️":
          mechaStats.defense += 8;
          reward = "+8 Defense!";
          break;
        case "❤️":
          mechaStats.maxHp += 40;
          mechaStats.hp += 40;
          reward = "+40 HP!";
          break;
        case "⚡":
          mechaStats.maxEnergy += 5;
          mechaStats.energy += 5;
          reward = "+5 Energy!";
          break;
        case "💎":
          training.currency += 100;
          reward = "+100 Training Currency!";
          break;
        default:
          training.currency += 50;
          reward = "+50 Training Currency!";
          break;
      }

      resultDiv.innerHTML = `<span style="color: #27ae60;">🎉 JACKPOT! ${reward}</span>`;
      this.game.logMessage(`🎰 Slot machine jackpot! ${reward}`, "success");
    } else {
      // No match
      resultDiv.innerHTML = `<span style="color: #95a5a6;">No match - try again!</span>`;
    }

    this.updateTrainingUpgradeCosts();

    // Clear result after 3 seconds
    setTimeout(() => {
      resultDiv.innerHTML = "";
    }, 3000);
  }

  continueAfterTraining() {
    // Advance battle phase or return to combat
    const battlePhase = this.game.gameState.combat.battlePhase;

    if (battlePhase >= GAME_CONFIG.BATTLES_PER_MINE) {
      // All battles completed for this mine
      this.game.logMessage(
        "🏆 All battles completed for this mine!",
        "success"
      );
      this.game.showScreen("mining-screen");
    } else {
      // Continue to next battle
      this.game.logMessage(
        `⚔️ Preparing for battle ${battlePhase + 1}/${
          GAME_CONFIG.BATTLES_PER_MINE
        }`,
        "combat"
      );
      this.game.showScreen("combat-screen");
      this.game.battle.startCombat();
    }
  }

  clearTrainingTimers() {
    if (this.trainingTimer) {
      clearInterval(this.trainingTimer);
      this.trainingTimer = null;
    }

    if (this.bubbleSpawnTimer) {
      clearInterval(this.bubbleSpawnTimer);
      this.bubbleSpawnTimer = null;
    }
  }

  // Get training statistics
  getTrainingStats() {
    const training = this.game.gameState.training;
    return {
      score: training.score,
      combo: training.combo,
      timeLeft: training.timeLeft,
      currency: training.currency,
      bubblesClicked: training.combo, // Approximation
      efficiency:
        training.score /
        Math.max(1, GAME_CONFIG.TRAINING_TIME - training.timeLeft),
    };
  }

  // Training performance evaluation
  evaluatePerformance() {
    const stats = this.getTrainingStats();

    if (stats.score >= 600) {
      return { grade: "S", message: "Outstanding performance!" };
    } else if (stats.score >= 400) {
      return { grade: "A", message: "Excellent work!" };
    } else if (stats.score >= 250) {
      return { grade: "B", message: "Good job!" };
    } else if (stats.score >= 150) {
      return { grade: "C", message: "Not bad, keep practicing!" };
    } else {
      return { grade: "D", message: "Room for improvement!" };
    }
  }

  // Show performance evaluation
  showPerformanceEvaluation() {
    const evaluation = this.evaluatePerformance();
    this.game.logMessage(
      `🎯 Training Grade: ${evaluation.grade} - ${evaluation.message}`,
      "success"
    );
  }
}
