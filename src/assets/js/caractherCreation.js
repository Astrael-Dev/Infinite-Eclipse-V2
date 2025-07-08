// 1. Cacher raceChoice et classChoice au chargement
document.addEventListener('DOMContentLoaded', () => {
    const raceChoice = document.getElementById('raceChoice');
    const classChoice = document.getElementById('classChoice');
    const raceToggle = document.getElementById('raceChoiceToggleBtn');
    const classToggle = document.getElementById('classChoiceToggleBtn');
    const raceGrid = document.querySelector('.race-choice-flexbox');
    const classGrid = document.querySelector('.class-choice-flexbox');

    // Cache les sélecteurs au départ
    raceChoice.style.display = 'none';
    classChoice.style.display = 'none';

    // 2. Toggle affichage
    raceToggle.addEventListener('click', () => {
        raceChoice.style.display = raceChoice.style.display === 'none' ? 'flex' : 'none';
        classChoice.style.display = 'none';
    });
    classToggle.addEventListener('click', () => {
        classChoice.style.display = classChoice.style.display === 'none' ? 'flex' : 'none';
        raceChoice.style.display = 'none';
    });

    // 3. Hover sound sur les cartes
    document.querySelectorAll('.race-card, .class-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            const audio = document.getElementById('hoverSound');
            if (audio) {
                audio.currentTime = 0;
                audio.play();
            }
        });
    });

    // Sélection genre (unique)
    document.querySelectorAll('.gender-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.gender-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
        });
    });

    // Sélection élément (unique)
    document.querySelectorAll('.element-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.element-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
        });
    });

    // 4. Sélection race
    document.querySelectorAll('.race-card').forEach(card => {
        card.addEventListener('click', () => {
            // Image de fond selon la race
            let img = '';
            switch (card.id) {
                case 'human': img = 'assets/images/races/human.jpg'; break;
                case 'elf': img = 'assets/images/races/elf.jpg'; break;
                case 'angelic': img = 'assets/images/races/angelic.jpg'; break;
                case 'demon': img = 'assets/images/races/demon.jpg'; break;
                case 'chaduron': img = 'assets/images/races/chaduron.jpg'; break;
                case 'amphibian': img = 'assets/images/races/amphibian.jpg'; break;
                case 'medusa': img = 'assets/images/races/medusa.jpg'; break;
                case 'orc': img = 'assets/images/races/orc.jpg'; break;
                default: img = ''; break;
            }
            if (img) {
                raceGrid.style.backgroundImage = `url('${img}')`;
                raceGrid.style.backgroundSize = 'cover';
                raceGrid.style.backgroundPosition = 'center';
            }
            // Change le texte du bouton
            const h2 = raceGrid.querySelector('button');
            if (h2) h2.innerHTML = card.querySelector('.race-title').textContent;
            raceChoice.style.display = 'none';
        });
    });

    // 5. Sélection classe
    document.querySelectorAll('.class-card').forEach(card => {
        card.addEventListener('click', () => {
            // Image de fond selon la classe
            let img = '';
            switch (card.id) {
                case 'knight': img = 'assets/images/classes/knight.jpg'; break;
                case 'mage': img = 'assets/images/classes/mage.jpg'; break;
                case 'rogue': img = 'assets/images/classes/rogue.jpg'; break;
                default: img = ''; break;
            }
            if (img) {
                classGrid.style.backgroundImage = `url('${img}')`;
                classGrid.style.backgroundSize = 'cover';
                classGrid.style.backgroundPosition = 'center';
            }
            // Change le texte du bouton
            const h2 = classGrid.querySelector('button');
            if (h2) h2.innerHTML = card.querySelector('.class-title').textContent;
            classChoice.style.display = 'none';
        });
    });

function getBaseStats() {
    return {
        pv: 100,
        pm: 100,
        atk: 50,
        def: 50,
        atkmag: 50,
        defmag: 50,
        agi: 50
    };
}

function getRaceBonus(race) {
    switch (race) {
        case 'Humain': return { atk: 20, def: -10, agi: 10 };
        case 'Elfe': return { agi: 20, pm: 30, def: -20, atkmag: 10 };
        case 'Angélique': return { pm: 20, atkmag: 40, def: -10, agi: 10 };
        case 'Démon': return { def: 30, defmag: 10, pm: -20 };
        case 'Chaduron': return { agi: 20, pm: 20, def: -20 };
        case 'Amphibien': return { defmag: 20, pm: 10, def: -10 };
        case 'Médusa': return { agi: 40, atkmag: 10, def: -10 };
        case 'Orc': return { def: 40, atk: 30, defmag: 10, pm: -30, atkmag: -30 };
        default: return {};
    }
}

