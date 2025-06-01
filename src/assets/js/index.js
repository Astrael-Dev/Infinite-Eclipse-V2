const audio = document.getElementById('backgroundAudio');

// Fonction pour démarrer l'audio en boucle
function startAudioOnClick() {
    if (audio) {
        audio.loop = true;
        audio.volume = 0.05;
        audio.play().catch(error => {
            console.error('Erreur audio :', error);
        });
    }
    document.removeEventListener('click', startAudioOnClick);
}
document.addEventListener('click', startAudioOnClick);


// Affiche UNIQUEMENT la vidéo noire si mode sombre, sinon aucune vidéo
document.addEventListener('DOMContentLoaded', () => {
    const whiteVideo = document.getElementById('whiteVideo');
    const blackVideo = document.getElementById('BlackVideo');

    function applyTheme() {
    const dark = localStorage.getItem('darkMode') === '1';
    if (dark) {
        document.body.classList.add('dark-mode');
        if (whiteVideo) {
            whiteVideo.pause();
            whiteVideo.style.display = 'none';
        }
        if (blackVideo) {
            blackVideo.style.display = 'block';
            blackVideo.currentTime = 0;
            blackVideo.play().catch(() => {});
        }
    } else {
        document.body.classList.remove('dark-mode');
        if (blackVideo) {
            blackVideo.pause();
            blackVideo.style.display = 'none';
        }
        if (whiteVideo) {
            whiteVideo.style.display = 'block';
            whiteVideo.currentTime = 0;
            whiteVideo.play().catch(() => {});
        }
    }
}

applyTheme();
});