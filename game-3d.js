/**
 * 贝比岛 3D - 核心游戏逻辑
 * 使用 Three.js 创建 3D 场景
 */

// ==================== 全局变量 ====================

let scene, camera, renderer;
let player, island;
let decorations = [];
let playerGender = 'female';
let playerName = '玩家';
let playerRotation = 0;
let playerPosition = { x: 0, z: 0 };
let game3DState;

// ==================== 游戏状态管理 ====================

class GameState3D {
    constructor() {
        this.load();
    }

    load() {
        const saved = localStorage.getItem('beibi3dSave');
        if (saved) {
            this.player = data.player || {
                name: '玩家',
                gender: 'female',
                level: 1,
                exp: 0,
                coins: 1000,
                gems: 100
            };
        } else {
            this.player = {
                name: '玩家',
                gender: 'female',
                level: 1,
                exp: 0,
                coins: 1000,
                gems: 100
            };
        }
    }

    save() {
        localStorage.setItem('beibi3dSave', JSON.stringify({
            player: this.player
        }));
    }
}

// ==================== 初始化 Three.js ====================

function initThree() {
    console.log('Initializing Three.js...');

    const container = document.getElementById('canvas-container');
    if (!container) {
        console.error('canvas-container not found!');
        return;
    }

    container.innerHTML = '';

    // 场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 50, 200);

    // 相机
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 15, 25);
    camera.lookAt(0, 0, 0);

    // 渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x98FB98, 0.4);
    scene.add(hemisphereLight);

    // 创建场景物体
    createIsland();
    createPlayer();
    createDecorations();

    // 事件监听
    window.addEventListener('resize', onWindowResize, false);
    setupCameraControl();
    updateKeyboardMovement();

    // 开始渲染
    animate();

    console.log('✅ Three.js ready!');
}

function createIsland() {
    // 岛屿
    const islandGeometry = new THREE.CylinderGeometry(30, 35, 5, 8);
    const islandMaterial = new THREE.MeshStandardMaterial({ color: 0x98FB98, roughness: 0.8 });
    island = new THREE.Mesh(islandGeometry, islandMaterial);
    island.position.y = -2.5;
    island.receiveShadow = true;
    scene.add(island);

    // 沙滩
    const beachGeometry = new THREE.CylinderGeometry(32, 37, 1, 8);
    const beachMaterial = new THREE.MeshStandardMaterial({ color: 0xDEB887, roughness: 1 });
    const beach = new THREE.Mesh(beachGeometry, beachMaterial);
    beach.position.y = -0.5;
    beach.receiveShadow = true;
    scene.add(beach);

    // 海洋
    const oceanGeometry = new THREE.PlaneGeometry(500, 500);
    const oceanMaterial = new THREE.MeshStandardMaterial({
        color: 0x1E90FF,
        roughness: 0.2,
        transparent: true,
        opacity: 0.8
    });
    const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -3;
    scene.add(ocean);
}

function createPlayer() {
    const playerGroup = new THREE.Group();

    // 身体
    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: playerGender === 'female' ? 0xff69b4 : 0x4169e1
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    playerGroup.add(body);

    // 头部
    const headGeometry = new THREE.SphereGeometry(0.6, 8, 8);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.3;
    head.castShadow = true;
    playerGroup.add(head);

    // 眼睛
    const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 2.4, 0.5);
    playerGroup.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 2.4, 0.5);
    playerGroup.add(rightEye);

    player = playerGroup;
    player.position.set(0, 0, 0);
    scene.add(player);
}

