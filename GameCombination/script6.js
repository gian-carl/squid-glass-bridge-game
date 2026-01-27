// script6.js - Game Reset and Initialization

// Reset the entire game
function resetGame() {
    sessionStorage.clear();
    localStorage.clear();
    
    // Reset all game state variables
    const resetState = {
        currentLevel: 1,
        currentQuestionInLevel: 0,
        levelScores: [0, 0, 0, 0],
        totalScore: 0,
        completedLevels: [false, false, false, false],
        bridgeParams: null,
        lastPosition: null
    };
    
    // Store initial state
    sessionStorage.setItem('currentLevel', resetState.currentLevel);
    sessionStorage.setItem('currentQuestionInLevel', resetState.currentQuestionInLevel);
    sessionStorage.setItem('levelScores', JSON.stringify(resetState.levelScores));
    sessionStorage.setItem('totalScore', resetState.totalScore);
    sessionStorage.setItem('completedLevels', JSON.stringify(resetState.completedLevels));
    
    return true;
}

// Start new game
function startNewGame() {
    if (resetGame()) {
        window.location.href = 'semidonr.html';
    }
}

// Continue existing game
function continueGame() {
    const currentLevel = parseInt(sessionStorage.getItem('currentLevel')) || 1;
    const completedLevels = JSON.parse(sessionStorage.getItem('completedLevels')) || [false, false, false, false];
    
    if (completedLevels[currentLevel - 1]) {
        // Current level completed, go to next level
        const nextLevel = currentLevel < 4 ? currentLevel + 1 : 4;
        sessionStorage.setItem('currentLevel', nextLevel);
        sessionStorage.setItem('currentQuestionInLevel', 0);
        window.location.href = 'quiz.html';
    } else {
        // Resume current level
        window.location.href = 'quiz.html';
    }
}

// Check game progress
function getGameProgress() {
    const currentLevel = parseInt(sessionStorage.getItem('currentLevel')) || 1;
    const levelScores = JSON.parse(sessionStorage.getItem('levelScores')) || [0, 0, 0, 0];
    const completedLevels = JSON.parse(sessionStorage.getItem('completedLevels')) || [false, false, false, false];
    const totalScore = parseInt(sessionStorage.getItem('totalScore')) || 0;
    
    const completedCount = completedLevels.filter(Boolean).length;
    const totalPossibleScore = completedCount * 5;
    
    return {
        currentLevel,
        levelScores,
        completedLevels,
        totalScore,
        completedCount,
        progressPercentage: Math.round((completedCount / 4) * 100),
        totalPossibleScore
    };
}

// Export functions for global use
window.GameManager = {
    resetGame,
    startNewGame,
    continueGame,
    getGameProgress
};

// Auto-reset if needed
if (window.location.pathname.includes('semidonr.html')) {
    // Reset when starting fresh from logo page
    resetGame();
}