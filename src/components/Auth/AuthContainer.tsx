import { useTheme } from '@/hooks/useTheme';
import { ROUTES } from '@/utils/constants/routingConstants';
import { consoleLog } from '@/utils/helpers/consoleHelper';
import { useIsAuthenticatedZState } from '@/zustandStates/userState';
import { useNavigate } from '@tanstack/react-router';
import { Button } from 'primereact/button';
import React, { useCallback, useState } from 'react';
import AnonymousChatWelcome from './AnonymousChatWelcome';
import AuthDebugInfo from './AuthDebugInfo';
import ForgotPasswordForm from './ForgotPasswordForm';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

export enum AuthMode {
  WELCOME = 'welcome',
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
  initialMode = AuthMode.WELCOME,
  redirectTo = ROUTES.DASHBOARD_CHATS,
  onAuthSuccess,
}) => {
  const [currentMode, setCurrentMode] = useState<AuthMode>(initialMode);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isAuthenticated = useIsAuthenticatedZState();

  const handleAuthSuccess = useCallback(() => {
    consoleLog('🎉 Authentication successful, redirecting to:', redirectTo);
    if (onAuthSuccess) {
      onAuthSuccess();
    } else {
      navigate({ to: redirectTo });
    }
  }, [navigate, redirectTo, onAuthSuccess]);

  const handleAnonymousStart = useCallback(() => {
    consoleLog('🎭 Anonymous chat started, redirecting to anonymous chat');
    if (onAuthSuccess) {
      onAuthSuccess();
    } else {
      navigate({ to: '/anonymous-chat' });
    }
  }, [navigate, onAuthSuccess]);

  const renderAuthForm = () => {
    switch (currentMode) {
      case AuthMode.WELCOME:
        return (
          <AnonymousChatWelcome
            onAnonymousStart={handleAnonymousStart}
            onShowSignUp={() => setCurrentMode(AuthMode.SIGNUP)}
            onShowLogin={() => setCurrentMode(AuthMode.LOGIN)}
          />
        );
      case AuthMode.LOGIN:
        return (
          <LoginForm
            onSuccess={handleAuthSuccess}
            onSwitchToSignUp={() => setCurrentMode(AuthMode.SIGNUP)}
            onForgotPassword={() => setCurrentMode(AuthMode.FORGOT_PASSWORD)}
            onBackToWelcome={() => setCurrentMode(AuthMode.WELCOME)}
          />
        );
      case AuthMode.SIGNUP:
        return (
          <SignUpForm
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setCurrentMode(AuthMode.LOGIN)}
            onBackToWelcome={() => setCurrentMode(AuthMode.WELCOME)}
          />
        );
      case AuthMode.FORGOT_PASSWORD:
        return (
          <ForgotPasswordForm
            onSuccess={() => setCurrentMode(AuthMode.LOGIN)}
            onBackToLogin={() => setCurrentMode(AuthMode.LOGIN)}
            onBackToWelcome={() => setCurrentMode(AuthMode.WELCOME)}
          />
        );
      default:
        return null;
    }
  };

  // Don't show auth container if user is already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className='auth-container'>
      {renderAuthForm()}

      {/* Debug Info Toggle - Only show in development */}
      {import.meta.env.DEV && (
        <div
          className='debug-toggle'
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
          }}
        >
          <Button
            icon='pi pi-cog'
            className='p-button-text p-button-sm p-button-rounded'
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            tooltip='Debug Info'
            tooltipOptions={{ position: 'top' }}
            style={{
              backgroundColor: theme.surface,
              color: theme.textSecondary,
              border: `1px solid ${theme.border}`,
            }}
          />
        </div>
      )}

      {/* Debug Information */}
      {showDebugInfo && (
        <AuthDebugInfo onClose={() => setShowDebugInfo(false)} />
      )}
    </div>
  );
};

export default AuthContainer;
