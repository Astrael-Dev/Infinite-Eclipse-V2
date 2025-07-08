let inventories = JSON.parse(localStorage.getItem('inventories')) || {};
let currentInventory = localStorage.getItem('currentInventory') || 'default';

if (!inventories[currentInventory]) {
    inventories[currentInventory] = {};
}

// --- MODAL DE SÉLECTION D'OBJETS RP ---
let allItems = []; // Liste des objets du RP chargés depuis le JSON
let chestItems = []; // Liste des coffres depuis chest.json
let currentCategory = '';
let elementsList = []; // Liste des éléments (depuis elements.json)
let elementsMap = {};  // id => nom

async function loadElements() {
    const res = await fetch('data/elements.json');
    const data = await res.json();
    elementsList = data.Elements || [];
    elementsMap = {};
    elementsList.forEach(el => {
        elementsMap[el.id] = el.name;
    });
}

async function loadAllItems() {
    await loadElements();
    // Toujours recharger pour être sûr d'avoir tous les items à jour
    const res = await fetch('data/items.json');
    const data = await res.json();
    allItems = [];
    Object.values(data).forEach(arr => {
        arr.forEach(item => {
            // Si type "Objets", on le transforme en "Divers" pour la sélection
            // Si type "Consommable", on le transforme en "Consommables" pour la sélection
            let type = item.type;
            if (type && type.toLowerCase() === "objets") {
                type = "Divers";
            } else if (type && type.toLowerCase() === "consommable") {
                type = "Consommables";
            }
            // Utiliser l'ID d'élément si présent
            let elementId = item.element;
            let elementName = elementId && elementsMap[elementId] ? elementsMap[elementId] : '';
            allItems.push({ ...item, type, element: elementId, elementName });
        });
    });
    // Charger les coffres depuis chest.json
    const chestRes = await fetch('data/chests.json');
    const chestData = await chestRes.json();
    chestItems = chestData.Chests || [];
    return allItems;
}

async function openItemSelectModal() {
    await loadAllItems();
    await renderElementFilterOptions();
    document.getElementById('itemSelectModal').style.display = 'flex';
    renderItemSelectList();
    document.getElementById('itemSelectDetails').innerHTML = '<p>Sélectionnez un objet à gauche.</p>';
}

function closeItemSelectModal() {
    document.getElementById('itemSelectModal').style.display = 'none';
}

function filterCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.item-select-categories button').forEach(btn => btn.classList.remove('active'));
    if (cat === '') document.getElementById('catAll').classList.add('active');
    if (cat === 'Arme') document.getElementById('catArme').classList.add('active');
    if (cat === 'Armure') document.getElementById('catArmure').classList.add('active');
    if (cat === 'Artéfact') document.getElementById('catArtefact').classList.add('active');
    if (cat === 'Coffre') document.getElementById('catCoffre').classList.add('active');
    if (cat === 'Divers') document.getElementById('catDivers').classList.add('active');
    if (cat === 'Consommables') document.getElementById('catConsommables').classList.add('active');
    renderItemSelectList();
}

