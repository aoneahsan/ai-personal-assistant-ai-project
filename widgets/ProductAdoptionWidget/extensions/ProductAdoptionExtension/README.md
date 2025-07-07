# ProductAdoption Browser Extension

A powerful browser extension that allows users to create interactive product tours visually for the ProductAdoption platform.

## Features

- 🎯 **Visual Tour Creation**: Point and click to create tours without coding
- 👁️ **Live Preview**: See your tours in action as you build them
- 🔄 **Real-time Sync**: Automatic synchronization with ProductAdoption platform
- 🎨 **Element Picker**: Smart element selection with CSS selector generation
- 📊 **Tour Management**: Create, edit, and organize tours from the extension
- 🔐 **Secure Authentication**: OAuth2-based authentication with the platform
- ⌨️ **Keyboard Shortcuts**: Customizable shortcuts for power users
- 🌐 **Cross-browser Support**: Works on Chrome, Edge, Firefox, and more

## Installation

### For Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate placeholder icons:
   ```bash
   node scripts/generate-icons.js
   ```

4. Build the extension:
   ```bash
   npm run build
   ```

5. Load the extension in your browser:
   - **Chrome/Edge**: 
     1. Go to `chrome://extensions/` or `edge://extensions/`
     2. Enable "Developer mode"
     3. Click "Load unpacked"
     4. Select the `build` directory
   
   - **Firefox**:
     1. Go to `about:debugging`
     2. Click "This Firefox"
     3. Click "Load Temporary Add-on"
     4. Select any file in the `build` directory

### For Production

Download from:
- [Chrome Web Store](#) (Coming soon)
- [Microsoft Edge Add-ons](#) (Coming soon)
- [Firefox Add-ons](#) (Coming soon)

## Usage

### Creating a Tour

1. Click the ProductAdoption extension icon
2. Connect your ProductAdoption account (first time only)
3. Navigate to the page where you want to create a tour
4. Click "Create New Tour"
5. Click on elements to add them as tour steps
6. Add title and description for each step
7. Preview your tour
8. Save when complete

### Editing Tours

1. Click the extension icon
2. Select "Edit Existing Tour"
3. Choose a tour from your list
4. Make your changes
5. Save the updated tour

### Keyboard Shortcuts

Default shortcuts (customizable in settings):
- `Ctrl+Shift+T`: Toggle tour creator
- `Ctrl+S`: Save current step
- `Ctrl+P`: Preview tour

## Development

### Project Structure

```
ProductAdoptionExtension/
├── src/
│   ├── background/      # Service worker scripts
│   ├── content/         # Content scripts
│   ├── popup/          # Extension popup UI
│   ├── options/        # Settings page
│   └── shared/         # Shared utilities
├── public/             # Static assets
├── scripts/            # Build scripts
├── manifest.json       # Extension manifest
└── webpack.config.js   # Build configuration
```

### Building

```bash
# Development build with watch
npm run dev

# Production build
npm run build

# Build for specific browsers
npm run build:chrome
npm run build:firefox
npm run build:edge
```

### Testing

```bash
# Run tests
npm test

# Run linter
npm run lint
```

## API Integration

The extension communicates with the ProductAdoption API at:
- Production: `https://api.productadoption.com/v1`
- Development: Configure in settings

### Authentication Flow

1. User clicks "Connect Account"
2. Extension opens ProductAdoption auth page
3. User authorizes the extension
4. Auth token is securely stored
5. All API requests include the auth token

### Tour Data Format

```javascript
{
  id: "tour_123",
  name: "Getting Started Tour",
  steps: [
    {
      id: "step_1",
      target: "#welcome-button",
      title: "Welcome!",
      content: "Click here to get started",
      position: "bottom"
    }
  ],
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z"
}
```

## Publishing

### Chrome Web Store

1. Build for Chrome: `npm run build:chrome`
2. Upload `dist/productadoption-chrome-1.0.0.zip`
3. Fill in store listing details
4. Submit for review

### Microsoft Edge Add-ons

1. Build for Edge: `npm run build:edge`
2. Upload `dist/productadoption-edge-1.0.0.zip`
3. Complete certification process

### Firefox Add-ons

1. Build for Firefox: `npm run build:firefox`
2. Upload `dist/productadoption-firefox-1.0.0.zip`
3. Submit for review

## Security

- All data is transmitted over HTTPS
- OAuth2 tokens are stored securely
- Content Security Policy enforced
- No external dependencies in production
- Regular security audits

## Privacy

The extension:
- Only accesses pages when actively creating tours
- Doesn't collect browsing history
- Stores tour data on ProductAdoption servers
- Respects user privacy settings

See [Privacy Policy](https://productadoption.com/privacy) for details.

## Support

- Documentation: https://docs.productadoption.com/extension
- Email: support@productadoption.com
- Issues: [GitHub Issues](#)

## License

Copyright (c) 2024 ProductAdoption. All rights reserved.

This extension is proprietary software. See LICENSE file for details.