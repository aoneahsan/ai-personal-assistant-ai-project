import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tourService } from '../services';
import { Tour, FilterOptions, ServiceResponse } from '../types';
import { useToast } from '@/hooks/useToast';

export const useTours = (filters?: FilterOptions) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Fetch tours
  const {
    data: toursResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['tours', filters],
    queryFn: () => tourService.listTours(filters),
  });

  // Create tour mutation
  const createTourMutation = useMutation({
    mutationFn: (tourData: Partial<Tour>) => tourService.createTour(tourData),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['tours'] });
        showToast({
          severity: 'success',
          summary: 'Tour Created',
          detail: 'Tour has been created successfully',
        });
      } else {
        showToast({
          severity: 'error',
          summary: 'Error',
          detail: response.error?.message || 'Failed to create tour',
        });
      }
    },
    onError: (error) => {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'An unexpected error occurred',
      });
    },
  });

  // Update tour mutation
  const updateTourMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Tour> }) =>
      tourService.updateTour(id, updates),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['tours'] });
        queryClient.invalidateQueries({ queryKey: ['tour', response.data?.id] });
        showToast({
          severity: 'success',
          summary: 'Tour Updated',
          detail: 'Tour has been updated successfully',
        });
      } else {
        showToast({
          severity: 'error',
          summary: 'Error',
          detail: response.error?.message || 'Failed to update tour',
        });
      }
    },
  });

  // Delete tour mutation
  const deleteTourMutation = useMutation({
    mutationFn: (tourId: string) => tourService.deleteTour(tourId),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['tours'] });
        showToast({
          severity: 'success',
          summary: 'Tour Deleted',
          detail: 'Tour has been deleted successfully',
        });
      } else {
        showToast({
          severity: 'error',
          summary: 'Error',
          detail: response.error?.message || 'Failed to delete tour',
        });
      }
    },
  });

  // Duplicate tour mutation
  const duplicateTourMutation = useMutation({
    mutationFn: ({ tourId, newName }: { tourId: string; newName?: string }) =>
      tourService.duplicateTour(tourId, newName),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['tours'] });
        showToast({
          severity: 'success',
          summary: 'Tour Duplicated',
          detail: 'Tour has been duplicated successfully',
        });
      } else {
        showToast({
          severity: 'error',
          summary: 'Error',
          detail: response.error?.message || 'Failed to duplicate tour',
        });
      }
    },
  });

  const tours = toursResponse?.success ? toursResponse.data || [] : [];

  return {
    tours,
    isLoading,
    error,
    refetch,
    createTour: createTourMutation.mutate,
    updateTour: updateTourMutation.mutate,
    deleteTour: deleteTourMutation.mutate,
    duplicateTour: duplicateTourMutation.mutate,
    isCreating: createTourMutation.isPending,
    isUpdating: updateTourMutation.isPending,
    isDeleting: deleteTourMutation.isPending,
    isDuplicating: duplicateTourMutation.isPending,
  };
};

export const useTour = (tourId: string) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const {
    data: tourResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['tour', tourId],
    queryFn: () => tourService.getTour(tourId),
    enabled: !!tourId,
  });

  const tour = tourResponse?.success ? tourResponse.data : null;

  const updateTour = useCallback(
    async (updates: Partial<Tour>) => {
      const response = await tourService.updateTour(tourId, updates);
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
        queryClient.invalidateQueries({ queryKey: ['tours'] });
      }
      return response;
    },
    [tourId, queryClient]
  );

  return {
    tour,
    isLoading,
    error,
    updateTour,
  };
};