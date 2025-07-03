import { useNavigate } from '@tanstack/react-router';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import React from 'react';

const DataDeletionPolicy: React.FC = () => {
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
              Data Deletion Policy
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
                AI Personal Assistant - Data Deletion Policy
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

            {/* Overview */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>1. Overview</h3>
              <p className='mb-4'>
                This Data Deletion Policy outlines how you can request the
                deletion of your personal data from our AI Personal Assistant
                service. We are committed to protecting your privacy and
                providing you with control over your personal information.
              </p>
              <p className='mb-4'>
                This policy complies with the General Data Protection Regulation
                (GDPR), California Consumer Privacy Act (CCPA), and other
                applicable privacy laws.
              </p>
            </section>

            <Divider />

            {/* Right to Delete */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                2. Your Right to Data Deletion
              </h3>
              <p className='mb-4'>
                You have the right to request the deletion of your personal data
                when:
              </p>
              <ul className='list-disc ml-6 mb-4 space-y-1'>
                <li>
                  The personal data is no longer necessary for the original
                  purpose
                </li>
                <li>
                  You withdraw your consent and there's no other legal basis for
                  processing
                </li>
                <li>
                  You object to processing and there are no overriding
                  legitimate grounds
                </li>
                <li>Your personal data has been unlawfully processed</li>
                <li>
                  Deletion is required for compliance with a legal obligation
                </li>
              </ul>
            </section>

            <Divider />

            {/* What Data Can Be Deleted */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                3. What Data Can Be Deleted
              </h3>
              <h4 className='text-lg font-medium mb-2'>3.1 Account Data</h4>
              <ul className='list-disc ml-6 mb-4 space-y-1'>
                <li>Profile information (name, email, photo)</li>
                <li>Account settings and preferences</li>
                <li>Authentication data and tokens</li>
                <li>Subscription and billing information</li>
              </ul>

              <h4 className='text-lg font-medium mb-2'>
                3.2 Chat and Communication Data
              </h4>
              <ul className='list-disc ml-6 mb-4 space-y-1'>
                <li>Chat messages and conversations</li>
                <li>File uploads and shared media</li>
                <li>Anonymous chat session data</li>
                <li>Embed widget interactions</li>
              </ul>

              <h4 className='text-lg font-medium mb-2'>3.3 Activity Data</h4>
              <ul className='list-disc ml-6 mb-4 space-y-1'>
                <li>Feedback and ratings</li>
                <li>Usage analytics and activity logs</li>
                <li>Device and technical information</li>
                <li>Session and interaction data</li>
              </ul>
            </section>

            <Divider />

            {/* How to Request Deletion */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                4. How to Request Data Deletion
              </h3>

              <h4 className='text-lg font-medium mb-2'>
                4.1 Account Deletion (Self-Service)
              </h4>
              <p className='mb-4'>
                For registered users, you can delete your account and associated
                data through the app:
              </p>
              <ol className='list-decimal ml-6 mb-4 space-y-1'>
                <li>Log in to your account</li>
                <li>Go to Settings → Account</li>
                <li>Select "Delete Account"</li>
                <li>Confirm your decision</li>
                <li>
                  Your account and data will be permanently deleted within 30
                  days
                </li>
              </ol>

              <h4 className='text-lg font-medium mb-2'>
                4.2 Manual Deletion Request
              </h4>
              <p className='mb-4'>
                If you cannot access your account or need assistance, contact us
                with:
              </p>
              <ul className='list-disc ml-6 mb-4 space-y-1'>
                <li>
                  <strong>Email address:</strong> Associated with your account
                </li>
                <li>
                  <strong>Request type:</strong> "Data Deletion Request"
                </li>
                <li>
                  <strong>Verification:</strong> Provide proof of identity
                </li>
                <li>
                  <strong>Specific data:</strong> Specify what data you want
                  deleted (if not all)
                </li>
              </ul>

              <h4 className='text-lg font-medium mb-2'>4.3 Anonymous Users</h4>
              <p className='mb-4'>
                For anonymous users, we collect minimal data that is
                automatically deleted after session expiration. If you used
                anonymous chat features, contact us with your session ID or
                approximate date/time of usage.
              </p>
            </section>

            <Divider />

            {/* Deletion Process */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                5. Deletion Process & Timeline
              </h3>

              <h4 className='text-lg font-medium mb-2'>
                5.1 Verification (1-3 business days)
              </h4>
              <p className='mb-4'>
                We verify your identity and the validity of your request to
                prevent unauthorized deletions.
              </p>

              <h4 className='text-lg font-medium mb-2'>
                5.2 Processing (7-30 days)
              </h4>
              <ul className='list-disc ml-6 mb-4 space-y-1'>
                <li>
                  <strong>Immediate:</strong> Account access is disabled
                </li>
                <li>
                  <strong>7 days:</strong> Personal data removed from active
                  systems
                </li>
                <li>
                  <strong>30 days:</strong> Complete deletion from backup
                  systems
                </li>
              </ul>

              <h4 className='text-lg font-medium mb-2'>5.3 Confirmation</h4>
              <p className='mb-4'>
                You will receive confirmation once your data has been
                successfully deleted.
              </p>
            </section>

            <Divider />

            {/* Data Retention Exceptions */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                6. Data Retention Exceptions
              </h3>
              <p className='mb-4'>
                Some data may be retained for legal or technical reasons:
              </p>
              <ul className='list-disc ml-6 mb-4 space-y-1'>
                <li>
                  <strong>Legal obligations:</strong> Data required by law (up
                  to 7 years)
                </li>
                <li>
                  <strong>Security logs:</strong> For fraud prevention and
                  security (up to 1 year)
                </li>
                <li>
                  <strong>Aggregated data:</strong> Anonymous analytics that
                  cannot identify you
                </li>
                <li>
                  <strong>Backup systems:</strong> Technical limitations may
                  delay complete deletion
                </li>
              </ul>
            </section>

            <Divider />

            {/* Third-Party Data */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                7. Third-Party Data Deletion
              </h3>
              <p className='mb-4'>
                We will also work to delete your data from third-party services
                where technically feasible:
              </p>
              <ul className='list-disc ml-6 mb-4 space-y-1'>
                <li>
                  <strong>Firebase:</strong> Account and database records
                </li>
                <li>
                  <strong>OneSignal:</strong> Push notification data
                </li>
                <li>
                  <strong>Amplitude:</strong> Analytics data (subject to their
                  retention policies)
                </li>
                <li>
                  <strong>Sentry:</strong> Error logs containing personal
                  information
                </li>
              </ul>
              <p className='mb-4 text-sm bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg'>
                <strong>Note:</strong> Some third-party services may have their
                own data retention policies. We will make reasonable efforts to
                request deletion from these services.
              </p>
            </section>

            <Divider />

            {/* Consequences of Deletion */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                8. Consequences of Data Deletion
              </h3>
              <p className='mb-4'>
                Please understand that deleting your data will result in:
              </p>
              <ul className='list-disc ml-6 mb-4 space-y-1'>
                <li>Permanent loss of your account and all associated data</li>
                <li>Inability to recover chat history and conversations</li>
                <li>Loss of personalized settings and preferences</li>
                <li>Termination of any active subscriptions</li>
                <li>
                  Inability to use features that require user identification
                </li>
              </ul>
              <div className='bg-red-50 dark:bg-red-900/20 p-4 rounded-lg'>
                <p className='text-sm'>
                  <strong>Warning:</strong> Data deletion is irreversible.
                  Please ensure you have backed up any important data before
                  proceeding.
                </p>
              </div>
            </section>

            <Divider />

            {/* Alternatives to Deletion */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                9. Alternatives to Full Deletion
              </h3>
              <p className='mb-4'>
                Before requesting full deletion, consider these alternatives:
              </p>
              <ul className='list-disc ml-6 mb-4 space-y-1'>
                <li>
                  <strong>Account deactivation:</strong> Temporarily disable
                  your account
                </li>
                <li>
                  <strong>Data portability:</strong> Export your data before
                  deletion
                </li>
                <li>
                  <strong>Selective deletion:</strong> Delete only specific
                  types of data
                </li>
                <li>
                  <strong>Privacy settings:</strong> Adjust what data is
                  collected
                </li>
                <li>
                  <strong>Anonymization:</strong> Remove identifying information
                  while keeping data
                </li>
              </ul>
            </section>

            <Divider />

            {/* Contact Information */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                Contact Information
              </h3>
              <p className='mb-4'>
                To request data deletion or for any questions about this policy:
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
                This policy is designed to comply with GDPR, CCPA, and other
                privacy regulations.
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DataDeletionPolicy;
