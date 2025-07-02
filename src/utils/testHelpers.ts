import { IPCAUser } from '@/types/user';
import {
  SUBSCRIPTION_FEATURES,
  SubscriptionPlan,
  UserSubscription,
} from '@/types/user/subscription';

/**
 * Test helpers for subscription features during development
 * These functions help simulate different subscription plans for testing
 */

export const createTestUser = (
  plan: SubscriptionPlan = SubscriptionPlan.FREE,
  email: string = 'test@example.com'
): IPCAUser => {
  return {
    id: 'test-user-id',
    email,
    displayName: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    photoURL: null,
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    subscription: createTestSubscription(plan),
  };
};

export const createTestSubscription = (
  plan: SubscriptionPlan
): UserSubscription => {
  return {
    plan,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate:
      plan === SubscriptionPlan.FREE
        ? undefined
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    isActive: true,
    trialEndDate:
      plan === SubscriptionPlan.FREE
        ? undefined
        : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    features: SUBSCRIPTION_FEATURES[plan],
  };
};

/**
 * Test different subscription scenarios
 * Use these in your browser console for testing:
 *
 * // Test FREE user
 * window.testFreeUser = () => testHelpers.createTestUser('free');
 *
 * // Test PRO user
 * window.testProUser = () => testHelpers.createTestUser('pro');
 */

export const subscriptionTestScenarios = {
  freeUser: () => createTestUser(SubscriptionPlan.FREE),
  proUser: () => createTestUser(SubscriptionPlan.PRO),
  premiumUser: () => createTestUser(SubscriptionPlan.PREMIUM),
  enterpriseUser: () => createTestUser(SubscriptionPlan.ENTERPRISE),
  expiredUser: () => {
    const user = createTestUser(SubscriptionPlan.PRO);
    if (user.subscription) {
      user.subscription.isActive = false;
      user.subscription.endDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
    }
    return user;
  },
  trialUser: () => {
    const user = createTestUser(SubscriptionPlan.PRO);
    if (user.subscription) {
      user.subscription.trialEndDate = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ); // 7 days from now
    }
    return user;
  },
};

/**
 * Console testing utilities
 * Add these to window object for easy browser console testing
 */
export const setupTestingConsole = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    (window as any).subscriptionTests = {
      createUser: createTestUser,
      scenarios: subscriptionTestScenarios,
      plans: SubscriptionPlan,
      switchToPlan: (plan: SubscriptionPlan) => {
        console.log(`Switching to ${plan} plan...`);
        return createTestUser(plan);
      },
    };

    console.log('🧪 Subscription testing utilities loaded:');
    console.log('- window.subscriptionTests.scenarios.freeUser()');
    console.log('- window.subscriptionTests.scenarios.proUser()');
    console.log('- window.subscriptionTests.scenarios.premiumUser()');
    console.log('- window.subscriptionTests.switchToPlan("pro")');
  }
};

/**
 * Create test messages with editing properties for testing
 */
export const createTestMessage = (
  id: string = 'test-msg-1',
  text: string = 'This is a test message',
  isEdited: boolean = false,
  isDeleted: boolean = false
) => {
  const baseMessage = {
    id,
    text,
    sender: 'me' as const,
    timestamp: new Date(),
    status: 'read' as const,
    type: 'text' as const,
  };

  if (isEdited) {
    return {
      ...baseMessage,
      isEdited: true,
      lastEditedAt: new Date(),
      editHistory: [
        {
          version: 1,
          text: 'Original message text',
          editedAt: new Date(Date.now() - 60000), // 1 minute ago
          editedBy: 'test-user-id',
          editReason: 'Fixed typo',
        },
        {
          version: 2,
          text: text,
          editedAt: new Date(),
          editedBy: 'test-user-id',
          editReason: 'Updated content',
        },
      ],
    };
  }

  if (isDeleted) {
    return {
      ...baseMessage,
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: 'test-user-id',
      deleteReason: 'No longer relevant',
    };
  }

  return baseMessage;
};
