# Product Adoption Module Guide

## Overview

The Product Adoption module is a comprehensive solution for creating and managing user onboarding experiences, product tours, and engagement widgets. It helps improve user adoption and feature discovery through interactive guides and targeted messaging.

## Features

### 1. Product Tours
- **Visual Tour Builder**: Create step-by-step guides with a drag-and-drop interface
- **Multiple Trigger Types**: Auto-start, manual, element click, or exit intent
- **Advanced Targeting**: Target specific user segments, pages, or conditions
- **Customizable Themes**: Match your brand with customizable colors and styles
- **Analytics**: Track completion rates, skip rates, and engagement metrics

### 2. Engagement Widgets
- **Multiple Widget Types**:
  - NPS (Net Promoter Score) surveys
  - Feedback collection forms
  - Announcement banners
  - Feature highlight cards
- **Smart Targeting**: Show widgets to the right users at the right time
- **Position Control**: Place widgets anywhere on the screen
- **Performance Tracking**: Monitor impressions, interactions, and conversions

### 3. Analytics Dashboard
- **Tour Performance**: View completion rates, average time, and user paths
- **User Engagement**: Track daily, weekly, and monthly active users
- **Widget Analytics**: Monitor widget performance and conversion rates
- **Export Options**: Download reports in various formats

## Getting Started

### 1. Access Product Adoption Module

Navigate to **Dashboard > Product Adoption** in your admin panel.

### 2. Create Your First Tour

1. Click **"Create New Tour"** button
2. Enter tour details:
   - **Name**: Internal name for the tour
   - **Description**: Brief description of the tour's purpose
   - **Status**: Set to "Draft" while building

3. Add Steps:
   - Click **"Add Step"** to create tour steps
   - For each step, configure:
     - **Title**: Step heading
     - **Content**: Step description (supports rich text)
     - **Target Element**: CSS selector for highlighting
     - **Placement**: Position of the tooltip
     - **Actions**: Buttons (Next, Back, Skip, etc.)

4. Configure Triggers:
   - **Manual**: Start tour programmatically
   - **Auto**: Start automatically on page load
   - **Element Click**: Start when user clicks specific element
   - **Exit Intent**: Start when user attempts to leave

5. Set Targeting Rules:
   - **User Segments**: New users, trial users, etc.
   - **Page Rules**: Specific URLs or patterns
   - **Exclusions**: Skip users who completed the tour

6. Customize Appearance:
   - Colors, fonts, animations
   - Overlay opacity
   - Border radius and shadows

### 3. Initialize Demo Data

To see example tours and widgets, click the **"Initialize Demo Data"** button in the Product Adoption header. This will create:
- Welcome Tour (3 steps)
- New Feature Highlight Tour
- User Onboarding Flow
- NPS Survey Widget
- Feedback Widget
- Announcement Banner

### 4. Preview and Test

1. Use the **"Preview Tour"** button to test your tour
2. Check different screen sizes and devices
3. Verify targeting rules work correctly
4. Test all navigation paths

### 5. Launch Your Tour

1. Change status from "Draft" to "Active"
2. Monitor performance in the Analytics tab
3. Make adjustments based on user behavior

## Best Practices

### Tour Design
- **Keep it Short**: 3-5 steps maximum per tour
- **Clear Actions**: Make it obvious what users should do
- **Progressive Disclosure**: Don't overwhelm with information
- **Mobile-Friendly**: Test on all device sizes

### Targeting
- **Segment Wisely**: Target users who will benefit most
- **Timing Matters**: Don't interrupt critical workflows
- **Frequency Caps**: Avoid showing tours too often
- **A/B Testing**: Try different approaches

### Content
- **Clear Language**: Use simple, action-oriented text
- **Visual Aids**: Include images or icons when helpful
- **Personalization**: Use variables like {{user.name}}
- **Call-to-Action**: Each step should have a clear purpose

## API Integration

### Starting Tours Programmatically

```javascript
// Start a tour by ID
window.productAdoption?.startTour('welcome-tour');

// Start a tour with options
window.productAdoption?.startTour('feature-tour', {
  stepIndex: 0,
  onComplete: () => console.log('Tour completed'),
  onSkip: () => console.log('Tour skipped')
});
```

### Tracking Custom Events

```javascript
// Track custom events
window.productAdoption?.trackEvent('feature_used', {
  feature: 'advanced_search',
  userId: currentUser.id
});
```

### Widget Control

```javascript
// Show a specific widget
window.productAdoption?.showWidget('nps-survey');

// Hide all widgets
window.productAdoption?.hideAllWidgets();
```

## Troubleshooting

### Tours Not Showing
1. Check tour status is "Active"
2. Verify targeting rules match current user/page
3. Check browser console for errors
4. Ensure element selectors are correct

### Performance Issues
1. Limit active tours per page
2. Optimize step content and images
3. Use lazy loading for heavy content
4. Monitor analytics for bottlenecks

### Styling Conflicts
1. Use specific CSS selectors
2. Increase z-index if needed
3. Test with your theme variations
4. Use the preview tool extensively

## Security & Permissions

- Only admin users can create/edit tours and widgets
- All users can view tours targeted to them
- Tour progress is tracked per user
- Analytics data is aggregated and anonymized

## Support

For additional help:
- Check the in-app help documentation
- Contact your administrator
- Submit feedback through the Feedback Widget

---

Last Updated: January 2024