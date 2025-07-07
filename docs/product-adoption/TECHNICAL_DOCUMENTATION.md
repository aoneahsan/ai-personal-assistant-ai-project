# Product Adoption Module - Technical Documentation

## Architecture Overview

The Product Adoption module is built as a self-contained module within the application, following a modular architecture pattern.

### Directory Structure
```
src/modules/ProductAdoption/
├── components/
│   ├── ProductAdoption.tsx       # Main component
│   ├── Analytics/               # Analytics dashboard
│   ├── Management/              # Tour/Widget management
│   ├── TourBuilder/            # Visual tour builder
│   ├── TourPreview/            # Preview component
│   └── Widgets/                # Widget components
├── hooks/
│   ├── useAnalytics.ts         # Analytics data hook
│   ├── useTourProgress.ts      # Tour progress tracking
│   ├── useTours.ts             # Tour CRUD operations
│   └── useWidgets.ts           # Widget management
├── services/
│   ├── tourService.ts          # Tour API service
│   ├── widgetService.ts        # Widget API service
│   ├── analyticsService.ts     # Analytics service
│   ├── targetingService.ts     # User targeting logic
│   └── demoDataService.ts      # Demo data initialization
├── types/
│   ├── tour.types.ts           # Tour type definitions
│   ├── widget.types.ts         # Widget types
│   └── analytics.types.ts      # Analytics types
└── utils/
    ├── helpers.ts              # Utility functions
    ├── tourRenderer.ts         # Tour rendering engine
    ├── validation.ts           # Input validation
    └── demoData.ts            # Demo data definitions
```

## Core Components

### 1. Tour Engine (`tourRenderer.ts`)
The tour rendering engine handles:
- Element highlighting with overlay
- Tooltip positioning and animations
- Navigation between steps
- Event handling and callbacks
- Responsive positioning

### 2. Targeting System (`targetingService.ts`)
Sophisticated targeting based on:
- User segments (roles, subscription status)
- Behavioral patterns
- Page URLs and routes
- Custom conditions
- Exclusion rules

### 3. Analytics Engine (`analyticsService.ts`)
Tracks and aggregates:
- Tour views and completions
- Step-by-step funnel analysis
- Time spent per step
- Skip and exit points
- Widget interactions

## Database Schema

### Collections

#### `pca_product_tours`
```typescript
{
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  steps: TourStep[];
  trigger: TourTrigger;
  targeting: TourTargeting;
  settings: TourSettings;
  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
  analytics?: TourAnalytics;
}
```

#### `pca_tour_progress`
```typescript
{
  id: string;
  userId: string;
  tourId: string;
  status: 'started' | 'completed' | 'skipped';
  currentStep: number;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  timeSpent: number;
  stepProgress: StepProgress[];
}
```

#### `pca_product_widgets`
```typescript
{
  id: string;
  name: string;
  type: 'nps' | 'feedback' | 'announcement' | 'custom';
  status: 'active' | 'paused' | 'archived';
  trigger: WidgetTrigger;
  targeting: WidgetTargeting;
  content: WidgetContent;
  style: WidgetStyle;
  createdAt: Timestamp;
  createdBy: string;
  analytics?: WidgetAnalytics;
}
```

#### `pca_widget_events`
```typescript
{
  id: string;
  widgetId: string;
  userId?: string;
  eventType: 'impression' | 'interaction' | 'conversion' | 'dismiss';
  timestamp: Timestamp;
  metadata?: Record<string, any>;
}
```

## Firebase Security Rules

```javascript
// Product Tours - authenticated users can read, admins can write
match /pca_product_tours/{tourId} {
  allow read: if request.auth != null;
  allow create, update, delete: if request.auth != null && isAdminUser();
}

// Tour Progress - users can track their own progress
match /pca_tour_progress/{progressId} {
  allow read: if request.auth != null && 
    request.auth.uid == resource.data.userId;
  allow create, update: if request.auth != null && 
    request.auth.uid == request.resource.data.userId;
  allow delete: if false;
}

// Widgets - authenticated users can read, admins can write
match /pca_product_widgets/{widgetId} {
  allow read: if request.auth != null;
  allow create, update, delete: if request.auth != null && isAdminUser();
}

// Widget Events - users can create events, admins can read
match /pca_widget_events/{eventId} {
  allow create: if request.auth != null;
  allow read: if request.auth != null && isAdminUser();
  allow update, delete: if false;
}
```

