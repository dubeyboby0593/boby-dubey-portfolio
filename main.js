/* ============================================================
   BOBY DUBEY — Cyber-Console Portfolio · main.js
   Boot sequence · Three.js reactive matrix-cube + particle net ·
   typewriter · counters · threat feed · theme switch · nav · form
   ============================================================ */
(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- footer year ---------- */
  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  /* ============================================================
     THEME SWITCHER
     ============================================================ */
  const THEMES = ['matrix', 'hybrid', 'cyber'];
  const THEME_LABELS = { matrix: 'MATRIX', hybrid: 'HYBRID', cyber: 'CYBER' };
  let themeIdx = Math.max(0, THEMES.indexOf(localStorage.getItem('bd-theme') || 'hybrid'));

  function applyTheme() {
    const t = THEMES[themeIdx];
    document.body.setAttribute('data-theme', t);
    const nameEl = $('#theme-name'); if (nameEl) nameEl.textContent = THEME_LABELS[t];
    localStorage.setItem('bd-theme', t);
    if (window.__cyberScene) window.__cyberScene.refreshColors();
  }
  function cycleTheme() { themeIdx = (themeIdx + 1) % THEMES.length; applyTheme(); flashThemeToast(); }
  applyTheme();
  $('#theme-switch')?.addEventListener('click', cycleTheme);

  // Double-tap / double-click ANYWHERE cycles theme (+ recolors ribbon strokes).
  // Ignores taps on links, buttons, and form fields so it never hijacks a real action.
  let lastTap = 0;
  function isInteractive(el) { return el && el.closest && el.closest('a,button,input,textarea,label,#nav-menu'); }
  function onQuickTap(e) {
    if (isInteractive(e.target)) { lastTap = 0; return; }
    const now = e.timeStamp || performance.now();
    if (now - lastTap < 340) { cycleTheme(); lastTap = 0; }
    else lastTap = now;
  }
  window.addEventListener('pointerup', onQuickTap, { passive: true });

  // Tiny toast so the theme change reads as intentional
  let toastEl = null, toastTimer = 0;
  function flashThemeToast() {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.id = 'theme-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = 'THEME // ' + THEME_LABELS[THEMES[themeIdx]];
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 900);
  }

  function accentHex() {
    return getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#4cd137';
  }
  function accent2Hex() {
    return getComputedStyle(document.body).getPropertyValue('--accent-2').trim() || '#00e5ff';
  }

  /* ============================================================
     BOOT SEQUENCE
     ============================================================ */
  const bootScreen = $('#boot-screen');
  const bootLog = $('#boot-log');
  const bootFill = $('#boot-bar-fill');
  const bootLines = [
    '> secure_profile.init()',
    '> auth: BOBY_DUBEY ................ [ OK ]',
    '> loading modules: soc, soar, ai_sec [ OK ]',
    '> establishing encrypted channel ... [ OK ]',
    '> threat_feed: ONLINE',
    '> render: telemetry_field [ OK ]',
    '> welcome, operator._',
  ];

  const bootEnter = $('#boot-enter');
  let gateReady = false;

  function finishBoot() {
    if (!bootScreen || bootScreen.classList.contains('done')) return;
    bootScreen.classList.add('done');
    setTimeout(() => { bootScreen.remove(); }, 650);
    startRoleTyper();
  }

  function armGate() {
    // reveal the "click to enter" cue; site enters on any click/key
    gateReady = true;
    if (bootEnter) bootEnter.classList.remove('hidden');
    const enter = () => finishBoot();
    bootScreen?.addEventListener('click', enter);
    bootScreen?.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); enter(); } });
    bootScreen?.focus?.();
  }

  function runBoot() {
    if (!bootScreen || !bootLog) { startRoleTyper(); return; }
    if (prefersReduced) {
      bootLog.textContent = bootLines.join('\n');
      if (bootFill) bootFill.style.width = '100%';
      armGate();
      return;
    }
    let li = 0, ci = 0;
    (function type() {
      if (li >= bootLines.length) { if (bootFill) bootFill.style.width = '100%'; setTimeout(armGate, 300); return; }
      const line = bootLines[li];
      bootLog.textContent = bootLines.slice(0, li).join('\n') + (li ? '\n' : '') + line.slice(0, ci);
      if (bootFill) bootFill.style.width = ((li + ci / line.length) / bootLines.length * 100).toFixed(1) + '%';
      ci++;
      if (ci > line.length) { li++; ci = 0; setTimeout(type, 90); }
      else setTimeout(type, 14 + Math.random() * 22);
    })();
  }
  // Safety: arm the gate even if typing stalls for any reason
  setTimeout(() => { if (!gateReady) armGate(); }, 6000);
  runBoot();

  /* ============================================================
     ROLE TYPEWRITER (hero)
     ============================================================ */
  const roles = [
    'Security Engineer',
    'SOC Automation Builder',
    'AI / LLM Security',
    'Detection Engineer',
    'Threat Hunter',
  ];
  let roleStarted = false;
  function startRoleTyper() {
    if (roleStarted) return; roleStarted = true;
    const el = $('#role-typer'); if (!el) return;
    if (prefersReduced) { el.textContent = roles[0]; return; }
    let r = 0, c = 0, deleting = false;
    (function tick() {
      const word = roles[r];
      c += deleting ? -1 : 1;
      el.textContent = word.slice(0, c);
      let delay = deleting ? 45 : 85;
      if (!deleting && c === word.length) { delay = 1600; deleting = true; }
      else if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; delay = 350; }
      setTimeout(tick, delay);
    })();
  }

  /* ============================================================
     SCROLL REVEALS
     ============================================================ */
  const revealEls = $$('.reveal');
  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  }

  /* ============================================================
     ANIMATED COUNTERS
     ============================================================ */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.count || '0');
    const suffix = el.dataset.suffix || '';
    if (prefersReduced) { el.textContent = target + suffix; return; }
    const dur = 1400; const start = performance.now();
    (function step(now) {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }
  const counters = $$('.stat-num');
  if ('IntersectionObserver' in window && !prefersReduced) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach(c => cio.observe(c));
  } else {
    counters.forEach(animateCounter);
  }

  /* ============================================================
     THREAT FEED TICKER
     ============================================================ */
  const feedList = $('#threat-feed-list');
  if (feedList && !prefersReduced) {
    const kinds = ['phishing', 'malware', 'brute-force', 'anomaly', 'exfil-attempt', 'priv-esc', 'c2-beacon', 'impersonation'];
    const verbs = ['contained', 'triaged', 'escalated', 'quarantined', 'blocked', 'auto-remediated'];
    let id = 1042;
    function push() {
      const k = kinds[Math.floor(Math.random() * kinds.length)];
      const v = verbs[Math.floor(Math.random() * verbs.length)];
      const li = document.createElement('li');
      li.innerHTML = `<b>#${id++}</b> ${k} → ${v}`;
      feedList.prepend(li);
      while (feedList.children.length > 3) feedList.lastChild.remove();
    }
    push(); push(); push();
    setInterval(push, 2600);
  } else if (feedList) {
    feedList.innerHTML = '<li><b>#1042</b> anomaly → triaged</li><li><b>#1043</b> phishing → contained</li>';
  }

  /* ============================================================
     OPERATIONS CAROUSEL — drag + swipe + buttons + dots
     ============================================================ */
  (function carousel() {
    const track = $('#car-track');
    if (!track) return;
    const cards = $$('.op-card', track);
    const prev = $('#car-prev'), next = $('#car-next'), dotsWrap = $('#car-dots');

    // build dots
    cards.forEach((_, i) => {
      const d = document.createElement('i');
      d.addEventListener('click', () => scrollToCard(i));
      dotsWrap?.appendChild(d);
    });
    const dots = dotsWrap ? $$('i', dotsWrap) : [];

    function cardStep() {
      if (cards.length < 2) return cards[0]?.offsetWidth || 320;
      return cards[1].offsetLeft - cards[0].offsetLeft;
    }
    function current() { return Math.round(track.scrollLeft / cardStep()); }
    function scrollToCard(i) {
      const idx = Math.max(0, Math.min(cards.length - 1, i));
      track.scrollTo({ left: idx * cardStep(), behavior: 'smooth' });
    }
    function syncUI() {
      const c = current();
      dots.forEach((d, i) => d.classList.toggle('on', i === c));
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
    }
    prev?.addEventListener('click', () => scrollToCard(current() - 1));
    next?.addEventListener('click', () => scrollToCard(current() + 1));
    track.addEventListener('scroll', syncUI, { passive: true });

    // pointer drag-to-scroll (desktop)
    let down = false, startX = 0, startScroll = 0, moved = false;
    track.addEventListener('pointerdown', (e) => {
      down = true; moved = false; startX = e.clientX; startScroll = track.scrollLeft;
      track.classList.add('dragging');
    });
    track.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startScroll - dx;
    });
    function endDrag() {
      if (!down) return;
      down = false; track.classList.remove('dragging');
      scrollToCard(current()); // snap to nearest
    }
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('pointerleave', endDrag);
    // prevent a drag from triggering the card link / double-tap theme
    track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);

    window.addEventListener('resize', syncUI, { passive: true });
    syncUI();
  })();

  /* ============================================================
     MOBILE NAV
     ============================================================ */
  const navToggle = $('#nav-toggle');
  const navMenu = $('#nav-menu');
  navToggle?.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  $$('#nav-menu a').forEach(a => a.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }));

  /* ============================================================
     CONTACT FORM → mailto (static-site friendly)
     ============================================================ */
  $('#contactForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#cf-name').value.trim();
    const email = $('#cf-email').value.trim();
    const msg = $('#cf-msg').value.trim();
    const note = $('#form-note');
    const body = `Name: ${name}%0AEmail: ${email}%0A%0A${encodeURIComponent(msg)}`;
    window.location.href = `mailto:dubeyboby0593@gmail.com?subject=${encodeURIComponent('Portfolio contact — ' + name)}&body=${body}`;
    if (note) note.textContent = '> opening your mail client…';
  });

  /* ============================================================
     CURSOR GLOW (desktop pointers only)
     ============================================================ */
  const glow = $('#cursor-glow');
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const pointer = { x: 0.5, y: 0.5 };
  if (glow && finePointer && !prefersReduced) {
    window.addEventListener('pointermove', (e) => {
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }, { passive: true });
  } else if (glow) { glow.style.display = 'none'; }

  // Track normalized pointer for 3D parallax (all devices)
  window.addEventListener('pointermove', (e) => {
    pointer.x = e.clientX / window.innerWidth;
    pointer.y = e.clientY / window.innerHeight;
  }, { passive: true });

  /* ============================================================
     SILK LIGHT-RIBBON cursor trail (fiber-optic packet trace)
     Velocity-reactive: thins when moving fast, pools + glows when slow.
     Own 2D canvas layer, additive blending, LERP-smoothed spine.
     ============================================================ */
  function initRibbon() {
    const rc = $('#ribbon-canvas');
    if (!rc || prefersReduced || !finePointer) { if (rc) rc.style.display = 'none'; return; }
    const ctx = rc.getContext('2d');
    let W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      rc.width = W * dpr; rc.height = H * dpr;
      rc.style.width = W + 'px'; rc.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const N = 26;                 // ribbon spine samples
    const spine = [];             // {x,y}
    let mx = W / 2, my = H / 2;    // raw pointer
    let hx = W / 2, hy = H / 2;    // smoothed head
    let vel = 0;                  // smoothed speed
    let lastX = mx, lastY = my;
    let active = false, idleT = 0;

    for (let i = 0; i < N; i++) spine.push({ x: hx, y: hy });

    window.addEventListener('pointermove', (e) => {
      mx = e.clientX; my = e.clientY; active = true; idleT = 0;
    }, { passive: true });
    window.addEventListener('pointerdown', () => { idleT = 0; active = true; }, { passive: true });

    function hexToRgb(h) {
      h = h.replace('#',''); if (h.length === 3) h = h.split('').map(c=>c+c).join('');
      const n = parseInt(h, 16); return [(n>>16)&255, (n>>8)&255, n&255];
    }

    function frame() {
      requestAnimationFrame(frame);
      ctx.clearRect(0, 0, W, H);
      if (!active) { idleT++; if (idleT > 240) return; }

      // instantaneous speed -> smoothed velocity
      const dx = mx - lastX, dy = my - lastY;
      const inst = Math.min(60, Math.hypot(dx, dy));
      vel += (inst - vel) * 0.15;
      lastX = mx; lastY = my;

      // smooth head then trail spine toward it (LERP chain = silk)
      hx += (mx - hx) * 0.35; hy += (my - hy) * 0.35;
      spine[0].x += (hx - spine[0].x) * 0.5;
      spine[0].y += (hy - spine[0].y) * 0.5;
      for (let i = 1; i < N; i++) {
        spine[i].x += (spine[i-1].x - spine[i].x) * 0.45;
        spine[i].y += (spine[i-1].y - spine[i].y) * 0.45;
      }

      // width: pools (thick) when slow, thins when fast
      const baseW = 13 - Math.min(10, vel * 0.32);
      const a1 = hexToRgb(accentHex());
      const a2 = hexToRgb(accent2Hex());

      ctx.globalCompositeOperation = 'lighter'; // additive glow
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';

      // PASS 1 — wide soft colored aura (the "pool" / bloom body)
      for (let i = 0; i < N - 1; i++) {
        const p = i / (N - 1);
        const w = Math.max(0.6, baseW * (1 - p) * 1.8);
        const alpha = (1 - p) * 0.28;
        const r = Math.round(a1[0] + (a2[0]-a1[0]) * p);
        const g = Math.round(a1[1] + (a2[1]-a1[1]) * p);
        const b = Math.round(a1[2] + (a2[2]-a1[2]) * p);
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.shadowColor = `rgba(${r},${g},${b},${alpha})`;
        ctx.shadowBlur = 22 * (1 - p);
        ctx.lineWidth = w;
        ctx.beginPath(); ctx.moveTo(spine[i].x, spine[i].y); ctx.lineTo(spine[i+1].x, spine[i+1].y); ctx.stroke();
      }

      // PASS 2 — crisp mid colored strand
      for (let i = 0; i < N - 1; i++) {
        const p = i / (N - 1);
        const w = Math.max(0.4, baseW * (1 - p));
        const alpha = (1 - p) * 0.55;
        const r = Math.round(a1[0] + (a2[0]-a1[0]) * p);
        const g = Math.round(a1[1] + (a2[1]-a1[1]) * p);
        const b = Math.round(a1[2] + (a2[2]-a1[2]) * p);
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.shadowBlur = 0; ctx.lineWidth = w;
        ctx.beginPath(); ctx.moveTo(spine[i].x, spine[i].y); ctx.lineTo(spine[i+1].x, spine[i+1].y); ctx.stroke();
      }

      // PASS 3 — glossy white-hot inner core (the "gloss" highlight)
      for (let i = 0; i < N - 1; i++) {
        const p = i / (N - 1);
        const w = Math.max(0.3, baseW * (1 - p) * 0.4);
        const alpha = (1 - p) * 0.85;
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.lineWidth = w;
        ctx.beginPath(); ctx.moveTo(spine[i].x, spine[i].y); ctx.lineTo(spine[i+1].x, spine[i+1].y); ctx.stroke();
      }

      // head "packet": colored bloom + glossy white core, blooms when slow
      const bloom = 4 + Math.max(0, (6 - vel)) * 1.8;
      ctx.shadowBlur = 26; ctx.shadowColor = `rgba(${a1[0]},${a1[1]},${a1[2]},.95)`;
      ctx.fillStyle = `rgba(${a1[0]},${a1[1]},${a1[2]},.85)`;
      ctx.beginPath(); ctx.arc(spine[0].x, spine[0].y, bloom, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,.95)';
      ctx.beginPath(); ctx.arc(spine[0].x, spine[0].y, bloom * 0.42, 0, Math.PI * 2); ctx.fill();

      ctx.globalCompositeOperation = 'source-over';
    }
    frame();
  }
  window.addEventListener('deviceorientation', (e) => {
    if (e.gamma == null) return;
    pointer.x = 0.5 + Math.max(-1, Math.min(1, e.gamma / 45)) * 0.5;
    pointer.y = 0.5 + Math.max(-1, Math.min(1, (e.beta - 45) / 45)) * 0.5;
  }, { passive: true });

  /* ============================================================
     THREE.JS — TELEMETRY WAVE FIELD (oscilloscope / signal stream)
     Flowing sine lines w/ layered noise. Cursor is a repulsor that
     warps nearby waves. LERP-smoothed camera parallax + depth.
     Falls back to CSS grid if WebGL/Three unavailable.
     ============================================================ */
  function initScene() {
    const canvas = $('#bg-canvas');
    const fallback = $('#grid-fallback');
    if (prefersReduced) { if (fallback) fallback.style.zIndex = '-4'; return; }
    if (typeof THREE === 'undefined' || !canvas) { if (fallback) fallback.style.zIndex = '-4'; return; }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch (err) {
      if (fallback) fallback.style.zIndex = '-4';
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8)); // cap DPR for perf
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 60);

    const group = new THREE.Group();
    group.rotation.x = -0.35; // slight tilt -> perspective depth on the field
    scene.add(group);

    // --- build N horizontal signal lines across the field ---
    const LINES = 22;          // number of telemetry traces
    const SEG = 120;           // points per line (smoothness)
    const SPAN = 150;          // horizontal world width
    const GAP = 4.2;           // vertical spacing between lines
    const lines = [];
    const lineMats = [];

    for (let li = 0; li < LINES; li++) {
      const pos = new Float32Array(SEG * 3);
      for (let s = 0; s < SEG; s++) {
        pos[s*3] = (s / (SEG - 1) - 0.5) * SPAN;
        pos[s*3+1] = 0;
        pos[s*3+2] = 0;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      // center lines brighter, edges fade -> keeps focus calm
      const dist = Math.abs(li - (LINES - 1) / 2) / ((LINES - 1) / 2);
      const mat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.10 + (1 - dist) * 0.28 });
      lineMats.push(mat);
      const line = new THREE.Line(geo, mat);
      const baseY = (li - (LINES - 1) / 2) * GAP;
      line.userData = {
        baseY,
        phase: li * 0.5,
        amp: 1.4 + Math.random() * 1.8,
        freq: 0.06 + Math.random() * 0.05,
        speed: 0.5 + Math.random() * 0.5,
        z: -30 + (1 - dist) * 20, // center lines nearer camera
      };
      line.position.z = line.userData.z;
      group.add(line);
      lines.push(line);
    }

    function refreshColors() {
      const a = new THREE.Color(accentHex());
      const b = new THREE.Color(accent2Hex());
      lines.forEach((ln, i) => {
        const dist = Math.abs(i - (LINES - 1) / 2) / ((LINES - 1) / 2);
        lineMats[i].color = a.clone().lerp(b, dist); // gradient accent->accent2 outward
      });
    }
    refreshColors();
    window.__cyberScene = { refreshColors };

    // --- cursor projected into the field plane (LERP-smoothed) ---
    const cur = { x: 0, y: 0 };        // smoothed pointer in world-ish units
    const tgt = { x: 0, y: 0 };
    let scrollP = 0;
    window.addEventListener('scroll', () => {
      const max = document.body.scrollHeight - window.innerHeight;
      scrollP = max > 0 ? window.scrollY / max : 0;
    }, { passive: true });

    let running = true;
    const clock = new THREE.Clock();

    function render() {
      if (!running) return;
      const t = clock.getElapsedTime();

      // smooth cursor target -> world coords (repulsor position)
      tgt.x = (pointer.x - 0.5) * SPAN;
      tgt.y = -(pointer.y - 0.5) * (LINES * GAP);
      cur.x += (tgt.x - cur.x) * 0.06;   // LERP = silky trailing
      cur.y += (tgt.y - cur.y) * 0.06;

      for (let li = 0; li < LINES; li++) {
        const ln = lines[li];
        const ud = ln.userData;
        const arr = ln.geometry.attributes.position.array;
        for (let s = 0; s < SEG; s++) {
          const x = arr[s*3];
          // layered sine "signal"
          let y = Math.sin(x * ud.freq + t * ud.speed + ud.phase) * ud.amp
                + Math.sin(x * ud.freq * 2.3 + t * ud.speed * 1.4) * ud.amp * 0.35;
          // cursor repulsor: bump the wave near the pointer, smooth falloff
          const dx = x - cur.x;
          const dy = ud.baseY - cur.y;
          const d2 = dx * dx + dy * dy;
          const infl = Math.exp(-d2 / 320);            // gaussian bump
          y += infl * 10 * Math.sin(t * 3 + x * 0.1);  // localized ripple
          arr[s*3+1] = y;
        }
        ln.geometry.attributes.position.needsUpdate = true;
        ln.position.y = ud.baseY;
      }

      // group drift + parallax (camera eased toward pointer)
      group.position.y = Math.sin(t * 0.1) * 1.5 - scrollP * 20;
      group.rotation.z = (pointer.x - 0.5) * 0.06;
      camera.position.x += (((pointer.x - 0.5) * 14) - camera.position.x) * 0.04;
      camera.position.y += (((-(pointer.y - 0.5)) * 8) - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }
    render();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { running = false; }
      else if (!running) { running = true; render(); }
    });

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, { passive: true });
  }

  /* ============================================================
     CURSOR-SPOTLIGHT tracking for .spot cards (--mx / --my)
     ============================================================ */
  if (finePointer) {
    const spots = $$('.spot');
    window.addEventListener('pointermove', (e) => {
      for (const el of spots) {
        const r = el.getBoundingClientRect();
        if (e.clientX >= r.left - 40 && e.clientX <= r.right + 40 &&
            e.clientY >= r.top - 40 && e.clientY <= r.bottom + 40) {
          el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
          el.style.setProperty('--my', (e.clientY - r.top) + 'px');
        }
      }
    }, { passive: true });
  }

  // Three.js is deferred; init after load so THREE is defined
  function boot() { initScene(); initRibbon(); }
  if (document.readyState === 'complete') boot();
  else window.addEventListener('load', boot);
})();
