/**
 * Theme Toggle Component
 * Reusable theme toggle button
 */

class ThemeToggle {
  constructor(options = {}) {
    this.iconId = options.iconId || 'theme-icon';
    this.themeKey = 'theme';
  }

  /**
   * Render the theme toggle button
   */
  render() {
    const button = document.createElement('button');
    button.className = 'theme-btn';
    button.title = 'Toggle Theme';
    button.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1000;';
    button.onclick = () => this.toggle();
    
    const icon = document.createElement('i');
    icon.id = this.iconId;
    icon.className = 'fas fa-moon';
    
    button.appendChild(icon);
    return button;
  }

  /**
   * Toggle between dark and light theme
   */
  toggle() {
    const html = document.documentElement;
    const icon = document.getElementById(this.iconId);
    
    if (html.getAttribute('data-theme') === 'dark') {
      html.setAttribute('data-theme', 'light');
      icon.className = 'fas fa-sun';
      localStorage.setItem(this.themeKey, 'light');
    } else {
      html.setAttribute('data-theme', 'dark');
      icon.className = 'fas fa-moon';
      localStorage.setItem(this.themeKey, 'dark');
    }
  }

  /**
   * Initialize theme from saved preference
   */
  init() {
    const savedTheme = localStorage.getItem(this.themeKey) || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const icon = document.getElementById(this.iconId);
    if (icon) {
      icon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }
  }
}

// Export for global use
window.ThemeToggle = ThemeToggle;

