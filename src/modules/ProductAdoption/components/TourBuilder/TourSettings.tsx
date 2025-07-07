import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { ColorPicker } from 'primereact/colorpicker';
import { Checkbox } from 'primereact/checkbox';
import { Card } from 'primereact/card';
import { TourSettings as TourSettingsType } from '../../types';
import './TourSettings.scss';

interface TourSettingsProps {
  settings: TourSettingsType;
  onChange: (settings: TourSettingsType) => void;
}

export const TourSettings: React.FC<TourSettingsProps> = ({
  settings,
  onChange,
}) => {
  const updateTheme = (updates: Partial<TourSettingsType['theme']>) => {
    onChange({
      ...settings,
      theme: { ...settings.theme, ...updates },
    });
  };

  const updateNavigation = (updates: Partial<TourSettingsType['navigation']>) => {
    onChange({
      ...settings,
      navigation: { ...settings.navigation, ...updates },
    });
  };

  const updateCompletion = (updates: Partial<TourSettingsType['completion']>) => {
    onChange({
      ...settings,
      completion: { ...settings.completion, ...updates },
    });
  };

  return (
    <div className="tour-settings">
      <Card title="Theme Settings" className="settings-card">
        <div className="p-fluid">
          <div className="p-grid">
            <div className="p-col-6">
              <div className="p-field">
                <label htmlFor="primary-color">Primary Color</label>
                <div className="color-picker-field">
                  <ColorPicker
                    id="primary-color"
                    value={settings.theme.primaryColor}
                    onChange={(e) => updateTheme({ primaryColor: `#${e.value}` })}
                  />
                  <InputText
                    value={settings.theme.primaryColor}
                    onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="p-col-6">
              <div className="p-field">
                <label htmlFor="text-color">Text Color</label>
                <div className="color-picker-field">
                  <ColorPicker
                    id="text-color"
                    value={settings.theme.textColor}
                    onChange={(e) => updateTheme({ textColor: `#${e.value}` })}
                  />
                  <InputText
                    value={settings.theme.textColor}
                    onChange={(e) => updateTheme({ textColor: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="p-col-6">
              <div className="p-field">
                <label htmlFor="bg-color">Background Color</label>
                <div className="color-picker-field">
                  <ColorPicker
                    id="bg-color"
                    value={settings.theme.backgroundColor}
                    onChange={(e) => updateTheme({ backgroundColor: `#${e.value}` })}
                  />
                  <InputText
                    value={settings.theme.backgroundColor}
                    onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="p-col-6">
              <div className="p-field">
                <label htmlFor="overlay-color">Overlay Color</label>
                <div className="color-picker-field">
                  <ColorPicker
                    id="overlay-color"
                    value={settings.theme.overlayColor}
                    onChange={(e) => updateTheme({ overlayColor: `#${e.value}` })}
                  />
                  <InputText
                    value={settings.theme.overlayColor}
                    onChange={(e) => updateTheme({ overlayColor: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="p-col-6">
              <div className="p-field">
                <label htmlFor="overlay-opacity">Overlay Opacity</label>
                <InputNumber
                  id="overlay-opacity"
                  value={settings.theme.overlayOpacity}
                  onChange={(e) => updateTheme({ overlayOpacity: e.value || 0 })}
                  min={0}
                  max={1}
                  step={0.1}
                  mode="decimal"
                  minFractionDigits={1}
                  maxFractionDigits={1}
                />
              </div>
            </div>
            <div className="p-col-6">
              <div className="p-field">
                <label htmlFor="border-radius">Border Radius</label>
                <InputNumber
                  id="border-radius"
                  value={settings.theme.borderRadius}
                  onChange={(e) => updateTheme({ borderRadius: e.value || 0 })}
                  min={0}
                  suffix=" px"
                />
              </div>
            </div>
            <div className="p-col-6">
              <div className="p-field">
                <label htmlFor="z-index">Z-Index</label>
                <InputNumber
                  id="z-index"
                  value={settings.theme.zIndex}
                  onChange={(e) => updateTheme({ zIndex: e.value || 9999 })}
                  min={1}
                />
              </div>
            </div>
            <div className="p-col-6">
              <div className="p-field">
                <label htmlFor="font-family">Font Family</label>
                <InputText
                  id="font-family"
                  value={settings.theme.fontFamily || ''}
                  onChange={(e) => updateTheme({ fontFamily: e.target.value })}
                  placeholder="e.g., Arial, sans-serif"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Navigation Settings" className="settings-card">
        <div className="settings-checkboxes">
          <div className="p-field-checkbox">
            <Checkbox
              inputId="show-progress"
              checked={settings.navigation.showProgressBar}
              onChange={(e) => updateNavigation({ showProgressBar: e.checked })}
            />
            <label htmlFor="show-progress">Show Progress Bar</label>
          </div>
          <div className="p-field-checkbox">
            <Checkbox
              inputId="show-numbers"
              checked={settings.navigation.showStepNumbers}
              onChange={(e) => updateNavigation({ showStepNumbers: e.checked })}
            />
            <label htmlFor="show-numbers">Show Step Numbers</label>
          </div>
          <div className="p-field-checkbox">
            <Checkbox
              inputId="keyboard-nav"
              checked={settings.navigation.allowKeyboardNavigation}
              onChange={(e) => updateNavigation({ allowKeyboardNavigation: e.checked })}
            />
            <label htmlFor="keyboard-nav">Allow Keyboard Navigation</label>
          </div>
          <div className="p-field-checkbox">
            <Checkbox
              inputId="show-close"
              checked={settings.navigation.showCloseButton}
              onChange={(e) => updateNavigation({ showCloseButton: e.checked })}
            />
            <label htmlFor="show-close">Show Close Button</label>
          </div>
          <div className="p-field-checkbox">
            <Checkbox
              inputId="show-skip"
              checked={settings.navigation.showSkipButton}
              onChange={(e) => updateNavigation({ showSkipButton: e.checked })}
            />
            <label htmlFor="show-skip">Show Skip Button</label>
          </div>
        </div>
      </Card>

      <Card title="Completion Settings" className="settings-card">
        <div className="p-fluid">
          <div className="p-field-checkbox">
            <Checkbox
              inputId="show-completion"
              checked={settings.completion.showCompletionMessage}
              onChange={(e) => updateCompletion({ showCompletionMessage: e.checked })}
            />
            <label htmlFor="show-completion">Show Completion Message</label>
          </div>
          {settings.completion.showCompletionMessage && (
            <div className="p-field">
              <label htmlFor="completion-message">Completion Message</label>
              <InputText
                id="completion-message"
                value={settings.completion.completionMessage || ''}
                onChange={(e) => updateCompletion({ completionMessage: e.target.value })}
                placeholder="Congratulations! You've completed the tour."
              />
            </div>
          )}
          <div className="p-field">
            <label htmlFor="redirect-url">Redirect URL (Optional)</label>
            <InputText
              id="redirect-url"
              value={settings.completion.redirectUrl || ''}
              onChange={(e) => updateCompletion({ redirectUrl: e.target.value })}
              placeholder="https://example.com/next-steps"
            />
          </div>
          <div className="p-field-checkbox">
            <Checkbox
              inputId="track-completion"
              checked={settings.completion.trackCompletion}
              onChange={(e) => updateCompletion({ trackCompletion: e.checked })}
            />
            <label htmlFor="track-completion">Track Completion Analytics</label>
          </div>
        </div>
      </Card>
    </div>
  );
};