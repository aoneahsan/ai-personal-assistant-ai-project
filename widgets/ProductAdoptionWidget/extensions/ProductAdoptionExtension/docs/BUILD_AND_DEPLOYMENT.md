# Build and Deployment Documentation

## Table of Contents
1. [Overview](#overview)
2. [Development Environment](#development-environment)
3. [Build Process](#build-process)
4. [Testing](#testing)
5. [Deployment](#deployment)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Release Management](#release-management)
8. [Monitoring](#monitoring)
9. [Rollback Procedures](#rollback-procedures)
10. [Security Considerations](#security-considerations)

## Overview

This document provides comprehensive instructions for building and deploying the ProductAdoption browser extension across multiple platforms.

### Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Source Code   │────▶│  Build Process  │────▶│  Distribution   │
│   (Git Repo)    │     │   (Webpack)     │     │   (Stores)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                        │
         │                       │                        │
    ┌────▼─────┐          ┌─────▼─────┐          ┌──────▼──────┐
    │   Dev    │          │   Test    │          │ Production  │
    │  Branch  │          │  Builds   │          │  Releases   │
    └──────────┘          └───────────┘          └─────────────┘
```

## Development Environment

### Prerequisites

```bash
# Required versions
Node.js: 16.x or higher
npm: 8.x or higher
Git: 2.x or higher

# Optional but recommended
Docker: 20.x or higher
VS Code with extensions:
  - ESLint
  - Prettier
  - Chrome Debugger
```

### Initial Setup

```bash
# Clone repository
git clone https://github.com/productadoption/browser-extension.git
cd browser-extension

# Install dependencies
npm install

# Setup environment
cp .env.example .env.development
cp .env.example .env.production

# Generate development certificates (for HTTPS testing)
npm run generate-certs
```

### Environment Configuration

#### .env.development
```env
# API Configuration
PRODUCTADOPTION_API_URL=http://localhost:3000/api/v1
PRODUCTADOPTION_APP_URL=http://localhost:3001
PRODUCTADOPTION_WS_URL=ws://localhost:3000

# OAuth Configuration
PRODUCTADOPTION_CLIENT_ID=dev_client_id
PRODUCTADOPTION_OAUTH_REDIRECT=http://localhost:3001/oauth/callback

# Feature Flags
ENABLE_DEBUG_MODE=true
ENABLE_ANALYTICS=false
ENABLE_ERROR_REPORTING=false

# Build Configuration
SOURCE_MAPS=true
MINIMIZE_CODE=false
```

#### .env.production
```env
# API Configuration
PRODUCTADOPTION_API_URL=https://api.productadoption.com/v1
PRODUCTADOPTION_APP_URL=https://app.productadoption.com
PRODUCTADOPTION_WS_URL=wss://api.productadoption.com

# OAuth Configuration
PRODUCTADOPTION_CLIENT_ID=prod_client_id
PRODUCTADOPTION_OAUTH_REDIRECT=https://app.productadoption.com/oauth/callback

# Feature Flags
ENABLE_DEBUG_MODE=false
ENABLE_ANALYTICS=true
ENABLE_ERROR_REPORTING=true

# Build Configuration
SOURCE_MAPS=false
MINIMIZE_CODE=true
```

## Build Process

### Development Build

```bash
# Start development server with hot reload
npm run dev

# Build development version (no watch)
npm run build:dev

# Build with specific environment
NODE_ENV=development npm run build
```

#### Development Features
- Source maps enabled
- Hot module replacement
- Verbose logging
- Mock data available
- Debug panel enabled

### Production Build

```bash
# Build for all platforms
npm run build

# Platform-specific builds
npm run build:chrome
npm run build:firefox
npm run build:edge

# Build with version bump
npm version patch && npm run build
```

#### Production Optimizations
- Code minification
- Tree shaking
- Dead code elimination
- Asset optimization
- Source maps removed

### Build Configuration

#### webpack.config.js
```javascript
const webpack = require('webpack');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const platform = env.platform || 'chrome';

  return {
    mode: argv.mode,
    devtool: isProduction ? false : 'cheap-module-source-map',
    
    entry: {
      background: './src/background/background.js',
      content: './src/content/content.js',
      popup: './src/popup/popup.js',
      options: './src/options/options.js',
    },
    
    output: {
      path: path.resolve(__dirname, `build/${platform}`),
      filename: '[name].js',
      clean: true
    },
    
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: ['@babel/plugin-transform-runtime']
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader'
          ]
        },
        {
          test: /\.(png|jpg|gif|svg)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name][ext]'
          }
        }
      ]
    },
    
    plugins: [
      new CleanWebpackPlugin(),
      
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(process.env)
      }),
      
      new CopyPlugin({
        patterns: [
          {
            from: 'manifest.json',
            to: 'manifest.json',
            transform(content) {
              const manifest = JSON.parse(content);
              
              // Platform-specific modifications
              if (platform === 'firefox') {
                manifest.browser_specific_settings = {
                  gecko: {
                    id: 'extension@productadoption.com',
                    strict_min_version: '109.0'
                  }
                };
              }
              
              return JSON.stringify(manifest, null, 2);
            }
          },
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
            compress: {
              drop_console: true,
              drop_debugger: true
            }
          }
        })
      ] : [])
    ],
    
    optimization: {
      minimize: isProduction,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            priority: 10
          }
        }
      }
    }
  };
};
```

### Build Scripts

#### scripts/build.js
```javascript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const platforms = ['chrome', 'firefox', 'edge'];

