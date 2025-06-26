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
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSuccess,
  onBackToLogin,
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
    <div className='flex justify-content-center align-items-center min-h-screen py-4 px-3 bg-gray-50'>
      <Card className='w-full max-w-md shadow-3 border-round-lg'>
        <div className='p-5'>
          {/* Header */}
          <div className='text-center mb-5'>
            <div className='mb-3'>
              <i
                className={`text-6xl ${isEmailSent ? 'pi pi-check-circle text-green-500' : 'pi pi-key text-primary'}`}
              ></i>
            </div>
            <h1 className='text-4xl font-bold text-900 mb-2'>
              {isEmailSent ? 'Check Your Email' : 'Reset Password'}
            </h1>
            <p className='text-600 text-lg'>
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
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <small className='p-error mt-1 block'>
                    {errors.email.message}
                  </small>
                )}
              </div>

              <Button
                type='submit'
                label={isLoading ? 'Sending...' : 'Send Reset Link'}
                icon={isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-send'}
                loading={isLoading}
                className='w-full p-button-lg'
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
              />

              <div className='bg-surface-50 border-round-lg p-4'>
                <h3 className='text-900 font-semibold mb-3 mt-0'>
                  What's next?
                </h3>
                <ul className='text-600 m-0 pl-3'>
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
                className='w-full p-button-outlined'
                disabled={isLoading}
              />
            </div>
          )}

          {/* Back to Login */}
          <div className='text-center mt-5'>
            <Button
              type='button'
              link
              label='← Back to Sign In'
              onClick={onBackToLogin}
              className='p-0 text-primary-500 hover:text-primary-600 font-medium'
              disabled={isLoading}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPasswordForm;
