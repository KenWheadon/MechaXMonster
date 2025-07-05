// Generic SlotMachine - Handles spinning mechanics and result reporting
class SlotMachine {
  constructor(container) {
    this.container = container;
    this.isSpinning = false;
    this.spinCount = 0;

    // Configuration that can be overridden
    this.config = {
      symbols: [
        {
          name: "shells",
          emoji: "🐚",
          image: "images/currency-shells.png",
          weight: 30,
        },
        {
          name: "coins",
          emoji: "🪙",
          image: "images/currency-coins.png",
          weight: 25,
        },
        {
          name: "bars",
          emoji: "🔶",
          image: "images/currency-bars.png",
          weight: 20,
        },
        {
          name: "bonds",
          emoji: "💎",
          image: "images/currency-bonds.png",
          weight: 15,
        },
        {
          name: "gems",
          emoji: "💠",
          image: "images/currency-gems.png",
          weight: 10,
        },
      ],
      winChance: 0.25, // 25% win chance
      spinDuration: 2000, // 2 seconds
      reelDelay: 300, // Delay between reel stops
      useImages: true, // Use images instead of emojis
    };

    this.elements = {};
    this.callbacks = {
      onSpin: null,
      onResult: null,
      onWin: null,
      onLose: null,
    };
  }

  // Initialize slot machine
  init() {
    this.cacheElements();
    this.setupEventListeners();
    this.renderInitialSymbols();
  }

  // Cache DOM elements
  cacheElements() {
    this.elements = {
      modal: this.container.querySelector(".slot-machine-modal"),
      reels: this.container.querySelectorAll(".slot-reel"),
      spinButton: this.container.querySelector(".spin-button"),
      resultDisplay: this.container.querySelector(".slot-result"),
      closeButton: this.container.querySelector(".close-slot-modal-button"),
    };
  }

  // Setup event listeners
  setupEventListeners() {
    if (this.elements.spinButton) {
      this.elements.spinButton.addEventListener("click", () => {
        this.spin();
      });
    }

    if (this.elements.closeButton) {
      this.elements.closeButton.addEventListener("click", () => {
        this.hide();
      });
    }
  }

  // Configure slot machine
  configure(config) {
    this.config = { ...this.config, ...config };
    if (this.elements && this.elements.reels) {
      this.renderInitialSymbols();
    }
  }

  // Set callback functions
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Show slot machine modal
  show() {
    this.elements.modal?.classList.remove("hidden");
    this.renderInitialSymbols();
  }

  // Hide slot machine modal
  hide() {
    this.elements.modal?.classList.add("hidden");
  }

  // Render initial symbols
  renderInitialSymbols() {
    this.elements.reels?.forEach((reel, index) => {
      const symbolContainer = reel.querySelector(".reel-symbols");
      if (symbolContainer && this.config.symbols.length > 0) {
        const symbol = this.config.symbols[index % this.config.symbols.length];
        this.setReelSymbol(reel, symbol.name);
      }
    });
  }

  // Main spin function
  async spin() {
    if (this.isSpinning) return;

    // Call onSpin callback to check if spin is allowed
    if (this.callbacks.onSpin && !this.callbacks.onSpin(this)) {
      return;
    }

    this.isSpinning = true;
    this.spinCount++;
    this.updateSpinButton();

    // Determine result
    const result = this.determineResult();

    // Animate reels
    await this.animateReels(result);

    // Process result
    this.processResult(result);

    this.isSpinning = false;
    this.updateSpinButton();
  }

  // Determine spin result
  determineResult() {
    const isWin = Math.random() < this.config.winChance;

    if (isWin) {
      // Select winning symbol based on weights (inverted - rarer symbols less likely)
      const totalWeight = this.config.symbols.reduce(
        (sum, symbol) => sum + (50 - symbol.weight),
        0
      );
      let random = Math.random() * totalWeight;

      for (const symbol of this.config.symbols) {
        random -= 50 - symbol.weight;
        if (random <= 0) {
          return {
            type: "win",
            symbol: symbol.name,
            symbols: [symbol.name, symbol.name, symbol.name],
            spinCount: this.spinCount,
          };
        }
      }
    }

    // Generate losing combination
    const shuffled = [...this.config.symbols].sort(() => Math.random() - 0.5);
    return {
      type: "lose",
      symbols: [shuffled[0].name, shuffled[1].name, shuffled[2].name],
      spinCount: this.spinCount,
    };
  }

