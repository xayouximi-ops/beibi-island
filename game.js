/**
 * 贝比岛 - 核心游戏逻辑
 */

// ==================== 游戏数据 ====================

// 宠物数据库
const PET_DATABASE = [
    { id: 1, name: "咪咪", icon: "🐱", type: "猫", rarity: "R" },
    { id: 2, name: "汪汪", icon: "🐶", type: "狗", rarity: "R" },
    { id: 3, name: "啾啾", icon: "🐦", type: "鸟", rarity: "R" },
    { id: 4, name: "蹦蹦", icon: "🐰", type: "兔", rarity: "SR" },
    { id: 5, name: "滚滚", icon: "🐼", type: "熊猫", rarity: "SR" },
    { id: 6, name: "狮王", icon: "🦁", type: "狮子", rarity: "SSR" },
    { id: 7, name: "独角兽", icon: "🦄", type: "神兽", rarity: "SSR" },
    { id: 8, name: "小龙", icon: "🐲", type: "龙", rarity: "SSR" },
];

// 服装数据库
const CLOTHING_DATABASE = [
    { id: 1, name: "初始服装", icon: "👕", rarity: "R", price: 0 },
    { id: 2, name: "红色连衣裙", icon: "👗", rarity: "R", price: 500 },
    { id: 3, name: "蓝色西装", icon: "👔", rarity: "R", price: 500 },
    { id: 4, name: "粉色和服", icon: "👘", rarity: "SR", price: 1000 },
    { id: 5, name: "紫色礼服", icon: "👑", rarity: "SR", price: 1500 },
    { id: 6, name: "金色华服", icon: "✨", rarity: "SSR", price: 3000 },
];

// 家具数据库
const FURNITURE_DATABASE = [
    { id: 1, name: "小花", icon: "🌸", price: 100 },
    { id: 2, name: "树木", icon: "🌳", price: 200 },
    { id: 3, name: "长椅", icon: "🪑", price: 300 },
    { id: 4, name: "喷泉", icon: "⛲", price: 500 },
    { id: 5, name: "小屋", icon: "🏠", price: 1000 },
];

// 任务数据库
const QUEST_DATABASE = [
    { id: 1, name: "新手引导", desc: "完成新手引导", reward: 500, type: "tutorial" },
    { id: 2, name: "每日登录", desc: "每日登录游戏", reward: 100, type: "daily" },
    { id: 3, name: "装饰岛屿", desc: "装饰你的岛屿 (0/3)", reward: 300, type: "decorate", target: 3 },
    { id: 4, name: "收集宠物", desc: "收集宠物 (0/2)", reward: 500, type: "pet", target: 2 },
    { id: 5, name: "拜访好友", desc: "拜访好友岛屿 (0/1)", reward: 200, type: "visit", target: 1 },
    { id: 6, name: "小游戏达人", desc: "完成小游戏 (0/3)", reward: 400, type: "minigame", target: 3 },
];

// 好友数据库 (NPC)
const NPC_FRIENDS = [
    { id: 1, name: "小樱", avatar: "👧", level: 5 },
    { id: 2, name: "小明", avatar: "👦", level: 8 },
    { id: 3, name: "美美", avatar: "👧", level: 3 },
    { id: 4, name: "阿强", avatar: "👦", level: 10 },
    { id: 5, name: "莉莉", avatar: "👧", level: 6 },
];

// ==================== 游戏状态 ====================

class GameState {
    constructor() {
        this.load();
    }

    load() {
        const saved = localStorage.getItem('beibiSave');
        if (saved) {
            const data = JSON.parse(saved);
            this.player = data.player || {
                name: "玩家",
                avatar: "👧",
                gender: "female",
                hair: "👧",
                color: "#ff6b6b",
                level: 1,
                exp: 0,
                coins: 1000,
                gems: 100,
                stamina: 100,
                maxStamina: 100
            };
            this.inventory = data.inventory || {
                clothing: [1],
                furniture: [],
                pets: []
            };
            this.equipped = data.equipped || {
                clothing: 1
            };
            this.island = data.island || {
                decorations: []
            };
            this.quests = data.quests || [];
            this.friends = data.friends || [];
            this.lastLogin = data.lastLogin || null;
        } else {
            this.player = {
                name: "玩家",
                avatar: "👧",
                gender: "female",
                hair: "👧",
                color: "#ff6b6b",
                level: 1,
                exp: 0,
                coins: 1000,
                gems: 100,
                stamina: 100,
                maxStamina: 100
            };
            this.inventory = {
                clothing: [1],
                furniture: [],
                pets: []
            };
            this.equipped = {
                clothing: 1
            };
            this.island = {
                decorations: []
            };
            this.quests = [];
            this.friends = [];
            this.lastLogin = null;
        }
    }

