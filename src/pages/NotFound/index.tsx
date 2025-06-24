import { useNavigate } from '@tanstack/react-router';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import React from 'react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate({ to: '/' });
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <div
      className='min-h-screen flex align-items-center justify-content-center p-4'
      style={{
        background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)',
      }}
    >
      <div className='max-w-4xl w-full'>
        <Card className='shadow-8 border-round-3xl overflow-hidden'>
          <div className='grid align-items-center'>
            {/* Left side - Illustration */}
            <div className='col-12 lg:col-6 text-center p-6'>
              <div className='relative'>
                {/* 404 Number with gradient */}
                <div
                  className='text-9xl font-bold mb-4'
                  style={{
                    background:
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  404
                </div>

                {/* Floating icons animation */}
                <div className='absolute top-0 left-0 w-full h-full pointer-events-none'>
                  <i
                    className='pi pi-search absolute text-primary text-2xl opacity-20'
                    style={{
                      top: '20%',
                      left: '10%',
                      animation: 'floatAnimation 3s ease-in-out infinite',
                    }}
                  ></i>
                  <i
                    className='pi pi-map-marker absolute text-orange-500 text-xl opacity-30'
                    style={{
                      top: '60%',
                      right: '15%',
                      animation: 'floatAnimation 3s ease-in-out infinite 1s',
                    }}
                  ></i>
                  <i
                    className='pi pi-question-circle absolute text-purple-500 text-lg opacity-25'
                    style={{
                      bottom: '30%',
                      left: '20%',
                      animation: 'floatAnimation 3s ease-in-out infinite 2s',
                    }}
                  ></i>
                </div>
              </div>
            </div>

            {/* Right side - Content */}
            <div className='col-12 lg:col-6 p-6'>
              <div className='text-center lg:text-left'>
                <h1 className='text-4xl lg:text-5xl font-bold text-color mb-3'>
                  Oops! Page Not Found
                </h1>

                <p className='text-lg text-color-secondary mb-4'>
                  The page you're looking for seems to have vanished into the
                  digital void. Don't worry, it happens to the best of us!
                </p>

                <div className='mb-5'>
                  <div className='flex align-items-center gap-2 mb-2'>
                    <i className='pi pi-check-circle text-green-500'></i>
                    <span className='text-color-secondary'>
                      Check the URL for typos
                    </span>
                  </div>
                  <div className='flex align-items-center gap-2 mb-2'>
                    <i className='pi pi-check-circle text-green-500'></i>
                    <span className='text-color-secondary'>
                      Make sure you have the right permissions
                    </span>
                  </div>
                  <div className='flex align-items-center gap-2'>
                    <i className='pi pi-check-circle text-green-500'></i>
                    <span className='text-color-secondary'>
                      Try refreshing the page
                    </span>
                  </div>
                </div>

                <Divider />

                {/* Action buttons */}
                <div className='flex flex-column sm:flex-row gap-3 justify-content-center lg:justify-content-start mt-5'>
                  <Button
                    label='Go Home'
                    icon='pi pi-home'
                    className='p-button-raised p-button-rounded'
                    onClick={goHome}
                  />

                  <Button
                    label='Go Back'
                    icon='pi pi-arrow-left'
                    className='p-button-outlined p-button-rounded'
                    onClick={goBack}
                  />
                </div>

                {/* Additional help section */}
                <div className='mt-6 p-4 bg-blue-50 border-round-lg border-left-3 border-primary'>
                  <div className='flex align-items-center gap-2 mb-2'>
                    <i className='pi pi-info-circle text-primary'></i>
                    <span className='font-semibold text-primary'>
                      Need Help?
                    </span>
                  </div>
                  <p className='text-sm text-color-secondary m-0'>
                    If you continue to experience issues, please contact our
                    support team or try navigating from the main menu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className='text-center mt-6'>
          <div className='flex align-items-center justify-content-center gap-2 text-color-secondary'>
            <i className='pi pi-shield text-primary'></i>
            <span className='font-semibold text-primary'>
              AI Personal Assistant
            </span>
            <span>•</span>
            <span>Always here to help</span>
          </div>
        </div>
      </div>

      {/* Add CSS for floating animation */}
      <style>{`
        @keyframes floatAnimation {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
};

export default NotFound;
