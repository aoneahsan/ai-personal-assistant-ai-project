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
  redirectTo = '/dashboard',
  onAuthSuccess,
}) => {
  const [currentMode, setCurrentMode] = useState<AuthMode>(initialMode);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticatedZState();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (onAuthSuccess) {
        onAuthSuccess();
      } else {
        navigate({ to: redirectTo });
      }
    }
  }, [isAuthenticated, navigate, redirectTo, onAuthSuccess]);

  // Initialize authentication services
  useEffect(() => {
    unifiedAuthService.initialize();
  }, []);

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

  return (
    <>
      {renderAuthForm()}

      {/* Debug Button - only show in development */}
      {import.meta.env.DEV && (
        <div className='fixed bottom-4 right-4'>
          <Button
            icon='pi pi-cog'
            label='Debug Auth'
            onClick={() => setShowDebugInfo(true)}
            className='p-button-outlined p-button-secondary'
            size='small'
          />
        </div>
      )}

      {/* Debug Modal */}
      {showDebugInfo && (
        <AuthDebugInfo onClose={() => setShowDebugInfo(false)} />
      )}
    </>
  );
};

export default AuthContainer;
