// Subscription Plans
export enum SubscriptionPlan {
  FREE = 'free',
  PRO = 'pro',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

// Feature Flags for different subscription tiers
export enum ChatFeatureFlag {
  MESSAGE_EDITING = 'message_editing',
  MESSAGE_DELETION = 'message_deletion',
  MESSAGE_HISTORY = 'message_history',
  ANONYMOUS_CHAT = 'anonymous_chat',
  GROUP_CHAT = 'group_chat',
  FILE_SHARING = 'file_sharing',
  VOICE_MESSAGES = 'voice_messages',
  VIDEO_MESSAGES = 'video_messages',
  MESSAGE_REACTIONS = 'message_reactions',
  MESSAGE_FORWARDING = 'message_forwarding',
}

// Subscription feature mapping
export const SUBSCRIPTION_FEATURES: Record<
  SubscriptionPlan,
  ChatFeatureFlag[]
> = {
  [SubscriptionPlan.FREE]: [
    ChatFeatureFlag.FILE_SHARING,
    ChatFeatureFlag.VOICE_MESSAGES,
  ],
  [SubscriptionPlan.PRO]: [
    ChatFeatureFlag.FILE_SHARING,
    ChatFeatureFlag.VOICE_MESSAGES,
    ChatFeatureFlag.VIDEO_MESSAGES,
    ChatFeatureFlag.MESSAGE_EDITING,
    ChatFeatureFlag.MESSAGE_DELETION,
    ChatFeatureFlag.MESSAGE_HISTORY,
  ],
  [SubscriptionPlan.PREMIUM]: [
    ChatFeatureFlag.FILE_SHARING,
    ChatFeatureFlag.VOICE_MESSAGES,
    ChatFeatureFlag.VIDEO_MESSAGES,
    ChatFeatureFlag.MESSAGE_EDITING,
    ChatFeatureFlag.MESSAGE_DELETION,
    ChatFeatureFlag.MESSAGE_HISTORY,
    ChatFeatureFlag.ANONYMOUS_CHAT,
    ChatFeatureFlag.MESSAGE_REACTIONS,
    ChatFeatureFlag.MESSAGE_FORWARDING,
  ],
  [SubscriptionPlan.ENTERPRISE]: [...Object.values(ChatFeatureFlag)],
};

// Subscription request status
export enum SubscriptionRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

// Subscription request type
export enum SubscriptionRequestType {
  UPGRADE = 'upgrade',
  DOWNGRADE = 'downgrade',
  RENEWAL = 'renewal',
}

// User subscription interface
export interface UserSubscription {
  plan: SubscriptionPlan;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  trialEndDate?: Date;
  features: ChatFeatureFlag[];

  // Enhanced fields for admin management
  downgradePlan?: SubscriptionPlan;
  autoDowngradeDate?: Date;
  setBy?: string; // Admin who set the subscription
  setAt?: Date;
  notes?: string;
  paymentMethod?: string;
  transactionId?: string;
}

// Subscription request interface
export interface SubscriptionRequest {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  currentPlan: SubscriptionPlan;
  requestedPlan: SubscriptionPlan;
  requestType: SubscriptionRequestType;
  status: SubscriptionRequestStatus;

  // Request details
  reason?: string;
  message?: string;
  requestedAt: Date;

  // Admin response
  reviewedBy?: string;
  reviewedAt?: Date;
  adminNotes?: string;

  // Approval details
  approvedDuration?: number; // in months
  approvedDowngradePlan?: SubscriptionPlan;
  approvedAt?: Date;

  // Rejection details
  rejectedReason?: string;
  rejectedAt?: Date;

