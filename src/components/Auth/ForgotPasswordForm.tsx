import { unifiedAuthService } from '@/services/authService';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onBackToLogin?: () => void;
  onBackToWelcome?: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSuccess,
  onBackToLogin,
  onBackToWelcome,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const email = watch('email');

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await unifiedAuthService.resetPassword(data.email);
      setIsEmailSent(true);
      toast.success('Password reset email sent! Please check your inbox.');
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to send reset email'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await unifiedAuthService.resetPassword(email);
      toast.success('Password reset email sent again!');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to resend email'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex align-items-center justify-content-center p-4">
      <Card style={{ width: '100%', maxWidth: '450px' }}>
        <div className="text-center mb-4">
          {onBackToWelcome && (
            <div className="text-left mb-3">
              <Button
                icon="pi pi-arrow-left"
                className="p-button-text"
                onClick={onBackToWelcome}
                tooltip="Back to Welcome"
                tooltipOptions={{ position: 'bottom' }}
              />
            </div>
          )}
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Reset Password</h2>
          <p className="text-gray-600">Enter your email to receive reset instructions</p>
        </div>

        <div className='p-6'>
          {/* Header */}
          <div className='text-center mb-6'>
            <div className='mb-4'>
              <i
                className={`text-6xl ${isEmailSent ? 'pi pi-check-circle text-green-500' : 'pi pi-key text-primary'}`}
              ></i>
            </div>
            <h1 className='text-4xl font-bold text-900 mb-2'>
              {isEmailSent ? 'Check Your Email' : 'Reset Password'}
            </h1>
            <p className='text-600 text-lg line-height-3'>
              {isEmailSent
                ? 'We sent a password reset link to your email address'
                : 'Enter your email address and we will send you a link to reset your password'}
            </p>
          </div>

          {!isEmailSent ? (
            /* Reset Form */
            <form
              onSubmit={handleSubmit(onSubmit)}
              className='flex flex-column gap-4'
            >
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
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <small className='p-error mt-2 block text-sm font-medium'>
                    {errors.email.message}
                  </small>
                )}
              </div>

              <Button
                type='submit'
                label={isLoading ? 'Sending...' : 'Send Reset Link'}
                icon={isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-send'}
                loading={isLoading}
                className='w-full p-button-lg font-semibold'
                style={{
                  height: '3.5rem',
                  borderRadius: '12px',
                  fontSize: '1rem',
                }}
                disabled={isLoading}
              />
            </form>
          ) : (
            /* Success State */
            <div className='flex flex-column gap-4'>
              <Message
                severity='success'
                text={`Password reset email sent to ${email}`}
                className='w-full'
                style={{ borderRadius: '12px' }}
              />

              <div className='bg-surface-50 border-round-xl p-5'>
                <h3 className='text-900 font-semibold mb-3 mt-0'>What's next?</h3>
                <ul className='text-600 m-0 pl-3 line-height-3'>
                  <li className='mb-2'>Check your inbox and spam folder</li>
                  <li className='mb-2'>
                    Click the link in the email to reset your password
                  </li>
                  <li className='mb-2'>The link will expire in 1 hour</li>
                </ul>
              </div>

              <Button
                type='button'
                label={isLoading ? 'Resending...' : 'Resend Email'}
                icon={isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'}
                loading={isLoading}
                onClick={handleResendEmail}
    <Card className='w-full max-w-md shadow-4 border-round-xl overflow-hidden'>
      <div className='p-6'>
        {/* Header */}
        <div className='text-center mb-6'>
          <div className='mb-4'>
            <i
              className={`text-6xl ${isEmailSent ? 'pi pi-check-circle text-green-500' : 'pi pi-key text-primary'}`}
            ></i>
          </div>
          <h1 className='text-4xl font-bold text-900 mb-2'>
            {isEmailSent ? 'Check Your Email' : 'Reset Password'}
          </h1>
          <p className='text-600 text-lg line-height-3'>
            {isEmailSent
              ? 'We sent a password reset link to your email address'
              : 'Enter your email address and we will send you a link to reset your password'}
          </p>
        </div>

        {!isEmailSent ? (
          /* Reset Form */
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='flex flex-column gap-4'
          >
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
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <small className='p-error mt-2 block text-sm font-medium'>
                  {errors.email.message}
                </small>
              )}
            </div>

            <Button
              type='submit'
              label={isLoading ? 'Sending...' : 'Send Reset Link'}
              icon={isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-send'}
              loading={isLoading}
              className='w-full p-button-lg font-semibold'
              style={{
                height: '3.5rem',
                borderRadius: '12px',
                fontSize: '1rem',
              }}
              disabled={isLoading}
            />
          </form>
        ) : (
          /* Success State */
          <div className='flex flex-column gap-4'>
            <Message
              severity='success'
              text={`Password reset email sent to ${email}`}
              className='w-full'
              style={{ borderRadius: '12px' }}
            />

            <div className='bg-surface-50 border-round-xl p-5'>
              <h3 className='text-900 font-semibold mb-3 mt-0'>What's next?</h3>
              <ul className='text-600 m-0 pl-3 line-height-3'>
                <li className='mb-2'>Check your inbox and spam folder</li>
                <li className='mb-2'>
                  Click the link in the email to reset your password
                </li>
                <li className='mb-2'>The link will expire in 1 hour</li>
              </ul>
            </div>

            <Button
              type='button'
              label={isLoading ? 'Resending...' : 'Resend Email'}
              icon={isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'}
              loading={isLoading}
              onClick={handleResendEmail}
              className='w-full p-button-outlined font-semibold'
              style={{
                height: '3.5rem',
                borderRadius: '12px',
                fontSize: '1rem',
              }}
              disabled={isLoading}
            />
          </div>
        )}

        {/* Back to Login */}
        <div className='text-center mt-6'>
          <Button
            type='button'
            link
            label='← Back to Sign In'
            onClick={onBackToLogin}
            className='p-0 text-primary-500 hover:text-primary-600 font-semibold'
            disabled={isLoading}
          />
        </div>
      </div>
    </Card>
  );
};

export default ForgotPasswordForm;
