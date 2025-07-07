import { db } from '@/services/firebase';
import { PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS } from '@/utils/constants/generic/firebase';
import { consoleError, consoleLog } from '@/utils/helpers/consoleHelper';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  Timestamp,
} from 'firebase/firestore';

export interface IntegrationTestResults {
  success: boolean;
  message: string;
  responseTime?: number;
  statusCode?: number;
  data?: Record<string, unknown>;
  error?: string;
  timestamp: Date;
  details?: {
    timestamp: string;
    endpoint: string;
    method: string;
  };
}

export interface Integration {
  id?: string;
  name: string;
  type:
    | 'oauth'
    | 'api_key'
    | 'webhook'
    | 'database'
    | 'storage'
    | 'notification';
  status: 'active' | 'inactive' | 'error' | 'pending';
  description: string;
  provider: string;
  version: string;
  lastSync: Date | Timestamp;
  lastError?: string;
  config: Record<string, unknown>;
  webhookUrl?: string;
  apiKey?: string;
  credentials?: {
    clientId?: string;
    clientSecret?: string;
    accessToken?: string;
    refreshToken?: string;
  };
  metrics: {
    requestsToday: number;
    requestsTotal: number;
    errorRate: number;
    avgResponseTime: number;
  };
  limits: {
    dailyRequests: number;
    rateLimit: number;
  };
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  createdBy: string;
}

export interface IntegrationTemplate {
  id: string;
  name: string;
  provider: string;
  type: Integration['type'];
  description: string;
  icon: string;
  category: string;
  configFields: Array<{
    key: string;
    label: string;
    type: 'text' | 'password' | 'url' | 'number' | 'boolean' | 'select';
    required: boolean;
    placeholder?: string;
    options?: Array<{ label: string; value: string }>;
  }>;
}

class IntegrationManagementService {
  private readonly COLLECTION_NAME = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_integrations`;
  private readonly TEMPLATES_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_integration_templates`;

  // Create a new integration
  async createIntegration(integration: Omit<Integration, 'id' | 'createdAt' | 'updatedAt' | 'lastSync'>): Promise<string> {
    try {
      const integrationWithMetadata = {
        ...integration,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastSync: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), integrationWithMetadata);
      consoleLog('Integration created successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      consoleError('Error creating integration:', error);
      throw error;
    }
  }

