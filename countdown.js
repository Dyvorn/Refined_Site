// countdown.js
document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
});

function initCountdown() {
    // Read the launch date from config.js
    const targetDate = new Date(CONFIG.LAUNCH_DATE);

    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minutesEl = document.getElementById('cd-minutes');
    const secondsEl = document.getElementById('cd-seconds');

    function updateTimer() {
        const now = new Date().getTime();
        const distance = targetDate.getTime() - now;

        if (distance < 0) {
            // Countdown finished, redirect to the real site
            window.location.replace('home.html');
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        daysEl.textContent = days.toString().padStart(2, '0');
        hoursEl.textContent = hours.toString().padStart(2, '0');
        minutesEl.textContent = minutes.toString().padStart(2, '0');
        secondsEl.textContent = seconds.toString().padStart(2, '0');

        requestAnimationFrame(updateTimer);
    }

    updateTimer();

    // Early Access Logic
    const toggleBtn = document.getElementById('early-access-toggle');
    const formDiv = document.getElementById('early-access-form');
    const passInput = document.getElementById('early-access-password');
    const submitBtn = document.getElementById('early-access-submit');

    if (toggleBtn && formDiv) {
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleBtn.style.display = 'none';
            formDiv.style.display = 'block';
            passInput.focus();
        });

        const checkPassword = () => {
            if (passInput.value === CONFIG.EARLY_ACCESS_PASSWORD) {
                localStorage.setItem('early_access', 'true');
                window.location.replace('home.html');
            } else {
                passInput.style.borderColor = 'red';
                passInput.value = '';
                passInput.placeholder = 'Incorrect Password';
            }
        };

        submitBtn.addEventListener('click', checkPassword);
        passInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkPassword();
        });
    }
}
