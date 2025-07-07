/**
 * AI Personal Assistant - Embeddable Feedback Widget
 * Version: 1.0.0
 * 
 * Usage:
 * <script src="https://yourapp.com/embed/feedback-widget.js"></script>
 * <script>
 *   AIFeedbackWidget.init({
 *     embedId: 'your-embed-id',
 *     containerId: 'feedback-container'
 *   });
 * </script>
 */
(function() {
  "use strict";
  
  window.AIFeedbackWidget = window.AIFeedbackWidget || {};
  
  let config = {
    embedId: null,
    containerId: null,
    baseUrl: null,
    userId: null,
    userMetadata: null,
    initialized: false,
    // Widget appearance
    theme: 'auto',
    position: 'bottom-right',
    showWidget: true,
    widgetText: 'Share Feedback',
    // Behavior
    autoShow: false,
    trigger: {
      type: 'manual',
      delay: 30000, // 30 seconds
      scrollPercentage: 80,
      exitIntent: false
    }
  };
  
  let widgetContainer = null;
  let iframe = null;
  let feedbackButton = null;
  let isVisible = false;
  let isWidgetVisible = true;
  let scrollThreshold = 0;
  let actionCount = 0;
  let hasSubmittedFeedback = false;
  let sessionId = null;
  
  // Initialize the feedback widget
  function init(options) {
    if (config.initialized) {
      console.warn("AI Feedback Widget already initialized");
      return;
    }
    
    if (!options.embedId) {
      console.error("AI Feedback Widget: embedId is required");
      return;
    }
    
    config = {
      ...config,
      ...options,
      baseUrl: options.baseUrl || detectBaseUrl(),
      containerId: options.containerId || 'body',
      initialized: true
    };
    
    // Generate session ID
    sessionId = generateSessionId();
    
    // Create widget elements
    createWidget();
    
    // Setup triggers
    setupTriggers();
    
    // Check for existing feedback
    checkExistingFeedback();
    
    console.log("AI Feedback Widget initialized successfully");
  }
  
  // Detect base URL from current script
  function detectBaseUrl() {
    const scripts = document.getElementsByTagName('script');
    for (let script of scripts) {
      if (script.src && script.src.includes('feedback-widget.js')) {
        return script.src.replace('/embed/feedback-widget.js', '');
      }
    }
    return window.location.origin;
  }
  
  // Generate unique session ID
  function generateSessionId() {
    return `feedback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
  
  // Create widget elements
  function createWidget() {
    const container = config.containerId === 'body' ? document.body : document.getElementById(config.containerId);
    if (!container) {
      console.error(`AI Feedback Widget: Container element not found`);
      return;
    }
    
    // Create feedback button
    createFeedbackButton(container);
    
    // Create modal container
    createModalContainer(container);
    
    // Setup responsive design
    handleResponsiveDesign();
    
    // Setup event listeners
    setupEventListeners();
  }
  
  // Create feedback button
  function createFeedbackButton(container) {
    feedbackButton = document.createElement("button");
    feedbackButton.id = "ai-feedback-button";
    feedbackButton.innerHTML = getFeedbackButtonHTML();
    feedbackButton.className = `ai-feedback-button ai-feedback-button--${config.theme} ai-feedback-button--${config.position}`;
    
    // Position styles
    const positions = {
      'bottom-right': { bottom: '20px', right: '20px' },
      'bottom-left': { bottom: '20px', left: '20px' },
      'top-right': { top: '20px', right: '20px' },
      'top-left': { top: '20px', left: '20px' }
    };
    
    const position = positions[config.position] || positions['bottom-right'];
    
    feedbackButton.style.cssText = `
      position: fixed;
      ${Object.entries(position).map(([key, value]) => `${key}: ${value}`).join('; ')};
      z-index: 999999;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 25px;
      padding: 12px 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 140px;
      justify-content: center;
      transform: ${config.showWidget ? 'scale(1)' : 'scale(0)'};
      opacity: ${config.showWidget ? '1' : '0'};
    `;
    
    feedbackButton.addEventListener("click", openFeedbackModal);
    feedbackButton.addEventListener("mouseenter", () => {
      feedbackButton.style.transform = 'scale(1.05)';
      feedbackButton.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
    });
    feedbackButton.addEventListener("mouseleave", () => {
      feedbackButton.style.transform = 'scale(1)';
      feedbackButton.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
    });
    
    container.appendChild(feedbackButton);
  }
  
  // Get feedback button HTML
  function getFeedbackButtonHTML() {
    return `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10 5.52 0 10-4.48 10-10 0-5.52-4.48-10-10-10zm3.5 6L12 10.5 8.5 8 12 5.5 15.5 8zM12 13.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z"/>
      </svg>
      <span>${config.widgetText}</span>
    `;
  }
  
  // Create modal container
  function createModalContainer(container) {
    widgetContainer = document.createElement("div");
    widgetContainer.id = "ai-feedback-widget-wrapper";
    widgetContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9999999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      backdrop-filter: blur(5px);
    `;
    
    // Create iframe
    iframe = document.createElement("iframe");
    iframe.style.cssText = `
      width: 450px;
      height: 600px;
      max-width: 95vw;
      max-height: 95vh;
      border: none;
      border-radius: 16px;
      background: white;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      transform: scale(0.9);
      transition: transform 0.3s ease;
    `;
    iframe.allow = "microphone; camera; clipboard-write";
    iframe.sandbox = "allow-same-origin allow-scripts allow-forms allow-popups allow-modals";
    
    // Close on backdrop click
    widgetContainer.addEventListener("click", (e) => {
      if (e.target === widgetContainer) {
        closeFeedbackModal();
      }
    });
    
    widgetContainer.appendChild(iframe);
    container.appendChild(widgetContainer);
  }
  
  // Setup triggers
  function setupTriggers() {
    if (!config.autoShow) return;
    
    switch (config.trigger.type) {
      case 'page-load':
        setTimeout(() => {
          if (!hasSubmittedFeedback) showFeedbackWidget();
        }, 1000);
        break;
        
      case 'time-delay':
        setTimeout(() => {
          if (!hasSubmittedFeedback) showFeedbackWidget();
        }, config.trigger.delay);
        break;
        
      case 'scroll-percentage':
        scrollThreshold = (document.documentElement.scrollHeight - window.innerHeight) * 
                         (config.trigger.scrollPercentage / 100);
        window.addEventListener('scroll', handleScroll);
        break;
        
      case 'exit-intent':
        if (config.trigger.exitIntent) {
          document.addEventListener('mouseleave', handleExitIntent);
        }
        break;
        
      case 'action-count':
        document.addEventListener('click', handleActionTracking);
        document.addEventListener('keydown', handleActionTracking);
        break;
    }
  }
  
  // Handle scroll trigger
  function handleScroll() {
    if (window.scrollY >= scrollThreshold && !hasSubmittedFeedback) {
      showFeedbackWidget();
      window.removeEventListener('scroll', handleScroll);
    }
  }
  
  // Handle exit intent
  function handleExitIntent(e) {
    if (e.clientY <= 0 && !hasSubmittedFeedback) {
      showFeedbackWidget();
      document.removeEventListener('mouseleave', handleExitIntent);
    }
  }
  
  // Handle action tracking
  function handleActionTracking() {
    actionCount++;
    if (actionCount >= (config.trigger.actionCount || 3) && !hasSubmittedFeedback) {
      showFeedbackWidget();
      document.removeEventListener('click', handleActionTracking);
      document.removeEventListener('keydown', handleActionTracking);
    }
  }
  
  // Show feedback widget
  function showFeedbackWidget() {
    if (!isWidgetVisible) {
      feedbackButton.style.transform = 'scale(1)';
      feedbackButton.style.opacity = '1';
      isWidgetVisible = true;
    }
  }
  
  // Hide feedback widget
  function hideFeedbackWidget() {
    if (isWidgetVisible) {
      feedbackButton.style.transform = 'scale(0)';
      feedbackButton.style.opacity = '0';
      isWidgetVisible = false;
    }
  }
  
  // Open feedback modal
  function openFeedbackModal() {
    if (isVisible) return;
    
    iframe.src = buildIframeUrl();
    widgetContainer.style.opacity = '1';
    widgetContainer.style.visibility = 'visible';
    iframe.style.transform = 'scale(1)';
    isVisible = true;
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Track open event
    trackEvent('feedback_modal_opened');
  }
  
  // Close feedback modal
  function closeFeedbackModal() {
    if (!isVisible) return;
    
    widgetContainer.style.opacity = '0';
    widgetContainer.style.visibility = 'hidden';
    iframe.style.transform = 'scale(0.9)';
    isVisible = false;
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Track close event
    trackEvent('feedback_modal_closed');
  }
  
  // Build iframe URL
  function buildIframeUrl() {
    const params = new URLSearchParams();
    params.append("embedId", config.embedId);
    params.append("mode", "feedback-embed");
    params.append("sessionId", sessionId);
    
    if (config.userId) {
      params.append("userId", config.userId);
    }
    
    if (config.userMetadata) {
      params.append("userMetadata", JSON.stringify(config.userMetadata));
    }
    
    // Page context
    params.append("websiteUrl", window.location.href);
    params.append("origin", window.location.origin);
    params.append("referrer", document.referrer);
    params.append("userAgent", navigator.userAgent);
    
    // Widget config
    params.append("theme", config.theme);
    params.append("position", config.position);
    
    return `${config.baseUrl}/embed/feedback?${params.toString()}`;
  }
  
  // Setup event listeners
  function setupEventListeners() {
    // Handle iframe messages
    window.addEventListener("message", handleIframeMessage);
    
    // Handle responsive design
    window.addEventListener("resize", handleResponsiveDesign);
    
    // Handle page visibility
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Handle escape key
    document.addEventListener('keydown', handleKeydown);
  }
  
  // Handle iframe messages
  function handleIframeMessage(event) {
    if (!iframe || event.source !== iframe.contentWindow) return;
    
    const { type, data } = event.data;
    
    switch (type) {
      case "FEEDBACK_WIDGET_READY":
        console.log("AI Feedback Widget ready");
        break;
        
      case "FEEDBACK_SUBMITTED":
        console.log("Feedback submitted:", data);
        hasSubmittedFeedback = true;
        closeFeedbackModal();
        showThankYouMessage();
        trackEvent('feedback_submitted', data);
        break;
        
      case "FEEDBACK_CLOSED":
        closeFeedbackModal();
        break;
        
      case "FEEDBACK_ERROR":
        console.error("AI Feedback Widget error:", data);
        trackEvent('feedback_error', data);
        break;
        
      case "FEEDBACK_STEP_CHANGED":
        trackEvent('feedback_step_changed', data);
        break;
        
      case "FEEDBACK_RATING_SELECTED":
        trackEvent('feedback_rating_selected', data);
        break;
    }
  }
  
  // Show thank you message
  function showThankYouMessage() {
    const thankYouButton = document.createElement("div");
    thankYouButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
      <span>Thank you!</span>
    `;
    
    // Replace button content temporarily
    const originalHTML = feedbackButton.innerHTML;
    feedbackButton.innerHTML = thankYouButton.innerHTML;
    feedbackButton.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
    
    setTimeout(() => {
      if (config.hideAfterSubmit) {
        hideFeedbackWidget();
      } else {
        feedbackButton.innerHTML = originalHTML;
        feedbackButton.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      }
    }, 3000);
  }
  
  // Handle responsive design
  function handleResponsiveDesign() {
    if (!iframe) return;
    
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.borderRadius = '0';
      iframe.style.maxWidth = '100%';
      iframe.style.maxHeight = '100%';
    } else {
      iframe.style.width = '450px';
      iframe.style.height = '600px';
      iframe.style.borderRadius = '16px';
      iframe.style.maxWidth = '95vw';
      iframe.style.maxHeight = '95vh';
    }
  }
  
  // Handle visibility change
  function handleVisibilityChange() {
    if (document.hidden) {
      trackEvent('page_hidden');
    } else {
      trackEvent('page_visible');
    }
  }
  
  // Handle keydown events
  function handleKeydown(event) {
    if (event.key === 'Escape' && isVisible) {
      closeFeedbackModal();
    }
  }
  
  // Check for existing feedback
  function checkExistingFeedback() {
    const lastFeedback = localStorage.getItem('ai_feedback_last_submission');
    if (lastFeedback) {
      const lastSubmission = JSON.parse(lastFeedback);
      const daysSinceLastFeedback = (Date.now() - lastSubmission.timestamp) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastFeedback < 7) { // Don't show for a week
        hasSubmittedFeedback = true;
        if (config.hideAfterSubmit) {
          hideFeedbackWidget();
        }
      }
    }
  }
  
  // Track events
  function trackEvent(eventName, data = {}) {
    try {
      const eventData = {
        embedId: config.embedId,
        sessionId: sessionId,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...data
      };
      
      // Send to parent app for analytics
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'FEEDBACK_ANALYTICS',
          event: eventName,
          data: eventData
        }, '*');
      }
      
      // Also store locally for debugging
      console.log('Feedback Event:', eventName, eventData);
    } catch (error) {
      console.error('Error tracking feedback event:', error);
    }
  }
  
  // Public API
  window.AIFeedbackWidget = {
    init: init,
    open: openFeedbackModal,
    close: closeFeedbackModal,
    show: showFeedbackWidget,
    hide: hideFeedbackWidget,
    isVisible: () => isVisible,
    hasSubmitted: () => hasSubmittedFeedback,
    getSessionId: () => sessionId
  };
  
  // Auto-initialize if embed ID is provided in script tag
  function autoInit() {
    const script = document.currentScript || document.querySelector('script[src*="feedback-widget.js"]');
    if (script) {
      const embedId = script.getAttribute('data-embed-id');
      const containerId = script.getAttribute('data-container-id');
      
      if (embedId) {
        init({
          embedId: embedId,
          containerId: containerId || 'body'
        });
      }
    }
  }
  
  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
  
})(); 