/**
 * Style manager for injecting widget styles
 */

import { createElement } from '../utils/dom';
import { getDefaultStyles } from './defaultStyles';

let stylesInjected = false;

/**
 * Inject widget styles into the page
 * @param {Object} config - Widget configuration
 */
export function injectStyles(config) {
  if (stylesInjected) return;

  const styleId = 'product-adoption-widget-styles';
  
  // Check if styles already exist
  if (document.getElementById(styleId)) {
    stylesInjected = true;
    return;
  }

  // Get default styles
  let styles = getDefaultStyles(config);

  // Add custom styles if provided
  if (config.customStyles) {
    styles += '\n' + config.customStyles;
  }

  // Create style element
  const styleElement = createElement('style', {
    id: styleId,
    type: 'text/css'
  }, styles);

  // Inject into head
  document.head.appendChild(styleElement);
  stylesInjected = true;
}

/**
 * Create widget container
 * @param {string} instanceId - Instance ID
 * @param {Object} config - Widget configuration
 * @returns {Element} Container element
 */
export function createWidgetContainer(instanceId, config) {
  const containerId = `paw-container-${instanceId}`;
  
  // Check if container already exists
  let container = document.getElementById(containerId);
  if (container) {
    return container;
  }

  // Create container
  container = createElement('div', {
    id: containerId,
    className: 'paw-widget-container',
    style: {
      position: 'fixed',
      zIndex: config.zIndex,
      pointerEvents: 'none'
    }
  });

  // Add to specified container or body
  const parentSelector = config.containerSelector || 'body';
  const parent = document.querySelector(parentSelector) || document.body;
  parent.appendChild(container);

  return container;
}

/**
 * Remove widget container
 * @param {string} instanceId - Instance ID
 */
export function removeWidgetContainer(instanceId) {
  const containerId = `paw-container-${instanceId}`;
  const container = document.getElementById(containerId);
  
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
}

/**
 * Update theme dynamically
 * @param {string} theme - Theme name
 */
export function updateTheme(theme) {
  const root = document.documentElement;
  root.setAttribute('data-paw-theme', theme);
}