  // Metadata
  ipAddress?: string;
  userAgent?: string;
  urgency?: 'low' | 'medium' | 'high';
  tags?: string[];
}

// Feature access result
export interface FeatureAccessResult {
  hasAccess: boolean;
  requiredPlan?: SubscriptionPlan;
  upgradeMessage?: string;
}

// Subscription plan details for UI
export interface SubscriptionPlanDetails {
  plan: SubscriptionPlan;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: ChatFeatureFlag[];
  popular?: boolean;
  color: string;
  icon: string;
  benefits: string[];
  limitations?: string[];
}

// Subscription plan details mapping
export const SUBSCRIPTION_PLAN_DETAILS: Record<
  SubscriptionPlan,
  SubscriptionPlanDetails
> = {
  [SubscriptionPlan.FREE]: {
    plan: SubscriptionPlan.FREE,
    name: 'Free',
    description: 'Perfect for getting started',
    price: { monthly: 0, yearly: 0 },
    features: SUBSCRIPTION_FEATURES[SubscriptionPlan.FREE],
    color: '#6B7280',
    icon: 'pi pi-user',
    benefits: [
      'Basic file sharing',
      'Voice messages',
      'Standard support',
      'Up to 100 messages/month',
    ],
    limitations: [
      'Limited message history',
      'No message editing',
      'Basic file size limits',
    ],
  },
  [SubscriptionPlan.PRO]: {
    plan: SubscriptionPlan.PRO,
    name: 'Pro',
    description: 'Great for professionals',
    price: { monthly: 9.99, yearly: 99.99 },
    features: SUBSCRIPTION_FEATURES[SubscriptionPlan.PRO],
    color: '#3B82F6',
    icon: 'pi pi-star',
    benefits: [
      'Message editing & deletion',
      'Edit history tracking',
      'Video messages',
      'Priority support',
      'Extended file storage',
      'Unlimited messages',
    ],
  },
  [SubscriptionPlan.PREMIUM]: {
    plan: SubscriptionPlan.PREMIUM,
    name: 'Premium',
    description: 'Advanced features for power users',
    price: { monthly: 19.99, yearly: 199.99 },
    features: SUBSCRIPTION_FEATURES[SubscriptionPlan.PREMIUM],
    popular: true,
    color: '#8B5CF6',
    icon: 'pi pi-crown',
    benefits: [
      'Anonymous chat',
      'Message reactions',
      'Message forwarding',
      'Advanced file sharing',
      'Premium support',
      'Custom themes',
      'Advanced analytics',
    ],
  },
  [SubscriptionPlan.ENTERPRISE]: {
    plan: SubscriptionPlan.ENTERPRISE,
    name: 'Enterprise',
    description: 'Complete solution for organizations',
    price: { monthly: 49.99, yearly: 499.99 },
    features: SUBSCRIPTION_FEATURES[SubscriptionPlan.ENTERPRISE],
    color: '#F59E0B',
    icon: 'pi pi-building',
    benefits: [
      'All premium features',
      'Group chat management',
      'Advanced analytics',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
      'Custom branding',
      'API access',
    ],
  },
};

// Helper functions
export const getPlanDetails = (
  plan: SubscriptionPlan
): SubscriptionPlanDetails => {
  return SUBSCRIPTION_PLAN_DETAILS[plan];
};

export const isPlanUpgrade = (
  currentPlan: SubscriptionPlan,
  newPlan: SubscriptionPlan
): boolean => {
  const planOrder = [
    SubscriptionPlan.FREE,
    SubscriptionPlan.PRO,
    SubscriptionPlan.PREMIUM,
    SubscriptionPlan.ENTERPRISE,
  ];
  return planOrder.indexOf(newPlan) > planOrder.indexOf(currentPlan);
};

export const isPlanDowngrade = (
  currentPlan: SubscriptionPlan,
  newPlan: SubscriptionPlan
): boolean => {
  const planOrder = [
    SubscriptionPlan.FREE,
    SubscriptionPlan.PRO,
    SubscriptionPlan.PREMIUM,
    SubscriptionPlan.ENTERPRISE,
  ];
  return planOrder.indexOf(newPlan) < planOrder.indexOf(currentPlan);
};

export const calculateUpgradeCost = (
  currentPlan: SubscriptionPlan,
  newPlan: SubscriptionPlan,
  isYearly: boolean = false
): number => {
  const currentPrice = isYearly
    ? SUBSCRIPTION_PLAN_DETAILS[currentPlan].price.yearly
    : SUBSCRIPTION_PLAN_DETAILS[currentPlan].price.monthly;
  const newPrice = isYearly
    ? SUBSCRIPTION_PLAN_DETAILS[newPlan].price.yearly
    : SUBSCRIPTION_PLAN_DETAILS[newPlan].price.monthly;
  return Math.max(0, newPrice - currentPrice);
};