    save() {
        localStorage.setItem('beibiSave', JSON.stringify({
            player: this.player,
            inventory: this.inventory,
            equipped: this.equipped,
            island: this.island,
            quests: this.quests,
            friends: this.friends,
            lastLogin: this.lastLogin
        }));
    }

    addExp(amount) {
        this.player.exp += amount;
        const expNeeded = this.player.level * 100;
        if (this.player.exp >= expNeeded) {
            this.player.exp -= expNeeded;
            this.player.level++;
            showNotification(`🎉 升级了！当前等级：${this.player.level}`);
        }
        this.updateDisplay();
        this.save();
    }

    addCoins(amount) {
        this.player.coins += amount;
        this.updateDisplay();
        this.save();
    }

    addGems(amount) {
        this.player.gems += amount;
        this.updateDisplay();
        this.save();
    }

    updateDisplay() {
        document.getElementById('coin-display').textContent = this.player.coins;
        document.getElementById('gem-display').textContent = this.player.gems;
        document.getElementById('exp-display').textContent = this.player.exp;
        document.getElementById('player-level').textContent = this.player.level;
        document.getElementById('display-name').textContent = this.player.name;
        document.getElementById('display-avatar').textContent = this.player.avatar;
    }
}

// ==================== 全局变量 ====================

let gameState;
let currentMinigame = null;

// ==================== 角色创建 ====================

function setGender(gender) {
    document.querySelectorAll('.gender-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.gender === gender);
    });
    gameState.player.gender = gender;
    gameState.player.avatar = gender === 'female' ? '👧' : '👦';
    updatePreview();
}

function setHair(hair) {
    gameState.player.hair = hair;
    updatePreview();
}

function setColor(color) {
    gameState.player.color = color;
    updatePreview();
}

function updatePreview() {
    const preview = document.getElementById('preview-avatar');
    preview.textContent = gameState.player.avatar;
}

function startGame() {
    const name = document.getElementById('player-name').value.trim();
    if (name) {
        gameState.player.name = name;
    }
    gameState.save();
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    initGame();
}

// ==================== 游戏初始化 ====================

function initGame() {
    gameState = new GameState();
    gameState.updateDisplay();

    // 检查每日登录
    checkDailyLogin();

    // 初始化任务
    initQuests();

    // 显示家园
    showPage('home');

    // 更新角色显示
    updateWardrobe();
    updatePetList();
    updateFriendList();
    updateQuestList();
    renderIsland();
}

function checkDailyLogin() {
    const today = new Date().toDateString();
    if (gameState.lastLogin !== today) {
        gameState.lastLogin = today;
        gameState.addGems(50);
        gameState.addCoins(200);
        showNotification('🎁 每日登录奖励：💎50 + 💰200');

        // 完成每日登录任务
        completeQuest('daily');
    }
}

// ==================== 页面导航 ====================

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(`page-${pageId}`).classList.add('active');
    event.target.classList.add('active');

    // 更新对应页面内容
    if (pageId === 'wardrobe') updateWardrobe();
    if (pageId === 'pets') updatePetList();
    if (pageId === 'friends') updateFriendList();
    if (pageId === 'quests') updateQuestList();
}

// ==================== 家园系统 ====================

function renderIsland() {
    const container = document.getElementById('island-decorations');
    container.innerHTML = '';
    gameState.island.decorations.forEach((dec, index) => {
        const furn = FURNITURE_DATABASE.find(f => f.id === dec);
        if (furn) {
            const el = document.createElement('div');
            el.className = 'decoration-item';
            el.textContent = furn.icon;
            el.style.cssText = `
                position: absolute;
                font-size: 3em;
                left: ${20 + index * 15}%;
                bottom: ${20 + (index % 3) * 10}%;
            `;
            container.appendChild(el);
        }
    });

    const playerOnIsland = document.getElementById('player-on-island');
    playerOnIsland.textContent = gameState.player.avatar;
}

