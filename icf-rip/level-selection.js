// Level Selection Module
class LevelSelection {
  constructor(game) {
    this.game = game;
  }

  /**
   * Set up level selection event listeners
   */
  setupEventListeners() {
    // Level selection buttons
    document.querySelectorAll(".level-option").forEach((option) => {
      option.addEventListener("click", (e) => {
        this.game.initializeAudio();
        const levelNumber = parseInt(e.currentTarget.dataset.level);
        this.game.playSound("buttonClick");
        this.selectLevel(levelNumber);
      });

      option.addEventListener("mouseenter", () => {
        this.game.playSound("buttonHover");
      });
    });

    // Back to fighter selection button
    const backToFighters = document.getElementById("back-to-fighters");
    if (backToFighters) {
      backToFighters.addEventListener("click", () => {
        this.game.playSound("buttonClick");
        this.game.showScreen("fighter-select-screen");
      });
    }
  }

  /**
   * Show level selection screen with available fighters
   */
  showLevelSelection() {
    this.populateLevelOptions();
    // Only show screen if it's not already active
    if (this.game.gameState.currentScreen !== "level-select-screen") {
      this.game.showScreen("level-select-screen");
    }
  }

  /**
   * Populate level options based on current configuration
   */
  populateLevelOptions() {
    const levelGrid = document.getElementById("level-grid");
    if (!levelGrid) {
      console.error("Level grid not found!");
      return;
    }

    console.log("Populating level options...");
    console.log("GAME_CONFIG.TOTAL_LEVELS:", GAME_CONFIG.TOTAL_LEVELS);
    console.log("LEVEL_CONFIG:", LEVEL_CONFIG);
    levelGrid.innerHTML = "";

    for (let levelNum = 1; levelNum <= GAME_CONFIG.TOTAL_LEVELS; levelNum++) {
      console.log(`Trying to get level config for level ${levelNum}`);
      const levelConfig = CONFIG_UTILS.getLevelConfig(levelNum);
      console.log(`Level ${levelNum} config:`, levelConfig);

      if (!levelConfig) {
        console.error(`Level config not found for level ${levelNum}`);
        continue;
      }

      console.log(`Creating level ${levelNum}:`, levelConfig);

      const levelOption = document.createElement("div");
      levelOption.className = "level-option";
      levelOption.dataset.level = levelNum;

      // Create fighter preview thumbnails
      const fighterThumbnails = levelConfig.availableFighters
        .map((fighterType) => {
          const fighter = FIGHTER_TEMPLATES[fighterType];
          if (!fighter) {
            console.warn(`Fighter template not found: ${fighterType}`);
            return "";
          }
          return `<img src="${fighter.image}" alt="${fighter.name}" class="fighter-thumbnail" title="${fighter.name}">`;
        })
        .join("");

      levelOption.innerHTML = `
        <div class="level-header">
          <h3>Level ${levelNum}</h3>
          <div class="level-difficulty ${levelConfig.difficulty
            .toLowerCase()
            .replace(/[^a-z]/g, "-")}">${levelConfig.difficulty}</div>
        </div>
        <div class="level-name">${levelConfig.name}</div>
        <div class="level-description">${levelConfig.description}</div>
        <div class="available-fighters">
          <div class="fighters-label">Available Fighters:</div>
          <div class="fighter-thumbnails">
            ${fighterThumbnails}
          </div>
        </div>
        <div class="level-stats">
          ${levelConfig.availableFighters.length} Fighter${
        levelConfig.availableFighters.length !== 1 ? "s" : ""
      }
        </div>
      `;

      levelGrid.appendChild(levelOption);
      console.log(`Added level ${levelNum} to grid`);
    }

    console.log(`Total levels created: ${levelGrid.children.length}`);
  }

