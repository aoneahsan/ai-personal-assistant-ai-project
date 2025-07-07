// Injected script to communicate with ProductAdoption widget

(function() {
  'use strict';
  
  // Check if ProductAdoption widget is available
  function waitForWidget(callback) {
    if (window.ProductAdoption) {
      callback();
    } else {
      setTimeout(() => waitForWidget(callback), 100);
    }
  }
  
  // Bridge between extension and widget
  class WidgetBridge {
    constructor() {
      this.isConnected = false;
      this.init();
    }
    
    init() {
      // Listen for messages from content script
      window.addEventListener('message', (event) => {
        if (event.source !== window) return;
        
        if (event.data.type && event.data.type.startsWith('PA_EXT_')) {
          this.handleMessage(event.data);
        }
      });
      
      // Notify content script that bridge is ready
      window.postMessage({ type: 'PA_BRIDGE_READY' }, '*');
      this.isConnected = true;
    }
    
    handleMessage(data) {
      switch (data.type) {
        case 'PA_EXT_SHOW_TOOLTIP':
          this.showTooltip(data.payload);
          break;
        case 'PA_EXT_HIDE_TOOLTIP':
          this.hideTooltip();
          break;
        case 'PA_EXT_START_TOUR':
          this.startTour(data.payload);
          break;
        case 'PA_EXT_PREVIEW_STEP':
          this.previewStep(data.payload);
          break;
        case 'PA_EXT_GET_WIDGET_STATUS':
          this.sendWidgetStatus();
          break;
      }
    }
    
    showTooltip(options) {
      if (!window.ProductAdoption) return;
      
      window.ProductAdoption.showTooltip({
        target: options.target,
        title: options.title,
        content: options.content,
        position: options.position || 'bottom',
        buttons: options.buttons || []
      });
    }
    
    hideTooltip() {
      if (!window.ProductAdoption) return;
      window.ProductAdoption.hideTooltip();
    }
    
    startTour(tour) {
      if (!window.ProductAdoption) return;
      
      // Convert extension tour format to widget format
      const widgetTour = {
        id: tour.id,
        name: tour.name,
        steps: tour.steps.map(step => ({
          target: step.target,
          title: step.title,
          content: step.content,
          position: step.position,
          backdrop: true,
          buttons: [
            {
              text: 'Previous',
              action: 'prev',
              style: 'secondary'
            },
            {
              text: 'Next',
              action: 'next',
              style: 'primary'
            }
          ]
        }))
      };
      
      window.ProductAdoption.startTour(widgetTour);
    }
    
    previewStep(step) {
      if (!window.ProductAdoption) return;
      
      // Show single step preview
      this.showTooltip({
        target: step.target,
        title: step.title,
        content: step.content,
        position: step.position,
        buttons: [
          {
            text: 'Close',
            action: () => this.hideTooltip(),
            style: 'primary'
          }
        ]
      });
    }
    
    sendWidgetStatus() {
      const status = {
        isAvailable: !!window.ProductAdoption,
        version: window.ProductAdoption?.version || null,
        features: window.ProductAdoption ? {
          tours: typeof window.ProductAdoption.startTour === 'function',
          tooltips: typeof window.ProductAdoption.showTooltip === 'function',
          analytics: typeof window.ProductAdoption.trackEvent === 'function'
        } : null
      };
      
      window.postMessage({
        type: 'PA_WIDGET_STATUS',
        payload: status
      }, '*');
    }
  }
  
  // Initialize bridge when widget is ready
  waitForWidget(() => {
    window.__paExtensionBridge = new WidgetBridge();
  });
})();