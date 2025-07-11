// Enhanced PartsInventory - Better visual feedback and part management
class PartsInventory {
  constructor(miningScreen) {
    this.miningScreen = miningScreen;
    this.collectedParts = [];
    this.requiredParts = ["1", "2", "3", "4", "5", "6"];
    this.partCollectionOrder = []; // Track collection order
    this.duplicatePartsFound = 0;
    this.totalPartsFound = 0;
    this.partFindHistory = [];
  }

  // Initialize parts inventory
  init() {
    this.collectedParts = [];
    this.partCollectionOrder = [];
    this.duplicatePartsFound = 0;
    this.totalPartsFound = 0;
    this.partFindHistory = [];
  }

  // Add a part to inventory with enhanced tracking
  addPart(partName) {
    if (!this.isValidPartName(partName)) {
      console.warn(`Invalid part name: ${partName}`);
      return false;
    }

    this.totalPartsFound++;
    this.partFindHistory.push({
      partName,
      timestamp: Date.now(),
      source: "unknown",
    });

    if (!this.hasPart(partName)) {
      this.collectedParts.push(partName);
      this.partCollectionOrder.push(partName);
      return true;
    } else {
      this.duplicatePartsFound++;
      return false; // Part already collected
    }
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

      // Remove from collection order
      const orderIndex = this.partCollectionOrder.indexOf(partName);
      if (orderIndex > -1) {
        this.partCollectionOrder.splice(orderIndex, 1);
      }
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

  // Get parts in collection order
  getPartsInOrder() {
    return [...this.partCollectionOrder];
  }

  // Get next suggested part to find
  getNextSuggestedPart() {
    const missingParts = this.getMissingParts();
    if (missingParts.length === 0) return null;

    // Return the lowest numbered missing part
    return missingParts.sort((a, b) => {
      const aNum = parseInt(a.split("-")[1]);
      const bNum = parseInt(b.split("-")[1]);
      return aNum - bNum;
    })[0];
  }

  // Render enhanced parts grid HTML
  renderPartsGrid() {
    const mechaType = this.miningScreen.mineConfig.mecha;

    return this.requiredParts
      .map((partNum) => {
        const partName = `${mechaType}-${partNum}`;
        const hasPart = this.hasPart(partName);
        const collectionIndex = this.partCollectionOrder.indexOf(partName);
        const isNextSuggested = partName === this.getNextSuggestedPart();

        return `
        <div class="part-slot ${hasPart ? "collected" : ""} ${
          isNextSuggested ? "suggested" : ""
        }" data-part="${partName}">
          <div class="part-container">
            <img src="images/${partName}.png" alt="Part ${partNum}" class="part-image" />
            <div class="part-overlay ${hasPart ? "hidden" : ""}">
              <span class="part-number">${partNum}</span>
              <div class="part-question-mark">?</div>
            </div>
            ${
              hasPart
                ? `
              <div class="part-collected-indicator">
                <div class="checkmark">✓</div>
                <div class="collection-order">#${collectionIndex + 1}</div>
              </div>
            `
                : ""
            }
            ${isNextSuggested ? '<div class="part-suggestion-glow"></div>' : ""}
            <div class="part-rarity-indicator">
              ${this.getPartRarityIndicator(partNum)}
            </div>
          </div>
          <div class="part-info">
            <div class="part-name">${this.getPartDisplayName(partNum)}</div>
            <div class="part-description">${this.getPartDescription(
              partNum
            )}</div>
          </div>
        </div>
      `;
      })
      .join("");
  }

  // Get part display name
  getPartDisplayName(partNum) {
    const names = {
      1: "Head Unit",
      2: "Torso Core",
      3: "Left Arm",
      4: "Right Arm",
      5: "Left Leg",
      6: "Right Leg",
    };
    return names[partNum] || `Part ${partNum}`;
  }

  // Get part description
  getPartDescription(partNum) {
    const descriptions = {
      1: "Central processing unit",
      2: "Power and control center",
      3: "Manipulation and mining",
      4: "Manipulation and mining",
      5: "Mobility and stability",
      6: "Mobility and stability",
    };
    return descriptions[partNum] || "Essential component";
  }

  // Get part rarity indicator
  getPartRarityIndicator(partNum) {
    const rarities = {
      1: "★★★", // Head is most complex
      2: "★★★", // Torso is most complex
      3: "★★", // Arms are moderate
      4: "★★", // Arms are moderate
      5: "★", // Legs are simpler
      6: "★", // Legs are simpler
    };
    return rarities[partNum] || "★";
  }

  // Update parts display in UI with enhanced animations
  updateDisplay() {
    const partsGrid = this.miningScreen.container.querySelector(".parts-grid");
    if (partsGrid) {
      // Store current state to animate changes
      const oldParts = new Set(
        Array.from(partsGrid.querySelectorAll(".part-slot.collected")).map(
          (el) => el.dataset.part
        )
      );

      partsGrid.innerHTML = this.renderPartsGrid();

      // Animate newly collected parts
      partsGrid.querySelectorAll(".part-slot.collected").forEach((slot) => {
        const partName = slot.dataset.part;
        if (!oldParts.has(partName)) {
          this.animatePartCollection(slot);
        }
      });
    }

    // Update progress bar
    this.updateProgressBar();
  }

  // Animate part collection
  animatePartCollection(partSlot) {
    partSlot.classList.add("just-collected");

    // Create collection effect
    const rect = partSlot.getBoundingClientRect();
    this.miningScreen.createParticleBurst(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      12,
      "rgba(0, 255, 136, 0.8)"
    );

    // Remove animation class after animation
    setTimeout(() => {
      partSlot.classList.remove("just-collected");
    }, 1000);
  }

  // Update progress bar with enhanced visual feedback
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

      // Add progress milestones
      progressFill.className = "progress-fill";
      if (percentage >= 100) {
        progressFill.classList.add("complete");
      } else if (percentage >= 80) {
        progressFill.classList.add("near-complete");
      } else if (percentage >= 50) {
        progressFill.classList.add("halfway");
      }
    }

