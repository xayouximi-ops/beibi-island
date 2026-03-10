/**
 * 贝比岛 3D - 核心游戏逻辑
 * 使用 Three.js 创建 3D 场景
 */

// ==================== 全局变量 ====================

let scene, camera, renderer, controls;
let player, island, decorations = [];
let playerGender = 'female';
let playerName = '玩家';
let gameState = {
    level: 1,
    exp: 0,
    coins: 1000,
    gems: 100
};

// ==================== 游戏状态管理 ====================

class GameState3D {
    constructor() {
        this.load();
    }

    load() {
        const saved = localStorage.getItem('beibi3dSave');
        if (saved) {
            const data = JSON.parse(saved);
            this.player = data.player || {
                name: '玩家',
                gender: 'female',
                level: 1,
                exp: 0,
                coins: 1000,
                gems: 100
            };
            this.island = data.island || { decorations: [] };
        } else {
            this.player = {
                name: '玩家',
                gender: 'female',
                level: 1,
                exp: 0,
                coins: 1000,
                gems: 100
            };
            this.island = { decorations: [] };
        }
    }

    save() {
        localStorage.setItem('beibi3dSave', JSON.stringify({
            player: this.player,
            island: this.island
        }));
    }
}

let game3DState;

// ==================== 初始化 Three.js ====================

function initThree() {
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 50, 200);

    // 创建相机
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 20);

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // 创建控制器
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;
    controls.minDistance = 10;
    controls.maxDistance = 50;

    // 添加光源
    addLights();

    // 创建岛屿
    createIsland();

    // 创建玩家
    createPlayer();

    // 添加装饰物
    createDecorations();

    // 窗口大小调整
    window.addEventListener('resize', onWindowResize);

    // 开始渲染循环
    animate();
}

function addLights() {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // 平行光（太阳光）
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);

    // 半球光
    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x98FB98, 0.4);
    scene.add(hemisphereLight);
}

function createIsland() {
    // 创建岛屿地面
    const islandGeometry = new THREE.CylinderGeometry(30, 35, 5, 8);
    const islandMaterial = new THREE.MeshStandardMaterial({
        color: 0x98FB98,
        roughness: 0.8
    });
    island = new THREE.Mesh(islandGeometry, islandMaterial);
    island.position.y = -2.5;
    island.receiveShadow = true;
    scene.add(island);

    // 创建沙滩
    const beachGeometry = new THREE.CylinderGeometry(32, 37, 1, 8);
    const beachMaterial = new THREE.MeshStandardMaterial({
        color: 0xDEB887,
        roughness: 1
    });
    const beach = new THREE.Mesh(beachGeometry, beachMaterial);
    beach.position.y = -0.5;
    beach.receiveShadow = true;
    scene.add(beach);

    // 创建海洋
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
    // 创建简化的 3D 玩家角色
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
    player.position.y = 0;
    scene.add(player);
}

function createDecorations() {
    // 创建树木
    for (let i = 0; i < 5; i++) {
        createTree(
            Math.cos(i * Math.PI * 2 / 5) * 20,
            Math.sin(i * Math.PI * 2 / 5) * 20
        );
    }

    // 创建花朵
    for (let i = 0; i < 20; i++) {
        createFlower(
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 40
        );
    }

    // 创建石头
    for (let i = 0; i < 8; i++) {
        createRock(
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 50
        );
    }
}

function createTree(x, z) {
    const treeGroup = new THREE.Group();

    // 树干
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 3, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1.5;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // 树叶
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

    // 花茎
    const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 0.25;
    flowerGroup.add(stem);

    // 花瓣
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
    controls.update();
    renderer.render(scene, camera);
}

// ==================== 玩家控制 ====================

let playerRotation = 0;
let playerPosition = { x: 0, z: 0 };

function moveForward() {
    const speed = 0.5;
    playerPosition.x -= Math.sin(playerRotation) * speed;
    playerPosition.z -= Math.cos(playerRotation) * speed;
    player.position.x = playerPosition.x;
    player.position.z = playerPosition.z;
}

function moveBackward() {
    const speed = 0.5;
    playerPosition.x += Math.sin(playerRotation) * speed;
    playerPosition.z += Math.cos(playerRotation) * speed;
    player.position.x = playerPosition.x;
    player.position.z = playerPosition.z;
}

function rotateLeft() {
    playerRotation += 0.1;
    player.rotation.y = playerRotation;
}

function rotateRight() {
    playerRotation -= 0.1;
    player.rotation.y = playerRotation;
}

function interact() {
    // 检测附近的可互动对象
    const interactables = decorations.filter(dec => {
        const dist = Math.sqrt(
            Math.pow(dec.position.x - playerPosition.x, 2) +
            Math.pow(dec.position.z - playerPosition.z, 2)
        );
        return dist < 3;
    });

    if (interactables.length > 0) {
        showNotification('✨ 发现了有趣的东西！');
        game3DState.player.coins += 10;
        updateUI();
    } else {
        showNotification('附近没有什么可以互动的...');
    }
}

// ==================== UI 功能 ====================

