// Enhanced Training Module with Fixed Combo Logic and Celebration Popup
class Training {
  constructor(game) {
    this.game = game;
    this.activeBubbles = [];
    this.bubbleIdCounter = 0;
    this.sessionTrainingTypes = new Set(); // Track what was trained this session
  }

  /**
   * Set up training event listeners
   */
  setupEventListeners() {
    // Training rewards
    document.querySelectorAll("[data-training]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const rewardType = e.currentTarget.dataset.training;
        this.game.playSound("buttonClick");
        this.applyTraining(rewardType);
      });

      btn.addEventListener("mouseenter", () => {
        this.game.playSound("buttonHover");
      });
    });

    // Slot machine
    const spinBtn = document.getElementById("spin-btn");
    if (spinBtn) {
      spinBtn.addEventListener("click", () => {
        this.game.playSound("buttonClick");
        this.spinSlots();
      });
    }

    // Continue buttons
    const continueTraining = document.getElementById("continue-training");
    if (continueTraining) {
      continueTraining.addEventListener("click", () => {
        this.game.playSound("buttonClick");
        this.game.startNextBattle();
      });
    }

    // IMPROVED: Training target for cone clicking with better event handling
    const trainingTarget = document.getElementById("training-target");
    if (trainingTarget) {
      trainingTarget.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent event bubbling

        const coneElement = e.target.closest(".moving-cone");
        if (coneElement) {
          // Clicked on a cone - collect it
          const points = parseInt(coneElement.dataset.points) || 1;
          this.game.playSound("bubbleClick");
          this.collectCone(coneElement, points);
        }
        // REMOVED: Background click combo reset - now combos never reset during mini-game
      });
    }
  }

  /**
   * Update player stats display on training screen
   */
  updateStatsDisplay() {
    const player = this.game.gameState.player;
    if (!player) return;

    // Update all stat elements
    this.game.updateElement("training-current-hp", player.hp.toString());
    this.game.updateElement("training-max-hp", player.maxHp.toString());
    this.game.updateElement("training-attack", player.attack.toString());
    this.game.updateElement("training-defense", player.defense.toString());
    this.game.updateElement(
      "training-current-sanity",
      player.sanity.toString()
    );
    this.game.updateElement("training-max-sanity", player.maxSanity.toString());
  }

  /**
   * Show stats display during training rewards phase
   */
  showStatsDisplay() {
    const statsDisplay = document.getElementById("player-stats-display");
    if (statsDisplay) {
      statsDisplay.classList.add("active");
      statsDisplay.style.display = "block";
      this.updateStatsDisplay();
    }
  }

  /**
   * Hide stats display during mini-game phase
   */
  hideStatsDisplay() {
    const statsDisplay = document.getElementById("player-stats-display");
    if (statsDisplay) {
      statsDisplay.classList.remove("active");
      statsDisplay.style.display = "none";
    }
  }

  /**
   * Add visual feedback when a stat is updated
   */
  highlightUpdatedStat(statType) {
    const statItemMap = {
      hp: ".stat-item:nth-child(1)",
      health: ".stat-item:nth-child(1)", // Same as hp
      attack: ".stat-item:nth-child(2)",
      defense: ".stat-item:nth-child(3)",
      sanity: ".stat-item:nth-child(4)",
    };

    const selector = statItemMap[statType];
    if (selector) {
      const statItem = document.querySelector(selector);
      if (statItem) {
        statItem.classList.add("stat-updated");
        setTimeout(() => {
          statItem.classList.remove("stat-updated");
        }, 1000);
      }
    }
  }

  /**
   * Start training phase with restored original mechanics
   */
  startTraining() {
    try {
      this.game.gameState.trainingScore = 0;
      this.game.gameState.trainingCombo = 0; // This will track total bubbles clicked
      this.game.gameState.trainingActive = true;
      this.game.gameState.slotSpins = 0;
      this.game.gameState.trainingPurchases = 0;
      this.sessionTrainingTypes.clear();
      this.activeBubbles = [];
      this.bubbleIdCounter = 0;

      // Reset UI
      this.game.updateElement("training-score", "0");
      this.game.updateElement("combo-counter", "0");
      this.game.updateElement(
        "training-timer",
        GAME_CONFIG.TRAINING_TIME.toString()
      );
      this.game.updateElement("slot-cost", "10"); // Updated initial cost for 500-600 point range
      this.game.updateElement("spin-cost", "10"); // Updated initial cost

      // Show training game elements
      const trainingCombo = document.getElementById("training-combo");
      const trainingScoreTime = document.getElementById("training-score-time");
      if (trainingCombo) trainingCombo.classList.add("active");
      if (trainingScoreTime) trainingScoreTime.classList.add("active");

      // Hide training choices and slot machine initially
      const trainingChoices = document.getElementById("training-choices");
      if (trainingChoices) {
        trainingChoices.classList.remove("active");
      }

      const slotMachine = document.getElementById("slot-machine");
      if (slotMachine) {
        slotMachine.style.display = "none";
      }

      // Hide paytable initially
      const slotPaytable = document.getElementById("slot-paytable");
      if (slotPaytable) {
        slotPaytable.classList.remove("active");
      }

      const bonusReward = document.getElementById("bonus-reward");
      if (bonusReward) {
        bonusReward.classList.remove("available");
      }

      const target = document.getElementById("training-target");
      if (target) {
        target.innerHTML = "";
        target.style.display = "block";
        target.classList.remove("combo-lost");
      }

      // Hide continue button initially
      const continueBtn = document.getElementById("continue-training");
      if (continueBtn) {
        continueBtn.style.display = "none";
      }

      // Hide stats display during mini-game
      this.hideStatsDisplay();

      // Show mini-game instructions
      this.showTrainingPhaseUI("mini-game");

      this.game.playSound("trainingStart");
      this.spawnTrainingCones();
      this.startTrainingTimer();
    } catch (error) {
      console.error("Failed to start training:", error);
    }
  }

  /**
   * Show appropriate UI for training phase
   */
  showTrainingPhaseUI(phase) {
    const instructions = document.getElementById("training-instructions");
    if (!instructions) return;

    switch (phase) {
      case "mini-game":
        instructions.textContent =
          "Click the treats for points! Combo = total clicked!";
        break;
      case "rewards":
        instructions.textContent =
          "Choose your training rewards and try the risky slots!";
        break;
    }
  }

  /**
   * Start training timer
   */
  startTrainingTimer() {
    let timeLeft = GAME_CONFIG.TRAINING_TIME;

    this.game.timers.training = setInterval(() => {
      timeLeft--;
      this.game.updateElement("training-timer", timeLeft.toString());

      if (timeLeft <= 0) {
        this.endTraining();
      }
    }, 1000);
  }

  /**
   * Spawn training cones (restored original system with more cones)
   */
  spawnTrainingCones() {
    if (!this.game.gameState.trainingActive) return;

    try {
      const target = document.getElementById("training-target");
      if (!target) return;

      // Spawn multiple cones if we're under the limit
      const currentCones = target.querySelectorAll(".moving-cone").length;
      const maxCones = GAME_CONFIG.MAX_SIMULTANEOUS_BUBBLES || 5;

      if (currentCones < maxCones) {
        const cone = document.createElement("div");
        cone.className = "moving-cone";

        const coneData = CONFIG_UTILS.getRandomTrainingCone();
        if (coneData.image) {
          const img = document.createElement("img");
          img.src = coneData.image;
          img.alt = "Training Cone";
          img.className = "cone-image";
          img.style.pointerEvents = "none";
          cone.appendChild(img);
        } else {
          cone.textContent = coneData.emoji;
        }

        const x = Math.random() * (target.offsetWidth - 60);
        cone.style.left = x + "px";
        cone.style.bottom = "0px";

        const maxHeight = target.offsetHeight - 60;
        const targetHeight = Math.random() * maxHeight;
        const points = Math.floor((targetHeight / maxHeight) * 5) + 1;

        cone.dataset.points = points.toString();
        cone.dataset.height = targetHeight.toString();

        target.appendChild(cone);

        // Animate cone upward
        setTimeout(() => {
          cone.style.bottom = targetHeight + "px";
        }, 50);

        // Remove cone after timeout - IMPROVED: No combo reset when cones expire
        setTimeout(() => {
          if (cone.parentNode) {
            cone.remove();
          }
        }, GAME_CONFIG.TRAINING_BUBBLE_LIFETIME);
      }

      // Schedule next cone
      const spawnDelay = Math.max(
        GAME_CONFIG.TRAINING_SPAWN_MIN_DELAY,
        GAME_CONFIG.TRAINING_SPAWN_BASE_DELAY -
          this.game.gameState.trainingScore * 10
      );
      setTimeout(() => this.spawnTrainingCones(), spawnDelay);
    } catch (error) {
      console.error("Failed to spawn training cone:", error);
    }
  }

  /**
   * Collect a training cone (IMPROVED: combo = total bubbles clicked)
   */
  collectCone(cone, points) {
    try {
      this.game.gameState.trainingCombo++; // Simply increment total clicked
      const comboMultiplier = Math.min(
        this.game.gameState.trainingCombo,
        GAME_CONFIG.MAX_COMBO_MULTIPLIER
      );
      const totalPoints = points * comboMultiplier;
      this.game.gameState.trainingScore += totalPoints;

      if (this.game.gameState.trainingCombo > 1) {
        this.game.playSound("comboIncrease");
      }

      // Show score popup (restored original)
      const target = document.getElementById("training-target");
      if (target) {
        const scoreFloat = document.createElement("div");
        scoreFloat.className = "cone-score";
        scoreFloat.textContent = "+" + totalPoints;
        scoreFloat.style.left = cone.style.left;
        scoreFloat.style.bottom = cone.dataset.height + "px";
        target.appendChild(scoreFloat);

        setTimeout(() => {
          if (scoreFloat.parentNode) {
            scoreFloat.remove();
          }
        }, 1000);
      }

      this.game.updateElement(
        "training-score",
        this.game.gameState.trainingScore.toString()
      );
      this.game.updateElement(
        "combo-counter",
        this.game.gameState.trainingCombo.toString()
      );

      cone.remove();
    } catch (error) {
      console.error("Failed to collect cone:", error);
    }
  }

  /**
   * Show celebration popup for training results
   */
  showCelebrationPopup() {
    const points = this.game.gameState.trainingScore;
    const combo = this.game.gameState.trainingCombo;

    // Create popup
    const popup = document.createElement("div");
    popup.id = "training-celebration-popup";
    popup.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      padding: 30px;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.8);
      z-index: 10000;
      text-align: center;
      font-family: "Comic Sans MS", cursive, sans-serif;
      border: 3px solid white;
      animation: popupAppear 0.5s ease-out;
    `;

    popup.innerHTML = `
      <div style="font-size: 32px; margin-bottom: 20px;">🎉 TRAINING COMPLETE! 🎉</div>
      <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">
        YOU WON ${points} POINTS
      </div>
      <div style="font-size: 20px; margin-bottom: 20px;">
        AND GOT A COMBO OF ${combo}!
      </div>
      <button id="celebration-ok" style="
        background: rgba(255,255,255,0.3);
        border: 2px solid white;
        color: white;
        padding: 12px 24px;
        border-radius: 15px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        font-family: inherit;
      ">Awesome!</button>
    `;

    // Add animation CSS
    const style = document.createElement("style");
    style.textContent = `
      @keyframes popupAppear {
        from {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.5);
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(popup);

    // Add click handler
    const okButton = document.getElementById("celebration-ok");
    okButton.addEventListener("click", () => {
      this.game.playSound("buttonClick");
      popup.remove();
      style.remove();
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (popup.parentNode) {
        popup.remove();
      }
      if (style.parentNode) {
        style.remove();
      }
    }, 5000);

    this.game.playSound("trainingComplete");
  }

  /**
   * End training mini-game and show rewards
   */
  endTraining() {
    this.game.gameState.trainingActive = false;

    if (this.game.timers.training) {
      clearInterval(this.game.timers.training);
      this.game.timers.training = null;
    }

    // Show celebration popup first
    this.showCelebrationPopup();

    // Clear all active cones
    const target = document.getElementById("training-target");
    if (target) {
      const cones = target.querySelectorAll(".moving-cone");
      cones.forEach((cone) => cone.remove());
      target.style.display = "none";
    }

    // Hide training game UI elements
    const trainingCombo = document.getElementById("training-combo");
    const trainingScoreTime = document.getElementById("training-score-time");
    if (trainingCombo) trainingCombo.classList.remove("active");
    if (trainingScoreTime) trainingScoreTime.classList.remove("active");

    // Show training rewards and slot machine
    const trainingChoices = document.getElementById("training-choices");
    if (trainingChoices) {
      trainingChoices.classList.add("active");
    }

    const slotMachine = document.getElementById("slot-machine");
    if (slotMachine) {
      slotMachine.style.display = "block";
    }

    // Show paytable when slot machine is shown
    const slotPaytable = document.getElementById("slot-paytable");
    if (slotPaytable) {
      slotPaytable.classList.add("active");
    }

    // Show stats display during rewards phase
    this.showStatsDisplay();

    // Show final score and update UI
    this.game.updateElement(
      "final-score",
      this.game.gameState.trainingScore.toString()
    );
    this.updateTrainingButtonCosts();
    this.updateSlotButtonState();
    this.showTrainingPhaseUI("rewards");

    // Show continue button
    const continueBtn = document.getElementById("continue-training");
    if (continueBtn) {
      continueBtn.style.display = "block";
    }

    // Check for bonus reward
    if (
      this.game.gameState.trainingScore >= GAME_CONFIG.TRAINING_BONUS_THRESHOLD
    ) {
      const bonusReward = document.getElementById("bonus-reward");
      if (bonusReward) {
        bonusReward.classList.add("available");
      }
    }
  }

  /**
   * Update training button costs and availability (UPDATED for 500-600 point range)
   */
  updateTrainingButtonCosts() {
    const buttons = document.querySelectorAll("[data-training]");
    buttons.forEach((btn) => {
      const rewardType = btn.dataset.training;
      const cost = this.getTrainingCost(rewardType);
      const canAfford = this.game.gameState.trainingScore >= cost;

      const reward = TRAINING_REWARDS[rewardType];
      if (reward) {
        if (rewardType === "health") {
          const bonusReward = document.getElementById("bonus-reward");
          if (bonusReward) {
            if (
              this.game.gameState.trainingScore >=
              GAME_CONFIG.TRAINING_BONUS_THRESHOLD
            ) {
              bonusReward.classList.add("available");
            }
            bonusReward.innerHTML = `
              <img src="images/upgrade_health.png" alt="Health Upgrade" class="upgrade-icon" />
              <div class="btn-text">${reward.name} (${cost} pts)</div>
            `;
            bonusReward.disabled = !canAfford;
          }
        } else {
          // Map reward types to their image files
          const imageMap = {
            attack: "images/upgrade_attack.png",
            defense: "images/upgrade_defense.png",
            sanity: "images/upgrade_sanity.png",
          };

          btn.innerHTML = `
            <img src="${imageMap[rewardType]}" alt="${reward.name}" class="upgrade-icon" />
            <div class="btn-text">${reward.name} (${cost} pts)</div>
          `;
          btn.disabled = !canAfford;
        }
      }
    });
  }

  /**
   * Get cost for training reward (UPDATED progressive pricing for 500-600 points)
   */
  getTrainingCost(rewardType) {
    const baseCost = 120; // Increased cost for 500-600 point range
    return baseCost + this.game.gameState.trainingPurchases * 80; // Increased progression
  }

  /**
   * Apply training reward
   */
  applyTraining(rewardType) {
    const reward = TRAINING_REWARDS[rewardType];
    if (!reward) {
      console.error(`Invalid training reward: ${rewardType}`);
      return;
    }

    const cost = this.getTrainingCost(rewardType);

    if (this.game.gameState.trainingScore < cost) {
      this.game.updateElement(
        "final-score",
        `${this.game.gameState.trainingScore} (Need ${cost} points!)`
      );
      return;
    }

    try {
      this.game.gameState.trainingScore -= cost;
      this.game.gameState.trainingPurchases++;
      this.sessionTrainingTypes.add(rewardType);

      // Store pre-upgrade stats for achievement checking
      const preUpgradeStats = {
        attack: this.game.gameState.player.attack,
        defense: this.game.gameState.player.defense,
        sanity: this.game.gameState.player.maxSanity,
        hp: this.game.gameState.player.maxHp,
      };

      reward.apply(this.game.gameState.player);
      this.game.addBattleLog(
        `Training complete! ${reward.name}! (Cost: ${cost} points)`
      );
      this.game.playSound("upgradeApply");

      // Update stats display and highlight the changed stat
      this.updateStatsDisplay();
      this.highlightUpdatedStat(rewardType);

      // Check for achievement unlocks
      this.checkTrainingAchievements(rewardType, preUpgradeStats);

      this.game.updateElement(
        "final-score",
        this.game.gameState.trainingScore.toString()
      );
      this.updateTrainingButtonCosts();
      this.updateSlotButtonState();

      const continueBtn = document.getElementById("continue-training");
      if (continueBtn) {
        continueBtn.style.display = "block";
      }
    } catch (error) {
      console.error("Failed to apply training reward:", error);
    }
  }

  /**
   * Check for training-related achievements
   */
  checkTrainingAchievements(rewardType, preUpgradeStats) {
    const player = this.game.gameState.player;

    // Check stat milestone achievements
    if (
      rewardType === "attack" &&
      player.attack > 100 &&
      preUpgradeStats.attack <= 100
    ) {
      this.game.unlockAchievement("attack_100");
    }
    if (
      rewardType === "defense" &&
      player.defense > 100 &&
      preUpgradeStats.defense <= 100
    ) {
      this.game.unlockAchievement("defense_100");
    }
    if (
      rewardType === "sanity" &&
      player.maxSanity > 100 &&
      preUpgradeStats.sanity <= 100
    ) {
      this.game.unlockAchievement("sanity_100");
    }
    if (
      rewardType === "health" &&
      player.maxHp > 300 &&
      preUpgradeStats.hp <= 300
    ) {
      this.game.unlockAchievement("hp_300");
    }
  }

  /**
   * Check for focused training achievements (called when starting next battle)
   */
  checkFocusedTrainingAchievements() {
    if (this.sessionTrainingTypes.size === 1) {
      const trainedType = Array.from(this.sessionTrainingTypes)[0];
      switch (trainedType) {
        case "attack":
          this.game.unlockAchievement("attack_only");
          break;
        case "defense":
          this.game.unlockAchievement("defense_only");
          break;
        case "sanity":
          this.game.unlockAchievement("sanity_only");
          break;
        case "health":
          this.game.unlockAchievement("health_only");
          break;
      }
    }
  }

  /**
   * Update slot button state (UPDATED for new cost structure)
   */
  updateSlotButtonState() {
    const nextCost = 10 + this.game.gameState.slotSpins * 15; // Updated cost progression
    const spinBtn = document.getElementById("spin-btn");
    if (spinBtn) {
      spinBtn.disabled = this.game.gameState.trainingScore < nextCost;
    }
  }

  /**
   * Clear slot reel feedback classes
   */
  clearSlotFeedback() {
    const reels = ["reel1", "reel2", "reel3"];
    reels.forEach((reelId) => {
      const reel = document.getElementById(reelId);
      if (reel) {
        reel.classList.remove("winner", "loser");
      }
    });
  }

  /**
   * Add visual feedback to slot reels
   */
  addSlotFeedback(isWin) {
    const reels = ["reel1", "reel2", "reel3"];

    if (isWin) {
      reels.forEach((reelId) => {
        const reel = document.getElementById(reelId);
        if (reel) {
          reel.classList.add("winner");
        }
      });
    } else {
      reels.forEach((reelId) => {
        const reel = document.getElementById(reelId);
        if (reel) {
          reel.classList.add("loser");
        }
      });
    }

    setTimeout(() => {
      this.clearSlotFeedback();
    }, 2000);
  }

  /**
   * Highlight paytable row for winning combination
   */
  highlightPaytableWin(symbolName) {
    const paytableRows = document.querySelectorAll(".paytable-row");
    paytableRows.forEach((row) => {
      row.classList.remove("paytable-winner");
    });

    // Find the matching paytable row by checking the alt text of images
    paytableRows.forEach((row) => {
      const symbols = row.querySelectorAll(".paytable-symbol");
      if (symbols.length === 3) {
        const firstSymbolAlt = symbols[0].alt;
        if (
          firstSymbolAlt &&
          firstSymbolAlt.toLowerCase() === symbolName.toLowerCase()
        ) {
          row.classList.add("paytable-winner");
        }
      }
    });

    setTimeout(() => {
      paytableRows.forEach((row) => {
        row.classList.remove("paytable-winner");
      });
    }, 3000);
  }

  /**
   * SIMPLIFIED: Spin slot machine using simple results array
   */
  spinSlots() {
    const cost = 10 + this.game.gameState.slotSpins * 15; // Updated cost progression

    if (this.game.gameState.trainingScore < cost) {
      this.game.updateElement(
        "slot-result",
        `<span style="color: #ff6b6b;">Not enough points! Need ${cost}</span>`
      );
      return;
    }

    try {
      this.game.gameState.trainingScore -= cost;
      this.game.gameState.slotSpins++;

      this.game.updateElement(
        "final-score",
        this.game.gameState.trainingScore.toString()
      );

      const nextCost = 10 + this.game.gameState.slotSpins * 15;
      this.game.updateElement("slot-cost", nextCost.toString());
      this.game.updateElement("spin-cost", nextCost.toString());

      this.game.playSound("spin", 0.5);
      this.clearSlotFeedback();

      // SIMPLIFIED: Get result from simple results array
      const result = CONFIG_UTILS.getSlotResult();

      // Animate reels
      const reels = ["reel1", "reel2", "reel3"];
      reels.forEach((reelId, index) => {
        const reel = document.getElementById(reelId);
        if (!reel) return;

        reel.classList.add("spinning");

        let spins = 0;
        const spinInterval = setInterval(() => {
          const randomSymbol = CONFIG_UTILS.getRandomElement(
            SLOT_CONFIG.symbols
          );
          const reelContent =
            reel.querySelector("img") || reel.querySelector("div");
          if (reelContent && randomSymbol) {
            if (reelContent.tagName === "IMG") {
              // Update image source if using images
              reelContent.src = `images/slot_${randomSymbol.name}.png`;
              reelContent.alt = randomSymbol.name;
            } else {
              // Update emoji if using text
              reelContent.textContent = randomSymbol.emoji;
            }
          }
          spins++;

          if (spins > GAME_CONFIG.SLOT_SPIN_COUNT_BASE + index * 5) {
            clearInterval(spinInterval);
            reel.classList.remove("spinning");

            // Set final result based on simple result object
            if (reelContent) {
              if (result.type === "win") {
                // Show winning symbol
                const winSymbol = SLOT_CONFIG.symbols.find(
                  (s) => s.name === result.symbol
                );
                if (winSymbol) {
                  if (reelContent.tagName === "IMG") {
                    reelContent.src = `images/slot_${winSymbol.name}.png`;
                    reelContent.alt = winSymbol.name;
                  } else {
                    reelContent.textContent = winSymbol.emoji;
                  }
                }
              } else {
                // Show random different symbols for loss
                const lossSymbols = SLOT_CONFIG.symbols.slice(); // Copy array
                const differentSymbol = lossSymbols[index % lossSymbols.length];
                if (reelContent.tagName === "IMG") {
                  reelContent.src = `images/slot_${differentSymbol.name}.png`;
                  reelContent.alt = differentSymbol.name;
                } else {
                  reelContent.textContent = differentSymbol.emoji;
                }
              }
            }

            if (index === 2) {
              this.checkSimpleSlotResults(result);
            }
          }
        }, GAME_CONFIG.SLOT_SPIN_DURATION);
      });

      this.updateSlotButtonState();
    } catch (error) {
      console.error("Failed to spin slots:", error);
    }
  }

  /**
   * SIMPLIFIED: Check slot machine results using simple result object
   */
  checkSimpleSlotResults(result) {
    const resultElement = document.getElementById("slot-result");
    if (!resultElement) return;

    try {
      console.log("Checking simple slot result:", result);

      const isWin = result.type === "win";

      // Track consecutive losses for achievement
      if (!isWin) {
        this.game.gameState.slotConsecutiveLosses =
          (this.game.gameState.slotConsecutiveLosses || 0) + 1;
        console.log(
          "Consecutive losses:",
          this.game.gameState.slotConsecutiveLosses
        );
        if (this.game.gameState.slotConsecutiveLosses >= 3) {
          this.game.unlockAchievement("slot_unlucky");
        }
      } else {
        this.game.gameState.slotConsecutiveLosses = 0;
      }

      let slotMessage = document.getElementById("slot-win-message");
      if (!slotMessage) {
        slotMessage = document.createElement("div");
        slotMessage.id = "slot-win-message";
        slotMessage.style.cssText = `
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          margin: 10px 0;
          min-height: 25px;
          animation: fadeIn 0.5s ease-in;
        `;

        const slotReels = document.querySelector(".slot-reels");
        if (slotReels) {
          slotReels.parentNode.insertBefore(slotMessage, slotReels.nextSibling);
        }
      }

      if (isWin) {
        const symbolName = result.symbol;
        const reward = SLOT_CONFIG.rewards.triple[symbolName];
        console.log("Win! Symbol:", symbolName, "Reward:", reward);

        if (reward) {
          // Unlock slot achievement
          this.game.unlockAchievement(`slot_${symbolName}`);

          // Track for focused training achievements
          if (reward.attack) this.sessionTrainingTypes.add("attack");
          if (reward.defense) this.sessionTrainingTypes.add("defense");
          if (reward.sanity) this.sessionTrainingTypes.add("sanity");
          if (reward.hp) this.sessionTrainingTypes.add("health");

          slotMessage.innerHTML = `<span style="color: ${reward.color}; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">🎉 YOU WON! 🎉</span>`;

          // Apply the reward
          if (reward.attack) {
            this.game.gameState.player.attack += reward.attack;
            this.highlightUpdatedStat("attack");
          }
          if (reward.defense) {
            this.game.gameState.player.defense += reward.defense;
            this.highlightUpdatedStat("defense");
          }
          if (reward.hp) {
            this.game.gameState.player.maxHp += reward.hp;
            this.game.gameState.player.hp = Math.min(
              this.game.gameState.player.hp + reward.hp,
              this.game.gameState.player.maxHp
            );
            this.highlightUpdatedStat("hp");
          }
          if (reward.sanity) {
            this.game.gameState.player.maxSanity += reward.sanity;
            this.game.gameState.player.sanity = Math.min(
              this.game.gameState.player.sanity + reward.sanity,
              this.game.gameState.player.maxSanity
            );
            this.highlightUpdatedStat("sanity");
          }
          if (reward.points) {
            this.game.gameState.trainingScore += reward.points;
            this.game.updateElement(
              "final-score",
              this.game.gameState.trainingScore.toString()
            );
          }

          // Update stats display after slot win
          this.updateStatsDisplay();

          resultElement.innerHTML = `<span style="color: ${reward.color};">🎉 ${reward.name}</span>`;
          this.game.playSound(symbolName === "ice" ? "jackpot" : "win");
          this.highlightPaytableWin(symbolName);
        }
      } else {
        slotMessage.innerHTML = `<span style="color: #95a5a6;">YOU LOSE</span>`;
        resultElement.innerHTML = `<span style="color: #95a5a6;">No match - try again!</span>`;
      }

      setTimeout(() => {
        if (slotMessage) {
          slotMessage.innerHTML = "";
        }
      }, 3000);

      this.addSlotFeedback(isWin);
      this.updateSlotButtonState();
      this.updateTrainingButtonCosts();
    } catch (error) {
      console.error("Failed to check slot results:", error);
    }
  }
}
