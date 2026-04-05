/**
 * DOM Utilities - Common DOM operations
 * Reduces duplication across components
 */

export const DOMUtils = {
  /**
   * Get element by ID with optional fallback
   */
  getElement(id, fallback = null) {
    return document.getElementById(id) || fallback;
  },

  /**
   * Get multiple elements by selector
   */
  getElements(selector) {
    return Array.from(document.querySelectorAll(selector));
  },

  /**
   * Set text content safely
   */
  setText(id, text) {
    const element = this.getElement(id);
    if (element) element.textContent = text;
  },

  /**
   * Set value safely
   */
  setValue(id, value) {
    const element = this.getElement(id);
    if (element) element.value = value;
  },

  /**
   * Get value safely
   */
  getValue(id, defaultValue = '') {
    const element = this.getElement(id);
    return element ? element.value : defaultValue;
  },

  /**
   * Toggle classes safely
   */
  toggleClass(id, className, enabled) {
    const element = this.getElement(id);
    if (element) element.classList.toggle(className, enabled);
  },

  /**
   * Add classes safely
   */
  addClass(id, ...classes) {
    const element = this.getElement(id);
    if (element) element.classList.add(...classes);
  },

  /**
   * Remove classes safely
   */
  removeClass(id, ...classes) {
    const element = this.getElement(id);
    if (element) element.classList.remove(...classes);
  },

  /**
   * Bind click event safely
   */
  bindClick(id, handler) {
    const element = this.getElement(id);
    if (element && typeof handler === 'function') {
      element.addEventListener('click', handler);
    }
  },

  /**
   * Bind submit event safely
   */
  bindSubmit(id, handler) {
    const element = this.getElement(id);
    if (element && typeof handler === 'function') {
      element.addEventListener('submit', handler);
    }
  },

  /**
   * Bind change event safely
   */
  bindChange(id, handler) {
    const element = this.getElement(id);
    if (element && typeof handler === 'function') {
      element.addEventListener('change', handler);
    }
  },

  /**
   * Bind input event safely
   */
  bindInput(id, handler) {
    const element = this.getElement(id);
    if (element && typeof handler === 'function') {
      element.addEventListener('input', handler);
    }
  },

  /**
   * Show element (remove hidden class)
   */
  show(id) {
    this.removeClass(id, 'hidden');
  },

  /**
   * Hide element (add hidden class)
   */
  hide(id) {
    this.addClass(id, 'hidden');
  },

  /**
   * Toggle visibility
   */
  toggleVisibility(id, visible) {
    this.toggleClass(id, 'hidden', !visible);
  },

  /**
   * Set disabled state
   */
  setDisabled(id, disabled) {
    const element = this.getElement(id);
    if (element) element.disabled = disabled;
  },

  /**
   * Set innerHTML safely
   */
  setHTML(id, html) {
    const element = this.getElement(id);
    if (element) element.innerHTML = html;
  },

  /**
   * Get form data from multiple inputs
   */
  getFormData(inputIds) {
    const data = {};
    inputIds.forEach(id => {
      data[id] = this.getValue(id);
    });
    return data;
  },

  /**
   * Reset form
   */
  resetForm(id) {
    const form = this.getElement(id);
    if (form && form.tagName === 'FORM') {
      form.reset();
    }
  }
};

// Legacy aliases for backward compatibility
export const getElement = DOMUtils.getElement.bind(DOMUtils);
export const setText = DOMUtils.setText.bind(DOMUtils);
export const setValue = DOMUtils.setValue.bind(DOMUtils);
export const getValue = DOMUtils.getValue.bind(DOMUtils);
export const bindClick = DOMUtils.bindClick.bind(DOMUtils);
export const bindSubmit = DOMUtils.bindSubmit.bind(DOMUtils);
export const bindChange = DOMUtils.bindChange.bind(DOMUtils);
export const bindInput = DOMUtils.bindInput.bind(DOMUtils);
export const show = DOMUtils.show.bind(DOMUtils);
export const hide = DOMUtils.hide.bind(DOMUtils);
export const toggleVisibility = DOMUtils.toggleVisibility.bind(DOMUtils);
export const setDisabled = DOMUtils.setDisabled.bind(DOMUtils);
export const setHTML = DOMUtils.setHTML.bind(DOMUtils);
export const getFormData = DOMUtils.getFormData.bind(DOMUtils);
export const resetForm = DOMUtils.resetForm.bind(DOMUtils);