## API Reference

### Hooks

#### `useTours()`
```typescript
const {
  tours,
  loading,
  error,
  createTour,
  updateTour,
  deleteTour,
  duplicateTour
} = useTours();
```

#### `useTourProgress(tourId: string)`
```typescript
const {
  progress,
  startTour,
  completeTour,
  skipTour,
  updateStepProgress
} = useTourProgress(tourId);
```

#### `useAnalytics(dateRange?: DateRange)`
```typescript
const {
  tourAnalytics,
  widgetAnalytics,
  userEngagement,
  loading,
  refresh
} = useAnalytics(dateRange);
```

### Services

#### TourService
```typescript
// Get all tours
await tourService.getTours();

// Create tour
await tourService.createTour(tourData);

// Update tour
await tourService.updateTour(tourId, updates);

// Delete tour
await tourService.deleteTour(tourId);

// Get user's tour progress
await tourService.getUserProgress(userId, tourId);
```

#### TargetingService
```typescript
// Check if user matches targeting rules
const matches = await targetingService.checkTargeting(user, targetingRules);

// Get user segments
const segments = await targetingService.getUserSegments(user);

// Evaluate conditions
const result = targetingService.evaluateConditions(conditions, context);
```

## Integration Points

### 1. Main Application
- Routes added to `/src/routes/routeTree.tsx`
- Navigation items in `/src/components/common/DashboardLayout.tsx`
- Module exports in `/src/modules/ProductAdoption/index.ts`

### 2. Dependencies
- **PrimeReact**: UI components (TabView, Dialog, Button, etc.)
- **Quill**: Rich text editor for content
- **Firebase**: Database and authentication
- **React Query**: Data fetching and caching

### 3. Global State
The module maintains its own state and doesn't depend on global state management.

## Performance Considerations

### 1. Lazy Loading
- Tour content is loaded on-demand
- Widget scripts are injected only when needed
- Analytics data uses pagination

### 2. Caching Strategy
- Tours are cached for 5 minutes
- User progress is cached per session
- Analytics use incremental updates

### 3. Bundle Size
- Main module: ~95KB (gzipped: ~22KB)
- Quill editor loaded on-demand
- CSS split into component chunks

## Testing

### Unit Tests
```typescript
describe('TourBuilder', () => {
  it('should create a new tour with default values');
  it('should validate tour steps before saving');
  it('should handle step reordering');
});

describe('TargetingService', () => {
  it('should match user segments correctly');
  it('should evaluate URL patterns');
  it('should handle complex conditions');
});
```

### Integration Tests
- Tour creation and preview flow
- Widget display and interaction
- Analytics data collection
- User progress tracking

## Deployment

### Environment Variables
None required - uses existing Firebase configuration.

### Build Process
```bash
# Development
npm run dev

# Production build
npm run build

# Deploy Firebase rules
npm run deploy:rules
```

### Migration Guide
For existing installations:
1. Deploy new Firebase security rules
2. Run database migrations if needed
3. Initialize demo data for testing
4. Configure user permissions

## Monitoring

### Key Metrics
- Tour completion rates
- Average time per step
- Widget conversion rates
- Error rates and types

### Logging
- All errors logged to Sentry
- Analytics events to Firebase
- Debug mode available in development

## Future Enhancements

### Planned Features
1. A/B testing for tours
2. Multi-language support
3. Video/GIF support in steps
4. Advanced branching logic
5. Integration with third-party analytics

### API Extensions
1. REST API for external integrations
2. Webhook support for events
3. Batch operations
4. Export/import functionality

---

Last Updated: January 2024
Version: 1.0.0