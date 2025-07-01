// Theme Configuration for the Chat App
// Based on Stripe's color scheme but easily configurable

export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryHover: string;
  primaryActive: string;
  primaryLight: string;
  primaryDark: string;

  // Secondary colors
  secondary: string;
  secondaryHover: string;
  secondaryLight: string;

  // Accent colors
  accent: string;
  accentHover: string;
  accentLight: string;

  // Messaging colors
  sentMessage: string;
  receivedMessage: string;
  messageText: string;
  messageTextLight: string;

  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  surface: string;
  surfaceLight: string;

  // Text colors
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Border colors
  border: string;
  borderLight: string;
  borderDark: string;

  // Interactive colors
  hover: string;
  active: string;
  focus: string;

  // Online status
  online: string;
  offline: string;
}

// Stripe-based Modern Theme
export const STRIPE_THEME: ThemeColors = {
  // Primary colors (Stripe Purple)
  primary: '#635BFF',
  primaryHover: '#5B54E8',
  primaryActive: '#524DD1',
  primaryLight: '#E8E6FF',
  primaryDark: '#4B47CC',

  // Secondary colors (Stripe Blue)
  secondary: '#00D4FF',
  secondaryHover: '#00C4ED',
  secondaryLight: '#E6F9FF',

  // Accent colors (Modern Green)
  accent: '#00C896',
  accentHover: '#00B587',
  accentLight: '#E6F9F4',

  // Messaging colors
  sentMessage: '#635BFF',
  receivedMessage: '#FFFFFF',
  messageText: '#1A1A1A',
  messageTextLight: '#6B7280',

  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Background colors
  background: '#F8FAFC',
  backgroundSecondary: '#F1F5F9',
  backgroundTertiary: '#E2E8F0',
  surface: '#FFFFFF',
  surfaceLight: '#F9FAFB',

  // Text colors
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',

  // Border colors
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderDark: '#CBD5E1',

  // Interactive colors
  hover: 'rgba(99, 91, 255, 0.1)',
  active: 'rgba(99, 91, 255, 0.2)',
  focus: 'rgba(99, 91, 255, 0.3)',

  // Online status
  online: '#10B981',
  offline: '#94A3B8',
};

// Alternative theme configurations that can be easily switched
export const WHATSAPP_THEME: ThemeColors = {
  primary: '#075E54',
  primaryHover: '#128C7E',
  primaryActive: '#0A5048',
  primaryLight: '#E8F5E8',
  primaryDark: '#054139',

  secondary: '#25D366',
  secondaryHover: '#1DA851',
  secondaryLight: '#E8F5E8',

  accent: '#34B7F1',
  accentHover: '#2AA3DC',
  accentLight: '#E8F4FD',

  sentMessage: '#DCF8C6',
  receivedMessage: '#FFFFFF',
  messageText: '#303030',
  messageTextLight: '#667781',

  success: '#25D366',
  warning: '#FFC107',
  error: '#DC3545',
  info: '#34B7F1',

  background: '#F0F2F5',
  backgroundSecondary: '#E5DDD5',
  backgroundTertiary: '#DDDBD1',
  surface: '#FFFFFF',
  surfaceLight: '#F8F9FA',

  textPrimary: '#111B21',
  textSecondary: '#667781',
  textTertiary: '#8696A0',
  textInverse: '#FFFFFF',

  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  borderDark: '#CCCCCC',

  hover: 'rgba(7, 94, 84, 0.1)',
  active: 'rgba(7, 94, 84, 0.2)',
  focus: 'rgba(7, 94, 84, 0.3)',

  online: '#4FC3F7',
  offline: '#94A3B8',
};