async function build() {
  console.log('🏗️  Starting build process...\n');
  
  // Clean previous builds
  console.log('🧹 Cleaning previous builds...');
  execSync('rm -rf build dist', { stdio: 'inherit' });
  
  // Run tests
  console.log('\n🧪 Running tests...');
  execSync('npm test', { stdio: 'inherit' });
  
  // Build for each platform
  for (const platform of platforms) {
    console.log(`\n📦 Building for ${platform}...`);
    
    execSync(
      `webpack --mode production --env platform=${platform}`,
      { stdio: 'inherit' }
    );
    
    // Create distributable package
    console.log(`📋 Packaging ${platform}...`);
    execSync(
      `cd build/${platform} && zip -r ../../dist/productadoption-${platform}-${version}.zip .`,
      { stdio: 'inherit' }
    );
  }
  
  console.log('\n✅ Build complete! Packages available in dist/');
}

build().catch(console.error);
```

## Testing

### Unit Testing

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=selector-generator
```

#### Test Configuration (jest.config.js)
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/vendor/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Integration Testing

```bash
# Run integration tests
npm run test:integration

# Run with specific browser
BROWSER=firefox npm run test:integration
```

#### Integration Test Example
```javascript
// tests/integration/tour-creation.test.js
const puppeteer = require('puppeteer');

describe('Tour Creation Integration', () => {
  let browser;
  let page;
  
  beforeAll(async () => {
    const extensionPath = path.join(__dirname, '../../build/chrome');
    browser = await puppeteer.launch({
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`
      ]
    });
  });
  
  test('creates tour successfully', async () => {
    page = await browser.newPage();
    await page.goto('https://example.com');
    
    // Trigger extension
    await page.evaluate(() => {
      window.postMessage({ type: 'START_TOUR_CREATION' }, '*');
    });
    
    // Wait for UI
    await page.waitForSelector('.tour-creator-ui');
    
    // Create tour steps...
  });
});
```

### End-to-End Testing

```bash
# Run E2E tests
npm run test:e2e

# Run against staging
ENVIRONMENT=staging npm run test:e2e

# Run specific suite
npm run test:e2e -- --grep "tour creation"
```

### Performance Testing

```javascript
// tests/performance/load-time.test.js
describe('Extension Performance', () => {
  test('loads within acceptable time', async () => {
    const startTime = performance.now();
    
    await loadExtension();
    
    const loadTime = performance.now() - startTime;
    expect(loadTime).toBeLessThan(1000); // 1 second
  });
  
  test('memory usage stays below threshold', async () => {
    const initialMemory = await getMemoryUsage();
    
    // Perform operations
    await createMultipleTours(10);
    
    const finalMemory = await getMemoryUsage();
    const increase = finalMemory - initialMemory;
    
    expect(increase).toBeLessThan(50 * 1024 * 1024); // 50MB
  });
});
```

## Deployment

### Pre-Deployment Checklist

```markdown
## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing
- [ ] Code coverage > 80%
- [ ] No linting errors
- [ ] Security audit passed
- [ ] Performance benchmarks met

