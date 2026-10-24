(function () {
    var body = document.body;
    var nav = document.querySelector('.navbar');
    var hero = document.querySelector('.hero');

    // Solid nav + mobile booking bar once the hero has scrolled away
    if (hero && 'IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
            var past = !entries[0].isIntersecting;
            nav.classList.toggle('is-solid', past);
            body.classList.toggle('show-bookbar', past);
        }, { rootMargin: '-80px 0px 0px 0px' }).observe(hero);
    }

    // Gentle reveal as sections enter the viewport (content stays visible if this script never runs)
    document.documentElement.classList.add('reveal-ready');
    var reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
            });
        }, { rootMargin: '0px 0px -8% 0px' });
        reveals.forEach(function (el) { io.observe(el); });
    } else {
        reveals.forEach(function (el) { el.classList.add('is-visible'); });
    }

    // Videos: load only when near the viewport; skip for reduced motion or data saver
    var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        (navigator.connection && navigator.connection.saveData);
    if (!calm) {
        var heroVideo = document.querySelector('.hero-video');
        if (heroVideo) {
            window.addEventListener('load', function () {
                var mobile = window.matchMedia('(max-width: 700px)').matches;
                heroVideo.src = (mobile && heroVideo.dataset.srcMobile) || heroVideo.dataset.src;
                heroVideo.addEventListener('playing', function () { heroVideo.classList.add('is-playing'); });
                heroVideo.play().catch(function () {});
            });
        }
        var vids = document.querySelectorAll('video[data-src]:not(.hero-video)');
        if ('IntersectionObserver' in window) {
            var vo = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    var v = e.target;
                    if (e.isIntersecting) {
                        if (!v.src) v.src = v.dataset.src;
                        v.play().catch(function () {});
                    } else if (v.src) {
                        v.pause();
                    }
                });
            }, { rootMargin: '200px 0px' });
            vids.forEach(function (v) { vo.observe(v); });
        }
    } else {
        document.querySelectorAll('video[data-src]:not(.hero-video)').forEach(function (v) {
            v.src = v.dataset.src; v.controls = true;
        });
    }

    // Gallery: filters and photo viewer
    var gallery = document.querySelector('.g-grid');
    if (gallery) {
        var items = Array.prototype.slice.call(gallery.querySelectorAll('.g-item'));
        document.querySelectorAll('.g-chip').forEach(function (chip) {
            chip.addEventListener('click', function () {
                var f = chip.dataset.filter;
                document.querySelectorAll('.g-chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
                items.forEach(function (it) { it.hidden = !(f === 'all' || it.dataset.cat === f); });
            });
        });
        var lb = document.querySelector('.lightbox');
        if (lb && lb.showModal) {
            var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('figcaption'), current = 0, opener = null;
            var visible = function () { return Array.prototype.slice.call(gallery.querySelectorAll('.g-item:not([hidden]) .g-open')); };
            var show = function (i) {
                var list = visible();
                current = (i + list.length) % list.length;
                var b = list[current];
                lbImg.src = b.dataset.large; lbImg.alt = b.dataset.caption; lbCap.textContent = b.dataset.caption;
            };
            gallery.addEventListener('click', function (e) {
                var b = e.target.closest('.g-open');
                if (!b) return;
                opener = b;
                show(visible().indexOf(b));
                lb.showModal();
            });
            lb.querySelector('.lb-close').addEventListener('click', function () { lb.close(); });
            lb.querySelector('.lb-prev').addEventListener('click', function () { show(current - 1); });
            lb.querySelector('.lb-next').addEventListener('click', function () { show(current + 1); });
            lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
            lb.addEventListener('close', function () { if (opener) opener.focus(); });
            lb.addEventListener('keydown', function (e) {
                if (e.key === 'ArrowLeft') show(current - 1);
                if (e.key === 'ArrowRight') show(current + 1);
            });
            var x0 = null;
            lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
            lb.addEventListener('touchend', function (e) {
                if (x0 === null) return;
                var dx = e.changedTouches[0].clientX - x0;
                if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
                x0 = null;
            });
        }
    }

    // Mobile menu
    var toggle = document.querySelector('.menu-toggle');
    if (toggle) {
        var setMenu = function (open) {
            body.classList.toggle('menu-open', open);
            toggle.setAttribute('aria-expanded', String(open));
        };
        toggle.addEventListener('click', function () {
            setMenu(toggle.getAttribute('aria-expanded') !== 'true');
        });
        document.querySelectorAll('.nav-links a').forEach(function (a) {
            a.addEventListener('click', function () { setMenu(false); });
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') setMenu(false);
        });
    }

    // FAQ accordion: one open at a time, ARIA kept in sync
    var faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(function (item) {
        var question = item.querySelector('.faq-question');
        question.addEventListener('click', function () {
            var isActive = item.classList.contains('active');
            faqItems.forEach(function (other) {
                other.classList.remove('active');
                other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });
            if (!isActive) {
                item.classList.add('active');
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });
})();
