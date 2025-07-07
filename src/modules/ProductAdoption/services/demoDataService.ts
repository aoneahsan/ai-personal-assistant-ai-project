import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { demoTours, demoWidgets } from '../utils/demoData';
import { consoleLog, consoleError } from '@/utils/helpers/consoleHelper';

class DemoDataService {
  private readonly TOURS_COLLECTION = 'pca_product_tours';
  private readonly WIDGETS_COLLECTION = 'pca_product_widgets';

  /**
   * Initialize demo data in Firestore
   */
  async initializeDemoData(): Promise<{ success: boolean; message: string }> {
    try {
      // Check if demo data already exists
      const toursQuery = query(collection(db, this.TOURS_COLLECTION), where('id', '==', 'welcome-tour'));
      const existingTours = await getDocs(toursQuery);
      
      if (!existingTours.empty) {
        return {
          success: false,
          message: 'Demo data already exists',
        };
      }

      // Add demo tours
      consoleLog('Adding demo tours...');
      for (const tour of demoTours) {
        await setDoc(doc(db, this.TOURS_COLLECTION, tour.id), {
          ...tour,
          createdAt: tour.createdAt,
          updatedAt: tour.updatedAt,
        });
      }

      // Add demo widgets
      consoleLog('Adding demo widgets...');
      for (const widget of demoWidgets) {
        await setDoc(doc(db, this.WIDGETS_COLLECTION, widget.id), {
          ...widget,
          createdAt: widget.createdAt,
          updatedAt: widget.updatedAt,
        });
      }

      consoleLog('Demo data initialized successfully');
      return {
        success: true,
        message: 'Demo data initialized successfully',
      };
    } catch (error) {
      consoleError('Error initializing demo data:', error);
      return {
        success: false,
        message: 'Failed to initialize demo data',
      };
    }
  }

  /**
   * Clear all demo data from Firestore
   */
  async clearDemoData(): Promise<{ success: boolean; message: string }> {
    try {
      // Clear demo tours
      const toursSnapshot = await getDocs(collection(db, this.TOURS_COLLECTION));
      const tourDeletions = toursSnapshot.docs
        .filter(doc => demoTours.some(tour => tour.id === doc.id))
        .map(doc => setDoc(doc.ref, { deleted: true }, { merge: true }));
      
      await Promise.all(tourDeletions);

      // Clear demo widgets
      const widgetsSnapshot = await getDocs(collection(db, this.WIDGETS_COLLECTION));
      const widgetDeletions = widgetsSnapshot.docs
        .filter(doc => demoWidgets.some(widget => widget.id === doc.id))
        .map(doc => setDoc(doc.ref, { deleted: true }, { merge: true }));
      
      await Promise.all(widgetDeletions);

      consoleLog('Demo data cleared successfully');
      return {
        success: true,
        message: 'Demo data cleared successfully',
      };
    } catch (error) {
      consoleError('Error clearing demo data:', error);
      return {
        success: false,
        message: 'Failed to clear demo data',
      };
    }
  }

  /**
   * Check if demo data exists
   */
  async checkDemoDataExists(): Promise<boolean> {
    try {
      const toursQuery = query(collection(db, this.TOURS_COLLECTION), where('id', '==', 'welcome-tour'));
      const existingTours = await getDocs(toursQuery);
      return !existingTours.empty;
    } catch (error) {
      consoleError('Error checking demo data:', error);
      return false;
    }
  }
}

export const demoDataService = new DemoDataService();