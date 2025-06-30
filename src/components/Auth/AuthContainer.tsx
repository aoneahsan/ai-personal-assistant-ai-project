import { unifiedAuthService } from '@/services/authService';
import { useIsAuthenticatedZState } from '@/zustandStates/userState';
import { useNavigate } from '@tanstack/react-router';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import React, { useEffect, useState } from 'react';
import AuthDebugInfo from './AuthDebugInfo';
import ForgotPasswordForm from './ForgotPasswordForm';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

export enum AuthMode {
  LOGIN = 'login',
  SIGNUP = 'signup',
  FORGOT_PASSWORD = 'forgot-password',
}

interface AuthContainerProps {
  initialMode?: AuthMode;
  redirectTo?: string;
  onAuthSuccess?: () => void;
}

const AuthContainer: React.FC<AuthContainerProps> = ({
  initialMode = AuthMode.LOGIN,
  redirectTo = '/chats',
  onAuthSuccess,
}) => {
  const [currentMode, setCurrentMode] = useState<AuthMode>(initialMode);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticatedZState();

  // Initialize authentication services
  useEffect(() => {
    const initAuth = async () => {
      try {
        await unifiedAuthService.initialize();
      } catch (error) {
        console.error('Failed to initialize auth services:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      console.log('User already authenticated, redirecting to chats');
      if (onAuthSuccess) {
        onAuthSuccess();
      } else {
        navigate({ to: redirectTo });
      }
    }
  }, [isAuthenticated, navigate, redirectTo, onAuthSuccess, isInitializing]);

  const handleAuthSuccess = () => {
    if (onAuthSuccess) {
      onAuthSuccess();
    } else {
      navigate({ to: redirectTo });
    }
  };

  const renderAuthForm = () => {
    switch (currentMode) {
      case AuthMode.LOGIN:
        return (
          <LoginForm
            onSuccess={handleAuthSuccess}
            onSwitchToSignUp={() => setCurrentMode(AuthMode.SIGNUP)}
            onForgotPassword={() => setCurrentMode(AuthMode.FORGOT_PASSWORD)}
          />
        );
      case AuthMode.SIGNUP:
        return (
          <SignUpForm
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setCurrentMode(AuthMode.LOGIN)}
          />
        );
      case AuthMode.FORGOT_PASSWORD:
        return (
          <ForgotPasswordForm
            onSuccess={() => setCurrentMode(AuthMode.LOGIN)}
            onBackToLogin={() => setCurrentMode(AuthMode.LOGIN)}
          />
        );
      default:
        return null;
    }
  };

  // Show loading state while initializing or if user is already authenticated
  if (isInitializing || isAuthenticated) {
    return (
      <div className='min-h-screen bg-gray-50 flex align-items-center justify-content-center'>
        <div className='text-center'>
          <ProgressSpinner
            style={{ width: '50px', height: '50px' }}
            strokeWidth='4'
            fill='transparent'
            animationDuration='1s'
            className='mb-4'
          />
          <p className='text-gray-600 text-lg'>
            {isInitializing ? 'Initializing...' : 'Redirecting to chats...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 flex flex-column'>
      {/* Main Auth Content */}
      <div className='flex-1 flex align-items-center justify-content-center p-4'>
        {renderAuthForm()}
      </div>

      {/* Debug Button - only show in development */}
      {import.meta.env.DEV && (
        <div className='fixed bottom-4 right-4 z-5'>
          <Button
            icon='pi pi-cog'
            tooltip='Debug Authentication'
            tooltipOptions={{ position: 'left' }}
            onClick={() => setShowDebugInfo(true)}
            className='p-button-outlined p-button-secondary p-button-sm'
            style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '50%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          />
        </div>
      )}

      {/* Debug Modal */}
      {showDebugInfo && (
        <AuthDebugInfo onClose={() => setShowDebugInfo(false)} />
      )}
    </div>
  );
};

export default AuthContainer;
