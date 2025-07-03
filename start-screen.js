// Start Screen Module
class StartScreen {
  constructor(game) {
    this.game = game;
  }

  init() {
    // Set up start screen event listeners as backup
    const startButton = document.querySelector("#start-screen .btn-large");
    if (startButton) {
      // Remove any existing onclick and add event listener
      startButton.onclick = null;
      startButton.addEventListener("click", () => this.startGame());
    }
  }

  startGame() {
    this.game.logMessage("🚀 Starting new mining adventure!", "important");
    this.game.showScreen("mine-selection-screen");
    this.game.logMessage(
      "🤖 AstroGuide: Welcome to the asteroid mining colony! Choose your first mining location."
    );
  }

  showStartScreen() {
    this.game.showScreen("start-screen");
  }

  // Called when returning to start screen (for new game)
  resetToStart() {
    this.game.resetGame();
    this.showStartScreen();
  }
}
