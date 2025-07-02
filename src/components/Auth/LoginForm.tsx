import { AuthProvider, unifiedAuthService } from '@/services/authService';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
  onBackToWelcome?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToSignUp,
  onForgotPassword,
  onBackToWelcome,
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
    control,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await unifiedAuthService.signInWithEmail(data.email, data.password);
      toast.success('Welcome back! You have signed in successfully.');
      reset();
      // Add delay to allow auth state to update
      setTimeout(() => {
        onSuccess?.();
      }, 500);
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
      // Add delay to allow auth state to update
      setTimeout(() => {
        onSuccess?.();
      }, 500);
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
      // Add delay to allow auth state to update
      setTimeout(() => {
        onSuccess?.();
      }, 500);
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
    <div className='min-h-screen bg-gray-50 flex align-items-center justify-content-center p-4'>
      <Card style={{ width: '100%', maxWidth: '450px' }}>
        <div className='text-center mb-4'>
          {onBackToWelcome && (
            <div className='text-left mb-3'>
              <Button
                icon='pi pi-arrow-left'
                className='p-button-text'
                onClick={onBackToWelcome}
                tooltip='Back to Welcome'
                tooltipOptions={{ position: 'bottom' }}
              />
            </div>
          )}
          <h2 className='text-3xl font-bold text-gray-800 mb-2'>
            Welcome Back
          </h2>
          <p className='text-gray-600'>Sign in to your account</p>
        </div>

        <div className='p-6'>
          {/* Header */}
          <div className='text-center mb-6'>
            <div className='mb-4'>
              <i className='pi pi-shield text-6xl text-primary'></i>
            </div>
            <h1 className='text-4xl font-bold text-900 mb-2'>Welcome Back</h1>
            <p className='text-600 text-lg line-height-3'>
              Sign in to your account to continue
            </p>
          </div>

          {/* Social Login Buttons */}
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
              className='w-full mb-3 p-button-outlined border-300 text-700 hover:bg-primary-50'
              style={{
                height: '3.5rem',
                borderRadius: '12px',
                fontWeight: '500',
              }}
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
                className='w-full mb-3'
                style={{
                  height: '3.5rem',
                  backgroundColor: '#000',
                  color: '#fff',
                  borderColor: '#000',
                  borderRadius: '12px',
                  fontWeight: '500',
                }}
                disabled={isAnyLoading}
              />
            )}
          </div>

          <Divider className='mb-5'>
            <span className='bg-surface-0 px-4 text-500 font-medium'>or</span>
          </Divider>

          {/* Email/Password Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='flex flex-column gap-4'
          >
            {/* Email Field */}
            <div className='field mb-4'>
              <label
                htmlFor='email'
                className='block text-900 font-semibold mb-3 text-base'
              >
                Email Address
              </label>
              <div className='p-input-icon-left w-full'>
                <i className='pi pi-envelope text-400'></i>
                <InputText
                  id='email'
                  {...register('email')}
                  placeholder='Enter your email address'
                  className={`w-full p-inputtext-lg ${errors.email ? 'p-invalid' : ''}`}
                  style={{
                    width: '100%',
                    paddingLeft: '3rem',
                    height: '3.5rem',
                    borderRadius: '12px',
                    fontSize: '1rem',
                  }}
                  disabled={isAnyLoading}
                />
              </div>
              {errors.email && (
                <small className='p-error mt-2 block text-sm font-medium'>
                  {errors.email.message}
                </small>
              )}
            </div>

            {/* Password Field */}
            <div className='field mb-4'>
              <label
                htmlFor='password'
                className='block text-900 font-semibold mb-3 text-base'
              >
                Password
              </label>
              <div className='p-input-icon-left w-full'>
                <i className='pi pi-lock text-400'></i>
                <Controller
                  name='password'
                  control={control}
                  render={({ field, fieldState }) => (
                    <Password
                      id='password'
                      {...field}
                      placeholder='Enter your password'
                      className={`w-full ${fieldState.error ? 'p-invalid' : ''}`}
                      inputClassName='p-inputtext-lg w-full'
                      inputStyle={{
                        width: '100%',
                        paddingLeft: '3rem',
                        height: '3.5rem',
                        borderRadius: '12px',
                        fontSize: '1rem',
                      }}
                      style={{ width: '100%' }}
                      disabled={isAnyLoading}
                      feedback={false}
                      toggleMask
                      pt={{
                        input: {
                          style: {
                            paddingLeft: '3rem',
                            height: '3.5rem',
                            borderRadius: '12px',
                            fontSize: '1rem',
                          },
                        },
                      }}
                    />
                  )}
                />
              </div>
              {errors.password && (
                <small className='p-error mt-2 block text-sm font-medium'>
                  {errors.password.message}
                </small>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className='flex justify-content-end mb-4'>
              <Button
                type='button'
                link
                label='Forgot your password?'
                onClick={onForgotPassword}
                className='p-0 text-primary-500 hover:text-primary-600 font-medium'
                disabled={isAnyLoading}
              />
            </div>

            {/* Submit Button */}
            <Button
              type='submit'
              label={isLoading ? 'Signing In...' : 'Sign In'}
              icon={isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'}
              loading={isLoading}
              className='w-full p-button-lg font-semibold'
              style={{
                height: '3.5rem',
                borderRadius: '12px',
                fontSize: '1rem',
              }}
              disabled={isAnyLoading}
            />
          </form>

          {/* Switch to Sign Up */}
          <div className='text-center mt-6'>
            <span className='text-600'>Don't have an account? </span>
            <Button
              type='button'
              link
              label='Create Account'
              onClick={onSwitchToSignUp}
              className='p-0 text-primary-500 hover:text-primary-600 font-semibold'
              disabled={isAnyLoading}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginForm;
