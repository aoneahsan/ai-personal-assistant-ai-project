import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { tourService } from '../services';
import { TourProgress, TourEvent } from '../types';

export const useTourProgress = (tourId: string, userId: string) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const {
    data: progressResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['tour-progress', tourId, userId],
    queryFn: () => tourService.getTourProgress(tourId, userId),
    enabled: !!tourId && !!userId,
  });

  const updateProgressMutation = useMutation({
    mutationFn: (progress: TourProgress) => tourService.updateTourProgress(progress),
  });

  const trackEventMutation = useMutation({
    mutationFn: (event: Omit<TourEvent, 'id'>) => tourService.trackEvent(event),
  });

  const progress = progressResponse?.success ? progressResponse.data : null;

  useEffect(() => {
    if (progress) {
      setCurrentStepIndex(progress.currentStepIndex);
    }
  }, [progress]);

  const startTour = useCallback(async () => {
    const newProgress: TourProgress = {
      tourId,
      userId,
      currentStepIndex: 0,
      completedSteps: [],
      startedAt: new Date(),
      lastInteractionAt: new Date(),
      completed: false,
    };

    await updateProgressMutation.mutateAsync(newProgress);
    await trackEventMutation.mutateAsync({
      tourId,
      userId,
      type: 'start',
      timestamp: new Date(),
    });

    setCurrentStepIndex(0);
  }, [tourId, userId, updateProgressMutation, trackEventMutation]);

  const goToStep = useCallback(
    async (stepIndex: number, stepId: string) => {
      if (!progress) return;

      const updatedProgress: TourProgress = {
        ...progress,
        currentStepIndex: stepIndex,
        lastInteractionAt: new Date(),
      };

      await updateProgressMutation.mutateAsync(updatedProgress);
      await trackEventMutation.mutateAsync({
        tourId,
        userId,
        type: 'step-view',
        stepId,
        timestamp: new Date(),
      });

      setCurrentStepIndex(stepIndex);
    },
    [progress, tourId, userId, updateProgressMutation, trackEventMutation]
  );

  const completeStep = useCallback(
    async (stepId: string) => {
      if (!progress) return;

      const completedSteps = [...progress.completedSteps];
      if (!completedSteps.includes(stepId)) {
        completedSteps.push(stepId);
      }

      const updatedProgress: TourProgress = {
        ...progress,
        completedSteps,
        lastInteractionAt: new Date(),
      };

      await updateProgressMutation.mutateAsync(updatedProgress);
      await trackEventMutation.mutateAsync({
        tourId,
        userId,
        type: 'step-complete',
        stepId,
        timestamp: new Date(),
      });
    },
    [progress, tourId, userId, updateProgressMutation, trackEventMutation]
  );

  const skipStep = useCallback(
    async (stepId: string) => {
      await trackEventMutation.mutateAsync({
        tourId,
        userId,
        type: 'step-skip',
        stepId,
        timestamp: new Date(),
      });
    },
    [tourId, userId, trackEventMutation]
  );

  const completeTour = useCallback(async () => {
    if (!progress) return;

    const updatedProgress: TourProgress = {
      ...progress,
      completed: true,
      completedAt: new Date(),
      lastInteractionAt: new Date(),
    };

    await updateProgressMutation.mutateAsync(updatedProgress);
    await trackEventMutation.mutateAsync({
      tourId,
      userId,
      type: 'complete',
      timestamp: new Date(),
    });
  }, [progress, tourId, userId, updateProgressMutation, trackEventMutation]);

  const abandonTour = useCallback(
    async (stepId?: string) => {
      await trackEventMutation.mutateAsync({
        tourId,
        userId,
        type: 'abandon',
        stepId,
        timestamp: new Date(),
      });
    },
    [tourId, userId, trackEventMutation]
  );

  const goToNextStep = useCallback(() => {
    setCurrentStepIndex((prev) => prev + 1);
  }, []);

  const goToPreviousStep = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  return {
    progress,
    currentStepIndex,
    isLoading,
    startTour,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    completeStep,
    skipStep,
    completeTour,
    abandonTour,
    refetch,
  };
};