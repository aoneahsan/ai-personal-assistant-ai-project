import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import {
  WidgetConfig,
  WidgetEvent,
  ServiceResponse,
  FilterOptions,
  UserContext,
} from '../types';
import { targetingService } from './targetingService';
import { generateWidgetId } from '../utils/helpers';

export class WidgetService {
  private readonly COLLECTION = 'productAdoption_widgets';
  private readonly EVENTS_COLLECTION = 'productAdoption_widget_events';
  private activeWidgets: Map<string, WidgetConfig> = new Map();

  async createWidget(
    widgetData: Partial<WidgetConfig>
  ): Promise<ServiceResponse<WidgetConfig>> {
    try {
      const widgetId = widgetData.id || generateWidgetId();
      const widget: WidgetConfig = {
        ...widgetData,
        id: widgetId,
        analytics: {
          impressions: 0,
          interactions: 0,
          dismissals: 0,
          conversions: 0,
          engagementRate: 0,
          events: [],
        },
      } as WidgetConfig;

      await setDoc(doc(db, this.COLLECTION, widgetId), {
        ...widget,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return {
        success: true,
        data: widget,
        metadata: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
        },
      };
    } catch (error) {
      console.error('Error creating widget:', error);
      return {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: 'Failed to create widget',
          details: error,
        },
      };
    }
  }