function createDecorations() {
    // 树木
    for (let i = 0; i < 5; i++) {
        createTree(Math.cos(i * Math.PI * 2 / 5) * 20, Math.sin(i * Math.PI * 2 / 5) * 20);
    }

    // 花朵
    for (let i = 0; i < 20; i++) {
        createFlower((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40);
    }

    // 石头
    for (let i = 0; i < 8; i++) {
        createRock((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50);
    }
}

function createTree(x, z) {
    const treeGroup = new THREE.Group();
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 3, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1.5;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    const leavesGeometry = new THREE.ConeGeometry(2, 4, 8);
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 5;
    leaves.castShadow = true;
    treeGroup.add(leaves);

    treeGroup.position.set(x, 0, z);
    scene.add(treeGroup);
    decorations.push(treeGroup);
}

function createFlower(x, z) {
    const flowerGroup = new THREE.Group();
    const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 0.25;
    flowerGroup.add(stem);

    const petalGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const colors = [0xff69b4, 0xffd700, 0xff6347, 0x9370db, 0x00bfff];
    const petalMaterial = new THREE.MeshStandardMaterial({
        color: colors[Math.floor(Math.random() * colors.length)]
    });
    const petal = new THREE.Mesh(petalGeometry, petalMaterial);
    petal.position.y = 0.5;
    flowerGroup.add(petal);

    flowerGroup.position.set(x, 0, z);
    scene.add(flowerGroup);
    decorations.push(flowerGroup);
}

function createRock(x, z) {
    const rockGeometry = new THREE.DodecahedronGeometry(Math.random() * 0.5 + 0.3);
    const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    rock.position.set(x, 0.3, z);
    rock.castShadow = true;
    scene.add(rock);
    decorations.push(rock);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// ==================== 相机控制 ====================

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let cameraAngle = 0;
let cameraDistance = 20;
let cameraHeight = 12;
let smoothCameraPosition = { x: 0, y: 0, z: 0 };

function setupCameraControl() {
    const canvas = renderer.domElement;

    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        cameraAngle -= (e.clientX - previousMousePosition.x) * 0.01;
        cameraHeight = Math.max(5, Math.min(25, cameraHeight - (e.clientY - previousMousePosition.y) * 0.1));
        updateCameraPosition();
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener('mouseup', () => { isDragging = false; });
    canvas.addEventListener('wheel', (e) => {
        cameraDistance = Math.max(10, Math.min(40, cameraDistance + e.deltaY * 0.05));
        updateCameraPosition();
    });

    updateCameraPosition();
}

function updateCameraPosition() {
    const targetX = playerPosition.x + Math.sin(cameraAngle) * cameraDistance;
    const targetZ = playerPosition.z + Math.cos(cameraAngle) * cameraDistance;
    smoothCameraPosition.x += (targetX - smoothCameraPosition.x) * 0.1;
    smoothCameraPosition.z += (targetZ - smoothCameraPosition.z) * 0.1;
    smoothCameraPosition.y += (cameraHeight - smoothCameraPosition.y) * 0.1;
    camera.position.set(smoothCameraPosition.x, smoothCameraPosition.y, smoothCameraPosition.z);
    camera.lookAt(playerPosition.x, playerPosition.y + 2, playerPosition.z);
}

// ==================== 玩家控制 ====================

const keys = { w: false, a: false, s: false, d: false };

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'w') keys.w = true;
    if (key === 's') keys.s = true;
    if (key === 'a') keys.a = true;
    if (key === 'd') keys.d = true;
    if (key === 'e') interact();
});

window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'w') keys.w = false;
    if (key === 's') keys.s = false;
    if (key === 'a') keys.a = false;
    if (key === 'd') keys.d = false;
});

function updateKeyboardMovement() {
    const speed = 0.5;
    const strafeSpeed = 0.4;

    if (keys.w) {
        playerPosition.x -= Math.sin(playerRotation) * speed;
        playerPosition.z -= Math.cos(playerRotation) * speed;
    }
    if (keys.s) {
        playerPosition.x += Math.sin(playerRotation) * speed;
        playerPosition.z += Math.cos(playerRotation) * speed;
    }
    if (keys.a) {
        playerPosition.x -= Math.cos(playerRotation) * strafeSpeed;
        playerPosition.z += Math.sin(playerRotation) * strafeSpeed;
    }
    if (keys.d) {
        playerPosition.x += Math.cos(playerRotation) * strafeSpeed;
        playerPosition.z -= Math.sin(playerRotation) * strafeSpeed;
    }

    player.position.x = playerPosition.x;
    player.position.z = playerPosition.z;
    player.rotation.y = playerRotation;
    updateCameraPosition();

    requestAnimationFrame(updateKeyboardMovement);
}

