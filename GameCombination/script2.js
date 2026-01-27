// Listahan ng mga bugtong na nahahati sa 4 na level (bawat level ay may limang tanong)
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

// Load current level from sessionStorage or start with Level 1
let currentLevel = parseInt(sessionStorage.getItem('currentLevel')) || 1;
// Get only questions for current level
let levelQuestions = quizData.filter(q => q.level === currentLevel);
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
  audio.play();
  
  window.addEventListener("beforeunload",function(){
    audio.pause();
    audio.currentTime = 0;
  });
}

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
  levelIndicator.innerText = `Level ${currentData.level} - Tanong ${currentQuestionInLevel + 1}/5`;
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

  console.log("User Answer: ", userAnswer);
  console.log("Correct Answer: ", correctAnswer);

  if (userAnswer === correctAnswer) {
    levelScore++;
    selectedButton.style.boxShadow = "0 0 20px green";
    console.log("Tama!");
  } else {
    selectedButton.style.boxShadow = "0 0 20px red";
    markCorrect();
    console.log("Mali.");
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
    // Show next question in same level
    showQuestion();
  } else {
    // Level completed - store results
    const hasClue = levelScore >= 3;
    
    sessionStorage.setItem(`level${currentLevel}_score`, levelScore);
    sessionStorage.setItem(`level${currentLevel}_hasClue`, hasClue);
    
    // Show results
    timerElement.style.display = "none";
    questionElement.innerHTML = `<h2>Level ${currentLevel} Natapos!</h2>
                                <p>Score: ${levelScore} / 5</p>
                                <p>${hasClue ? "May clue ang tamang salamin sa susunod na bridge!" : "Walang clue sa susunod na bridge."}</p>`;
    optionsElement.innerHTML = "";
    
    // Redirect to bridge after 3 seconds
    setTimeout(() => {
      window.location.href = "bridge.html";
    }, 3000);
  }
}

// Start the quiz
showQuestion();