import {
  CustomCheckbox,
  CustomDropdown,
  CustomInputText,
} from '@/components/FormComponents';
import { useToast } from '@/hooks';
import { useTheme } from '@/hooks/useTheme';
import { ROUTES } from '@/utils/constants/routingConstants';
import {
  UserProfileData,
  useUserProfileZState,
} from '@/zustandStates/userState';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Validation schema
const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  generalInfo: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional(),
    address: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
  }),
  preferences: z.object({
    theme: z.string().optional(),
    language: z.string().optional(),
    notifications: z.boolean().optional(),
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { showRefreshSuccess, showLoadError, showInfo } = useToast();
  const { profile, updateProfile, loadProfileFromStorage } =
    useUserProfileZState();
  const [refreshing, setRefreshing] = useState(false);

  // Load profile from storage on component mount
  useEffect(() => {
    loadProfileFromStorage();
  }, [loadProfileFromStorage]);

  // Form setup with react-hook-form and zod
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      generalInfo: {
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        gender: '',
      },
      preferences: {
        theme: 'auto',
        language: 'English',
        notifications: true,
      },
    },
  });

  // Update form when profile state changes
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '',
        email: profile.email || '',
        generalInfo: {
          firstName: profile.generalInfo?.firstName || '',
          lastName: profile.generalInfo?.lastName || '',
          phone: profile.generalInfo?.phone || '',
          address: profile.generalInfo?.address || '',
          dateOfBirth: profile.generalInfo?.dateOfBirth || '',
          gender: profile.generalInfo?.gender || '',
        },
        preferences: {
          theme: profile.preferences?.theme || 'auto',
          language: profile.preferences?.language || 'English',
          notifications: profile.preferences?.notifications ?? true,
        },
      });
    }
  }, [profile, reset]);

  const handleCancel = () => {
    if (profile) {
      reset();
    }
    navigate({ to: ROUTES.DASHBOARD });
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadProfileFromStorage();
      showRefreshSuccess('Profile');
    } catch {
      showLoadError('profile data');
    } finally {
      setRefreshing(false);
    }
  };

  // Form submission handler
  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile(data as UserProfileData);
      showInfo('Success', 'Profile updated successfully!');
      navigate({ to: ROUTES.DASHBOARD });
    } catch {
      showLoadError('profile update');
    }
  };

  // Dropdown options
  const genderOptions = [
    { label: 'Select Gender', value: '' },
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
  ];

  const themeOptions = [
    { label: 'Auto', value: 'auto' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ];

  const languageOptions = [
    { label: 'English', value: 'English' },
    { label: 'Spanish', value: 'Spanish' },
    { label: 'French', value: 'French' },
    { label: 'German', value: 'German' },
  ];

  // Loading state
  if (!profile) {
    return (
      <div
        className='flex align-items-center justify-content-center'
        style={{ minHeight: '400px' }}
      >
        <div className='text-center'>
          <i
            className='pi pi-spin pi-spinner text-4xl mb-3'
            style={{ color: theme.primary }}
          ></i>
          <p style={{ color: theme.textSecondary }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Clean Header */}
      <div className='flex align-items-center justify-content-between mb-4'>
        <div>
          <h1
            className='text-2xl font-bold m-0'
            style={{ color: theme.textPrimary }}
          >
            Profile Settings
          </h1>
          <p
            className='text-sm mt-1 mb-0'
            style={{ color: theme.textSecondary }}
          >
            Manage your personal information and preferences
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            icon='pi pi-refresh'
            className='p-button-text p-button-rounded'
            onClick={handleRefresh}
            loading={refreshing}
            tooltip='Refresh Profile'
          />
          <Button
            label='Cancel'
            icon='pi pi-times'
            className='p-button-outlined'
            onClick={handleCancel}
            disabled={isSubmitting}
          />
          <Button
            label='Save Changes'
            icon='pi pi-check'
            onClick={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={!isDirty}
          />
        </div>
      </div>

      <div className='grid'>
        {/* Profile Header Card */}
        <div className='col-12'>
          <Card className='shadow-3 border-round-xl mb-4'>
            <div className='flex align-items-center gap-4 p-2'>
              <Avatar
                image={profile.avatar || undefined}
                label={
                  profile.generalInfo?.firstName?.charAt(0) ||
                  profile.email?.charAt(0) ||
                  '?'
                }
                size='xlarge'
                shape='circle'
                style={{
                  width: '80px',
                  height: '80px',
                  fontSize: '2rem',
                  backgroundColor: theme.primary,
                  color: 'white',
                }}
              />
              <div className='flex-1'>
                <h3
                  className='text-xl font-semibold m-0'
                  style={{ color: theme.textPrimary }}
                >
                  {profile.generalInfo?.firstName &&
                  profile.generalInfo?.lastName
                    ? `${profile.generalInfo.firstName} ${profile.generalInfo.lastName}`
                    : profile.name || 'User'}
                </h3>
                <p
                  className='text-base mt-1 mb-0'
                  style={{ color: theme.textSecondary }}
                >
                  {profile.email}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Basic Information */}
        <div className='col-12 md:col-6'>
          <Card className='shadow-3 border-round-xl h-full'>
            <div className='p-4'>
              <h3
                className='text-lg font-semibold mb-4'
                style={{ color: theme.textPrimary }}
              >
                <i className='pi pi-user mr-2'></i>
                Basic Information
              </h3>

              <div className='field mb-4'>
                <CustomInputText
                  name='name'
                  label='Display Name'
                  control={control}
                  placeholder='Enter your display name'
                />
              </div>

              <div className='field mb-4'>
                <CustomInputText
                  name='email'
                  label='Email Address'
                  control={control}
                  placeholder='Enter your email address'
                  type='email'
                />
              </div>

              <div className='grid'>
                <div className='col-12 sm:col-6'>
                  <div className='field'>
                    <CustomInputText
                      name='generalInfo.firstName'
                      label='First Name'
                      control={control}
                      placeholder='Enter first name'
                    />
                  </div>
                </div>
                <div className='col-12 sm:col-6'>
                  <div className='field'>
                    <CustomInputText
                      name='generalInfo.lastName'
                      label='Last Name'
                      control={control}
                      placeholder='Enter last name'
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Contact Information */}
        <div className='col-12 md:col-6'>
          <Card className='shadow-3 border-round-xl h-full'>
            <div className='p-4'>
              <h3
                className='text-lg font-semibold mb-4'
                style={{ color: theme.textPrimary }}
              >
                <i className='pi pi-phone mr-2'></i>
                Contact Information
              </h3>

              <div className='field mb-4'>
                <CustomInputText
                  name='generalInfo.phone'
                  label='Phone Number'
                  control={control}
                  placeholder='Enter your phone number'
                  required={false}
                />
              </div>

              <div className='field mb-4'>
                <CustomInputText
                  name='generalInfo.address'
                  label='Address'
                  control={control}
                  placeholder='Enter your address'
                  required={false}
                />
              </div>

              <div className='grid'>
                <div className='col-12 sm:col-6'>
                  <div className='field'>
                    <CustomInputText
                      name='generalInfo.dateOfBirth'
                      label='Date of Birth'
                      control={control}
                      placeholder='YYYY-MM-DD'
                      required={false}
                    />
                  </div>
                </div>
                <div className='col-12 sm:col-6'>
                  <div className='field'>
                    <CustomDropdown
                      name='generalInfo.gender'
                      label='Gender'
                      control={control}
                      options={genderOptions}
                      required={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Preferences */}
        <div className='col-12'>
          <Card className='shadow-3 border-round-xl'>
            <div className='p-4'>
              <h3
                className='text-lg font-semibold mb-4'
                style={{ color: theme.textPrimary }}
              >
                <i className='pi pi-cog mr-2'></i>
                Preferences
              </h3>

              <div className='grid'>
                <div className='col-12 md:col-4'>
                  <div className='field'>
                    <CustomDropdown
                      name='preferences.theme'
                      label='Theme Preference'
                      control={control}
                      options={themeOptions}
                      required={false}
                    />
                  </div>
                </div>
                <div className='col-12 md:col-4'>
                  <div className='field'>
                    <CustomDropdown
                      name='preferences.language'
                      label='Language'
                      control={control}
                      options={languageOptions}
                      required={false}
                    />
                  </div>
                </div>
                <div className='col-12 md:col-4'>
                  <div
                    className='field flex align-items-center'
                    style={{ marginTop: '1.5rem' }}
                  >
                    <CustomCheckbox
                      name='preferences.notifications'
                      label='Enable email notifications'
                      control={control}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
