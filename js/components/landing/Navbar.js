/**
 * Navbar Component
 * Compact, responsive navigation with section-aware highlighting.
 */

export const Navbar = {
  isMobileMenuOpen: false,

  render: () => `
    <nav class="lp-navbar">
      <div class="landing-shell lp-navbar__inner">
        <a href="#home" class="lp-brand" data-nav-link>
          <span class="lp-brand__mark">
            <i class="fas fa-dharmachakra"></i>
          </span>
          <span class="lp-brand__copy">
            <strong>spinX Booster</strong>
            <small>Promo engine untuk kantin sekolah</small>
          </span>
        </a>

        <div class="lp-navbar__links" aria-label="Navigasi utama">
          <a href="#features" class="lp-navbar__link" data-nav-link>Solusi</a>
          <a href="#pricing" class="lp-navbar__link" data-nav-link>Paket</a>
          <a href="#testimonials" class="lp-navbar__link" data-nav-link>Testimoni</a>
          <a href="#cta" class="lp-navbar__link" data-nav-link>Kontak</a>
        </div>

        <div class="lp-navbar__actions">
          <a href="#pricing" class="landing-btn landing-btn--ghost">Lihat Paket</a>
          <button id="login-btn" class="landing-btn landing-btn--primary landing-btn--sm">
            Login
          </button>
        </div>

        <button
          id="mobile-menu-btn"
          class="lp-navbar__toggle"
          aria-label="Buka menu"
          aria-controls="mobile-menu"
          aria-expanded="false"
        >
          <i class="fas fa-bars menu-icon"></i>
          <i class="fas fa-times close-icon hidden"></i>
        </button>
      </div>
    </nav>

    <div id="mobile-menu" class="lp-mobile-menu hidden">
      <button class="lp-mobile-menu__backdrop" id="mobile-overlay" aria-label="Tutup menu"></button>

      <div class="lp-mobile-menu__panel">
        <div class="lp-mobile-menu__header">
          <div class="lp-brand lp-brand--mobile">
            <span class="lp-brand__mark">
              <i class="fas fa-dharmachakra"></i>
            </span>
            <span class="lp-brand__copy">
              <strong>spinX Booster</strong>
              <small>Navigasi cepat</small>
            </span>
          </div>

          <button id="mobile-close-btn" class="lp-mobile-menu__close" aria-label="Tutup menu">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="lp-mobile-menu__links">
          <a href="#home" class="lp-mobile-menu__link" data-nav-link>
            <span>Beranda</span>
            <i class="fas fa-arrow-up-right-from-square"></i>
          </a>
          <a href="#features" class="lp-mobile-menu__link" data-nav-link>
            <span>Solusi</span>
            <i class="fas fa-arrow-up-right-from-square"></i>
          </a>
          <a href="#pricing" class="lp-mobile-menu__link" data-nav-link>
            <span>Paket</span>
            <i class="fas fa-arrow-up-right-from-square"></i>
          </a>
          <a href="#testimonials" class="lp-mobile-menu__link" data-nav-link>
            <span>Testimoni</span>
            <i class="fas fa-arrow-up-right-from-square"></i>
          </a>
          <a href="#cta" class="lp-mobile-menu__link" data-nav-link>
            <span>Kontak</span>
            <i class="fas fa-arrow-up-right-from-square"></i>
          </a>
        </div>

        <div class="lp-mobile-menu__footer">
          <a href="#pricing" class="landing-btn landing-btn--secondary">Bandingkan Paket</a>
          <button id="mobile-login-btn" class="landing-btn landing-btn--primary">
            Login
          </button>
        </div>
      </div>
    </div>
  `,

  initEvents: (callbacks = {}) => {
    const loginBtn = document.getElementById('login-btn');
    const mobileLoginBtn = document.getElementById('mobile-login-btn');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const mobileCloseBtn = document.getElementById('mobile-close-btn');
    const navbar = document.querySelector('.lp-navbar');

    const toggleIcons = (isOpen) => {
      const menuIcon = mobileMenuBtn?.querySelector('.menu-icon');
      const closeIcon = mobileMenuBtn?.querySelector('.close-icon');

      if (menuIcon) menuIcon.classList.toggle('hidden', isOpen);
      if (closeIcon) closeIcon.classList.toggle('hidden', !isOpen);
      if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
    };

    const openMobileMenu = () => {
      if (!mobileMenu) return;
      mobileMenu.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => mobileMenu.classList.add('is-open'));
      Navbar.isMobileMenuOpen = true;
      toggleIcons(true);
    };

    const closeMobileMenu = () => {
      if (!mobileMenu) return;
      mobileMenu.classList.remove('is-open');
      window.setTimeout(() => {
        mobileMenu.classList.add('hidden');
      }, 240);
      document.body.style.overflow = '';
      Navbar.isMobileMenuOpen = false;
      toggleIcons(false);
    };

    const setActiveLink = (hash) => {
      document.querySelectorAll('[data-nav-link]').forEach((link) => {
        const isActive = link.getAttribute('href') === hash;
        link.classList.toggle('is-active', isActive);
      });
    };

    if (loginBtn && callbacks.onLogin) {
      loginBtn.addEventListener('click', callbacks.onLogin);
    }

    if (mobileLoginBtn && callbacks.onLogin) {
      mobileLoginBtn.addEventListener('click', () => {
        closeMobileMenu();
        callbacks.onLogin();
      });
    }

    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        if (Navbar.isMobileMenuOpen) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }
      });
    }

    if (mobileOverlay) {
      mobileOverlay.addEventListener('click', closeMobileMenu);
    }

    if (mobileCloseBtn) {
      mobileCloseBtn.addEventListener('click', closeMobileMenu);
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function handleAnchorClick(event) {
        const hash = this.getAttribute('href');
        if (!hash || hash === '#') return;

        const target = document.querySelector(hash);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveLink(hash);

        if (Navbar.isMobileMenuOpen) {
          closeMobileMenu();
        }
      });
    });

    window.addEventListener('scroll', () => {
      if (!navbar) return;
      navbar.classList.toggle('is-scrolled', window.scrollY > 24);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && Navbar.isMobileMenuOpen) {
        closeMobileMenu();
      }
    });

    const sections = Array.from(document.querySelectorAll('[data-nav-section]'));
    if ('IntersectionObserver' in window && sections.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveLink(`#${entry.target.id}`);
            }
          });
        },
        {
          rootMargin: '-35% 0px -50% 0px',
          threshold: 0.1
        }
      );

      sections.forEach((section) => observer.observe(section));
    } else {
      setActiveLink('#home');
    }
  }
};

export default Navbar;
