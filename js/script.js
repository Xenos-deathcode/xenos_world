/* ============ CURSOR ============ */
const cur = document.getElementById('cursor');
const curTrail = document.getElementById('cursor-trail');

let mx = 0;
let my = 0;

document.addEventListener('mousemove', (e) => {
  mx = e.clientX;
  my = e.clientY;

  if (cur) {
    cur.style.left = mx + 'px';
    cur.style.top = my + 'px';
  }

  if (curTrail) {
    setTimeout(() => {
      curTrail.style.left = mx + 'px';
      curTrail.style.top = my + 'px';
    }, 80);
  }
});

/* ============ MATRIX CANVAS ============ */
(function () {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, cols, drops;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*ഐウエオカキクケコxenos01';

  function init() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    const fs = 14;
    cols = Math.floor(W / fs);
    drops = Array.from({ length: cols }, () => Math.random() * -H / fs);
  }

  function draw() {
    ctx.fillStyle = 'rgba(5,5,8,0.05)';
    ctx.fillRect(0, 0, W, H);
    ctx.font = '14px Share Tech Mono';

    for (let i = 0; i < cols; i++) {
      const ch = chars[Math.floor(Math.random() * chars.length)];
      const progress = drops[i] / (H / 14);

      ctx.fillStyle = progress < 0.2 ? '#ffffff' : '#00ffaa';
      ctx.globalAlpha = Math.max(0, 1 - progress * 0.7);
      ctx.fillText(ch, i * 14, drops[i] * 14);
      ctx.globalAlpha = 1;

      drops[i] += 0.5;
      if (drops[i] * 14 > H && Math.random() > 0.975) drops[i] = 0;
    }
  }

  init();
  setInterval(draw, 40);
  window.addEventListener('resize', init);
})();

/* ============ PARTICLES ============ */
(function () {
  const container = document.getElementById('particles');
  if (!container) return;

  const colors = ['#00ffaa', '#00aaff', '#ff003c'];

  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 1;

    p.style.cssText =
      'width:' + size + 'px;' +
      'height:' + size + 'px;' +
      'left:' + (Math.random() * 100) + '%;' +
      'background:' + colors[Math.floor(Math.random() * colors.length)] + ';' +
      'animation-duration:' + (8 + Math.random() * 12) + 's;' +
      'animation-delay:-' + (Math.random() * 20) + 's;';

    container.appendChild(p);
  }
})();

/* ============ COUNTER ANIMATION ============ */
function animateCount(el, target, suffix = '') {
  let start = 0;
  const dur = 2000;

  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / dur, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target) + suffix;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target + suffix;
    }
  };

  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const val = parseInt(el.dataset.count, 10);
      animateCount(el, val);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach((el) => counterObserver.observe(el));

/* ============ 3D CARD TILT ============ */
document.querySelectorAll('.project-card, .identity-card').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform =
      'perspective(800px) rotateY(' + (x * 10) + 'deg) rotateX(' + (-y * 10) + 'deg) translateZ(10px)';
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(800px) rotateY(0) rotateX(0) translateZ(0)';
  });
});

/* ============ TERMINAL TYPE + REPLAY ============ */
(function () {
  const out = document.getElementById('terminal-output');
  const terminalSection = document.getElementById('terminal');
  const replayBtn = document.getElementById('terminalReplayBtn');

  if (!out || !terminalSection) return;

  const lines = [
    { type: 'cmd', prompt: 'xenos@deathcode', cmd: 'whoami' },
    { type: 'out', text: '> xenos — android dev, hacker, builder', cls: 'green' },
    { type: 'cmd', prompt: 'xenos@deathcode', cmd: 'ls ./projects' },
    { type: 'out', text: 'SciFiLauncher  CedalLauncher  Elene  WebApp  Cyber-Tools', cls: 'blue' },
    { type: 'cmd', prompt: 'xenos@deathcode', cmd: 'cat ./status.txt' },
    { type: 'out', text: '[✓] Competition mode: ACTIVE', cls: 'green' },
    { type: 'out', text: '[✓] Building something crazy...', cls: 'green' },
    { type: 'out', text: '[!] Skill level: OVER 9000', cls: 'red' },
    { type: 'cmd', prompt: 'xenos@deathcode', cmd: 'echo "Lets win this trophy"' },
    { type: 'out', text: 'Lets win this trophy', cls: 'green' }
  ];

  let lineIndex = 0;
  let started = false;
  let activeTimeout = null;

  function clearTerminal() {
    out.innerHTML = '';
    lineIndex = 0;
  }

  function addCursor() {
    const div = document.createElement('div');
    div.className = 't-line';
    div.innerHTML = '<span class="t-prompt">xenos@deathcode:~$</span> <span class="t-cursor"></span>';
    out.appendChild(div);
  }

  function queueNext(fn, delay) {
    activeTimeout = setTimeout(fn, delay);
  }

  function typeNext() {
    if (lineIndex >= lines.length) {
      addCursor();
      return;
    }

    const line = lines[lineIndex];

    if (line.type === 'cmd') {
      const div = document.createElement('div');
      div.className = 't-line';
      div.innerHTML = '<span class="t-prompt">' + line.prompt + ':~$</span><span class="t-cmd"></span>';
      out.appendChild(div);

      const cmdSpan = div.querySelector('.t-cmd');
      let charIndex = 0;

      function typeCommand() {
        if (charIndex < line.cmd.length) {
          cmdSpan.textContent += line.cmd[charIndex++];
          queueNext(typeCommand, 40 + Math.random() * 25);
        } else {
          lineIndex++;
          queueNext(typeNext, 240);
        }
      }

      queueNext(typeCommand, 100);
    } else {
      const div = document.createElement('div');
      div.className = 't-output ' + (line.cls || '');
      div.textContent = line.text;
      out.appendChild(div);
      lineIndex++;
      queueNext(typeNext, 180);
    }

    out.scrollTop = out.scrollHeight;
  }

  function startTerminal() {
    clearTerminal();
    if (activeTimeout) clearTimeout(activeTimeout);
    typeNext();
  }

  const termObs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !started) {
      started = true;
      startTerminal();
      termObs.disconnect();
    }
  }, { threshold: 0.3 });

  termObs.observe(terminalSection);

  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      startTerminal();
    });
  }
})();

