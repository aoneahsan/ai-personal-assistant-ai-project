# Auth Guard System Documentation

## 🛡️ **Complete Authentication Guard System**

This system ensures that:

- ✅ **Authenticated users** cannot access the login/auth page
- ✅ **Unauthenticated users** cannot access protected routes
- ✅ **Automatic redirects** happen seamlessly
- ✅ **Loading states** provide smooth user experience

---

## 🔧 **Components Overview**

### **1. ProtectedRoute Component**

- **Purpose**: Wraps protected routes to ensure only authenticated users can access them
- **Behavior**:
  - Redirects unauthenticated users to `/auth`
  - Shows loading state during auth check
  - Allows authenticated users to proceed

```tsx
// Usage in routes
<ProtectedRoute>
  <ChatList />
</ProtectedRoute>
```

### **2. PublicRoute Component**

- **Purpose**: Wraps public routes (like auth) to prevent authenticated users from accessing them
- **Behavior**:
  - Redirects authenticated users to `/chats`
  - Shows loading state during auth check
  - Allows unauthenticated users to proceed

```tsx
// Usage in routes
<PublicRoute>
  <AuthPage />
</PublicRoute>
```

### **3. AuthContainer Component**

- **Purpose**: Handles the authentication UI and form switching
- **Behavior**:
  - Shows login, signup, or forgot password forms
  - Handles successful authentication redirects
  - Initializes authentication services

---

## 🔄 **Authentication Flow**

### **Unauthenticated User Journey:**

1. User tries to access any route (e.g., `/`, `/chats`, `/chat`)
2. `ProtectedRoute` detects no authentication
3. User is redirected to `/auth`
4. User completes login/signup
5. User is redirected to `/chats`

### **Authenticated User Journey:**

1. User tries to access `/auth` (e.g., bookmarked login page)
2. `PublicRoute` detects authentication
3. User is redirected to `/chats`
4. User can freely navigate between protected routes

### **Root Route Behavior:**

- `/` → Always redirects to `/chats` (requires authentication)
- Unauthenticated users: `/` → `/chats` → `/auth`
- Authenticated users: `/` → `/chats` ✅

---

## 🛠️ **Route Configuration**

```tsx
// Protected routes (require authentication)
const chatListRoute = createRoute({
  path: '/chats',
  component: () => (
    <ProtectedRoute>
      <ChatList />
    </ProtectedRoute>
  ),
});

// Public routes (redirect authenticated users)
const authRoute = createRoute({
  path: '/auth',
  component: () => (
    <PublicRoute>
      <AuthPage />
    </PublicRoute>
  ),
});
```

---

## 🪝 **Custom Hooks (Optional)**

### **useAuthGuard Hook**

```tsx
// For advanced auth guard logic in components
const { isAuthenticated } = useAuthGuard({
  requireAuth: true,
  redirectTo: '/auth',
  onAuthStateChange: (isAuth) => console.log('Auth changed:', isAuth),
});
```

### **Convenience Hooks**

```tsx
// Require authentication
const { isAuthenticated } = useRequireAuth('/auth');

// Require guest (no auth)
const { isAuthenticated } = useRequireGuest('/chats');
```

---

## 🔍 **Debug & Monitoring**

### **Console Logs**

The system provides detailed console logs for debugging:

- `"User is authenticated, redirecting from public route to: /chats"`
- `"User is not authenticated, redirecting to auth page"`
- `"Authentication successful, redirecting to: /chats"`

### **Loading States**

- Each guard component shows appropriate loading messages
- Prevents flashing of unauthorized content
- Smooth transitions between states

---

## 🚀 **Active Routes**

### **✅ Protected Routes (Require Auth):**

- `/` - Root (redirects to ChatList)
- `/chats` - Chat list page
- `/chat` - Single chat page

### **✅ Public Routes (Redirect if Authenticated):**

- `/auth` - Authentication page

### **📝 Commented Routes (Available for Uncommenting):**

- `/dashboard` - Main dashboard
- `/edit-profile` - Profile editing

---

## 🔐 **Security Benefits**

1. **Prevents Unauthorized Access**: No protected content accessible without authentication
2. **Eliminates Auth Loops**: Authenticated users can't get stuck on login page
3. **Consistent UX**: Predictable behavior across all routes
4. **Loading States**: No flashing of unauthorized content
5. **Centralized Logic**: All auth guard logic in dedicated components

---

## 🧪 **Testing Scenarios**

### **Test Case 1: Unauthenticated User**

- ✅ Visit `/` → Should redirect to `/auth`
- ✅ Visit `/chats` → Should redirect to `/auth`
- ✅ Visit `/auth` → Should show login form
- ✅ Complete login → Should redirect to `/chats`

### **Test Case 2: Authenticated User**

- ✅ Visit `/` → Should redirect to `/chats`
- ✅ Visit `/chats` → Should show chat list
- ✅ Visit `/auth` → Should redirect to `/chats`
- ✅ Logout → Should redirect to `/auth`

### **Test Case 3: Direct URL Access**

- ✅ Bookmark `/chat` and visit while logged out → Redirect to `/auth`
- ✅ Bookmark `/auth` and visit while logged in → Redirect to `/chats`

---

## 🔧 **Customization**

### **Change Default Redirects**

```tsx
// Change where authenticated users go
<PublicRoute redirectTo="/dashboard">
  <AuthPage />
</PublicRoute>

// Change where unauthenticated users go
<ProtectedRoute redirectTo="/login">
  <ChatList />
</ProtectedRoute>
```

### **Add New Protected Routes**

```tsx
const newProtectedRoute = createRoute({
  path: '/new-page',
  component: () => (
    <ProtectedRoute>
      <NewPage />
    </ProtectedRoute>
  ),
});
```

This system provides bulletproof authentication guards ensuring users always land on the appropriate page based on their authentication status! 🛡️✨
