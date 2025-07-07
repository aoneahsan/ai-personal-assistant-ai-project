// Popup script for ProductAdoption Tour Creator Extension

class PopupManager {
  constructor() {
    this.authToken = null;
    this.currentUser = null;
    this.recentTours = [];
    this.init();
  }

  async init() {
    // Initialize UI elements
    this.elements = {
      authSection: document.getElementById('authSection'),
      mainContent: document.getElementById('mainContent'),
      statusIndicator: document.getElementById('statusIndicator'),
      statusText: document.getElementById('statusText'),
      connectBtn: document.getElementById('connectBtn'),
      createTourBtn: document.getElementById('createTourBtn'),
      editTourBtn: document.getElementById('editTourBtn'),
      activeTour: document.getElementById('activeTour'),
      tourName: document.getElementById('tourName'),
      tourSteps: document.getElementById('tourSteps'),
      tourList: document.getElementById('tourList'),
      previewBtn: document.getElementById('previewBtn'),
      saveBtn: document.getElementById('saveBtn'),
      cancelBtn: document.getElementById('cancelBtn'),
      settingsBtn: document.getElementById('settingsBtn'),
      helpBtn: document.getElementById('helpBtn')
    };

    // Bind event listeners
    this.bindEvents();

    // Check authentication status
    await this.checkAuth();

    // Load recent tours
    await this.loadRecentTours();

    // Check for active tour
    await this.checkActiveTour();
  }

  bindEvents() {
    this.elements.connectBtn.addEventListener('click', () => this.handleConnect());
    this.elements.createTourBtn.addEventListener('click', () => this.handleCreateTour());
    this.elements.editTourBtn.addEventListener('click', () => this.handleEditTour());
    this.elements.previewBtn.addEventListener('click', () => this.handlePreview());
    this.elements.saveBtn.addEventListener('click', () => this.handleSave());
    this.elements.cancelBtn.addEventListener('click', () => this.handleCancel());
    this.elements.settingsBtn.addEventListener('click', () => this.openSettings());
    this.elements.helpBtn.addEventListener('click', () => this.openHelp());
  }

  async checkAuth() {
    try {
      const result = await chrome.storage.local.get(['authToken', 'currentUser']);
      
      if (result.authToken) {
        this.authToken = result.authToken;
        this.currentUser = result.currentUser;
        this.updateAuthUI(true);
      } else {
        this.updateAuthUI(false);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      this.updateAuthUI(false);
    }
  }

  updateAuthUI(isConnected) {
    if (isConnected) {
      this.elements.statusIndicator.classList.add('connected');
      this.elements.statusText.textContent = `Connected as ${this.currentUser?.email || 'User'}`;
      this.elements.connectBtn.style.display = 'none';
      this.elements.mainContent.style.display = 'block';
    } else {
      this.elements.statusIndicator.classList.remove('connected');
      this.elements.statusText.textContent = 'Not connected';
      this.elements.connectBtn.style.display = 'block';
      this.elements.mainContent.style.display = 'none';
    }
  }

  async handleConnect() {
    try {
      // Open authentication page
      chrome.tabs.create({
        url: 'https://app.productadoption.com/auth/extension'
      });

      // Listen for authentication completion
      chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'AUTH_SUCCESS') {
          this.authToken = message.token;
          this.currentUser = message.user;
          this.updateAuthUI(true);
          this.loadRecentTours();
        }
      });
    } catch (error) {
      console.error('Error connecting:', error);
      alert('Failed to connect. Please try again.');
    }
  }

  async handleCreateTour() {
    try {
      // Get the current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Send message to content script to start tour creation
      chrome.tabs.sendMessage(tab.id, {
        type: 'START_TOUR_CREATION',
        mode: 'create'
      });

      // Close popup
      window.close();
    } catch (error) {
      console.error('Error starting tour creation:', error);
      alert('Failed to start tour creation. Please refresh the page and try again.');
    }
  }

  async handleEditTour() {
    try {
      // Show tour selector
      const tourId = await this.selectTour();
      if (!tourId) return;

      // Get the current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Send message to content script to start tour editing
      chrome.tabs.sendMessage(tab.id, {
        type: 'START_TOUR_CREATION',
        mode: 'edit',
        tourId: tourId
      });

      // Close popup
      window.close();
    } catch (error) {
      console.error('Error starting tour editing:', error);
      alert('Failed to start tour editing. Please try again.');
    }
  }

  async selectTour() {
    // Simple tour selection - in production, this would be a modal or dropdown
    const tours = this.recentTours;
    if (tours.length === 0) {
      alert('No tours available to edit.');
      return null;
    }

    const tourNames = tours.map(t => `${t.name} (${t.steps} steps)`).join('\n');
    const selection = prompt(`Select a tour to edit:\n\n${tourNames}`);
    
    if (selection) {
      const selectedTour = tours.find(t => t.name === selection.split(' (')[0]);
      return selectedTour?.id;
    }
    
    return null;
  }

  async loadRecentTours() {
    try {
      const result = await chrome.storage.local.get('recentTours');
      this.recentTours = result.recentTours || [];
      this.renderRecentTours();
    } catch (error) {
      console.error('Error loading recent tours:', error);
    }
  }

  renderRecentTours() {
    const tourList = this.elements.tourList;
    tourList.innerHTML = '';

    if (this.recentTours.length === 0) {
      tourList.innerHTML = '<li class="empty-state">No recent tours</li>';
      return;
    }

    this.recentTours.forEach(tour => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="tour-title">${tour.name}</div>
        <div class="tour-meta">${tour.steps} steps • ${this.formatDate(tour.updatedAt)}</div>
      `;
      li.addEventListener('click', () => this.loadTour(tour.id));
      tourList.appendChild(li);
    });
  }

  async checkActiveTour() {
    try {
      const result = await chrome.storage.local.get('activeTour');
      if (result.activeTour) {
        this.showActiveTour(result.activeTour);
      }
    } catch (error) {
      console.error('Error checking active tour:', error);
    }
  }

  showActiveTour(tour) {
    this.elements.activeTour.style.display = 'block';
    this.elements.tourName.textContent = tour.name;
    this.elements.tourSteps.textContent = `${tour.currentStep}/${tour.totalSteps} steps`;
  }

  async handlePreview() {
    chrome.runtime.sendMessage({ type: 'PREVIEW_TOUR' });
    window.close();
  }

  async handleSave() {
    chrome.runtime.sendMessage({ type: 'SAVE_TOUR' });
    window.close();
  }

  async handleCancel() {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      chrome.runtime.sendMessage({ type: 'CANCEL_TOUR' });
      window.close();
    }
  }

  async loadTour(tourId) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, {
      type: 'LOAD_TOUR',
      tourId: tourId
    });

    window.close();
  }

  openSettings() {
    chrome.runtime.openOptionsPage();
  }

  openHelp() {
    chrome.tabs.create({
      url: 'https://help.productadoption.com/extension'
    });
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 3600000) { // Less than 1 hour
      return `${Math.floor(diff / 60000)} min ago`;
    } else if (diff < 86400000) { // Less than 1 day
      return `${Math.floor(diff / 3600000)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}

// Initialize popup manager
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});