  /**
   * Select a level and proceed to fighter selection for that level
   */
  selectLevel(levelNumber) {
    if (levelNumber < 1 || levelNumber > GAME_CONFIG.TOTAL_LEVELS) {
      console.error(`Invalid level number: ${levelNumber}`);
      this.game.showError("Invalid level selection");
      return;
    }

    try {
      const levelConfig = CONFIG_UTILS.getLevelConfig(levelNumber);
      if (!levelConfig) {
        throw new Error(`Level ${levelNumber} configuration not found`);
      }

      // Store selected level in game state
      this.game.gameState.selectedLevel = levelNumber;
      this.game.gameState.levelConfig = levelConfig;

      // Update fighter selection screen to show only available fighters for this level
      this.updateFighterSelectionForLevel(levelConfig);

      // Go back to fighter selection, but now filtered for this level
      this.game.showScreen("fighter-select-screen");
    } catch (error) {
      console.error("Failed to select level:", error);
      this.game.showError("Failed to select level");
    }
  }

  /**
   * Update fighter selection screen to show only fighters available for selected level
   */
  updateFighterSelectionForLevel(levelConfig) {
    const fighterOptions = document.querySelectorAll(".fighter-option");

    fighterOptions.forEach((option) => {
      const fighterType = option.dataset.fighter;

      if (levelConfig.availableFighters.includes(fighterType)) {
        // Show available fighters
        option.style.display = "block";
        option.classList.remove("disabled");
      } else {
        // Hide or disable unavailable fighters
        option.style.display = "none";
        option.classList.add("disabled");
      }
    });

    // Update the fighter selection title to indicate the level
    const fighterSelectTitle = document.querySelector(
      "#fighter-select-screen h2"
    );
    if (fighterSelectTitle) {
      fighterSelectTitle.textContent = `🍦Choose Your Fighter for ${levelConfig.name}🍦`;
    }

    // Add level info display
    this.addLevelInfoToFighterSelection(levelConfig);
  }

  /**
   * Add level information display to fighter selection screen
   */
  addLevelInfoToFighterSelection(levelConfig) {
    // Remove existing level info if present
    const existingInfo = document.getElementById("level-info-display");
    if (existingInfo) {
      existingInfo.remove();
    }

    // Create new level info display
    const levelInfo = document.createElement("div");
    levelInfo.id = "level-info-display";
    levelInfo.className = "level-info-display";
    levelInfo.innerHTML = `
      <div class="current-level-info">
        <div class="level-badge">Level ${this.game.gameState.selectedLevel}</div>
        <div class="level-details">
          <div class="level-name">${levelConfig.name}</div>
          <div class="level-difficulty">${levelConfig.difficulty}</div>
        </div>
        <button id="change-level-btn" class="change-level-btn">Change Level</button>
      </div>
    `;

    // Insert after the main title
    const mainTitle = document.querySelector("#fighter-select-screen h1");
    if (mainTitle) {
      mainTitle.parentNode.insertBefore(levelInfo, mainTitle.nextSibling);
    }

    // Add event listener for change level button
    const changeLevelBtn = document.getElementById("change-level-btn");
    if (changeLevelBtn) {
      changeLevelBtn.addEventListener("click", () => {
        this.game.playSound("buttonClick");
        this.showLevelSelection();
      });
    }
  }

  /**
   * Reset fighter selection screen to show all fighters (for when no level is selected)
   */
  resetFighterSelection() {
    const fighterOptions = document.querySelectorAll(".fighter-option");

    fighterOptions.forEach((option) => {
      option.style.display = "block";
      option.classList.remove("disabled");
    });

    // Reset title
    const fighterSelectTitle = document.querySelector(
      "#fighter-select-screen h2"
    );
    if (fighterSelectTitle) {
      fighterSelectTitle.textContent = "🍦Which Ice Cream?🍦";
    }

    // Remove level info display
    const levelInfo = document.getElementById("level-info-display");
    if (levelInfo) {
      levelInfo.remove();
    }

    // Clear selected level from game state
    this.game.gameState.selectedLevel = null;
    this.game.gameState.levelConfig = null;
  }
}
