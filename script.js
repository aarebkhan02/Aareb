/**
 * AAREB KHAN — FUTURISTIC MONOCHROME JAVASCRIPT ENGINE
 * Features:
 * - 3D Floating Geometric Square Particle Universe (HTML Canvas)
 * - Mouse Parallax & Dynamic Square Clusters
 * - Scroll Progress Indicator & Navbar Blur Toggle
 * - Mobile Navigation Drawer
 * - IntersectionObserver Scroll Reveal
 * - Back to Top Action
 */

document.addEventListener('DOMContentLoaded', () => {
  initParticleUniverse();
  initNavigation();
  initScrollAnimations();
  initScrollProgress();
  initContactForm();
});

/* ==========================================================================
   FLOATING SQUARE PARTICLE UNIVERSE (CANVAS)
   ========================================================================== */
function initParticleUniverse() {
  const canvas = document.getElementById('universe-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  // Parallax mouse position
  let mouse = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0
  };

  // High-DPI screen calibration
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.scale(dpr, dpr);
    createParticles();
  }

  // Particle Class: Geometric Floating Squares
  class SquareParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      // 3D Depth coordinates (z controls scale, alpha, and speed)
      this.z = Math.random() * 0.85 + 0.15; // 0.15 (far) to 1.0 (near)

      // Square sizing: significantly increased sizes for high visual impact
      const sizeVariant = Math.random();
      let baseSize;
      if (sizeVariant > 0.85) {
        baseSize = 48 + Math.random() * 32; // Prominent large squares (48px - 80px)
      } else if (sizeVariant > 0.42) {
        baseSize = 28 + Math.random() * 20; // Medium floating squares (28px - 48px)
      } else {
        baseSize = 16 + Math.random() * 12; // Small accent squares (16px - 28px)
      }
      this.size = baseSize * (0.65 + 0.45 * this.z);

      const margin = this.size + 60;

      // Spatial distribution with clustered bias
      const clusterBias = Math.random();
      if (clusterBias > 0.6) {
        // Clustered in random localized focal areas
        const focalX = width * (0.15 + 0.7 * Math.random());
        const focalY = height * (0.15 + 0.7 * Math.random());
        this.x = focalX + (Math.random() - 0.5) * (width * 0.35);
        this.y = initial ? focalY + (Math.random() - 0.5) * (height * 0.35) : height + margin + Math.random() * 40;
      } else {
        // Dispersed evenly throughout space
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : height + margin + Math.random() * 40;
      }

      // Velocities: slow drifting upwards with gentle lateral sway
      this.vx = (Math.random() - 0.5) * 0.28 * this.z;
      this.vy = -(0.18 + Math.random() * 0.42) * this.z;

      // Rotation
      this.angle = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.012;

      // Visual aesthetics: White Glow Filled vs Hollow Border vs Subtle Translucent
      const styleRoll = Math.random();
      if (styleRoll < 0.32) {
        // White Glowy Filled Square: radiant solid white core with intense halo
        this.type = 'glow-filled';
        this.isHollow = false;
        this.hasGlow = true;
        this.baseAlpha = 0.88 + Math.random() * 0.12; // Rich luminous white
        this.glowRadius = 18 + this.size * 0.6; // Expansive glowing aura
        this.pulseSpeed = 0.014 + Math.random() * 0.018;
        this.pulsePhase = Math.random() * Math.PI * 2;
      } else if (styleRoll < 0.68) {
        // Outlined Hollow Square
        this.type = 'hollow';
        this.isHollow = true;
        this.hasGlow = Math.random() > 0.45;
        this.baseAlpha = (0.28 + Math.random() * 0.45) * this.z;
        this.glowRadius = 10 * this.z;
        this.pulseSpeed = 0.01;
        this.pulsePhase = Math.random() * Math.PI * 2;
      } else {
        // Soft Semi-Transparent Monochrome Square
        this.type = 'translucent';
        this.isHollow = false;
        this.hasGlow = Math.random() > 0.65;
        this.baseAlpha = (0.12 + Math.random() * 0.24) * this.z;
        this.glowRadius = 8 * this.z;
        this.pulseSpeed = 0.01;
        this.pulsePhase = Math.random() * Math.PI * 2;
      }

      // Floating sine modulation
      this.sineSeed = Math.random() * 100;
    }

    update() {
      this.sineSeed += 0.018;
      this.pulsePhase += this.pulseSpeed;
      this.x += this.vx + Math.sin(this.sineSeed) * 0.2;
      this.y += this.vy;
      this.angle += this.rotationSpeed;

      // Parallax displacement based on mouse position
      const parallaxFactor = (1 - this.z) * 0.035;
      const displayX = this.x - mouse.x * parallaxFactor;
      const displayY = this.y - mouse.y * parallaxFactor;

      // Screen edge recycling with dynamic boundary margins
      const margin = this.size + 60;
      if (this.y < -margin || this.x < -margin || this.x > width + margin) {
        this.reset(false);
      }

      return { displayX, displayY };
    }

    draw(coords) {
      const { displayX, displayY } = coords;

      ctx.save();
      ctx.translate(displayX, displayY);
      ctx.rotate(this.angle);

      const halfSize = this.size / 2;

      if (this.type === 'glow-filled') {
        // Luminous breathing white glow
        const pulse = 0.88 + Math.sin(this.pulsePhase) * 0.12;

        ctx.shadowColor = `rgba(255, 255, 255, ${0.95 * pulse})`;
        ctx.shadowBlur = this.glowRadius * pulse;

        // Solid white glowing fill
        ctx.fillStyle = `rgba(255, 255, 255, ${this.baseAlpha * pulse})`;
        ctx.fillRect(-halfSize, -halfSize, this.size, this.size);

        // Crisp illuminated white stroke border
        ctx.strokeStyle = `rgba(255, 255, 255, ${1 * pulse})`;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-halfSize, -halfSize, this.size, this.size);
      } else if (this.isHollow) {
        // Outlined square
        if (this.hasGlow) {
          ctx.shadowBlur = this.glowRadius;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.65)';
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.strokeStyle = `rgba(255, 255, 255, ${this.baseAlpha * 1.3})`;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-halfSize, -halfSize, this.size, this.size);
      } else {
        // Solid semi-transparent square
        if (this.hasGlow) {
          ctx.shadowBlur = this.glowRadius;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = `rgba(235, 235, 235, ${this.baseAlpha})`;
        ctx.fillRect(-halfSize, -halfSize, this.size, this.size);
      }

      ctx.restore();
    }
  }

  function createParticles() {
    particles = [];
    // Balanced density calibrated for larger geometric squares
    const count = Math.floor((width * height) / 16000);
    const particleCount = Math.min(Math.max(count, 55), 110);

    for (let i = 0; i < particleCount; i++) {
      particles.push(new SquareParticle());
    }
  }

  // Smooth mouse interpolation
  window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX - width / 2;
    mouse.targetY = e.clientY - height / 2;
  });

  window.addEventListener('resize', resize);
  resize();

  // Animation Loop
  let isRunning = true;
  function animate() {
    if (!isRunning) return;

    // Smoothly ease mouse toward target
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const coords = particles[i].update();
      particles[i].draw(coords);
    }

    requestAnimationFrame(animate);
  }

  // Pause canvas animation if tab is hidden to conserve GPU/battery
  document.addEventListener('visibilitychange', () => {
    isRunning = !document.hidden;
    if (isRunning) requestAnimationFrame(animate);
  });

  animate();
}

