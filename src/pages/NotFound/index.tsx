import { useTheme } from '@/hooks/useTheme';
import { ROUTES } from '@/utils/constants/routingConstants';
import { useNavigate } from '@tanstack/react-router';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import React from 'react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const goHome = () => {
    navigate({ to: '/' });
  };

  const goBack = () => {
    // Navigate to dashboard instead of using browser history
    navigate({ to: ROUTES.DASHBOARD_CHATS });
  };

  return (
    <div
      className='min-h-screen flex align-items-center justify-content-center p-4'
      style={{
        background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.backgroundSecondary} 50%, ${theme.backgroundTertiary} 100%)`,
      }}
    >
      <div className='max-w-4xl w-full'>
        <Card
          className='shadow-3 border-round-2xl overflow-hidden'
          style={{
            backgroundColor: theme.surface,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div className='grid align-items-center min-h-full'>
            {/* Left side - Illustration */}
            <div className='col-12 lg:col-6 text-center p-6'>
              <div className='relative'>
                {/* 404 Number with theme-based gradient */}
                <div
                  className='text-8xl md:text-9xl font-bold mb-4 select-none'
                  style={{
                    background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 50%, ${theme.accent} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: `0 0 30px ${theme.primary}20`,
                  }}
                >
                  404
                </div>

                {/* Floating icons with theme colors */}
                <div className='absolute top-0 left-0 w-full h-full pointer-events-none'>
                  <i
                    className='pi pi-search absolute text-2xl opacity-30'
                    style={{
                      color: theme.primary,
                      top: '20%',
                      left: '10%',
                      animation: 'floatAnimation 3s ease-in-out infinite',
                    }}
                  ></i>
                  <i
                    className='pi pi-map-marker absolute text-xl opacity-40'
                    style={{
                      color: theme.secondary,
                      top: '60%',
                      right: '15%',
                      animation: 'floatAnimation 3s ease-in-out infinite 1s',
                    }}
                  ></i>
                  <i
                    className='pi pi-question-circle absolute text-lg opacity-35'
                    style={{
                      color: theme.accent,
                      bottom: '30%',
                      left: '20%',
                      animation: 'floatAnimation 3s ease-in-out infinite 2s',
                    }}
                  ></i>
                  <i
                    className='pi pi-compass absolute text-xl opacity-25'
                    style={{
                      color: theme.primary,
                      top: '40%',
                      right: '25%',
                      animation: 'floatAnimation 3s ease-in-out infinite 0.5s',
                    }}
                  ></i>
                </div>
              </div>
            </div>

            {/* Right side - Content */}
            <div className='col-12 lg:col-6 p-6'>
              <div className='text-center lg:text-left'>
                <h1
                  className='text-4xl lg:text-5xl font-bold mb-3'
                  style={{ color: theme.textPrimary }}
                >
                  Oops! Page Not Found
                </h1>

                <p
                  className='text-lg mb-4'
                  style={{ color: theme.textSecondary }}
                >
                  The page you're looking for seems to have wandered off into
                  the digital void. Don't worry, even the best explorers lose
                  their way sometimes! 🗺️
                </p>

                <div className='mb-5'>
                  <div className='flex align-items-center gap-2 mb-2'>
                    <i
                      className='pi pi-check-circle'
                      style={{ color: theme.success }}
                    ></i>
                    <span style={{ color: theme.textSecondary }}>
                      Check the URL for typos
                    </span>
                  </div>
                  <div className='flex align-items-center gap-2 mb-2'>
                    <i
                      className='pi pi-check-circle'
                      style={{ color: theme.success }}
                    ></i>
                    <span style={{ color: theme.textSecondary }}>
                      Make sure you have the right permissions
                    </span>
                  </div>
                  <div className='flex align-items-center gap-2'>
                    <i
                      className='pi pi-check-circle'
                      style={{ color: theme.success }}
                    ></i>
                    <span style={{ color: theme.textSecondary }}>
                      Try refreshing the page
                    </span>
                  </div>
                </div>

                <Divider style={{ borderTopColor: theme.border }} />

                {/* Action buttons */}
                <div className='flex flex-column sm:flex-row gap-3 justify-content-center lg:justify-content-start mt-5'>
                  <Button
                    label='Go to Dashboard'
                    icon='pi pi-home'
                    className='p-button-raised border-round-xl'
                    onClick={goHome}
                    style={{
                      backgroundColor: theme.primary,
                      borderColor: theme.primary,
                      color: theme.textInverse,
                    }}
                  />

                  <Button
                    label='Go Back'
                    icon='pi pi-arrow-left'
                    className='p-button-outlined border-round-xl'
                    onClick={goBack}
                    style={{
                      borderColor: theme.primary,
                      color: theme.primary,
                      backgroundColor: 'transparent',
                    }}
                  />
                </div>

                {/* Additional help section */}
                <div
                  className='mt-6 p-4 border-round-lg border-left-3'
                  style={{
                    backgroundColor: theme.primaryLight,
                    borderLeftColor: theme.primary,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <div className='flex align-items-center gap-2 mb-2'>
                    <i
                      className='pi pi-info-circle'
                      style={{ color: theme.primary }}
                    ></i>
                    <span
                      className='font-semibold'
                      style={{ color: theme.primary }}
                    >
                      Need Help?
                    </span>
                  </div>
                  <p
                    className='text-sm m-0'
                    style={{ color: theme.textSecondary }}
                  >
                    If you continue to experience issues, please contact our
                    support team or try navigating from the main dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className='text-center mt-6'>
          <div className='flex align-items-center justify-content-center gap-2'>
            <i
              className='pi pi-shield'
              style={{ color: theme.primary }}
            ></i>
            <span
              className='font-semibold'
              style={{ color: theme.primary }}
            >
              AI Personal Assistant
            </span>
            <span style={{ color: theme.textSecondary }}>•</span>
            <span style={{ color: theme.textSecondary }}>
              Always here to help
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced CSS animations */}
      <style>{`
        @keyframes floatAnimation {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(5deg);
          }
        }
        
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 20px ${theme.primary}20;
          }
          50% {
            box-shadow: 0 0 30px ${theme.primary}40;
          }
        }

        .select-none {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .grid {
            gap: 1rem;
          }
          
          .text-8xl {
            font-size: 4rem;
          }
          
          .text-9xl {
            font-size: 5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default NotFound;
