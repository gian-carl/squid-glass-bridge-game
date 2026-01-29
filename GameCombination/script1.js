document.addEventListener('DOMContentLoaded', () => {
    // Logo Animation Elements
    const wrapper = document.getElementById('squid-wrapper');
    const head = document.getElementById('head');
    const imgLogo = document.getElementById('imgLogo');
    const startButton = document.getElementById('startButton');
    const logoContainer = document.getElementById('logo-container');
    const gameContainer = document.getElementById('game-container');
    
    // Audio Elements
    const backgroundMusic = document.getElementById('background-music');
    const trainSound = document.getElementById('train-sound');
    const slapSound = document.getElementById('slap-sound');
    
    // Game Scene Elements
    const slapHand = document.querySelector('.slap-hand');
    const salesman = document.querySelector('.salesman');
    const fadeOverlay = document.querySelector('.fade-overlay');
    const subwayStation = document.querySelector('.subway-station');
    const body = document.body;

    // Initial Setup
    startButton.style.display = 'none';
    
    // Function to start music with user interaction
    function startMusicOnInteraction() {
        const playMusic = () => {
            backgroundMusic.volume = 0.5;
            backgroundMusic.play()
                .then(() => {
                    console.log('Background music started');
                })
                .catch((error) => {
                    console.log('Error playing music:', error);
                    // Try fallback music
                    backgroundMusic.src = 'sqm.mp3';
                    setTimeout(() => {
                        backgroundMusic.play().catch(e => console.log('Fallback also failed:', e));
                    }, 100);
                });
            
            // Remove event listeners after first interaction
            document.removeEventListener('click', playMusic);
            document.removeEventListener('keydown', playMusic);
            document.removeEventListener('touchstart', playMusic);
        };
        
        // Add event listeners for user interaction
        document.addEventListener('click', playMusic);
        document.addEventListener('keydown', playMusic);
        document.addEventListener('touchstart', playMusic);
        
        // Auto-start after 1 second if no interaction (some browsers allow this)
        setTimeout(() => {
            if (backgroundMusic.paused) {
                playMusic();
            }
        }, 1000);
    }

    // Start music when page loads
    startMusicOnInteraction();

    // Function to stop the music when the game starts
    function stopMusic() {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
    
    // Logo Animation Sequence
    setTimeout(() => {
        wrapper.style.display = 'none';
    }, 8000);

    setTimeout(() => {
        head.style.display = 'none';
    }, 13000);

    setTimeout(() => {
        startButton.style.display = 'block';
        startButton.style.animation = 'pulse 1.5s infinite';
    }, 17000);

    // Start Game Handler - CHANGED TO REDIRECT TO LOBBY
    startButton.addEventListener('click', () => {
        stopMusic(); // Stop the background music
        
        // Play train sound when the game starts
        trainSound.volume = 0.7;
        trainSound.play()
            .then(() => {
                console.log('Train sound started');
            })
            .catch((error) => {
                console.log('Error playing train sound:', error);
            });

        // Hide the logo container and show the game container
        logoContainer.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        
        // Start the subway station scene after a short delay
        setTimeout(() => {
            initializeGameScene();
        }, 500);
        
        // After the animation sequence finishes, navigate to the LOBBY (CHANGED)
        setTimeout(() => {
            window.location.href = 'lobby.html'; // CHANGED FROM quiz.html
        }, 10000);
    });

    // Game Scene Initialization
    function initializeGameScene() {
        // Slap Animation Sequence
        function triggerSlap() {
            // Phase 1: Slap Animation
            slapHand.classList.add('slap-animate');
            slapSound.volume = 0.8;
            slapSound.play();

            // Phase 2: Screen Shake
            setTimeout(() => {
                body.classList.add('shake');
            }, 600);

            // Phase 3: Knockout Effects
            setTimeout(() => {
                body.style.filter = 'blur(2px)';
                fadeOverlay.classList.add('fade-in');
                subwayStation.classList.add('zoom-in');
            }, 1100);

            // Phase 4: Fade Out
            setTimeout(() => {
                fadeOverlay.classList.remove('fade-in');
                fadeOverlay.classList.add('fade-out');
            }, 7000);
        }

        // Event Listeners for the slap animation
        document.addEventListener('click', triggerSlap);
        
        // Auto-trigger slap after 2 seconds if no click
        setTimeout(() => {
            if (!slapHand.classList.contains('slap-animate')) {
                triggerSlap();
            }
        }, 2000);
    }
    
    // Add CSS for button pulse animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(237, 20, 124, 0.7); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(237, 20, 124, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(237, 20, 124, 0); }
        }
    `;
    document.head.appendChild(style);
});