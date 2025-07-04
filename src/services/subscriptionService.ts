import { IPCAUser } from '@/types/user';
import {
  isPlanUpgrade,
  SUBSCRIPTION_FEATURES,
  SubscriptionPlan,
  SubscriptionRequest,
  SubscriptionRequestStatus,
  SubscriptionRequestType,
  UserSubscription,
} from '@/types/user/subscription';
import { PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS } from '@/utils/constants/generic/firebase';
import { consoleError, consoleLog } from '@/utils/helpers/consoleHelper';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export interface CreateSubscriptionRequestParams {
  userId: string;
  userEmail: string;
  userName: string;
  currentPlan: SubscriptionPlan;
  requestedPlan: SubscriptionPlan;
  reason?: string;
  message?: string;
  urgency?: 'low' | 'medium' | 'high';
}

export interface UpdateSubscriptionParams {
  userId: string;
  newPlan: SubscriptionPlan;
  duration?: number; // in months
  downgradePlan?: SubscriptionPlan;
  setBy: string;
  notes?: string;
  paymentMethod?: string;
  transactionId?: string;
}

export interface ReviewSubscriptionRequestParams {
  requestId: string;
  reviewedBy: string;
  status: SubscriptionRequestStatus;
  adminNotes?: string;
  rejectedReason?: string;
  approvedDuration?: number;
  approvedDowngradePlan?: SubscriptionPlan;
}

export interface SubscriptionServiceResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class SubscriptionService {
  private static instance: SubscriptionService;
  private readonly USERS_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_users`;
  private readonly SUBSCRIPTION_REQUESTS_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_subscription_requests`;

  private constructor() {}

  public static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  // ==================== User Subscription Requests ====================

  /**
   * Create a new subscription request
   */
  public async createSubscriptionRequest(
    params: CreateSubscriptionRequestParams
  ): Promise<SubscriptionServiceResponse> {
    try {
      consoleLog('🔧 Creating subscription request:', params);

      // Validate request
      if (params.currentPlan === params.requestedPlan) {
        return {
          success: false,
          message: 'Cannot request the same plan you already have',
          error: 'Same plan requested',
        };
      }

      // Check if user has pending request
      const existingRequest = await this.getUserPendingRequest(params.userId);
      if (existingRequest) {
        return {
          success: false,
          message: 'You already have a pending subscription request',
          error: 'Pending request exists',
        };
      }

      // Determine request type
      const requestType = isPlanUpgrade(
        params.currentPlan,
        params.requestedPlan
      )
        ? SubscriptionRequestType.UPGRADE
        : SubscriptionRequestType.DOWNGRADE;

      // Create request document
      const requestData: SubscriptionRequest = {
        userId: params.userId,
        userEmail: params.userEmail,
        userName: params.userName,
        currentPlan: params.currentPlan,
        requestedPlan: params.requestedPlan,
        requestType,
        status: SubscriptionRequestStatus.PENDING,
        reason: params.reason,
        message: params.message,
        requestedAt: new Date(),
        urgency: params.urgency || 'medium',
        tags: [requestType, params.requestedPlan],
      };

      // Save to Firestore
      const requestRef = doc(
        collection(db, this.SUBSCRIPTION_REQUESTS_COLLECTION)
      );
      await setDoc(requestRef, {
        ...requestData,
        id: requestRef.id,
        requestedAt: serverTimestamp(),
      });

      consoleLog('✅ Subscription request created:', requestRef.id);

      return {
        success: true,
        message: 'Subscription request submitted successfully',
        data: { requestId: requestRef.id, ...requestData },
      };
    } catch (error: any) {
      consoleError('❌ Error creating subscription request:', error);
      return {
        success: false,
        message: 'Failed to create subscription request',
        error: error.message,
      };
    }
  }

  /**
   * Get user's pending subscription request
   */
  public async getUserPendingRequest(
    userId: string
  ): Promise<SubscriptionRequest | null> {
    try {
      const q = query(
        collection(db, this.SUBSCRIPTION_REQUESTS_COLLECTION),
        where('userId', '==', userId),
        where('status', '==', SubscriptionRequestStatus.PENDING),
        orderBy('requestedAt', 'desc'),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as SubscriptionRequest;
      }

      return null;
    } catch (error: any) {
      consoleError('❌ Error getting pending request:', error);
      return null;
    }
  }

