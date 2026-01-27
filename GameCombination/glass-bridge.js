// Setup ng Three.js Scene
const scene = new THREE.Scene();
const cubeLoader = new THREE.CubeTextureLoader();
scene.background = cubeLoader.load([
  'bg_right.jpg',
  'bg_left.jpg',
  'bg_up.jpg',
  'bg_down.jpg',
  'bg_front.jpg',
  'bg_back.jpg'
]);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.6, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(0, 20, 10);
scene.add(directionalLight);

// Constants and positions
const totalRows = 18;
const panelWidth = 3;
const panelDepth = 1.5;
const gapBetweenRows = 3;
const panelY = 0;
const startZ = 2;
const leftX = -panelWidth / 2 - 0.5;
const rightX = panelWidth / 2 + 0.5;

function rowZ(row) {
  return startZ - gapBetweenRows * (row + 1);
}

// Safe Choices for Glass Bridge
const safeChoices = [];
for (let i = 0; i < totalRows; i++) {
  safeChoices.push(Math.random() < 0.5 ? "left" : "right");
}

// Create Glass Material
function createGlassMaterial() {
  return new THREE.MeshPhongMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  });
}

// Geometry for Glass Panels
const panelGeometry = new THREE.PlaneGeometry(panelWidth, panelDepth);
const panels = [];
for (let row = 0; row < totalRows; row++) {
  const zPos = rowZ(row);
  const leftPanel = new THREE.Mesh(panelGeometry, createGlassMaterial());
  leftPanel.position.set(leftX, panelY, zPos);
  leftPanel.rotation.x = -Math.PI / 2;
  leftPanel.userData = { safe: safeChoices[row] === "left", row: row, side: "left" };
  scene.add(leftPanel);

  const rightPanel = new THREE.Mesh(panelGeometry, createGlassMaterial());
  rightPanel.position.set(rightX, panelY, zPos);
  rightPanel.rotation.x = -Math.PI / 2;
  rightPanel.userData = { safe: safeChoices[row] === "right", row: row, side: "right" };
  scene.add(rightPanel);
  panels.push(leftPanel, rightPanel);
}

// Player Object
const loader = new THREE.TextureLoader();
const playerTexture = loader.load("player.png");
const playerMaterial = new THREE.SpriteMaterial({
  map: playerTexture,
  transparent: true
});
const player = new THREE.Sprite(playerMaterial);
player.scale.set(2, 2, 1);
scene.add(player);

// Game State Variables
let currentRow = -1;
let isAnimating = false;
let gameOver = false;

function updatePlayerPositionInstant() {
  let xPos, zPos;
  if (currentRow === -1) {
    xPos = 0;
    zPos = startZ;
  } else {
    xPos = player.position.x;
    zPos = rowZ(currentRow);
  }
  player.position.set(xPos, panelY + 1, zPos);
}
updatePlayerPositionInstant();

function stepForward(selection) {
  if (gameOver || isAnimating) return;
  const nextRow = currentRow + 1;
  if (nextRow >= totalRows) {
    updateInfoText("Congratulations! Nakatawid ka na sa glass bridge.");
    return;
  }
  const targetPanel = panels.find(
    (p) => p.userData.row === nextRow && p.userData.side === selection
  );
  if (!targetPanel) return;
  const targetPos = targetPanel.position.clone();
  targetPos.y = panelY + 1;
  animatePlayer(targetPos, () => {
    currentRow = nextRow;
    if (!targetPanel.userData.safe) {
      updateInfoText("Game Over! I-refresh ang page para ulitin.");
      gameOver = true;
      breakGlass(targetPanel);
    } else {
      updateInfoText(
        `Row ${currentRow + 1}: Pindutin ang Left o Right para pumili ng susunod na hakbang.`
      );
    }
  });
}

// Add event listeners for player movement
window.addEventListener("keydown", (event) => {
  if (gameOver || isAnimating) return;
  if (event.code === "ArrowLeft" || event.code === "KeyA") {
    stepForward("left");
  } else if (event.code === "ArrowRight" || event.code === "KeyD") {
    stepForward("right");
  }
});

document.getElementById("btnLeft").addEventListener("click", () => {
  stepForward("left");
});
document.getElementById("btnRight").addEventListener("click", () => {
  stepForward("right");
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();