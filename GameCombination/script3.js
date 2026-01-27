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

let audio = new Audio("heart_(128k).mp3")
audio.loop = true;
audio.play();

window.addEventListener("beforeunload",function(){
    audio.pause();
    audio.currentTime = 0
});

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 1.6, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0x222222, 0.3);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
directionalLight.position.set(0, 20, 10);
scene.add(directionalLight);

// Add eerie colored lights
const redLight = new THREE.PointLight(0xff0000, 2, 30);
redLight.position.set(10, 5, 0);
scene.add(redLight);

const greenLight = new THREE.PointLight(0x00ff00, 1.5, 30);
greenLight.position.set(-10, 3, 5);
scene.add(greenLight);

const blueLight = new THREE.PointLight(0x0000ff, 1, 25);
blueLight.position.set(0, 2, -10);
scene.add(blueLight);

// ========== GAME CONFIGURATION ==========
const totalRows = 20;
const stepsPerLevel = 5;
let currentGameLevel = parseInt(sessionStorage.getItem('currentLevel')) || 1;
let totalStepsCompleted = parseInt(sessionStorage.getItem('totalStepsCompleted')) || 0;

const currentLevelStartStep = (currentGameLevel - 1) * stepsPerLevel;
const currentLevelEndStep = currentGameLevel * stepsPerLevel;

let hasClue = false;
const levelScore = parseInt(sessionStorage.getItem(`level${currentGameLevel}_score`)) || 0;
if (levelScore >= 3) {
    hasClue = true;
}

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

const safeChoices = [];
for (let i = 0; i < totalRows; i++) {
    safeChoices.push(Math.random() < 0.5 ? "left" : "right");
}

function createGlassMaterial() {
    return new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
    });
}

function createStripedTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    for (let i = 0; i < 8; i++) {
        ctx.fillStyle = (i % 2 === 0) ? '#FF0000' : '#FFFFFF';
        ctx.fillRect(0, i * 8, 64, 8);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

function createPanelBorderGeometry(width, depth, borderWidth) {
    const shape = new THREE.Shape();
    const hw = width / 2;
    const hd = depth / 2;
    shape.moveTo(-hw - borderWidth, -hd - borderWidth);
    shape.lineTo(hw + borderWidth, -hd - borderWidth);
    shape.lineTo(hw + borderWidth, hd + borderWidth);
    shape.lineTo(-hw - borderWidth, hd + borderWidth);
    shape.lineTo(-hw - borderWidth, -hd - borderWidth);
    const hole = new THREE.Path();
    hole.moveTo(-hw, -hd);
    hole.lineTo(hw, -hd);
    hole.lineTo(hw, hd);
    hole.lineTo(-hw, hd);
    hole.lineTo(-hw, -hd);
    shape.holes.push(hole);
    return new THREE.ShapeGeometry(shape);
}

const borderWidth = 0.1;
const borderTexture = createStripedTexture();
const borderMaterial = new THREE.MeshBasicMaterial({
    map: borderTexture,
    side: THREE.DoubleSide,
});

const panelGeometry = new THREE.PlaneGeometry(panelWidth, panelDepth);
const panels = [];
for (let row = 0; row < totalRows; row++) {
    const zPos = rowZ(row);
    const leftPanel = new THREE.Mesh(panelGeometry, createGlassMaterial());
    leftPanel.position.set(leftX, panelY, zPos);
    leftPanel.rotation.x = -Math.PI / 2;
    leftPanel.userData = { safe: safeChoices[row] === "left", row: row, side: "left", isBroken: false };

    const leftBorderGeo = createPanelBorderGeometry(panelWidth, panelDepth, borderWidth);
    const leftBorder = new THREE.Mesh(leftBorderGeo, borderMaterial);
    leftBorder.position.set(0, 0.01, 0);
    leftPanel.add(leftBorder);

    const rightPanel = new THREE.Mesh(panelGeometry, createGlassMaterial());
    rightPanel.position.set(rightX, panelY, zPos);
    rightPanel.rotation.x = -Math.PI / 2;
    rightPanel.userData = { safe: safeChoices[row] === "right", row: row, side: "right", isBroken: false };

    const rightBorderGeo = createPanelBorderGeometry(panelWidth, panelDepth, borderWidth);
    const rightBorder = new THREE.Mesh(rightBorderGeo, borderMaterial);
    rightBorder.position.set(0, 0.01, 0);
    rightPanel.add(rightBorder);

    scene.add(leftPanel);
    scene.add(rightPanel);
    panels.push(leftPanel, rightPanel);
}

// ========== ULTIMATE SPOOKY RED & WHITE CIRCUS HOUSE ==========
function createHorrorCircusHouse() {
    const house = new THREE.Group();

    // Create classic red and white striped texture
    const stripeSize = 512;
    const stripeCanvas = document.createElement('canvas');
    stripeCanvas.width = stripeSize;
    stripeCanvas.height = stripeSize;
    const stripeCtx = stripeCanvas.getContext('2d');
    
    // Draw bright red and white stripes
    const stripeHeight = stripeSize / 8;
    for (let i = 0; i < 8; i++) {
        if (i % 2 === 0) {
            // Bright red stripes
            stripeCtx.fillStyle = '#FF0000';
            stripeCtx.fillRect(0, i * stripeHeight, stripeSize, stripeHeight);
            
            // Add texture to red stripes
            for (let j = 0; j < 50; j++) {
                const x = Math.random() * stripeSize;
                const y = i * stripeHeight + Math.random() * stripeHeight;
                const radius = Math.random() * 10 + 5;
                
                stripeCtx.fillStyle = '#CC0000';
                stripeCtx.beginPath();
                stripeCtx.arc(x, y, radius, 0, Math.PI * 2);
                stripeCtx.fill();
            }
        } else {
            // Clean white stripes
            stripeCtx.fillStyle = '#FFFFFF';
            stripeCtx.fillRect(0, i * stripeHeight, stripeSize, stripeHeight);
            
            // Add some dirt/stains to white stripes
            for (let j = 0; j < 20; j++) {
                const x = Math.random() * stripeSize;
                const y = i * stripeHeight + Math.random() * stripeHeight;
                const radius = Math.random() * 15 + 5;
                
                stripeCtx.fillStyle = 'rgba(150, 150, 150, 0.2)';
                stripeCtx.beginPath();
                stripeCtx.arc(x, y, radius, 0, Math.PI * 2);
                stripeCtx.fill();
            }
        }
    }
    
    const houseTexture = new THREE.CanvasTexture(stripeCanvas);
    houseTexture.wrapS = THREE.RepeatWrapping;
    houseTexture.wrapT = THREE.RepeatWrapping;
    houseTexture.repeat.set(1, 2);

    // Main tent structure - conical circus tent
    const tentHeight = 12;
    const tentBottomRadius = 6;
    const tentTopRadius = 0.5;
    
    const tentGeometry = new THREE.ConeGeometry(tentBottomRadius, tentHeight, 8, 1, true);
    const tentMaterial = new THREE.MeshPhongMaterial({
        map: houseTexture,
        color: 0xFFFFFF,
        emissive: 0x220000,
        shininess: 30,
        side: THREE.DoubleSide
    });
    
    const tent = new THREE.Mesh(tentGeometry, tentMaterial);
    tent.position.y = tentHeight / 2;
    house.add(tent);

    // Tent base structure (wooden platform)
    const baseHeight = 2;
    const baseGeometry = new THREE.CylinderGeometry(tentBottomRadius + 0.3, tentBottomRadius + 0.3, baseHeight, 8);
    const baseMaterial = new THREE.MeshPhongMaterial({
        color: 0x8B4513, // Wood brown
        emissive: 0x331100
    });
    
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -baseHeight / 2;
    house.add(base);

    // Circus entrance (large opening)
    const entranceWidth = 4;
    const entranceHeight = 5;
    const entranceDepth = 0.8;
    
    const entranceGeometry = new THREE.BoxGeometry(entranceWidth, entranceHeight, entranceDepth);
    const entranceMaterial = new THREE.MeshPhongMaterial({
        color: 0x000000,
        emissive: 0x111111
    });
    
    const entrance = new THREE.Mesh(entranceGeometry, entranceMaterial);
    entrance.position.set(0, entranceHeight/2, tentBottomRadius + 0.4);
    house.add(entrance);

    // Curtains with red velvet texture
    const curtainGeometry = new THREE.PlaneGeometry(entranceWidth/2.5, entranceHeight);
    
    // Create velvet curtain texture
    const velvetCanvas = document.createElement('canvas');
    velvetCanvas.width = 256;
    velvetCanvas.height = 512;
    const velvetCtx = velvetCanvas.getContext('2d');
    
    velvetCtx.fillStyle = '#990000';
    velvetCtx.fillRect(0, 0, 256, 512);
    
    // Add velvet texture lines
    for (let i = 0; i < 256; i += 2) {
        velvetCtx.fillStyle = i % 4 === 0 ? '#660000' : '#BB0000';
        velvetCtx.fillRect(i, 0, 1, 512);
    }
    
    const velvetTexture = new THREE.CanvasTexture(velvetCanvas);
    const curtainMaterial = new THREE.MeshPhongMaterial({
        map: velvetTexture,
        color: 0x990000,
        emissive: 0x220000,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
    });
    
    const leftCurtain = new THREE.Mesh(curtainGeometry, curtainMaterial);
    leftCurtain.position.set(-entranceWidth/4 + 0.3, entranceHeight/2, tentBottomRadius + 0.5);
    leftCurtain.rotation.y = Math.PI / 6;
    house.add(leftCurtain);
    
    const rightCurtain = new THREE.Mesh(curtainGeometry, curtainMaterial);
    rightCurtain.position.set(entranceWidth/4 - 0.3, entranceHeight/2, tentBottomRadius + 0.5);
    rightCurtain.rotation.y = -Math.PI / 6;
    house.add(rightCurtain);

    // Circus tent spikes (decorative)
    const spikeGeometry = new THREE.ConeGeometry(0.25, 1.2, 8);
    const spikeMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x000000,
        emissive: 0x222222
    });
    
    const numSpikes = 16;
    for (let i = 0; i < numSpikes; i++) {
        const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
        const angle = (Math.PI * 2 / numSpikes) * i;
        const radius = tentBottomRadius * 0.9;
        
        spike.position.set(
            Math.cos(angle) * radius,
            tentHeight - 0.3,
            Math.sin(angle) * radius
        );
        spike.rotation.x = Math.PI;
        
        // Alternate spike heights for visual interest
        if (i % 2 === 0) {
            spike.scale.y = 1.2;
        }
        
        house.add(spike);
    }

    // Circus flags at the top
    const flagGeometry = new THREE.PlaneGeometry(1.2, 0.6);
    const flagMaterial = new THREE.MeshPhongMaterial({
        color: 0xFFFF00,
        emissive: 0x444400,
        side: THREE.DoubleSide
    });
    
    const flagPositions = [
        [0, tentHeight + 0.7, 0.6],
        [0.6, tentHeight + 0.7, 0],
        [-0.6, tentHeight + 0.7, 0],
        [0, tentHeight + 0.7, -0.6]
    ];
    
    flagPositions.forEach((pos, index) => {
        const flag = new THREE.Mesh(flagGeometry, flagMaterial);
        flag.position.set(pos[0], pos[1], pos[2]);
        flag.rotation.y = (Math.PI / 4) * index;
        house.add(flag);
    });

    // Circus windows with spooky glow
    const windowGeometry = new THREE.PlaneGeometry(1, 1);
    
    // Add windows around the tent
    for (let i = 0; i < 4; i++) {
        const angle = (Math.PI * 2 / 4) * i;
        const radius = tentBottomRadius * 0.85;
        const height = tentHeight * 0.4;
        
        const windowMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFAA00,
            emissive: 0xFF5500,
            transparent: true,
            opacity: 0.8
        });
        
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        );
        
        // Face outward
        window.lookAt(
            Math.cos(angle) * (radius + 2),
            height,
            Math.sin(angle) * (radius + 2)
        );
        
        house.add(window);
    }

    // Clown figure (main attraction)
    const clownTexture = new THREE.TextureLoader().load("clown.png");
    const clownMaterial = new THREE.SpriteMaterial({ 
        map: clownTexture, 
        transparent: true,
        opacity: 0
    });
    
    const clownSprite = new THREE.Sprite(clownMaterial);
    clownSprite.scale.set(2, 3, 1);
    clownSprite.position.set(0, entranceHeight/2, tentBottomRadius + 0.3);
    house.add(clownSprite);
    house.userData.clown = clownSprite;

    // Circus lights around the base
    const lightGeometry = new THREE.SphereGeometry(0.18, 8, 8);
    const lightColors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00];
    house.userData.bulbs = [];
    
    const numLights = 16;
    for (let i = 0; i < numLights; i++) {
        const color = lightColors[i % lightColors.length];
        const lightMaterial = new THREE.MeshPhongMaterial({ 
            color: color, 
            emissive: color
        });
        
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        const angle = (Math.PI * 2 / numLights) * i;
        const radius = tentBottomRadius + 0.4;
        
        light.position.set(
            Math.cos(angle) * radius,
            1.8,
            Math.sin(angle) * radius
        );
        
        house.add(light);
        house.userData.bulbs.push(light);
    }

    // Tent support poles
    const poleGeometry = new THREE.CylinderGeometry(0.2, 0.2, tentHeight + 2);
    const poleMaterial = new THREE.MeshPhongMaterial({
        color: 0x8B4513,
        emissive: 0x331100
    });
    
    const polePositions = [
        [tentBottomRadius * 0.95, 0, 0],
        [-tentBottomRadius * 0.95, 0, 0],
        [0, 0, tentBottomRadius * 0.95],
        [0, 0, -tentBottomRadius * 0.95]
    ];
    
    polePositions.forEach(pos => {
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.set(pos[0], (tentHeight + 2) / 2, pos[2]);
        house.add(pole);
    });

    // Circus sign above entrance
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const signCtx = signCanvas.getContext('2d');
    
    signCtx.fillStyle = '#000000';
    signCtx.fillRect(0, 0, 512, 128);
    signCtx.font = 'bold 40px Arial';
    signCtx.fillStyle = '#FF0000';
    signCtx.textAlign = 'center';
    signCtx.textBaseline = 'middle';
    signCtx.fillText('CIRCUS OF DOOM', 256, 64);
    
    const signTexture = new THREE.CanvasTexture(signCanvas);
    const signGeometry = new THREE.PlaneGeometry(3, 0.8);
    const signMaterial = new THREE.MeshBasicMaterial({
        map: signTexture,
        transparent: true,
        side: THREE.DoubleSide
    });
    
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(0, entranceHeight + 0.5, tentBottomRadius + 0.2);
    house.add(sign);

    // Clown animation sequence
    setTimeout(() => {
        const duration = 1500;
        const startTime = performance.now();
        
        function animateClown(time) {
            const elapsed = time - startTime;
            const t = Math.min(elapsed / duration, 1);
            clownSprite.material.opacity = t;
            clownSprite.scale.set(2 * (1 + t * 0.2), 3 * (1 + t * 0.2), 1);
            
            if (t < 1) {
                requestAnimationFrame(animateClown);
            } else {
                setTimeout(() => {
                    const fadeStart = performance.now();
                    function fadeClown(time) {
                        const elapsedFade = time - fadeStart;
                        const tFade = Math.min(elapsedFade / duration, 1);
                        clownSprite.material.opacity = 1 - tFade;
                        if (tFade < 1) {
                            requestAnimationFrame(fadeClown);
                        }
                    }
                    requestAnimationFrame(fadeClown);
                }, 3000);
            }
        }
        requestAnimationFrame(animateClown);
    }, 2000);

    return house;
}

