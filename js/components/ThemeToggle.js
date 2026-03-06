
/**
 * Theme Toggle Component
 * Handles dark/light theme switching
 */

class ThemeToggle {
  constructor(options = {}) {
    this.iconId = options.iconId || 'theme-icon';
    this.themeKey = options.themeKey || 'theme';
  }

  render() {
    const button = document.createElement('button');
    button.className = 'theme-btn';
    button.title = 'Toggle Theme';
    button.style.cssText = 'position:fixed;top:20px;right:20px;z-index:1000;';
    button.onclick = () => this.toggle();
    
    const icon = document.createElement('i');
    icon.id = this.iconId;
    icon.className = 'fas fa-moon';
    button.appendChild(icon);
    return button;
  }

  toggle() {
    const html = document.documentElement;
    const icon = document.getElementById(this.iconId);
    if (html.getAttribute('data-theme') === 'dark') {
      html.setAttribute('data-theme', 'light');
      if (icon) icon.className = 'fas fa-sun';
      localStorage.setItem(this.themeKey, 'light');
    } else {
      html.setAttribute('data-theme', 'dark');
      if (icon) icon.className = 'fas fa-moon';
      localStorage.setItem(this.themeKey, 'dark');
    }
  }

  init() {
    const savedTheme = localStorage.getItem(this.themeKey) || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const icon = document.getElementById(this.iconId);
    if (icon) icon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
  }
}

// Export globally
window.ThemeToggle = ThemeToggle;


