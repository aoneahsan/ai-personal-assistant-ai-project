import { chatService } from '@/services/chatService';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import React from 'react';

interface LimitationsModalProps {
  visible: boolean;
  onHide: () => void;
}

const LimitationsModal: React.FC<LimitationsModalProps> = ({
  visible,
  onHide,
}) => {
  const limitations = chatService.getChatLimitations();

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header='Current Chat Limitations'
      modal
      style={{ width: '90vw', maxWidth: '600px' }}
      className='limitations-dialog'
    >
      <div className='p-4'>
        <div className='mb-4'>
          <p className='text-600 line-height-3'>
            We're continuously improving the chat system. Here are the current
            limitations and features that are in development:
          </p>
        </div>

        <div className='flex flex-column gap-4'>
          {limitations.map((limitation, index) => (
            <div
              key={index}
              className='border-1 border-300 border-round-lg p-4 bg-surface-50'
            >
              <div className='flex align-items-start gap-3'>
                <div
                  className='text-2xl'
                  style={{ minWidth: '2rem' }}
                >
                  {limitation.icon}
                </div>
                <div className='flex-1'>
                  <h4 className='text-900 font-semibold mb-2 mt-0'>
                    {limitation.title}
                  </h4>
                  <p className='text-600 line-height-3 m-0'>
                    {limitation.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='mt-5 p-3 bg-blue-50 border-round-lg border-1 border-blue-200'>
          <div className='flex align-items-center gap-2 mb-2'>
            <i className='pi pi-info-circle text-blue-600'></i>
            <span className='font-semibold text-blue-900'>Coming Soon</span>
          </div>
          <p className='text-blue-800 line-height-3 m-0'>
            We're working on advanced features like message encryption, file
            sharing, voice/video calls, group chats, and much more. Stay tuned
            for updates!
          </p>
        </div>

        <div className='flex justify-content-end gap-2 mt-4 pt-3 border-top-1 border-300'>
          <Button
            label='Got it'
            icon='pi pi-check'
            onClick={onHide}
            className='p-button-primary'
          />
        </div>
      </div>
    </Dialog>
  );
};

export default LimitationsModal;
