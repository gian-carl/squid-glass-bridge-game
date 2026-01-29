const scene = new THREE.Scene();

// LOAD CUBE MAP BACKGROUND TEXTURES
const cubeLoader = new THREE.CubeTextureLoader();
const cubeMap = cubeLoader.load([
    'bg_right.jpg',
    'bg_left.jpg',
    'bg_up.jpg',
    'bg_down.jpg',
    'bg_front.jpg',
    'bg_back.jpg'
]);

// Set the cube map as scene background
scene.background = cubeMap;

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

// ========== CREATE BEAUTIFUL SAND TEXTURE WITH BLOOD STAINS ==========
function createSandTextureWithBloodStains() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Base sand color
    ctx.fillStyle = '#D2B48C';
    ctx.fillRect(0, 0, 512, 512);
    
    // Add sand grain texture
    for (let i = 0; i < 20000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 3 + 1;
        const brightness = Math.random() * 50 + 180;
        
        ctx.fillStyle = `rgb(${brightness}, ${brightness - 30}, ${brightness - 60})`;
        ctx.fillRect(x, y, size, size);
    }
    
    // Add darker sand patches for variation
    for (let i = 0; i < 300; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const radius = Math.random() * 20 + 10;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(150, 120, 90, 0.3)');
        gradient.addColorStop(1, 'rgba(150, 120, 90, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    
    // Add blood stains (various sizes and shapes)
    const bloodStainCount = 25;
    for (let i = 0; i < bloodStainCount; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 40 + 20;
        const opacity = Math.random() * 0.7 + 0.3;
        
        // Create irregular blood stain shape
        ctx.fillStyle = `rgba(139, 0, 0, ${opacity})`;
        ctx.beginPath();
        ctx.ellipse(x, y, size * 0.8, size * 0.5, Math.random() * Math.PI, 0, Math.PI * 2);
        
        // Add dripping effect
        for (let j = 0; j < 3; j++) {
            const dripLength = Math.random() * 15 + 5;
            const dripWidth = Math.random() * 5 + 2;
            const angle = (Math.random() * 0.5 - 0.25) * Math.PI;
            
            ctx.ellipse(
                x + Math.cos(angle) * size * 0.8,
                y + Math.sin(angle) * size * 0.5 + dripLength/2,
                dripWidth,
                dripLength,
                angle,
                0,
                Math.PI * 2
            );
        }
        ctx.fill();
        
        // Add darker center for depth
        ctx.fillStyle = `rgba(100, 0, 0, ${opacity * 0.5})`;
        ctx.beginPath();
        ctx.ellipse(x, y, size * 0.4, size * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Add blood splatter dots around main stain
        const splatterCount = Math.random() * 10 + 5;
        for (let j = 0; j < splatterCount; j++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * size + 10;
            const splatterX = x + Math.cos(angle) * distance;
            const splatterY = y + Math.sin(angle) * distance;
            const splatterSize = Math.random() * 8 + 2;
            
            ctx.fillStyle = `rgba(139, 0, 0, ${opacity * 0.6})`;
            ctx.beginPath();
            ctx.ellipse(splatterX, splatterY, splatterSize, splatterSize * 0.7, angle, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Add some dried, dark blood stains
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 30 + 15;
        
        ctx.fillStyle = 'rgba(70, 0, 0, 0.4)';
        ctx.beginPath();
        // Create irregular dried blood pattern
        for (let j = 0; j < 8; j++) {
            const angle = (j / 8) * Math.PI * 2;
            const radius = size * (0.5 + Math.random() * 0.5);
            const pointX = x + Math.cos(angle) * radius;
            const pointY = y + Math.sin(angle) * radius;
            
            if (j === 0) ctx.moveTo(pointX, pointY);
            else ctx.lineTo(pointX, pointY);
        }
        ctx.closePath();
        ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    
    return texture;
}

// ========== CREATE PERFECT FENCE FOR LANDING AREA ==========
function createSideFenceOnly(width, depth) {
    const fenceGroup = new THREE.Group();
    
    // Create sand texture with blood stains for fence
    const fenceTexture = createSandTextureWithBloodStains();
    
    // Fence material with sand texture
    const fenceMaterial = new THREE.MeshPhongMaterial({
        map: fenceTexture,
        color: 0xD2B48C,
        shininess: 10,
        side: THREE.DoubleSide
    });
    
    // Blood stain material for additional details
    const bloodMaterial = new THREE.MeshPhongMaterial({
        color: 0x8B0000,
        emissive: 0x220000,
        transparent: true,
        opacity: 0.7,
        shininess: 100
    });
    
    // Fence post parameters
    const postHeight = 1.8;
    const postWidth = 0.15;
    const postDepth = 0.15;
    const postSpacing = 2.5;
    
    // Calculate number of posts needed for each side
    const sidePosts = Math.floor(depth / postSpacing);
    
    // Create fence posts for LEFT SIDE
    for (let i = 0; i <= sidePosts; i++) {
        const postGroup = new THREE.Group();
        
        // Main post
        const postGeometry = new THREE.BoxGeometry(postWidth, postHeight, postDepth);
        const post = new THREE.Mesh(postGeometry, fenceMaterial);
        post.position.y = postHeight / 2;
        postGroup.add(post);
        
        // Post top decoration (pointed)
        const topGeometry = new THREE.ConeGeometry(postWidth * 0.8, 0.3, 4);
        const top = new THREE.Mesh(topGeometry, fenceMaterial);
        top.position.y = postHeight;
        postGroup.add(top);
        
        // Position the post group on LEFT SIDE
        const zPos = -depth/2 + (i * (depth/sidePosts));
        postGroup.position.set(-width/2, 0, zPos);
        fenceGroup.add(postGroup);
        
        // Add blood stains to some posts
        if (Math.random() < 0.4) {
            const stainCount = Math.floor(Math.random() * 3) + 1;
            for (let s = 0; s < stainCount; s++) {
                const stainHeight = Math.random() * (postHeight - 0.5) + 0.3;
                const stainWidth = Math.random() * 0.1 + 0.05;
                const stainDepth = Math.random() * 0.1 + 0.05;
                
                const stainGeometry = new THREE.BoxGeometry(stainWidth, stainDepth, 0.01);
                const stain = new THREE.Mesh(stainGeometry, bloodMaterial);
                stain.position.set(
                    -width/2 + (Math.random() < 0.5 ? postWidth/2 + 0.01 : -postWidth/2 - 0.01),
                    stainHeight,
                    zPos + (Math.random() - 0.5) * postDepth * 0.5
                );
                stain.rotation.y = Math.random() * Math.PI;
                fenceGroup.add(stain);
            }
        }
    }
    
    // Create fence posts for RIGHT SIDE
    for (let i = 0; i <= sidePosts; i++) {
        const postGroup = new THREE.Group();
        
        // Main post
        const postGeometry = new THREE.BoxGeometry(postWidth, postHeight, postDepth);
        const post = new THREE.Mesh(postGeometry, fenceMaterial);
        post.position.y = postHeight / 2;
        postGroup.add(post);
        
        // Post top decoration (pointed)
        const topGeometry = new THREE.ConeGeometry(postWidth * 0.8, 0.3, 4);
        const top = new THREE.Mesh(topGeometry, fenceMaterial);
        top.position.y = postHeight;
        postGroup.add(top);
        
        // Position the post group on RIGHT SIDE
        const zPos = -depth/2 + (i * (depth/sidePosts));
        postGroup.position.set(width/2, 0, zPos);
        fenceGroup.add(postGroup);
        
        // Add blood stains to some posts
        if (Math.random() < 0.4) {
            const stainCount = Math.floor(Math.random() * 3) + 1;
            for (let s = 0; s < stainCount; s++) {
                const stainHeight = Math.random() * (postHeight - 0.5) + 0.3;
                const stainWidth = Math.random() * 0.1 + 0.05;
                const stainDepth = Math.random() * 0.1 + 0.05;
                
                const stainGeometry = new THREE.BoxGeometry(stainWidth, stainDepth, 0.01);
                const stain = new THREE.Mesh(stainGeometry, bloodMaterial);
                stain.position.set(
                    width/2 + (Math.random() < 0.5 ? postWidth/2 + 0.01 : -postWidth/2 - 0.01),
                    stainHeight,
                    zPos + (Math.random() - 0.5) * postDepth * 0.5
                );
                stain.rotation.y = Math.random() * Math.PI;
                fenceGroup.add(stain);
            }
        }
    }
    
    // Create horizontal rails for LEFT SIDE
    const railDepth = 0.08;
    const railHeight = 0.1;
    
    // Top rail for left side
    const leftTopRailGeometry = new THREE.BoxGeometry(railDepth, railHeight, depth);
    const leftTopRail = new THREE.Mesh(leftTopRailGeometry, fenceMaterial);
    leftTopRail.position.set(-width/2, postHeight * 0.8, 0);
    fenceGroup.add(leftTopRail);
    
    // Middle rail for left side
    const leftMiddleRail = new THREE.Mesh(leftTopRailGeometry, fenceMaterial);
    leftMiddleRail.position.set(-width/2, postHeight * 0.5, 0);
    fenceGroup.add(leftMiddleRail);
    
    // Bottom rail for left side
    const leftBottomRail = new THREE.Mesh(leftTopRailGeometry, fenceMaterial);
    leftBottomRail.position.set(-width/2, postHeight * 0.2, 0);
    fenceGroup.add(leftBottomRail);
    
    // Create horizontal rails for RIGHT SIDE
    const rightTopRail = new THREE.Mesh(leftTopRailGeometry, fenceMaterial);
    rightTopRail.position.set(width/2, postHeight * 0.8, 0);
    fenceGroup.add(rightTopRail);
    
    const rightMiddleRail = new THREE.Mesh(leftTopRailGeometry, fenceMaterial);
    rightMiddleRail.position.set(width/2, postHeight * 0.5, 0);
    fenceGroup.add(rightMiddleRail);
    
    const rightBottomRail = new THREE.Mesh(leftTopRailGeometry, fenceMaterial);
    rightBottomRail.position.set(width/2, postHeight * 0.2, 0);
    fenceGroup.add(rightBottomRail);
    
    // Add diagonal supports for extra stability
    const supportCount = Math.floor(depth / 4);
    for (let i = 0; i < supportCount; i++) {
        const zPos = -depth/2 + Math.random() * depth;
        
        // Left side diagonal support
        const leftSupportGeometry = new THREE.BoxGeometry(0.06, 0.06, 1.2);
        const leftSupport = new THREE.Mesh(leftSupportGeometry, fenceMaterial);
        leftSupport.position.set(-width/2, postHeight * 0.6, zPos);
        leftSupport.rotation.x = Math.PI/4;
        fenceGroup.add(leftSupport);
        
        // Right side diagonal support
        const rightSupport = new THREE.Mesh(leftSupportGeometry, fenceMaterial);
        rightSupport.position.set(width/2, postHeight * 0.6, zPos);
        rightSupport.rotation.x = Math.PI/4;
        fenceGroup.add(rightSupport);
    }
    
    // Add additional blood stains on rails
    const railStainCount = 15;
    for (let i = 0; i < railStainCount; i++) {
        const side = Math.random() < 0.5 ? -1 : 1;
        const zPos = (Math.random() - 0.5) * depth * 0.8;
        const stainSize = Math.random() * 0.15 + 0.08;
        
        const stainGeometry = new THREE.BoxGeometry(stainSize, stainSize * 0.5, 0.01);
        const stain = new THREE.Mesh(stainGeometry, bloodMaterial);
        
        const railHeightChoice = Math.random();
        let yPos;
        if (railHeightChoice < 0.33) yPos = postHeight * 0.2;
        else if (railHeightChoice < 0.66) yPos = postHeight * 0.5;
        else yPos = postHeight * 0.8;
        
        stain.position.set(
            side * (width/2) + (side * 0.01),
            yPos + (Math.random() - 0.5) * 0.05,
            zPos
        );
        stain.rotation.y = Math.random() * Math.PI;
        fenceGroup.add(stain);
    }
    
    return fenceGroup;
}

// ========== PERFECT CIRCUS HOUSE WITH CUSTOM SIGN TEXT ==========
function createCircusHouseWithSign(signText = "WELCOME TO BRIDGE GAME") {
    const house = new THREE.Group();

    // Create high-quality red and white striped texture
    const stripeSize = 1024;
    const stripeCanvas = document.createElement('canvas');
    stripeCanvas.width = stripeSize;
    stripeCanvas.height = stripeSize;
    const stripeCtx = stripeCanvas.getContext('2d');
    
    // Draw high-quality stripes with gradient effects
    const stripeHeight = stripeSize / 12;
    for (let i = 0; i < 12; i++) {
        if (i % 2 === 0) {
            // Rich red stripes with texture
            const gradient = stripeCtx.createLinearGradient(0, i * stripeHeight, 0, (i + 1) * stripeHeight);
            gradient.addColorStop(0, '#990000');
            gradient.addColorStop(0.5, '#CC0000');
            gradient.addColorStop(1, '#990000');
            stripeCtx.fillStyle = gradient;
            stripeCtx.fillRect(0, i * stripeHeight, stripeSize, stripeHeight);
            
            // Add wear and tear to red stripes
            for (let j = 0; j < 30; j++) {
                const x = Math.random() * stripeSize;
                const y = i * stripeHeight + Math.random() * stripeHeight;
                const radius = Math.random() * 15 + 5;
                
                stripeCtx.fillStyle = 'rgba(150, 0, 0, 0.3)';
                stripeCtx.beginPath();
                stripeCtx.arc(x, y, radius, 0, Math.PI * 2);
                stripeCtx.fill();
            }
        } else {
            // Off-white stripes with dirt/stains
            const gradient = stripeCtx.createLinearGradient(0, i * stripeHeight, 0, (i + 1) * stripeHeight);
            gradient.addColorStop(0, '#F5F5F5');
            gradient.addColorStop(0.5, '#FFFFFF');
            gradient.addColorStop(1, '#F5F5F5');
            stripeCtx.fillStyle = gradient;
            stripeCtx.fillRect(0, i * stripeHeight, stripeSize, stripeHeight);
            
            // Add dirt and stains to white stripes
            for (let j = 0; j < 25; j++) {
                const x = Math.random() * stripeSize;
                const y = i * stripeHeight + Math.random() * stripeHeight;
                const radius = Math.random() * 20 + 10;
                
                stripeCtx.fillStyle = 'rgba(100, 100, 100, 0.1)';
                stripeCtx.beginPath();
                stripeCtx.arc(x, y, radius, 0, Math.PI * 2);
                stripeCtx.fill();
            }
        }
    }
    
    const houseTexture = new THREE.CanvasTexture(stripeCanvas);
    houseTexture.wrapS = THREE.RepeatWrapping;
    houseTexture.wrapT = THREE.RepeatWrapping;

    // Main cylindrical body
    const bodyHeight = 10;
    const bodyRadius = 8;
    const bodySegments = 24;
    const bodyGeometry = new THREE.CylinderGeometry(bodyRadius, bodyRadius, bodyHeight, bodySegments, 1, true);
    const bodyMaterial = new THREE.MeshPhongMaterial({
        map: houseTexture,
        color: 0xFFFFFF,
        emissive: 0x330000,
        shininess: 50,
        side: THREE.DoubleSide
    });
    
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = bodyHeight / 2;
    house.add(body);

    // Detailed roof (cone) with texture
    const roofHeight = 7;
    const roofSegments = 16;
    const roofGeometry = new THREE.ConeGeometry(bodyRadius, roofHeight, roofSegments, 1, true);
    const roofMaterial = new THREE.MeshPhongMaterial({
        map: houseTexture,
        color: 0xFFFFFF,
        emissive: 0x330000,
        shininess: 50,
        side: THREE.DoubleSide
    });
    
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = bodyHeight + (roofHeight / 2);
    house.add(roof);

    // Elaborate base (wooden platform with details)
    const baseHeight = 0.8;
    const baseRadius = bodyRadius + 1.2;
    const baseSegments = 16;
    const baseGeometry = new THREE.CylinderGeometry(baseRadius, baseRadius, baseHeight, baseSegments);
    
    // Create detailed wood texture for base
    const woodCanvas = document.createElement('canvas');
    woodCanvas.width = 512;
    woodCanvas.height = 512;
    const woodCtx = woodCanvas.getContext('2d');
    
    // Wood grain pattern
    woodCtx.fillStyle = '#8B4513';
    woodCtx.fillRect(0, 0, 512, 512);
    
    for (let i = 0; i < 200; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const length = Math.random() * 100 + 50;
        const width = Math.random() * 3 + 1;
        const angle = Math.random() * Math.PI;
        
        woodCtx.strokeStyle = `rgba(${Math.floor(100 + Math.random() * 50)}, ${Math.floor(50 + Math.random() * 30)}, ${Math.floor(30 + Math.random() * 20)}, 0.8)`;
        woodCtx.lineWidth = width;
        woodCtx.beginPath();
        woodCtx.moveTo(x, y);
        woodCtx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        woodCtx.stroke();
    }
    
    const woodTexture = new THREE.CanvasTexture(woodCanvas);
    const baseMaterial = new THREE.MeshPhongMaterial({
        map: woodTexture,
        color: 0x8B4513,
        emissive: 0x331100,
        shininess: 30
    });
    
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -baseHeight / 2;
    house.add(base);

    // Grand entrance with detailed frame
    const entranceWidth = 5;
    const entranceHeight = 6;
    const entranceDepth = 1.5;
    
    const entranceGeometry = new THREE.BoxGeometry(entranceWidth, entranceHeight, entranceDepth);
    const entranceMaterial = new THREE.MeshPhongMaterial({
        color: 0x000000,
        emissive: 0x222222
    });
    
    const entrance = new THREE.Mesh(entranceGeometry, entranceMaterial);
    entrance.position.set(0, entranceHeight/2, bodyRadius);
    house.add(entrance);

    // Ornate door frame
    const frameWidth = entranceWidth + 0.4;
    const frameHeight = entranceHeight + 0.4;
    const frameDepth = 0.3;
    
    const frameGeometry = new THREE.BoxGeometry(frameWidth, frameHeight, frameDepth);
    const frameMaterial = new THREE.MeshPhongMaterial({
        color: 0xA0522D,
        emissive: 0x442211,
        shininess: 100
    });
    
    const doorFrame = new THREE.Mesh(frameGeometry, frameMaterial);
    doorFrame.position.set(0, entranceHeight/2, bodyRadius + entranceDepth/2 - frameDepth/2 + 0.01);
    house.add(doorFrame);

    // Dark, ominous entrance interior
    const interiorGeometry = new THREE.BoxGeometry(entranceWidth * 0.9, entranceHeight * 0.9, 2);
    const interiorMaterial = new THREE.MeshPhongMaterial({
        color: 0x000000,
        emissive: 0x111111,
        transparent: true,
        opacity: 0.8
    });
    
    const interior = new THREE.Mesh(interiorGeometry, interiorMaterial);
    interior.position.set(0, entranceHeight/2, bodyRadius + 1);
    house.add(interior);

    // Detailed windows with glowing effect
    const windowGeometry = new THREE.PlaneGeometry(2, 2.5);
    
    // Create glowing window texture
    const windowCanvas = document.createElement('canvas');
    windowCanvas.width = 256;
    windowCanvas.height = 256;
    const windowCtx = windowCanvas.getContext('2d');
    
    // Yellow-orange glow
    const windowGradient = windowCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
    windowGradient.addColorStop(0, '#FFAA00');
    windowGradient.addColorStop(0.3, '#FF5500');
    windowGradient.addColorStop(1, 'rgba(255, 85, 0, 0.3)');
    
    windowCtx.fillStyle = windowGradient;
    windowCtx.fillRect(0, 0, 256, 256);
    
    const windowTexture = new THREE.CanvasTexture(windowCanvas);
    const windowMaterial = new THREE.MeshPhongMaterial({ 
        map: windowTexture,
        emissive: 0xFF5500,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
    });
    
    // Create 8 detailed windows around the house
    const numWindows = 8;
    for (let i = 0; i < numWindows; i++) {
        const angle = (Math.PI * 2 / numWindows) * i;
        const windowRadius = bodyRadius * 0.85;
        const heightVariation = Math.sin(i * 1.5) * 1.5;
        const height = bodyHeight * 0.5 + heightVariation;
        
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(
            Math.cos(angle) * windowRadius,
            height,
            Math.sin(angle) * windowRadius
        );
        
        // Face outward
        window.lookAt(
            Math.cos(angle) * (windowRadius + 3),
            height,
            Math.sin(angle) * (windowRadius + 3)
        );
        
        // Window frame
        const windowFrameGeometry = new THREE.BoxGeometry(2.2, 2.7, 0.1);
        const windowFrameMaterial = new THREE.MeshPhongMaterial({
            color: 0x8B4513,
            emissive: 0x331100
        });
        
        const windowFrame = new THREE.Mesh(windowFrameGeometry, windowFrameMaterial);
        windowFrame.position.set(0, 0, -0.06);
        window.add(windowFrame);
        
        house.add(window);
        
        // Add glowing point light near window
        const windowLight = new THREE.PointLight(0xFF5500, 0.8, 5);
        windowLight.position.set(
            Math.cos(angle) * (windowRadius - 0.5),
            height,
            Math.sin(angle) * (windowRadius - 0.5)
        );
        house.add(windowLight);
    }

    // Luxurious velvet curtains at entrance
    const curtainGeometry = new THREE.PlaneGeometry(entranceWidth/2.3, entranceHeight * 0.9);
    
    // Create velvet curtain texture
    const velvetCanvas = document.createElement('canvas');
    velvetCanvas.width = 512;
    velvetCanvas.height = 1024;
    const velvetCtx = velvetCanvas.getContext('2d');
    
    // Deep red velvet with texture
    for (let x = 0; x < 512; x += 2) {
        for (let y = 0; y < 1024; y += 2) {
            const darkness = 150 + Math.sin(x * 0.05) * 50 + Math.cos(y * 0.02) * 30;
            velvetCtx.fillStyle = `rgb(${Math.floor(darkness * 0.6)}, 0, 0)`;
            velvetCtx.fillRect(x, y, 1, 1);
            
            // Velvet highlights
            if (Math.random() < 0.1) {
                velvetCtx.fillStyle = `rgb(${Math.min(255, darkness + 50)}, 20, 20)`;
                velvetCtx.fillRect(x, y, 1, 1);
            }
        }
    }
    
    const velvetTexture = new THREE.CanvasTexture(velvetCanvas);
    const curtainMaterial = new THREE.MeshPhongMaterial({
        map: velvetTexture,
        color: 0x800000,
        emissive: 0x220000,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95
    });
    
    const leftCurtain = new THREE.Mesh(curtainGeometry, curtainMaterial);
    leftCurtain.position.set(-entranceWidth/4 + 0.2, entranceHeight/2, bodyRadius - 0.2);
    leftCurtain.rotation.y = Math.PI / 4;
    house.add(leftCurtain);
    
    const rightCurtain = new THREE.Mesh(curtainGeometry, curtainMaterial);
    rightCurtain.position.set(entranceWidth/4 - 0.2, entranceHeight/2, bodyRadius - 0.2);
    rightCurtain.rotation.y = -Math.PI / 4;
    house.add(rightCurtain);

    // Elaborate decorative flags at the top
    const flagGeometry = new THREE.PlaneGeometry(2, 1.2);
    const flagColors = [0xFF0000, 0xFFFF00, 0x0000FF, 0x00FF00];
    
    const flagPositions = [
        [0, bodyHeight + roofHeight + 0.8, 1.5],
        [1.5, bodyHeight + roofHeight + 0.8, 0],
        [-1.5, bodyHeight + roofHeight + 0.8, 0],
        [0, bodyHeight + roofHeight + 0.8, -1.5],
        [1, bodyHeight + roofHeight + 0.8, 1],
        [-1, bodyHeight + roofHeight + 0.8, 1],
        [1, bodyHeight + roofHeight + 0.8, -1],
        [-1, bodyHeight + roofHeight + 0.8, -1]
    ];
    
    flagPositions.forEach((pos, index) => {
        const flagMaterial = new THREE.MeshPhongMaterial({
            color: flagColors[index % flagColors.length],
            emissive: flagColors[index % flagColors.length],
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
        });
        
        const flag = new THREE.Mesh(flagGeometry, flagMaterial);
        flag.position.set(pos[0], pos[1], pos[2]);
        flag.rotation.y = (Math.PI / 4) * index;
        
        // Add slight wave animation
        flag.userData.waveSpeed = Math.random() * 0.02 + 0.01;
        flag.userData.waveOffset = Math.random() * Math.PI * 2;
        
        house.add(flag);
    });

    // Spiked roof decorations
    const spikeGeometry = new THREE.ConeGeometry(0.3, 1.5, 8);
    const spikeMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x000000,
        emissive: 0x333333,
        shininess: 100
    });
    
    const numSpikes = 16;
    for (let i = 0; i < numSpikes; i++) {
        const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
        const angle = (Math.PI * 2 / numSpikes) * i;
        const radius = bodyRadius * 0.92;
        
        spike.position.set(
            Math.cos(angle) * radius,
            bodyHeight + roofHeight - 0.5,
            Math.sin(angle) * radius
        );
        
        // Tilt spikes slightly outward
        spike.lookAt(
            Math.cos(angle) * (radius + 2),
            bodyHeight + roofHeight - 0.5,
            Math.sin(angle) * (radius + 2)
        );
        spike.rotateX(Math.PI);
        
        // Vary spike sizes
        if (i % 3 === 0) {
            spike.scale.set(1.2, 1.5, 1.2);
        } else if (i % 3 === 1) {
            spike.scale.set(0.9, 1.2, 0.9);
        }
        
        house.add(spike);
    }

    // Beautiful hanging lights around the house
    const lightBulbGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const lightColors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF];
    house.userData.bulbs = [];
    house.userData.lights = [];
    
    const numLights = 20;
    for (let i = 0; i < numLights; i++) {
        const color = lightColors[i % lightColors.length];
        const lightMaterial = new THREE.MeshPhongMaterial({ 
            color: color, 
            emissive: color,
            shininess: 100
        });
        
        const lightBulb = new THREE.Mesh(lightBulbGeometry, lightMaterial);
        const angle = (Math.PI * 2 / numLights) * i;
        const radius = bodyRadius + 0.6;
        const height = 2.5 + Math.sin(i * 0.7) * 1.5;
        
        lightBulb.position.set(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        );
        
        // Add a point light at each bulb
        const pointLight = new THREE.PointLight(color, 1.2, 8);
        pointLight.position.copy(lightBulb.position);
        house.add(pointLight);
        house.userData.lights.push(pointLight);
        
        house.add(lightBulb);
        house.userData.bulbs.push(lightBulb);
        
        // Create light fixture
        const fixtureGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.4, 8);
        const fixtureMaterial = new THREE.MeshPhongMaterial({
            color: 0x888888,
            emissive: 0x222222
        });
        
        const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
        fixture.position.set(
            Math.cos(angle) * radius,
            height + 0.3,
            Math.sin(angle) * radius
        );
        house.add(fixture);
        
        // Chain from ceiling to light
        const chainGeometry = new THREE.TorusGeometry(0.05, 0.02, 8, 12);
        const chainMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
        
        for (let j = 0; j < 3; j++) {
            const chainLink = new THREE.Mesh(chainGeometry, chainMaterial);
            chainLink.position.set(
                Math.cos(angle) * radius,
                height + 0.6 + (j * 0.15),
                Math.sin(angle) * radius
            );
            chainLink.rotation.x = Math.PI/2;
            house.add(chainLink);
        }
    }

    // Ornate support poles
    const poleGeometry = new THREE.CylinderGeometry(0.25, 0.3, bodyHeight + roofHeight + 3);
    const poleMaterial = new THREE.MeshPhongMaterial({
        map: woodTexture,
        color: 0x8B4513,
        emissive: 0x331100,
        shininess: 30
    });
    
    const polePositions = [
        [bodyRadius * 0.95, 0, 0],
        [-bodyRadius * 0.95, 0, 0],
        [0, 0, bodyRadius * 0.95],
        [0, 0, -bodyRadius * 0.95],
        [bodyRadius * 0.67, 0, bodyRadius * 0.67],
        [-bodyRadius * 0.67, 0, bodyRadius * 0.67],
        [bodyRadius * 0.67, 0, -bodyRadius * 0.67],
        [-bodyRadius * 0.67, 0, -bodyRadius * 0.67]
    ];
    
    polePositions.forEach(pos => {
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.set(pos[0], (bodyHeight + roofHeight + 3) / 2, pos[2]);
        house.add(pole);
        
        // Pole base decoration
        const baseGeometry = new THREE.CylinderGeometry(0.4, 0.45, 0.3, 8);
        const base = new THREE.Mesh(baseGeometry, poleMaterial);
        base.position.set(pos[0], 0.15, pos[2]);
        house.add(base);
        
        // Pole top decoration
        const topGeometry = new THREE.ConeGeometry(0.35, 0.5, 8);
        const top = new THREE.Mesh(topGeometry, poleMaterial);
        top.position.set(pos[0], bodyHeight + roofHeight + 3 + 0.25, pos[2]);
        house.add(top);
    });

    // FIXED SIGN BOARD - NOT CUT OFF IN THE MIDDLE
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 2048;  // Double the width for better text rendering
    signCanvas.height = 512;
    const signCtx = signCanvas.getContext('2d');
    
    // Clear canvas
    signCtx.clearRect(0, 0, signCanvas.width, signCanvas.height);
    
    // Sign background with dark gradient
    const signGradient = signCtx.createLinearGradient(0, 0, 0, signCanvas.height);
    signGradient.addColorStop(0, '#000000');
    signGradient.addColorStop(0.5, '#222222');
    signGradient.addColorStop(1, '#000000');
    signCtx.fillStyle = signGradient;
    signCtx.fillRect(0, 0, signCanvas.width, signCanvas.height);
    
    // Gold border with proper thickness
    signCtx.strokeStyle = '#FFD700';
    signCtx.lineWidth = 20;
    signCtx.strokeRect(10, 10, signCanvas.width - 20, signCanvas.height - 20);
    
    // Calculate text position and size
    const text = signText.toUpperCase();
    const centerX = signCanvas.width / 2;
    const centerY = signCanvas.height / 2;
    
    // Set font - larger and bold
    signCtx.font = 'bold 100px "Arial Black", sans-serif';
    signCtx.textAlign = 'center';
    signCtx.textBaseline = 'middle';
    
    // Draw text with glow effect (multiple layers)
    for (let i = 0; i < 15; i++) {
        signCtx.shadowBlur = 30 - i * 2;
        signCtx.shadowColor = i < 8 ? '#FF0000' : '#990000';
        signCtx.fillStyle = i < 8 ? '#FF4444' : '#CC0000';
        
        // Split text if needed for better readability
        const words = text.split(' ');
        if (words.length <= 4) {
            // Single line for short text
            signCtx.fillText(text, centerX, centerY);
        } else {
            // Two lines for longer text
            const mid = Math.ceil(words.length / 2);
            const line1 = words.slice(0, mid).join(' ');
            const line2 = words.slice(mid).join(' ');
            signCtx.fillText(line1, centerX, centerY - 50);
            signCtx.fillText(line2, centerX, centerY + 50);
        }
    }
    
    // Clear shadow for final text
    signCtx.shadowBlur = 0;
    signCtx.shadowColor = 'transparent';
    
    // Final white text on top
    signCtx.fillStyle = '#FFFFFF';
    
    const words = text.split(' ');
    if (words.length <= 4) {
        // Single line for short text
        signCtx.fillText(text, centerX, centerY);
    } else {
        // Two lines for longer text
        const mid = Math.ceil(words.length / 2);
        const line1 = words.slice(0, mid).join(' ');
        const line2 = words.slice(mid).join(' ');
        signCtx.fillText(line1, centerX, centerY - 50);
        signCtx.fillText(line2, centerX, centerY + 50);
    }
    
    const signTexture = new THREE.CanvasTexture(signCanvas);
    // Make sign larger and positioned properly
    const signGeometry = new THREE.PlaneGeometry(10, 2.5); // Wider sign
    const signMaterial = new THREE.MeshBasicMaterial({
        map: signTexture,
        transparent: true,
        side: THREE.DoubleSide
    });
    
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    // Position sign higher and slightly forward
    sign.position.set(0, entranceHeight + 3, bodyRadius - 0.1);
    house.add(sign);

    // Sinister clown figure at entrance
    const clownTexture = new THREE.TextureLoader().load("clown.png");
    const clownMaterial = new THREE.SpriteMaterial({ 
        map: clownTexture, 
        transparent: true,
        opacity: 0
    });
    
    const clownSprite = new THREE.Sprite(clownMaterial);
    clownSprite.scale.set(3, 4, 1);
    clownSprite.position.set(0, entranceHeight/2 + 0.5, bodyRadius - 0.3);
    house.add(clownSprite);
    house.userData.clown = clownSprite;

    // Clown animation sequence
    setTimeout(() => {
        const duration = 2000;
        const startTime = performance.now();
        
        function animateClown(time) {
            const elapsed = time - startTime;
            const t = Math.min(elapsed / duration, 1);
            
            // Smooth fade in and slight scale
            clownSprite.material.opacity = t * 0.9;
            const scaleFactor = 1 + t * 0.15;
            clownSprite.scale.set(3 * scaleFactor, 4 * scaleFactor, 1);
            
            // Subtle floating motion
            clownSprite.position.y = (entranceHeight/2 + 0.5) + Math.sin(time * 0.002) * 0.05;
            
            if (t < 1) {
                requestAnimationFrame(animateClown);
            } else {
                // Hold for 3 seconds then fade out
                setTimeout(() => {
                    const fadeStart = performance.now();
                    function fadeClown(time) {
                        const elapsedFade = time - fadeStart;
                        const tFade = Math.min(elapsedFade / duration, 1);
                        clownSprite.material.opacity = 0.9 * (1 - tFade);
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

// ========== CREATE PERFECT LANDING AREA WITH SIDE FENCE ==========
function createPerfectLandingArea(width, depth, positionZ, isStart = true) {
    const landingArea = new THREE.Group();
    
    // Create high-quality sand texture with blood stains
    const sandTexture = createSandTextureWithBloodStains();
    
    // Main landing platform with detailed sand
    const platformGeometry = new THREE.PlaneGeometry(width, depth);
    const platformMaterial = new THREE.MeshPhongMaterial({
        map: sandTexture,
        color: 0xD2B48C,
        side: THREE.DoubleSide,
        shininess: 15,
        emissive: 0x222222,
        emissiveIntensity: 0.1
    });
    
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.rotation.x = -Math.PI / 2;
    platform.position.y = 0.01;
    landingArea.add(platform);
    
    // Detailed wooden border
    const borderWidth = 0.4;
    const borderGeometry = new THREE.BoxGeometry(width + borderWidth, 0.25, depth + borderWidth);
    
    // Create worn wood texture for border
    const borderCanvas = document.createElement('canvas');
    borderCanvas.width = 512;
    borderCanvas.height = 512;
    const borderCtx = borderCanvas.getContext('2d');
    
    // Worn wood pattern
    borderCtx.fillStyle = '#5D4037';
    borderCtx.fillRect(0, 0, 512, 512);
    
    // Wood grain
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const length = Math.random() * 200 + 100;
        const width = Math.random() * 4 + 2;
        
        borderCtx.strokeStyle = `rgba(${Math.floor(80 + Math.random() * 40)}, ${Math.floor(40 + Math.random() * 20)}, ${Math.floor(20 + Math.random() * 10)}, 0.9)`;
        borderCtx.lineWidth = width;
        borderCtx.beginPath();
        borderCtx.moveTo(x, y);
        borderCtx.lineTo(x + length * 0.8, y + length * 0.2);
        borderCtx.stroke();
    }
    
    // Add wear and tear
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 30 + 10;
        
        borderCtx.fillStyle = 'rgba(50, 30, 20, 0.5)';
        borderCtx.beginPath();
        borderCtx.ellipse(x, y, size, size * 0.3, Math.random() * Math.PI, 0, Math.PI * 2);
        borderCtx.fill();
    }
    
    const borderTexture = new THREE.CanvasTexture(borderCanvas);
    const borderMaterial = new THREE.MeshPhongMaterial({
        map: borderTexture,
        color: 0x5D4037,
        emissive: 0x221100,
        shininess: 20
    });
    
    const border = new THREE.Mesh(borderGeometry, borderMaterial);
    border.position.y = -0.12;
    landingArea.add(border);
    
    // Add side fence
    const fence = createSideFenceOnly(width, depth);
    fence.position.y = 0;
    landingArea.add(fence);
    
    // Elegant entrance marker
    const markerWidth = 3;
    const markerHeight = 0.2;
    const markerDepth = 0.8;
    
    const markerGeometry = new THREE.BoxGeometry(markerWidth, markerHeight, markerDepth);
    
    // Create glowing marker texture
    const markerCanvas = document.createElement('canvas');
    markerCanvas.width = 512;
    markerCanvas.height = 128;
    const markerCtx = markerCanvas.getContext('2d');
    
    const markerColor = isStart ? '#00FF00' : '#FF0000';
    const markerEmissive = isStart ? '#004400' : '#440000';
    
    // Glow effect
    const markerGradient = markerCtx.createLinearGradient(0, 0, 512, 0);
    markerGradient.addColorStop(0, '#000000');
    markerGradient.addColorStop(0.3, markerColor);
    markerGradient.addColorStop(0.7, markerColor);
    markerGradient.addColorStop(1, '#000000');
    
    markerCtx.fillStyle = markerGradient;
    markerCtx.fillRect(0, 0, 512, 128);
    
    // Pulsing effect lines
    for (let i = 0; i < 20; i++) {
        const x = (i / 20) * 512;
        markerCtx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
        markerCtx.fillRect(x, 0, 10, 128);
    }
    
    const markerTexture = new THREE.CanvasTexture(markerCanvas);
    const markerMaterial = new THREE.MeshPhongMaterial({
        map: markerTexture,
        color: isStart ? 0x00FF00 : 0xFF0000,
        emissive: isStart ? 0x004400 : 0x440000,
        transparent: true,
        opacity: 0.9
    });
    
    const entranceMarker = new THREE.Mesh(markerGeometry, markerMaterial);
    // Position marker at the BRIDGE SIDE
    entranceMarker.position.set(0, 0.15, -depth/2 + 0.4);
    landingArea.add(entranceMarker);
    
    // Add some scattered debris on the landing area for atmosphere
    const debrisCount = 15;
    for (let i = 0; i < debrisCount; i++) {
        const debrisType = Math.floor(Math.random() * 3);
        let debrisGeometry;
        
        if (debrisType === 0) {
            // Broken wood piece
            debrisGeometry = new THREE.BoxGeometry(
                Math.random() * 0.5 + 0.2,
                Math.random() * 0.1 + 0.05,
                Math.random() * 0.3 + 0.1
            );
        } else if (debrisType === 1) {
            // Rock
            debrisGeometry = new THREE.DodecahedronGeometry(Math.random() * 0.3 + 0.1, 0);
        } else {
            // Bone fragment
            debrisGeometry = new THREE.CylinderGeometry(
                0.05,
                0.1,
                Math.random() * 0.4 + 0.2,
                6
            );
        }
        
        const debrisMaterial = new THREE.MeshPhongMaterial({
            color: debrisType === 2 ? 0xF5F5F5 : 0x8B4513,
            shininess: 10
        });
        
        const debris = new THREE.Mesh(debrisGeometry, debrisMaterial);
        debris.position.set(
            (Math.random() - 0.5) * width * 0.8,
            0.05,
            (Math.random() - 0.5) * depth * 0.8
        );
        debris.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        landingArea.add(debris);
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

// Bridge lights - ORIGINAL CODE PATTERN
const lightGeometry = new THREE.SphereGeometry(0.1, 12, 12);
const lightColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
const bridgeLights = [];

function createLight(color) {
    const lightMaterial = new THREE.MeshBasicMaterial({ color: color, emissive: color });
    return new THREE.Mesh(lightGeometry, lightMaterial);
}

const spacing = 0.8;
const numLights = Math.floor(railLength / spacing);

// Left side lights - ORIGINAL PATTERN
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

// Right side lights - ORIGINAL PATTERN
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

// Middle lights - ORIGINAL PATTERN
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

// ========== CREATE CUBE BACKGROUND ENVIRONMENT ==========
function createCubeBackground() {
    const cubeSize = 200;
    const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    
    const materials = [];
    
    try {
        const textureLoader = new THREE.TextureLoader();
        
        materials.push(new THREE.MeshBasicMaterial({ 
            map: textureLoader.load('bg_right.jpg'),
            side: THREE.BackSide
        }));
        
        materials.push(new THREE.MeshBasicMaterial({ 
            map: textureLoader.load('bg_left.jpg'),
            side: THREE.BackSide
        }));
        
        materials.push(new THREE.MeshBasicMaterial({ 
            map: textureLoader.load('bg_up.jpg'),
            side: THREE.BackSide
        }));
        
        materials.push(new THREE.MeshBasicMaterial({ 
            map: textureLoader.load('bg_down.jpg'),
            side: THREE.BackSide
        }));
        
        materials.push(new THREE.MeshBasicMaterial({ 
            map: textureLoader.load('bg_front.jpg'),
            side: THREE.BackSide
        }));
        
        materials.push(new THREE.MeshBasicMaterial({ 
            map: textureLoader.load('bg_back.jpg'),
            side: THREE.BackSide
        }));
    } catch (error) {
        console.log("Error loading cube textures, using colors instead");
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
        for (let i = 0; i < 6; i++) {
            materials.push(new THREE.MeshBasicMaterial({ 
                color: colors[i],
                side: THREE.BackSide,
                transparent: true,
                opacity: 0.3
            }));
        }
    }
    
    const skybox = new THREE.Mesh(cubeGeometry, materials);
    skybox.position.y = cubeSize / 4;
    scene.add(skybox);
    
    return skybox;
}

// ========== CREATE CIRCUS HOUSES AND LANDING AREAS ==========
const finishZ = startZ - gapBetweenRows * (totalRows + 1);
const landingAreaLength = 15;

// Create cube background
const skybox = createCubeBackground();

// Start area: Landing Area -> House with "WELCOME TO BRIDGE GAME" sign
const startHouse = createCircusHouseWithSign("WELCOME TO BRIDGE GAME");
const startLandingArea = createPerfectLandingArea(panelWidth * 4, landingAreaLength, startZ + landingAreaLength/2, true);

// Position start house with door facing bridge
startHouse.position.set(0, 0.5, startZ + landingAreaLength + 12);
startHouse.rotation.y = Math.PI; // Rotate 180 degrees so door faces bridge

scene.add(startHouse);
scene.add(startLandingArea);

// Finish area: Bridge -> Landing Area -> House with "FINISH LINE" sign
const finishHouse = createCircusHouseWithSign("FINISH LINE");
const finishLandingArea = createPerfectLandingArea(panelWidth * 4, landingAreaLength, finishZ - landingAreaLength/2, false);

// Position finish house with door facing bridge
finishHouse.position.set(0, 0.5, finishZ - landingAreaLength - 12);
finishHouse.rotation.y = 0; // No rotation, door already faces bridge

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
let fallingObjects = [];
let brokenGlassPanels = new Set();
let isOnLandingArea = true;
let canStartQuiz = false;

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
    player.position.y = panelY + 1;
    
    // Check if player is at bridge entrance
    const distanceToBridge = Math.abs(player.position.z - startZ);
    if (distanceToBridge < 1.5 && Math.abs(player.position.x) < 1) {
        canStartQuiz = true;
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
                `Level ${currentGameLevel} - Pindutin ang SPACE BAR para magsimula`;
        } else {
            document.getElementById("info").innerHTML = 
                `Level ${currentGameLevel} - Gumamit ng W/A/S/D para lumakad`;
        }
    } else {
        const stepInLevel = totalStepsCompleted - currentLevelStartStep + 1;
        const levelText = `Level ${currentGameLevel} - Hakbang ${stepInLevel}/${stepsPerLevel}`;
        const clueText = hasClue ? "<br><span style='color:#00ff00'>TANDAAN ANG MUNTING SALAMIN!</span>" : "<br><span style='color:yellow'>WALANG CLUE - GOOD LUCK!</span>";
        
        document.getElementById("info").innerHTML = levelText + clueText;
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
    
    if (hasClue) {
        showAllSafeGlassesForCurrentLevel();
    }
    
    isOnLandingArea = false;
    player.position.set(0, panelY + 1, startZ);
    updateInfoText();
}

function stepForward(selection) {
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
            
            targetPanel.userData.isBroken = true;
            brokenGlassPanels.add(targetPanel);
            targetPanel.visible = false;
            
            if (targetPanel.children.length > 0) {
                targetPanel.remove(targetPanel.children[0]);
            }
            
            createBrokenGlassPieces(targetPanel);
            
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
    const numPieces = 8 + Math.floor(Math.random() * 4);
    const glassMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
    });
    
    for (let i = 0; i < numPieces; i++) {
        const pieceWidth = 0.2 + Math.random() * 0.3;
        const pieceDepth = 0.2 + Math.random() * 0.3;
        const pieceGeometry = new THREE.PlaneGeometry(pieceWidth, pieceDepth);
        
        const piece = new THREE.Mesh(pieceGeometry, glassMaterial);
        piece.position.copy(panel.position);
        piece.position.y = panelY + 0.05;
        piece.rotation.x = -Math.PI / 2;
        
        piece.rotation.z = Math.random() * Math.PI * 2;
        
        const explosionForce = 0.2;
        piece.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * explosionForce,
            Math.random() * 0.4 + 0.3,
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
            obj.userData.velocity.y -= 0.015;
            
            obj.position.x += obj.userData.velocity.x * 0.08;
            obj.position.y += obj.userData.velocity.y * 0.08;
            obj.position.z += obj.userData.velocity.z * 0.08;
            
            obj.rotation.x += obj.userData.rotationSpeed.x;
            obj.rotation.y += obj.userData.rotationSpeed.y;
            obj.rotation.z += obj.userData.rotationSpeed.z;
            
            if (obj.position.y < panelY - 5) {
                obj.material.opacity *= 0.95;
            }
            
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
    
    audio.pause();
    
    const fallSound = new Audio("Fail_Sound_Effect(256k).mp3");
    fallSound.volume = 0.5;
    fallSound.play().catch(e => console.log("Cannot play fall sound:", e));
    
    camera.position.copy(fallStartPosition);
    camera.position.y += 1.6;
    
    const midpointZ = (startZ + finishZ) / 2;
    const lookAtPoint = new THREE.Vector3(0, 15, midpointZ);
    camera.lookAt(lookAtPoint);
    
    let fallSpeed = 0.08;
    const gravity = 0.0018;
    let fallDistance = 0;
    let playerRotation = 0;
    let cameraLookUpAngle = Math.PI / 8;
    
    const bridgePosition = new THREE.Vector3(0, 5, midpointZ);
    
    function fall() {
        if (gameOver) {
            const currentTime = Date.now();
            const elapsed = currentTime - fallStartTime;
            const t = Math.min(elapsed / fallDuration, 1);
            
            if (t < 1) {
                fallSpeed += gravity;
                
                player.position.y -= fallSpeed;
                fallDistance += fallSpeed;
                
                playerRotation -= 0.012;
                player.rotation.z = playerRotation;
                
                camera.position.y = player.position.y + 1.6;
                
                cameraLookUpAngle += 0.0015;
                
                const lookAtY = 15 + (cameraLookUpAngle * 40);
                const lookAtDistance = 25 - (fallDistance * 0.3);
                
                camera.lookAt(
                    bridgePosition.x,
                    lookAtY,
                    bridgePosition.z - lookAtDistance
                );
                
                updateFallingObjects();
                
                if (elapsed > 800) {
                    const shakeIntensity = Math.min((fallSpeed - 0.08) * 8, 0.08);
                    camera.position.x += (Math.random() - 0.5) * shakeIntensity;
                    camera.position.z += (Math.random() - 0.5) * shakeIntensity;
                }
                
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
                const impactSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-heavy-falling-impact-1107.mp3");
                impactSound.volume = 0.7;
                impactSound.play().catch(e => console.log("Cannot play impact sound:", e));
                
                let shakeCount = 0;
                const maxShakes = 6;
                
                function finalShake() {
                    if (shakeCount >= maxShakes) {
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
    
    if (event.code === "Space" && isOnLandingArea && canStartQuiz) {
        event.preventDefault();
        startQuizAndBridge();
        return;
    }
    
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

function handleMovement() {
    if (!isOnLandingArea || isAnimating || gameOver) return;
    
    let moveX = 0;
    let moveZ = 0;
    
    if (keysPressed["ArrowLeft"] || keysPressed["KeyA"]) {
        moveX -= 1;
    }
    if (keysPressed["ArrowRight"] || keysPressed["KeyD"]) {
        moveX += 1;
    }
    
    if (keysPressed["ArrowUp"] || keysPressed["KeyW"]) {
        moveZ -= 1;
    }
    if (keysPressed["ArrowDown"] || keysPressed["KeyS"]) {
        moveZ += 1;
    }
    
    if (moveX !== 0 && moveZ !== 0) {
        moveX *= 0.7071;
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

    handleMovement();

    // ORIGINAL BRIDGE LIGHTS ANIMATION - Exact same as original code
    bridgeLights.forEach(light => {
        const scale = 0.8 + 0.2 * Math.abs(Math.sin(Date.now() * 0.005 + light.position.z));
        light.scale.set(scale, scale, scale);
    });

    // Animate circus house elements
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
        
        if (house.userData.clown) {
            const time = Date.now() * 0.001;
            if (house.userData.clown.material.opacity > 0) {
                house.userData.clown.position.y = 3.5 + Math.sin(time) * 0.05;
            }
        }
        
        // Animate flags
        house.children.forEach(child => {
            if (child.userData && child.userData.waveSpeed !== undefined) {
                const time = Date.now() * 0.001;
                child.rotation.z = Math.sin(time * child.userData.waveSpeed + child.userData.waveOffset) * 0.1;
            }
        });
    });

    const startQuizBtn = document.getElementById("btnStartQuiz");
    if (isOnLandingArea && canStartQuiz) {
        startQuizBtn.style.display = 'block';
    } else {
        startQuizBtn.style.display = 'none';
    }

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
    isOnLandingArea = true;
    player.position.set(0, panelY + 1, startZ + landingAreaLength/2);
    updateInfoText();
    
    shownClueForThisLevel = false;
});

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();