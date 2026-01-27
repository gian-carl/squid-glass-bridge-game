/**************** Prize Counter Setup & Animation ****************/
const MINIMUM_ADDITIONAL_ITERATION_COUNT = 2;
const config = {
  additionalIterationCount: Math.max(MINIMUM_ADDITIONAL_ITERATION_COUNT, 5),
  transitionDuration: 3000,
  prize: 4560000,
  digits: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
};

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const getPrizeText = () => document.getElementById("prize-text");
const getTracks = () => document.querySelectorAll(".digit > .digit-track");
const getFormattedPrize = () => USD.format(config.prize);
const getPrizeDigitByIndex = index => parseInt(config.prize.toString()[index]);
const determineIterations = index => index + config.additionalIterationCount;

const createElement = (type, className, text) => {
  const element = document.createElement(type);
  element.className = className;
  if (text !== undefined) element.innerText = text;
  return element;
};

const createCharacter = character => createElement("span", "character", character);

const createDigit = (digit, trackIndex) => {
  const digitElement = createElement("span", "digit"),
        trackElement = createElement("span", "digit-track");
  let digits = [],
      iterations = determineIterations(trackIndex);
  for (let i = 0; i < iterations; i++) {
    digits = [...digits, ...config.digits];
  }
  trackElement.innerText = digits.join(" ");
  trackElement.style.transitionDuration = `${config.transitionDuration}ms`;
  digitElement.appendChild(trackElement);
  return digitElement;
};

const setup = () => {
  let index = 0;
  const prizeText = getPrizeText();
  for (const character of getFormattedPrize()) {
    const element = isNaN(character)
      ? createCharacter(character)
      : createDigit(character, index++);
    prizeText.appendChild(element);
  }
};

const animate = () => {
  getTracks().forEach((track, index) => {
    const digit = getPrizeDigitByIndex(index),
          iterations = determineIterations(index),
          activeDigit = ((iterations - 1) * 10) + digit;
    track.style.transform = `translateY(${activeDigit * -10}rem)`;
  });
  // Apply bounce effect to digits after roll
  setTimeout(() => {
    document.querySelectorAll("#prize-text .digit").forEach(digit => {
      digit.classList.add("bounce");
      setTimeout(() => digit.classList.remove("bounce"), 500);
    });
  }, config.transitionDuration);
};

const resetTrackPosition = track => {
  track.style.transitionDuration = "0ms";
  track.style.transform = "translateY(0)";
  track.offsetHeight;
  track.style.transitionDuration = `${config.transitionDuration}ms`;
};

const resetAnimation = () => {
  getTracks().forEach(resetTrackPosition);
};

const playCountSound = () => {
  const countSound = document.getElementById("countSound");
  if (countSound) {
    countSound.currentTime = 0;
    countSound.play();
  }
};

/**************** Celebration Effects Functions ****************/
const triggerCelebration = () => {
  const cheeringSound = document.getElementById("cheeringSound");
  if (cheeringSound) {
    cheeringSound.currentTime = 0;
    cheeringSound.play();
  }
  generateConfetti();
  generateSparkles();
};

window.onload = () => {
  setup();
  playCountSound();
  setTimeout(animate, 100);
  setTimeout(triggerCelebration, config.transitionDuration + 500);
};

/**************** Enhanced Confetti Animation ****************/
function generateConfetti() {
  const confettiContainer = document.body;
  const confettiInterval = setInterval(() => {
    let confetti = document.createElement("div");
    confetti.classList.add("confetti");
    // Random size between 8px and 16px
    const size = Math.floor(Math.random() * 8 + 8);
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.top = "0";
    confetti.style.animationDuration = (Math.random() * 3 + 2) + "s";
    // Random color from full spectrum and random rotation
    confetti.style.background = `hsl(${Math.floor(Math.random() * 360)}, 100%, 60%)`;
    confetti.style.transform = `rotate(${Math.floor(Math.random() * 360)}deg)`;
    confettiContainer.appendChild(confetti);
    setTimeout(() => confetti.remove(), 5000);
  }, 10);
  setTimeout(() => clearInterval(confettiInterval), 5000);
}

/**************** Sparkle/Twinkle Effects ****************/
function generateSparkles() {
  const prizeElement = document.getElementById("prize");
  const sparkleCount = 20;
  for (let i = 0; i < sparkleCount; i++) {
    let sparkle = document.createElement("div");
    sparkle.classList.add("sparkle");
    // Random position within the prize container
    sparkle.style.left = Math.random() * 100 + "%";
    sparkle.style.top = Math.random() * 100 + "%";
    prizeElement.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 1000);
  }
}