  // Animate spinning reels
  async animateReels(result) {
    // Start all reels spinning
    this.elements.reels?.forEach((reel) => {
      reel.classList.add("spinning");
      this.startReelAnimation(reel);
    });

    // Stop reels one by one
    for (let i = 0; i < this.elements.reels.length; i++) {
      await this.sleep(this.config.spinDuration + i * this.config.reelDelay);

      const reel = this.elements.reels[i];
      reel.classList.remove("spinning");
      this.setReelSymbol(reel, result.symbols[i]);
    }
  }

  // Start reel spinning animation
  startReelAnimation(reel) {
    const symbolContainer = reel.querySelector(".reel-symbols");
    if (!symbolContainer) return;

    const interval = setInterval(() => {
      if (!reel.classList.contains("spinning")) {
        clearInterval(interval);
        return;
      }

      // Show random symbol during spin
      const randomSymbol =
        this.config.symbols[
          Math.floor(Math.random() * this.config.symbols.length)
        ];
      this.setReelSymbol(reel, randomSymbol.name);
    }, 100);
  }

  // Set final symbol on reel
  setReelSymbol(reel, symbolName) {
    const symbolContainer = reel.querySelector(".reel-symbols");
    if (!symbolContainer) return;

    const symbol = this.config.symbols.find((s) => s.name === symbolName);
    if (symbol) {
      if (this.config.useImages && symbol.image) {
        symbolContainer.innerHTML = `
          <img src="${symbol.image}" alt="${symbol.name}" class="reel-symbol">
        `;
      } else {
        symbolContainer.innerHTML = `
          <div class="reel-symbol-text">${symbol.emoji}</div>
        `;
      }
    }
  }

  // Process spin result
  processResult(result) {
    // Call result callback
    if (this.callbacks.onResult) {
      this.callbacks.onResult(result, this);
    }

    if (result.type === "win") {
      this.processWin(result);
    } else {
      this.processLoss(result);
    }
  }

  // Process winning result
  processWin(result) {
    // Add visual feedback
    this.addReelFeedback(true);

    // Call win callback
    if (this.callbacks.onWin) {
      this.callbacks.onWin(result, this);
    }
  }

  // Process losing result
  processLoss(result) {
    // Add visual feedback
    this.addReelFeedback(false);

    // Call lose callback
    if (this.callbacks.onLose) {
      this.callbacks.onLose(result, this);
    }
  }

  // Add visual feedback to reels
  addReelFeedback(isWin) {
    this.elements.reels?.forEach((reel) => {
      reel.classList.remove("winner", "loser");
      reel.classList.add(isWin ? "winner" : "loser");
    });

    // Remove classes after animation
    setTimeout(() => {
      this.elements.reels?.forEach((reel) => {
        reel.classList.remove("winner", "loser");
      });
    }, 2000);
  }

  // Show result message
  showResult(message, color = "#fff", duration = 3000) {
    if (this.elements.resultDisplay) {
      this.elements.resultDisplay.innerHTML = `
        <div class="result-text" style="color: ${color};">
          ${message}
        </div>
      `;
      this.elements.resultDisplay.classList.remove("hidden");

      // Auto-hide after duration
      setTimeout(() => {
        this.elements.resultDisplay.classList.add("hidden");
      }, duration);
    }
  }

  // Update spin button state
  updateSpinButton() {
    if (this.elements.spinButton) {
      if (this.isSpinning) {
        this.elements.spinButton.disabled = true;
        this.elements.spinButton.textContent = "Spinning...";
      } else {
        // Let the specific implementation handle button state
        this.elements.spinButton.textContent = "Spin";
      }
    }
  }

  // Get current spin count
  getSpinCount() {
    return this.spinCount;
  }

  // Reset spin count
  resetSpinCount() {
    this.spinCount = 0;
  }

  // Check if currently spinning
  isCurrentlySpinning() {
    return this.isSpinning;
  }

  // Get symbol by name
  getSymbol(name) {
    return this.config.symbols.find((s) => s.name === name);
  }

  // Get all symbols
  getSymbols() {
    return [...this.config.symbols];
  }

  // Utility function for delays
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Make available globally
window.SlotMachine = SlotMachine;

console.log("🎰 Generic SlotMachine class loaded!");
