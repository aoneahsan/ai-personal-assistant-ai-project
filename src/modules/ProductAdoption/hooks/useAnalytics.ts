import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services';
import { AnalyticsFilter } from '../types';

export const useAnalyticsOverview = (filter?: AnalyticsFilter) => {
  const {
    data: analyticsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['analytics-overview', filter],
    queryFn: () => analyticsService.getAnalyticsOverview(filter),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const analytics = analyticsResponse?.success ? analyticsResponse.data : null;

  return {
    analytics,
    isLoading,
    error,
    refetch,
  };
};

export const useTourPerformance = (tourId: string, filter?: AnalyticsFilter) => {
  const {
    data: performanceResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['tour-performance', tourId, filter],
    queryFn: () => analyticsService.getTourPerformance(tourId, filter),
    enabled: !!tourId,
  });

  const performance = performanceResponse?.success ? performanceResponse.data : null;

  return {
    performance,
    isLoading,
    error,
    refetch,
  };
};

export const useFunnelAnalysis = (tourId: string) => {
  const {
    data: funnelResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['funnel-analysis', tourId],
    queryFn: () => analyticsService.getFunnelAnalysis(tourId),
    enabled: !!tourId,
  });

  const funnel = funnelResponse?.success ? funnelResponse.data : null;

  return {
    funnel,
    isLoading,
    error,
    refetch,
  };
};

export const useUserEngagement = (userId: string) => {
  const {
    data: engagementResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['user-engagement', userId],
    queryFn: () => analyticsService.getUserEngagement(userId),
    enabled: !!userId,
  });

  const engagement = engagementResponse?.success ? engagementResponse.data : null;

  return {
    engagement,
    isLoading,
    error,
    refetch,
  };
};

export const useStepHeatmap = (tourId: string, stepId: string) => {
  const {
    data: heatmapResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['step-heatmap', tourId, stepId],
    queryFn: () => analyticsService.getStepHeatmap(tourId, stepId),
    enabled: !!tourId && !!stepId,
  });

  const heatmap = heatmapResponse?.success ? heatmapResponse.data : null;

  return {
    heatmap,
    isLoading,
    error,
    refetch,
  };
};