import { useTheme } from '@/hooks/useTheme';
import { unifiedAuthService } from '@/services/authService';
import { TOAST_MESSAGES, VALIDATION_MESSAGES } from '@/utils/constants/generic';
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
  email: z.string().email(VALIDATION_MESSAGES.FORMAT.EMAIL),
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
  const { theme } = useTheme();
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
      toast.success(TOAST_MESSAGES.SUCCESS.PASSWORD_RESET_SENT);
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : TOAST_MESSAGES.ERROR.PASSWORD_RESET_FAILED
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      toast.error(TOAST_MESSAGES.ERROR.ENTER_EMAIL);
      return;
    }

    setIsLoading(true);
    try {
      await unifiedAuthService.resetPassword(email);
      toast.success(TOAST_MESSAGES.SUCCESS.PASSWORD_RESET_SENT_AGAIN);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : TOAST_MESSAGES.ERROR.PASSWORD_RESET_FAILED
      );
    } finally {
      setIsLoading(false);
    }
  };

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
              <div className='mb-4'>
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
                  className={`text-6xl ${isEmailSent ? 'pi pi-check-circle' : 'pi pi-key'}`}
                  style={{ color: isEmailSent ? '#10b981' : theme.primary }}
                />
              </div>
              <h1
                className='text-4xl font-bold mb-2'
                style={{ color: theme.textPrimary }}
              >
                {isEmailSent ? 'Check Your Email' : 'Reset Password'}
              </h1>
              <p
                className='text-lg line-height-3'
                style={{ color: theme.textSecondary }}
              >
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
                    backgroundColor: theme.primary,
                    borderColor: theme.primary,
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
                  style={{
                    borderRadius: '12px',
                    backgroundColor: '#10b98115',
                    borderColor: '#10b981',
                    color: theme.textPrimary,
                  }}
                />

                <div
                  className='border-round-xl p-5'
                  style={{
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <h3
                    className='font-semibold mb-3 mt-0'
                    style={{ color: theme.textPrimary }}
                  >
                    What's next?
                  </h3>
                  <ul
                    className='m-0 pl-3 line-height-3'
                    style={{ color: theme.textSecondary }}
                  >
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
                  className='w-full p-button-lg font-semibold p-button-outlined'
                  style={{
                    height: '3.5rem',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    borderColor: theme.primary,
                    color: theme.primary,
                  }}
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Back to Login */}
            <div className='text-center mt-6'>
              <span style={{ color: theme.textSecondary }}>
                Remember your password?{' '}
              </span>
              <Button
                type='button'
                link
                label='Back to Sign In'
                onClick={onBackToLogin}
                className='p-0 font-semibold'
                style={{ color: theme.primary }}
                disabled={isLoading}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
