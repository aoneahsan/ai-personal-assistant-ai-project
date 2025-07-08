import { db } from '@/services/firebase';
import { PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS } from '@/utils/constants/generic/firebase';
import { consoleError, consoleLog } from '@/utils/helpers/consoleHelper';
import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';

export interface AnalyticsData {
  userGrowth: {
    labels: string[];
    data: number[];
  };
  messageVolume: {
    labels: string[];
    data: number[];
  };
  userEngagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
  };
  systemMetrics: {
    responseTime: number;
    uptime: number;
    errorRate: number;
    throughput: number;
  };
  topFeatures: Array<{
    name: string;
    usage: number;
    growth: number;
  }>;
  geograficalData: Array<{
    country: string;
    users: number;
    percentage: number;
  }>;
}

export interface UserActivity {
  id?: string;
  userId: string;
  userEmail?: string;
  action:
    | 'login'
    | 'logout'
    | 'message_sent'
    | 'file_upload'
    | 'voice_call'
    | 'feature_used';
  feature?: string;
  timestamp: Date | Timestamp;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

export interface SystemMetric {
  id?: string;
  metricType: 'response_time' | 'error_rate' | 'throughput' | 'uptime';
  value: number;
  timestamp: Date | Timestamp;
  details?: Record<string, unknown>;
}

interface GetAnalyticsParams {
  metric: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: Record<string, unknown>;
}

interface GetAnalyticsResponse {
  data: Array<{
    timestamp: Date;
    value: number;
    metadata?: Record<string, unknown>;
  }>;
  summary: {
    total: number;
    average: number;
    min: number;
    max: number;
  };
}

export const getUserAnalytics = async (
  userId: string,
  params: GetAnalyticsParams
): Promise<GetAnalyticsResponse> => {
  try {
    console.log('Getting user analytics for:', userId, 'with params:', params);

    // Mock data for now
    const mockData = {
      data: [
        {
          timestamp: new Date(),
          value: 100,
          metadata: { source: 'user_activity' },
        },
      ],
      summary: {
        total: 100,
        average: 100,
        min: 100,
        max: 100,
      },
    };

    return mockData;
  } catch (error) {
    console.error('Error getting user analytics:', error);
    throw error;
  }
};

export const getSystemAnalytics = async (
  params: GetAnalyticsParams
): Promise<GetAnalyticsResponse> => {
  try {
    console.log('Getting system analytics with params:', params);

    // Mock data for now
    const mockData = {
      data: [
        {
          timestamp: new Date(),
          value: 500,
          metadata: { source: 'system_metrics' },
        },
      ],
      summary: {
        total: 500,
        average: 500,
        min: 500,
        max: 500,
      },
    };

    return mockData;
  } catch (error) {
    console.error('Error getting system analytics:', error);
    throw error;
  }
};

export const getSubscriptionAnalytics = async (
  params: GetAnalyticsParams
): Promise<GetAnalyticsResponse> => {
  try {
    console.log('Getting subscription analytics with params:', params);

    // Mock data for now
    const mockData = {
      data: [
        {
          timestamp: new Date(),
          value: 50,
          metadata: { source: 'subscription_metrics' },
        },
      ],
      summary: {
        total: 50,
        average: 50,
        min: 50,
        max: 50,
      },
    };

    return mockData;
  } catch (error) {
    console.error('Error getting subscription analytics:', error);
    throw error;
  }
};

export const getFeatureUsageAnalytics = async (
  params: GetAnalyticsParams
): Promise<GetAnalyticsResponse> => {
  try {
    console.log('Getting feature usage analytics with params:', params);

    // Mock data for now
    const mockData = {
      data: [
        {
          timestamp: new Date(),
          value: 75,
          metadata: { source: 'feature_usage' },
        },
      ],
      summary: {
        total: 75,
        average: 75,
        min: 75,
        max: 75,
      },
    };

    return mockData;
  } catch (error) {
    console.error('Error getting feature usage analytics:', error);
    throw error;
  }
};

class SystemAnalyticsService {
  private readonly USER_ACTIVITIES_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_user_activities`;
  private readonly SYSTEM_METRICS_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_system_metrics`;
  private readonly USERS_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_users`;
  private readonly MESSAGES_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_messages`;

