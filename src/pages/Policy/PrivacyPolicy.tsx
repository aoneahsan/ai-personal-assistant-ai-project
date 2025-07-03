import { useNavigate } from '@tanstack/react-router';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import React from 'react';

const PrivacyPolicy: React.FC = () => {
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
              Privacy Policy
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
                AI Personal Assistant
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

            {/* Introduction */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>1. Introduction</h3>
              <p className='mb-4'>
                Welcome to AI Personal Assistant ("we," "our," or "us"). This
                Privacy Policy explains how we collect, use, disclose, and
                safeguard your information when you use our AI Personal
                Assistant application (the "Service"), whether accessed through
                our website, mobile application, or embedded widgets.
              </p>
              <p className='mb-4'>
                We are committed to protecting your privacy and ensuring you
                have a positive experience on our Service. This policy outlines
                our practices concerning data collection and usage in compliance
                with applicable privacy laws, including the General Data
                Protection Regulation (GDPR) and California Consumer Privacy Act
                (CCPA).
              </p>
              <p className='font-semibold text-orange-600'>
                By using our Service, you consent to the collection and use of
                information in accordance with this Privacy Policy.
              </p>
            </section>

            <Divider />

            {/* Information We Collect */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                2. Information We Collect
              </h3>

              <h4 className='text-lg font-medium mb-2'>
                2.1 Personal Information
              </h4>
              <p className='mb-4'>
                We collect the following types of personal information:
              </p>
              <ul className='list-disc ml-6 mb-4 space-y-1'>
                <li>
                  <strong>Account Information:</strong> Email address, display
                  name, profile photo
                </li>
                <li>
                  <strong>Authentication Data:</strong> OAuth tokens,
                  authentication provider information
                </li>
                <li>
                  <strong>Chat Messages:</strong> All conversations and messages
                  you send through our Service
                </li>
                <li>
                  <strong>Feedback Data:</strong> Ratings, comments, and
                  suggestions you provide
                </li>
                <li>
                  <strong>Profile Information:</strong> Any additional
                  information you choose to provide
                </li>
              </ul>

              <h4 className='text-lg font-medium mb-2'>
                2.2 Automatically Collected Information
              </h4>
              <ul className='list-disc ml-6 mb-4 space-y-1'>
                <li>
                  <strong>Device Information:</strong> Device type, operating
                  system, browser type and version
                </li>
                <li>
                  <strong>Usage Analytics:</strong> Feature usage, session
                  duration, user interactions
                </li>
                <li>
                  <strong>Technical Data:</strong> IP address, session ID, user
                  agent string
                </li>
                <li>
                  <strong>Performance Data:</strong> App crashes, errors,
                  performance metrics
                </li>
                <li>
                  <strong>Location Data:</strong> Approximate location based on
                  IP address (with consent for precise location)
                </li>
              </ul>

              <h4 className='text-lg font-medium mb-2'>2.3 Anonymous Usage</h4>
              <p className='mb-4'>
                Our Service supports anonymous usage without requiring account
                creation. For anonymous users, we collect minimal information
                including session data, device information, and usage analytics
                to provide and improve our Service.
              </p>
            </section>

            <Divider />

            {/* How We Use Information */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                3. How We Use Your Information
              </h3>
              <p className='mb-4'>
                We use the collected information for the following purposes:
              </p>
              <ul className='list-disc ml-6 mb-4 space-y-1'>
                <li>
                  <strong>Service Provision:</strong> To provide and maintain
                  our AI Personal Assistant Service
                </li>
                <li>
                  <strong>User Experience:</strong> To personalize your
                  experience and improve our Service
                </li>
                <li>
                  <strong>Communication:</strong> To send you important updates,
                  notifications, and support messages
                </li>
                <li>
                  <strong>Analytics:</strong> To understand how our Service is
                  used and improve performance
                </li>
                <li>
                  <strong>Security:</strong> To protect against fraud, abuse,
                  and security threats
                </li>
                <li>
                  <strong>Legal Compliance:</strong> To comply with applicable
                  laws and regulations
                </li>
                <li>
                  <strong>Feature Development:</strong> To develop new features
                  and improve existing ones
                </li>
              </ul>
            </section>

            <Divider />

            {/* Third-Party Services */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                4. Third-Party Services
              </h3>
              <p className='mb-4'>
                Our Service integrates with the following third-party services:
              </p>

              <div className='space-y-3'>
                <div className='p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                  <h5 className='font-semibold'>Firebase (Google)</h5>
                  <p className='text-sm'>
                    Authentication, database, file storage, and analytics
                  </p>
                  <p className='text-sm'>
                    Privacy Policy:{' '}
                    <a
                      href='https://firebase.google.com/support/privacy'
                      className='text-blue-600 hover:underline'
                    >
                      Firebase Privacy
                    </a>
                  </p>
                </div>

                <div className='p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                  <h5 className='font-semibold'>OneSignal</h5>
                  <p className='text-sm'>
                    Push notifications for web and mobile
                  </p>
                  <p className='text-sm'>
                    Privacy Policy:{' '}
                    <a
                      href='https://onesignal.com/privacy_policy'
                      className='text-blue-600 hover:underline'
                    >
                      OneSignal Privacy
                    </a>
                  </p>
                </div>

                <div className='p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                  <h5 className='font-semibold'>Amplitude</h5>
                  <p className='text-sm'>
                    Analytics and user behavior tracking
                  </p>
                  <p className='text-sm'>
                    Privacy Policy:{' '}
                    <a
                      href='https://amplitude.com/privacy'
                      className='text-blue-600 hover:underline'
                    >
                      Amplitude Privacy
                    </a>
                  </p>
                </div>

                <div className='p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                  <h5 className='font-semibold'>Sentry</h5>
                  <p className='text-sm'>
                    Error tracking and performance monitoring
                  </p>
                  <p className='text-sm'>
                    Privacy Policy:{' '}
                    <a
                      href='https://sentry.io/privacy/'
                      className='text-blue-600 hover:underline'
                    >
                      Sentry Privacy
                    </a>
                  </p>
                </div>

                <div className='p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                  <h5 className='font-semibold'>
                    Google OAuth & Apple Sign In
                  </h5>
                  <p className='text-sm'>Authentication services</p>
                  <p className='text-sm'>
                    Privacy Policies:{' '}
                    <a
                      href='https://policies.google.com/privacy'
                      className='text-blue-600 hover:underline'
                    >
                      Google
                    </a>{' '}
                    |{' '}
                    <a
                      href='https://www.apple.com/privacy/'
                      className='text-blue-600 hover:underline'
                    >
                      Apple
                    </a>
                  </p>
                </div>
              </div>
            </section>

            <Divider />

            {/* Data Security */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>5. Data Security</h3>
              <p className='mb-4'>
                We implement appropriate technical and organizational security
                measures to protect your personal information:
              </p>
              <ul className='list-disc ml-6 mb-4 space-y-1'>
                <li>
                  <strong>Encryption:</strong> All data transmission is
                  encrypted using HTTPS
                </li>
                <li>
                  <strong>Firebase Security:</strong> We use Firebase security
                  rules to protect user data
                </li>
                <li>
                  <strong>Access Controls:</strong> Limited access to personal
                  data by authorized personnel only
                </li>
                <li>
                  <strong>Regular Updates:</strong> We regularly update our
                  security practices and software
                </li>
                <li>
                  <strong>Incident Response:</strong> We have procedures in
                  place to respond to security incidents
                </li>
              </ul>
            </section>

            <Divider />

            {/* Data Retention */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>6. Data Retention</h3>
              <p className='mb-4'>
                We retain your information for the following periods:
              </p>
              <ul className='list-disc ml-6 mb-4 space-y-1'>
                <li>
                  <strong>Account Data:</strong> Until you delete your account
                  or request deletion
                </li>
                <li>
                  <strong>Chat Messages:</strong> Until you delete them or
                  request account deletion
                </li>
                <li>
                  <strong>Analytics Data:</strong> Up to 26 months for
                  improvement purposes
                </li>
                <li>
                  <strong>Feedback Data:</strong> Up to 5 years for product
                  improvement
                </li>
                <li>
                  <strong>Security Logs:</strong> Up to 1 year for security
                  purposes
                </li>
              </ul>
            </section>

            <Divider />

            {/* Your Rights */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>7. Your Rights</h3>
              <p className='mb-4'>
                You have the following rights regarding your personal
                information:
              </p>
              <ul className='list-disc ml-6 mb-4 space-y-1'>
                <li>
                  <strong>Access:</strong> Request access to your personal
                  information
                </li>
                <li>
                  <strong>Correction:</strong> Request correction of inaccurate
                  information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your personal
                  information
                </li>
                <li>
                  <strong>Portability:</strong> Request transfer of your data to
                  another service
                </li>
                <li>
                  <strong>Objection:</strong> Object to processing of your
                  personal information
                </li>
                <li>
                  <strong>Restriction:</strong> Request restriction of
                  processing
                </li>
                <li>
                  <strong>Withdraw Consent:</strong> Withdraw consent for data
                  processing
                </li>
              </ul>
              <p className='text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg'>
                To exercise these rights, please contact us at the information
                provided in the Contact section below.
              </p>
            </section>

            <Divider />

            {/* Children's Privacy */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                8. Children's Privacy
              </h3>
              <p className='mb-4'>
                Our Service is not intended for children under 13 years of age.
                We do not knowingly collect personal information from children
                under 13. If we discover that a child under 13 has provided us
                with personal information, we will delete such information
                immediately.
              </p>
            </section>

            <Divider />

            {/* International Transfers */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                9. International Data Transfers
              </h3>
              <p className='mb-4'>
                Your information may be transferred to and processed in
                countries other than your own. We ensure that such transfers are
                conducted in accordance with applicable privacy laws and with
                appropriate safeguards in place.
              </p>
            </section>

            <Divider />

            {/* Changes to Privacy Policy */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                10. Changes to This Privacy Policy
              </h3>
              <p className='mb-4'>
                We may update this Privacy Policy from time to time. We will
                notify you of any significant changes by posting the new Privacy
                Policy on this page and updating the "Last Updated" date. We
                encourage you to review this Privacy Policy periodically.
              </p>
            </section>

            <Divider />

            {/* Contact Information */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                11. Contact Information
              </h3>
              <p className='mb-4'>
                If you have any questions about this Privacy Policy or our
                privacy practices, please contact us:
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
                This privacy policy is designed to comply with GDPR, CCPA, and
                mobile app store requirements.
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
