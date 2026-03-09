/**
 * Theme Manager - Unified Theme Toggle
 * Replaces duplicate inline theme toggle in all dashboard HTMLs
 * Clean, modular, DRY - best practice
 */

class ThemeManager {
  constructor() {
    this.themeKey = 'theme';
    this.defaultTheme = 'dark';
    this.iconElement = null;
  }

  /**
   * Initialize theme from localStorage
   */
  init(iconId = 'theme-icon') {
    this.iconElement = document.getElementById(iconId);
    const savedTheme = localStorage.getItem(this.themeKey) || this.defaultTheme;
    this.applyTheme(savedTheme);
  }

  /**
   * Apply theme to document
   * @param {string} theme - 'dark' or 'light'
   */
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.themeKey, theme);
    
    if (this.iconElement) {
      this.iconElement.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }
  }

  /**
   * Toggle between dark and light theme
   */
  toggle() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || this.defaultTheme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
  }

  /**
   * Get current theme
   * @returns {string}
   */
  getTheme() {
    return document.documentElement.getAttribute('data-theme') || this.defaultTheme;
  }

  /**
   * Check if dark mode
   * @returns {boolean}
   */
  isDark() {
    return this.getTheme() === 'dark';
  }
}

// Create singleton instance
const themeManager = new ThemeManager();

// Export for modules
export { themeManager };

// Also expose globally for inline usage and backward compatibility
window.ThemeManager = themeManager;
window.toggleTheme = () => themeManager.toggle();

