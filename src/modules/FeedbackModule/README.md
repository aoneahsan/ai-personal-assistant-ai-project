# Feedback Module 📝

A drag-and-drop feedback widget for React with Firebase Firestore integration.

## Features ✨

- 🎭 Emoji-based rating system (1-10 scale)
- 📝 Optional text feedback
- 🔐 Works with authenticated and anonymous users
- 🎨 Multiple themes (Light, Dark, Auto)
- 📱 Fully responsive
- ♿ Accessible
- 🚀 Easy integration - copy folder and go!

## Quick Start 🚀

### 1. Copy Module

Copy the `FeedbackModule` folder to your `src/modules/` directory.

### 2. Install Dependencies

```bash
npm install firebase
```

### 3. Basic Usage

```tsx
import React from 'react';
import { db, auth } from './firebase-config';
import { FeedbackModule } from './modules/FeedbackModule';

function App() {
  return (
    <div>
      <FeedbackModule
        firestore={db}
        user={user}
      />
    </div>
  );
}
```

## Configuration

```tsx
<FeedbackModule
  firestore={db}
  user={user}
  config={{
    collectionName: 'user_feedback',
    theme: 'auto', // 'light' | 'dark' | 'auto'
    position: 'bottom-right',
    modalTitle: 'How was your experience?',
    requireMessage: false,
    onSubmit: (feedback) => console.log(feedback),
  }}
/>
```

## Data Structure

```typescript
{
  rating: number; // 1-10
  emoji: string;
  label: string;
  message?: string;
  userId?: string;
  isAuthenticated: boolean;
  timestamp: Date;
  sessionId: string;
  // ... more metadata
}
```

## Firestore Rules

```javascript
match /user_feedback/{document} {
  allow create: if true;
  allow read: if request.auth != null;
}
```

## Configuration Options ⚙️

```tsx
import { FeedbackModule } from './modules/FeedbackModule';

<FeedbackModule
  firestore={db}
  user={user}
  config={{
    // Firebase settings
    collectionName: 'user_feedback', // Default: 'user_feedback'

    // UI Configuration
    theme: 'auto', // 'light' | 'dark' | 'auto'
    position: 'bottom-right', // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center'
    widgetText: '💬 Feedback',
    modalTitle: 'How was your experience?',
    submitButtonText: 'Submit Feedback',
    cancelButtonText: 'Cancel',
    placeholderText: 'Tell us more about your experience... (optional)',

    // Behavior
    showWidget: true,
    autoHide: false,
    hideAfterSubmit: true,
    requireMessage: false,

    // Callbacks
    onSubmit: (feedback) => console.log('Feedback submitted:', feedback),
    onError: (error) => console.error('Feedback error:', error),
    onSuccess: () => console.log('Feedback submitted successfully!'),
  }}
  autoShow={true}
/>;
```

## Advanced Usage 🔧

### Custom Hook Usage

For more control, use the hook directly:

```tsx
import React from 'react';
import { useFeedback, feedbackService } from './modules/FeedbackModule';

function CustomFeedbackComponent() {
  const feedback = useFeedback({
    user: currentUser,
    config: {
      requireMessage: true,
      hideAfterSubmit: false,
    },
  });

  // Initialize service
  React.useEffect(() => {
    feedbackService.initialize(firestore, config);
  }, []);

  return (
    <div>
      <button onClick={feedback.openWidget}>Give Feedback</button>

      {feedback.isOpen && <div>{/* Your custom UI */}</div>}
    </div>
  );
}
```

### Direct Service Usage

For programmatic feedback submission:

```tsx
import { feedbackService } from './modules/FeedbackModule';

// Initialize once
feedbackService.initialize(firestore);

// Submit feedback programmatically
await feedbackService.submitFeedbook(
  8, // rating
  '😄', // emoji
  'Great', // label
  'This app is amazing!', // message
  user, // Firebase user or null
  { source: 'api' } // metadata
);
```

## Theming 🎨

The module supports three themes:

### Light Theme

```tsx
<FeedbackModule config={{ theme: 'light' }} />
```

### Dark Theme

```tsx
<FeedbackModule config={{ theme: 'dark' }} />
```

### Auto Theme (follows system preference)

```tsx
<FeedbackModule config={{ theme: 'auto' }} />
```

## Positioning 📍

Widget can be positioned anywhere on the screen:

```tsx
<FeedbackModule
  config={{
    position: 'bottom-right', // default
    // Options: 'bottom-right', 'bottom-left', 'top-right', 'top-left', 'center'
  }}
/>
```

## Accessibility ♿

The module is fully accessible:

- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Focus management
- ARIA labels and roles

## Mobile Optimization 📱

- Touch-friendly interface
- Responsive design
- Reduced animations on mobile
- Optimized for small screens

## Analytics & Callbacks 📈

Track feedback usage with built-in callbacks:

```tsx
<FeedbackModule
  config={{
    onSubmit: (feedback) => {
      // Track submission
      analytics.track('feedback_submitted', {
        rating: feedback.rating,
        hasMessage: !!feedback.message,
      });
    },
    onError: (error) => {
      // Track errors
      analytics.track('feedback_error', { error: error.message });
    },
  }}
/>
```

## Firestore Security Rules 🔒

Add these rules to your `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to create feedback
    match /user_feedback/{document} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

## Spam Protection 🛡️

Built-in spam protection:

- Session-based rate limiting (30 minutes by default)
- Duplicate submission prevention
- Client-side validation

## Package Structure 📁

```
FeedbackModule/
├── components/
│   ├── FeedbackWidget/
│   │   ├── index.tsx           # Floating widget component
│   │   └── FeedbackWidget.scss # Widget styles
│   ├── FeedbackModal/
│   │   ├── index.tsx           # Rating modal component
│   │   └── FeedbackModal.scss  # Modal styles
│   └── FeedbackModule.tsx      # Main module component
├── hooks/
│   └── useFeedback.ts          # React hook for state management
├── services/
│   └── feedbackService.ts      # Firebase service layer
├── types/
│   └── feedback.types.ts       # TypeScript interfaces
├── utils/
│   └── constants.ts            # Constants and utilities
├── index.ts                    # Main exports
├── README.md                   # This file
└── package.json                # Optional npm package config
```

## Converting to NPM Package 📦

To publish as an npm package:

1. Add `package.json` to the module root:

```json
{
  "name": "@yourorg/feedback-module",
  "version": "1.0.0",
  "description": "React feedback widget with Firebase",
  "main": "index.js",
  "types": "index.d.ts",
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0",
    "firebase": ">=9.0.0"
  }
}
```

2. Build and publish:

```bash
npm run build
npm publish
```

## Browser Support 🌐

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+
- Mobile browsers

## License 📄

MIT License - feel free to use in any project!

## Contributing 🤝

This module is designed to be self-contained and portable. To contribute:

1. Fork the module
2. Make your changes
3. Test across different projects
4. Submit a pull request

---

**Made with ❤️ for better user feedback collection**
