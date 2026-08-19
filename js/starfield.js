
export function initStarfield() {
  const canvas = document.getElementById('starfield');
  const ctx    = canvas.getContext('2d');
  let W = 0, H = 0;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  
  const estrellas = Array.from({ length: 260 }, () => ({
    x:    Math.random(),
    y:    Math.random(),
    r:    Math.random() * 1.0 + 0.15,
    base: Math.random() * 0.30 + 0.04,
    spd:  Math.random() * 0.025 + 0.005,
    ph:   Math.random() * Math.PI * 2,
    tint: Math.random() < 0.10 ? 'rose' : Math.random() < 0.10 ? 'blue' : 'white',
  }));

  

  const fugaces = [];
  let nextFugaz = 2 + Math.random() * 3;

  function spawnFugaz() {
    fugaces.push({
      x:    Math.random() * W * 0.65,
      y:    Math.random() * H * 0.35,
      ang:  Math.PI * 0.12 + Math.random() * Math.PI * 0.36,
      spd:  320 + Math.random() * 220,
      len:  70  + Math.random() * 110,
      life: 0,
      max:  0.65 + Math.random() * 0.50,
      rose: Math.random() > 0.72,
    });
  }

  function dibujarFugaces(dt) {
    nextFugaz -= dt;
    if (nextFugaz <= 0) {
      spawnFugaz();
      nextFugaz = 2.8 + Math.random() * 4.2;
    }

    for (let i = fugaces.length - 1; i >= 0; i--) {
      const f = fugaces[i];
      f.life += dt;
      if (f.life >= f.max) { fugaces.splice(i, 1); continue; }

      const p  = f.life / f.max;
      const al = p < 0.12 ? p / 0.12 : p > 0.62 ? (1 - p) / 0.38 : 1;
      const hx = f.x + Math.cos(f.ang) * f.spd * f.life;
      const hy = f.y + Math.sin(f.ang) * f.spd * f.life;
      const tx = hx  - Math.cos(f.ang) * f.len;
      const ty = hy  - Math.sin(f.ang) * f.len;
      const rgb = f.rose ? '255,185,215' : '255,255,255';

      const grad = ctx.createLinearGradient(tx, ty, hx, hy);
      grad.addColorStop(0,    `rgba(${rgb},0)`);
      grad.addColorStop(0.50, `rgba(${rgb},${al * 0.22})`);
      grad.addColorStop(1,    `rgba(${rgb},${al * 0.88})`);

      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(hx, hy);
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 1.1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(hx, hy, 1.3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb},${al})`;
      ctx.fill();
    }
  }

  
  const nebulaEl = document.getElementById('nebula-cursor');
  const cursorEl = document.getElementById('cursor-dot');
  let mouseX = -3000, mouseY = -3000;
  let targetNX = 0,   targetNY = 0;
  let curNX    = 0,   curNY    = 0;
  let prevTs   = 0,   tick     = 0;

  document.addEventListener('mousemove', e => {
    mouseX   = e.clientX; mouseY   = e.clientY;
    targetNX = e.clientX; targetNY = e.clientY;
  });
  document.addEventListener('mouseleave', () => { mouseX = mouseY = -3000; });

  

  function actualizarBrilloCercania() {
    for (const card of document.querySelectorAll('.subject-card:not(.subject-card--locked)')) {
      const r  = card.getBoundingClientRect();
      const cx = r.left + r.width  * 0.5;
      const cy = r.top  + r.height * 0.5;
      const dx = cx - mouseX;
      const dy = cy - mouseY;
      const d  = Math.sqrt(dx * dx + dy * dy);
      const MAX_DIST = 270;

      if (d < MAX_DIST) {
        const t = Math.pow(1 - d / MAX_DIST, 2);
        if (card.classList.contains('subject-card--available')) {
          card.style.boxShadow   = `0 0 ${18 * t}px rgba(199,75,123,${0.45 * t}), 0 0 ${44 * t}px rgba(157,47,92,${0.18 * t})`;
          card.style.borderColor = `rgba(199,75,123,${0.18 + 0.55 * t})`;
        } else {
          card.style.boxShadow = `0 0 ${22 * t}px rgba(232,115,154,${0.55 * t}), 0 0 ${55 * t}px rgba(199,75,123,${0.28 * t})`;
        }
      } else {
        card.style.boxShadow = '';
        if (card.classList.contains('subject-card--available')) {
          card.style.borderColor = '';
        }
      }
    }
  }

  

  function loop(ts) {
    const dt = prevTs > 0 ? Math.min((ts - prevTs) / 1000, 0.05) : 0.016;
    prevTs = ts;
    tick  += dt;

    ctx.clearRect(0, 0, W, H);

    for (const s of estrellas) {
      const sx = s.x * W;
      const sy = s.y * H;
      const tw = (Math.sin(tick * s.spd * 60 + s.ph) + 1) / 2;
      const fa = s.base + tw * s.base * 0.65;

      ctx.beginPath();
      ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.tint === 'rose'
        ? `rgba(255,200,220,${fa})`
        : s.tint === 'blue'
        ? `rgba(200,220,255,${fa})`
        : `rgba(255,255,255,${fa})`;
      ctx.fill();

      if (fa > 0.38 && s.r > 0.85) {
        const hR   = s.r * 3.5;
        const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, hR);
        glow.addColorStop(0, `rgba(255,255,255,${fa * 0.13})`);
        glow.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.beginPath();
        ctx.arc(sx, sy, hR, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }
    }

    dibujarFugaces(dt);

    curNX += (targetNX - curNX) * 0.075;
    curNY += (targetNY - curNY) * 0.075;
    nebulaEl.style.transform = `translate(${curNX}px, ${curNY}px)`;
    cursorEl.style.transform  = `translate(${mouseX}px, ${mouseY}px)`;

    actualizarBrilloCercania();

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}
