# Embeddable Chat Widget System

## Overview

The embeddable chat widget system allows users to add a live chat widget to any website, enabling real-time communication between website visitors and the chat widget owner. The system is built with React, TypeScript, and Firebase, designed to be modular and reusable.

## Architecture

### Core Components

#### 1. **Embed Service** (`src/services/embedService.ts`)

- Manages embed configurations and validation
- Handles device fingerprinting for anonymous users
- Creates and manages embedded conversations
- Generates unique embed codes

#### 2. **Embeddable Widget** (`src/components/EmbeddableWidget/EmbeddableWidget.tsx`)

- Main React component that renders the chat widget
- Handles real-time messaging with Firebase
- Responsive design with customizable styling
- Cross-origin communication support

#### 3. **Embed Manager** (`src/components/EmbeddableWidget/EmbedManager.tsx`)

- User interface for creating and managing embeds
- Configuration panels for styling and behavior
- Domain management and security settings
- Embed code generation and preview

#### 4. **Standalone Widget** (`public/embed/widget.js`)

- Vanilla JavaScript widget for embedding in any website
- No external dependencies except the main app
- Device fingerprinting for visitor identification
- Auto-initialization and configuration

#### 5. **Demo Page** (`src/pages/EmbedDemo/index.tsx`)

- Interactive demonstration of the widget
- Multiple scenario examples (e-commerce, SaaS, blog, portfolio)
- Implementation guide and code examples

## Features

### ✅ **Embed Configuration**

- **Title & Description**: Custom branding for each embed
- **Domain Restrictions**: Security through allowed domain validation
- **Styling Options**: Colors, positioning, dimensions
- **Behavior Settings**: Auto-open, welcome messages, file uploads

### ✅ **Real-time Communication**

- **Instant Messaging**: Real-time chat using Firebase
- **File Sharing**: Support for images, videos, and documents
- **Message Status**: Sent, delivered, read indicators
- **Typing Indicators**: Live typing status

### ✅ **User Identification**

- **Custom User ID**: Optional user identification
- **Device Fingerprinting**: Automatic visitor identification
- **User Metadata**: Name, email, and custom data support
- **Session Persistence**: Maintains conversation across visits

### ✅ **Security & Privacy**

- **Domain Validation**: Restricts embed usage to authorized domains
- **Origin Checking**: Prevents unauthorized cross-origin usage
- **Data Encryption**: Secure Firebase communication
- **Access Control**: User-based conversation isolation

### ✅ **Responsive Design**

- **Mobile Optimized**: Works on all device sizes
- **Position Flexibility**: Four corner positioning options
- **Customizable UI**: Brand colors and styling
- **Accessibility**: Keyboard navigation and screen reader support

### ✅ **Management Interface**

- **Dashboard Integration**: Built into Modern Dashboard
- **Embed Creation**: Step-by-step embed setup wizard
- **Configuration Management**: Edit styling and behavior
- **Code Generation**: One-click embed code copying
- **Analytics**: View embed usage and conversations

## Implementation

### Creating an Embed

1. **Access Embed Manager**

   ```typescript
   // Navigate to Modern Dashboard → Chat Embeds
   // Or access via sidebar menu item
   ```

2. **Configure Basic Settings**

   ```typescript
   const embedConfig = {
     title: 'Customer Support Chat',
     description: 'Help customers with their questions',
     allowedDomains: ['example.com', 'www.example.com'],
   };
   ```

3. **Customize Appearance**

   ```typescript
   const styleConfig = {
     primaryColor: '#3b82f6',
     backgroundColor: '#ffffff',
     position: 'bottom-right',
     width: '350px',
     height: '500px',
   };
   ```

4. **Set Behavior Options**
   ```typescript
   const behaviorConfig = {
     autoOpen: false,
     welcomeMessage: 'Hi! How can I help you?',
     enableFileUpload: true,
     maxFileSize: 10, // MB
   };
   ```

### Embedding the Widget

#### Basic Implementation

```html
<!-- AI Personal Assistant Chat Widget -->
<div id="ai-chat-widget-demo"></div>
<script>
  (function () {
    var script = document.createElement('script');
    script.src = 'https://your-domain.com/embed/widget.js';
    script.async = true;
    script.onload = function () {
      if (window.AIChatWidget) {
        window.AIChatWidget.init({
          embedId: 'your-embed-id',
          containerId: 'ai-chat-widget-demo',
          baseUrl: 'https://your-domain.com',
        });
      }
    };
    document.head.appendChild(script);
  })();
</script>
```

#### Advanced Implementation with User Data

```html
<script>
  window.AIChatWidget.init({
    embedId: 'your-embed-id',
    containerId: 'ai-chat-widget-demo',
    baseUrl: 'https://your-domain.com',
    userId: 'user-123',
    userMetadata: {
      name: 'John Doe',
      email: 'john@example.com',
      plan: 'premium',
    },
  });
</script>
```

## Data Models

### Embed Configuration

