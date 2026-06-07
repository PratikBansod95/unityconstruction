document.addEventListener('DOMContentLoaded', () => {
  // ── 1. NAV STUCK STATE (scroll progress handled by scroll-engine.js)
  const nav = document.getElementById('nav');

  window.addEventListener('scroll', () => {
    if (nav) {
      nav.classList.toggle('stuck', window.scrollY > 40);
    }
  }, { passive: true });

  // ── 2. PERSISTENT THEME SELECTION
  const themeToggleBtn = document.getElementById('tt');
  
  // Set initial theme: check localStorage first, fallback to system settings
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  };

  const currentTheme = getInitialTheme();
  document.body.setAttribute('data-theme', currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const activeTheme = document.body.getAttribute('data-theme');
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }

  // ── 3. OPTIMIZED SCROLL REVEAL (SINGLE SHARED OBSERVER)
  const rvEls = document.querySelectorAll('.rv');
  if (rvEls.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          // Once revealed, unobserve to free up GPU/thread performance
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    rvEls.forEach(el => revealObserver.observe(el));
  }

  // ── 4. EVENT LISTENERS FOR DELEGATED NAVIGATION SCROLLING
  const enquireNowBtn = document.getElementById('enquire-now-btn');
  const heroServicesBtn = document.getElementById('hero-services-btn');
  const heroContactBtn = document.getElementById('hero-contact-btn');
  const contactSection = document.getElementById('contact');
  const servicesSection = document.getElementById('services');

  const scrollToSection = (element) => {
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (enquireNowBtn) {
    enquireNowBtn.addEventListener('click', () => scrollToSection(contactSection));
  }
  if (heroServicesBtn) {
    heroServicesBtn.addEventListener('click', () => scrollToSection(servicesSection));
  }
  if (heroContactBtn) {
    heroContactBtn.addEventListener('click', () => scrollToSection(contactSection));
  }

  // ── 5. CONTACT FORM VALIDATION & SECURE CALLBACKS
  const cform = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');

  if (cform && submitBtn) {
    const validateField = (field, validationFn, errorMsg) => {
      const cfgGroup = field.closest('.cfg');
      if (!cfgGroup) return true;

      // Remove pre-existing errors
      const existingError = cfgGroup.querySelector('.cfg-err-msg');
      if (existingError) {
        existingError.remove();
      }
      cfgGroup.classList.remove('error');

      const isValid = validationFn(field.value.trim());
      if (!isValid) {
        cfgGroup.classList.add('error');
        const errMsgEl = document.createElement('span');
        errMsgEl.className = 'cfg-err-msg';
        errMsgEl.textContent = errorMsg;
        cfgGroup.appendChild(errMsgEl);
        return false;
      }
      return true;
    };

    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();

      const nameField = document.getElementById('form-name');
      const phoneField = document.getElementById('form-phone');
      const emailField = document.getElementById('form-email');
      const serviceField = document.getElementById('form-service');
      const messageField = document.getElementById('form-message');

      const isNameValid = validateField(
        nameField, 
        val => val.length >= 2, 
        'Name must be at least 2 characters'
      );
      
      const isPhoneValid = validateField(
        phoneField, 
        val => {
          const digits = val.replace(/\D/g, '');
          return digits.length >= 10 && digits.length <= 13;
        }, 
        'Enter a valid 10 to 12 digit phone number'
      );

      const isEmailValid = validateField(
        emailField, 
        val => {
          if (val === '') return true; // Email is optional, validate if filled
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(val);
        }, 
        'Enter a valid email address'
      );

      const isServiceValid = validateField(
        serviceField, 
        val => val !== '', 
        'Please select a service'
      );
      
      const isMessageValid = validateField(
        messageField, 
        val => val.length >= 5, 
        'Message must be at least 5 characters'
      );

      if (isNameValid && isPhoneValid && isEmailValid && isServiceValid && isMessageValid) {
        submitBtn.textContent = 'Sending...';
        submitBtn.style.opacity = '0.7';
        submitBtn.disabled = true;

        // Simulate secure async dispatch
        setTimeout(() => {
          submitBtn.textContent = '✓  Message Sent!';
          submitBtn.style.opacity = '1';
          submitBtn.style.backgroundColor = '#2a7a3c';

          cform.reset();

          setTimeout(() => {
            submitBtn.textContent = 'Send Enquiry →';
            submitBtn.style.backgroundColor = '';
            submitBtn.disabled = false;
          }, 3500);
        }, 1100);
      }
    });
  }

  // ── 6. MAGNETIC BUTTONS (Dribbble/Apple aesthetic)
  const magneticEls = document.querySelectorAll('.ncta, .bpri, .bsec');
  magneticEls.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const h = rect.width / 2;
      const v = rect.height / 2;
      const x = e.clientX - rect.left - h;
      const y = e.clientY - rect.top - v;
      // Gentle pull towards cursor
      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1.05)`;
    });
    btn.addEventListener('mouseleave', () => {
      // Snap back
      btn.style.transform = `translate(0px, 0px) scale(1)`;
    });
  });

  // ── 7. HERO PARALLAX (Dora AI style)
  const heroText = document.getElementById('hero-text');
  const hbadge = document.querySelector('.hbadge');
  
  if (heroText) {
    let targetScrollY = window.scrollY;
    let currentScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
      targetScrollY = window.scrollY;
    }, { passive: true });
    
    function renderParallax() {
      // Smoothly interpolate towards the target scroll position
      currentScrollY += (targetScrollY - currentScrollY) * 0.08;
      
      if (currentScrollY < window.innerHeight * 1.5) {
        // Parallax shift up and scale up slightly as you scroll down
        const scale = 1 + (currentScrollY * 0.0005);
        const yOffset = -(currentScrollY * 0.15);
        
        // Only update if difference is meaningful
        if (Math.abs(targetScrollY - currentScrollY) > 0.01) {
          heroText.style.transform = `translateY(${yOffset}px) scale(${scale})`;
          
          if (hbadge) {
             hbadge.style.transform = `translateY(${-(currentScrollY * 0.3)}px)`;
          }
        }
      }
      requestAnimationFrame(renderParallax);
    }
    
    requestAnimationFrame(renderParallax);
  }
});
