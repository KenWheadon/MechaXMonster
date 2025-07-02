// Enhanced Fighter Selection Module
class FighterSelection {
  constructor(game) {
    this.game = game;
  }

  /**
   * Set up event listeners for fighter selection
   */
  setupEventListeners() {
    document.querySelectorAll(".fighter-option").forEach((option) => {
      option.addEventListener("click", (e) => {
        this.game.initializeAudio();
        const fighterType = e.currentTarget.dataset.fighter;
        this.game.playSound("fighterSelect");
        this.selectFighter(fighterType);
      });

      option.addEventListener("mouseenter", () => {
        this.game.playSound("buttonHover");
      });
    });
  }

  /**
   * Select a fighter and start the game
   */
  selectFighter(fighterType) {
    if (!CONFIG_UTILS.isValidFighterType(fighterType)) {
      console.error(`Invalid fighter type: ${fighterType}`);
      this.game.showError("Invalid fighter selection");
      return;
    }

    try {
      // Store selected fighter type for achievements
      this.game.gameState.selectedFighterType = fighterType;

      // Create player from template
      this.game.gameState.player = { ...FIGHTER_TEMPLATES[fighterType] };

      // Update UI elements to show selected fighter
      this.updatePlayerVisuals(fighterType);

      // Update move names for the selected fighter
      this.game.updateFighterMoveNames();

      // Show battle screen and start
      this.game.showScreen("battle-screen");
      this.game.playMusic("battle");

      // Update move button damage display after selecting fighter
      this.game.updateMoveButtonDamage();

      this.game.combat.startBattle();
    } catch (error) {
      console.error("Failed to select fighter:", error);
      this.game.showError("Failed to select fighter");
    }
  }

  /**
   * Update player visual elements with selected fighter
   */
  updatePlayerVisuals(fighterType) {
    const fighter = FIGHTER_TEMPLATES[fighterType];

    // Update player name
    const playerName = document.getElementById("player-name");
    if (playerName) {
      playerName.textContent = fighter.name;
    }

    // Update player image in battle screen
    const playerImage = document.getElementById("player-image");
    if (playerImage && fighter.image) {
      CONFIG_UTILS.updateImage(playerImage, fighter.image, fighter.name);
    }

    // Update dialogue portrait
    const dialoguePortrait = document.getElementById("dialogue-portrait");
    if (dialoguePortrait && fighter.image) {
      CONFIG_UTILS.updateImage(
        dialoguePortrait,
        fighter.image,
        `${fighter.name} Portrait`
      );
    }
  }
}