function getClassBonus(classe) {
    switch (classe) {
        case 'Guerrier': return { atk: 40, def: 20, agi: -15, pm: -20 };
        case 'Mage': return { atkmag: 40, pm: 20, pv: -10};
        case 'Rôdeur': return { agi: 30, pv: 20, def: -10, atk: 10 };
        default: return {};
    }
}

function computeStats(race, classe) {
    const base = getBaseStats();
    const raceB = getRaceBonus(race);
    const classB = getClassBonus(classe);
    // Additionne tout
    for (const k in raceB) base[k] = (base[k] || 0) + raceB[k];
    for (const k in classB) base[k] = (base[k] || 0) + classB[k];
    // Clamp les valeurs minimales
    base.pv = Math.max(10, base.pv);
    base.pm = Math.max(0, base.pm);
    base.atk = Math.max(0, base.atk);
    base.def = Math.max(0, base.def);
    base.atkmag = Math.max(0, base.atkmag);
    base.defmag = Math.max(0, base.defmag);
    base.agi = Math.max(0, base.agi);
    return base;
}

function updateStatsDisplay() {
    // Récupère le nom de la race et classe sélectionnées
    const race = document.querySelector('.race-choice-flexbox button')?.textContent.trim() || '';
    const classe = document.querySelector('.class-choice-flexbox button')?.textContent.trim() || '';
    const stats = computeStats(race, classe);

    // Valeurs max pour la largeur des barres (pour 100%)
    const max = { pv: 150, pm: 150, atk: 100, def: 100, atkmag: 100, defmag: 100, agi: 100 };

    // Met à jour chaque stat
    document.getElementById('pv-value').textContent = stats.pv;
    document.getElementById('pv-bar').style.width = (100 * stats.pv / max.pv) + '%';

    document.getElementById('pm-value').textContent = stats.pm;
    document.getElementById('pm-bar').style.width = (100 * stats.pm / max.pm) + '%';

    document.getElementById('atk-value').textContent = stats.atk;
    document.getElementById('atk-bar').style.width = (100 * stats.atk / max.atk) + '%';

    document.getElementById('def-value').textContent = stats.def;
    document.getElementById('def-bar').style.width = (100 * stats.def / max.def) + '%';

    document.getElementById('atkmag-value').textContent = stats.atkmag;
    document.getElementById('atkmag-bar').style.width = (100 * stats.atkmag / max.atkmag) + '%';

    document.getElementById('defmag-value').textContent = stats.defmag;
    document.getElementById('defmag-bar').style.width = (100 * stats.defmag / max.defmag) + '%';

    document.getElementById('agi-value').textContent = stats.agi;
    document.getElementById('agi-bar').style.width = (100 * stats.agi / max.agi) + '%';
}

// Mets à jour à chaque changement de race ou classe
document.querySelectorAll('.race-card').forEach(card => {
    card.addEventListener('click', () => setTimeout(updateStatsDisplay, 100));
});
document.querySelectorAll('.class-card').forEach(card => {
    card.addEventListener('click', () => setTimeout(updateStatsDisplay, 100));
});

// Mets à jour au chargement
updateStatsDisplay();

function updateCompatibilityBars() {
    // Récupère le nom de la race et classe sélectionnées
    const race = document.querySelector('.race-choice-flexbox button')?.textContent.trim() || '';
    const classe = document.querySelector('.class-choice-flexbox button')?.textContent.trim() || '';
    const stats = computeStats(race, classe);

    // Physique : Attaque + Défense (0%=70, 100%=210)
    let phys = stats.atk + stats.def;
    let physPct = Math.round(100 * (phys - 70) / (210 - 70));
    physPct = Math.max(0, Math.min(physPct, 100));

    // Magique : Attaque Magique + PM (0%=90, 100%=270)
    let mag = stats.atkmag + stats.pm;
    let magPct = Math.round(100 * (mag - 90) / (270 - 90));
    magPct = Math.max(0, Math.min(magPct, 100));

    // Vitesse : Agilité seule (0%=25, 100%=120)
    let vit = stats.agi;
    let vitPct = Math.round(100 * (vit - 25) / (120 - 25));
    vitPct = Math.max(0, Math.min(vitPct, 100));

    // Barres
    document.getElementById('phys-bar').style.width = physPct + '%';
    document.getElementById('mag-bar').style.width = magPct + '%';
    document.getElementById('vit-bar').style.width = vitPct + '%';

    document.getElementById('phys-label').textContent = physPct + '%';
    document.getElementById('mag-label').textContent = magPct + '%';
    document.getElementById('vit-label').textContent = vitPct + '%';

    // Descriptions dynamiques
    document.getElementById('phys-desc').textContent = getPhysDesc(physPct);
    document.getElementById('mag-desc').textContent = getMagDesc(magPct);
    document.getElementById('vit-desc').textContent = getVitDesc(vitPct);
}

