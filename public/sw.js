// Comprehensive Service Worker for AI Personal Assistant PWA
// Provides advanced PWA functionality with intelligent caching, offline support, and background sync

const CACHE_NAME = 'ai-personal-assistant-v1.2.0';
const STATIC_CACHE = 'static-cache-v1.2.0';
const DYNAMIC_CACHE = 'dynamic-cache-v1.2.0';
const API_CACHE = 'api-cache-v1.2.0';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/offline.html', // We'll need to create this
];

// API endpoints that should be cached for offline use
const CACHE_API_PATTERNS = [
  /\/api\/user\/profile/,
  /\/api\/chats/,
  /\/api\/settings/,
];

// Assets that should not be cached
const EXCLUDE_PATTERNS = [
  /\/api\/auth/,
  /\/api\/voice-calls/,
  /\/api\/real-time/,
  /\/_firebase/,
  /socket\.io/,
];

// Cache size limits
const CACHE_LIMITS = {
  [STATIC_CACHE]: 50,
  [DYNAMIC_CACHE]: 100,
  [API_CACHE]: 200,
};

// Background sync tags
const SYNC_TAGS = {
  SYNC_MESSAGES: 'sync-messages',
  SYNC_SETTINGS: 'sync-settings',
  SYNC_ANALYTICS: 'sync-analytics',
};

// Utility functions
const logSW = (message, data = null) => {
  console.log(`[SW] ${message}`, data || '');
};

const isExcluded = (url) => {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(url));
};

const isAPIRequest = (url) => {
  return CACHE_API_PATTERNS.some(pattern => pattern.test(url));
};

const cleanupCache = async (cacheName, limit) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > limit) {
    const keysToDelete = keys.slice(0, keys.length - limit);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
    logSW(`Cleaned up ${keysToDelete.length} entries from ${cacheName}`);
  }
};

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  logSW('Install event - caching static assets');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then(cache => {
        logSW('Caching static assets');
        return cache.addAll(STATIC_ASSETS).catch(err => {
          logSW('Error caching static assets:', err);
          // Continue even if some assets fail to cache
          return Promise.resolve();
        });
      }),
      
      // Initialize other caches
      caches.open(DYNAMIC_CACHE),
      caches.open(API_CACHE),
    ]).then(() => {
      logSW('Static assets cached, skipping waiting');
      return self.skipWaiting();
    }).catch(err => {
      logSW('Error during install:', err);
    })
  );
});

// Activate event - clean up old caches and manage cache sizes
self.addEventListener('activate', (event) => {
  logSW('Activate event - cleaning up old caches');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!currentCaches.includes(cacheName)) {
              logSW('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Clean up oversized caches
      ...Object.entries(CACHE_LIMITS).map(([cacheName, limit]) => 
        cleanupCache(cacheName, limit)
      ),
    ]).then(() => {
      logSW('Cache cleanup complete, claiming clients');
      return self.clients.claim();
    }).catch(err => {
      logSW('Error during activation:', err);
    })
  );
});

// Advanced fetch handler with intelligent caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;
  
  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip non-HTTP requests
  if (!url.startsWith('http')) {
    return;
  }

  // Skip excluded patterns
  if (isExcluded(url)) {
    logSW('Skipping excluded URL:', url);
    return;
  }

  event.respondWith(handleFetchRequest(request));
});

const handleFetchRequest = async (request) => {
  const url = request.url;
  
  try {
    // Strategy 1: Static assets - Cache First
    if (STATIC_ASSETS.some(asset => url.includes(asset))) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // Strategy 2: API requests - Network First with fallback
    if (isAPIRequest(url)) {
      return await networkFirstWithCache(request, API_CACHE);
    }
    
    // Strategy 3: Dynamic content - Network First
    return await networkFirstWithCache(request, DYNAMIC_CACHE);
    
  } catch (error) {
    logSW('Fetch error:', error);
    return await handleOfflineResponse(request);
  }
};

// Cache First Strategy (for static assets)
const cacheFirst = async (request, cacheName) => {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    logSW('Cache hit for:', request.url);
    return cachedResponse;
  }
  
  logSW('Cache miss, fetching:', request.url);
  const networkResponse = await fetch(request);
  
  if (networkResponse && networkResponse.status === 200) {
    const cache = await caches.open(cacheName);
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
};

