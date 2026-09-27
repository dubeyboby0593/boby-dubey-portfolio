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
  applyTheme();
  $('#theme-switch')?.addEventListener('click', () => {
    themeIdx = (themeIdx + 1) % THEMES.length;
    applyTheme();
  });

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
    '> render: 3D_ORGANISM',
    '> welcome, operator._',
  ];

  function finishBoot() {
    if (!bootScreen || bootScreen.classList.contains('done')) return;
    bootScreen.classList.add('done');
    setTimeout(() => { bootScreen.remove(); }, 650);
    startRoleTyper();
  }

  function runBoot() {
    if (!bootScreen || !bootLog) { startRoleTyper(); return; }
    if (prefersReduced) {
      bootLog.textContent = bootLines.join('\n');
      if (bootFill) bootFill.style.width = '100%';
      setTimeout(finishBoot, 400);
      return;
    }
    let li = 0, ci = 0;
    (function type() {
      if (li >= bootLines.length) { if (bootFill) bootFill.style.width = '100%'; setTimeout(finishBoot, 500); return; }
      const line = bootLines[li];
      bootLog.textContent = bootLines.slice(0, li).join('\n') + (li ? '\n' : '') + line.slice(0, ci);
      if (bootFill) bootFill.style.width = ((li + ci / line.length) / bootLines.length * 100).toFixed(1) + '%';
      ci++;
      if (ci > line.length) { li++; ci = 0; setTimeout(type, 90); }
      else setTimeout(type, 14 + Math.random() * 22);
    })();
  }
  $('#boot-skip')?.addEventListener('click', finishBoot);
  // Safety: never trap the user behind the boot screen
  setTimeout(finishBoot, 6000);
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
  window.addEventListener('deviceorientation', (e) => {
    if (e.gamma == null) return;
    pointer.x = 0.5 + Math.max(-1, Math.min(1, e.gamma / 45)) * 0.5;
    pointer.y = 0.5 + Math.max(-1, Math.min(1, (e.beta - 45) / 45)) * 0.5;
  }, { passive: true });

  /* ============================================================
     THREE.JS — reactive matrix cube + particle network
     Falls back to CSS grid if WebGL/Three unavailable.
     ============================================================ */
  function initScene() {
    const canvas = $('#bg-canvas');
    const fallback = $('#grid-fallback');
    if (prefersReduced) { if (fallback) fallback.style.zIndex = '-3'; return; }
    if (typeof THREE === 'undefined' || !canvas) { if (fallback) fallback.style.zIndex = '-3'; return; }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch (err) {
      if (fallback) fallback.style.zIndex = '-3';
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8)); // cap DPR for perf
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 46;

    const group = new THREE.Group();
    scene.add(group);

    // --- central wireframe "matrix cube" (nested boxes) — pushed back, low opacity ---
    const cube = new THREE.Group();
    const boxMats = [];
    [16, 11, 6].forEach((s, i) => {
      const geo = new THREE.BoxGeometry(s, s, s);
      const edges = new THREE.EdgesGeometry(geo);
      const mat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.12 - i * 0.025 });
      boxMats.push(mat);
      const line = new THREE.LineSegments(edges, mat);
      line.userData.spin = 0.0006 + i * 0.0004;
      cube.add(line);
    });
    cube.position.z = -14; // offset away from the reading column
    group.add(cube);

    // --- particle network sphere — ~65% fewer, dimmer, blurred-soft ---
    const COUNT = 320;
    const positions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const r = 30 + Math.random() * 20; // wider radius -> particles sit toward the edges
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      positions[i*3]   = r * Math.sin(ph) * Math.cos(th);
      positions[i*3+1] = r * Math.sin(ph) * Math.sin(th);
      positions[i*3+2] = r * Math.cos(ph);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.28, transparent: true, opacity: 0.4 });
    const points = new THREE.Points(pGeo, pMat);
    group.add(points);

    // --- a few orbiting nodes (dim, wide orbit so they stay at the edges) ---
    const nodes = [];
    const nodeMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.5 });
    for (let i = 0; i < 4; i++) {
      const n = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 12), nodeMat);
      n.userData = { r: 30 + i * 4, a: Math.random() * Math.PI * 2, sp: 0.002 + i * 0.0008, tilt: Math.random() * Math.PI };
      group.add(n); nodes.push(n);
    }

    function refreshColors() {
      const a = new THREE.Color(accentHex());
      const b = new THREE.Color(accent2Hex());
      boxMats.forEach((m, i) => m.color = (i === 1 ? b : a));
      pMat.color = a;
      nodeMat.color = b;
    }
    refreshColors();
    window.__cyberScene = { refreshColors };

    // --- interaction / render loop ---
    let targetRX = 0, targetRY = 0, curRX = 0, curRY = 0;
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
      // pointer drives target rotation
      targetRY = (pointer.x - 0.5) * 1.8;
      targetRX = (pointer.y - 0.5) * 1.4;
      curRX += (targetRX - curRX) * 0.05;
      curRY += (targetRY - curRY) * 0.05;

      group.rotation.x = curRX + scrollP * Math.PI * 0.6;
      group.rotation.y = curRY + t * 0.08 + scrollP * Math.PI;

      cube.children.forEach((c) => { c.rotation.x += c.userData.spin; c.rotation.y += c.userData.spin * 1.3; });
      cube.scale.setScalar(1 + Math.sin(t * 0.8) * 0.04 + scrollP * 0.5);
      points.rotation.y = -t * 0.03;

      nodes.forEach(n => {
        n.userData.a += n.userData.sp;
        const a = n.userData.a, r = n.userData.r, tl = n.userData.tilt;
        n.position.set(Math.cos(a) * r, Math.sin(a) * r * Math.cos(tl), Math.sin(a) * r * Math.sin(tl));
      });

      // camera eased toward pointer for parallax depth
      camera.position.x += (( (pointer.x - 0.5) * 10) - camera.position.x) * 0.04;
      camera.position.y += (((-(pointer.y - 0.5)) * 8) - camera.position.y) * 0.04;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }
    render();

    // pause when tab hidden (save battery)
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

  // Three.js is deferred; init after load so THREE is defined
  if (document.readyState === 'complete') initScene();
  else window.addEventListener('load', initScene);
})();
