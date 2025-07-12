// SlimeDefenseScreen - Tower Defense style game with slimes
class SlimeDefenseScreen extends Screen {
  constructor(container) {
    super(container, "slime-defense");

    // Game state
    this.playerHP = 10;
    this.playerMaxHP = 10;
    this.coins = 0;
    this.score = 0;
    this.gameOver = false;
    this.gameStarted = false;
    this.wave = 1;
    this.slimesKilled = 0;

    // Slime management
    this.slimes = [];
    this.slimeId = 0;
    this.spawnTimer = 0;
    this.spawnInterval = 2000; // 2 seconds between spawns
    this.gameLoop = null;

    // Game area dimensions
    this.gameWidth = window.innerWidth;
    this.gameHeight = window.innerHeight;

    // Slime configurations
    this.slimeTypes = {
      orange: {
        image: "images/slime-orange-1.png",
        hp: 2,
        coins: 1,
        speed: 1,
        color: "#FF8C00",
      },
      teal: {
        image: "images/slime-teal-1.png",
        hp: 3,
        coins: 2,
        speed: 2,
        color: "#008B8B",
      },
      blue: {
        image: "images/slime-blue-1.png",
        hp: 5,
        coins: 5,
        speed: 1,
        color: "#0000FF",
      },
      yellow: {
        image: "images/slime-yellow-1.png",
        hp: 10,
        coins: 8,
        speed: 0.5,
        color: "#FFD700",
      },
      alien: {
        image: "images/slime-alien-1.png",
        hp: 1,
        coins: 5,
        speed: 5,
        color: "#00FF00",
      },
    };

    // DOM element cache
    this.elements = {};

    console.log("🎮 SlimeDefenseScreen created");
  }

  // Override init to add SlimeDefenseScreen specific initialization
  init() {
    this.render();
    this.cacheElements();
    this.setupEventListeners();
    this.startAnimations();
    this.initializeAudio();
    this.startParticleSystem();
    this.isActive = true;
    this.startGame();

    console.log("✅ SlimeDefenseScreen initialized");
  }

  // Cache frequently accessed DOM elements
  cacheElements() {
    this.elements = {
      gameArea: this.container.querySelector(".game-area"),
      playerHP: this.container.querySelector(".player-hp"),
      playerHPBar: this.container.querySelector(".player-hp-bar"),
      coins: this.container.querySelector(".coins-value"),
      score: this.container.querySelector(".score-value"),
      wave: this.container.querySelector(".wave-value"),
      startButton: this.container.querySelector(".start-button"),
      gameOverScreen: this.container.querySelector(".game-over-screen"),
      finalScore: this.container.querySelector(".final-score"),
      finalCoins: this.container.querySelector(".final-coins"),
      restartButton: this.container.querySelector(".restart-button"),
      pauseButton: this.container.querySelector(".pause-button"),
      gameUI: this.container.querySelector(".game-ui"),
    };
  }

