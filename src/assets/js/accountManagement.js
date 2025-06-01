// Sélection des éléments
const registerModal = document.getElementById('registerModal');
const registerButton = document.querySelector('.register-btn');
const closeModalButton = document.querySelector('.modal-content .close');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const registerForm = document.getElementById('registerForm');
const loginButton = document.querySelector('.login-btn');
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const loginPassword = document.getElementById('loginPassword');
const loginMessage = document.getElementById('loginMessage');
const loginError = document.getElementById('loginError');
const loginModalClose = loginModal.querySelector('.close');

// Ouvrir le modal d'inscription
registerButton.addEventListener('click', () => {
    const user = JSON.parse(localStorage.getItem('user')); // Vérifie si un compte existe dans localStorage

    if (user) {
        alert(`Un compte au nom de ${user.username} est déjà présent !`);
    } else {
        registerModal.style.display = 'flex';
    }
});

// Fermer le modal d'inscription
closeModalButton.addEventListener('click', () => {
    registerModal.style.display = 'none';
});

// Fermer le modal en cliquant en dehors du contenu
window.addEventListener('click', (event) => {
    if (event.target === registerModal) {
        registerModal.style.display = 'none';
    }
});

// Afficher l'image sélectionnée dans le rond
imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            imagePreview.innerHTML = '';
            imagePreview.appendChild(img);
            img.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// Fonction utilitaire pour choisir la vidéo selon le mode sombre
function getWelcomeVideoSrc() {
    return localStorage.getItem('darkMode') === '1'
        ? 'assets/videos/homeBlack.mp4'
        : 'assets/videos/homeWhite.mp4';
}

// Sauvegarder les informations et afficher le message de bienvenue
registerForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const image = imagePreview.querySelector('img')?.src || '';

    localStorage.setItem('user', JSON.stringify({ username, password, image }));

    const backgroundAudio = document.getElementById('backgroundAudio');
    const videoSrc = getWelcomeVideoSrc();

    document.body.innerHTML = `
        <video class="background-video" autoplay muted loop playsinline>
            <source src="${videoSrc}" type="video/mp4">
        </video>
        <div class="welcome-container">
            <img src="${image}" alt="User Image" class="user-image">
            <h1 class="welcome-text">Bienvenue ${username} !</h1>
        </div>
    `;

    document.body.appendChild(backgroundAudio);

    const welcomeText = document.querySelector('.welcome-text');
    welcomeText.classList.add('slide-in');

    setTimeout(() => {
        window.location.href = 'inventory.html';
    }, 4000);
});

// Ouvrir le modal de connexion
loginButton.addEventListener('click', () => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user) {
        loginModal.style.display = 'flex';
        document.getElementById('loginUsername').textContent = user.username;
    } else {
        alert("Aucun compte n'a été trouvé, veuillez en créer un.");
    }
});

// Fermer le modal de connexion
loginModalClose.addEventListener('click', () => {
    loginModal.style.display = 'none';
});

// Fermer le modal en cliquant en dehors du contenu
window.addEventListener('click', (event) => {
    if (event.target === loginModal) {
        loginModal.style.display = 'none';
    }
});

// Vérifier le mot de passe
loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const user = JSON.parse(localStorage.getItem('user'));
    const enteredPassword = loginPassword.value;

    if (user && enteredPassword === user.password) {
        loginPassword.classList.remove('error');
        loginPassword.classList.add('success');
        loginError.style.display = 'none';

        loginModal.style.display = 'none';

        const backgroundAudio = document.getElementById('backgroundAudio');
        const videoSrc = getWelcomeVideoSrc();

        document.body.innerHTML = `
            <video class="background-video" autoplay muted loop playsinline>
                <source src="${videoSrc}" type="video/mp4">
            </video>
            <div class="welcome-container">
                <img src="${user.image}" alt="User Image" class="user-image">
                <h1 class="welcome-text">Bienvenue ${user.username} !</h1>
            </div>
        `;

        document.body.appendChild(backgroundAudio);

        const welcomeText = document.querySelector('.welcome-text');
        welcomeText.classList.add('slide-in');

        setTimeout(() => {
            window.location.href = 'inventory.html';
        }, 4000);
    } else {
        loginPassword.classList.remove('success');
        loginPassword.classList.add('error');
        loginError.style.display = 'block';
    }
});