let count;
let greetsPerClick;
let clickUpgradeLevel;
let clickUpgradeCost;
let autoGenerators;
let autoUpgradeCost;
let rebirthCount;
let rebirthCost;
let skinName;
let lastTime;


const skins = {
    0: "Default",
    5: "Golden Alen",
    10: "Galaxy Alen",
    25: "Cyber Alen",
    50: "Mythic Alen",
    67: "Divine Alen",
    68: "Ultimate Alen"
};

const countEl = document.getElementById("count");
const alen = document.getElementById("alen");
const clickBtn = document.getElementById("clickUpgrade");
const autoBtn = document.getElementById("autoUpgrade");
const rebirthBtn = document.getElementById("rebirthBtn");
const rebirthCountEl = document.getElementById("rebirthCount");
const skinNameEl = document.getElementById("skinName");
const ANIMATION_DURATION_MS = 1100;
const CLICK_ANIMATION_DURATION_MS = 75;
const AUTO_UPDATE_INTERVAL_MS = 1000;

async function fetchJsonWithComments(path) {
    try {
        const res = await fetch(path);
        const text = await res.text();
        const cleaned = text.replace(/\/\*[\s\S]*?\*\//g, '').trim();
        return JSON.parse(cleaned);
    } catch (err) {
        return null;
    }
}

async function init() {
  
    const defaults = await fetchJsonWithComments('resources/var/vars');
    const dataSnapshot = await fetchJsonWithComments('resources/data/0');

    const pick = (key, fallback) => {
        const ls = localStorage.getItem(key);
        if (ls !== null && ls !== undefined) return ls;
        if (dataSnapshot && dataSnapshot[key] !== undefined) return dataSnapshot[key];
        if (defaults && defaults[key] !== undefined) return defaults[key];
        return fallback;
    };

    count = parseFloat(pick('count', 0)) || 0;
    greetsPerClick = parseFloat(pick('greetsPerClick', 1)) || 1;
    clickUpgradeLevel = parseInt(pick('clickUpgradeLevel', 0)) || 0;
    clickUpgradeCost = parseInt(pick('clickUpgradeCost', 100)) || 100;
    autoGenerators = parseInt(pick('autoGenerators', 0)) || 0;
    autoUpgradeCost = parseInt(pick('autoUpgradeCost', 10)) || 10;
    rebirthCount = parseInt(pick('rebirthCount', 0)) || 0;
    rebirthCost = parseInt(pick('rebirthCost', 10000)) || 10000;
    skinName = pick('skinName', 'Default') || 'Default';
    lastTime = parseInt(pick('lastTime', Date.now())) || Date.now();

    const now = Date.now();
    const offlineTime = (now - lastTime) / 1000;
    if (offlineTime > 5) {
        const offlineEarnings = autoGenerators * greetsPerClick * offlineTime;
        count += offlineEarnings;
        showBanner(`While you were away, you greeted Alen ${Math.floor(offlineEarnings)} times!`, "info");
    }
    lastTime = now;

    alen.addEventListener("click", (e) => {
    count += greetsPerClick;
    save();
    updateUI();

    alen.classList.add("clicked");
    setTimeout(() => alen.classList.remove("clicked"), CLICK_ANIMATION_DURATION_MS);

    const floatText = document.createElement("span");
    floatText.className = "floating-text";
    floatText.textContent = `+${greetsPerClick.toFixed(greetsPerClick % 1 === 0 ? 0 : 1)}`;
    
    const x = e.clientX;
    const y = e.clientY;
    
    floatText.style.left = `${x}px`;
    floatText.style.top = `${y}px`;

    document.body.appendChild(floatText);
    setTimeout(() => floatText.remove(), ANIMATION_DURATION_MS);
    });

alen.addEventListener('dragstart', (e) => {
    e.preventDefault(); 
});

alen.addEventListener('mousedown', (e) => {
    e.preventDefault();
});

clickBtn.addEventListener("click", () => {
    if (count >= clickUpgradeCost) {
        count -= clickUpgradeCost;
        clickUpgradeLevel++;
        greetsPerClick++;
        clickUpgradeCost = Math.floor(clickUpgradeCost * 1.5);
        save();
        updateUI();
        showBanner("Greeter Power Upgraded!", "success");
    } else showBanner("Not enough greets!", "error");
});

autoBtn.addEventListener("click", () => {
    if (count >= autoUpgradeCost) {
        count -= autoUpgradeCost;
        autoGenerators++;
        autoUpgradeCost = Math.floor(autoUpgradeCost * 1.7);
        save();
        updateUI();
        showBanner("Auto-Greeter Upgraded!", "success");
    } else showBanner("Not enough greets!", "error");
});

setInterval(() => {
    if (autoGenerators > 0) {
        const autoIncrement = autoGenerators * greetsPerClick;
        count += autoIncrement;
        
        const floatText = document.createElement("span");
        floatText.className = "floating-text";
        floatText.textContent = `+${autoIncrement.toFixed(autoIncrement % 1 === 0 ? 0 : 1)}`;
        
        const rect = alen.getBoundingClientRect();
        floatText.style.left = `${rect.left + rect.width / 3}px`;
        floatText.style.top = `${rect.top + rect.height / 3}px`;
        
        document.body.appendChild(floatText);
        setTimeout(() => floatText.remove(), ANIMATION_DURATION_MS);
        save();
        updateUI();
    }
}, AUTO_UPDATE_INTERVAL_MS);

rebirthBtn.addEventListener("click", () => {
    if (rebirthCount >= 100) {
        showBanner("MAX REBIRTH!", "warning");
        return;
    }
    if (count >= rebirthCost) {
        count = 0;
        greetsPerClick = 1 + (rebirthCount + 1) * 0.1;
        clickUpgradeLevel = 0;
        clickUpgradeCost = 100;
        autoGenerators = 0;
        autoUpgradeCost = 10;
        rebirthCount++;
        rebirthCost = 10000 * (rebirthCount + 1);
        updateSkin();
        save();
        updateUI();
        showBanner(`You rebirthed! Total: ${rebirthCount}`, "info");
    } else showBanner("Not enough greets to rebirth!", "error");
});

function save() {
    localStorage.setItem("count", count);
    localStorage.setItem("greetsPerClick", greetsPerClick.toString()); 
    localStorage.setItem("clickUpgradeLevel", clickUpgradeLevel);
    localStorage.setItem("clickUpgradeCost", clickUpgradeCost);
    localStorage.setItem("autoGenerators", autoGenerators);
    localStorage.setItem("autoUpgradeCost", autoUpgradeCost);
    localStorage.setItem("rebirthCount", rebirthCount);
    localStorage.setItem("rebirthCost", rebirthCost);
    localStorage.setItem("skinName", skinName);
    localStorage.setItem("lastTime", Date.now());
}

function updateUI() {
    countEl.textContent = Math.floor(count);
    clickBtn.textContent = `👋 Greeter Power Lv.${clickUpgradeLevel} (Cost: ${clickUpgradeCost})`;
    autoBtn.textContent = `🤖 Auto-Greeter Lv.${autoGenerators} (Cost: ${autoUpgradeCost})`;
    rebirthCountEl.textContent = rebirthCount;
    skinNameEl.textContent = skinName;
    if (rebirthCount >= 100) {
        rebirthBtn.textContent = "MAX REBIRTH!";
        rebirthBtn.disabled = true;
    } else {
        rebirthBtn.textContent = `🔄 Rebirth (Cost: ${rebirthCost} Greets)`;
        rebirthBtn.disabled = false;
    }
}

function updateSkin() {
    let unlocked = "Default";
    const milestones = Object.keys(skins).map(Number).sort((a, b) => a - b);
    
    for (const milestone of milestones) {
        if (rebirthCount >= milestone) {
            unlocked = skins[milestone];
        }
    }
    
    skinName = unlocked;
    const fileNamePart = skinName.toLowerCase().split(" ")[0];
    alen.src = `images/skins/${fileNamePart}.png`;
}

function showBanner(text, type = "info") {
    const banner = document.createElement("div");
    banner.className = `banner ${type}`;
    banner.textContent = text;
    document.body.appendChild(banner);
    setTimeout(() => banner.classList.add("show"), 50);
    setTimeout(() => banner.classList.remove("show"), 2000);
    setTimeout(() => banner.remove(), 2500);
}
    updateSkin();
    updateUI();
}

init();
