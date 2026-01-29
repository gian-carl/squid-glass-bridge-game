// script2-modified.js - Quiz for hints only
const quizData = [
  // Level 1
  {
    level: 1,
    question: "Nang maliit ay mestiso, nang lumaki'y negro",
    answer: "Abo ng Sigarilyo",
    choices: ["Abo ng Sigarilyo", "Uling", "Abo ng Kandila", "Usok ng Sigarilyo"]
  },
  { 
    level: 1,
    question: "Sa init ay sumasaya, sa lamig ay nalalanta",
    answer: "Acacia",
    choices: ["Acacia", "Narra", "Acorn", "Banyan"]
  },
  {
    level: 1,
    question: "Bahay ng salita, imbakan ng diwa",
    answer: "Aklat",
    choices: ["Aklat", "Magazine", "Dyaryo", "Booklet"]
  },
  {
    level: 1,
    question: "Hindi naman hayop, hindi rin tao, may dalawang pakpak ngunit hindi naman maka-lipad",
    answer: "Aparador",
    choices: ["Aparador", "Armario", "Estante", "Lamesa"]
  },
  {
    level: 1,
    question: "Manok kong pula, inutusan ko ng umaga, nang umuwi'y gabi na",
    answer: "Araw",
    choices: ["Araw", "Buwan", "Apoy", "Ulap"]
  },
  // Level 2
  {
    level: 2,
    question: "Tubig na nagiging bato, Batong nagiging tubig",
    answer: "Asin",
    choices: ["Asin", "Bato", "Semento", "Uling"]
  },
  {
    level: 2,
    question: "Buhay na hiram lamang, pinagmulan ng sangkatauhan",
    answer: "Babae",
    choices: ["Babae", "Lalaki", "Sanggol", "Asawa"]
  },
  {
    level: 2,
    question: "Hindi tao, hindi hayop, kung uminom ay salup-salop",
    answer: "Batya",
    choices: ["Batya", "Baso", "Kaldero", "Tabo"]
  },
  {
    level: 2,
    question: "Kay liit pa ni Neneng, marunong nang kumendeng",
    answer: "Bibe",
    choices: ["Bibe", "Sisiw", "Pugo", "Itik"]
  },
  {
    level: 2,
    question: "Tumapak ako sa impyerno, maya-maya ay nasa langit na ako",
    answer: "Escalator",
    choices: ["Escalator", "Elevator", "Hagdan", "Ramp"]
  },
  // Level 3
  {
    level: 3,
    question: "Apoy na iginuhit, isinulat sa langit",
    answer: "Kidlat",
    choices: ["Kidlat", "Kulog", "Siklab", "Apoy"]
  },
  {
    level: 3,
    question: "Hayan na si Katoto, dala-dala ang kubo",
    answer: "Pagong",
    choices: ["Pagong", "Kambing", "Kabayo", "Palaka"]
  },
  {
    level: 3,
    question: "Baston ni Adan, Hindi mabilang-bilang",
    answer: "Ulan",
    choices: ["Ulan", "Ambon", "Bagyo", "Hagupit"]
  },
  {
    level: 3,
    question: "Ang mukha'y parang tao, mataas lumukso, mabilis tumakbo",
    answer: "Matsing",
    choices: ["Matsing", "Cheeta", "Tamaraw", "Kabayo"]
  },
  {
    level: 3,
    question: "Berdeng kumot ng kalikasan, bumabalot sa pusalian",
    answer: "Lumot",
    choices: ["Lumot", "Damo", "Talahib", "Buhok"]
  },
  // Level 4
  {
    level: 4,
    question: "Ang katawan ay bala, ang bituka ay paminta",
    answer: "Papaya",
    choices: ["Papaya", "Mangga", "Bayabas", "Pakwan"]
  },
  {
    level: 4,
    question: "Nagsaing si Kurukutong, kumukulo'y walang gatong",
    answer: "Sabon",
    choices: ["Sabon", "Sabaw", "Saging", "Sorbetes"]
  },
  {
    level: 4,
    question: "Maliit at malaki, iisa ang sinasabi",
    answer: "Relo",
    choices: ["Relo", "Ruler", "Hour glass", "Chronometer"]
  },
  {
    level: 4,
    question: "Pritong saging sa kalan, Lumutong pagkat dinamitan",
    answer: "Turon",
    choices: ["Turon", "Fish ball", "Banana Cue", "Ukoy"]
  },
  {
    level: 4,
    question: "Dala-dala mo siya, pero kinakain ka niya",
    answer: "Kuto",
    choices: ["Kuto", "Linta", "Langgam", "imsekto"]
  }
];

// Load saved bridge state if coming from hint
const bridgeState = sessionStorage.getItem('bridgeGameState');
let currentSection = 0;
let levelQuestions = [];