function decorateIsland() {
    if (gameState.inventory.furniture.length === 0) {
        showNotification('🏪 先去家具店购买家具吧！');
        return;
    }
    if (gameState.island.decorations.length >= 5) {
        showNotification('岛屿装饰已达上限！');
        return;
    }

    const furniture = gameState.inventory.furniture[0];
    gameState.island.decorations.push(furniture);
    gameState.inventory.furniture.shift();
    gameState.save();
    renderIsland();
    completeQuest('decorate');
    showNotification('🎨 装饰成功！');
}

function visitFriend() {
    if (gameState.friends.length === 0) {
        showNotification('👥 先添加好友吧！');
        return;
    }
    const friend = gameState.friends[Math.floor(Math.random() * gameState.friends.length)];
    showNotification(`🚶 拜访了 ${friend.name} 的岛屿！`);
    gameState.addCoins(50);
    completeQuest('visit');
}

function rest() {
    gameState.player.stamina = gameState.player.maxStamina;
    showNotification('💤 体力已恢复！');
    gameState.save();
}

// ==================== 小镇系统 ====================

function openShop(type) {
    let html = `<h3>🏪 ${type === 'pet' ? '宠物店' : type === 'furniture' ? '家具店' : '服装店'}</h3>`;
    let items = type === 'pet' ? PET_DATABASE : type === 'furniture' ? FURNITURE_DATABASE : CLOTHING_DATABASE;

    items.forEach(item => {
        const owned = type === 'pet'
            ? gameState.inventory.pets.some(p => p.id === item.id)
            : type === 'furniture'
                ? gameState.inventory.furniture.includes(item.id) || gameState.island.decorations.includes(item.id)
                : gameState.inventory.clothing.includes(item.id);

        html += `
            <div class="shop-item">
                <span>${item.icon}</span>
                <span>${item.name}</span>
                <span>${item.price}💰</span>
                <button onclick="buyItem('${type}', ${item.id})" ${owned ? 'disabled' : ''}>
                    ${owned ? '已拥有' : '购买'}
                </button>
            </div>
        `;
    });

    showModal(html);
}

function buyItem(type, itemId) {
    const items = type === 'pet' ? PET_DATABASE : type === 'furniture' ? FURNITURE_DATABASE : CLOTHING_DATABASE;
    const item = items.find(i => i.id === itemId);

    if (gameState.player.coins < item.price) {
        showNotification('💰 金币不足！');
        return;
    }

    gameState.player.coins -= item.price;

    if (type === 'pet') {
        gameState.inventory.pets.push({ ...item, level: 1, exp: 0 });
    } else if (type === 'furniture') {
        gameState.inventory.furniture.push(itemId);
    } else {
        gameState.inventory.clothing.push(itemId);
    }

    gameState.save();
    gameState.updateDisplay();
    showNotification(`✅ 购买成功：${item.name}`);

    if (type === 'pet') {
        completeQuest('pet');
        updatePetList();
    }
    if (type === 'furniture') {
        completeQuest('decorate');
    }

    openShop(type); // 刷新商店
}

function openMiniGames() {
    const html = `
        <h3>🎮 游戏厅</h3>
        <div class="minigame-list">
            <button onclick="startMinigame('clicker')">👆 点击达人</button>
            <button onclick="startMinigame('memory')">🧠 记忆挑战</button>
            <button onclick="startMinigame('lucky')">🍀 幸运抽奖</button>
        </div>
    `;
    showModal(html);
}

function openFarm() {
    showNotification('🌾 农场开发中...');
}

function openBank() {
    const html = `
        <h3>🏦 银行</h3>
        <p>当前金币：${gameState.player.coins}💰</p>
        <button onclick="depositCoins()">存入金币</button>
        <button onclick="withdrawCoins()">取出金币</button>
    `;
    showModal(html);
}

// ==================== 换装系统 ====================

function updateWardrobe() {
    const avatar = document.getElementById('wardrobe-avatar');
    const name = document.getElementById('wardrobe-name');
    avatar.textContent = gameState.player.avatar;
    name.textContent = gameState.player.name;

    const list = document.getElementById('clothing-list');
    list.innerHTML = '';

    gameState.inventory.clothing.forEach(itemId => {
        const clothing = CLOTHING_DATABASE.find(c => c.id === itemId);
        if (clothing) {
            const el = document.createElement('div');
            el.className = 'clothing-item';
            el.innerHTML = `
                <div class="item-icon">${clothing.icon}</div>
                <div class="item-name">${clothing.name}</div>
                <button onclick="equipClothing(${itemId})">
                    ${gameState.equipped.clothing === itemId ? '穿着中' : '穿上'}
                </button>
            `;
            list.appendChild(el);
        }
    });
}