export const DISCORD_THEME: ThemeColors = {
  primary: '#5865F2',
  primaryHover: '#4752C4',
  primaryActive: '#3C45A5',
  primaryLight: '#E8E9FE',
  primaryDark: '#2F3349',

  secondary: '#57F287',
  secondaryHover: '#4ADE80',
  secondaryLight: '#E8F5E8',

  accent: '#FEE75C',
  accentHover: '#FED02F',
  accentLight: '#FFFAED',

  sentMessage: '#5865F2',
  receivedMessage: '#2B2D31',
  messageText: '#DBDEE1',
  messageTextLight: '#B5BAC1',

  success: '#23A55A',
  warning: '#F0B232',
  error: '#F23F42',
  info: '#00A8FC',

  background: '#313338',
  backgroundSecondary: '#2B2D31',
  backgroundTertiary: '#1E1F22',
  surface: '#383A40',
  surfaceLight: '#404249',

  textPrimary: '#F2F3F5',
  textSecondary: '#B5BAC1',
  textTertiary: '#80848E',
  textInverse: '#060607',

  border: '#3F4147',
  borderLight: '#4E5058',
  borderDark: '#2B2D31',

  hover: 'rgba(88, 101, 242, 0.1)',
  active: 'rgba(88, 101, 242, 0.2)',
  focus: 'rgba(88, 101, 242, 0.3)',

  online: '#23A55A',
  offline: '#80848E',
};

// Current active theme - change this to switch themes
export const CURRENT_THEME: ThemeColors = STRIPE_THEME;

// Theme names for settings
export const THEME_NAMES = {
  STRIPE: 'STRIPE',
  WHATSAPP: 'WHATSAPP',
  DISCORD: 'DISCORD',
} as const;

export type ThemeName = keyof typeof THEME_NAMES;

// Function to get theme by name
export const getThemeByName = (themeName: ThemeName): ThemeColors => {
  switch (themeName) {
    case 'STRIPE':
      return STRIPE_THEME;
    case 'WHATSAPP':
      return WHATSAPP_THEME;
    case 'DISCORD':
      return DISCORD_THEME;
    default:
      return STRIPE_THEME;
  }
};

// CSS Custom Properties Generator
export const generateCSSCustomProperties = (theme: ThemeColors): string => {
  return `
    :root {
      --color-primary: ${theme.primary};
      --color-primary-hover: ${theme.primaryHover};
      --color-primary-active: ${theme.primaryActive};
      --color-primary-light: ${theme.primaryLight};
      --color-primary-dark: ${theme.primaryDark};
      
      --color-secondary: ${theme.secondary};
      --color-secondary-hover: ${theme.secondaryHover};
      --color-secondary-light: ${theme.secondaryLight};
      
      --color-accent: ${theme.accent};
      --color-accent-hover: ${theme.accentHover};
      --color-accent-light: ${theme.accentLight};
      
      --color-sent-message: ${theme.sentMessage};
      --color-received-message: ${theme.receivedMessage};
      --color-message-text: ${theme.messageText};
      --color-message-text-light: ${theme.messageTextLight};
      
      --color-success: ${theme.success};
      --color-warning: ${theme.warning};
      --color-error: ${theme.error};
      --color-info: ${theme.info};
      
      --color-background: ${theme.background};
      --color-background-secondary: ${theme.backgroundSecondary};
      --color-background-tertiary: ${theme.backgroundTertiary};
      --color-surface: ${theme.surface};
      --color-surface-light: ${theme.surfaceLight};
      
      --color-text-primary: ${theme.textPrimary};
      --color-text-secondary: ${theme.textSecondary};
      --color-text-tertiary: ${theme.textTertiary};
      --color-text-inverse: ${theme.textInverse};
      
      --color-border: ${theme.border};
      --color-border-light: ${theme.borderLight};
      --color-border-dark: ${theme.borderDark};
      
      --color-hover: ${theme.hover};
      --color-active: ${theme.active};
      --color-focus: ${theme.focus};
      
      --color-online: ${theme.online};
      --color-offline: ${theme.offline};
    }
  `;
};

// Export default theme
export default CURRENT_THEME;
