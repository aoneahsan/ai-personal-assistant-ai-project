// Options page script for ProductAdoption Extension

class OptionsManager {
  constructor() {
    this.settings = {};
    this.originalSettings = {};
    this.init();
  }

  async init() {
    // Load current settings
    await this.loadSettings();
    
    // Initialize UI
    this.initializeUI();
    
    // Bind event handlers
    this.bindEvents();
    
    // Update UI with current values
    this.updateUI();
  }

  async loadSettings() {
    const result = await chrome.storage.local.get(['settings', 'authToken', 'currentUser', 'tours']);
    
    this.settings = result.settings || {
      apiUrl: 'https://api.productadoption.com/v1',
      autoSave: true,
      theme: 'light',
      shortcuts: {
        toggleCreator: 'Ctrl+Shift+T',
        saveStep: 'Ctrl+S',
        preview: 'Ctrl+P'
      }
    };
    
    this.originalSettings = JSON.parse(JSON.stringify(this.settings));
    this.authToken = result.authToken;
    this.currentUser = result.currentUser;
    this.tours = result.tours || [];
  }

  initializeUI() {
    // Set version
    document.getElementById('version').textContent = chrome.runtime.getManifest().version;
    
    // Set tour count
    document.getElementById('tourCount').textContent = this.tours.length;
  }

  bindEvents() {
    // Account
    document.getElementById('connectBtn').addEventListener('click', () => this.handleConnect());
    document.getElementById('disconnectBtn').addEventListener('click', () => this.handleDisconnect());
    
    // Settings inputs
    document.getElementById('apiUrl').addEventListener('input', (e) => {
      this.settings.apiUrl = e.target.value;
    });
    
    document.getElementById('autoSave').addEventListener('change', (e) => {
      this.settings.autoSave = e.target.checked;
    });
    
    document.getElementById('theme').addEventListener('change', (e) => {
      this.settings.theme = e.target.value;
    });
    
    // Keyboard shortcuts
    const shortcutInputs = ['shortcutToggle', 'shortcutSave', 'shortcutPreview'];
    shortcutInputs.forEach(id => {
      const input = document.getElementById(id);
      input.addEventListener('click', () => this.recordShortcut(input));
    });
    
    // Data management
    document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
    document.getElementById('importBtn').addEventListener('click', () => this.importData());
    document.getElementById('importFile').addEventListener('change', (e) => this.handleImport(e));
    document.getElementById('clearDataBtn').addEventListener('click', () => this.clearData());
    
    // Save and reset
    document.getElementById('saveBtn').addEventListener('click', () => this.saveSettings());
    document.getElementById('resetBtn').addEventListener('click', () => this.resetSettings());
  }

  updateUI() {
    // Account status
    if (this.authToken && this.currentUser) {
      document.getElementById('authStatus').classList.add('connected');
      document.getElementById('userEmail').textContent = this.currentUser.email;
      document.getElementById('connectBtn').style.display = 'none';
      document.getElementById('disconnectBtn').style.display = 'inline-block';
    } else {
      document.getElementById('authStatus').classList.remove('connected');
      document.getElementById('userEmail').textContent = 'Not connected';
      document.getElementById('connectBtn').style.display = 'inline-block';
      document.getElementById('disconnectBtn').style.display = 'none';
    }
    
    // Settings
    document.getElementById('apiUrl').value = this.settings.apiUrl;
    document.getElementById('autoSave').checked = this.settings.autoSave;
    document.getElementById('theme').value = this.settings.theme;
    
    // Shortcuts
    document.getElementById('shortcutToggle').value = this.settings.shortcuts.toggleCreator;
    document.getElementById('shortcutSave').value = this.settings.shortcuts.saveStep;
    document.getElementById('shortcutPreview').value = this.settings.shortcuts.preview;
  }

