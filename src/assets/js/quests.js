let quests = [];
const QUESTS_STORAGE_KEY = "quests";

// Charge les quêtes depuis le JSON (si pas déjà dans le localStorage)
async function loadQuestsData() {
    const saved = localStorage.getItem(QUESTS_STORAGE_KEY);
    if (saved) {
        quests = JSON.parse(saved);
    } else {
        const res = await fetch("data/quests.json");
        quests = await res.json();
    }
    // Initialisation des propriétés de suivi si absentes
    quests.forEach(q => {
        if (typeof q.status === "undefined") q.status = "not-started";
        if (typeof q.currentStep === "undefined") q.currentStep = 0;
        if (typeof q.newStep === "undefined") q.newStep = false;
    });
    saveQuestsToLocalStorage();
}

// Sauvegarde dans le localStorage
function saveQuestsToLocalStorage() {
    localStorage.setItem(QUESTS_STORAGE_KEY, JSON.stringify(quests));
}

// Affiche les quêtes dans les 3 colonnes
function renderQuests() {
    const notStarted = document.getElementById("not-started-quests");
    const inProgress = document.getElementById("in-progress-quests");
    const completed = document.getElementById("completed-quests");
    notStarted.innerHTML = "";
    inProgress.innerHTML = "";
    completed.innerHTML = "";

    quests.forEach(quest => {
        const card = document.createElement("div");
        card.className = "quest-card";
        card.style.backgroundImage = `
            linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.8)), 
            url('${quest.image}')
        `;
        card.style.backgroundSize = "cover";
        card.style.backgroundPosition = "center";

        if (quest.newStep) {
            const badge = document.createElement("div");
            badge.className = "new-badge";
            badge.textContent = "NOUVEAU";
            card.appendChild(badge);
        }

        card.innerHTML += `
            <h3>${quest.name}</h3>
            <p class="quest-difficulty">${getDifficultyStars(quest.difficulty)}</p>
        `;

        const btns = document.createElement("div");
        btns.className = "button-container";

        const detailsBtn = document.createElement("button");
        detailsBtn.textContent = "Voir les détails";
        detailsBtn.onclick = () => showQuestDetails(quest.id);
        btns.appendChild(detailsBtn);

        if (quest.status === "in-progress") {
            const finishBtn = document.createElement("button");
            finishBtn.textContent = quest.currentStep < quest.steps.length - 1
                ? `Terminer l'étape ${quest.currentStep + 1}`
                : "Terminer la quête";
            finishBtn.onclick = () => finishStep(quest.id);
            btns.appendChild(finishBtn);
        } else if (quest.status === "completed") {
            const resetBtn = document.createElement("button");
            resetBtn.textContent = "Annuler la finalité";
            resetBtn.onclick = () => resetQuest(quest.id);
            btns.appendChild(resetBtn);
        }

        card.appendChild(btns);

        if (quest.status === "not-started") notStarted.appendChild(card);
        else if (quest.status === "in-progress") inProgress.appendChild(card);
        else if (quest.status === "completed") completed.appendChild(card);
    });
}

// Affiche les étoiles de difficulté
function getDifficultyStars(difficulty) {
    const stars = {
        easy: "⭐",
        normal: "⭐⭐",
        medium: "⭐⭐⭐",
        hard: "⭐⭐⭐⭐",
        intense: "⭐⭐⭐⭐⭐",
        hardcore: "⭐⭐⭐⭐⭐⭐",
        extreme: "⭐⭐⭐⭐⭐⭐⭐",
        impossible: "⭐⭐⭐⭐⭐⭐⭐⭐",
        ultimate: "⭐⭐⭐⭐⭐⭐⭐⭐⭐"
    };
    return stars[(difficulty || "").toLowerCase()] || "";
}

// Affiche le détail d'une quête dans le modal
function showQuestDetails(id) {
    const quest = quests.find(q => q.id === id);
    if (!quest) return;
    const step = quest.steps[quest.currentStep] || quest.steps[0];

    document.getElementById("quest-title").textContent = quest.name;
    document.getElementById("quest-difficulty").innerHTML = `Difficulté : ${getDifficultyStars(quest.difficulty)}`;
    document.getElementById("quest-location").textContent = quest.location || "";
    document.getElementById("quest-type").textContent = quest.type || "";
    document.getElementById("quest-giver").textContent = quest.giver || "";
    document.getElementById("quest-current-step").textContent = step.name || "";
    document.getElementById("quest-description").textContent = step.description || "";

    // Objectifs
    const objectivesList = document.getElementById("quest-objectives");
    objectivesList.innerHTML = "";
    (step.objectives || []).forEach(obj => {
        const li = document.createElement("li");
        li.textContent = obj;
        objectivesList.appendChild(li);
    });

    // Récompenses
    const rewardsList = document.getElementById("quest-rewards");
    rewardsList.innerHTML = "";
    (step.rewards || []).forEach(reward => {
        const li = document.createElement("li");
        if (reward.type === "xp") li.innerHTML = `<span style="color: royalblue;">XP : ${reward.value} 🌟</span>`;
        else if (reward.type === "money") li.innerHTML = `<span style="color: gold;">Argent : ${reward.value} 💎</span>`;
        else if (reward.type === "item") li.innerHTML = `<span style="color: green;">Objet : ${reward.value} 🗡️</span>`;
        else if (reward.type === "eclipseShards") li.innerHTML = `<span style="color: purple;">Éclats du Crépuscule : ${reward.value} 🌒</span>`;
        rewardsList.appendChild(li);
    });

    // Niveau recommandé
    const recommendedLevel = quest.recommendedLevel || 1;
    const maxLevel = 200;
    const percent = (recommendedLevel / maxLevel) * 100;
    const levelBar = document.getElementById("recommended-level-bar");
    const levelLabel = document.getElementById("recommended-level-label");
    levelBar.style.width = `${percent}%`;
    levelLabel.textContent = `Niveau ${recommendedLevel}`;

    // Bouton accepter
    const acceptBtn = document.getElementById("accept-quest-btn");
    acceptBtn.style.display = quest.status === "not-started" ? "block" : "none";
    acceptBtn.onclick = () => {
        quest.status = "in-progress";
        quest.currentStep = 0;
        quest.newStep = false;
        saveQuestsToLocalStorage();
        renderQuests();
        closeModal();
    };

    // Réinitialise le badge "NOUVEAU"
    quest.newStep = false;
    saveQuestsToLocalStorage();
    renderQuests();

    // Affiche le modal
    document.getElementById("quest-modal").style.display = "flex";
}

