(function() {
  'use strict';

  // Prevent multiple initializations
  if (window.AIChatWidget) {
    return;
  }

  const AIChatWidget = {
    version: '1.0.0',
    instances: {},
    
    // Widget configuration
    config: {
      baseUrl: '',
      embedId: '',
      containerId: '',
      userId: null,
      userMetadata: {},
      debug: false
    },

    // Initialize the widget
    init: function(options) {
      // Merge options with defaults
      this.config = Object.assign({}, this.config, options);
      
      if (!this.config.embedId) {
        this.error('embedId is required');
        return;
      }
      
      if (!this.config.containerId) {
        this.error('containerId is required');
        return;
      }
      
      this.log('Initializing widget with config:', this.config);
      
      // Check if container exists
      const container = document.getElementById(this.config.containerId);
      if (!container) {
        this.error('Container element not found:', this.config.containerId);
        return;
      }
      
      // Initialize the widget
      this.createWidget(container);
    },

    // Create the widget
    createWidget: function(container) {
      const widgetId = this.config.embedId;
      
      // Prevent duplicate widgets
      if (this.instances[widgetId]) {
        this.log('Widget already exists for embed:', widgetId);
        return;
      }
      
      // Create widget wrapper
      const widgetWrapper = document.createElement('div');
      widgetWrapper.id = 'ai-chat-widget-wrapper-' + widgetId;
      widgetWrapper.style.cssText = `
        position: fixed;
        z-index: 999999;
        bottom: 20px;
        right: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
      
      // Add the widget to the container
      container.appendChild(widgetWrapper);
      
      // Create the chat widget
      this.createChatWidget(widgetWrapper);
      
      // Store the instance
      this.instances[widgetId] = {
        container: container,
        wrapper: widgetWrapper,
        config: this.config
      };
      
      this.log('Widget created successfully');
    },

    // Create the actual chat widget
    createChatWidget: function(wrapper) {
      const { embedId, baseUrl, userId, userMetadata } = this.config;
      
      // Widget state
      let isOpen = false;
      let isMinimized = false;
      let hasUnreadMessages = false;
      let messages = [];
      let currentMessage = '';
      let conversationId = null;
      let visitorId = null;
      
      // Create toggle button
      const toggleButton = document.createElement('button');
      toggleButton.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
      `;
      toggleButton.style.cssText = `
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: none;
        background: #3b82f6;
        color: white;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        position: relative;
      `;
      
      // Create chat window
      const chatWindow = document.createElement('div');
      chatWindow.style.cssText = `
        width: 350px;
        height: 500px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        display: none;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid rgba(0, 0, 0, 0.1);
        position: relative;
        bottom: 80px;
        right: 0;
      `;
      
      // Create chat header
      const chatHeader = document.createElement('div');
      chatHeader.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        background: #3b82f6;
        color: white;
        min-height: 60px;
        box-sizing: border-box;
      `;
      
      chatHeader.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); display: flex; align-items: center; justify-content: center; font-weight: bold;">
            C
          </div>
          <div>
            <h4 style="margin: 0; font-size: 16px; font-weight: 600;">Chat Support</h4>
            <span style="font-size: 12px; opacity: 0.9;">Online</span>
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="minimize-btn" style="background: transparent; border: none; color: white; padding: 8px; cursor: pointer; border-radius: 4px;">−</button>
          <button id="close-btn" style="background: transparent; border: none; color: white; padding: 8px; cursor: pointer; border-radius: 4px;">×</button>
        </div>
      `;
      
      // Create messages container
      const messagesContainer = document.createElement('div');
      messagesContainer.style.cssText = `
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        background: white;
      `;
      
      // Create message input
      const messageInput = document.createElement('div');
      messageInput.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 16px 20px;
        background: white;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
      `;
      
      const inputField = document.createElement('input');
      inputField.type = 'text';
      inputField.placeholder = 'Type your message...';
      inputField.style.cssText = `
        flex: 1;
        border: 1px solid rgba(0, 0, 0, 0.2);
        border-radius: 20px;
        padding: 10px 16px;
        font-size: 14px;
        outline: none;
      `;
      
      const sendButton = document.createElement('button');
      sendButton.innerHTML = '➤';
      sendButton.style.cssText = `
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        background: #3b82f6;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      `;
      
      // Assemble the chat window
      messageInput.appendChild(inputField);
      messageInput.appendChild(sendButton);
      chatWindow.appendChild(chatHeader);
      chatWindow.appendChild(messagesContainer);
      chatWindow.appendChild(messageInput);
      
      // Add elements to wrapper
      wrapper.appendChild(toggleButton);
      wrapper.appendChild(chatWindow);
      
      // Event listeners
      toggleButton.addEventListener('click', function() {
        isOpen = !isOpen;
        chatWindow.style.display = isOpen ? 'flex' : 'none';
        isMinimized = false;
        hasUnreadMessages = false;
        updateUnreadIndicator();
      });
      
      const minimizeBtn = chatHeader.querySelector('#minimize-btn');
      const closeBtn = chatHeader.querySelector('#close-btn');
      
      minimizeBtn.addEventListener('click', function() {
        isMinimized = !isMinimized;
        chatWindow.style.height = isMinimized ? '60px' : '500px';
        messagesContainer.style.display = isMinimized ? 'none' : 'block';
        messageInput.style.display = isMinimized ? 'none' : 'flex';
      });
      
      closeBtn.addEventListener('click', function() {
        isOpen = false;
        chatWindow.style.display = 'none';
      });
      
      // Send message functionality
      const sendMessage = function() {
        const message = inputField.value.trim();
        if (!message) return;
        
        // Add message to UI
        addMessageToUI(message, 'visitor');
        inputField.value = '';
        
        // Send to server (simulate for now)
        setTimeout(() => {
          addMessageToUI('Thank you for your message! We will get back to you soon.', 'owner');
        }, 1000);
      };
      
      sendButton.addEventListener('click', sendMessage);
      inputField.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          sendMessage();
        }
      });
      
      // Add message to UI
      function addMessageToUI(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
          margin-bottom: 16px;
          display: flex;
          justify-content: ${sender === 'visitor' ? 'flex-end' : 'flex-start'};
        `;
        
        const messageContent = document.createElement('div');
        messageContent.style.cssText = `
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 18px;
          background: ${sender === 'visitor' ? '#3b82f6' : '#f8fafc'};
          color: ${sender === 'visitor' ? 'white' : '#1f2937'};
          word-wrap: break-word;
          ${sender === 'owner' ? 'border: 1px solid rgba(0, 0, 0, 0.1);' : ''}
        `;
        
        messageContent.innerHTML = `
          <p style="margin: 0; line-height: 1.4; font-size: 14px;">${text}</p>
          <span style="font-size: 10px; opacity: 0.7; display: block; margin-top: 4px;">
            ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        `;
        
        messageDiv.appendChild(messageContent);
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Show unread indicator if widget is closed or minimized
        if (!isOpen || isMinimized) {
          if (sender === 'owner') {
            hasUnreadMessages = true;
            updateUnreadIndicator();
          }
        }
      }
      
      // Update unread indicator
      function updateUnreadIndicator() {
        let indicator = toggleButton.querySelector('.unread-indicator');
        
        if (hasUnreadMessages && !indicator) {
          indicator = document.createElement('span');
          indicator.className = 'unread-indicator';
          indicator.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            width: 12px;
            height: 12px;
            background: #ff4444;
            border-radius: 50%;
            border: 2px solid white;
            animation: pulse 2s infinite;
          `;
          toggleButton.appendChild(indicator);
        } else if (!hasUnreadMessages && indicator) {
          indicator.remove();
        }
      }
      
      // Initialize with welcome message
      setTimeout(() => {
        addMessageToUI('Hi! How can I help you today?', 'owner');
      }, 1000);
      
      // Generate device fingerprint for visitor ID
      visitorId = this.generateVisitorId(userId);
      
      this.log('Chat widget initialized');
    },

    // Generate visitor ID
    generateVisitorId: function(providedUserId) {
      if (providedUserId) {
        return providedUserId;
      }
      
      // Check localStorage for existing visitor ID
      const storageKey = 'ai-chat-visitor-id';
      let visitorId = localStorage.getItem(storageKey);
      
      if (!visitorId) {
        // Generate fingerprint-based ID
        const fingerprint = {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          screenRes: screen.width + 'x' + screen.height,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          timestamp: Date.now()
        };
        
        // Simple hash function
        const hash = this.simpleHash(JSON.stringify(fingerprint));
        visitorId = 'visitor_' + hash;
        
        try {
          localStorage.setItem(storageKey, visitorId);
        } catch (e) {
          this.log('Failed to save visitor ID to localStorage:', e);
        }
      }
      
      return visitorId;
    },

    // Simple hash function
    simpleHash: function(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(36);
    },

    // Logging
    log: function(...args) {
      if (this.config.debug) {
        console.log('[AIChatWidget]', ...args);
      }
    },

    // Error logging
    error: function(...args) {
      console.error('[AIChatWidget]', ...args);
    },

    // Destroy widget
    destroy: function(embedId) {
      const instance = this.instances[embedId];
      if (instance) {
        instance.wrapper.remove();
        delete this.instances[embedId];
        this.log('Widget destroyed:', embedId);
      }
    },

    // Update widget configuration
    updateConfig: function(embedId, newConfig) {
      const instance = this.instances[embedId];
      if (instance) {
        instance.config = Object.assign({}, instance.config, newConfig);
        this.log('Widget config updated:', embedId);
      }
    }
  };

  // Make AIChatWidget globally available
  window.AIChatWidget = AIChatWidget;
  
  // Auto-initialize if data attributes are present
  document.addEventListener('DOMContentLoaded', function() {
    const scripts = document.querySelectorAll('script[data-ai-chat-embed-id]');
    scripts.forEach(function(script) {
      const embedId = script.getAttribute('data-ai-chat-embed-id');
      const containerId = script.getAttribute('data-ai-chat-container-id') || 'ai-chat-widget-' + embedId;
      const baseUrl = script.getAttribute('data-ai-chat-base-url') || window.location.origin;
      const userId = script.getAttribute('data-ai-chat-user-id');
      const debug = script.getAttribute('data-ai-chat-debug') === 'true';
      
      if (embedId) {
        AIChatWidget.init({
          embedId: embedId,
          containerId: containerId,
          baseUrl: baseUrl,
          userId: userId,
          debug: debug
        });
      }
    });
  });

  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }
    
    .ai-chat-widget button:hover {
      transform: scale(1.05);
    }
    
    .ai-chat-widget button:active {
      transform: scale(0.95);
    }
    
    .ai-chat-widget input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }
  `;
  document.head.appendChild(style);

})(); 