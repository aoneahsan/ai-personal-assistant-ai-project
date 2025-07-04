import {
  AdminSettings,
  adminSettingsService,
} from '@/services/adminSettingsService';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Chip } from 'primereact/chip';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Dropdown } from 'primereact/dropdown';
import { Fieldset } from 'primereact/fieldset';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { InputTextarea } from 'primereact/inputtextarea';
import { TabPanel, TabView } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';

export const SettingsManagement: React.FC = () => {
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [originalSettings, setOriginalSettings] =
    useState<AdminSettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings && originalSettings) {
      const hasChanges =
        JSON.stringify(settings) !== JSON.stringify(originalSettings);
      setHasChanges(hasChanges);
    }
  }, [settings, originalSettings]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const currentSettings = await adminSettingsService.getSettings();
      setSettings(currentSettings);
      setOriginalSettings(JSON.parse(JSON.stringify(currentSettings)));
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load settings',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      await adminSettingsService.saveSettings(settings);
      setOriginalSettings(JSON.parse(JSON.stringify(settings)));
      setHasChanges(false);

      toast.current?.show({
        severity: 'success',
        summary: 'Settings Saved',
        detail: 'Settings have been successfully updated',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save settings',
      });
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    if (originalSettings) {
      setSettings(JSON.parse(JSON.stringify(originalSettings)));
    }
  };

  const updateSettings = (path: string, value: any) => {
    if (!settings) return;

    const newSettings = { ...settings };
    const keys = path.split('.');
    let current: any = newSettings;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setSettings(newSettings);
  };

  if (loading || !settings) {
    return (
      <div className='flex justify-center items-center h-64'>
        <i className='pi pi-spin pi-spinner text-4xl' />
      </div>
    );
  }

  return (
    <div className='settings-management'>
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h2 className='text-2xl font-bold'>System Settings</h2>
          <p className='text-gray-600'>
            Configure system-wide settings and preferences
          </p>
        </div>
        <div className='flex gap-2'>
          {hasChanges && (
            <Badge
              value='Unsaved Changes'
              severity='warning'
            />
          )}
          <Button
            label='Reset'
            icon='pi pi-undo'
            className='p-button-outlined'
            onClick={resetSettings}
            disabled={!hasChanges}
          />
          <Button
            label='Save Settings'
            icon='pi pi-save'
            onClick={saveSettings}
            loading={saving}
            disabled={!hasChanges}
          />
        </div>
      </div>

      <TabView
        activeIndex={activeTab}
        onTabChange={(e) => setActiveTab(e.index)}
      >
        {/* System Settings */}
        <TabPanel
          header='System'
          leftIcon='pi pi-cog'
        >
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Fieldset legend='General System'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <label htmlFor='maintenanceMode'>Maintenance Mode</label>
                  <InputSwitch
                    inputId='maintenanceMode'
                    checked={settings.system.maintenanceMode}
                    onChange={(e) =>
                      updateSettings('system.maintenanceMode', e.value)
                    }
                  />
                </div>

                <div>
                  <label className='block mb-2'>Maintenance Message</label>
                  <InputTextarea
                    value={settings.system.maintenanceMessage}
                    onChange={(e) =>
                      updateSettings(
                        'system.maintenanceMessage',
                        e.target.value
                      )
                    }
                    rows={3}
                    className='w-full'
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <label htmlFor='debugMode'>Debug Mode</label>
                  <InputSwitch
                    inputId='debugMode'
                    checked={settings.system.debugMode}
                    onChange={(e) =>
                      updateSettings('system.debugMode', e.value)
                    }
                  />
                </div>

                <div>
                  <label className='block mb-2'>Logging Level</label>
                  <Dropdown
                    value={settings.system.loggingLevel}
                    options={[
                      { label: 'Error', value: 'error' },
                      { label: 'Warning', value: 'warn' },
                      { label: 'Info', value: 'info' },
                      { label: 'Debug', value: 'debug' },
                    ]}
                    onChange={(e) =>
                      updateSettings('system.loggingLevel', e.value)
                    }
                    className='w-full'
                  />
                </div>

                <div>
                  <label className='block mb-2'>Environment</label>
                  <Dropdown
                    value={settings.system.environment}
                    options={[
                      { label: 'Development', value: 'development' },
                      { label: 'Staging', value: 'staging' },
                      { label: 'Production', value: 'production' },
                    ]}
                    onChange={(e) =>
                      updateSettings('system.environment', e.value)
                    }
                    className='w-full'
                  />
                </div>
              </div>
            </Fieldset>

            <Fieldset legend='Performance'>
              <div className='space-y-4'>
                <div>
                  <label className='block mb-2'>
                    Short Cache Duration (minutes)
                  </label>
                  <InputNumber
                    value={settings.timing.shortCacheDuration / (1000 * 60)}
                    onValueChange={(e) =>
                      updateSettings(
                        'timing.shortCacheDuration',
                        (e.value || 0) * 1000 * 60
                      )
                    }
                    min={1}
                    max={60}
                    className='w-full'
                  />
                </div>

                <div>
                  <label className='block mb-2'>
                    Medium Cache Duration (hours)
                  </label>
                  <InputNumber
                    value={
                      settings.timing.mediumCacheDuration / (1000 * 60 * 60)
                    }
                    onValueChange={(e) =>
                      updateSettings(
                        'timing.mediumCacheDuration',
                        (e.value || 0) * 1000 * 60 * 60
                      )
                    }
                    min={1}
                    max={24}
                    className='w-full'
                  />
                </div>

                <div>
                  <label className='block mb-2'>
                    Long Cache Duration (days)
                  </label>
                  <InputNumber
                    value={
                      settings.timing.longCacheDuration / (1000 * 60 * 60 * 24)
                    }
                    onValueChange={(e) =>
                      updateSettings(
                        'timing.longCacheDuration',
                        (e.value || 0) * 1000 * 60 * 60 * 24
                      )
                    }
                    min={1}
                    max={30}
                    className='w-full'
                  />
                </div>
              </div>
            </Fieldset>
          </div>
        </TabPanel>

        {/* Feature Flags */}
        <TabPanel
          header='Features'
          leftIcon='pi pi-flag'
        >
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Fieldset legend='Core Features'>
              <div className='space-y-4'>
                {Object.entries(settings.features)
                  .slice(0, 6)
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className='flex items-center justify-between'
                    >
                      <label
                        htmlFor={key}
                        className='capitalize'
                      >
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <InputSwitch
                        inputId={key}
                        checked={value}
                        onChange={(e) =>
                          updateSettings(`features.${key}`, e.value)
                        }
                      />
                    </div>
                  ))}
              </div>
            </Fieldset>

            <Fieldset legend='Advanced Features'>
              <div className='space-y-4'>
                {Object.entries(settings.features)
                  .slice(6)
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className='flex items-center justify-between'
                    >
                      <label
                        htmlFor={key}
                        className='capitalize'
                      >
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <InputSwitch
                        inputId={key}
                        checked={value}
                        onChange={(e) =>
                          updateSettings(`features.${key}`, e.value)
                        }
                      />
                    </div>
                  ))}
              </div>
            </Fieldset>
          </div>
        </TabPanel>

        {/* UI Settings */}
        <TabPanel
          header='UI/UX'
          leftIcon='pi pi-palette'
        >
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Fieldset legend='Widget Dimensions'>
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block mb-2'>Default Width</label>
                    <InputNumber
                      value={settings.ui.widgetDefaultWidth}
                      onValueChange={(e) =>
                        updateSettings('ui.widgetDefaultWidth', e.value)
                      }
                      min={200}
                      max={800}
                      className='w-full'
                    />
                  </div>
                  <div>
                    <label className='block mb-2'>Default Height</label>
                    <InputNumber
                      value={settings.ui.widgetDefaultHeight}
                      onValueChange={(e) =>
                        updateSettings('ui.widgetDefaultHeight', e.value)
                      }
                      min={300}
                      max={1000}
                      className='w-full'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block mb-2'>Min Width</label>
                    <InputNumber
                      value={settings.ui.widgetMinWidth}
                      onValueChange={(e) =>
                        updateSettings('ui.widgetMinWidth', e.value)
                      }
                      min={150}
                      max={400}
                      className='w-full'
                    />
                  </div>
                  <div>
                    <label className='block mb-2'>Min Height</label>
                    <InputNumber
                      value={settings.ui.widgetMinHeight}
                      onValueChange={(e) =>
                        updateSettings('ui.widgetMinHeight', e.value)
                      }
                      min={200}
                      max={500}
                      className='w-full'
                    />
                  </div>
                </div>
              </div>
            </Fieldset>

            <Fieldset legend='Theme Settings'>
              <div className='space-y-4'>
                <div>
                  <label className='block mb-2'>Default Theme</label>
                  <Dropdown
                    value={settings.ui.defaultTheme}
                    options={[
                      { label: 'Light', value: 'light' },
                      { label: 'Dark', value: 'dark' },
                      { label: 'System', value: 'system' },
                    ]}
                    onChange={(e) => updateSettings('ui.defaultTheme', e.value)}
                    className='w-full'
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <label htmlFor='allowThemeSwitching'>
                    Allow Theme Switching
                  </label>
                  <InputSwitch
                    inputId='allowThemeSwitching'
                    checked={settings.ui.allowThemeSwitching}
                    onChange={(e) =>
                      updateSettings('ui.allowThemeSwitching', e.value)
                    }
                  />
                </div>

                <div>
                  <label className='block mb-2'>Custom Themes</label>
                  <div className='flex flex-wrap gap-2'>
                    {settings.ui.customThemes.map((theme, index) => (
                      <Chip
                        key={index}
                        label={theme}
                        removable
                        onRemove={() => {
                          const newThemes = settings.ui.customThemes.filter(
                            (_, i) => i !== index
                          );
                          updateSettings('ui.customThemes', newThemes);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Fieldset>
          </div>
        </TabPanel>

        {/* Validation Rules */}
        <TabPanel
          header='Validation'
          leftIcon='pi pi-check-circle'
        >
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Fieldset legend='Text Limits'>
              <div className='space-y-4'>
                <div>
                  <label className='block mb-2'>Room Name Length</label>
                  <InputNumber
                    value={settings.validation.roomNameLength}
                    onValueChange={(e) =>
                      updateSettings('validation.roomNameLength', e.value)
                    }
                    min={3}
                    max={50}
                    className='w-full'
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block mb-2'>Username Min</label>
                    <InputNumber
                      value={settings.validation.userNameMin}
                      onValueChange={(e) =>
                        updateSettings('validation.userNameMin', e.value)
                      }
                      min={2}
                      max={10}
                      className='w-full'
                    />
                  </div>
                  <div>
                    <label className='block mb-2'>Username Max</label>
                    <InputNumber
                      value={settings.validation.userNameMax}
                      onValueChange={(e) =>
                        updateSettings('validation.userNameMax', e.value)
                      }
                      min={10}
                      max={50}
                      className='w-full'
                    />
                  </div>
                </div>

                <div>
                  <label className='block mb-2'>Message Max Length</label>
                  <InputNumber
                    value={settings.validation.messageMax}
                    onValueChange={(e) =>
                      updateSettings('validation.messageMax', e.value)
                    }
                    min={100}
                    max={5000}
                    className='w-full'
                  />
                </div>
              </div>
            </Fieldset>

            <Fieldset legend='Numeric Limits'>
              <div className='space-y-4'>
                <div>
                  <label className='block mb-2'>Retry Attempts</label>
                  <InputNumber
                    value={settings.validation.retryAttempts}
                    onValueChange={(e) =>
                      updateSettings('validation.retryAttempts', e.value)
                    }
                    min={1}
                    max={10}
                    className='w-full'
                  />
                </div>

                <div>
                  <label className='block mb-2'>Max Login Attempts</label>
                  <InputNumber
                    value={settings.validation.maxLoginAttempts}
                    onValueChange={(e) =>
                      updateSettings('validation.maxLoginAttempts', e.value)
                    }
                    min={3}
                    max={20}
                    className='w-full'
                  />
                </div>

                <div>
                  <label className='block mb-2'>Default Page Size</label>
                  <InputNumber
                    value={settings.validation.defaultPageSize}
                    onValueChange={(e) =>
                      updateSettings('validation.defaultPageSize', e.value)
                    }
                    min={5}
                    max={100}
                    className='w-full'
                  />
                </div>
              </div>
            </Fieldset>
          </div>
        </TabPanel>

        {/* Business Rules */}
        <TabPanel
          header='Business'
          leftIcon='pi pi-dollar'
        >
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Fieldset legend='Subscription Limits'>
              <div className='space-y-4'>
                <div>
                  <label className='block mb-2'>Free Message Limit</label>
                  <InputNumber
                    value={settings.business.freeMessageLimit}
                    onValueChange={(e) =>
                      updateSettings('business.freeMessageLimit', e.value)
                    }
                    min={10}
                    max={1000}
                    className='w-full'
                  />
                </div>

                <div>
                  <label className='block mb-2'>Pro Message Limit</label>
                  <InputNumber
                    value={settings.business.proMessageLimit}
                    onValueChange={(e) =>
                      updateSettings('business.proMessageLimit', e.value)
                    }
                    min={1000}
                    max={50000}
                    className='w-full'
                  />
                </div>

                <div>
                  <label className='block mb-2'>Premium Message Limit</label>
                  <InputNumber
                    value={settings.business.premiumMessageLimit}
                    onValueChange={(e) =>
                      updateSettings('business.premiumMessageLimit', e.value)
                    }
                    min={10000}
                    max={1000000}
                    className='w-full'
                  />
                </div>
              </div>
            </Fieldset>

            <Fieldset legend='Feature Limits'>
              <div className='space-y-4'>
                <div>
                  <label className='block mb-2'>Max Embeds (Free)</label>
                  <InputNumber
                    value={settings.business.maxEmbedsFree}
                    onValueChange={(e) =>
                      updateSettings('business.maxEmbedsFree', e.value)
                    }
                    min={1}
                    max={10}
                    className='w-full'
                  />
                </div>

                <div>
                  <label className='block mb-2'>Max Embeds (Pro)</label>
                  <InputNumber
                    value={settings.business.maxEmbedsPro}
                    onValueChange={(e) =>
                      updateSettings('business.maxEmbedsPro', e.value)
                    }
                    min={5}
                    max={50}
                    className='w-full'
                  />
                </div>

                <div>
                  <label className='block mb-2'>
                    Max Participants per Room
                  </label>
                  <InputNumber
                    value={settings.business.maxParticipantsRoom}
                    onValueChange={(e) =>
                      updateSettings('business.maxParticipantsRoom', e.value)
                    }
                    min={2}
                    max={1000}
                    className='w-full'
                  />
                </div>
              </div>
            </Fieldset>
          </div>
        </TabPanel>

        {/* Security Settings */}
        <TabPanel
          header='Security'
          leftIcon='pi pi-shield'
        >
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Fieldset legend='Password Policy'>
              <div className='space-y-4'>
                <div>
                  <label className='block mb-2'>Minimum Length</label>
                  <InputNumber
                    value={settings.security.passwordComplexity.minLength}
                    onValueChange={(e) =>
                      updateSettings(
                        'security.passwordComplexity.minLength',
                        e.value
                      )
                    }
                    min={6}
                    max={32}
                    className='w-full'
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <label htmlFor='requireUppercase'>Require Uppercase</label>
                  <InputSwitch
                    inputId='requireUppercase'
                    checked={
                      settings.security.passwordComplexity.requireUppercase
                    }
                    onChange={(e) =>
                      updateSettings(
                        'security.passwordComplexity.requireUppercase',
                        e.value
                      )
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <label htmlFor='requireNumbers'>Require Numbers</label>
                  <InputSwitch
                    inputId='requireNumbers'
                    checked={
                      settings.security.passwordComplexity.requireNumbers
                    }
                    onChange={(e) =>
                      updateSettings(
                        'security.passwordComplexity.requireNumbers',
                        e.value
                      )
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <label htmlFor='requireSpecialChars'>
                    Require Special Characters
                  </label>
                  <InputSwitch
                    inputId='requireSpecialChars'
                    checked={
                      settings.security.passwordComplexity.requireSpecialChars
                    }
                    onChange={(e) =>
                      updateSettings(
                        'security.passwordComplexity.requireSpecialChars',
                        e.value
                      )
                    }
                  />
                </div>
              </div>
            </Fieldset>

            <Fieldset legend='Session & File Security'>
              <div className='space-y-4'>
                <div>
                  <label className='block mb-2'>Session Duration (hours)</label>
                  <InputNumber
                    value={settings.security.sessionDuration / (1000 * 60 * 60)}
                    onValueChange={(e) =>
                      updateSettings(
                        'security.sessionDuration',
                        (e.value || 0) * 1000 * 60 * 60
                      )
                    }
                    min={1}
                    max={168}
                    className='w-full'
                  />
                </div>

                <div>
                  <label className='block mb-2'>Max File Size (MB)</label>
                  <InputNumber
                    value={settings.security.maxFileSize / (1024 * 1024)}
                    onValueChange={(e) =>
                      updateSettings(
                        'security.maxFileSize',
                        (e.value || 0) * 1024 * 1024
                      )
                    }
                    min={1}
                    max={500}
                    className='w-full'
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <label htmlFor='virusScanEnabled'>Virus Scan Enabled</label>
                  <InputSwitch
                    inputId='virusScanEnabled'
                    checked={settings.security.virusScanEnabled}
                    onChange={(e) =>
                      updateSettings('security.virusScanEnabled', e.value)
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <label htmlFor='contentModerationEnabled'>
                    Content Moderation
                  </label>
                  <InputSwitch
                    inputId='contentModerationEnabled'
                    checked={settings.security.contentModerationEnabled}
                    onChange={(e) =>
                      updateSettings(
                        'security.contentModerationEnabled',
                        e.value
                      )
                    }
                  />
                </div>
              </div>
            </Fieldset>
          </div>
        </TabPanel>
      </TabView>
    </div>
  );
};
