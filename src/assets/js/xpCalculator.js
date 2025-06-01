// Fonction pour obtenir l'XP nécessaire pour un niveau donné
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

// Fonction pour obtenir le rang correspondant à un niveau
function getRank(level) {
    if (level >= 1 && level <= 14) return "Débutant(e) (Rang F)";
    if (level >= 15 && level <= 24) return "Apprenti(e) (Rang E)";
    if (level >= 25 && level <= 39) return "Néophyte (Rang D)";
    if (level >= 40 && level <= 59) return "Expert(e) (Rang C)";
    if (level >= 60 && level <= 79) return "Spécialiste (Rang B)";
    if (level >= 80 && level <= 99) return "Élite (Rang A)";
    if (level >= 100 && level <= 119) return "Magiologue (Rang S)";
    if (level >= 120) return "Archmages (Rang S+)";
    return "";
}

// Fonction pour calculer l'XP
function calculateXP() {
    const currentLevelInput = document.getElementById('currentLevel');
    const xpGainedInput = document.getElementById('xpGained');

    let currentLevel = parseInt(currentLevelInput.value) || 1;
    let xpGained = parseInt(xpGainedInput.value) || 0;

    let totalXP = parseInt(localStorage.getItem('totalXP')) || 0;
    totalXP += xpGained;

    let currentXP = parseInt(localStorage.getItem('currentXP')) || 0;
    currentXP += xpGained;

    let xpForNextLevel = getXpForLevel(currentLevel);
    let leveledUp = false;
    let previousRank = getRank(currentLevel);

    // Boucle pour gérer les montées de niveau
    while (currentXP >= xpForNextLevel) {
        currentXP -= xpForNextLevel;
        currentLevel++;
        xpForNextLevel = getXpForLevel(currentLevel);
        leveledUp = true;
    }

    let newRank = getRank(currentLevel);

    // Mise à jour des données dans localStorage
    localStorage.setItem('totalXP', totalXP);
    localStorage.setItem('currentXP', currentXP);
    localStorage.setItem('currentLevel', currentLevel);

    // Mise à jour des champs d'entrée
    currentLevelInput.value = currentLevel;

    // Affichage des résultats
    const resultElement = document.getElementById('result');
    if (leveledUp) {
        resultElement.innerHTML = `Bravo ! Vous montez de niveau !<br>Niveau : ${currentLevel} atteint !<br>XP actuel : ${totalXP}`;
        if (newRank !== previousRank) {
            resultElement.innerHTML += `<br>Wow ! Vous êtes maintenant ${newRank} !`;
        }
    } else {
        resultElement.innerHTML = `Niveau actuel : ${currentLevel}, XP actuel : ${totalXP}`;
    }

    // Mise à jour des barres de progression
    updateProgressBars(currentLevel, currentXP, totalXP, xpForNextLevel);
}

// Fonction pour mettre à jour les barres de progression
function updateProgressBars(currentLevel, currentXP, totalXP, xpForNextLevel) {
    const maxLevel = 120;
    const maxXP = 10000000;

    document.getElementById('levelProgress').style.width = (currentLevel / maxLevel) * 100 + '%';
    document.getElementById('levelLabel').innerText = currentLevel;

    document.getElementById('xpProgress').style.width = (totalXP / maxXP) * 100 + '%';
    document.getElementById('xpLabel').innerText = totalXP;

    document.getElementById('remainingXPProgress').style.width = (currentXP / xpForNextLevel) * 100 + '%';
    document.getElementById('remainingXPLabel').innerText = `${currentXP} / ${xpForNextLevel}`;
}

// Fonction pour réinitialiser la progression
function resetProgress() {
    if (confirm("Êtes-vous sûr de vouloir réinitialiser votre progression ?")) {
        localStorage.setItem('totalXP', 0);
        localStorage.setItem('currentXP', 0);
        localStorage.setItem('currentLevel', 1);

        document.getElementById('currentLevel').value = 1;
        document.getElementById('xpGained').value = 0;
        document.getElementById('result').innerHTML = '';

        updateProgressBars(1, 0, 0, getXpForLevel(1));
    }
}

// Initialisation des barres de progression au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    const currentLevel = parseInt(localStorage.getItem('currentLevel')) || 1;
    const currentXP = parseInt(localStorage.getItem('currentXP')) || 0;
    const totalXP = parseInt(localStorage.getItem('totalXP')) || 0;
    const xpForNextLevel = getXpForLevel(currentLevel);

    updateProgressBars(currentLevel, currentXP, totalXP, xpForNextLevel);
});