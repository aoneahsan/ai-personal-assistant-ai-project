import useTheme from '@/hooks/useTheme';
import {
  DISCORD_THEME,
  STRIPE_THEME,
  ThemeName,
  WHATSAPP_THEME,
  getThemeByName,
} from '@/utils/constants/theme/colors';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { useState } from 'react';
import './ThemeSettings.scss';

interface ThemeSettingsProps {
  visible: boolean;
  onHide: () => void;
}

interface ThemeOption {
  label: string;
  value: ThemeName;
  description: string;
  primaryColor: string;
}

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ visible, onHide }) => {
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>('STRIPE');

  // Initialize theme with current selection
  const { theme } = useTheme(selectedTheme);

  // Get current theme colors for dynamic styling
  const currentThemeColors = getThemeByName(selectedTheme);

  const themeOptions: ThemeOption[] = [
    {
      label: 'Stripe (Modern Purple)',
      value: 'STRIPE',
      description:
        "Clean, modern design with Stripe's signature purple color scheme",
      primaryColor: STRIPE_THEME.primary,
    },
    {
      label: 'WhatsApp (Classic Green)',
      value: 'WHATSAPP',
      description:
        'Traditional WhatsApp-style green theme for familiar experience',
      primaryColor: WHATSAPP_THEME.primary,
    },
    {
      label: 'Discord (Gaming Blue)',
      value: 'DISCORD',
      description: "Dark theme with Discord's blue accents, perfect for gamers",
      primaryColor: DISCORD_THEME.primary,
    },
  ];

  const handleThemeChange = (newTheme: ThemeName) => {
    setSelectedTheme(newTheme);
  };

  const getCurrentThemeInfo = () => {
    return themeOptions.find((option) => option.value === selectedTheme);
  };

  const renderThemeOption = (option: ThemeOption) => {
    const isSelected = selectedTheme === option.value;

    return (
      <Card
        key={option.value}
        className={`theme-option-card ${isSelected ? 'selected' : ''}`}
        onClick={() => handleThemeChange(option.value)}
        style={{
          cursor: 'pointer',
          marginBottom: '16px',
          border: isSelected
            ? `2px solid ${option.primaryColor}`
            : `2px solid ${currentThemeColors.border}`,
          transition: 'all 0.2s ease',
          backgroundColor: currentThemeColors.surface,
          color: currentThemeColors.textPrimary,
        }}
      >
        <div className='flex align-items-center gap-3'>
          <div
            className='theme-color-preview'
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: option.primaryColor,
              border: `2px solid ${currentThemeColors.surface}`,
              boxShadow: `0 2px 8px ${currentThemeColors.hover}`,
            }}
          />
          <div className='flex-1'>
            <h4
              className='m-0 mb-1 text-lg font-semibold'
              style={{ color: currentThemeColors.textPrimary }}
            >
              {option.label}
            </h4>
            <p
              className='m-0 text-sm line-height-3'
              style={{ color: currentThemeColors.textSecondary }}
            >
              {option.description}
            </p>
          </div>
          {isSelected && (
            <i
              className='pi pi-check-circle text-xl'
              style={{ color: option.primaryColor }}
            />
          )}
        </div>
      </Card>
    );
  };

  // Dynamic dialog styles based on theme
  const dialogStyle = {
    backgroundColor: currentThemeColors.surface,
    color: currentThemeColors.textPrimary,
    border: `1px solid ${currentThemeColors.border}`,
  };

  const dialogHeaderStyle = {
    backgroundColor: currentThemeColors.background,
    color: currentThemeColors.textPrimary,
    borderBottom: `1px solid ${currentThemeColors.border}`,
  };

  return (
    <Dialog
      header='Theme Settings'
      visible={visible}
      style={{ width: '500px' }}
      onHide={onHide}
      modal
      className={`theme-settings-dialog`}
      contentStyle={dialogStyle}
      headerStyle={dialogHeaderStyle}
      data-theme={selectedTheme.toLowerCase()}
    >
      <div className='theme-settings-content'>
        <div className='mb-4'>
          <h3
            className='text-xl font-semibold mb-2'
            style={{ color: currentThemeColors.textPrimary }}
          >
            Choose Your Theme
          </h3>
          <p
            className='mb-4 line-height-3'
            style={{ color: currentThemeColors.textSecondary }}
          >
            Select a theme that matches your style. The changes will be applied
            instantly and you can switch between themes anytime.
          </p>
        </div>

        {/* Current Theme Info */}
        <div
          className='current-theme-info mb-4 p-3 border-round'
          style={{
            backgroundColor:
              selectedTheme === 'DISCORD'
                ? currentThemeColors.backgroundTertiary
                : currentThemeColors.primaryLight,
            border: `1px solid ${currentThemeColors.border}`,
          }}
        >
          <div className='flex align-items-center gap-3'>
            <i
              className='pi pi-palette text-xl'
              style={{
                color:
                  selectedTheme === 'DISCORD'
                    ? currentThemeColors.primary
                    : currentThemeColors.primary,
              }}
            />
            <div>
              <strong
                style={{
                  color:
                    selectedTheme === 'DISCORD'
                      ? currentThemeColors.textPrimary
                      : currentThemeColors.primary,
                }}
              >
                Current Theme:
              </strong>
              <span
                className='ml-2'
                style={{
                  color:
                    selectedTheme === 'DISCORD'
                      ? currentThemeColors.textSecondary
                      : currentThemeColors.primaryDark,
                }}
              >
                {getCurrentThemeInfo()?.label}
              </span>
            </div>
          </div>
        </div>

        {/* Theme Options */}
        <div className='theme-options'>
          {themeOptions.map(renderThemeOption)}
        </div>

        {/* Developer Note */}
        <div
          className='developer-note mt-4 p-3 border-round'
          style={{
            backgroundColor: currentThemeColors.backgroundSecondary,
            border: `1px solid ${currentThemeColors.border}`,
          }}
        >
          <div className='flex align-items-start gap-2'>
            <i
              className='pi pi-info-circle mt-1'
              style={{ color: currentThemeColors.textTertiary }}
            />
            <div>
              <strong style={{ color: currentThemeColors.textPrimary }}>
                Developer Note:
              </strong>
              <p
                className='text-sm mt-1 mb-0 line-height-3'
                style={{ color: currentThemeColors.textSecondary }}
              >
                To change the default theme, update the{' '}
                <code
                  style={{
                    backgroundColor: currentThemeColors.backgroundTertiary,
                    color: currentThemeColors.primary,
                    padding: '2px 4px',
                    borderRadius: '3px',
                    fontSize: '0.85em',
                  }}
                >
                  CURRENT_THEME
                </code>{' '}
                constant in{' '}
                <code
                  style={{
                    backgroundColor: currentThemeColors.backgroundTertiary,
                    color: currentThemeColors.primary,
                    padding: '2px 4px',
                    borderRadius: '3px',
                    fontSize: '0.85em',
                  }}
                >
                  src/utils/constants/theme/colors.ts
                </code>
                . You can also create new custom themes by adding them to the
                same file.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className='flex justify-content-end gap-2 mt-4 pt-3'
          style={{ borderTop: `1px solid ${currentThemeColors.border}` }}
        >
          <Button
            label='Close'
            icon='pi pi-times'
            className='p-button-outlined'
            onClick={onHide}
            style={{
              borderColor: currentThemeColors.border,
              color: currentThemeColors.textSecondary,
              backgroundColor: 'transparent',
            }}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default ThemeSettings;
