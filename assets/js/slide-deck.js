// Click-through slide viewer. Every .slide-deck gets prev/next arrows, keyboard
// (left/right while focused), swipe and fullscreen. Slides after the first carry
// data-src and are only loaded once you are next to them.
document.querySelectorAll('.slide-deck').forEach(function (deck) {
    var slides = deck.querySelectorAll('.slide-deck-frame img');
    var prev = deck.querySelector('.slide-deck-prev');
    var next = deck.querySelector('.slide-deck-next');
    var count = deck.querySelector('.slide-deck-count');
    var full = deck.querySelector('.slide-deck-full');
    var current = 0;

    function load(i) {
        var img = slides[i];
        if (img && img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        }
    }

    function show(i) {
        if (i < 0 || i >= slides.length) return;
        slides[current].classList.remove('is-active');
        current = i;
        load(i);
        load(i + 1);
        load(i - 1);
        slides[current].classList.add('is-active');
        prev.disabled = current === 0;
        next.disabled = current === slides.length - 1;
        count.textContent = (current + 1) + ' / ' + slides.length;
    }

    prev.addEventListener('click', function () { show(current - 1); });
    next.addEventListener('click', function () { show(current + 1); });

    deck.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { show(current - 1); e.preventDefault(); }
        if (e.key === 'ArrowRight') { show(current + 1); e.preventDefault(); }
    });

    var touchX = null, touchY = null;
    deck.addEventListener('touchstart', function (e) {
        touchX = e.touches[0].clientX;
        touchY = e.touches[0].clientY;
    }, { passive: true });
    deck.addEventListener('touchend', function (e) {
        if (touchX === null) return;
        var dx = e.changedTouches[0].clientX - touchX;
        var dy = e.changedTouches[0].clientY - touchY;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1));
        touchX = touchY = null;
    });

    if (deck.requestFullscreen) {
        full.addEventListener('click', function () {
            if (document.fullscreenElement) document.exitFullscreen();
            else deck.requestFullscreen();
        });
        document.addEventListener('fullscreenchange', function () {
            full.setAttribute('aria-label', document.fullscreenElement === deck ? 'Exit fullscreen' : 'View fullscreen');
        });
    } else {
        full.hidden = true;  // e.g. iPhone Safari
    }

    show(0);
});
