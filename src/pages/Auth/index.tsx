import AuthContainer, { AuthMode } from '@/components/Admin/Auth/AuthContainer';
import React from 'react';

const AuthPage: React.FC = () => {
  return <AuthContainer initialMode={AuthMode.LOGIN} />;
};

export default AuthPage;
