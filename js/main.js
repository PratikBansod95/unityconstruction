document.addEventListener('DOMContentLoaded', () => {
  // ── 1. SCROLL PROGRESS + NAV STUCK + VIDEO PARALLAX
  const nav = document.getElementById('nav');
  const sp = document.getElementById('sp');
  const hv = document.getElementById('hv');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollHeight > 0 ? (scrollY / scrollHeight) * 100 : 0;
    
    if (sp) {
      sp.style.width = `${pct}%`;
    }
    
    if (nav) {
      nav.classList.toggle('stuck', scrollY > 40);
    }

    // Video parallax translation
    if (hv && scrollY < window.innerHeight) {
      hv.style.transform = `scale(1.05) translateY(${scrollY * 0.18}px)`;
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
});
