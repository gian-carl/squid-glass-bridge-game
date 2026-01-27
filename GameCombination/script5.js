// Function to redirect to semidonr.html when the retry button is clicked
function retryGame() {
    window.location.href = "quiz.html"; // Redirects to semidonr.html
}

// Wait for the DOM to fully load before starting the music
document.addEventListener("DOMContentLoaded", function() {
    // Create an audio element
    const audio = new Audio('Fail_Sound_Effect(256k).mp3');

    // Set audio properties
    audio.loop = true;     // Loop the audio
    audio.autoplay = true; // Autoplay when the page loads

    // Optionally, set the volume
    audio.volume = 0.5; // Volume from 0.0 to 1.0

    // Play the audio
    audio.play();

    // Log a message once the audio is playing
    audio.onplay = function() {
        console.log("Background music is playing...");
    };

    // If you want to handle pause, resume, or stop music, you can add functions like this:
    // Function to pause the music
    window.pauseMusic = function() {
        audio.pause();
        console.log("Background music paused");
    };

    // Function to resume the music
    window.playMusic = function() {
        audio.play();
        console.log("Background music resumed");
    };
});
