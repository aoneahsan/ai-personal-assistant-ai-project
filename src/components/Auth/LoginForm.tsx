import { useTheme } from '@/hooks/useTheme';
import { AuthProvider, unifiedAuthService } from '@/services/authService';
import { TOAST_MESSAGES, VALIDATION_MESSAGES } from '@/utils/constants/generic';
import {
  BUTTON_LABELS,
  LOADING_MESSAGES,
} from '@/utils/constants/generic/labels';
import { CSS_CLASSES } from '@/utils/constants/generic/styles';
import { ROUTES } from '@/utils/constants/routingConstants';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
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
  email: z.string().email(VALIDATION_MESSAGES.FORMAT.EMAIL),
  password: z.string().min(6, VALIDATION_MESSAGES.FORMAT.PASSWORD_TOO_SHORT),
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
  const navigate = useNavigate();
  const { theme } = useTheme();
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
      toast.success(TOAST_MESSAGES.SUCCESS.WELCOME_BACK);
      reset();
      // Add delay to allow auth state to update
      setTimeout(() => {
        onSuccess?.();
      }, 500);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : TOAST_MESSAGES.ERROR.SIGNIN_FAILED
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSocialLoading(AuthProvider.GOOGLE);
    try {
      await unifiedAuthService.signInWithGoogle();
      toast.success(TOAST_MESSAGES.SUCCESS.GOOGLE_SIGNIN);
      // Add delay to allow auth state to update
      setTimeout(() => {
        onSuccess?.();
      }, 500);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : TOAST_MESSAGES.ERROR.GOOGLE_SIGNIN_FAILED
      );
    } finally {
      setSocialLoading(null);
    }
  };

  const handleAppleSignIn = async () => {
    setSocialLoading(AuthProvider.APPLE);
    try {
      await unifiedAuthService.signInWithApple();
      toast.success(TOAST_MESSAGES.SUCCESS.APPLE_SIGNIN);
      // Add delay to allow auth state to update
      setTimeout(() => {
        onSuccess?.();
      }, 500);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : TOAST_MESSAGES.ERROR.APPLE_SIGNIN_FAILED
      );
    } finally {
      setSocialLoading(null);
    }
  };

  const isAnyLoading = isLoading || socialLoading !== null;

  return (
    <div
      className='min-h-screen flex align-items-center justify-content-center p-4'
      style={{ backgroundColor: theme.surface || '#f8f9fa' }}
    >
      <div className='w-full max-w-md'>
        <Card className='shadow-3 border-round-2xl'>
          <div className='p-6'>
            {/* Back Button */}
            {onBackToWelcome && (
              <div className={CSS_CLASSES.SPACING.MB_4}>
                <Button
                  icon='pi pi-arrow-left'
                  className='p-button-text p-button-rounded'
                  onClick={onBackToWelcome}
                  tooltip='Back to Welcome'
                  tooltipOptions={{ position: 'bottom' }}
                  style={{ color: theme.textSecondary }}
                />
              </div>
            )}

            {/* Header */}
            <div className='text-center mb-6'>
              <div className='mb-4'>
                <i
                  className='pi pi-shield text-6xl'
                  style={{ color: theme.primary }}
                />
              </div>
              <h1
                className='text-4xl font-bold mb-2'
                style={{ color: theme.textPrimary }}
              >
                Welcome Back
              </h1>
              <p
                className='text-lg line-height-3'
                style={{ color: theme.textSecondary }}
              >
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
                className='w-full mb-3 p-button-outlined'
                style={{
                  height: '3.5rem',
                  borderRadius: '12px',
                  fontWeight: '500',
                  borderColor: theme.border,
                  color: theme.textPrimary,
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
              <span
                className='px-4 font-medium'
                style={{
                  backgroundColor: theme.surface,
                  color: theme.textSecondary,
                }}
              >
                or
              </span>
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
                  className='block font-semibold mb-3 text-base'
                  style={{ color: theme.textPrimary }}
                >
                  Email Address
                </label>
                <div className='p-input-icon-left w-full'>
                  <i
                    className='pi pi-envelope'
                    style={{ color: theme.textSecondary }}
                  />
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
                      borderColor: theme.border,
                      backgroundColor: theme.surface,
                      color: theme.textPrimary,
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
                  className='block font-semibold mb-3 text-base'
                  style={{ color: theme.textPrimary }}
                >
                  Password
                </label>
                <div className='p-input-icon-left w-full'>
                  <i
                    className='pi pi-lock'
                    style={{ color: theme.textSecondary }}
                  />
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
                          borderColor: theme.border,
                          backgroundColor: theme.surface,
                          color: theme.textPrimary,
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
                              borderColor: theme.border,
                              backgroundColor: theme.surface,
                              color: theme.textPrimary,
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
                  className='p-0 font-medium'
                  style={{ color: theme.primary }}
                  disabled={isAnyLoading}
                />
              </div>

              {/* Submit Button */}
              <Button
                type='submit'
                label={
                  isLoading
                    ? LOADING_MESSAGES.SIGNING_IN
                    : BUTTON_LABELS.SIGN_IN
                }
                icon={isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'}
                loading={isLoading}
                className='w-full p-button-lg font-semibold'
                style={{
                  height: '3.5rem',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  backgroundColor: theme.primary,
                  borderColor: theme.primary,
                }}
                disabled={isAnyLoading}
              />
            </form>

            {/* Switch to Sign Up */}
            <div className='text-center mt-6'>
              <span style={{ color: theme.textSecondary }}>
                Don't have an account?{' '}
              </span>
              <Button
                type='button'
                link
                label='Create Account'
                onClick={onSwitchToSignUp}
                className='p-0 font-semibold'
                style={{ color: theme.primary }}
                disabled={isAnyLoading}
              />
            </div>

            {/* Policy Links */}
            <div
              className='text-center mt-4 pt-4 border-top-1'
              style={{ borderColor: theme.border }}
            >
              <p
                className='text-xs mb-3'
                style={{ color: theme.textSecondary }}
              >
                By signing in, you agree to our policies:
              </p>
              <div className='flex flex-wrap justify-content-center gap-3 text-xs'>
                <Button
                  type='button'
                  link
                  label='Privacy Policy'
                  onClick={() => navigate({ to: ROUTES.PRIVACY_POLICY })}
                  className='p-0 text-xs'
                  style={{ color: theme.textSecondary }}
                />
                <span style={{ color: theme.textSecondary }}>•</span>
                <Button
                  type='button'
                  link
                  label='Terms of Service'
                  onClick={() => navigate({ to: ROUTES.TERMS_OF_SERVICE })}
                  className='p-0 text-xs'
                  style={{ color: theme.textSecondary }}
                />
                <span style={{ color: theme.textSecondary }}>•</span>
                <Button
                  type='button'
                  link
                  label='Cookie Policy'
                  onClick={() => navigate({ to: ROUTES.COOKIE_POLICY })}
                  className='p-0 text-xs'
                  style={{ color: theme.textSecondary }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