  // Override render method
  render() {
    const html = `
      <div class="slime-defense-screen screen active">
        <!-- Background layers -->
        <div class="background-layer background-image" style="background-image: url('images/map-background.png');"></div>
        <div class="background-layer nebula-layer"></div>
        <div class="stars-layer"></div>
        <div class="particles-layer"></div>
        
        <!-- Game Area -->
        <div class="game-area"></div>
        
        <!-- Game UI -->
        <div class="game-ui">
          <!-- Player Stats -->
          <div class="player-stats">
            <div class="stat-item">
              <div class="stat-label">HP</div>
              <div class="hp-container">
                <div class="hp-bar-background">
                  <div class="player-hp-bar" style="width: 100%;"></div>
                </div>
                <div class="player-hp">${this.playerHP}/${this.playerMaxHP}</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Coins</div>
              <div class="coins-value">${this.coins}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Score</div>
              <div class="score-value">${this.score}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Wave</div>
              <div class="wave-value">${this.wave}</div>
            </div>
          </div>
          
          <!-- Game Controls -->
          <div class="game-controls">
            <button class="start-button btn btn-primary">Start Game</button>
            <button class="pause-button btn btn-secondary hidden">Pause</button>
          </div>
        </div>
        
        <!-- Game Over Screen -->
        <div class="game-over-screen hidden">
          <div class="game-over-content">
            <h2>Game Over!</h2>
            <div class="game-over-stats">
              <div class="stat-row">
                <span>Final Score:</span>
                <span class="final-score">${this.score}</span>
              </div>
              <div class="stat-row">
                <span>Coins Earned:</span>
                <span class="final-coins">${this.coins}</span>
              </div>
              <div class="stat-row">
                <span>Slimes Killed:</span>
                <span class="slimes-killed">${this.slimesKilled}</span>
              </div>
              <div class="stat-row">
                <span>Wave Reached:</span>
                <span class="wave-reached">${this.wave}</span>
              </div>
            </div>
            <div class="game-over-buttons">
              <button class="restart-button btn btn-primary">Play Again</button>
              <button class="menu-button btn btn-secondary">Main Menu</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  // Override setupEventListeners to add SlimeDefenseScreen specific events
  setupEventListeners() {
    super.setupEventListeners();

    // Game control buttons
    if (this.elements.startButton) {
      this.elements.startButton.addEventListener("click", () => {
        this.startGame();
      });
    }

    if (this.elements.pauseButton) {
      this.elements.pauseButton.addEventListener("click", () => {
        this.togglePause();
      });
    }

    if (this.elements.restartButton) {
      this.elements.restartButton.addEventListener("click", () => {
        this.restartGame();
      });
    }

    // Click detection for slimes
    if (this.elements.gameArea) {
      this.elements.gameArea.addEventListener("click", (e) => {
        this.handleGameAreaClick(e);
      });
    }

    // Window resize handling
    window.addEventListener("resize", () => {
      this.updateGameDimensions();
    });
  }

  // Override keyboard handling
  handleKeydown(e) {
    super.handleKeydown(e);

    if (e.code === "Space") {
      e.preventDefault();
      if (!this.gameStarted) {
        this.startGame();
      } else {
        this.togglePause();
      }
    }

    if (e.code === "KeyR" && this.gameOver) {
      this.restartGame();
    }
  }

  // Game initialization
  startGame() {
    if (this.gameStarted && !this.gameOver) return;

    console.log("🎮 Starting Slime Defense Game");

    this.gameStarted = true;
    this.gameOver = false;

    // Hide start button, show pause button
    if (this.elements.startButton) {
      this.elements.startButton.classList.add("hidden");
    }
    if (this.elements.pauseButton) {
      this.elements.pauseButton.classList.remove("hidden");
    }

    // Hide game over screen
    if (this.elements.gameOverScreen) {
      this.elements.gameOverScreen.classList.add("hidden");
    }

    // Start game loop
    this.startGameLoop();

    // Play game start sound
    if (this.audioManager) {
      this.audioManager.playSound("game-start");
    }
  }

  // Game loop
  startGameLoop() {
    let lastTime = 0;

    const gameLoop = (currentTime) => {
      if (!this.gameStarted || this.gameOver) return;

      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Update game logic
      this.updateSlimes(deltaTime);
      this.updateSpawning(deltaTime);
      this.updateUI();

      // Continue loop
      this.gameLoop = requestAnimationFrame(gameLoop);
    };

    this.gameLoop = requestAnimationFrame(gameLoop);
  }

  // Slime spawning logic
  updateSpawning(deltaTime) {
    this.spawnTimer += deltaTime;

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnSlime();
      this.spawnTimer = 0;

      // Gradually increase spawn rate
      this.spawnInterval = Math.max(800, this.spawnInterval - 10);
    }
  }

  // Spawn a new slime
  spawnSlime() {
    const slimeTypeKeys = Object.keys(this.slimeTypes);
    const randomType =
      slimeTypeKeys[Math.floor(Math.random() * slimeTypeKeys.length)];

    const slimeConfig = this.slimeTypes[randomType];

    const slime = {
      id: this.slimeId++,
      type: randomType,
      hp: slimeConfig.hp,
      maxHP: slimeConfig.hp,
      coins: slimeConfig.coins,
      speed: slimeConfig.speed,
      x: this.gameWidth + 50, // Start off-screen right
      y: Math.random() * (this.gameHeight - 200) + 100, // Random Y position
      width: 60,
      height: 60,
      element: null,
      hpBarElement: null,
      clicked: false,
    };

    // Create slime DOM element
    this.createSlimeElement(slime);

    // Add to slimes array
    this.slimes.push(slime);

    console.log(
      `👾 Spawned ${randomType} slime (HP: ${slime.hp}, Coins: ${slime.coins}, Speed: ${slime.speed})`
    );
  }

  // Create DOM element for slime
  createSlimeElement(slime) {
    const slimeEl = document.createElement("div");
    slimeEl.className = "slime";
    slimeEl.style.cssText = `
      position: absolute;
      left: ${slime.x}px;
      top: ${slime.y}px;
      width: ${slime.width}px;
      height: ${slime.height}px;
      background-image: url('${this.slimeTypes[slime.type].image}');
      background-size: cover;
      background-position: center;
      cursor: pointer;
      transition: transform 0.1s ease;
      z-index: 10;
    `;

    // Add click handler
    slimeEl.addEventListener("click", (e) => {
      e.stopPropagation();
      this.attackSlime(slime);
    });

    // Add hover effects
    slimeEl.addEventListener("mouseenter", () => {
      slimeEl.style.transform = "scale(1.1)";
    });

    slimeEl.addEventListener("mouseleave", () => {
      slimeEl.style.transform = "scale(1)";
    });

    // Create HP bar
    const hpBarContainer = document.createElement("div");
    hpBarContainer.className = "slime-hp-bar-container";
    hpBarContainer.style.cssText = `
      position: absolute;
      top: -10px;
      left: 0;
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 3px;
      border: 1px solid rgba(0, 0, 0, 0.5);
    `;

    const hpBar = document.createElement("div");
    hpBar.className = "slime-hp-bar";
    hpBar.style.cssText = `
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, #ff4444, #ff8888);
      border-radius: 3px;
      transition: width 0.2s ease;
    `;

    hpBarContainer.appendChild(hpBar);
    slimeEl.appendChild(hpBarContainer);

    // Store references
    slime.element = slimeEl;
    slime.hpBarElement = hpBar;

    // Add to game area
    this.elements.gameArea.appendChild(slimeEl);
  }

  // Update all slimes
  updateSlimes(deltaTime) {
    for (let i = this.slimes.length - 1; i >= 0; i--) {
      const slime = this.slimes[i];

      // Move slime left
      slime.x -= slime.speed * (deltaTime / 16); // Normalize to 60fps

      // Update DOM position
      if (slime.element) {
        slime.element.style.left = slime.x + "px";
      }

      // Check if slime escaped
      if (slime.x < -slime.width) {
        this.slimeEscaped(slime);
        this.removeSlime(i);
      }
    }
  }

  // Handle slime click/attack
  attackSlime(slime) {
    if (!slime || slime.hp <= 0) return;

    slime.hp -= 1;
    slime.clicked = true;

    // Update HP bar
    const hpPercent = (slime.hp / slime.maxHP) * 100;
    if (slime.hpBarElement) {
      slime.hpBarElement.style.width = hpPercent + "%";

      // Change color based on HP
      if (hpPercent > 60) {
        slime.hpBarElement.style.background =
          "linear-gradient(90deg, #44ff44, #88ff88)";
      } else if (hpPercent > 30) {
        slime.hpBarElement.style.background =
          "linear-gradient(90deg, #ffff44, #ffff88)";
      } else {
        slime.hpBarElement.style.background =
          "linear-gradient(90deg, #ff4444, #ff8888)";
      }
    }

    // Visual feedback
    if (slime.element) {
      slime.element.style.transform = "scale(0.9)";
      setTimeout(() => {
        if (slime.element) {
          slime.element.style.transform = "scale(1)";
        }
      }, 100);
    }

    // Create click effect
    this.createClickEffect(
      slime.x + slime.width / 2,
      slime.y + slime.height / 2
    );

    // Play attack sound
    if (this.audioManager) {
      this.audioManager.playSound("slime-hit");
    }

    // Check if slime is dead
    if (slime.hp <= 0) {
      this.killSlime(slime);
    }

    console.log(
      `🎯 Attacked ${slime.type} slime (HP: ${slime.hp}/${slime.maxHP})`
    );
  }

  // Handle slime death
  killSlime(slime) {
    // Award coins and score
    this.coins += slime.coins;
    this.score += slime.coins * 10;
    this.slimesKilled++;

    // Create death effect
    this.createDeathEffect(
      slime.x + slime.width / 2,
      slime.y + slime.height / 2,
      slime.type
    );

    // Play death sound
    if (this.audioManager) {
      this.audioManager.playSound("slime-death");
    }

    // Remove slime
    const index = this.slimes.indexOf(slime);
    if (index > -1) {
      this.removeSlime(index);
    }

    console.log(`💀 Killed ${slime.type} slime! Gained ${slime.coins} coins`);
  }

  // Handle slime escape
  slimeEscaped(slime) {
    this.playerHP = Math.max(0, this.playerHP - 1);

    // Create escape effect
    this.createEscapeEffect();

    // Play escape sound
    if (this.audioManager) {
      this.audioManager.playSound("slime-escape");
    }

    // Check game over
    if (this.playerHP <= 0) {
      this.endGame();
    }

    console.log(`🏃 ${slime.type} slime escaped! Player HP: ${this.playerHP}`);
  }

  // Remove slime from game
  removeSlime(index) {
    const slime = this.slimes[index];

    // Remove DOM element
    if (slime.element && slime.element.parentNode) {
      slime.element.parentNode.removeChild(slime.element);
    }

    // Remove from array
    this.slimes.splice(index, 1);
  }

  // Create visual effects
  createClickEffect(x, y) {
    const effect = document.createElement("div");
    effect.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 20px;
      height: 20px;
      background: radial-gradient(circle, #ffff00, transparent);
      border-radius: 50%;
      pointer-events: none;
      animation: clickEffect 0.3s ease-out forwards;
      z-index: 100;
    `;

    this.elements.gameArea.appendChild(effect);

    setTimeout(() => {
      if (effect.parentNode) {
        effect.parentNode.removeChild(effect);
      }
    }, 300);
  }

