// ── SERVICE ORB ICONS WITH HIGH-DPI & PERFORMANCE OPTIMIZATION
(function() {
  const orbs = document.querySelectorAll('.sorb');
  if (orbs.length === 0) return;

  const dpr = window.devicePixelRatio || 1;
  const animationFrames = {};

  orbs.forEach((c, index) => {
    const ctx = c.getContext('2d');
    if (!ctx) return;
    
    const shape = c.dataset.s;
    
    // Scale backing store for High-DPI / Retina Screens
    c.width = 48 * dpr;
    c.height = 48 * dpr;
    c.style.width = '48px';
    c.style.height = '48px';
    
    let t = Math.random() * 100;

    function draw() {
      t += 0.025;
      
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, 48, 48);
      
      ctx.strokeStyle = '#B8963E'; 
      ctx.lineWidth = 1.5;
      
      ctx.save(); 
      ctx.translate(24, 24); 
      ctx.rotate(t * 0.4);
      
      if (shape === 'diamond') {
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(13, 0);
        ctx.lineTo(0, 18);
        ctx.lineTo(-13, 0);
        ctx.closePath();
        ctx.stroke();
      } else if (shape === 'hex') {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          ctx.lineTo(Math.cos(a) * 17, Math.sin(a) * 17);
        }
        ctx.closePath();
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(0, -17);
        ctx.lineTo(15, 13);
        ctx.lineTo(-15, 13);
        ctx.closePath();
        ctx.stroke();
      }
      ctx.restore();
      
      ctx.fillStyle = '#B8963E';
      ctx.beginPath();
      ctx.arc(24, 24, 2, 0, Math.PI * 2);
      ctx.fill();
      
      animationFrames[index] = requestAnimationFrame(draw);
    }

    // intersection observer to cease rendering off-screen
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!animationFrames[index]) {
            draw();
          }
        } else {
          if (animationFrames[index]) {
            cancelAnimationFrame(animationFrames[index]);
            animationFrames[index] = null;
          }
        }
      });
    }, { threshold: 0.05 });

    observer.observe(c);
  });
})();
