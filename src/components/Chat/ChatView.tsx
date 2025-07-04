import { useTheme } from '@/hooks/useTheme';
import { ROUTES } from '@/utils/constants/routingConstants';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import React from 'react';

const ChatView: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { chatId } = useParams({ from: '/dashboard/chats/view/$chatId' });

  const handleBackToChats = () => {
    navigate({ to: ROUTES.DASHBOARD_CHATS });
  };

  return (
    <div>
      {/* Header with back button */}
      <div className='flex align-items-center gap-3 mb-4'>
        <Button
          icon='pi pi-arrow-left'
          className='p-button-text p-button-rounded'
          onClick={handleBackToChats}
          tooltip='Back to Chats'
          style={{ color: theme.primary }}
        />
        <h2
          className='text-2xl font-bold m-0'
          style={{ color: theme.textPrimary }}
        >
          Chat View
        </h2>
      </div>

      {/* Chat content */}
      <Card className='shadow-3 border-round-2xl'>
        <div
          className='text-center py-6'
          style={{ color: theme.textSecondary }}
        >
          <i
            className='pi pi-comments text-6xl mb-3'
            style={{ color: theme.primary }}
          ></i>
          <h3
            className='text-xl font-bold mb-2'
            style={{ color: theme.textPrimary }}
          >
            Chat ID: {chatId}
          </h3>
          <p className='text-lg mb-4'>
            Individual chat view will be implemented here.
          </p>
          <p className='text-sm'>
            This will show the full chat interface for the selected
            conversation.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ChatView;
