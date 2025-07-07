# System Architecture

## Overview

The AI Personal Assistant follows a **serverless, event-driven architecture** leveraging Firebase's Backend-as-a-Service (BaaS) platform. The system is designed for scalability, real-time performance, and maintainability.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
├─────────────────┬───────────────────┬──────────────────────┤
│   Web App      │   iOS App         │    Android App       │
│  (React PWA)   │  (Capacitor)      │   (Capacitor)        │
└────────┬────────┴─────────┬─────────┴──────────┬───────────┘
         │                  │                     │
         └──────────────────┴─────────────────────┘
                            │
                 ┌──────────┴──────────┐
                 │   Frontend Layer    │
                 │  - React + TypeScript│
                 │  - TanStack Router   │
                 │  - Zustand Store     │
                 │  - PrimeReact UI     │
                 └──────────┬──────────┘
                            │
         ┌──────────────────┴─────────────────────┐
         │           Service Layer                │
         ├────────────────┬───────────────────────┤
         │  Firebase SDK  │   Third-Party APIs   │
         │  - Auth        │   - Socket.io        │
         │  - Firestore   │   - SimplePeer       │
         │  - Storage     │   - OneSignal        │
         │  - Analytics   │   - Sentry           │
         └────────┬───────┴──────────┬────────────┘
                  │                  │
         ┌────────┴──────────────────┴────────────┐
         │         Backend Services               │
         ├────────────────────────────────────────┤
         │  Firebase Platform                     │
         │  - Authentication Service              │
         │  - Cloud Firestore Database           │
         │  - Cloud Storage                      │
         │  - Hosting & CDN                      │
         │  - Security Rules Engine              │
         └────────────────────────────────────────┘
```

## Component Architecture

### 1. Frontend Architecture

```
src/
├── components/          # UI Components
│   ├── Admin/          # Admin panel components
│   ├── Auth/           # Authentication components
│   ├── Chat/           # Chat interface components
│   ├── Common/         # Shared components
│   └── EmbeddableWidget/ # Widget components
├── config/             # Configuration files
├── contexts/           # React contexts
├── helpers/            # Utility functions
├── hooks/              # Custom React hooks
├── routes/             # Route definitions
├── screens/            # Page components
├── services/           # Business logic & API
├── store/              # Zustand state management
└── types/              # TypeScript definitions
```

### 2. Service Layer Pattern

```typescript
// Example Service Structure
class ChatService {
  // Firebase SDK integration
  private db = getFirestore();
  
  // Real-time listeners
  subscribeToMessages(conversationId: string) {}
  
  // CRUD operations
  sendMessage(message: Message) {}
  updateMessage(messageId: string, updates: Partial<Message>) {}
  deleteMessage(messageId: string) {}
  
  // Business logic
  processAudioTranscription(audioUrl: string) {}
  validateMessageContent(content: string) {}
}
```

### 3. State Management Architecture

```
┌─────────────────────────────────────┐
│         Zustand Store               │
├─────────────────────────────────────┤
│  - Auth Store (user, session)      │
│  - Chat Store (messages, typing)   │
│  - UI Store (theme, modals)        │
│  - Subscription Store (plans)      │
└─────────────────────────────────────┘
           │
           ├── Persistent State (localStorage)
           └── Ephemeral State (memory only)
```

## Data Architecture

### 1. Database Schema (Firestore)

```
Firestore Collections
├── pca_users/
│   └── {userId}/
│       ├── profile data
│       ├── preferences
│       └── subscription info
├── pca_conversations/
│   └── {conversationId}/
│       ├── participants[]
│       ├── lastMessage
│       └── metadata
├── pca_messages/
│   └── {messageId}/
│       ├── conversationId
│       ├── content
│       ├── sender
│       └── timestamps
├── pca_voice_calls/
│   └── {callId}/
│       ├── participants[]
│       ├── status
│       └── duration
└── System Collections/
    ├── roles/
    ├── permissions/
    └── settings/
```

### 2. Real-time Data Flow

```
User Action → Frontend Component → Service Layer → Firebase SDK
     ↑                                                    ↓
     └──────── Real-time Listener ← Firestore Update ←──┘
