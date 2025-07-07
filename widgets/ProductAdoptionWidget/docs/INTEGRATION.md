# Product Adoption Widget - Integration Guide

## Quick Integration (5 minutes)

### Step 1: Include the Widget

Add this script tag before the closing `</body>` tag:

```html
<script src="https://your-cdn.com/product-adoption-widget.min.js"></script>
```

### Step 2: Initialize with Your Tours

```html
<script>
  // Initialize the widget when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    const widget = ProductAdoptionWidget.init({
      tours: [
        {
          id: 'onboarding',
          name: 'User Onboarding',
          steps: [
            {
              title: 'Welcome to Our App!',
              content: 'Let us show you around.',
              placement: 'center'
            },
            {
              target: '.navbar',
              title: 'Navigation Bar',
              content: 'Access all features from here.',
              placement: 'bottom'
            },
            {
              target: '#user-profile',
              title: 'Your Profile',
              content: 'Manage your account settings here.',
              placement: 'left'
            }
          ]
        }
      ]
    });
    
    // Start the tour automatically for new users
    if (!localStorage.getItem('onboarding-completed')) {
      widget.startTour('onboarding');
    }
    
    // Mark as completed when done
    widget.on('tour:complete', (data) => {
      if (data.tourId === 'onboarding') {
        localStorage.setItem('onboarding-completed', 'true');
      }
    });
  });
</script>
```

## Integration Examples

### React Integration

```jsx
import { useEffect, useRef } from 'react';

function App() {
  const widgetRef = useRef(null);
  
  useEffect(() => {
    // Load widget script
    const script = document.createElement('script');
    script.src = 'https://your-cdn.com/product-adoption-widget.min.js';
    script.async = true;
    script.onload = () => {
      // Initialize widget
      widgetRef.current = window.ProductAdoptionWidget.init({
        tours: [/* your tours */]
      });
    };
    document.body.appendChild(script);
    
    // Cleanup
    return () => {
      if (widgetRef.current) {
        widgetRef.current.destroy();
      }
    };
  }, []);
  
  const startTour = () => {
    if (widgetRef.current) {
      widgetRef.current.startTour('main-tour');
    }
  };
  
  return (
    <div>
      <button onClick={startTour}>Start Tour</button>
    </div>
  );
}
```

### Vue Integration

```vue
<template>
  <div>
    <button @click="startTour">Start Tour</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      widget: null
    };
  },
  mounted() {
    // Load widget script
    const script = document.createElement('script');
    script.src = 'https://your-cdn.com/product-adoption-widget.min.js';
    script.async = true;
    script.onload = () => {
      // Initialize widget
      this.widget = window.ProductAdoptionWidget.init({
        tours: [/* your tours */]
      });
    };
    document.body.appendChild(script);
  },
  beforeDestroy() {
    if (this.widget) {
      this.widget.destroy();
    }
  },
  methods: {
    startTour() {
      if (this.widget) {
        this.widget.startTour('main-tour');
      }
    }
  }
};
</script>
```

### Angular Integration

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';

declare global {
  interface Window {
    ProductAdoptionWidget: any;
  }
}

@Component({
  selector: 'app-root',
  template: `
    <button (click)="startTour()">Start Tour</button>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  private widget: any;
  
  ngOnInit() {
    // Load widget script
    const script = document.createElement('script');
    script.src = 'https://your-cdn.com/product-adoption-widget.min.js';
    script.async = true;
    script.onload = () => {
      // Initialize widget
      this.widget = window.ProductAdoptionWidget.init({
        tours: [/* your tours */]
      });
    };
    document.body.appendChild(script);
  }
  
  ngOnDestroy() {
    if (this.widget) {
      this.widget.destroy();
    }
  }
  
  startTour() {
    if (this.widget) {
      this.widget.startTour('main-tour');
    }
  }
}
```

## Loading Tours from API

```javascript
// Load tours dynamically from your backend
async function initializeWidget() {
  try {
    // Fetch tours from your API
    const response = await fetch('/api/tours', {
      headers: {
        'Authorization': 'Bearer YOUR_API_TOKEN'
      }
    });
    const tours = await response.json();
    
    // Initialize widget with fetched tours
    const widget = ProductAdoptionWidget.init({
      tours: tours,
      analytics: {
        enabled: true,
        endpoint: '/api/analytics'
      }
    });
    
    // Start tour based on user segment
    const userSegment = getUserSegment();
    if (userSegment === 'new_user') {
      widget.startTour('onboarding');
    } else if (userSegment === 'power_user') {
      widget.startTour('advanced-features');
    }
  } catch (error) {
    console.error('Failed to load tours:', error);
  }
}
```

## Custom Styling

```javascript
ProductAdoptionWidget.init({
  customStyles: `
    /* Match your brand colors */
    .paw-button-primary {
      background: #your-brand-color;
    }
    
    /* Custom fonts */
    .paw-tooltip {
      font-family: 'Your Brand Font', sans-serif;
    }
    
    /* Custom tooltip width */
    .paw-tooltip {
      max-width: 500px;
    }
  `
});
```

## Analytics Setup

### Google Analytics 4

```javascript
// Ensure GA4 is loaded first
gtag('config', 'GA_MEASUREMENT_ID');

// Widget will automatically track events
ProductAdoptionWidget.init({
  analytics: {
    enabled: true
  }
});
```

### Custom Analytics

```javascript
ProductAdoptionWidget.init({
  analytics: {
    enabled: true,
    customTracker: (event) => {
      // Send to your analytics service
      yourAnalytics.track({
        event: event.name,
        properties: event.data,
        userId: getCurrentUserId()
      });
    }
  }
});
```

## Security Considerations

1. **Content Security Policy (CSP)**
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="script-src 'self' https://your-cdn.com; style-src 'self' 'unsafe-inline';">
   ```

2. **Subresource Integrity (SRI)**
   ```html
   <script src="https://your-cdn.com/product-adoption-widget.min.js"
           integrity="sha384-YOUR-HASH"
           crossorigin="anonymous"></script>
   ```

3. **API Authentication**
   ```javascript
   ProductAdoptionWidget.init({
     apiEndpoint: 'https://api.yourapp.com/tours',
     apiKey: 'YOUR_SECURE_API_KEY' // Use environment-specific keys
   });
   ```

## Performance Optimization

1. **Lazy Loading**
   ```javascript
   // Load widget only when needed
   function loadWidget() {
     if (!window.ProductAdoptionWidget) {
       const script = document.createElement('script');
       script.src = 'widget.min.js';
       script.async = true;
       document.body.appendChild(script);
     }
   }
   ```

2. **Conditional Loading**
   ```javascript
   // Load only for logged-in users
   if (user.isLoggedIn) {
     loadWidget();
   }
   ```

3. **Prefetch/Preload**
   ```html
   <!-- Preload for faster loading -->
   <link rel="preload" href="https://your-cdn.com/product-adoption-widget.min.js" as="script">
   ```

## Troubleshooting

### Widget Not Loading

```javascript
// Check if widget loaded successfully
if (typeof ProductAdoptionWidget === 'undefined') {
  console.error('Widget failed to load');
  // Implement fallback
}
```

### Event Handling

```javascript
// Debug events
widget.on('widget:error', (error) => {
  console.error('Widget error:', error);
  // Send to error tracking service
});
```

### Testing

```javascript
// Test mode with verbose logging
ProductAdoptionWidget.init({
  debug: true,
  tours: [/* test tours */]
});
```