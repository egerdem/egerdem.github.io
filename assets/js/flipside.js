// Flipside: the other side of the record. Clicking a [data-flip="b"] link grows a
// spinning record out of its icon, swaps the academic page (Side A) for #flipside
// (Side B) underneath it, and lets the record fade. [data-flip="a"] flips back.
// Side B is a set of pages, one per [data-page] section: #flipside is its home page
// and #flipside/<name> the others. The URL opens them directly; back/forward work too.
(function () {
    var root = document.documentElement;
    var side = document.getElementById('flipside');
    var reduce = matchMedia('(prefers-reduced-motion: reduce)');
    var title = document.title;
    var busy = false, ready = false, savedY = 0;

    function isOpen() { return root.classList.contains('is-flipside'); }

    // the Side B page named in the URL ('home' for plain #flipside), or null on Side A
    function page() {
        var m = location.hash.match(/^#flipside(?:\/(\w+))?$/);
        return m && (m[1] || 'home');
    }

    function show(name) {
        var current = side.querySelector('[data-page="' + name + '"]');
        side.querySelectorAll('[data-page]').forEach(function (p) { p.hidden = p !== current; });
        side.querySelectorAll('.fs-tracks a').forEach(function (a) {
            if (a.hash === location.hash) a.setAttribute('aria-current', 'page');
            else a.removeAttribute('aria-current');
        });
        side.dataset.page = name;
        var heading = current.querySelector('h1, h2');
        document.title = 'Ege Erdem · Flipside' + (name === 'home' ? '' : ' · ' + heading.textContent);
        scrollTo({ top: 0, behavior: 'instant' });
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
    }

    // the browser would restore the other page's scroll position on back/forward; show() and swap() do it instead
    function go(url) {
        history.scrollRestoration = 'manual';
        history.pushState(null, '', url);
    }

    function swap(open) {
        if (open) savedY = scrollY;
        root.classList.toggle('is-flipside', open);
        side.hidden = !open;
        if (open) {
            init();
            show(page());
        } else {
            document.title = title;
            var target = location.hash && document.getElementById(location.hash.slice(1));
            if (target) target.scrollIntoView({ behavior: 'instant' });
            else scrollTo({ top: savedY, behavior: 'instant' });
            [].find.call(document.querySelectorAll('[data-flip="b"]'), function (el) { return el.offsetParent; })
                .focus({ preventScroll: true });
        }
    }

    function flip(open, x, y) {
        if (busy || open === isOpen()) return;
        if (reduce.matches) { swap(open); return; }
        busy = true;
        var d = 2 * Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 8;
        var disc = document.createElement('div');
        disc.className = open ? 'flip-disc' : 'flip-disc flip-disc--a';
        disc.innerHTML = '<span>' + (open ? 'Side B' : 'Side A') + '</span>';
        disc.style.cssText = 'width:' + d + 'px;height:' + d + 'px;left:' + (x - d / 2) + 'px;top:' + (y - d / 2) +
            'px;font-size:' + Math.round(d * .028) + 'px';
        document.body.appendChild(disc);
        disc.animate([
            { transform: 'scale(' + 16 / d + ') rotate(0deg)' },
            { transform: 'scale(1) rotate(250deg)' }
        ], { duration: 620, easing: 'cubic-bezier(.7, 0, .25, 1)', fill: 'forwards' }).finished.then(function () {
            swap(open);
            return disc.animate([
                { transform: 'scale(1) rotate(250deg)', opacity: 1 },
                { transform: 'scale(1.12) rotate(310deg)', opacity: 0 }
            ], { duration: 440, easing: 'ease-out', fill: 'forwards' }).finished;
        }).then(function () {
            disc.remove();
            busy = false;
            sync();  // catches back/forward pressed mid-flip
        });
    }

    function sync() {
        var name = page();
        if (name && isOpen() && !busy && name !== side.dataset.page) show(name);
        flip(!!name, innerWidth / 2, innerHeight / 2);
    }

    document.addEventListener('click', function (e) {
        var link = e.target.closest('[data-flip]');
        if (!link) return;
        e.preventDefault();
        var open = link.dataset.flip === 'b';
        if (busy || open === isOpen()) return;
        go(open ? '#flipside' : location.pathname + location.search);
        var r = (link.querySelector('.flip-icon') || link).getBoundingClientRect();
        flip(open, r.left + r.width / 2, r.top + r.height / 2);
    });

    addEventListener('popstate', sync);

    // Everything below only matters once Side B is shown, so it is set up on first open.
    function init() {
        if (ready) return;
        ready = true;

        // tabs, tracklist and brand open their page
        side.addEventListener('click', function (e) {
            var a = e.target.closest('a[href^="#flipside"]');
            if (!a) return;
            e.preventDefault();
            if (a.hash === location.hash) return;
            go(a.hash);
            show(page());
        });

        // YouTube frames show a thumbnail and only load the player when clicked
        side.querySelectorAll('.fs-frame[data-youtube]').forEach(function (f) {
            var id = f.dataset.youtube;
            var name = f.querySelector('figcaption b');
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'fs-yt';
            b.style.backgroundImage = 'url(https://i.ytimg.com/vi/' + id + '/hqdefault.jpg)';
            b.setAttribute('aria-label', 'Play ' + (name ? name.textContent : 'video'));
            b.addEventListener('click', function () {
                var i = document.createElement('iframe');
                i.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
                i.title = b.getAttribute('aria-label');
                i.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
                i.allowFullscreen = true;
                b.replaceWith(i);
            });
            f.prepend(b);
        });

        // reels can be dragged sideways with a mouse, like pulling film
        side.querySelectorAll('.fs-reel').forEach(function (reel) {
            var x0 = null, s0 = 0, moved = false;
            reel.addEventListener('pointerdown', function (e) {
                if (e.pointerType === 'mouse') { x0 = e.clientX; s0 = reel.scrollLeft; moved = false; }
            });
            addEventListener('pointermove', function (e) {
                if (x0 === null) return;
                if (Math.abs(e.clientX - x0) > 4) { moved = true; reel.classList.add('is-dragging'); }
                if (moved) reel.scrollLeft = s0 - (e.clientX - x0);
            });
            addEventListener('pointerup', function () { x0 = null; reel.classList.remove('is-dragging'); });
            reel.addEventListener('click', function (e) {
                if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
            }, true);
            reel.addEventListener('dragstart', function (e) { e.preventDefault(); });
        });

        field();
    }

    // The hero is a halftone sound field: each dot is the pressure at that point from
    // a few point sources (two drifting, one under the mouse, one per click). Crests
    // are cream, troughs orange. A click also plays a note when sound is on; its pitch
    // is set by where you click (low on the left, high on the right) and higher notes
    // ripple with shorter wavelengths.
    function field() {
        var hero = side.querySelector('.fs-hero');
        var canvas = hero.querySelector('.fs-field');
        var ctx = canvas.getContext('2d');
        var soundBtn = hero.querySelector('.fs-sound');
        var TAU = Math.PI * 2;
        var scale = [50, 53, 57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81];  // D minor 11 pentatonic, MIDI
        var w = 0, h = 0, gap = 19, raf = 0, visible = false;
        var t0 = performance.now();
        var quiet = [];  // per-dot gain, low under the hero's text
        var mouse = { x: 0, y: 0, a: 0 };
        var taps = [];
        var play = null;

        if (matchMedia('(pointer: fine)').matches) {
            hero.querySelector('.fs-hint').textContent = 'Move to stir the sound field · click to drop a note';
        }

        function draw(now) {
            var t = (now - t0) / 1000;
            var src = [
                { x: w * (.62 + .22 * Math.sin(t * .13)), y: h * (.36 + .2 * Math.cos(t * .17)), k: TAU / 170, c: 46, a: .5 },
                { x: w * (.86 + .1 * Math.cos(t * .11)), y: h * (.7 + .16 * Math.sin(t * .09)), k: TAU / 120, c: 44, a: .4 }
            ];
            if (mouse.a > .02) src.push({ x: mouse.x, y: mouse.y, k: TAU / 90, c: 43, a: mouse.a });
            mouse.a *= .985;
            taps = taps.filter(function (p) { return t - p.t < 4.5; });

            var pos = new Path2D(), neg = new Path2D();
            var rmax = gap * .42, n = 0;
            for (var y = gap / 2; y < h; y += gap) {
                for (var x = gap / 2; x < w; x += gap) {
                    var v = 0, i, s, r, g = quiet[n++];
                    for (i = 0; i < src.length; i++) {
                        s = src[i];
                        r = Math.hypot(x - s.x, y - s.y);
                        v += s.a * Math.sin(s.k * (r - s.c * t)) / (1 + r / 520);
                    }
                    for (i = 0; i < taps.length; i++) {
                        s = taps[i];
                        r = Math.hypot(x - s.x, y - s.y);
                        var front = 380 * (t - s.t);
                        if (r > front) continue;
                        v += s.a * Math.sin(s.k * (r - front)) * Math.exp((r - front) / 260 - (t - s.t) / 1.5);
                    }
                    var rad = Math.min(Math.abs(v), 1) * g * rmax;
                    if (rad < .5) continue;
                    var p = v > 0 ? pos : neg;
                    p.moveTo(x + rad, y);
                    p.arc(x, y, rad, 0, TAU);
                }
            }
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = 'rgba(239, 231, 218, .42)';
            ctx.fill(pos);
            ctx.fillStyle = 'rgba(255, 90, 44, .55)';
            ctx.fill(neg);

            raf = visible && !reduce.matches ? requestAnimationFrame(draw) : 0;
        }

        function wake() {
            if (!raf) raf = requestAnimationFrame(draw);
        }

        new ResizeObserver(function () {
            var dpr = Math.min(devicePixelRatio || 1, 2);
            w = hero.clientWidth;
            h = hero.clientHeight;
            gap = w < 640 ? 15 : Math.max(19, Math.round(w / 90));
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            measure();
        }).observe(hero);

        // the text moves while it animates in and when the web fonts arrive
        hero.addEventListener('animationend', measure);
        document.fonts.ready.then(measure);

        function measure() {
            var box = hero.getBoundingClientRect();
            var text = [].map.call(hero.querySelectorAll('.fs-hero-text > *, .fs-tracklist, .fs-hint, .fs-sound'),
                function (el) { return el.getBoundingClientRect(); });
            quiet = [];
            for (var y = gap / 2; y < h; y += gap) {
                for (var x = gap / 2; x < w; x += gap) {
                    var g = 1;
                    text.forEach(function (r) {
                        var dx = Math.max(r.left - box.left - x, 0, x - r.right + box.left);
                        var dy = Math.max(r.top - box.top - y, 0, y - r.bottom + box.top);
                        g = Math.min(g, .12 + .88 * Math.min(1, Math.hypot(dx, dy) / 70));
                    });
                    quiet.push(g);
                }
            }
            wake();
        }

        // only animate while the hero is on screen (and Side B is open)
        new IntersectionObserver(function (entries) {
            visible = entries[0].isIntersecting;
            if (visible) wake();
        }).observe(hero);

        hero.addEventListener('pointermove', function (e) {
            if (e.pointerType !== 'mouse') return;
            var r = hero.getBoundingClientRect();
            mouse.x = e.clientX - r.left;
            mouse.y = e.clientY - r.top;
            mouse.a = .75;
        });

        hero.addEventListener('click', function (e) {
            if (e.target.closest('a, button')) return;
            var r = hero.getBoundingClientRect();
            var x = e.clientX - r.left, y = e.clientY - r.top;
            var m = scale[Math.min(scale.length - 1, Math.floor(x / w * scale.length))];
            var f = 440 * Math.pow(2, (m - 69) / 12);
            taps.push({ x: x, y: y, t: (performance.now() - t0) / 1000, k: TAU / (220 * Math.pow(146.8 / f, .6)), a: 1.8 });
            if (taps.length > 6) taps.shift();
            if (play) play(f, .6 + .4 * (1 - y / h));
        });

        soundBtn.addEventListener('click', function () {
            var on = soundBtn.getAttribute('aria-pressed') !== 'true';
            soundBtn.setAttribute('aria-pressed', on);
            soundBtn.textContent = on ? 'Sound on' : 'Sound off';
            play = on ? piano() : null;
        });
    }

    // A small FM electric piano, played through a synthetic room: the impulse
    // response is just noise with an exponential decay (about 2 s RT60).
    var synth = null;
    function piano() {
        if (synth) return synth;
        var ac = new (window.AudioContext || window.webkitAudioContext)();
        var out = ac.createGain();
        var room = ac.createConvolver();
        var wet = ac.createGain();
        var n = Math.round(ac.sampleRate * 2.5);
        var ir = ac.createBuffer(2, n, ac.sampleRate);
        for (var ch = 0; ch < 2; ch++) {
            var data = ir.getChannelData(ch);
            for (var i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ac.sampleRate * .3));
        }
        room.buffer = ir;
        out.gain.value = .5;
        wet.gain.value = .3;
        room.connect(wet);
        wet.connect(out);
        out.connect(ac.destination);
        synth = function (f, vel) {
            var t = ac.currentTime;
            var car = ac.createOscillator(), mod = ac.createOscillator();
            var index = ac.createGain(), env = ac.createGain();
            car.frequency.value = f;
            mod.frequency.value = f;
            index.gain.setValueAtTime(f * 1.4, t);
            index.gain.exponentialRampToValueAtTime(f * .05, t + .8);
            env.gain.setValueAtTime(0, t);
            env.gain.linearRampToValueAtTime(.3 * vel, t + .008);
            env.gain.exponentialRampToValueAtTime(.0001, t + 2.6);
            mod.connect(index);
            index.connect(car.frequency);
            car.connect(env);
            env.connect(out);
            env.connect(room);
            car.start(t);
            mod.start(t);
            car.stop(t + 2.7);
            mod.stop(t + 2.7);
        };
        return synth;
    }

    if (page()) swap(true);
})();
