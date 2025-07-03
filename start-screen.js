// Enhanced Start Screen - Exciting game intro with improved UI/UX
class StartScreen {
  constructor(container) {
    this.container = container;
    this.isActive = false;
    this.audioManager = null;
    this.particleSystem = null;
    this.typingInterval = null;
    this.energyLevel = 0;
    this.isCharging = false;

    // Get config data
    this.config = GAME_CONFIG.screens.start;
    this.animConfig = GAME_CONFIG.animations;

    console.log("🚀 Enhanced StartScreen instance created");
  }

  init() {
    this.render();
    this.setupEventListeners();
    this.startAnimations();
    this.initializeAudio();
    this.startParticleSystem();
    this.startTypingEffect();
    this.isActive = true;

    console.log("✅ Enhanced Start Screen initialized");
  }

  render() {
    const html = `
            <div class="start-screen screen active">
                <!-- Multi-layer background system -->
                <div class="background-layer background-image"></div>
                <div class="background-layer nebula-layer"></div>
                <div class="stars-layer"></div>
                <div class="asteroids-layer"></div>
                <div class="particles-layer"></div>
                
                <!-- Main content container -->
                <div class="content-container">
                    <!-- Logo section with enhanced effects -->
                    <div class="title-container">
                        <div class="logo-wrapper">
                            <div class="energy-core"></div>
                            <img src="images/logo.png" alt="${this.config.title}" class="game-logo" />
                            <div class="logo-glow"></div>
                        </div>
                        <div class="tagline-container">
                            <p class="tagline typing-text" data-text="${this.config.tagline}"></p>
                            <p class="subtitle fade-in-text">${this.config.subtitle}</p>
                        </div>
                    </div>
                    
                    <!-- Enhanced button section -->
                    <div class="button-section">
                        <div class="button-container">
                            <div class="energy-ring"></div>
                            <button class="start-button" data-action="start-mining">
                                <div class="button-bg"></div>
                                <div class="button-energy-fill"></div>
                                <img src="images/btn-play.png" alt="${this.config.buttonText}" class="button-image" />
                                <div class="button-text">START MINING</div>
                                <div class="energy-particles"></div>
                            </button>
                            <div class="button-glow"></div>
                        </div>
                        
                        <!-- Energy charge indicator -->
                        <div class="energy-meter">
                            <div class="energy-bar">
                                <div class="energy-fill"></div>
                            </div>
                            <div class="energy-text">ENERGY: <span class="energy-value">0</span>%</div>
                        </div>
                    </div>
                </div>
                
                <!-- Additional UI elements -->
                <div class="ui-overlay">
                    <!-- Settings button -->
                    <button class="settings-btn" title="Settings">
                        <img src="images/icon-settings.png" alt="Settings" />
                    </button>
                    
                    <!-- High score preview -->
                    <div class="score-preview">
                        <div class="score-label">BEST MINING RUN</div>
                        <div class="score-value">1,247,850</div>
                    </div>
                    
                    <!-- Version info -->
                    <div class="version-info">v2.1.0</div>
                </div>
                
                <!-- Loading overlay -->
                <div class="loading-overlay hidden">
                    <div class="loading-content">
                        <div class="loading-spinner"></div>
                        <div class="loading-text">INITIALIZING MINING OPERATIONS...</div>
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

    // Add CSS styles for this screen
    this.injectStyles();
  }

  injectStyles() {
    // Check if styles already exist
    if (document.getElementById("enhanced-start-screen-styles")) return;

    const styles = document.createElement("style");
    styles.id = "enhanced-start-screen-styles";
    styles.textContent = `
            /* Enhanced Start Screen Styles */
            .start-screen {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                position: relative;
                overflow: hidden;
                background: radial-gradient(ellipse at center, #0a0a1a 0%, #000000 100%);
            }

            /* Multi-layer background system */
            .background-layer {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 0;
            }

            .background-image {
                background-image: url('images/map-background.png');
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                opacity: 0.6;
                animation: backgroundShift 60s ease-in-out infinite;
            }

            .nebula-layer {
                background: radial-gradient(circle at 20% 30%, rgba(138, 43, 226, 0.2) 0%, transparent 50%),
                           radial-gradient(circle at 80% 70%, rgba(0, 191, 255, 0.15) 0%, transparent 50%),
                           radial-gradient(circle at 50% 50%, rgba(255, 20, 147, 0.1) 0%, transparent 50%);
                animation: nebulaDrift 45s ease-in-out infinite;
            }

            @keyframes backgroundShift {
                0%, 100% { transform: scale(1) rotate(0deg); }
                50% { transform: scale(1.05) rotate(0.5deg); }
            }

            @keyframes nebulaDrift {
                0%, 100% { opacity: 0.3; transform: translateX(0px) translateY(0px); }
                33% { opacity: 0.5; transform: translateX(20px) translateY(-10px); }
                66% { opacity: 0.2; transform: translateX(-15px) translateY(15px); }
            }

            /* Enhanced animated elements */
            .stars-layer {
                position: absolute;
                width: 100%;
                height: 100%;
                overflow: hidden;
                z-index: 1;
            }

            .star {
                position: absolute;
                background: radial-gradient(circle, #ffffff 0%, rgba(255,255,255,0.8) 50%, transparent 100%);
                border-radius: 50%;
                animation: advancedTwinkle 4s infinite;
            }

            @keyframes advancedTwinkle {
                0%, 100% { 
                    opacity: 0.3; 
                    transform: scale(1) rotate(0deg); 
                    box-shadow: 0 0 5px rgba(255,255,255,0.3);
                }
                25% { 
                    opacity: 0.8; 
                    transform: scale(1.3) rotate(90deg); 
                    box-shadow: 0 0 15px rgba(255,255,255,0.6);
                }
                50% { 
                    opacity: 1; 
                    transform: scale(1.5) rotate(180deg); 
                    box-shadow: 0 0 20px rgba(255,255,255,0.8);
                }
                75% { 
                    opacity: 0.6; 
                    transform: scale(1.2) rotate(270deg); 
                    box-shadow: 0 0 10px rgba(255,255,255,0.4);
                }
            }

            .asteroids-layer {
                position: absolute;
                width: 100%;
                height: 100%;
                overflow: hidden;
                z-index: 2;
            }

            .asteroid {
                position: absolute;
                background: linear-gradient(135deg, #4a4a4a 0%, #666 50%, #3a3a3a 100%);
                border-radius: 50%;
                animation: enhancedFloat 8s ease-in-out infinite;
                opacity: 0.4;
                box-shadow: inset 2px 2px 5px rgba(0,0,0,0.5);
            }

            @keyframes enhancedFloat {
                0%, 100% { 
                    transform: translateY(0px) rotate(0deg) scale(1); 
                    opacity: 0.3;
                }
                25% { 
                    transform: translateY(-15px) rotate(90deg) scale(1.1); 
                    opacity: 0.5;
                }
                50% { 
                    transform: translateY(-25px) rotate(180deg) scale(1.2); 
                    opacity: 0.6;
                }
                75% { 
                    transform: translateY(-10px) rotate(270deg) scale(1.05); 
                    opacity: 0.4;
                }
            }

            /* Particle system */
            .particles-layer {
                position: absolute;
                width: 100%;
                height: 100%;
                overflow: hidden;
                z-index: 3;
                pointer-events: none;
            }

            .particle {
                position: absolute;
                background: rgba(0, 255, 136, 0.6);
                border-radius: 50%;
                animation: particleDrift 12s linear infinite;
            }

            @keyframes particleDrift {
                0% { 
                    transform: translateY(100vh) translateX(0px) scale(0); 
                    opacity: 0;
                }
                10% { 
                    opacity: 1; 
                    transform: translateY(90vh) translateX(10px) scale(1);
                }
                90% { 
                    opacity: 1; 
                    transform: translateY(10vh) translateX(-10px) scale(1);
                }
                100% { 
                    transform: translateY(-10vh) translateX(0px) scale(0); 
                    opacity: 0;
                }
            }

            /* Content container */
            .content-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 10;
                position: relative;
                width: 100%;
                max-width: 800px;
                padding: 20px;
            }

            /* Enhanced logo section */
            .title-container {
                text-align: center;
                margin-bottom: 60px;
                position: relative;
            }

            .logo-wrapper {
                position: relative;
                display: inline-block;
                margin-bottom: 30px;
            }

            .energy-core {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 120%;
                height: 120%;
                background: radial-gradient(circle, rgba(0, 255, 136, 0.3) 0%, rgba(0, 255, 136, 0.1) 40%, transparent 70%);
                border-radius: 50%;
                animation: energyPulse 3s ease-in-out infinite;
                z-index: -1;
            }

            @keyframes energyPulse {
                0%, 100% { 
                    transform: translate(-50%, -50%) scale(1); 
                    opacity: 0.3;
                }
                50% { 
                    transform: translate(-50%, -50%) scale(1.2); 
                    opacity: 0.8;
                }
            }

            .game-logo {
                max-width: 400px;
                width: 80%;
                height: auto;
                position: relative;
                z-index: 1;
                animation: logoFloat 4s ease-in-out infinite;
                filter: drop-shadow(0 0 30px rgba(0, 255, 136, 0.6));
            }

            @keyframes logoFloat {
                0%, 100% { 
                    transform: translateY(0px) scale(1); 
                }
                50% { 
                    transform: translateY(-8px) scale(1.02); 
                }
            }

            .logo-glow {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(ellipse at center, rgba(0, 255, 136, 0.4) 0%, transparent 60%);
                border-radius: 50%;
                animation: glowPulse 2s ease-in-out infinite alternate;
                z-index: -1;
            }

            @keyframes glowPulse {
                0% { opacity: 0.2; transform: scale(0.9); }
                100% { opacity: 0.6; transform: scale(1.1); }
            }

            /* Typing effect for tagline */
            .tagline-container {
                position: relative;
            }

            .typing-text {
                font-size: 1.5rem;
                color: #00ccff;
                margin-bottom: 15px;
                text-shadow: 0 0 15px rgba(0, 204, 255, 0.8);
                font-weight: bold;
                min-height: 2em;
                position: relative;
            }

            .typing-text::after {
                content: '|';
                animation: blink 1s infinite;
                color: #00ff88;
            }

            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }

            .fade-in-text {
                font-size: 1rem;
                color: #aaaaaa;
                opacity: 0;
                animation: fadeInDelayed 1s ease-out 3s forwards;
            }

            @keyframes fadeInDelayed {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            /* Enhanced button section */
            .button-section {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
            }

            .button-container {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .energy-ring {
                position: absolute;
                width: 300px;
                height: 300px;
                border: 2px solid rgba(0, 255, 136, 0.3);
                border-radius: 50%;
                animation: ringRotate 10s linear infinite;
                z-index: -1;
            }

            .energy-ring::before {
                content: '';
                position: absolute;
                top: -2px;
                left: 50%;
                width: 20px;
                height: 20px;
                background: radial-gradient(circle, #00ff88 0%, transparent 70%);
                border-radius: 50%;
                transform: translateX(-50%);
            }

            @keyframes ringRotate {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .start-button {
                background: transparent;
                border: none;
                cursor: pointer;
                position: relative;
                padding: 0;
                width: 220px;
                height: 220px;
                border-radius: 50%;
                transition: all 0.3s ease;
                animation: buttonHover 4s ease-in-out infinite;
                z-index: 5;
            }

            .button-bg {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle, rgba(0, 255, 136, 0.2) 0%, rgba(0, 100, 50, 0.4) 50%, rgba(0, 50, 25, 0.6) 100%);
                border-radius: 50%;
                border: 3px solid rgba(0, 255, 136, 0.5);
                transition: all 0.3s ease;
            }

            .button-energy-fill {
                position: absolute;
                top: 3px;
                left: 3px;
                width: calc(100% - 6px);
                height: calc(100% - 6px);
                background: conic-gradient(from 0deg, transparent 0%, rgba(0, 255, 136, 0.6) var(--energy, 0%), transparent var(--energy, 0%));
                border-radius: 50%;
                transition: all 0.5s ease;
            }

            .button-image {
                position: relative;
                max-width: 80px;
                width: 40%;
                height: auto;
                z-index: 2;
                transition: all 0.3s ease;
                filter: drop-shadow(0 5px 15px rgba(0, 255, 136, 0.4));
            }

            .button-text {
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                color: #00ff88;
                font-size: 0.9rem;
                font-weight: bold;
                text-shadow: 0 0 10px rgba(0, 255, 136, 0.8);
                z-index: 2;
            }

            .energy-particles {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                overflow: hidden;
                z-index: 1;
            }

            @keyframes buttonHover {
                0%, 100% { transform: translateY(0px) scale(1); }
                50% { transform: translateY(-5px) scale(1.02); }
            }

            .start-button:hover {
                transform: scale(1.05) translateY(-8px);
            }

            .start-button:hover .button-bg {
                border-color: rgba(0, 255, 136, 0.8);
                box-shadow: 0 0 30px rgba(0, 255, 136, 0.5), inset 0 0 20px rgba(0, 255, 136, 0.2);
            }

            .start-button:hover .button-image {
                filter: drop-shadow(0 10px 25px rgba(0, 255, 136, 0.6)) brightness(1.2);
                transform: scale(1.1);
            }

            .start-button:active {
                transform: scale(1.02) translateY(-3px);
            }

            .start-button.charging {
                animation: chargingPulse 0.5s ease-in-out infinite alternate;
            }

            @keyframes chargingPulse {
                0% { transform: scale(1); }
                100% { transform: scale(1.03); }
            }

            .button-glow {
                position: absolute;
                width: 250px;
                height: 250px;
                background: radial-gradient(circle, rgba(0, 255, 136, 0.1) 0%, transparent 70%);
                border-radius: 50%;
                animation: glowRotate 8s linear infinite;
                z-index: -1;
            }

            @keyframes glowRotate {
                0% { transform: rotate(0deg) scale(1); opacity: 0.3; }
                50% { transform: rotate(180deg) scale(1.1); opacity: 0.6; }
                100% { transform: rotate(360deg) scale(1); opacity: 0.3; }
            }

            /* Energy meter */
            .energy-meter {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
                opacity: 0;
                animation: fadeInMeter 1s ease-out 4s forwards;
            }

            @keyframes fadeInMeter {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .energy-bar {
                width: 200px;
                height: 8px;
                background: rgba(0, 255, 136, 0.2);
                border-radius: 4px;
                border: 1px solid rgba(0, 255, 136, 0.4);
                overflow: hidden;
                position: relative;
            }

            .energy-fill {
                height: 100%;
                background: linear-gradient(90deg, #00ff88 0%, #00ccff 100%);
                width: 0%;
                transition: width 0.3s ease;
                position: relative;
            }

            .energy-fill::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
                animation: energyShimmer 2s ease-in-out infinite;
            }

            @keyframes energyShimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(200%); }
            }

            .energy-text {
                color: #00ff88;
                font-size: 0.8rem;
                font-weight: bold;
                text-shadow: 0 0 5px rgba(0, 255, 136, 0.5);
            }

            /* UI Overlay */
            .ui-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 15;
            }

            .settings-btn {
                position: absolute;
                top: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                background: rgba(0, 255, 136, 0.2);
                border: 2px solid rgba(0, 255, 136, 0.4);
                border-radius: 50%;
                cursor: pointer;
                pointer-events: auto;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .settings-btn img {
                width: 24px;
                height: 24px;
                filter: invert(1);
            }

            .settings-btn:hover {
                background: rgba(0, 255, 136, 0.4);
                border-color: rgba(0, 255, 136, 0.8);
                transform: rotate(90deg);
            }

            .score-preview {
                position: absolute;
                top: 20px;
                left: 20px;
                background: rgba(0, 0, 0, 0.7);
                border: 1px solid rgba(0, 255, 136, 0.3);
                border-radius: 10px;
                padding: 15px;
                text-align: center;
                animation: slideInLeft 1s ease-out 2s both;
            }

            @keyframes slideInLeft {
                from { transform: translateX(-100px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }

            .score-label {
                color: #888;
                font-size: 0.7rem;
                margin-bottom: 5px;
            }

            .score-value {
                color: #00ff88;
                font-size: 1.2rem;
                font-weight: bold;
                text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
            }

            .version-info {
                position: absolute;
                bottom: 20px;
                right: 20px;
                color: #666;
                font-size: 0.8rem;
                opacity: 0;
                animation: fadeIn 1s ease-out 5s forwards;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            /* Loading overlay */
            .loading-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                transition: opacity 0.5s ease;
            }

            .loading-overlay.hidden {
                opacity: 0;
                pointer-events: none;
            }

            .loading-content {
                text-align: center;
                max-width: 400px;
            }

            .loading-spinner {
                width: 80px;
                height: 80px;
                border: 4px solid rgba(0, 255, 136, 0.3);
                border-top: 4px solid #00ff88;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 30px;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .loading-text {
                color: #00ff88;
                font-size: 1.2rem;
                font-weight: bold;
                margin-bottom: 30px;
                text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
            }

            .loading-progress {
                display: flex;
                flex-direction: column;
                gap: 10px;
                align-items: center;
            }

            .progress-bar {
                width: 300px;
                height: 10px;
                background: rgba(0, 255, 136, 0.2);
                border-radius: 5px;
                overflow: hidden;
                border: 1px solid rgba(0, 255, 136, 0.4);
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #00ff88 0%, #00ccff 100%);
                width: 0%;
                transition: width 0.3s ease;
            }

            .progress-percentage {
                color: #00ff88;
                font-weight: bold;
            }

            /* Success message enhancement */
            .success-message {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, rgba(0, 255, 136, 0.95) 0%, rgba(0, 200, 100, 0.95) 100%);
                color: black;
                padding: 30px 40px;
                border-radius: 15px;
                font-weight: bold;
                z-index: 1001;
                animation: enhancedSuccessPop 4s ease-out forwards;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0, 255, 136, 0.6), 
                           0 0 60px rgba(0, 255, 136, 0.4),
                           inset 0 0 20px rgba(255, 255, 255, 0.2);
                border: 2px solid rgba(0, 255, 136, 0.8);
                backdrop-filter: blur(10px);
            }

            @keyframes enhancedSuccessPop {
                0% {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.3) rotate(-10deg);
                }
                15% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1.15) rotate(5deg);
                }
                25% {
                    transform: translate(-50%, -50%) scale(0.95) rotate(-2deg);
                }
                35% {
                    transform: translate(-50%, -50%) scale(1.05) rotate(1deg);
                }
                45% {
                    transform: translate(-50%, -50%) scale(1) rotate(0deg);
                }
                85% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1) rotate(0deg);
                }
                100% {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.8) rotate(3deg);
                }
            }

            /* Responsive design */
            @media (max-width: 768px) {
                .game-logo {
                    max-width: 300px;
                    width: 90%;
                }
                .typing-text {
                    font-size: 1.2rem;
                }
                .start-button {
                    width: 180px;
                    height: 180px;
                }
                .energy-ring {
                    width: 240px;
                    height: 240px;
                }
                .button-glow {
                    width: 200px;
                    height: 200px;
                }
                .score-preview {
                    top: 10px;
                    left: 10px;
                    padding: 10px;
                }
                .settings-btn {
                    top: 10px;
                    right: 10px;
                    width: 40px;
                    height: 40px;
                }
            }

            @media (max-width: 480px) {
                .game-logo {
                    max-width: 250px;
                    width: 95%;
                }
                .typing-text {
                    font-size: 1rem;
                }
                .fade-in-text {
                    font-size: 0.9rem;
                }
                .start-button {
                    width: 150px;
                    height: 150px;
                }
                .energy-ring {
                    width: 200px;
                    height: 200px;
                }
                .button-glow {
                    width: 170px;
                    height: 170px;
                }
                .energy-bar {
                    width: 150px;
                }
                .loading-content {
                    padding: 20px;
                }
                .progress-bar {
                    width: 250px;
                }
            }
        `;

    document.head.appendChild(styles);
  }

  setupEventListeners() {
    const startButton = this.container.querySelector(".start-button");
    const settingsBtn = this.container.querySelector(".settings-btn");

    if (startButton) {
      startButton.addEventListener("click", (e) => {
        this.handleStartClick();
      });

      // Add charging effect on hover
      startButton.addEventListener("mouseenter", () => {
        this.startEnergyCharging();
      });

      startButton.addEventListener("mouseleave", () => {
        this.stopEnergyCharging();
      });
    }

    if (settingsBtn) {
      settingsBtn.addEventListener("click", (e) => {
        this.handleSettingsClick();
      });
    }

    // Enable audio on first user interaction
    document.addEventListener(
      "click",
      () => {
        this.enableAudio();
      },
      { once: true }
    );

    // Add screen shake on certain events
    document.addEventListener("keydown", (e) => {
      if (e.code === "Space" && this.isActive) {
        e.preventDefault();
        this.handleStartClick();
      }
    });
  }

  startAnimations() {
    this.createEnhancedStars();
    this.createEnhancedAsteroids();
  }

  createEnhancedStars() {
    const starsContainer = this.container.querySelector(".stars-layer");
    if (!starsContainer) return;

    const { starCount = 50 } = this.animConfig;

    // Clear existing stars
    starsContainer.innerHTML = "";

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement("div");
      star.className = "star";

      // Random positioning and size
      const size = Math.random() * 4 + 1;
      star.style.left = Math.random() * 100 + "%";
      star.style.top = Math.random() * 100 + "%";
      star.style.width = star.style.height = size + "px";
      star.style.animationDelay = Math.random() * 4 + "s";
      star.style.animationDuration = 3 + Math.random() * 2 + "s";

      starsContainer.appendChild(star);
    }
  }

  createEnhancedAsteroids() {
    const asteroidsContainer = this.container.querySelector(".asteroids-layer");
    if (!asteroidsContainer) return;

    const { asteroidCount = 8 } = this.animConfig;

    // Clear existing asteroids
    asteroidsContainer.innerHTML = "";

    for (let i = 0; i < asteroidCount; i++) {
      const asteroid = document.createElement("div");
      asteroid.className = "asteroid";

      // Random positioning and size
      const size = Math.random() * 50 + 30;
      asteroid.style.width = asteroid.style.height = size + "px";
      asteroid.style.left = Math.random() * 90 + "%";
      asteroid.style.top = Math.random() * 90 + "%";
      asteroid.style.animationDelay = Math.random() * 8 + "s";
      asteroid.style.animationDuration = 6 + Math.random() * 4 + "s";

      asteroidsContainer.appendChild(asteroid);
    }
  }

  startParticleSystem() {
    const particlesContainer = this.container.querySelector(".particles-layer");
    if (!particlesContainer) return;

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

        this.container.appendChild(particle);
        this.particles.push(particle);

        // Remove particle after animation
        setTimeout(() => {
          if (particle.parentNode) {
            particle.remove();
            const index = this.particles.indexOf(particle);
            if (index > -1) {
              this.particles.splice(index, 1);
            }
          }
        }, 14000);
      },

      start() {
        setInterval(() => {
          if (this.particles.length < this.maxParticles) {
            this.createParticle();
          }
        }, 800);
      },
    };

    this.particleSystem.start();
  }

  startTypingEffect() {
    const taglineElement = this.container.querySelector(".typing-text");
    if (!taglineElement) return;

    const text =
      taglineElement.getAttribute("data-text") || this.config.tagline;
    let currentText = "";
    let index = 0;

    taglineElement.textContent = "";

    this.typingInterval = setInterval(() => {
      if (index < text.length) {
        currentText += text[index];
        taglineElement.textContent = currentText;
        index++;

        // Play typing sound
        if (this.audioManager) {
          this.audioManager.playSound("type");
        }
      } else {
        clearInterval(this.typingInterval);
        // Remove cursor after typing is complete
        setTimeout(() => {
          taglineElement.style.setProperty("--cursor", "none");
        }, 2000);
      }
    }, 100);
  }

  startEnergyCharging() {
    if (this.isCharging) return;

    this.isCharging = true;
    const button = this.container.querySelector(".start-button");
    const energyFill = this.container.querySelector(".energy-fill");
    const energyValue = this.container.querySelector(".energy-value");
    const buttonEnergyFill = this.container.querySelector(
      ".button-energy-fill"
    );

    button.classList.add("charging");

    const chargeInterval = setInterval(() => {
      if (!this.isCharging) {
        clearInterval(chargeInterval);
        return;
      }

      this.energyLevel = Math.min(this.energyLevel + 2, 100);

      if (energyFill) {
        energyFill.style.width = this.energyLevel + "%";
      }
      if (energyValue) {
        energyValue.textContent = this.energyLevel;
      }
      if (buttonEnergyFill) {
        buttonEnergyFill.style.setProperty("--energy", this.energyLevel + "%");
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
    this.isCharging = false;
    const button = this.container.querySelector(".start-button");
    button.classList.remove("charging");

    // Slowly drain energy when not charging
    const drainInterval = setInterval(() => {
      if (this.isCharging) {
        clearInterval(drainInterval);
        return;
      }

      this.energyLevel = Math.max(this.energyLevel - 1, 0);

      const energyFill = this.container.querySelector(".energy-fill");
      const energyValue = this.container.querySelector(".energy-value");
      const buttonEnergyFill = this.container.querySelector(
        ".button-energy-fill"
      );

      if (energyFill) {
        energyFill.style.width = this.energyLevel + "%";
      }
      if (energyValue) {
        energyValue.textContent = this.energyLevel;
      }
      if (buttonEnergyFill) {
        buttonEnergyFill.style.setProperty("--energy", this.energyLevel + "%");
      }

      if (this.energyLevel <= 0) {
        clearInterval(drainInterval);
      }
    }, 100);
  }

  initializeAudio() {
    // Enhanced audio manager
    this.audioManager = {
      enabled: false,
      sounds: {
        "background-music": null,
        "button-click": null,
        "energy-charge": null,
        "energy-full": null,
        type: null,
        success: null,
        "ui-hover": null,
      },

      enable() {
        this.enabled = true;
        console.log("🔊 Enhanced Start Screen audio enabled");

        // Start background music
        this.playSound("background-music", true);
      },

      playSound(soundName, loop = false) {
        if (!this.enabled) return;

        console.log(`🎵 Playing sound: ${soundName}${loop ? " (looped)" : ""}`);

        // In real implementation, would play actual audio files
        // Example implementation:
        /*
        if (!this.sounds[soundName]) {
          this.sounds[soundName] = new Audio(`audio/${soundName}.mp3`);
          this.sounds[soundName].volume = 0.7;
        }
        
        const audio = this.sounds[soundName];
        audio.loop = loop;
        audio.currentTime = 0;
        audio.play().catch(e => console.warn('Audio failed:', e));
        */
      },

      stopSound(soundName) {
        if (!this.enabled || !this.sounds[soundName]) return;

        // this.sounds[soundName].pause();
        // this.sounds[soundName].currentTime = 0;
        console.log(`🔇 Stopped sound: ${soundNames}`);
      },
    };
  }

  enableAudio() {
    if (this.audioManager) {
      this.audioManager.enable();
    }
  }

  handleStartClick() {
    console.log("🎮 Enhanced Start Mining button clicked!");

    // Check if energy is sufficient (optional requirement)
    if (this.energyLevel < 100) {
      this.showTemporaryMessage(
        "⚡ Charge energy to 100% for optimal mining!",
        "warning"
      );
      return;
    }

    // Play sound effect
    if (this.audioManager) {
      this.audioManager.playSound("button-click");
      this.audioManager.stopSound("background-music");
    }

    // Show loading overlay
    this.showLoadingScreen();

    // Enhanced success message
    setTimeout(() => {
      this.showSuccessMessage(
        "🚀 MINING OPERATIONS INITIALIZED!\nPreparing asteroid field..."
      );
    }, 500);

    // Simulate loading process
    this.simulateLoading();
  }

  handleSettingsClick() {
    console.log("⚙️ Settings button clicked!");

    if (this.audioManager) {
      this.audioManager.playSound("ui-hover");
    }

    // In full game, this would open settings panel
    this.showTemporaryMessage("⚙️ Settings panel coming soon!", "info");
  }

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

  simulateLoading() {
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
          console.log("🔄 Ready to transition to Mining Screen");
          // This is where you'd call: game.showScreen('mining');
        }, 500);
      }
    }, 200);
  }

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
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.remove();
      }
    }, 4000);
  }

  showTemporaryMessage(message, type = "info") {
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
        type === "warning" ? "rgba(255, 193, 7, 0.9)" : "rgba(0, 123, 255, 0.9)"
      };
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      font-weight: bold;
      z-index: 1002;
      animation: slideInDown 0.5s ease-out;
    `;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.style.animation = "slideOutUp 0.5s ease-in forwards";
        setTimeout(() => messageDiv.remove(), 500);
      }
    }, 3000);
  }

  // Cleanup method for when switching screens
  destroy() {
    // Clear intervals
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }

    // Stop audio
    if (this.audioManager) {
      this.audioManager.stopSound("background-music");
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

    this.isActive = false;
    this.isCharging = false;
    this.energyLevel = 0;

    console.log("🗑️ Enhanced Start Screen destroyed and cleaned up");
  }

  // Method to update config dynamically (useful for testing)
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    if (this.isActive) {
      this.render();
      this.setupEventListeners();
      this.startAnimations();
      this.startParticleSystem();
      this.startTypingEffect();
    }
    console.log("🔄 Enhanced Start Screen config updated");
  }
}

// Make available globally for debug system
window.StartScreen = StartScreen;

console.log(
  "📱 Enhanced StartScreen class loaded with advanced UI/UX features"
);
