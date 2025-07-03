import { Preferences } from '@capacitor/preferences';
import { FEEDBACK_DISMISSAL_CONFIG, STORAGE_KEYS } from '../utils/constants';

class FeedbackDismissalService {
  private dismissHours: number =
    FEEDBACK_DISMISSAL_CONFIG.DEFAULT_DISMISS_HOURS;

  // Set custom dismissal time (in hours)
  setDismissalTime(hours: number): void {
    this.dismissHours = Math.max(
      FEEDBACK_DISMISSAL_CONFIG.MIN_DISMISS_HOURS,
      Math.min(hours, FEEDBACK_DISMISSAL_CONFIG.MAX_DISMISS_HOURS)
    );
  }

  // Get current dismissal time
  getDismissalTime(): number {
    return this.dismissHours;
  }

  // Dismiss the feedback widget
  async dismissWidget(): Promise<void> {
    try {
      const dismissedTime = new Date().toISOString();

      await Preferences.set({
        key: STORAGE_KEYS.WIDGET_DISMISSED,
        value: 'true',
      });

      await Preferences.set({
        key: STORAGE_KEYS.WIDGET_DISMISSED_TIME,
        value: dismissedTime,
      });

      console.log(
        'Feedback widget dismissed until:',
        new Date(Date.now() + this.dismissHours * 60 * 60 * 1000)
      );
    } catch (error) {
      console.error('Error dismissing feedback widget:', error);
      // Fallback to localStorage if Capacitor fails
      localStorage.setItem(STORAGE_KEYS.WIDGET_DISMISSED, 'true');
      localStorage.setItem(
        STORAGE_KEYS.WIDGET_DISMISSED_TIME,
        new Date().toISOString()
      );
    }
  }

  // Check if widget should be shown
  async shouldShowWidget(): Promise<boolean> {
    try {
      const { value: dismissed } = await Preferences.get({
        key: STORAGE_KEYS.WIDGET_DISMISSED,
      });

      if (dismissed !== 'true') {
        return true; // Not dismissed, show widget
      }

      const { value: dismissedTime } = await Preferences.get({
        key: STORAGE_KEYS.WIDGET_DISMISSED_TIME,
      });

      if (!dismissedTime) {
        return true; // No dismissal time, show widget
      }

      const dismissedDate = new Date(dismissedTime);
      const currentDate = new Date();
      const hoursElapsed =
        (currentDate.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60);

      if (hoursElapsed >= this.dismissHours) {
        // Time has passed, clear dismissal and show widget
        await this.clearDismissal();
        return true;
      }

      return false; // Still dismissed
    } catch (error) {
      console.error('Error checking widget dismissal status:', error);

      // Fallback to localStorage
      const dismissed = localStorage.getItem(STORAGE_KEYS.WIDGET_DISMISSED);
      if (dismissed !== 'true') {
        return true;
      }

      const dismissedTime = localStorage.getItem(
        STORAGE_KEYS.WIDGET_DISMISSED_TIME
      );
      if (!dismissedTime) {
        return true;
      }

      const dismissedDate = new Date(dismissedTime);
      const currentDate = new Date();
      const hoursElapsed =
        (currentDate.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60);

      if (hoursElapsed >= this.dismissHours) {
        this.clearDismissalFallback();
        return true;
      }

      return false;
    }
  }

  // Clear dismissal status
  async clearDismissal(): Promise<void> {
    try {
      await Preferences.remove({ key: STORAGE_KEYS.WIDGET_DISMISSED });
      await Preferences.remove({ key: STORAGE_KEYS.WIDGET_DISMISSED_TIME });
    } catch (error) {
      console.error('Error clearing dismissal status:', error);
      this.clearDismissalFallback();
    }
  }

  // Fallback to localStorage
  private clearDismissalFallback(): void {
    localStorage.removeItem(STORAGE_KEYS.WIDGET_DISMISSED);
    localStorage.removeItem(STORAGE_KEYS.WIDGET_DISMISSED_TIME);
  }

  // Get time remaining until widget reappears
  async getTimeRemaining(): Promise<{ hours: number; minutes: number } | null> {
    try {
      const { value: dismissed } = await Preferences.get({
        key: STORAGE_KEYS.WIDGET_DISMISSED,
      });

      if (dismissed !== 'true') {
        return null;
      }

      const { value: dismissedTime } = await Preferences.get({
        key: STORAGE_KEYS.WIDGET_DISMISSED_TIME,
      });

      if (!dismissedTime) {
        return null;
      }

      const dismissedDate = new Date(dismissedTime);
      const currentDate = new Date();
      const hoursElapsed =
        (currentDate.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60);
      const hoursRemaining = Math.max(0, this.dismissHours - hoursElapsed);

      return {
        hours: Math.floor(hoursRemaining),
        minutes: Math.floor((hoursRemaining % 1) * 60),
      };
    } catch (error) {
      console.error('Error getting time remaining:', error);
      return null;
    }
  }

  // Force show widget (clear dismissal immediately)
  async forceShowWidget(): Promise<void> {
    await this.clearDismissal();
  }
}

// Export singleton instance
export const feedbackDismissalService = new FeedbackDismissalService();

// Export class for custom instances
export { FeedbackDismissalService };
export default feedbackDismissalService;