function updateUI() {
    document.getElementById('player-name-display').textContent = game3DState.player.name;
    document.getElementById('player-avatar').textContent = game3DState.player.gender === 'female' ? '👧' : '👦';
    document.getElementById('player-level').textContent = game3DState.player.level;
    document.getElementById('coin-display').textContent = game3DState.player.coins;
    document.getElementById('gem-display').textContent = game3DState.player.gems;
    document.getElementById('exp-display').textContent = game3DState.player.exp;
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
            btn.style.color = '';
            btn.style.borderColor = '#ddd';
        }
    });
    document.getElementById('preview-avatar').textContent = gender === 'female' ? '👧' : '👦';
}

function startGame() {
    const name = document.getElementById('player-name').value.trim();
    if (name) {
        playerName = name;
    }

    game3DState = new GameState3D();
    game3DState.player.name = playerName;
    game3DState.player.gender = playerGender;
    game3DState.save();

    document.getElementById('login-screen').style.display = 'none';
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
        html += `
            <div style="background: #f5f5f5; padding: 15px; border-radius: 10px; text-align: center;">
                <div style="font-size: 2em;">${item.icon}</div>
                <div style="font-weight: bold; margin: 5px 0;">${item.name}</div>
                <div style="color: #f39c12;">💰 ${item.price}</div>
                <button onclick="buyItem('${item.name}', ${item.price})" style="margin-top: 10px; padding: 5px 15px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">购买</button>
            </div>
        `;
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

        // 添加装饰物到岛屿
        if (name === '松树') createTree((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40);
        if (name === '花坛') createFlower((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40);
        if (name === '装饰石') createRock((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40);
    } else {
        showNotification('❌ 金币不足!');
    }
}

function openBag() {
    showModal('🎒 背包', '<div style="text-align: center; color: #888;">背包是空的</div>');
}

function openQuests() {
    const quests = [
        { name: '装饰岛屿', desc: '在岛屿上放置 3 个装饰物', reward: 100 },
        { name: '探索岛屿', desc: '环绕岛屿一周', reward: 50 },
        { name: '收集金币', desc: '收集 100 金币', reward: 200 }
    ];

    let html = '<div style="display: flex; flex-direction: column; gap: 15px;">';
    quests.forEach(quest => {
        html += `
            <div style="background: #f5f5f5; padding: 15px; border-radius: 10px;">
                <div style="font-weight: bold; color: #667eea;">${quest.name}</div>
                <div style="color: #888; font-size: 0.9em; margin: 5px 0;">${quest.desc}</div>
                <div style="color: #f39c12;">奖励：💰 ${quest.reward}</div>
            </div>
        `;
    });
    html += '</div>';

    showModal('📋 任务列表', html);
}

function openFriends() {
    const friends = [
        { name: '小樱', level: 5, online: true },
        { name: '小明', level: 8, online: false },
        { name: '美美', level: 3, online: true }
    ];

    let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';
    friends.forEach(friend => {
        html += `
            <div style="background: #f5f5f5; padding: 15px; border-radius: 10px; display: flex; align-items: center; gap: 15px;">
                <div style="font-size: 2em;">${friend.online ? '🟢' : '⚪'} 👤</div>
                <div style="flex: 1;">
                    <div style="font-weight: bold;">${friend.name}</div>
                    <div style="color: #888; font-size: 0.9em;">Lv.${friend.level}</div>
                </div>
                <button style="padding: 5px 15px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">拜访</button>
            </div>
        `;
    });
    html += '</div>';

    showModal('👥 好友列表', html);
}

function openSettings() {
    const html = `
        <div style="display: flex; flex-direction: column; gap: 15px;">
            <button onclick="toggleMusic()" style="padding: 15px; background: #f5f5f5; border: none; border-radius: 10px; cursor: pointer; text-align: left;">🎵 背景音乐：开启</button>
            <button onclick="toggleSound()" style="padding: 15px; background: #f5f5f5; border: none; border-radius: 10px; cursor: pointer; text-align: left;">🔊 音效：开启</button>
            <button onclick="clearData()" style="padding: 15px; background: #e74c3c; color: white; border: none; border-radius: 10px; cursor: pointer; text-align: left;">🗑️ 清除游戏数据</button>
        </div>
    `;
    showModal('⚙️ 设置', html);
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

function toggleMusic() {
    showNotification('🎵 背景音乐已切换');
}

function toggleSound() {
    showNotification('🔊 音效已切换');
}

function clearData() {
    if (confirm('确定要清除所有游戏数据吗？此操作不可恢复！')) {
        localStorage.removeItem('beibi3dSave');
        location.reload();
    }
}

// ==================== 加载流程 ====================

window.addEventListener('load', () => {
    // 模拟加载
    let progress = 0;
    const progressBar = document.getElementById('loading-progress');

    const loadInterval = setInterval(() => {
        progress += 10;
        progressBar.style.width = progress + '%';

        if (progress >= 100) {
            clearInterval(loadInterval);
            setTimeout(() => {
                document.getElementById('loading-screen').style.display = 'none';
                document.getElementById('login-screen').style.display = 'flex';
                initThree();
            }, 500);
        }
    }, 200);
});

// 点击弹窗外部关闭
document.getElementById('modal-template').addEventListener('click', (e) => {
    if (e.target.id === 'modal-template') {
        closeModal();
    }
});