/* ============ CLOCK ============ */
function updateClock() {
  const now = new Date();
  const clock = document.getElementById('footer-clock');
  if (!clock) return;
  clock.textContent = now.toLocaleTimeString('en-GB', { hour12: false });
}

updateClock();
setInterval(updateClock, 1000);

/* ============ HERO V2 ============ */
(function () {
  const eyebrow = document.getElementById('heroEyebrow');
  const role = document.getElementById('heroRole');
  const glowOrb = document.getElementById('heroGlowOrb');
  const hero = document.getElementById('home');
  const heroTitleGlitch = document.querySelector('.pulse-glitch');
  const magneticButtons = document.querySelectorAll('.magnetic-btn');

  if (eyebrow) {
    const text = '[ SYSTEM ONLINE — INITIALIZING... ]';
    let i = 0;
    eyebrow.textContent = '';

    function typeEyebrow() {
      if (i < text.length) {
        eyebrow.textContent += text[i];
        i++;
        setTimeout(typeEyebrow, 35);
      }
    }

    typeEyebrow();
  }

  if (role) {
    const roles = ['Developer', 'Builder', 'Hacker', 'Creator'];
    let idx = 0;

    setInterval(() => {
      role.style.opacity = '0';
      role.style.transform = 'translateY(8px)';

      setTimeout(() => {
        idx = (idx + 1) % roles.length;
        role.textContent = roles[idx];
        role.style.opacity = '1';
        role.style.transform = 'translateY(0)';
      }, 220);
    }, 2200);
  }

  if (hero && glowOrb) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      glowOrb.style.left = (e.clientX - rect.left) + 'px';
      glowOrb.style.top = (e.clientY - rect.top) + 'px';
    });

    hero.addEventListener('mouseleave', () => {
      glowOrb.style.left = '50%';
      glowOrb.style.top = '50%';
    });
  }

  if (heroTitleGlitch) {
    setInterval(() => {
      heroTitleGlitch.classList.add('glitch-burst');
      setTimeout(() => {
        heroTitleGlitch.classList.remove('glitch-burst');
      }, 280);
    }, 3200);
  }

  magneticButtons.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });
})();

