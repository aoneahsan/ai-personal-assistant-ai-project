# Deployment Guide

## Overview

This project is configured for multiple environment deployments using Firebase Hosting with separate staging and production sites.

## Environment Setup

### 1. Create Environment Files

Copy the environment templates and fill in your values:

```bash
# For staging
cp env.staging .env.staging

# For production
cp env.production .env.production

# For local development
cp env-example .env.local
```

### 2. Fill Environment Variables

Update each `.env.*` file with appropriate values for each environment:

- **Staging**: Use staging/development API keys and endpoints
- **Production**: Use production API keys and endpoints
- **Local**: Use development/local API keys

## Firebase Hosting Sites

- **Production**: https://ai-personal-assistant-a1.web.app
- **Staging**: https://ai-personal-assistant-a1-staging.web.app

## Deployment Commands

### Quick Deploy (Current Environment)

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production

# Legacy deploy (production)
npm run deploy:web
```

### Manual Steps

```bash
# Build for specific environment
npm run build:staging    # Uses .env.staging
npm run build:production # Uses .env.production

# Deploy to specific target
firebase deploy --only hosting:staging
firebase deploy --only hosting:production
```

### Local Development

```bash
npm run dev  # Uses .env.local
```

## Environment Variables

### Required Variables

- `VITE_FIREBASE_*` - Firebase configuration
- `VITE_SENTRY_ENVIRONMENT` - Set to "staging" or "production"
- `VITE_GOOGLE_*` - Google authentication
- `VITE_SOCKET_IO_SERVER_URL` - Backend API URL

### Optional Variables

- `VITE_ONE_SIGNAL_APP_ID` - Push notifications
- `VITE_AMPLITUDE_API_KEY` - Analytics
- `VITE_TOLGEE_*` - Internationalization

## Deployment Checklist

### Before Deploying to Staging

- [ ] Update `.env.staging` with correct values
- [ ] Test locally with staging configuration
- [ ] Ensure all features work with staging APIs

### Before Deploying to Production

- [ ] Test thoroughly on staging
- [ ] Update `.env.production` with production values
- [ ] Review Firebase security rules
- [ ] Check performance metrics
- [ ] Backup current production if needed

## Troubleshooting

### Common Issues

1. **Environment variables not loading**: Ensure file is named correctly (`.env.staging`, `.env.production`)
2. **Firebase deployment fails**: Check if you're logged in with `firebase login`
3. **Build fails**: Check for TypeScript errors and missing dependencies

### Useful Commands

```bash
# Check Firebase login status
firebase login

# List Firebase projects
firebase projects:list

# Check hosting targets
firebase target

# View hosting sites
firebase hosting:sites:list
```

## Security Notes

- Never commit `.env.*` files to git
- Use different API keys for staging and production
- Regularly rotate sensitive keys
- Monitor usage and set up alerts

## CI/CD Integration

For automated deployments, consider setting up GitHub Actions or similar CI/CD:

```yaml
# Example GitHub Action
- name: Deploy to Staging
  run: npm run deploy:staging
  if: github.ref == 'refs/heads/develop'

- name: Deploy to Production
  run: npm run deploy:production
  if: github.ref == 'refs/heads/main'
```
