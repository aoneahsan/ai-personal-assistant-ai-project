export interface WidgetConfig {
  id: string;
  type: WidgetType;
  position: WidgetPosition;
  trigger: WidgetTrigger;
  content: WidgetContent;
  styling: WidgetStyling;
  targeting: WidgetTargeting;
  behavior: WidgetBehavior;
  analytics: WidgetAnalytics;
}

export type WidgetType = 
  | 'tooltip'
  | 'hotspot'
  | 'banner'
  | 'modal'
  | 'slideout'
  | 'beacon'
  | 'checklist'
  | 'nps'
  | 'announcement';

export interface WidgetPosition {
  type: 'fixed' | 'relative' | 'absolute';
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'custom';
  offset?: {
    x: number;
    y: number;
  };
  targetElement?: string; // CSS selector
  responsive?: {
    mobile?: Partial<WidgetPosition>;
    tablet?: Partial<WidgetPosition>;
  };
}

export interface WidgetTrigger {
  type: 'immediate' | 'delay' | 'scroll' | 'click' | 'hover' | 'exit-intent' | 'custom';
  delay?: number;
  scrollPercentage?: number;
  exitIntentSensitivity?: number;
  customCondition?: () => boolean;
  frequency?: TriggerFrequency;
}

export interface TriggerFrequency {
  type: 'once' | 'session' | 'daily' | 'always';
  maxCount?: number;
}

export interface WidgetContent {
  title?: string;
  message: string;
  media?: MediaContent;
  actions?: WidgetAction[];
  customHtml?: string;
  dynamicContent?: DynamicContent[];
}

export interface MediaContent {
  type: 'image' | 'video' | 'gif' | 'lottie';
  url: string;
  alt?: string;
  thumbnail?: string;
}

export interface WidgetAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'link';
  action: 'close' | 'next' | 'url' | 'tour' | 'custom';
  url?: string;
  tourId?: string;
  customHandler?: () => void;
}

export interface DynamicContent {
  key: string;
  source: 'user' | 'api' | 'custom';
  fallback?: string;
  transform?: (value: any) => string;
}

export interface WidgetStyling {
  theme: 'light' | 'dark' | 'custom';
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
    border?: string;
  };
  typography?: {
    fontFamily?: string;
    fontSize?: {
      title?: string;
      body?: string;
      button?: string;
    };
  };
  spacing?: {
    padding?: string;
    margin?: string;
  };
  animation?: AnimationConfig;
  customCss?: string;
}

export interface AnimationConfig {
  entrance: 'fade' | 'slide' | 'bounce' | 'none';
  exit: 'fade' | 'slide' | 'none';
  duration: number;
  easing: string;
}

export interface WidgetTargeting {
  audience: AudienceRule[];
  pages: PageRule[];
  devices?: DeviceRule[];
  schedule?: ScheduleRule;
}

export interface AudienceRule {
  type: 'all' | 'segment' | 'user-property' | 'behavior';
  operator?: 'is' | 'is-not' | 'contains' | 'greater-than' | 'less-than';
  value?: any;
  segmentId?: string;
}

export interface PageRule {
  type: 'url' | 'path' | 'all';
  operator: 'equals' | 'contains' | 'starts-with' | 'regex';
  value: string;
}

export interface DeviceRule {
  type: 'desktop' | 'mobile' | 'tablet';
  os?: string[];
  browser?: string[];
}

export interface ScheduleRule {
  startDate?: Date;
  endDate?: Date;
  timezone?: string;
  daysOfWeek?: number[];
  hoursOfDay?: number[];
}

export interface WidgetBehavior {
  dismissible: boolean;
  persistent: boolean;
  accessibility: AccessibilityConfig;
  interactions: InteractionConfig;
}

export interface AccessibilityConfig {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  keyboardNavigable: boolean;
  screenReaderOptimized: boolean;
}

export interface InteractionConfig {
  pauseOnHover?: boolean;
  clickOutsideToClose?: boolean;
  escapeToClose?: boolean;
  preventScroll?: boolean;
}

export interface WidgetAnalytics {
  impressions: number;
  interactions: number;
  dismissals: number;
  conversions: number;
  engagementRate: number;
  events: WidgetEvent[];
}

export interface WidgetEvent {
  id: string;
  widgetId: string;
  userId?: string;
  sessionId: string;
  type: 'impression' | 'interaction' | 'dismissal' | 'conversion';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ChecklistWidget extends WidgetConfig {
  type: 'checklist';
  items: ChecklistItem[];
  progress: ChecklistProgress;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  optional?: boolean;
  action?: WidgetAction;
  icon?: string;
}

export interface ChecklistProgress {
  completed: number;
  total: number;
  percentage: number;
}

export interface NPSWidget extends WidgetConfig {
  type: 'nps';
  scale: {
    min: number;
    max: number;
    labels?: {
      min?: string;
      max?: string;
    };
  };
  followUp?: {
    enabled: boolean;
    questions: NPSFollowUpQuestion[];
  };
}

export interface NPSFollowUpQuestion {
  score: number | number[];
  question: string;
  type: 'text' | 'multiple-choice';
  options?: string[];
}