// Termine une étape ou la quête et donne les récompenses
function finishStep(id) {
    const quest = quests.find(q => q.id === id);
    if (!quest || quest.status !== "in-progress") return;

    // Donne les récompenses de l'étape courante
    const currentStepObj = quest.steps[quest.currentStep];
    if (currentStepObj && Array.isArray(currentStepObj.rewards)) {
        currentStepObj.rewards.forEach(reward => {
            if (reward.type === "money") addToWallet(reward.value, quest.name);
            if (reward.type === "xp") addToXP(reward.value);
            if (reward.type === "eclipseShards") addEclipseShards(reward.value);
            // Ajoute ici d'autres types si besoin
        });
    }

    if (quest.currentStep < quest.steps.length - 1) {
        quest.currentStep++;
        quest.newStep = true;
    } else {
        quest.status = "completed";
    }
    saveQuestsToLocalStorage();
    renderQuests();
}

// Annule la finalité d'une quête terminée
function resetQuest(id) {
    const quest = quests.find(q => q.id === id);
    if (!quest || quest.status !== "completed") return;
    quest.status = "not-started";
    quest.currentStep = 0;
    quest.newStep = false;
    saveQuestsToLocalStorage();
    renderQuests();
}

// Fonctions pour les récompenses (doivent exister ailleurs dans ton projet)
function addToWallet(amount, transactionName) {
    let wallet = parseFloat(localStorage.getItem("wallet")) || 0;
    wallet += amount;
    localStorage.setItem("wallet", wallet);

    // Historique des transactions
    let transactionHistory = JSON.parse(localStorage.getItem("transactionHistory")) || [];
    transactionHistory.push({
        amount: amount,
        type: "gain",
        name: transactionName,
        date: new Date().toLocaleString()
    });
    localStorage.setItem("transactionHistory", JSON.stringify(transactionHistory));
}

function addToXP(amount) {
    let totalXP = parseInt(localStorage.getItem("totalXP")) || 0;
    let currentXP = parseInt(localStorage.getItem("currentXP")) || 0;
    let currentLevel = parseInt(localStorage.getItem("currentLevel")) || 1;

    totalXP += amount;
    currentXP += amount;

    let xpForNextLevel = getXpForLevel(currentLevel);

    while (currentXP >= xpForNextLevel) {
        currentXP -= xpForNextLevel;
        currentLevel++;
        xpForNextLevel = getXpForLevel(currentLevel);
    }

    localStorage.setItem("totalXP", totalXP);
    localStorage.setItem("currentXP", currentXP);
    localStorage.setItem("currentLevel", currentLevel);
}

function addEclipseShards(amount) {
    const currentShards = parseInt(localStorage.getItem("eclipseShards")) || 0;
    const newShards = currentShards + amount;
    localStorage.setItem("eclipseShards", newShards);
    // Si tu as une fonction pour rafraîchir l'affichage, appelle-la ici
    if (typeof loadCurrencies === "function") loadCurrencies();
}

function getXpForLevel(level) {
    if (level >= 1 && level <= 14) return 100 * level;
    if (level >= 15 && level <= 24) return 200 * level;
    if (level >= 25 && level <= 39) return 400 * level;
    if (level >= 40 && level <= 59) return 800 * level;
    if (level >= 60 && level <= 79) return 1600 * level;
    if (level >= 80 && level <= 99) return 3200 * level;
    if (level >= 100 && level <= 119) return 6400 * level;
    if (level >= 120) return 12800 * level;
    return 0;
}

// Ferme le modal
function closeModal() {
    document.getElementById("quest-modal").style.display = "none";
}

// Gestion du bouton de fermeture du modal
document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#quest-modal .close").onclick = closeModal;
    window.onclick = e => {
        if (e.target === document.getElementById("quest-modal")) closeModal();
    };
});

// Initialisation
document.addEventListener("DOMContentLoaded", async () => {
    await loadQuestsData();
    renderQuests();
});