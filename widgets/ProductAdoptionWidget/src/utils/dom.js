/**
 * DOM utility functions
 */

/**
 * Wait for an element to appear in the DOM
 * @param {string} selector - CSS selector
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Element|null>} Element or null
 */
export function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelector(selector);
      if (element) {
        obs.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

/**
 * Scroll element into view
 * @param {Element} element - Target element
 * @param {number} offset - Scroll offset
 * @returns {Promise} Scroll complete
 */
export function scrollToElement(element, offset = 100) {
  return new Promise((resolve) => {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const targetY = rect.top + scrollTop - offset;

    window.scrollTo({
      top: targetY,
      behavior: 'smooth'
    });

    // Wait for scroll to complete
    setTimeout(resolve, 500);
  });
}

/**
 * Get element position relative to viewport
 * @param {Element} element - Target element
 * @returns {Object} Position object
 */
export function getElementPosition(element) {
  const rect = element.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

  return {
    top: rect.top + scrollTop,
    left: rect.left + scrollLeft,
    bottom: rect.bottom + scrollTop,
    right: rect.right + scrollLeft,
    width: rect.width,
    height: rect.height,
    viewportTop: rect.top,
    viewportLeft: rect.left
  };
}

/**
 * Check if element is visible in viewport
 * @param {Element} element - Target element
 * @returns {boolean} Is visible
 */
export function isElementInViewport(element) {
  const rect = element.getBoundingClientRect();
  
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Create DOM element with attributes
 * @param {string} tag - HTML tag
 * @param {Object} attributes - Element attributes
 * @param {string|Element|Array} children - Child elements or text
 * @returns {Element} Created element
 */
export function createElement(tag, attributes = {}, children = null) {
  const element = document.createElement(tag);

  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      const event = key.slice(2).toLowerCase();
      element.addEventListener(event, value);
    } else {
      element.setAttribute(key, value);
    }
  });

  // Add children
  if (children) {
    if (typeof children === 'string') {
      element.textContent = children;
    } else if (Array.isArray(children)) {
      children.forEach(child => {
        if (child instanceof Element) {
          element.appendChild(child);
        } else if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child));
        }
      });
    } else if (children instanceof Element) {
      element.appendChild(children);
    }
  }

  return element;
}

/**
 * Add CSS class with optional animation
 * @param {Element} element - Target element
 * @param {string} className - CSS class name
 * @param {boolean} animate - Use animation
 */
export function addClass(element, className, animate = false) {
  if (animate) {
    requestAnimationFrame(() => {
      element.classList.add(className);
    });
  } else {
    element.classList.add(className);
  }
}

/**
 * Remove CSS class
 * @param {Element} element - Target element
 * @param {string} className - CSS class name
 */
export function removeClass(element, className) {
  element.classList.remove(className);
}

/**
 * Get computed styles for element
 * @param {Element} element - Target element
 * @returns {CSSStyleDeclaration} Computed styles
 */
export function getComputedStyles(element) {
  return window.getComputedStyle(element);
}

/**
 * Get element z-index including parents
 * @param {Element} element - Target element
 * @returns {number} Effective z-index
 */
export function getEffectiveZIndex(element) {
  let zIndex = 0;
  let el = element;

  while (el && el !== document.body) {
    const styles = getComputedStyles(el);
    const z = parseInt(styles.zIndex, 10);
    
    if (!isNaN(z) && z > zIndex) {
      zIndex = z;
    }
    
    el = el.parentElement;
  }

  return zIndex;
}