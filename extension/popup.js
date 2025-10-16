// --------------------
// VARIABLES
// --------------------
let count = 0;
let greetsPerClick = 1;

// Upgrade data
let clickUpgradeLevel = 0;
let clickUpgradeCost = 100;

let autoGenerators = 0;
let autoUpgradeCost = 10;

// Rebirth data
let rebirthCount = 0;
let rebirthCost = 10000;
let skinName = "Default";
let lastSaveTime = Date.now();

let skins = {
  0: "Default",
  5: "Golden Greet",
  10: "Galaxy Greet",
  25: "Cyber Greet",
  50: "Mythic Greet",
  75: "Divine Greet",
  100: "Ultimate Greet"
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
// LOAD DATA
// --------------------
chrome.storage.sync.get(
  [
    "count","greetsPerClick",
    "clickUpgradeLevel","clickUpgradeCost",
    "autoGenerators","autoUpgradeCost",
    "rebirthCount","rebirthCost","skinName",
    "lastSaveTime"
  ],
  (data) => {
    count = data.count || 0;
    greetsPerClick = data.greetsPerClick || 1;
    clickUpgradeLevel = data.clickUpgradeLevel || 0;
    clickUpgradeCost = data.clickUpgradeCost || 100;
    autoGenerators = data.autoGenerators || 0;
    autoUpgradeCost = data.autoUpgradeCost || 10;
    rebirthCount = data.rebirthCount || 0;
    rebirthCost = data.rebirthCost || (10000 + rebirthCount * 10000);
    skinName = data.skinName || "Default";
    lastSaveTime = data.lastSaveTime || Date.now();

    applyRebirthBonus();
    updateSkin();

    // 💰 Offline earnings check
    giveOfflineEarnings();

    updateUI();
  }
);

// --------------------
// CLICK ALEN
// --------------------
alen.addEventListener("click", (e) => {
  // Add greets
  count += greetsPerClick;
  save();
  updateUI();

  // Add click animation
  alen.classList.add("clicked");
  setTimeout(() => alen.classList.remove("clicked"), 150);

  // Create floating +X text
  const floatText = document.createElement("span");
  floatText.className = "floating-text";
  floatText.textContent = `+${greetsPerClick}`;
  
  // Position it near the click
  const rect = alen.getBoundingClientRect();
  const xOffset = (Math.random() - 0.5) * 40;
const yOffset = (Math.random() - 0.5) * 20;
floatText.style.left = `${rect.left + rect.width / 2 + xOffset}px`;
floatText.style.top = `${rect.top + rect.height / 2 + yOffset}px`;

  
  document.body.appendChild(floatText);

  // Remove it after animation
  setTimeout(() => floatText.remove(), 1000);
});


// --------------------
// MANUAL UPGRADE
// --------------------
clickBtn.addEventListener("click", () => {
  if (count >= clickUpgradeCost) {
    count -= clickUpgradeCost;
    clickUpgradeLevel++;
    greetsPerClick += getRebirthMultiplier();
    clickUpgradeCost = Math.floor(clickUpgradeCost * 1.5);
    save();
    updateUI();
  } else showBanner("❌ Not enough clicks!", "error");
});

// --------------------
// AUTO UPGRADE
// --------------------
autoBtn.addEventListener("click", () => {
  if (count >= autoUpgradeCost) {
    count -= autoUpgradeCost;
    autoGenerators++;
    autoUpgradeCost = Math.floor(autoUpgradeCost * 1.7);
    save();
    updateUI();
  } else showBanner("❌ Not enough clicks!", "error");
});

// --------------------
// AUTO-GENERATORS
// --------------------
setInterval(() => {
  if (autoGenerators > 0) {
    count += autoGenerators * greetsPerClick;
    save();
    updateUI();
  }
}, 1000);

// --------------------
// REBIRTH
// --------------------
rebirthBtn.addEventListener("click", () => {
  if (rebirthCount >= 100) {
    showBanner("🌟 MAX REBIRTH REACHED!", "warning");
    return;
  }

  if (count >= rebirthCost) {
    count = 0;
    greetsPerClick = 1;
    clickUpgradeLevel = 0;
    clickUpgradeCost = 100;
    autoGenerators = 0;
    autoUpgradeCost = 10;
    rebirthCount++;
    rebirthCost = 10000 + rebirthCount * 10000;

    applyRebirthBonus();
    updateSkin();
    save();
    updateUI();
    showBanner(`🎉 You rebirthed! Total rebirths: ${rebirthCount}`, "success");
  } else {
    showBanner("❌ Not enough clicks to rebirth!", "error");
  }
});

// --------------------
// REBIRTH MULTIPLIERS
// --------------------
function getRebirthMultiplier() {
  if (rebirthCount >= 25) return 10;
  if (rebirthCount >= 10) return 5;
  if (rebirthCount >= 5) return 3;
  if (rebirthCount >= 1) return 2;
  return 1;
}

function applyRebirthBonus() {
  const multiplier = getRebirthMultiplier();
  greetsPerClick *= multiplier;
}

// --------------------
// OFFLINE EARNINGS
// --------------------
function giveOfflineEarnings() {
  const now = Date.now();
  const timeAway = Math.floor((now - lastSaveTime) / 1000); // seconds

  if (timeAway > 5 && autoGenerators > 0) {
    const earned = autoGenerators * greetsPerClick * timeAway;
    count += earned;
    showBanner(`💤 While you were away, you earned ${earned.toLocaleString()} clicks!`, "success");
  }

  lastSaveTime = now;
  save();
}

// --------------------
// SAVE & UI
// --------------------
function save() {
  chrome.storage.sync.set({
    count,
    greetsPerClick,
    clickUpgradeLevel,
    clickUpgradeCost,
    autoGenerators,
    autoUpgradeCost,
    rebirthCount,
    rebirthCost,
    skinName,
    lastSaveTime: Date.now()
  });
}

function updateUI() {
  countEl.textContent = Math.floor(count);
  clickBtn.textContent = `👋 click Power Lv.${clickUpgradeLevel} (Cost: ${clickUpgradeCost})`;
  autoBtn.textContent = `🤖 Auto-clicker Lv.${autoGenerators} (Cost: ${autoUpgradeCost})`;
  rebirthCountEl.textContent = rebirthCount;
  skinNameEl.textContent = skinName;

  if (rebirthCount >= 100) {
    rebirthBtn.textContent = "MAX REBIRTH!";
    rebirthBtn.disabled = true;
  } else {
    rebirthBtn.textContent = `🔄 Rebirth (Cost: ${rebirthCost} clicks)`;
    rebirthBtn.disabled = false;
  }
}

function updateSkin() {
  let unlockedSkin = "Default";
  let skinImage = "images/skins/default.png";

  for (let milestone in skins) {
    if (rebirthCount >= milestone) unlockedSkin = skins[milestone];
  }

  skinName = unlockedSkin;

  // 🖼️ Match skin names to images
  switch (skinName) {
    case "Golden Greet":
      skinImage = "images/skins/golden.png";
      break;
    case "Galaxy Greet":
      skinImage = "images/skins/galaxy.png";
      break;
    case "Cyber Greet":
      skinImage = "images/skins/cyber.png";
      break;
    case "Mythic Greet":
      skinImage = "images/skins/mythic.png";
      break;
    case "Divine Greet":
      skinImage = "images/skins/divine.png";
      break;
    case "Ultimate Greet":
      skinImage = "images/skins/ultimate.png";
      break;
  }

  // Apply image to your main clickable Alen
  const alenImg = document.getElementById("alen");
  if (alenImg) {
    alenImg.src = skinImage;
  }

  // Update the label text
  skinNameEl.textContent = skinName;
}

// --------------------
// POPUP BANNER FUNCTION
// --------------------
function showBanner(message, type = "info") {
  const banner = document.createElement("div");
  banner.textContent = message;
  banner.className = `banner ${type}`;
  document.body.appendChild(banner);

  setTimeout(() => banner.classList.add("show"), 10); // animate in
  setTimeout(() => banner.classList.remove("show"), 4000); // animate out
  setTimeout(() => banner.remove(), 4500);
}