// Network First with Cache Fallback
const networkFirstWithCache = async (request, cacheName) => {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      // Cache successful responses
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      
      // Periodically clean up cache
      if (Math.random() < 0.1) { // 10% chance
        cleanupCache(cacheName, CACHE_LIMITS[cacheName]);
      }
      
      logSW('Network success, cached:', request.url);
      return networkResponse;
    }
    
    // Network response but not successful, try cache
    const cachedResponse = await caches.match(request);
    return cachedResponse || networkResponse;
    
  } catch (error) {
    // Network failed, try cache
    logSW('Network failed, trying cache for:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      logSW('Cache fallback success for:', request.url);
      return cachedResponse;
    }
    
    throw error;
  }
};

// Handle offline responses
const handleOfflineResponse = async (request) => {
  // For navigation requests, return the main app or offline page
  if (request.mode === 'navigate') {
    const cachedIndex = await caches.match('/');
    if (cachedIndex) {
      return cachedIndex;
    }
    
    const cachedOffline = await caches.match('/offline.html');
    if (cachedOffline) {
      return cachedOffline;
    }
  }
  
  // For other requests, return a generic offline response
  return new Response(
    JSON.stringify({ 
      error: 'Offline', 
      message: 'This feature requires an internet connection',
      timestamp: new Date().toISOString()
    }), 
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    }
  );
};

// Message event - handle communication with main thread
self.addEventListener('message', (event) => {
  const { data } = event;
  logSW('Message received:', data);
  
  if (!data) return;
  
  switch (data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_STATS':
      getCacheStats().then(stats => {
        event.ports[0].postMessage({ type: 'CACHE_STATS', stats });
      });
      break;
      
    case 'CLEAR_CACHE':
      clearSpecificCache(data.cacheName).then(() => {
        event.ports[0].postMessage({ type: 'CACHE_CLEARED', cacheName: data.cacheName });
      });
      break;
      
    case 'FORCE_UPDATE':
      forceUpdate();
      break;
      
    default:
      logSW('Unknown message type:', data.type);
  }
});

// Background Sync for offline actions
self.addEventListener('sync', (event) => {
  logSW('Background sync event:', event.tag);
  
  switch (event.tag) {
    case SYNC_TAGS.SYNC_MESSAGES:
      event.waitUntil(syncMessages());
      break;
      
    case SYNC_TAGS.SYNC_SETTINGS:
      event.waitUntil(syncSettings());
      break;
      
    case SYNC_TAGS.SYNC_ANALYTICS:
      event.waitUntil(syncAnalytics());
      break;
      
    default:
      logSW('Unknown sync tag:', event.tag);
  }
});

// Enhanced Push notification handler
self.addEventListener('push', (event) => {
  logSW('Push notification received');
  
  let notificationData = {
    title: 'AI Personal Assistant',
    body: 'You have a new notification',
    icon: '/icon-512.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    requireInteraction: false,
    actions: [],
    data: {}
  };
  
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = { ...notificationData, ...pushData };
      
      // Add contextual actions based on notification type
      if (pushData.type === 'message') {
        notificationData.actions = [
          { action: 'reply', title: 'Reply', icon: '/icons/reply.png' },
          { action: 'view', title: 'View', icon: '/icons/view.png' }
        ];
      } else if (pushData.type === 'call') {
        notificationData.actions = [
          { action: 'answer', title: 'Answer', icon: '/icons/call-answer.png' },
          { action: 'decline', title: 'Decline', icon: '/icons/call-decline.png' }
        ];
        notificationData.requireInteraction = true;
      }
      
    } catch (error) {
      logSW('Error parsing push data:', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Enhanced notification click handler
self.addEventListener('notificationclick', (event) => {
  logSW('Notification clicked:', event.action);
  
  event.notification.close();
  
  const { action, notification } = event;
  const data = notification.data || {};
  
  event.waitUntil(
    handleNotificationAction(action, data)
  );
});

// Notification close handler
self.addEventListener('notificationclose', (event) => {
  logSW('Notification closed:', event.notification.data);
  
  // Track notification dismissal for analytics
  if (event.notification.data && event.notification.data.trackDismissal) {
    // Could send analytics data here
  }
});

// Utility functions for message handling
const getCacheStats = async () => {
  const cacheNames = await caches.keys();
  const stats = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    stats[cacheName] = {
      count: keys.length,
      size: await calculateCacheSize(cache, keys)
    };
  }
  
  return stats;
};

const calculateCacheSize = async (cache, keys) => {
  let totalSize = 0;
  
  for (const key of keys.slice(0, 10)) { // Sample first 10 for performance
    try {
      const response = await cache.match(key);
      if (response) {
        const clone = response.clone();
        const buffer = await clone.arrayBuffer();
        totalSize += buffer.byteLength;
      }
    } catch (error) {
      // Ignore errors in size calculation
    }
  }
  
  return Math.round(totalSize / 1024); // Return size in KB
};

const clearSpecificCache = async (cacheName) => {
  if (cacheName && cacheName !== 'all') {
    await caches.delete(cacheName);
    logSW('Cleared cache:', cacheName);
  } else {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    logSW('Cleared all caches');
  }
};

const forceUpdate = () => {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ type: 'FORCE_RELOAD' });
    });
  });
};