function equipClothing(itemId) {
    gameState.equipped.clothing = itemId;
    gameState.save();
    updateWardrobe();
    showNotification('✅ 换装成功！');
}

// ==================== 宠物系统 ====================

function updatePetList() {
    const list = document.getElementById('pet-list');
    list.innerHTML = '';

    if (gameState.inventory.pets.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:#888;">暂无宠物，去宠物店购买吧！</p>';
        return;
    }

    gameState.inventory.pets.forEach((pet, index) => {
        const el = document.createElement('div');
        el.className = 'pet-card';
        el.innerHTML = `
            <div class="pet-icon">${pet.icon}</div>
            <div class="pet-name">${pet.name}</div>
            <div class="pet-level">Lv.${pet.level}</div>
        `;
        list.appendChild(el);
    });
}

function feedPet() {
    if (gameState.inventory.pets.length === 0) {
        showNotification('🐾 你还没有宠物！');
        return;
    }
    gameState.inventory.pets.forEach(pet => {
        pet.exp += 10;
        if (pet.exp >= pet.level * 50) {
            pet.level++;
            pet.exp = 0;
            showNotification(`🎉 ${pet.name} 升级了！`);
        }
    });
    gameState.save();
    updatePetList();
    showNotification('🍖 宠物喂食完成！');
}

function playWithPet() {
    if (gameState.inventory.pets.length === 0) {
        showNotification('🐾 你还没有宠物！');
        return;
    }
    gameState.inventory.pets.forEach(pet => {
        pet.exp += 20;
    });
    gameState.save();
    updatePetList();
    showNotification('🎾 和宠物玩耍很开心！');
}

function petShop() {
    openShop('pet');
}

// ==================== 好友系统 ====================

function updateFriendList() {
    const list = document.getElementById('friend-list');
    list.innerHTML = '';

    const allFriends = [...gameState.friends, ...NPC_FRIENDS.slice(0, 3)];

    if (allFriends.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:#888;">暂无好友</p>';
        return;
    }

    allFriends.forEach(friend => {
        const el = document.createElement('div');
        el.className = 'friend-item';
        el.innerHTML = `
            <div class="friend-avatar">${friend.avatar}</div>
            <div class="friend-info">
                <div class="friend-name">${friend.name}</div>
                <div class="friend-level">Lv.${friend.level}</div>
            </div>
            <button onclick="visitFriendById('${friend.name}')">拜访</button>
        `;
        list.appendChild(el);
    });
}

function addFriend() {
    const available = NPC_FRIENDS.filter(n => !gameState.friends.some(f => f.id === n.id));
    if (available.length === 0) {
        showNotification('已经添加所有好友了！');
        return;
    }
    const newFriend = available[Math.floor(Math.random() * available.length)];
    gameState.friends.push(newFriend);
    gameState.save();
    updateFriendList();
    showNotification(`✅ 添加了好友：${newFriend.name}`);
}

function visitRandomFriend() {
    visitFriend();
}

function visitFriendById(name) {
    showNotification(`🚶 拜访了 ${name} 的岛屿！`);
    gameState.addCoins(30);
}

// ==================== 任务系统 ====================

function initQuests() {
    if (gameState.quests.length === 0) {
        // 初始化所有任务
        QUEST_DATABASE.forEach(quest => {
            gameState.quests.push({
                id: quest.id,
                progress: 0,
                completed: false,
                claimed: false
            });
        });
        gameState.save();
    }
}

function updateQuestList() {
    const list = document.getElementById('quest-list');
    list.innerHTML = '';

    gameState.quests.forEach(quest => {
        const questData = QUEST_DATABASE.find(q => q.id === quest.id);
        if (questData && !quest.completed) {
            const el = document.createElement('div');
            el.className = 'quest-item';
            el.innerHTML = `
                <div class="quest-header">
                    <span class="quest-name">${questData.name}</span>
                    <span class="quest-reward">💰${questData.reward}</span>
                </div>
                <div class="quest-desc">${questData.desc}</div>
                <div class="quest-progress">
                    <div class="quest-progress-bar" style="width: ${getQuestProgress(quest, questData)}%"></div>
                </div>
                <button onclick="claimQuestReward(${quest.id})" ${quest.completed && !quest.claimed ? '' : 'disabled'}>
                    ${quest.completed && !quest.claimed ? '领取奖励' : quest.claimed ? '已领取' : '进行中'}
                </button>
            `;
            list.appendChild(el);
        }
    });
}

