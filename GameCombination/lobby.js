// lobby.js - Lobby management and countdown
document.addEventListener('DOMContentLoaded', function() {
    // Start lobby music
    const lobbyMusic = document.getElementById('lobbyMusic');
    lobbyMusic.volume = 0.3;
    lobbyMusic.play().catch(e => console.log("Audio autoplay prevented"));
    
    // Initialize game state
    sessionStorage.setItem('currentLevel', '1');
    sessionStorage.setItem('totalStepsCompleted', '0');
    sessionStorage.setItem('hintsUsed', '0');
    sessionStorage.setItem('hintsAvailable', '2');
    sessionStorage.setItem('clueAvailable', 'false');
    
    // Simulate player joining (for demo)
    let playerCount = 1;
    const maxPlayers = 10;
    const playerList = document.getElementById('playerList');
    
    // Start countdown
    let countdownTime = 60; // 60 seconds
    const countdownElement = document.getElementById('countdown');
    
    const countdownInterval = setInterval(function() {
        countdownTime--;
        countdownElement.textContent = countdownTime;
        
        // Update countdown color
        if (countdownTime <= 10) {
            countdownElement.style.color = '#ff0000';
            countdownElement.style.animation = 'pulse 0.5s infinite';
        } else if (countdownTime <= 30) {
            countdownElement.style.color = '#ff8800';
        }
        
        // Randomly add players (simulation)
        if (countdownTime % 15 === 0 && playerCount < maxPlayers) {
            playerCount++;
            document.getElementById('playerCount').textContent = playerCount;
            
            // Add player to list
            const newPlayer = document.createElement('li');
            newPlayer.textContent = `Player ${playerCount} ✅`;
            playerList.appendChild(newPlayer);
            
            // Animate new player
            newPlayer.style.opacity = '0';
            newPlayer.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                newPlayer.style.transition = 'all 0.5s';
                newPlayer.style.opacity = '1';
                newPlayer.style.transform = 'translateY(0)';
            }, 100);
        }
        
        // When countdown reaches 0
        if (countdownTime <= 0) {
            clearInterval(countdownInterval);
            startGame();
        }
    }, 1000);
    
    // Start game immediately button
    window.startGameNow = function() {
        clearInterval(countdownInterval);
        startGame();
    };
    
    function startGame() {
        // Stop music
        lobbyMusic.pause();
        
        // Show starting animation
        document.body.style.animation = 'fadeOut 1s forwards';
        
        // Redirect to bridge game
        setTimeout(() => {
            window.location.href = 'bridge.html';
        }, 1000);
    }
    
    // Add CSS for fadeOut
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);


    /* ================= MULTIPLAYER PATCH (ADD ONLY) ================= */

// Create socket connection
const socket = io({ transports: ["websocket"] });

// Override FAKE player simulation visually (no deletion)
socket.on("players", players => {
  try {
    // Force real player count
    document.getElementById("playerCount").textContent = players.length;

    // Replace player list safely
    const list = document.getElementById("playerList");
    list.innerHTML = "";

    players.forEach((_, i) => {
      const li = document.createElement("li");
      li.textContent = `Player ${i + 1} ✅`;
      list.appendChild(li);
    });
  } catch (e) {
    console.warn("Multiplayer patch skipped:", e);
  }
});

// Sync game start across all devices
socket.on("forceStart", () => {
  if (typeof startGame === "function") {
    startGame();
  }
});

// Intercept start button WITHOUT removing original
const __originalStartNow = window.startGameNow;
window.startGameNow = function () {
  socket.emit("startGame");
  if (__originalStartNow) __originalStartNow();
};

// Sync countdown finish WITHOUT touching interval
(function syncCountdown() {
  const check = setInterval(() => {
    if (typeof countdownTime !== "undefined" && countdownTime <= 0) {
      socket.emit("startGame");
      clearInterval(check);
    }
  }, 500);
})();

});