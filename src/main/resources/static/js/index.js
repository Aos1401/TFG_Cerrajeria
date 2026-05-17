(function () {
    const track      = document.getElementById('carrusel-track');
    const prevBtn    = document.getElementById('carrusel-prev');
    const nextBtn    = document.getElementById('carrusel-next');
    const dotsEl     = document.getElementById('carrusel-dots');
    const GAP        = 24;
    const slides     = Array.from(track.children);
    const total      = slides.length;
    let current      = 0;

    function visible() {
        return window.innerWidth > 820 ? 3 : window.innerWidth > 520 ? 2 : 1;
    }

    function maxIdx() { return total - visible(); }

    function goTo(idx, animate) {
        const max = maxIdx();
        current = ((idx % (max + 1)) + (max + 1)) % (max + 1);
        if (animate === false) track.style.transition = 'none';
        track.style.transform = `translateX(-${current * (slides[0].offsetWidth + GAP)}px)`;
        if (animate === false) { track.offsetHeight; track.style.transition = ''; }
        renderDots();
    }

    function renderDots() {
        dotsEl.innerHTML = '';
        for (let i = 0; i <= maxIdx(); i++) {
            const d = document.createElement('button');
            d.className = 'carrusel-dot' + (i === current ? ' activo' : '');
            d.setAttribute('aria-label', 'Ir al servicio ' + (i + 1));
            d.addEventListener('click', () => goTo(i));
            dotsEl.appendChild(d);
        }
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    window.addEventListener('resize', () => goTo(Math.min(current, maxIdx()), false));

    goTo(0, false);
})();
