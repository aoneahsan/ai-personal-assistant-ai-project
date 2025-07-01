import useTheme from '@/hooks/useTheme';
import {
  DISCORD_THEME,
  STRIPE_THEME,
  ThemeName,
  WHATSAPP_THEME,
} from '@/utils/constants/theme/colors';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { useState } from 'react';

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
            : '2px solid #e2e8f0',
          transition: 'all 0.2s ease',
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
              border: '2px solid white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          />
          <div className='flex-1'>
            <h4 className='m-0 mb-1 text-lg font-semibold text-gray-800'>
              {option.label}
            </h4>
            <p className='m-0 text-sm text-gray-600 line-height-3'>
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

  return (
    <Dialog
      header='Theme Settings'
      visible={visible}
      style={{ width: '500px' }}
      onHide={onHide}
      modal
      className='theme-settings-dialog'
    >
      <div className='theme-settings-content'>
        <div className='mb-4'>
          <h3 className='text-xl font-semibold mb-2 text-gray-800'>
            Choose Your Theme
          </h3>
          <p className='text-gray-600 mb-4 line-height-3'>
            Select a theme that matches your style. The changes will be applied
            instantly and you can switch between themes anytime.
          </p>
        </div>

        {/* Current Theme Info */}
        <div className='current-theme-info mb-4 p-3 bg-blue-50 border-round'>
          <div className='flex align-items-center gap-3'>
            <i className='pi pi-palette text-blue-600 text-xl' />
            <div>
              <strong className='text-blue-800'>Current Theme:</strong>
              <span className='ml-2 text-blue-700'>
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
        <div className='developer-note mt-4 p-3 bg-gray-50 border-round'>
          <div className='flex align-items-start gap-2'>
            <i className='pi pi-info-circle text-gray-500 mt-1' />
            <div>
              <strong className='text-gray-700'>Developer Note:</strong>
              <p className='text-gray-600 text-sm mt-1 mb-0 line-height-3'>
                To change the default theme, update the{' '}
                <code>CURRENT_THEME</code> constant in{' '}
                <code>src/utils/constants/theme/colors.ts</code>. You can also
                create new custom themes by adding them to the same file.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex justify-content-end gap-2 mt-4 pt-3 border-top-1 border-gray-200'>
          <Button
            label='Close'
            icon='pi pi-times'
            className='p-button-outlined'
            onClick={onHide}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default ThemeSettings;
