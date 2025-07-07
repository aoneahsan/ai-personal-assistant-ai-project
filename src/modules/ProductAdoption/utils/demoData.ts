import { Tour, Widget } from '../types';

export const demoTours: Tour[] = [
  {
    id: 'welcome-tour',
    name: 'Welcome Tour',
    description: 'Introduce new users to the main features of the application',
    status: 'active',
    trigger: {
      type: 'auto',
      conditions: {
        pageUrl: '/dashboard',
        userSegment: 'new_users',
        delay: 2000,
      },
    },
    targeting: {
      segments: ['new_users'],
      includeAnonymous: false,
      excludeCompletedUsers: true,
    },
    settings: {
      theme: {
        primaryColor: '#1976d2',
        textColor: '#333333',
        backgroundColor: '#ffffff',
        overlayColor: '#000000',
        overlayOpacity: 0.5,
        borderRadius: 8,
      },
      behavior: {
        allowSkip: true,
        allowClose: true,
        progressBar: true,
        keyboardNavigation: true,
        closeOnOverlayClick: false,
        showStepNumbers: true,
      },
      animation: {
        duration: 300,
        type: 'fade',
      },
    },
    steps: [
      {
        id: 'step-1',
        title: 'Welcome to Your Dashboard',
        content: 'This is your personal dashboard where you can see all your important information at a glance.',
        target: '.dashboard-header',
        placement: 'bottom',
        actions: [
          { label: 'Next', action: 'next', style: 'primary' },
          { label: 'Skip Tour', action: 'close', style: 'link' },
        ],
      },
      {
        id: 'step-2',
        title: 'Navigation Menu',
        content: 'Use this menu to navigate between different sections of the application.',
        target: '.sidebar-menu',
        placement: 'right',
        actions: [
          { label: 'Back', action: 'back', style: 'secondary' },
          { label: 'Next', action: 'next', style: 'primary' },
        ],
      },
      {
        id: 'step-3',
        title: 'Quick Actions',
        content: 'Access frequently used features quickly from here.',
        target: '.quick-actions',
        placement: 'left',
        actions: [
          { label: 'Back', action: 'back', style: 'secondary' },
          { label: 'Got it!', action: 'close', style: 'primary' },
        ],
      },
    ],
    createdAt: new Date('2024-01-15'),
    createdBy: 'admin',
    updatedAt: new Date('2024-01-15'),
    analytics: {
      views: 1250,
      completions: 892,
      skips: 358,
      averageTime: 45.2,
    },
  },
  {
    id: 'feature-highlight',
    name: 'New Feature Highlight',
    description: 'Show users the latest features added to the platform',
    status: 'active',
    trigger: {
      type: 'manual',
    },
    targeting: {
      segments: ['all_users'],
      includeAnonymous: false,
      excludeCompletedUsers: true,
    },
    settings: {
      theme: {
        primaryColor: '#28a745',
        textColor: '#ffffff',
        backgroundColor: '#333333',
        overlayColor: '#000000',
        overlayOpacity: 0.7,
        borderRadius: 12,
      },
      behavior: {
        allowSkip: true,
        allowClose: true,
        progressBar: true,
        keyboardNavigation: true,
        closeOnOverlayClick: true,
        showStepNumbers: false,
      },
      animation: {
        duration: 500,
        type: 'slide',
      },
    },
    steps: [
      {
        id: 'feature-1',
        title: 'New Analytics Dashboard',
        content: 'Check out our brand new analytics dashboard with real-time insights!',
        target: '#analytics-section',
        placement: 'top',
        image: '/assets/analytics-preview.png',
        actions: [
          { label: 'Show Me', action: 'next', style: 'primary' },
          { label: 'Maybe Later', action: 'close', style: 'ghost' },
        ],
      },
    ],
    createdAt: new Date('2024-02-01'),
    createdBy: 'admin',
    updatedAt: new Date('2024-02-01'),
    analytics: {
      views: 450,
      completions: 380,
      skips: 70,
      averageTime: 25.8,
    },
  },
  {
    id: 'onboarding-flow',
    name: 'User Onboarding Flow',
    description: 'Complete onboarding process for new users',
    status: 'draft',
    trigger: {
      type: 'element',
      selector: '.start-onboarding-btn',
    },
    targeting: {
      segments: ['trial_users', 'new_users'],
      includeAnonymous: false,
      excludeCompletedUsers: false,
    },
    settings: {
      theme: {
        primaryColor: '#6c757d',
        textColor: '#212529',
        backgroundColor: '#f8f9fa',
        overlayColor: '#000000',
        overlayOpacity: 0.3,
        borderRadius: 4,
      },
      behavior: {
        allowSkip: false,
        allowClose: false,
        progressBar: true,
        keyboardNavigation: false,
        closeOnOverlayClick: false,
        showStepNumbers: true,
      },
      animation: {
        duration: 200,
        type: 'none',
      },
    },
    steps: [
      {
        id: 'profile-setup',
        title: 'Set Up Your Profile',
        content: 'Let\'s start by setting up your profile information.',
        target: '.profile-form',
        placement: 'center',
        actions: [
          { label: 'Continue', action: 'next', style: 'primary' },
        ],
      },
      {
        id: 'preferences',
        title: 'Choose Your Preferences',
        content: 'Select your preferences to personalize your experience.',
        target: '.preferences-section',
        placement: 'center',
        actions: [
          { label: 'Back', action: 'back', style: 'secondary' },
          { label: 'Continue', action: 'next', style: 'primary' },
        ],
      },
    ],
    createdAt: new Date('2024-01-20'),
    createdBy: 'admin',
    updatedAt: new Date('2024-01-25'),
  },
];