// ========== CREATE LANDING AREA WITH SAND TEXTURE ==========
function createLandingArea(width, depth, positionZ, isStart = true) {
    const landingArea = new THREE.Group();
    
    // Create realistic sand texture
    const sandCanvas = document.createElement('canvas');
    sandCanvas.width = 256;
    sandCanvas.height = 256;
    const sandCtx = sandCanvas.getContext('2d');
    
    // Base sand color
    sandCtx.fillStyle = '#D2B48C';
    sandCtx.fillRect(0, 0, 256, 256);
    
    // Add sand grain texture
    for (let i = 0; i < 8000; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const size = Math.random() * 2 + 1;
        const brightness = Math.random() * 40 + 200;
        
        sandCtx.fillStyle = `rgb(${brightness}, ${brightness - 20}, ${brightness - 40})`;
        sandCtx.fillRect(x, y, size, size);
    }
    
    // Add some darker patches
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const radius = Math.random() * 15 + 10;
        
        sandCtx.fillStyle = 'rgba(150, 120, 90, 0.3)';
        sandCtx.beginPath();
        sandCtx.arc(x, y, radius, 0, Math.PI * 2);
        sandCtx.fill();
    }
    
    const sandTexture = new THREE.CanvasTexture(sandCanvas);
    sandTexture.wrapS = THREE.RepeatWrapping;
    sandTexture.wrapT = THREE.RepeatWrapping;
    sandTexture.repeat.set(3, 3);
    
    // Main landing platform
    const platformGeometry = new THREE.PlaneGeometry(width, depth);
    const platformMaterial = new THREE.MeshPhongMaterial({
        map: sandTexture,
        color: 0xD2B48C,
        side: THREE.DoubleSide,
        shininess: 10
    });
    
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.rotation.x = -Math.PI / 2;
    platform.position.y = 0.01;
    landingArea.add(platform);
    
    // Wooden border
    const borderGeometry = new THREE.BoxGeometry(width + 0.5, 0.2, depth + 0.5);
    const borderMaterial = new THREE.MeshPhongMaterial({
        color: 0x8B4513,
        emissive: 0x331100
    });
    
    const border = new THREE.Mesh(borderGeometry, borderMaterial);
    border.position.y = -0.09;
    landingArea.add(border);
    
    // Safety railings
    const railingHeight = 1;
    const railingThickness = 0.15;
    
    // Left railing
    const leftRailingGeometry = new THREE.BoxGeometry(railingThickness, railingHeight, depth);
    const leftRailing = new THREE.Mesh(leftRailingGeometry, borderMaterial);
    leftRailing.position.set(-width/2 - 0.2, railingHeight/2, 0);
    landingArea.add(leftRailing);
    
    // Right railing
    const rightRailingGeometry = new THREE.BoxGeometry(railingThickness, railingHeight, depth);
    const rightRailing = new THREE.Mesh(rightRailingGeometry, borderMaterial);
    rightRailing.position.set(width/2 + 0.2, railingHeight/2, 0);
    landingArea.add(rightRailing);
    
    // Back railing
    const backRailingGeometry = new THREE.BoxGeometry(width, railingHeight, railingThickness);
    const backRailing = new THREE.Mesh(backRailingGeometry, borderMaterial);
    backRailing.position.set(0, railingHeight/2, -depth/2 - 0.2);
    landingArea.add(backRailing);
    
    // Entrance/exit marker
    const markerGeometry = new THREE.BoxGeometry(2.5, 0.15, 0.6);
    const markerMaterial = new THREE.MeshPhongMaterial({
        color: isStart ? 0x00FF00 : 0xFF0000,
        emissive: isStart ? 0x004400 : 0x440000
    });
    
    const entranceMarker = new THREE.Mesh(markerGeometry, markerMaterial);
    entranceMarker.position.set(0, 0.1, depth/2);
    landingArea.add(entranceMarker);
    
    // Direction sign
    const textCanvas = document.createElement('canvas');
    textCanvas.width = 512;
    textCanvas.height = 128;
    const textCtx = textCanvas.getContext('2d');
    textCtx.fillStyle = '#000000';
    textCtx.fillRect(0, 0, 512, 128);
    textCtx.font = 'bold 40px Arial';
    textCtx.fillStyle = isStart ? '#00FF00' : '#FF0000';
    textCtx.textAlign = 'center';
    textCtx.textBaseline = 'middle';
    textCtx.fillText(isStart ? 'START HERE' : 'FINISH LINE', 256, 64);
    
    const textTexture = new THREE.CanvasTexture(textCanvas);
    const textGeometry = new THREE.PlaneGeometry(3, 0.8);
    const textMaterial = new THREE.MeshBasicMaterial({
        map: textTexture,
        transparent: true,
        side: THREE.DoubleSide
    });
    
    const textSign = new THREE.Mesh(textGeometry, textMaterial);
    textSign.position.set(0, railingHeight + 0.5, 0);
    landingArea.add(textSign);
    
    // Add some rocks to the sand
    const rockGeometry = new THREE.SphereGeometry(0.1, 6, 6);
    const rockMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
    
    for (let i = 0; i < 15; i++) {
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        const x = (Math.random() - 0.5) * (width - 1);
        const z = (Math.random() - 0.5) * (depth - 1);
        const scale = Math.random() * 0.5 + 0.5;
        
        rock.position.set(x, 0.05, z);
        rock.scale.set(scale, scale * 0.7, scale);
        landingArea.add(rock);
    }
    
    landingArea.position.z = positionZ;
    return landingArea;
}