    if (progressText) {
      progressText.textContent = `${collectedCount}/${totalCount} Parts`;

      // Add completion status
      if (percentage >= 100) {
        progressText.innerHTML +=
          ' <span class="completion-indicator">✓ Complete!</span>';
      } else {
        const nextPart = this.getNextSuggestedPart();
        if (nextPart) {
          const partNum = nextPart.split("-")[1];
          progressText.innerHTML += ` <span class="next-part">Next: ${this.getPartDisplayName(
            partNum
          )}</span>`;
        }
      }
    }
  }

  // Clear all parts (for mecha building)
  clearAllParts() {
    const requiredPartNames = this.getRequiredPartNames();
    requiredPartNames.forEach((partName) => this.removePart(partName));
  }

  // Get enhanced part statistics
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
      collectionOrder: this.getPartsInOrder(),
      duplicatesFound: this.duplicatePartsFound,
      totalPartsFound: this.totalPartsFound,
      findHistory: this.partFindHistory,
      nextSuggested: this.getNextSuggestedPart(),
      completionTime: this.getCompletionTime(),
    };
  }

  // Get completion time (if completed)
  getCompletionTime() {
    if (!this.isComplete() || this.partFindHistory.length === 0) return null;

    const firstFind = this.partFindHistory[0].timestamp;
    const lastFind =
      this.partFindHistory[this.partFindHistory.length - 1].timestamp;

    return lastFind - firstFind;
  }

  // Handle part collection with enhanced feedback
  collectPart(partName, source = "unknown") {
    if (!this.isValidPartName(partName)) {
      console.warn(`Invalid part name: ${partName}`);
      return false;
    }

    // Update find history
    this.partFindHistory.push({
      partName,
      timestamp: Date.now(),
      source,
    });

    const wasAlreadyCollected = this.hasPart(partName);
    const added = this.addPart(partName);

    if (added) {
      console.log(`Part collected: ${partName} from ${source}`);

      // Update display
      this.updateDisplay();

      // Create collection effect
      this.createCollectionEffect(partName);

      // Check if collection is complete
      if (this.isComplete()) {
        this.miningScreen.showTemporaryMessage(
          "🎉 All parts collected! Ready to build mecha!",
          "success",
          5000
        );
        this.onCollectionComplete();
      } else {
        // Show progress message
        const remaining = this.getMissingParts().length;
        this.miningScreen.showTemporaryMessage(
          `${this.getPartDisplayName(
            partName.split("-")[1]
          )} found! ${remaining} parts remaining.`,
          "success"
        );
      }

      return true;
    } else if (wasAlreadyCollected) {
      // Handle duplicate part
      this.handleDuplicatePart(partName, source);
      return false;
    }

    return false;
  }

  // Handle duplicate part collection
  handleDuplicatePart(partName, source) {
    const duplicateValue = Math.floor(Math.random() * 50) + 25; // 25-75 currency
    this.miningScreen.currency += duplicateValue;
    this.miningScreen.updateCurrencyDisplay();

    this.miningScreen.showTemporaryMessage(
      `Duplicate part! Scrapped for ${duplicateValue} ${this.miningScreen.mineConfig.currency}`,
      "info"
    );
  }

  // Create collection effect for specific part
  createCollectionEffect(partName) {
    const partSlot = this.miningScreen.container.querySelector(
      `[data-part="${partName}"]`
    );
    if (partSlot) {
      const rect = partSlot.getBoundingClientRect();
      this.miningScreen.createParticleBurst(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        15,
        "rgba(0, 255, 136, 0.8)"
      );

      // Play collection sound
      if (this.miningScreen.audioManager) {
        this.miningScreen.audioManager.playSound("part-collected");
      }
    }
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

    // Play completion sound
    if (this.miningScreen.audioManager) {
      this.miningScreen.audioManager.playSound("parts-complete");
    }

    // Check for completion achievements
    this.checkCompletionAchievements();
  }

  // Create visual effect for collection completion
  createCompletionEffect() {
    const partsInventory =
      this.miningScreen.container.querySelector(".parts-inventory");
    if (partsInventory) {
      const rect = partsInventory.getBoundingClientRect();

      // Create multiple particle bursts
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          this.miningScreen.createParticleBurst(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            20,
            "rgba(0, 255, 136, 0.8)"
          );
        }, i * 200);
      }
    }

    // Trigger screen shake
    this.miningScreen.triggerScreenShake(500);
  }

  // Check for completion achievements
  checkCompletionAchievements() {
    const stats = this.getPartStats();

    // Fast completion
    if (stats.completionTime && stats.completionTime < 300000) {
      // 5 minutes
      this.miningScreen.showTemporaryMessage(
        "Achievement: Speed Collector!",
        "success"
      );
    }

    // Efficient collection (low duplicates)
    if (stats.duplicatesFound === 0) {
      this.miningScreen.showTemporaryMessage(
        "Achievement: Perfect Collection!",
        "success"
      );
    }

    // Sequential collection
    const isSequential = this.partCollectionOrder.every((part, index) => {
      const expectedPart = `${this.miningScreen.mineConfig.mecha}-${index + 1}`;
      return part === expectedPart;
    });

    if (isSequential) {
      this.miningScreen.showTemporaryMessage(
        "Achievement: Methodical Builder!",
        "success"
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
      collectionOrder: this.partCollectionOrder.indexOf(partName),
      displayName: this.getPartDisplayName(partName.split("-")[1]),
    }));
  }

  // Validate part name format
  isValidPartName(partName) {
    const pattern = new RegExp(`^${this.miningScreen.mineConfig.mecha}-[1-6]$`);
    return pattern.test(partName);
  }

  // Get part drop rates for different sources
  getPartDropRates() {
    return {
      mining: 0.05,
      geode: 0.25,
      merchant: 0.3,
      combat: 0.15,
      special: 0.5,
    };
  }

  // Simulate part finding (for testing)
  simulatePartFinding(count = 1) {
    const missingParts = this.getMissingParts();
    if (missingParts.length === 0) {
      this.miningScreen.showTemporaryMessage(
        "All parts already collected!",
        "info"
      );
      return;
    }

    for (let i = 0; i < count && i < missingParts.length; i++) {
      const randomPart =
        missingParts[Math.floor(Math.random() * missingParts.length)];
      this.collectPart(randomPart, "simulation");
    }
  }

  // Export parts data
  exportPartsData() {
    return {
      stats: this.getPartStats(),
      collectionOrder: this.partCollectionOrder,
      findHistory: this.partFindHistory,
      duplicatesFound: this.duplicatePartsFound,
      totalPartsFound: this.totalPartsFound,
    };
  }

  // Import parts data
  importPartsData(data) {
    if (!data) return;

    this.partCollectionOrder = data.collectionOrder || [];
    this.partFindHistory = data.findHistory || [];
    this.duplicatePartsFound = data.duplicatesFound || 0;
    this.totalPartsFound = data.totalPartsFound || 0;

    // Reconstruct collected parts from collection order
    this.collectedParts = [...this.partCollectionOrder];
    this.updateDisplay();
  }

  // Debug method to add all parts
  debugAddAllParts() {
    const requiredPartNames = this.getRequiredPartNames();
    requiredPartNames.forEach((partName, index) => {
      setTimeout(() => {
        this.collectPart(partName, "debug");
      }, index * 500); // Stagger for visual effect
    });
  }

  // Debug method to remove all parts
  debugRemoveAllParts() {
    this.collectedParts = [];
    this.partCollectionOrder = [];
    this.updateDisplay();
  }

  // Debug method to add random part
  debugAddRandomPart() {
    const missingParts = this.getMissingParts();
    if (missingParts.length > 0) {
      const randomPart =
        missingParts[Math.floor(Math.random() * missingParts.length)];
      this.collectPart(randomPart, "debug");
    }
  }

  // Reset inventory
  reset() {
    this.collectedParts = [];
    this.partCollectionOrder = [];
    this.duplicatePartsFound = 0;
    this.totalPartsFound = 0;
    this.partFindHistory = [];
    this.updateDisplay();
  }

  // Cleanup
  destroy() {
    this.reset();
  }
}

