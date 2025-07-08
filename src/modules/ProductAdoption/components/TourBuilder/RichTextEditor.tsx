import { InputTextarea } from 'primereact/inputtextarea';
import React, { useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  toolbar?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter text...',
  height = '200px',
  toolbar = true,
}) => {
  const [isPreview, setIsPreview] = useState(false);

  const handleInsertText = (textToInsert: string) => {
    const textarea = document.querySelector(
      '.rich-text-editor textarea'
    ) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue =
        value.substring(0, start) + textToInsert + value.substring(end);
      onChange(newValue);

      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + textToInsert.length,
          start + textToInsert.length
        );
      }, 0);
    }
  };

  const variableOptions = [
    { label: 'User Name', value: 'user.name' },
    { label: 'User Email', value: 'user.email' },
    { label: 'Company Name', value: 'company.name' },
    { label: 'Current Date', value: 'date.current' },
    { label: 'Step Number', value: 'step.number' },
    { label: 'Total Steps', value: 'step.total' },
  ];

  const insertVariable = (variableValue: string) => {
    const variableText = `{{${variableValue}}}`;
    handleInsertText(variableText);
  };

  const renderEditor = () => {
    if (isPreview) {
      // Simple preview mode - just show the text with basic formatting
      return (
        <div
          className='preview-content'
          style={{
            minHeight: height,
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: '#f9f9f9',
          }}
        >
          <div
            dangerouslySetInnerHTML={{ __html: value.replace(/\n/g, '<br>') }}
          />
        </div>
      );
    }

    return (
      <InputTextarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={8}
        style={{ minHeight: height }}
        className='w-full'
      />
    );
  };

  return (
    <div className='rich-text-editor'>
      {toolbar && (
        <div className='editor-toolbar mb-2'>
          <div className='flex align-items-center gap-2 mb-2'>
            <button
              type='button'
              className={`p-button p-button-sm ${!isPreview ? 'p-button-outlined' : ''}`}
              onClick={() => setIsPreview(false)}
            >
              Edit
            </button>
            <button
              type='button'
              className={`p-button p-button-sm ${isPreview ? 'p-button-outlined' : ''}`}
              onClick={() => setIsPreview(true)}
            >
              Preview
            </button>
          </div>

          {!isPreview && (
            <div className='flex flex-wrap gap-2'>
              <label className='text-sm font-medium'>Insert Variables:</label>
              {variableOptions.map((option) => (
                <button
                  key={option.value}
                  type='button'
                  className='p-button p-button-text p-button-sm'
                  onClick={() => insertVariable(option.value)}
                  title={`Insert ${option.label}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {renderEditor()}

      <div className='editor-footer mt-2'>
        <small className='text-muted'>
          Use variables like {'{'}
          {'{'}'user.name{'}'}
          {'}}'} to personalize content
        </small>
      </div>
    </div>
  );
};
