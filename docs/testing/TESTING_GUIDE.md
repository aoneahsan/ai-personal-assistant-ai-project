# Message Editing Features - Testing Guide

## 🧪 Testing Environment

**Staging URL**: https://ai-personal-assistant-a1-staging.web.app

## 🎯 Testing Checklist

### Pre-Testing Setup

- [ ] Open staging URL in browser
- [ ] Log in with test account
- [ ] Navigate to chat interface
- [ ] Send a few test messages

### 1. Message Editing Features

#### Basic Editing (PRO+ Feature)

- [ ] **Right-click on your own text message**
  - Expected: Context menu appears with "Edit Message" option
  - For FREE users: Should show upgrade prompt
- [ ] **Click "Edit Message"**
  - Expected: Edit dialog opens with current message text
  - Should show original message for reference
  - Should have edit reason field (optional)
- [ ] **Edit the message text**
  - Expected: Character count updates
  - Should validate input length
- [ ] **Save edited message**
  - Expected: Message updates in chat
  - Should show "edited" tag on message
  - Should store edit in history

#### Edit Restrictions Testing

- [ ] **Try editing messages older than 24 hours**
  - Expected: Should be disabled/show restriction message
- [ ] **Try editing non-text messages (images, audio)**
  - Expected: Edit option should not appear
- [ ] **Try editing other users' messages**
  - Expected: Context menu should not appear

### 2. Message Deletion Features

#### Basic Deletion (PRO+ Feature)

- [ ] **Right-click on your own message**
  - Expected: Context menu shows "Delete Message" option
  - For FREE users: Should show upgrade prompt
- [ ] **Click "Delete Message"**
  - Expected: Confirmation dialog appears
- [ ] **Confirm deletion**
  - Expected: Message shows as "🗑️ This message was deleted"
  - Should preserve message in database (soft delete)

### 3. Message History Features

#### Edit History (PRO+ Feature)

- [ ] **Edit a message multiple times**
- [ ] **Right-click on edited message**
- [ ] **Click "View History"**
  - Expected: History dialog opens
  - Should show timeline of all edits
  - Should display edit reasons (if provided)
  - Should show timestamps for each edit

### 4. Subscription & Upgrade Features

#### FREE Plan Restrictions

- [ ] **Test with FREE plan user**
- [ ] **Try to edit message**
  - Expected: Upgrade modal appears
  - Should show available plans (PRO, PREMIUM, ENTERPRISE)
- [ ] **Try to delete message**
  - Expected: Upgrade modal appears
- [ ] **Try to view history**
  - Expected: Upgrade modal appears

#### Upgrade Modal Testing

- [ ] **Click upgrade button**
  - Expected: Plan selection appears
  - Should show feature comparisons
  - Should have pricing information
- [ ] **Test different plan buttons**
  - Expected: Each plan shows different features
  - Should handle plan selection properly

### 5. Visual & UI Testing

#### Edit Indicators

- [ ] **Check edited messages show "edited" tag**
  - Expected: Small blue tag with pencil icon
  - Should be positioned correctly
- [ ] **Check deleted message styling**
  - Expected: Grayed out text with trash icon
  - Should be clearly distinguishable

#### Responsive Design

- [ ] **Test on mobile device/small screen**
  - Expected: Context menus work properly
  - Dialogs should be mobile-friendly
  - Edit indicators should be visible

#### Context Menu

- [ ] **Right-click functionality**
  - Expected: Menu appears near cursor
  - Should close when clicking elsewhere
  - Should work consistently across browsers

### 6. Error Handling Testing

#### Network Issues

- [ ] **Disconnect internet during edit**
  - Expected: Should show error message
  - Should restore original message text
- [ ] **Test with slow connection**
  - Expected: Should show loading states
  - Should handle timeouts gracefully

#### Invalid Operations

- [ ] **Try to edit empty message**
  - Expected: Should prevent saving
  - Should show validation error
- [ ] **Try to edit with only spaces**
  - Expected: Should trim and validate
- [ ] **Test very long edit text**
  - Expected: Should enforce character limits

### 7. Cross-Browser Testing

- [ ] **Chrome** - Test all features
- [ ] **Firefox** - Test all features
- [ ] **Safari** - Test all features
- [ ] **Edge** - Test all features

## 🐛 Known Issues to Watch For

1. **Context Menu Positioning**: May not appear correctly on some screen sizes
2. **Mobile Touch Events**: Right-click may not work on mobile (need long-press)
3. **Subscription Loading**: User subscription data may not load immediately
4. **Edit History Ordering**: Ensure edits are displayed in correct chronological order

## 📝 Bug Report Template

If you find issues, please document:

```markdown
## Bug Report

**Feature**: [Message Editing/Deletion/History/Upgrade]
**Browser**: [Chrome/Firefox/Safari/Edge]
**Device**: [Desktop/Mobile]
**User Plan**: [FREE/PRO/PREMIUM/ENTERPRISE]

**Steps to Reproduce**:

1.
2.
3.

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Screenshots/Console Errors**:
[Attach if available]
```

## ✅ Success Criteria

All features are working correctly when:

- [ ] FREE users see upgrade prompts for premium features
- [ ] PRO+ users can edit their own text messages
- [ ] Messages show edit indicators correctly
- [ ] Edit history displays complete timeline
- [ ] Soft deletion works (preserves data)
- [ ] Context menus appear and function properly
- [ ] Mobile experience is smooth
- [ ] Error handling works as expected

## 🚀 Post-Testing Actions

After successful testing:

1. Deploy to production: `npm run deploy:production`
2. Update user documentation
3. Monitor user feedback and analytics
4. Plan next feature implementation (Anonymous Chat)