// Add CSS for enhanced parts display
const enhancedPartsCSS = `
  .part-slot {
    position: relative;
    border: 2px solid #333;
    border-radius: 10px;
    padding: 10px;
    transition: all 0.3s ease;
    background: linear-gradient(135deg, rgba(0, 20, 40, 0.8) 0%, rgba(0, 40, 80, 0.8) 100%);
  }

  .part-slot:hover {
    border-color: #555;
    transform: translateY(-2px);
  }

  .part-slot.collected {
    border-color: #00ff88;
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 200, 100, 0.1) 100%);
  }

  .part-slot.suggested {
    border-color: #ffff44;
    animation: suggestedPulse 2s ease-in-out infinite;
  }

  @keyframes suggestedPulse {
    0%, 100% { box-shadow: 0 0 5px rgba(255, 255, 68, 0.5); }
    50% { box-shadow: 0 0 20px rgba(255, 255, 68, 0.8); }
  }

  .part-slot.just-collected {
    animation: partCollected 1s ease-out;
  }

  @keyframes partCollected {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); border-color: #00ff88; }
    100% { transform: scale(1); }
  }

  .part-container {
    position: relative;
    text-align: center;
  }

  .part-image {
    width: 60px;
    height: 60px;
    object-fit: contain;
    transition: all 0.3s ease;
  }

  .part-slot.collected .part-image {
    filter: brightness(1.2) saturate(1.2);
  }

  .part-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition: all 0.3s ease;
  }

  .part-number {
    font-size: 1.2em;
    font-weight: bold;
    color: #00ff88;
    margin-bottom: 5px;
  }

  .part-question-mark {
    font-size: 1.5em;
    color: #666;
  }

  .part-collected-indicator {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #00ff88;
    color: white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8em;
    font-weight: bold;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .collection-order {
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 255, 136, 0.2);
    color: #00ff88;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 0.7em;
  }

  .part-suggestion-glow {
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border: 2px solid #ffff44;
    border-radius: 10px;
    animation: suggestionGlow 1.5s ease-in-out infinite;
  }

  @keyframes suggestionGlow {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.8; }
  }

  .part-rarity-indicator {
    position: absolute;
    top: 5px;
    left: 5px;
    color: #ffd700;
    font-size: 0.8em;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  }

  .part-info {
    margin-top: 10px;
    text-align: center;
  }

  .part-name {
    font-size: 0.9em;
    font-weight: bold;
    color: #00ff88;
    margin-bottom: 2px;
  }

  .part-description {
    font-size: 0.7em;
    color: #999;
    line-height: 1.2;
  }

  .progress-fill {
    transition: all 0.5s ease;
  }

  .progress-fill.halfway {
    background: linear-gradient(90deg, #ff9800, #ffc107);
  }

  .progress-fill.near-complete {
    background: linear-gradient(90deg, #4caf50, #8bc34a);
  }

  .progress-fill.complete {
    background: linear-gradient(90deg, #00ff88, #00cc66);
    animation: completeGlow 2s ease-in-out infinite alternate;
  }

  @keyframes completeGlow {
    from { box-shadow: 0 0 10px rgba(0, 255, 136, 0.5); }
    to { box-shadow: 0 0 20px rgba(0, 255, 136, 0.8); }
  }

  .completion-indicator {
    color: #00ff88;
    font-weight: bold;
    animation: completionPulse 1s ease-in-out infinite;
  }

  @keyframes completionPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  .next-part {
    color: #ffff44;
    font-style: italic;
    margin-left: 10px;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .part-slot {
      padding: 5px;
    }
    
    .part-image {
      width: 40px;
      height: 40px;
    }
    
    .part-info {
      margin-top: 5px;
    }
    
    .part-name {
      font-size: 0.8em;
    }
    
    .part-description {
      font-size: 0.6em;
    }
  }
`;

// Inject the CSS
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.textContent = enhancedPartsCSS;
  document.head.appendChild(styleElement);
}

// Make available globally
window.PartsInventory = PartsInventory;

console.log("🔧 Enhanced PartsInventory class loaded!");
