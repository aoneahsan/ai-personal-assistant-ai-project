# ProductAdoption Extension Developer Guide

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Development Setup](#development-setup)
3. [Project Structure](#project-structure)
4. [Core Components](#core-components)
5. [API Integration](#api-integration)
6. [Building and Testing](#building-and-testing)
7. [Debugging](#debugging)
8. [Performance Optimization](#performance-optimization)
9. [Security Considerations](#security-considerations)
10. [Contributing](#contributing)

## Architecture Overview

The ProductAdoption Extension is built using modern web technologies and follows Chrome Extension Manifest V3 specifications for cross-browser compatibility.

### Technology Stack

- **Core**: Vanilla JavaScript (ES6+)
- **Build System**: Webpack 5
- **Testing**: Jest + Testing Library
- **Linting**: ESLint with Airbnb config
- **Package Management**: npm
- **Version Control**: Git

### Extension Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Background    │     │  Content Script │     │     Popup UI    │
│  Service Worker │◄────┤                 ├────►│                 │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                         │
         │              ┌────────▼────────┐               │
         └──────────────┤   Message Bus   ├───────────────┘
                        └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │  External APIs  │
                        │  (ProductAdoption)│
                        └─────────────────┘
```

### Key Design Principles

1. **Separation of Concerns**: Each component has a single responsibility
2. **Message-Based Communication**: Components communicate via Chrome's message passing API
3. **Progressive Enhancement**: Core functionality works without optional features
4. **Security First**: All inputs sanitized, CSP enforced
5. **Performance Focused**: Lazy loading, efficient DOM manipulation

## Development Setup

### Prerequisites

- Node.js 16.x or higher
- npm 8.x or higher
- Git
- Chrome/Firefox/Edge browser (latest version)
- Code editor (VS Code recommended)

### Initial Setup

1. **Clone the Repository**
```bash
git clone https://github.com/productadoption/browser-extension.git
cd browser-extension
```

2. **Install Dependencies**
```bash
npm install
```

3. **Generate Development Assets**
```bash
# Generate icon placeholders
node scripts/generate-icons.js

# Copy manifest for development
npm run manifest:dev
```

4. **Configure Environment**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
PRODUCTADOPTION_API_URL=https://api.productadoption.com/v1
PRODUCTADOPTION_APP_URL=https://app.productadoption.com
EXTENSION_ID=your-dev-extension-id
```

5. **Start Development Mode**
```bash
npm run dev
```

### Loading in Browser (Development)

#### Chrome/Edge
1. Navigate to `chrome://extensions/` or `edge://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `build` directory
5. Note the generated Extension ID for API configuration

#### Firefox
1. Navigate to `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select any file in the `build` directory

### Development Workflow

1. **Hot Reload**: Webpack watches for changes and rebuilds automatically
2. **Manual Reload**: Click "Reload" in extensions page after significant changes
3. **Console Access**: 
   - Background: chrome://extensions/ → "Service Worker" link
   - Content: Regular DevTools console on any page
   - Popup: Right-click popup → "Inspect"

## Project Structure

```
ProductAdoptionExtension/
├── src/
│   ├── background/
│   │   ├── background.js        # Service worker main
│   │   ├── api-client.js        # API communication
│   │   ├── auth-manager.js      # OAuth handling
│   │   ├── message-handler.js   # Message routing
│   │   └── storage-manager.js   # Chrome storage wrapper
│   │
│   ├── content/
│   │   ├── content.js           # Content script main
│   │   ├── content.css          # Injected styles
│   │   ├── injected.js          # Page context script
│   │   ├── element-picker.js    # Element selection logic
│   │   ├── tour-renderer.js     # Tour display engine
│   │   ├── selector-generator.js # CSS selector creation
│   │   └── dom-observer.js      # Mutation observer
│   │
│   ├── popup/
│   │   ├── popup.html           # Popup UI structure
│   │   ├── popup.js             # Popup logic
│   │   ├── popup.css            # Popup styles
│   │   ├── components/          # UI components
│   │   └── utils/               # Popup utilities
│   │
│   ├── options/
│   │   ├── options.html         # Settings page
│   │   ├── options.js           # Settings logic
│   │   └── options.css          # Settings styles
│   │
│   └── shared/
│       ├── constants.js         # Shared constants
│       ├── utils.js             # Utility functions
│       ├── message-types.js     # Message constants
│       └── tour-schema.js       # Tour data structure
│
├── public/
│   ├── icons/                   # Extension icons
│   └── images/                  # UI assets
│
├── scripts/
│   ├── generate-icons.js        # Icon generation
│   ├── package.js               # Packaging script
│   └── update-manifest.js       # Manifest updater
│
├── tests/
│   ├── unit/                    # Unit tests
│   ├── integration/             # Integration tests
│   └── e2e/                     # End-to-end tests
│
├── webpack.config.js            # Webpack configuration
├── manifest.json                # Extension manifest
├── package.json                 # NPM configuration
└── README.md                    # Project documentation
```

## Core Components

### Background Service Worker

The background script runs persistently and handles:
- API communication
- Authentication flow
- Storage management
- Message routing between components

```javascript
// src/background/background.js
import { APIClient } from './api-client.js';
import { AuthManager } from './auth-manager.js';
import { MessageHandler } from './message-handler.js';
import { StorageManager } from './storage-manager.js';

class BackgroundService {
  constructor() {
    this.api = new APIClient();
    this.auth = new AuthManager();
    this.storage = new StorageManager();
    this.messageHandler = new MessageHandler(this);
  }

  async initialize() {
    await this.auth.initialize();
    this.messageHandler.listen();
    chrome.runtime.onInstalled.addListener(this.onInstalled.bind(this));
    chrome.runtime.onStartup.addListener(this.onStartup.bind(this));
  }

  async onInstalled(details) {
    if (details.reason === 'install') {
      await this.storage.setDefaults();
      chrome.runtime.openOptionsPage();
    }
  }

  async onStartup() {
    await this.auth.refreshTokenIfNeeded();
  }
}

const service = new BackgroundService();
service.initialize();
```

### Content Script

Injected into web pages to:
- Create and manage tours
- Handle element selection
- Render tour steps
- Communicate with background script

```javascript
// src/content/content.js
import { ElementPicker } from './element-picker.js';
import { TourRenderer } from './tour-renderer.js';
import { SelectorGenerator } from './selector-generator.js';
import { DOMObserver } from './dom-observer.js';

class ContentScript {
  constructor() {
    this.picker = new ElementPicker();
    this.renderer = new TourRenderer();
    this.selectorGen = new SelectorGenerator();
    this.observer = new DOMObserver();
    this.isActive = false;
  }

  initialize() {
    this.injectStyles();
    this.setupMessageListener();
    this.observer.start();
  }

  injectStyles() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('src/content/content.css');
    document.head.appendChild(link);
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'START_TOUR_CREATION':
          this.startTourCreation();
          break;
        case 'RENDER_TOUR':
          this.renderTour(request.tour);
          break;
        case 'STOP_TOUR':
          this.stopTour();
          break;
      }
      sendResponse({ success: true });
    });
  }

  startTourCreation() {
    this.isActive = true;
    this.picker.enable();
    this.picker.on('elementSelected', (element) => {
      const selector = this.selectorGen.generate(element);
      chrome.runtime.sendMessage({
        action: 'ADD_TOUR_STEP',
        data: { selector, url: window.location.href }
      });
    });
  }

  renderTour(tour) {
    this.renderer.render(tour);
  }

  stopTour() {
    this.isActive = false;
    this.picker.disable();
    this.renderer.clear();
  }
}

const contentScript = new ContentScript();
contentScript.initialize();
```

### Element Picker

Handles interactive element selection:

```javascript
// src/content/element-picker.js
export class ElementPicker {
  constructor() {
    this.enabled = false;
    this.overlay = null;
    this.callbacks = new Map();
  }

  enable() {
    this.enabled = true;
    this.createOverlay();
    this.attachListeners();
  }

  disable() {
    this.enabled = false;
    this.removeOverlay();
    this.detachListeners();
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'productadoption-overlay';
    document.body.appendChild(this.overlay);
  }

  attachListeners() {
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('click', this.handleClick);
    document.addEventListener('keydown', this.handleKeyDown);
  }

  handleMouseMove = (e) => {
    if (!this.enabled) return;
    
    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (element && element !== this.overlay) {
      this.highlightElement(element);
    }
  };

  highlightElement(element) {
    const rect = element.getBoundingClientRect();
    this.overlay.style.left = `${rect.left}px`;
    this.overlay.style.top = `${rect.top}px`;
    this.overlay.style.width = `${rect.width}px`;
    this.overlay.style.height = `${rect.height}px`;
  }

  handleClick = (e) => {
    if (!this.enabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (element && element !== this.overlay) {
      this.emit('elementSelected', element);
    }
  };

  on(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event).push(callback);
  }

  emit(event, data) {
    if (this.callbacks.has(event)) {
      this.callbacks.get(event).forEach(cb => cb(data));
    }
  }
}
```

### API Client

Handles all communication with ProductAdoption API:

```javascript
// src/background/api-client.js
export class APIClient {
  constructor() {
    this.baseURL = process.env.PRODUCTADOPTION_API_URL;
    this.token = null;
  }

  async initialize() {
    this.token = await this.getStoredToken();
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new APIError(response.status, await response.text());
    }

    return response.json();
  }

  // Tour Management
  async createTour(tourData) {
    return this.request('/tours', {
      method: 'POST',
      body: JSON.stringify(tourData)
    });
  }

  async updateTour(tourId, updates) {
    return this.request(`/tours/${tourId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  async getTours(params = {}) {
    const query = new URLSearchParams(params);
    return this.request(`/tours?${query}`);
  }

  async deleteTour(tourId) {
    return this.request(`/tours/${tourId}`, {
      method: 'DELETE'
    });
  }

  // Analytics
  async trackEvent(eventData) {
    return this.request('/analytics/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  }
}

class APIError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = 'APIError';
  }
}
```

## API Integration

### Authentication Flow

1. **OAuth2 Authorization Code Flow**
```javascript
// src/background/auth-manager.js
export class AuthManager {
  async authenticate() {
    const authUrl = this.buildAuthUrl();
    const redirectUrl = await this.launchAuthFlow(authUrl);
    const authCode = this.extractAuthCode(redirectUrl);
    const tokens = await this.exchangeCodeForTokens(authCode);
    await this.storeTokens(tokens);
  }

  buildAuthUrl() {
    const params = new URLSearchParams({
      client_id: process.env.PRODUCTADOPTION_CLIENT_ID,
      redirect_uri: chrome.identity.getRedirectURL(),
      response_type: 'code',
      scope: 'tours:write analytics:read',
      state: this.generateState()
    });
    
    return `${process.env.PRODUCTADOPTION_APP_URL}/oauth/authorize?${params}`;
  }

  async launchAuthFlow(authUrl) {
    return new Promise((resolve, reject) => {
      chrome.identity.launchWebAuthFlow({
        url: authUrl,
        interactive: true
      }, (redirectUrl) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(redirectUrl);
        }
      });
    });
  }

  async refreshToken() {
    const refreshToken = await this.getRefreshToken();
    const response = await fetch(`${process.env.PRODUCTADOPTION_API_URL}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.PRODUCTADOPTION_CLIENT_ID,
        client_secret: process.env.PRODUCTADOPTION_CLIENT_SECRET
      })
    });

    const tokens = await response.json();
    await this.storeTokens(tokens);
    return tokens.access_token;
  }
}
```

### API Endpoints

#### Tours API
- `GET /api/v1/tours` - List all tours
- `POST /api/v1/tours` - Create new tour
- `GET /api/v1/tours/:id` - Get tour details
- `PATCH /api/v1/tours/:id` - Update tour
- `DELETE /api/v1/tours/:id` - Delete tour
- `POST /api/v1/tours/:id/publish` - Publish tour
- `POST /api/v1/tours/:id/unpublish` - Unpublish tour

#### Steps API
- `GET /api/v1/tours/:id/steps` - List tour steps
- `POST /api/v1/tours/:id/steps` - Add step
- `PATCH /api/v1/tours/:id/steps/:stepId` - Update step
- `DELETE /api/v1/tours/:id/steps/:stepId` - Delete step
- `POST /api/v1/tours/:id/steps/reorder` - Reorder steps

#### Analytics API
- `GET /api/v1/analytics/tours/:id` - Tour analytics
- `POST /api/v1/analytics/events` - Track events
- `GET /api/v1/analytics/reports` - Generate reports

### Data Formats

#### Tour Schema
```javascript
{
  id: "tour_abc123",
  name: "Getting Started Tour",
  description: "Introduction to our product",
  url_pattern: "https://app.example.com/*",
  status: "published", // draft, published, archived
  theme: {
    primaryColor: "#007bff",
    backgroundColor: "#ffffff",
    textColor: "#333333",
    borderRadius: "4px"
  },
  settings: {
    autoStart: false,
    showOnce: true,
    keyboard: true,
    exitOnEsc: true,
    overlayOpacity: 0.5
  },
  steps: [
    {
      id: "step_1",
      order: 1,
      target: {
        selector: "#welcome-button",
        fallbackSelectors: [".welcome-btn", "[data-tour='welcome']"],
        position: "bottom"
      },
      content: {
        title: "Welcome to Our App!",
        description: "Let's take a quick tour of the main features.",
        image: "https://cdn.example.com/welcome.png",
        buttons: [
          { text: "Next", action: "next", primary: true },
          { text: "Skip Tour", action: "skip" }
        ]
      },
      behavior: {
        delay: 0,
        highlight: true,
        scrollTo: true,
        waitFor: null
      }
    }
  ],
  triggers: [
    { type: "pageLoad", delay: 1000 },
    { type: "click", selector: "#help-button" },
    { type: "custom", event: "user.signup.complete" }
  ],
  targeting: {
    segments: ["new_users", "trial_users"],
    conditions: [
      { field: "created_at", operator: "gte", value: "30_days_ago" }
    ]
  },
  analytics: {
    views: 1523,
    completions: 892,
    skips: 234,
    avgCompletionTime: 45.2
  },
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2024-01-20T14:45:00Z",
  created_by: "user_123",
  updated_by: "user_456"
}
```

## Building and Testing

### Build Process

#### Development Build
```bash
# Watch mode with source maps
npm run dev

# Single development build
npm run build:dev
```

#### Production Build
```bash
# Optimized production build
npm run build

# Platform-specific builds
npm run build:chrome
npm run build:firefox
npm run build:edge
```

#### Build Configuration
```javascript
// webpack.config.js
module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: {
      background: './src/background/background.js',
      content: './src/content/content.js',
      popup: './src/popup/popup.js',
      options: './src/options/options.js'
    },
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: '[name].js'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader']
        }
      ]
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          { from: 'manifest.json' },
          { from: 'public', to: 'public' },
          { from: 'src/**/*.html', to: '[path][name][ext]' }
        ]
      }),
      new MiniCssExtractPlugin({
        filename: '[name].css'
      }),
      ...(isProduction ? [
        new TerserPlugin({
          terserOptions: {
            compress: { drop_console: true }
          }
        })
      ] : [])
    ],
    optimization: {
      minimize: isProduction
    },
    devtool: isProduction ? false : 'source-map'
  };
};
```

### Testing Strategy

#### Unit Tests
```javascript
// tests/unit/selector-generator.test.js
import { SelectorGenerator } from '../../src/content/selector-generator';

describe('SelectorGenerator', () => {
  let generator;
  
  beforeEach(() => {
    generator = new SelectorGenerator();
  });

  test('generates ID selector when available', () => {
    const element = document.createElement('div');
    element.id = 'unique-id';
    
    const selector = generator.generate(element);
    expect(selector).toBe('#unique-id');
  });

  test('generates class selector for elements without ID', () => {
    const element = document.createElement('div');
    element.className = 'btn btn-primary';
    
    const selector = generator.generate(element);
    expect(selector).toBe('.btn.btn-primary');
  });

  test('generates nth-child selector for similar siblings', () => {
    const parent = document.createElement('ul');
    for (let i = 0; i < 3; i++) {
      parent.appendChild(document.createElement('li'));
    }
    
    const selector = generator.generate(parent.children[1]);
    expect(selector).toContain(':nth-child(2)');
  });
});
```

#### Integration Tests
```javascript
// tests/integration/tour-creation.test.js
import { ContentScript } from '../../src/content/content';
import { BackgroundService } from '../../src/background/background';

describe('Tour Creation Flow', () => {
  let contentScript;
  let backgroundService;

  beforeEach(async () => {
    contentScript = new ContentScript();
    backgroundService = new BackgroundService();
    await backgroundService.initialize();
  });

  test('creates tour with multiple steps', async () => {
    // Start tour creation
    await contentScript.startTourCreation();
    
    // Simulate element selection
    const element1 = document.querySelector('#step1');
    contentScript.picker.emit('elementSelected', element1);
    
    const element2 = document.querySelector('#step2');
    contentScript.picker.emit('elementSelected', element2);
    
    // Save tour
    const tour = await backgroundService.saveTour({
      name: 'Test Tour',
      steps: contentScript.getCurrentSteps()
    });
    
    expect(tour.id).toBeDefined();
    expect(tour.steps).toHaveLength(2);
  });
});
```

#### End-to-End Tests
```javascript
// tests/e2e/full-flow.test.js
import puppeteer from 'puppeteer';
import path from 'path';

describe('E2E: Complete Tour Creation', () => {
  let browser;
  let page;

  beforeAll(async () => {
    const extensionPath = path.join(__dirname, '../../build');
    browser = await puppeteer.launch({
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`
      ]
    });
  });

  test('creates and previews tour', async () => {
    page = await browser.newPage();
    await page.goto('https://example.com');
    
    // Open extension popup
    const targets = await browser.targets();
    const extensionTarget = targets.find(target => 
      target.type() === 'service_worker'
    );
    
    const extensionId = extensionTarget.url().split('/')[2];
    const popupUrl = `chrome-extension://${extensionId}/src/popup/popup.html`;
    
    await page.goto(popupUrl);
    await page.click('#create-tour-btn');
    
    // Switch back to main page
    await page.goto('https://example.com');
    
    // Select elements
    await page.click('h1');
    await page.waitForTimeout(1000);
    await page.click('#main-content');
    
    // Preview tour
    await page.keyboard.press('Control+P');
    
    // Verify tour is rendered
    const tourOverlay = await page.$('.productadoption-tour-overlay');
    expect(tourOverlay).toBeTruthy();
  });

  afterAll(async () => {
    await browser.close();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Debugging

### Chrome DevTools

#### Background Service Worker
1. Go to `chrome://extensions/`
2. Find ProductAdoption Extension
3. Click "Service Worker" link
4. DevTools opens with console, network, etc.

#### Content Script
1. Open any webpage
2. Open DevTools (F12)
3. Console messages prefixed with `[ProductAdoption]`
4. Use Sources tab to set breakpoints

#### Popup
1. Right-click extension icon
2. Select "Inspect popup"
3. DevTools opens for popup context

### Debug Utilities

```javascript
// src/shared/debug.js
export class Debug {
  static log(component, message, data = {}) {
    if (!this.isEnabled()) return;
    
    console.log(
      `%c[ProductAdoption:${component}]`,
      'color: #007bff; font-weight: bold;',
      message,
      data
    );
  }

  static error(component, error, context = {}) {
    console.error(
      `%c[ProductAdoption:${component}]`,
      'color: #dc3545; font-weight: bold;',
      error.message,
      { error, context, stack: error.stack }
    );
  }

  static time(label) {
    if (!this.isEnabled()) return;
    console.time(`[ProductAdoption] ${label}`);
  }

  static timeEnd(label) {
    if (!this.isEnabled()) return;
    console.timeEnd(`[ProductAdoption] ${label}`);
  }

  static isEnabled() {
    return process.env.NODE_ENV === 'development' || 
           localStorage.getItem('productadoption_debug') === 'true';
  }
}

// Usage
Debug.log('ElementPicker', 'Element selected', { selector, element });
Debug.time('Tour Render');
// ... rendering logic
Debug.timeEnd('Tour Render');
```

### Common Debugging Scenarios

#### Message Passing Issues
```javascript
// Add logging to message handlers
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  Debug.log('MessageHandler', 'Received message', {
    action: request.action,
    sender: sender.tab ? sender.tab.url : 'extension',
    data: request.data
  });
  
  // Handle message...
  
  Debug.log('MessageHandler', 'Sending response', response);
  sendResponse(response);
});
```

#### DOM Selection Problems
```javascript
// Enhanced selector debugging
class SelectorDebugger {
  static validateSelector(selector) {
    try {
      const elements = document.querySelectorAll(selector);
      Debug.log('SelectorDebugger', 'Selector validation', {
        selector,
        matchCount: elements.length,
        elements: Array.from(elements).map(el => ({
          tag: el.tagName,
          id: el.id,
          classes: el.className
        }))
      });
      return elements.length > 0;
    } catch (error) {
      Debug.error('SelectorDebugger', error, { selector });
      return false;
    }
  }
}
```

#### Performance Profiling
```javascript
// Profile tour rendering performance
class PerformanceProfiler {
  static async profileTourRender(tour) {
    const marks = {
      start: performance.now(),
      steps: []
    };
    
    for (const step of tour.steps) {
      const stepStart = performance.now();
      await this.renderStep(step);
      marks.steps.push({
        stepId: step.id,
        duration: performance.now() - stepStart
      });
    }
    
    marks.total = performance.now() - marks.start;
    Debug.log('Performance', 'Tour render profile', marks);
  }
}
```

## Performance Optimization

### Efficient DOM Operations

```javascript
// Batch DOM updates
class DOMBatcher {
  constructor() {
    this.queue = [];
    this.scheduled = false;
  }

  add(operation) {
    this.queue.push(operation);
    if (!this.scheduled) {
      this.scheduled = true;
      requestAnimationFrame(() => this.flush());
    }
  }

  flush() {
    const fragment = document.createDocumentFragment();
    
    this.queue.forEach(op => {
      if (op.type === 'create') {
        fragment.appendChild(op.element);
      }
    });
    
    document.body.appendChild(fragment);
    this.queue = [];
    this.scheduled = false;
  }
}
```

### Lazy Loading

```javascript
// Lazy load tour steps
class LazyTourLoader {
  constructor(tour) {
    this.tour = tour;
    this.loadedSteps = new Map();
  }

  async getStep(stepId) {
    if (this.loadedSteps.has(stepId)) {
      return this.loadedSteps.get(stepId);
    }
    
    const step = await this.loadStepData(stepId);
    this.loadedSteps.set(stepId, step);
    
    // Preload next step
    const nextStepId = this.getNextStepId(stepId);
    if (nextStepId) {
      this.preloadStep(nextStepId);
    }
    
    return step;
  }

  async preloadStep(stepId) {
    if (!this.loadedSteps.has(stepId)) {
      const step = await this.loadStepData(stepId);
      this.loadedSteps.set(stepId, step);
    }
  }
}
```

### Memory Management

```javascript
// Cleanup and memory management
class MemoryManager {
  static cleanup() {
    // Remove event listeners
    this.removeAllListeners();
    
    // Clear caches
    this.clearCaches();
    
    // Remove DOM elements
    this.removeOrphanedElements();
    
    // Cancel pending timers
    this.cancelTimers();
  }

  static monitorMemoryUsage() {
    if (performance.memory) {
      const usage = {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576),
        total: Math.round(performance.memory.totalJSHeapSize / 1048576),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
      };
      
      Debug.log('Memory', 'Current usage', usage);
      
      if (usage.used / usage.total > 0.9) {
        Debug.warn('Memory', 'High memory usage detected');
        this.cleanup();
      }
    }
  }
}
```

### Network Optimization

```javascript
// API request batching
class APIBatcher {
  constructor(api, batchDelay = 50) {
    this.api = api;
    this.batchDelay = batchDelay;
    this.queue = [];
    this.timer = null;
  }

  add(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      this.scheduleBatch();
    });
  }

  scheduleBatch() {
    if (this.timer) return;
    
    this.timer = setTimeout(() => {
      this.processBatch();
      this.timer = null;
    }, this.batchDelay);
  }

  async processBatch() {
    const batch = this.queue.splice(0);
    if (batch.length === 0) return;
    
    try {
      const results = await this.api.batch(
        batch.map(item => item.request)
      );
      
      batch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      batch.forEach(item => item.reject(error));
    }
  }
}
```

## Security Considerations

### Content Security Policy

```javascript
// manifest.json CSP configuration
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'",
    "sandbox": "sandbox allow-scripts; script-src 'self'"
  }
}
```

### Input Sanitization

```javascript
// Sanitize user inputs
class Sanitizer {
  static sanitizeHTML(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  static sanitizeSelector(selector) {
    // Remove potentially dangerous characters
    return selector.replace(/[<>\"']/g, '');
  }

  static sanitizeURL(url) {
    try {
      const parsed = new URL(url);
      // Only allow http(s) protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Invalid protocol');
      }
      return parsed.href;
    } catch {
      throw new Error('Invalid URL');
    }
  }
}
```

### Secure Communication

```javascript
// Verify message origin
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Verify sender is part of our extension
  if (sender.id !== chrome.runtime.id) {
    console.error('Message from unknown sender:', sender);
    return;
  }

  // Verify sender context
  if (sender.tab && !isAllowedOrigin(sender.tab.url)) {
    console.error('Message from disallowed origin:', sender.tab.url);
    return;
  }

  // Process message...
});

function isAllowedOrigin(url) {
  const allowed = [
    'https://productadoption.com',
    'https://app.productadoption.com'
  ];
  
  try {
    const origin = new URL(url).origin;
    return allowed.includes(origin);
  } catch {
    return false;
  }
}
```

### Token Storage

```javascript
// Secure token storage
class SecureStorage {
  static async storeToken(token) {
    // Encrypt token before storage
    const encrypted = await this.encrypt(token);
    
    return new Promise((resolve) => {
      chrome.storage.local.set({ 
        auth_token: encrypted,
        token_timestamp: Date.now()
      }, resolve);
    });
  }

  static async getToken() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['auth_token', 'token_timestamp'], async (data) => {
        if (!data.auth_token) {
          resolve(null);
          return;
        }
        
        // Check token age
        const age = Date.now() - data.token_timestamp;
        if (age > 7 * 24 * 60 * 60 * 1000) { // 7 days
          await this.clearToken();
          resolve(null);
          return;
        }
        
        // Decrypt token
        const decrypted = await this.decrypt(data.auth_token);
        resolve(decrypted);
      });
    });
  }

  static async clearToken() {
    return new Promise((resolve) => {
      chrome.storage.local.remove(['auth_token', 'token_timestamp'], resolve);
    });
  }

  // Encryption methods would use Web Crypto API
  static async encrypt(data) {
    // Implementation using SubtleCrypto
    return data; // Placeholder
  }

  static async decrypt(data) {
    // Implementation using SubtleCrypto
    return data; // Placeholder
  }
}
```

## Contributing

### Getting Started

1. **Fork the Repository**
   - Click "Fork" on GitHub
   - Clone your fork locally

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Follow code style guidelines
   - Add tests for new features
   - Update documentation

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style

We use ESLint with Airbnb configuration:

```javascript
// .eslintrc.js
module.exports = {
  extends: ['airbnb-base'],
  env: {
    browser: true,
    webextensions: true,
    es2021: true
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'max-len': ['error', { code: 100 }],
    'comma-dangle': ['error', 'never'],
    'import/prefer-default-export': 'off'
  }
};
```

### Commit Convention

We follow Conventional Commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test updates
- `chore:` Build/tooling changes

### Pull Request Process

1. **Update Documentation**
   - Add/update relevant docs
   - Update CHANGELOG.md

2. **Pass All Checks**
   - Linting: `npm run lint`
   - Tests: `npm test`
   - Build: `npm run build`

3. **Request Review**
   - Assign relevant reviewers
   - Respond to feedback promptly

### Release Process

1. **Version Bump**
   ```bash
   npm version patch|minor|major
   ```

2. **Update Changelog**
   - Document all changes
   - Credit contributors

3. **Create Release**
   ```bash
   npm run release
   ```

4. **Deploy to Stores**
   - Upload to Chrome Web Store
   - Submit to Firefox Add-ons
   - Update Edge Add-ons

---

*For more information, see [CONTRIBUTING.md](./CONTRIBUTING.md)*