export const demoWidgets: Widget[] = [
  {
    id: 'nps-survey',
    name: 'NPS Survey Widget',
    type: 'nps',
    status: 'active',
    trigger: {
      type: 'exit_intent',
    },
    targeting: {
      segments: ['active_users'],
      includeAnonymous: false,
    },
    content: {
      title: 'How likely are you to recommend us?',
      description: 'Your feedback helps us improve',
      primaryButton: 'Submit',
      secondaryButton: 'Maybe Later',
    },
    style: {
      position: 'bottom-right',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      accentColor: '#1976d2',
      borderRadius: 8,
      shadow: true,
    },
    createdAt: new Date('2024-01-10'),
    createdBy: 'admin',
    updatedAt: new Date('2024-01-10'),
    analytics: {
      impressions: 5420,
      interactions: 1823,
      conversions: 892,
    },
  },
  {
    id: 'feedback-widget',
    name: 'Quick Feedback Widget',
    type: 'feedback',
    status: 'active',
    trigger: {
      type: 'manual',
    },
    targeting: {
      segments: ['all_users'],
      includeAnonymous: true,
    },
    content: {
      title: 'Send us feedback',
      description: 'Have a suggestion? We\'d love to hear from you!',
      primaryButton: 'Send Feedback',
    },
    style: {
      position: 'bottom-left',
      backgroundColor: '#28a745',
      textColor: '#ffffff',
      accentColor: '#ffffff',
      borderRadius: 50,
      shadow: true,
    },
    createdAt: new Date('2024-01-05'),
    createdBy: 'admin',
    updatedAt: new Date('2024-01-05'),
    analytics: {
      impressions: 12500,
      interactions: 892,
      conversions: 245,
    },
  },
  {
    id: 'announcement-banner',
    name: 'Announcement Banner',
    type: 'announcement',
    status: 'paused',
    trigger: {
      type: 'auto',
      conditions: {
        pageUrl: '/',
        delay: 0,
      },
    },
    targeting: {
      segments: ['all_users'],
      includeAnonymous: true,
    },
    content: {
      title: 'Scheduled Maintenance',
      description: 'We\'ll be performing maintenance on Saturday, 2 AM - 4 AM EST',
      primaryButton: 'Got it',
      link: '/maintenance-info',
    },
    style: {
      position: 'top',
      backgroundColor: '#ffc107',
      textColor: '#212529',
      accentColor: '#212529',
      borderRadius: 0,
      shadow: false,
    },
    createdAt: new Date('2024-02-10'),
    createdBy: 'admin',
    updatedAt: new Date('2024-02-10'),
    analytics: {
      impressions: 0,
      interactions: 0,
      conversions: 0,
    },
  },
];

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