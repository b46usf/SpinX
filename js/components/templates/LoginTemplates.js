
/**
 * Login Form Templates
 * HTML templates for login form
 */

const LoginTemplates = {
  getClientId() {
    return window.AUTH_CONFIG?.CLIENT_ID || '88663261491-uugvuvfgrq20ftg481k1l6evouh98uon.apps.googleusercontent.com';
  },

  loginSection() {
    return `
      <div id="login-section" class="glass-card p-8 w-full max-w-md text-center animate-scale-in">
        <div class="mb-6">
          <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center animate-float">
            <i class="fas fa-ticket text-4xl text-white"></i>
          </div>
          <h1 class="text-3xl font-bold text-gradient">SpinX Smahada</h1>
          <p class="text-secondary mt-2">Lucky Wheel Festival</p>
        </div>
        <p class="text-secondary mb-6">Masuk dengan Google & coba keberuntunganmu! 🚀</p>
        
        <div class="login-card">
          <div id="g_id_onload"
              data-client_id="${this.getClientId()}"
              data-context="signin"
              data-ux_mode="popup"
              data-callback="handleGoogleCredentialResponse"
              data-auto_prompt="false">
          </div>
          <button id="googleLoginBtn" class="google-login">
              <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google">
              <span>Sign in with Google</span>
          </button>
        </div>
        <div id="auth-error" class="hidden mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"></div>
        <div class="mt-6 pt-6 border-t border-white/10">
          <p class="text-xs text-muted"><i class="fas fa-shield-alt mr-1"></i>Login aman & terjamin privasinya</p>
        </div>
      </div>
    `;
  }
};

// Export globally
window.LoginTemplates = LoginTemplates;