  createDeathEffect(x, y, slimeType) {
    const color = this.slimeTypes[slimeType].color;

    // Create multiple particles
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement("div");
      particle.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 8px;
        height: 8px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        animation: deathParticle 0.8s ease-out forwards;
        z-index: 100;
      `;

      const angle = (360 / 8) * i;
      const distance = 30 + Math.random() * 20;
      particle.style.setProperty("--angle", angle + "deg");
      particle.style.setProperty("--distance", distance + "px");

      this.elements.gameArea.appendChild(particle);

      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 800);
    }
  }

  createEscapeEffect() {
    // Screen flash effect
    const flash = document.createElement("div");
    flash.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 0, 0, 0.3);
      pointer-events: none;
      animation: flashEffect 0.5s ease-out forwards;
      z-index: 1000;
    `;

    document.body.appendChild(flash);

    setTimeout(() => {
      if (flash.parentNode) {
        flash.parentNode.removeChild(flash);
      }
    }, 500);
  }

  // Update UI elements
  updateUI() {
    if (this.elements.playerHP) {
      this.elements.playerHP.textContent = `${this.playerHP}/${this.playerMaxHP}`;
    }

    if (this.elements.playerHPBar) {
      const hpPercent = (this.playerHP / this.playerMaxHP) * 100;
      this.elements.playerHPBar.style.width = hpPercent + "%";

      // Change color based on HP
      if (hpPercent > 60) {
        this.elements.playerHPBar.style.background =
          "linear-gradient(90deg, #44ff44, #88ff88)";
      } else if (hpPercent > 30) {
        this.elements.playerHPBar.style.background =
          "linear-gradient(90deg, #ffff44, #ffff88)";
      } else {
        this.elements.playerHPBar.style.background =
          "linear-gradient(90deg, #ff4444, #ff8888)";
      }
    }

    if (this.elements.coins) {
      this.elements.coins.textContent = this.coins;
    }

    if (this.elements.score) {
      this.elements.score.textContent = this.score;
    }

    if (this.elements.wave) {
      this.elements.wave.textContent = this.wave;
    }
  }

