# Product Adoption Widget Documentation

## Overview

The Product Adoption Widget is a lightweight, dependency-free JavaScript library for creating interactive product tours on any website. It helps improve user onboarding, feature discovery, and overall product adoption.

## Features

- **Zero Dependencies**: Pure JavaScript implementation, no external libraries required
- **Lightweight**: Minified bundle under 50KB
- **Responsive**: Works on desktop and mobile devices
- **Customizable**: Extensive theming and configuration options
- **Analytics Ready**: Built-in integration with popular analytics platforms
- **Accessible**: WCAG 2.1 compliant with keyboard navigation support
- **CDN Ready**: Can be loaded from any CDN service

## Quick Start

### 1. Include the Widget

```html
<!-- From CDN -->
<script src="https://your-cdn.com/product-adoption-widget.min.js"></script>

<!-- Or local file -->
<script src="/path/to/product-adoption-widget.min.js"></script>
```

### 2. Initialize the Widget

```javascript
const widget = ProductAdoptionWidget.init({
  tours: [
    {
      id: 'welcome-tour',
      name: 'Welcome Tour',
      steps: [
        {
          title: 'Welcome!',
          content: 'Let us show you around.',
          placement: 'center'
        },
        {
          target: '.navbar',
          title: 'Navigation',
          content: 'Use the navigation bar to access different sections.',
          placement: 'bottom'
        }
      ]
    }
  ]
});

// Start a tour
widget.startTour('welcome-tour');
```

## Installation

### NPM/Yarn

```bash
npm install product-adoption-widget
# or
yarn add product-adoption-widget
```

### CDN

```html
<script src="https://unpkg.com/product-adoption-widget@latest/dist/product-adoption-widget.min.js"></script>
```

### Manual Download

