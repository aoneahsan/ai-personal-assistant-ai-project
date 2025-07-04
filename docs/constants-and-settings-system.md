# Constants and Admin Settings System

## Overview

This document describes the comprehensive constants and admin settings system implemented in the AI Personal Assistant application. The system eliminates magic numbers and hardcoded values throughout the codebase, providing a centralized, type-safe, and admin-configurable approach to application settings.

## 📁 File Structure

```
src/
├── utils/constants/generic/
│   ├── numbers.ts           # All numeric constants
│   ├── messages.ts          # String constants (previously created)
│   ├── api.ts              # API-related constants
│   ├── ui.ts               # UI-related constants
│   ├── fileTypes.ts        # File type constants
│   └── index.ts            # Exports all constants
├── services/
│   └── adminSettingsService.ts  # Admin settings management
└── docs/
    └── constants-and-settings-system.md  # This file
```

## 🔢 Numbers Constants (`src/utils/constants/generic/numbers.ts`)

### 1. **Time Constants**

Centralized timing values for consistency across the application:

```typescript
TIME_CONSTANTS = {
  TIMEOUTS: {
    VERY_SHORT: 300, // 300ms
    SHORT: 500, // 500ms
    MEDIUM: 1000, // 1 second
    LONG: 2000, // 2 seconds
    VERY_LONG: 3000, // 3 seconds
    EXTRA_LONG: 5000, // 5 seconds
  },

  AUTH: {
    STATE_CHANGE_TIMEOUT: 3000,
    REDIRECT_DELAY: 500,
    LOGIN_SUCCESS_DELAY: 500,
  },

  TOAST: {
    SHORT: 3000, // 3 seconds
    MEDIUM: 5000, // 5 seconds
    LONG: 8000, // 8 seconds
  },

  SESSION: {
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000,
  },

  CACHE: {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 30 * 60 * 1000, // 30 minutes
    LONG: 60 * 60 * 1000, // 1 hour
    VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
  },
};
```

### 2. **Dimension Constants**

Consistent sizing values for UI elements:

```typescript
DIMENSION_CONSTANTS = {
  WIDGET: {
    DEFAULT_WIDTH: 350,
    DEFAULT_HEIGHT: 500,
    MIN_WIDTH: 300,
    MIN_HEIGHT: 400,
    MAX_WIDTH: 800,
    MAX_HEIGHT: 1000,
  },

  MODAL: {
    SMALL_WIDTH: 400,
    MEDIUM_WIDTH: 500,
    LARGE_WIDTH: 800,
    EXTRA_LARGE_WIDTH: 1200,
  },

  SPACING: {
    SMALL: 8,
    MEDIUM: 12,
    LARGE: 16,
    EXTRA_LARGE: 20,
  },

  BORDER_RADIUS: {
    SMALL: 4,
    MEDIUM: 8,
    LARGE: 12,
    EXTRA_LARGE: 16,
  },
};
```

### 3. **Validation Constants**

Centralized validation rules:

```typescript
VALIDATION_CONSTANTS = {
  TEXT_LIMITS: {
    ROOM_NAME_LENGTH: 8,
    USER_NAME_MAX: 20,
    USER_NAME_MIN: 2,
    PASSWORD_MIN: 6,
    MESSAGE_MAX: 1000,
    EMAIL_MAX: 254,
  },

  NUMERIC_LIMITS: {
    RETRY_ATTEMPTS: 3,
    MAX_UPLOAD_RETRIES: 5,
    MAX_LOGIN_ATTEMPTS: 5,
    MAX_ITEMS_PER_PAGE: 100,
    DEFAULT_PAGE_SIZE: 20,
  },

  PERCENTAGE: {
    IMAGE_QUALITY_DEFAULT: 90,
    IMAGE_QUALITY_THUMBNAIL: 70,
    IMAGE_QUALITY_PREVIEW: 80,
    IMAGE_QUALITY_HIGH: 95,
  },
};
```

### 4. **Business Constants**

Business logic and feature limits:

```typescript
BUSINESS_CONSTANTS = {
  SUBSCRIPTION: {
    FREE_MESSAGE_LIMIT: 100,
    PRO_MESSAGE_LIMIT: 10000,
    PREMIUM_MESSAGE_LIMIT: -1, // Unlimited
    FREE_STORAGE_MB: 100,
    PRO_STORAGE_MB: 10000,
    PREMIUM_STORAGE_MB: 100000,
  },

  FEATURES: {
    MAX_EMBEDS_FREE: 1,
    MAX_EMBEDS_PRO: 10,
    MAX_EMBEDS_PREMIUM: 100,
    MAX_PARTICIPANTS_ROOM: 50,
    MAX_CHAT_HISTORY_DAYS: 365,
  },
};
```

