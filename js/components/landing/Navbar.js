/**
 * Navbar Component
 * Navigation bar for landing page - Enhanced glassmorphism design
 */

export const Navbar = {
  render: () => `
    <nav class="fixed top-0 left-0 right-0 z-50 navbar-enhanced">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-18">
          <!-- Logo Section -->
          <div class="flex items-center gap-3 group cursor-pointer" onclick="window.scrollTo({top: 0, behavior: 'smooth'})">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/40 group-hover:shadow-indigo-500/60 transition-all duration-300 group-hover:scale-110">
              <i class="fas fa-dharmachakra text-white text-xl animate-spin-slow"></i>
            </div>
            <span class="font-bold text-2xl text-white tracking-tight">spin<span class="gradient-text">X</span></span>
          </div>
          
          <!-- Navigation Links -->
          <div class="hidden md:flex items-center gap-1">
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
          
          <!-- Action Buttons -->
          <div class="flex items-center gap-3">
            <a href="#pricing" class="hidden md:inline-flex items-center px-5 py-2.5 bg-white/5 hover:bg-white/15 border border-white/10 text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm">
              <i class="fas fa-gift mr-2 text-indigo-400"></i>
              Coba Gratis
            </a>
            <button id="login-btn" class="px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white text-sm font-bold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95">
              <i class="fas fa-sign-in-alt mr-2"></i>
              Login
            </button>
          </div>
        </div>
      </div>
      
      <!-- Animated border line -->
      <div class="navbar-border"></div>
    </nav>
  `,
  
  initEvents: (callbacks = {}) => {
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn && callbacks.onLogin) {
      loginBtn.addEventListener('click', callbacks.onLogin);
    }
    
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