function moveForward() {
    const speed = 0.5;
    playerPosition.x -= Math.sin(playerRotation) * speed;
    playerPosition.z -= Math.cos(playerRotation) * speed;
    player.position.x = playerPosition.x;
    player.position.z = playerPosition.z;
    updateCameraPosition();
}

function moveBackward() {
    const speed = 0.5;
    playerPosition.x += Math.sin(playerRotation) * speed;
    playerPosition.z += Math.cos(playerRotation) * speed;
    player.position.x = playerPosition.x;
    player.position.z = playerPosition.z;
    updateCameraPosition();
}

function strafeLeft() {
    const strafeSpeed = 0.4;
    playerPosition.x -= Math.cos(playerRotation) * strafeSpeed;
    playerPosition.z += Math.sin(playerRotation) * strafeSpeed;
    player.position.x = playerPosition.x;
    player.position.z = playerPosition.z;
    updateCameraPosition();
}

function strafeRight() {
    const strafeSpeed = 0.4;
    playerPosition.x += Math.cos(playerRotation) * strafeSpeed;
    playerPosition.z -= Math.sin(playerRotation) * strafeSpeed;
    player.position.x = playerPosition.x;
    player.position.z = playerPosition.z;
    updateCameraPosition();
}

function rotateLeft() { playerRotation += 0.1; player.rotation.y = playerRotation; }
function rotateRight() { playerRotation -= 0.1; player.rotation.y = playerRotation; }

function interact() {
    const interactables = decorations.filter(dec => {
        const dist = Math.sqrt(Math.pow(dec.position.x - playerPosition.x, 2) + Math.pow(dec.position.z - playerPosition.z, 2));
        return dist < 3;
    });

    if (interactables.length > 0) {
        showNotification('✨ 发现了有趣的东西！');
        if (game3DState) {
            game3DState.player.coins += 10;
            updateUI();
        }
    } else {
        showNotification('附近没有什么可以互动的...');
    }
}

// ==================== UI 功能 ====================

function updateUI() {
    if (!game3DState) return;
    document.getElementById('player-name-display').textContent = game3DState.player.name;
    document.getElementById('player-avatar').textContent = game3DState.player.gender === 'female' ? '👧' : '👦';
    document.getElementById('player-level').textContent = game3DState.player.level;
    document.getElementById('coin-display').textContent = game3DState.player.coins;
    document.getElementById('gem-display').textContent = game3DState.player.gems;
    document.getElementById('exp-display').textContent = game3DState.player.exp;
}

function updateLoadingProgress(progress) {
    const progressBar = document.getElementById('loading-progress');
    if (progressBar) progressBar.style.width = progress + '%';
}

function setGender(gender) {
    playerGender = gender;
    document.querySelectorAll('.gender-btn').forEach(btn => {
        btn.classList.remove('active');
        if ((gender === 'female' && btn.textContent.includes('女孩')) ||
            (gender === 'male' && btn.textContent.includes('男孩'))) {
            btn.classList.add('active');
            btn.style.background = '#667eea';
            btn.style.color = 'white';
            btn.style.borderColor = '#667eea';
        } else {
            btn.style.background = 'white';
            btn.style.borderColor = '#ddd';
        }
    });
    document.getElementById('preview-avatar').textContent = gender === 'female' ? '👧' : '👦';
}

function startGame() {
    console.log('Start game clicked!');

    const nameInput = document.getElementById('player-name');
    const name = nameInput ? nameInput.value.trim() : '';
    if (name) playerName = name;

    console.log('Player name:', playerName, 'Gender:', playerGender);

    game3DState = new GameState3D();
    game3DState.player.name = playerName;
    game3DState.player.gender = playerGender;
    game3DState.save();

    console.log('Game state saved');

    const loginScreen = document.getElementById('login-screen');
    const uiOverlay = document.getElementById('ui-overlay');

    if (loginScreen) loginScreen.classList.remove('active');
    if (uiOverlay) uiOverlay.style.display = 'block';

    updateUI();

    showNotification(`🏝️ 欢迎来到贝比岛 3D, ${playerName}!`);
}

