import {
  FeedbackConfig,
  FeedbackRating,
} from '@/modules/FeedbackModule/types/feedback.types';
import { unifiedAuthService } from '@/services/authService';
import { PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS } from '@/utils/constants/generic/firebase';
import { consoleError, consoleLog } from '@/utils/helpers/consoleHelper';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

// Embed Configuration Interface
export interface FeedbackEmbedConfig extends FeedbackConfig {
  id?: string;
  embedId: string;
  userId: string;
  userEmail: string;
  name: string;
  description?: string;
  isActive: boolean;
  domains?: string[]; // Allowed domains
  createdAt: Date;
  updatedAt: Date;
  // Analytics
  totalViews?: number;
  totalSubmissions?: number;
  averageRating?: number;
}

// Embed Submission Interface
export interface FeedbackEmbedSubmission extends Omit<FeedbackRating, 'id'> {
  id?: string;
  embedId: string;
  sessionId: string;
  websiteUrl: string;
  origin: string;
  referrer?: string;
  userAgent?: string;
  userMetadata?: Record<string, unknown>;
  createdAt: Date;
  // IP and location data (for analytics)
  ipAddress?: string;
  country?: string;
  city?: string;
}

class FeedbackEmbedService {
  private readonly EMBED_CONFIGS_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_feedback_embed_configs`;
  private readonly EMBED_SUBMISSIONS_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_feedback_embed_submissions`;

  // Create new feedback embed configuration
  async createEmbedConfig(
    config: Omit<
      FeedbackEmbedConfig,
      | 'id'
      | 'embedId'
      | 'createdAt'
      | 'updatedAt'
      | 'totalViews'
      | 'totalSubmissions'
      | 'averageRating'
    >
  ): Promise<string> {
    try {
      const currentUser = unifiedAuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be authenticated to create embed configs');
      }

      // Generate unique embed ID
      const embedId = this.generateEmbedId();

      const embedConfig: Omit<FeedbackEmbedConfig, 'id'> = {
        ...config,
        embedId,
        userId: currentUser.uid,
        userEmail: currentUser.email!,
        createdAt: new Date(),
        updatedAt: new Date(),
        totalViews: 0,
        totalSubmissions: 0,
        averageRating: 0,
      };

      const docRef = await addDoc(
        collection(db, this.EMBED_CONFIGS_COLLECTION),
        {
          ...embedConfig,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );

      consoleLog('✅ Feedback embed config created:', docRef.id);
      return docRef.id;
    } catch (error) {
      consoleError('❌ Error creating feedback embed config:', error);
      throw error;
    }
  }

  // Get embed configuration by embed ID
  async getEmbedConfig(embedId: string): Promise<FeedbackEmbedConfig | null> {
    try {
      const q = query(
        collection(db, this.EMBED_CONFIGS_COLLECTION),
        where('embedId', '==', embedId),
        where('isActive', '==', true)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();

      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      } as FeedbackEmbedConfig;
    } catch (error) {
      consoleError('❌ Error fetching embed config:', error);
      throw error;
    }
  }