### Version Management
- [ ] Version bumped appropriately
- [ ] CHANGELOG.md updated
- [ ] Migration guide prepared (if needed)
- [ ] Breaking changes documented

### Documentation
- [ ] API documentation updated
- [ ] User guide updated
- [ ] README.md current
- [ ] Release notes prepared

### Testing
- [ ] Manual testing completed
- [ ] Cross-browser testing done
- [ ] Regression testing passed
- [ ] Performance testing passed
- [ ] Security testing completed

### Approval
- [ ] Code review approved
- [ ] QA sign-off received
- [ ] Product owner approval
- [ ] Security team approval
```

### Deployment Process

#### 1. Staging Deployment

```bash
# Build staging version
NODE_ENV=staging npm run build

# Deploy to staging environment
npm run deploy:staging

# Run smoke tests
npm run test:smoke -- --env=staging

# Manual verification checklist
# - [ ] Extension installs correctly
# - [ ] Authentication works
# - [ ] Tours can be created
# - [ ] Tours display properly
# - [ ] Analytics tracking works
```

#### 2. Production Deployment

```bash
# Create release branch
git checkout -b release/v1.2.3

# Build production versions
npm run build:all

# Create release tags
git tag -a v1.2.3 -m "Release version 1.2.3"
git push origin v1.2.3

# Upload to stores
npm run deploy:chrome
npm run deploy:firefox
npm run deploy:edge
```

### Store Deployment

#### Chrome Web Store
```bash
# Package for Chrome
npm run package:chrome

# Upload via API
curl -X PUT \
  -H "Authorization: Bearer $CHROME_ACCESS_TOKEN" \
  -H "x-goog-api-version: 2" \
  -T dist/productadoption-chrome-1.2.3.zip \
  https://www.googleapis.com/upload/chromewebstore/v1.1/items/$CHROME_APP_ID

# Publish
curl -X POST \
  -H "Authorization: Bearer $CHROME_ACCESS_TOKEN" \
  -H "x-goog-api-version: 2" \
  https://www.googleapis.com/chromewebstore/v1.1/items/$CHROME_APP_ID/publish
```

#### Firefox Add-ons
```bash
# Sign and upload
web-ext sign \
  --api-key=$AMO_JWT_ISSUER \
  --api-secret=$AMO_JWT_SECRET \
  --channel=listed
```

#### Microsoft Edge
```bash
# Package and upload via Partner Center API
npm run deploy:edge
```

## CI/CD Pipeline

### GitHub Actions Workflow

#### .github/workflows/build-and-test.yml
```yaml
name: Build and Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16.x, 18.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Run tests
      run: npm test -- --coverage
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
    
    - name: Build extension
      run: npm run build:all
    
    - name: Archive artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build-artifacts
        path: dist/

  security:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Run security audit
      run: npm audit --production
    
    - name: Run OWASP dependency check
      uses: dependency-check/Dependency-Check_Action@main
      with:
        project: 'ProductAdoption Extension'
        path: '.'
        format: 'HTML'
```

#### .github/workflows/release.yml
```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18.x'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build all platforms
      run: npm run build:all
    
    - name: Create Release
      id: create_release
      uses: actions/create-release@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        tag_name: ${{ github.ref }}
        release_name: Release ${{ github.ref }}
        body_path: RELEASE_NOTES.md
        draft: false
        prerelease: false
    
    - name: Upload Chrome Package
      uses: actions/upload-release-asset@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        upload_url: ${{ steps.create_release.outputs.upload_url }}
        asset_path: ./dist/productadoption-chrome-${{ github.ref_name }}.zip
        asset_name: productadoption-chrome-${{ github.ref_name }}.zip
        asset_content_type: application/zip
    
    - name: Deploy to Chrome Web Store
      env:
        CHROME_CLIENT_ID: ${{ secrets.CHROME_CLIENT_ID }}
        CHROME_CLIENT_SECRET: ${{ secrets.CHROME_CLIENT_SECRET }}
        CHROME_REFRESH_TOKEN: ${{ secrets.CHROME_REFRESH_TOKEN }}
      run: npm run deploy:chrome
    
    - name: Deploy to Firefox
      env:
        AMO_JWT_ISSUER: ${{ secrets.AMO_JWT_ISSUER }}
        AMO_JWT_SECRET: ${{ secrets.AMO_JWT_SECRET }}
      run: npm run deploy:firefox
