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
      toast.success('Signed in successfully!');
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
      toast.success('Signed in with Google successfully!');
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
      toast.success('Signed in with Apple successfully!');
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to sign in with Apple'
      );
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <Card className='w-full max-w-md mx-auto'>
      <div className='text-center mb-6'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Welcome Back</h1>
        <p className='text-gray-600'>Sign in to your account</p>
      </div>

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
            <small className='p-error block mt-1'>{errors.email.message}</small>
          )}
        </div>

        <div className='field'>
          <label
            htmlFor='password'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Password
          </label>
          <Password
            id='password'
            {...register('password')}
            placeholder='Enter your password'
            className={`w-full ${errors.password ? 'p-invalid' : ''}`}
            disabled={isLoading}
            feedback={false}
            toggleMask
          />
          {errors.password && (
            <small className='p-error block mt-1'>
              {errors.password.message}
            </small>
          )}
        </div>

        <div className='flex justify-end mb-4'>
          <Button
            type='button'
            link
            label='Forgot Password?'
            onClick={onForgotPassword}
            className='p-0 text-primary-500 hover:text-primary-600'
            disabled={isLoading}
          />
        </div>

        <Button
          type='submit'
          label={isLoading ? 'Signing In...' : 'Sign In'}
          loading={isLoading}
          className='w-full'
          disabled={isLoading}
        />
      </form>

      <Divider className='my-6'>
        <span className='text-gray-500'>OR</span>
      </Divider>

      <div className='space-y-3'>
        <Button
          type='button'
          label={
            socialLoading === AuthProvider.GOOGLE
              ? 'Signing in...'
              : 'Continue with Google'
          }
          icon='pi pi-google'
          loading={socialLoading === AuthProvider.GOOGLE}
          onClick={handleGoogleSignIn}
          className='w-full p-button-outlined'
          disabled={socialLoading !== null}
        />

        {isAppleAvailable && (
          <Button
            type='button'
            label={
              socialLoading === AuthProvider.APPLE
                ? 'Signing in...'
                : 'Continue with Apple'
            }
            icon='pi pi-apple'
            loading={socialLoading === AuthProvider.APPLE}
            onClick={handleAppleSignIn}
            className='w-full p-button-outlined p-button-dark'
            disabled={socialLoading !== null}
          />
        )}
      </div>

      <div className='text-center mt-6'>
        <span className='text-gray-600'>Don't have an account? </span>
        <Button
          type='button'
          link
          label='Sign Up'
          onClick={onSwitchToSignUp}
          className='p-0 text-primary-500 hover:text-primary-600'
          disabled={isLoading || socialLoading !== null}
        />
      </div>
    </Card>
  );
};

export default LoginForm;
