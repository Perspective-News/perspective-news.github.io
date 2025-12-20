document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('main-nav');

    // Toggle navigation on mobile
    navToggle.addEventListener('click', () => {
        nav.classList.toggle('open');
        navToggle.classList.toggle('open');
    });

    // Theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            // Toggle dark mode class on the body
            document.body.classList.toggle('dark-mode');
            // Update button label based on current theme
            const isDark = document.body.classList.contains('dark-mode');
            themeToggle.textContent = isDark ? 'Light Mode' : 'Dark Mode';
        });
    }

    // Navigation link behaviour
    document.querySelectorAll('.nav a').forEach(link => {
        link.addEventListener('click', evt => {
            const href = link.getAttribute('href');
            // If this is an in-page anchor link, enable smooth scrolling
            if (href && href.startsWith('#')) {
                evt.preventDefault();
                const targetEl = document.querySelector(href);
                if (targetEl) {
                    targetEl.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
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