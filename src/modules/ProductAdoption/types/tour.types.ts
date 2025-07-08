export interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector or element ID
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  spotlightRadius?: number;
  spotlightPadding?: number;
  actions?: TourAction[];
  customStyles?: React.CSSProperties;
  delay?: number;
  skipable?: boolean;
  condition?: TourCondition;
  analytics?: StepAnalytics;
}

export interface TourAction {
  label: string;
  action: 'next' | 'previous' | 'close' | 'custom';
  customHandler?: () => void;
  style?: 'primary' | 'secondary' | 'link';
}

export interface TourCondition {
  type: 'element-exists' | 'custom' | 'data-attribute';
  selector?: string;
  customCheck?: () => boolean;
  dataAttribute?: {
    name: string;
    value: string;
  };
}

export interface StepAnalytics {
  viewed: number;
  completed: number;
  skipped: number;
  timeSpent: number[]; // Array of time spent in milliseconds
  interactions: StepInteraction[];
}

export interface StepInteraction {
  type: 'click' | 'hover' | 'scroll' | 'input';
  timestamp: Date;
  details?: unknown;
}

export interface Tour {
  id: string;
  name: string;
  description?: string;
  steps: TourStep[];
  trigger: TourTrigger;
  targeting: TourTargeting;
  settings: TourSettings;
  analytics: TourAnalytics;
  status: 'draft' | 'active' | 'paused' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}

export interface TourTrigger {
  type: 'manual' | 'auto' | 'event' | 'api';
  event?: string;
  delay?: number;
  conditions?: TriggerCondition[];
}

export interface TriggerCondition {
  type: 'url' | 'user-property' | 'custom';
  operator: 'equals' | 'contains' | 'starts-with' | 'ends-with' | 'regex';
  value: string;
  customCheck?: () => boolean;
}

export interface TourTargeting {
  segments: UserSegment[];
  includeAnonymous: boolean;
  excludeCompletedUsers: boolean;
  maxDisplayCount?: number;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
}

export interface UserSegment {
  id: string;
  name: string;
  conditions: SegmentCondition[];
  operator: 'AND' | 'OR';
}

export interface SegmentCondition {
  property: string;
  operator: 'equals' | 'not-equals' | 'contains' | 'greater-than' | 'less-than';
  value: unknown;
}

export interface TourSettings {
  theme: TourTheme;
  navigation: NavigationSettings;
  completion: CompletionSettings;
  localization?: LocalizationSettings;
}

export interface TourTheme {
  primaryColor: string;
  textColor: string;
  backgroundColor: string;
  overlayColor: string;
  overlayOpacity: number;
  borderRadius: number;
  fontFamily?: string;
  zIndex: number;
}

export interface NavigationSettings {
  showProgressBar: boolean;
  showStepNumbers: boolean;
  allowKeyboardNavigation: boolean;
  showCloseButton: boolean;
  showSkipButton: boolean;
}

export interface CompletionSettings {
  redirectUrl?: string;
  showCompletionMessage: boolean;
  completionMessage?: string;
  trackCompletion: boolean;
}

export interface LocalizationSettings {
  language: string;
  translations?: {
    [key: string]: {
      [lang: string]: string;
    };
  };
}

export interface TourAnalytics {
  impressions: number;
  starts: number;
  completions: number;
  abandons: number;
  averageCompletionTime: number;
  stepAnalytics: { [stepId: string]: StepAnalytics };
  lastUpdated: Date;
}

export interface TourProgress {
  tourId: string;
  userId: string;
  currentStepIndex: number;
  completedSteps: string[];
  startedAt: Date;
  lastInteractionAt: Date;
  completed: boolean;
  completedAt?: Date;
}

export interface TourEvent {
  id: string;
  tourId: string;
  userId: string;
  type:
    | 'start'
    | 'step-view'
    | 'step-complete'
    | 'step-skip'
    | 'complete'
    | 'abandon';
  stepId?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}
