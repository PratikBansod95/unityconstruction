// ── SHOWCASE 3D CANVAS — interactive building with High-DPI support
(function() {
  const c = document.getElementById('sc-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  
  const dpr = window.devicePixelRatio || 1;
  let logicalWidth = 0;
  let logicalHeight = 0;
  let animationFrameId = null;

  function resize() {
    logicalWidth = c.offsetWidth;
    logicalHeight = c.offsetHeight;
    c.width = logicalWidth * dpr;
    c.height = logicalHeight * dpr;
    
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  let rotY = 0.5;
  let rotX = 0.25;
  let drag = false;
  let lx = 0;
  let ly = 0;
  let autoR = true;

  c.addEventListener('mousedown', e => { 
    drag = true; 
    lx = e.clientX; 
    ly = e.clientY; 
    autoR = false; 
  });
  
  window.addEventListener('mouseup', () => { drag = false; });
  
  c.addEventListener('mousemove', e => {
    if (drag) {
      rotY += (e.clientX - lx) * 0.007;
      rotX += (e.clientY - ly) * 0.006;
      rotX = Math.max(-0.7, Math.min(0.7, rotX));
    }
    lx = e.clientX; 
    ly = e.clientY;
  }, { passive: true });

  // Touch support for mobile interaction
  c.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      drag = true;
      lx = e.touches[0].clientX;
      ly = e.touches[0].clientY;
      autoR = false;
    }
  }, { passive: true });

  c.addEventListener('touchmove', e => {
    if (drag && e.touches.length === 1) {
      const touch = e.touches[0];
      rotY += (touch.clientX - lx) * 0.007;
      rotX += (touch.clientY - ly) * 0.006;
      rotX = Math.max(-0.7, Math.min(0.7, rotX));
      lx = touch.clientX;
      ly = touch.clientY;
    }
  }, { passive: true });

  c.addEventListener('touchend', () => { drag = false; });

  function proj(x, y, z, W, H) {
    const fov = 700;
    const cY = Math.cos(rotY);
    const sY = Math.sin(rotY);
    const nx = x * cY - z * sY;
    const nz = x * sY + z * cY;
    const cX = Math.cos(rotX);
    const sX = Math.sin(rotX);
    const ny = y * cX - nz * sX;
    const nz2 = y * sX + nz * cX;
    const sc = fov / (fov + nz2 + 420);
    return { x: W / 2 + nx * sc * 1.6, y: H / 2 + 60 + ny * sc * 1.6, z: nz2, sc };
  }

  const boxes = [
    { x: 0, y: 90, z: 0, w: 220, h: 18, d: 170 },
    { x: 0, y: -50, z: 0, w: 130, h: 280, d: 105 },
    { x: -90, y: 36, z: 0, w: 60, h: 108, d: 95 },
    { x: 90, y: 36, z: 0, w: 60, h: 108, d: 95 },
    { x: 0, y: -170, z: 0, w: 85, h: 70, d: 72 },
    { x: 0, y: -225, z: 0, w: 46, h: 30, d: 46 },
    { x: 0, y: -270, z: 0, w: 7, h: 70, d: 7 }
  ];

  let t = 0;
  
  function draw() {
    t += 0.01;
    if (autoR) rotY += 0.005;
    
    const W = logicalWidth;
    const H = logicalHeight;
    ctx.clearRect(0, 0, W, H);
    
    const dark = document.body.getAttribute('data-theme') === 'dark';
    const ga = dark ? 'rgba(184,150,62,' : 'rgba(110,80,14,';

    // floor grid
    ctx.strokeStyle = dark ? 'rgba(184,150,62,0.07)' : 'rgba(110,80,14,0.05)';
    ctx.lineWidth = 0.5;
    for (let i = -7; i <= 7; i++) {
      const a = proj(i * 65, 100, -440, W, H);
      const b = proj(i * 65, 100, 440, W, H);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      
      const d = proj(-440, 100, i * 65, W, H);
      const e = proj(440, 100, i * 65, W, H);
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(e.x, e.y);
      ctx.stroke();
    }
    
    // stars (dark mode only)
    if (dark) {
      for (let i = 0; i < 80; i++) {
        const sx = (Math.sin(i * 2.1 + t * .07) * .5 + .5) * W;
        const sy = (Math.cos(i * 1.9 + t * .06) * .5 + .5) * H;
        ctx.fillStyle = `rgba(184, 150, 62, ${0.06 + Math.sin(t + i) * .04})`;
        ctx.fillRect(sx, sy, 1, 1);
      }
    }
    
    // draw boxes back to front
    const sorted = boxes.map(b => { 
      const p = proj(b.x, b.y, b.z, W, H); 
      return { ...b, pz: p.z }; 
    }).sort((a, b) => b.pz - a.pz);
    
    sorted.forEach(b => {
      const corners = [
        [-b.w / 2, -b.h / 2, -b.d / 2], [b.w / 2, -b.h / 2, -b.d / 2], [b.w / 2, -b.h / 2, b.d / 2], [-b.w / 2, -b.h / 2, b.d / 2],
        [-b.w / 2, b.h / 2, -b.d / 2], [b.w / 2, b.h / 2, -b.d / 2], [b.w / 2, b.h / 2, b.d / 2], [-b.w / 2, b.h / 2, b.d / 2]
      ];
      const pts = corners.map(([x, y, z]) => proj(b.x + x, b.y + y, b.z + z, W, H));
      const faces = [
        [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7], [0, 1, 2, 3], [4, 5, 6, 7]
      ];
      
      faces.forEach((f, fi) => {
        ctx.beginPath();
        ctx.moveTo(pts[f[0]].x, pts[f[0]].y);
        f.slice(1).forEach(i => ctx.lineTo(pts[i].x, pts[i].y));
        ctx.closePath();
        
        const alphaFill = [0.12, 0.06, 0.12, 0.06, 0.2, 0.08];
        ctx.fillStyle = ga + alphaFill[fi] + ')'; 
        ctx.fill();
        ctx.strokeStyle = ga + '0.55' + ')'; 
        ctx.lineWidth = 0.9; 
        ctx.stroke();
      });
      
      // windows on main tower
      if (b.h > 200) {
        for (let f = 0; f < 14; f++) {
          for (let wi = 0; wi < 5; wi++) {
            const wy = b.y - b.h / 2 + f * 19 + 12;
            const wx = b.x - b.w / 2 + (wi + .5) * b.w / 5;
            const wp = proj(wx, wy, b.z - b.d / 2, W, H);
            const lit = Math.sin(f * 1.6 + wi * 2.1 + t) > .2;
            ctx.fillStyle = lit ? 'rgba(255,208,65,0.45)' : ga + '0.07' + ')';
            const sz = wp.sc * 7;
            ctx.fillRect(wp.x - sz / 2, wp.y - sz / 2, sz, sz * 1.5);
          }
        }
      }
    });
    
    // antenna glow
    const tip = proj(0, -310, 0, W, H);
    const gr = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 26);
    gr.addColorStop(0, `rgba(184,150,62,${0.5 + Math.sin(t * 2) * .2})`);
    gr.addColorStop(1, 'rgba(184,150,62,0)');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 26, 0, Math.PI * 2);
    ctx.fill();
    
    // dimension callout
    const topP = proj(0, -310, 0, W, H);
    const botP = proj(0, 100, 0, W, H);
    ctx.strokeStyle = ga + '0.2' + ')';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(botP.x + 165, botP.y);
    ctx.lineTo(topP.x + 165, topP.y);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = ga + '0.55' + ')';
    ctx.font = '11px Space Mono,monospace';
    ctx.textAlign = 'left';
    ctx.fillText('H: 240m', topP.x + 172, (topP.y + botP.y) / 2 + 4);
    
    animationFrameId = requestAnimationFrame(draw);
  }

  // intersection observer to pause drawing off-screen
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!animationFrameId) draw();
      } else {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      }
    });
  }, { threshold: 0.05 });

  observer.observe(c);
})();
