import { consoleError, consoleLog, consoleWarn } from '@/utils/helpers/consoleHelper';
import { logError, logInfo } from '@/sentryErrorLogging';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isInstalling: boolean;
  isWaiting: boolean;
  isControlling: boolean;
  registration: ServiceWorkerRegistration | null;
  error: string | null;
}

interface CacheStats {
  [cacheName: string]: {
    count: number;
    size: number;
  };
}

export interface BackgroundSyncData {
  tag: string;
  data: Record<string, unknown>;
}

class ServiceWorkerService {
  private state: ServiceWorkerState = {
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isInstalling: false,
    isWaiting: false,
    isControlling: false,
    registration: null,
    error: null,
  };

  private stateChangeCallbacks: Array<(state: ServiceWorkerState) => void> = [];
  private updateAvailableCallbacks: Array<() => void> = [];

  constructor() {
    if (this.state.isSupported) {
      this.setupEventListeners();
    }
  }

  // Register the service worker
  async register(scriptUrl: string = '/sw.js'): Promise<ServiceWorkerRegistration | null> {
    if (!this.state.isSupported) {
      consoleWarn('Service Workers are not supported in this browser');
      return null;
    }

    try {
      consoleLog('Registering service worker:', scriptUrl);
      this.updateState({ isInstalling: true, error: null });

      const registration = await navigator.serviceWorker.register(scriptUrl, {
        scope: '/',
        updateViaCache: 'imports',
      });

      this.state.registration = registration;
      this.updateState({ 
        isRegistered: true, 
        isInstalling: false,
        isControlling: !!navigator.serviceWorker.controller,
      });

      this.setupRegistrationEventListeners(registration);

      logInfo('Service worker registered successfully', {
        scope: registration.scope,
        scriptUrl,
      });

      consoleLog('Service worker registered successfully:', registration);
      return registration;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      consoleError('Service worker registration failed:', error);
      
      logError(error instanceof Error ? error : new Error('Service worker registration failed'), {
        scriptUrl,
        errorType: 'service_worker_registration_error',
      });

      this.updateState({ 
        isInstalling: false, 
        isRegistered: false,
        error: errorMessage,
      });

      return null;
    }
  }

  // Unregister the service worker
  async unregister(): Promise<boolean> {
    if (!this.state.registration) {
      consoleWarn('No service worker registration to unregister');
      return false;
    }

    try {
      const success = await this.state.registration.unregister();
      
      if (success) {
        this.updateState({
          isRegistered: false,
          isControlling: false,
          registration: null,
          error: null,
        });
        
        consoleLog('Service worker unregistered successfully');
        logInfo('Service worker unregistered');
      }

      return success;
    } catch (error) {
      consoleError('Error unregistering service worker:', error);
      logError(error instanceof Error ? error : new Error('Service worker unregistration failed'));
      return false;
    }
  }

  // Update the service worker
  async update(): Promise<void> {
    if (!this.state.registration) {
      consoleWarn('No service worker registration to update');
      return;
    }

    try {
      consoleLog('Checking for service worker updates...');
      await this.state.registration.update();
      consoleLog('Service worker update check completed');
    } catch (error) {
      consoleError('Error updating service worker:', error);
      logError(error instanceof Error ? error : new Error('Service worker update failed'));
    }
  }

  // Skip waiting and activate new service worker
  async skipWaiting(): Promise<void> {
    if (!this.state.registration?.waiting) {
      consoleWarn('No waiting service worker to activate');
      return;
    }

    try {
      this.sendMessage({ type: 'SKIP_WAITING' });
      consoleLog('Sent skip waiting message to service worker');
    } catch (error) {
      consoleError('Error sending skip waiting message:', error);
    }
  }

  // Get cache statistics
  async getCacheStats(): Promise<CacheStats | null> {
    if (!this.state.isControlling) {
      consoleWarn('Service worker is not controlling the page');
      return null;
    }

    try {
      const response = await this.sendMessageWithResponse({ type: 'GET_CACHE_STATS' });
      return response?.stats || null;
    } catch (error) {
      consoleError('Error getting cache stats:', error);
      return null;
    }
  }

  // Clear specific cache
  async clearCache(cacheName: string = 'all'): Promise<boolean> {
    if (!this.state.isControlling) {
      consoleWarn('Service worker is not controlling the page');
      return false;
    }

    try {
      await this.sendMessageWithResponse({ 
        type: 'CLEAR_CACHE', 
        cacheName 
      });
      
      consoleLog('Cache cleared:', cacheName);
      return true;
    } catch (error) {
      consoleError('Error clearing cache:', error);
      return false;
    }
  }

  // Schedule background sync
  async scheduleBackgroundSync(tag: string, data?: Record<string, unknown>): Promise<boolean> {
    if (!this.state.registration) {
      consoleWarn('No service worker registration for background sync');
      return false;
    }

    try {
      // Store data for sync if provided
      if (data) {
        await this.storeOfflineData(tag, data);
      }

      // Register background sync
      await this.state.registration.sync.register(tag);
      
      consoleLog('Background sync scheduled:', tag);
      logInfo('Background sync scheduled', { tag, hasData: !!data });
      return true;
    } catch (error) {
      consoleError('Error scheduling background sync:', error);
      logError(error instanceof Error ? error : new Error('Background sync scheduling failed'), {
        tag,
        errorType: 'background_sync_error',
      });
      return false;
    }
  }

