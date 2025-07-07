// Content script for ProductAdoption Tour Creator Extension

class TourCreator {
  constructor() {
    this.isActive = false;
    this.mode = null; // 'create' or 'edit'
    this.currentTour = null;
    this.selectedElements = [];
    this.overlay = null;
    this.toolbar = null;
    this.elementPicker = null;
    this.init();
  }

  init() {
    // Listen for messages from popup and background
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sendResponse);
      return true; // Keep the message channel open for async responses
    });

    // Inject styles
    this.injectStyles();
  }

  handleMessage(message, sendResponse) {
    switch (message.type) {
      case 'START_TOUR_CREATION':
        this.startTourCreation(message.mode, message.tourId);
        sendResponse({ success: true });
        break;
      case 'STOP_TOUR_CREATION':
        this.stopTourCreation();
        sendResponse({ success: true });
        break;
      case 'LOAD_TOUR':
        this.loadTour(message.tourId);
        sendResponse({ success: true });
        break;
      case 'GET_SELECTED_ELEMENT':
        sendResponse({ element: this.getSelectedElementData() });
        break;
      default:
        sendResponse({ error: 'Unknown message type' });
    }
  }

  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .pa-tour-creator-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 999998;
        pointer-events: none;
      }

      .pa-element-highlight {
        position: absolute;
        border: 2px solid #007bff;
        background: rgba(0, 123, 255, 0.1);
        pointer-events: none;
        transition: all 0.2s ease;
        z-index: 999999;
      }

      .pa-element-highlight.selected {
        border-color: #28a745;
        background: rgba(40, 167, 69, 0.1);
      }

      .pa-tour-toolbar {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        padding: 16px;
        z-index: 1000000;
        min-width: 300px;
      }

      .pa-toolbar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }

      .pa-toolbar-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }

      .pa-toolbar-close {
        background: none;
        border: none;
        font-size: 20px;
        color: #666;
        cursor: pointer;
      }

      .pa-toolbar-section {
        margin-bottom: 16px;
      }

      .pa-toolbar-label {
        font-size: 12px;
        font-weight: 500;
        color: #666;
        margin-bottom: 8px;
      }

      .pa-toolbar-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }

      .pa-toolbar-textarea {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        resize: vertical;
        min-height: 60px;
      }

      .pa-toolbar-actions {
        display: flex;
        gap: 8px;
      }

      .pa-btn {
        flex: 1;
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .pa-btn-primary {
        background: #007bff;
        color: #fff;
      }

      .pa-btn-primary:hover {
        background: #0056b3;
      }

      .pa-btn-secondary {
        background: #6c757d;
        color: #fff;
      }

      .pa-btn-secondary:hover {
        background: #5a6268;
      }

      .pa-element-picker-mode {
        cursor: crosshair !important;
      }

      .pa-element-picker-mode * {
        cursor: crosshair !important;
      }

      .pa-step-indicator {
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        background: #007bff;
        color: #fff;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
      }

      .pa-tour-preview {
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        padding: 16px;
        z-index: 1000000;
        max-width: 300px;
      }

      .pa-preview-title {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .pa-preview-steps {
        font-size: 12px;
        color: #666;
      }

      .pa-preview-step {
        padding: 8px;
        margin-bottom: 4px;
        background: #f8f9fa;
        border-radius: 4px;
        cursor: pointer;
      }

      .pa-preview-step.active {
        background: #e9ecef;
        font-weight: 500;
      }
    `;
    document.head.appendChild(style);
  }

  startTourCreation(mode, tourId) {
    this.isActive = true;
    this.mode = mode;
    
    // Create overlay
    this.createOverlay();
    
    // Create toolbar
    this.createToolbar();
    
    // Initialize element picker
    this.initElementPicker();
    
    // Load tour if editing
    if (mode === 'edit' && tourId) {
      this.loadTour(tourId);
    } else {
      this.currentTour = {
        id: this.generateId(),
        name: 'New Tour',
        steps: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    // Show notification
    this.showNotification('Tour creation mode activated. Click on elements to add them to your tour.');
  }

  stopTourCreation() {
    this.isActive = false;
    this.mode = null;
    
    // Remove overlay and toolbar
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    
    if (this.toolbar) {
      this.toolbar.remove();
      this.toolbar = null;
    }
    
    // Clean up element picker
    this.cleanupElementPicker();
    
    // Clear highlights
    this.clearHighlights();
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'pa-tour-creator-overlay';
    document.body.appendChild(this.overlay);
  }

  createToolbar() {
    this.toolbar = document.createElement('div');
    this.toolbar.className = 'pa-tour-toolbar';
    this.toolbar.innerHTML = `
      <div class="pa-toolbar-header">
        <div class="pa-toolbar-title">Tour Creator</div>
        <button class="pa-toolbar-close" id="paCloseToolbar">&times;</button>
      </div>
      
      <div class="pa-toolbar-section">
        <div class="pa-toolbar-label">Tour Name</div>
        <input type="text" class="pa-toolbar-input" id="paTourName" placeholder="Enter tour name">
      </div>
      
      <div class="pa-toolbar-section" id="paStepSection" style="display: none;">
        <div class="pa-toolbar-label">Step Title</div>
        <input type="text" class="pa-toolbar-input" id="paStepTitle" placeholder="Enter step title">
        
        <div class="pa-toolbar-label" style="margin-top: 12px;">Step Content</div>
        <textarea class="pa-toolbar-textarea" id="paStepContent" placeholder="Enter step description"></textarea>
      </div>
      
      <div class="pa-toolbar-section">
        <div class="pa-toolbar-label">Current Steps: <span id="paStepCount">0</span></div>
      </div>
      
      <div class="pa-toolbar-actions">
        <button class="pa-btn pa-btn-primary" id="paAddStep">Add Step</button>
        <button class="pa-btn pa-btn-secondary" id="paPreviewTour">Preview</button>
        <button class="pa-btn pa-btn-primary" id="paSaveTour">Save Tour</button>
      </div>
    `;
    
    document.body.appendChild(this.toolbar);
    
    // Bind toolbar events
    this.bindToolbarEvents();
  }

  bindToolbarEvents() {
    document.getElementById('paCloseToolbar').addEventListener('click', () => {
      if (confirm('Are you sure you want to exit? Unsaved changes will be lost.')) {
        this.stopTourCreation();
      }
    });
    
    document.getElementById('paTourName').addEventListener('input', (e) => {
      this.currentTour.name = e.target.value;
    });
    
    document.getElementById('paAddStep').addEventListener('click', () => {
      this.enableElementPicker();
    });
    
    document.getElementById('paPreviewTour').addEventListener('click', () => {
      this.previewTour();
    });
    
    document.getElementById('paSaveTour').addEventListener('click', () => {
      this.saveTour();
    });
  }

  initElementPicker() {
    this.elementPicker = {
      active: false,
      hoveredElement: null,
      selectedElement: null
    };
  }

  enableElementPicker() {
    this.elementPicker.active = true;
    document.body.classList.add('pa-element-picker-mode');
    
    // Add event listeners
    document.addEventListener('mouseover', this.handleMouseOver);
    document.addEventListener('mouseout', this.handleMouseOut);
    document.addEventListener('click', this.handleElementClick);
    
    this.showNotification('Click on an element to add it as a tour step.');
  }

  disableElementPicker() {
    this.elementPicker.active = false;
    document.body.classList.remove('pa-element-picker-mode');
    
    // Remove event listeners
    document.removeEventListener('mouseover', this.handleMouseOver);
    document.removeEventListener('mouseout', this.handleMouseOut);
    document.removeEventListener('click', this.handleElementClick);
  }

  handleMouseOver = (e) => {
    if (!this.elementPicker.active) return;
    
    e.stopPropagation();
    e.preventDefault();
    
    // Skip if it's our own UI elements
    if (e.target.closest('.pa-tour-toolbar') || 
        e.target.closest('.pa-element-highlight')) {
      return;
    }
    
    this.highlightElement(e.target);
    this.elementPicker.hoveredElement = e.target;
  }

  handleMouseOut = (e) => {
    if (!this.elementPicker.active) return;
    
    e.stopPropagation();
    e.preventDefault();
    
    if (this.elementPicker.hoveredElement) {
      this.unhighlightElement(this.elementPicker.hoveredElement);
      this.elementPicker.hoveredElement = null;
    }
  }

  handleElementClick = (e) => {
    if (!this.elementPicker.active) return;
    
    e.stopPropagation();
    e.preventDefault();
    
    // Skip if it's our own UI elements
    if (e.target.closest('.pa-tour-toolbar') || 
        e.target.closest('.pa-element-highlight')) {
      return;
    }
    
    this.selectElement(e.target);
  }

  highlightElement(element) {
    const rect = element.getBoundingClientRect();
    const highlight = document.createElement('div');
    highlight.className = 'pa-element-highlight';
    highlight.style.top = `${rect.top + window.scrollY}px`;
    highlight.style.left = `${rect.left + window.scrollX}px`;
    highlight.style.width = `${rect.width}px`;
    highlight.style.height = `${rect.height}px`;
    highlight.dataset.elementId = this.getElementId(element);
    
    this.overlay.appendChild(highlight);
  }

  unhighlightElement(element) {
    const elementId = this.getElementId(element);
    const highlight = this.overlay.querySelector(`[data-element-id="${elementId}"]`);
    if (highlight && !highlight.classList.contains('selected')) {
      highlight.remove();
    }
  }

  selectElement(element) {
    this.elementPicker.selectedElement = element;
    
    // Mark highlight as selected
    const elementId = this.getElementId(element);
    const highlight = this.overlay.querySelector(`[data-element-id="${elementId}"]`);
    if (highlight) {
      highlight.classList.add('selected');
    }
    
    // Show step details section
    document.getElementById('paStepSection').style.display = 'block';
    
    // Disable element picker
    this.disableElementPicker();
    
    // Focus on step title input
    document.getElementById('paStepTitle').focus();
    
    // Add save step handler
    this.addSaveStepHandler(element);
  }

  addSaveStepHandler(element) {
    const saveHandler = () => {
      const title = document.getElementById('paStepTitle').value;
      const content = document.getElementById('paStepContent').value;
      
      if (!title || !content) {
        alert('Please enter both title and content for the step.');
        return;
      }
      
      // Create step
      const step = {
        id: this.generateId(),
        title: title,
        content: content,
        target: this.getElementSelector(element),
        position: 'bottom',
        createdAt: new Date().toISOString()
      };
      
      // Add to tour
      this.currentTour.steps.push(step);
      
      // Update step count
      document.getElementById('paStepCount').textContent = this.currentTour.steps.length;
      
      // Clear form
      document.getElementById('paStepTitle').value = '';
      document.getElementById('paStepContent').value = '';
      document.getElementById('paStepSection').style.display = 'none';
      
      // Show step indicator
      this.showStepIndicator(element, this.currentTour.steps.length);
      
      // Remove handler
      document.getElementById('paAddStep').removeEventListener('click', saveHandler);
      
      this.showNotification(`Step ${this.currentTour.steps.length} added successfully!`);
    };
    
    // Replace the add step button temporarily
    const addButton = document.getElementById('paAddStep');
    addButton.textContent = 'Save Step';
    addButton.removeEventListener('click', () => this.enableElementPicker());
    addButton.addEventListener('click', saveHandler);
    
    // Restore original button after saving
    const restoreButton = () => {
      addButton.textContent = 'Add Step';
      addButton.removeEventListener('click', saveHandler);
      addButton.addEventListener('click', () => this.enableElementPicker());
    };
    
    // Also restore on cancel
    document.getElementById('paCloseToolbar').addEventListener('click', restoreButton, { once: true });
  }

  showStepIndicator(element, stepNumber) {
    const rect = element.getBoundingClientRect();
    const indicator = document.createElement('div');
    indicator.className = 'pa-step-indicator';
    indicator.textContent = `Step ${stepNumber}`;
    indicator.style.top = `${rect.top + window.scrollY - 30}px`;
    indicator.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
    
    this.overlay.appendChild(indicator);
  }

  getElementSelector(element) {
    // Generate a unique selector for the element
    const id = element.id;
    if (id) {
      return `#${id}`;
    }
    
    const classes = Array.from(element.classList).filter(c => !c.startsWith('pa-'));
    if (classes.length > 0) {
      const classSelector = '.' + classes.join('.');
      const elements = document.querySelectorAll(classSelector);
      if (elements.length === 1) {
        return classSelector;
      }
    }
    
    // Fallback to nth-child selector
    let path = [];
    let current = element;
    
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      if (current.id) {
        selector = `#${current.id}`;
        path.unshift(selector);
        break;
      } else {
        const parent = current.parentElement;
        if (parent) {
          const children = Array.from(parent.children);
          const index = children.indexOf(current) + 1;
          selector += `:nth-child(${index})`;
        }
        path.unshift(selector);
      }
      current = current.parentElement;
    }
    
    return path.join(' > ');
  }

  getElementId(element) {
    // Generate a unique ID for the element
    return btoa(this.getElementSelector(element)).replace(/[^a-zA-Z0-9]/g, '');
  }

  previewTour() {
    if (this.currentTour.steps.length === 0) {
      alert('Please add at least one step before previewing.');
      return;
    }
    
    // Create preview panel
    const preview = document.createElement('div');
    preview.className = 'pa-tour-preview';
    preview.innerHTML = `
      <div class="pa-preview-title">${this.currentTour.name}</div>
      <div class="pa-preview-steps">
        ${this.currentTour.steps.map((step, index) => `
          <div class="pa-preview-step ${index === 0 ? 'active' : ''}" data-step-index="${index}">
            ${index + 1}. ${step.title}
          </div>
        `).join('')}
      </div>
    `;
    
    document.body.appendChild(preview);
    
    // Add click handlers
    preview.querySelectorAll('.pa-preview-step').forEach(stepEl => {
      stepEl.addEventListener('click', () => {
        const index = parseInt(stepEl.dataset.stepIndex);
        this.previewStep(index);
        
        // Update active state
        preview.querySelectorAll('.pa-preview-step').forEach(s => s.classList.remove('active'));
        stepEl.classList.add('active');
      });
    });
    
    // Preview first step
    this.previewStep(0);
    
    // Remove preview after 30 seconds or on click outside
    setTimeout(() => preview.remove(), 30000);
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.pa-tour-preview')) {
        preview.remove();
      }
    }, { once: true });
  }

  previewStep(index) {
    const step = this.currentTour.steps[index];
    const element = document.querySelector(step.target);
    
    if (element) {
      // Scroll to element
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Highlight element
      this.clearHighlights();
      this.highlightElement(element);
      
      // Show tooltip (using the actual widget if available)
      if (window.ProductAdoption) {
        window.ProductAdoption.showTooltip({
          target: step.target,
          title: step.title,
          content: step.content,
          position: step.position
        });
      }
    }
  }

  async saveTour() {
    if (this.currentTour.steps.length === 0) {
      alert('Please add at least one step before saving.');
      return;
    }
    
    try {
      // Save to storage
      const tours = await this.getStoredTours();
      const existingIndex = tours.findIndex(t => t.id === this.currentTour.id);
      
      if (existingIndex >= 0) {
        tours[existingIndex] = this.currentTour;
      } else {
        tours.push(this.currentTour);
      }
      
      await chrome.storage.local.set({ tours: tours });
      
      // Send to API
      chrome.runtime.sendMessage({
        type: 'SAVE_TOUR_API',
        tour: this.currentTour
      });
      
      this.showNotification('Tour saved successfully!');
      
      // Exit creation mode after a delay
      setTimeout(() => {
        this.stopTourCreation();
      }, 2000);
    } catch (error) {
      console.error('Error saving tour:', error);
      alert('Failed to save tour. Please try again.');
    }
  }

  async getStoredTours() {
    const result = await chrome.storage.local.get('tours');
    return result.tours || [];
  }

  async loadTour(tourId) {
    try {
      const tours = await this.getStoredTours();
      const tour = tours.find(t => t.id === tourId);
      
      if (tour) {
        this.currentTour = tour;
        document.getElementById('paTourName').value = tour.name;
        document.getElementById('paStepCount').textContent = tour.steps.length;
        
        // Show existing steps
        tour.steps.forEach((step, index) => {
          const element = document.querySelector(step.target);
          if (element) {
            this.highlightElement(element);
            this.showStepIndicator(element, index + 1);
          }
        });
      }
    } catch (error) {
      console.error('Error loading tour:', error);
    }
  }

  clearHighlights() {
    this.overlay.querySelectorAll('.pa-element-highlight').forEach(h => h.remove());
    this.overlay.querySelectorAll('.pa-step-indicator').forEach(i => i.remove());
  }

  cleanupElementPicker() {
    this.disableElementPicker();
    this.elementPicker = null;
  }

  showNotification(message) {
    // Simple notification - in production, use a better notification system
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: #fff;
      padding: 12px 24px;
      border-radius: 4px;
      z-index: 1000001;
      font-size: 14px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
  }

  generateId() {
    return `tour_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Initialize tour creator
const tourCreator = new TourCreator();