function getQuestProgress(quest, questData) {
    if (questData.target) {
        return Math.min(100, (quest.progress / questData.target) * 100);
    }
    return quest.completed ? 100 : 50;
}

function completeQuest(type) {
    QUEST_DATABASE.filter(q => q.type === type).forEach(questData => {
        const quest = gameState.quests.find(q => q.id === questData.id);
        if (quest && !quest.completed) {
            if (questData.target) {
                quest.progress++;
                if (quest.progress >= questData.target) {
                    quest.completed = true;
                }
            } else {
                quest.completed = true;
            }
        }
    });
    gameState.save();
}

function claimQuestReward(questId) {
    const quest = gameState.quests.find(q => q.id === questId);
    const questData = QUEST_DATABASE.find(q => q.id === questId);

    if (quest && quest.completed && !quest.claimed) {
        gameState.addCoins(questData.reward);
        gameState.addExp(50);
        quest.claimed = true;
        gameState.save();
        updateQuestList();
        showNotification(`🎁 领取奖励：💰${questData.reward}`);
    }
}

function claimDailyReward() {
    const today = new Date().toDateString();
    if (gameState.lastLogin === today) {
        gameState.addGems(50);
        gameState.addCoins(200);
        showNotification('🎁 领取每日奖励：💎50 + 💰200');
    } else {
        showNotification('请先登录游戏！');
    }
}

// ==================== 小游戏系统 ====================

function startMinigame(type) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('minigame-screen').classList.add('active');

    const container = document.getElementById('minigame-container');
    currentMinigame = type;

    if (type === 'clicker') {
        startClickerGame(container);
    } else if (type === 'memory') {
        startMemoryGame(container);
    } else if (type === 'lucky') {
        startLuckyGame(container);
    }
}

function startClickerGame(container) {
    document.getElementById('minigame-title').textContent = '👆 点击达人';
    let clicks = 0;
    let timeLeft = 30;
    let playing = false;

    container.innerHTML = `
        <div class="clicker-game">
            <div class="game-info">时间：<span id="clicker-time">${timeLeft}</span>s</div>
            <div class="game-info">点击：<span id="clicker-count">${clicks}</span></div>
            <button id="clicker-btn" class="clicker-btn" onclick="handleClickerClick()">👆 点击我!</button>
            <button id="start-clicker" onclick="startClickerRound()">开始游戏</button>
        </div>
    `;
}

let clickerInterval = null;

function startClickerRound() {
    let clicks = 0;
    let timeLeft = 30;

    document.getElementById('start-clicker').style.display = 'none';
    document.getElementById('clicker-btn').disabled = false;

    clickerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('clicker-time').textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(clickerInterval);
            document.getElementById('clicker-btn').disabled = true;
            const reward = clicks * 10;
            gameState.addCoins(reward);
            gameState.addExp(10);
            showNotification(`时间到！获得 💰${reward}`);
            completeQuest('minigame');
            setTimeout(() => backToGame(), 2000);
        }
    }, 1000);

    window.handleClickerClick = function() {
        clicks++;
        document.getElementById('clicker-count').textContent = clicks;
    };
}

function startMemoryGame(container) {
    document.getElementById('minigame-title').textContent = '🧠 记忆挑战';
    const emojis = ['🐱', '🐶', '🐰', '🦊', '🐱', '🐶', '🐰', '🦊'];
    let shuffled = emojis.sort(() => Math.random() - 0.5);
    let flipped = [];
    let matched = 0;

    container.innerHTML = `
        <div class="memory-game">
            <div class="memory-grid">
                ${shuffled.map((emoji, i) => `
                    <div class="memory-card" data-index="${i}" onclick="flipCard(${i}, '${emoji}')">?</div>
                `).join('')}
            </div>
        </div>
    `;

    window.flipCard = function(index, emoji) {
        if (flipped.length >= 2) return;
        const card = document.querySelector(`[data-index="${index}"]`);
        card.textContent = emoji;
        card.classList.add('flipped');
        flipped.push({ index, emoji });

        if (flipped.length === 2) {
            if (flipped[0].emoji === flipped[1].emoji) {
                matched++;
                flipped = [];
                if (matched === 4) {
                    gameState.addCoins(300);
                    gameState.addExp(20);
                    showNotification('🎉 挑战成功！获得 💰300');
                    completeQuest('minigame');
                    setTimeout(() => backToGame(), 2000);
                }
            } else {
                setTimeout(() => {
                    document.querySelector(`[data-index="${flipped[0].index}"]`).textContent = '?';
                    document.querySelector(`[data-index="${flipped[1].index}"]`).textContent = '?';
                    flipped = [];
                }, 1000);
            }
        }
    };
}

