/**
 * Product Adoption Widget
 * Main entry point for the embeddable product tour widget
 */

import WidgetCore from './core/WidgetCore';
import { validateConfig } from './utils/validation';
import { WIDGET_DEFAULTS } from './utils/constants';

class ProductAdoptionWidget {
  constructor() {
    this.instances = new Map();
    this.globalId = 0;
    
    // Make widget globally available
    if (typeof window !== 'undefined') {
      window.ProductAdoptionWidget = this;
    }
  }

  /**
   * Initialize a new widget instance
   * @param {Object} config - Widget configuration
   * @returns {Object} Widget instance
   */
  init(config = {}) {
    try {
      // Validate configuration
      const validationResult = validateConfig(config);
      if (!validationResult.valid) {
        throw new Error(`Invalid configuration: ${validationResult.errors.join(', ')}`);
      }

      // Merge with defaults
      const finalConfig = {
        ...WIDGET_DEFAULTS,
        ...config,
        instanceId: `paw-${++this.globalId}`
      };

      // Create widget instance
      const widget = new WidgetCore(finalConfig);
      this.instances.set(finalConfig.instanceId, widget);

      // Auto-initialize if DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => widget.initialize());
      } else {
        widget.initialize();
      }

      return widget;
    } catch (error) {
      console.error('[ProductAdoptionWidget] Initialization error:', error);
      throw error;
    }
  }

  /**
   * Get a widget instance by ID
   * @param {string} instanceId - Instance ID
   * @returns {Object|null} Widget instance or null
   */
  getInstance(instanceId) {
    return this.instances.get(instanceId) || null;
  }

  /**
   * Destroy a widget instance
   * @param {string} instanceId - Instance ID
   */
  destroy(instanceId) {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.destroy();
      this.instances.delete(instanceId);
    }
  }

  /**
   * Destroy all widget instances
   */
  destroyAll() {
    this.instances.forEach(instance => instance.destroy());
    this.instances.clear();
  }

  /**
   * Get version information
   * @returns {string} Widget version
   */
  getVersion() {
    return '1.0.0';
  }
}

// Create and export singleton instance
const widgetInstance = new ProductAdoptionWidget();
export default widgetInstance;