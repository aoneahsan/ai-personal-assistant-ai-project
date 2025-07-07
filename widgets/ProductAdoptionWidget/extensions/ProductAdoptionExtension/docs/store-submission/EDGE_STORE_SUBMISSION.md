# Microsoft Edge Add-ons Submission Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Partner Center Setup](#partner-center-setup)
3. [Prepare Your Extension](#prepare-your-extension)
4. [Store Listing Information](#store-listing-information)
5. [Screenshots and Media](#screenshots-and-media)
6. [Submission Process](#submission-process)
7. [Certification Process](#certification-process)
8. [Post-Publication](#post-publication)
9. [Chrome Web Store Import](#chrome-web-store-import)
10. [Common Issues and Solutions](#common-issues-and-solutions)

## Prerequisites

Before submitting to Microsoft Edge Add-ons store, ensure you have:

- [ ] Microsoft Partner Center account
- [ ] Completed extension package (`.zip` file)
- [ ] Extension tested in Microsoft Edge
- [ ] Privacy policy URL
- [ ] All required graphics and promotional materials
- [ ] Bank account information (for paid extensions)
- [ ] Tax profile completed (if monetizing)

## Partner Center Setup

### 1. Create Microsoft Account

1. Go to [Microsoft Account](https://account.microsoft.com)
2. Create new account or use existing
3. Enable two-factor authentication (recommended)
4. Verify email address

### 2. Register in Partner Center

1. Visit [Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/overview)
2. Sign in with Microsoft account
3. Complete registration:
   - Account type: Individual or Company
   - Publisher display name: ProductAdoption
   - Country/Region
   - Contact information

### 3. Complete Account Setup

#### For Individual Accounts
- Provide legal name
- Address information
- Phone verification

#### For Company Accounts
- Company legal name
- Business registration number
- DUNS number (if available)
- Tax ID
- Authorized signatory information

### 4. Identity Verification

- **Individual**: 1-2 business days
- **Company**: 5-7 business days
- Check email for verification status
- Provide additional documents if requested

## Prepare Your Extension

### 1. Edge-Specific Considerations

Microsoft Edge uses Chromium engine, so Chrome extensions typically work without modification. However, verify:

```json
{
  "manifest_version": 3,
  "name": "ProductAdoption Tour Creator",
  "version": "1.0.0",
  "description": "Create interactive product tours visually with ProductAdoption platform",
  
  // Optional: Edge-specific settings
  "browser_specific_settings": {
    "edge": {
      "browser_action_next_to_addressbar": true
    }
  }
}
```

### 2. Build Edge Package

```bash
# Use same Chrome build for Edge
npm run build:edge

# Package location:
# dist/productadoption-edge-1.0.0.zip
```

### 3. Test in Microsoft Edge

1. Open Edge browser
2. Navigate to `edge://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select build directory
6. Test all functionality:
   - Installation flow
   - All features
   - Performance
   - Edge-specific features (Collections, Sidebar)

### 4. Edge-Specific Testing

Test compatibility with Edge features:
- Collections integration
- Sidebar functionality
- Sleeping tabs
- Efficiency mode
- Startup boost

## Store Listing Information

### Product Declaration

**Extension Name**
```
ProductAdoption Tour Creator
```

**Short Description** (Maximum 132 characters)
```
Create interactive product tours visually. Point, click, and guide users through your app with no coding required.
```

**Detailed Description** (Maximum 10,000 characters)
```markdown
🚀 **Transform User Onboarding with Visual Tour Creation**

ProductAdoption Tour Creator empowers you to create interactive product tours without writing a single line of code. Perfect for SaaS companies, product teams, and anyone looking to improve user onboarding and feature adoption.

✨ **Why Choose ProductAdoption?**

In today's competitive landscape, user experience is everything. Studies show that users decide within the first 3 minutes whether to continue using a product. ProductAdoption helps you make those minutes count by guiding users to their "aha moment" faster.

🎯 **Key Features**

📌 **Visual Tour Builder**
• Point-and-click interface - no technical skills required
• Real-time preview as you build
• Smart element detection works on any website
• Automatic selector generation for reliability

🎨 **Customizable Tour Elements**
• Rich tooltips with text, images, and videos
• Highlight important features with spotlights
• Progress indicators keep users engaged
• Multiple themes to match your brand
• Custom CSS for complete control

🔧 **Advanced Functionality**
• Multi-page tours that follow users
• Conditional logic for personalized experiences
• A/B testing to optimize effectiveness
• User segmentation and targeting
• Analytics to measure success

🏢 **Built for Teams**
• Collaborate on tour creation
• Role-based permissions
• Version control and history
• Comments and feedback system
• Approval workflows

📊 **Powerful Analytics**
• Track tour completion rates
• Identify drop-off points
• Measure feature adoption
• Export data for deeper analysis
• ROI measurement tools

🔐 **Enterprise-Ready**
• SSO authentication support
• GDPR and CCPA compliant
• SOC 2 Type II certified
• 99.9% uptime SLA
• Dedicated support

💡 **Use Cases**

**User Onboarding**
Guide new users through initial setup and key features. Reduce time-to-value from days to minutes.

**Feature Announcements**
When you ship new features, ensure users discover and understand them with targeted tours.

**Customer Support**
Reduce support tickets by 60% with self-service guided tutorials for common tasks.

**Employee Training**
Onboard new team members faster with interactive guides through internal tools.

**Sales Enablement**
Create interactive demos that prospects can experience at their own pace.

**Product Adoption**
Drive usage of underutilized features with contextual guides that appear at the right moment.

🚀 **How It Works**

1. **Install the Extension**
   Add ProductAdoption to Microsoft Edge with one click

2. **Connect Your Account**
   Sign in or create a free account (no credit card required)

3. **Navigate to Your Application**
   Go to any page where you want to create a tour

4. **Start Building**
   Click the extension icon and select "Create New Tour"

5. **Point and Click**
   Click on any element to add it as a tour step

6. **Customize**
   Add titles, descriptions, and configure behavior

7. **Publish**
   Your tour goes live instantly - no deployment needed

📈 **Proven Results**

Companies using ProductAdoption report:
• 40% increase in feature adoption
• 60% reduction in support tickets
• 3x faster user onboarding
• 85% improvement in trial-to-paid conversion

🌟 **What Makes Us Different**

**No Code Changes Required**
Unlike competitors, ProductAdoption works on any website without requiring developer involvement. Your marketing and customer success teams can create and update tours independently.

**Visual Interface**
Our intuitive builder means anyone can create professional tours in minutes, not hours.

**Smart Technology**
Advanced element detection and selector generation ensures your tours work reliably, even as your application evolves.

**Performance Focused**
Lightweight implementation (< 50KB) ensures tours load instantly without impacting your application's performance.

🛡️ **Security & Privacy**

• All data encrypted in transit and at rest
• No access to user passwords or sensitive data
• Regular third-party security audits
• Compliant with global privacy regulations
• Transparent data practices

🎨 **Customization Options**

• Multiple pre-built themes
• Custom color schemes
• Font selection
• Animation styles
• Positioning control
• Mobile-responsive designs

🔧 **Integration Capabilities**

• JavaScript API for custom triggers
• Webhook notifications
• Analytics platforms integration
• CRM synchronization
• Slack notifications
• Zapier connectivity

💼 **Pricing Plans**

**Free Plan**
• Up to 3 tours
• 1,000 views/month
• Basic analytics
• Email support

**Starter ($49/month)**
• Unlimited tours
• 10,000 views/month
• Advanced analytics
• Priority support

**Growth ($149/month)**
• Everything in Starter
• 50,000 views/month
• A/B testing
• Team collaboration
• API access

**Enterprise (Custom)**
• Unlimited everything
• SSO/SAML
• SLA guarantee
• Dedicated success manager
• Custom integration

📚 **Resources & Support**

• Comprehensive documentation at docs.productadoption.com
• Video tutorials and webinars
• Active community forum
• Email support: support@productadoption.com
• Live chat for paid plans

🏆 **Awards & Recognition**

• "Best Onboarding Tool 2023" - SaaS Awards
• "Top 10 Customer Success Tools" - G2
• 4.8/5 star rating from 1,000+ reviews
• Featured in TechCrunch, ProductHunt

🤝 **Trusted By**

Join thousands of companies improving their user experience, including Fortune 500 companies, fast-growing startups, and everything in between.

🌍 **Global Reach**

• Available in 15 languages
• Used in 100+ countries
• 24/7 global support
• Regional data centers

⚡ **Recent Updates**

• New: AI-powered tour suggestions
• New: Mobile app tour support
• Improved: 50% faster tour loading
• Enhanced: Better element detection

🎁 **Special Offer**

Edge users get 20% off their first 3 months on any paid plan. Install now and transform your user onboarding experience!

---

Ready to create amazing user experiences? Install ProductAdoption Tour Creator now and see the difference it makes for your users and your business.
```

### Categories

Primary Category: **Productivity**

Secondary Category: **Developer Tools**

### Search Keywords

Maximum 7 keywords:
1. product tours
2. user onboarding
3. tooltips
4. walkthroughs
5. user guides
6. feature adoption
7. interactive tutorials

### Age Rating

- **Rating**: Everyone
- **Content Descriptors**: None
- **Interactive Elements**: Users Interact

### Markets and Languages

**Markets**: All available markets

**Languages**:
- English (United States) - Primary
- English (United Kingdom)
- Spanish (Spain)
- French (France)
- German (Germany)
- Japanese (Japan)
- Portuguese (Brazil)

## Screenshots and Media

### Required Assets

#### 1. Extension Icon
- **Store Icon**: 300x300px PNG
- **Small Icon**: 150x150px PNG
- Format: PNG with transparency
- File size: < 1MB

#### 2. Screenshots (Minimum 1, Maximum 8)
- **Size**: 1280x800px or 640x400px
- **Format**: PNG or JPEG
- **File size**: < 1MB each

**Screenshot Order**:

1. **Hero Screenshot** - Tour creation interface
2. **Feature Screenshot** - Element selection in action
3. **Preview Screenshot** - How tours appear to users
4. **Analytics Screenshot** - Dashboard showing metrics
5. **Customization Screenshot** - Theme and styling options
6. **Multi-step Screenshot** - Complex tour example
7. **Team Screenshot** - Collaboration features
8. **Mobile Screenshot** - Responsive tour on mobile

#### 3. Promotional Images

**Small Promotional Tile** (440x280px)
- Eye-catching design
- Clear value proposition
- Include logo

**Large Promotional Tile** (1400x560px)
- Hero image quality
- Feature highlights
- Call-to-action

**Marquee Promotional Tile** (1400x788px)
- Premium placement image
- Professional design
- Brand consistency

#### 4. Optional Video
- **Format**: YouTube or Vimeo link
- **Length**: 30 seconds to 2 minutes
- **Content**: Installation and key features

### Visual Guidelines

- Use consistent branding
- High contrast for readability
- Show actual product UI
- Include Edge browser chrome
- Avoid excessive text
- Professional quality only

## Submission Process

### 1. Create New Submission

1. Go to [Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/overview)
2. Click "Create new extension"
3. Enter product name: "ProductAdoption Tour Creator"
4. Generate Store ID

### 2. Product Setup

#### Availability
- **Schedule**: Available immediately
- **Markets**: All markets
- **Visibility**: Visible in Store and searchable
- **Pricing**: Free with in-app purchases
- **Free trial**: Yes (14 days)

#### Properties
- **Category**: Productivity
- **Privacy policy URL**: https://productadoption.com/privacy
- **Website**: https://productadoption.com
- **Support contact**: support@productadoption.com
- **Extension requirements**: None

### 3. Age Ratings

Complete questionnaire:
- Violence: No
- Sexuality: No
- Profanity: No
- User-generated content: No
- Location sharing: No
- Personal information: Yes (account data only)

Result: **Everyone**

### 4. Store Listings

For each language:
1. Extension name (translated if applicable)
2. Short description
3. Detailed description
4. Search keywords
5. What's new (for updates)
6. Additional license terms (if any)

### 5. Upload Packages

1. Click "Packages"
2. Upload `.zip` file
3. Wait for validation
4. Address any validation errors
5. Confirm package details

### 6. Submit for Certification

1. Review all sections
2. Check for completion indicators
3. Click "Submit to the Store"
4. Receive confirmation email

## Certification Process

### Timeline

- **Initial certification**: 2-7 business days
- **Update certification**: 1-3 business days
- **Expedited review**: Available for critical fixes

### Certification Stages

1. **Automated Testing**
   - Package validation
   - Manifest verification
   - Security scanning
   - Policy compliance

2. **Manual Review**
   - Functionality testing
   - Store listing review
   - Privacy policy verification
   - Age rating confirmation

3. **Technical Certification**
   - Performance testing
   - Resource usage
   - Compatibility verification
   - Edge-specific features

### Certification Feedback

Monitor certification status:
- **In progress**: Currently being reviewed
- **Action needed**: Issues found, action required
- **Certified**: Passed all checks
- **Publishing**: Being deployed to store
- **Published**: Live in store

### Common Certification Failures

1. **Privacy Policy Issues**
   - Missing or generic policy
   - Doesn't match data collection
   - Inaccessible URL

2. **Functionality Problems**
   - Features don't work as described
   - Crashes or errors
   - Poor performance

3. **Store Listing Issues**
   - Misleading descriptions
   - Inappropriate content
   - Missing required information

4. **Technical Problems**
   - Excessive permissions
   - Security vulnerabilities
   - Resource consumption

## Post-Publication

### 1. Monitor Dashboard

Track metrics in Partner Center:
- Install count
- Active users
- Ratings and reviews
- Crash reports
- Revenue (if applicable)

### 2. Respond to Reviews

```
// Positive Review Response
Thank you for your kind words! We're delighted that ProductAdoption is helping you create better user experiences. If you have any suggestions for improvements, please reach out to support@productadoption.com.

// Negative Review Response
We apologize for the issues you've experienced. We'd like to help resolve this promptly. Please contact our support team at support@productadoption.com with details about the problem, and we'll work to fix it right away.
```

### 3. Update Strategy

Regular update schedule:
- **Weekly**: Bug fixes if needed
- **Bi-weekly**: Minor improvements
- **Monthly**: Feature updates
- **Quarterly**: Major releases

### 4. Update Process

1. Prepare new package
2. Update version number
3. Create "What's new" notes
4. Submit update
5. Monitor certification

### 5. Marketing Integration

- Add Edge Add-ons badge to website
- Include in email signatures
- Share on social media
- Blog announcement
- Update product documentation

## Chrome Web Store Import

### Quick Import Option

If already published on Chrome Web Store:

1. **Partner Center Dashboard**
   - Click "Import from Chrome Web Store"
   - Enter Chrome Web Store URL
   - Click "Import"

2. **Review Imported Data**
   - Verify all information transferred
   - Update Edge-specific content
   - Add missing information

3. **Customize for Edge**
   - Highlight Edge-specific features
   - Update screenshots with Edge UI
   - Adjust marketing message

4. **Submit for Certification**
   - Complete any missing sections
   - Submit as normal

### Benefits of Import

- Faster submission process
- Consistent listing information
- Automatic package conversion
- Preserve version history

## Common Issues and Solutions

### 1. Package Validation Errors

**Error**: "Invalid manifest version"
```json
// Ensure Manifest V3
{
  "manifest_version": 3,
  // ... rest of manifest
}
```

**Error**: "Missing required icons"
```json
{
  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  }
}
```

### 2. Certification Failures

**Issue**: "Extension uses excessive permissions"

Solution: Provide detailed justification:
```
The 'tabs' permission is required to:
1. Detect page navigation during multi-page tour creation
2. Ensure tours work across user's navigation flow
3. We only access tab URLs, never browsing history
```

### 3. Performance Issues

**Issue**: "High memory usage detected"

Solution:
```javascript
// Implement cleanup
class ExtensionManager {
  cleanup() {
    // Remove event listeners
    this.removeListeners();
    
    // Clear caches
    this.clearCache();
    
    // Garbage collection hint
    if (global.gc) global.gc();
  }
}
```

### 4. Edge-Specific Compatibility

**Issue**: "Doesn't work with Edge features"

Solution:
```javascript
// Detect Edge and adjust
const isEdge = navigator.userAgent.includes('Edg/');

if (isEdge) {
  // Enable Edge-specific features
  enableEdgeOptimizations();
}
```

### 5. Store Listing Rejections

**Issue**: "Description doesn't match functionality"

Solution:
- Review and update description
- Ensure all claimed features work
- Remove any unsupported claims
- Add clarifications if needed

## Best Practices for Edge

### Do's

- ✅ Test with Edge's efficiency features
- ✅ Support Edge Collections
- ✅ Optimize for Edge's sleeping tabs
- ✅ Use Microsoft's design language
- ✅ Highlight Edge-specific benefits
- ✅ Test on both Windows and macOS
- ✅ Support Edge enterprise features

### Don'ts

- ❌ Don't assume Chrome behavior
- ❌ Don't ignore Edge-specific bugs
- ❌ Don't use deprecated APIs
- ❌ Don't neglect performance optimization
- ❌ Don't skip certification guidelines
- ❌ Don't use competing browser branding
- ❌ Don't ignore user feedback

## Resources

### Official Documentation
- [Microsoft Edge Add-ons Documentation](https://docs.microsoft.com/microsoft-edge/extensions-chromium/)
- [Partner Center Help](https://docs.microsoft.com/microsoft-edge/extensions-chromium/publish/)
- [Edge Extension APIs](https://docs.microsoft.com/microsoft-edge/extensions-chromium/developer-guide/api-support)

### Development Tools
- [Edge DevTools](https://docs.microsoft.com/microsoft-edge/devtools-guide-chromium/)
- [WebDriver for Edge](https://docs.microsoft.com/microsoft-edge/webdriver-chromium/)
- [Extension samples](https://github.com/microsoft/MicrosoftEdge-Extensions)

### Support Channels
- [Edge Add-ons Forum](https://techcommunity.microsoft.com/t5/microsoft-edge-insider/bd-p/MicrosoftEdgeInsider)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/microsoft-edge-extension)
- Email: edgeextensionpartner@microsoft.com

### Marketing Resources
- [Edge Add-ons badges](https://developer.microsoft.com/microsoft-edge/store/badges/)
- [Success stories](https://docs.microsoft.com/microsoft-edge/extensions-chromium/publish/success-stories)
- [Best practices](https://docs.microsoft.com/microsoft-edge/extensions-chromium/publish/best-practices)

---

*Last updated: January 2024*