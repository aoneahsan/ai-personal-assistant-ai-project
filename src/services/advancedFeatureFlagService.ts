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
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

export interface AdvancedFeatureFlag {
  id?: string;
  name: string;
  key: string;
  description: string;
  type: 'boolean' | 'string' | 'number' | 'json' | 'percentage';
  status: 'active' | 'inactive' | 'scheduled' | 'expired';
  defaultValue: string | number | boolean | object | null;
  variations: Array<{
    name: string;
    value: string | number | boolean | object | null;
    description: string;
    weight: number;
  }>;
  targeting: {
    enabled: boolean;
    rules: Array<{
      id: string;
      name: string;
      conditions: Array<{
        attribute: string;
        operator:
          | 'equals'
          | 'not_equals'
          | 'contains'
          | 'greater_than'
          | 'less_than';
        value: string | number | boolean;
      }>;
      variation: string;
      weight: number;
    }>;
    fallback: string;
  };
  rolloutPercentage: number;
  environment: 'development' | 'staging' | 'production';
  tags: string[];
  createdBy: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  scheduledStart?: Date | Timestamp;
  scheduledEnd?: Date | Timestamp;
  metrics: {
    totalEvaluations: number;
    uniqueUsers: number;
    conversionRate: number;
    performanceImpact: number;
  };
}

export interface FeatureFlagEvaluation {
  flagKey: string;
  userId: string;
  userEmail?: string;
  variation: string;
  value: string | number | boolean | object | null;
  evaluatedAt: Date | Timestamp;
  context: Record<string, unknown>;
}

class AdvancedFeatureFlagService {
  private readonly COLLECTION_NAME = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_advanced_feature_flags`;
  private readonly EVALUATIONS_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_feature_flag_evaluations`;

