// Map Screen Module - Mine Selection and Trading Post
class MapScreen {
  constructor(game) {
    this.game = game;
  }

  init() {
    // Set up map screen event listeners
    this.setupMineLocationListeners();
  }

  setupMineLocationListeners() {
    // Add click listeners to mine locations
    for (let i = 1; i <= 5; i++) {
      const mineElement = document.getElementById(`mine-${i}`);
      if (mineElement) {
        mineElement.addEventListener("click", () => this.selectMine(i));
      }
    }
  }

  selectMine(mineId) {
    console.log(`Attempting to select mine ${mineId}`);
    console.log("Unlocked mines:", this.game.gameState.unlockedMines);

    if (!this.game.gameState.unlockedMines.includes(mineId)) {
      // Try to unlock the mine
      if (this.tryUnlockMine(mineId)) {
        this.updateMineSelection();
        // After unlocking, select the mine
        this.game.gameState.currentMine = mineId;
        this.game.showScreen("mining-screen");
        const config = MINE_CONFIG[mineId];
        this.game.logMessage(`⛏️ Entering ${config.name}...`, "important");
      }
      return;
    }

    // Select and enter the mine
    this.game.gameState.currentMine = mineId;
    this.game.showScreen("mining-screen");

    const config = MINE_CONFIG[mineId];
    this.game.logMessage(`⛏️ Entering ${config.name}...`, "important");
  }

  tryUnlockMine(mineId) {
    const config = MINE_CONFIG[mineId];
    const cost = config.unlockCost;

    if (cost === 0) {
      // Free mine (should already be unlocked)
      return true;
    }

    // Determine required currency based on mine
    const requiredCurrency = this.getUnlockCurrency(mineId);
    const currentAmount = this.game.gameState.currencies[requiredCurrency] || 0;

    console.log(`Trying to unlock mine ${mineId}`);
    console.log(`Required: ${cost} ${requiredCurrency}`);
    console.log(`Current: ${currentAmount}`);

    if (currentAmount >= cost) {
      this.game.spendCurrency(requiredCurrency, cost);
      this.game.unlockMine(mineId);
      this.game.logMessage(
        `🎉 Unlocked ${config.name}! Cost: ${cost} ${this.game.getCurrencyIcon(
          requiredCurrency
        )}`,
        "success"
      );
      return true;
    } else {
      this.game.logMessage(
        `❌ Need ${cost} ${this.game.getCurrencyIcon(
          requiredCurrency
        )} to unlock ${config.name} (You have: ${currentAmount})`,
        "combat"
      );
      return false;
    }
  }

  getUnlockCurrency(mineId) {
    // Map mine unlock requirements to currency types
    const unlockCurrencies = {
      2: "monsterShells",
      3: "monsterCoins",
      4: "monsterBars",
      5: "monsterBonds",
    };

    return unlockCurrencies[mineId] || "monsterShells";
  }

  updateMineSelection() {
    // Update mine lock status
    for (let i = 1; i <= 5; i++) {
      const mineElement = document.getElementById(`mine-${i}`);
      if (mineElement) {
        if (this.game.gameState.unlockedMines.includes(i)) {
          mineElement.classList.remove("locked");
          // Add onclick handler for unlocked mines
          mineElement.onclick = () => this.selectMine(i);
        } else {
          mineElement.classList.add("locked");
          // Add onclick handler for locked mines to attempt unlock
          mineElement.onclick = () => this.selectMine(i);
        }
      }
    }

    // Update trading post
    this.updateTradingPost();
  }

  updateTradingPost() {
    const exchangeRates = document.getElementById("exchange-rates");
    if (!exchangeRates) return;

    let html = "";

    // Only show exchange options for currencies we have
    const availableCurrencies = Object.keys(
      this.game.gameState.currencies
    ).filter((key) => this.game.gameState.currencies[key] > 0);

    if (availableCurrencies.length === 0) {
      html =
        '<div class="exchange-option">No currencies available for exchange</div>';
    } else {
      availableCurrencies.forEach((currency) => {
        const amount = this.game.gameState.currencies[currency];
        const icon = this.game.getCurrencyIcon(currency);

        html += `
                    <div class="exchange-option" onclick="showExchangeOptions('${currency}')">
                        <div>${icon} ${amount}</div>
                        <div>Click to Exchange</div>
                        <small>(${Math.floor(
                          GAME_CONFIG.EXCHANGE_RATE * 100
                        )}% rate)</small>
                    </div>
                `;
      });
    }

    exchangeRates.innerHTML = html;
  }

  showMapScreen() {
    this.game.showScreen("mine-selection-screen");
    this.updateMineSelection();
  }

  // Trading post currency exchange dialog
  showExchangeDialog(fromCurrency) {
    const amount = this.game.gameState.currencies[fromCurrency];
    const exchangeRate = GAME_CONFIG.EXCHANGE_RATE;

    if (amount === 0) {
      this.game.logMessage(
        `❌ No ${this.game.getCurrencyIcon(fromCurrency)} to exchange!`
      );
      return;
    }

    // Simple exchange - convert everything to shells for now
    const result = Math.floor(amount * exchangeRate);

    const confirmed = confirm(
      `🤖 AstroGuide: Exchange ${amount} ${this.game.getCurrencyIcon(
        fromCurrency
      )} for ${result} shells?\n` +
        `(Exchange rate: ${Math.floor(
          exchangeRate * 100
        )}% - I told you my rates aren't great!)`
    );

    if (confirmed) {
      this.game.gameState.currencies[fromCurrency] = 0;
      this.game.addCurrency("shells", result);
      this.updateTradingPost();
      this.game.logMessage(
        `💱 Exchanged ${amount} ${this.game.getCurrencyIcon(
          fromCurrency
        )} for ${result} shells`,
        "success"
      );
      this.game.logMessage(
        `🤖 AstroGuide: Thanks for the business! Remember, direct mining is always better than my exchange rates.`
      );
    }
  }

  // Show mine preview information
  showMinePreview(mineId) {
    const config = MINE_CONFIG[mineId];
    const mineElement = document.getElementById(`mine-${mineId}`);

    if (mineElement && !this.game.gameState.unlockedMines.includes(mineId)) {
      // Show unlock cost and requirements
      const cost = config.unlockCost;
      const requiredCurrency = this.getUnlockCurrency(mineId);
      const currentAmount = this.game.gameState.currencies[requiredCurrency];

      const canAfford = currentAmount >= cost;
      const statusColor = canAfford ? "#27ae60" : "#e74c3c";

      this.game.logMessage(
        `ℹ️ ${config.name}: Cost ${cost} ${this.game.getCurrencyIcon(
          requiredCurrency
        )} ` + `(You have: ${currentAmount}) ${canAfford ? "✅" : "❌"}`,
        canAfford ? "success" : "combat"
      );
    }
  }

  // Handle mine hover effects
  setupMineHoverEffects() {
    for (let i = 1; i <= 5; i++) {
      const mineElement = document.getElementById(`mine-${i}`);
      if (mineElement) {
        mineElement.addEventListener("mouseenter", () => {
          if (!this.game.gameState.unlockedMines.includes(i)) {
            this.showMinePreview(i);
          }
        });
      }
    }
  }
}
