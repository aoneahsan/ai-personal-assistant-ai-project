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
  updateDoc,
  where,
} from 'firebase/firestore';
import { SystemSubscriptionPlan } from '../types/system/configurations';
import { db } from './firebase';
import { systemConfigService } from './systemConfigurationService';

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

  // ==================== Dynamic Configuration Helpers ====================

  /**
   * Get dynamic subscription plans from system config
   */
  private getDynamicSubscriptionPlans(): SystemSubscriptionPlan[] {
    const config = systemConfigService.getConfiguration();
    return config.subscriptionPlans.filter((plan) => plan.isActive);
  }

  /**
   * Map system plan name to SubscriptionPlan enum for backward compatibility
   */
  private mapSystemPlanToSubscriptionPlan(
    systemPlanName: string
  ): SubscriptionPlan | null {
    const planMap: Record<string, SubscriptionPlan> = {
      FREE: SubscriptionPlan.FREE,
      PRO: SubscriptionPlan.PRO,
      ENTERPRISE: SubscriptionPlan.ENTERPRISE,
    };

    return planMap[systemPlanName.toUpperCase()] || null;
  }

  /**
   * Get plan details from dynamic configuration
   */
  public getActivePlans(): SystemSubscriptionPlan[] {
    return this.getDynamicSubscriptionPlans();
  }

  /**
   * Get plan by name from dynamic configuration
   */
  public getPlanByName(planName: string): SystemSubscriptionPlan | null {
    const plans = this.getDynamicSubscriptionPlans();
    return (
      plans.find(
        (plan) =>
          plan.name.toUpperCase() === planName.toUpperCase() ||
          plan.displayName.toLowerCase() === planName.toLowerCase()
      ) || null
    );
  }

  /**
   * Check if plan upgrade using dynamic configuration
   */
  public isDynamicPlanUpgrade(
    currentPlan: string,
    requestedPlan: string
  ): boolean {
    const plans = this.getDynamicSubscriptionPlans();
    const current = plans.find(
      (p) => p.name.toUpperCase() === currentPlan.toUpperCase()
    );
    const requested = plans.find(
      (p) => p.name.toUpperCase() === requestedPlan.toUpperCase()
    );

    if (!current || !requested) {
      // Fallback to hardcoded logic if dynamic plans not found
      return isPlanUpgrade(
        currentPlan as SubscriptionPlan,
        requestedPlan as SubscriptionPlan
      );
    }

    // Compare based on price or order
    if (current.price !== requested.price) {
      return requested.price > current.price;
    }

    // If same price, compare by order
    return requested.order > current.order;
  }

  /**
   * Get plan features from dynamic configuration
   */
  public getPlanFeatures(planName: string): string[] {
    const plan = this.getPlanByName(planName);
    return (
      plan?.features ||
      SUBSCRIPTION_FEATURES[planName as SubscriptionPlan] ||
      []
    );
  }

  /**
   * Get plan limits from dynamic configuration
   */
  public getPlanLimits(planName: string) {
    const plan = this.getPlanByName(planName);
    return plan?.limits || null;
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

      // Validate plans exist in dynamic configuration
      const currentPlanDetails = this.getPlanByName(params.currentPlan);
      const requestedPlanDetails = this.getPlanByName(params.requestedPlan);

      if (!requestedPlanDetails) {
        return {
          success: false,
          message: 'Requested subscription plan is not available',
          error: 'Invalid plan',
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

      // Determine request type using dynamic configuration
      const requestType = this.isDynamicPlanUpgrade(
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
        data: {
          requestId: requestRef.id,
          ...requestData,
          planDetails: requestedPlanDetails,
        },
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
        requestedAt:
          doc.data().requestedAt?.toDate?.() || doc.data().requestedAt,
        reviewedAt: doc.data().reviewedAt?.toDate?.() || doc.data().reviewedAt,
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
          message: 'You can only cancel your own requests',
          error: 'Unauthorized',
        };
      }

      // Check if request is still pending
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
        cancelledAt: serverTimestamp(),
        lastUpdatedAt: serverTimestamp(),
      });

      consoleLog('✅ Subscription request cancelled:', requestId);

      return {
        success: true,
        message: 'Subscription request cancelled successfully',
        data: { requestId },
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
      let q;

      if (status) {
        q = query(
          collection(db, this.SUBSCRIPTION_REQUESTS_COLLECTION),
          where('status', '==', status),
          orderBy('requestedAt', 'desc')
        );
      } else {
        q = query(
          collection(db, this.SUBSCRIPTION_REQUESTS_COLLECTION),
          orderBy('requestedAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        requestedAt:
          doc.data().requestedAt?.toDate?.() || doc.data().requestedAt,
        reviewedAt: doc.data().reviewedAt?.toDate?.() || doc.data().reviewedAt,
      })) as SubscriptionRequest[];
    } catch (error: any) {
      consoleError('❌ Error getting subscription requests:', error);
      return [];
    }
  }

  /**
   * Review and approve/reject a subscription request
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

      // Check if request is still pending
      if (requestData.status !== SubscriptionRequestStatus.PENDING) {
        return {
          success: false,
          message: 'Request has already been reviewed',
          error: 'Invalid status',
        };
      }

      // Update request status
      const updateData: any = {
        status: params.status,
        reviewedBy: params.reviewedBy,
        reviewedAt: serverTimestamp(),
        adminNotes: params.adminNotes,
        lastUpdatedAt: serverTimestamp(),
      };

      if (params.status === SubscriptionRequestStatus.REJECTED) {
        updateData.rejectedReason = params.rejectedReason;
      } else if (params.status === SubscriptionRequestStatus.APPROVED) {
        updateData.approvedDuration = params.approvedDuration;
        updateData.approvedDowngradePlan = params.approvedDowngradePlan;

        // Auto-update user subscription if approved
        const subscriptionUpdateResult = await this.updateUserSubscription({
          userId: requestData.userId,
          newPlan: requestData.requestedPlan,
          duration: params.approvedDuration,
          downgradePlan: params.approvedDowngradePlan,
          setBy: params.reviewedBy,
          notes: `Approved from request: ${params.requestId}`,
        });

        if (!subscriptionUpdateResult.success) {
          return {
            success: false,
            message: 'Failed to update user subscription after approval',
            error: subscriptionUpdateResult.error,
          };
        }
      }

      await updateDoc(requestRef, updateData);

      consoleLog('✅ Subscription request reviewed:', params.requestId);

      return {
        success: true,
        message: `Subscription request ${params.status.toLowerCase()} successfully`,
        data: { requestId: params.requestId, status: params.status },
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
   * Update user subscription directly (admin function)
   */
  public async updateUserSubscription(
    params: UpdateSubscriptionParams
  ): Promise<SubscriptionServiceResponse> {
    try {
      consoleLog('🔧 Updating user subscription:', params);

      // Validate plan exists in dynamic configuration
      const planDetails = this.getPlanByName(params.newPlan);
      if (!planDetails) {
        return {
          success: false,
          message: 'Invalid subscription plan',
          error: 'Plan not found',
        };
      }

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

      // Calculate expiry date
      const now = new Date();
      const expiryDate = new Date(now);
      if (params.duration) {
        expiryDate.setMonth(expiryDate.getMonth() + params.duration);
      } else {
        expiryDate.setMonth(expiryDate.getMonth() + 1); // Default 1 month
      }

      // Create subscription object
      const subscription: UserSubscription = {
        plan: params.newPlan,
        isActive: true,
        startDate: now,
        endDate: expiryDate,
        downgradePlan: params.downgradePlan || SubscriptionPlan.FREE,
        features: this.getPlanFeatures(params.newPlan) as any[], // Type conversion needed
        paymentMethod: params.paymentMethod,
        transactionId: params.transactionId,
        setAt: now,
        setBy: params.setBy,
        notes: params.notes,
      };

      // Update user document
      await updateDoc(userRef, {
        subscription,
        subscriptionPlan: params.newPlan,
        lastUpdatedAt: serverTimestamp(),
      });

      consoleLog('✅ User subscription updated:', params.userId);

      return {
        success: true,
        message: 'User subscription updated successfully',
        data: {
          userId: params.userId,
          subscription,
          planDetails,
        },
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
    planDistribution: Record<string, number>;
    dynamicPlans: SystemSubscriptionPlan[];
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
        planDistribution: {} as Record<string, number>,
        dynamicPlans: this.getDynamicSubscriptionPlans(),
      };

      // Calculate plan distribution
      allRequests.forEach((request) => {
        const plan = request.requestedPlan;
        stats.planDistribution[plan] = (stats.planDistribution[plan] || 0) + 1;
      });

      return stats;
    } catch (error) {
      consoleError('❌ Error getting subscription stats:', error);
      return {
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        planDistribution: {},
        dynamicPlans: [],
      };
    }
  }

  /**
   * Process expired subscriptions (downgrade to specified plan)
   */
  public async processExpiredSubscriptions(): Promise<SubscriptionServiceResponse> {
    try {
      consoleLog('🔧 Processing expired subscriptions...');

      // This would typically be run as a scheduled function
      // For now, it's a manual admin function

      const usersRef = collection(db, this.USERS_COLLECTION);
      const querySnapshot = await getDocs(usersRef);

      let processedCount = 0;

      for (const doc of querySnapshot.docs) {
        const userData = doc.data() as IPCAUser;
        const subscription = userData.subscription;

        if (
          subscription &&
          subscription.isActive &&
          subscription.endDate &&
          new Date(subscription.endDate) < new Date()
        ) {
          // Subscription has expired, downgrade
          await this.updateUserSubscription({
            userId: doc.id,
            newPlan: subscription.downgradePlan || SubscriptionPlan.FREE,
            setBy: 'system',
            notes: 'Automatic downgrade due to subscription expiry',
          });

          processedCount++;
        }
      }

      return {
        success: true,
        message: `Processed ${processedCount} expired subscriptions`,
        data: { processedCount },
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

// Export convenience functions
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

export default subscriptionService;
