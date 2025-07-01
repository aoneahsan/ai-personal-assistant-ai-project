import { unifiedAuthService } from '@/services/authService';
import { Capacitor } from '@capacitor/core';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Panel } from 'primereact/panel';
import React from 'react';

interface AuthDebugInfoProps {
  onClose?: () => void;
}

const AuthDebugInfo: React.FC<AuthDebugInfoProps> = ({ onClose }) => {
  // Only render in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  const configStatus = unifiedAuthService.getConfigurationStatus();
  const platform = Capacitor.getPlatform();
  const isNative = Capacitor.isNativePlatform();

  const getStatusBadge = (isConfigured: boolean) => (
    <Badge
      value={isConfigured ? 'OK' : 'Missing'}
      severity={isConfigured ? 'success' : 'danger'}
    />
  );

  const getAvailabilityBadge = (isAvailable: boolean) => (
    <Badge
      value={isAvailable ? 'Available' : 'Not Available'}
      severity={isAvailable ? 'success' : 'warning'}
    />
  );

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 flex justify-content-center align-items-center z-9999'
      style={{ zIndex: 9999 }}
    >
      <Card className='w-full max-w-2xl m-4 max-h-screen overflow-auto'>
        <div className='flex justify-content-between align-items-center mb-4'>
          <h2 className='text-2xl font-bold m-0'>Authentication Debug Info</h2>
          <Button
            icon='pi pi-times'
            className='p-button-text'
            onClick={onClose}
          />
        </div>

        <div className='space-y-4'>
          {/* Platform Info */}
          <Panel
            header='Platform Information'
            toggleable
          >
            <div className='grid'>
              <div className='col-6'>
                <strong>Platform:</strong> {configStatus.platform.platform}
              </div>
              <div className='col-6'>
                <strong>Native:</strong>{' '}
                {configStatus.platform.isNative ? 'Yes' : 'No'}
              </div>
              <div className='col-6'>
                <strong>Web:</strong>{' '}
                {configStatus.platform.isWeb ? 'Yes' : 'No'}
              </div>
              <div className='col-6'>
                <strong>iOS:</strong>{' '}
                {configStatus.platform.isIOS ? 'Yes' : 'No'}
              </div>
              <div className='col-6'>
                <strong>Android:</strong>{' '}
                {configStatus.platform.isAndroid ? 'Yes' : 'No'}
              </div>
              <div className='col-6'>
                <strong>Capacitor Native:</strong> {isNative ? 'Yes' : 'No'}
              </div>
            </div>
          </Panel>

          {/* Authentication Methods Availability */}
          <Panel
            header='Authentication Methods'
            toggleable
          >
            <div className='flex flex-column gap-3'>
              <div className='flex justify-content-between align-items-center'>
                <span>
                  <strong>Email/Password:</strong> Always available
                </span>
                {getAvailabilityBadge(true)}
              </div>

              <div className='flex justify-content-between align-items-center'>
                <span>
                  <strong>Google Sign In:</strong>{' '}
                  {configStatus.platform.isNative
                    ? 'Capacitor Plugin'
                    : 'Firebase Popup'}
                </span>
                {getAvailabilityBadge(configStatus.google)}
              </div>

              <div className='flex justify-content-between align-items-center'>
                <span>
                  <strong>Apple Sign In:</strong> iOS only (Capacitor Plugin)
                </span>
                {getAvailabilityBadge(configStatus.apple)}
              </div>
            </div>

            {configStatus.platform.isWeb && (
              <div className='bg-blue-50 p-3 border-round text-blue-800 mt-3'>
                <strong>Web Platform Note:</strong>
                <br />
                • Google Sign In uses Firebase popup authentication
                <br />• Apple Sign In is not available on web browsers
              </div>
            )}

            {configStatus.platform.isAndroid && (
              <div className='bg-green-50 p-3 border-round text-green-800 mt-3'>
                <strong>Android Platform Note:</strong>
                <br />
                • Google Sign In uses Capacitor Google Auth plugin
                <br />• Apple Sign In is not available on Android
              </div>
            )}

            {configStatus.platform.isIOS && (
              <div className='bg-purple-50 p-3 border-round text-purple-800 mt-3'>
                <strong>iOS Platform Note:</strong>
                <br />
                • Google Sign In uses Capacitor Google Auth plugin
                <br />• Apple Sign In uses Capacitor Apple Sign In plugin
              </div>
            )}
          </Panel>

          {/* Firebase Configuration */}
          <Panel
            header='Firebase Configuration'
            toggleable
          >
            <div className='flex flex-column gap-2'>
              <div className='flex justify-content-between align-items-center'>
                <span>Firebase Setup</span>
                {getStatusBadge(configStatus.firebase.isConfigured)}
              </div>

              {!configStatus.firebase.isConfigured && (
                <div className='bg-red-50 p-3 border-round text-red-800'>
                  <strong>Missing Environment Variables:</strong>
                  <ul className='mt-2 mb-0'>
                    {configStatus.firebase.missingKeys.map((key) => (
                      <li key={key}>{key}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Panel>

          {/* Google Auth Configuration */}
          <Panel
            header='Google Authentication'
            toggleable
          >
            <div className='flex justify-content-between align-items-center'>
              <span>Google Auth Setup</span>
              {getStatusBadge(configStatus.google)}
            </div>

            {!configStatus.google && (
              <div className='bg-orange-50 p-3 border-round text-orange-800 mt-2'>
                <strong>Google Auth not configured.</strong>
                <br />
                Make sure VITE_GOOGLE_MOBILE_AUTH_CLIENT_ID is set in your .env
                file.
                <br />
                <small>
                  Note: Google Sign In will work differently based on platform:
                  <br />
                  • Web: Firebase popup authentication
                  <br />• Mobile: Capacitor Google Auth plugin
                </small>
              </div>
            )}
          </Panel>

          {/* Service Status */}
          <Panel
            header='Service Status'
            toggleable
          >
            <div className='flex justify-content-between align-items-center'>
              <span>Authentication Services Initialized</span>
              {getStatusBadge(configStatus.initialized)}
            </div>
          </Panel>

          {/* Quick Setup Guide */}
          <Panel
            header='Platform-Specific Setup Guide'
            toggleable
          >
            <div className='text-sm space-y-2'>
              <p>
                <strong>1. Firebase Setup (All Platforms):</strong>
              </p>
              <ul className='ml-4'>
                <li>
                  Create a Firebase project at console.firebase.google.com
                </li>
                <li>Enable Authentication and configure sign-in methods</li>
                <li>Get your Firebase config from Project Settings</li>
                <li>Add the config values to your .env file</li>
              </ul>

              <p>
                <strong>2. Web Platform:</strong>
              </p>
              <ul className='ml-4'>
                <li>Google Sign In: Firebase popup (automatic)</li>
                <li>Apple Sign In: Not available on web</li>
                <li>No additional native setup required</li>
              </ul>

              <p>
                <strong>3. Mobile Platforms (iOS/Android):</strong>
              </p>
              <ul className='ml-4'>
                <li>Create OAuth credentials in Google Cloud Console</li>
                <li>Add VITE_GOOGLE_MOBILE_AUTH_CLIENT_ID to .env</li>
                <li>For Android: add google-services.json to android/app/</li>
                <li>For iOS: add GoogleService-Info.plist to ios/App/App/</li>
                <li>Apple Sign In: Only available on iOS (automatic)</li>
              </ul>

              <p>
                <strong>4. Testing:</strong>
              </p>
              <ul className='ml-4'>
                <li>Test on web first to verify Firebase setup</li>
                <li>Test Google Sign In on all platforms</li>
                <li>Test Apple Sign In only on iOS devices</li>
                <li>Use this debug panel to check configuration</li>
              </ul>
            </div>
          </Panel>
        </div>

        <div className='text-center mt-4'>
          <Button
            label='Close Debug Info'
            onClick={onClose}
            className='p-button-outlined'
          />
        </div>
      </Card>
    </div>
  );
};

export default AuthDebugInfo;
