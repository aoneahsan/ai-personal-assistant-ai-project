export interface AnalyticsOverview {
  totalTours: number;
  activeTours: number;
  totalImpressions: number;
  totalStarts: number;
  totalCompletions: number;
  averageCompletionRate: number;
  topPerformingTours: TourPerformance[];
  recentActivity: ActivityLog[];
}

export interface TourPerformance {
  tourId: string;
  tourName: string;
  impressions: number;
  starts: number;
  completions: number;
  completionRate: number;
  averageTimeToComplete: number;
  abandonment: AbandonmentData;
  trend: TrendData;
}

export interface AbandonmentData {
  total: number;
  byStep: { [stepId: string]: number };
  averageStepReached: number;
  reasons?: AbandonmentReason[];
}

export interface AbandonmentReason {
  reason: string;
  count: number;
  percentage: number;
}

export interface TrendData {
  direction: 'up' | 'down' | 'stable';
  changePercentage: number;
  comparisonPeriod: 'day' | 'week' | 'month';
}

export interface ActivityLog {
  id: string;
  timestamp: Date;
  userId: string;
  userEmail?: string;
  action: string;
  tourId?: string;
  tourName?: string;
  details?: Record<string, unknown>;
}

export interface AnalyticsFilter {
  dateRange: DateRange;
  tourIds?: string[];
  userSegments?: string[];
  status?: ('active' | 'completed' | 'abandoned')[];
}

export interface DateRange {
  start: Date;
  end: Date;
  preset?:
    | 'today'
    | 'yesterday'
    | 'last-7-days'
    | 'last-30-days'
    | 'last-90-days'
    | 'custom';
}

export interface UserEngagementMetrics {
  userId: string;
  toursStarted: number;
  toursCompleted: number;
  totalTimeSpent: number;
  lastEngagement: Date;
  engagementScore: number;
  preferredTourTypes?: string[];
}

export interface StepHeatmap {
  stepId: string;
  clickCoordinates: ClickCoordinate[];
  scrollDepth: number[];
  timeOnStep: number[];
  interactionTypes: { [type: string]: number };
}

export interface ClickCoordinate {
  x: number;
  y: number;
  timestamp: Date;
}

export interface FunnelAnalysis {
  tourId: string;
  steps: FunnelStep[];
  overallConversion: number;
  biggestDropoff: {
    fromStep: string;
    toStep: string;
    dropoffRate: number;
  };
}

export interface FunnelStep {
  stepId: string;
  stepName: string;
  entered: number;
  completed: number;
  dropoff: number;
  conversionRate: number;
  averageTimeSpent: number;
}

export interface ABTestResult {
  testId: string;
  testName: string;
  variants: TestVariant[];
  winner?: string;
  confidence: number;
  status: 'running' | 'completed' | 'paused';
}

export interface TestVariant {
  id: string;
  name: string;
  tourId: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
  statisticalSignificance?: number;
}

export interface AnalyticsExport {
  format: 'csv' | 'json' | 'pdf';
  data: unknown;
  generatedAt: Date;
  filters: AnalyticsFilter;
}

export interface RealtimeMetric {
  metric: string;
  value: number;
  timestamp: Date;
  change: number;
  changeType: 'absolute' | 'percentage';
}