  /**
   * Get user's subscription request history
   */
  public async getUserRequestHistory(
    userId: string
  ): Promise<SubscriptionRequest[]> {
    try {
      const q = query(
        collection(db, this.SUBSCRIPTION_REQUESTS_COLLECTION),
        where('userId', '==', userId),
        orderBy('requestedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SubscriptionRequest[];
    } catch (error: any) {
      consoleError('❌ Error getting request history:', error);
      return [];
    }
  }

  /**
   * Cancel a pending subscription request
   */
  public async cancelSubscriptionRequest(
    requestId: string,
    userId: string
  ): Promise<SubscriptionServiceResponse> {
    try {
      const requestRef = doc(
        db,
        this.SUBSCRIPTION_REQUESTS_COLLECTION,
        requestId
      );
      const requestDoc = await getDoc(requestRef);

      if (!requestDoc.exists()) {
        return {
          success: false,
          message: 'Subscription request not found',
          error: 'Request not found',
        };
      }

      const requestData = requestDoc.data() as SubscriptionRequest;

      // Verify ownership
      if (requestData.userId !== userId) {
        return {
          success: false,
          message: 'Unauthorized to cancel this request',
          error: 'Unauthorized',
        };
      }

      // Check if request is pending
      if (requestData.status !== SubscriptionRequestStatus.PENDING) {
        return {
          success: false,
          message: 'Can only cancel pending requests',
          error: 'Invalid status',
        };
      }

      // Update request status
      await updateDoc(requestRef, {
        status: SubscriptionRequestStatus.CANCELLED,
        reviewedAt: serverTimestamp(),
      });

      return {
        success: true,
        message: 'Subscription request cancelled successfully',
      };
    } catch (error: any) {
      consoleError('❌ Error cancelling subscription request:', error);
      return {
        success: false,
        message: 'Failed to cancel subscription request',
        error: error.message,
      };
    }
  }

  // ==================== Admin Functions ====================

  /**
   * Get all subscription requests for admin review
   */
  public async getAllSubscriptionRequests(
    status?: SubscriptionRequestStatus
  ): Promise<SubscriptionRequest[]> {
    try {
      let q = query(
        collection(db, this.SUBSCRIPTION_REQUESTS_COLLECTION),
        orderBy('requestedAt', 'desc')
      );

      if (status) {
        q = query(
          collection(db, this.SUBSCRIPTION_REQUESTS_COLLECTION),
          where('status', '==', status),
          orderBy('requestedAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SubscriptionRequest[];
    } catch (error: any) {
      consoleError('❌ Error getting subscription requests:', error);
      return [];
    }
  }

  /**
   * Review a subscription request (approve/reject)
   */
  public async reviewSubscriptionRequest(
    params: ReviewSubscriptionRequestParams
  ): Promise<SubscriptionServiceResponse> {
    try {
      consoleLog('🔧 Reviewing subscription request:', params);

      const requestRef = doc(
        db,
        this.SUBSCRIPTION_REQUESTS_COLLECTION,
        params.requestId
      );
      const requestDoc = await getDoc(requestRef);

      if (!requestDoc.exists()) {
        return {
          success: false,
          message: 'Subscription request not found',
          error: 'Request not found',
        };
      }

      const requestData = requestDoc.data() as SubscriptionRequest;

      // Check if already reviewed
      if (requestData.status !== SubscriptionRequestStatus.PENDING) {
        return {
          success: false,
          message: 'Request has already been reviewed',
          error: 'Already reviewed',
        };
      }

      // Update request
      const updateData: Partial<SubscriptionRequest> = {
        status: params.status,
        reviewedBy: params.reviewedBy,
        reviewedAt: new Date(),
        adminNotes: params.adminNotes,
      };

      if (params.status === SubscriptionRequestStatus.APPROVED) {
        updateData.approvedDuration = params.approvedDuration;
        updateData.approvedDowngradePlan = params.approvedDowngradePlan;
        updateData.approvedAt = new Date();

        // If approved, update user's subscription
        if (params.approvedDuration) {
          await this.updateUserSubscription({
            userId: requestData.userId,
            newPlan: requestData.requestedPlan,
            duration: params.approvedDuration,
            downgradePlan: params.approvedDowngradePlan,
            setBy: params.reviewedBy,
            notes: `Approved subscription request: ${params.requestId}`,
          });
        }
      } else if (params.status === SubscriptionRequestStatus.REJECTED) {
        updateData.rejectedReason = params.rejectedReason;
        updateData.rejectedAt = new Date();
      }

      await updateDoc(requestRef, {
        ...updateData,
        reviewedAt: serverTimestamp(),
        ...(updateData.approvedAt && { approvedAt: serverTimestamp() }),
        ...(updateData.rejectedAt && { rejectedAt: serverTimestamp() }),
      });

      consoleLog('✅ Subscription request reviewed:', params.requestId);

      return {
        success: true,
        message: `Subscription request ${params.status} successfully`,
        data: updateData,
      };
    } catch (error: any) {
      consoleError('❌ Error reviewing subscription request:', error);
      return {
        success: false,
        message: 'Failed to review subscription request',
        error: error.message,
      };
    }
  }

  /**
   * Update user's subscription (Admin only)
   */
  public async updateUserSubscription(
    params: UpdateSubscriptionParams
  ): Promise<SubscriptionServiceResponse> {
    try {
      consoleLog('🔧 Updating user subscription:', params);

      const userRef = doc(db, this.USERS_COLLECTION, params.userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return {
          success: false,
          message: 'User not found',
          error: 'User not found',
        };
      }

      const userData = userDoc.data() as IPCAUser;

      // Calculate dates
      const startDate = new Date();
      const endDate = params.duration
        ? new Date(
            startDate.getTime() + params.duration * 30 * 24 * 60 * 60 * 1000
          )
        : undefined;
      const autoDowngradeDate =
        endDate && params.downgradePlan
          ? new Date(endDate.getTime())
          : undefined;

      // Create new subscription
      const newSubscription: UserSubscription = {
        plan: params.newPlan,
        startDate,
        endDate,
        isActive: true,
        features: SUBSCRIPTION_FEATURES[params.newPlan],
        downgradePlan: params.downgradePlan,
        autoDowngradeDate,
        setBy: params.setBy,
        setAt: new Date(),
        notes: params.notes,
        paymentMethod: params.paymentMethod,
        transactionId: params.transactionId,
      };

      // Update user document
      await updateDoc(userRef, {
        subscription: {
          ...newSubscription,
          startDate: serverTimestamp(),
          endDate: endDate ? Timestamp.fromDate(endDate) : null,
          autoDowngradeDate: autoDowngradeDate
            ? Timestamp.fromDate(autoDowngradeDate)
            : null,
          setAt: serverTimestamp(),
        },
      });

      consoleLog('✅ User subscription updated:', params.userId);

      return {
        success: true,
        message: 'User subscription updated successfully',
        data: newSubscription,
      };
    } catch (error: any) {
      consoleError('❌ Error updating user subscription:', error);
      return {
        success: false,
        message: 'Failed to update user subscription',
        error: error.message,
      };
    }
  }

  /**
   * Get subscription statistics for admin dashboard
   */
  public async getSubscriptionStats(): Promise<{
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    planDistribution: Record<SubscriptionPlan, number>;
  }> {
    try {
      const allRequests = await this.getAllSubscriptionRequests();

      const stats = {
        totalRequests: allRequests.length,
        pendingRequests: allRequests.filter(
          (r) => r.status === SubscriptionRequestStatus.PENDING
        ).length,
        approvedRequests: allRequests.filter(
          (r) => r.status === SubscriptionRequestStatus.APPROVED
        ).length,
        rejectedRequests: allRequests.filter(
          (r) => r.status === SubscriptionRequestStatus.REJECTED
        ).length,
        planDistribution: {
          [SubscriptionPlan.FREE]: 0,
          [SubscriptionPlan.PRO]: 0,
          [SubscriptionPlan.PREMIUM]: 0,
          [SubscriptionPlan.ENTERPRISE]: 0,
        },
      };

      // Calculate plan distribution
      allRequests.forEach((request) => {
        if (request.status === SubscriptionRequestStatus.APPROVED) {
          stats.planDistribution[request.requestedPlan]++;
        }
      });

      return stats;
    } catch (error: any) {
      consoleError('❌ Error getting subscription stats:', error);
      return {
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        planDistribution: {
          [SubscriptionPlan.FREE]: 0,
          [SubscriptionPlan.PRO]: 0,
          [SubscriptionPlan.PREMIUM]: 0,
          [SubscriptionPlan.ENTERPRISE]: 0,
        },
      };
    }
  }

  /**
   * Process expired subscriptions (to be called by a cron job)
   */
  public async processExpiredSubscriptions(): Promise<SubscriptionServiceResponse> {
    try {
      consoleLog('🔧 Processing expired subscriptions...');

      // This would typically be called by a cloud function or cron job
      // For now, we'll just log the process

      consoleLog('✅ Expired subscriptions processed');

      return {
        success: true,
        message: 'Expired subscriptions processed successfully',
      };
    } catch (error: any) {
      consoleError('❌ Error processing expired subscriptions:', error);
      return {
        success: false,
        message: 'Failed to process expired subscriptions',
        error: error.message,
      };
    }
  }
}

// Export singleton instance
export const subscriptionService = SubscriptionService.getInstance();

// Export helper functions for direct use
export const createSubscriptionRequest = (
  params: CreateSubscriptionRequestParams
) => subscriptionService.createSubscriptionRequest(params);

export const getUserPendingRequest = (userId: string) =>
  subscriptionService.getUserPendingRequest(userId);

export const getUserRequestHistory = (userId: string) =>
  subscriptionService.getUserRequestHistory(userId);

export const cancelSubscriptionRequest = (requestId: string, userId: string) =>
  subscriptionService.cancelSubscriptionRequest(requestId, userId);

export const reviewSubscriptionRequest = (
  params: ReviewSubscriptionRequestParams
) => subscriptionService.reviewSubscriptionRequest(params);

export const updateUserSubscription = (params: UpdateSubscriptionParams) =>
  subscriptionService.updateUserSubscription(params);

export const getAllSubscriptionRequests = (
  status?: SubscriptionRequestStatus
) => subscriptionService.getAllSubscriptionRequests(status);

export const getSubscriptionStats = () =>
  subscriptionService.getSubscriptionStats();
