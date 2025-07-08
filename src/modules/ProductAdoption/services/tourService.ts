import { db } from '@/services/firebase';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  FilterOptions,
  ServiceResponse,
  Tour,
  TourEvent,
  TourProgress,
} from '../types';
import { generateTourId } from '../utils/helpers';
import { validateTour } from '../utils/validation';

export class TourService {
  private readonly COLLECTION = 'productAdoption_tours';
  private readonly PROGRESS_COLLECTION = 'productAdoption_progress';
  private readonly EVENTS_COLLECTION = 'productAdoption_events';

  async createTour(tourData: Partial<Tour>): Promise<ServiceResponse<Tour>> {
    try {
      // Validate tour data
      const validation = validateTour(tourData);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid tour data',
            details: validation.errors,
          },
        };
      }

      const tourId = tourData.id || generateTourId();
      const tour: Tour = {
        ...tourData,
        id: tourId,
        status: tourData.status || 'draft',
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        analytics: {
          impressions: 0,
          starts: 0,
          completions: 0,
          abandons: 0,
          averageCompletionTime: 0,
          stepAnalytics: {},
          lastUpdated: new Date(),
        },
      } as Tour;

      await setDoc(doc(db, this.COLLECTION, tourId), {
        ...tour,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return {
        success: true,
        data: tour,
        metadata: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
        },
      };
    } catch (error) {
      console.error('Error creating tour:', error);
      return {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: 'Failed to create tour',
          details: error,
        },
      };
    }
  }

  async updateTour(
    tourId: string,
    updates: Partial<Tour>
  ): Promise<ServiceResponse<Tour>> {
    try {
      const tourRef = doc(db, this.COLLECTION, tourId);
      const tourDoc = await getDoc(tourRef);

      if (!tourDoc.exists()) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Tour not found',
          },
        };
      }

      const currentTour = tourDoc.data() as Tour;
      const updatedTour = {
        ...currentTour,
        ...updates,
        version: currentTour.version + 1,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(tourRef, updatedTour);

      return {
        success: true,
        data: { ...updatedTour, updatedAt: new Date() } as Tour,
        metadata: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
        },
      };
    } catch (error) {
      console.error('Error updating tour:', error);
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update tour',
          details: error,
        },
      };
    }
  }

  async getTour(tourId: string): Promise<ServiceResponse<Tour>> {
    try {
      const tourDoc = await getDoc(doc(db, this.COLLECTION, tourId));

      if (!tourDoc.exists()) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Tour not found',
          },
        };
      }

      return {
        success: true,
        data: tourDoc.data() as Tour,
        metadata: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
        },
      };
    } catch (error) {
      console.error('Error getting tour:', error);
      return {
        success: false,
        error: {
          code: 'GET_ERROR',
          message: 'Failed to get tour',
          details: error,
        },
      };
    }
  }

  async listTours(filters?: FilterOptions): Promise<ServiceResponse<Tour[]>> {
    try {
      let q = query(collection(db, this.COLLECTION));

      // Apply filters
      if (filters?.status && filters.status.length > 0) {
        q = query(q, where('status', 'in', filters.status));
      }

      if (filters?.sortBy) {
        q = query(q, orderBy(filters.sortBy, filters.sortOrder || 'desc'));
      } else {
        q = query(q, orderBy('createdAt', 'desc'));
      }

      if (filters?.pageSize) {
        q = query(q, limit(filters.pageSize));
      }

      const snapshot = await getDocs(q);
      const tours = snapshot.docs.map((doc) => doc.data() as Tour);

      return {
        success: true,
        data: tours,
        metadata: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
          pagination: {
            page: filters?.page || 1,
            pageSize: filters?.pageSize || tours.length,
            totalItems: tours.length,
            totalPages: 1,
          },
        },
      };
    } catch (error) {
      console.error('Error listing tours:', error);
      return {
        success: false,
        error: {
          code: 'LIST_ERROR',
          message: 'Failed to list tours',
          details: error,
        },
      };
    }
  }

  async deleteTour(tourId: string): Promise<ServiceResponse<void>> {
    try {
      await deleteDoc(doc(db, this.COLLECTION, tourId));

      return {
        success: true,
        metadata: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
        },
      };
    } catch (error) {
      console.error('Error deleting tour:', error);
      return {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete tour',
          details: error,
        },
      };
    }
  }

  async duplicateTour(
    tourId: string,
    newName?: string
  ): Promise<ServiceResponse<Tour>> {
    try {
      const originalTourResponse = await this.getTour(tourId);
      if (!originalTourResponse.success || !originalTourResponse.data) {
        return {
          success: false,
          error: originalTourResponse.error || {
            code: 'NOT_FOUND',
            message: 'Original tour not found',
          },
        };
      }

      const originalTour = originalTourResponse.data;
      const duplicatedTour: Partial<Tour> = {
        ...originalTour,
        id: generateTourId(),
        name: newName || `${originalTour.name} (Copy)`,
        status: 'draft',
        version: 1,
        analytics: {
          impressions: 0,
          starts: 0,
          completions: 0,
          abandons: 0,
          averageCompletionTime: 0,
          stepAnalytics: {},
          lastUpdated: new Date(),
        },
      };

      return this.createTour(duplicatedTour);
    } catch (error) {
      console.error('Error duplicating tour:', error);
      return {
        success: false,
        error: {
          code: 'DUPLICATE_ERROR',
          message: 'Failed to duplicate tour',
          details: error,
        },
      };
    }
  }

  // Tour Progress Management
  async getTourProgress(
    tourId: string,
    userId: string
  ): Promise<ServiceResponse<TourProgress | null>> {
    try {
      const progressId = `${tourId}_${userId}`;
      const progressDoc = await getDoc(
        doc(db, this.PROGRESS_COLLECTION, progressId)
      );

      if (!progressDoc.exists()) {
        return {
          success: true,
          data: null,
        };
      }

      return {
        success: true,
        data: progressDoc.data() as TourProgress,
      };
    } catch (error) {
      console.error('Error getting tour progress:', error);
      return {
        success: false,
        error: {
          code: 'PROGRESS_ERROR',
          message: 'Failed to get tour progress',
          details: error,
        },
      };
    }
  }

  async updateTourProgress(
    progress: TourProgress
  ): Promise<ServiceResponse<void>> {
    try {
      const progressId = `${progress.tourId}_${progress.userId}`;
      await setDoc(
        doc(db, this.PROGRESS_COLLECTION, progressId),
        {
          ...progress,
          lastInteractionAt: serverTimestamp(),
        },
        { merge: true }
      );

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error updating tour progress:', error);
      return {
        success: false,
        error: {
          code: 'PROGRESS_UPDATE_ERROR',
          message: 'Failed to update tour progress',
          details: error,
        },
      };
    }
  }

  // Event Tracking
  async trackEvent(
    event: Omit<TourEvent, 'id'>
  ): Promise<ServiceResponse<void>> {
    try {
      const eventId = crypto.randomUUID();
      await setDoc(doc(db, this.EVENTS_COLLECTION, eventId), {
        ...event,
        id: eventId,
        timestamp: serverTimestamp(),
      });

      // Update tour analytics
      if (event.type === 'start' || event.type === 'complete') {
        await this.updateTourAnalytics(event.tourId, event.type);
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error tracking event:', error);
      return {
        success: false,
        error: {
          code: 'EVENT_TRACKING_ERROR',
          message: 'Failed to track event',
          details: error,
        },
      };
    }
  }

  private async updateTourAnalytics(
    tourId: string,
    eventType: string
  ): Promise<void> {
    const tourRef = doc(db, this.COLLECTION, tourId);
    const tourDoc = await getDoc(tourRef);

    if (tourDoc.exists()) {
      const tour = tourDoc.data() as Tour;
      const analytics = { ...tour.analytics };

      switch (eventType) {
        case 'start':
          analytics.starts += 1;
          break;
        case 'complete':
          analytics.completions += 1;
          break;
      }

      analytics.lastUpdated = new Date();

      await updateDoc(tourRef, { analytics });
    }
  }
}

// Export singleton instance
export const tourService = new TourService();