  // Game over
  endGame() {
    console.log("💀 Game Over!");

    this.gameOver = true;
    this.gameStarted = false;

    // Stop game loop
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
    }

    // Show game over screen
    if (this.elements.gameOverScreen) {
      this.elements.gameOverScreen.classList.remove("hidden");
    }

    // Update final stats
    if (this.elements.finalScore) {
      this.elements.finalScore.textContent = this.score;
    }
    if (this.elements.finalCoins) {
      this.elements.finalCoins.textContent = this.coins;
    }

    // Play game over sound
    if (this.audioManager) {
      this.audioManager.playSound("game-over");
    }
  }

  // Restart game
  restartGame() {
    console.log("🔄 Restarting game");

    // Reset game state
    this.playerHP = this.playerMaxHP;
    this.coins = 0;
    this.score = 0;
    this.wave = 1;
    this.slimesKilled = 0;
    this.gameOver = false;
    this.gameStarted = false;
    this.spawnTimer = 0;
    this.spawnInterval = 2000;

    // Clear all slimes
    this.slimes.forEach((slime) => {
      if (slime.element && slime.element.parentNode) {
        slime.element.parentNode.removeChild(slime.element);
      }
    });
    this.slimes = [];
    this.slimeId = 0;

    // Reset UI
    this.updateUI();

    // Show start button
    if (this.elements.startButton) {
      this.elements.startButton.classList.remove("hidden");
    }
    if (this.elements.pauseButton) {
      this.elements.pauseButton.classList.add("hidden");
    }
    if (this.elements.gameOverScreen) {
      this.elements.gameOverScreen.classList.add("hidden");
    }
  }

  // Toggle pause
  togglePause() {
    if (this.gameStarted && !this.gameOver) {
      this.gameStarted = !this.gameStarted;

      if (this.gameStarted) {
        this.startGameLoop();
        console.log("▶️ Game resumed");
      } else {
        if (this.gameLoop) {
          cancelAnimationFrame(this.gameLoop);
        }
        console.log("⏸️ Game paused");
      }
    }
  }

  // Handle game area clicks (for missed clicks)
  handleGameAreaClick(e) {
    if (!this.gameStarted || this.gameOver) return;

    // Create missed click effect
    const rect = this.elements.gameArea.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.createMissedClickEffect(x, y);
  }

  createMissedClickEffect(x, y) {
    const effect = document.createElement("div");
    effect.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 10px;
      height: 10px;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 50%;
      pointer-events: none;
      animation: missedClickEffect 0.3s ease-out forwards;
      z-index: 50;
    `;

    this.elements.gameArea.appendChild(effect);

    setTimeout(() => {
      if (effect.parentNode) {
        effect.parentNode.removeChild(effect);
      }
    }, 300);
  }

  // Update game dimensions on resize
  updateGameDimensions() {
    this.gameWidth = window.innerWidth;
    this.gameHeight = window.innerHeight;
  }

  // Override initializeAudio to add SlimeDefenseScreen specific sounds
  initializeAudio() {
    super.initializeAudio();

    // Add SlimeDefenseScreen specific sounds
    this.audioManager.sounds = {
      ...this.audioManager.sounds,
      "game-start": null,
      "slime-hit": null,
      "slime-death": null,
      "slime-escape": null,
      "game-over": null,
      "background-music": null,
    };
  }

  // Override destroy to clean up SlimeDefenseScreen specific elements
  destroy() {
    // Stop game loop
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
    }

    // Clean up slimes
    this.slimes.forEach((slime) => {
      if (slime.element && slime.element.parentNode) {
        slime.element.parentNode.removeChild(slime.element);
      }
    });
    this.slimes = [];

    // Clear cached elements
    this.elements = {};

    // Reset game state
    this.playerHP = this.playerMaxHP;
    this.coins = 0;
    this.score = 0;
    this.gameOver = false;
    this.gameStarted = false;

    // Call parent destroy method
    super.destroy();

    console.log("🗑️ SlimeDefenseScreen destroyed and cleaned up");
  }

  // Debug methods
  addCoins(amount) {
    this.coins += amount;
    this.updateUI();
  }

  setPlayerHP(hp) {
    this.playerHP = Math.max(0, Math.min(hp, this.playerMaxHP));
    this.updateUI();

    if (this.playerHP <= 0) {
      this.endGame();
    }
  }

  spawnSpecificSlime(type) {
    if (this.slimeTypes[type]) {
      const slimeConfig = this.slimeTypes[type];

      const slime = {
        id: this.slimeId++,
        type: type,
        hp: slimeConfig.hp,
        maxHP: slimeConfig.hp,
        coins: slimeConfig.coins,
        speed: slimeConfig.speed,
        x: this.gameWidth + 50,
        y: Math.random() * (this.gameHeight - 200) + 100,
        width: 60,
        height: 60,
        element: null,
        hpBarElement: null,
        clicked: false,
      };

      this.createSlimeElement(slime);
      this.slimes.push(slime);

      console.log(`🐛 Debug: Spawned ${type} slime`);
    }
  }

  killAllSlimes() {
    this.slimes.forEach((slime) => {
      this.killSlime(slime);
    });
  }
}

// Make available globally
window.SlimeDefenseScreen = SlimeDefenseScreen;

console.log("🎮 SlimeDefenseScreen class loaded!");
