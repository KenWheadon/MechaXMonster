// StartScreen - Extends generic Screen class with mini-clicker game
class StartScreen extends Screen {
  constructor(container) {
    super(container, "start");

    // StartScreen specific state
    this.clickCount = 0;
    this.maxClicks = 10;
    this.gamePhase = "logo-intro"; // 'logo-intro', 'click-game', 'main-screen'
    this.logoAnimationComplete = false;
    this.energyLevel = 0;
    this.isCharging = false;
    this.typingInterval = null;

    // DOM element cache - populated after render()
    this.elements = {};

    console.log("🚀 StartScreen with Mini-Clicker Game created");
  }

  // Override init to add StartScreen specific initialization
  init() {
    this.render();
    this.cacheElements();
    this.setupEventListeners();
    this.startAnimations();
    this.initializeAudio();
    this.startParticleSystem();
    this.startLogoIntroSequence();
    this.isActive = true;

    console.log("✅ StartScreen with Mini-Clicker initialized");
  }

  // Cache frequently accessed DOM elements
  cacheElements() {
    this.elements = {
      clickButton: this.container.querySelector(".click-button"),
      progressContainer: this.container.querySelector(
        ".click-progress-container"
      ),
      progressFill: this.container.querySelector(".click-progress-fill"),
      clickCountElement: this.container.querySelector(".click-count"),
      energyFill: this.container.querySelector(".energy-fill"),
      energyValue: this.container.querySelector(".energy-value"),
      buttonEnergyFill: this.container.querySelector(".button-energy-fill"),
      clickerSection: this.container.querySelector(".clicker-game-section"),
      taglineContainer: this.container.querySelector(".tagline-container"),
      gameOptionsContainer: this.container.querySelector(
        ".game-options-container"
      ),
      uiOverlay: this.container.querySelector(".ui-overlay"),
      settingsBtn: this.container.querySelector(".settings-btn"),
      logo: this.container.querySelector(".game-logo"),
      energyCore: this.container.querySelector(".energy-core"),
      logoBurst: this.container.querySelector(".logo-burst-effect"),
      logoGlow: this.container.querySelector(".logo-glow"),
      logoParticles: this.container.querySelector(".logo-particles"),
      taglineElement: this.container.querySelector(".typing-text"),
      slimeDefenseButton: this.container.querySelector(".slime-defense-button"),
    };
  }