// Background sync functions
const syncMessages = async () => {
  try {
    logSW('Syncing offline messages...');
    
    // Get offline messages from IndexedDB or another storage
    const offlineMessages = await getOfflineMessages();
    
    for (const message of offlineMessages) {
      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message)
        });
        
        if (response.ok) {
          await removeOfflineMessage(message.id);
          logSW('Synced message:', message.id);
        }
      } catch (error) {
        logSW('Failed to sync message:', message.id, error);
      }
    }
    
  } catch (error) {
    logSW('Error during message sync:', error);
    throw error; // Re-throw to trigger retry
  }
};

const syncSettings = async () => {
  try {
    logSW('Syncing offline settings...');
    
    const offlineSettings = await getOfflineSettings();
    
    if (offlineSettings.length > 0) {
      const response = await fetch('/api/settings/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: offlineSettings })
      });
      
      if (response.ok) {
        await clearOfflineSettings();
        logSW('Settings synced successfully');
      }
    }
    
  } catch (error) {
    logSW('Error during settings sync:', error);
    throw error;
  }
};

const syncAnalytics = async () => {
  try {
    logSW('Syncing offline analytics...');
    
    const offlineEvents = await getOfflineAnalytics();
    
    if (offlineEvents.length > 0) {
      const response = await fetch('/api/analytics/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: offlineEvents })
      });
      
      if (response.ok) {
        await clearOfflineAnalytics();
        logSW('Analytics synced successfully');
      }
    }
    
  } catch (error) {
    logSW('Error during analytics sync:', error);
    throw error;
  }
};

const handleNotificationAction = async (action, data) => {
  const urlToOpen = getUrlForAction(action, data);
  
  const clientWindows = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  });
  
  // Check if the app is already open
  for (const client of clientWindows) {
    if (client.url.includes(self.location.origin)) {
      await client.focus();
      
      if (action && action !== 'view') {
        client.postMessage({
          type: 'NOTIFICATION_ACTION',
          action,
          data
        });
      }
      
      return;
    }
  }
  
  // App not open, open new window
  await self.clients.openWindow(urlToOpen);
};

const getUrlForAction = (action, data) => {
  const baseUrl = self.location.origin;
  
  switch (action) {
    case 'reply':
      return `${baseUrl}/chat/${data.chatId || ''}`;
    case 'view':
      return `${baseUrl}/${data.path || ''}`;
    case 'answer':
      return `${baseUrl}/call/incoming/${data.callId || ''}`;
    default:
      return baseUrl;
  }
};

// Placeholder functions for offline storage (would need to implement with IndexedDB)
const getOfflineMessages = async () => []; // Implement with IndexedDB
const removeOfflineMessage = async (id) => {}; // Implement with IndexedDB
const getOfflineSettings = async () => []; // Implement with IndexedDB
const clearOfflineSettings = async () => {}; // Implement with IndexedDB
const getOfflineAnalytics = async () => []; // Implement with IndexedDB
const clearOfflineAnalytics = async () => {}; // Implement with IndexedDB

// Periodic cleanup - runs when SW becomes idle
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(performPeriodicCleanup());
  }
});

const performPeriodicCleanup = async () => {
  logSW('Performing periodic cleanup...');
  
  // Clean up oversized caches
  await Promise.all(
    Object.entries(CACHE_LIMITS).map(([cacheName, limit]) => 
      cleanupCache(cacheName, limit)
    )
  );
  
  // Clean up old entries (older than 7 days)
  const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  
  for (const cacheName of [DYNAMIC_CACHE, API_CACHE]) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    for (const request of keys) {
      try {
        const response = await cache.match(request);
        if (response) {
          const dateHeader = response.headers.get('date');
          if (dateHeader) {
            const responseDate = new Date(dateHeader).getTime();
            if (responseDate < oneWeekAgo) {
              await cache.delete(request);
              logSW('Deleted old cache entry:', request.url);
            }
          }
        }
      } catch (error) {
        // Ignore errors during cleanup
      }
    }
  }
  
  logSW('Periodic cleanup completed');
}; 