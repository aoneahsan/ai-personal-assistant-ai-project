# Product Adoption Module

A comprehensive product adoption platform for creating interactive tours, tooltips, and user onboarding experiences.

## Features

- **Interactive Tours**: Create step-by-step guided tours
- **Advanced Analytics**: Track user engagement and completion rates
- **Smart Targeting**: Target specific user segments and behaviors
- **Flexible Widgets**: Tooltips, banners, modals, and more
- **A/B Testing**: Test different tour variations
- **Real-time Updates**: Live tour editing and preview

## Architecture

```
ProductAdoption/
├── components/          # React components
│   ├── TourBuilder/    # Tour creation and editing
│   ├── Analytics/      # Analytics dashboard
│   ├── Management/     # Tour management interface
│   └── Widgets/        # Widget components
├── hooks/              # Custom React hooks
├── services/           # Business logic and API
├── types/              # TypeScript definitions
└── utils/              # Helper functions
```

## Usage

### Basic Implementation

```tsx
import { ProductAdoption } from '@/modules/ProductAdoption';

function App() {
  return (
    <ProductAdoption />
  );
}
```

### Creating a Tour Programmatically

```tsx
import { tourService } from '@/modules/ProductAdoption';

const tour = await tourService.createTour({
  name: 'Welcome Tour',
  steps: [
    {
      title: 'Welcome!',
      content: 'Let us show you around',
      target: '.app-header',
      placement: 'bottom'
    }
  ],
  trigger: { type: 'auto', delay: 1000 },
  targeting: {
    segments: [],
    includeAnonymous: true,
    excludeCompletedUsers: true
  }
});
```

### Using Hooks

```tsx
import { useTours, useAnalytics } from '@/modules/ProductAdoption';

function MyComponent() {
  const { tours, createTour, updateTour } = useTours();
  const { analytics } = useAnalytics();
  
  // Use tour data and methods
}
```

## Services

### TourService
- `createTour(data)`: Create a new tour
- `updateTour(id, updates)`: Update existing tour
- `getTour(id)`: Get tour by ID
- `listTours(filters)`: List all tours
- `deleteTour(id)`: Delete a tour

### AnalyticsService
- `getAnalyticsOverview(filter)`: Get analytics overview
- `getTourPerformance(tourId)`: Get tour-specific metrics
- `getFunnelAnalysis(tourId)`: Get funnel conversion data
- `getUserEngagement(userId)`: Get user engagement metrics

### TargetingService
- `checkTourTargeting(targeting, user)`: Check if user matches targeting
- `checkWidgetTargeting(targeting, user, url)`: Check widget targeting

### WidgetService
- `createWidget(data)`: Create a new widget
- `getActiveWidgets(user, url)`: Get widgets for current context
- `trackWidgetEvent(event)`: Track widget interactions

## Tour Configuration

### Tour Steps
```typescript
{
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  actions: TourAction[];
  spotlightRadius?: number;
  spotlightPadding?: number;
}
```

### Targeting Options
```typescript
{
  segments: UserSegment[];
  includeAnonymous: boolean;
  excludeCompletedUsers: boolean;
  maxDisplayCount?: number;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
}
```

### Trigger Types
- **Manual**: Triggered via API call
- **Auto**: Triggered automatically with conditions
- **Event**: Triggered by custom events

## Styling

The module uses CSS variables for theming:

```css
--product-adoption-primary: #1976d2;
--product-adoption-text: #333333;
--product-adoption-background: #ffffff;
--product-adoption-overlay: rgba(0, 0, 0, 0.5);
```

## Firebase Integration

The module integrates with Firebase Firestore:

- `productAdoption_tours`: Tour configurations
- `productAdoption_progress`: User progress tracking
- `productAdoption_events`: Event tracking
- `productAdoption_widgets`: Widget configurations

## Best Practices

1. **Performance**: Tours are lazy-loaded only when needed
2. **Accessibility**: All components are keyboard navigable
3. **Mobile**: Responsive design for all screen sizes
4. **Analytics**: Track everything for data-driven decisions
5. **Testing**: A/B test different tour variations

## Future Enhancements

- [ ] Visual tour builder with drag-and-drop
- [ ] More widget types (NPS, surveys, checklists)
- [ ] Multi-language support
- [ ] Advanced branching logic
- [ ] Integration with third-party analytics