// ========== BRIDGE STRUCTURES ==========
const railLength = Math.abs(startZ - (startZ - gapBetweenRows * (totalRows + 1))) + gapBetweenRows;
const railThickness = 0.2;
const railHeight = 0.2;
const railMargin = 0.3;
const leftRailX = leftX - panelWidth / 2 - railMargin;
const rightRailX = rightX + panelWidth / 2 + railMargin;
const railY = panelY + 0.8;

const railGeometry = new THREE.BoxGeometry(railThickness, railHeight, railLength);
const railMaterial = new THREE.MeshPhongMaterial({ color: 0x444444, shininess: 100 });

const leftRail = new THREE.Mesh(railGeometry, railMaterial);
leftRail.position.set(leftRailX, railY, (startZ + (startZ - gapBetweenRows * (totalRows + 1))) / 2);
scene.add(leftRail);

const rightRail = new THREE.Mesh(railGeometry, railMaterial);
rightRail.position.set(rightRailX, railY, (startZ + (startZ - gapBetweenRows * (totalRows + 1))) / 2);
scene.add(rightRail);

// Bridge lights
const lightGeometry = new THREE.SphereGeometry(0.1, 12, 12);
const lightColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
const bridgeLights = [];

function createLight(color) {
    const lightMaterial = new THREE.MeshBasicMaterial({ color: color, emissive: color });
    return new THREE.Mesh(lightGeometry, lightMaterial);
}

const spacing = 0.8;
const numLights = Math.floor(railLength / spacing);

// Left side lights
for (let i = 0; i < numLights; i++) {
    const color = lightColors[i % lightColors.length];
    const lightMesh = createLight(color);
    lightMesh.position.set(
        leftRailX,
        railY + railHeight / 2 + 0.1,
        startZ - spacing * i
    );
    scene.add(lightMesh);
    bridgeLights.push(lightMesh);
}