  async updateWidget(
    widgetId: string,
    updates: Partial<WidgetConfig>
  ): Promise<ServiceResponse<WidgetConfig>> {
    try {
      const widgetRef = doc(db, this.COLLECTION, widgetId);
      const widgetDoc = await getDoc(widgetRef);

      if (!widgetDoc.exists()) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Widget not found',
          },
        };
      }

      await updateDoc(widgetRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      const updatedWidget = {
        ...widgetDoc.data(),
        ...updates,
      } as WidgetConfig;

      // Update active widgets cache
      if (this.activeWidgets.has(widgetId)) {
        this.activeWidgets.set(widgetId, updatedWidget);
      }

      return {
        success: true,
        data: updatedWidget,
        metadata: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
        },
      };
    } catch (error) {
      console.error('Error updating widget:', error);
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update widget',
          details: error,
        },
      };
    }
  }

  async getWidget(widgetId: string): Promise<ServiceResponse<WidgetConfig>> {
    try {
      const widgetDoc = await getDoc(doc(db, this.COLLECTION, widgetId));

      if (!widgetDoc.exists()) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Widget not found',
          },
        };
      }

      return {
        success: true,
        data: widgetDoc.data() as WidgetConfig,
        metadata: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
        },
      };
    } catch (error) {
      console.error('Error getting widget:', error);
      return {
        success: false,
        error: {
          code: 'GET_ERROR',
          message: 'Failed to get widget',
          details: error,
        },
      };
    }
  }

  async listWidgets(
    filters?: FilterOptions
  ): Promise<ServiceResponse<WidgetConfig[]>> {
    try {
      let q = query(collection(db, this.COLLECTION));

      if (filters?.sortBy) {
        q = query(q, orderBy(filters.sortBy, filters.sortOrder || 'desc'));
      } else {
        q = query(q, orderBy('createdAt', 'desc'));
      }

      const snapshot = await getDocs(q);
      const widgets = snapshot.docs.map((doc) => doc.data() as WidgetConfig);

      return {
        success: true,
        data: widgets,
        metadata: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
          pagination: {
            page: filters?.page || 1,
            pageSize: filters?.pageSize || widgets.length,
            totalItems: widgets.length,
            totalPages: 1,
          },
        },
      };
    } catch (error) {
      console.error('Error listing widgets:', error);
      return {
        success: false,
        error: {
          code: 'LIST_ERROR',
          message: 'Failed to list widgets',
          details: error,
        },
      };
    }
  }

  async deleteWidget(widgetId: string): Promise<ServiceResponse<void>> {
    try {
      await deleteDoc(doc(db, this.COLLECTION, widgetId));
      this.activeWidgets.delete(widgetId);

      return {
        success: true,
        metadata: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
        },
      };
    } catch (error) {
      console.error('Error deleting widget:', error);
      return {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete widget',
          details: error,
        },
      };
    }
  }

  /**
   * Get widgets that should be displayed for current user and page
   */
  async getActiveWidgets(
    userContext: UserContext,
    currentUrl: string
  ): Promise<ServiceResponse<WidgetConfig[]>> {
    try {
      // Get all widgets from cache or database
      if (this.activeWidgets.size === 0) {
        await this.loadActiveWidgets();
      }

      const eligibleWidgets: WidgetConfig[] = [];

      for (const widget of this.activeWidgets.values()) {
        const targetingResult = await targetingService.checkWidgetTargeting(
          widget.targeting,
          userContext,
          currentUrl
        );

        if (targetingResult.success && targetingResult.data) {
          eligibleWidgets.push(widget);
        }
      }

      return {
        success: true,
        data: eligibleWidgets,
        metadata: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
        },
      };
    } catch (error) {
      console.error('Error getting active widgets:', error);
      return {
        success: false,
        error: {
          code: 'ACTIVE_WIDGETS_ERROR',
          message: 'Failed to get active widgets',
          details: error,
        },
      };
    }
  }

  /**
   * Track widget event
   */
  async trackWidgetEvent(
    event: Omit<WidgetEvent, 'id'>
  ): Promise<ServiceResponse<void>> {
    try {
      const eventId = crypto.randomUUID();
      await setDoc(doc(db, this.EVENTS_COLLECTION, eventId), {
        ...event,
        id: eventId,
        timestamp: serverTimestamp(),
      });

      // Update widget analytics
      await this.updateWidgetAnalytics(event.widgetId, event.type);

      return {
        success: true,
        metadata: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
        },
      };
    } catch (error) {
      console.error('Error tracking widget event:', error);
      return {
        success: false,
        error: {
          code: 'EVENT_TRACKING_ERROR',
          message: 'Failed to track widget event',
          details: error,
        },
      };
    }
  }

  /**
   * Load active widgets into cache
   */
  private async loadActiveWidgets(): Promise<void> {
    const snapshot = await getDocs(collection(db, this.COLLECTION));
    
    snapshot.docs.forEach((doc) => {
      const widget = doc.data() as WidgetConfig;
      this.activeWidgets.set(widget.id, widget);
    });
  }

  /**
   * Update widget analytics
   */
  private async updateWidgetAnalytics(
    widgetId: string,
    eventType: string
  ): Promise<void> {
    const widgetRef = doc(db, this.COLLECTION, widgetId);
    const widgetDoc = await getDoc(widgetRef);

    if (widgetDoc.exists()) {
      const widget = widgetDoc.data() as WidgetConfig;
      const analytics = { ...widget.analytics };

      switch (eventType) {
        case 'impression':
          analytics.impressions += 1;
          break;
        case 'interaction':
          analytics.interactions += 1;
          break;
        case 'dismissal':
          analytics.dismissals += 1;
          break;
        case 'conversion':
          analytics.conversions += 1;
          break;
      }

      // Calculate engagement rate
      if (analytics.impressions > 0) {
        analytics.engagementRate =
          (analytics.interactions / analytics.impressions) * 100;
      }

      await updateDoc(widgetRef, { analytics });
    }
  }

  /**
   * Check if widget should be shown based on frequency rules
   */
  async shouldShowWidget(
    widgetId: string,
    userId?: string,
    sessionId?: string
  ): Promise<boolean> {
    const widget = this.activeWidgets.get(widgetId);
    if (!widget) return false;

    const frequency = widget.trigger.frequency;
    if (!frequency || frequency.type === 'always') {
      return true;
    }

    // Check previous impressions
    let eventsQuery = query(
      collection(db, this.EVENTS_COLLECTION),
      where('widgetId', '==', widgetId),
      where('type', '==', 'impression')
    );

    if (frequency.type === 'once' && userId) {
      eventsQuery = query(eventsQuery, where('userId', '==', userId));
    } else if (frequency.type === 'session' && sessionId) {
      eventsQuery = query(eventsQuery, where('sessionId', '==', sessionId));
    } else if (frequency.type === 'daily' && userId) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      eventsQuery = query(
        eventsQuery,
        where('userId', '==', userId),
        where('timestamp', '>=', today)
      );
    }

    const snapshot = await getDocs(eventsQuery);
    const impressionCount = snapshot.size;

    if (frequency.maxCount && impressionCount >= frequency.maxCount) {
      return false;
    }

    return true;
  }
}

// Export singleton instance
export const widgetService = new WidgetService();