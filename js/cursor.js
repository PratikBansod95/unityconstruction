// ── CUSTOM INTERACTIVE CURSOR WITH TOUCH PREVENTION
(function() {
  const cur = document.getElementById('cur');
  const curR = document.getElementById('cur-r');
  if (!cur || !curR) return;

  // Proactive check for touch-screen devices
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
  
  if (isTouchDevice) {
    cur.style.display = 'none';
    curR.style.display = 'none';
    document.body.style.cursor = 'auto';
    return; // Terminate execution on mobile/tablets to preserve system performance
  }

  let mx = 0;
  let my = 0;
  let rx = 0;
  let ry = 0;
  let isMoving = false;

  // Make cursor elements visible only after the mouse moves to avoid upper-left corner rendering on startup
  cur.style.opacity = '0';
  curR.style.opacity = '0';
  cur.style.transition = 'opacity 0.3s ease, width 0.3s, height 0.3s, background 0.3s';
  curR.style.transition = 'opacity 0.3s ease, width 0.4s var(--ease), height 0.4s var(--ease)';

  document.addEventListener('mousemove', e => {
    mx = e.clientX; 
    my = e.clientY;
    
    cur.style.left = `${mx}px`; 
    cur.style.top = `${my}px`;

    if (!isMoving) {
      cur.style.opacity = '1';
      curR.style.opacity = '1';
      isMoving = true;
    }
  }, { passive: true });

  function animR() {
    if (isMoving) {
      rx += (mx - rx) * 0.1; 
      ry += (my - ry) * 0.1;
      curR.style.left = `${rx}px`; 
      curR.style.top = `${ry}px`;
    }
    requestAnimationFrame(animR);
  }
  
  requestAnimationFrame(animR);

  // Optimized event delegation for hover animations
  document.addEventListener('mouseover', e => {
    const target = e.target.closest('a, button, .svc, .office, .ci, select, input, textarea');
    if (target) {
      document.body.classList.add('hov');
    }
  }, { passive: true });

  document.addEventListener('mouseout', e => {
    const target = e.target.closest('a, button, .svc, .office, .ci, select, input, textarea');
    if (target) {
      document.body.classList.remove('hov');
    }
  }, { passive: true });
})();