// Right side lights
for (let i = 0; i < numLights; i++) {
    const color = lightColors[(i + 2) % lightColors.length];
    const lightMesh = createLight(color);
    lightMesh.position.set(
        rightRailX,
        railY + railHeight / 2 + 0.1,
        startZ - spacing * i
    );
    scene.add(lightMesh);
    bridgeLights.push(lightMesh);
}

// Middle lights
for (let i = 0; i < numLights; i++) {
    const color = lightColors[(i + 1) % lightColors.length];
    const lightMesh = createLight(color);
    
    lightMesh.position.set(
      0,
      railY + railHeight / 2 + 0.1,
      startZ - spacing * i
  );
  scene.add(lightMesh);
  bridgeLights.push(lightMesh);
}

// ========== CIRCUS HOUSES WITH LANDING AREAS ==========
const finishZ = startZ - gapBetweenRows * (totalRows + 1);
const landingAreaLength = 12;

// Start area: House -> Landing Area -> Bridge
const startHouse = createHorrorCircusHouse();
const startLandingArea = createLandingArea(panelWidth * 4, landingAreaLength, startZ + landingAreaLength/2, true);

startHouse.position.set(0, 0, startZ + landingAreaLength + 6);
startHouse.scale.set(1, 1, 1);
scene.add(startHouse);
scene.add(startLandingArea);

// Finish area: Bridge -> Landing Area -> House
const finishHouse = createHorrorCircusHouse();
const finishLandingArea = createLandingArea(panelWidth * 4, landingAreaLength, finishZ - landingAreaLength/2, false);

finishHouse.position.set(0, 0, finishZ - landingAreaLength - 6);
finishHouse.scale.set(1, 1, 1);
scene.add(finishHouse);
scene.add(finishLandingArea);

// ========== PLAYER ==========
const loader = new THREE.TextureLoader();
const playerTexture = loader.load("player.png");
const playerMaterial = new THREE.SpriteMaterial({
  map: playerTexture,
  transparent: true
});
const player = new THREE.Sprite(playerMaterial);
player.scale.set(2, 2, 1);
scene.add(player);

// ========== GAME STATE ==========
let isAnimating = false;
let gameOver = false;
let cameraMode = "first-person";
let cameraAngle = 0;
let cameraPitch = 0;
let shownClueForThisLevel = false;
let fallingObjects = []; // Store falling glass pieces
let brokenGlassPanels = new Set(); // Track which panels are broken
let isOnLandingArea = true; // Player starts on landing area
let canStartQuiz = false; // Quiz can only start when player is at bridge entrance

// Player movement variables
const moveSpeed = 0.08;
const maxLandingX = panelWidth * 2;
const minLandingX = -panelWidth * 2;
const landingZStart = startZ + landingAreaLength/2;
const landingZRange = landingAreaLength/2 - 1;

// ========== GAME FUNCTIONS ==========
function updatePlayerPosition() {
    // Position is updated directly in movePlayer function
}

function movePlayer(directionX, directionZ = 0) {
    if (!isOnLandingArea || isAnimating || gameOver) return;
    
    let newX = player.position.x + (directionX * moveSpeed);
    let newZ = player.position.z + (directionZ * moveSpeed);
    
    // Clamp to landing area boundaries
    newX = Math.max(minLandingX, Math.min(maxLandingX, newX));
    
    // Allow some forward/backward movement but limit to landing area
    const maxZ = landingZStart + landingZRange;
    const minZ = landingZStart - landingZRange;
    newZ = Math.max(minZ, Math.min(maxZ, newZ));
    
    // Smooth movement
    player.position.x = newX;
    player.position.z = newZ;
    player.position.y = panelY + 1; // Keep at constant height
    
    // Check if player is at bridge entrance
    const distanceToBridge = Math.abs(player.position.z - startZ);
    if (distanceToBridge < 1.5 && Math.abs(player.position.x) < 1) {
        canStartQuiz = true;
        // Visual feedback
        player.material.color.setHex(0x00FF00);
        setTimeout(() => {
            player.material.color.setHex(0xFFFFFF);
        }, 200);
    } else {
        canStartQuiz = false;
    }
    
    updateInfoText();
}

function updateInfoText() {
    if (isOnLandingArea) {
        if (canStartQuiz) {
            document.getElementById("info").innerHTML = 
                `Level ${currentGameLevel} - Ready to Start<br>
                <span style='color:#00ff00'>Press SPACE BAR to start the Quiz and see the clue!</span><br>
                Use W/A/S/D or Arrow Keys to walk on the landing area.<br>
                Drag mouse to look around.`;
        } else {
            document.getElementById("info").innerHTML = 
                `Level ${currentGameLevel} - Landing Area<br>
                Use W/A/S/D or Arrow Keys to walk on the landing area.<br>
                Go to the bridge entrance (green marker) to begin.<br>
                Drag mouse to look around.`;
        }
    } else {
        const stepInLevel = totalStepsCompleted - currentLevelStartStep + 1;
        const levelText = `Level ${currentGameLevel} - Step ${stepInLevel}/${stepsPerLevel}`;
        const clueText = hasClue ? "<br><span style='color:#00ff00'>GREEN GLASSES ARE SAFE! MEMORIZE THEM!</span>" : "<br><span style='color:yellow'>NO CLUE - GOOD LUCK!</span>";
        const instruction = "<br>Press Left or Right to choose your next step.";
        const cameraInstruction = "<br>Drag mouse to look around.";
        
        document.getElementById("info").innerHTML = levelText + clueText + instruction + cameraInstruction;
    }
}

