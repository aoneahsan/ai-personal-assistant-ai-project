/**
 * Backdrop component for highlighting elements
 */

import { createElement, addClass, removeClass } from '../utils/dom';
import { CSS_CLASSES } from '../utils/constants';

export default class Backdrop {
  constructor(config) {
    this.config = config;
    this.element = null;
    this.isVisible = false;
    this.onClick = null;
  }

  /**
   * Create backdrop element
   */
  createElement() {
    if (this.element) return;

    this.element = createElement('div', {
      className: CSS_CLASSES.BACKDROP,
      style: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: this.config.backdropColor,
        zIndex: this.config.zIndex,
        opacity: '0',
        transition: `opacity ${this.config.animationDuration}ms ease-in-out`,
        pointerEvents: this.config.closeOnBackdropClick ? 'auto' : 'none'
      }
    });

    document.body.appendChild(this.element);
  }

  /**
   * Show backdrop
   * @param {Element} excludeElement - Element to exclude from backdrop
   */
  show(excludeElement = null) {
    // Create element if needed
    this.createElement();

    // Add click handler if enabled
    if (this.config.closeOnBackdropClick) {
      this.onClick = (event) => {
        if (event.target === this.element) {
          // Emit close event through tour engine
          const closeEvent = new CustomEvent('backdrop:click');
          document.dispatchEvent(closeEvent);
        }
      };
      
      this.element.addEventListener('click', this.onClick);
    }

    // Show with animation
    if (this.config.animation) {
      requestAnimationFrame(() => {
        this.element.style.opacity = '1';
        addClass(this.element, 'paw-backdrop-active', true);
      });
    } else {
      this.element.style.opacity = '1';
      addClass(this.element, 'paw-backdrop-active');
    }

    this.isVisible = true;
  }

  /**
   * Hide backdrop
   */
  hide() {
    if (!this.element || !this.isVisible) return;

    // Remove click handler
    if (this.onClick) {
      this.element.removeEventListener('click', this.onClick);
      this.onClick = null;
    }

    // Hide with animation
    this.element.style.opacity = '0';
    removeClass(this.element, 'paw-backdrop-active');

    this.isVisible = false;
  }

  /**
   * Update backdrop color
   * @param {string} color - New color
   */
  updateColor(color) {
    if (this.element) {
      this.element.style.backgroundColor = color;
    }
  }

  /**
   * Destroy backdrop
   */
  destroy() {
    this.hide();
    
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    this.element = null;
  }
}