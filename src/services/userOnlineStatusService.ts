import { IPCAUser } from '@/types/user';
import { PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS } from '@/utils/constants/generic/firebase';
import { consoleError, consoleLog } from '@/utils/helpers/consoleHelper';
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';

// Online Status Interface
export interface UserOnlineStatus {
  isOnline: boolean;
  lastActiveAt: Date;
  updatedAt: Date;
}

// Online Status Service
export class UserOnlineStatusService {
  private static instance: UserOnlineStatusService;
  private readonly USERS_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_users`;
  private readonly ADMIN_SETTINGS_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_admin_settings`;

  private activeUsers: Set<string> = new Set();
  private statusUpdateInterval: NodeJS.Timeout | null = null;
  private unsubscribeCallbacks: Map<string, () => void> = new Map();
  private offlineTimeoutMinutes: number = 5; // Default 5 minutes

  private constructor() {
    this.initialize();
  }

  public static getInstance(): UserOnlineStatusService {
    if (!UserOnlineStatusService.instance) {
      UserOnlineStatusService.instance = new UserOnlineStatusService();
    }
    return UserOnlineStatusService.instance;
  }

  private async initialize(): Promise<void> {
    try {
      // Load admin settings for offline timeout
      await this.loadAdminSettings();

      // Start periodic status updates
      this.startStatusUpdateTimer();

      // Handle page visibility changes
      this.setupVisibilityChangeHandler();

      // Handle beforeunload event
      this.setupBeforeUnloadHandler();

      consoleLog('✅ UserOnlineStatusService initialized');
    } catch (error) {
      consoleError('❌ Error initializing UserOnlineStatusService:', error);
    }
  }

  // Load admin settings for offline timeout
  private async loadAdminSettings(): Promise<void> {
    try {
      const settingsDoc = await getDoc(
        doc(db, this.ADMIN_SETTINGS_COLLECTION, 'general')
      );
      if (settingsDoc.exists()) {
        const settings = settingsDoc.data();
        this.offlineTimeoutMinutes =
          settings.timing?.userOfflineTimeoutMinutes || 5;
        consoleLog(
          `📊 Loaded offline timeout: ${this.offlineTimeoutMinutes} minutes`
        );
      } else {
        // Create default admin settings if they don't exist
        await this.createDefaultAdminSettings();
      }
    } catch (error) {
      consoleError('❌ Error loading admin settings:', error);
    }
  }

  // Create default admin settings
  private async createDefaultAdminSettings(): Promise<void> {
    try {
      const defaultSettings = {
        system: {
          maintenanceMode: false,
          maintenanceMessage: '',
          debugMode: false,
          loggingLevel: 'info',
          environment: 'production',
          version: '1.0.0',
          lastUpdated: serverTimestamp(),
          updatedBy: 'SYSTEM',
        },
        timing: {
          userOfflineTimeoutMinutes: 5,
          sessionTimeoutMinutes: 30,
          heartbeatIntervalSeconds: 30,
          statusUpdateIntervalSeconds: 60,
        },
        features: {
          realTimeOnlineStatus: true,
          showLastSeen: true,
          onlineStatusTracking: true,
        },
      };

      await updateDoc(
        doc(db, this.ADMIN_SETTINGS_COLLECTION, 'general'),
        defaultSettings
      );

      this.offlineTimeoutMinutes =
        defaultSettings.timing.userOfflineTimeoutMinutes;
      consoleLog('✅ Created default admin settings');
    } catch (error) {
      consoleError('❌ Error creating default admin settings:', error);
    }
  }

  // Start user online status tracking
  public async startTracking(userId: string): Promise<void> {
    try {
      this.activeUsers.add(userId);

      // Update user status to online
      await this.updateUserStatus(userId, true);

      consoleLog(`📡 Started tracking online status for user: ${userId}`);
    } catch (error) {
      consoleError('❌ Error starting online status tracking:', error);
    }
  }

  // Stop user online status tracking
  public async stopTracking(userId: string): Promise<void> {
    try {
      this.activeUsers.delete(userId);

      // Update user status to offline
      await this.updateUserStatus(userId, false);

      // Clean up any listeners
      const unsubscribe = this.unsubscribeCallbacks.get(userId);
      if (unsubscribe) {
        unsubscribe();
        this.unsubscribeCallbacks.delete(userId);
      }

      consoleLog(`📡 Stopped tracking online status for user: ${userId}`);
    } catch (error) {
      consoleError('❌ Error stopping online status tracking:', error);
    }
  }

