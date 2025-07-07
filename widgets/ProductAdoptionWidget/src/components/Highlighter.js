/**
 * Highlighter component for emphasizing target elements
 */

import { createElement, getElementPosition, addClass, removeClass } from '../utils/dom';
import { CSS_CLASSES } from '../utils/constants';

export default class Highlighter {
  constructor(config) {
    this.config = config;
    this.element = null;
    this.targetElement = null;
    this.isVisible = false;
  }

  /**
   * Create highlighter element
   */
  createElement() {
    if (this.element) return;

    this.element = createElement('div', {
      className: CSS_CLASSES.HIGHLIGHT,
      style: {
        position: 'absolute',
        pointerEvents: 'none',
        zIndex: this.config.zIndex + 1,
        border: '2px solid #0066ff',
        borderRadius: '4px',
        opacity: '0',
        transition: `all ${this.config.animationDuration}ms ease-in-out`,
        boxShadow: '0 0 0 4px rgba(0, 102, 255, 0.2)'
      }
    });

    document.body.appendChild(this.element);
  }

  /**
   * Highlight an element
   * @param {Element} target - Target element
   */
  highlight(target) {
    if (!target) return;

    this.targetElement = target;
    
    // Create element if needed
    this.createElement();

    // Position highlighter
    this.position();

    // Show with animation
    if (this.config.animation) {
      requestAnimationFrame(() => {
        this.element.style.opacity = '1';
        addClass(this.element, 'paw-highlight-active', true);
      });
    } else {
      this.element.style.opacity = '1';
      addClass(this.element, 'paw-highlight-active');
    }

    // Set up resize observer
    this.setupResizeObserver();

    this.isVisible = true;
  }

  /**
   * Position highlighter around target
   */
  position() {
    if (!this.targetElement || !this.element) return;

    const pos = getElementPosition(this.targetElement);
    const padding = 4;

    this.element.style.top = `${pos.top - padding}px`;
    this.element.style.left = `${pos.left - padding}px`;
    this.element.style.width = `${pos.width + (padding * 2)}px`;
    this.element.style.height = `${pos.height + (padding * 2)}px`;
  }

  /**
   * Set up resize observer
   */
  setupResizeObserver() {
    if (!window.ResizeObserver || !this.targetElement) return;

    this.resizeObserver = new ResizeObserver(() => {
      if (this.isVisible) {
        this.position();
      }
    });

    this.resizeObserver.observe(this.targetElement);

    // Also listen to window resize
    this.handleResize = () => {
      if (this.isVisible) {
        this.position();
      }
    };

    window.addEventListener('resize', this.handleResize);
    window.addEventListener('scroll', this.handleResize);
  }

  /**
   * Clean up resize observer
   */
  cleanupResizeObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.handleResize) {
      window.removeEventListener('resize', this.handleResize);
      window.removeEventListener('scroll', this.handleResize);
      this.handleResize = null;
    }
  }

  /**
   * Hide highlighter
   */
  hide() {
    if (!this.element || !this.isVisible) return;

    // Hide with animation
    this.element.style.opacity = '0';
    removeClass(this.element, 'paw-highlight-active');

    // Clean up observers
    this.cleanupResizeObserver();

    this.isVisible = false;
    this.targetElement = null;
  }

  /**
   * Update highlight style
   * @param {Object} styles - Style object
   */
  updateStyle(styles) {
    if (this.element) {
      Object.assign(this.element.style, styles);
    }
  }

  /**
   * Destroy highlighter
   */
  destroy() {
    this.hide();
    
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    this.element = null;
  }
}