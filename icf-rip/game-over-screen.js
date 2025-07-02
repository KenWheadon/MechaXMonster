// Game Over Screen Module with Full Screen Display and Restart
class GameOverScreen {
  constructor(game) {
    this.game = game;
  }

  /**
   * Set up game over screen event listeners
   */
  setupEventListeners() {
    const restartGame = document.getElementById("restart-game");
    if (restartGame) {
      restartGame.addEventListener("click", () => {
        this.game.playSound("buttonClick");
        this.restartGame();
      });

      // Add keyboard support for Enter key
      restartGame.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.game.playSound("buttonClick");
          this.restartGame();
        }
      });
    }

    // Add click-anywhere-to-restart functionality
    const gameOverScreen = document.getElementById("game-over-screen");
    if (gameOverScreen) {
      gameOverScreen.addEventListener("click", (e) => {
        // Only restart if clicking on the screen itself, not on buttons
        if (e.target === gameOverScreen) {
          this.game.playSound("buttonClick");
          this.restartGame();
        }
      });

      // Add keyboard support for game over screen
      gameOverScreen.addEventListener("keydown", (e) => {
        if (e.key === "Escape" || e.key === "r" || e.key === "R") {
          e.preventDefault();
          this.game.playSound("buttonClick");
          this.restartGame();
        }
      });
    }
  }

  /**
   * Restart the game
   */
  restartGame() {
    try {
      // Clean up any existing timers or resources
      this.game.cleanupTimers();

      // Stop any playing music
      if (this.game.currentMusic) {
        this.game.currentMusic.pause();
        this.game.currentMusic = null;
      }

      // Reload the page to restart the game
      location.reload();
    } catch (error) {
      console.error("Error restarting game:", error);
      // Fallback: still try to reload
      location.reload();
    }
  }

  /**
   * Handle game over with enhanced full-screen display
   */
  gameOver(reason) {
    try {
      // Update game over information
      this.game.updateElement(
        "final-battle",
        this.game.gameState.currentBattle.toString()
      );
      this.game.updateElement("game-over-reason", reason);

      // Clean up any running timers
      this.game.cleanupTimers();

      // Play game over music and sound
      this.game.playMusic("gameOver");
      this.game.playSound("gameOverSound");

      // Ensure game over screen is properly styled as full screen
      const gameOverScreen = document.getElementById("game-over-screen");
      if (gameOverScreen) {
        // Make sure it's full screen and visible
        gameOverScreen.style.position = "fixed";
        gameOverScreen.style.top = "0";
        gameOverScreen.style.left = "0";
        gameOverScreen.style.width = "100vw";
        gameOverScreen.style.height = "100vh";
        gameOverScreen.style.zIndex = "9999";
        gameOverScreen.style.background = "rgba(0, 0, 0, 0.95)";
        gameOverScreen.style.display = "flex";
        gameOverScreen.style.flexDirection = "column";
        gameOverScreen.style.justifyContent = "center";
        gameOverScreen.style.alignItems = "center";
        gameOverScreen.style.padding = "20px";

        // Make it focusable for keyboard events
        gameOverScreen.setAttribute("tabindex", "0");
      }

      // Show the game over screen after a brief delay
      setTimeout(() => {
        this.game.showScreen("game-over-screen");

        // Focus the game over screen for keyboard events
        if (gameOverScreen) {
          gameOverScreen.focus();
        }

        // Focus the restart button for immediate interaction
        const restartBtn = document.getElementById("restart-game");
        if (restartBtn) {
          restartBtn.focus();
        }
      }, 1500);
    } catch (error) {
      console.error("Error showing game over screen:", error);
      // Fallback: show a simple alert and restart
      alert(`Game Over: ${reason}`);
      this.restartGame();
    }
  }

  /**
   * Show additional game over statistics (optional enhancement)
   */
  showGameOverStats() {
    const gameOverScreen = document.getElementById("game-over-screen");
    if (!gameOverScreen) return;

    // Check if stats already exist
    if (gameOverScreen.querySelector(".game-over-stats")) return;

    const statsDiv = document.createElement("div");
    statsDiv.className = "game-over-stats";
    statsDiv.style.cssText = `
      margin: 20px 0;
      padding: 15px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      text-align: center;
      font-size: 14px;
    `;

    let statsHTML = "<h4>Final Stats:</h4>";
    if (this.game.gameState.player) {
      statsHTML += `
        <div>Attack: ${this.game.gameState.player.attack}</div>
        <div>Defense: ${this.game.gameState.player.defense}</div>
        <div>Max HP: ${this.game.gameState.player.maxHp}</div>
        <div>Max Sanity: ${this.game.gameState.player.maxSanity}</div>
      `;
    }

    if (this.game.gameState.selectedFighterType) {
      statsHTML += `<div>Fighter: ${
        FIGHTER_TEMPLATES[this.game.gameState.selectedFighterType].name
      }</div>`;
    }

    statsDiv.innerHTML = statsHTML;

    // Insert stats before the restart button
    const restartBtn = document.getElementById("restart-game");
    if (restartBtn) {
      gameOverScreen.insertBefore(statsDiv, restartBtn);
    } else {
      gameOverScreen.appendChild(statsDiv);
    }
  }
}