  // Create a new feature flag
  async createFeatureFlag(
    flag: Omit<
      AdvancedFeatureFlag,
      'id' | 'createdAt' | 'updatedAt' | 'metrics'
    >
  ): Promise<string> {
    try {
      const flagWithMetadata = {
        ...flag,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        metrics: {
          totalEvaluations: 0,
          uniqueUsers: 0,
          conversionRate: 0,
          performanceImpact: 0,
        },
      };

      const docRef = await addDoc(
        collection(db, this.COLLECTION_NAME),
        flagWithMetadata
      );
      consoleLog('Advanced feature flag created successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      consoleError('Error creating advanced feature flag:', error);
      throw error;
    }
  }

  // Get all feature flags
  async getFeatureFlags(environment?: string): Promise<AdvancedFeatureFlag[]> {
    try {
      let q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );

      if (environment) {
        q = query(
          collection(db, this.COLLECTION_NAME),
          where('environment', '==', environment),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const flags: AdvancedFeatureFlag[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        flags.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          scheduledStart:
            data.scheduledStart?.toDate?.() || data.scheduledStart,
          scheduledEnd: data.scheduledEnd?.toDate?.() || data.scheduledEnd,
        } as AdvancedFeatureFlag);
      });

      return flags;
    } catch (error) {
      consoleError('Error fetching advanced feature flags:', error);
      // Return mock data as fallback
      return this.getMockFeatureFlags();
    }
  }

  // Get active feature flags for a specific environment
  async getActiveFeatureFlags(
    environment: string
  ): Promise<AdvancedFeatureFlag[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('environment', '==', environment),
        where('status', '==', 'active'),
        orderBy('name')
      );

      const querySnapshot = await getDocs(q);
      const flags: AdvancedFeatureFlag[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        flags.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          scheduledStart:
            data.scheduledStart?.toDate?.() || data.scheduledStart,
          scheduledEnd: data.scheduledEnd?.toDate?.() || data.scheduledEnd,
        } as AdvancedFeatureFlag);
      });

      return flags;
    } catch (error) {
      consoleError('Error fetching active advanced feature flags:', error);
      return [];
    }
  }

  // Update a feature flag
  async updateFeatureFlag(
    flagId: string,
    updates: Partial<AdvancedFeatureFlag>
  ): Promise<void> {
    try {
      const flagRef = doc(db, this.COLLECTION_NAME, flagId);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      // Remove undefined fields
      Object.keys(updateData).forEach((key) => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });

      await updateDoc(flagRef, updateData);
      consoleLog('Advanced feature flag updated successfully:', flagId);
    } catch (error) {
      consoleError('Error updating advanced feature flag:', error);
      throw error;
    }
  }

  // Delete a feature flag
  async deleteFeatureFlag(flagId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION_NAME, flagId));
      consoleLog('Advanced feature flag deleted successfully:', flagId);
    } catch (error) {
      consoleError('Error deleting advanced feature flag:', error);
      throw error;
    }
  }

  // Subscribe to feature flag changes
  subscribeToFeatureFlags(
    callback: (flags: AdvancedFeatureFlag[]) => void,
    environment?: string
  ): () => void {
    try {
      let q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );

      if (environment) {
        q = query(
          collection(db, this.COLLECTION_NAME),
          where('environment', '==', environment),
          orderBy('createdAt', 'desc')
        );
      }

      return onSnapshot(q, (querySnapshot) => {
        const flags: AdvancedFeatureFlag[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          flags.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
            scheduledStart:
              data.scheduledStart?.toDate?.() || data.scheduledStart,
            scheduledEnd: data.scheduledEnd?.toDate?.() || data.scheduledEnd,
          } as AdvancedFeatureFlag);
        });
        callback(flags);
      });
    } catch (error) {
      consoleError('Error subscribing to advanced feature flags:', error);
      // Return mock data as fallback
      callback(this.getMockFeatureFlags());
      return () => {}; // Empty unsubscribe function
    }
  }

  // Evaluate a feature flag for a user
  async evaluateFlag(
    flagKey: string,
    userId: string,
    userContext: Record<string, unknown> = {}
  ): Promise<{ value: unknown; variation: string }> {
    try {
      // Get the flag by key
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('key', '==', flagKey),
        where('status', '==', 'active')
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error(
          `Advanced feature flag '${flagKey}' not found or not active`
        );
      }

      const flagDoc = querySnapshot.docs[0];
      const flag = flagDoc.data() as AdvancedFeatureFlag;

      // Simple evaluation logic
      let selectedVariation = flag.variations[0]; // Default to first variation

      if (flag.targeting.enabled && flag.targeting.rules.length > 0) {
        // Apply targeting rules
        for (const rule of flag.targeting.rules) {
          if (this.evaluateRule(rule, userContext)) {
            selectedVariation =
              flag.variations.find((v) => v.name === rule.variation) ||
              selectedVariation;
            break;
          }
        }
      } else {
        // Simple percentage rollout
        const userHash = this.hashString(userId + flagKey);
        const percentage = userHash % 100;

        if (percentage < flag.rolloutPercentage) {
          // Find the appropriate variation based on weights
          let totalWeight = 0;
          for (const variation of flag.variations) {
            totalWeight += variation.weight;
            if (percentage < totalWeight) {
              selectedVariation = variation;
              break;
            }
          }
        }
      }

      // Record the evaluation
      await this.recordEvaluation(
        flagKey,
        userId,
        selectedVariation.name,
        selectedVariation.value,
        userContext
      );

      return {
        value: selectedVariation.value,
        variation: selectedVariation.name,
      };
    } catch (error) {
      consoleError('Error evaluating advanced feature flag:', error);
      throw error;
    }
  }

  // Simple rule evaluation
  private evaluateRule(
    rule: AdvancedFeatureFlag['targeting']['rules'][0],
    context: Record<string, unknown>
  ): boolean {
    return rule.conditions.every((condition) => {
      const contextValue = context[condition.attribute];

      switch (condition.operator) {
        case 'equals':
          return contextValue === condition.value;
        case 'not_equals':
          return contextValue !== condition.value;
        case 'contains':
          return String(contextValue).includes(String(condition.value));
        case 'greater_than':
          return Number(contextValue) > Number(condition.value);
        case 'less_than':
          return Number(contextValue) < Number(condition.value);
        default:
          return false;
      }
    });
  }

  // Simple hash function for user bucketing
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Record flag evaluation for analytics
  private async recordEvaluation(
    flagKey: string,
    userId: string,
    variation: string,
    value: unknown,
    context: Record<string, unknown>
  ): Promise<void> {
    try {
      const evaluation: Omit<FeatureFlagEvaluation, 'id'> = {
        flagKey,
        userId,
        userEmail: context.email as string | undefined,
        variation,
        value: value as string | number | boolean | object | null,
        evaluatedAt: serverTimestamp(),
        context,
      };

      await addDoc(collection(db, this.EVALUATIONS_COLLECTION), evaluation);
    } catch (error) {
      consoleError('Error recording flag evaluation:', error);
      // Don't throw here as it's not critical for flag evaluation
    }
  }

  // Get flag analytics
  async getFlagAnalytics(
    flagKey: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalEvaluations: number;
    uniqueUsers: number;
    variationBreakdown: Record<string, number>;
  }> {
    try {
      let q = query(
        collection(db, this.EVALUATIONS_COLLECTION),
        where('flagKey', '==', flagKey),
        orderBy('evaluatedAt', 'desc')
      );

      // Add date filters if provided
      if (startDate && endDate) {
        q = query(
          collection(db, this.EVALUATIONS_COLLECTION),
          where('flagKey', '==', flagKey),
          where('evaluatedAt', '>=', Timestamp.fromDate(startDate)),
          where('evaluatedAt', '<=', Timestamp.fromDate(endDate)),
          orderBy('evaluatedAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const evaluations: FeatureFlagEvaluation[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        evaluations.push({
          ...data,
          evaluatedAt: data.evaluatedAt?.toDate?.() || data.evaluatedAt,
        } as FeatureFlagEvaluation);
      });

      const uniqueUsers = new Set(evaluations.map((e) => e.userId)).size;
      const variationBreakdown: Record<string, number> = {};

      evaluations.forEach((evaluation) => {
        variationBreakdown[evaluation.variation] =
          (variationBreakdown[evaluation.variation] || 0) + 1;
      });

      return {
        totalEvaluations: evaluations.length,
        uniqueUsers,
        variationBreakdown,
      };
    } catch (error) {
      consoleError('Error getting flag analytics:', error);
      return {
        totalEvaluations: 0,
        uniqueUsers: 0,
        variationBreakdown: {},
      };
    }
  }

  // Mock data for fallback
  private getMockFeatureFlags(): AdvancedFeatureFlag[] {
    return [
      {
        id: '1',
        name: 'New Chat Interface',
        key: 'new_chat_interface',
        description: 'Enable the new chat interface with improved UX',
        type: 'boolean' as const,
        status: 'active' as const,
        defaultValue: false,
        variations: [
          {
            name: 'Enabled',
            value: true,
            description: 'Show new interface',
            weight: 50,
          },
          {
            name: 'Disabled',
            value: false,
            description: 'Show old interface',
            weight: 50,
          },
        ],
        targeting: {
          enabled: true,
          rules: [
            {
              id: 'premium_users',
              name: 'Premium Users',
              conditions: [
                {
                  attribute: 'subscriptionPlan',
                  operator: 'equals' as const,
                  value: 'PREMIUM',
                },
              ],
              variation: 'Enabled',
              weight: 100,
            },
          ],
          fallback: 'Disabled',
        },
        rolloutPercentage: 25,
        environment: 'production' as const,
        tags: ['ui', 'chat', 'experimental'],
        createdBy: 'admin@example.com',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        metrics: {
          totalEvaluations: 15420,
          uniqueUsers: 1247,
          conversionRate: 0.12,
          performanceImpact: 0.05,
        },
      },
      {
        id: '2',
        name: 'AI Response Limit',
        key: 'ai_response_limit',
        description: 'Set maximum number of AI responses per user per day',
        type: 'number' as const,
        status: 'active' as const,
        defaultValue: 10,
        variations: [
          {
            name: 'Free Tier',
            value: 5,
            description: 'Limited responses',
            weight: 60,
          },
          {
            name: 'Pro Tier',
            value: 50,
            description: 'Increased limit',
            weight: 30,
          },
          {
            name: 'Unlimited',
            value: -1,
            description: 'No limit',
            weight: 10,
          },
        ],
        targeting: {
          enabled: true,
          rules: [
            {
              id: 'subscription_based',
              name: 'Subscription Based',
              conditions: [
                {
                  attribute: 'subscriptionPlan',
                  operator: 'equals' as const,
                  value: 'FREE',
                },
              ],
              variation: 'Free Tier',
              weight: 100,
            },
          ],
          fallback: 'Pro Tier',
        },
        rolloutPercentage: 100,
        environment: 'production' as const,
        tags: ['ai', 'limits', 'subscription'],
        createdBy: 'admin@example.com',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        metrics: {
          totalEvaluations: 45670,
          uniqueUsers: 2134,
          conversionRate: 0.08,
          performanceImpact: 0.02,
        },
      },
    ];
  }
}

export const advancedFeatureFlagService = new AdvancedFeatureFlagService();
export default advancedFeatureFlagService;
