import { unifiedAuthService } from '@/services/authService';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
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
    <Card className='w-full max-w-md mx-auto'>
      <div className='text-center mb-6'>
        <i className='pi pi-key text-4xl text-primary-500 mb-4 block'></i>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          {isEmailSent ? 'Check Your Email' : 'Forgot Password?'}
        </h1>
        <p className='text-gray-600'>
          {isEmailSent
            ? 'We sent a password reset link to your email address'
            : 'Enter your email address and we will send you a link to reset your password'}
        </p>
      </div>

      {!isEmailSent ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='space-y-4'
        >
          <div className='field'>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Email Address
            </label>
            <InputText
              id='email'
              {...register('email')}
              placeholder='Enter your email'
              className={`w-full ${errors.email ? 'p-invalid' : ''}`}
              disabled={isLoading}
            />
            {errors.email && (
              <small className='p-error block mt-1'>
                {errors.email.message}
              </small>
            )}
          </div>

          <Button
            type='submit'
            label={isLoading ? 'Sending...' : 'Send Reset Link'}
            loading={isLoading}
            className='w-full'
            disabled={isLoading}
          />
        </form>
      ) : (
        <div className='space-y-4'>
          <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
            <div className='flex items-center'>
              <i className='pi pi-check-circle text-green-500 mr-2'></i>
              <span className='text-green-800 text-sm'>
                Password reset email sent to <strong>{email}</strong>
              </span>
            </div>
          </div>

          <div className='text-sm text-gray-600 space-y-2'>
            <p>• Check your inbox and spam folder</p>
            <p>• Click the link in the email to reset your password</p>
            <p>• The link will expire in 1 hour</p>
          </div>

          <Button
            type='button'
            label={isLoading ? 'Resending...' : 'Resend Email'}
            loading={isLoading}
            onClick={handleResendEmail}
            className='w-full p-button-outlined'
            disabled={isLoading}
          />
        </div>
      )}

      <div className='text-center mt-6'>
        <Button
          type='button'
          link
          label='← Back to Sign In'
          onClick={onBackToLogin}
          className='p-0 text-primary-500 hover:text-primary-600'
          disabled={isLoading}
        />
      </div>
    </Card>
  );
};

export default ForgotPasswordForm;
