# ProductAdoption Troubleshooting Guide

## Table of Contents
1. [Quick Fixes](#quick-fixes)
2. [Installation Issues](#installation-issues)
3. [Authentication Problems](#authentication-problems)
4. [Tour Creation Issues](#tour-creation-issues)
5. [Display Problems](#display-problems)
6. [Performance Issues](#performance-issues)
7. [Browser-Specific Issues](#browser-specific-issues)
8. [Common Error Messages](#common-error-messages)
9. [Advanced Troubleshooting](#advanced-troubleshooting)
10. [Getting Help](#getting-help)

## Quick Fixes

Before diving into specific issues, try these quick fixes that resolve 80% of problems:

### 1. Refresh Everything
```bash
# Chrome/Edge
1. Go to chrome://extensions or edge://extensions
2. Find ProductAdoption
3. Click the refresh icon
4. Reload your webpage

# Firefox
1. Go to about:addons
2. Click the gear icon → "Check for Updates"
3. Restart Firefox
```

### 2. Clear Extension Data
1. Right-click the extension icon
2. Go to Options/Settings
3. Click "Clear Cache"
4. Sign in again

### 3. Check Permissions
1. Click the extension icon
2. Ensure you see "Access granted" for current site
3. If not, click "Grant Access"

### 4. Update Your Browser
- Chrome: `chrome://settings/help`
- Firefox: `about:preferences#general`
- Edge: `edge://settings/help`

## Installation Issues

### Extension Won't Install

#### From Web Store
**Problem**: "Installation failed" error

**Solutions**:
1. Check browser compatibility:
   - Chrome 88+
   - Firefox 85+
   - Edge 88+

2. Verify disk space (need 50MB free)

3. Disable conflicting extensions:
   ```
   Common conflicts:
   - Ad blockers
   - Privacy extensions
   - Script blockers
   ```

4. Try incognito/private mode installation

#### Manual Installation
**Problem**: "Invalid manifest" error

**Solutions**:
```bash
# Verify file structure
ProductAdoptionExtension/
├── manifest.json
├── src/
├── public/
└── _metadata/ (if from store)

# Check manifest.json is valid JSON
# Use jsonlint.com to validate
```

### Extension Icon Missing

**Solutions**:
1. **Pin the extension**:
   - Click puzzle piece icon
   - Find ProductAdoption
   - Click pin icon

2. **Check toolbar customization**:
   - Right-click toolbar
   - Customize toolbar
   - Drag extension icon to toolbar

3. **Reset toolbar**:
   ```
   Chrome: chrome://flags/#extensions-toolbar-menu
   Firefox: Right-click → Customize → Restore Defaults
   ```

## Authentication Problems

### Can't Sign In

**Problem**: "Authentication failed" error

**Diagnosis Checklist**:
- [ ] Correct email/password?
- [ ] Account activated?
- [ ] Browser cookies enabled?
- [ ] Pop-ups allowed for productadoption.com?

**Solutions**:

1. **Clear authentication data**:
   ```javascript
   // In extension console
   chrome.storage.local.remove(['auth_token', 'refresh_token']);
   ```

2. **Check popup blocker**:
   - Allow popups from `app.productadoption.com`
   - Temporarily disable popup blocker
   - Try clicking "Sign In" while holding Ctrl/Cmd

3. **Reset OAuth flow**:
   - Sign out from app.productadoption.com
   - Clear browser cookies for domain
   - Try signing in again

### Session Expires Frequently

**Problem**: Need to sign in repeatedly

**Solutions**:

1. **Check browser settings**:
   ```
   Settings → Privacy → Cookies
   ✓ Allow sites to save cookies
   ✓ Keep cookies until: Browser closes (change to "Manual")
   ```

2. **Extension storage**:
   ```javascript
   // Check if storage is working
   chrome.storage.local.get(null, (items) => {
     console.log('Storage contents:', items);
   });
   ```

3. **Time sync**:
   - Ensure system time is correct
   - Tokens expire based on time

### Two-Factor Authentication Issues

**Problem**: 2FA code not accepted

**Solutions**:
1. Verify time sync on authenticator device
2. Use backup codes if available
3. Try entering code without spaces
4. Request SMS fallback (if enabled)

## Tour Creation Issues

### Can't Select Elements

**Problem**: Clicking elements doesn't add them to tour

**Diagnosis**:
```javascript
// Check if content script is loaded
// Open console on webpage
if (window.ProductAdoptionExtension) {
  console.log('Extension loaded');
} else {
  console.log('Extension NOT loaded');
}
```

**Solutions**:

1. **Verify page access**:
   - Some pages restrict extensions (bank sites, chrome://)
   - Try on a different website first

2. **Check for iframes**:
   ```javascript
   // Elements in iframes need special handling
   // Try parent frame first
   if (window.self !== window.top) {
     console.log('Inside iframe - limited access');
   }
   ```

3. **Disable conflicting scripts**:
   - Ad blockers
   - Privacy extensions
   - Developer tools extensions

### Selectors Not Working

**Problem**: "Element not found" when previewing tour

**Solutions**:

1. **Use stable selectors**:
   ```css
   /* Bad - likely to change */
   .css-1x2y3z

   /* Good - semantic and stable */
   #user-menu
   [data-testid="submit-button"]
   ```

2. **Add fallback selectors**:
   - Right-click element in tour builder
   - Choose "Add Fallback Selector"
   - Provide 2-3 alternatives

3. **Handle dynamic content**:
   ```javascript
   // Add wait condition
   {
     "waitFor": "#dynamic-content",
     "timeout": 5000
   }
   ```

### Tours Not Saving

**Problem**: Changes lost after saving

**Solutions**:

1. **Check network connection**:
   ```bash
   # Open browser console
   # Go to Network tab
   # Try saving
   # Look for failed requests
   ```

2. **Verify permissions**:
   - Ensure you have edit rights
   - Check team role settings

3. **Storage quota**:
   ```javascript
   // Check available storage
   navigator.storage.estimate().then(estimate => {
     console.log(`Using ${estimate.usage} of ${estimate.quota} bytes`);
   });
   ```

## Display Problems

### Tours Not Appearing

**Problem**: Published tour doesn't show for users

**Diagnostic Steps**:
1. Check tour status (must be "published")
2. Verify URL pattern matches
3. Test trigger conditions
4. Check browser console for errors

**Solutions**:

1. **URL Pattern Issues**:
   ```javascript
   // Too specific
   "https://app.example.com/dashboard?user=123"
   
   // Better - matches variations
   "https://app.example.com/dashboard*"
   "https://*.example.com/*"
   ```

2. **Trigger Debugging**:
   ```javascript
   // Force trigger tour in console
   window.ProductAdoption.startTour('tour_id_here');
   ```

3. **Check targeting rules**:
   - User segment matches?
   - Time-based rules active?
   - Geo-targeting correct?

### Styling Issues

**Problem**: Tours look broken or unstyled

**Solutions**:

1. **CSS Conflicts**:
   ```css
   /* Add to tour custom CSS */
   .productadoption-tooltip {
     all: initial !important;
     /* Your styles */
   }
   ```

2. **Z-index Issues**:
   ```css
   /* Ensure tooltips appear above content */
   .productadoption-overlay {
     z-index: 999999 !important;
   }
   ```

3. **Responsive Problems**:
   - Test at different screen sizes
   - Use percentage-based positioning
   - Enable mobile-specific tours

### Tour Steps Out of Order

**Problem**: Steps appear in wrong sequence

**Solutions**:

1. **Check step order**:
   ```javascript
   // In tour editor, verify order field
   steps.sort((a, b) => a.order - b.order);
   ```

2. **Async loading issues**:
   - Add delays between steps
   - Use "waitFor" conditions

3. **Multi-page sync**:
   - Ensure page URLs are correct
   - Add page load detection

## Performance Issues

### Extension Slowing Browser

**Symptoms**:
- High CPU usage
- Slow page loads
- Browser freezing

**Solutions**:

1. **Check resource usage**:
   ```
   Chrome: Shift+Esc → Task Manager
   Firefox: about:performance
   Edge: Shift+Esc → Browser Task Manager
   ```

2. **Optimize settings**:
   ```javascript
   // In extension settings
   {
     "performance_mode": true,
     "disable_animations": true,
     "reduced_polling": true
   }
   ```

3. **Limit active tours**:
   - Disable tours on unused sites
   - Archive old tours
   - Reduce complex selectors

### Slow Tour Loading

**Problem**: Tours take long to appear

**Solutions**:

1. **Optimize images**:
   - Use compressed formats (WebP, optimized PNG)
   - Lazy load images in tours
   - Host images on CDN

2. **Reduce API calls**:
   ```javascript
   // Enable caching
   {
     "cache_enabled": true,
     "cache_duration": 3600
   }
   ```

3. **Preload tours**:
   - Enable predictive loading
   - Cache frequently used tours

## Browser-Specific Issues

### Chrome/Edge Issues

#### Hardware Acceleration Conflicts
**Problem**: Visual glitches or crashes

**Solution**:
```
Settings → Advanced → System
Toggle "Use hardware acceleration when available"
```

#### Extension Conflicts
**Common conflicts**:
- React DevTools
- Vue DevTools
- Grammarly

**Solution**: Disable one by one to identify conflict

### Firefox Issues

#### Container Tabs
**Problem**: Tours don't work in container tabs

**Solution**:
- Grant permission for containers
- Or open site in regular tab

#### Tracking Protection
**Problem**: Extension blocked by Enhanced Tracking Protection

**Solution**:
```
Click shield icon → Turn off protection for this site
```

### Safari Issues

#### Web Extension Permissions
**Problem**: Limited functionality

**Solution**:
```
Safari → Preferences → Extensions
Enable all ProductAdoption permissions
```

## Common Error Messages

### "Failed to fetch tour data"

**Causes**:
- Network connectivity
- API server issues
- Authentication expired

**Solutions**:
1. Check internet connection
2. Verify API status: status.productadoption.com
3. Re-authenticate

### "Invalid selector"

**Causes**:
- Malformed CSS selector
- Special characters not escaped

**Solutions**:
```javascript
// Escape special characters
selector.replace(/([#;&,.+*~':"!^$[\]()=>|/@])/g, '\\$1');
```

### "Storage quota exceeded"

**Causes**:
- Too many tours cached
- Large media files

**Solutions**:
1. Clear cache in settings
2. Reduce image sizes
3. Archive old tours

### "Content Security Policy violation"

**Causes**:
- Strict CSP on website
- Inline script restrictions

**Solutions**:
1. Contact site administrator
2. Use CSP-compliant mode
3. Try alternative selectors

## Advanced Troubleshooting

### Debug Mode

Enable detailed logging:

```javascript
// In extension console
chrome.storage.local.set({
  debug_mode: true,
  log_level: 'verbose'
});
```

### Network Diagnostics

```javascript
// Test API connectivity
fetch('https://api.productadoption.com/v1/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

### Extension Console

Access extension background console:

**Chrome/Edge**:
1. Go to `chrome://extensions`
2. Enable Developer mode
3. Click "background page" link

**Firefox**:
1. Go to `about:debugging`
2. Click "This Firefox"
3. Find extension → "Inspect"

### Export Diagnostic Data

```javascript
// Collect diagnostic info
async function exportDiagnostics() {
  const data = {
    browser: navigator.userAgent,
    extension_version: chrome.runtime.getManifest().version,
    storage: await chrome.storage.local.get(),
    errors: console.getErrors(), // if available
    timestamp: new Date().toISOString()
  };
  
  // Download as file
  const blob = new Blob([JSON.stringify(data, null, 2)]);
  const url = URL.createObjectURL(blob);
  chrome.downloads.download({
    url: url,
    filename: 'productadoption-diagnostics.json'
  });
}
```

## Getting Help

### Self-Service Resources

1. **Knowledge Base**: https://help.productadoption.com
2. **Video Tutorials**: https://youtube.com/productadoption
3. **Community Forum**: https://community.productadoption.com
4. **Status Page**: https://status.productadoption.com

### Contact Support

#### Before Contacting Support

Gather this information:
- [ ] Extension version
- [ ] Browser version
- [ ] Operating system
- [ ] Error messages (screenshots)
- [ ] Steps to reproduce
- [ ] Diagnostic export

#### Support Channels

**Email Support**:
- support@productadoption.com
- Response time: 24-48 hours

**Live Chat** (Premium plans):
- Available in extension
- Hours: 9 AM - 6 PM PST

**Priority Support** (Enterprise):
- dedicated@productadoption.com
- Phone: +1 (555) 123-4567

### Bug Reports

File bug reports with:
1. Clear description
2. Expected vs actual behavior
3. Steps to reproduce
4. Screenshots/videos
5. Console logs

Submit at: https://github.com/productadoption/issues

### Feature Requests

Share ideas:
- Feature request form in extension
- Community forum discussions
- Email: features@productadoption.com

---

*Can't find what you're looking for? Contact support@productadoption.com*

*Last updated: January 2024*