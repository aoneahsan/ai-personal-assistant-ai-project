import {
  CURRENT_THEME,
  generateCSSCustomProperties,
  getThemeByName,
  ThemeColors,
  ThemeName,
} from '@/utils/constants/theme/colors';
import { useEffect } from 'react';

// Custom hook for theme management
export const useTheme = (themeName?: ThemeName) => {
  const theme: ThemeColors = themeName
    ? getThemeByName(themeName)
    : CURRENT_THEME;

  useEffect(() => {
    // Generate and inject CSS custom properties
    const cssProperties = generateCSSCustomProperties(theme);

    // Remove existing theme style tag if it exists
    const existingStyleTag = document.getElementById('theme-variables');
    if (existingStyleTag) {
      existingStyleTag.remove();
    }

    // Create and inject new style tag
    const styleTag = document.createElement('style');
    styleTag.id = 'theme-variables';
    styleTag.textContent = cssProperties;
    document.head.appendChild(styleTag);

    // Cleanup function
    return () => {
      const styleElement = document.getElementById('theme-variables');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [theme]);

  return {
    theme,
    colors: theme,
  };
};

export default useTheme;
