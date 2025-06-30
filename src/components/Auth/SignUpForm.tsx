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
        'Welcome! Account created successfully. Please check your email for verification.'
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
      toast.success('Welcome! Account created with Google successfully.');

      // Wait a moment for auth state to settle before redirecting
      setTimeout(() => {
        onSuccess?.();
      }, 500);
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
      toast.success('Welcome! Account created with Apple successfully.');
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to sign up with Apple'
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
            <i className='pi pi-user-plus text-6xl text-primary'></i>
          </div>
          <h1 className='text-4xl font-bold text-900 mb-2'>Create Account</h1>
          <p className='text-600 text-lg'>Join us today and get started</p>
        </div>

        {/* Social Sign Up Buttons */}
        <div className='mb-5'>
          <Button
            type='button'
            label={
              socialLoading === AuthProvider.GOOGLE
                ? 'Creating account...'
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
                  ? 'Creating account...'
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
          <div className='field mb-4'>
            <label
              htmlFor='displayName'
              className='block text-900 font-medium mb-2'
            >
              Full Name
            </label>
            <span className='p-input-icon-left w-full'>
              <i className='pi pi-user'></i>
              <InputText
                id='displayName'
                {...register('displayName')}
                placeholder='Enter your full name'
                className={`w-full p-inputtext-lg ${errors.displayName ? 'p-invalid' : ''}`}
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                disabled={isAnyLoading}
              />
            </span>
            {errors.displayName && (
              <small className='p-error mt-1 block'>
                {errors.displayName.message}
              </small>
            )}
          </div>

          <div className='field mb-4'>
            <label
              htmlFor='email'
              className='block text-900 font-medium mb-2'
            >
              Email Address
            </label>
            <span className='p-input-icon-left w-full'>
              <i className='pi pi-envelope'></i>
              <InputText
                id='email'
                {...register('email')}
                placeholder='Enter your email address'
                className={`w-full p-inputtext-lg ${errors.email ? 'p-invalid' : ''}`}
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                disabled={isAnyLoading}
              />
            </span>
            {errors.email && (
              <small className='p-error mt-1 block'>
                {errors.email.message}
              </small>
            )}
          </div>

          <div className='field mb-4'>
            <label
              htmlFor='password'
              className='block text-900 font-medium mb-2'
            >
              Password
            </label>
            <span className='p-input-icon-left w-full'>
              <i className='pi pi-lock'></i>
              <Password
                id='password'
                {...register('password')}
                placeholder='Create a strong password'
                className={`w-full ${errors.password ? 'p-invalid' : ''}`}
                inputClassName='p-inputtext-lg w-full'
                inputStyle={{ width: '100%', paddingLeft: '2.5rem' }}
                style={{ width: '100%' }}
                disabled={isAnyLoading}
                feedback={true}
                toggleMask
              />
            </span>
            {errors.password && (
              <small className='p-error mt-1 block'>
                {errors.password.message}
              </small>
            )}
          </div>

          <div className='field mb-4'>
            <label
              htmlFor='confirmPassword'
              className='block text-900 font-medium mb-2'
            >
              Confirm Password
            </label>
            <span className='p-input-icon-left w-full'>
              <i className='pi pi-lock'></i>
              <Password
                id='confirmPassword'
                {...register('confirmPassword')}
                placeholder='Confirm your password'
                className={`w-full ${errors.confirmPassword ? 'p-invalid' : ''}`}
                inputClassName='p-inputtext-lg w-full'
                inputStyle={{ width: '100%', paddingLeft: '2.5rem' }}
                style={{ width: '100%' }}
                disabled={isAnyLoading}
                feedback={false}
                toggleMask
              />
            </span>
            {errors.confirmPassword && (
              <small className='p-error mt-1 block'>
                {errors.confirmPassword.message}
              </small>
            )}
          </div>

          <div className='field-checkbox flex align-items-start gap-2 mb-4'>
            <Checkbox
              inputId='acceptTerms'
              checked={acceptTerms}
              onChange={(e) => setValue('acceptTerms', e.checked || false)}
              disabled={isAnyLoading}
              className={`mt-1 ${errors.acceptTerms ? 'p-invalid' : ''}`}
            />
            <label
              htmlFor='acceptTerms'
              className='text-900 line-height-3'
            >
              I agree to the{' '}
              <a
                href='#'
                className='text-primary-500 hover:text-primary-600 no-underline'
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href='#'
                className='text-primary-500 hover:text-primary-600 no-underline'
              >
                Privacy Policy
              </a>
            </label>
          </div>
          {errors.acceptTerms && (
            <small className='p-error block -mt-3 mb-3'>
              {errors.acceptTerms.message}
            </small>
          )}

          <Button
            type='submit'
            label={isLoading ? 'Creating Account...' : 'Create Account'}
            icon={isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-user-plus'}
            loading={isLoading}
            className='w-full p-button-lg'
            disabled={isAnyLoading}
          />
        </form>

        {/* Switch to Login */}
        <div className='text-center mt-5'>
          <span className='text-600'>Already have an account? </span>
          <Button
            type='button'
            link
            label='Sign In'
            onClick={onSwitchToLogin}
            className='p-0 text-primary-500 hover:text-primary-600 font-medium'
            disabled={isAnyLoading}
          />
        </div>
      </div>
    </Card>
  );
};

export default SignUpForm;