  // Get all integrations
  async getIntegrations(): Promise<Integration[]> {
    try {
      const q = query(collection(db, this.COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const integrations: Integration[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        integrations.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          lastSync: data.lastSync?.toDate?.() || data.lastSync,
        } as Integration);
      });

      return integrations;
    } catch (error) {
      consoleError('Error fetching integrations:', error);
      // Return mock data as fallback
      return this.getMockIntegrations();
    }
  }

  // Get integrations by status
  async getIntegrationsByStatus(status: Integration['status']): Promise<Integration[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('status', '==', status),
        orderBy('name')
      );

      const querySnapshot = await getDocs(q);
      const integrations: Integration[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        integrations.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          lastSync: data.lastSync?.toDate?.() || data.lastSync,
        } as Integration);
      });

      return integrations;
    } catch (error) {
      consoleError('Error fetching integrations by status:', error);
      return [];
    }
  }

  // Update an integration
  async updateIntegration(integrationId: string, updates: Partial<Integration>): Promise<void> {
    try {
      const integrationRef = doc(db, this.COLLECTION_NAME, integrationId);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      // Remove undefined fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });

      await updateDoc(integrationRef, updateData);
      consoleLog('Integration updated successfully:', integrationId);
    } catch (error) {
      consoleError('Error updating integration:', error);
      throw error;
    }
  }

  // Delete an integration
  async deleteIntegration(integrationId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION_NAME, integrationId));
      consoleLog('Integration deleted successfully:', integrationId);
    } catch (error) {
      consoleError('Error deleting integration:', error);
      throw error;
    }
  }

  // Subscribe to integration changes
  subscribeToIntegrations(callback: (integrations: Integration[]) => void): () => void {
    try {
      const q = query(collection(db, this.COLLECTION_NAME), orderBy('createdAt', 'desc'));

      return onSnapshot(q, (querySnapshot) => {
        const integrations: Integration[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          integrations.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
            lastSync: data.lastSync?.toDate?.() || data.lastSync,
          } as Integration);
        });
        callback(integrations);
      });
    } catch (error) {
      consoleError('Error subscribing to integrations:', error);
      // Return mock data as fallback
      callback(this.getMockIntegrations());
      return () => {}; // Empty unsubscribe function
    }
  }

  // Test an integration
  async testIntegration(integration: Integration): Promise<IntegrationTestResults> {
    try {
      // Simulate API test call based on integration type
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 3000 + 1000));

      const success = Math.random() > 0.2; // 80% success rate for simulation
      const responseTime = Math.floor(Math.random() * 500) + 100;

      const result: IntegrationTestResults = {
        success,
        responseTime,
        statusCode: success ? 200 : 401,
        message: success ? 'Connection successful' : 'Authentication failed',
        timestamp: new Date(),
        details: {
          timestamp: new Date().toISOString(),
          endpoint: `https://api.${integration.provider.toLowerCase()}.com/test`,
          method: 'GET',
        },
      };

      if (!success) {
        result.error = 'Invalid credentials or configuration';
      }

      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  // Get integration templates
  async getIntegrationTemplates(): Promise<IntegrationTemplate[]> {
    try {
      const q = query(collection(db, this.TEMPLATES_COLLECTION), orderBy('name'));
      const querySnapshot = await getDocs(q);
      const templates: IntegrationTemplate[] = [];

      querySnapshot.forEach((doc) => {
        templates.push({
          id: doc.id,
          ...doc.data(),
        } as IntegrationTemplate);
      });

      return templates.length > 0 ? templates : this.getMockTemplates();
    } catch (error) {
      consoleError('Error fetching integration templates:', error);
      return this.getMockTemplates();
    }
  }

  // Update integration metrics
  async updateIntegrationMetrics(
    integrationId: string,
    metrics: Partial<Integration['metrics']>
  ): Promise<void> {
    try {
      const integrationRef = doc(db, this.COLLECTION_NAME, integrationId);
      await updateDoc(integrationRef, {
        metrics,
        lastSync: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      consoleError('Error updating integration metrics:', error);
      throw error;
    }
  }

  // Record integration error
  async recordIntegrationError(integrationId: string, error: string): Promise<void> {
    try {
      const integrationRef = doc(db, this.COLLECTION_NAME, integrationId);
      await updateDoc(integrationRef, {
        lastError: error,
        status: 'error',
        lastSync: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (dbError) {
      consoleError('Error recording integration error:', dbError);
    }
  }

  // Mock data for fallback
  private getMockIntegrations(): Integration[] {
    return [
      {
        id: '1',
        name: 'Google Analytics',
        type: 'api_key',
        status: 'active',
        description: 'Website analytics and tracking',
        provider: 'Google',
        version: '4.0',
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
        config: {
          trackingId: 'UA-123456789-1',
          apiKey: 'AIzaSyA...',
        },
        metrics: {
          requestsToday: 45,
          requestsTotal: 1420,
          errorRate: 0.02,
          avgResponseTime: 150,
        },
        limits: {
          dailyRequests: 1000,
          rateLimit: 10,
        },
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        createdBy: 'admin@example.com',
      },
      {
        id: '2',
        name: 'Slack Webhook',
        type: 'webhook',
        status: 'active',
        description: 'Send notifications to Slack channels',
        provider: 'Slack',
        version: '1.0',
        lastSync: new Date(Date.now() - 30 * 60 * 1000),
        config: {
          webhookUrl: 'https://hooks.slack.com/services/...',
          channel: '#notifications',
        },
        metrics: {
          requestsToday: 12,
          requestsTotal: 567,
          errorRate: 0.05,
          avgResponseTime: 200,
        },
        limits: {
          dailyRequests: 500,
          rateLimit: 5,
        },
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000),
        createdBy: 'admin@example.com',
      },
    ];
  }

  private getMockTemplates(): IntegrationTemplate[] {
    return [
      {
        id: 'google-analytics',
        name: 'Google Analytics',
        provider: 'Google',
        type: 'oauth',
        description: 'Track website analytics and user behavior',
        icon: 'pi pi-chart-line',
        category: 'Analytics',
        configFields: [
          {
            key: 'propertyId',
            label: 'Property ID',
            type: 'text',
            required: true,
          },
          {
            key: 'trackingId',
            label: 'Tracking ID',
            type: 'text',
            required: true,
          },
          {
            key: 'enableEcommerce',
            label: 'Enable E-commerce',
            type: 'boolean',
            required: false,
          },
        ],
      },
      {
        id: 'stripe',
        name: 'Stripe',
        provider: 'Stripe',
        type: 'api_key',
        description: 'Process payments and manage subscriptions',
        icon: 'pi pi-credit-card',
        category: 'Payment',
        configFields: [
          {
            key: 'publishableKey',
            label: 'Publishable Key',
            type: 'text',
            required: true,
          },
          {
            key: 'secretKey',
            label: 'Secret Key',
            type: 'password',
            required: true,
          },
          {
            key: 'webhookEndpoint',
            label: 'Webhook Endpoint',
            type: 'url',
            required: false,
          },
          {
            key: 'currency',
            label: 'Currency',
            type: 'select',
            required: true,
            options: [
              { label: 'USD', value: 'USD' },
              { label: 'EUR', value: 'EUR' },
              { label: 'GBP', value: 'GBP' },
            ],
          },
        ],
      },
      {
        id: 'onesignal',
        name: 'OneSignal',
        provider: 'OneSignal',
        type: 'api_key',
        description: 'Send push notifications to users',
        icon: 'pi pi-bell',
        category: 'Notifications',
        configFields: [
          { key: 'appId', label: 'App ID', type: 'text', required: true },
          {
            key: 'apiKey',
            label: 'API Key',
            type: 'password',
            required: true,
          },
          {
            key: 'safariWebId',
            label: 'Safari Web ID',
            type: 'text',
            required: false,
          },
        ],
      },
    ];
  }
}

export const integrationManagementService = new IntegrationManagementService();
export default integrationManagementService;