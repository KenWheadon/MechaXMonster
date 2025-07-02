// Victory Screen Module
class VictoryScreen {
  constructor(game) {
    this.game = game;
  }

  /**
   * Set up victory screen event listeners
   */
  setupEventListeners() {
    const playAgain = document.getElementById("play-again");
    if (playAgain) {
      playAgain.addEventListener("click", () => {
        this.game.playSound("buttonClick");
        location.reload();
      });
    }
  }

  /**
   * Show victory screen
   */
  showVictory() {
    this.game.cleanupTimers();
    this.game.playMusic("victory");
    this.game.playSound("victorySound");

    setTimeout(() => {
      this.game.showScreen("victory-screen");
    }, 1500);
  }
}
