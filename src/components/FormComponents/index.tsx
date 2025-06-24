import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import React from 'react';
import { Control, Controller, FieldError } from 'react-hook-form';

// Base form field wrapper
interface FormFieldWrapperProps {
  label: string;
  error?: FieldError;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({
  label,
  error,
  required = false,
  children,
  className = 'col-12 md:col-6',
}) => {
  return (
    <div className={className}>
      <div className='field'>
        <label className='font-medium text-color'>
          {label}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </label>
        {children}
        {error && <small className='p-error block mt-1'>{error.message}</small>}
      </div>
    </div>
  );
};

// Custom Input Text Field
interface CustomInputTextProps {
  name: string;
  control: Control<any>;
  label: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  type?: string;
}

export const CustomInputText: React.FC<CustomInputTextProps> = ({
  name,
  control,
  label,
  placeholder,
  required = true,
  className = 'col-12 md:col-6',
  type = 'text',
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormFieldWrapper
          label={label}
          error={fieldState.error}
          required={required}
          className={className}
        >
          <InputText
            {...field}
            type={type}
            placeholder={placeholder}
            className={classNames('w-full', { 'p-invalid': fieldState.error })}
          />
        </FormFieldWrapper>
      )}
    />
  );
};

// Custom Calendar Field
interface CustomCalendarProps {
  name: string;
  control: Control<any>;
  label: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const CustomCalendar: React.FC<CustomCalendarProps> = ({
  name,
  control,
  label,
  placeholder,
  required = true,
  className = 'col-12 md:col-6',
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        // Convert string to Date for display, handle edge cases
        const dateValue = React.useMemo(() => {
          if (!field.value) return null;
          if (field.value instanceof Date) return field.value;
          if (typeof field.value === 'string') {
            try {
              const date = new Date(field.value);
              return isNaN(date.getTime()) ? null : date;
            } catch {
              return null;
            }
          }
          return null;
        }, [field.value]);

        return (
          <FormFieldWrapper
            label={label}
            error={fieldState.error}
            required={required}
            className={className}
          >
            <Calendar
              id={name}
              value={dateValue}
              onChange={(e) => {
                const selectedDate = e.value;
                if (selectedDate instanceof Date) {
                  // Format as MM/DD/YYYY string to match expected format
                  const formattedDate =
                    selectedDate.toLocaleDateString('en-US');
                  field.onChange(formattedDate);
                } else {
                  field.onChange(null);
                }
              }}
              placeholder={placeholder}
              dateFormat='mm/dd/yy'
              className={classNames('w-full', {
                'p-invalid': fieldState.error,
              })}
              showIcon
              showButtonBar
            />
          </FormFieldWrapper>
        );
      }}
    />
  );
};

// Custom Dropdown Field
interface CustomDropdownProps {
  name: string;
  control: Control<any>;
  label: string;
  options: { label: string; value: string }[];
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  name,
  control,
  label,
  options,
  placeholder,
  required = true,
  className = 'col-12 md:col-6',
}) => {
  // Memoize options to prevent re-renders
  const memoizedOptions = React.useMemo(() => options, [options]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormFieldWrapper
          label={label}
          error={fieldState.error}
          required={required}
          className={className}
        >
          <Dropdown
            id={name}
            value={field.value}
            options={memoizedOptions}
            onChange={(e) => field.onChange(e.value)}
            placeholder={placeholder}
            className={classNames('w-full', { 'p-invalid': fieldState.error })}
            filter
            showClear
          />
        </FormFieldWrapper>
      )}
    />
  );
};

// Custom Checkbox Field
interface CustomCheckboxProps {
  name: string;
  control: Control<any>;
  label: string;
  className?: string;
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  name,
  control,
  label,
  className = 'col-12',
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormFieldWrapper
          label=''
          error={fieldState.error}
          className={className}
        >
          <div className='flex align-items-center gap-2'>
            <Checkbox
              {...field}
              checked={field.value}
              className={classNames({ 'p-invalid': fieldState.error })}
            />
            <label className='font-medium text-color cursor-pointer'>
              {label}
            </label>
          </div>
        </FormFieldWrapper>
      )}
    />
  );
};
