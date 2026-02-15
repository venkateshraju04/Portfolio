/* ============================================
   ACTIVE THEORY CLONE — JavaScript
   ============================================ */

(() => {
  'use strict';

  // ========== Preloader ==========
  const Preloader = {
    el: document.getElementById('preloader'),
    progress: document.getElementById('preloaderProgress'),
    count: document.getElementById('preloaderCount'),
    current: 0,

    init() {
      this.animate();
    },

    animate() {
      const interval = setInterval(() => {
        this.current += Math.random() * 8 + 2;
        if (this.current >= 100) {
          this.current = 100;
          clearInterval(interval);
          setTimeout(() => this.hide(), 400);
        }
        this.progress.style.width = this.current + '%';
        this.count.textContent = Math.round(this.current) + '%';
      }, 50);
    },

    hide() {
      this.el.classList.add('hidden');
      document.body.style.overflow = '';
      setTimeout(() => {
        this.el.style.display = 'none';
        Animations.triggerHero();
      }, 600);
    }
  };

  // ========== Custom Cursor ==========
  const Cursor = {
    el: document.getElementById('cursor'),
    dot: null,
    ring: null,
    pos: { x: 0, y: 0 },
    mouse: { x: 0, y: 0 },
    speed: 0.15,

    init() {
      if (!this.el || window.innerWidth < 768) return;
      this.dot = this.el.querySelector('.cursor-dot');
      this.ring = this.el.querySelector('.cursor-ring');

      document.addEventListener('mousemove', e => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
      });

      // Hover states
      document.querySelectorAll('[data-cursor]').forEach(el => {
        const type = el.getAttribute('data-cursor');
        el.addEventListener('mouseenter', () => this.el.classList.add(type));
        el.addEventListener('mouseleave', () => this.el.classList.remove(type));
      });

      this.render();
    },

    render() {
      this.pos.x += (this.mouse.x - this.pos.x) * this.speed;
      this.pos.y += (this.mouse.y - this.pos.y) * this.speed;

      this.dot.style.transform = `translate(${this.mouse.x}px, ${this.mouse.y}px) translate(-50%, -50%)`;
      this.ring.style.transform = `translate(${this.pos.x}px, ${this.pos.y}px) translate(-50%, -50%)`;

      requestAnimationFrame(() => this.render());
    }
  };

  // ========== Interactive Starfield Background ==========
  const Background = {
    canvas: document.getElementById('bgCanvas'),
    ctx: null,
    width: 0,
    height: 0,
    mouse: { x: -9999, y: -9999 },
    stars: [],
    shootingStars: [],
    nebulaPoints: [],

    LAYERS: [
      { count: 120, speed: 0.08, size: [0.4, 1.2], opacity: [0.15, 0.35] },
      { count: 100, speed: 0.18, size: [0.8, 1.8], opacity: [0.25, 0.5] },
      { count: 80,  speed: 0.35, size: [1.0, 2.4], opacity: [0.35, 0.65] },
      { count: 40,  speed: 0.55, size: [1.5, 3.2], opacity: [0.5, 0.85] }
    ],

    init() {
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      this.createStars();
      this.createNebula();

      window.addEventListener('resize', () => {
        this.resize();
        this.createStars();
        this.createNebula();
      });

      document.addEventListener('mousemove', e => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
      });

      this.render();
    },

    resize() {
      this.width = this.canvas.width = window.innerWidth;
      this.height = this.canvas.height = window.innerHeight;
    },

    rand(min, max) {
      return Math.random() * (max - min) + min;
    },

    createStars() {
      this.stars = [];
      this.LAYERS.forEach((layer, li) => {
        for (let i = 0; i < layer.count; i++) {
          this.stars.push({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            baseSize: this.rand(layer.size[0], layer.size[1]),
            baseOpacity: this.rand(layer.opacity[0], layer.opacity[1]),
            speed: layer.speed,
            layer: li,
            twinklePhase: Math.random() * Math.PI * 2,
            twinkleSpeed: this.rand(0.005, 0.025),
            hue: this.rand(200, 280)
          });
        }
      });
    },

    createNebula() {
      this.nebulaPoints = [];
      for (let i = 0; i < 5; i++) {
        this.nebulaPoints.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: this.rand(200, 500),
          hue: this.rand(220, 300),
          drift: this.rand(0.0005, 0.002),
          phase: Math.random() * Math.PI * 2
        });
      }
    },

    spawnShootingStar() {
      if (this.shootingStars.length >= 2) return;
      this.shootingStars.push({
        x: this.rand(-100, this.width),
        y: this.rand(-100, this.height * 0.4),
        len: this.rand(80, 200),
        speed: this.rand(12, 22),
        angle: this.rand(0.3, 0.8),
        opacity: 1,
        life: 1
      });
    },

    drawNebula(time) {
      this.nebulaPoints.forEach(n => {
        n.phase += n.drift;
        const x = n.x + Math.sin(n.phase) * 60;
        const y = n.y + Math.cos(n.phase * 0.7) * 40;
        const grad = this.ctx.createRadialGradient(x, y, 0, x, y, n.radius);
        grad.addColorStop(0, `hsla(${n.hue}, 70%, 30%, 0.025)`);
        grad.addColorStop(0.5, `hsla(${n.hue}, 60%, 20%, 0.012)`);
        grad.addColorStop(1, 'transparent');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(x - n.radius, y - n.radius, n.radius * 2, n.radius * 2);
      });
    },

    drawStars(time) {
      const parallaxScale = [0.005, 0.012, 0.025, 0.04];
      const cx = this.width / 2;
      const cy = this.height / 2;
      const mx = this.mouse.x === -9999 ? cx : this.mouse.x;
      const my = this.mouse.y === -9999 ? cy : this.mouse.y;

      this.stars.forEach(star => {
        // Slow drift downward
        star.y += star.speed;
        if (star.y > this.height + 10) {
          star.y = -10;
          star.x = Math.random() * this.width;
        }

        // Twinkle
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = 0.5 + 0.5 * Math.sin(star.twinklePhase);
        const opacity = star.baseOpacity * (0.6 + twinkle * 0.4);

        // Mouse parallax
        const px = (mx - cx) * parallaxScale[star.layer];
        const py = (my - cy) * parallaxScale[star.layer];
        const sx = star.x + px;
        const sy = star.y + py;

        // Mouse repulsion
        const dx = sx - mx;
        const dy = sy - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repulseRadius = star.layer >= 2 ? 80 : 40;
        let rx = 0, ry = 0;
        if (dist < repulseRadius && dist > 0) {
          const force = (1 - dist / repulseRadius) * 15;
          rx = (dx / dist) * force;
          ry = (dy / dist) * force;
        }

        const drawX = sx + rx;
        const drawY = sy + ry;
        const size = star.baseSize * (0.8 + twinkle * 0.2);

        // Glow
        this.ctx.beginPath();
        this.ctx.arc(drawX, drawY, size + 2, 0, Math.PI * 2);
        this.ctx.fillStyle = `hsla(${star.hue}, 60%, 70%, ${opacity * 0.15})`;
        this.ctx.fill();

        // Core
        this.ctx.beginPath();
        this.ctx.arc(drawX, drawY, size, 0, Math.PI * 2);
        this.ctx.fillStyle = `hsla(${star.hue}, 40%, 90%, ${opacity})`;
        this.ctx.fill();

        // Cross sparkle for brightest stars
        if (star.layer === 3 && twinkle > 0.8) {
          const sparkleLen = size * 4 * twinkle;
          this.ctx.save();
          this.ctx.globalAlpha = opacity * 0.3;
          this.ctx.strokeStyle = `hsla(${star.hue}, 60%, 80%, 1)`;
          this.ctx.lineWidth = 0.5;
          this.ctx.beginPath();
          this.ctx.moveTo(drawX - sparkleLen, drawY);
          this.ctx.lineTo(drawX + sparkleLen, drawY);
          this.ctx.moveTo(drawX, drawY - sparkleLen);
          this.ctx.lineTo(drawX, drawY + sparkleLen);
          this.ctx.stroke();
          this.ctx.restore();
        }
      });
    },

    drawConstellations() {
      if (this.mouse.x === -9999) return;
      const nearby = this.stars.filter(s => {
        if (s.layer < 2) return false;
        const dx = s.x - this.mouse.x;
        const dy = s.y - this.mouse.y;
        return Math.sqrt(dx * dx + dy * dy) < 180;
      });

      for (let i = 0; i < nearby.length; i++) {
        for (let j = i + 1; j < nearby.length; j++) {
          const dx = nearby[i].x - nearby[j].x;
          const dy = nearby[i].y - nearby[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const opacity = (1 - dist / 120) * 0.15;
            this.ctx.beginPath();
            this.ctx.moveTo(nearby[i].x, nearby[i].y);
            this.ctx.lineTo(nearby[j].x, nearby[j].y);
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            this.ctx.lineWidth = 0.5;
            this.ctx.stroke();
          }
        }
      }
    },

    drawShootingStars() {
      this.shootingStars = this.shootingStars.filter(s => {
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.life -= 0.015;

        if (s.life <= 0) return false;

        const tailX = s.x - Math.cos(s.angle) * s.len;
        const tailY = s.y - Math.sin(s.angle) * s.len;
        const grad = this.ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${s.life * 0.9})`);
        grad.addColorStop(1, 'transparent');

        this.ctx.beginPath();
        this.ctx.moveTo(s.x, s.y);
        this.ctx.lineTo(tailX, tailY);
        this.ctx.strokeStyle = grad;
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();

        // Head glow
        this.ctx.beginPath();
        this.ctx.arc(s.x, s.y, 3, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(200, 200, 255, ${s.life * 0.6})`;
        this.ctx.fill();

        return true;
      });
    },

    render(time = 0) {
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Random shooting star spawn
      if (Math.random() < 0.005) this.spawnShootingStar();

      this.drawNebula(time);
      this.drawStars(time);
      this.drawConstellations();
      this.drawShootingStars();

      requestAnimationFrame(t => this.render(t));
    }
  };

  // ========== Header ==========
  const Header = {
    el: document.getElementById('header'),
    lastScroll: 0,

    init() {
      if (!this.el) return;
      window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    },

    onScroll() {
      const scroll = window.scrollY;

      this.el.classList.toggle('scrolled', scroll > 50);

      if (scroll > 300) {
        this.el.classList.toggle('hidden-nav', scroll > this.lastScroll);
      } else {
        this.el.classList.remove('hidden-nav');
      }

      this.lastScroll = scroll;
    }
  };

  // ========== Mobile Menu ==========
  const MobileMenu = {
    toggle: document.getElementById('menuToggle'),
    menu: document.getElementById('mobileMenu'),

    init() {
      if (!this.toggle) return;
      this.toggle.addEventListener('click', () => this.toggleMenu());
      this.menu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => this.closeMenu());
      });
    },

    toggleMenu() {
      this.toggle.classList.toggle('active');
      this.menu.classList.toggle('active');
      document.body.style.overflow = this.menu.classList.contains('active') ? 'hidden' : '';
    },

    closeMenu() {
      this.toggle.classList.remove('active');
      this.menu.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // ========== Scroll Animations ==========
  const Animations = {
    init() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const delay = parseInt(entry.target.dataset.delay || 0) * 150;
            setTimeout(() => {
              entry.target.classList.add('visible');
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

      document.querySelectorAll('[data-animate]').forEach(el => {
        observer.observe(el);
      });

      // Counter animation
      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateCounters(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      document.querySelectorAll('[data-count]').forEach(el => {
        counterObserver.observe(el);
      });

      // Project video hover
      document.querySelectorAll('.project-link').forEach(link => {
        const video = link.querySelector('.project-video-overlay video');
        if (!video) return;
        link.addEventListener('mouseenter', () => {
          video.currentTime = 0;
          video.play().catch(() => {});
        });
        link.addEventListener('mouseleave', () => {
          video.pause();
        });
      });
    },

    triggerHero() {
      const heroElements = document.querySelectorAll('#hero [data-animate]');
      heroElements.forEach(el => {
        const delay = parseInt(el.dataset.delay || 0) * 200 + 100;
        setTimeout(() => el.classList.add('visible'), delay);
      });

      // Hero title lines
      const lines = document.querySelectorAll('.hero-line-inner');
      lines.forEach((line, i) => {
        setTimeout(() => line.classList.add('visible'), 200 + i * 200);
      });
    },

    animateCounters(el) {
      const target = parseInt(el.dataset.count);
      const duration = 2000;
      const start = performance.now();

      const update = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out quart
        const eased = 1 - Math.pow(1 - progress, 4);
        el.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(update);
      };

      requestAnimationFrame(update);
    }
  };

  // ========== Smooth Scroll ==========
  const SmoothScroll = {
    init() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
          const href = anchor.getAttribute('href');
          const target = document.querySelector(href);
          if (!target) return;
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    }
  };

  // ========== Parallax ==========
  const Parallax = {
    hero: document.querySelector('.hero-content'),

    init() {
      if (!this.hero) return;
      window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    },

    onScroll() {
      const scroll = window.scrollY;
      const vh = window.innerHeight;
      if (scroll > vh) return;

      const progress = scroll / vh;
      this.hero.style.opacity = 1 - progress * 1.2;
      this.hero.style.transform = `translateY(${scroll * 0.3}px)`;
    }
  };

  // ========== Magnetic Elements ==========
  const MagneticElements = {
    init() {
      if (window.innerWidth < 768) return;

      document.querySelectorAll('.btn-outline, .play-btn').forEach(el => {
        el.addEventListener('mousemove', e => {
          const rect = el.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });

        el.addEventListener('mouseleave', () => {
          el.style.transform = '';
        });
      });
    }
  };

  // ========== Initialize ==========
  document.body.style.overflow = 'hidden';
  Preloader.init();
  Cursor.init();
  Background.init();
  Header.init();
  MobileMenu.init();
  Animations.init();
  SmoothScroll.init();
  Parallax.init();
  MagneticElements.init();

})();
