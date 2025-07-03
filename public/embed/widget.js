/**
 * AI Personal Assistant - Embeddable Chat Widget
 */
(function() {
  "use strict";
  
  window.AIChatWidget = window.AIChatWidget || {};
  
  let config = {
    embedId: null,
    containerId: null,
    baseUrl: null,
    userId: null,
    userMetadata: null,
    initialized: false
  };
  
  let widgetContainer = null;
  let iframe = null;
  let isVisible = false;
  
  function init(options) {
    if (config.initialized) {
      console.warn("AI Chat Widget already initialized");
      return;
    }
    
    if (!options.embedId || !options.containerId) {
      console.error("AI Chat Widget: embedId and containerId are required");
      return;
    }
    
    config = {
      ...config,
      ...options,
      baseUrl: options.baseUrl || window.location.origin,
      initialized: true
    };
    
    createWidget();
    console.log("AI Chat Widget initialized successfully");
  }
  
  function createWidget() {
    const container = document.getElementById(config.containerId);
    if (!container) {
      console.error(`AI Chat Widget: Container element with ID ${config.containerId} not found`);
      return;
    }
    
    widgetContainer = document.createElement("div");
    widgetContainer.id = "ai-chat-widget-wrapper";
    widgetContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 400px;
      height: 600px;
      max-width: 90vw;
      max-height: 90vh;
      z-index: 999999;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      background: white;
      overflow: hidden;
      transform: translateY(100%);
      transition: transform 0.3s ease;
      font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;
    `;
    
    iframe = document.createElement("iframe");
    iframe.src = buildIframeUrl();
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 12px;
    `;
    iframe.allow = "microphone; camera; geolocation";
    iframe.sandbox = "allow-same-origin allow-scripts allow-forms allow-popups allow-modals";
    
    const toggleButton = document.createElement("button");
    toggleButton.id = "ai-chat-toggle-button";
    toggleButton.innerHTML = `í²¬`;
    toggleButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      cursor: pointer;
      z-index: 1000000;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      transition: all 0.3s ease;
      font-size: 24px;
    `;
    
    toggleButton.addEventListener("click", toggleWidget);
    
    widgetContainer.appendChild(iframe);
    container.appendChild(widgetContainer);
    container.appendChild(toggleButton);
    
    window.addEventListener("resize", handleResponsiveDesign);
    window.addEventListener("message", handleIframeMessage);
  }
  
  function buildIframeUrl() {
    const params = new URLSearchParams();
    params.append("embedId", config.embedId);
    params.append("mode", "embed");
    
    if (config.userId) {
      params.append("userId", config.userId);
    }
    
    if (config.userMetadata) {
      params.append("userMetadata", JSON.stringify(config.userMetadata));
    }
    
    params.append("websiteUrl", window.location.href);
    params.append("origin", window.location.origin);
    
    return `${config.baseUrl}/embed-widget?${params.toString()}`;
  }
  
  function toggleWidget() {
    isVisible = !isVisible;
    
    if (isVisible) {
      widgetContainer.style.transform = "translateY(0)";
      document.getElementById("ai-chat-toggle-button").innerHTML = "âœ•";
    } else {
      widgetContainer.style.transform = "translateY(100%)";
      document.getElementById("ai-chat-toggle-button").innerHTML = "í²¬";
    }
  }
  
  function handleResponsiveDesign() {
    if (!widgetContainer) return;
    
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      widgetContainer.style.cssText = `
        position: fixed;
        bottom: 0;
        right: 0;
        left: 0;
        width: 100%;
        height: 100%;
        max-width: 100%;
        max-height: 100%;
        z-index: 999999;
        border-radius: 0;
        box-shadow: none;
        background: white;
        overflow: hidden;
        transform: ${isVisible ? "translateY(0)" : "translateY(100%)"};
        transition: transform 0.3s ease;
      `;
    } else {
      widgetContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 400px;
        height: 600px;
        max-width: 90vw;
        max-height: 90vh;
        z-index: 999999;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        background: white;
        overflow: hidden;
        transform: ${isVisible ? "translateY(0)" : "translateY(100%)"};
        transition: transform 0.3s ease;
      `;
    }
  }
  
  function handleIframeMessage(event) {
    if (!iframe || event.source !== iframe.contentWindow) return;
    
    const { type, data } = event.data;
    
    switch (type) {
      case "WIDGET_READY":
        console.log("AI Chat Widget ready");
        break;
      case "WIDGET_ERROR":
        console.error("AI Chat Widget error:", data);
        break;
      case "WIDGET_CLOSE":
        toggleWidget();
        break;
      case "WIDGET_RESIZE":
        if (data.height && !window.matchMedia("(max-width: 768px)").matches) {
          widgetContainer.style.height = `${Math.min(data.height, window.innerHeight * 0.9)}px`;
        }
        break;
    }
  }
  
  function autoInit() {
    const scripts = document.querySelectorAll("script[data-ai-chat-embed-id]");
    scripts.forEach(script => {
      const embedId = script.dataset.aiChatEmbedId;
      const containerId = script.dataset.aiChatContainerId || "ai-chat-widget-container";
      const baseUrl = script.dataset.aiChatBaseUrl || window.location.origin;
      const userId = script.dataset.aiChatUserId;
      
      let userMetadata = null;
      if (script.dataset.aiChatUserMetadata) {
        try {
          userMetadata = JSON.parse(script.dataset.aiChatUserMetadata);
        } catch (e) {
          console.warn("Invalid user metadata JSON:", e);
        }
      }
      
      if (!document.getElementById(containerId)) {
        const container = document.createElement("div");
        container.id = containerId;
        document.body.appendChild(container);
      }
      
      init({
        embedId,
        containerId,
        baseUrl,
        userId,
        userMetadata
      });
    });
  }
  
  window.AIChatWidget = {
    init: init,
    toggle: toggleWidget,
    show: function() {
      if (!isVisible) toggleWidget();
    },
    hide: function() {
      if (isVisible) toggleWidget();
    },
    destroy: function() {
      if (widgetContainer) {
        widgetContainer.remove();
        widgetContainer = null;
      }
      if (iframe) {
        iframe = null;
      }
      config.initialized = false;
      isVisible = false;
    }
  };
  
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInit);
  } else {
    autoInit();
  }
  
})();