function showAllSafeGlassesForCurrentLevel() {
    if (!hasClue || gameOver || shownClueForThisLevel) return;
    
    shownClueForThisLevel = true;
    
    for (let i = 0; i < stepsPerLevel; i++) {
        const step = currentLevelStartStep + i;
        if (step >= totalRows) break;
        
        const safeSide = safeChoices[step];
        const cluePanel = panels.find(p => 
            p.userData.row === step && p.userData.side === safeSide
        );
        
        if (cluePanel && !cluePanel.userData.isBroken) {
            (function(panel, stepIndex) {
                setTimeout(() => {
                    let blinkCount = 0;
                    const maxBlinks = 3;
                    const originalColor = panel.material.color.clone();
                    const originalOpacity = panel.material.opacity;
                    
                    function blink() {
                        if (blinkCount >= maxBlinks) return;
                        
                        panel.material.color.setHex(0x00ff00);
                        panel.material.opacity = 0.9;
                        panel.scale.set(1.1, 1.1, 1.1);
                        
                        setTimeout(() => {
                            panel.material.color.copy(originalColor);
                            panel.material.opacity = originalOpacity;
                            panel.scale.set(1, 1, 1);
                            
                            blinkCount++;
                            if (blinkCount < maxBlinks) {
                                setTimeout(blink, 150);
                            }
                        }, 150);
                    }
                    
                    blink();
                }, i * 600);
            })(cluePanel, i);
        }
    }
    
    setTimeout(() => {
        const oldInfo = document.getElementById("info").innerHTML;
        document.getElementById("info").innerHTML = oldInfo + "<br><span style='color:#00ff00'>MEMORIZE COMPLETE! CHOOSE YOUR STEPS!</span>";
    }, (stepsPerLevel * 600) + 1000);
}

function startQuizAndBridge() {
    if (!canStartQuiz || !isOnLandingArea) return;
    
    // Show quiz/clue
    if (hasClue) {
        showAllSafeGlassesForCurrentLevel();
    }
    
    // Transition player to bridge
    isOnLandingArea = false;
    
    // Position player at bridge start
    player.position.set(0, panelY + 1, startZ);
    updateInfoText();
}

function stepForward(selection) {
    // If on bridge, proceed with normal game logic
    if (gameOver || isAnimating || totalStepsCompleted >= totalRows) return;
    
    const nextRow = totalStepsCompleted;
    if (nextRow >= totalRows) {
        updateInfoText("Congratulations! You crossed the glass bridge.");
        setTimeout(() => {
            window.location.href = 'win.html';
        }, 2000);
        return;
    }
    
    const targetPanel = panels.find(
        (p) => p.userData.row === nextRow && p.userData.side === selection
    );
    
    if (!targetPanel) return;
    
    const targetPos = targetPanel.position.clone();
    targetPos.y = panelY + 1;
    
    animatePlayer(targetPos, () => {
        if (!targetPanel.userData.safe) {
            updateInfoText("Game Over! You fell from the glass bridge.");
            gameOver = true;
            
            // Mark panel as broken
            targetPanel.userData.isBroken = true;
            brokenGlassPanels.add(targetPanel);
            
            // Hide the original glass panel from bridge
            targetPanel.visible = false;
            
            // Remove border if exists
            if (targetPanel.children.length > 0) {
                targetPanel.remove(targetPanel.children[0]);
            }
            
            // Create broken glass pieces
            createBrokenGlassPieces(targetPanel);
            
            // Start falling animation with broken glass
            setTimeout(() => {
                animateFalling();
            }, 300);
        } else {
            totalStepsCompleted++;
            sessionStorage.setItem('totalStepsCompleted', totalStepsCompleted);
            
            if (totalStepsCompleted >= currentLevelEndStep) {
                if (currentGameLevel < 4) {
                    shownClueForThisLevel = false;
                    updateInfoText(`Level ${currentGameLevel} Completed! Moving to Level ${currentGameLevel + 1}...`);
                    
                    setTimeout(() => {
                        currentGameLevel++;
                        sessionStorage.setItem('currentLevel', currentGameLevel);
                        window.location.href = 'quiz.html';
                    }, 2000);
                } else {
                    updateInfoText("Congratulations! You crossed the glass bridge.");
                    setTimeout(() => {
                        window.location.href = 'win.html';
                    }, 2000);
                }
            } else {
                updateInfoText();
            }
        }
    });
}

function createBrokenGlassPieces(panel) {
    // Create 8-12 broken glass pieces
    const numPieces = 8 + Math.floor(Math.random() * 4);
    const glassMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
    });
    
    for (let i = 0; i < numPieces; i++) {
        // Create irregular glass pieces
        const pieceWidth = 0.2 + Math.random() * 0.3;
        const pieceDepth = 0.2 + Math.random() * 0.3;
        const pieceGeometry = new THREE.PlaneGeometry(pieceWidth, pieceDepth);
        
        const piece = new THREE.Mesh(pieceGeometry, glassMaterial);
        piece.position.copy(panel.position);
        piece.position.y = panelY + 0.05; // Slightly above the panel
        piece.rotation.x = -Math.PI / 2;
        
        // Random rotation
        piece.rotation.z = Math.random() * Math.PI * 2;
        
        // Add slight offset for explosion effect
        const explosionForce = 0.2;
        piece.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * explosionForce,
            Math.random() * 0.4 + 0.3, // Upward force
            (Math.random() - 0.5) * explosionForce
        );
        
        piece.userData.rotationSpeed = new THREE.Vector3(
            (Math.random() - 0.5) * 0.15,
            (Math.random() - 0.5) * 0.15,
            (Math.random() - 0.5) * 0.15
        );
        
        piece.userData.falling = true;
        scene.add(piece);
        fallingObjects.push(piece);
    }
}

