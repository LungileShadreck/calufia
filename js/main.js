/**
 * Global Animation System
 * Uses Intersection Observer for performance and smooth revealing of elements.
 */

document.addEventListener('DOMContentLoaded', () => {

    // Observer Options
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Trigger just as it enters view
    };

    // The Observer
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: Unobserve after reveal if we don't want replay
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Target elements
    const elementsToReveal = document.querySelectorAll('.reveal');
    elementsToReveal.forEach((el) => {
        observer.observe(el);
    });

    // Mobile Menu Toggle Logic
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    const header = document.querySelector('header');
    
    if(mobileBtn && navMenu && header) {
        mobileBtn.addEventListener('click', () => {
            navMenu.classList.toggle('hidden');
            navMenu.classList.toggle('flex');
            header.classList.toggle('mix-blend-difference');
            header.classList.toggle('bg-brand-black');
        });
    }

});
