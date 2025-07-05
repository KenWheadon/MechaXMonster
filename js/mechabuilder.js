// MechaBuilder - Handles mecha construction and management
class MechaBuilder {
  constructor(miningScreen) {
    this.miningScreen = miningScreen;
    this.hasMecha = false;
    this.mechaType = null;
  }

  // Initialize mecha builder
  init() {
    this.hasMecha = false;
    this.mechaType = this.miningScreen.mineConfig.mecha;
  }

  // Check if mecha can be built
  canBuildMecha() {
    return this.miningScreen.partsInventory.isComplete() && !this.hasMecha;
  }

  // Build mecha from collected parts
  buildMecha() {
    if (!this.canBuildMecha()) {
      return false;
    }

    console.log("🤖 Building mecha");

    // Clear parts from inventory
    this.miningScreen.partsInventory.clearAllParts();

    // Set mecha as built
    this.hasMecha = true;

    // Enable auto-mining for all machines
    this.enableAutoMining();

    // Update UI
    this.updateMechaDisplay();
    this.miningScreen.updateUI();

    // Play build sound and show success
    if (this.miningScreen.audioManager) {
      this.miningScreen.audioManager.playSound("mecha-built");
    }

    this.showBuildSuccessMessage();
    this.createBuildEffect();

    return true;
  }

  // Enable auto-mining for all machines
  enableAutoMining() {
    this.miningScreen.machineManager.startAutoMiningAll();
  }

  // Update mecha display in UI
  updateMechaDisplay() {
    const mechaDisplay =
      this.miningScreen.container.querySelector(".mecha-display");
    if (!mechaDisplay) return;

    const mechaImage = mechaDisplay.querySelector(".mecha-image");
    const mechaStatus = mechaDisplay.querySelector(".mecha-status");
    const buildButton = mechaDisplay.querySelector(".build-mecha-button");

    if (mechaImage) {
      mechaImage.style.opacity = this.hasMecha ? "1" : "0.2";
    }

    if (this.hasMecha) {
      mechaDisplay.classList.add("has-mecha");
      if (mechaStatus) {
        mechaStatus.innerHTML =
          '<span class="status-active">✅ Auto-Mining Active</span>';
      }
      if (buildButton) {
        buildButton.classList.add("hidden");
      }
    } else {
      mechaDisplay.classList.remove("has-mecha");
      if (mechaStatus) {
        mechaStatus.innerHTML =
          '<span class="status-inactive">🔧 Parts Needed</span>';
      }
      if (buildButton && this.canBuildMecha()) {
        buildButton.classList.remove("hidden");
      }
    }

    // Update combat access
    this.updateCombatAccess();
  }

  // Update combat access based on mecha status
  updateCombatAccess() {
    const combatAccess =
      this.miningScreen.container.querySelector(".combat-access");
    if (combatAccess) {
      if (this.hasMecha) {
        combatAccess.classList.remove("hidden");
      } else {
        combatAccess.classList.add("hidden");
      }
    }
  }

  // Show build success message
  showBuildSuccessMessage() {
    this.miningScreen.showSuccessMessage(
      "🤖 Mecha built successfully!\nAuto-mining enabled for all machines!"
    );
  }

  // Create visual effect for mecha building
  createBuildEffect() {
    const mechaDisplay =
      this.miningScreen.container.querySelector(".mecha-display");
    if (mechaDisplay) {
      const rect = mechaDisplay.getBoundingClientRect();
      this.miningScreen.createParticleBurst(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        20,
        "rgba(0, 255, 136, 0.8)"
      );
    }

    // Trigger screen shake
    this.miningScreen.triggerScreenShake(500);
  }

  // Get mecha information
  getMechaInfo() {
    if (!this.hasMecha) return null;

    const mechaConfig = this.miningScreen.mechaConfig;
    if (!mechaConfig) return null;

    return {
      type: this.mechaType,
      name: mechaConfig.name,
      stats: mechaConfig.baseStats,
      moves: mechaConfig.moves,
      parts: mechaConfig.parts,
      built: this.hasMecha,
    };
  }

  // Check if mecha provides auto-mining
  hasAutoMining() {
    return this.hasMecha;
  }

  // Get mecha build status
  getBuildStatus() {
    return {
      hasMecha: this.hasMecha,
      canBuild: this.canBuildMecha(),
      mechaType: this.mechaType,
      partsComplete: this.miningScreen.partsInventory.isComplete(),
      partsProgress: this.miningScreen.partsInventory.getCompletionPercentage(),
    };
  }

  // Handle mecha destruction (if needed for gameplay)
  destroyMecha() {
    if (!this.hasMecha) return false;

    this.hasMecha = false;

    // Stop auto-mining
    this.miningScreen.machineManager.stopAutoMining();

    // Update UI
    this.updateMechaDisplay();
    this.miningScreen.updateUI();

    this.miningScreen.showTemporaryMessage("Mecha destroyed!", "warning");
    return true;
  }

  // Get mecha currency bonus multiplier
  getCurrencyMultiplier() {
    return this.hasMecha ? 2 : 1;
  }

  // Check if mecha is active
  isMechaActive() {
    return this.hasMecha;
  }

  // Get mecha display HTML
  renderMechaDisplay() {
    // Safely access mecha config through mining screen
    const mechaConfig = this.miningScreen.mechaConfig;
    const mechaType = this.miningScreen.mineConfig.mecha;

    if (!mechaConfig) {
      console.error("MechaBuilder: mechaConfig not found");
      return '<div class="mecha-display error">Mecha config not loaded</div>';
    }

    return `
      <div class="mecha-display ${this.hasMecha ? "has-mecha" : ""}">
        <div class="mecha-container">
          <img src="images/mecha-${mechaType}.png" alt="${
      mechaConfig.name
    }" class="mecha-image" style="opacity: ${this.hasMecha ? 1 : 0.2};" />
          <div class="mecha-glow"></div>
          <div class="mecha-status">
            ${
              this.hasMecha
                ? '<span class="status-active">✅ Auto-Mining Active</span>'
                : '<span class="status-inactive">🔧 Parts Needed</span>'
            }
          </div>
        </div>
        <button class="build-mecha-button btn btn-primary ${
          this.canBuildMecha() ? "" : "hidden"
        }">
          <span>Build Mecha</span>
        </button>
      </div>
    `;
  }

  // Handle build button click
  handleBuildClick() {
    if (this.canBuildMecha()) {
      this.buildMecha();
    } else {
      this.miningScreen.showTemporaryMessage(
        "Cannot build mecha - missing parts!",
        "warning"
      );
    }
  }

  // Get mecha combat readiness
  isCombatReady() {
    return this.hasMecha;
  }

  // Debug method to force build mecha
  debugBuildMecha() {
    // Add all required parts
    this.miningScreen.partsInventory.debugAddAllParts();

    // Build mecha
    return this.buildMecha();
  }

  // Debug method to reset mecha
  debugResetMecha() {
    this.destroyMecha();
    this.miningScreen.partsInventory.debugRemoveAllParts();
  }

  // Reset mecha builder
  reset() {
    this.hasMecha = false;
    this.mechaType = this.miningScreen.mineConfig.mecha;
    this.updateMechaDisplay();
  }

  // Cleanup
  destroy() {
    if (this.hasMecha) {
      this.miningScreen.machineManager.stopAutoMining();
    }
    this.reset();
  }
}

// Make available globally
window.MechaBuilder = MechaBuilder;

console.log("🤖 MechaBuilder class loaded!");
