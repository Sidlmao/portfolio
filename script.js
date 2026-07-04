/* ============================================================
   Motion layer. Gated behind prefers-reduced-motion; degrades
   to a clean static page if libraries fail to load.
   ============================================================ */

(function () {
  var nav = document.getElementById('nav');

  // Nav background on scroll
  function onScroll() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Copy email button
  var copyBtn = document.getElementById('copyBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var email = 'sidgadikota26@gmail.com';
      function done() {
        copyBtn.classList.add('copied');
        copyBtn.textContent = 'Copied';
        setTimeout(function () {
          copyBtn.classList.remove('copied');
          copyBtn.textContent = 'Copy email';
        }, 2000);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done);
      } else {
        var ta = document.createElement('textarea');
        ta.value = email;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        done();
      }
    });
  }

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  // ---------- 3D ring layout (runs even for reduced motion: static composed state) ----------
  var ring = document.getElementById('ring');
  var cards = ring ? Array.prototype.slice.call(ring.querySelectorAll('.ring-card')) : [];
  var STEP = cards.length ? 360 / cards.length : 60;
  var radius = 0;

  function layoutRing() {
    if (!ring || !cards.length) return;
    var w = ring.offsetWidth;
    radius = Math.round((w / 2) / Math.tan(Math.PI / cards.length)) + Math.round(w * 0.55);
    cards.forEach(function (card, i) {
      card.style.transform = 'rotateY(' + (i * STEP) + 'deg) translateZ(' + radius + 'px)';
    });
    ring.classList.add('ring-ready');
  }

  var ringTitle = document.getElementById('ringTitle');
  var ringLine = document.getElementById('ringLine');
  var activeIdx = -1;

  function setActive(idx) {
    if (idx === activeIdx || !cards.length) return;
    activeIdx = idx;
    cards.forEach(function (c, i) { c.classList.toggle('is-active', i === idx); });
    if (ringTitle && ringLine) {
      ringTitle.textContent = cards[idx].getAttribute('data-title');
      ringLine.textContent = (cards[idx].getAttribute('data-line') || '').toUpperCase();
      if (hasGsap && !reduced) {
        gsap.fromTo('.ring-caption', { y: 10 }, { y: 0, duration: 0.35, ease: 'power2.out', overwrite: true });
      }
    }
  }

  layoutRing();
  setActive(0);
  window.addEventListener('resize', layoutRing);

  if (reduced || !hasGsap) return; // static page, fully composed

  gsap.registerPlugin(ScrollTrigger);

  // ---------- Smooth scroll (Lenis bridged to GSAP ticker) ----------
  var lenis = null;
  if (typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ autoRaf: false, lerp: 0.11 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        var target = id.length > 1 && document.querySelector(id);
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: 0, duration: 1.1 });
        }
      });
    });
  }

  // ---------- Hero: kinetic type + cutout ----------
  document.querySelectorAll('.hero-name .chars').forEach(function (el) {
    var text = el.textContent;
    el.textContent = '';
    text.split('').forEach(function (ch) {
      var s = document.createElement('span');
      s.textContent = ch;
      el.appendChild(s);
    });
  });

  gsap.from('.hero-name .line .chars span', {
    yPercent: 112,
    duration: 1.1,
    ease: 'power4.out',
    stagger: 0.045,
    delay: 0.15
  });
  gsap.from('.hero-cutout', {
    yPercent: 24,
    scale: 0.94,
    duration: 1.3,
    ease: 'power3.out',
    delay: 0.45
  });
  gsap.from('.hero-front > *, .hero-meta', {
    y: 26,
    duration: 0.9,
    ease: 'power3.out',
    stagger: 0.08,
    delay: 0.75
  });

  // Scroll response: plate settles, name splits, cutout rises slower (depth)
  var heroScrub = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 };
  gsap.to('.hero-plate img', { scale: 1.0, yPercent: 8, ease: 'none', scrollTrigger: heroScrub });
  gsap.to('.hero-name .line:first-child', { xPercent: -5, ease: 'none', scrollTrigger: heroScrub });
  gsap.to('.hero-name .line-2', { xPercent: 5, ease: 'none', scrollTrigger: heroScrub });
  gsap.to('.hero-cutout', { yPercent: -18, ease: 'none', scrollTrigger: heroScrub });

  // Mouse tilt on the cutout (fine pointers only)
  if (window.matchMedia('(pointer: fine)').matches) {
    var cut = document.getElementById('heroCutout');
    if (cut) {
      var rx = gsap.quickTo(cut, 'rotationY', { duration: 0.6, ease: 'power3.out' });
      var ry = gsap.quickTo(cut, 'rotationX', { duration: 0.6, ease: 'power3.out' });
      var hero = document.querySelector('.hero');
      hero.addEventListener('pointermove', function (e) {
        var nx = (e.clientX / window.innerWidth) - 0.5;
        var ny = (e.clientY / window.innerHeight) - 0.5;
        rx(nx * 10);
        ry(ny * -8);
      });
      hero.addEventListener('pointerleave', function () { rx(0); ry(0); });
    }
  }

  // ---------- 3D ring: pinned, scroll spins it twice ----------
  if (ring && cards.length) {
    var spin = { deg: 0 };
    gsap.to(spin, {
      deg: -720,
      ease: 'none',
      scrollTrigger: {
        trigger: '.gallery-pin',
        start: 'top top',
        end: '+=250%',
        pin: true,
        scrub: 0.5,
        anticipatePin: 1,
        onUpdate: function () {
          var idx = Math.round(-spin.deg / STEP) % cards.length;
          if (idx < 0) idx += cards.length;
          setActive(idx);
        }
      },
      onUpdate: function () {
        gsap.set(ring, { rotationY: spin.deg, rotationX: -6 });
      }
    });
    gsap.set(ring, { rotationX: -6 });
  }

  // ---------- Section reveals (transform only, play once) ----------
  document.querySelectorAll('.reveal').forEach(function (el) {
    gsap.from(el, {
      y: 34,
      duration: 0.85,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  // ---------- Timeline rail ----------
  var rail = document.getElementById('railFill');
  if (rail) {
    gsap.to(rail, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: { trigger: '.timeline', start: 'top 75%', end: 'bottom 55%', scrub: 0.5 }
    });
  }

  // ---------- Record numeral drift ----------
  gsap.to('.record-count', {
    yPercent: 18,
    ease: 'none',
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
  magnetic(document.getElementById('copyBtn'), 0.25);
})();
