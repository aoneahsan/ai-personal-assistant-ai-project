import {
  SUBSCRIPTION_FEATURES,
  SubscriptionPlan,
  UserSubscription,
} from './subscription';

export interface IPCAUser {
  id?: string;
  email?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string | null;
  phone?: string;
  isEmailVerified?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
  userAgent?: string;
  ipAddress?: string;
  location?: string;
  subscription?: UserSubscription;
}

// Default subscription for users (can be updated via admin panel or payment system)
export const getDefaultUserSubscription = (): UserSubscription => ({
  plan: SubscriptionPlan.FREE,
  startDate: new Date(),
  isActive: true,
  features: SUBSCRIPTION_FEATURES[SubscriptionPlan.FREE],
});
