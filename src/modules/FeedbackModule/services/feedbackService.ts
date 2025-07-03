import { User } from 'firebase/auth';
import {
  addDoc,
  collection,
  Firestore,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { FeedbackConfig, FeedbackRating } from '../types/feedback.types';
import { getPageInfo, getSessionId } from '../utils/constants';

class FeedbackService {
  private db: Firestore | null = null;
  private config: FeedbackConfig = {};

  constructor(db?: Firestore, config?: FeedbackConfig) {
    this.db = db || null;
    this.config = config || {};
  }

  // Initialize with Firestore instance
  initialize(db: Firestore, config?: FeedbackConfig) {
    this.db = db;
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  // Submit feedback to Firestore
  async submitFeedback(
    rating: number,
    emoji: string,
    label: string,
    message?: string,
    user?: User | null,
    metadata?: Record<string, any>
  ): Promise<string> {
    if (!this.db) {
      throw new Error(
        'Firestore not initialized. Please call initialize() first.'
      );
    }

    const collectionName = this.config.collectionName || 'user_feedback';
    const pageInfo = getPageInfo();
    const sessionId = await getSessionId();

    const feedbackData: Omit<FeedbackRating, 'id'> = {
      rating,
      emoji,
      label,
      message: message || '',
      userId: user?.uid || null,
      userEmail: user?.email || null,
      userName: user?.displayName || null,
      isAuthenticated: !!user,
      timestamp: new Date(),
      userAgent: pageInfo.userAgent,
      url: pageInfo.url,
      sessionId,
      metadata: {
        ...pageInfo,
        ...metadata,
      },
    };

    try {
      const docRef = await addDoc(collection(this.db, collectionName), {
        ...feedbackData,
        timestamp: serverTimestamp(), // Use server timestamp for consistency
        createdAt: serverTimestamp(),
      });

      // Call success callback if provided
      if (this.config.onSuccess) {
        this.config.onSuccess();
      }

      // Call custom submit callback if provided
      if (this.config.onSubmit) {
        this.config.onSubmit({ ...feedbackData, id: docRef.id });
      }

      return docRef.id;
    } catch (error) {
      console.error('Error submitting feedback:', error);

      // Call error callback if provided
      if (this.config.onError) {
        this.config.onError(error as Error);
      }

      throw error;
    }
  }

  // Get recent feedback for analytics (optional - for admin use)
  async getRecentFeedback(limitCount: number = 10): Promise<FeedbackRating[]> {
    if (!this.db) {
      throw new Error('Firestore not initialized.');
    }

    const collectionName = this.config.collectionName || 'user_feedback';

    try {
      const q = query(
        collection(this.db, collectionName),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const feedback: FeedbackRating[] = [];

      querySnapshot.forEach((doc) => {
        feedback.push({
          id: doc.id,
          ...doc.data(),
        } as FeedbackRating);
      });

      return feedback;
    } catch (error) {
      console.error('Error fetching feedback:', error);
      throw error;
    }
  }

  // Get feedback by session (for preventing spam)
  async getFeedbackBySession(sessionId: string): Promise<FeedbackRating[]> {
    if (!this.db) {
      throw new Error('Firestore not initialized.');
    }

    const collectionName = this.config.collectionName || 'user_feedback';

    try {
      const q = query(
        collection(this.db, collectionName),
        where('sessionId', '==', sessionId),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const feedback: FeedbackRating[] = [];

      querySnapshot.forEach((doc) => {
        feedback.push({
          id: doc.id,
          ...doc.data(),
        } as FeedbackRating);
      });

      return feedback;
    } catch (error) {
      console.error('Error fetching session feedback:', error);
      throw error;
    }
  }

  // Get feedback statistics (for analytics)
  async getFeedbackStats(): Promise<{
    totalCount: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
  }> {
    if (!this.db) {
      throw new Error('Firestore not initialized.');
    }

    const collectionName = this.config.collectionName || 'user_feedback';

    try {
      const querySnapshot = await getDocs(collection(this.db, collectionName));
      const ratings: number[] = [];
      const ratingDistribution: Record<number, number> = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data() as FeedbackRating;
        ratings.push(data.rating);
        ratingDistribution[data.rating] =
          (ratingDistribution[data.rating] || 0) + 1;
      });

      const totalCount = ratings.length;
      const averageRating =
        totalCount > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / totalCount
          : 0;

      return {
        totalCount,
        averageRating: Math.round(averageRating * 100) / 100,
        ratingDistribution,
      };
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
      throw error;
    }
  }

  // Check if user has recently submitted feedback (spam prevention)
  async hasRecentFeedback(minutes: number = 30): Promise<boolean> {
    const sessionId = await getSessionId();

    try {
      const sessionFeedback = await this.getFeedbackBySession(sessionId);

      if (sessionFeedback.length === 0) return false;

      const recentFeedback = sessionFeedback.find((feedback) => {
        const feedbackTime = feedback.timestamp.getTime
          ? feedback.timestamp.getTime()
          : new Date(feedback.timestamp).getTime();
        const timeWindow = minutes * 60 * 1000;
        return Date.now() - feedbackTime < timeWindow;
      });

      return !!recentFeedback;
    } catch (error) {
      console.error('Error checking recent feedback:', error);
      return false; // Allow feedback if we can't check
    }
  }
}

// Export singleton instance
export const feedbackService = new FeedbackService();

// Export class for custom instances
export { FeedbackService };
export default feedbackService;
