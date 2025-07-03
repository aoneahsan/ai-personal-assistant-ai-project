import { unifiedAuthService } from '@/services/authService';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';
import './AnonymousConversionModal.scss';

// Validation schema
const conversionSchema = z
  .object({
    displayName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ConversionFormData = z.infer<typeof conversionSchema>;

interface AnonymousConversionModalProps {
  visible: boolean;
  onHide: () => void;
  onSuccess?: () => void;
}

const AnonymousConversionModal: React.FC<AnonymousConversionModalProps> = ({
  visible,
  onHide,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const anonymousInfo = unifiedAuthService.getAnonymousUserInfo();

  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<ConversionFormData>({
    resolver: zodResolver(conversionSchema),
    defaultValues: {
      displayName: anonymousInfo?.displayName || '',
    },
  });

  const onSubmit = async (data: ConversionFormData) => {
    setIsLoading(true);
    try {
      await unifiedAuthService.convertAnonymousToEmail(
        data.email,
        data.password,
        data.displayName
      );
      toast.success(
        'Account created successfully! Your chat history has been saved. Please check your email for verification.'
      );
      reset();
      onSuccess?.();
      onHide();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create account'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    onHide();
  };

  const footer = (
    <div className='conversion-footer'>
      <Button
        label='Cancel'
        icon='pi pi-times'
        className='p-button-text'
        onClick={handleCancel}
        disabled={isLoading}
      />
      <Button
        label='Create Account'
        icon='pi pi-check'
        onClick={handleSubmit(onSubmit)}
        loading={isLoading}
        className='p-button-success'
      />
    </div>
  );

  return (
    <Dialog
      header='Save Your Chat History'
      visible={visible}
      style={{ width: '450px' }}
      footer={footer}
      onHide={handleCancel}
      modal
      closable={!isLoading}
      className='conversion-modal'
    >
      <div className='conversion-content'>
        <div className='conversion-header'>
          <div className='conversion-icon'>💾</div>
          <h3>Convert to Permanent Account</h3>
          <p>
            Create a permanent account to save your conversation history and
            unlock all features. Your current chat will be preserved!
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className='conversion-form'
        >
          {/* Display Name */}
          <div className='field'>
            <label htmlFor='displayName'>Full Name</label>
            <Controller
              name='displayName'
              control={control}
              render={({ field }) => (
                <InputText
                  id='displayName'
                  {...field}
                  placeholder='Enter your full name'
                  className={errors.displayName ? 'p-invalid' : ''}
                  disabled={isLoading}
                />
              )}
            />
            {errors.displayName && (
              <small className='p-error'>{errors.displayName.message}</small>
            )}
          </div>

          {/* Email */}
          <div className='field'>
            <label htmlFor='email'>Email Address</label>
            <Controller
              name='email'
              control={control}
              render={({ field }) => (
                <InputText
                  id='email'
                  {...field}
                  type='email'
                  placeholder='Enter your email address'
                  className={errors.email ? 'p-invalid' : ''}
                  disabled={isLoading}
                />
              )}
            />
            {errors.email && (
              <small className='p-error'>{errors.email.message}</small>
            )}
          </div>

          {/* Password */}
          <div className='field'>
            <label htmlFor='password'>Password</label>
            <Controller
              name='password'
              control={control}
              render={({ field }) => (
                <Password
                  id='password'
                  {...field}
                  placeholder='Create a password'
                  className={errors.password ? 'p-invalid' : ''}
                  disabled={isLoading}
                  feedback={false}
                  toggleMask
                />
              )}
            />
            {errors.password && (
              <small className='p-error'>{errors.password.message}</small>
            )}
          </div>

          {/* Confirm Password */}
          <div className='field'>
            <label htmlFor='confirmPassword'>Confirm Password</label>
            <Controller
              name='confirmPassword'
              control={control}
              render={({ field }) => (
                <Password
                  id='confirmPassword'
                  {...field}
                  placeholder='Confirm your password'
                  className={errors.confirmPassword ? 'p-invalid' : ''}
                  disabled={isLoading}
                  feedback={false}
                  toggleMask
                />
              )}
            />
            {errors.confirmPassword && (
              <small className='p-error'>
                {errors.confirmPassword.message}
              </small>
            )}
          </div>
        </form>

        <div className='conversion-benefits'>
          <h4>✨ What you'll get:</h4>
          <ul>
            <li>💬 Keep your current conversation</li>
            <li>📚 Permanent chat history</li>
            <li>✏️ Edit and delete messages</li>
            <li>🔍 Advanced search features</li>
            <li>📱 Multi-device sync</li>
            <li>🎨 Custom themes</li>
          </ul>
        </div>

        <div className='privacy-notice'>
          <i className='pi pi-shield text-blue-500 mr-2' />
          <span>
            Your data is encrypted and secure. We never share your information.
          </span>
        </div>
      </div>
    </Dialog>
  );
};

export default AnonymousConversionModal;
