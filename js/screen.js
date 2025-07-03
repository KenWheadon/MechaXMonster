// Generic Screen Base Class - Common functionality for all game screens
class Screen {
  constructor(container, screenName) {
    this.container = container;
    this.screenName = screenName;
    this.isActive = false;
    this.audioManager = null;
    this.particleSystem = null;
    this.intervals = [];
    this.timeouts = [];

    // Get config data if available
    this.config = GAME_CONFIG?.screens?.[screenName] || {};
    this.animConfig = GAME_CONFIG?.animations || {};

    console.log(`🚀 ${screenName} Screen instance created`);
  }

  // Lifecycle methods - to be overridden by child classes
  init() {
    this.render();
    this.setupEventListeners();
    this.startAnimations();
    this.initializeAudio();
    this.startParticleSystem();
    this.isActive = true;

    console.log(`✅ ${this.screenName} Screen initialized`);
  }

  render() {
    // To be overridden by child classes
    console.warn(
      `render() method should be overridden in ${this.screenName}Screen`
    );
  }

  setupEventListeners() {
    // Common event listeners
    document.addEventListener(
      "click",
      () => {
        this.enableAudio();
      },
      { once: true }
    );

    // Keyboard support
    document.addEventListener("keydown", (e) => {
      if (this.isActive) {
        this.handleKeydown(e);
      }
    });
  }

  handleKeydown(e) {
    // To be overridden by child classes for specific keyboard handling
    // Base implementation for common keys
    if (e.code === "Escape") {
      this.handleEscape();
    }
  }

  handleEscape() {
    // Generic escape handling - can be overridden
    console.log(`Escape pressed on ${this.screenName} screen`);
  }

  startAnimations() {
    this.createStars();
    this.createAsteroids();
  }

