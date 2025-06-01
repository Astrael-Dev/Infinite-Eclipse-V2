let showAllTransactions = false;

function loadWallet() {
    let wallet = parseInt(localStorage.getItem('wallet')) || 0; // Convertit en entier
    document.getElementById('walletAmount').innerText = wallet.toLocaleString('fr-FR') + ' 💎'; // Format français avec espaces
    loadTransactionHistory();
}

function addToWallet() {
    let transactionAmount = parseInt(document.getElementById('transactionAmount').value); // Convertit en entier
    let transactionName = document.getElementById('transactionName').value.trim();
    if (isNaN(transactionAmount) || transactionAmount <= 0 || transactionName === '') {
        alert('Veuillez entrer un montant et un nom de transaction valides.');
        return;
    }

    let wallet = parseInt(localStorage.getItem('wallet')) || 0;
    wallet += transactionAmount;
    localStorage.setItem('wallet', wallet);
    addTransactionToHistory(transactionAmount, 'gain', transactionName);
    loadWallet();
}

function removeFromWallet() {
    let transactionAmount = parseInt(document.getElementById('transactionAmount').value); // Convertit en entier
    let transactionName = document.getElementById('transactionName').value.trim();
    if (isNaN(transactionAmount) || transactionAmount <= 0 || transactionName === '') {
        alert('Veuillez entrer un montant et un nom de transaction valides.');
        return;
    }

    let wallet = parseInt(localStorage.getItem('wallet')) || 0;
    if (transactionAmount > wallet) {
        alert('Fonds insuffisants.');
        return;
    }

    wallet -= transactionAmount;
    localStorage.setItem('wallet', wallet);
    addTransactionToHistory(transactionAmount, 'loss', transactionName);
    loadWallet();
}

function addTransactionToHistory(amount, type, name) {
    let transactionHistory = JSON.parse(localStorage.getItem('transactionHistory')) || [];
    let transaction = {
        amount: amount,
        type: type,
        name: name,
        date: new Date().toLocaleString('fr-FR') // Format de date français
    };
    transactionHistory.push(transaction);
    localStorage.setItem('transactionHistory', JSON.stringify(transactionHistory));
    loadTransactionHistory();
}

function loadTransactionHistory() {
    let transactionHistory = JSON.parse(localStorage.getItem('transactionHistory')) || [];
    let transactionHistoryDiv = document.getElementById('transactionHistory');
    transactionHistoryDiv.innerHTML = '';

    let transactionsToShow = showAllTransactions ? transactionHistory : transactionHistory.slice(-15);

    transactionsToShow.forEach(transaction => {
        let transactionDiv = document.createElement('div');
        transactionDiv.style.color = transaction.type === 'gain' ? 'green' : 'red';
        transactionDiv.innerText = `${transaction.date} - ${transaction.name} - ${transaction.type === 'gain' ? '+' : '-'}${transaction.amount.toLocaleString('fr-FR')} 💎`;
        transactionHistoryDiv.appendChild(transactionDiv);
    });

    document.getElementById('toggleReportButton').innerText = showAllTransactions ? 'Afficher les 15 dernières transactions' : 'Afficher le rapport complet';
}

function toggleReport() {
    showAllTransactions = !showAllTransactions;
    loadTransactionHistory();
}

function resetWallet() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser votre portefeuille et l\'historique des transactions ?')) {
        localStorage.setItem('wallet', 0);
        localStorage.setItem('transactionHistory', JSON.stringify([]));
        loadWallet();
    }
}

window.onload = loadWallet;