// ============================================
// IoT Gateway Presentation — Navigation Engine
// ============================================

(function () {
    'use strict';

    const slides = document.querySelectorAll('.slide');
    const progressFill = document.getElementById('progressFill');
    const slideCounter = document.getElementById('slideCounter');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const totalSlides = slides.length;
    let currentSlide = 0;
    let isAnimating = false;

    // ---- Initialize ----
    function init() {
        updateUI();
        addIntersectionAnimations();
    }

    // ---- Navigate ----
    function goToSlide(index) {
        if (isAnimating || index < 0 || index >= totalSlides || index === currentSlide) return;
        isAnimating = true;

        const direction = index > currentSlide ? 1 : -1;
        const currentEl = slides[currentSlide];
        const nextEl = slides[index];

        // --- Animate current slide OUT ---
        currentEl.style.transition = 'opacity 0.6s cubic-bezier(0.4,0,0.2,1), transform 0.6s cubic-bezier(0.4,0,0.2,1)';
        currentEl.classList.remove('active');
        currentEl.style.transform = direction > 0 ? 'translateX(-60px)' : 'translateX(60px)';
        currentEl.style.opacity = '0';

        // --- Prepare next slide at start position (NO transition) ---
        nextEl.style.transition = 'none';
        nextEl.style.visibility = 'visible';
        nextEl.style.opacity = '0';
        nextEl.style.transform = direction > 0 ? 'translateX(60px)' : 'translateX(-60px)';
        nextEl.classList.add('active');

        // --- Double rAF ensures browser paints start position, then animate IN ---
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                nextEl.style.transition = 'opacity 0.6s cubic-bezier(0.4,0,0.2,1), transform 0.6s cubic-bezier(0.4,0,0.2,1)';
                nextEl.style.transform = 'translateX(0)';
                nextEl.style.opacity = '1';
            });
        });

        // --- Clean up old slide after animation ---
        setTimeout(() => {
            currentEl.style.visibility = 'hidden';
            currentEl.style.transition = '';
            currentEl.style.transform = '';
            currentEl.style.opacity = '';
            nextEl.style.transition = '';
            nextEl.style.transform = '';
            nextEl.style.opacity = '';
            isAnimating = false;
        }, 650);

        currentSlide = index;
        updateUI();
        animateSlideContent(nextEl);
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    // ---- Update UI ----
    function updateUI() {
        const progress = ((currentSlide + 1) / totalSlides) * 100;
        progressFill.style.width = progress + '%';
        slideCounter.textContent = (currentSlide + 1) + ' / ' + totalSlides;

        prevBtn.style.opacity = currentSlide === 0 ? '0.3' : '1';
        prevBtn.style.pointerEvents = currentSlide === 0 ? 'none' : 'auto';
        nextBtn.style.opacity = currentSlide === totalSlides - 1 ? '0.3' : '1';
        nextBtn.style.pointerEvents = currentSlide === totalSlides - 1 ? 'none' : 'auto';
    }

    // ---- Animate slide content on enter ----
    function animateSlideContent(slide) {
        const animElements = slide.querySelectorAll(
            '.glass-card, .motivation-card, .feature-item, .hw-card, .sw-layer, ' +
            '.protocol-step, .code-block, .timeline-item, .adv-card, .future-item, ' +
            '.conc-item, .stat-card, .hal-interface, .pipeline-node, .benefit-tag, .badge, ' +
            '.app-card, .app-tag'
        );

        animElements.forEach((el, i) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(15px)';
            el.style.transition = 'none';

            setTimeout(() => {
                el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 80 + i * 60);
        });
    }

    // ---- Intersection observer for first slide ----
    function addIntersectionAnimations() {
        animateSlideContent(slides[0]);
    }

    // ---- Event Listeners ----
    // ---- Fullscreen ----
    const fullscreenBtn = document.getElementById('fullscreenBtn');

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => { });
            fullscreenBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14h6v6m10-10h-6V4M14 10l7-7M3 21l7-7"/></svg>';
        } else {
            document.exitFullscreen();
            fullscreenBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/></svg>';
        }
    }

    fullscreenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFullscreen();
    });

    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ':
            case 'Enter':
                e.preventDefault();
                nextSlide();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                prevSlide();
                break;
            case 'Home':
                e.preventDefault();
                goToSlide(0);
                break;
            case 'End':
                e.preventDefault();
                goToSlide(totalSlides - 1);
                break;
            case 'f':
            case 'F':
                e.preventDefault();
                toggleFullscreen();
                break;
        }
    });

    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    // Touch support
    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        const deltaX = e.changedTouches[0].screenX - touchStartX;
        const deltaY = e.changedTouches[0].screenY - touchStartY;

        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            if (deltaX < 0) nextSlide();
            else prevSlide();
        }
    }, { passive: true });

    // Mouse wheel
    let wheelTimeout;
    document.addEventListener('wheel', (e) => {
        e.preventDefault();
        clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(() => {
            if (e.deltaY > 0) nextSlide();
            else prevSlide();
        }, 50);
    }, { passive: false });

    // ---- Keyboard shortcut hint ----
    console.log(
        '%c IoT Gateway Presentation ',
        'background: linear-gradient(135deg, #06b6d4, #3b82f6); color: white; font-size: 14px; padding: 8px 16px; border-radius: 4px;'
    );
    console.log('Navigation: ← → Arrow keys | Space | Scroll | Touch swipe');

    // ---- Init ----
    init();
})();
