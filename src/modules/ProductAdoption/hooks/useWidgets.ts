import { useToast } from '@/hooks/useToast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { widgetService } from '../services';
import { FilterOptions, UserContext, WidgetConfig } from '../types';

export const useWidgets = (filters?: FilterOptions) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const {
    data: widgetsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['widgets', filters],
    queryFn: () => widgetService.listWidgets(filters),
  });

  const createWidgetMutation = useMutation({
    mutationFn: (widgetData: Partial<WidgetConfig>) =>
      widgetService.createWidget(widgetData),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['widgets'] });
        showToast({
          severity: 'success',
          summary: 'Widget Created',
          detail: 'Widget has been created successfully',
        });
      } else {
        showToast({
          severity: 'error',
          summary: 'Error',
          detail: response.error?.message || 'Failed to create widget',
        });
      }
    },
  });

  const updateWidgetMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<WidgetConfig>;
    }) => widgetService.updateWidget(id, updates),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['widgets'] });
        queryClient.invalidateQueries({
          queryKey: ['widget', response.data?.id],
        });
        showToast({
          severity: 'success',
          summary: 'Widget Updated',
          detail: 'Widget has been updated successfully',
        });
      }
    },
  });

  const deleteWidgetMutation = useMutation({
    mutationFn: (widgetId: string) => widgetService.deleteWidget(widgetId),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['widgets'] });
        showToast({
          severity: 'success',
          summary: 'Widget Deleted',
          detail: 'Widget has been deleted successfully',
        });
      }
    },
  });

  const widgets = widgetsResponse?.success ? widgetsResponse.data || [] : [];

  return {
    widgets,
    isLoading,
    error,
    refetch,
    createWidget: createWidgetMutation.mutate,
    updateWidget: updateWidgetMutation.mutate,
    deleteWidget: deleteWidgetMutation.mutate,
    isCreating: createWidgetMutation.isPending,
    isUpdating: updateWidgetMutation.isPending,
    isDeleting: deleteWidgetMutation.isPending,
  };
};

export const useActiveWidgets = (userContext: UserContext) => {
  const [currentUrl, setCurrentUrl] = useState(window.location.href);
  const [activeWidgets, setActiveWidgets] = useState<WidgetConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleUrlChange = () => {
      setCurrentUrl(window.location.href);
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('pushstate', handleUrlChange);
    window.addEventListener('replacestate', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('pushstate', handleUrlChange);
      window.removeEventListener('replacestate', handleUrlChange);
    };
  }, []);

  useEffect(() => {
    const fetchActiveWidgets = async () => {
      setIsLoading(true);
      try {
        const response = await widgetService.getActiveWidgets(
          userContext,
          currentUrl
        );
        if (response.success && response.data) {
          // Check frequency rules for each widget
          const eligibleWidgets = [];
          for (const widget of response.data) {
            const shouldShow = await widgetService.shouldShowWidget(
              widget.id,
              userContext.id,
              sessionStorage.getItem('sessionId') || undefined
            );
            if (shouldShow) {
              eligibleWidgets.push(widget);
            }
          }
          setActiveWidgets(eligibleWidgets);
        }
      } catch (error) {
        console.error('Error fetching active widgets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveWidgets();
  }, [userContext, currentUrl]);

  const trackWidgetEvent = useCallback(
    async (
      widgetId: string,
      eventType: 'impression' | 'interaction' | 'dismissal' | 'conversion',
      metadata?: Record<string, unknown>
    ) => {
      await widgetService.trackWidgetEvent({
        widgetId,
        userId: userContext.id,
        sessionId: sessionStorage.getItem('sessionId') || '',
        type: eventType,
        timestamp: new Date(),
        metadata,
      });
    },
    [userContext.id]
  );

  const dismissWidget = useCallback(
    (widgetId: string) => {
      setActiveWidgets((prev) => prev.filter((w) => w.id !== widgetId));
      trackWidgetEvent(widgetId, 'dismissal');
    },
    [trackWidgetEvent]
  );

  return {
    activeWidgets,
    isLoading,
    trackWidgetEvent,
    dismissWidget,
  };
};
