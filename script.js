// --------------------
// VARIABLES
// --------------------
let count = parseInt(localStorage.getItem("count")) || 0;
let greetsPerClick = parseInt(localStorage.getItem("greetsPerClick")) || 1;
let clickUpgradeLevel = parseInt(localStorage.getItem("clickUpgradeLevel")) || 0;
let clickUpgradeCost = parseInt(localStorage.getItem("clickUpgradeCost")) || 100;
let autoGenerators = parseInt(localStorage.getItem("autoGenerators")) || 0;
let autoUpgradeCost = parseInt(localStorage.getItem("autoUpgradeCost")) || 10;
let rebirthCount = parseInt(localStorage.getItem("rebirthCount")) || 0;
let rebirthCost = parseInt(localStorage.getItem("rebirthCost")) || 10000;
let skinName = localStorage.getItem("skinName") || "Default";
let lastTime = parseInt(localStorage.getItem("lastTime")) || Date.now();

const skins = {
  0: "Default",
  5: "Golden Alen",
  10: "Galaxy Alen",
  25: "Cyber Alen",
  50: "Mythic Alen",
  75: "Divine Alen",
  100: "Ultimate Alen"
};

// --------------------
// ELEMENTS
// --------------------
const countEl = document.getElementById("count");
const alen = document.getElementById("alen");
const clickBtn = document.getElementById("clickUpgrade");
const autoBtn = document.getElementById("autoUpgrade");
const rebirthBtn = document.getElementById("rebirthBtn");
const rebirthCountEl = document.getElementById("rebirthCount");
const skinNameEl = document.getElementById("skinName");

// --------------------
// OFFLINE EARNINGS
// --------------------
const now = Date.now();
const offlineTime = (now - lastTime) / 1000;
if (offlineTime > 5) {
  const offlineEarnings = autoGenerators * greetsPerClick * offlineTime;
  count += offlineEarnings;
  showBanner(`While you were away, you greeted Alen ${Math.floor(offlineEarnings)} times!`, "info");
}
lastTime = now;

// --------------------
// CLICK ALEN
// --------------------
alen.addEventListener("click", (e) => {
  count += greetsPerClick;
  save();
  updateUI();

  // Animation
  alen.classList.add("clicked");
  setTimeout(() => alen.classList.remove("clicked"), 150);

  // Floating +X
  const floatText = document.createElement("span");
  floatText.className = "floating-text";
  floatText.textContent = `+${greetsPerClick}`;
  const rect = alen.getBoundingClientRect();
  const xOffset = (Math.random() - 0.5) * 40;
  const yOffset = (Math.random() - 0.5) * 20;
  floatText.style.left = `${rect.left + rect.width / 2 + xOffset}px`;
  floatText.style.top = `${rect.top + rect.height / 2 + yOffset}px`;
  document.body.appendChild(floatText);
  setTimeout(() => floatText.remove(), 1100);
});

// --------------------
// UPGRADE BUTTONS
// --------------------
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

// --------------------
// AUTO-GENERATORS
// --------------------
setInterval(() => {
  if (autoGenerators > 0) {
    count += autoGenerators * greetsPerClick;
    const floatText = document.createElement("span");
    floatText.className = "floating-text auto";
    floatText.textContent = `+${autoGenerators * greetsPerClick}`;
    const rect = alen.getBoundingClientRect();
    floatText.style.left = `${rect.left + rect.width / 2}px`;
    floatText.style.top = `${rect.top + rect.height / 2}px`;
    document.body.appendChild(floatText);
    setTimeout(() => floatText.remove(), 1000);
    save();
    updateUI();
  }
}, 1000);

// --------------------
// REBIRTH
// --------------------
rebirthBtn.addEventListener("click", () => {
  if (rebirthCount >= 100) {
    showBanner("MAX REBIRTH!", "warning");
    return;
  }
  if (count >= rebirthCost) {
    count = 0;
    greetsPerClick = 1 + rebirthCount * 0.1;
    clickUpgradeLevel = 0;
    clickUpgradeCost = 100;
    autoGenerators = 0;
    autoUpgradeCost = 10;
    rebirthCount++;
    rebirthCost = 10000 + rebirthCount * 10000;
    updateSkin();
    save();
    updateUI();
    showBanner(`You rebirthed! Total: ${rebirthCount}`, "info");
  } else showBanner("Not enough greets to rebirth!", "error");
});

// --------------------
// SAVE & UI
// --------------------
function save() {
  localStorage.setItem("count", count);
  localStorage.setItem("greetsPerClick", greetsPerClick);
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
  for (let milestone in skins) {
    if (rebirthCount >= milestone) unlocked = skins[milestone];
  }
  skinName = unlocked;
  alen.src = `images/skins/${skinName.toLowerCase().split(" ")[0]}.png`;
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
