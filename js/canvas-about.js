// ── ABOUT CANVAS — 3D spinning building blueprint with High-DPI support
(function() {
  const c = document.getElementById('about-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  
  const dpr = window.devicePixelRatio || 1;
  let logicalWidth = 0;
  let logicalHeight = 0;
  let ang = 0;
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

  function proj(x, y, z, ry, W, H, fov) {
    fov = fov || 360;
    const cy = Math.cos(ry);
    const sy = Math.sin(ry);
    const nx = x * cy - z * sy;
    const nz = x * sy + z * cy;
    const cx2 = Math.cos(0.28);
    const sx2 = Math.sin(0.28);
    const ny = y * cx2 - nz * sx2;
    const nz2 = y * sx2 + nz * cx2;
    const sc = fov / (fov + nz2 + 200);
    return { x: W / 2 + nx * sc, y: H / 2 + ny * sc, sc };
  }

  function box(ctx, ox, oy, oz, w, h, d, ry, W, H, al) {
    const corners = [
      [-w / 2, -h / 2, -d / 2], [w / 2, -h / 2, -d / 2], [w / 2, -h / 2, d / 2], [-w / 2, -h / 2, d / 2],
      [-w / 2, h / 2, -d / 2], [w / 2, h / 2, -d / 2], [w / 2, h / 2, d / 2], [-w / 2, h / 2, d / 2]
    ];
    const pts = corners.map(([x, y, z]) => proj(ox + x, oy + y, oz + z, ry, W, H));
    const faces = [
      [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7], [0, 1, 2, 3], [4, 5, 6, 7]
    ];
    
    faces.forEach((f, fi) => {
      ctx.beginPath();
      ctx.moveTo(pts[f[0]].x, pts[f[0]].y);
      f.slice(1).forEach(i => ctx.lineTo(pts[i].x, pts[i].y));
      ctx.closePath();
      
      const alphaFill = [0.1, 0.05, 0.1, 0.05, 0.18, 0.07][fi];
      ctx.fillStyle = `rgba(184, 150, 62, ${al * alphaFill})`;
      ctx.fill();
      
      ctx.strokeStyle = `rgba(184, 150, 62, ${al * 0.7})`;
      ctx.lineWidth = 0.8; 
      ctx.stroke();
    });
  }

  function draw() {
    const W = logicalWidth;
    const H = logicalHeight;
    ctx.clearRect(0, 0, W, H);
    ang += 0.007;

    // Blueprint grid
    ctx.strokeStyle = 'rgba(184, 150, 62, 0.04)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < W; i += 30) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, H);
      ctx.stroke();
    }
    for (let j = 0; j < H; j += 30) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(W, j);
      ctx.stroke();
    }

    // Building parts
    box(ctx, 0, -22, 0, 68, 128, 52, ang, W, H, 4);
    box(ctx, -50, 23, 0, 28, 82, 46, ang, W, H, 4);
    box(ctx, 50, 23, 0, 28, 82, 46, ang, W, H, 4);
    box(ctx, 0, -100, 0, 42, 40, 36, ang, W, H, 4);
    box(ctx, 0, -130, 0, 22, 20, 22, ang, W, H, 4);
    box(ctx, 0, 50, 0, 88, 14, 68, ang, W, H, 4);

    // Orbit ring
    ctx.strokeStyle = 'rgba(184, 150, 62, 0.12)';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); 
    ctx.ellipse(W / 2, H / 2, 150, 72, 0, 0, Math.PI * 2); 
    ctx.stroke();

    const dx = W / 2 + Math.cos(ang * 1.3) * 150;
    const dy = H / 2 + Math.sin(ang * 1.3) * 72;
    ctx.beginPath(); 
    ctx.arc(dx, dy, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#B8963E'; 
    ctx.fill();

    animationFrameId = requestAnimationFrame(draw);
  }

  // Use Intersection Observer to pause animation loop when not visible to save resource consumption
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
