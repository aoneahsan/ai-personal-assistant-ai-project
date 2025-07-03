import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import React from 'react';

interface KeyboardShortcutsModalProps {
  visible: boolean;
  onHide: () => void;
  sections?: { name: string; icon: string; color: string }[];
}

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  visible,
  onHide,
  sections = [],
}) => {
  // Key component for displaying keyboard keys
  const KeyBadge = ({
    children,
    variant = 'primary',
  }: {
    children: React.ReactNode;
    variant?: string;
  }) => (
    <Badge
      value={children as string}
      className={`p-badge-${variant} p-badge-lg mx-1`}
      style={{
        fontFamily: 'monospace',
        fontSize: '0.75rem',
        minWidth: '2rem',
        padding: '0.25rem 0.5rem',
      }}
    />
  );

  // Shortcut row component
  const ShortcutRow = ({
    keys,
    description,
    icon,
  }: {
    keys: React.ReactNode;
    description: string;
    icon: string;
  }) => (
    <div className='flex align-items-center justify-content-between p-3 border-round hover:surface-100 transition-colors'>
      <div className='flex align-items-center gap-3'>
        <i className={`${icon} text-primary text-lg`}></i>
        <span className='font-medium text-color'>{description}</span>
      </div>
      <div className='flex align-items-center gap-1'>{keys}</div>
    </div>
  );

  return (
    <Dialog
      header={
        <div className='flex align-items-center gap-2'>
          <i className='pi pi-keyboard text-primary'></i>
          <span>Keyboard Shortcuts</span>
        </div>
      }
      visible={visible}
      style={{ width: '50rem', maxWidth: '90vw' }}
      onHide={onHide}
      maximizable
      modal
      className='keyboard-shortcuts-modal'
    >
      <div className='p-4'>
        {/* Header description */}
        <div className='mb-4 p-3 bg-blue-50 border-round border-left-3 border-blue-500'>
          <div className='flex align-items-center gap-2 mb-2'>
            <i className='pi pi-info-circle text-blue-600'></i>
            <span className='font-semibold text-blue-800'>
              Boost Your Productivity
            </span>
          </div>
          <p className='text-blue-700 m-0 text-sm'>
            Use these keyboard shortcuts to navigate and edit your profile
            faster. Most shortcuts work even when typing in form fields.
          </p>
        </div>

        {/* Form Actions */}
        <div className='mb-4'>
          <h3 className='text-lg font-bold text-color mb-3 flex align-items-center gap-2'>
            <i className='pi pi-save text-green-500'></i>
            Form Actions
          </h3>

          <ShortcutRow
            keys={
              <>
                <KeyBadge variant='success'>F2</KeyBadge>
                <span className='text-color-secondary mx-1'>or</span>
                <KeyBadge variant='success'>Ctrl</KeyBadge>
                <span className='text-color-secondary'>+</span>
                <KeyBadge variant='success'>S</KeyBadge>
              </>
            }
            description='Save & Submit Form'
            icon='pi pi-check'
          />

          <ShortcutRow
            keys={
              <>
                <KeyBadge variant='warning'>Ctrl</KeyBadge>
                <span className='text-color-secondary'>+</span>
                <KeyBadge variant='warning'>R</KeyBadge>
              </>
            }
            description='Reset Form to Original Values'
            icon='pi pi-refresh'
          />

          <ShortcutRow
            keys={
              <>
                <KeyBadge variant='danger'>Ctrl</KeyBadge>
                <span className='text-color-secondary'>+</span>
                <KeyBadge variant='danger'>Z</KeyBadge>
              </>
            }
            description='Cancel & Go Back to Dashboard'
            icon='pi pi-times'
          />
        </div>

        <Divider />

        {/* Navigation */}
        <div className='mb-4'>
          <h3 className='text-lg font-bold text-color mb-3 flex align-items-center gap-2'>
            <i className='pi pi-compass text-blue-500'></i>
            Navigation
          </h3>

          <ShortcutRow
            keys={
              <>
                <KeyBadge>Tab</KeyBadge>
                <span className='text-color-secondary mx-1'>/</span>
                <KeyBadge>Shift</KeyBadge>
                <span className='text-color-secondary'>+</span>
                <KeyBadge>Tab</KeyBadge>
              </>
            }
            description='Navigate Between Form Fields'
            icon='pi pi-arrow-right'
          />

          <ShortcutRow
            keys={
              <>
                <KeyBadge>Enter</KeyBadge>
              </>
            }
            description='Activate Focused Button or Dropdown'
            icon='pi pi-play'
          />

          <ShortcutRow
            keys={
              <>
                <KeyBadge>Space</KeyBadge>
              </>
            }
            description='Toggle Checkboxes'
            icon='pi pi-check-square'
          />
        </div>

        <Divider />

        {/* Section Navigation */}
        {sections.length > 0 && (
          <>
            <div className='mb-4'>
              <h3 className='text-lg font-bold text-color mb-3 flex align-items-center gap-2'>
                <i className='pi pi-list text-purple-500'></i>
                Section Navigation
              </h3>

              {sections.map((section, index) => (
                <ShortcutRow
                  key={index}
                  keys={
                    <>
                      <KeyBadge>Ctrl</KeyBadge>
                      <span className='text-color-secondary'>+</span>
                      <KeyBadge>{index + 1}</KeyBadge>
                    </>
                  }
                  description={`Navigate to ${section.name}`}
                  icon={section.icon}
                />
              ))}

              <div className='mt-3 p-2 bg-gray-50 border-round'>
                <p className='text-sm text-color-secondary m-0'>
                  <i className='pi pi-lightbulb text-yellow-500 mr-2'></i>
                  These shortcuts will scroll to the corresponding form section.
                </p>
              </div>
            </div>

            <Divider />
          </>
        )}

        {/* Help & Information */}
        <div className='mb-4'>
          <h3 className='text-lg font-bold text-color mb-3 flex align-items-center gap-2'>
            <i className='pi pi-question-circle text-orange-500'></i>
            Help & Information
          </h3>

          <ShortcutRow
            keys={
              <>
                <KeyBadge variant='info'>F1</KeyBadge>
                <span className='text-color-secondary mx-1'>or</span>
                <KeyBadge variant='info'>Ctrl</KeyBadge>
                <span className='text-color-secondary'>+</span>
                <KeyBadge variant='info'>H</KeyBadge>
              </>
            }
            description='Show This Help Dialog'
            icon='pi pi-question'
          />

          <ShortcutRow
            keys={
              <>
                <KeyBadge>Esc</KeyBadge>
              </>
            }
            description='Close Dialogs and Modals'
            icon='pi pi-times-circle'
          />
        </div>

        {/* Tips */}
        <div className='mt-4 p-3 bg-green-50 border-round border-left-3 border-green-500'>
          <div className='flex align-items-center gap-2 mb-2'>
            <i className='pi pi-lightbulb text-green-600'></i>
            <span className='font-semibold text-green-800'>Pro Tips</span>
          </div>
          <ul className='text-green-700 text-sm m-0 pl-3'>
            <li className='mb-1'>
              Most shortcuts work even when typing in form fields
            </li>
            <li className='mb-1'>
              Use <strong>Tab</strong> to quickly navigate between fields
            </li>
            <li className='mb-1'>
              Press <strong>F2</strong> from anywhere to save your changes
            </li>
            <li>
              Use <strong>Ctrl+1-{sections.length}</strong> to jump between
              sections instantly
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className='flex justify-content-end mt-4'>
          <Button
            label='Got It!'
            icon='pi pi-check'
            onClick={onHide}
            className='p-button-success'
          />
        </div>
      </div>

      {/* Custom styles */}
      <style>{`
        .keyboard-shortcuts-modal .p-dialog-content {
          padding: 0;
        }
        .keyboard-shortcuts-modal .p-badge {
          text-align: center;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.375rem;
          font-weight: 600;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </Dialog>
  );
};

export default KeyboardShortcutsModal;
