/**
 * Navbar Component
 * Navigation bar for landing page - Enhanced glassmorphism design with mobile responsive
 */

export const Navbar = {
  isMobileMenuOpen: false,
  
  render: () => `
    <nav class="fixed top-0 left-0 right-0 z-50 navbar-enhanced">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-18">
          <!-- Logo Section -->
          <div class="flex items-center gap-3 group cursor-pointer" onclick="window.scrollTo({top: 0, behavior: 'smooth'})">
            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/40 group-hover:shadow-indigo-500/60 transition-all duration-300 group-hover:scale-110">
              <i class="fas fa-dharmachakra text-white text-lg sm:text-xl animate-spin-slow"></i>
            </div>
            <span class="font-bold text-xl sm:text-2xl text-white tracking-tight">spin<span class="gradient-text">X</span></span>
          </div>
          
          <!-- Desktop Navigation Links - Show on lg (1024px) and above -->
          <div class="hidden lg:flex items-center gap-1">
            <a href="#features" class="nav-link group">
              <i class="fas fa-star text-xs opacity-0 group-hover:opacity-100 transition-opacity"></i>
              <span>Fitur</span>
            </a>
            <a href="#pricing" class="nav-link group">
              <i class="fas fa-tag text-xs opacity-0 group-hover:opacity-100 transition-opacity"></i>
              <span>Harga</span>
            </a>
            <a href="#testimonials" class="nav-link group">
              <i class="fas fa-heart text-xs opacity-0 group-hover:opacity-100 transition-opacity"></i>
              <span>Testimoni</span>
            </a>
            <a href="#cta" class="nav-link group">
              <i class="fas fa-rocket text-xs opacity-0 group-hover:opacity-100 transition-opacity"></i>
              <span>Kontak</span>
            </a>
          </div>
          
          <!-- Desktop Action Buttons - Show on lg (1024px) and above -->
          <div class="hidden lg:flex items-center gap-3">
            <a href="#pricing" class="inline-flex items-center px-5 py-2.5 bg-white/5 hover:bg-white/15 border border-white/10 text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm">
              <i class="fas fa-gift mr-2 text-indigo-400"></i>
              Coba Gratis
            </a>
            <button id="login-btn" class="px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white text-sm font-bold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95">
              <i class="fas fa-sign-in-alt mr-2"></i>
              Login
            </button>
          </div>
          
          <!-- Mobile Menu Button - Show below lg (1024px) -->
          <button id="mobile-menu-btn" class="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-all duration-300" aria-label="Toggle menu">
            <i class="fas fa-bars text-lg menu-icon"></i>
            <i class="fas fa-times text-lg close-icon hidden"></i>
          </button>
        </div>
      </div>
      
      <!-- Animated border line -->
      <div class="navbar-border"></div>
    </nav>
    
    <!-- Mobile Menu Overlay -->
    <div id="mobile-menu" class="fixed inset-0 z-40 mobile-menu-overlay hidden">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" id="mobile-overlay"></div>
      <div class="absolute right-0 top-0 h-full w-72 max-w-[85vw] bg-gray-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl mobile-menu-panel">
        <div class="p-6">
          <!-- Mobile Menu Header -->
          <div class="flex items-center justify-between mb-8">
            <span class="font-bold text-xl text-white">Menu</span>
            <button id="mobile-close-btn" class="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <!-- Mobile Nav Links -->
          <div class="space-y-2">
            <a href="#features" class="mobile-nav-link group">
              <div class="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <i class="fas fa-star text-indigo-400"></i>
              </div>
              <span class="font-medium">Fitur</span>
              <i class="fas fa-chevron-right text-xs text-white/30 ml-auto"></i>
            </a>
            <a href="#pricing" class="mobile-nav-link group">
              <div class="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <i class="fas fa-tag text-purple-400"></i>
              </div>
              <span class="font-medium">Harga</span>
              <i class="fas fa-chevron-right text-xs text-white/30 ml-auto"></i>
            </a>
            <a href="#testimonials" class="mobile-nav-link group">
              <div class="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <i class="fas fa-heart text-pink-400"></i>
              </div>
              <span class="font-medium">Testimoni</span>
              <i class="fas fa-chevron-right text-xs text-white/30 ml-auto"></i>
            </a>
            <a href="#cta" class="mobile-nav-link group">
              <div class="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <i class="fas fa-rocket text-cyan-400"></i>
              </div>
              <span class="font-medium">Kontak</span>
              <i class="fas fa-chevron-right text-xs text-white/30 ml-auto"></i>
            </a>
          </div>
          
          <!-- Mobile Action Buttons -->
          <div class="mt-8 space-y-3">
            <a href="#pricing" class="w-full px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
              <i class="fas fa-gift text-indigo-400"></i>
              Coba Gratis
            </a>
            <button id="mobile-login-btn" class="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2">
              <i class="fas fa-sign-in-alt"></i>
              Login
            </button>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
          <p class="text-center text-xs text-white/40">
            © 2024 spinX. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `,
  
  initEvents: (callbacks = {}) => {
    // Desktop login button
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn && callbacks.onLogin) {
      loginBtn.addEventListener('click', callbacks.onLogin);
    }
    
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const mobileCloseBtn = document.getElementById('mobile-close-btn');
    const mobileLoginBtn = document.getElementById('mobile-login-btn');
    
    const openMobileMenu = () => {
      if (mobileMenu) {
        mobileMenu.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Animate panel
        setTimeout(() => {
          const panel = mobileMenu.querySelector('.mobile-menu-panel');
          if (panel) {
            panel.style.transform = 'translateX(0)';
          }
        }, 10);
        
        // Toggle icons
        const menuIcon = mobileMenuBtn?.querySelector('.menu-icon');
        const closeIcon = mobileMenuBtn?.querySelector('.close-icon');
        if (menuIcon) menuIcon.classList.add('hidden');
        if (closeIcon) closeIcon.classList.remove('hidden');
        
        Navbar.isMobileMenuOpen = true;
      }
    };
    
    const closeMobileMenu = () => {
      if (mobileMenu) {
        const panel = mobileMenu.querySelector('.mobile-menu-panel');
        if (panel) {
          panel.style.transform = 'translateX(100%)';
        }
        
        setTimeout(() => {
          mobileMenu.classList.add('hidden');
          document.body.style.overflow = '';
          
          // Toggle icons
          const menuIcon = mobileMenuBtn?.querySelector('.menu-icon');
          const closeIcon = mobileMenuBtn?.querySelector('.close-icon');
          if (menuIcon) menuIcon.classList.remove('hidden');
          if (closeIcon) closeIcon.classList.add('hidden');
        }, 300);
        
        Navbar.isMobileMenuOpen = false;
      }
    };
    
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
    
    if (mobileLoginBtn && callbacks.onLogin) {
      mobileLoginBtn.addEventListener('click', () => {
        closeMobileMenu();
        callbacks.onLogin();
      });
    }
    
    // Close menu on link click
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
    
    // Desktop anchor scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
      const navbar = document.querySelector('.navbar-enhanced');
      if (navbar) {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }
    });
  }
};

export default Navbar;

