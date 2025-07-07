# ProductAdoption Extension User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Installation](#installation)
3. [First-Time Setup](#first-time-setup)
4. [Creating Your First Tour](#creating-your-first-tour)
5. [Advanced Features](#advanced-features)
6. [Keyboard Shortcuts](#keyboard-shortcuts)
7. [Settings and Preferences](#settings-and-preferences)
8. [Tips and Best Practices](#tips-and-best-practices)
9. [Frequently Asked Questions](#frequently-asked-questions)

## Getting Started

Welcome to ProductAdoption Extension! This powerful tool allows you to create interactive product tours directly in your browser without any coding knowledge. Whether you're onboarding new users, showcasing features, or guiding customers through complex workflows, ProductAdoption makes it simple and intuitive.

### What You Can Do

- **Create Interactive Tours**: Point and click on any element to create step-by-step guides
- **Preview in Real-Time**: See exactly how your tour will look to users
- **Customize Appearance**: Choose from various themes and positioning options
- **Add Rich Content**: Include text, images, and buttons in your tour steps
- **Manage Multiple Tours**: Organize tours for different pages and user segments
- **Track Analytics**: Monitor tour completion rates and user engagement

## Installation

### From Browser Stores

#### Chrome Web Store
1. Visit the [Chrome Web Store](https://chrome.google.com/webstore)
2. Search for "ProductAdoption Tour Creator"
3. Click "Add to Chrome"
4. Confirm by clicking "Add Extension"

#### Microsoft Edge Add-ons
1. Open the [Edge Add-ons store](https://microsoftedge.microsoft.com/addons)
2. Search for "ProductAdoption Tour Creator"
3. Click "Get"
4. Click "Add Extension" when prompted

#### Firefox Add-ons
1. Go to [Firefox Add-ons](https://addons.mozilla.org)
2. Search for "ProductAdoption Tour Creator"
3. Click "Add to Firefox"
4. Click "Add" when prompted

### Manual Installation (Advanced Users)

1. Download the extension package from [productadoption.com/download](https://productadoption.com/download)
2. Extract the ZIP file to a folder
3. Open your browser's extension management page:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Firefox: `about:addons`
4. Enable "Developer mode" (Chrome/Edge only)
5. Click "Load unpacked" and select the extracted folder

## First-Time Setup

### 1. Pin the Extension

After installation, pin the extension for easy access:
- Click the puzzle piece icon in your browser toolbar
- Find "ProductAdoption Tour Creator"
- Click the pin icon to keep it visible

### 2. Connect Your Account

1. Click the ProductAdoption extension icon
2. Click "Connect Account"
3. You'll be redirected to ProductAdoption's secure login page
4. Enter your credentials or sign up for a new account
5. Authorize the extension to access your account
6. You'll be redirected back to your browser

### 3. Configure Initial Settings

1. Click the extension icon
2. Go to "Settings"
3. Configure your preferences:
   - Default tour theme
   - Keyboard shortcuts
   - Auto-save frequency
   - Notification preferences

## Creating Your First Tour

### Step 1: Navigate to Your Target Page

Open the website or web application where you want to create a tour. The extension works on any website you have access to.

### Step 2: Start Tour Creation

1. Click the ProductAdoption extension icon
2. Click "Create New Tour"
3. Enter a name for your tour (e.g., "User Onboarding")
4. Click "Start Creating"

### Step 3: Add Tour Steps

1. **Select Elements**: Hover over page elements - they'll be highlighted with a blue outline
2. **Click to Add**: Click any element to add it as a tour step
3. **Configure Step**: A panel will appear where you can:
   - Add a title (required)
   - Write description text
   - Choose positioning (top, bottom, left, right)
   - Add action buttons (Next, Skip, Custom)
   - Set step behavior (auto-advance, require action)

### Step 4: Preview Your Tour

1. Click the "Preview" button in the extension panel
2. The tour will start from the beginning
3. Navigate through steps to ensure everything works correctly
4. Click "Exit Preview" to return to editing

### Step 5: Save and Publish

1. Click "Save Tour" to save your progress
2. Choose whether to:
   - **Save as Draft**: Keep working on it later
   - **Publish**: Make it available immediately
3. Configure tour triggers:
   - Page load
   - Button click
   - Custom event

## Advanced Features

### Element Selection Strategies

#### Smart Selection
The extension automatically generates the most reliable CSS selector for each element. However, you can customize this:

1. **ID-based**: Best for elements with unique IDs
2. **Class-based**: Good for repeated elements
3. **Data attributes**: Ideal for dynamic content
4. **XPath**: For complex selections

To change selector strategy:
1. Right-click on a selected element
2. Choose "Customize Selector"
3. Pick your preferred method

### Multi-Page Tours

Create tours that span multiple pages:

1. Create steps on the first page
2. Add a step with "Navigate to Page" action
3. The extension will wait for navigation
4. Continue adding steps on the new page

### Conditional Steps

Show steps based on user actions or page state:

1. Click "Add Condition" on any step
2. Choose condition type:
   - Element exists
   - Element contains text
   - URL matches pattern
   - Custom JavaScript

### Tour Templates

Save time with reusable templates:

1. Go to "Templates" in the extension
2. Choose from pre-built templates or create your own
3. Customize for your specific needs

### Branching Tours

Create different paths based on user choices:

1. Add a step with multiple action buttons
2. For each button, set "Next Step" to different branches
3. Users will follow different paths based on their selection

## Keyboard Shortcuts

Default shortcuts (customizable in settings):

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Toggle Extension | `Ctrl+Shift+T` | `⌘+Shift+T` |
| Create New Tour | `Ctrl+N` | `⌘+N` |
| Save Current Tour | `Ctrl+S` | `⌘+S` |
| Preview Tour | `Ctrl+P` | `⌘+P` |
| Add New Step | `Ctrl+Enter` | `⌘+Enter` |
| Delete Current Step | `Delete` | `Delete` |
| Duplicate Step | `Ctrl+D` | `⌘+D` |
| Move Step Up | `Ctrl+↑` | `⌘+↑` |
| Move Step Down | `Ctrl+↓` | `⌘+↓` |
| Exit Tour Creator | `Esc` | `Esc` |

### Customizing Shortcuts

1. Click the extension icon
2. Go to Settings → Keyboard Shortcuts
3. Click on any shortcut to change it
4. Press your desired key combination
5. Click "Save"

## Settings and Preferences

### General Settings

- **Theme**: Choose between light, dark, or auto theme
- **Language**: Select your preferred language
- **Auto-save**: Set frequency (every 30s, 1m, 5m, or manual)
- **Notifications**: Enable/disable success and error notifications

### Tour Defaults

- **Step Animation**: Fade, slide, or none
- **Highlight Style**: Solid, dashed, or pulsing
- **Overlay Opacity**: 0-100% darkness
- **Default Position**: Where tooltips appear by default
- **Button Style**: Primary, secondary, or custom CSS

### Advanced Settings

- **Developer Mode**: Show technical details and selectors
- **Console Logging**: Enable debug output
- **Performance Mode**: Optimize for slower computers
- **Accessibility**: High contrast and screen reader support

### Account Settings

- **API Endpoint**: For self-hosted installations
- **Sync Frequency**: How often to sync with cloud
- **Data Retention**: How long to keep tour analytics
- **Export Data**: Download all your tours and settings

## Tips and Best Practices

### Creating Effective Tours

1. **Keep It Short**: Aim for 3-7 steps per tour
2. **Clear Titles**: Use action-oriented language ("Click here to...")
3. **Progressive Disclosure**: Don't overwhelm users with information
4. **Visual Hierarchy**: Use formatting to highlight important info
5. **Test Thoroughly**: Preview on different screen sizes

### Performance Optimization

1. **Minimize Images**: Use compressed images in tour steps
2. **Lazy Loading**: Enable for tours with many steps
3. **Cache Tours**: Enable local caching for faster loading
4. **Clean Selectors**: Use simple, specific selectors

### Accessibility Considerations

1. **Alt Text**: Add descriptions for visual elements
2. **Keyboard Navigation**: Ensure all steps are keyboard accessible
3. **Screen Readers**: Test with screen reader software
4. **Color Contrast**: Maintain WCAG AA compliance

### Common Pitfalls to Avoid

1. **Dynamic Content**: Avoid selecting elements that change frequently
2. **Timing Issues**: Add delays for loading content
3. **Mobile Compatibility**: Test on mobile devices
4. **Browser Differences**: Verify tours work across browsers

## Frequently Asked Questions

### General Questions

**Q: Can I use ProductAdoption on any website?**
A: Yes, the extension works on any website you can access in your browser. However, some sites with strict security policies may require additional configuration.

**Q: How many tours can I create?**
A: The number of tours depends on your subscription plan. Free accounts can create up to 3 tours, while paid plans offer unlimited tours.

**Q: Can multiple team members collaborate on tours?**
A: Yes, with a team account, multiple users can create and edit tours. Changes sync in real-time.

### Technical Questions

**Q: Why can't I select certain elements?**
A: Some elements may be:
- Inside iframes (requires additional permissions)
- Dynamically loaded (add a wait condition)
- Covered by other elements (check z-index)

**Q: How do I handle single-page applications (SPAs)?**
A: Enable "SPA Mode" in settings. This uses mutation observers to detect page changes without full reloads.

**Q: Can I export tours for backup?**
A: Yes, go to Settings → Export/Import to download all tours as JSON files.

### Troubleshooting Questions

**Q: The extension icon is grayed out. What's wrong?**
A: This usually means:
- You're on a restricted page (chrome://, about:, etc.)
- The extension needs to be reloaded
- Your session has expired (re-authenticate)

**Q: Tours aren't showing up for my users. Help!**
A: Check:
1. Tour is published (not in draft mode)
2. Trigger conditions are met
3. User segment matches tour targeting
4. No JavaScript errors in console

**Q: How do I report a bug?**
A: Click the extension icon → Help → Report Issue. Include:
- Browser and version
- Steps to reproduce
- Screenshots if possible
- Console error messages

### Privacy and Security Questions

**Q: What data does the extension collect?**
A: We collect:
- Tour creation and edit data
- Anonymous usage statistics
- Error logs for debugging
We never collect personal browsing history or sensitive information.

**Q: Is my tour data encrypted?**
A: Yes, all data is encrypted in transit (HTTPS) and at rest (AES-256).

**Q: Can I use ProductAdoption for internal tools?**
A: Yes, the extension works with internal tools. For additional security, consider our on-premise deployment option.

## Need More Help?

- **Documentation**: [docs.productadoption.com](https://docs.productadoption.com)
- **Video Tutorials**: [youtube.com/productadoption](https://youtube.com/productadoption)
- **Community Forum**: [community.productadoption.com](https://community.productadoption.com)
- **Email Support**: support@productadoption.com
- **Live Chat**: Available in the extension (Premium plans)

---

*Last updated: January 2024 | Version 1.0.0*