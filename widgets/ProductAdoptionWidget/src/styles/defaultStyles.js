/**
 * Default widget styles
 */

export function getDefaultStyles(config) {
  const theme = config.theme || 'light';
  const primaryColor = '#0066ff';
  const animationDuration = config.animationDuration || 300;

  return `
    /* Widget Container */
    .paw-widget-container {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #333;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* Tooltip Styles */
    .paw-tooltip {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
      max-width: 400px;
      min-width: 300px;
      pointer-events: auto;
    }

    .paw-tooltip-dark {
      background: #1a1a1a;
      color: #ffffff;
    }

    .paw-tooltip-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px 0;
    }

    .paw-tooltip-step-number {
      font-size: 12px;
      color: #666;
      font-weight: 500;
    }

    .paw-tooltip-dark .paw-tooltip-step-number {
      color: #999;
    }

    .paw-tooltip-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: #666;
      transition: color ${animationDuration}ms ease;
    }

    .paw-tooltip-close:hover {
      color: #333;
    }

    .paw-tooltip-dark .paw-tooltip-close {
      color: #999;
    }

    .paw-tooltip-dark .paw-tooltip-close:hover {
      color: #fff;
    }

    .paw-tooltip-title {
      font-size: 18px;
      font-weight: 600;
      padding: 12px 20px 8px;
      color: #111;
    }

    .paw-tooltip-dark .paw-tooltip-title {
      color: #fff;
    }

    .paw-tooltip-content {
      padding: 0 20px 16px;
      color: #555;
    }

    .paw-tooltip-dark .paw-tooltip-content {
      color: #ccc;
    }

    .paw-tooltip-progress {
      padding: 0 20px 16px;
    }

    .paw-progress-bar {
      height: 4px;
      background: #e5e5e5;
      border-radius: 2px;
      overflow: hidden;
    }

    .paw-tooltip-dark .paw-progress-bar {
      background: #333;
    }

    .paw-progress-fill {
      height: 100%;
      background: ${primaryColor};
      transition: width ${animationDuration}ms ease;
    }

    .paw-tooltip-footer {
      padding: 16px 20px;
      border-top: 1px solid #e5e5e5;
    }

    .paw-tooltip-dark .paw-tooltip-footer {
      border-top-color: #333;
    }

    .paw-tooltip-buttons {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    /* Button Styles */
    .paw-button {
      padding: 8px 16px;
      border-radius: 6px;
      border: none;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all ${animationDuration}ms ease;
      outline: none;
    }

    .paw-button:focus-visible {
      box-shadow: 0 0 0 2px ${primaryColor}40;
    }

    .paw-button-primary {
      background: ${primaryColor};
      color: white;
    }

    .paw-button-primary:hover {
      background: #0052cc;
    }

    .paw-button-secondary {
      background: transparent;
      color: #666;
      border: 1px solid #e5e5e5;
    }

    .paw-button-secondary:hover {
      background: #f5f5f5;
      border-color: #d5d5d5;
    }

    .paw-tooltip-dark .paw-button-secondary {
      color: #ccc;
      border-color: #444;
    }

    .paw-tooltip-dark .paw-button-secondary:hover {
      background: #2a2a2a;
      border-color: #555;
    }

    /* Backdrop Styles */
    .paw-backdrop {
      backdrop-filter: blur(2px);
    }

    /* Highlight Styles */
    .paw-highlight {
      pointer-events: none;
    }

    .paw-highlight-active {
      animation: paw-pulse 2s infinite;
    }

    @keyframes paw-pulse {
      0% {
        box-shadow: 0 0 0 4px rgba(0, 102, 255, 0.2);
      }
      50% {
        box-shadow: 0 0 0 8px rgba(0, 102, 255, 0.1);
      }
      100% {
        box-shadow: 0 0 0 4px rgba(0, 102, 255, 0.2);
      }
    }

    /* Animations */
    .paw-tooltip-active {
      animation: paw-fadein ${animationDuration}ms ease;
    }

    @keyframes paw-fadein {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive */
    @media (max-width: 480px) {
      .paw-tooltip {
        max-width: calc(100vw - 32px);
        min-width: calc(100vw - 32px);
      }
    }

    /* Accessibility */
    .paw-button:focus-visible,
    .paw-tooltip-close:focus-visible {
      outline: 2px solid ${primaryColor};
      outline-offset: 2px;
    }

    /* Print styles */
    @media print {
      .paw-widget-container,
      .paw-backdrop,
      .paw-highlight,
      .paw-tooltip {
        display: none !important;
      }
    }
  `;
}