### 5. **Helper Functions**

Utility functions for common calculations:

```typescript
// File size formatting
calculateFileSize(bytes: number): string

// Time ago formatting
calculateTimeAgo(timestamp: number): string

// Validation helpers
isValidPercentage(value: number): boolean
clampValue(value: number, min: number, max: number): number
```

## ⚙️ Admin Settings System (`src/services/adminSettingsService.ts`)

### **Features**

1. **Real-time Configuration**: Settings stored in Firestore with real-time updates
2. **Type Safety**: Full TypeScript interfaces for all settings
3. **Default Values**: Comprehensive defaults based on constants
4. **Validation**: Built-in validation for all settings
5. **Audit Trail**: Track who changed what and when
6. **Granular Control**: Fine-grained control over every aspect of the application

### **Settings Categories**

#### 1. **System Settings**

- Maintenance mode control
- Debug mode toggles
- Environment configuration
- Version management

#### 2. **Feature Flags**

- Enable/disable features dynamically
- A/B testing support
- Gradual rollout capabilities

#### 3. **Timing Configuration**

- Timeout values
- Polling intervals
- Cache durations
- Animation timings

#### 4. **UI Configuration**

- Widget dimensions
- Modal sizes
- Spacing values
- Theme settings

#### 5. **Validation Rules**

- Text length limits
- Numeric constraints
- File upload limits
- Quality settings

#### 6. **Business Rules**

- Subscription limits
- Feature quotas
- Pricing configuration
- Discount percentages

#### 7. **Network Configuration**

- Request timeouts
- Retry policies
- Rate limiting
- CDN settings

#### 8. **Performance Settings**

- Virtual scrolling
- Lazy loading
- Chunking parameters
- Caching strategies

#### 9. **Security Configuration**

- Password complexity
- Session management
- File upload security
- Encryption settings

#### 10. **Integration Settings**

- Third-party API keys
- Service configurations
- Authentication providers
- Payment processors

#### 11. **Localization**

- Language settings
- Date/time formats
- Currency configuration
- Translation services

#### 12. **Monitoring & Analytics**

- Error tracking
- Performance monitoring
- Usage analytics
- Health checks

### **Usage Examples**

#### Basic Usage

```typescript
import { adminSettingsService } from '../services/adminSettingsService';

// Get feature flag
const isFeatureEnabled = adminSettingsService.getFeatureFlag('aiAssistant');

// Get timing setting
const toastDuration = adminSettingsService.getTimingSetting('toastDuration');

// Get validation limit
const maxMessageLength =
  adminSettingsService.getValidationSetting('messageMax');

// Check maintenance mode
const isMaintenanceMode = adminSettingsService.isMaintenanceMode();
```

#### Reactive Updates

```typescript
// Subscribe to settings changes
const unsubscribe = adminSettingsService.subscribe((settings) => {
  console.log('Settings updated:', settings);
  // Update UI accordingly
});

// Cleanup
unsubscribe();
```

#### Admin Panel Integration

```typescript
// Save updated settings
await adminSettingsService.saveSettings(updatedSettings, 'admin-user-id');

// Partial updates
await adminSettingsService.updatePartialSettings(
  {
    features: { aiAssistant: false },
    timing: { toastDuration: 4000 },
  },
  'admin-user-id'
);
```

## 🚀 Migration Guide

### **Step 1: Replace Hardcoded Values**

**Before:**

```typescript
// ❌ Magic numbers everywhere
setTimeout(() => {
  showToast('Success', 5000);
}, 2000);

const modalWidth = 500;
const maxFileSize = 10 * 1024 * 1024; // 10MB
```

**After:**

```typescript
// ✅ Using constants
import {
  TIME_CONSTANTS,
  DIMENSION_CONSTANTS,
} from '../utils/constants/generic/numbers';

setTimeout(() => {
  showToast('Success', TIME_CONSTANTS.TOAST.MEDIUM);
}, TIME_CONSTANTS.TIMEOUTS.LONG);

const modalWidth = DIMENSION_CONSTANTS.MODAL.MEDIUM_WIDTH;
const maxFileSize = FILE_SIZE_LIMITS.IMAGE_MESSAGE;
```

### **Step 2: Use Admin Settings**

**Before:**

```typescript
// ❌ Hardcoded business rules
const FREE_MESSAGE_LIMIT = 100;
const PRO_MESSAGE_LIMIT = 10000;
```

**After:**

