import { FirestoreMessage, chatService } from '@/services/chatService';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import { Timeline } from 'primereact/timeline';
import React, { useEffect, useState } from 'react';

interface MessageHistoryDialogProps {
  visible: boolean;
  message: FirestoreMessage | null;
  onHide: () => void;
}

interface HistoryItem {
  type: 'created' | 'edited';
  timestamp: Date;
  text?: string;
  previousText?: string;
  editReason?: string;
  editorEmail?: string;
  isOriginal?: boolean;
}

const MessageHistoryDialog: React.FC<MessageHistoryDialogProps> = ({
  visible,
  message,
  onHide,
}) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible && message) {
      loadHistoryData();
    }
  }, [visible, message]);

  const loadHistoryData = async () => {
    if (!message) return;

    setIsLoading(true);
    try {
      const editHistory = await chatService.getMessageEditHistory(message.id!);

      const items: HistoryItem[] = [];

      // Add original message
      items.push({
        type: 'created',
        timestamp: message.timestamp?.toDate?.() || new Date(),
        text:
          editHistory.length > 0 ? editHistory[0].previousText : message.text,
        isOriginal: true,
      });

      // Add edit history
      editHistory.forEach((edit, index) => {
        items.push({
          type: 'edited',
          timestamp: edit.editedAt?.toDate?.() || new Date(),
          text: index === editHistory.length - 1 ? message.text : undefined,
          previousText: edit.previousText,
          editReason: edit.editReason,
          editorEmail: edit.editorEmail,
        });
      });

      // Sort by timestamp
      items.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      setHistoryItems(items);
    } catch (error) {
      console.error('Error loading message history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const customizedMarker = (item: HistoryItem) => {
    return (
      <span
        className={`flex w-2rem h-2rem align-items-center justify-content-center text-white border-2 border-white border-circle z-1 shadow-1 ${
          item.type === 'created' ? 'bg-green-500' : 'bg-blue-500'
        }`}
      >
        <i
          className={item.type === 'created' ? 'pi pi-plus' : 'pi pi-pencil'}
        ></i>
      </span>
    );
  };

  const customizedContent = (item: HistoryItem) => {
    return (
      <div className='p-3 shadow-1 border-round bg-white'>
        <div className='flex align-items-center justify-content-between mb-3'>
          <div className='flex align-items-center gap-2'>
            <Tag
              value={item.type === 'created' ? 'Original' : 'Edited'}
              severity={item.type === 'created' ? 'success' : 'info'}
              icon={item.type === 'created' ? 'pi pi-plus' : 'pi pi-pencil'}
            />
            {item.isOriginal && (
              <Tag
                value='First Version'
                severity='secondary'
              />
            )}
          </div>
          <small className='text-500 font-medium'>
            {formatTimestamp(item.timestamp)}
          </small>
        </div>

        {item.editorEmail && (
          <div className='mb-2'>
            <small className='text-600'>
              Edited by: <span className='font-medium'>{item.editorEmail}</span>
            </small>
          </div>
        )}

        {item.editReason && (
          <div className='mb-3 p-2 bg-blue-50 border-round border-left-3 border-blue-200'>
            <small className='text-blue-800'>
              <strong>Reason:</strong> {item.editReason}
            </small>
          </div>
        )}

        <div className='message-content'>
          {item.type === 'edited' && item.previousText && (
            <div className='mb-3'>
              <small className='text-500 font-medium block mb-1'>
                Previous version:
              </small>
              <div className='p-2 bg-red-50 border-round border-left-3 border-red-200'>
                <p className='text-red-800 m-0 line-height-3 text-sm'>
                  {item.previousText}
                </p>
              </div>
            </div>
          )}

          {item.text && (
            <div>
              <small className='text-500 font-medium block mb-1'>
                {item.type === 'created' ? 'Original message:' : 'Updated to:'}
              </small>
              <div className='p-2 bg-green-50 border-round border-left-3 border-green-200'>
                <p className='text-green-800 m-0 line-height-3 text-sm'>
                  {item.text}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const dialogHeader = (
    <div className='flex align-items-center gap-2'>
      <i className='pi pi-history text-primary'></i>
      <span>Message Edit History</span>
    </div>
  );

  const dialogFooter = (
    <div className='flex justify-content-end'>
      <Button
        label='Close'
        icon='pi pi-times'
        onClick={onHide}
        className='p-button-text'
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      style={{ width: '700px', maxHeight: '80vh' }}
      header={dialogHeader}
      footer={dialogFooter}
      onHide={onHide}
      draggable={false}
      resizable={false}
      modal
      blockScroll
    >
      <div className='flex flex-column gap-4'>
        {/* Message info */}
        {message && (
          <div className='bg-gray-50 p-3 border-round'>
            <div className='flex align-items-center justify-content-between mb-2'>
              <span className='font-medium text-800'>Current Message</span>
              <div className='flex align-items-center gap-2'>
                <Tag
                  value={`${historyItems.length} versions`}
                  severity='info'
                  icon='pi pi-clock'
                />
                {message.isDeleted && (
                  <Tag
                    value='Deleted'
                    severity='danger'
                    icon='pi pi-trash'
                  />
                )}
              </div>
            </div>
            <p className='text-700 m-0 line-height-3'>{message.text}</p>
          </div>
        )}

        {/* History timeline */}
        <div className='timeline-container'>
          {isLoading ? (
            <div className='flex justify-content-center align-items-center py-8'>
              <ProgressSpinner
                style={{ width: '50px', height: '50px' }}
                strokeWidth='4'
              />
            </div>
          ) : historyItems.length > 0 ? (
            <Timeline
              value={historyItems}
              align='alternate'
              className='customized-timeline'
              marker={customizedMarker}
              content={customizedContent}
            />
          ) : (
            <div className='text-center py-8'>
              <div className='text-500 mb-3'>
                <i
                  className='pi pi-info-circle'
                  style={{ fontSize: '2rem' }}
                ></i>
              </div>
              <p className='text-600 m-0'>
                No edit history available for this message.
              </p>
            </div>
          )}
        </div>

        {/* Statistics */}
        {historyItems.length > 1 && (
          <div className='bg-blue-50 p-3 border-round'>
            <div className='flex align-items-center gap-2 mb-2'>
              <i className='pi pi-chart-bar text-blue-600'></i>
              <small className='text-blue-800 font-medium'>
                Edit Statistics
              </small>
            </div>
            <div className='grid'>
              <div className='col-6'>
                <small className='text-blue-700'>Total Edits:</small>
                <div className='font-medium text-blue-900'>
                  {historyItems.length - 1}
                </div>
              </div>
              <div className='col-6'>
                <small className='text-blue-700'>Last Edit:</small>
                <div className='font-medium text-blue-900'>
                  {historyItems.length > 1
                    ? formatTimestamp(
                        historyItems[historyItems.length - 1].timestamp
                      )
                    : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default MessageHistoryDialog;