  // Check if background sync is supported
  isBackgroundSyncSupported(): boolean {
    return 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype;
  }

  // Get current state
  getState(): ServiceWorkerState {
    return { ...this.state };
  }

  // Subscribe to state changes
  onStateChange(callback: (state: ServiceWorkerState) => void): () => void {
    this.stateChangeCallbacks.push(callback);
    
    // Call immediately with current state
    callback(this.getState());

    // Return unsubscribe function
    return () => {
      this.stateChangeCallbacks = this.stateChangeCallbacks.filter(cb => cb !== callback);
    };
  }

  // Subscribe to update available events
  onUpdateAvailable(callback: () => void): () => void {
    this.updateAvailableCallbacks.push(callback);

    return () => {
      this.updateAvailableCallbacks = this.updateAvailableCallbacks.filter(cb => cb !== callback);
    };
  }

  // Force reload the page
  forceReload(): void {
    window.location.reload();
  }

  // Send message to service worker
  private sendMessage(message: Record<string, unknown>): void {
    if (!navigator.serviceWorker.controller) {
      consoleWarn('No service worker controller to send message to');
      return;
    }

    navigator.serviceWorker.controller.postMessage(message);
  }

  // Send message and wait for response
  private sendMessageWithResponse(message: Record<string, unknown>): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!navigator.serviceWorker.controller) {
        reject(new Error('No service worker controller'));
        return;
      }

      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };

      messageChannel.port1.onerror = (error) => {
        reject(error);
      };

      navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);

      // Timeout after 10 seconds
      setTimeout(() => {
        reject(new Error('Message timeout'));
      }, 10000);
    });
  }

  // Store data for offline sync
  private async storeOfflineData(tag: string, data: Record<string, unknown>): Promise<void> {
    try {
      // This would typically use IndexedDB or localStorage
      // For now, we'll use localStorage as a simple implementation
      const key = `offline_sync_${tag}`;
      const existingData = JSON.parse(localStorage.getItem(key) || '[]');
      existingData.push({
        ...data,
        timestamp: Date.now(),
      });
      localStorage.setItem(key, JSON.stringify(existingData));
    } catch (error) {
      consoleError('Error storing offline data:', error);
      throw error;
    }
  }

  // Setup event listeners for service worker events
  private setupEventListeners(): void {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      consoleLog('Service worker controller changed');
      this.updateState({ isControlling: !!navigator.serviceWorker.controller });
    });

    navigator.serviceWorker.addEventListener('message', (event) => {
      this.handleServiceWorkerMessage(event.data);
    });

    // Listen for service worker updates
    navigator.serviceWorker.addEventListener('updatefound', () => {
      consoleLog('Service worker update found');
    });
  }

  // Setup registration-specific event listeners
  private setupRegistrationEventListeners(registration: ServiceWorkerRegistration): void {
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      consoleLog('New service worker found, installing...');
      this.updateState({ isInstalling: true });

      newWorker.addEventListener('statechange', () => {
        switch (newWorker.state) {
          case 'installed':
            if (navigator.serviceWorker.controller) {
              // New update available
              consoleLog('New service worker installed, update available');
              this.updateState({ 
                isInstalling: false, 
                isWaiting: true 
              });
              this.notifyUpdateAvailable();
            } else {
              // First install
              consoleLog('Service worker installed for the first time');
              this.updateState({ 
                isInstalling: false, 
                isControlling: true 
              });
            }
            break;

          case 'activated':
            consoleLog('Service worker activated');
            this.updateState({ 
              isWaiting: false, 
              isControlling: true 
            });
            break;

          case 'redundant':
            consoleLog('Service worker became redundant');
            this.updateState({ 
              isInstalling: false, 
              isWaiting: false 
            });
            break;
        }
      });
    });
  }

  // Handle messages from service worker
  private handleServiceWorkerMessage(message: any): void {
    if (!message || !message.type) return;

    switch (message.type) {
      case 'FORCE_RELOAD':
        consoleLog('Service worker requested force reload');
        this.forceReload();
        break;

      case 'NOTIFICATION_ACTION':
        consoleLog('Notification action received:', message.action, message.data);
        // Handle notification actions here
        break;

      default:
        consoleLog('Unknown message from service worker:', message);
    }
  }

  // Update internal state and notify callbacks
  private updateState(updates: Partial<ServiceWorkerState>): void {
    this.state = { ...this.state, ...updates };
    this.stateChangeCallbacks.forEach(callback => callback(this.getState()));
  }

  // Notify update available callbacks
  private notifyUpdateAvailable(): void {
    this.updateAvailableCallbacks.forEach(callback => callback());
  }
}

export const serviceWorkerService = new ServiceWorkerService();
export default serviceWorkerService;