```

### Jenkins Pipeline (Alternative)

```groovy
pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18.x'
        SLACK_CHANNEL = '#deployments'
    }
    
    stages {
        stage('Setup') {
            steps {
                nodejs(nodeJSInstallationName: "node-${NODE_VERSION}") {
                    sh 'npm ci'
                }
            }
        }
        
        stage('Test') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        sh 'npm run test:unit'
                    }
                }
                
                stage('Integration Tests') {
                    steps {
                        sh 'npm run test:integration'
                    }
                }
                
                stage('Security Scan') {
                    steps {
                        sh 'npm audit --production'
                    }
                }
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build:all'
                archiveArtifacts artifacts: 'dist/**/*.zip'
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                sh 'npm run deploy:staging'
            }
        }
        
        stage('Deploy to Production') {
            when {
                tag pattern: "v\\d+\\.\\d+\\.\\d+", comparator: "REGEXP"
            }
            steps {
                input message: 'Deploy to production?'
                sh 'npm run deploy:production'
            }
        }
    }
    
    post {
        success {
            slackSend(
                channel: env.SLACK_CHANNEL,
                color: 'good',
                message: "Deployment successful: ${env.JOB_NAME} - ${env.BUILD_NUMBER}"
            )
        }
        
        failure {
            slackSend(
                channel: env.SLACK_CHANNEL,
                color: 'danger',
                message: "Deployment failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}"
            )
        }
    }
}
```

## Release Management

### Versioning Strategy

We follow Semantic Versioning (SemVer):
- **MAJOR.MINOR.PATCH** (e.g., 2.1.3)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Release Process

```bash
# 1. Create release branch
git checkout -b release/v2.1.0

# 2. Update version
npm version minor --no-git-tag-version

# 3. Update CHANGELOG.md
npm run changelog

# 4. Commit changes
git add .
git commit -m "chore: prepare release v2.1.0"

# 5. Create PR to main
gh pr create --title "Release v2.1.0" --body "Release notes..."

# 6. After merge, tag release
git checkout main
git pull
git tag -a v2.1.0 -m "Release v2.1.0"
git push origin v2.1.0
```

### Release Notes Template

```markdown
# Release Notes - v2.1.0

## 🎉 New Features
- Added dark mode support (#123)
- Implemented tour templates (#124)
- New analytics dashboard (#125)

## 🐛 Bug Fixes
- Fixed element selection on dynamic pages (#126)
- Resolved memory leak in tour renderer (#127)
- Corrected tooltip positioning (#128)

## 🔧 Improvements
- Optimized bundle size by 30%
- Improved tour loading speed
- Enhanced error messages

## 🚨 Breaking Changes
- Removed deprecated API endpoints
- Changed tour data structure

## 📦 Dependencies
- Updated webpack to v5.88.0
- Upgraded Chrome manifest to V3

## 🔄 Migration Guide
See [MIGRATION.md](./MIGRATION.md) for upgrade instructions.
```

### Hotfix Process

```bash
# 1. Create hotfix branch from production
git checkout -b hotfix/v2.1.1 v2.1.0

# 2. Fix issue
# ... make changes ...

# 3. Update version
npm version patch

# 4. Test thoroughly
npm test
npm run test:integration

# 5. Deploy directly to production
npm run deploy:production

# 6. Merge back to main and develop
git checkout main
git merge hotfix/v2.1.1
git checkout develop
git merge hotfix/v2.1.1
```

## Monitoring

### Application Monitoring

```javascript
// src/monitoring/reporter.js
class MonitoringReporter {
  constructor() {
    this.queue = [];
    this.batchSize = 10;
    this.flushInterval = 60000; // 1 minute
  }
  
  trackEvent(event, properties = {}) {
    this.queue.push({
      event,
      properties,
      timestamp: Date.now(),
      version: chrome.runtime.getManifest().version,
      browser: this.getBrowserInfo()
    });
    
    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }
  
  trackError(error, context = {}) {
    this.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      context,
      severity: this.getErrorSeverity(error)
    });
  }
  
  async flush() {
    if (this.queue.length === 0) return;
    
    const events = [...this.queue];
    this.queue = [];
    
    try {
      await fetch('https://api.productadoption.com/v1/telemetry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Extension-Version': chrome.runtime.getManifest().version
        },
        body: JSON.stringify({ events })
      });
    } catch (error) {
      // Re-queue events on failure
      this.queue.unshift(...events);
    }
  }
}
```

### Performance Monitoring

```javascript
// Monitor critical operations
performance.mark('tour-load-start');

// ... tour loading logic ...

performance.mark('tour-load-end');
performance.measure('tour-load', 'tour-load-start', 'tour-load-end');

const measure = performance.getEntriesByName('tour-load')[0];
if (measure.duration > 1000) {
  reporter.trackEvent('performance-warning', {
    operation: 'tour-load',
    duration: measure.duration
  });
}
```

### Error Tracking

```javascript
// Global error handler
window.addEventListener('error', (event) => {
  reporter.trackError(event.error, {
    url: event.filename,
    line: event.lineno,
    column: event.colno
  });
});

// Promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  reporter.trackError(new Error(event.reason), {
    type: 'unhandled-promise-rejection'
  });
});
```

### Health Checks

```javascript
// Periodic health check
setInterval(async () => {
  try {
    const health = await checkSystemHealth();
    
    if (!health.isHealthy) {
      reporter.trackEvent('health-check-failed', health);
    }
  } catch (error) {
    reporter.trackError(error, { context: 'health-check' });
  }
}, 300000); // 5 minutes
```

## Rollback Procedures

### Immediate Rollback

```bash
# 1. Identify issue
npm run monitor:errors -- --last-hour

