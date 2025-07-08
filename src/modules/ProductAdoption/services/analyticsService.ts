import { db } from '@/services/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { AnalyticsFilter, AnalyticsOverview } from '../types';

export class AnalyticsService {
  private readonly EVENTS_COLLECTION = 'productAdoption_events';
  private readonly TOURS_COLLECTION = 'productAdoption_tours';
  private readonly ANALYTICS_COLLECTION = 'productAdoption_analytics';

  async getAnalyticsOverview(
    filter?: AnalyticsFilter
  ): Promise<ServiceResponse<AnalyticsOverview>> {
    try {
      // Get all tours
      const toursSnapshot = await getDocs(
        collection(db, this.TOURS_COLLECTION)
      );
      const tours = toursSnapshot.docs.map((doc) => doc.data() as Tour);

      // Calculate overview metrics
      const overview: AnalyticsOverview = {
        totalTours: tours.length,
        activeTours: tours.filter((t) => t.status === 'active').length,
        totalImpressions: 0,
        totalStarts: 0,
        totalCompletions: 0,
        averageCompletionRate: 0,
        topPerformingTours: [],
        recentActivity: [],
      };

      // Aggregate metrics from tours
      let totalCompletionRate = 0;
      const performances: TourPerformance[] = [];

      for (const tour of tours) {
        overview.totalImpressions += tour.analytics.impressions;
        overview.totalStarts += tour.analytics.starts;
        overview.totalCompletions += tour.analytics.completions;

        const completionRate =
          tour.analytics.starts > 0
            ? (tour.analytics.completions / tour.analytics.starts) * 100
            : 0;

        totalCompletionRate += completionRate;

        performances.push({
          tourId: tour.id,
          tourName: tour.name,
          impressions: tour.analytics.impressions,
          starts: tour.analytics.starts,
          completions: tour.analytics.completions,
          completionRate,
          averageTimeToComplete: tour.analytics.averageCompletionTime,
          abandonment: {
            total: tour.analytics.abandons,
            byStep: {},
            averageStepReached: 0,
          },
          trend: {
            direction: 'stable',
            changePercentage: 0,
            comparisonPeriod: 'week',
          },
        });
      }

      overview.averageCompletionRate =
        tours.length > 0 ? totalCompletionRate / tours.length : 0;

      // Get top performing tours
      overview.topPerformingTours = performances
        .sort((a, b) => b.completionRate - a.completionRate)
        .slice(0, 5);

      // Get recent activity
      overview.recentActivity = await this.getRecentActivity(10);

      return {
        success: true,
        data: overview,
        metadata: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
        },
      };
    } catch (error) {
      console.error('Error getting analytics overview:', error);
      return {
        success: false,
        error: {
          code: 'ANALYTICS_ERROR',
          message: 'Failed to get analytics overview',
          details: error,
        },
      };
    }
  }

  async getTourPerformance(
    tourId: string,
    filter?: AnalyticsFilter
  ): Promise<ServiceResponse<TourPerformance>> {
    try {
      const tourDoc = await getDoc(doc(db, this.TOURS_COLLECTION, tourId));

      if (!tourDoc.exists()) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Tour not found',
          },
        };
      }

      const tour = tourDoc.data() as Tour;

      // Get events for this tour
      let eventsQuery = query(
        collection(db, this.EVENTS_COLLECTION),
        where('tourId', '==', tourId)
      );

      if (filter?.dateRange) {
        eventsQuery = query(
          eventsQuery,
          where('timestamp', '>=', Timestamp.fromDate(filter.dateRange.start)),
          where('timestamp', '<=', Timestamp.fromDate(filter.dateRange.end))
        );
      }

      const eventsSnapshot = await getDocs(eventsQuery);
      const events = eventsSnapshot.docs.map((doc) => doc.data() as TourEvent);

      // Calculate abandonment data
      const abandonmentByStep: { [stepId: string]: number } = {};
      let totalAbandons = 0;
      const totalStepReached = 0;

      events.forEach((event) => {
        if (event.type === 'abandon' && event.stepId) {
          abandonmentByStep[event.stepId] =
            (abandonmentByStep[event.stepId] || 0) + 1;
          totalAbandons++;
        }
      });

      const performance: TourPerformance = {
        tourId: tour.id,
        tourName: tour.name,
        impressions: tour.analytics.impressions,
        starts: tour.analytics.starts,
        completions: tour.analytics.completions,
        completionRate:
          tour.analytics.starts > 0
            ? (tour.analytics.completions / tour.analytics.starts) * 100
            : 0,
        averageTimeToComplete: tour.analytics.averageCompletionTime,
        abandonment: {
          total: totalAbandons,
          byStep: abandonmentByStep,
          averageStepReached:
            totalAbandons > 0 ? totalStepReached / totalAbandons : 0,
        },
        trend: await this.calculateTrend(tourId, 'week'),
      };

      return {
        success: true,
        data: performance,
        metadata: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
        },
      };
    } catch (error) {
      console.error('Error getting tour performance:', error);
      return {
        success: false,
        error: {
          code: 'PERFORMANCE_ERROR',
          message: 'Failed to get tour performance',
          details: error,
        },
      };
    }
  }

  async getFunnelAnalysis(
    tourId: string
  ): Promise<ServiceResponse<FunnelAnalysis>> {
    try {
      const tourDoc = await getDoc(doc(db, this.TOURS_COLLECTION, tourId));

      if (!tourDoc.exists()) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Tour not found',
          },
        };
      }

      const tour = tourDoc.data() as Tour;

      // Get all step events for this tour
      const eventsSnapshot = await getDocs(
        query(
          collection(db, this.EVENTS_COLLECTION),
          where('tourId', '==', tourId),
          where('type', 'in', ['step-view', 'step-complete'])
        )
      );

      const events = eventsSnapshot.docs.map((doc) => doc.data() as TourEvent);

      // Build funnel data
      const stepMetrics: { [stepId: string]: any } = {};

      tour.steps.forEach((step) => {
        stepMetrics[step.id] = {
          entered: 0,
          completed: 0,
          timeSpent: [],
        };
      });

      // Process events
      events.forEach((event) => {
        if (event.stepId && stepMetrics[event.stepId]) {
          if (event.type === 'step-view') {
            stepMetrics[event.stepId].entered++;
          } else if (event.type === 'step-complete') {
            stepMetrics[event.stepId].completed++;
          }
        }
      });

      // Calculate funnel steps
      const funnelSteps = tour.steps.map((step, index) => {
        const metrics = stepMetrics[step.id];
        const previousStep =
          index > 0 ? stepMetrics[tour.steps[index - 1].id] : null;
        const dropoff = previousStep
          ? previousStep.completed - metrics.entered
          : 0;

        return {
          stepId: step.id,
          stepName: step.title,
          entered: metrics.entered,
          completed: metrics.completed,
          dropoff,
          conversionRate:
            metrics.entered > 0
              ? (metrics.completed / metrics.entered) * 100
              : 0,
          averageTimeSpent: 0, // Calculate from time data
        };
      });

      // Find biggest dropoff
      let biggestDropoff = { fromStep: '', toStep: '', dropoffRate: 0 };
      for (let i = 1; i < funnelSteps.length; i++) {
        const dropoffRate =
          funnelSteps[i - 1].completed > 0
            ? ((funnelSteps[i - 1].completed - funnelSteps[i].entered) /
                funnelSteps[i - 1].completed) *
              100
            : 0;

        if (dropoffRate > biggestDropoff.dropoffRate) {
          biggestDropoff = {
            fromStep: funnelSteps[i - 1].stepId,
            toStep: funnelSteps[i].stepId,
            dropoffRate,
          };
        }
      }

      const funnel: FunnelAnalysis = {
        tourId,
        steps: funnelSteps,
        overallConversion:
          funnelSteps.length > 0 && funnelSteps[0].entered > 0
            ? (funnelSteps[funnelSteps.length - 1].completed /
                funnelSteps[0].entered) *
              100
            : 0,
        biggestDropoff,
      };

      return {
        success: true,
        data: funnel,
        metadata: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
        },
      };
    } catch (error) {
      console.error('Error getting funnel analysis:', error);
      return {
        success: false,
        error: {
          code: 'FUNNEL_ERROR',
          message: 'Failed to get funnel analysis',
          details: error,
        },
      };
    }
  }

  async getUserEngagement(
    userId: string
  ): Promise<ServiceResponse<UserEngagementMetrics>> {
    try {
      const eventsSnapshot = await getDocs(
        query(
          collection(db, this.EVENTS_COLLECTION),
          where('userId', '==', userId)
        )
      );

      const events = eventsSnapshot.docs.map((doc) => doc.data() as TourEvent);

      const metrics: UserEngagementMetrics = {
        userId,
        toursStarted: events.filter((e) => e.type === 'start').length,
        toursCompleted: events.filter((e) => e.type === 'complete').length,
        totalTimeSpent: 0, // Calculate from events
        lastEngagement:
          events.length > 0
            ? new Date(Math.max(...events.map((e) => e.timestamp.getTime())))
            : new Date(),
        engagementScore: 0, // Calculate based on activity
      };

      // Calculate engagement score (0-100)
      const daysSinceLastEngagement =
        (new Date().getTime() - metrics.lastEngagement.getTime()) /
        (1000 * 60 * 60 * 24);
      const recencyScore = Math.max(0, 100 - daysSinceLastEngagement * 2);
      const completionRate =
        metrics.toursStarted > 0
          ? (metrics.toursCompleted / metrics.toursStarted) * 100
          : 0;

      metrics.engagementScore = (recencyScore + completionRate) / 2;

      return {
        success: true,
        data: metrics,
        metadata: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
        },
      };
    } catch (error) {
      console.error('Error getting user engagement:', error);
      return {
        success: false,
        error: {
          code: 'ENGAGEMENT_ERROR',
          message: 'Failed to get user engagement metrics',
          details: error,
        },
      };
    }
  }

  async getStepHeatmap(
    tourId: string,
    stepId: string
  ): Promise<ServiceResponse<StepHeatmap>> {
    try {
      const eventsSnapshot = await getDocs(
        query(
          collection(db, this.EVENTS_COLLECTION),
          where('tourId', '==', tourId),
          where('stepId', '==', stepId)
        )
      );

      const events = eventsSnapshot.docs.map((doc) => doc.data() as TourEvent);

      const heatmap: StepHeatmap = {
        stepId,
        clickCoordinates: [],
        scrollDepth: [],
        timeOnStep: [],
        interactionTypes: {},
      };

      // Process events to build heatmap data
      events.forEach((event) => {
        if (event.metadata?.clickX && event.metadata?.clickY) {
          heatmap.clickCoordinates.push({
            x: event.metadata.clickX,
            y: event.metadata.clickY,
            timestamp: event.timestamp,
          });
        }

        if (event.metadata?.scrollDepth) {
          heatmap.scrollDepth.push(event.metadata.scrollDepth);
        }

        if (event.metadata?.timeSpent) {
          heatmap.timeOnStep.push(event.metadata.timeSpent);
        }

        if (event.metadata?.interactionType) {
          const type = event.metadata.interactionType;
          heatmap.interactionTypes[type] =
            (heatmap.interactionTypes[type] || 0) + 1;
        }
      });

      return {
        success: true,
        data: heatmap,
        metadata: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
        },
      };
    } catch (error) {
      console.error('Error getting step heatmap:', error);
      return {
        success: false,
        error: {
          code: 'HEATMAP_ERROR',
          message: 'Failed to get step heatmap',
          details: error,
        },
      };
    }
  }

  private async getRecentActivity(limit: number) {
    const eventsSnapshot = await getDocs(
      query(
        collection(db, this.EVENTS_COLLECTION),
        orderBy('timestamp', 'desc'),
        limit(limit)
      )
    );

    return eventsSnapshot.docs.map((doc) => {
      const event = doc.data() as TourEvent;
      return {
        id: event.id,
        timestamp: event.timestamp,
        userId: event.userId,
        action: event.type,
        tourId: event.tourId,
        details: event.metadata,
      };
    });
  }

  private async calculateTrend(
    tourId: string,
    period: 'day' | 'week' | 'month'
  ) {
    // Calculate trend based on historical data
    // This is a simplified implementation
    return {
      direction: 'stable' as const,
      changePercentage: 0,
      comparisonPeriod: period,
    };
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
