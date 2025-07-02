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

// User subscription interface
export interface UserSubscription {
  plan: SubscriptionPlan;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  trialEndDate?: Date;
  features: ChatFeatureFlag[];
}

// Feature access result
export interface FeatureAccessResult {
  hasAccess: boolean;
  requiredPlan?: SubscriptionPlan;
  upgradeMessage?: string;
}