function renderItemSelectList() {
    const listDiv = document.getElementById('itemSelectList');
    const search = document.getElementById('itemSearchInput').value.trim().toLowerCase();
    const filterClasse = document.getElementById('filterClasse').value;
    const filterRarity = document.getElementById('filterRarity').value;
    const filterElement = document.getElementById('filterElement').value;

    let filtered = [];
    if (currentCategory === 'Coffre') {
        filtered = chestItems.filter(item => {
            let ok = true;
            if (search) ok = ok && item.name && item.name.toLowerCase().includes(search);
            if (filterRarity) ok = ok && item.rarity === filterRarity;
            if (filterElement) {
                if (Array.isArray(item.element)) {
                    ok = ok && item.element.includes(filterElement);
                } else if (typeof item.element === "string" && item.element.trim() !== "") {
                    ok = ok && item.element === filterElement;
                } else {
                    ok = false;
                }
            }
            return ok;
        });
    } else if (currentCategory === '') {
        // Inclure tous les items ET les coffres dans "Tout"
        filtered = [
            ...allItems.filter(item => {
                let ok = true;
                let type = item.type;
                if (type && type.toLowerCase() === "objets") type = "Divers";
                if (type && type.toLowerCase() === "consommable") type = "Consommables";
                if (search) ok = ok && item.name.toLowerCase().includes(search);
                if (filterRarity) ok = ok && item.rarity === filterRarity;
                if (filterClasse) {
                    if (Array.isArray(item.DestinatedClass)) {
                        ok = ok && item.DestinatedClass.map(c => c.toLowerCase()).includes(filterClasse.toLowerCase());
                    } else if (typeof item.DestinatedClass === "string" && item.DestinatedClass.trim() !== "") {
                        ok = ok && item.DestinatedClass.toLowerCase() === filterClasse.toLowerCase();
                    } else {
                        ok = false;
                    }
                }
                if (filterElement) {
                    if (Array.isArray(item.element)) {
                        ok = ok && item.element.includes(filterElement);
                    } else if (typeof item.element === "string" && item.element.trim() !== "") {
                        ok = ok && item.element === filterElement;
                    } else {
                        ok = false;
                    }
                }
                return ok;
            }),
            ...chestItems.filter(item => {
                let ok = true;
                if (search) ok = ok && item.name && item.name.toLowerCase().includes(search);
                if (filterRarity) ok = ok && item.rarity === filterRarity;
                if (filterElement) {
                    if (Array.isArray(item.element)) {
                        ok = ok && item.element.includes(filterElement);
                    } else if (typeof item.element === "string" && item.element.trim() !== "") {
                        ok = ok && item.element === filterElement;
                    } else {
                        ok = false;
                    }
                }
                return ok;
            })
        ];
    } else {
        filtered = allItems.filter(item => {
            let ok = true;
            let type = item.type;
            if (type && type.toLowerCase() === "objets") type = "Divers";
            if (type && type.toLowerCase() === "consommable") type = "Consommables";
            if (currentCategory && type) ok = ok && type.toLowerCase().includes(currentCategory.toLowerCase());
            if (search) ok = ok && item.name.toLowerCase().includes(search);
            if (filterRarity) ok = ok && item.rarity === filterRarity;
            if (filterClasse) {
                if (Array.isArray(item.DestinatedClass)) {
                    ok = ok && item.DestinatedClass.map(c => c.toLowerCase()).includes(filterClasse.toLowerCase());
                } else if (typeof item.DestinatedClass === "string" && item.DestinatedClass.trim() !== "") {
                    ok = ok && item.DestinatedClass.toLowerCase() === filterClasse.toLowerCase();
                } else {
                    ok = false;
                }
            }
            if (filterElement) {
                if (Array.isArray(item.element)) {
                    ok = ok && item.element.includes(filterElement);
                } else if (typeof item.element === "string" && item.element.trim() !== "") {
                    ok = ok && item.element === filterElement;
                } else {
                    ok = false;
                }
            }
            return ok;
        });
    }

    // Tri alphabétique A → Z
    filtered.sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));

    listDiv.innerHTML = '';
    filtered.forEach((item, idx) => {
        const row = document.createElement('div');
        row.className = 'item-select-row';
        row.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name}">
            <span>${item.name}</span>
        `;
        row.onclick = () => showItemSelectDetails(item);
        listDiv.appendChild(row);
    });
}

// Ajoute les émojis pour les classes dans les détails
function getClassEmoji(className) {
    switch (className.toLowerCase()) {
        case "guerrier":
            return "⚔️";
        case "mage":
            return "🔮";
        case "rôdeur":
        case "rodeur":
            return "🏹";
        default:
            return "";
    }
}

function showItemSelectDetails(item) {
    const detailsDiv = document.getElementById('itemSelectDetails');
    // Affichage des classes avec émojis et séparateur /
    let classDisplay = '';
    if (item.DestinatedClass) {
        if (Array.isArray(item.DestinatedClass)) {
            classDisplay = item.DestinatedClass
                .map(c => `${getClassEmoji(c)} ${c}`)
                .join(' / ');
        } else if (typeof item.DestinatedClass === "string") {
            classDisplay = `${getClassEmoji(item.DestinatedClass)} ${item.DestinatedClass}`;
        }
    }
    // Affichage des éléments
    let elementDisplay = '';
    if (item.element) {
        if (Array.isArray(item.element)) {
            elementDisplay = item.element.map(eid => elementsMap[eid] || eid).join(' / ');
        } else if (typeof item.element === "string") {
            elementDisplay = elementsMap[item.element] || item.element;
        }
    }
    detailsDiv.innerHTML = `
        <img src="${item.imageUrl}" alt="${item.name}">
        <div class="item-name">${item.name}</div>
        <div class="item-rarity rarity-${getRarityClass(item.rarity)}">${item.rarity}</div>
        <div class="item-value">Valeur : ${item.value ?? '—'}💎</div>
        ${classDisplay ? `<div class="item-class">${classDisplay}</div>` : ''}
        ${elementDisplay ? `<div class="item-element">${elementDisplay}</div>` : ''}
        <br>
        <div class="item-desc">${item.description ?? ''}</div>
        <button class="add-btn" onclick="addSelectedItem('${item.name.replace(/'/g, "\\'")}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-plus-icon lucide-square-plus"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
            Ajouter à l'inventaire
        </button>
    `;
}

// MODAL DE QUANTITÉ
function showQuantityModal(defaultValue = 1, maxValue = 99, action = "Ajouter") {
    return new Promise((resolve, reject) => {
        let modal = document.getElementById('quantityModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'quantityModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content quantity-modal-content">
                    <h2>${action} - Quantité</h2>
                    <input type="number" id="quantityInput" min="1" max="${maxValue}" value="${defaultValue}" style="width:80px; font-size:1.2rem; text-align:center; margin: 20px 0;">
                    <div class="quantity-modal-actions">
                        <button class="add-btn" id="quantityConfirmBtn">${action}</button>
                        <button class="btn-remove" id="quantityCancelBtn">Annuler</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        } else {
            modal.querySelector('h2').textContent = `${action} - Quantité`;
            const input = modal.querySelector('#quantityInput');
            input.value = defaultValue;
            input.max = maxValue;
            input.min = 1;
            modal.style.display = 'flex';
        }

        modal.style.display = 'flex';
        const input = modal.querySelector('#quantityInput');
        input.focus();
        input.select();

        const confirmBtn = modal.querySelector('#quantityConfirmBtn');
        const cancelBtn = modal.querySelector('#quantityCancelBtn');
        confirmBtn.onclick = () => {
            let qty = parseInt(input.value, 10);
            if (isNaN(qty) || qty < 1) qty = 1;
            if (qty > maxValue) qty = maxValue;
            modal.style.display = 'none';
            resolve(qty);
        };
        cancelBtn.onclick = () => {
            modal.style.display = 'none';
            reject();
        };
        input.onkeydown = (e) => {
            if (e.key === "Enter") confirmBtn.click();
            if (e.key === "Escape") cancelBtn.click();
        };
    });
}

// --- AJOUT AVEC MODAL QUANTITÉ ---
async function addSelectedItem(itemName) {
    let item = allItems.find(i => i.name === itemName);
    if (!item) item = chestItems.find(i => i.name === itemName);
    if (!item) return;
    try {
        const qty = await showQuantityModal(1, 99, "Ajouter");
        if (!inventories[currentInventory][item.name]) {
            inventories[currentInventory][item.name] = { imageUrl: '', rarity: '', quantity: 0, element: '' };
        }
        inventories[currentInventory][item.name].imageUrl = item.imageUrl;
        inventories[currentInventory][item.name].rarity = getRarityNumber(item.rarity);
        inventories[currentInventory][item.name].element = item.element || '';
        inventories[currentInventory][item.name].quantity += qty;
        localStorage.setItem('inventories', JSON.stringify(inventories));
        alert(`${item.name} ajouté à votre inventaire (${qty}).`);
        loadInventory();
        closeItemSelectModal();
    } catch {
        // Annulé
    }
}

// --- SUPPRESSION AVEC MODAL QUANTITÉ ---
async function removeItem(itemName) {
    if (inventories[currentInventory][itemName]) {
        const maxQty = inventories[currentInventory][itemName].quantity;
        try {
            const qty = await showQuantityModal(1, maxQty, "Supprimer");
            inventories[currentInventory][itemName].quantity -= qty;
            if (inventories[currentInventory][itemName].quantity <= 0) {
                delete inventories[currentInventory][itemName];
            }
            localStorage.setItem('inventories', JSON.stringify(inventories));
            loadInventory();
        } catch {
            // Annulé
        }
    }
}

// Ajoute dynamiquement les options d'éléments dans le filtre
async function renderElementFilterOptions() {
    if (!elementsList.length) await loadElements();
    const filterElement = document.getElementById('filterElement');
    if (!filterElement) return;
    filterElement.innerHTML = `<option value="">Élément (tous)</option>`;
    elementsList.forEach(el => {
        filterElement.innerHTML += `<option value="${el.id}">${el.name}</option>`;
    });
}

// Filtres listeners
window.addEventListener('DOMContentLoaded', () => {
    renderElementFilterOptions();
    const searchInput = document.getElementById('itemSearchInput');
    const filterClasse = document.getElementById('filterClasse');
    const filterRarity = document.getElementById('filterRarity');
    const filterElement = document.getElementById('filterElement');
    if (searchInput) searchInput.addEventListener('input', renderItemSelectList);
    if (filterClasse) filterClasse.addEventListener('change', renderItemSelectList);
    if (filterRarity) filterRarity.addEventListener('change', renderItemSelectList);
    if (filterElement) filterElement.addEventListener('change', renderItemSelectList);
});

// --- AJOUT MANUEL (ANCIEN SYSTÈME) ---
function addItem() {
    const itemName = document.getElementById('addItemName').value.trim();
    const imageUrl = document.getElementById('addItemImage').value.trim();
    const itemRarity = document.getElementById('addItemRarity').value;
    const itemQuantity = Math.max(1, Math.min(99, parseInt(document.getElementById('addItemQuantity').value, 10) || 1));
    const itemElement = document.getElementById('addItemElement') ? document.getElementById('addItemElement').value : '';

    if (!itemName || !imageUrl || !itemRarity) {
        alert('Veuillez remplir tous les champs.');
        return;
    }

    if (!inventories[currentInventory][itemName]) {
        inventories[currentInventory][itemName] = { imageUrl: '', rarity: itemRarity, quantity: 0, element: '' };
    }
    inventories[currentInventory][itemName].imageUrl = imageUrl;
    inventories[currentInventory][itemName].rarity = itemRarity;
    inventories[currentInventory][itemName].element = itemElement;
    inventories[currentInventory][itemName].quantity += itemQuantity;

    localStorage.setItem('inventories', JSON.stringify(inventories));
    alert(`${itemName} ajouté à votre inventaire.`);
    loadInventory();
}

function loadInventory() {
    const inventoryList = document.getElementById('inventoryList');
    if (!inventoryList) return;
    inventoryList.innerHTML = '';

    for (const item in inventories[currentInventory]) {
        const div = document.createElement('div');
        div.className = 'inventory-item';
        const rarityClass = `rarity-${getRarityClass(inventories[currentInventory][item].rarity)}`;
        const rarityText = getRarityText(inventories[currentInventory][item].rarity);
        div.innerHTML = `
            <img src="${inventories[currentInventory][item].imageUrl}" alt="${item}" class="inventory-image">
            <div class="inventory-details">
                <div><strong>${item}</strong></div>
                <div>Quantité: ${inventories[currentInventory][item].quantity}</div>
            </div>
            <div class="inventory-footer">
                <div class="rarity ${rarityClass}">${rarityText}</div>
                <button class="btn-remove" onclick="removeItem('${item.replace(/'/g, "\\'")}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                    Supprimer
                </button>
            </div>
        `;
        inventoryList.appendChild(div);
    }
}
function getRarityText(rarity) {
    switch (rarity) {
        case '1': return 'Commun';
        case '2': return 'Peu commun';
        case '3': return 'Rare';
        case '4': return 'Épique';
        case '5': return 'Légendaire';
        case '6': return 'Mythique';
        default: return '';
    }
}
function getRarityClass(rarity) {
    switch (rarity) {
        case 'Commun': return 1;
        case 'Peu commun': return 2;
        case 'Rare': return 3;
        case 'Épique': return 4;
        case 'Légendaire': return 5;
        case 'Mythique': return 6;
        case '1': return 1;
        case '2': return 2;
        case '3': return 3;
        case '4': return 4;
        case '5': return 5;
        case '6': return 6;
        default: return 1;
    }
}
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

// Chargement initial de l'inventaire
loadInventory();