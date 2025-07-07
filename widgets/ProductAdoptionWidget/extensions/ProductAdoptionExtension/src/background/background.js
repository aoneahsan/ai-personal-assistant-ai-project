// Background service worker for ProductAdoption Tour Creator Extension

// API Configuration
const API_BASE_URL = 'https://api.productadoption.com/v1';

// State management
let authToken = null;
let currentUser = null;

// Initialize extension
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.local.set({
      settings: {
        apiUrl: API_BASE_URL,
        autoSave: true,
        theme: 'light',
        shortcuts: {
          toggleCreator: 'Ctrl+Shift+T',
          saveStep: 'Ctrl+S',
          preview: 'Ctrl+P'
        }
      }
    });

    // Open welcome page
    chrome.tabs.create({
      url: 'https://productadoption.com/welcome-extension'
    });
  }
});

// Handle authentication
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'AUTH_SUCCESS':
      handleAuthSuccess(message.token, message.user);
      break;
    case 'SAVE_TOUR_API':
      saveTourToAPI(message.tour).then(sendResponse);
      return true; // Keep channel open for async response
    case 'GET_TOURS':
      getToursFromAPI().then(sendResponse);
      return true;
    case 'DELETE_TOUR':
      deleteTourFromAPI(message.tourId).then(sendResponse);
      return true;
    case 'PREVIEW_TOUR':
      handlePreviewTour(sender.tab.id);
      break;
    case 'SAVE_TOUR':
      handleSaveTour(sender.tab.id);
      break;
    case 'CANCEL_TOUR':
      handleCancelTour(sender.tab.id);
      break;
  }
});

// Authentication handling
async function handleAuthSuccess(token, user) {
  authToken = token;
  currentUser = user;
  
  // Store in local storage
  await chrome.storage.local.set({
    authToken: token,
    currentUser: user
  });
  
  // Update extension icon
  chrome.action.setBadgeText({ text: '✓' });
  chrome.action.setBadgeBackgroundColor({ color: '#28a745' });
  
  // Notify all tabs
  const tabs = await chrome.tabs.query({});
  tabs.forEach(tab => {
    chrome.tabs.sendMessage(tab.id, {
      type: 'AUTH_STATUS_CHANGED',
      isAuthenticated: true,
      user: user
    }).catch(() => {}); // Ignore errors for tabs without content script
  });
}

// API Communication
async function saveTourToAPI(tour) {
  if (!authToken) {
    throw new Error('Not authenticated');
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/tours`, {
      method: tour.id ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(tour)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const savedTour = await response.json();
    
    // Update local storage
    const tours = await getStoredTours();
    const index = tours.findIndex(t => t.id === savedTour.id);
    if (index >= 0) {
      tours[index] = savedTour;
    } else {
      tours.push(savedTour);
    }
    await chrome.storage.local.set({ tours });
    
    // Update recent tours
    await updateRecentTours(savedTour);
    
    return { success: true, tour: savedTour };
  } catch (error) {
    console.error('Error saving tour to API:', error);
    return { success: false, error: error.message };
  }
}

async function getToursFromAPI() {
  if (!authToken) {
    throw new Error('Not authenticated');
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/tours`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const tours = await response.json();
    
    // Update local storage
    await chrome.storage.local.set({ tours });
    
    return { success: true, tours };
  } catch (error) {
    console.error('Error fetching tours from API:', error);
    return { success: false, error: error.message };
  }
}

async function deleteTourFromAPI(tourId) {
  if (!authToken) {
    throw new Error('Not authenticated');
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/tours/${tourId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    // Update local storage
    const tours = await getStoredTours();
    const filteredTours = tours.filter(t => t.id !== tourId);
    await chrome.storage.local.set({ tours: filteredTours });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting tour from API:', error);
    return { success: false, error: error.message };
  }
}

// Helper functions
async function getStoredTours() {
  const result = await chrome.storage.local.get('tours');
  return result.tours || [];
}

async function updateRecentTours(tour) {
  const result = await chrome.storage.local.get('recentTours');
  let recentTours = result.recentTours || [];
  
  // Remove if already exists
  recentTours = recentTours.filter(t => t.id !== tour.id);
  
  // Add to beginning
  recentTours.unshift({
    id: tour.id,
    name: tour.name,
    steps: tour.steps.length,
    updatedAt: tour.updatedAt
  });
  
  // Keep only last 10
  recentTours = recentTours.slice(0, 10);
  
  await chrome.storage.local.set({ recentTours });
}

// Tab communication
async function handlePreviewTour(tabId) {
  chrome.tabs.sendMessage(tabId, {
    type: 'PREVIEW_ACTIVE_TOUR'
  });
}

async function handleSaveTour(tabId) {
  chrome.tabs.sendMessage(tabId, {
    type: 'SAVE_ACTIVE_TOUR'
  });
}

async function handleCancelTour(tabId) {
  chrome.tabs.sendMessage(tabId, {
    type: 'CANCEL_ACTIVE_TOUR'
  });
}

// Context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'create-tour-step',
    title: 'Add to ProductAdoption Tour',
    contexts: ['all']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'create-tour-step') {
    chrome.tabs.sendMessage(tab.id, {
      type: 'ADD_ELEMENT_TO_TOUR',
      data: {
        pageUrl: info.pageUrl,
        selectionText: info.selectionText
      }
    });
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Toggle tour creator
  chrome.tabs.sendMessage(tab.id, {
    type: 'TOGGLE_TOUR_CREATOR'
  }).catch(() => {
    // If content script not loaded, inject it
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['src/content/content.js']
    });
  });
});

// WebRequest handling for API integration
chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    // Add custom headers for ProductAdoption API requests
    if (details.url.startsWith(API_BASE_URL)) {
      const headers = details.requestHeaders || [];
      headers.push({
        name: 'X-Extension-Version',
        value: chrome.runtime.getManifest().version
      });
      return { requestHeaders: headers };
    }
  },
  { urls: [`${API_BASE_URL}/*`] },
  ['blocking', 'requestHeaders']
);

// Handle authentication from web app
chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.url.includes('app.productadoption.com/auth/extension/success')) {
    // Extract token from URL
    const url = new URL(details.url);
    const token = url.searchParams.get('token');
    const userData = url.searchParams.get('user');
    
    if (token && userData) {
      const user = JSON.parse(decodeURIComponent(userData));
      handleAuthSuccess(token, user);
      
      // Close the auth tab
      chrome.tabs.remove(details.tabId);
      
      // Show success notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: '/public/icons/icon-128.png',
        title: 'Authentication Successful',
        message: `Welcome back, ${user.name}!`
      });
    }
  }
});

// Check auth status on startup
chrome.runtime.onStartup.addListener(async () => {
  const result = await chrome.storage.local.get(['authToken', 'currentUser']);
  if (result.authToken) {
    authToken = result.authToken;
    currentUser = result.currentUser;
    chrome.action.setBadgeText({ text: '✓' });
    chrome.action.setBadgeBackgroundColor({ color: '#28a745' });
  }
});