/* ==========================================================================
   NAVIGATION BAR & MOBILE MENU
   ========================================================================== */
function initNavigation() {
  const navbar = document.querySelector('.nav-wrapper');
  const toggleBtn = document.getElementById('menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

  // Toggle navbar backdrop on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    highlightCurrentSection();
  });

  // Mobile Menu Drawer
  if (toggleBtn && mobileDrawer) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      toggleBtn.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
      mobileDrawer.setAttribute('aria-hidden', !isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close mobile drawer upon click on any link
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        toggleBtn.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
        mobileDrawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }

  // Active section indicator
  function highlightCurrentSection() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      const sectionId = section.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        document.querySelectorAll('.nav-links a').forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }
}

/* ==========================================================================
   SCROLL REVEAL INTERSECTION OBSERVER
   ========================================================================== */
function initScrollAnimations() {
  const elementsToReveal = document.querySelectorAll('.reveal-on-scroll');

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.12
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        obs.unobserve(entry.target); // Reveal only once for performance
      }
    });
  }, observerOptions);

  elementsToReveal.forEach((el) => observer.observe(el));
}

/* ==========================================================================
   SCROLL PROGRESS & BACK TO TOP
   ========================================================================== */
function initScrollProgress() {
  const progressBar = document.getElementById('scroll-progress');
  const backToTopBtn = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

    if (scrollHeight > 0 && progressBar) {
      const scrollPercent = (scrollTop / scrollHeight) * 100;
      progressBar.style.width = `${scrollPercent}%`;
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

/* ==========================================================================
   INTERACTIVE CONTACT FORM HANDLER
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusMsg = document.getElementById('contact-status-msg');
  if (!form || !statusMsg) return;

  form.addEventListener('submit', (e) => {
    // Show polite interactive feedback
    statusMsg.className = 'contact-status-msg success';
    statusMsg.textContent = 'Thank you! Your message is being sent...';
    setTimeout(() => {
      statusMsg.textContent = 'Message sent! I will respond to your email as soon as possible.';
      form.reset();
    }, 1200);
  });
}
