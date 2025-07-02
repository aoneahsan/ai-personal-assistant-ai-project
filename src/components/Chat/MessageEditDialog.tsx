import { FirestoreMessage } from '@/services/chatService';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';

interface MessageEditDialogProps {
  visible: boolean;
  message: FirestoreMessage | null;
  onHide: () => void;
  onSave: (newText: string, editReason?: string) => Promise<void>;
}

const MessageEditDialog: React.FC<MessageEditDialogProps> = ({
  visible,
  message,
  onHide,
  onSave,
}) => {
  const [editedText, setEditedText] = useState('');
  const [editReason, setEditReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const toastRef = useRef<Toast>(null);

  useEffect(() => {
    if (message && visible) {
      setEditedText(message.text || '');
      setEditReason('');
    }
  }, [message, visible]);

  const handleSave = async () => {
    if (!editedText.trim()) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Message cannot be empty',
        life: 3000,
      });
      return;
    }

    if (editedText.length > 1000) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Message cannot exceed 1000 characters',
        life: 3000,
      });
      return;
    }

    if (editedText.trim() === message?.text?.trim()) {
      toastRef.current?.show({
        severity: 'info',
        summary: 'No Changes',
        detail: 'No changes made to the message',
        life: 3000,
      });
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editedText.trim(), editReason.trim() || undefined);

      toastRef.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Message updated successfully',
        life: 3000,
      });

      // Reset form and close dialog
      setEditedText('');
      setEditReason('');
      onHide();
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update message',
        life: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedText(message?.text || '');
    setEditReason('');
    onHide();
  };

  const dialogHeader = (
    <div className='flex align-items-center gap-2'>
      <i className='pi pi-pencil text-primary'></i>
      <span>Edit Message</span>
    </div>
  );

  const dialogFooter = (
    <div className='flex justify-content-end gap-2'>
      <Button
        label='Cancel'
        icon='pi pi-times'
        onClick={handleCancel}
        className='p-button-text'
        disabled={isSaving}
      />
      <Button
        label='Save Changes'
        icon='pi pi-check'
        onClick={handleSave}
        loading={isSaving}
        className='p-button-primary'
      />
    </div>
  );

  return (
    <>
      <Dialog
        visible={visible}
        style={{ width: '500px' }}
        header={dialogHeader}
        footer={dialogFooter}
        onHide={handleCancel}
        draggable={false}
        resizable={false}
        modal
        blockScroll
      >
        <div className='flex flex-column gap-4'>
          {/* Original message info */}
          {message && (
            <div className='bg-gray-50 p-3 border-round border-left-3 border-primary'>
              <div className='flex align-items-center gap-2 mb-2'>
                <i className='pi pi-info-circle text-blue-500'></i>
                <small className='text-600'>Original Message</small>
              </div>
              <p className='text-800 m-0 line-height-3'>{message.text}</p>
              <small className='text-500'>
                Sent: {message.timestamp?.toDate?.()?.toLocaleString()}
                {message.isEdited && (
                  <span className='ml-2'>
                    • Last edited:{' '}
                    {message.lastEditedAt?.toDate?.()?.toLocaleString()}
                  </span>
                )}
              </small>
            </div>
          )}

          {/* Edit form */}
          <div className='flex flex-column gap-3'>
            <div className='field'>
              <label
                htmlFor='editedText'
                className='block text-900 font-medium mb-2'
              >
                Updated Message *
              </label>
              <InputTextarea
                id='editedText'
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                rows={4}
                cols={40}
                className='w-full'
                placeholder='Enter your updated message...'
                disabled={isSaving}
                autoFocus
              />
              <small className='text-500'>
                Characters: {editedText.length}/1000
              </small>
            </div>

            <div className='field'>
              <label
                htmlFor='editReason'
                className='block text-900 font-medium mb-2'
              >
                Edit Reason (Optional)
              </label>
              <InputText
                id='editReason'
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                className='w-full'
                placeholder='Brief reason for the edit...'
                disabled={isSaving}
                maxLength={100}
              />
              <small className='text-500'>
                Providing a reason helps other participants understand the
                change
              </small>
            </div>
          </div>

          {/* Edit guidelines */}
          <div className='bg-yellow-50 p-3 border-round border-left-3 border-yellow-500'>
            <div className='flex align-items-center gap-2 mb-2'>
              <i className='pi pi-exclamation-triangle text-yellow-600'></i>
              <small className='text-yellow-800 font-medium'>
                Edit Guidelines
              </small>
            </div>
            <ul className='text-yellow-700 text-sm line-height-3 pl-3 m-0'>
              <li>Messages can only be edited within 24 hours of sending</li>
              <li>All edit history is preserved and visible to participants</li>
              <li>Only text messages can be edited</li>
              <li>Deleted messages cannot be edited</li>
            </ul>
          </div>
        </div>
      </Dialog>
      <Toast ref={toastRef} />
    </>
  );
};

export default MessageEditDialog;