function openShop() {
    const items = [
        { icon: '🌲', name: '松树', price: 100 },
        { icon: '🌸', name: '樱花树', price: 200 },
        { icon: '🪨', name: '装饰石', price: 50 },
        { icon: '🌺', name: '花坛', price: 80 },
        { icon: '⛲', name: '喷泉', price: 500 },
        { icon: '🏠', name: '小屋', price: 1000 }
    ];

    let html = '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">';
    items.forEach(item => {
        html += `<div style="background: #f5f5f5; padding: 15px; border-radius: 10px; text-align: center;">
            <div style="font-size: 2em;">${item.icon}</div>
            <div style="font-weight: bold; margin: 5px 0;">${item.name}</div>
            <div style="color: #f39c12;">💰 ${item.price}</div>
            <button onclick="buyItem('${item.name}', ${item.price})" style="margin-top: 10px; padding: 5px 15px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">购买</button>
        </div>`;
    });
    html += '</div>';
    showModal('🏪 商店', html);
}

function buyItem(name, price) {
    if (game3DState.player.coins >= price) {
        game3DState.player.coins -= price;
        game3DState.save();
        updateUI();
        showNotification(`✅ 购买了 ${name}!`);
        if (name === '松树') createTree((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40);
        if (name === '花坛') createFlower((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40);
        if (name === '装饰石') createRock((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40);
        showModal('🏪 商店', '<div style="text-align: center; padding: 20px;">✅ 购买成功！</div>');
    } else {
        showNotification('❌ 金币不足!');
    }
}

function openBag() { showModal('🎒 背包', '<div style="text-align: center; color: #888; padding: 40px;">背包是空的</div>'); }
function openQuests() { showModal('📋 任务列表', '<div style="text-align: center; color: #888; padding: 40px;">暂无任务</div>'); }
function openFriends() { showModal('👥 好友列表', '<div style="text-align: center; color: #888; padding: 40px;">暂无好友</div>'); }

function openSettings() {
    showModal('⚙️ 设置', `
        <div style="display: flex; flex-direction: column; gap: 15px;">
            <button onclick="showNotification('🎵 背景音乐已切换')" style="padding: 15px; background: #f5f5f5; border: none; border-radius: 10px; cursor: pointer; text-align: left;">🎵 背景音乐：开启</button>
            <button onclick="showNotification('🔊 音效已切换')" style="padding: 15px; background: #f5f5f5; border: none; border-radius: 10px; cursor: pointer; text-align: left;">🔊 音效：开启</button>
            <button onclick="if(confirm('确定清除数据？')) { localStorage.removeItem('beibi3dSave'); location.reload(); }" style="padding: 15px; background: #e74c3c; color: white; border: none; border-radius: 10px; cursor: pointer; text-align: left;">🗑️ 清除游戏数据</button>
        </div>
    `);
}

function showModal(title, content) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = content;
    document.getElementById('modal-template').classList.add('active');
}

function closeModal() {
    document.getElementById('modal-template').classList.remove('active');
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// 点击弹窗外部关闭
document.getElementById('modal-template').addEventListener('click', (e) => {
    if (e.target.id === 'modal-template') closeModal();
});

// ==================== 页面加载 ====================

window.addEventListener('load', () => {
    console.log('Page loaded');

    if (typeof THREE === 'undefined') {
        document.getElementById('loading-screen').innerHTML = '<div style="color:white;text-align:center;padding:20px;"><h2>❌ Three.js 加载失败</h2><button onclick="location.reload()" style="padding:10px 20px;margin-top:20px;">重试</button></div>';
        return;
    }

    console.log('Three.js:', THREE.REVISION);
    initThree();

    let progress = 0;
    const loadInterval = setInterval(() => {
        progress += 10;
        updateLoadingProgress(progress);
        if (progress >= 100) {
            clearInterval(loadInterval);
            setTimeout(() => {
                document.getElementById('loading-screen').style.display = 'none';
                document.getElementById('login-screen').classList.add('active');
                console.log('Game ready!');
            }, 500);
        }
    }, 200);
});