```

### 3. File Storage Structure

```
Firebase Storage
├── audio/
│   └── {userId}/{timestamp}-{filename}
├── images/
│   └── {userId}/{timestamp}-{filename}
├── videos/
│   └── {userId}/{timestamp}-{filename}
└── profiles/
    └── {userId}/avatar.jpg
```

## Security Architecture

### 1. Authentication Flow

```
User Login Request
      ↓
Firebase Auth Service
      ↓
JWT Token Generation
      ↓
Client Token Storage
      ↓
Authenticated Requests → Firebase Security Rules → Data Access
```

### 2. Security Rules Pattern

```javascript
// Firestore Security Rules Example
match /pca_messages/{messageId} {
  allow read: if request.auth != null 
    && request.auth.uid in resource.data.participants;
  allow create: if request.auth != null
    && request.auth.uid == request.resource.data.sender;
  allow update: if request.auth != null
    && request.auth.uid == resource.data.sender
    && request.resource.data.sender == resource.data.sender;
}
```

### 3. Data Protection Layers

1. **Client-side Validation** - Zod schemas
2. **Firebase Security Rules** - Server-side enforcement
3. **Input Sanitization** - XSS prevention
4. **Rate Limiting** - API abuse prevention
5. **Encryption** - Sensitive data protection

## Performance Architecture

### 1. Optimization Strategies

- **Code Splitting**: Route-based lazy loading
- **Memoization**: React.memo and useMemo
- **Virtual Scrolling**: Large list optimization
- **Image Optimization**: Lazy loading and compression
- **Caching**: TanStack Query cache management

### 2. Real-time Performance

```
WebSocket Connection (Socket.io)
├── Connection pooling
├── Automatic reconnection
├── Event batching
└── Binary data support

WebRTC (SimplePeer)
├── Direct peer connections
├── STUN/TURN servers
├── Adaptive bitrate
└── Echo cancellation
```

## Deployment Architecture

### 1. Multi-Platform Deployment

```
Source Code (TypeScript/React)
      ↓
Build Process (Vite)
      ├── Web Build → Firebase Hosting
      ├── iOS Build → Capacitor → App Store
      └── Android Build → Capacitor → Play Store
```

### 2. CI/CD Pipeline

```
Git Push → GitHub Actions → Build → Test → Deploy
                              ↓
                        Environment
                        ├── Development
                        ├── Staging
                        └── Production
```

## Scalability Considerations

### 1. Horizontal Scaling
- **Firebase Auto-scaling**: Automatic resource allocation
- **CDN Distribution**: Global content delivery
- **Stateless Architecture**: No server state management

### 2. Data Partitioning
- **User-based Sharding**: Data isolated by user
- **Time-based Archival**: Old data moved to cold storage
- **Query Optimization**: Composite indexes for performance

### 3. Cost Optimization
- **Lazy Loading**: Load data on demand
- **Batch Operations**: Reduce API calls
- **Client-side Caching**: Minimize repeated fetches
- **Storage Cleanup**: Automatic file deletion

## Integration Points

### 1. External Services
- **OneSignal**: Push notification delivery
- **Sentry**: Error and performance tracking
- **Amplitude**: User analytics
- **Tolgee**: Translation management

### 2. Future AI Integration Points
```
Chat Service
     ↓
AI Gateway Service (to be implemented)
     ├── OpenAI API
     ├── Claude API
     ├── Custom ML Models
     └── NLP Processing
```

### 3. Widget Integration
```
Host Website → Embed Script → Widget Iframe
                                    ↓
                            Widget Interface
                                    ↓
                            Main Application API
```

## Development Patterns

### 1. Component Patterns
- **Container/Presenter**: Logic and UI separation
- **Compound Components**: Flexible component APIs
- **Render Props**: Reusable component logic
- **Custom Hooks**: Shared stateful logic

### 2. Error Handling
```
Try/Catch Blocks → Error Boundary → Sentry Reporting
                          ↓
                   User-Friendly Error UI
```

### 3. Testing Strategy
- **Unit Tests**: Service and utility functions
- **Integration Tests**: Firebase rules testing
- **E2E Tests**: Critical user flows
- **Performance Tests**: Load and stress testing