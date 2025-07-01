import KeyboardShortcutsModal from '@/components/KeyboardShortcutsModal';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { consoleError } from '@/utils/helpers/consoleHelper';
import { useUserProfileZState } from '@/zustandStates/userState';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

// Validation schema
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),

  // General Info - using the actual structure
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  address: z.string().min(5, 'Address must be at least 5 characters'),

  // Work Info
  position: z.string().min(2, 'Position is required'),
  department: z.string().min(2, 'Department is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  startDate: z.string().min(1, 'Start date is required'),
  salary: z.string().min(1, 'Salary is required'),
  manager: z.string().min(2, 'Manager is required'),

  // Birth Info
  placeOfBirth: z.string().min(2, 'Place of birth is required'),
  nationality: z.string().min(2, 'Nationality is required'),
  timezone: z.string().min(1, 'Timezone is required'),

  // Preferences
  language: z.string().min(1, 'Language preference is required'),
  theme: z.string().min(1, 'Theme preference is required'),
  notifications: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const CompactEditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useUserProfileZState();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number[]>([0]);
  const accordionRef = useRef<Accordion>(null);
  const [saving, setSaving] = useState(false);

  // Define sections for keyboard shortcuts
  const sections = [
    { name: 'Basic Information', icon: 'pi pi-user', color: 'primary' },
    { name: 'General Information', icon: 'pi pi-info-circle', color: 'blue' },
    { name: 'Work Information', icon: 'pi pi-briefcase', color: 'green' },
    {
      name: 'Birth & Location Info',
      icon: 'pi pi-map-marker',
      color: 'orange',
    },
    { name: 'Preferences', icon: 'pi pi-cog', color: 'purple' },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      notifications: true,
    },
  });

  const watchNotifications = watch('notifications');

  // Initialize form with current profile data
  useEffect(() => {
    if (profile) {
      setValue('name', profile.name);
      setValue('email', profile.email);
      setValue('phone', profile.generalInfo.phone);
      setValue('firstName', profile.generalInfo.firstName);
      setValue('lastName', profile.generalInfo.lastName);
      setValue('dateOfBirth', profile.generalInfo.dateOfBirth);
      setValue('gender', profile.generalInfo.gender);
      setValue('address', profile.generalInfo.address);
      setValue('position', profile.workInfo.position);
      setValue('department', profile.workInfo.department);
      setValue('employeeId', profile.workInfo.employeeId);
      setValue('startDate', profile.workInfo.startDate);
      setValue('salary', profile.workInfo.salary);
      setValue('manager', profile.workInfo.manager);
      setValue('placeOfBirth', profile.birthInfo.placeOfBirth);
      setValue('nationality', profile.birthInfo.nationality);
      setValue('timezone', profile.birthInfo.timezone);
      setValue('language', profile.preferences.language);
      setValue('theme', profile.preferences.theme);
      setValue('notifications', profile.preferences.notifications);
    }
  }, [profile, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const updatedProfile = {
        name: data.name,
        email: data.email,
        avatar: profile?.avatar || null,
        generalInfo: {
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          phone: data.phone,
          address: data.address,
        },
        workInfo: {
          position: data.position,
          department: data.department,
          employeeId: data.employeeId,
          startDate: data.startDate,
          salary: data.salary,
          manager: data.manager,
        },
        birthInfo: {
          placeOfBirth: data.placeOfBirth,
          nationality: data.nationality,
          timezone: data.timezone,
        },
        preferences: {
          language: data.language,
          theme: data.theme,
          notifications: data.notifications,
        },
      };

      setSaving(true);
      await updateProfile(updatedProfile);
      toast.success('Profile updated successfully!');
      navigate({ to: '/chats' });
    } catch (error) {
      consoleError('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle section navigation
  const handleSectionChange = (sectionIndex: number) => {
    if (sectionIndex < sections.length) {
      // Open the specific accordion section
      setActiveIndex([sectionIndex]);

      // Scroll to the accordion section
      setTimeout(() => {
        const accordionElement = document.querySelector(
          `[data-pc-section="tab-${sectionIndex}"]`
        );
        if (accordionElement) {
          accordionElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 100);
    }
  };

  // Keyboard shortcuts setup
  useKeyboardShortcuts({
    onSubmit: () => handleSubmit(onSubmit)(),
    onReset: () => reset(),
    onCancel: () => navigate({ to: '/compact-dashboard' }),
    onShowHelp: () => setShowHelpModal(true),
    onSectionChange: handleSectionChange,
    sections: sections.map((s) => s.name),
  });

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ];

  const languageOptions = [
    { label: 'English', value: 'english' },
    { label: 'Spanish', value: 'spanish' },
    { label: 'French', value: 'french' },
    { label: 'German', value: 'german' },
  ];

  const timezoneOptions = [
    { label: 'UTC-08:00 (PST)', value: 'PST' },
    { label: 'UTC-05:00 (EST)', value: 'EST' },
    { label: 'UTC+00:00 (GMT)', value: 'GMT' },
    { label: 'UTC+01:00 (CET)', value: 'CET' },
  ];

  const themeOptions = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'Auto', value: 'auto' },
  ];

  // Compact form field component
  const CompactField = ({
    label,
    children,
    error,
  }: {
    label: string;
    children: React.ReactNode;
    error?: string;
  }) => (
    <div className='field'>
      <label className='block text-sm font-medium text-color mb-1'>
        {label}
      </label>
      {children}
      {error && <small className='p-error block mt-1'>{error}</small>}
    </div>
  );

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Compact Header */}
      <header className='bg-white shadow-1 sticky top-0 z-3'>
        <div className='flex align-items-center justify-content-between px-2 sm:px-4 py-2 sm:py-3'>
          <div className='flex align-items-center gap-2 sm:gap-3'>
            <Button
              icon='pi pi-arrow-left'
              className='p-button-text p-button-rounded p-button-sm'
              onClick={() => navigate({ to: '/dashboard' })}
              tooltip='Back to Dashboard'
            />
            <div className='flex align-items-center gap-2'>
              <Avatar
                label={
                  profile?.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('') || 'U'
                }
                className='bg-primary'
                shape='circle'
                size='normal'
              />
              <div>
                <h1 className='text-base sm:text-lg font-bold text-color m-0'>
                  Edit Profile
                </h1>
                <p className='text-xs text-color-secondary m-0'>Compact View</p>
              </div>
            </div>
          </div>
          <div className='flex flex-wrap gap-1 sm:gap-2'>
            <div className='hidden lg:flex align-items-center gap-1 sm:gap-2 px-1 sm:px-2 py-1 bg-purple-50 border-round'>
              <i className='pi pi-keyboard text-purple-600 text-xs sm:text-sm'></i>
              <span className='text-xs text-purple-700 font-medium'>
                <kbd className='bg-purple-100 text-purple-800 px-1 py-0 border-round text-xs'>
                  F1
                </kbd>{' '}
                or{' '}
                <kbd className='bg-purple-100 text-purple-800 px-1 py-0 border-round text-xs'>
                  Ctrl+H
                </kbd>{' '}
                for shortcuts
              </span>
            </div>
            <Button
              icon='pi pi-keyboard'
              className='p-button-text p-button-rounded p-button-sm'
              onClick={() => setShowHelpModal(true)}
              tooltip='Keyboard Shortcuts (F1)'
              tooltipOptions={{ position: 'bottom' }}
            />
            <Button
              label='Standard'
              icon='pi pi-expand'
              className='p-button-outlined p-button-sm'
              onClick={() => navigate({ to: '/edit-profile' })}
            />
            <Badge
              value='Compact'
              severity='info'
              className='p-badge-sm'
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className='p-2 sm:p-3 lg:p-4'>
        {/* Keyboard Shortcuts Quick Guide */}
        <div className='mb-3 sm:mb-4 p-2 sm:p-3 bg-gradient-to-r from-green-50 to-teal-50 border-round border-1 border-green-200'>
          <div className='flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between flex-wrap gap-2 sm:gap-3'>
            <div className='flex align-items-center gap-2 sm:gap-3'>
              <div className='bg-green-100 p-1 sm:p-2 border-round'>
                <i className='pi pi-flash text-green-600 text-sm sm:text-base'></i>
              </div>
              <div>
                <h4 className='text-xs sm:text-sm font-bold text-green-800 m-0'>
                  🚀 Quick Navigation
                </h4>
                <p className='text-xs text-green-600 m-0'>
                  Use keyboard shortcuts for lightning-fast editing
                </p>
              </div>
            </div>
            <div className='flex align-items-center gap-1 sm:gap-2 flex-wrap'>
              <div className='flex align-items-center gap-1'>
                <kbd className='bg-orange-100 text-orange-800 px-1 py-0 border-round text-xs'>
                  F2
                </kbd>
                <span className='text-xs text-green-600'>Save</span>
              </div>
              <div className='flex align-items-center gap-1'>
                <kbd className='bg-blue-100 text-blue-800 px-1 py-0 border-round text-xs'>
                  Ctrl+1-5
                </kbd>
                <span className='text-xs text-green-600'>Sections</span>
              </div>
              <div className='flex align-items-center gap-1'>
                <kbd className='bg-purple-100 text-purple-800 px-1 py-0 border-round text-xs'>
                  F1
                </kbd>
                <span className='text-xs text-green-600'>Help</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='max-w-6xl mx-auto'>
            {/* Accordion Layout for Compact Sections */}
            <Accordion
              ref={accordionRef}
              multiple
              activeIndex={activeIndex}
              onTabChange={(e) => setActiveIndex(e.index as number[])}
              className='mb-4'
            >
              {/* Basic Information */}
              <AccordionTab
                header={
                  <div className='flex align-items-center gap-2'>
                    <i className='pi pi-user text-primary'></i>
                    <span className='font-semibold'>Basic Information</span>
                    <Badge
                      value='3 fields'
                      severity='info'
                      className='p-badge-sm'
                    />
                    <Badge
                      value='Ctrl+1'
                      severity='secondary'
                      className='p-badge-sm ml-auto'
                    />
                  </div>
                }
              >
                <div className='grid'>
                  <div className='col-12 md:col-4'>
                    <CompactField
                      label='Full Name'
                      error={errors.name?.message}
                    >
                      <InputText
                        {...register('name')}
                        className={`w-full p-inputtext-sm ${errors.name ? 'p-invalid' : ''}`}
                        placeholder='Enter your full name'
                      />
                    </CompactField>
                  </div>

                  <div className='col-12 md:col-4'>
                    <CompactField
                      label='Email'
                      error={errors.email?.message}
                    >
                      <InputText
                        {...register('email')}
                        type='email'
                        className={`w-full p-inputtext-sm ${errors.email ? 'p-invalid' : ''}`}
                        placeholder='Enter your email'
                      />
                    </CompactField>
                  </div>

                  <div className='col-12 md:col-4'>
                    <CompactField
                      label='Phone'
                      error={errors.phone?.message}
                    >
                      <InputText
                        {...register('phone')}
                        className={`w-full p-inputtext-sm ${errors.phone ? 'p-invalid' : ''}`}
                        placeholder='Enter your phone number'
                      />
                    </CompactField>
                  </div>
                </div>
              </AccordionTab>

              {/* General Information */}
              <AccordionTab
                header={
                  <div className='flex align-items-center gap-2'>
                    <i className='pi pi-info-circle text-blue-500'></i>
                    <span className='font-semibold'>General Information</span>
                    <Badge
                      value='5 fields'
                      severity='info'
                      className='p-badge-sm'
                    />
                    <Badge
                      value='Ctrl+2'
                      severity='secondary'
                      className='p-badge-sm ml-auto'
                    />
                  </div>
                }
              >
                <div className='grid'>
                  <div className='col-12 sm:col-6 lg:col-3'>
                    <CompactField
                      label='First Name'
                      error={errors.firstName?.message}
                    >
                      <InputText
                        {...register('firstName')}
                        className={`w-full p-inputtext-sm ${errors.firstName ? 'p-invalid' : ''}`}
                        placeholder='First name'
                      />
                    </CompactField>
                  </div>

                  <div className='col-12 sm:col-6 lg:col-3'>
                    <CompactField
                      label='Last Name'
                      error={errors.lastName?.message}
                    >
                      <InputText
                        {...register('lastName')}
                        className={`w-full p-inputtext-sm ${errors.lastName ? 'p-invalid' : ''}`}
                        placeholder='Last name'
                      />
                    </CompactField>
                  </div>

                  <div className='col-12 sm:col-6 lg:col-3'>
                    <CompactField
                      label='Date of Birth'
                      error={errors.dateOfBirth?.message}
                    >
                      <Calendar
                        id='dateOfBirth'
                        className={`w-full ${errors.dateOfBirth ? 'p-invalid' : ''}`}
                        placeholder='Select date of birth'
                        dateFormat='mm/dd/yy'
                        showIcon
                        showButtonBar
                        onChange={(e) => {
                          const selectedDate = e.value;
                          if (selectedDate instanceof Date) {
                            setValue(
                              'dateOfBirth',
                              selectedDate.toLocaleDateString('en-US')
                            );
                          } else {
                            setValue('dateOfBirth', '');
                          }
                        }}
                        value={
                          watch('dateOfBirth')
                            ? new Date(watch('dateOfBirth'))
                            : null
                        }
                      />
                    </CompactField>
                  </div>

                  <div className='col-12 sm:col-6 lg:col-3'>
                    <CompactField
                      label='Gender'
                      error={errors.gender?.message}
                    >
                      <Dropdown
                        id='gender'
                        options={genderOptions}
                        className={`w-full ${errors.gender ? 'p-invalid' : ''}`}
                        placeholder='Select gender'
                        onChange={(e) => setValue('gender', e.value)}
                        value={watch('gender')}
                        filter
                        showClear
                      />
                    </CompactField>
                  </div>

                  <div className='col-12'>
                    <CompactField
                      label='Address'
                      error={errors.address?.message}
                    >
                      <InputText
                        {...register('address')}
                        className={`w-full p-inputtext-sm ${errors.address ? 'p-invalid' : ''}`}
                        placeholder='Enter your address'
                      />
                    </CompactField>
                  </div>
                </div>
              </AccordionTab>

              {/* Work Information */}
              <AccordionTab
                header={
                  <div className='flex align-items-center gap-2'>
                    <i className='pi pi-briefcase text-green-500'></i>
                    <span className='font-semibold'>Work Information</span>
                    <Badge
                      value='6 fields'
                      severity='info'
                      className='p-badge-sm'
                    />
                    <Badge
                      value='Ctrl+3'
                      severity='secondary'
                      className='p-badge-sm ml-auto'
                    />
                  </div>
                }
              >
                <div className='grid'>
                  <div className='col-12 md:col-6'>
                    <CompactField
                      label='Position'
                      error={errors.position?.message}
                    >
                      <InputText
                        {...register('position')}
                        className={`w-full p-inputtext-sm ${errors.position ? 'p-invalid' : ''}`}
                        placeholder='Job position'
                      />
                    </CompactField>
                  </div>

                  <div className='col-12 md:col-6'>
                    <CompactField
                      label='Department'
                      error={errors.department?.message}
                    >
                      <InputText
                        {...register('department')}
                        className={`w-full p-inputtext-sm ${errors.department ? 'p-invalid' : ''}`}
                        placeholder='Department'
                      />
                    </CompactField>
                  </div>

                  <div className='col-12 md:col-6'>
                    <CompactField
                      label='Employee ID'
                      error={errors.employeeId?.message}
                    >
                      <InputText
                        {...register('employeeId')}
                        className={`w-full p-inputtext-sm ${errors.employeeId ? 'p-invalid' : ''}`}
                        placeholder='Employee ID'
                      />
                    </CompactField>
                  </div>

                  <div className='col-12 md:col-6'>
                    <CompactField
                      label='Start Date'
                      error={errors.startDate?.message}
                    >
                      <Calendar
                        id='startDate'
                        className={`w-full ${errors.startDate ? 'p-invalid' : ''}`}
                        placeholder='Select start date'
                        dateFormat='mm/dd/yy'
                        showIcon
                        showButtonBar
                        onChange={(e) => {
                          const selectedDate = e.value;
                          if (selectedDate instanceof Date) {
                            setValue(
                              'startDate',
                              selectedDate.toLocaleDateString('en-US')
                            );
                          } else {
                            setValue('startDate', '');
                          }
                        }}
                        value={
                          watch('startDate')
                            ? new Date(watch('startDate'))
                            : null
                        }
                      />
                    </CompactField>
                  </div>

                  <div className='col-12 md:col-6'>
                    <CompactField
                      label='Salary'
                      error={errors.salary?.message}
                    >
                      <InputText
                        {...register('salary')}
                        className={`w-full p-inputtext-sm ${errors.salary ? 'p-invalid' : ''}`}
                        placeholder='Salary'
                      />
                    </CompactField>
                  </div>

                  <div className='col-12 md:col-6'>
                    <CompactField
                      label='Manager'
                      error={errors.manager?.message}
                    >
                      <InputText
                        {...register('manager')}
                        className={`w-full p-inputtext-sm ${errors.manager ? 'p-invalid' : ''}`}
                        placeholder='Manager name'
                      />
                    </CompactField>
                  </div>
                </div>
              </AccordionTab>

              {/* Birth & Location */}
              <AccordionTab
                header={
                  <div className='flex align-items-center gap-2'>
                    <i className='pi pi-map-marker text-orange-500'></i>
                    <span className='font-semibold'>Birth & Location Info</span>
                    <Badge
                      value='3 fields'
                      severity='info'
                      className='p-badge-sm'
                    />
                    <Badge
                      value='Ctrl+4'
                      severity='secondary'
                      className='p-badge-sm ml-auto'
                    />
                  </div>
                }
              >
                <div className='grid'>
                  <div className='col-12 md:col-4'>
                    <CompactField
                      label='Place of Birth'
                      error={errors.placeOfBirth?.message}
                    >
                      <InputText
                        {...register('placeOfBirth')}
                        className={`w-full p-inputtext-sm ${errors.placeOfBirth ? 'p-invalid' : ''}`}
                        placeholder='Place of birth'
                      />
                    </CompactField>
                  </div>

                  <div className='col-12 md:col-4'>
                    <CompactField
                      label='Nationality'
                      error={errors.nationality?.message}
                    >
                      <InputText
                        {...register('nationality')}
                        className={`w-full p-inputtext-sm ${errors.nationality ? 'p-invalid' : ''}`}
                        placeholder='Nationality'
                      />
                    </CompactField>
                  </div>

                  <div className='col-12 md:col-4'>
                    <CompactField
                      label='Timezone'
                      error={errors.timezone?.message}
                    >
                      <Dropdown
                        id='timezone'
                        options={timezoneOptions}
                        className={`w-full ${errors.timezone ? 'p-invalid' : ''}`}
                        placeholder='Select timezone'
                        onChange={(e) => setValue('timezone', e.value)}
                        value={watch('timezone')}
                        filter
                        showClear
                      />
                    </CompactField>
                  </div>
                </div>
              </AccordionTab>

              {/* Preferences */}
              <AccordionTab
                header={
                  <div className='flex align-items-center gap-2'>
                    <i className='pi pi-cog text-purple-500'></i>
                    <span className='font-semibold'>Preferences</span>
                    <Badge
                      value='3 fields'
                      severity='info'
                      className='p-badge-sm'
                    />
                    <Badge
                      value='Ctrl+5'
                      severity='secondary'
                      className='p-badge-sm ml-auto'
                    />
                  </div>
                }
              >
                <div className='grid'>
                  <div className='col-12 md:col-4'>
                    <CompactField
                      label='Language'
                      error={errors.language?.message}
                    >
                      <Dropdown
                        id='language'
                        options={languageOptions}
                        className={`w-full ${errors.language ? 'p-invalid' : ''}`}
                        placeholder='Select language'
                        onChange={(e) => setValue('language', e.value)}
                        value={watch('language')}
                        filter
                        showClear
                      />
                    </CompactField>
                  </div>

                  <div className='col-12 md:col-4'>
                    <CompactField
                      label='Theme'
                      error={errors.theme?.message}
                    >
                      <Dropdown
                        id='theme'
                        options={themeOptions}
                        className={`w-full ${errors.theme ? 'p-invalid' : ''}`}
                        placeholder='Select theme'
                        onChange={(e) => setValue('theme', e.value)}
                        value={watch('theme')}
                        filter
                        showClear
                      />
                    </CompactField>
                  </div>

                  <div className='col-12 md:col-4'>
                    <CompactField label='Notifications'>
                      <div className='flex align-items-center gap-2 mt-2'>
                        <Checkbox
                          inputId='notifications'
                          checked={watchNotifications}
                          onChange={(e) =>
                            setValue('notifications', e.checked || false)
                          }
                        />
                        <label
                          htmlFor='notifications'
                          className='text-sm cursor-pointer'
                        >
                          Enable notifications
                        </label>
                      </div>
                    </CompactField>
                  </div>
                </div>
              </AccordionTab>
            </Accordion>

            {/* Compact Action Buttons */}
            <Card className='shadow-2'>
              <div className='flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between gap-3'>
                <div className='flex flex-wrap align-items-center gap-2'>
                  <i className='pi pi-info-circle text-blue-500'></i>
                  <span className='text-xs sm:text-sm text-color-secondary'>
                    All changes will be saved automatically
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
                <div className='flex flex-wrap gap-2 w-full sm:w-auto justify-content-end'>
                  <Button
                    type='button'
                    label='Reset'
                    icon='pi pi-refresh'
                    className='p-button-text p-button-sm'
                    onClick={() => reset()}
                    tooltip='Ctrl+R'
                  />
                  <Button
                    type='button'
                    label='Cancel'
                    icon='pi pi-times'
                    className='p-button-outlined p-button-sm'
                    onClick={() => navigate({ to: '/compact-dashboard' })}
                    tooltip='Ctrl+Z'
                  />
                  <Button
                    type='submit'
                    label='Save Changes'
                    icon='pi pi-save'
                    className='p-button-sm'
                    loading={isSubmitting}
                    tooltip='F2 or Ctrl+S'
                  />
                </div>
              </div>
            </Card>
          </div>
        </form>

        {/* Floating Keyboard Shortcuts Indicator */}
        <div
          className='fixed bottom-4 right-4 z-4 cursor-pointer'
          onClick={() => setShowHelpModal(true)}
          style={{ animation: 'float 3s ease-in-out infinite' }}
        >
          <div className='bg-indigo-500 text-white p-2 border-round-lg shadow-4 flex align-items-center gap-2 hover:bg-indigo-600 transition-colors'>
            <i className='pi pi-keyboard text-xs sm:text-sm'></i>
            <span className='text-xs font-semibold hidden sm:inline'>
              <kbd className='bg-white text-indigo-600 px-1 py-0 border-round'>
                F1
              </kbd>
            </span>
          </div>
        </div>

        {/* Custom CSS for floating animation and kbd styling */}
        <style>{`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
            100% { transform: translateY(0px); }
          }
          
          kbd {
            font-family: 'Courier New', monospace;
            font-size: 0.65rem;
            font-weight: 700;
            padding: 0.1rem 0.3rem;
            border-radius: 0.2rem;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(0, 0, 0, 0.1);
            display: inline-block;
            line-height: 1;
          }
        `}</style>
      </div>

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsModal
        visible={showHelpModal}
        onHide={() => setShowHelpModal(false)}
        sections={sections}
        isCompactView={true}
      />
    </div>
  );
};

export default CompactEditProfile;
