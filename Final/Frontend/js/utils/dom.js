/**
 * DOM Utilities
 * Helper functions for DOM manipulation
 */

/**
 * Wait for DOM to be ready
 * @param {Function} callback - Function to execute when DOM is ready
 */
export function domReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

/**
 * Query selector with optional context
 * @param {string} selector - CSS selector
 * @param {Element} context - Optional context element
 * @returns {Element|null}
 */
export function $(selector, context = document) {
  return context.querySelector(selector);
}

/**
 * Query selector all with optional context
 * @param {string} selector - CSS selector
 * @param {Element} context - Optional context element
 * @returns {NodeList}
 */
export function $$(selector, context = document) {
  return context.querySelectorAll(selector);
}

/**
 * Create element with attributes and children
 * @param {string} tag - HTML tag name
 * @param {Object} attrs - Attributes object
 * @param {string|Element|Array} children - Child elements or text
 * @returns {Element}
 */
export function createElement(tag, attrs = {}, children = null) {
  const element = document.createElement(tag);
  
  // Set attributes
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'textContent') {
      element.textContent = value;
    } else if (key === 'innerHTML') {
      element.innerHTML = value;
    } else if (key.startsWith('data-')) {
      element.setAttribute(key, value);
    } else {
      element[key] = value;
    }
  });
  
  // Append children
  if (children) {
    if (typeof children === 'string') {
      element.textContent = children;
    } else if (Array.isArray(children)) {
      children.forEach(child => {
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child));
        } else if (child instanceof Element) {
          element.appendChild(child);
        }
      });
    } else if (children instanceof Element) {
      element.appendChild(children);
    }
  }
  
  return element;
}

/**
 * Show element(s)
 * @param {Element|NodeList|string} element - Element(s) to show
 */
export function show(element) {
  const elements = typeof element === 'string' ? $$(element) : 
                   element instanceof NodeList ? element : [element];
  elements.forEach(el => {
    if (el) {
      el.classList.remove('hidden');
      el.style.display = '';
    }
  });
}

/**
 * Hide element(s)
 * @param {Element|NodeList|string} element - Element(s) to hide
 */
export function hide(element) {
  const elements = typeof element === 'string' ? $$(element) : 
                   element instanceof NodeList ? element : [element];
  elements.forEach(el => {
    if (el) {
      el.classList.add('hidden');
      el.style.display = 'none';
    }
  });
}

/**
 * Toggle element visibility
 * @param {Element|string} element - Element to toggle
 * @param {boolean} force - Force show/hide
 */
export function toggle(element, force) {
  const el = typeof element === 'string' ? $(element) : element;
  if (!el) return;
  
  if (force !== undefined) {
    force ? show(el) : hide(el);
  } else {
    el.classList.toggle('hidden');
    el.style.display = el.classList.contains('hidden') ? 'none' : '';
  }
}

/**
 * Add event listener to element(s)
 * @param {Element|NodeList|string} element - Element(s)
 * @param {string} event - Event type
 * @param {Function} handler - Event handler
 * @param {Object} options - Event options
 */
export function on(element, event, handler, options = {}) {
  const elements = typeof element === 'string' ? $$(element) : 
                   element instanceof NodeList ? element : [element];
  elements.forEach(el => {
    if (el) el.addEventListener(event, handler, options);
  });
}

/**
 * Remove event listener from element(s)
 * @param {Element|NodeList|string} element - Element(s)
 * @param {string} event - Event type
 * @param {Function} handler - Event handler
 */
export function off(element, event, handler) {
  const elements = typeof element === 'string' ? $$(element) : 
                   element instanceof NodeList ? element : [element];
  elements.forEach(el => {
    if (el) el.removeEventListener(event, handler);
  });
}

/**
 * Get element by data attribute
 * @param {string} name - Data attribute name (without 'data-')
 * @param {Element} context - Optional context
 * @returns {Element|null}
 */
export function getByData(name, context = document) {
  return context.querySelector(`[data-${name}]`);
}

/**
 * Get all elements by data attribute
 * @param {string} name - Data attribute name (without 'data-')
 * @param {Element} context - Optional context
 * @returns {NodeList}
 */
export function getAllByData(name, context = document) {
  return context.querySelectorAll(`[data-${name}]`);
}