function startLuckyGame(container) {
    document.getElementById('minigame-title').textContent = '🍀 幸运抽奖';
    const prizes = [
        { text: '💰 100', value: 100, type: 'coin' },
        { text: '💰 500', value: 500, type: 'coin' },
        { text: '💎 10', value: 10, type: 'gem' },
        { text: '💎 50', value: 50, type: 'gem' },
        { text: '谢谢参与', value: 0, type: 'none' },
    ];

    let currentIndex = 0;
    let spinning = false;

    container.innerHTML = `
        <div class="lucky-game">
            <div class="lucky-wheel">
                ${prizes.map((p, i) => `
                    <div class="prize-segment ${i === currentIndex ? 'active' : ''}">${p.text}</div>
                `).join('')}
            </div>
            <button onclick="spinWheel()" ${spinning ? 'disabled' : ''}>开始抽奖</button>
        </div>
    `;

    window.spinWheel = function() {
        if (spinning) return;
        spinning = true;
        let spins = 0;
        const maxSpins = 20;

        const spinInterval = setInterval(() => {
            document.querySelectorAll('.prize-segment').forEach((el, i) => {
                el.classList.toggle('active', i === currentIndex);
            });
            currentIndex = (currentIndex + 1) % prizes.length;
            spins++;

            if (spins >= maxSpins) {
                clearInterval(spinInterval);
                const prize = prizes[(currentIndex + prizes.length - 1) % prizes.length];
                if (prize.type === 'coin') {
                    gameState.addCoins(prize.value);
                } else if (prize.type === 'gem') {
                    gameState.addGems(prize.value);
                }
                showNotification(`🎁 获得：${prize.text}`);
                spinning = false;
                setTimeout(() => backToGame(), 2000);
            }
        }, 150);
    };
}

function backToGame() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('game-screen').classList.add('active');
    currentMinigame = null;
}

// ==================== 工具函数 ====================

function showModal(content) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            ${content}
            <div class="modal-buttons">
                <button onclick="this.closest('.modal').remove()">关闭</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// ==================== 小游戏样式 ====================

const minigameStyles = document.createElement('style');
minigameStyles.textContent = `
    .clicker-game, .memory-game, .lucky-game {
        text-align: center;
        color: white;
    }

    .game-info {
        font-size: 1.5em;
        margin: 20px;
    }

    .clicker-btn {
        font-size: 3em;
        padding: 30px 60px;
        background: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        margin: 20px;
    }

    .clicker-btn:active {
        transform: scale(0.95);
    }

    .memory-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
        max-width: 400px;
        margin: 0 auto;
    }

    .memory-card {
        width: 80px;
        height: 80px;
        background: white;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2em;
        cursor: pointer;
    }

    .lucky-wheel {
        display: flex;
        gap: 10px;
        margin: 30px;
    }

    .prize-segment {
        padding: 20px;
        background: rgba(255,255,255,0.2);
        border-radius: 10px;
        transition: all 0.3s;
    }

    .prize-segment.active {
        background: white;
        color: #667eea;
        transform: scale(1.1);
    }

    .shop-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 10px;
        border-bottom: 1px solid #eee;
    }

    .shop-item button {
        margin-left: auto;
        padding: 5px 15px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 5px;
    }

    .shop-item button:disabled {
        background: #ccc;
    }

    .clothing-item {
        text-align: center;
        padding: 10px;
        background: #f5f5f5;
        border-radius: 8px;
    }

    .item-icon {
        font-size: 3em;
    }

    .item-name {
        margin: 5px 0;
    }

    .minigame-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .minigame-list button {
        padding: 15px;
        background: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        font-size: 1.1em;
    }
`;
document.head.appendChild(minigameStyles);

// ==================== 初始化 ====================

window.addEventListener('load', () => {
    gameState = new GameState();
    console.log('贝比岛加载完成!');
});
