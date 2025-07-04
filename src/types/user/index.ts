import { UserRole, UserRoleAssignment } from './roles';
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

  // Role-based access control
  role?: UserRole;
  roleAssignment?: UserRoleAssignment;

  // User status and metadata
  isActive?: boolean;
  isBanned?: boolean;
  bannedUntil?: Date;
  bannedReason?: string;
  lastActiveAt?: Date;

  // Profile completion and verification
  profileCompletionPercentage?: number;
  isProfileComplete?: boolean;
  verificationStatus?: 'pending' | 'verified' | 'rejected';

  // Administrative notes (only visible to admins)
  adminNotes?: string;
  tags?: string[];
}

// Default subscription for users (can be updated via admin panel or payment system)
export const getDefaultUserSubscription = (): UserSubscription => ({
  plan: SubscriptionPlan.FREE,
  startDate: new Date(),
  isActive: true,
  features: SUBSCRIPTION_FEATURES[SubscriptionPlan.FREE],
});

// Default role for new users
export const getDefaultUserRole = (): UserRole => UserRole.USER;

// Export all user-related types
export * from './roles';
export * from './subscription';
