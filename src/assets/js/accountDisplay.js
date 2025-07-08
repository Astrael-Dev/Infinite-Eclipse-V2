// Fonction pour mettre à jour le header
function updateHeader() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            // Mettre à jour la photo de profil
            const userPicture = document.getElementById('userPicture');
            if (userPicture) {
                userPicture.src = user.image || 'assets/images/icons/logo_default.png'; // Image par défaut si aucune n'est choisie
            }

            // Mettre à jour le pseudo
            const userName = document.getElementById('userName');
            if (userName) {
                userName.textContent = user.username;
            }

            // Mettre à jour le montant du portefeuille
            const walletAmountDisplay = document.getElementById('walletAmountDisplay');
            if (walletAmountDisplay) {
                const walletAmount = parseInt(localStorage.getItem('wallet')) || 0; // Utilise la clé "wallet"
                walletAmountDisplay.textContent = `${walletAmount.toLocaleString()}`; // Format avec séparation des unités
            }
        } else {
            console.warn("Aucun utilisateur trouvé dans localStorage.");
        }
    } catch (error) {
        console.error("Erreur lors de la mise à jour du header :", error);
    }
}

// Appeler la fonction au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    updateHeader();

    // Actualiser les informations du portefeuille et des éclats toutes les 2ms
    setInterval(() => {
        const walletAmountDisplay = document.getElementById('walletAmountDisplay');
        if (walletAmountDisplay) {
            const walletAmount = parseInt(localStorage.getItem('wallet')) || 0;
            walletAmountDisplay.textContent = `${walletAmount.toLocaleString()}`;
        }
        const eclipseShardAmount = document.getElementById('eclipseShardAmount');
        if (eclipseShardAmount) {
            const shards = parseInt(localStorage.getItem('eclipseShards')) || 0;
            eclipseShardAmount.textContent = shards;
        }
    }, 2); // Intervalle de 2ms
});

// Initialiser le portefeuille si non défini
if (!localStorage.getItem('wallet')) {
    localStorage.setItem('wallet', '0'); // Utilise la clé "wallet"
// Initialiser les éclats du crépuscule si non défini
if (!localStorage.getItem('eclipseShards')) {
    localStorage.setItem('eclipseShards', '0');
}
}