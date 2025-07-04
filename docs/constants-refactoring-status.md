# Constants Refactoring Status

## Overview

This document tracks the progress of replacing hardcoded strings throughout the application with proper constants and enums for better maintainability and consistency.

## Constants Files Created

### 1. Messages Constants (`src/utils/constants/generic/messages.ts`)

- **TOAST_MESSAGES**: Success, error, warning, and info messages for user-facing toasts
- **CONSOLE_MESSAGES**: Debug and error messages for console logging
- **VALIDATION_MESSAGES**: Form validation error messages
- **STATUS_MESSAGES**: Loading, saving, processing status messages
- **DEFAULT_VALUES**: Placeholder text and default values
- **CONFIRM_MESSAGES**: Confirmation dialog messages

### 2. API Constants (`src/utils/constants/generic/api.ts`)

- **API_ENDPOINTS**: All API endpoint URLs organized by feature
- **HTTP_METHODS**: Standard HTTP method constants
- **HTTP_STATUS**: HTTP status code constants
- **REQUEST_TIMEOUTS**: Timeout configurations for different request types
- **CONTENT_TYPES**: MIME type constants
- **FIREBASE_COLLECTIONS**: Firebase collection names
- **FIREBASE_FIELDS**: Firebase document field names
- **API_ERROR_CODES**: Standardized error codes
- **CACHE_KEYS**: Cache storage keys
- **CACHE_EXPIRATION**: Cache expiration times

### 3. UI Constants (`src/utils/constants/generic/ui.ts`)

- **UI_ICONS**: PrimeReact icon class names organized by category
- **CSS_CLASSES**: Common CSS class names for consistent styling
- **COMPONENT_SIZES**: Standardized size options (xs, sm, md, lg, xl)
- **BUTTON_VARIANTS**: Button style variants
- **INPUT_TYPES**: HTML input type constants
- **TOAST_POSITIONS**: Toast notification positions
- **MODAL_SIZES**: Modal dialog size options
- **ANIMATION_DURATIONS**: Standard animation timing
- **BREAKPOINTS**: Responsive design breakpoints
- **Z_INDEX**: Z-index values for layering components
- **MESSAGE_STATUS**: Chat message status indicators
- **UPLOAD_STATES**: File upload progress states

### 4. File Types Constants (`src/utils/constants/generic/fileTypes.ts`)

- **FILE_TYPES**: MIME types organized by category (image, video, audio, document, etc.)
- **FILE_EXTENSIONS**: Mapping from MIME types to file extensions
- **FILE_SIZE_LIMITS**: Maximum file sizes for different use cases
- **ALLOWED_FILE_TYPES**: Allowed file types for specific features
- **FILE_QUALITY**: Image quality settings for different use cases
- **FILE_PROCESSING_STATES**: File processing status constants
- Helper functions for file type validation and categorization

## Files Updated with Constants

### Authentication Components

- ✅ `src/components/Auth/LoginForm.tsx`

  - Replaced hardcoded toast messages with `TOAST_MESSAGES.SUCCESS.*` and `TOAST_MESSAGES.ERROR.*`
  - Replaced validation messages with `VALIDATION_MESSAGES.FORMAT.*`

- ✅ `src/components/Auth/SignUpForm.tsx`

  - Replaced hardcoded toast messages with `TOAST_MESSAGES.SUCCESS.*` and `TOAST_MESSAGES.ERROR.*`
  - Replaced validation messages with `VALIDATION_MESSAGES.FORMAT.*` and `VALIDATION_MESSAGES.REQUIRED.*`

- ✅ `src/components/Auth/ForgotPasswordForm.tsx`
  - Replaced hardcoded toast messages with `TOAST_MESSAGES.SUCCESS.*` and `TOAST_MESSAGES.ERROR.*`
  - Replaced validation messages with `VALIDATION_MESSAGES.FORMAT.*`

### Anonymous Room Components

- ✅ `src/pages/AnonymousRoom/index.tsx`

  - Replaced hardcoded error messages with `TOAST_MESSAGES.ERROR.*`
  - Updated route navigation to use `ROUTES` constants

- ✅ `src/pages/AnonymousRoom/AnonymousRoomChat.tsx`
  - Replaced hardcoded toast messages with `TOAST_MESSAGES.SUCCESS.*` and `TOAST_MESSAGES.ERROR.*`
  - Replaced console messages with `CONSOLE_MESSAGES.DEBUG.*` and `CONSOLE_MESSAGES.ERROR.*`