if (bridgeState) {
    const state = JSON.parse(bridgeState);
    currentSection = state.currentSection || 0;
    levelQuestions = quizData.filter(q => q.level === (currentSection + 1));
} else {
    // Fallback to normal progression
    currentSection = Math.floor((parseInt(sessionStorage.getItem('totalStepsCompleted')) || 0) / 5);
    levelQuestions = quizData.filter(q => q.level === (currentSection + 1));
}

let currentQuestionInLevel = 0;
let levelScore = 0;

const questionElement = document.getElementById("question");
const optionsElement = document.getElementById("options");
const timerElement = document.getElementById("timer");
const levelIndicator = document.getElementById("levelIndicator");

// Start background music
{
  let audio = new Audio("sqm.mp3")
  audio.loop = true;
  audio.volume = 0.5;
  audio.play();
  
  window.addEventListener("beforeunload",function(){
    audio.pause();
    audio.currentTime = 0;
  });
}

// Update level indicator for hint quiz
levelIndicator.innerText = `HINT QUIZ - Section ${currentSection + 1} (Question 1/5)`;

// Start Timer
function startTimer() {
  let timeLeft = 15;
  timerElement.innerText = timeLeft;
  timerElement.style.backgroundColor = "green";

  timer = setInterval(() => {
    timeLeft--;
    timerElement.innerText = timeLeft;
    if (timeLeft <= 3) {
      timerElement.style.backgroundColor = "red";
    }
    if (timeLeft === 0) {
      clearInterval(timer);
      markCorrect();
      setTimeout(nextQuestion, 1500);
    }
  }, 1000);
}

// Show Question
function showQuestion() {
  clearInterval(timer);
  startTimer();
  const currentData = levelQuestions[currentQuestionInLevel];
  questionElement.innerText = currentData.question;
  levelIndicator.innerText = `HINT QUIZ - Section ${currentSection + 1} (Question ${currentQuestionInLevel + 1}/5)`;
  optionsElement.innerHTML = "";

  const shuffledChoices = currentData.choices.sort(() => Math.random() - 0.5);

  shuffledChoices.forEach(choice => {
    const button = document.createElement("button");
    button.innerText = choice;
    button.addEventListener("click", () => checkAnswer(button));
    optionsElement.appendChild(button);
  });
}

function checkAnswer(selectedButton) {
  clearInterval(timer);  // Stop the timer

  const buttons = document.querySelectorAll("#options button");
  buttons.forEach(btn => btn.disabled = true);  // Disable all buttons

  const userAnswer = selectedButton.innerText.trim().toLowerCase();
  const correctAnswer = levelQuestions[currentQuestionInLevel].answer.trim().toLowerCase();

  if (userAnswer === correctAnswer) {
    levelScore++;
    selectedButton.style.boxShadow = "0 0 20px green";
  } else {
    selectedButton.style.boxShadow = "0 0 20px red";
    markCorrect();
  }

  // Move to next question after 1.5 seconds
  setTimeout(nextQuestion, 1500);
}

function markCorrect() {
  const buttons = document.querySelectorAll("#options button");
  buttons.forEach(btn => {
    if (btn.innerText.trim().toLowerCase() === levelQuestions[currentQuestionInLevel].answer.trim().toLowerCase()) {
      btn.classList.add("correct");
    }
  });
}

function nextQuestion() {
  currentQuestionInLevel++;
  
  if (currentQuestionInLevel < levelQuestions.length) {
    // Show next question
    showQuestion();
  } else {
    // Quiz completed - process result
    timerElement.style.display = "none";
    
    const hasClue = levelScore >= 3;
    const clueText = hasClue 
      ? "✅ SUCCESS! You earned a CLUE for this section!" 
      : "❌ FAILED! No clue earned. Better luck next hint!";
    
    questionElement.innerHTML = `
      <h2>HINT QUIZ COMPLETED!</h2>
      <div class="result-box">
        <p>Score: <strong>${levelScore} / 5</strong></p>
        <p>${clueText}</p>
        <p>Quiz completed. Returning to bridge...</p>
      </div>
    `;
    optionsElement.innerHTML = "";
    
    // Store quiz score and clue result
    sessionStorage.setItem('quizScore', levelScore);
    
    // Return to bridge after 3 seconds
    setTimeout(() => {
      window.location.href = 'bridge.html';
    }, 3000);
  }
}

// Start the quiz
showQuestion();

// Add result box CSS
const style = document.createElement('style');
style.textContent = `
  .result-box {
    background: rgba(0, 0, 0, 0.7);
    padding: 20px;
    border-radius: 10px;
    margin: 20px 0;
    border: 2px solid #eeba6e;
  }
  
  .result-box p {
    margin: 10px 0;
    font-size: 18px;
  }
`;
document.head.appendChild(style);