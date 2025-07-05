# Firestore Indexes Update

## Overview

Updated Firestore indexes to support new system configuration queries and subscription request management.

## New Indexes Added

### 1. System Configuration Collections

#### system_roles

- **Composite Index**: `isActive` (ASC) + `level` (ASC)
  - **Purpose**: Supports query `where('isActive', '==', true).orderBy('level')`
  - **Used in**: `SystemConfigurationService.loadRoles()`

#### system_subscription_plans

- **Composite Index**: `isActive` (ASC) + `order` (ASC)
  - **Purpose**: Supports query `where('isActive', '==', true).orderBy('order')`
  - **Used in**: `SystemConfigurationService.loadSubscriptionPlans()`

### 2. Subscription Requests Collection

#### pca_subscription_requests

- **Composite Index**: `userId` (ASC) + `status` (ASC) + `requestedAt` (DESC)

  - **Purpose**: Supports query `where('userId', '==', userId).where('status', '==', status).orderBy('requestedAt', 'desc')`
  - **Used in**: `SubscriptionService.getUserPendingRequest()`

- **Composite Index**: `userId` (ASC) + `requestedAt` (DESC)

  - **Purpose**: Supports query `where('userId', '==', userId).orderBy('requestedAt', 'desc')`
  - **Used in**: `SubscriptionService.getUserRequestHistory()`

- **Composite Index**: `status` (ASC) + `requestedAt` (DESC)
  - **Purpose**: Supports query `where('status', '==', status).orderBy('requestedAt', 'desc')`
  - **Used in**: `SubscriptionService.getAllSubscriptionRequests()`

### 3. Field Override Indexes

#### system_roles

- **Single Field Index**: `isActive` (ASC)
  - **Purpose**: Supports basic filtering by active status

#### system_permissions

- **Single Field Index**: `isActive` (ASC)
  - **Purpose**: Supports query `where('isActive', '==', true)`
  - **Used in**: `SystemConfigurationService.loadPermissions()`

#### system_subscription_plans

- **Single Field Index**: `isActive` (ASC)
  - **Purpose**: Supports basic filtering by active status

#### pca_subscription_requests

- **Single Field Index**: `userId` (ASC)
  - **Purpose**: Supports user-specific queries
- **Single Field Index**: `status` (ASC)
  - **Purpose**: Supports status-based filtering
- **Single Field Index**: `requestedAt` (DESC)
  - **Purpose**: Supports timestamp ordering

## Query Performance Benefits

1. **System Configuration Loading**: Faster loading of roles and subscription plans with proper sorting
2. **Subscription Management**: Efficient queries for user subscription requests and admin management
3. **Admin Panel**: Optimized queries for admin dashboard statistics and management
4. **Real-time Updates**: Better performance for live subscription to configuration changes

## Deployment Status

- ✅ **Indexes Deployed**: Successfully deployed to Firestore
- ✅ **Rules Updated**: Security rules configured for new collections
- ✅ **Build Verified**: Project builds successfully with new indexes
- ✅ **Collections Ready**: All system configuration collections properly indexed

## Collections Covered

### System Configuration Collections

- `system_roles`
- `system_permissions`
- `system_subscription_plans`
- `system_feature_flags` (simple queries, no complex indexes needed)
- `system_settings` (simple queries, no complex indexes needed)

### Subscription Management Collections

- `pca_subscription_requests`

## Query Examples

### System Roles Query

```javascript
query(
  collection(db, 'system_roles'),
  where('isActive', '==', true),
  orderBy('level')
);
```

### Subscription Plans Query

```javascript
query(
  collection(db, 'system_subscription_plans'),
  where('isActive', '==', true),
  orderBy('order')
);
```

### User Subscription Requests Query

```javascript
query(
  collection(db, 'pca_subscription_requests'),
  where('userId', '==', userId),
  where('status', '==', 'PENDING'),
  orderBy('requestedAt', 'desc')
);
```

### Admin Subscription Requests Query

```javascript
query(
  collection(db, 'pca_subscription_requests'),
  where('status', '==', status),
  orderBy('requestedAt', 'desc')
);
```

## Performance Impact

- **Query Speed**: Significantly faster queries for system configuration loading
- **Subscription Management**: Efficient filtering and sorting for subscription requests
- **Admin Operations**: Optimized queries for admin dashboard and management functions
- **Real-time Updates**: Better performance for live data subscriptions

## Maintenance

- Indexes will be automatically maintained by Firestore
- No manual intervention required for index updates
- Monitor query performance in Firebase Console
- Consider adding additional indexes if new query patterns emerge

## Related Files

- `firestore.indexes.json` - Updated index configuration
- `firestore.rules` - Security rules for new collections
- `src/services/systemConfigurationService.ts` - Main service using these indexes
- `src/services/subscriptionService.ts` - Subscription management service
- `src/zustandStates/systemConfigState/` - State management for system config

## Next Steps

1. Monitor query performance in Firebase Console
2. Add additional indexes if new query patterns are identified
3. Consider compound indexes for complex admin queries if needed
4. Regular review of index usage and optimization
