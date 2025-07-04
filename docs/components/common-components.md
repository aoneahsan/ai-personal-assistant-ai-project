# Common Components Documentation

This document outlines the common components available in the `src/components/common/` directory. These components provide consistent UI patterns and functionality across the application.

## Components Overview

### 1. RefreshButton

A standardized refresh button component with consistent styling, loading states, and proper tooltips.

#### Features

- ✅ Consistent styling across the application
- ✅ Loading state with spinner animation
- ✅ Proper tooltip positioning (fixes vertical tooltip issues)
- ✅ Size variants (small, normal, large)
- ✅ Theme integration
- ✅ Accessibility support

#### Usage

```tsx
import { RefreshButton } from '@/components/common';

const MyComponent = () => {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Your refresh logic here
      await refreshData();
    } finally {
      setLoading(false);
    }
  };

  return (
    <RefreshButton
      onRefresh={handleRefresh}
      loading={loading}
      tooltip='Refresh Data'
      size='normal'
    />
  );
};
```

#### Props

| Prop        | Type                             | Default          | Description                                |
| ----------- | -------------------------------- | ---------------- | ------------------------------------------ |
| `onRefresh` | `() => void \| Promise<void>`    | Required         | Function to call when refresh is triggered |
| `loading`   | `boolean`                        | `false`          | Shows spinner when true                    |
| `disabled`  | `boolean`                        | `false`          | Disables the button                        |
| `className` | `string`                         | `''`             | Additional CSS classes                     |
| `tooltip`   | `string`                         | `'Refresh Data'` | Tooltip text                               |
| `size`      | `'small' \| 'normal' \| 'large'` | `'normal'`       | Button size variant                        |

#### Size Variants

- **Small**: Perfect for tight spaces, toolbars
- **Normal**: Default size for most use cases
- **Large**: For prominent actions

### 2. FullPageLoader

A full-page overlay component that prevents user interaction during data loading operations.

#### Features

- ✅ Full-page overlay with backdrop blur
- ✅ Prevents user interaction during loading
- ✅ Customizable spinner size and message
- ✅ Theme integration
- ✅ High z-index to ensure it appears above all content
- ✅ Responsive design

#### Usage

```tsx
import { FullPageLoader } from '@/components/common';

const MyComponent = () => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Your refresh logic here
      await refreshAllData();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      <FullPageLoader
        visible={refreshing}
        message='Refreshing data...'
        size='large'
      />
      {/* Your page content */}
    </>
  );
};
```

#### Props

| Prop      | Type                             | Default        | Description                |
| --------- | -------------------------------- | -------------- | -------------------------- |
| `visible` | `boolean`                        | Required       | Controls loader visibility |
| `message` | `string`                         | `'Loading...'` | Loading message to display |
| `size`    | `'small' \| 'normal' \| 'large'` | `'large'`      | Spinner size               |

#### Size Variants

- **Small**: 50px spinner
- **Normal**: 75px spinner
- **Large**: 100px spinner (recommended for full-page loading)

## Implementation Pattern

### Page-Level Refresh Pattern

For consistent refresh functionality across all pages, follow this pattern:

```tsx
import { RefreshButton, FullPageLoader } from '@/components/common';
import { Toast } from 'primereact/toast';

const MyPage = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState([]);
  const toast = useRef<Toast>(null);

  // Data loading function
  const loadData = async (showFullLoader = false) => {
    try {
      if (showFullLoader) {
        setRefreshing(true);
      }

      // Load your data
      const result = await fetchData();
      setData(result);

      if (showFullLoader) {
        toast.current?.show({
          severity: 'success',
          summary: 'Data Refreshed',
          detail: 'All data has been successfully refreshed',
          life: 3000,
        });
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load data. Please try again.',
        life: 5000,
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  // Refresh handler
  const handleRefresh = async () => {
    await loadData(true);
  };

  return (
    <div>
      <Toast ref={toast} />
      <FullPageLoader
        visible={refreshing}
        message='Refreshing data...'
      />

      {/* Page Header */}
      <div className='flex justify-content-between align-items-center mb-4'>
        <h1>My Page</h1>
        <RefreshButton
          onRefresh={handleRefresh}
          loading={refreshing}
          tooltip='Refresh Page Data'
        />
      </div>

      {/* Page Content */}
      {/* ... */}
    </div>
  );
};
```

## Tooltip System

### Fixed Tooltip Issues

The new tooltip system addresses several issues:

1. **Vertical Tooltip Problem**: Fixed tooltips appearing vertically instead of horizontally
2. **Positioning**: Proper positioning using PrimeReact's Tooltip component
3. **Accessibility**: ARIA labels and proper keyboard navigation
4. **Consistency**: Standardized appearance across the application

### Custom Tooltip Styles

The application includes custom CSS (`src/styles/tooltip.css`) that:

- Ensures proper horizontal positioning
- Provides consistent styling
- Includes responsive behavior
- Supports dark/light themes
- Includes high contrast mode support

### Best Practices

1. **Always provide tooltips** for icon-only buttons
2. **Use descriptive text** that clearly explains the action
3. **Position tooltips appropriately** (top/bottom for horizontal layouts)
4. **Keep tooltip text concise** but informative
5. **Test tooltips on mobile devices** to ensure they work properly

## Integration with Existing Pages

### Already Implemented

The following pages have been updated with the new refresh system:

1. **Dashboard** (`src/pages/Dashboard/index.tsx`)

   - Overview section with refresh button
   - Chats section with refresh button
   - Embeds section with refresh button
   - Account section with refresh button
   - Full page loader during refresh

2. **EditProfile** (`src/pages/EditProfile/index.tsx`)
   - Refresh button in header
   - Refreshes profile data from storage

### Adding to New Pages

To add refresh functionality to a new page:

1. Import the components:

   ```tsx
   import { RefreshButton, FullPageLoader } from '@/components/common';
   ```

2. Add state management:

   ```tsx
   const [refreshing, setRefreshing] = useState(false);
   ```

3. Implement refresh function:

   ```tsx
   const handleRefresh = async () => {
     // Your refresh logic
   };
   ```

4. Add components to your JSX:
   ```tsx
   <RefreshButton onRefresh={handleRefresh} loading={refreshing} />
   <FullPageLoader visible={refreshing} message="Loading..." />
   ```

## Performance Considerations

1. **Debouncing**: The refresh buttons have built-in protection against rapid clicks
2. **Loading States**: Proper loading states prevent user confusion
3. **Error Handling**: Always include proper error handling with user feedback
4. **Memory Management**: Components properly clean up listeners and timers

## Accessibility

Both components are built with accessibility in mind:

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and descriptions
- **High Contrast**: Support for high contrast mode
- **Focus Management**: Proper focus handling during loading states

## Browser Support

The components are tested and supported on:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Common Issues

1. **Tooltips not appearing**: Ensure the tooltip CSS is imported in `src/index.scss`
2. **Loader not showing**: Check that `visible` prop is properly set to `true`
3. **Styling issues**: Verify theme context is available in your component tree
4. **TypeScript errors**: Ensure proper import statements and prop types

### Debug Mode

In development mode, you can enable console logging by checking the browser's developer tools for component lifecycle events and prop changes.
