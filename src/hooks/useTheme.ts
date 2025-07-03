import {
  generateCSSCustomProperties,
  getThemeByName,
  ThemeColors,
  ThemeName,
} from '@/utils/constants/theme/colors';
import {
  getThemeSettings,
  setThemeSettings,
} from '@/utils/helpers/localStorage';
import { useEffect, useState } from 'react';

// Custom hook for theme management
export const useTheme = (themeName?: ThemeName) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('STRIPE');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from storage on initial load
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await getThemeSettings();
        if (
          savedTheme &&
          ['STRIPE', 'WHATSAPP', 'DISCORD'].includes(savedTheme)
        ) {
          setCurrentTheme(savedTheme as ThemeName);
        } else {
          setCurrentTheme('STRIPE'); // Default theme
        }
      } catch (error) {
        console.error('Error loading theme:', error);
        setCurrentTheme('STRIPE'); // Fallback to default
      } finally {
        setIsLoading(false);
      }
    };

    if (!themeName) {
      loadTheme();
    } else {
      setCurrentTheme(themeName);
      setIsLoading(false);
    }
  }, [themeName]);

  const theme: ThemeColors = getThemeByName(currentTheme);

  useEffect(() => {
    if (!isLoading) {
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
    }
  }, [theme, isLoading]);

  // Function to change theme and persist it
  const changeTheme = async (newTheme: ThemeName) => {
    setCurrentTheme(newTheme);
    await setThemeSettings(newTheme);
  };

  return {
    theme,
    colors: theme,
    currentTheme,
    changeTheme,
    isLoading,
  };
};

export default useTheme;