### Utility Files

- ✅ `src/utils/helpers/localStorage/index.ts`
  - Replaced hardcoded console error messages with `CONSOLE_MESSAGES.ERROR.*`
  - Updated function names to be more consistent

## Existing Constants Updated

### Generic Constants Index

- ✅ `src/utils/constants/generic/index.ts`
  - Added exports for all new constants files
  - Centralized import location for all generic constants

## Benefits of Constants Refactoring

### 1. Maintainability

- **Single Source of Truth**: All user-facing messages are now in one place
- **Easy Updates**: Change a message once to update it throughout the app
- **Consistency**: Ensures consistent wording across the application

### 2. Internationalization Ready

- **Translation Support**: Constants can be easily replaced with translation functions
- **Locale Management**: Structured format makes it easy to add multiple languages

### 3. Type Safety

- **TypeScript Support**: Constants are properly typed with `as const` assertions
- **IntelliSense**: IDE autocomplete for all available constants
- **Compile-time Checking**: Prevents typos in string literals

### 4. Developer Experience

- **Searchability**: Easy to find all usages of specific messages
- **Refactoring Safety**: Renaming constants updates all references
- **Code Reviews**: Changes to user-facing text are more visible

## Usage Patterns

### Importing Constants

```typescript
// Import specific constant groups
import { TOAST_MESSAGES, VALIDATION_MESSAGES } from '@/utils/constants/generic';

// Or import everything
import * as Constants from '@/utils/constants/generic';
```

### Using Toast Messages

```typescript
// Before
toast.success('Welcome back! You have signed in successfully.');
toast.error('Failed to sign in');

// After
toast.success(TOAST_MESSAGES.SUCCESS.WELCOME_BACK);
toast.error(TOAST_MESSAGES.ERROR.SIGNIN_FAILED);
```

### Using Validation Messages

```typescript
// Before
z.string().email('Please enter a valid email address');

// After
z.string().email(VALIDATION_MESSAGES.FORMAT.EMAIL);
```

### Using Console Messages

```typescript
// Before
console.error('Error saving user profile data:', error);

// After
console.error(CONSOLE_MESSAGES.ERROR.SAVING_USER_PROFILE, error);
```

## Remaining Work

### High Priority Files to Update

- [ ] `src/components/Chat/Chat.tsx` - Chat component messages
- [ ] `src/components/Chat/ChatHeader.tsx` - Chat header actions
- [ ] `src/components/Chat/MediaMessageManager.tsx` - Media upload messages
- [ ] `src/components/Chat/MessageInput.tsx` - Input validation messages
- [ ] `src/components/EmbeddableWidget/EmbedManager.tsx` - Embed management messages
- [ ] `src/pages/Dashboard/index.tsx` - Dashboard error messages
- [ ] `src/modules/FeedbackModule/` - Feedback module messages

### Medium Priority

- [ ] Console messages in service files
- [ ] Error messages in hooks
- [ ] Status messages in components
- [ ] API endpoint strings in services

### Low Priority

- [ ] Test helper messages
- [ ] Development utility messages
- [ ] Debug logging strings

## Best Practices

### 1. Naming Conventions

- Use SCREAMING_SNAKE_CASE for constant names
- Group related constants under logical namespaces
- Use descriptive names that indicate the context

### 2. Organization

- Separate constants by type (messages, API, UI, etc.)
- Group related constants together
- Export types for TypeScript support

### 3. Usage Guidelines

- Always use constants instead of hardcoded strings for user-facing text
- Use constants for repeated system messages
- Prefer constants for API endpoints and configuration values

## Migration Checklist

When updating a file to use constants:

1. ✅ Add import for required constant groups
2. ✅ Replace hardcoded strings with appropriate constants
3. ✅ Update any related TypeScript types if needed
4. ✅ Test that messages display correctly
5. ✅ Update any tests that check for specific strings
6. ✅ Document any new constants that might be needed

## Notes

- All constants use `as const` assertions for proper TypeScript inference
- Helper types are exported for each constant group
- Constants are designed to be tree-shakeable for optimal bundle size
- File validation functions are included in fileTypes constants