  // Get analytics data for a specific date range
  async getAnalyticsData(
    _startDate?: Date,
    _endDate?: Date
  ): Promise<AnalyticsData> {
    try {
      const [
        userGrowth,
        messageVolume,
        userEngagement,
        systemMetrics,
        topFeatures,
        geograficalData,
      ] = await Promise.all([
        this.getUserGrowthData(),
        this.getMessageVolumeData(),
        this.getUserEngagementData(),
        this.getSystemMetricsData(),
        this.getTopFeaturesData(),
        this.getGeograficalData(),
      ]);

      return {
        userGrowth,
        messageVolume,
        userEngagement,
        systemMetrics,
        topFeatures,
        geograficalData,
      };
    } catch (error) {
      consoleError('Error fetching analytics data:', error);
      // Return mock data as fallback
      return this.getMockAnalyticsData();
    }
  }

  // Get user growth data
  private async getUserGrowthData(
    _startDate?: Date,
    _endDate?: Date
  ): Promise<{
    labels: string[];
    data: number[];
  }> {
    try {
      // Get user registrations over time
      const labels: string[] = [];
      const data: number[] = [];

      // Generate last 6 months of data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const now = new Date();

      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        try {
          const q = query(
            collection(db, this.USERS_COLLECTION),
            where('createdAt', '>=', Timestamp.fromDate(monthStart)),
            where('createdAt', '<=', Timestamp.fromDate(monthEnd))
          );

          const snapshot = await getCountFromServer(q);
          const userCount = snapshot.data().count;

          labels.push(months[5 - i]);
          data.push(userCount);
        } catch (_error) {
          // Fallback to mock data for this month
          labels.push(months[5 - i]);
          data.push(Math.floor(Math.random() * 200) + 100);
        }
      }

      return { labels, data };
    } catch (error) {
      consoleError('Error fetching user growth data:', error);
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [120, 190, 300, 500, 720, 1247],
      };
    }
  }

  // Get message volume data
  private async getMessageVolumeData(
    _startDate?: Date,
    _endDate?: Date
  ): Promise<{
    labels: string[];
    data: number[];
  }> {
    try {
      const labels: string[] = [];
      const data: number[] = [];
      const now = new Date();

      // Get data for last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(
          now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000
        );
        const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);

        try {
          const q = query(
            collection(db, this.MESSAGES_COLLECTION),
            where('createdAt', '>=', Timestamp.fromDate(weekStart)),
            where('createdAt', '<', Timestamp.fromDate(weekEnd))
          );

          const snapshot = await getCountFromServer(q);
          const messageCount = snapshot.data().count;

          labels.push(`Week ${4 - i}`);
          data.push(messageCount);
        } catch (_error) {
          // Fallback to mock data
          labels.push(`Week ${4 - i}`);
          data.push(Math.floor(Math.random() * 2000) + 2000);
        }
      }

      return { labels, data };
    } catch (error) {
      consoleError('Error fetching message volume data:', error);
      return {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        data: [2500, 3200, 2800, 4100],
      };
    }
  }

  // Get user engagement data
  private async getUserEngagementData(
    _startDate?: Date,
    _endDate?: Date
  ): Promise<{
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
  }> {
    try {
      const now = new Date();
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [dailyActive, weeklyActive, monthlyActive] = await Promise.all([
        this.getActiveUsers(dayAgo, now),
        this.getActiveUsers(weekAgo, now),
        this.getActiveUsers(monthAgo, now),
      ]);

      // Calculate average session duration (mock for now)
      const averageSessionDuration = 24.5; // In minutes

      return {
        dailyActiveUsers: dailyActive,
        weeklyActiveUsers: weeklyActive,
        monthlyActiveUsers: monthlyActive,
        averageSessionDuration,
      };
    } catch (error) {
      consoleError('Error fetching user engagement data:', error);
      return {
        dailyActiveUsers: 892,
        weeklyActiveUsers: 1156,
        monthlyActiveUsers: 1247,
        averageSessionDuration: 24.5,
      };
    }
  }

  // Get active users count for a date range
  private async getActiveUsers(
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    try {
      const q = query(
        collection(db, this.USER_ACTIVITIES_COLLECTION),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate)),
        where('action', '==', 'login')
      );

      const snapshot = await getDocs(q);
      const uniqueUsers = new Set(
        snapshot.docs.map((doc) => doc.data().userId)
      );
      return uniqueUsers.size;
    } catch (error) {
      consoleError('Error getting active users:', error);
      return Math.floor(Math.random() * 1000) + 500;
    }
  }

  // Get system metrics
  private async getSystemMetricsData(): Promise<{
    responseTime: number;
    uptime: number;
    errorRate: number;
    throughput: number;
  }> {
    try {
      const now = new Date();
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Get recent system metrics
      const q = query(
        collection(db, this.SYSTEM_METRICS_COLLECTION),
        where('timestamp', '>=', Timestamp.fromDate(hourAgo)),
        orderBy('timestamp', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(q);
      const metrics = snapshot.docs.map((doc) => doc.data() as SystemMetric);

      // Calculate averages
      const responseTimeMetrics = metrics.filter(
        (m) => m.metricType === 'response_time'
      );
      const errorRateMetrics = metrics.filter(
        (m) => m.metricType === 'error_rate'
      );
      const throughputMetrics = metrics.filter(
        (m) => m.metricType === 'throughput'
      );
      const uptimeMetrics = metrics.filter((m) => m.metricType === 'uptime');

      const responseTime =
        responseTimeMetrics.length > 0
          ? responseTimeMetrics.reduce((sum, m) => sum + m.value, 0) /
            responseTimeMetrics.length
          : 150;

      const errorRate =
        errorRateMetrics.length > 0
          ? errorRateMetrics.reduce((sum, m) => sum + m.value, 0) /
            errorRateMetrics.length
          : 0.02;

      const throughput =
        throughputMetrics.length > 0
          ? throughputMetrics.reduce((sum, m) => sum + m.value, 0) /
            throughputMetrics.length
          : 1250;

      const uptime =
        uptimeMetrics.length > 0
          ? uptimeMetrics.reduce((sum, m) => sum + m.value, 0) /
            uptimeMetrics.length
          : 99.9;

      return {
        responseTime,
        uptime,
        errorRate,
        throughput,
      };
    } catch (error) {
      consoleError('Error fetching system metrics:', error);
      return {
        responseTime: 150,
        uptime: 99.9,
        errorRate: 0.02,
        throughput: 1250,
      };
    }
  }

  // Get top features usage data
  private async getTopFeaturesData(
    _startDate?: Date,
    _endDate?: Date
  ): Promise<
    Array<{
      name: string;
      usage: number;
      growth: number;
    }>
  > {
    try {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const q = query(
        collection(db, this.USER_ACTIVITIES_COLLECTION),
        where('action', '==', 'feature_used'),
        where('timestamp', '>=', Timestamp.fromDate(weekAgo)),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      const activities = snapshot.docs.map((doc) => doc.data() as UserActivity);

      // Count feature usage
      const featureCounts: Record<string, number> = {};
      activities.forEach((activity) => {
        if (activity.feature) {
          featureCounts[activity.feature] =
            (featureCounts[activity.feature] || 0) + 1;
        }
      });

      // Convert to sorted array
      const topFeatures = Object.entries(featureCounts)
        .map(([name, count]) => ({
          name,
          usage: count,
          growth: Math.floor(Math.random() * 30) + 5, // Mock growth percentage
        }))
        .sort((a, b) => b.usage - a.usage)
        .slice(0, 5);

      return topFeatures.length > 0 ? topFeatures : this.getMockTopFeatures();
    } catch (error) {
      consoleError('Error fetching top features data:', error);
      return this.getMockTopFeatures();
    }
  }

  // Get geographical data (mock for now as we don't collect location data)
  private async getGeograficalData(): Promise<
    Array<{
      country: string;
      users: number;
      percentage: number;
    }>
  > {
    // This would require actual geographical data collection
    return [
      { country: 'United States', users: 456, percentage: 36.6 },
      { country: 'United Kingdom', users: 234, percentage: 18.8 },
      { country: 'Canada', users: 178, percentage: 14.3 },
      { country: 'Germany', users: 145, percentage: 11.6 },
      { country: 'Australia', users: 98, percentage: 7.9 },
      { country: 'Others', users: 136, percentage: 10.9 },
    ];
  }

  // Record user activity
  async recordUserActivity(
    activity: Omit<UserActivity, 'id' | 'timestamp'>
  ): Promise<void> {
    try {
      const activityData = {
        ...activity,
        timestamp: Timestamp.now(),
      };

      // Note: We would typically use addDoc here, but for this demo we'll just log
      consoleLog('Recording user activity:', activityData);
    } catch (error) {
      consoleError('Error recording user activity:', error);
    }
  }

  // Record system metric
  async recordSystemMetric(
    metric: Omit<SystemMetric, 'id' | 'timestamp'>
  ): Promise<void> {
    try {
      const metricData = {
        ...metric,
        timestamp: Timestamp.now(),
      };

      // Note: We would typically use addDoc here, but for this demo we'll just log
      consoleLog('Recording system metric:', metricData);
    } catch (error) {
      consoleError('Error recording system metric:', error);
    }
  }

  // Export analytics data
  async exportAnalyticsData(
    format: 'json' | 'csv' = 'json',
    _startDate?: Date,
    _endDate?: Date
  ): Promise<string> {
    try {
      const data = await this.getAnalyticsData(_startDate, _endDate);

      if (format === 'json') {
        return JSON.stringify(data, null, 2);
      } else {
        // Convert to CSV format
        let csv = 'Metric,Value\n';
        csv += `Daily Active Users,${data.userEngagement.dailyActiveUsers}\n`;
        csv += `Weekly Active Users,${data.userEngagement.weeklyActiveUsers}\n`;
        csv += `Monthly Active Users,${data.userEngagement.monthlyActiveUsers}\n`;
        csv += `Average Session Duration,${data.userEngagement.averageSessionDuration}\n`;
        csv += `Response Time,${data.systemMetrics.responseTime}\n`;
        csv += `Uptime,${data.systemMetrics.uptime}\n`;
        csv += `Error Rate,${data.systemMetrics.errorRate}\n`;
        csv += `Throughput,${data.systemMetrics.throughput}\n`;

        return csv;
      }
    } catch (error) {
      consoleError('Error exporting analytics data:', error);
      throw error;
    }
  }

  // Mock data fallbacks
  private getMockAnalyticsData(): AnalyticsData {
    return {
      userGrowth: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [120, 190, 300, 500, 720, 1247],
      },
      messageVolume: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        data: [2500, 3200, 2800, 4100],
      },
      userEngagement: {
        dailyActiveUsers: 892,
        weeklyActiveUsers: 1156,
        monthlyActiveUsers: 1247,
        averageSessionDuration: 24.5,
      },
      systemMetrics: {
        responseTime: 150,
        uptime: 99.9,
        errorRate: 0.02,
        throughput: 1250,
      },
      topFeatures: this.getMockTopFeatures(),
      geograficalData: [
        { country: 'United States', users: 456, percentage: 36.6 },
        { country: 'United Kingdom', users: 234, percentage: 18.8 },
        { country: 'Canada', users: 178, percentage: 14.3 },
        { country: 'Germany', users: 145, percentage: 11.6 },
        { country: 'Australia', users: 98, percentage: 7.9 },
        { country: 'Others', users: 136, percentage: 10.9 },
      ],
    };
  }

  private getMockTopFeatures(): Array<{
    name: string;
    usage: number;
    growth: number;
  }> {
    return [
      { name: 'Chat System', usage: 95, growth: 12 },
      { name: 'Anonymous Rooms', usage: 78, growth: 25 },
      { name: 'File Sharing', usage: 65, growth: 8 },
      { name: 'Voice Messages', usage: 45, growth: 35 },
      { name: 'Embed Widget', usage: 32, growth: 18 },
    ];
  }
}

export const systemAnalyticsService = new SystemAnalyticsService();
export default systemAnalyticsService;
