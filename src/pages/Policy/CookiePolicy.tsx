import { useNavigate } from '@tanstack/react-router';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import React from 'react';

const CookiePolicy: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate({ to: '/' });
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-4'>
      <div className='max-w-4xl mx-auto'>
        <Card className='p-6'>
          <div className='flex justify-between items-center mb-6'>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
              Cookie Policy
            </h1>
            <Button
              icon='pi pi-arrow-left'
              label='Back'
              onClick={handleBack}
              outlined
            />
          </div>

          <div className='space-y-6 text-gray-700 dark:text-gray-300'>
            {/* Header */}
            <div className='text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
              <h2 className='text-xl font-semibold mb-2'>
                AI Personal Assistant - Cookie Policy
              </h2>
              <p className='text-sm'>
                <strong>Effective Date:</strong> January 1, 2024
                <br />
                <strong>Last Updated:</strong> January 1, 2024
              </p>
              <p className='text-sm mt-2'>
                <strong>Developed by:</strong> Ahsan Mahmood (
                <a
                  href='https://aoneahsan.com'
                  className='text-blue-600 hover:underline'
                >
                  aoneahsan.com
                </a>
                )<br />
                <strong>Company:</strong> Zaions (
                <a
                  href='https://zaions.com'
                  className='text-blue-600 hover:underline'
                >
                  zaions.com
                </a>
                )
              </p>
            </div>

            {/* What are Cookies */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                1. What are Cookies?
              </h3>
              <p className='mb-4'>
                Cookies are small text files that are placed on your device when
                you visit our AI Personal Assistant service. They help us
                provide you with a better experience by remembering your
                preferences and enabling certain functionality.
              </p>
              <p className='mb-4'>
                We use both session cookies (which expire when you close your
                browser) and persistent cookies (which remain on your device for
                a set period of time).
              </p>
            </section>

            <Divider />

            {/* Types of Cookies */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                2. Types of Cookies We Use
              </h3>

              <h4 className='text-lg font-medium mb-2'>
                2.1 Essential Cookies
              </h4>
              <p className='mb-4'>
                These cookies are necessary for the basic functionality of our
                service:
              </p>
              <ul className='list-disc ml-6 mb-4 space-y-1'>
                <li>
                  <strong>Authentication:</strong> Keep you logged in during
                  your session
                </li>
                <li>
                  <strong>Security:</strong> Protect against fraud and security
                  threats
                </li>
                <li>
                  <strong>Session Management:</strong> Maintain your session
                  state
                </li>
                <li>
                  <strong>Preferences:</strong> Remember your language and theme
                  settings
                </li>
              </ul>

              <h4 className='text-lg font-medium mb-2'>
                2.2 Analytics Cookies
              </h4>
              <p className='mb-4'>
                Help us understand how users interact with our service:
              </p>
              <ul className='list-disc ml-6 mb-4 space-y-1'>
                <li>
                  <strong>Amplitude Analytics:</strong> Track user behavior and
                  feature usage
                </li>
                <li>
                  <strong>Firebase Analytics:</strong> Monitor app performance
                  and user engagement
                </li>
                <li>
                  <strong>Usage Statistics:</strong> Understand which features
                  are most popular
                </li>
              </ul>

              <h4 className='text-lg font-medium mb-2'>
                2.3 Functional Cookies
              </h4>
              <p className='mb-4'>
                Enhance your experience with additional functionality:
              </p>
              <ul className='list-disc ml-6 mb-4 space-y-1'>
                <li>
                  <strong>Theme Preferences:</strong> Remember your dark/light
                  mode choice
                </li>
                <li>
                  <strong>Chat Settings:</strong> Save your chat preferences and
                  configurations
                </li>
                <li>
                  <strong>Notification Settings:</strong> Remember your
                  notification preferences
                </li>
                <li>
                  <strong>Feedback Dismissal:</strong> Track dismissed feedback
                  prompts
                </li>
              </ul>

              <h4 className='text-lg font-medium mb-2'>
                2.4 Third-Party Cookies
              </h4>
              <p className='mb-4'>
                Cookies from third-party services we integrate with:
              </p>
              <ul className='list-disc ml-6 mb-4 space-y-1'>
                <li>
                  <strong>Google OAuth:</strong> For Google Sign-In
                  functionality
                </li>
                <li>
                  <strong>OneSignal:</strong> For push notification services
                </li>
                <li>
                  <strong>Firebase:</strong> For authentication and data storage
                </li>
                <li>
                  <strong>Sentry:</strong> For error tracking and monitoring
                </li>
              </ul>
            </section>

            <Divider />

            {/* Local Storage */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>3. Local Storage</h3>
              <p className='mb-4'>
                In addition to cookies, we use browser local storage and
                Capacitor preferences (for mobile apps) to store:
              </p>
              <ul className='list-disc ml-6 mb-4 space-y-1'>
                <li>
                  <strong>User Profile Data:</strong> Basic profile information
                  for quick access
                </li>
                <li>
                  <strong>Chat History:</strong> Recent conversations for
                  offline access
                </li>
                <li>
                  <strong>App Settings:</strong> Your preferences and
                  configurations
                </li>
                <li>
                  <strong>Theme Data:</strong> Your selected theme and
                  customizations
                </li>
                <li>
                  <strong>Draft Messages:</strong> Unsent messages and drafts
                </li>
              </ul>
              <p className='mb-4 text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg'>
                <strong>Note:</strong> Local storage data remains on your device
                and is not transmitted to our servers unless explicitly shared.
              </p>
            </section>

            <Divider />

            {/* Cookie Management */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                4. Managing Your Cookie Preferences
              </h3>

              <h4 className='text-lg font-medium mb-2'>4.1 Browser Settings</h4>
              <p className='mb-4'>
                You can control cookies through your browser settings:
              </p>
              <ul className='list-disc ml-6 mb-4 space-y-1'>
                <li>
                  <strong>Block all cookies:</strong> Prevent all cookies from
                  being set
                </li>
                <li>
                  <strong>Block third-party cookies:</strong> Allow only
                  first-party cookies
                </li>
                <li>
                  <strong>Delete existing cookies:</strong> Remove all stored
                  cookies
                </li>
                <li>
                  <strong>Cookie notifications:</strong> Get notified before
                  cookies are set
                </li>
              </ul>

              <h4 className='text-lg font-medium mb-2'>4.2 In-App Settings</h4>
              <p className='mb-4'>Within our application, you can:</p>
              <ul className='list-disc ml-6 mb-4 space-y-1'>
                <li>Opt out of analytics tracking</li>
                <li>Disable non-essential features that use cookies</li>
                <li>Clear local storage and cached data</li>
                <li>Reset all preferences to defaults</li>
              </ul>

              <h4 className='text-lg font-medium mb-2'>
                4.3 Third-Party Opt-Outs
              </h4>
              <p className='mb-4'>You can opt out of third-party tracking:</p>
              <ul className='list-disc ml-6 mb-4 space-y-1'>
                <li>
                  <strong>Amplitude:</strong>{' '}
                  <a
                    href='https://amplitude.com/privacy'
                    className='text-blue-600 hover:underline'
                  >
                    Amplitude Privacy Settings
                  </a>
                </li>
                <li>
                  <strong>Google Analytics:</strong>{' '}
                  <a
                    href='https://tools.google.com/dlpage/gaoptout'
                    className='text-blue-600 hover:underline'
                  >
                    Google Analytics Opt-out
                  </a>
                </li>
                <li>
                  <strong>OneSignal:</strong> Notification settings within the
                  app
                </li>
              </ul>
            </section>

            <Divider />

            {/* Impact of Disabling Cookies */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                5. Impact of Disabling Cookies
              </h3>
              <p className='mb-4'>
                Disabling cookies may affect your experience with our service:
              </p>
              <div className='bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4'>
                <h5 className='font-semibold mb-2'>
                  If you disable essential cookies:
                </h5>
                <ul className='list-disc ml-6 space-y-1 text-sm'>
                  <li>You may need to log in repeatedly</li>
                  <li>Your preferences won't be saved</li>
                  <li>Some features may not work properly</li>
                  <li>Security features may be compromised</li>
                </ul>
              </div>
              <div className='bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4'>
                <h5 className='font-semibold mb-2'>
                  If you disable analytics cookies:
                </h5>
                <ul className='list-disc ml-6 space-y-1 text-sm'>
                  <li>Core functionality will still work</li>
                  <li>We won't be able to improve based on usage patterns</li>
                  <li>Performance monitoring may be limited</li>
                </ul>
              </div>
            </section>

            <Divider />

            {/* Mobile App Considerations */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                6. Mobile App Considerations
              </h3>
              <p className='mb-4'>
                For our mobile applications built with Capacitor:
              </p>
              <ul className='list-disc ml-6 mb-4 space-y-1'>
                <li>
                  <strong>Capacitor Preferences:</strong> We use device-specific
                  storage instead of traditional cookies
                </li>
                <li>
                  <strong>Push Notifications:</strong> Require device
                  permissions and tokens
                </li>
                <li>
                  <strong>Device Information:</strong> We collect device type,
                  OS version for compatibility
                </li>
                <li>
                  <strong>App Permissions:</strong> Camera, file access, and
                  notifications are optional
                </li>
              </ul>
            </section>

            <Divider />

            {/* Children's Privacy */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                7. Children's Privacy
              </h3>
              <p className='mb-4'>
                Our service is not intended for children under 13. We do not
                knowingly collect personal information from children under 13
                through cookies or any other means.
              </p>
            </section>

            <Divider />

            {/* Updates to Cookie Policy */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                8. Updates to This Policy
              </h3>
              <p className='mb-4'>
                We may update this Cookie Policy from time to time. When we do,
                we will notify you by posting the updated policy on this page
                and updating the "Last Updated" date.
              </p>
            </section>

            <Divider />

            {/* Contact Information */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                Contact Information
              </h3>
              <p className='mb-4'>
                If you have any questions about our use of cookies:
              </p>
              <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-lg'>
                <p>
                  <strong>Developer:</strong> Ahsan Mahmood
                </p>
                <p>
                  <strong>Website:</strong>{' '}
                  <a
                    href='https://aoneahsan.com'
                    className='text-blue-600 hover:underline'
                  >
                    https://aoneahsan.com
                  </a>
                </p>
                <p>
                  <strong>LinkedIn:</strong>{' '}
                  <a
                    href='https://linkedin.com/in/aoneahsan'
                    className='text-blue-600 hover:underline'
                  >
                    https://linkedin.com/in/aoneahsan
                  </a>
                </p>
                <p className='mt-2'>
                  <strong>Company:</strong> Zaions
                </p>
                <p>
                  <strong>Website:</strong>{' '}
                  <a
                    href='https://zaions.com'
                    className='text-blue-600 hover:underline'
                  >
                    https://zaions.com
                  </a>
                </p>
                <p>
                  <strong>YouTube:</strong>{' '}
                  <a
                    href='https://youtube.com/@zaionsofficial'
                    className='text-blue-600 hover:underline'
                  >
                    https://youtube.com/@zaionsofficial
                  </a>
                </p>
              </div>
            </section>

            <Divider />

            {/* Copyright */}
            <section className='text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg'>
              <p className='text-sm'>
                <strong>© 2024 Zaions. All rights reserved.</strong>
                <br />
                <strong>Developed by Ahsan Mahmood</strong>
              </p>
              <p className='text-xs mt-2 text-gray-600 dark:text-gray-400'>
                This cookie policy is designed to comply with GDPR, CCPA, and
                ePrivacy regulations.
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CookiePolicy;
