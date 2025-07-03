import { ROUTES } from '@/utils/constants/routingConstants';
import { useNavigate } from '@tanstack/react-router';
import { Button } from 'primereact/button';
import React from 'react';

interface PolicyFooterProps {
  className?: string;
  variant?: 'minimal' | 'full';
  showCompanyInfo?: boolean;
}

const PolicyFooter: React.FC<PolicyFooterProps> = ({
  className = '',
  variant = 'full',
  showCompanyInfo = true,
}) => {
  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();

  const policyLinks = [
    { label: 'Privacy Policy', route: ROUTES.PRIVACY_POLICY },
    { label: 'Terms of Service', route: ROUTES.TERMS_OF_SERVICE },
    { label: 'Cookie Policy', route: ROUTES.COOKIE_POLICY },
    { label: 'Data Deletion', route: ROUTES.DATA_DELETION_POLICY },
  ];

  if (variant === 'minimal') {
    return (
      <div className={`text-center py-3 ${className}`}>
        <div className='flex flex-wrap justify-content-center gap-2 text-xs'>
          {policyLinks.map((link, index) => (
            <React.Fragment key={link.route}>
              <Button
                type='button'
                link
                label={link.label}
                onClick={() => navigate({ to: link.route })}
                className='p-0 text-500 hover:text-600 text-xs'
              />
              {index < policyLinks.length - 1 && (
                <span className='text-400'>•</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  return (
    <footer
      className={`bg-gray-50 dark:bg-gray-900 border-top-1 border-200 ${className}`}
    >
      <div className='max-w-6xl mx-auto px-4 py-6'>
        {/* Company Info */}
        {showCompanyInfo && (
          <div className='text-center mb-4'>
            <div className='mb-3'>
              <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-2'>
                AI Personal Assistant
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Developed by{' '}
                <a
                  href='https://aoneahsan.com'
                  className='text-blue-600 hover:underline'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Ahsan Mahmood
                </a>
              </p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                © {currentYear}{' '}
                <a
                  href='https://zaions.com'
                  className='text-blue-600 hover:underline'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Zaions
                </a>
                . All rights reserved.
              </p>
            </div>
          </div>
        )}

        {/* Policy Links */}
        <div className='flex flex-wrap justify-content-center gap-4 mb-4'>
          {policyLinks.map((link) => (
            <Button
              key={link.route}
              type='button'
              link
              label={link.label}
              onClick={() => navigate({ to: link.route })}
              className='p-0 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-sm'
            />
          ))}
        </div>

        {/* Contact Info */}
        <div className='text-center'>
          <div className='flex flex-wrap justify-content-center gap-4 text-sm text-gray-500 dark:text-gray-500'>
            <a
              href='https://aoneahsan.com'
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-gray-700 dark:hover:text-gray-300'
            >
              Developer Website
            </a>
            <span>•</span>
            <a
              href='https://linkedin.com/in/aoneahsan'
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-gray-700 dark:hover:text-gray-300'
            >
              LinkedIn
            </a>
            <span>•</span>
            <a
              href='https://zaions.com'
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-gray-700 dark:hover:text-gray-300'
            >
              Company
            </a>
            <span>•</span>
            <a
              href='https://youtube.com/@zaionsofficial'
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-gray-700 dark:hover:text-gray-300'
            >
              YouTube
            </a>
          </div>
        </div>

        {/* Legal Notice */}
        <div className='text-center mt-4 pt-4 border-top-1 border-200'>
          <p className='text-xs text-gray-500 dark:text-gray-500'>
            This software is proprietary and protected by copyright law.
            <br />
            Commercial use requires licensing from Zaions.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PolicyFooter;
