# AI Personal Assistant

A comprehensive AI-powered personal assistant application built with React, offering intelligent chat functionality, anonymous rooms, embeddable widgets, and advanced user management features.

## 🚀 Features

- **Intelligent Chat System** - Advanced AI-powered conversations with real-time messaging
- **Anonymous Chat Rooms** - Secure anonymous chat functionality with temporary rooms
- **Embeddable Widgets** - Customizable chat widgets for integration into external websites
- **User Management** - Complete authentication and user profile management
- **Dashboard** - Comprehensive dashboard with analytics and management tools
- **Product Adoption** - Interactive product tours and user onboarding system
- **Multi-Platform Support** - Web application with mobile app capabilities via Capacitor
- **Real-time Notifications** - Push notifications via OneSignal integration
- **Feedback System** - Built-in user feedback and rating system
- **Theme Customization** - Multiple themes and customization options

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: PrimeReact
- **Mobile**: Capacitor (iOS & Android)
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Real-time**: Socket.io
- **Routing**: TanStack Router
- **State Management**: Zustand
- **Styling**: SCSS, CSS Modules
- **Testing**: Vitest, React Testing Library
- **Deployment**: Firebase Hosting

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Firebase account and project setup
- OneSignal account for push notifications
- Git for version control

## 🚀 Quick Start

1. **Clone the repository**

   ```bash
   git clone [repository-url]
   cd 02-ai-personal-assistant
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp env-example .env
   # Configure your environment variables
   ```

4. **Firebase Configuration**

   - Set up Firebase project
   - Configure authentication providers
   - Set up Firestore database
   - Configure Firebase hosting

5. **Run the application**
   ```bash
   npm run dev
   ```

## 📖 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[Authentication Guide](./docs/authentication/)** - User authentication and security
- **[Chat System](./docs/chat-system/)** - Chat functionality and implementation
- **[Feedback Module](./docs/feedback-module/)** - User feedback system
- **[Product Adoption Guide](./docs/product-adoption/)** - Product tours and onboarding system
- **[Testing Guide](./docs/testing/)** - Testing procedures and guidelines
- **[Deployment Guide](./docs/deployment/)** - Deployment and configuration
- **[Implementation Status](./docs/implementation-status/)** - Project completion status

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Mobile Development

The application supports mobile platforms via Capacitor:

- `npm run android` - Build for Android
- `npm run ios` - Build for iOS

## 🏗️ Architecture

The application follows a modular architecture with:

- **Component-based UI** - Reusable React components
- **Service Layer** - API and business logic services
- **State Management** - Zustand for global state
- **HOCs** - Higher-order components for cross-cutting concerns
- **Modular Features** - Self-contained feature modules

### Key Modules

- **Chat Module** - Real-time messaging with AI integration
- **Feedback Module** - User feedback collection and management
- **Product Adoption Module** - Interactive tours and onboarding
  - Visual tour builder with drag-and-drop interface
  - Engagement widgets (NPS, feedback, announcements)
  - Advanced targeting and analytics
  - Demo data initialization for testing

## 🔐 Security

- Firebase Authentication with multiple providers
- Secure API endpoints with proper authorization
- Input validation and sanitization
- HTTPS enforcement
- Session management and timeout handling

## 📱 Mobile Features

- **Capacitor Integration** - Native mobile app capabilities
- **Push Notifications** - OneSignal integration
- **Offline Support** - Service worker implementation
- **Native APIs** - Camera, file system, and device features

## 🤝 Contributing

This is a proprietary project. For contribution guidelines and development setup, please refer to the internal documentation.

## 📄 License

**⚠️ IMPORTANT: Commercial License Required**

This project is proprietary software owned by **Zaions**. All rights are reserved.

- **For Production/Commercial Use**: A commercial license is required
- **For Educational Use**: Personal and educational use is permitted
- **For Licensing**: Contact Zaions for commercial licensing

See [LICENSE.md](./LICENSE.md) for full licensing terms and conditions.

## 📞 Contact & Support

**Developer:** Ahsan Mahmood

- Website: https://aoneahsan.com
- LinkedIn: https://linkedin.com/in/aoneahsan

**Company:** Zaions

- Website: https://zaions.com
- YouTube: https://youtube.com/@zaionsofficial

---

## Copyright

**© 2024 Zaions. All rights reserved.**  
**Developed by Ahsan Mahmood**

_This software is protected by copyright law. Unauthorized use, reproduction, or distribution is prohibited. For licensing inquiries, please contact Zaions._
