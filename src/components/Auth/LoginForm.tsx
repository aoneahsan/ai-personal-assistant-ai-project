import { AuthProvider, unifiedAuthService } from '@/services/authService';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
  onForgotPassword?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToSignUp,
  onForgotPassword,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<AuthProvider | null>(null);
  const [isAppleAvailable] = useState(
    unifiedAuthService.isAppleSignInAvailable()
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await unifiedAuthService.signInWithEmail(data.email, data.password);
      toast.success('Welcome back! You have signed in successfully.');
      reset();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSocialLoading(AuthProvider.GOOGLE);
    try {
      await unifiedAuthService.signInWithGoogle();
      toast.success('Welcome! You have signed in with Google successfully.');
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to sign in with Google'
      );
    } finally {
      setSocialLoading(null);
    }
  };

  const handleAppleSignIn = async () => {
    setSocialLoading(AuthProvider.APPLE);
    try {
      await unifiedAuthService.signInWithApple();
      toast.success('Welcome! You have signed in with Apple successfully.');
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to sign in with Apple'
      );
    } finally {
      setSocialLoading(null);
    }
  };

  const isAnyLoading = isLoading || socialLoading !== null;

  return (
    <Card className='w-full max-w-md shadow-3 border-round-lg'>
      <div className='p-5'>
        {/* Header */}
        <div className='text-center mb-5'>
          <div className='mb-3'>
            <i className='pi pi-users text-6xl text-primary'></i>
          </div>
          <h1 className='text-4xl font-bold text-900 mb-2'>Welcome Back</h1>
          <p className='text-600 text-lg'>
            Sign in to your account to continue
          </p>
        </div>

        {/* Social Sign In Buttons */}
        <div className='mb-5'>
          <Button
            type='button'
            label={
              socialLoading === AuthProvider.GOOGLE
                ? 'Signing in...'
                : 'Continue with Google'
            }
            icon={
              socialLoading === AuthProvider.GOOGLE
                ? 'pi pi-spin pi-spinner'
                : 'pi pi-google'
            }
            loading={socialLoading === AuthProvider.GOOGLE}
            onClick={handleGoogleSignIn}
            className='w-full mb-3 p-button-outlined border-300 text-700'
            style={{ height: '3rem' }}
            disabled={isAnyLoading}
          />

          {isAppleAvailable && (
            <Button
              type='button'
              label={
                socialLoading === AuthProvider.APPLE
                  ? 'Signing in...'
                  : 'Continue with Apple'
              }
              icon={
                socialLoading === AuthProvider.APPLE
                  ? 'pi pi-spin pi-spinner'
                  : 'pi pi-apple'
              }
              loading={socialLoading === AuthProvider.APPLE}
              onClick={handleAppleSignIn}
              className='w-full mb-3 p-button-outlined border-300 text-700'
              style={{
                height: '3rem',
                backgroundColor: '#000',
                color: '#fff',
                borderColor: '#000',
              }}
              disabled={isAnyLoading}
            />
          )}
        </div>

        <Divider className='mb-5'>
          <span className='bg-surface-0 px-3 text-500'>or</span>
        </Divider>

        {/* Email/Password Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='flex flex-column gap-4'
        >
          <div className='field'>
            <label
              htmlFor='email'
              className='block text-900 font-medium mb-2'
            >
              Email Address
            </label>
            <div className='p-input-icon-left'>
              <i className='pi pi-envelope'></i>
              <InputText
                id='email'
                {...register('email')}
                placeholder='Enter your email address'
                className={`w-full p-inputtext-lg ${errors.email ? 'p-invalid' : ''}`}
                disabled={isAnyLoading}
              />
            </div>
            {errors.email && (
              <small className='p-error mt-1 block'>
                {errors.email.message}
              </small>
            )}
          </div>

          <div className='field'>
            <label
              htmlFor='password'
              className='block text-900 font-medium mb-2'
            >
              Password
            </label>
            <div className='p-input-icon-left'>
              <i className='pi pi-lock'></i>
              <Password
                id='password'
                {...register('password')}
                placeholder='Enter your password'
                className={`w-full ${errors.password ? 'p-invalid' : ''}`}
                inputClassName='p-inputtext-lg'
                disabled={isAnyLoading}
                feedback={false}
                toggleMask
              />
            </div>
            {errors.password && (
              <small className='p-error mt-1 block'>
                {errors.password.message}
              </small>
            )}
          </div>

          <div className='flex justify-content-end mb-3'>
            <Button
              type='button'
              link
              label='Forgot your password?'
              onClick={onForgotPassword}
              className='p-0 text-primary-500 hover:text-primary-600'
              disabled={isAnyLoading}
            />
          </div>

          <Button
            type='submit'
            label={isLoading ? 'Signing In...' : 'Sign In'}
            icon={isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'}
            loading={isLoading}
            className='w-full p-button-lg'
            disabled={isAnyLoading}
          />
        </form>

        {/* Switch to Sign Up */}
        <div className='text-center mt-5'>
          <span className='text-600'>Don't have an account? </span>
          <Button
            type='button'
            link
            label='Create Account'
            onClick={onSwitchToSignUp}
            className='p-0 text-primary-500 hover:text-primary-600 font-medium'
            disabled={isAnyLoading}
          />
        </div>
      </div>
    </Card>
  );
};

export default LoginForm;
