import { useNavigate } from '@tanstack/react-router';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import React from 'react';

const TermsOfService: React.FC = () => {
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
              Terms of Service
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
                AI Personal Assistant - Terms of Service
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

            {/* Acceptance */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                1. Acceptance of Terms
              </h3>
              <p className='mb-4'>
                By accessing or using the AI Personal Assistant service
                ("Service"), you agree to be bound by these Terms of Service
                ("Terms"). If you do not agree to these Terms, please do not use
                our Service.
              </p>
              <p className='mb-4'>
                These Terms apply to all users of the Service, including
                visitors, registered users, and any other users of the Service.
              </p>
              <div className='bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg'>
                <p className='text-sm'>
                  <strong>Important:</strong> This is a proprietary software
                  owned by Zaions. Commercial use requires a separate commercial
                  license.
                </p>
              </div>
            </section>

            <Divider />

            {/* Description of Service */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                2. Description of Service
              </h3>
              <p className='mb-4'>
                AI Personal Assistant is a comprehensive AI-powered chat and
                communication platform that provides:
              </p>
              <ul className='list-disc ml-6 mb-4 space-y-1'>
                <li>AI-powered chat conversations</li>
                <li>Anonymous chat rooms</li>
                <li>Real-time messaging</li>
                <li>File sharing capabilities</li>
                <li>Embeddable chat widgets</li>
                <li>User profile management</li>
                <li>Feedback and rating system</li>
                <li>Push notifications</li>
                <li>Multi-platform support (web and mobile)</li>
              </ul>
            </section>

            <Divider />

            {/* User Accounts */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>3. User Accounts</h3>
              <h4 className='text-lg font-medium mb-2'>3.1 Account Creation</h4>
              <p className='mb-4'>
                You may create an account to access additional features of our
                Service. You can also use the Service anonymously without
                creating an account.
              </p>
              <h4 className='text-lg font-medium mb-2'>3.2 Account Security</h4>
              <ul className='list-disc ml-6 mb-4 space-y-1'>
                <li>
                  You are responsible for maintaining the confidentiality of
                  your account credentials
                </li>
                <li>
                  You must notify us immediately of any unauthorized use of your
                  account
                </li>
                <li>
                  You are responsible for all activities that occur under your
                  account
                </li>
                <li>
                  We are not liable for any loss or damage arising from your
                  failure to comply with these security obligations
                </li>
              </ul>
            </section>

            <Divider />

            {/* User Conduct */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>4. User Conduct</h3>
              <p className='mb-4'>You agree not to use the Service to:</p>
              <ul className='list-disc ml-6 mb-4 space-y-1'>
                <li>Violate any applicable laws or regulations</li>
                <li>
                  Transmit harmful, threatening, abusive, or harassing content
                </li>
                <li>Impersonate any person or entity</li>
                <li>Distribute spam, malware, or malicious code</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>
                  Attempt to gain unauthorized access to any part of the Service
                </li>
                <li>
                  Use the Service for any commercial purpose without proper
                  licensing
                </li>
                <li>
                  Violate the rights of others, including intellectual property
                  rights
                </li>
                <li>Engage in any activity that could harm minors</li>
              </ul>
            </section>

            <Divider />

            {/* Content and IP Rights */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                5. Content and Intellectual Property
              </h3>
              <h4 className='text-lg font-medium mb-2'>5.1 User Content</h4>
              <p className='mb-4'>
                You retain ownership of any content you submit to the Service.
                However, by submitting content, you grant us a non-exclusive,
                worldwide, royalty-free license to use, modify, and distribute
                your content in connection with the Service.
              </p>
              <h4 className='text-lg font-medium mb-2'>
                5.2 Our Intellectual Property
              </h4>
              <p className='mb-4'>
                The Service and its original content, features, and
                functionality are owned by Zaions and are protected by
                international copyright, trademark, and other intellectual
                property laws.
              </p>
              <div className='bg-red-50 dark:bg-red-900/20 p-4 rounded-lg'>
                <p className='text-sm'>
                  <strong>Commercial License Required:</strong> Any commercial
                  use of this software requires explicit licensing from Zaions.
                </p>
              </div>
            </section>

            <Divider />

            {/* Privacy */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>6. Privacy</h3>
              <p className='mb-4'>
                Your privacy is important to us. Our Privacy Policy explains how
                we collect, use, and protect your information when you use our
                Service. By using our Service, you agree to the collection and
                use of information in accordance with our Privacy Policy.
              </p>
              <p className='mb-4'>
                <a
                  href='/privacy-policy'
                  className='text-blue-600 hover:underline'
                >
                  View our Privacy Policy
                </a>
              </p>
            </section>

            <Divider />

            {/* Subscription Plans */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                7. Subscription Plans
              </h3>
              <h4 className='text-lg font-medium mb-2'>7.1 Plan Types</h4>
              <p className='mb-4'>
                We offer different subscription plans with varying features:
              </p>
              <ul className='list-disc ml-6 mb-4 space-y-1'>
                <li>
                  <strong>Free Plan:</strong> Basic chat functionality with
                  limited features
                </li>
                <li>
                  <strong>Pro Plan:</strong> Enhanced features including message
                  editing and advanced chat options
                </li>
                <li>
                  <strong>Premium Plan:</strong> Full feature access with
                  priority support
                </li>
                <li>
                  <strong>Enterprise Plan:</strong> Custom solutions for
                  businesses
                </li>
              </ul>
              <h4 className='text-lg font-medium mb-2'>7.2 Billing</h4>
              <p className='mb-4'>
                Subscription fees are billed in advance and are non-refundable
                except as required by law. You can cancel your subscription at
                any time.
              </p>
            </section>

            <Divider />

            {/* Disclaimers */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>8. Disclaimers</h3>
              <p className='mb-4'>
                The Service is provided "as is" without warranties of any kind.
                We do not guarantee that the Service will be uninterrupted,
                error-free, or secure.
              </p>
              <ul className='list-disc ml-6 mb-4 space-y-1'>
                <li>
                  We are not responsible for the accuracy or reliability of
                  AI-generated content
                </li>
                <li>
                  We do not endorse or guarantee the accuracy of user-generated
                  content
                </li>
                <li>
                  The Service may be subject to limitations, delays, and other
                  problems
                </li>
                <li>
                  We reserve the right to modify or discontinue the Service at
                  any time
                </li>
              </ul>
            </section>

            <Divider />

            {/* Limitation of Liability */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                9. Limitation of Liability
              </h3>
              <p className='mb-4'>
                In no event shall Zaions or Ahsan Mahmood be liable for any
                indirect, incidental, special, or consequential damages arising
                out of or in connection with your use of the Service.
              </p>
              <p className='mb-4'>
                Our total liability to you for all damages shall not exceed the
                amount you paid for the Service in the twelve months preceding
                the claim.
              </p>
            </section>

            <Divider />

            {/* Termination */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>10. Termination</h3>
              <p className='mb-4'>
                We may terminate or suspend your account and access to the
                Service at our sole discretion, without prior notice, for
                conduct that we believe violates these Terms or is harmful to
                other users, us, or third parties.
              </p>
              <p className='mb-4'>
                You may terminate your account at any time by contacting us or
                using the account deletion feature in the Service.
              </p>
            </section>

            <Divider />

            {/* Changes to Terms */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                11. Changes to Terms
              </h3>
              <p className='mb-4'>
                We reserve the right to modify these Terms at any time. We will
                notify you of any changes by posting the new Terms on this page
                and updating the "Last Updated" date.
              </p>
              <p className='mb-4'>
                Your continued use of the Service after any such changes
                constitutes your acceptance of the new Terms.
              </p>
            </section>

            <Divider />

            {/* Governing Law */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>12. Governing Law</h3>
              <p className='mb-4'>
                These Terms shall be governed by and construed in accordance
                with applicable laws, without regard to conflict of law
                principles.
              </p>
            </section>

            <Divider />

            {/* Contact Information */}
            <section>
              <h3 className='text-xl font-semibold mb-3'>
                13. Contact Information
              </h3>
              <p className='mb-4'>
                If you have any questions about these Terms, please contact us:
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
                This software is proprietary and protected by copyright law.
                Commercial use requires licensing.
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