```typescript
// ✅ Admin-configurable
const freeMessageLimit =
  adminSettingsService.getBusinessSetting('freeMessageLimit');
const proMessageLimit =
  adminSettingsService.getBusinessSetting('proMessageLimit');
```

### **Step 3: Implement Feature Flags**

**Before:**

```typescript
// ❌ Code-based feature toggling
const ENABLE_AI_ASSISTANT = true;
```

**After:**

```typescript
// ✅ Admin-controlled feature flags
const isAiAssistantEnabled = adminSettingsService.getFeatureFlag('aiAssistant');
```

## 📊 Benefits

### **1. Maintainability**

- Single source of truth for all values
- Easy to find and update constants
- Consistent naming conventions
- Clear categorization

### **2. Type Safety**

- Full TypeScript support
- Compile-time validation
- IDE autocompletion
- Safer refactoring

### **3. Admin Control**

- Real-time configuration changes
- No code deployments needed
- A/B testing capabilities
- Emergency toggles

### **4. Performance**

- Optimized calculations
- Efficient caching
- Lazy loading support
- Resource management

### **5. Developer Experience**

- Clear documentation
- Consistent patterns
- Helper functions
- Migration guides

## 🔧 Configuration Management

### **Firestore Structure**

```
/settings/
  └── admin/
      ├── system: { ... }
      ├── features: { ... }
      ├── timing: { ... }
      ├── ui: { ... }
      ├── validation: { ... }
      ├── business: { ... }
      ├── network: { ... }
      ├── performance: { ... }
      ├── security: { ... }
      ├── integrations: { ... }
      ├── localization: { ... }
      └── monitoring: { ... }
```

### **Environment-Specific Settings**

```typescript
// Development
const settings = {
  system: { debugMode: true, loggingLevel: 'debug' },
  features: { aiAssistant: true },
  timing: { toastDuration: 2000 },
};

// Production
const settings = {
  system: { debugMode: false, loggingLevel: 'error' },
  features: { aiAssistant: true },
  timing: { toastDuration: 5000 },
};
```

## 🔐 Security Considerations

### **Access Control**

- Admin-only settings modification
- Role-based permissions
- Audit logging
- Change approval workflows

### **Validation**

- Input sanitization
- Range validation
- Type checking
- Business rule validation

### **Encryption**

- Sensitive data encryption
- Secure key management
- Access token rotation
- API key protection

## 📈 Monitoring

### **Change Tracking**

- All changes logged with timestamp
- User identification
- Before/after values
- Change reason tracking

### **Performance Impact**

- Settings cache monitoring
- Update frequency tracking
- Performance metrics
- Resource usage monitoring

### **Health Checks**

- Settings integrity validation
- Default value fallbacks
- Error rate monitoring
- Recovery procedures

## 🚨 Best Practices

### **1. Constants Organization**

- Group related constants together
- Use descriptive names
- Follow naming conventions
- Document purpose and usage

### **2. Settings Management**

- Use feature flags for new features
- Implement gradual rollouts
- Monitor setting changes
- Maintain backward compatibility

### **3. Performance Optimization**

- Cache frequently accessed values
- Batch setting updates
- Use efficient data structures
- Monitor memory usage

### **4. Error Handling**

- Graceful degradation
- Default value fallbacks
- Error logging
- Recovery mechanisms

## 🔄 Future Enhancements

### **Planned Features**

1. **Settings Versioning**: Track and rollback setting changes
2. **Bulk Operations**: Mass update capabilities
3. **Import/Export**: Configuration backup and restore
4. **Templates**: Predefined setting configurations
5. **Validation Rules**: Custom validation logic
6. **Conditional Settings**: Setting dependencies and rules
7. **API Management**: REST API for settings management
8. **Dashboard**: Visual settings management interface

### **Integration Opportunities**

- CI/CD pipeline integration
- Monitoring system alerts
- Performance analytics
- User behavior tracking
- A/B testing platforms

## 📚 Resources

### **Documentation**

- [Constants Reference](./constants-reference.md)
- [Settings API Documentation](./settings-api.md)
- [Migration Guide](./migration-guide.md)
- [Best Practices](./best-practices.md)

### **Examples**

- [Common Use Cases](./examples/common-use-cases.md)
- [Advanced Configurations](./examples/advanced-configurations.md)
- [Integration Examples](./examples/integrations.md)

### **Tools**

- Settings validation scripts
- Migration utilities
- Performance monitoring tools
- Configuration templates

---

_This documentation is part of the comprehensive constants and settings system implementation. For questions or contributions, please refer to the project's contribution guidelines._