# 2. Confirm rollback decision
./scripts/confirm-rollback.sh

# 3. Revert to previous version
npm run rollback:chrome -- --version=2.0.9
npm run rollback:firefox -- --version=2.0.9
npm run rollback:edge -- --version=2.0.9

# 4. Notify users
npm run notify:users -- --message="Temporary rollback"
```

### Rollback Script

```javascript
// scripts/rollback.js
const { execSync } = require('child_process');

async function rollback(platform, version) {
  console.log(`🔄 Rolling back ${platform} to v${version}`);
  
  // Download previous version
  const packageUrl = `https://releases.productadoption.com/${platform}/v${version}.zip`;
  execSync(`curl -O ${packageUrl}`);
  
  // Deploy based on platform
  switch (platform) {
    case 'chrome':
      await rollbackChrome(version);
      break;
    case 'firefox':
      await rollbackFirefox(version);
      break;
    case 'edge':
      await rollbackEdge(version);
      break;
  }
  
  // Notify monitoring
  await notifyRollback(platform, version);
}

async function rollbackChrome(version) {
  // Use Chrome Web Store API to upload previous version
  const response = await fetch(
    `https://www.googleapis.com/chromewebstore/v1.1/items/${CHROME_APP_ID}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${CHROME_ACCESS_TOKEN}`,
        'x-goog-api-version': '2'
      },
      body: fs.createReadStream(`v${version}.zip`)
    }
  );
  
  if (!response.ok) {
    throw new Error('Chrome rollback failed');
  }
}
```

### Rollback Verification

```bash
# Verify rollback success
npm run verify:rollback

# Check user reports
npm run monitor:feedback -- --after-rollback

# Monitor error rates
npm run monitor:errors -- --compare-versions
```

## Security Considerations

### Secure Build Process

```yaml
# .github/workflows/security.yml
name: Security Checks

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'
        format: 'sarif'
        output: 'trivy-results.sarif'
    
    - name: Upload results to GitHub Security
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'
    
    - name: Check for secrets
      uses: trufflesecurity/trufflehog@main
      with:
        path: ./
        base: ${{ github.event.repository.default_branch }}
        head: HEAD
```

### Code Signing

```bash
# Sign extension packages
openssl dgst -sha256 -sign private-key.pem -out signature.sig package.zip

# Verify signature
openssl dgst -sha256 -verify public-key.pem -signature signature.sig package.zip
```

### Secure Storage of Secrets

```javascript
// Use environment variables, never hardcode
const config = {
  apiKey: process.env.PRODUCTADOPTION_API_KEY,
  clientSecret: process.env.PRODUCTADOPTION_CLIENT_SECRET
};

// Validate environment
if (!config.apiKey || !config.clientSecret) {
  throw new Error('Missing required environment variables');
}
```

### Security Headers

```javascript
// Add security headers to all requests
const secureRequest = (url, options = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    }
  });
};
```

---

*For deployment support, contact: devops@productadoption.com*

*Last updated: January 2024*