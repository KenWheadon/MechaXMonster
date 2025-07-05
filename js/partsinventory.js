// PartsInventory - Manages mecha parts collection and display
class PartsInventory {
  constructor(miningScreen) {
    this.miningScreen = miningScreen;
    this.collectedParts = [];
    this.requiredParts = ["1", "2", "3", "4", "5", "6"];
  }

  // Initialize parts inventory
  init() {
    this.collectedParts = [];
  }

  // Add a part to inventory
  addPart(partName) {
    if (!this.hasPart(partName)) {
      this.collectedParts.push(partName);
      return true;
    }
    return false;
  }

  // Check if part is in inventory
  hasPart(partName) {
    return this.collectedParts.includes(partName);
  }

  // Remove a part from inventory
  removePart(partName) {
    const index = this.collectedParts.indexOf(partName);
    if (index > -1) {
      this.collectedParts.splice(index, 1);
      return true;
    }
    return false;
  }

  // Get all collected parts
  getAllParts() {
    return [...this.collectedParts];
  }

  // Get required part names for current mecha
  getRequiredPartNames() {
    const mechaType = this.miningScreen.mineConfig.mecha;
    return this.requiredParts.map((num) => `${mechaType}-${num}`);
  }

  // Check if all parts are collected
  isComplete() {
    const requiredPartNames = this.getRequiredPartNames();
    return requiredPartNames.every((partName) => this.hasPart(partName));
  }

  // Get completion percentage
  getCompletionPercentage() {
    const requiredPartNames = this.getRequiredPartNames();
    const collectedCount = requiredPartNames.filter((partName) =>
      this.hasPart(partName)
    ).length;
    return (collectedCount / requiredPartNames.length) * 100;
  }

  // Get missing parts
  getMissingParts() {
    const requiredPartNames = this.getRequiredPartNames();
    return requiredPartNames.filter((partName) => !this.hasPart(partName));
  }

  // Render parts grid HTML
  renderPartsGrid() {
    const mechaType = this.miningScreen.mineConfig.mecha;

    return this.requiredParts
      .map((partNum) => {
        const partName = `${mechaType}-${partNum}`;
        const hasPart = this.hasPart(partName);

        return `
        <div class="part-slot ${hasPart ? "collected" : ""}">
          <img src="images/${partName}.png" alt="Part ${partNum}" class="part-image" />
          <div class="part-overlay ${hasPart ? "hidden" : ""}">
            <span>?</span>
          </div>
          ${hasPart ? '<div class="part-collected-indicator">✓</div>' : ""}
        </div>
      `;
      })
      .join("");
  }

  // Update parts display in UI
  updateDisplay() {
    const partsGrid = this.miningScreen.container.querySelector(".parts-grid");
    if (partsGrid) {
      partsGrid.innerHTML = this.renderPartsGrid();
    }

    // Update progress bar
    this.updateProgressBar();
  }

  // Update progress bar
  updateProgressBar() {
    const progressFill = this.miningScreen.container.querySelector(
      ".parts-progress .progress-fill"
    );
    const progressText = this.miningScreen.container.querySelector(
      ".parts-progress .progress-text"
    );

    const percentage = this.getCompletionPercentage();
    const collectedCount = this.collectedParts.length;
    const totalCount = this.requiredParts.length;

    if (progressFill) {
      progressFill.style.width = `${percentage}%`;
    }

    if (progressText) {
      progressText.textContent = `${collectedCount}/${totalCount} Parts`;
    }
  }

  // Clear all parts (for mecha building)
  clearAllParts() {
    const requiredPartNames = this.getRequiredPartNames();
    requiredPartNames.forEach((partName) => this.removePart(partName));
  }

  // Get part statistics
  getPartStats() {
    const requiredPartNames = this.getRequiredPartNames();
    const collectedCount = requiredPartNames.filter((partName) =>
      this.hasPart(partName)
    ).length;

    return {
      collected: collectedCount,
      total: requiredPartNames.length,
      percentage: this.getCompletionPercentage(),
      missing: this.getMissingParts(),
      complete: this.isComplete(),
      collectedParts: this.getAllParts(),
    };
  }

  // Handle part collection from various sources
  collectPart(partName, source = "unknown") {
    if (this.addPart(partName)) {
      console.log(`Part collected: ${partName} from ${source}`);

      // Update display
      this.updateDisplay();

      // Check if collection is complete
      if (this.isComplete()) {
        this.miningScreen.showTemporaryMessage(
          "All parts collected! Ready to build mecha!",
          "success"
        );
        this.onCollectionComplete();
      }

      return true;
    }
    return false;
  }

  // Handle collection completion
  onCollectionComplete() {
    // Show build button
    const buildButton = this.miningScreen.container.querySelector(
      ".build-mecha-button"
    );
    if (buildButton) {
      buildButton.classList.remove("hidden");
    }

    // Trigger visual effect
    this.createCompletionEffect();
  }

  // Create visual effect for collection completion
  createCompletionEffect() {
    const partsInventory =
      this.miningScreen.container.querySelector(".parts-inventory");
    if (partsInventory) {
      const rect = partsInventory.getBoundingClientRect();
      this.miningScreen.createParticleBurst(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        15,
        "rgba(0, 255, 136, 0.8)"
      );
    }
  }

  // Get next part needed (for sequential drops)
  getNextPartNeeded() {
    const missingParts = this.getMissingParts();
    return missingParts.length > 0 ? missingParts[0] : null;
  }

  // Check if a specific part type is needed
  isPartNeeded(partName) {
    const requiredPartNames = this.getRequiredPartNames();
    return requiredPartNames.includes(partName) && !this.hasPart(partName);
  }

  // Get parts by collection order
  getPartsByOrder() {
    const requiredPartNames = this.getRequiredPartNames();
    return requiredPartNames.map((partName) => ({
      name: partName,
      collected: this.hasPart(partName),
      index: partName.split("-")[1],
    }));
  }

  // Validate part name format
  isValidPartName(partName) {
    const pattern = new RegExp(`^${this.miningScreen.mineConfig.mecha}-[1-6]$`);
    return pattern.test(partName);
  }

  // Debug method to add all parts
  debugAddAllParts() {
    const requiredPartNames = this.getRequiredPartNames();
    requiredPartNames.forEach((partName) => {
      this.addPart(partName);
    });
    this.updateDisplay();
  }

  // Debug method to remove all parts
  debugRemoveAllParts() {
    this.collectedParts = [];
    this.updateDisplay();
  }

  // Reset inventory
  reset() {
    this.collectedParts = [];
    this.updateDisplay();
  }

  // Cleanup
  destroy() {
    this.reset();
  }
}

// Make available globally
window.PartsInventory = PartsInventory;

console.log("🔧 PartsInventory class loaded!");