  async handleConnect() {
    chrome.tabs.create({
      url: 'https://app.productadoption.com/auth/extension'
    });
    
    // Listen for auth completion
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'AUTH_SUCCESS') {
        this.authToken = message.token;
        this.currentUser = message.user;
        this.updateUI();
        this.showToast('Successfully connected!', 'success');
      }
    });
  }

  async handleDisconnect() {
    if (confirm('Are you sure you want to disconnect your account?')) {
      await chrome.storage.local.remove(['authToken', 'currentUser']);
      this.authToken = null;
      this.currentUser = null;
      this.updateUI();
      this.showToast('Account disconnected', 'success');
    }
  }

  recordShortcut(input) {
    input.classList.add('recording');
    input.value = 'Press keys...';
    
    const handleKeydown = (e) => {
      e.preventDefault();
      
      const keys = [];
      if (e.ctrlKey) keys.push('Ctrl');
      if (e.altKey) keys.push('Alt');
      if (e.shiftKey) keys.push('Shift');
      if (e.metaKey) keys.push('Cmd');
      
      if (e.key && !['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
        keys.push(e.key.toUpperCase());
      }
      
      if (keys.length > 1) {
        const shortcut = keys.join('+');
        input.value = shortcut;
        
        // Update settings
        const shortcutKey = input.id.replace('shortcut', '').toLowerCase();
        const keyMap = {
          'toggle': 'toggleCreator',
          'save': 'saveStep',
          'preview': 'preview'
        };
        this.settings.shortcuts[keyMap[shortcutKey]] = shortcut;
        
        input.classList.remove('recording');
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    
    document.addEventListener('keydown', handleKeydown);
    
    // Cancel recording on click outside
    setTimeout(() => {
      document.addEventListener('click', (e) => {
        if (e.target !== input) {
          input.classList.remove('recording');
          input.value = this.settings.shortcuts[
            input.id === 'shortcutToggle' ? 'toggleCreator' :
            input.id === 'shortcutSave' ? 'saveStep' : 'preview'
          ];
          document.removeEventListener('keydown', handleKeydown);
        }
      }, { once: true });
    }, 100);
  }

  async exportData() {
    const data = {
      version: chrome.runtime.getManifest().version,
      exportDate: new Date().toISOString(),
      settings: this.settings,
      tours: this.tours
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `productadoption-export-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    this.showToast('Data exported successfully', 'success');
  }

  importData() {
    document.getElementById('importFile').click();
  }

  async handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!data.version || !data.tours) {
        throw new Error('Invalid import file');
      }
      
      // Import settings
      if (data.settings) {
        this.settings = { ...this.settings, ...data.settings };
      }
      
      // Import tours
      if (data.tours && Array.isArray(data.tours)) {
        const existingIds = new Set(this.tours.map(t => t.id));
        const newTours = data.tours.filter(t => !existingIds.has(t.id));
        this.tours = [...this.tours, ...newTours];
        await chrome.storage.local.set({ tours: this.tours });
      }
      
      // Update UI
      this.updateUI();
      document.getElementById('tourCount').textContent = this.tours.length;
      
      this.showToast(`Imported ${data.tours.length} tours successfully`, 'success');
    } catch (error) {
      console.error('Import error:', error);
      this.showToast('Failed to import data. Please check the file format.', 'error');
    }
    
    // Reset file input
    e.target.value = '';
  }

  async clearData() {
    if (confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
      if (confirm('This will delete all tours and settings. Are you absolutely sure?')) {
        await chrome.storage.local.clear();
        this.showToast('All data cleared. Reloading...', 'success');
        setTimeout(() => location.reload(), 1500);
      }
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.local.set({ settings: this.settings });
      this.originalSettings = JSON.parse(JSON.stringify(this.settings));
      this.showToast('Settings saved successfully', 'success');
      
      // Notify all tabs about settings change
      const tabs = await chrome.tabs.query({});
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'SETTINGS_UPDATED',
          settings: this.settings
        }).catch(() => {}); // Ignore errors
      });
    } catch (error) {
      console.error('Save error:', error);
      this.showToast('Failed to save settings', 'error');
    }
  }

  async resetSettings() {
    if (confirm('Reset all settings to defaults?')) {
      this.settings = {
        apiUrl: 'https://api.productadoption.com/v1',
        autoSave: true,
        theme: 'light',
        shortcuts: {
          toggleCreator: 'Ctrl+Shift+T',
          saveStep: 'Ctrl+S',
          preview: 'Ctrl+P'
        }
      };
      
      await this.saveSettings();
      this.updateUI();
    }
  }

  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

// Initialize options manager
document.addEventListener('DOMContentLoaded', () => {
  new OptionsManager();
});