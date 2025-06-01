// Utilitaires pour charger les items depuis le JSON
let chestItemsData = {};

async function loadChestItems() {
    if (Object.keys(chestItemsData).length) return chestItemsData;
    const response = await fetch('data/items.json');
    chestItemsData = await response.json();
    return chestItemsData;
}

// Gestion de l'inventaire (stocké dans localStorage)
function getInventory() {
    return JSON.parse(localStorage.getItem('inventories')) || {};
}
function getCurrentInventoryName() {
    return localStorage.getItem('currentInventory') || 'default';
}
function getCurrentInventory() {
    const inv = getInventory();
    return inv[getCurrentInventoryName()] || {};
}
function saveInventory(inv) {
    localStorage.setItem('inventories', JSON.stringify(inv));
}
function addItemToInventory(item) {
    const inv = getInventory();
    const name = getCurrentInventoryName();
    if (!inv[name]) inv[name] = {};
    if (!inv[name][item.name]) {
        inv[name][item.name] = {
            imageUrl: item.imageUrl || '',
            rarity: getRarityNumber(item.rarity), // Correction ici
            quantity: 0,
            element: item.element || ''
        };
    }
    // Met à jour les infos (utile si l'objet a été modifié dans le JSON)
    inv[name][item.name].imageUrl = item.imageUrl || '';
    inv[name][item.name].rarity = getRarityNumber(item.rarity); // Correction ici
    inv[name][item.name].element = item.element || '';
    inv[name][item.name].quantity += 1;
    saveInventory(inv);
}
// Fonction pour obtenir le numéro de rareté
function getRarityNumber(rarity) {
    switch (rarity) {
        case 'Commun': return '1';
        case 'Peu commun': return '2';
        case 'Rare': return '3';
        case 'Épique': return '4';
        case 'Légendaire': return '5';
        case 'Mythique': return '6';
        default: return '1';
    }
}

function removeItemFromInventory(itemName, quantity = 1) {
    const inv = getInventory();
    const name = getCurrentInventoryName();
    if (!inv[name]) return;
    // Recherche insensible à la casse et aux accents
    for (const key in inv[name]) {
        if (
            key.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() ===
            itemName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
        ) {
            inv[name][key].quantity -= quantity;
            if (inv[name][key].quantity <= 0) delete inv[name][key];
            saveInventory(inv);
            return;
        }
    }
}
function findChestKeyInInventory(chestName) {
    const inv = getCurrentInventory();
    for (const key in inv) {
        if (
            key.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() ===
            chestName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
        ) {
            if (inv[key].quantity > 0) return key;
        }
    }
    return null;
}

// --- NOUVELLE LOGIQUE SIMPLE ---
async function openChest(chestType) {
    const chestImages = {
        common: "assets/images/chests/common-chest.png",
        rare: "assets/images/chests/rare-chest.png",
        epic: "assets/images/chests/epic-chest.png",
        legendary: "assets/images/chests/legendary-chest.png"
    };
    const chestNames = {
        common: "Coffre Commun",
        rare: "Coffre Rare",
        epic: "Coffre Épique",
        legendary: "Coffre Légendaire"
    };
    const chestName = chestNames[chestType];
    const realKey = findChestKeyInInventory(chestName);
    if (!realKey) {
        alert("Ce coffre ne figure pas dans votre inventaire.");
        return;
    }
    removeItemFromInventory(realKey, 1);

    // Affiche le modal avec le coffre fermé
    const slotMachine = document.getElementById('slotMachine');
    slotMachine.innerHTML = `
        <div id="bigChestContainer" style="display:flex;justify-content:center;align-items:center;height:100%;">
            <img id="bigChestImg" src="${chestImages[chestType]}" alt="${chestName}" class="big-chest-img" style="width:300px;transition:transform 0.2s;">
        </div>
    `;
    document.getElementById('chestModal').style.display = 'flex';

    const bigChestImg = document.getElementById('bigChestImg');
    let alreadyClicked = false; // Empêche plusieurs clics

    // Animation au survol + son
    bigChestImg.onmouseover = () => {
        bigChestImg.style.transform = "scale(1.08) rotate(-7deg)";
        const shakeAudio = new Audio('assets/sounds/shake.mp3');
        shakeAudio.play();
    };
    bigChestImg.onmouseleave = () => {
        bigChestImg.style.transform = "scale(1) rotate(0deg)";
    };
    // Ouverture au clic
    bigChestImg.onclick = async () => {
        if (alreadyClicked) return;
        alreadyClicked = true;
        bigChestImg.style.transform = "scale(1.15) rotate(7deg)";
        bigChestImg.style.filter = "brightness(1.2)";
        setTimeout(async () => {
            // Sélectionne un loot aléatoire
            const itemsData = await loadChestItems();
            const rarities = {
                common: ["Commun", "Peu commun", "Rare"],
                rare: ["Peu commun", "Rare", "Épique"],
                epic: ["Rare", "Épique", "Légendaire"],
                legendary: ["Épique", "Légendaire", "Mythique"]
            };
            let chestItems = [];
            rarities[chestType].forEach(rarity => {
                if (itemsData[rarity]) {
                    chestItems = chestItems.concat(itemsData[rarity]);
                }
            });
            const loot = chestItems[Math.floor(Math.random() * chestItems.length)];
            displayLoot(loot);
            addToHistory(loot);
            addItemToInventory(loot); // Ajoute le loot à l'inventaire
            setTimeout(() => {
                closeModal();
            }, 2000);
        }, 500);
    };
}

