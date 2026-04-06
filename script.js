let gameState = {
    cats: 0,
    catsPerSecond: 0,
    totalCatsEarned: 0,
    totalClicks: 0,
    timePlayed: 0, 
    farm: {
        count: 0,
        cost: 15,
        production: 1
    }
};

function loadGame() {
    const save = localStorage.getItem('catClickerSave');
    if (save) {
        try {
            const parsed = JSON.parse(save);
            gameState = { ...gameState, ...parsed };
            if (gameState.totalCatsEarned === undefined) gameState.totalCatsEarned = gameState.cats;
            if (gameState.totalClicks === undefined) gameState.totalClicks = 0;
            if (gameState.timePlayed === undefined) gameState.timePlayed = 0;
        } catch (e) {
            console.error("Save file corrupted, starting from scratch.", e);
        }
    }
}

function saveGame() {
    localStorage.setItem('catClickerSave', JSON.stringify(gameState));
}

function wipeSave() {
    if(confirm("Are you sure you want to completely clear your save? This cannot be undone.")) {
        localStorage.removeItem('catClickerSave');
        location.reload();
    }
}

loadGame();

const elements = {
    catCount: document.getElementById('cat-count'),
    cpsCount: document.getElementById('cps-count'),
    mainCatBtn: document.getElementById('main-cat-btn'),
    leftPanel: document.querySelector('.left-panel'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    buyFarmBtn: document.getElementById('buy-farm-btn'),
    farmCost: document.getElementById('farm-cost'),
    farmCount: document.getElementById('farm-count'),
    farmProductionRate: document.getElementById('farm-production-rate'),
    statClicks: document.getElementById('stat-clicks'),
    statTotalCats: document.getElementById('stat-total-cats'),
    statTime: document.getElementById('stat-time'),
    statFarms: document.getElementById('stat-farms'),
    saveBtn: document.getElementById('save-btn'),
    wipeBtn: document.getElementById('wipe-btn'),
    wagerInput: document.getElementById('wager-input'),
    btnWagerHalf: document.getElementById('btn-wager-half'),
    btnWagerMax: document.getElementById('btn-wager-max'),
    flipCoinBtn: document.getElementById('flip-coin-btn'),
    gambleResult: document.getElementById('gamble-result'),
    minigameArea: document.getElementById('minigame-area'),
    mouseBtn: document.getElementById('mouse-btn'),
    minigameBonus: document.getElementById('minigame-bonus')
};

function formatNumber(num) {
    return Math.floor(num).toLocaleString();
}

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

function addCats(amount) {
    if (amount > 0) {
        gameState.totalCatsEarned += amount;
    }
    gameState.cats += amount;
}

function updateUI() {
    elements.catCount.textContent = formatNumber(gameState.cats);
    elements.cpsCount.textContent = parseFloat(gameState.catsPerSecond.toFixed(1)).toLocaleString();
    elements.farmCount.textContent = gameState.farm.count;
    elements.farmCost.textContent = formatNumber(gameState.farm.cost);
    elements.buyFarmBtn.disabled = gameState.cats < gameState.farm.cost;
    elements.statClicks.textContent = formatNumber(gameState.totalClicks);
    elements.statTotalCats.textContent = formatNumber(gameState.totalCatsEarned);
    elements.statTime.textContent = formatTime(gameState.timePlayed);
    elements.statFarms.textContent = gameState.farm.count;
    const minigameBonusAmt = Math.max(10, Math.floor(gameState.catsPerSecond * 15));
    elements.minigameBonus.textContent = formatNumber(minigameBonusAmt);
}

function showFloatingNumber(x, y, text = '+1') {
    const floatEl = document.createElement('div');
    floatEl.className = 'floating-number';
    floatEl.textContent = text;
    const offsetX = (Math.random() - 0.5) * 40;
    const offsetY = (Math.random() - 0.5) * 20;
    floatEl.style.left = `${x + offsetX}px`;
    floatEl.style.top = `${y + offsetY}px`;
    elements.leftPanel.appendChild(floatEl);
    setTimeout(() => {
        floatEl.remove();
    }, 1000);
}

elements.mainCatBtn.addEventListener('click', (e) => {
    addCats(1);
    gameState.totalClicks += 1;
    updateUI();
    elements.mainCatBtn.classList.remove('clicked');
    void elements.mainCatBtn.offsetWidth; 
    elements.mainCatBtn.classList.add('clicked');
    if (e.clientX && e.clientY) {
        const rect = elements.leftPanel.getBoundingClientRect();
        const startX = e.clientX - rect.left - 20;
        const startY = e.clientY - rect.top - 20;
        showFloatingNumber(startX, startY);
    }
});

elements.buyFarmBtn.addEventListener('click', () => {
    if (gameState.cats >= gameState.farm.cost) {
        gameState.cats -= gameState.farm.cost; 
        gameState.farm.count += 1;
        gameState.farm.cost = Math.ceil(gameState.farm.cost * 1.15); 
        gameState.catsPerSecond = gameState.farm.count * gameState.farm.production;
        updateUI();
    }
});

elements.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        elements.tabBtns.forEach(b => b.classList.remove('active'));
        elements.tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.target).classList.add('active');
    });
});

