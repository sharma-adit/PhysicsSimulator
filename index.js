

document.querySelector('.home-btn')?.addEventListener('click', () => {
    // Home button click handler (future navigation or feedback)
    alert('You are already on the Home page!');
});

document.addEventListener('DOMContentLoaded', () => {
    const aboutBtn = document.querySelector('.about-btn');
    const aboutPopout = document.getElementById('aboutPopout');

    if (aboutBtn && aboutPopout) {
        aboutBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = aboutPopout.getAttribute('aria-hidden') === 'false';
            aboutPopout.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
            if (!isOpen) {
                aboutPopout.focus();
            }
        });

        // Close popout on outside click
        document.addEventListener('mousedown', (e) => {
            if (!aboutPopout.contains(e.target) && !aboutBtn.contains(e.target)) {
                aboutPopout.setAttribute('aria-hidden', 'true');
            }
        });

        // Close popout on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                aboutPopout.setAttribute('aria-hidden', 'true');
            }
        });
    }
});
