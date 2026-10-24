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