/* ============ BOT V2 ============ */
(function () {
  const bot = document.getElementById('xenosBotTrigger');
  const popup = document.getElementById('xenosBotPopup');
  if (!bot || !popup) return;

  const botResponses = [
    { text: 'Welcome to Xenos Server', action: null },
    { text: 'System online', action: null },
    { text: 'Identity verified', action: null },
    { text: 'Opening terminal', action: 'terminal' },
    { text: 'Projects loaded', action: 'projects' },
    { text: 'Ready for deployment', action: null }
  ];

  let isDragging = false;
  let moved = false;
  let offsetX = 0;
  let offsetY = 0;

  function speakMessage(text) {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.96;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => /Google US English|Microsoft Aria|Samantha|Daniel/i.test(v.name)) ||
      voices.find((v) => /en/i.test(v.lang));

    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  }

  function runBotAction(action) {
    if (!action) return;

    if (action === 'terminal') {
      const terminal = document.getElementById('terminal');
      if (terminal) terminal.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (action === 'projects') {
      const projects = document.getElementById('projects');
      if (projects) projects.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function showPopup(text) {
    popup.textContent = text;
    popup.classList.add('show');

    clearTimeout(window.xenosBotPopupTimer);
    window.xenosBotPopupTimer = setTimeout(() => {
      popup.classList.remove('show');
    }, 2600);
  }

  function startDrag(clientX, clientY) {
    const rect = bot.getBoundingClientRect();
    isDragging = true;
    moved = false;
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;
    bot.classList.add('dragging');
  }

  function doDrag(clientX, clientY) {
    if (!isDragging) return;
    moved = true;

    const maxX = window.innerWidth - bot.offsetWidth;
    const maxY = window.innerHeight - bot.offsetHeight;

    let left = clientX - offsetX;
    let top = clientY - offsetY;

    left = Math.max(8, Math.min(left, maxX - 8));
    top = Math.max(8, Math.min(top, maxY - 8));

    bot.style.left = left + 'px';
    bot.style.top = top + 'px';
    bot.style.right = 'auto';

    popup.style.left = Math.min(left, window.innerWidth - 270) + 'px';
    popup.style.top = (top + bot.offsetHeight + 10) + 'px';
    popup.style.right = 'auto';
  }

  function endDrag() {
    if (!isDragging) return;
    bot.classList.remove('dragging');
    setTimeout(() => {
      isDragging = false;
    }, 0);
  }

    function getBotMessage() {
    const nearTop = window.scrollY < 100;
    const nearBottom = window.innerHeight + window.scrollY > document.body.offsetHeight - 100;

    if (nearTop) {
      return { text: 'Boot sequence complete — welcome, operator.', action: null };
    }

    if (nearBottom) {
      return { text: 'End of log reached. Ready for next mission.', action: null };
    }

    return botResponses[Math.floor(Math.random() * botResponses.length)];
  }

  function handleBotClick() {
    const picked = getBotMessage();
    showPopup(picked.text);
    speakMessage(picked.text);
    runBotAction(picked.action);
  }

  bot.addEventListener('mousedown', (e) => {
    startDrag(e.clientX, e.clientY);
  });

  window.addEventListener('mousemove', (e) => {
    doDrag(e.clientX, e.clientY);
  });

  window.addEventListener('mouseup', endDrag);

  bot.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const t = e.touches[0];
    doDrag(t.clientX, t.clientY);
  }, { passive: true });

  window.addEventListener('touchend', endDrag);

  bot.addEventListener('click', () => {
    if (moved) {
      moved = false;
      return;
    }
    handleBotClick();
  });

  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
  }
})();

/* ============ ACTIVE NAV HIGHLIGHT ============ */
(function () {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  if (!sections.length || !navLinks.length) return;

  function setActiveLink() {
    let currentId = '';

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const offset = window.innerHeight * 0.35;

      if (rect.top <= offset && rect.bottom >= offset) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      const href = link.getAttribute('href');

      if (href === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', setActiveLink);
  window.addEventListener('load', setActiveLink);
})();

/* ============ PROJECT MODAL POPUP ============ */
(function () {
  const overlay = document.getElementById('projectModalOverlay');
  const modal = document.getElementById('projectModal');
  const closeBtn = document.getElementById('projectModalClose');
  const tagEl = document.getElementById('projectModalTag');
  const titleEl = document.getElementById('projectModalTitle');
  const descEl = document.getElementById('projectModalDesc');
  const stackEl = document.getElementById('projectModalStack');
  const metaEl = document.getElementById('projectModalMeta');
  const actionsEl = document.getElementById('projectModalActions');

  if (!overlay || !modal) return;

  function openModalFromCard(card) {
    const title = card.querySelector('.project-title')?.textContent || '';
    const desc = card.querySelector('.project-desc')?.textContent || '';
    const tag = card.querySelector('.project-tag')?.textContent?.trim() || '';

    const role = card.dataset.projectRole || '';
    const year = card.dataset.projectYear || '';
    const status = card.dataset.projectStatus || '';
    const link = card.dataset.projectLink || '';

    tagEl.textContent = tag;
    titleEl.textContent = title;
    descEl.textContent = desc;

    // meta pills
    metaEl.innerHTML = '';
    if (role) {
      const span = document.createElement('span');
      span.textContent = 'Role: ' + role;
      metaEl.appendChild(span);
    }
    if (year) {
      const span = document.createElement('span');
      span.textContent = 'Year: ' + year;
      metaEl.appendChild(span);
    }
    if (status) {
      const span = document.createElement('span');
      span.textContent = 'Status: ' + status;
      metaEl.appendChild(span);
    }

    // stack chips
    stackEl.innerHTML = '';
    const chips = card.querySelectorAll('.stack-chip');
    chips.forEach((chip) => {
      const clone = chip.cloneNode(true);
      clone.classList.add('stack-chip');
      stackEl.appendChild(clone);
    });

    // actions
    actionsEl.innerHTML = '';
    if (link) {
      const a = document.createElement('a');
      a.href = link;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'primary';
      a.textContent = 'Open project';
      actionsEl.appendChild(a);
    }

    overlay.classList.add('show');
    document.body.classList.add('modal-open');
    modal.focus();
  }

  function closeModal() {
    overlay.classList.remove('show');
    document.body.classList.remove('modal-open');
  }

  // Only the button opens the modal
  document.querySelectorAll('.project-card').forEach((card) => {
    const btn = card.querySelector('.project-view-btn');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openModalFromCard(card);
    });
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('show')) {
      closeModal();
    }
  });
})();
