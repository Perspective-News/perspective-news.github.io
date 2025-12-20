document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('main-nav');

    // Toggle navigation on mobile
    navToggle.addEventListener('click', () => {
        nav.classList.toggle('open');
        navToggle.classList.toggle('open');
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('.nav a').forEach(link => {
        link.addEventListener('click', evt => {
            evt.preventDefault();
            const targetId = link.getAttribute('href');
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                targetEl.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            // Close navigation on mobile after selection
            if (nav.classList.contains('open')) {
                nav.classList.remove('open');
                navToggle.classList.remove('open');
            }
        });
    });

    // Reveal elements on scroll using Intersection Observer
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Update footer year dynamically
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
});