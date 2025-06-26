import { AuthProvider, unifiedAuthService } from '@/services/authService';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Checkbox } from 'primereact/checkbox';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

// Validation schema
const signUpSchema = z
  .object({
    displayName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({
  onSuccess,
  onSwitchToLogin,
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
    setValue,
    watch,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      acceptTerms: false,
    },
  });

  const acceptTerms = watch('acceptTerms');

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      await unifiedAuthService.signUpWithEmail({
        email: data.email,
        password: data.password,
        displayName: data.displayName,
      });
      toast.success(
        'Account created successfully! Please check your email for verification.'
      );
      reset();
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create account'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSocialLoading(AuthProvider.GOOGLE);
    try {
      await unifiedAuthService.signInWithGoogle();
      toast.success('Signed up with Google successfully!');
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to sign up with Google'
      );
    } finally {
      setSocialLoading(null);
    }
  };

  const handleAppleSignIn = async () => {
    setSocialLoading(AuthProvider.APPLE);
    try {
      await unifiedAuthService.signInWithApple();
      toast.success('Signed up with Apple successfully!');
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to sign up with Apple'
      );
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <Card className='w-full max-w-md mx-auto'>
      <div className='text-center mb-6'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          Create Account
        </h1>
        <p className='text-gray-600'>Sign up to get started</p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className='space-y-4'
      >
        <div className='field'>
          <label
            htmlFor='displayName'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Full Name
          </label>
          <InputText
            id='displayName'
            {...register('displayName')}
            placeholder='Enter your full name'
            className={`w-full ${errors.displayName ? 'p-invalid' : ''}`}
            disabled={isLoading}
          />
          {errors.displayName && (
            <small className='p-error block mt-1'>
              {errors.displayName.message}
            </small>
          )}
        </div>

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
            feedback={true}
            toggleMask
          />
          {errors.password && (
            <small className='p-error block mt-1'>
              {errors.password.message}
            </small>
          )}
        </div>

        <div className='field'>
          <label
            htmlFor='confirmPassword'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Confirm Password
          </label>
          <Password
            id='confirmPassword'
            {...register('confirmPassword')}
            placeholder='Confirm your password'
            className={`w-full ${errors.confirmPassword ? 'p-invalid' : ''}`}
            disabled={isLoading}
            feedback={false}
            toggleMask
          />
          {errors.confirmPassword && (
            <small className='p-error block mt-1'>
              {errors.confirmPassword.message}
            </small>
          )}
        </div>

        <div className='field-checkbox'>
          <Checkbox
            inputId='acceptTerms'
            checked={acceptTerms}
            onChange={(e) => setValue('acceptTerms', e.checked || false)}
            disabled={isLoading}
            className={errors.acceptTerms ? 'p-invalid' : ''}
          />
          <label
            htmlFor='acceptTerms'
            className='ml-2 text-sm text-gray-700'
          >
            I agree to the{' '}
            <a
              href='#'
              className='text-primary-500 hover:text-primary-600'
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href='#'
              className='text-primary-500 hover:text-primary-600'
            >
              Privacy Policy
            </a>
          </label>
          {errors.acceptTerms && (
            <small className='p-error block mt-1'>
              {errors.acceptTerms.message}
            </small>
          )}
        </div>

        <Button
          type='submit'
          label={isLoading ? 'Creating Account...' : 'Create Account'}
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
              ? 'Signing up...'
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
                ? 'Signing up...'
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
        <span className='text-gray-600'>Already have an account? </span>
        <Button
          type='button'
          link
          label='Sign In'
          onClick={onSwitchToLogin}
          className='p-0 text-primary-500 hover:text-primary-600'
          disabled={isLoading || socialLoading !== null}
        />
      </div>
    </Card>
  );
};

export default SignUpForm;