function updateFallingObjects() {
    for (let i = fallingObjects.length - 1; i >= 0; i--) {
        const obj = fallingObjects[i];
        
        if (obj.userData.falling) {
            // Apply gravity
            obj.userData.velocity.y -= 0.015;
            
            // Update position
            obj.position.x += obj.userData.velocity.x * 0.08;
            obj.position.y += obj.userData.velocity.y * 0.08;
            obj.position.z += obj.userData.velocity.z * 0.08;
            
            // Update rotation
            obj.rotation.x += obj.userData.rotationSpeed.x;
            obj.rotation.y += obj.userData.rotationSpeed.y;
            obj.rotation.z += obj.userData.rotationSpeed.z;
            
            // Fade out as they fall
            if (obj.position.y < panelY - 5) {
                obj.material.opacity *= 0.95;
            }
            
            // Remove if too far down or invisible
            if (obj.position.y < -30 || obj.material.opacity < 0.05) {
                scene.remove(obj);
                fallingObjects.splice(i, 1);
            }
        }
    }
}

function animatePlayer(targetPos, onComplete) {
    isAnimating = true;
    const duration = 800;
    const jumpHeight = 0.5;
    const startTime = performance.now();
    const startPos = player.position.clone();

    function animateStep(time) {
        const elapsed = time - startTime;
        const t = Math.min(elapsed / duration, 1);
        player.position.x = THREE.MathUtils.lerp(startPos.x, targetPos.x, t);
        player.position.z = THREE.MathUtils.lerp(startPos.z, targetPos.z, t);
        const yOffset = jumpHeight * Math.sin(Math.PI * t);
        player.position.y = panelY + 1 + yOffset;
        if (t < 1) {
            requestAnimationFrame(animateStep);
        } else {
            isAnimating = false;
            if (onComplete) onComplete();
        }
    }
    requestAnimationFrame(animateStep);
}

function animateFalling() {
    cameraMode = "falling";
    const fallStartPosition = player.position.clone();
    const fallStartTime = Date.now();
    const fallDuration = 4500;
    
    // Stop background music
    audio.pause();
    
    // Play falling sounds
    const fallSound = new Audio("Fail_Sound_Effect(256k).mp3");
    fallSound.volume = 0.5;
    fallSound.play().catch(e => console.log("Cannot play fall sound:", e));
    
    // Initial camera setup - looking up at the bridge
    camera.position.copy(fallStartPosition);
    camera.position.y += 1.6;
    
    // Calculate look at point (between the two circus houses)
    const midpointZ = (startZ + finishZ) / 2;
    const lookAtPoint = new THREE.Vector3(0, 15, midpointZ);
    camera.lookAt(lookAtPoint);
    
    // Falling variables
    let fallSpeed = 0.08;
    const gravity = 0.0018;
    let fallDistance = 0;
    let playerRotation = 0;
    let cameraLookUpAngle = Math.PI / 8; // Initial upward angle
    
    // Store bridge for reference
    const bridgePosition = new THREE.Vector3(0, 5, midpointZ);
    
    function fall() {
        if (gameOver) {
            const currentTime = Date.now();
            const elapsed = currentTime - fallStartTime;
            const t = Math.min(elapsed / fallDuration, 1);
            
            if (t < 1) {
                // Accelerate falling
                fallSpeed += gravity;
                
                // Make player fall
                player.position.y -= fallSpeed;
                fallDistance += fallSpeed;
                
                // Player slowly rotates backward
                playerRotation -= 0.012;
                player.rotation.z = playerRotation;
                
                // Camera follows player
                camera.position.y = player.position.y + 1.6;
                
                // Camera slowly looks more upward as we fall
                cameraLookUpAngle += 0.0015;
                
                // Calculate look at point (bridge gets smaller and higher as we fall)
                const lookAtY = 15 + (cameraLookUpAngle * 40);
                const lookAtDistance = 25 - (fallDistance * 0.3);
                
                camera.lookAt(
                    bridgePosition.x,
                    lookAtY,
                    bridgePosition.z - lookAtDistance
                );
                
                // Update falling glass pieces
                updateFallingObjects();
                
                // Wind effect - camera shake increases with speed
                if (elapsed > 800) {
                    const shakeIntensity = Math.min((fallSpeed - 0.08) * 8, 0.08);
                    camera.position.x += (Math.random() - 0.5) * shakeIntensity;
                    camera.position.z += (Math.random() - 0.5) * shakeIntensity;
                }
                
                // Visual effects - screen gets darker and more distant
                const darkness = Math.min(fallDistance / 35, 0.85);
                const distanceFog = Math.min(fallDistance / 25, 0.7);
                renderer.setClearColor(
                    new THREE.Color(
                        0.1 * distanceFog,
                        0.15 * distanceFog,
                        0.25 + 0.4 * distanceFog
                    ),
                    darkness
                );
                
                requestAnimationFrame(fall);
            } else {
                // Fall completed
                
                // Play impact sound
                const impactSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-heavy-falling-impact-1107.mp3");
                impactSound.volume = 0.7;
                impactSound.play().catch(e => console.log("Cannot play impact sound:", e));
                
                // Final camera shake
                let shakeCount = 0;
                const maxShakes = 6;
                
                function finalShake() {
                    if (shakeCount >= maxShakes) {
                        // Clean up and redirect
                        setTimeout(() => {
                            sessionStorage.removeItem('totalStepsCompleted');
                            sessionStorage.removeItem('currentLevel');
                            window.location.href = 'lose.html';
                        }, 800);
                        return;
                    }
                    
                    const shakeX = (Math.random() - 0.5) * 12;
                    const shakeY = (Math.random() - 0.5) * 8;
                    
                    camera.position.x += shakeX;
                    camera.position.y += shakeY;
                    
                    shakeCount++;
                    
                    setTimeout(finalShake, 70);
                }
                
                finalShake();
            }
        }
    }
    
    fall();
}

// ========== EVENT LISTENERS ==========
const keysPressed = {};