// Affiche le loot obtenu
function displayLoot(item) {
    const lootDiv = document.getElementById('obtainedLoot');
    document.getElementById('obtainedLootName').textContent = item.name;
    document.getElementById('obtainedLootImage').src = item.imageUrl;
    document.getElementById('obtainedLootImage').alt = item.name;
    document.getElementById('obtainedLootRarity').textContent = item.rarity;
    document.getElementById('obtainedLootRarity').className = `rarity rarity-${getRarityClass(item.rarity)}`;
    lootDiv.style.display = 'flex';

    // Choix du son selon la rareté
    let soundSrc = '';
    switch (item.rarity) {
        case 'Commun':
        case 'Peu commun':
            soundSrc = 'assets/sounds/you-win-sequence1.mp3';
            break;
        case 'Rare':
        case 'Épique':
            soundSrc = 'assets/sounds/you-win-sequence2.mp3';
            break;
        case 'Légendaire':
        case 'Mythique':
            soundSrc = 'assets/sounds/you-win-sequence3.mp3';
            break;
        default:
            soundSrc = 'assets/sounds/you-win-sequence1.mp3';
    }
    const audio = new Audio(soundSrc);
    audio.play();

    setTimeout(() => { lootDiv.style.display = 'none'; }, 8000); // Masque le loot après 8 secondes
}

// Rareté → classe CSS
function getRarityClass(rarity) {
    switch (rarity) {
        case 'Commun': return 1;
        case 'Peu commun': return 2;
        case 'Rare': return 3;
        case 'Épique': return 4;
        case 'Légendaire': return 5;
        case 'Mythique': return 6;
        default: return 1;
    }
}

// Historique
function addToHistory(item) {
    const lootHistory = JSON.parse(localStorage.getItem('lootHistory')) || [];
    lootHistory.push(item);
    if (lootHistory.length > 15) lootHistory.shift();
    localStorage.setItem('lootHistory', JSON.stringify(lootHistory));
    loadLootHistory();
}
function loadLootHistory() {
    const lootHistory = JSON.parse(localStorage.getItem('lootHistory')) || [];
    const lootHistoryDiv = document.getElementById('lootHistory');
    lootHistoryDiv.innerHTML = '';
    lootHistory.slice().reverse().forEach(item => {
        const div = document.createElement('div');
        div.className = 'inventory-item';
        div.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name}" class="inventory-image">
            <div class="inventory-details">
                <div><strong>${item.name}</strong></div>
                <div>Type: ${item.type}</div>
                <div class="rarity rarity-${getRarityClass(item.rarity)}">${item.rarity}</div>
                <div>Valeur: ${item.value}💎</div>
            </div>
        `;
        lootHistoryDiv.appendChild(div);
    });
}
function clearHistory() {
    if (confirm("Êtes-vous sûr de vouloir effacer l'historique des obtentions ?")) {
        localStorage.removeItem('lootHistory');
        loadLootHistory();
        alert("L'historique des obtentions a été effacé !");
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadLootHistory();
    // Ajoute ici d'autres initialisations si besoin
});

// Modal close
function closeModal() {
    document.getElementById('chestModal').style.display = 'none';
}