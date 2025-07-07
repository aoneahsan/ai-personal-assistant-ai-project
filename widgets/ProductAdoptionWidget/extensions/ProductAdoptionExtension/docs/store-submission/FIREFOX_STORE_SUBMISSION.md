# Firefox Add-ons Submission Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Developer Account Setup](#developer-account-setup)
3. [Prepare Your Extension](#prepare-your-extension)
4. [Add-on Listing Information](#add-on-listing-information)
5. [Screenshots and Media](#screenshots-and-media)
6. [Submission Process](#submission-process)
7. [Review Process](#review-process)
8. [Self-Distribution Option](#self-distribution-option)
9. [Post-Publication](#post-publication)
10. [Common Issues and Solutions](#common-issues-and-solutions)

## Prerequisites

Before submitting to Firefox Add-ons (AMO), ensure you have:

- [ ] A Firefox Account
- [ ] Completed extension package (`.zip` file)
- [ ] Extension tested in Firefox Developer Edition
- [ ] All required graphics and promotional materials
- [ ] Privacy policy (required for extensions handling user data)
- [ ] Extension ID (optional but recommended for updates)

## Developer Account Setup

### 1. Create Firefox Account

1. Go to [Firefox Accounts](https://accounts.firefox.com)
2. Sign up with email
3. Verify your email address
4. Complete profile information

### 2. Access Add-ons Developer Hub

1. Visit [Add-ons Developer Hub](https://addons.mozilla.org/developers/)
2. Sign in with Firefox Account
3. Accept Developer Agreement
4. Configure developer settings:
   - Display name: ProductAdoption Team
   - Homepage: https://productadoption.com
   - Support email: support@productadoption.com

## Prepare Your Extension

### 1. Firefox-Specific Modifications

Update `manifest.json` for Firefox compatibility:

```json
{
  "manifest_version": 3,
  "name": "ProductAdoption Tour Creator",
  "version": "1.0.0",
  "description": "Create interactive product tours visually with ProductAdoption platform",
  
  "browser_specific_settings": {
    "gecko": {
      "id": "tourextension@productadoption.com",
      "strict_min_version": "109.0"
    }
  },
  
  "permissions": [
    "activeTab",
    "storage",
    "tabs",
    "scripting"
  ],
  
  "host_permissions": [
    "https://*/*",
    "http://*/*"
  ],
  
  "background": {
    "scripts": ["background.js"],
    "type": "module"
  }
}
```

### 2. Build Firefox Package

```bash
# Build Firefox-specific version
npm run build:firefox

# Package location:
# dist/productadoption-firefox-1.0.0.zip
```

### 3. Test in Firefox

1. Open Firefox Developer Edition
2. Navigate to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select your extension's `manifest.json`
6. Test all functionality thoroughly

### 4. Run Compatibility Tests

```bash
# Install web-ext tool
npm install -g web-ext

# Lint your extension
web-ext lint --source-dir=build

# Run in Firefox
web-ext run --source-dir=build
```

## Add-on Listing Information

### Basic Information

**Add-on Name**
```
ProductAdoption Tour Creator
```

**Summary** (250 characters max)
```
Create interactive product tours visually. Point, click, and guide users through your web app with no coding required. Perfect for user onboarding and feature adoption.
```

**Description** (No limit, supports Markdown)
```markdown
# Transform User Onboarding with Visual Tour Creation

ProductAdoption Tour Creator is the easiest way to create interactive product tours for your web application. No coding required – just point, click, and create engaging user experiences that drive adoption and reduce support tickets.

## 🚀 Key Features

### Visual Tour Builder
- **Point and Click Interface**: Simply click on elements to add them to your tour
- **Real-time Preview**: See exactly how your tour will look as you build it
- **Smart Element Detection**: Automatically generates reliable CSS selectors
- **No Code Required**: Anyone on your team can create professional tours

### Powerful Tour Elements
- **Rich Tooltips**: Add formatted text, images, and buttons
- **Element Highlighting**: Draw attention to important features
- **Progress Indicators**: Show users how many steps remain
- **Conditional Logic**: Create dynamic tours based on user actions
- **Multi-page Support**: Tours that work across your entire application

### Advanced Capabilities
- **Custom Triggers**: Start tours on page load, button click, or custom events
- **User Segmentation**: Target specific user groups
- **A/B Testing**: Optimize tour effectiveness
- **Analytics**: Track completion rates and user engagement
- **Team Collaboration**: Work together on tour creation

## 💼 Perfect For

- **SaaS Companies**: Improve trial-to-paid conversion
- **Product Teams**: Announce and explain new features
- **Customer Success**: Reduce support tickets with self-service guides
- **Training Teams**: Create interactive learning experiences
- **Marketing**: Increase feature discovery and adoption

## 🛠️ How It Works

1. **Install the Extension**: Add ProductAdoption to Firefox
2. **Connect Your Account**: Sign in or create a free account
3. **Navigate to Your App**: Go to any page where you want to create a tour
4. **Start Creating**: Click the extension icon and select "Create New Tour"
5. **Point and Click**: Click on elements to add them as tour steps
6. **Customize**: Add titles, descriptions, and configure behavior
7. **Publish**: Make your tour live instantly

## 🌟 Why ProductAdoption?

### No Technical Implementation Required
Unlike other solutions, ProductAdoption works on any website without requiring code changes. Your marketing team can create tours without waiting for developers.

### Powerful Yet Simple
Professional features in an interface anyone can use. Create complex, branching tours with conditional logic – all through visual tools.

### Built for Teams
Collaborate on tours, manage permissions, and maintain consistency across your product experience.

### Performance Focused
Lightweight implementation that doesn't slow down your application. Tours load instantly and work smoothly.

### Privacy First
We respect user privacy and comply with GDPR, CCPA, and other privacy regulations. No personal data is collected without consent.

## 📊 Proven Results

Companies using ProductAdoption report:
- 40% increase in feature adoption
- 60% reduction in onboarding support tickets
- 3x improvement in trial-to-paid conversion
- 50% faster time-to-value for new users

## 🔐 Security & Compliance

- **Data Encryption**: All data transmitted using industry-standard encryption
- **SOC 2 Compliant**: Annual security audits ensure data protection
- **GDPR Ready**: Full compliance with privacy regulations
- **Regular Updates**: Continuous security improvements
- **No Sensitive Data**: We never access passwords or personal information

## 💡 Use Cases

### User Onboarding
Create step-by-step guides for new users, highlighting key features and helping them achieve their first success.

### Feature Announcements
When launching new features, guide existing users through what's new and how to use it.

### Customer Support
Build self-service guides that help users solve common problems without contacting support.

### Sales Demos
Create interactive demos that prospects can experience on their own time.

### Employee Training
Onboard new employees with guided tours through internal tools and processes.

## 🎯 Getting Started

It takes less than 5 minutes to create your first tour:

1. Install ProductAdoption Tour Creator
2. Click the extension icon in your toolbar
3. Sign up for a free account (no credit card required)
4. Navigate to your application
5. Start creating amazing tours!

## 📚 Resources

- **Documentation**: Comprehensive guides at docs.productadoption.com
- **Video Tutorials**: Step-by-step videos on our YouTube channel
- **Templates**: Pre-built tour templates for common use cases
- **Community**: Join other ProductAdoption users in our forum
- **Support**: Email support@productadoption.com for help

## 💰 Pricing

- **Free Plan**: Up to 3 tours, 1,000 tour views/month
- **Starter**: $49/month - Unlimited tours, 10,000 views
- **Growth**: $149/month - Advanced features, 50,000 views
- **Enterprise**: Custom pricing for large teams

All plans include a 14-day free trial with full features.

## 🤝 About ProductAdoption

ProductAdoption is trusted by thousands of companies to improve their user experience. We're passionate about making software easier to use and helping businesses succeed through better onboarding.

Founded in 2020, we've helped companies create over 50,000 tours that have guided millions of users. Join us in making the web more user-friendly, one tour at a time.

---

**Website**: https://productadoption.com  
**Support**: support@productadoption.com  
**Privacy Policy**: https://productadoption.com/privacy  
**Terms of Service**: https://productadoption.com/terms
```

### Categories

Select all that apply:
- [x] Appearance
- [x] Bookmarks
- [x] Developer Tools
- [x] Other

### Tags

Add relevant tags (maximum 20):
- user-onboarding
- product-tours
- user-experience
- tooltips
- guides
- tutorials
- walkthrough
- feature-adoption
- customer-success
- saas-tools

### Support Information

**Support Email**: support@productadoption.com  
**Support URL**: https://docs.productadoption.com  
**Homepage**: https://productadoption.com

### Technical Information

**Extension ID**: tourextension@productadoption.com  
**Requires Restart**: No  
**E10s Compatible**: Yes  
**Firefox for Android**: Not supported (desktop only)

## Screenshots and Media

### Required Images

#### 1. Icon (Multiple Sizes)
Provide icons in these sizes:
- 48x48px - Toolbar icon
- 96x96px - Add-ons Manager
- 128x128px - AMO listing
- 512x512px - High-res displays

Format: PNG with transparency

#### 2. Screenshots (Minimum 1, Maximum 5)
Recommended size: 1280x800px or 1920x1080px

**Screenshot 1: Extension in Action**
- Show the tour creation interface
- Highlight active element selection
- Include Firefox UI for context

**Screenshot 2: Tour Preview**
- Display how tours appear to end users
- Show tooltip with navigation
- Include progress indicators

**Screenshot 3: Dashboard View**
- Analytics and tour management
- List of created tours
- Performance metrics

**Screenshot 4: Customization Options**
- Theme selection
- Positioning options
- Trigger configuration

**Screenshot 5: Multi-step Tour Example**
- Complex tour with multiple steps
- Show step navigation
- Highlight advanced features

### Additional Media

**Preview Image** (Optional)
- Size: 1280x800px
- Used for featured add-ons
- Eye-catching design with key features

**Video** (Optional)
- YouTube or Vimeo link
- 2-3 minutes recommended
- Show installation and basic usage

## Submission Process

### 1. Prepare Submission Package

Ensure you have:
- [x] Extension ZIP file
- [x] Source code (if using build tools)
- [x] Build instructions
- [x] All graphics ready
- [x] Listing information prepared

### 2. Submit to AMO

1. Go to [Add-on Developer Hub](https://addons.mozilla.org/developers/)
2. Click "Submit a New Add-on"
3. Choose "On this site" for AMO distribution
4. Upload your ZIP file
5. Wait for validation to complete

### 3. Complete Listing

Fill out all sections:
- Basic Information
- Description
- Categories and Tags
- Version Information
- Compatibility Information
- License Selection (choose appropriate license)

### 4. Add Media

Upload all images:
- Extension icons
- Screenshots
- Preview image (if applicable)

### 5. Submit for Review

1. Review all information
2. Accept Mozilla Add-on Distribution Agreement
3. Choose review option:
   - **Listed**: Public on AMO (recommended)
   - **Unlisted**: Self-distribution only
4. Submit for review

## Review Process

### Review Timeline

- **Initial Review**: 5-10 business days
- **Update Reviews**: 2-5 business days
- **Priority Review**: Available for critical security updates

### Review Types

#### 1. Automated Review
- Code scanning
- Manifest validation
- Security checks
- Performance analysis

#### 2. Manual Review
- Functionality testing
- Policy compliance
- User experience evaluation
- Privacy practices review

### Review Communication

- Email notifications for status updates
- Detailed feedback in Developer Hub
- Respond to reviewer comments promptly
- Request clarification if needed

### Common Review Feedback

1. **Security Issues**
   - Fix any identified vulnerabilities
   - Explain security measures taken
   - Update dependencies if needed

2. **Privacy Concerns**
   - Clarify data collection practices
   - Update privacy policy if needed
   - Minimize permissions requested

3. **Performance Problems**
   - Optimize resource usage
   - Fix memory leaks
   - Improve loading times

4. **User Experience**
   - Simplify complex workflows
   - Add clear instructions
   - Fix UI inconsistencies

## Self-Distribution Option

### When to Use Self-Distribution

Consider self-distribution for:
- Beta testing
- Internal enterprise use
- Rapid deployment needs
- Custom builds for specific clients

### Self-Distribution Process

1. **Sign Your Extension**
   ```bash
   web-ext sign --api-key=$AMO_JWT_ISSUER --api-secret=$AMO_JWT_SECRET
   ```

2. **Host XPI File**
   - Upload to your server
   - Serve with correct MIME type: `application/x-xpinstall`
   - Use HTTPS for hosting

3. **Installation Instructions**
   ```html
   <a href="https://yoursite.com/extension.xpi">Install ProductAdoption for Firefox</a>
   ```

### Update Mechanism

For self-distributed extensions:

1. **Add Update URL to Manifest**
   ```json
   "browser_specific_settings": {
     "gecko": {
       "update_url": "https://productadoption.com/firefox/updates.json"
     }
   }
   ```

2. **Host Update Manifest**
   ```json
   {
     "addons": {
       "tourextension@productadoption.com": {
         "updates": [
           {
             "version": "1.0.1",
             "update_link": "https://productadoption.com/firefox/productadoption-1.0.1.xpi"
           }
         ]
       }
     }
   }
   ```

## Post-Publication

### 1. Monitor Performance

Track key metrics:
- Daily Active Users (DAU)
- Installation rate
- Uninstall rate
- User ratings and reviews
- Crash reports

### 2. Respond to Reviews

Example responses:

**Positive Review Response**:
```
Thank you for the wonderful review! We're thrilled that ProductAdoption is helping you create better user experiences. If you have any feature requests, please let us know at support@productadoption.com.
```

**Negative Review Response**:
```
We're sorry to hear about your experience. We'd love to help resolve this issue. Please contact us at support@productadoption.com with more details so we can assist you directly.
```

### 3. Regular Updates

Update schedule:
- Bug fixes: As needed
- Feature updates: Monthly
- Security updates: Immediately
- Major versions: Quarterly

### 4. Version Numbering

Follow semantic versioning:
- `1.0.1` - Bug fixes
- `1.1.0` - New features
- `2.0.0` - Breaking changes

### 5. Update Process

1. Increment version in `manifest.json`
2. Update changelog
3. Build new package
4. Submit to AMO
5. Monitor review progress

## Common Issues and Solutions

### 1. Validation Errors

**Error**: "Permission 'tabs' requires justification"
```
Justification: The 'tabs' permission is used to detect when users navigate between pages during multi-page tour creation. We only access tab URLs to maintain tour context, never browsing history.
```

**Error**: "Unsafe innerHTML usage detected"
```javascript
// Replace innerHTML with safe alternatives
element.textContent = userContent; // For text
element.appendChild(sanitizedNode); // For HTML
```

### 2. Performance Issues

**Problem**: Slow extension startup
```javascript
// Implement lazy loading
browser.runtime.onInstalled.addListener(async () => {
  // Only load essentials
  await loadCoreModules();
  
  // Defer non-critical initialization
  setTimeout(() => loadSecondaryModules(), 1000);
});
```

### 3. Compatibility Issues

**Problem**: API differences from Chrome
```javascript
// Use browser namespace instead of chrome
const storage = browser.storage || chrome.storage;

// Handle promise vs callback APIs
function getStorage(key) {
  return new Promise((resolve) => {
    storage.local.get(key, (data) => {
      resolve(data[key]);
    });
  });
}
```

### 4. Content Security Policy

**Problem**: CSP violations
```javascript
// Avoid inline scripts
// Bad:
element.onclick = () => console.log('clicked');

// Good:
element.addEventListener('click', () => console.log('clicked'));
```

### 5. Memory Leaks

**Problem**: Extension uses too much memory
```javascript
// Clean up event listeners
class Component {
  constructor() {
    this.handleClick = this.handleClick.bind(this);
    document.addEventListener('click', this.handleClick);
  }
  
  destroy() {
    document.removeEventListener('click', this.handleClick);
  }
}
```

## Best Practices for Firefox

### Do's

- ✅ Use `browser.*` APIs for better compatibility
- ✅ Test in Firefox Developer Edition
- ✅ Support Firefox's privacy features
- ✅ Use web-ext for development
- ✅ Follow Mozilla's design guidelines
- ✅ Provide detailed permission justifications
- ✅ Support both Manifest V2 and V3 during transition

### Don'ts

- ❌ Don't use Chrome-specific APIs
- ❌ Don't assume callback-style APIs (use Promises)
- ❌ Don't use synchronous storage operations
- ❌ Don't ignore AMO reviewer feedback
- ❌ Don't bundle unnecessary libraries
- ❌ Don't use obfuscated code
- ❌ Don't track users without consent

## Resources

### Official Documentation
- [Extension Workshop](https://extensionworkshop.com/)
- [MDN Web Docs](https://developer.mozilla.org/docs/Mozilla/Add-ons)
- [AMO Policies](https://extensionworkshop.com/documentation/publish/add-on-policies/)

### Development Tools
- [web-ext](https://github.com/mozilla/web-ext)
- [Firefox Developer Edition](https://www.mozilla.org/firefox/developer/)
- [Browser Toolbox](https://developer.mozilla.org/docs/Tools/Browser_Toolbox)

### Support Channels
- [AMO Forum](https://discourse.mozilla.org/c/add-ons)
- [Matrix Chat](https://chat.mozilla.org/#/room/#addons:mozilla.org)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firefox-addon)

---

*Last updated: January 2024*