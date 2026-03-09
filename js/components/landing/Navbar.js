/**
 * Navbar Component
 * Navigation bar for landing page
 */

export const Navbar = {
  render: () => `
    <nav class="fixed top-0 left-0 right-0 z-50 nav-blur">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center">
              <i class="fas fa-dharmachakra text-white text-lg"></i>
            </div>
            <span class="font-bold text-xl text-white">spin<span class="text-indigo-400">X</span></span>
          </div>
          <div class="hidden md:flex items-center gap-8">
            <a href="#features" class="text-gray-300 hover:text-white transition-colors text-sm">Fitur</a>
            <a href="#pricing" class="text-gray-300 hover:text-white transition-colors text-sm">Harga</a>
            <a href="#testimonials" class="text-gray-300 hover:text-white transition-colors text-sm">Testimoni</a>
          </div>
          <div class="flex items-center gap-3">
            <a href="#pricing" class="hidden sm:inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-all">
              Coba Gratis
            </a>
            <button id="login-btn" class="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-indigo-500/30">
              Login
            </button>
          </div>
        </div>
      </div>
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
  }
};

export default Navbar;