```typescript
interface EmbedConfig {
  id?: string;
  userId: string;
  userEmail: string;
  title: string;
  description?: string;
  allowedDomains: string[];
  embedCode: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  style?: {
    primaryColor?: string;
    backgroundColor?: string;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    width?: string;
    height?: string;
  };
  behavior?: {
    autoOpen?: boolean;
    showOnlineStatus?: boolean;
    enableFileUpload?: boolean;
    welcomeMessage?: string;
    maxFileSize?: number;
  };
}
```

### Embedded Conversation

```typescript
interface EmbeddedChatConversation {
  id?: string;
  embedId: string;
  websiteUrl: string;
  visitorId: string;
  visitorMetadata?: {
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
  };
  ownerUserId: string;
  ownerEmail: string;
  lastMessage?: string;
  lastMessageTime?: Timestamp;
  unreadCount?: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Database Structure

### Firestore Collections

#### Embeds Collection: `{PROJECT_PREFIX}_embeds`

- Document ID: Auto-generated
- Fields: EmbedConfig interface
- Security: Owner-only read/write access

#### Embed Conversations: `{PROJECT_PREFIX}_embed_conversations`

- Document ID: Auto-generated
- Fields: EmbeddedChatConversation interface
- Security: Owner and visitor read/write access

#### Embed Messages: `{PROJECT_PREFIX}_embed_messages`

- Document ID: Auto-generated
- Fields: FirestoreMessage interface (extended)
- Security: Conversation participants only

## Security Considerations

### Domain Validation

- Embed widgets validate the origin domain before initializing
- Only domains in the `allowedDomains` array can use the embed
- Subdomain support (e.g., `*.example.com`)

### Data Privacy

- Visitor identification through device fingerprinting or provided user ID
- No personal data stored without explicit user consent
- Message encryption in transit via Firebase

### Access Control

- Users can only access their own embeds and conversations
- Firestore security rules enforce user isolation
- Admin-level access for moderation if needed

## Performance Optimization

### Widget Loading

- Asynchronous script loading
- Lazy initialization on user interaction
- Minimal initial bundle size

### Real-time Updates

- Efficient Firebase listener management
- Automatic cleanup on widget destruction
- Optimized message batching

### Caching Strategy

- Embed configuration caching
- Message history pagination
- Asset optimization for faster loading

## Customization Guide

### Styling

```scss
// Override default colors
.embeddable-widget {
  --primary-color: #your-brand-color;
  --background-color: #your-bg-color;
  --text-color: #your-text-color;
}
```

### Behavior Customization

```javascript
// Custom event handlers
window.AIChatWidget.on('message', function (data) {
  // Handle new messages
  console.log('New message:', data);
});

window.AIChatWidget.on('open', function () {
  // Track widget opens
  analytics.track('chat_widget_opened');
});
```

## Testing

### Unit Tests

- Embed service functionality
- Widget component behavior
- Message handling logic

### Integration Tests

- Cross-origin communication
- Firebase integration
- Domain validation

### End-to-End Tests

- Complete embed workflow
- Multi-device testing
- Browser compatibility

## Monitoring & Analytics

### Widget Usage

- Track embed installations
- Monitor conversation metrics
- Analyze user engagement

### Performance Metrics

- Widget load times
- Message delivery rates
- Error rates and debugging

### Business Metrics

- Conversion rates via chat
- Customer satisfaction scores
- Support efficiency improvements

## Deployment

### Production Setup

1. Configure Firebase project with proper security rules
2. Set up CDN for widget.js distribution
3. Configure CORS headers for cross-origin access
4. Set up monitoring and alerting

### Scaling Considerations

- Firebase pricing for high-volume usage
- CDN distribution for global performance
- Database indexing for conversation queries
- Rate limiting for embed requests

## Migration & Upgrades

### Version Management

- Semantic versioning for widget releases
- Backward compatibility maintenance
- Migration guides for breaking changes

### Feature Rollouts

- Feature flags for gradual releases
- A/B testing capabilities
- Safe rollback procedures

## Support & Documentation

### User Guides

- Embed creation tutorials
- Customization examples
- Troubleshooting guides

### Developer Resources

- API documentation
- SDK examples
- Community support

## Future Enhancements

### Planned Features

- **Multi-language Support**: Internationalization
- **Advanced Analytics**: Detailed reporting dashboard
- **AI Integration**: Automated responses and routing
- **Video Chat**: WebRTC-based video calling
- **Screen Sharing**: Support ticket assistance
- **Chatbot Integration**: AI-powered initial responses
- **Advanced Customization**: Theme marketplace
- **API Access**: RESTful API for programmatic access

### Technical Improvements

- Widget bundle optimization
- Progressive Web App features
- Enhanced accessibility
- Better offline support

---

## Getting Started

1. **Enable Embed System**: Add "Chat Embeds" to your navigation menu
2. **Create Your First Embed**: Use the Embed Manager to set up a widget
3. **Test Integration**: Use the demo page to preview functionality
4. **Deploy to Website**: Copy embed code to your website
5. **Monitor Performance**: Track usage and optimize as needed

For questions or support, refer to the implementation examples in the demo page or check the troubleshooting section.
