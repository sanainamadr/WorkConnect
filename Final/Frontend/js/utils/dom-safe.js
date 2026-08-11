/**
 * Safe DOM Utilities
 * Enhanced DOM utilities with null safety and error handling
 */

/**
 * Safely get element by ID with error handling
 * @param {string} id - Element ID
 * @param {Element} context - Optional context element
 * @param {boolean} required - If true, throws error if not found
 * @returns {Element|null}
 */
export function safeGetElement(id, context = document, required = false) {
  const element = context.getElementById(id);
  
  if (!element) {
    const message = `Element #${id} not found`;
    if (required) {
      throw new Error(message);
    }
    console.warn(message);
    return null;
  }
  
  return element;
}

/**
 * Safely get elements by selector with error handling
 * @param {string} selector - CSS selector
 * @param {Element} context - Optional context element
 * @param {boolean} required - If true, throws error if none found
 * @returns {NodeList|Array}
 */
export function safeGetElements(selector, context = document, required = false) {
  const elements = context.querySelectorAll(selector);
  
  if (elements.length === 0) {
    const message = `No elements found for selector: ${selector}`;
    if (required) {
      throw new Error(message);
    }
    console.warn(message);
    return [];
  }
  
  return elements;
}

/**
 * Initialize multiple elements safely
 * @param {Object} selectors - Object with key: selector pairs
 * @param {Element} context - Optional context element
 * @param {Array<string>} required - Array of required element keys
 * @returns {Object|null} Elements object or null if required missing
 */
export function initElements(selectors, context = document, required = []) {
  const elements = {};
  const missing = [];
  
  // Get all elements
  Object.entries(selectors).forEach(([key, selector]) => {
    if (typeof selector === 'string') {
      elements[key] = context.querySelector(selector);
    } else if (selector.id) {
      elements[key] = context.getElementById(selector.id);
    } else {
      elements[key] = selector; // Already an element
    }
    
    // Check if required element is missing
    if (required.includes(key) && !elements[key]) {
      missing.push(key);
    }
  });
  
  // Validate required elements
  if (missing.length > 0) {
    console.error('Missing required elements:', missing);
    console.error('Available elements:', Object.keys(elements).filter(k => elements[k]));
    return null;
  }
  
  return elements;
}

/**
 * Safely set text content
 * @param {Element|null} element - Element to update
 * @param {string} text - Text content
 * @param {string} fallback - Fallback text if element is null
 */
export function safeSetText(element, text, fallback = '') {
  if (element) {
    element.textContent = text || fallback;
  } else {
    console.warn('Cannot set text: element is null');
  }
}

/**
 * Safely set inner HTML
 * @param {Element|null} element - Element to update
 * @param {string} html - HTML content
 */
export function safeSetHTML(element, html) {
  if (element) {
    element.innerHTML = html;
  } else {
    console.warn('Cannot set HTML: element is null');
  }
}

/**
 * Safely add event listener with null check
 * @param {Element|null|NodeList} element - Element(s) to attach listener to
 * @param {string} event - Event type
 * @param {Function} handler - Event handler
 * @param {Object} options - Event options
 * @returns {boolean} Success status
 */
export function safeOn(element, event, handler, options = {}) {
  if (!element) {
    console.warn(`Cannot add ${event} listener: element is null`);
    return false;
  }
  
  if (element instanceof NodeList || Array.isArray(element)) {
    element.forEach(el => {
      if (el) el.addEventListener(event, handler, options);
    });
    return true;
  }
  
  element.addEventListener(event, handler, options);
  return true;
}

/**
 * Safely toggle class
 * @param {Element|null} element - Element
 * @param {string} className - Class name
 * @param {boolean} force - Force add/remove
 */
export function safeToggleClass(element, className, force) {
  if (element) {
    element.classList.toggle(className, force);
  }
}

/**
 * Safely show element
 * @param {Element|null|NodeList} element - Element(s) to show
 */
export function safeShow(element) {
  if (!element) return;
  
  const elements = element instanceof NodeList || Array.isArray(element) 
    ? element 
    : [element];
  
  elements.forEach(el => {
    if (el) {
      el.classList.remove('hidden');
      el.style.display = '';
    }
  });
}

/**
 * Safely hide element
 * @param {Element|null|NodeList} element - Element(s) to hide
 */
export function safeHide(element) {
  if (!element) return;
  
  const elements = element instanceof NodeList || Array.isArray(element) 
    ? element 
    : [element];
  
  elements.forEach(el => {
    if (el) {
      el.classList.add('hidden');
      el.style.display = 'none';
    }
  });
}

/**
 * Batch validate elements
 * @param {Object} elements - Elements object
 * @param {Array<string>} required - Required keys
 * @returns {Object} Validation result
 */
export function validateElements(elements, required = []) {
  const missing = required.filter(key => !elements[key]);
  const present = Object.keys(elements).filter(key => elements[key]);
  
  return {
    valid: missing.length === 0,
    missing,
    present,
    elements
  };
}




