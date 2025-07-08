import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { MultiSelect } from 'primereact/multiselect';
import { Rating } from 'primereact/rating';
import { Slider } from 'primereact/slider';
import { classNames } from 'primereact/utils';
import React from 'react';

interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface TextFieldProps extends FormFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url';
}

interface TextAreaFieldProps extends FormFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
}

interface SelectFieldProps extends FormFieldProps {
  value?: string | number | string[] | number[];
  onChange?: (value: string | number | string[] | number[]) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  filter?: boolean;
}

interface DateFieldProps extends FormFieldProps {
  value?: Date | Date[];
  onChange?: (value: Date | Date[]) => void;
  placeholder?: string;
  disabled?: boolean;
  selectionMode?: 'single' | 'multiple' | 'range';
  showTime?: boolean;
  timeOnly?: boolean;
}

interface SwitchFieldProps extends FormFieldProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

interface SliderFieldProps extends FormFieldProps {
  value?: number | number[];
  onChange?: (value: number | number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  range?: boolean;
}

interface RatingFieldProps extends FormFieldProps {
  value?: number;
  onChange?: (value: number) => void;
  stars?: number;
  disabled?: boolean;
  cancel?: boolean;
}

interface FileUploadFieldProps extends FormFieldProps {
  onSelect?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFileSize?: number;
  disabled?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required,
  className,
  children,
}) => {
  const fieldClassName = React.useMemo(() => {
    return classNames(
      'field',
      {
        'field-error': !!error,
      },
      className
    );
  }, [error, className]);

  return (
    <div className={fieldClassName}>
      {label && (
        <label className='field-label'>
          {label}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </label>
      )}
      <div className='field-input'>{children}</div>
      {error && (
        <small className='field-error-message text-red-500'>{error}</small>
      )}
    </div>
  );
};

export const TextField: React.FC<TextFieldProps> = ({
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled,
  ...fieldProps
}) => (
  <FormField {...fieldProps}>
    <InputText
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      className={classNames('w-full', {
        'p-invalid': !!fieldProps.error,
      })}
    />
  </FormField>
);

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  value,
  onChange,
  placeholder,
  disabled,
  rows = 3,
  ...fieldProps
}) => (
  <FormField {...fieldProps}>
    <InputTextarea
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      className={classNames('w-full', {
        'p-invalid': !!fieldProps.error,
      })}
    />
  </FormField>
);

export const SelectField: React.FC<SelectFieldProps> = ({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  multiple = false,
  filter = false,
  ...fieldProps
}) => {
  if (multiple) {
    return (
      <FormField {...fieldProps}>
        <MultiSelect
          value={value as string[] | number[]}
          onChange={(e) => onChange?.(e.value)}
          options={options}
          placeholder={placeholder}
          disabled={disabled}
          filter={filter}
          className={classNames('w-full', {
            'p-invalid': !!fieldProps.error,
          })}
        />
      </FormField>
    );
  }

  return (
    <FormField {...fieldProps}>
      <Dropdown
        value={value as string | number}
        onChange={(e) => onChange?.(e.value)}
        options={options}
        placeholder={placeholder}
        disabled={disabled}
        filter={filter}
        className={classNames('w-full', {
          'p-invalid': !!fieldProps.error,
        })}
      />
    </FormField>
  );
};

export const DateField: React.FC<DateFieldProps> = ({
  value,
  onChange,
  placeholder,
  disabled,
  selectionMode = 'single',
  showTime = false,
  timeOnly = false,
  ...fieldProps
}) => (
  <FormField {...fieldProps}>
    <Calendar
      value={value}
      onChange={(e) => onChange?.(e.value as Date | Date[])}
      placeholder={placeholder}
      disabled={disabled}
      selectionMode={selectionMode}
      showTime={showTime}
      timeOnly={timeOnly}
      className={classNames('w-full', {
        'p-invalid': !!fieldProps.error,
      })}
    />
  </FormField>
);

export const SwitchField: React.FC<SwitchFieldProps> = ({
  checked = false,
  onChange,
  disabled,
  ...fieldProps
}) => (
  <FormField {...fieldProps}>
    <InputSwitch
      checked={checked}
      onChange={(e) => onChange?.(e.value)}
      disabled={disabled}
    />
  </FormField>
);

export const SliderField: React.FC<SliderFieldProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  range = false,
  ...fieldProps
}) => (
  <FormField {...fieldProps}>
    <Slider
      value={range ? (value as [number, number]) : (value as number)}
      onChange={(e) => onChange?.(e.value)}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      range={range}
      className='w-full'
    />
  </FormField>
);

export const RatingField: React.FC<RatingFieldProps> = ({
  value,
  onChange,
  stars = 5,
  disabled,
  cancel = true,
  ...fieldProps
}) => (
  <FormField {...fieldProps}>
    <Rating
      value={value}
      onChange={(e) => onChange?.(e.value ?? 0)}
      stars={stars}
      disabled={disabled}
      cancel={cancel}
    />
  </FormField>
);

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
  onSelect,
  accept,
  multiple = false,
  maxFileSize = 1000000, // 1MB
  disabled,
  ...fieldProps
}) => (
  <FormField {...fieldProps}>
    <FileUpload
      mode='basic'
      accept={accept}
      multiple={multiple}
      maxFileSize={maxFileSize}
      disabled={disabled}
      customUpload
      onSelect={(e) => onSelect?.(e.files)}
      className='w-full'
    />
  </FormField>
);

// Aliases for backward compatibility
export const CustomInputText = TextField;
export const CustomCheckbox = SwitchField;
export const CustomDropdown = SelectField;