  // Update user online status
  private async updateUserStatus(
    userId: string,
    isOnline: boolean
  ): Promise<void> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const updateData: Partial<IPCAUser> = {
        isOnline,
        lastActiveAt: new Date(),
        updatedAt: new Date(),
      };

      await updateDoc(userRef, updateData);

      // consoleLog(`📊 Updated user status: ${userId} - ${isOnline ? 'online' : 'offline'}`);
    } catch (error) {
      consoleError('❌ Error updating user status:', error);
    }
  }

  // Subscribe to user online status changes
  public subscribeToUserStatus(
    userId: string,
    callback: (status: UserOnlineStatus) => void
  ): () => void {
    const userRef = doc(db, this.USERS_COLLECTION, userId);

    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data() as IPCAUser;
        const status: UserOnlineStatus = {
          isOnline: userData.isOnline || false,
          lastActiveAt: userData.lastActiveAt || new Date(),
          updatedAt: userData.updatedAt || new Date(),
        };
        callback(status);
      }
    });

    // Store unsubscribe callback
    this.unsubscribeCallbacks.set(userId, unsubscribe);

    return unsubscribe;
  }

  // Check if user is considered online based on their last activity
  public isUserOnline(lastActiveAt: Date): boolean {
    const now = new Date();
    const timeDifference = now.getTime() - lastActiveAt.getTime();
    const timeDifferenceMinutes = timeDifference / (1000 * 60);

    return timeDifferenceMinutes <= this.offlineTimeoutMinutes;
  }

  // Get user online status
  public async getUserOnlineStatus(
    userId: string
  ): Promise<UserOnlineStatus | null> {
    try {
      const userDoc = await getDoc(doc(db, this.USERS_COLLECTION, userId));
      if (userDoc.exists()) {
        const userData = userDoc.data() as IPCAUser;
        return {
          isOnline: userData.isOnline || false,
          lastActiveAt: userData.lastActiveAt || new Date(),
          updatedAt: userData.updatedAt || new Date(),
        };
      }
      return null;
    } catch (error) {
      consoleError('❌ Error getting user online status:', error);
      return null;
    }
  }

  // Start periodic status updates
  private startStatusUpdateTimer(): void {
    this.statusUpdateInterval = setInterval(() => {
      this.updateActiveUsersStatus();
    }, 30000); // Update every 30 seconds
  }

  // Update status for all active users
  private async updateActiveUsersStatus(): Promise<void> {
    const updatePromises = Array.from(this.activeUsers).map((userId) =>
      this.updateUserStatus(userId, true)
    );

    try {
      await Promise.all(updatePromises);
    } catch (error) {
      consoleError('❌ Error updating active users status:', error);
    }
  }

  // Setup page visibility change handler
  private setupVisibilityChangeHandler(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden, mark users as potentially offline
        this.activeUsers.forEach((userId) => {
          this.updateUserStatus(userId, false);
        });
      } else {
        // Page is visible again, mark users as online
        this.activeUsers.forEach((userId) => {
          this.updateUserStatus(userId, true);
        });
      }
    });
  }

  // Setup beforeunload handler
  private setupBeforeUnloadHandler(): void {
    window.addEventListener('beforeunload', () => {
      // Mark all active users as offline when page is closing
      this.activeUsers.forEach((userId) => {
        this.updateUserStatus(userId, false);
      });
    });
  }

  // Get offline timeout in minutes (for admin settings)
  public getOfflineTimeoutMinutes(): number {
    return this.offlineTimeoutMinutes;
  }

  // Update offline timeout (for admin settings)
  public async updateOfflineTimeout(minutes: number): Promise<void> {
    try {
      this.offlineTimeoutMinutes = minutes;

      // Update in admin settings
      await updateDoc(doc(db, this.ADMIN_SETTINGS_COLLECTION, 'general'), {
        'timing.userOfflineTimeoutMinutes': minutes,
        'system.lastUpdated': serverTimestamp(),
      });

      consoleLog(`✅ Updated offline timeout to ${minutes} minutes`);
    } catch (error) {
      consoleError('❌ Error updating offline timeout:', error);
    }
  }

  // Cleanup method
  public cleanup(): void {
    if (this.statusUpdateInterval) {
      clearInterval(this.statusUpdateInterval);
      this.statusUpdateInterval = null;
    }

    // Unsubscribe from all listeners
    this.unsubscribeCallbacks.forEach((unsubscribe) => unsubscribe());
    this.unsubscribeCallbacks.clear();

    // Mark all active users as offline
    this.activeUsers.forEach((userId) => {
      this.updateUserStatus(userId, false);
    });

    this.activeUsers.clear();
  }
}

// Export singleton instance
export const userOnlineStatusService = UserOnlineStatusService.getInstance();
