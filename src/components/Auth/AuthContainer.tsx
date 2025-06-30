import { unifiedAuthService } from '@/services/authService';
import { useIsAuthenticatedZState } from '@/zustandStates/userState';
import { useNavigate } from '@tanstack/react-router';
import { Button } from 'primereact/button';
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
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticatedZState();

  // Initialize authentication services once
  useEffect(() => {
    const initAuth = async () => {
      try {
        await unifiedAuthService.initialize();
      } catch (error) {
        console.error('Failed to initialize auth services:', error);
      }
    };

    initAuth();
  }, []);

  const handleAuthSuccess = () => {
    console.log('🎉 Authentication successful, redirecting to:', redirectTo);
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
