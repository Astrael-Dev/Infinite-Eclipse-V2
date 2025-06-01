document.addEventListener('DOMContentLoaded', () => {
    const dark = localStorage.getItem('darkMode') === '1';
    if (dark) {
        document.body.setAttribute('data-theme', 'dark');
    } else {
        document.body.removeAttribute('data-theme');
    }
});