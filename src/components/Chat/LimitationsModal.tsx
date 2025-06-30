import { chatService } from '@/services/chatService';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
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
      header='ℹ️ Current Chat System Limitations'
      visible={visible}
      style={{ width: '90vw', maxWidth: '600px' }}
      onHide={onHide}
      dismissableMask
      draggable={false}
      resizable={false}
    >
      <div className='limitations-content'>
        <div className='mb-4'>
          <p className='text-700 line-height-3 m-0'>
            This chat system is currently in development. Here are the current
            limitations and features:
          </p>
        </div>

        <div className='limitations-list'>
          {limitations.map((limitation, index) => (
            <div
              key={index}
              className='limitation-item mb-4'
            >
              <div className='flex align-items-start gap-3'>
                <div className='limitation-icon'>
                  <span
                    className='text-2xl'
                    role='img'
                    aria-label='icon'
                  >
                    {limitation.icon}
                  </span>
                </div>
                <div className='flex-1'>
                  <div className='flex align-items-center gap-2 mb-2'>
                    <h4 className='text-900 m-0 font-semibold text-lg'>
                      {limitation.title}
                    </h4>
                    {limitation.isSettingConfigurable && (
                      <Tag
                        value='Configurable'
                        severity='info'
                        icon='pi pi-cog'
                        className='text-xs'
                      />
                    )}
                  </div>
                  <p className='text-600 m-0 line-height-3 text-base'>
                    {limitation.description}
                  </p>
                </div>
              </div>
              {index < limitations.length - 1 && (
                <Divider className='mt-4 mb-0' />
              )}
            </div>
          ))}
        </div>

        <div className='mt-5 pt-4 border-top-1 surface-border'>
          <div className='bg-blue-50 border-left-3 border-blue-500 p-4 border-round'>
            <div className='flex align-items-center gap-2 mb-2'>
              <i className='pi pi-info-circle text-blue-600'></i>
              <strong className='text-blue-900'>Development Status</strong>
            </div>
            <p className='text-blue-800 m-0 text-sm line-height-3'>
              We're actively working on improving these features. Settings
              marked as "Configurable" will have user controls in future
              updates. File backup policies and transcript features are designed
              to evolve based on user needs.
            </p>
          </div>
        </div>

        <div className='flex justify-content-end gap-2 mt-4'>
          <Button
            label='Got it'
            onClick={onHide}
            className='p-button-primary'
            autoFocus
          />
        </div>
      </div>
    </Dialog>
  );
};

export default LimitationsModal;
