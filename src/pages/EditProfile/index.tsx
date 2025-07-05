import { RefreshButton } from '@/components/common';
import {
  CustomCalendar,
  CustomCheckbox,
  CustomDropdown,
  CustomInputText,
} from '@/components/FormComponents';
import KeyboardShortcutsModal from '@/components/KeyboardShortcutsModal';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useTheme } from '@/hooks/useTheme';
import { BUTTON_LABELS, PAGE_TITLES } from '@/utils/constants/generic/labels';
import { CSS_CLASSES } from '@/utils/constants/generic/styles';
import { ROUTES } from '@/utils/constants/routingConstants';
import { copyToClipboardWithToast } from '@/utils/helpers/capacitorApis';
import {
  UserProfileData,
  useUserProfileZState,
} from '@/zustandStates/userState';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Zod validation schema
const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  generalInfo: z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.string().min(1, 'Gender is required'),
    phone: z.string().min(10, 'Phone number must be at least 10 characters'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
  }),
  workInfo: z.object({
    position: z.string().min(2, 'Position must be at least 2 characters'),
    department: z.string().min(2, 'Department must be at least 2 characters'),
    employeeId: z.string().min(3, 'Employee ID must be at least 3 characters'),
    startDate: z.string().min(1, 'Start date is required'),
    salary: z.string().min(1, 'Salary is required'),
    manager: z.string().min(2, 'Manager name must be at least 2 characters'),
  }),
  birthInfo: z.object({
    placeOfBirth: z
      .string()
      .min(2, 'Place of birth must be at least 2 characters'),
    nationality: z.string().min(2, 'Nationality must be at least 2 characters'),
    timezone: z.string().min(1, 'Timezone is required'),
  }),
  preferences: z.object({
    theme: z.string().min(1, 'Theme is required'),
    language: z.string().min(1, 'Language is required'),
    notifications: z.boolean(),
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { profile, updateProfile, loadProfileFromStorage } =
    useUserProfileZState();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load profile from storage on component mount
  useEffect(() => {
    loadProfileFromStorage();
  }, [loadProfileFromStorage]);

  // Define sections for keyboard shortcuts
  const sections = [
    { name: 'Basic Information', icon: 'pi pi-user', color: 'primary' },
    { name: 'General Information', icon: 'pi pi-info-circle', color: 'blue' },
    { name: 'Work Information', icon: 'pi pi-briefcase', color: 'green' },
    {
      name: 'Birth & Location Information',
      icon: 'pi pi-map-marker',
      color: 'orange',
    },
    { name: 'Preferences', icon: 'pi pi-cog', color: 'purple' },
  ];

  // Form setup with react-hook-form and zod
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty, isSaving },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile || undefined,
  });

  // Update form when profile state changes
  useEffect(() => {
    if (profile) {
      reset(profile);
    }
  }, [profile, reset]);

  const handleCancel = () => {
    if (profile) {
      reset(profile);
    }
    navigate({ to: ROUTES.DASHBOARD });
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadProfileFromStorage();
      await copyToClipboardWithToast({
        value: 'Profile data refreshed!',
        successMessage: 'Profile data refreshed successfully!',
        errorMessage: 'Profile refreshed but failed to copy message',
      });
    } catch {
      await copyToClipboardWithToast({
        value: 'Error refreshing profile',
        successMessage: 'Error refreshing profile',
        errorMessage: 'Error refreshing profile',
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Handle section navigation
  const handleSectionChange = (sectionIndex: number) => {
    if (sectionIndex < sections.length) {
      const sectionIds = [
        'basic-info',
        'general-info',
        'work-info',
        'birth-info',
        'preferences',
      ];
      const targetSection = document.getElementById(sectionIds[sectionIndex]);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Keyboard shortcuts setup
  useKeyboardShortcuts({
    onSubmit: () => handleSubmit(onSubmit)(),
    onReset: () => reset(),
    onCancel: handleCancel,
    onShowHelp: () => setShowHelpModal(true),
    onSectionChange: handleSectionChange,
    sections: sections.map((s) => s.name),
  });

  // Dropdown options
  const genderOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
  ];

  const themeOptions = [
    { label: 'Light', value: 'Light' },
    { label: 'Dark', value: 'Dark' },
    { label: 'Auto', value: 'Auto' },
  ];

  const languageOptions = [
    { label: 'English', value: 'English' },
    { label: 'Spanish', value: 'Spanish' },
    { label: 'French', value: 'French' },
    { label: 'German', value: 'German' },
  ];

  const timezoneOptions = [
    { label: 'EST (UTC-5)', value: 'EST (UTC-5)' },
    { label: 'PST (UTC-8)', value: 'PST (UTC-8)' },
    { label: 'GMT (UTC+0)', value: 'GMT (UTC+0)' },
    { label: 'CET (UTC+1)', value: 'CET (UTC+1)' },
  ];

  // Form submission handler
  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Update the zustand state (this will also persist to storage)
      await updateProfile(data as UserProfileData);

      // Show success message
      await copyToClipboardWithToast({
        value: 'Profile updated successfully!',
        successMessage: 'Profile updated successfully!',
        errorMessage: 'Profile updated but failed to copy message',
      });

      // Navigate back to dashboard
      navigate({ to: ROUTES.DASHBOARD });
    } catch {
      await copyToClipboardWithToast({
        value: 'Error updating profile',
        successMessage: 'Error updating profile',
        errorMessage: 'Error updating profile',
      });
    }
  };

  // Loading state
  if (!profile) {
    return (
      <div
        className='flex align-items-center justify-content-center min-h-screen'
        style={{ background: theme.background }}
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
    <div
      className='min-h-screen p-2 sm:p-3 lg:p-4'
      style={{ background: theme.background }}
    >
      <div className='max-w-full lg:max-w-6xl mx-auto'>
        {/* Header */}
        <div
          className={
            CSS_CLASSES.FLEX.FLEX_COLUMN +
            ' sm:flex-row align-items-start sm:align-items-center justify-content-between mb-3 sm:mb-4 gap-3'
          }
        >
          <div>
            <div className={CSS_CLASSES.TYPOGRAPHY.TEXT_CENTER}>
              <div className={CSS_CLASSES.SPACING.MB_4}>
                <Avatar
                  image={profile.photoURL || undefined}
                  label={
                    profile.generalInfo.firstName?.charAt(0) ||
                    profile.email?.charAt(0) ||
                    '?'
                  }
                  size='xlarge'
                  shape='circle'
                  style={{
                    width: '120px',
                    height: '120px',
                    fontSize: '2rem',
                    backgroundColor: theme.primary,
                    color: 'white',
                  }}
                />
              </div>
              <h1 style={{ color: theme.textPrimary }}>
                {PAGE_TITLES.EDIT_PROFILE}
              </h1>
              <p style={{ color: theme.textSecondary }}>
                Update your profile information
              </p>
            </div>
          </div>
          <div className={CSS_CLASSES.FLEX.FLEX_WRAP + ' gap-2'}>
            <RefreshButton
              onRefresh={handleRefresh}
              loading={refreshing}
              tooltip='Refresh Profile Data'
              size='small'
            />
            <Button
              icon='pi pi-keyboard'
              className='p-button-text p-button-rounded p-button-sm'
              onClick={() => setShowHelpModal(true)}
              tooltip='Keyboard Shortcuts (F1)'
              tooltipOptions={{ position: 'bottom' }}
            />
            <Button
              icon='pi pi-arrow-left'
              label='Back'
              className='p-button-outlined p-button-sm'
              onClick={handleCancel}
            />
          </div>
        </div>

        {/* Keyboard Shortcuts Promotion Banner */}
        <div
          className='mb-3 sm:mb-4 p-3 sm:p-4 border-round border-1'
          style={{ background: theme.primaryLight, borderColor: theme.primary }}
        >
          <div className='flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between gap-3'>
            <div className='flex align-items-center gap-2 sm:gap-3'>
              <div
                className='p-2 border-round'
                style={{ background: theme.surface }}
              >
                <i
                  className='pi pi-keyboard text-lg sm:text-xl'
                  style={{ color: theme.primary }}
                ></i>
              </div>
              <div>
                <h3
                  className='text-base sm:text-lg font-bold m-0'
                  style={{ color: theme.textPrimary }}
                >
                  ⚡ Supercharge Your Editing!
                </h3>
                <p
                  className='text-xs sm:text-sm m-0 mt-1'
                  style={{ color: theme.textSecondary }}
                >
                  Use powerful keyboard shortcuts to edit faster than ever
                </p>
              </div>
            </div>
            <div className='flex flex-column sm:flex-row align-items-start sm:align-items-center gap-2 sm:gap-3'>
              <div className='flex flex-column sm:text-right gap-1'>
                <div className='flex align-items-center gap-1 sm:gap-2'>
                  <kbd
                    className='px-1 sm:px-2 py-1 border-round text-xs font-mono'
                    style={{
                      background: theme.success + '20',
                      color: theme.success,
                    }}
                  >
                    F2
                  </kbd>
                  <span
                    className='text-xs'
                    style={{ color: theme.textSecondary }}
                  >
                    Save
                  </span>
                </div>
                <div className='flex align-items-center gap-1 sm:gap-2'>
                  <kbd
                    className='px-1 sm:px-2 py-1 border-round text-xs font-mono'
                    style={{ background: theme.info + '20', color: theme.info }}
                  >
                    Ctrl+1-5
                  </kbd>
                  <span
                    className='text-xs'
                    style={{ color: theme.textSecondary }}
                  >
                    Jump to sections
                  </span>
                </div>
              </div>
              <Button
                label='View All'
                icon='pi pi-external-link'
                className='p-button-sm p-button-outlined p-button-info'
                onClick={() => setShowHelpModal(true)}
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Basic Information */}
          <Card
            id='basic-info'
            title={
              <div className='flex align-items-center justify-content-between'>
                <span>Basic Information</span>
                <div className='flex gap-2'>
                  <Badge
                    value='Ctrl+1'
                    severity='secondary'
                    className='p-badge-sm'
                  />
                </div>
              </div>
            }
            className='mb-4'
          >
            <div className='grid'>
              <CustomInputText
                name='name'
                control={control}
                label='Full Name'
                placeholder='Enter your full name'
                className='col-12 md:col-6'
              />

              <CustomInputText
                name='email'
                control={control}
                label='Email Address'
                placeholder='Enter your email'
                type='email'
                className='col-12 md:col-6'
              />
            </div>
          </Card>

          {/* General Information */}
          <Card
            id='general-info'
            title={
              <div className='flex align-items-center justify-content-between'>
                <span>General Information</span>
                <div className='flex gap-2'>
                  <Badge
                    value='Ctrl+2'
                    severity='secondary'
                    className='p-badge-sm'
                  />
                </div>
              </div>
            }
            className='mb-4'
          >
            <div className='grid'>
              <CustomInputText
                name='generalInfo.firstName'
                control={control}
                label='First Name'
                placeholder='Enter your first name'
              />

              <CustomInputText
                name='generalInfo.lastName'
                control={control}
                label='Last Name'
                placeholder='Enter your last name'
              />

              <CustomCalendar
                name='generalInfo.dateOfBirth'
                control={control}
                label='Date of Birth'
                placeholder='Select your birth date'
              />

              <CustomDropdown
                name='generalInfo.gender'
                control={control}
                label='Gender'
                options={genderOptions}
                placeholder='Select your gender'
              />

              <CustomInputText
                name='generalInfo.phone'
                control={control}
                label='Phone Number'
                placeholder='Enter your phone number'
                type='tel'
              />

              <CustomInputText
                name='generalInfo.address'
                control={control}
                label='Address'
                placeholder='Enter your address'
                className='col-12'
              />
            </div>
          </Card>

          {/* Work Information */}
          <Card
            id='work-info'
            title={
              <div className='flex align-items-center justify-content-between'>
                <span>Work Information</span>
                <div className='flex gap-2'>
                  <Badge
                    value='Ctrl+3'
                    severity='secondary'
                    className='p-badge-sm'
                  />
                </div>
              </div>
            }
            className='mb-4'
          >
            <div className='grid'>
              <CustomInputText
                name='workInfo.position'
                control={control}
                label='Position'
                placeholder='Enter your position'
              />

              <CustomInputText
                name='workInfo.department'
                control={control}
                label='Department'
                placeholder='Enter your department'
              />

              <CustomInputText
                name='workInfo.employeeId'
                control={control}
                label='Employee ID'
                placeholder='Enter your employee ID'
              />

              <CustomCalendar
                name='workInfo.startDate'
                control={control}
                label='Start Date'
                placeholder='Select your start date'
              />

              <CustomInputText
                name='workInfo.salary'
                control={control}
                label='Salary'
                placeholder='Enter your salary'
              />

              <CustomInputText
                name='workInfo.manager'
                control={control}
                label='Manager'
                placeholder="Enter your manager's name"
              />
            </div>
          </Card>

          {/* Birth & Location Information */}
          <Card
            id='birth-info'
            title={
              <div className='flex align-items-center justify-content-between'>
                <span>Birth & Location Information</span>
                <div className='flex gap-2'>
                  <Badge
                    value='Ctrl+4'
                    severity='secondary'
                    className='p-badge-sm'
                  />
                </div>
              </div>
            }
            className='mb-4'
          >
            <div className='grid'>
              <CustomInputText
                name='birthInfo.placeOfBirth'
                control={control}
                label='Place of Birth'
                placeholder='Enter your place of birth'
              />

              <CustomInputText
                name='birthInfo.nationality'
                control={control}
                label='Nationality'
                placeholder='Enter your nationality'
              />

              <CustomDropdown
                name='birthInfo.timezone'
                control={control}
                label='Timezone'
                options={timezoneOptions}
                placeholder='Select your timezone'
              />
            </div>
          </Card>

          {/* Preferences */}
          <Card
            id='preferences'
            title={
              <div className='flex align-items-center justify-content-between'>
                <span>Preferences</span>
                <div className='flex gap-2'>
                  <Badge
                    value='Ctrl+5'
                    severity='secondary'
                    className='p-badge-sm'
                  />
                </div>
              </div>
            }
            className='mb-4'
          >
            <div className='grid'>
              <CustomDropdown
                name='preferences.theme'
                control={control}
                label='Theme'
                options={themeOptions}
                placeholder='Select your theme preference'
              />

              <CustomDropdown
                name='preferences.language'
                control={control}
                label='Language'
                options={languageOptions}
                placeholder='Select your language'
              />

              <CustomCheckbox
                name='preferences.notifications'
                control={control}
                label='Enable Notifications'
              />
            </div>
          </Card>

          <Divider />

          {/* Form Actions */}
          <div
            className={
              CSS_CLASSES.FLEX.FLEX_COLUMN +
              ' sm:flex-row justify-content-between align-items-start sm:align-items-center mt-4 gap-3'
            }
          >
            <div
              className={
                CSS_CLASSES.FLEX.FLEX_WRAP + ' align-items-center gap-2'
              }
            >
              <i className='pi pi-info-circle text-blue-500'></i>
              <span className={CSS_CLASSES.TYPOGRAPHY.TEXT_COLOR_SECONDARY}>
                Use keyboard shortcuts for faster editing
              </span>
              <Badge
                value='F2 to save'
                severity='secondary'
                className='p-badge-sm'
              />
              <Badge
                value='F1 for help'
                severity='info'
                className='p-badge-sm'
              />
            </div>
            <div
              className={
                CSS_CLASSES.FLEX.FLEX_WRAP +
                ' gap-2 sm:gap-3 w-full sm:w-auto justify-content-end'
              }
            >
              <Button
                type='button'
                label={BUTTON_LABELS.CANCEL}
                icon='pi pi-times'
                className={CSS_CLASSES.BUTTON.OUTLINED + ' p-button-sm'}
                onClick={handleCancel}
                tooltip='Ctrl+Z'
              />
              <Button
                type='button'
                label='Reset'
                icon='pi pi-refresh'
                className={
                  CSS_CLASSES.BUTTON.OUTLINED + ' p-button-warning p-button-sm'
                }
                onClick={() => reset()}
                tooltip='Ctrl+R'
                tooltipOptions={{
                  position: 'top',
                  event: 'hover focus',
                }}
                disabled={!isDirty || isSaving}
              />
              <Button
                type='submit'
                label={isSubmitting ? 'Saving...' : 'Save Changes'}
                icon='pi pi-check'
                loading={isSubmitting}
                disabled={isSubmitting}
                tooltip='F2 or Ctrl+S'
                className='p-button-sm'
              />
            </div>
          </div>
        </form>

        {/* Floating Keyboard Help Indicator */}
        <div
          className='fixed bottom-4 left-4 z-4 cursor-pointer'
          onClick={() => setShowHelpModal(true)}
          style={{ animation: 'bounce 2s infinite' }}
        >
          <div className='bg-purple-500 text-white p-2 sm:p-3 border-round-lg shadow-4 flex align-items-center gap-2 hover:bg-purple-600 transition-colors'>
            <i className='pi pi-question-circle text-sm sm:text-lg'></i>
            <div className='hidden sm:block'>
              <div className='font-semibold text-xs sm:text-sm'>Need Help?</div>
              <div className='text-xs opacity-90'>
                Press{' '}
                <kbd className='bg-white text-purple-600 px-1 py-0 border-round text-xs'>
                  F1
                </kbd>{' '}
                or{' '}
                <kbd className='bg-white text-purple-600 px-1 py-0 border-round text-xs'>
                  Ctrl+H
                </kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Custom CSS for animations and styling */}
        <style>{`
          @keyframes bounce {
            0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
            40%, 43% { transform: translateY(-10px); }
            70% { transform: translateY(-5px); }
            90% { transform: translateY(-2px); }
          }
          
          kbd {
            font-family: 'Courier New', monospace;
            font-size: 0.7rem;
            font-weight: 600;
            padding: 0.15rem 0.4rem;
            border-radius: 0.25rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(0, 0, 0, 0.1);
          }
        `}</style>
      </div>

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsModal
        visible={showHelpModal}
        onHide={() => setShowHelpModal(false)}
        sections={sections}
      />
    </div>
  );
};

export default EditProfile;