elements.saveBtn.addEventListener('click', () => {
    saveGame();
    const originalText = elements.saveBtn.textContent;
    elements.saveBtn.textContent = 'Saved!';
    setTimeout(() => elements.saveBtn.textContent = originalText, 1500);
});

elements.wipeBtn.addEventListener('click', wipeSave);

elements.btnWagerHalf.addEventListener('click', () => {
    elements.wagerInput.value = Math.floor(gameState.cats / 2);
});
elements.btnWagerMax.addEventListener('click', () => {
    elements.wagerInput.value = Math.floor(gameState.cats);
});

elements.flipCoinBtn.addEventListener('click', () => {
    const wager = parseInt(elements.wagerInput.value, 10);
    if (isNaN(wager) || wager <= 0) {
        elements.gambleResult.textContent = 'Enter a valid amount!';
        elements.gambleResult.className = 'gamble-result loss';
        return;
    }
    if (wager > gameState.cats) {
        elements.gambleResult.textContent = 'Not enough cats!';
        elements.gambleResult.className = 'gamble-result loss';
        return;
    }
    gameState.cats -= wager; 
    if (Math.random() < 0.5) {
        const winAmount = wager * 2;
        addCats(winAmount);
        elements.gambleResult.textContent = `You won ${formatNumber(winAmount)} cats! 🪙`;
        elements.gambleResult.className = 'gamble-result win';
    } else {
        elements.gambleResult.textContent = `You lost ${formatNumber(wager)} cats... 😿`;
        elements.gambleResult.className = 'gamble-result loss';
    }
    updateUI();
});

let mouseTimeout;

function spawnMouse() {
    elements.mouseBtn.classList.remove('hidden');
    const areaRect = elements.minigameArea.getBoundingClientRect();
    const maxX = Math.max(0, areaRect.width - 60); 
    const maxY = Math.max(0, areaRect.height - 60);
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);
    elements.mouseBtn.style.left = `${randomX}px`;
    elements.mouseBtn.style.top = `${randomY}px`;
    const stayDuration = 1200 + Math.random() * 1300;
    clearTimeout(mouseTimeout);
    mouseTimeout = setTimeout(() => {
        elements.mouseBtn.classList.add('hidden');
    }, stayDuration);
}

elements.mouseBtn.addEventListener('click', () => {
    elements.mouseBtn.classList.add('hidden');
    const bonus = Math.max(10, Math.floor(gameState.catsPerSecond * 15));
    addCats(bonus);
    gameState.totalClicks += 1;
    updateUI();
});

setInterval(() => {
    if (elements.mouseBtn.classList.contains('hidden')) {
        if (Math.random() < 0.5) {
            spawnMouse();
        }
    }
}, 5000);

setInterval(saveGame, 5000); 

let lastTime = performance.now();
let timeAccumulator = 0;

function gameLoop(currentTime) {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    if (gameState.catsPerSecond > 0) {
        addCats(gameState.catsPerSecond * deltaTime);
    }
    timeAccumulator += deltaTime;
    if (timeAccumulator >= 1) {
        gameState.timePlayed += Math.floor(timeAccumulator);
        timeAccumulator -= Math.floor(timeAccumulator);
    }
    updateUI();
    requestAnimationFrame(gameLoop);
}

updateUI();
requestAnimationFrame(gameLoop);