window.addEventListener("keydown", (event) => {
    keysPressed[event.code] = true;
    
    // Space bar to start quiz when at bridge entrance
    if (event.code === "Space" && isOnLandingArea && canStartQuiz) {
        event.preventDefault();
        startQuizAndBridge();
        return;
    }
    
    // On bridge, left/right chooses glass panels
    if (!isOnLandingArea && !isAnimating && !gameOver) {
        if (event.code === "ArrowLeft" || event.code === "KeyA") {
            event.preventDefault();
            stepForward("left");
        } else if (event.code === "ArrowRight" || event.code === "KeyD") {
            event.preventDefault();
            stepForward("right");
        }
    }
});

window.addEventListener("keyup", (event) => {
    keysPressed[event.code] = false;
});

// Movement loop for smooth walking
function handleMovement() {
    if (!isOnLandingArea || isAnimating || gameOver) return;
    
    let moveX = 0;
    let moveZ = 0;
    
    // Horizontal movement
    if (keysPressed["ArrowLeft"] || keysPressed["KeyA"]) {
        moveX -= 1;
    }
    if (keysPressed["ArrowRight"] || keysPressed["KeyD"]) {
        moveX += 1;
    }
    
    // Forward/backward movement
    if (keysPressed["ArrowUp"] || keysPressed["KeyW"]) {
        moveZ -= 1;
    }
    if (keysPressed["ArrowDown"] || keysPressed["KeyS"]) {
        moveZ += 1;
    }
    
    // Normalize diagonal movement
    if (moveX !== 0 && moveZ !== 0) {
        moveX *= 0.7071; // 1/√2
        moveZ *= 0.7071;
    }
    
    if (moveX !== 0 || moveZ !== 0) {
        movePlayer(moveX, moveZ);
    }
}

document.getElementById("btnLeft").addEventListener("click", () => {
    if (!isAnimating && !gameOver) {
        if (isOnLandingArea) {
            movePlayer(-1, 0);
        } else {
            stepForward("left");
        }
    }
});

document.getElementById("btnRight").addEventListener("click", () => {
    if (!isAnimating && !gameOver) {
        if (isOnLandingArea) {
            movePlayer(1, 0);
        } else {
            stepForward("right");
        }
    }
});

// Add start quiz button
const startQuizBtn = document.createElement("button");
startQuizBtn.id = "btnStartQuiz";
startQuizBtn.textContent = "Start Quiz/Bridge";
startQuizBtn.style.cssText = `
    position: absolute;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    padding: 15px 25px;
    font-size: 18px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    display: none;
    z-index: 100;
`;
document.querySelector('.controls').appendChild(startQuizBtn);

document.getElementById("btnStartQuiz").addEventListener("click", () => {
    if (isOnLandingArea && canStartQuiz) {
        startQuizAndBridge();
    }
});

// Mouse drag for camera rotation
let isDragging = false;
let previousPointer = { x: 0, y: 0 };

renderer.domElement.addEventListener("pointerdown", (event) => {
    isDragging = true;
    previousPointer.x = event.clientX;
    previousPointer.y = event.clientY;
});

renderer.domElement.addEventListener("pointerup", () => {
    isDragging = false;
});

renderer.domElement.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    const deltaX = event.clientX - previousPointer.x;
    const deltaY = event.clientY - previousPointer.y;
    previousPointer.x = event.clientX;
    previousPointer.y = event.clientY;
    cameraAngle -= deltaX * 0.005;
    cameraPitch -= deltaY * 0.005;
    cameraPitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraPitch));
});

// ========== ANIMATION LOOP ==========
function animate() {
    requestAnimationFrame(animate);

    // Handle smooth movement
    handleMovement();

    // Animate bridge lights
    bridgeLights.forEach(light => {
        const scale = 0.8 + 0.2 * Math.abs(Math.sin(Date.now() * 0.005 + light.position.z));
        light.scale.set(scale, scale, scale);
    });

    // Animate circus house bulbs
    [startHouse, finishHouse].forEach(house => {
        if (house.userData.bulbs) {
            house.userData.bulbs.forEach(bulb => {
                const flicker = 0.8 + 0.2 * Math.random();
                if (bulb.material.emissiveIntensity !== undefined) {
                    bulb.material.emissiveIntensity = flicker;
                } else {
                    const baseColor = new THREE.Color(bulb.material.color);
                    baseColor.multiplyScalar(flicker);
                    bulb.material.emissive = baseColor;
                }
            });
        }
    });

    // Animate clown in houses
    [startHouse, finishHouse].forEach(house => {
        if (house.userData.clown) {
            // Slight bobbing motion for clown
            const time = Date.now() * 0.001;
            if (house.userData.clown.material.opacity > 0) {
                house.userData.clown.position.y = 2.5 + Math.sin(time) * 0.05;
            }
        }
    });

    // Show/hide start quiz button based on position
    const startQuizBtn = document.getElementById("btnStartQuiz");
    if (isOnLandingArea && canStartQuiz) {
        startQuizBtn.style.display = 'block';
    } else {
        startQuizBtn.style.display = 'none';
    }

    // Camera control for normal gameplay
    if (cameraMode === "first-person" && !gameOver) {
        const eyeOffset = new THREE.Vector3(0, 1.6, 0);
        const cameraPos = player.position.clone().add(eyeOffset);
        camera.position.lerp(cameraPos, 0.1);
        const direction = new THREE.Vector3(
            Math.cos(cameraPitch) * Math.sin(cameraAngle),
            Math.sin(cameraPitch),
            -Math.cos(cameraPitch) * Math.cos(cameraAngle)
        );
        const lookAtPos = cameraPos.clone().add(direction);
        camera.lookAt(lookAtPos);
    }

    renderer.render(scene, camera);
}

// ========== INITIALIZE GAME ==========
window.addEventListener("load", () => {
    // Start player on landing area
    isOnLandingArea = true;
    player.position.set(0, panelY + 1, startZ + landingAreaLength/2);
    updateInfoText();
    
    // Don't show clue immediately - only when player starts bridge
    shownClueForThisLevel = false;
});

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation loop
animate();