function getPhysDesc(p) {
    if (p === 100) return "Le total de votre statistique d'Attaque et celle de Défense est celle qui vous portera loin, elles sont parfaites.";
    if (p === 0) return "Votre Physique est au plus bas. Attention à la moindre attaque, vous êtes très vulnérable.";
    if (p < 30) return "Votre Physique est faible, vous aurez du mal à encaisser ou à frapper fort.";
    if (p < 60) return "Votre Physique est moyen, vous pouvez tenir mais sans exceller.";
    if (p < 90) return "Votre Physique est bon, vous pouvez compter sur votre force et votre robustesse.";
    return "Votre Physique est excellent, vous êtes un roc sur le champ de bataille.";
}
function getMagDesc(p) {
    if (p === 100) return "Votre potentiel magique est exceptionnel, vous êtes un prodige des arcanes.";
    if (p === 0) return "Votre Magie est inexistante, impossible de lancer le moindre sort.";
    if (p < 30) return "Votre Magie est très limitée, vous aurez du mal à utiliser des pouvoirs magiques.";
    if (p < 60) return "Votre Magie est correcte, vous pouvez lancer quelques sorts simples.";
    if (p < 90) return "Votre Magie est bonne, vous maniez les arcanes avec aisance.";
    return "Votre Magie est très élevée, vous rivalisez avec les plus grands mages.";
}
function getVitDesc(p) {
    if (p === 100) return "Votre Vitesse est fulgurante, personne ne peut vous rattraper.";
    if (p === 0) return "Votre Vitesse est au plus bas, chaque action sera lente et laborieuse.";
    if (p < 30) return "Votre Vitesse est faible, vous risquez d'être souvent dépassé.";
    if (p < 60) return "Votre Vitesse est moyenne, vous suivez le rythme sans briller.";
    if (p < 90) return "Votre Vitesse est bonne, vous êtes vif et réactif.";
    return "Votre Vitesse est excellente, vous êtes un éclair sur le terrain.";
}

// Mets à jour à chaque changement de race ou classe
document.querySelectorAll('.race-card').forEach(card => {
    card.addEventListener('click', () => setTimeout(() => {
        updateStatsDisplay();
        updateCompatibilityBars();
    }, 100));
});
document.querySelectorAll('.class-card').forEach(card => {
    card.addEventListener('click', () => setTimeout(() => {
        updateStatsDisplay();
        updateCompatibilityBars();
    }, 100));
});

// Mets à jour au chargement
updateCompatibilityBars();

document.getElementById('confirmCharacterBtn').addEventListener('click', () => {
    // Récupère les valeurs sélectionnées
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const gender = document.querySelector('.gender-option.selected .gender-option-title')?.textContent || '';
    const race = document.querySelector('.race-choice-flexbox button')?.textContent.trim() || '';
    const classe = document.querySelector('.class-choice-flexbox button')?.textContent.trim() || '';
    const element = document.querySelector('.element-option.selected .element-option-title')?.textContent || '';

    // Vérifie que tout est rempli
    if (!firstName || !lastName || !gender || !race || !classe || !element) {
        alert('Merci de remplir tous les champs et de faire tous les choix.');
        return;
    }

    if (!confirm("Êtes-vous sûr de vouloir continuer ? Vous ne pourrez plus modifier votre création.")) return;

    // Calcule les stats finales
    const stats = computeStats(race, classe);

    // Sauvegarde dans localStorage
    localStorage.setItem('characterFirstName', firstName);
    localStorage.setItem('characterLastName', lastName);
    localStorage.setItem('characterGender', gender);
    localStorage.setItem('characterRace', race);
    localStorage.setItem('characterClass', classe);
    localStorage.setItem('characterElement', element);
    localStorage.setItem('characterStats', JSON.stringify(stats));

    // Redirige
    window.location.href = 'caracther-manager.html';
    });
});
