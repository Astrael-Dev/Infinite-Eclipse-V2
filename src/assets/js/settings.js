const accountTab = document.getElementById('accountTab');
const themeTab = document.getElementById('themeTab');
const accountSection = document.getElementById('accountSection');
const themeSection = document.getElementById('themeSection');

// Remplir les champs avec les infos du localStorage
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    document.getElementById('profilePictureLarge').src = user.image || '../assets/images/icons/logo_default.png';
    document.getElementById('usernameInput').value = user.username || '';
    document.getElementById('passwordInput').value = user.password || '';
});

// Changer l'image de profil
document.getElementById('profileImageInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            document.getElementById('profilePictureLarge').src = evt.target.result;
            // Mettre à jour dans localStorage
            let user = JSON.parse(localStorage.getItem('user')) || {};
            user.image = evt.target.result;
            localStorage.setItem('user', JSON.stringify(user));
        };
        reader.readAsDataURL(file);
    }
});

// Changer le pseudo
document.getElementById('editUsernameBtn').addEventListener('click', function() {
    const input = document.getElementById('usernameInput');
    if (input.disabled) {
        input.disabled = false;
        input.focus();
        this.textContent = "Valider";
    } else {
        input.disabled = true;
        this.textContent = "Changer le pseudo";
        // Sauvegarder dans localStorage
        let user = JSON.parse(localStorage.getItem('user')) || {};
        user.username = input.value;
        localStorage.setItem('user', JSON.stringify(user));
    }
});

// Changer le mot de passe
document.getElementById('editPasswordBtn').addEventListener('click', function() {
    const input = document.getElementById('passwordInput');
    if (input.disabled) {
        input.disabled = false;
        input.focus();
        this.textContent = "Valider";
    } else {
        input.disabled = true;
        this.textContent = "Changer le mot de passe";
        // Sauvegarder dans localStorage
        let user = JSON.parse(localStorage.getItem('user')) || {};
        user.password = input.value;
        localStorage.setItem('user', JSON.stringify(user));
    }
});

if (accountTab && themeTab && accountSection && themeSection) {
    accountTab.onclick = () => {
        accountTab.classList.add('active');
        themeTab.classList.remove('active');
        accountSection.style.display = '';
        themeSection.style.display = 'none';
    };
    themeTab.onclick = () => {
        themeTab.classList.add('active');
        accountTab.classList.remove('active');
        accountSection.style.display = 'none';
        themeSection.style.display = '';
    };
}

// Dropdown thème
const dropdownBtn = document.getElementById('themeDropdownBtn');
const dropdown = document.getElementById('themeDropdown');
dropdownBtn.onclick = (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('show');
};
document.querySelectorAll('.theme-option').forEach(opt => {
    opt.onclick = () => {
        const theme = opt.getAttribute('data-theme');
        if (theme === 'dark') {
            localStorage.setItem('darkMode', '1');
            document.body.setAttribute('data-theme', 'dark');
        } else {
            localStorage.setItem('darkMode', '0');
            document.body.removeAttribute('data-theme');
        }
        dropdown.classList.remove('show');
        dropdownBtn.focus(); // Force le focus ailleurs
        // Ajout : retire le focus de l'option pour corriger le style
        opt.blur();
    };
});
window.addEventListener('click', function(e) {
    if (!e.target.closest('.theme-dropdown-container')) {
        dropdown.classList.remove('show');
    }
});