  // Override render method
  render() {
    const html = `
            <div class="start-screen screen active">
                <!-- Multi-layer background system -->
                <div class="background-layer background-image" style="background-image: url('images/map-background.png');"></div>
                <div class="background-layer nebula-layer"></div>
                <div class="stars-layer"></div>
                <div class="asteroids-layer"></div>
                <div class="particles-layer"></div>
                
                <!-- Main content container -->
                <div class="content-container">
                    <!-- Logo section with dramatic intro -->
                    <div class="title-container">
                        <div class="logo-wrapper">
                            <div class="energy-core"></div>
                            <div class="logo-burst-effect"></div>
                            <img src="images/logo.png" alt="${
                              this.config.title || "Mecha X Monster"
                            }" class="game-logo logo-hidden" />
                            <div class="logo-glow"></div>
                            <div class="logo-particles"></div>
                        </div>
                        
                        <!-- Mini-clicker game elements -->
                        <div class="clicker-game-section hidden">
                            <!-- Progress bar (appears after first click) -->
                            <div class="click-progress-container hidden">
                                <div class="click-progress-bar">
                                    <div class="click-progress-fill"></div>
                                    <div class="click-progress-text">
                                        <span class="click-count">0</span>/<span class="click-max">${
                                          this.maxClicks
                                        }</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Click button -->
                            <div class="click-button-container">
                                <button class="click-button">
                                    <div class="click-button-bg"></div>
                                    <div class="click-button-text">CLICK</div>
                                    <div class="click-ripple-container"></div>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Original tagline (appears after clicker game) -->
                        <div class="tagline-container hidden">
                            <p class="tagline typing-text" data-text="${
                              this.config.tagline || "Space Mining & Defense"
                            }"></p>
                            <p class="subtitle fade-in-text">${
                              this.config.subtitle ||
                              "Defend your mining operations from alien threats"
                            }</p>
                        </div>
                    </div>
                    
                    <!-- Enhanced game options section (appears after clicker game) -->
                    <div class="game-options-container hidden">
                        <div class="game-options-grid">
                            <!-- Slime Defense Mode Button -->
                            <div class="game-option-card">
                                <div class="button-container">
                                    <div class="energy-ring"></div>
                                    <button class="slime-defense-button btn btn-primary" data-action="slime-defense">
                                        <div class="button-bg"></div>
                                        <div class="button-energy-fill"></div>
                                        <div class="button-text">START GAME</div>
                                        <div class="energy-particles"></div>
                                    </button>
                                    <div class="button-glow"></div>
                                </div>
                                <div class="game-option-description">
                                    <h3>Slime Defense</h3>
                                    <p>Defend your base from waves of alien slimes. Click to attack and survive as long as possible!</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Energy charge indicator -->
                        <div class="energy-meter">
                            <div class="energy-bar progress-bar">
                                <div class="energy-fill progress-fill"></div>
                            </div>
                            <div class="energy-text">ENERGY: <span class="energy-value">0</span>%</div>
                        </div>
                    </div>
                </div>
                
                <!-- Additional UI elements (appears after clicker game) -->
                <div class="ui-overlay hidden">
                    <!-- Settings button -->
                    <button class="settings-btn btn btn-secondary" title="Settings">
                        <img src="images/icon-settings.png" alt="Settings" />
                    </button>
                    
                    <!-- Version info -->
                    <div class="version-info">v2.1.0</div>
                </div>
                
                <!-- Loading overlay -->
                <div class="loading-overlay hidden">
                    <div class="loading-content">
                        <div class="loading-spinner"></div>
                        <div class="loading-text">INITIALIZING OPERATIONS...</div>
                        <div class="loading-progress">
                            <div class="progress-bar">
                                <div class="progress-fill"></div>
                            </div>
                            <div class="progress-percentage">0%</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    // Clear container and add our screen
    this.container.innerHTML = html;
  }

  // Override setupEventListeners to add StartScreen specific events
  setupEventListeners() {
    // Call parent method for common event listeners
    super.setupEventListeners();

    // StartScreen specific event listeners using cached elements
    if (this.elements.clickButton) {
      this.elements.clickButton.addEventListener("click", (e) => {
        this.handleClickButtonClick(e);
      });
    }

    if (this.elements.slimeDefenseButton) {
      this.elements.slimeDefenseButton.addEventListener("click", (e) => {
        this.handleSlimeDefenseClick();
      });

      this.elements.slimeDefenseButton.addEventListener("mouseenter", () => {
        this.startEnergyCharging();
      });

      this.elements.slimeDefenseButton.addEventListener("mouseleave", () => {
        this.stopEnergyCharging();
      });
    }

    if (this.elements.settingsBtn) {
      this.elements.settingsBtn.addEventListener("click", (e) => {
        this.handleSettingsClick();
      });
    }
  }

  // Override keyboard handling for StartScreen specific keys
  handleKeydown(e) {
    super.handleKeydown(e);

    if (e.code === "Space") {
      e.preventDefault();
      if (this.gamePhase === "click-game") {
        this.elements.clickButton?.click();
      } else if (this.gamePhase === "main-screen") {
        // Default to slime defense for space key
        this.elements.slimeDefenseButton?.click();
      }
    }
  }

  // Override initializeAudio to add StartScreen specific sounds
  initializeAudio() {
    super.initializeAudio();

    // Add StartScreen specific sounds
    this.audioManager.sounds = {
      ...this.audioManager.sounds,
      "logo-intro": null,
      "ui-appear": null,
      click: null,
      "game-complete": null,
      "background-music": null,
      "button-click": null,
      "energy-charge": null,
      "energy-full": null,
      type: null,
    };

    // Override enable to start background music after delay
    const originalEnable = this.audioManager.enable.bind(this.audioManager);
    this.audioManager.enable = () => {
      originalEnable();
      this.setManagedTimeout(() => {
        if (this.audioManager.enabled) {
          this.audioManager.playSound("background-music", true);
        }
      }, 5000);
    };
  }

  // LOGO INTRO SEQUENCE
  startLogoIntroSequence() {
    console.log("🎬 Starting dramatic logo intro sequence...");

    if (!this.elements.logo) return;

    // Play intro music
    if (this.audioManager) {
      this.audioManager.playSound("logo-intro");
    }

    // Step 1: Dramatic logo entrance
    this.setManagedTimeout(() => {
      this.elements.logo.classList.add("logo-intro-animation");
      this.elements.logo.classList.remove("logo-hidden");

      // Activate energy core
      this.setManagedTimeout(() => {
        if (this.elements.energyCore)
          this.elements.energyCore.style.opacity = "1";
      }, 500);

      // Burst effect
      this.setManagedTimeout(() => {
        if (this.elements.logoBurst)
          this.elements.logoBurst.classList.add("logo-burst-active");
        this.createLogoParticles();
        this.triggerScreenShake();
      }, 800);

      // Glow activation
      this.setManagedTimeout(() => {
        if (this.elements.logoGlow)
          this.elements.logoGlow.classList.add("logo-glow-active");
      }, 1200);
    }, 200);

    // Step 2: Start click game after logo settles
    this.setManagedTimeout(() => {
      this.startClickGame();
    }, 3000);
  }

  createLogoParticles() {
    if (!this.elements.logoParticles) return;

    // Create burst of particles
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement("div");
      particle.className = "logo-particle";

      const size = Math.random() * 6 + 3;
      const angle = (360 / 12) * i;
      const distance = 100 + Math.random() * 50;

      particle.style.width = particle.style.height = size + "px";
      particle.style.left = "50%";
      particle.style.top = "50%";

      const radians = (angle * Math.PI) / 180;
      const x = Math.cos(radians) * distance;
      const y = Math.sin(radians) * distance;

      particle.style.animation = `logoParticleBlast 2s ease-out forwards`;
      particle.style.setProperty("--x", x + "px");
      particle.style.setProperty("--y", y + "px");

      this.elements.logoParticles.appendChild(particle);

      // Remove particle after animation
      this.setManagedTimeout(() => {
        if (particle.parentNode) {
          particle.remove();
        }
      }, 2000);
    }
  }

  // MINI-CLICKER GAME LOGIC
  startClickGame() {
    console.log("🎮 Starting mini-clicker game phase...");

    this.gamePhase = "click-game";

    if (this.elements.clickerSection) {
      this.elements.clickerSection.classList.remove("hidden");
      this.setManagedTimeout(() => {
        this.elements.clickerSection.classList.add("show");
      }, 100);
    }

    // Play UI sound
    if (this.audioManager) {
      this.audioManager.playSound("ui-appear");
    }
  }

  handleClickButtonClick(event) {
    if (this.gamePhase !== "click-game") return;

    this.clickCount++;
    console.log(`🖱️ Click ${this.clickCount}/${this.maxClicks}`);

    // Visual feedback using cached elements
    this.elements.clickButton.classList.add("clicked");
    this.setManagedTimeout(() => {
      this.elements.clickButton.classList.remove("clicked");
    }, 300);

    // Show progress bar on first click
    if (this.clickCount === 1 && this.elements.progressContainer) {
      this.elements.progressContainer.classList.remove("hidden");
      this.setManagedTimeout(() => {
        this.elements.progressContainer.classList.add("show");
      }, 100);
    }

    // Update progress bar
    const progressPercent = (this.clickCount / this.maxClicks) * 100;
    if (this.elements.progressFill) {
      this.elements.progressFill.style.width = progressPercent + "%";
    }
    if (this.elements.clickCountElement) {
      this.elements.clickCountElement.textContent = this.clickCount;
    }

    // Create ripple effect using parent method
    this.createRippleEffect(this.elements.clickButton, event);

    // Create click particles using parent method
    const rect = this.elements.clickButton.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    this.createParticleBurst(centerX, centerY, 6);

    // Screen shake effect
    if (this.clickCount % 3 === 0) {
      this.triggerScreenShake();
    }

    // Play click sound
    if (this.audioManager) {
      this.audioManager.playSound(
        "click",
        false,
        0.8 + (this.clickCount / this.maxClicks) * 0.4
      );
    }

    // Check if complete
    if (this.clickCount >= this.maxClicks) {
      this.setManagedTimeout(() => {
        this.completeClickGame();
      }, 500);
    }
  }

  completeClickGame() {
    console.log("🎉 Mini-clicker game completed!");

    // Play completion sound
    if (this.audioManager) {
      this.audioManager.playSound("game-complete");
    }

    // Create completion effect
    this.createCompletionEffect();

    // Hide clicker game elements
    if (this.elements.clickerSection) {
      this.elements.clickerSection.style.animation =
        "fadeOutUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards";
    }

    // Transition to main screen
    this.setManagedTimeout(() => {
      this.showMainScreen();
    }, 800);
  }

  createCompletionEffect() {
    // Create burst of completion particles
    if (!this.elements.clickButton) return;

    const rect = this.elements.clickButton.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Use parent method for particle burst
    this.createParticleBurst(centerX, centerY, 20);

    // Screen flash effect
    const flash = document.createElement("div");
    flash.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 255, 136, 0.3);
      z-index: 1000;
      pointer-events: none;
    `;

    document.body.appendChild(flash);

    flash.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }], {
      duration: 500,
      easing: "ease-out",
    }).onfinish = () => {
      flash.remove();
    };
  }

  showMainScreen() {
    console.log("🌟 Transitioning to main screen...");

    this.gamePhase = "main-screen";

    // Hide clicker game section
    if (this.elements.clickerSection) {
      this.elements.clickerSection.classList.add("hidden");
    }

    // Show tagline container
    if (this.elements.taglineContainer) {
      this.elements.taglineContainer.classList.remove("hidden");
      this.setManagedTimeout(() => {
        this.elements.taglineContainer.classList.add("show");
        this.startTypingEffect();
      }, 200);
    }

    // Show game options container
    this.setManagedTimeout(() => {
      if (this.elements.gameOptionsContainer) {
        this.elements.gameOptionsContainer.classList.remove("hidden");
        this.setManagedTimeout(() => {
          this.elements.gameOptionsContainer.classList.add("show");
        }, 100);
      }
    }, 1000);

    // Show UI overlay
    this.setManagedTimeout(() => {
      if (this.elements.uiOverlay) {
        this.elements.uiOverlay.classList.remove("hidden");
        this.setManagedTimeout(() => {
          this.elements.uiOverlay.classList.add("show");
        }, 100);
      }
    }, 1500);
  }

  startTypingEffect() {
    if (!this.elements.taglineElement) return;

    const text =
      this.elements.taglineElement.getAttribute("data-text") ||
      this.config.tagline ||
      "Space Mining & Defense";
    let currentText = "";
    let index = 0;

    this.elements.taglineElement.textContent = "";

    this.typingInterval = this.setManagedInterval(() => {
      if (index < text.length) {
        currentText += text[index];
        this.elements.taglineElement.textContent = currentText;
        index++;

        // Play typing sound
        if (this.audioManager) {
          this.audioManager.playSound("type");
        }
      } else {
        clearInterval(this.typingInterval);
        // Remove cursor after typing is complete
        this.setManagedTimeout(() => {
          this.elements.taglineElement.style.setProperty("--cursor", "none");
        }, 2000);
      }
    }, 100);
  }

  startEnergyCharging() {
    if (this.isCharging || this.gamePhase !== "main-screen") return;

    this.isCharging = true;
    if (this.elements.slimeDefenseButton)
      this.elements.slimeDefenseButton.classList.add("charging");

    const chargeInterval = this.setManagedInterval(() => {
      if (!this.isCharging) {
        clearInterval(chargeInterval);
        return;
      }

      this.energyLevel = Math.min(this.energyLevel + 2, 100);

      if (this.elements.energyFill) {
        this.elements.energyFill.style.width = this.energyLevel + "%";
      }
      if (this.elements.energyValue) {
        this.elements.energyValue.textContent = this.energyLevel;
      }
      if (this.elements.buttonEnergyFill) {
        this.elements.buttonEnergyFill.style.setProperty(
          "--energy",
          this.energyLevel + "%"
        );
      }

      // Play charging sound periodically
      if (this.energyLevel % 10 === 0 && this.audioManager) {
        this.audioManager.playSound("energy-charge");
      }

      if (this.energyLevel >= 100) {
        this.isCharging = false;
        clearInterval(chargeInterval);

        // Play full charge sound
        if (this.audioManager) {
          this.audioManager.playSound("energy-full");
        }
      }
    }, 50);
  }

  stopEnergyCharging() {
    if (this.gamePhase !== "main-screen") return;

    this.isCharging = false;
    if (this.elements.slimeDefenseButton)
      this.elements.slimeDefenseButton.classList.remove("charging");

    // Slowly drain energy when not charging
    const drainInterval = this.setManagedInterval(() => {
      if (this.isCharging) {
        clearInterval(drainInterval);
        return;
      }

      this.energyLevel = Math.max(this.energyLevel - 1, 0);

      if (this.elements.energyFill) {
        this.elements.energyFill.style.width = this.energyLevel + "%";
      }
      if (this.elements.energyValue) {
        this.elements.energyValue.textContent = this.energyLevel;
      }
      if (this.elements.buttonEnergyFill) {
        this.elements.buttonEnergyFill.style.setProperty(
          "--energy",
          this.energyLevel + "%"
        );
      }

      if (this.energyLevel <= 0) {
        clearInterval(drainInterval);
      }
    }, 100);
  }

  handleSlimeDefenseClick() {
    if (this.gamePhase !== "main-screen") return;

    console.log("🎯 Start Game button clicked!");

    // Play sound effect
    if (this.audioManager) {
      this.audioManager.playSound("button-click");
      this.audioManager.stopSound("background-music");
    }

    // Show loading overlay
    this.showLoadingScreen();

    // Success message
    this.setManagedTimeout(() => {
      this.showSuccessMessage(
        "🎯 DEFENSE SYSTEMS ONLINE!\nPreparing slime detection grid..."
      );
    }, 500);

    // Simulate loading process
    this.simulateLoading(() => {
      console.log("🔄 Ready to transition to Slime Defense Screen");
      // Transition to slime defense screen if app is available
      if (window.app && window.app.goToScreen) {
        window.app.goToScreen("slime-defense");
      } else {
        this.showTemporaryMessage("⚠️ Slime Defense not available", "warning");
      }
    });
  }

  handleSettingsClick() {
    console.log("⚙️ Settings button clicked!");

    if (this.audioManager) {
      this.audioManager.playSound("ui-hover");
    }

    // In full game, this would open settings panel
    this.showTemporaryMessage("⚙️ Settings panel coming soon!", "info");
  }

  // Override destroy to clean up StartScreen specific elements
  destroy() {
    // Clear typing interval
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }

    // Clear cached elements
    this.elements = {};

    // Reset StartScreen specific state
    this.clickCount = 0;
    this.gamePhase = "logo-intro";
    this.logoAnimationComplete = false;
    this.energyLevel = 0;
    this.isCharging = false;

    // Call parent destroy method
    super.destroy();

    console.log("🗑️ StartScreen destroyed and cleaned up");
  }

  // Debug methods for testing
  skipToClickGame() {
    if (this.gamePhase === "logo-intro") {
      this.startClickGame();
    }
  }

  skipToMainScreen() {
    if (this.gamePhase === "click-game") {
      this.completeClickGame();
    }
  }

  setClickCount(count) {
    this.clickCount = Math.min(count, this.maxClicks);

    if (this.elements.progressFill) {
      const progressPercent = (this.clickCount / this.maxClicks) * 100;
      this.elements.progressFill.style.width = progressPercent + "%";
    }
    if (this.elements.clickCountElement) {
      this.elements.clickCountElement.textContent = this.clickCount;
    }
  }

  // Get current game phase for debugging
  getGamePhase() {
    return this.gamePhase;
  }

  // Force transition to specific game mode
  forceTransitionTo(mode) {
    if (mode === "slime-defense") {
      this.handleSlimeDefenseClick();
    } else {
      console.warn(`Unknown mode: ${mode}`);
    }
  }

  // Get screen statistics
  getScreenStats() {
    return {
      gamePhase: this.gamePhase,
      clickCount: this.clickCount,
      maxClicks: this.maxClicks,
      energyLevel: this.energyLevel,
      isCharging: this.isCharging,
      logoAnimationComplete: this.logoAnimationComplete,
      isActive: this.isActive,
    };
  }
}

// Make available globally for debug system
window.StartScreen = StartScreen;

console.log("📱 Enhanced StartScreen class with App integration loaded!");