Download the latest release from the [releases page](#) and include it in your project.

## Configuration Options

### Basic Configuration

```javascript
ProductAdoptionWidget.init({
  // Theme
  theme: 'light', // 'light' | 'dark' | 'auto'
  
  // Tours
  tours: [], // Array of tour objects
  autoStart: false, // Auto-start first available tour
  startDelay: 0, // Delay before auto-start (ms)
  
  // UI Options
  position: 'bottom-right', // Widget position
  zIndex: 999999, // Base z-index
  backdrop: true, // Show backdrop
  backdropColor: 'rgba(0, 0, 0, 0.7)',
  animation: true, // Enable animations
  animationDuration: 300, // Animation duration (ms)
  
  // Behavior
  closeOnBackdropClick: true,
  closeOnEscape: true,
  showStepNumbers: true,
  showProgressBar: true,
  
  // Storage
  storage: {
    enabled: true,
    key: 'product-adoption-widget',
    type: 'localStorage' // 'localStorage' | 'sessionStorage' | 'cookie'
  }
});
```

### Tour Configuration

```javascript
{
  id: 'tour-id', // Unique tour identifier
  name: 'Tour Name', // Display name
  showOnce: false, // Show only once per user
  condition: () => true, // Function to determine if tour should be shown
  steps: [
    {
      // Step content
      title: 'Step Title',
      content: 'Step description with <strong>HTML support</strong>',
      
      // Targeting
      target: '#element-id', // CSS selector for target element
      placement: 'bottom', // Tooltip placement
      
      // Behavior
      backdrop: true, // Show backdrop for this step
      allowInteraction: false, // Allow interaction with target
      scrollTo: true, // Auto-scroll to target
      scrollOffset: 100, // Scroll offset in pixels
      
      // Buttons
      buttons: {
        next: 'Next',
        prev: 'Previous',
        skip: 'Skip',
        done: 'Done'
      }
    }
  ]
}
```

### Placement Options

- `top`, `top-start`, `top-end`
- `bottom`, `bottom-start`, `bottom-end`
- `left`, `left-start`, `left-end`
- `right`, `right-start`, `right-end`
- `center` (centers in viewport, no target)

## API Reference

### Widget Methods

#### `init(config)`
Initialize a new widget instance.

```javascript
const widget = ProductAdoptionWidget.init(config);
```

#### `startTour(tourId, startStep)`
Start a specific tour.

```javascript
widget.startTour('welcome-tour', 0);
```

#### `endTour()`
End the current tour.

```javascript
widget.endTour();
```

#### `nextStep()`
Go to the next step.

```javascript
widget.nextStep();
```

#### `prevStep()`
Go to the previous step.

```javascript
widget.prevStep();
```

#### `goToStep(stepIndex)`
Jump to a specific step.

```javascript
widget.goToStep(2);
```

#### `getProgress()`
Get current tour progress.

```javascript
const progress = widget.getProgress();
// Returns: { active: true, tourId: 'tour-id', currentStep: 1, totalSteps: 5, progress: 40 }
```

#### `getTours()`
Get all available tours.

```javascript
const tours = widget.getTours();
```

#### `reset()`
Reset widget state and clear storage.

```javascript
widget.reset();
```

#### `destroy()`
Destroy the widget instance.

```javascript
widget.destroy();
```

### Event Handling

#### `on(event, handler)`
Subscribe to widget events.

```javascript
widget.on('tour:start', (data) => {
  console.log('Tour started:', data);
});
```

#### `off(event, handler)`
Unsubscribe from widget events.

```javascript
widget.off('tour:start', handler);
```

### Available Events

- `widget:init` - Widget initialized
- `widget:ready` - Widget ready for use
- `tour:start` - Tour started
- `tour:complete` - Tour completed
- `tour:skip` - Tour skipped
- `step:change` - Step changed
- `step:complete` - Step completed
- `widget:error` - Error occurred

## Analytics Integration

The widget automatically integrates with popular analytics platforms:

### Supported Platforms

- Google Analytics (GA4)
- Google Analytics (Universal)
- Segment
- Mixpanel
- Amplitude
- PostHog

### Custom Analytics

```javascript
ProductAdoptionWidget.init({
  analytics: {
    enabled: true,
    customTracker: (event) => {
      // Send to your analytics platform
      myAnalytics.track(event.name, event.data);
    }
  }
});
```

### Analytics Events

- `widget_initialized`
- `tour_started`
- `tour_completed`
- `tour_skipped`
- `step_viewed`
- `step_completed`
- `widget_error`

## Styling

### CSS Classes

The widget uses BEM-style CSS classes:

- `.paw-container` - Main container
- `.paw-tooltip` - Tooltip container
- `.paw-backdrop` - Backdrop element
- `.paw-highlight` - Element highlighter
- `.paw-button` - Button base class
- `.paw-button-primary` - Primary button
- `.paw-button-secondary` - Secondary button
- `.paw-progress-bar` - Progress bar

### Custom Styles

```javascript
ProductAdoptionWidget.init({
  customStyles: `
    .paw-tooltip {
      font-family: 'Custom Font', sans-serif;
    }
    .paw-button-primary {
      background: #ff6b6b;
    }
  `
});
```

### Theme Customization

```css
/* Light theme overrides */
[data-paw-theme="light"] .paw-tooltip {
  background: #f8f9fa;
  color: #212529;
}

/* Dark theme overrides */
[data-paw-theme="dark"] .paw-tooltip {
  background: #212529;
  color: #f8f9fa;
}
```

## Advanced Usage

### Dynamic Tour Loading

```javascript
// Load tours from API
async function loadTours() {
  const response = await fetch('/api/tours');
  const tours = await response.json();
  
  const widget = ProductAdoptionWidget.init({
    tours: tours
  });
}
```

### Conditional Tours

```javascript
{
  id: 'admin-tour',
  name: 'Admin Features',
  condition: () => {
    // Show only for admin users
    return user.role === 'admin';
  },
  steps: [...]
}
```

### Multi-language Support

```javascript
const translations = {
  en: {
    next: 'Next',
    prev: 'Previous',
    skip: 'Skip',
    done: 'Done'
  },
  es: {
    next: 'Siguiente',
    prev: 'Anterior',
    skip: 'Omitir',
    done: 'Hecho'
  }
};

const userLang = navigator.language.split('-')[0];
const buttons = translations[userLang] || translations.en;

ProductAdoptionWidget.init({
  tours: [{
    steps: [{
      buttons: buttons
    }]
  }]
});
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- iOS Safari: iOS 12+
- Chrome for Android: Latest

## Troubleshooting

### Widget not appearing

1. Check console for errors
2. Verify target elements exist
3. Check z-index conflicts
4. Ensure tours array is not empty

### Tours not persisting

1. Check storage configuration
2. Verify localStorage is not disabled
3. Check for storage quota issues

### Performance issues

1. Minimize number of active tours
2. Use efficient CSS selectors
3. Disable animations on slower devices

## Best Practices

1. **Keep tours short**: 3-7 steps per tour
2. **Clear messaging**: Use concise, action-oriented copy
3. **Progressive disclosure**: Don't overwhelm users
4. **Test thoroughly**: Test on different devices and browsers
5. **Track analytics**: Monitor completion rates
6. **Respect user choice**: Allow skipping and dismissal

## License

MIT License - see LICENSE file for details