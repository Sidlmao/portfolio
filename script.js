/* ============================================================
   Motion layer. Gated behind prefers-reduced-motion; degrades
   to a clean static page if libraries fail to load.
   ============================================================ */

(function () {
  var nav = document.getElementById('nav');
  function onScroll() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Copy email button
  var copyBtn = document.getElementById('copyBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText('sidgadikota26@gmail.com').then(function () {
        copyBtn.classList.add('copied');
        copyBtn.textContent = 'Copied';
        setTimeout(function () {
          copyBtn.classList.remove('copied');
          copyBtn.textContent = 'Copy email';
        }, 2000);
      });
    });
  }

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  // ---------- 3D ring layout (also the static composed state) ----------
  var ring = document.getElementById('ring');
  var cards = ring ? [].slice.call(ring.querySelectorAll('.ring-card')) : [];
  var STEP = cards.length ? 360 / cards.length : 60;
  var ringTitle = document.getElementById('ringTitle');
  var ringLine = document.getElementById('ringLine');
  var activeIdx = -1;

  function layoutRing() {
    if (!cards.length) return;
    var r = Math.round((ring.offsetWidth / 2) / Math.tan(Math.PI / cards.length) + ring.offsetWidth * 0.55);
    cards.forEach(function (card, i) {
      card.style.transform = 'rotateY(' + (i * STEP) + 'deg) translateZ(' + r + 'px)';
    });
    ring.classList.add('ring-ready');
  }

  function setActive(idx) {
    if (idx === activeIdx || !cards.length) return;
    activeIdx = idx;
    cards.forEach(function (c, i) { c.classList.toggle('is-active', i === idx); });
    ringTitle.textContent = cards[idx].getAttribute('data-title');
    ringLine.textContent = (cards[idx].getAttribute('data-line') || '').toUpperCase();
    var cap = ringTitle.parentElement;
    cap.classList.remove('swap');
    void cap.offsetWidth;                  // restart the swap animation
    cap.classList.add('swap');
  }

  layoutRing();
  setActive(0);
  window.addEventListener('resize', layoutRing);

  if (reduced || !hasGsap) return; // static page, fully composed

  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('js-anim');

  // ---------- Smooth scroll (Lenis bridged to GSAP ticker) ----------
  if (typeof window.Lenis !== 'undefined') {
    var lenis = new Lenis({ autoRaf: false, lerp: 0.14 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = document.querySelector(a.getAttribute('href'));
        if (target) { e.preventDefault(); lenis.scrollTo(target, { duration: 1.1 }); }
      });
    });
  }

  // ---------- Hero: kinetic type intro ----------
  document.querySelectorAll('.hero-name .chars').forEach(function (el) {
    el.innerHTML = el.textContent.replace(/./g, '<span>$&</span>');
  });
  gsap.from('.hero-name .chars span', { yPercent: 112, duration: 1.1, ease: 'power4.out', stagger: 0.045, delay: 0.15 });
  gsap.from('.hero-cutout', { yPercent: 24, scale: 0.94, duration: 1.3, ease: 'power3.out', delay: 0.45 });
  gsap.from('.hero-front > *, .hero-meta', { y: 26, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 0.75 });

  // ---------- Hero scroll response: ONE trigger, one timeline ----------
  gsap.timeline({
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
    defaults: { ease: 'none' }
  })
    .to('.hero-plate img', { scale: 1.0, yPercent: 8 }, 0)
    .to('.hero-name .line:first-child', { xPercent: -5 }, 0)
    .to('.hero-name .line-2', { xPercent: 5 }, 0)
    .to('.hero-cutout', { yPercent: -18 }, 0);

  // Mouse tilt on the cutout (fine pointers only)
  if (window.matchMedia('(pointer: fine)').matches) {
    var cut = document.getElementById('heroCutout');
    var hero = document.querySelector('.hero');
    if (cut && hero) {
      var rx = gsap.quickTo(cut, 'rotationY', { duration: 0.6, ease: 'power3.out' });
      var ry = gsap.quickTo(cut, 'rotationX', { duration: 0.6, ease: 'power3.out' });
      hero.addEventListener('pointermove', function (e) {
        rx((e.clientX / window.innerWidth - 0.5) * 10);
        ry((e.clientY / window.innerHeight - 0.5) * -8);
      });
      hero.addEventListener('pointerleave', function () { rx(0); ry(0); });
    }
  }

  // ---------- 3D ring: drag to spin (with momentum), slow idle drift ----------
  if (cards.length) {
    var stage = document.querySelector('.ring-stage');
    var deg = 0, vel = 0, dragging = false, lastX = 0;
    var snap = gsap.utils.snap(STEP);

    function render() {
      ring.style.transform = 'rotateX(-6deg) rotateY(' + deg + 'deg)';
      var idx = Math.round(-deg / STEP) % cards.length;
      setActive(idx < 0 ? idx + cards.length : idx);
    }

    stage.addEventListener('pointerdown', function (e) {
      dragging = true; vel = 0; lastX = e.clientX;
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX;
      lastX = e.clientX;
      deg += dx * 0.35;
      vel = dx * 0.35;
      render();
    });
    ['pointerup', 'pointercancel'].forEach(function (ev) {
      stage.addEventListener(ev, function () { dragging = false; });
    });

    gsap.ticker.add(function () {
      if (dragging) return;
      if (Math.abs(vel) > 0.05) {
        deg += vel; vel *= 0.95;               // momentum
        if (Math.abs(vel) <= 0.05) deg = snap(deg); // settle on a card
      } else {
        deg -= 0.04;                            // gentle idle drift
      }
      render();
    });
    render();
  }

  // ---------- Section reveals: one IntersectionObserver, CSS does the rest ----------
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  // ---------- Timeline rail + record numeral (scrubbed) ----------
  gsap.to('#railFill', {
    scaleY: 1, ease: 'none',
    scrollTrigger: { trigger: '.timeline', start: 'top 75%', end: 'bottom 55%', scrub: 0.5 }
  });
  gsap.to('.record-count', {
    yPercent: 18, ease: 'none',
    scrollTrigger: { trigger: '.record', start: 'top bottom', end: 'bottom top', scrub: 0.8 }
  });

  // ---------- Magnetic elements ----------
  function magnetic(el, strength) {
    if (!el || !window.matchMedia('(pointer: fine)').matches) return;
    var qx = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
    var qy = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      qx((e.clientX - (r.left + r.width / 2)) * strength);
      qy((e.clientY - (r.top + r.height / 2)) * strength);
    });
    el.addEventListener('pointerleave', function () { qx(0); qy(0); });
  }
  magnetic(document.getElementById('photoCard'), 0.12);
  magnetic(copyBtn, 0.25);
})();