  // Get all embed configurations for current user
  async getUserEmbedConfigs(): Promise<FeedbackEmbedConfig[]> {
    try {
      const currentUser = unifiedAuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be authenticated');
      }

      const q = query(
        collection(db, this.EMBED_CONFIGS_COLLECTION),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const configs: FeedbackEmbedConfig[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        configs.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
        } as FeedbackEmbedConfig);
      });

      return configs;
    } catch (error) {
      consoleError('❌ Error fetching user embed configs:', error);
      throw error;
    }
  }

  // Update embed configuration
  async updateEmbedConfig(
    configId: string,
    updates: Partial<FeedbackEmbedConfig>
  ): Promise<void> {
    try {
      const currentUser = unifiedAuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be authenticated');
      }

      const configRef = doc(db, this.EMBED_CONFIGS_COLLECTION, configId);
      const configDoc = await getDoc(configRef);

      if (!configDoc.exists()) {
        throw new Error('Embed configuration not found');
      }

      const configData = configDoc.data() as FeedbackEmbedConfig;
      if (configData.userId !== currentUser.uid) {
        throw new Error('Unauthorized to update this embed configuration');
      }

      await updateDoc(configRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      consoleLog('✅ Feedback embed config updated:', configId);
    } catch (error) {
      consoleError('❌ Error updating feedback embed config:', error);
      throw error;
    }
  }

  // Delete embed configuration
  async deleteEmbedConfig(configId: string): Promise<void> {
    try {
      const currentUser = unifiedAuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be authenticated');
      }

      const configRef = doc(db, this.EMBED_CONFIGS_COLLECTION, configId);
      const configDoc = await getDoc(configRef);

      if (!configDoc.exists()) {
        throw new Error('Embed configuration not found');
      }

      const configData = configDoc.data() as FeedbackEmbedConfig;
      if (configData.userId !== currentUser.uid) {
        throw new Error('Unauthorized to delete this embed configuration');
      }

      await deleteDoc(configRef);
      consoleLog('✅ Feedback embed config deleted:', configId);
    } catch (error) {
      consoleError('❌ Error deleting feedback embed config:', error);
      throw error;
    }
  }

  // Submit feedback from embed
  async submitEmbedFeedback(
    submissionData: Omit<FeedbackEmbedSubmission, 'id' | 'createdAt'>
  ): Promise<string> {
    try {
      const submission: Omit<FeedbackEmbedSubmission, 'id'> = {
        ...submissionData,
        createdAt: new Date(),
      };

      const docRef = await addDoc(
        collection(db, this.EMBED_SUBMISSIONS_COLLECTION),
        {
          ...submission,
          timestamp: serverTimestamp(),
          createdAt: serverTimestamp(),
        }
      );

      // Update embed config analytics
      await this.updateEmbedAnalytics(
        submissionData.embedId,
        submissionData.rating
      );

      consoleLog('✅ Feedback embed submission created:', docRef.id);
      return docRef.id;
    } catch (error) {
      consoleError('❌ Error submitting feedback embed:', error);
      throw error;
    }
  }

  // Get submissions for a specific embed
  async getEmbedSubmissions(
    embedId: string,
    limitCount: number = 50
  ): Promise<FeedbackEmbedSubmission[]> {
    try {
      const currentUser = unifiedAuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be authenticated');
      }

      // First verify user owns this embed
      const embedConfig = await this.getEmbedConfig(embedId);
      if (!embedConfig || embedConfig.userId !== currentUser.uid) {
        throw new Error('Unauthorized to view submissions for this embed');
      }

      const q = query(
        collection(db, this.EMBED_SUBMISSIONS_COLLECTION),
        where('embedId', '==', embedId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const submissions: FeedbackEmbedSubmission[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        submissions.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date(),
          createdAt: data.createdAt?.toDate?.() || new Date(),
        } as FeedbackEmbedSubmission);
      });

      return submissions;
    } catch (error) {
      consoleError('❌ Error fetching embed submissions:', error);
      throw error;
    }
  }

  // Get all submissions for current user
  async getUserEmbedSubmissions(
    limitCount: number = 100
  ): Promise<FeedbackEmbedSubmission[]> {
    try {
      const currentUser = unifiedAuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be authenticated');
      }

      // Get all user's embed IDs
      const userConfigs = await this.getUserEmbedConfigs();
      const embedIds = userConfigs.map((config) => config.embedId);

      if (embedIds.length === 0) {
        return [];
      }

      const q = query(
        collection(db, this.EMBED_SUBMISSIONS_COLLECTION),
        where('embedId', 'in', embedIds),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const submissions: FeedbackEmbedSubmission[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        submissions.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date(),
          createdAt: data.createdAt?.toDate?.() || new Date(),
        } as FeedbackEmbedSubmission);
      });

      return submissions;
    } catch (error) {
      consoleError('❌ Error fetching user embed submissions:', error);
      throw error;
    }
  }

  // Update embed analytics
  private async updateEmbedAnalytics(
    embedId: string,
    rating: number
  ): Promise<void> {
    try {
      const q = query(
        collection(db, this.EMBED_CONFIGS_COLLECTION),
        where('embedId', '==', embedId)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data() as FeedbackEmbedConfig;

      const currentTotal = data.totalSubmissions || 0;
      const currentAverage = data.averageRating || 0;

      // Calculate new average
      const newTotal = currentTotal + 1;
      const newAverage = (currentAverage * currentTotal + rating) / newTotal;

      await updateDoc(doc.ref, {
        totalSubmissions: newTotal,
        averageRating: Math.round(newAverage * 100) / 100,
        updatedAt: serverTimestamp(),
      });

      consoleLog('✅ Embed analytics updated:', embedId);
    } catch (error) {
      consoleError('❌ Error updating embed analytics:', error);
      // Don't throw error as this is not critical
    }
  }

  // Generate unique embed ID
  private generateEmbedId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `feedback_${timestamp}_${randomPart}`;
  }

  // Generate embed code
  generateEmbedCode(
    embedId: string,
    options: {
      position?: string;
      theme?: string;
      autoShow?: boolean;
      containerId?: string;
    } = {}
  ): string {
    const baseUrl = window.location.origin;
    const {
      position = 'bottom-right',
      theme = 'auto',
      autoShow = false,
      containerId = 'body',
    } = options;

    return `<!-- AI Feedback Widget -->
<script src="${baseUrl}/embed/feedback-widget.js"></script>
<script>
  AIFeedbackWidget.init({
    embedId: '${embedId}',
    containerId: '${containerId}',
    position: '${position}',
    theme: '${theme}',
    autoShow: ${autoShow},
    baseUrl: '${baseUrl}'
  });
</script>`;
  }

  // Get embed analytics
  async getEmbedAnalytics(embedId: string): Promise<{
    totalViews: number;
    totalSubmissions: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
    recentSubmissions: FeedbackEmbedSubmission[];
  }> {
    try {
      const currentUser = unifiedAuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be authenticated');
      }

      const embedConfig = await this.getEmbedConfig(embedId);
      if (!embedConfig || embedConfig.userId !== currentUser.uid) {
        throw new Error('Unauthorized to view analytics for this embed');
      }

      const submissions = await this.getEmbedSubmissions(embedId, 1000);

      // Calculate rating distribution
      const ratingDistribution: Record<number, number> = {};
      submissions.forEach((submission) => {
        ratingDistribution[submission.rating] =
          (ratingDistribution[submission.rating] || 0) + 1;
      });

      return {
        totalViews: embedConfig.totalViews || 0,
        totalSubmissions: embedConfig.totalSubmissions || 0,
        averageRating: embedConfig.averageRating || 0,
        ratingDistribution,
        recentSubmissions: submissions.slice(0, 10),
      };
    } catch (error) {
      consoleError('❌ Error fetching embed analytics:', error);
      throw error;
    }
  }
}

export const feedbackEmbedService = new FeedbackEmbedService();