  // Generic star creation
  createStars() {
    const starsContainer = this.container.querySelector(".stars-layer");
    if (!starsContainer) return;

    const { starCount = 50 } = this.animConfig;
    starsContainer.innerHTML = "";

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement("div");
      star.className = "star";

      const size = Math.random() * 4 + 1;
      star.style.left = Math.random() * 100 + "%";
      star.style.top = Math.random() * 100 + "%";
      star.style.width = star.style.height = size + "px";
      star.style.animationDelay = Math.random() * 4 + "s";
      star.style.animationDuration = 3 + Math.random() * 2 + "s";

      starsContainer.appendChild(star);
    }
  }

  // Generic asteroid creation
  createAsteroids() {
    const asteroidsContainer = this.container.querySelector(".asteroids-layer");
    if (!asteroidsContainer) return;

    const { asteroidCount = 8 } = this.animConfig;
    asteroidsContainer.innerHTML = "";

    for (let i = 0; i < asteroidCount; i++) {
      const asteroid = document.createElement("div");
      asteroid.className = "asteroid";

      const size = Math.random() * 50 + 30;
      asteroid.style.width = asteroid.style.height = size + "px";
      asteroid.style.left = Math.random() * 90 + "%";
      asteroid.style.top = Math.random() * 90 + "%";
      asteroid.style.animationDelay = Math.random() * 8 + "s";
      asteroid.style.animationDuration = 6 + Math.random() * 4 + "s";

      asteroidsContainer.appendChild(asteroid);
    }
  }

  // Generic particle system
  startParticleSystem() {
    const particlesContainer = this.container.querySelector(".particles-layer");
    if (!particlesContainer) return;

    // Store reference to screen instance for proper context
    const screenInstance = this;

    this.particleSystem = {
      container: particlesContainer,
      particles: [],
      maxParticles: 20,

      createParticle() {
        const particle = document.createElement("div");
        particle.className = "particle";

        const size = Math.random() * 3 + 1;
        particle.style.width = particle.style.height = size + "px";
        particle.style.left = Math.random() * 100 + "%";
        particle.style.animationDelay = Math.random() * 2 + "s";
        particle.style.animationDuration = 8 + Math.random() * 6 + "s";

        particlesContainer.appendChild(particle);
        this.particles.push(particle);

        const timeout = setTimeout(() => {
          if (particle.parentNode) {
            particle.remove();
            const index = this.particles.indexOf(particle);
            if (index > -1) {
              this.particles.splice(index, 1);
            }
          }
        }, 14000);

        // Track timeout for cleanup on screen instance
        screenInstance.timeouts.push(timeout);
      },

      start() {
        const interval = setInterval(() => {
          if (this.particles.length < this.maxParticles) {
            this.createParticle();
          }
        }, 800);

        // Track interval for cleanup on screen instance
        screenInstance.intervals.push(interval);
      },
    };

    this.particleSystem.start();
  }

  // Generic audio management
  initializeAudio() {
    this.audioManager = {
      enabled: false,
      sounds: {},

      enable() {
        this.enabled = true;
        console.log(`🔊 ${this.screenName} Screen audio enabled`);
      },

      playSound(soundName, loop = false, volume = 1.0) {
        if (!this.enabled) return;

        console.log(
          `🎵 Playing sound: ${soundName}${
            loop ? " (looped)" : ""
          } at volume ${volume}`
        );

        // In real implementation, would play actual audio files
        /*
        if (!this.sounds[soundName]) {
          this.sounds[soundName] = new Audio(`audio/${soundName}.mp3`);
          this.sounds[soundName].volume = 0.7 * volume;
        }
        
        const audio = this.sounds[soundName];
        audio.loop = loop;
        audio.volume = 0.7 * volume;
        audio.currentTime = 0;
        audio.play().catch(e => console.warn('Audio failed:', e));
        */
      },

      stopSound(soundName) {
        if (!this.enabled || !this.sounds[soundName]) return;

        console.log(`🔇 Stopped sound: ${soundName}`);
        // this.sounds[soundName].pause();
        // this.sounds[soundName].currentTime = 0;
      },

      stopAllSounds() {
        Object.keys(this.sounds).forEach((soundName) => {
          this.stopSound(soundName);
        });
      },
    };
  }

  enableAudio() {
    if (this.audioManager) {
      this.audioManager.enable();
    }
  }

  // Generic loading screen management
  showLoadingScreen() {
    const loadingOverlay = this.container.querySelector(".loading-overlay");
    if (loadingOverlay) {
      loadingOverlay.classList.remove("hidden");
    }
  }

  hideLoadingScreen() {
    const loadingOverlay = this.container.querySelector(".loading-overlay");
    if (loadingOverlay) {
      loadingOverlay.classList.add("hidden");
    }
  }

  simulateLoading(callback) {
    const progressFill = this.container.querySelector(".progress-fill");
    const progressPercentage = this.container.querySelector(
      ".progress-percentage"
    );
    let progress = 0;

    const loadingInterval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      progress = Math.min(progress, 100);

      if (progressFill) {
        progressFill.style.width = progress + "%";
      }
      if (progressPercentage) {
        progressPercentage.textContent = Math.floor(progress) + "%";
      }

      if (progress >= 100) {
        clearInterval(loadingInterval);
        setTimeout(() => {
          this.hideLoadingScreen();
          if (callback) callback();
        }, 500);
      }
    }, 200);

    this.intervals.push(loadingInterval);
  }

  // Generic message display
  showSuccessMessage(message) {
    // Remove any existing success messages
    const existing = document.querySelector(".success-message");
    if (existing) {
      existing.remove();
    }

    const successDiv = document.createElement("div");
    successDiv.className = "success-message";
    successDiv.innerHTML = message.replace(/\n/g, "<br>");

    document.body.appendChild(successDiv);

    // Play success sound
    if (this.audioManager) {
      this.audioManager.playSound("success");
    }

    // Remove after animation completes
    const timeout = setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.remove();
      }
    }, 4000);

    this.timeouts.push(timeout);
  }

  showTemporaryMessage(message, type = "info", duration = 3000) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `temporary-message ${type}`;
    messageDiv.textContent = message;

    // Add styles for temporary messages
    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${
        type === "warning"
          ? "rgba(255, 193, 7, 0.9)"
          : type === "error"
          ? "rgba(220, 53, 69, 0.9)"
          : type === "success"
          ? "rgba(40, 167, 69, 0.9)"
          : "rgba(0, 123, 255, 0.9)"
      };
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      font-weight: bold;
      z-index: 1002;
      animation: slideInDown 0.5s ease-out;
    `;

    document.body.appendChild(messageDiv);

    const timeout = setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.style.animation = "slideOutUp 0.5s ease-in forwards";
        setTimeout(() => messageDiv.remove(), 500);
      }
    }, duration);

    this.timeouts.push(timeout);
  }

  // Screen shake utility - Fixed to prevent scroll bars
  triggerScreenShake(duration = 300) {
    // Add class to body to prevent scroll
    document.body.classList.add("shaking");

    this.container.classList.add("screen-shake");

    const timeout = setTimeout(() => {
      this.container.classList.remove("screen-shake");
      document.body.classList.remove("shaking");
    }, duration);

    this.timeouts.push(timeout);
  }

  // Particle burst utility
  createParticleBurst(x, y, count = 12, color = "rgba(0, 255, 136, 0.8)") {
    for (let i = 0; i < count; i++) {
      const particle = document.createElement("div");
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 6 + 3}px;
        height: ${Math.random() * 6 + 3}px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        left: ${x}px;
        top: ${y}px;
      `;

      document.body.appendChild(particle);

      const angle = (360 / count) * i;
      const distance = 60 + Math.random() * 40;
      const radians = (angle * Math.PI) / 180;
      const moveX = Math.cos(radians) * distance;
      const moveY = Math.sin(radians) * distance;

      particle.animate(
        [
          {
            transform: "translate(0, 0) scale(1)",
            opacity: 1,
          },
          {
            transform: `translate(${moveX}px, ${moveY}px) scale(0)`,
            opacity: 0,
          },
        ],
        {
          duration: 800,
          easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }
      ).onfinish = () => {
        particle.remove();
      };
    }
  }

  // Generic ripple effect
  createRippleEffect(element, event, color = "rgba(0, 255, 136, 0.6)") {
    const ripple = document.createElement("div");
    ripple.className = "ripple-effect";

    const rect = element.getBoundingClientRect();
    const size = 50;
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: radial-gradient(circle, ${color} 0%, rgba(0, 255, 136, 0.2) 70%, transparent 100%);
      border-radius: 50%;
      pointer-events: none;
      animation: rippleEffect 0.6s ease-out forwards;
      left: ${x}px;
      top: ${y}px;
      z-index: 1;
    `;

    element.appendChild(ripple);

    const timeout = setTimeout(() => {
      if (ripple.parentNode) {
        ripple.remove();
      }
    }, 600);

    this.timeouts.push(timeout);
  }

  // CSS injection helper
  injectCSS(styleId, cssContent) {
    // Check if styles already exist
    if (document.getElementById(styleId)) return;

    const styles = document.createElement("style");
    styles.id = styleId;
    styles.textContent = cssContent;
    document.head.appendChild(styles);
  }

  // Transition between screens
  transitionToScreen(targetScreen, transitionType = "fade") {
    console.log(`🔄 Transitioning from ${this.screenName} to ${targetScreen}`);

    // Play transition sound
    if (this.audioManager) {
      this.audioManager.playSound("screen-transition");
    }

    // In full implementation, would handle screen transitions
    // For now, just log the transition
    return Promise.resolve();
  }

  // Configuration update
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    if (this.isActive) {
      // Optionally re-render or update based on new config
      console.log(`🔄 ${this.screenName} Screen config updated`);
    }
  }

  // Cleanup method - IMPORTANT: Always call when switching screens
  destroy() {
    // Clear all intervals
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals = [];

    // Clear all timeouts
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts = [];

    // Stop all audio
    if (this.audioManager) {
      this.audioManager.stopAllSounds();
    }

    // Clear container
    if (this.container) {
      this.container.innerHTML = "";
    }

    // Remove temporary messages
    const tempMessages = document.querySelectorAll(
      ".temporary-message, .success-message"
    );
    tempMessages.forEach((msg) => msg.remove());

    // Remove shaking class if present
    document.body.classList.remove("shaking");

    // Reset state
    this.isActive = false;

    console.log(`🗑️ ${this.screenName} Screen destroyed and cleaned up`);
  }

  // Utility method to create managed intervals (auto-cleanup)
  setManagedInterval(callback, delay) {
    const interval = setInterval(callback, delay);
    this.intervals.push(interval);
    return interval;
  }

  // Utility method to create managed timeouts (auto-cleanup)
  setManagedTimeout(callback, delay) {
    const timeout = setTimeout(callback, delay);
    this.timeouts.push(timeout);
    return timeout;
  }

  // Debug helpers
  debug() {
    console.log(`📊 ${this.screenName} Screen Debug Info:`, {
      isActive: this.isActive,
      intervals: this.intervals.length,
      timeouts: this.timeouts.length,
      particles: this.particleSystem?.particles?.length || 0,
      audioEnabled: this.audioManager?.enabled || false,
      config: this.config,
    });
  }
}

// Make available globally
window.Screen = Screen;

console.log("📱 Generic Screen base class loaded");
