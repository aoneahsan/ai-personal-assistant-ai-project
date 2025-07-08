import { Tour, WidgetConfig } from '../types';

// Simple demo data - can be enhanced later
export const demoTours: Tour[] = [];

export const demoWidgets: WidgetConfig[] = [];

export const demoAnalyticsData = {
  tourPerformance: {
    labels: ['Welcome Tour', 'Feature Highlight', 'Onboarding Flow'],
    datasets: [
      {
        label: 'Completion Rate',
        data: [71.36, 84.44, 0],
        backgroundColor: 'rgba(25, 118, 210, 0.5)',
      },
      {
        label: 'Skip Rate',
        data: [28.64, 15.56, 0],
        backgroundColor: 'rgba(255, 152, 0, 0.5)',
      },
    ],
  },
  userEngagement: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Tour Views',
        data: [450, 680, 720, 890, 1050, 1250],
        borderColor: 'rgb(25, 118, 210)',
        tension: 0.1,
      },
      {
        label: 'Completions',
        data: [320, 480, 510, 640, 750, 892],
        borderColor: 'rgb(40, 167, 69)',
        tension: 0.1,
      },
    ],
  },
  widgetPerformance: {
    labels: ['NPS Survey', 'Feedback Widget', 'Announcement'],
    datasets: [
      {
        label: 'Interaction Rate',
        data: [33.6, 7.1, 0],
        backgroundColor: [
          'rgba(25, 118, 210, 0.5)',
          'rgba(40, 167, 69, 0.5)',
          'rgba(255, 193, 7, 0.5)',
        ],
      },
    ],
  },
};
