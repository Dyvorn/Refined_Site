// mobile/ui.js - Mobile specific UI interactions

document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const menuOverlay = document.getElementById('mobileMenuOverlay');
    const menuIconPath = menuBtn.querySelector('path');
    const menuLinks = menuOverlay.querySelectorAll('a');

    let isMenuOpen = false;

    // Toggle menu
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        
        if (isMenuOpen) {
            menuOverlay.classList.add('active');
            // Change icon to close (X)
            menuIconPath.setAttribute('d', 'M6 18L18 6M6 6l12 12');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        } else {
            menuOverlay.classList.remove('active');
            // Change icon to hamburger
            menuIconPath.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
            document.body.style.overflow = '';
        }
    }

    menuBtn.addEventListener('click', toggleMenu);

    // Close menu when a link is clicked
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (isMenuOpen) toggleMenu();
        });
    });
});
