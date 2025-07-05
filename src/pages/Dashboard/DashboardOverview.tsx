import { RefreshButton } from '@/components/common';
import { useTheme } from '@/hooks/useTheme';
import { ChatConversation, ChatService } from '@/services/chatService';
import { EmbedConfig, EmbedService } from '@/services/embedService';
import { useUserDataZState } from '@/zustandStates/userState';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';

const DashboardOverview: React.FC = () => {
  const { theme } = useTheme();
  const toast = useRef<Toast>(null);
  const [userChats, setUserChats] = useState<ChatConversation[]>([]);
  const [userEmbeds, setUserEmbeds] = useState<EmbedConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const userData = useUserDataZState((state) => state.data);
  const chatService = new ChatService();
  const embedService = new EmbedService();

  // Load user data
  const loadUserData = async (showFullLoader = false) => {
    try {
      if (showFullLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      if (userData?.id) {
        const conversations = await chatService.getUserConversations(
          userData.id
        );
        setUserChats(conversations);

        // const embeds = await embedService.getUserEmbeds(userData.id);
        const embeds: EmbedConfig[] = []; // Placeholder until getUserEmbeds is implemented
        setUserEmbeds(embeds);

        if (showFullLoader) {
          toast.current?.show({
            severity: 'success',
            summary: 'Data Refreshed',
            detail: 'All data has been successfully refreshed',
            life: 3000,
          });
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load data. Please try again.',
        life: 5000,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [userData?.id]);

  // Handle refresh
  const handleRefresh = async () => {
    await loadUserData(true);
  };

  return (
    <div className='grid'>
      <Toast ref={toast} />

      <div className='col-12'>
        <div className='flex align-items-center justify-content-between mb-4'>
          <h2
            className='text-2xl font-bold m-0'
            style={{ color: theme.textPrimary }}
          >
            Dashboard Overview
          </h2>
          <RefreshButton
            onRefresh={handleRefresh}
            loading={refreshing}
            tooltip='Refresh Dashboard'
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className='col-12 md:col-6 lg:col-3'>
        <Card className='text-center shadow-3 border-round-2xl'>
          <div className='text-900 font-medium mb-2'>Active Chats</div>
          <div className='text-5xl font-bold text-blue-500'>
            {loading ? '...' : userChats.length}
          </div>
        </Card>
      </div>

      <div className='col-12 md:col-6 lg:col-3'>
        <Card className='text-center shadow-3 border-round-2xl'>
          <div className='text-900 font-medium mb-2'>Chat Embeds</div>
          <div className='text-5xl font-bold text-green-500'>
            {loading ? '...' : userEmbeds.length}
          </div>
        </Card>
      </div>

      <div className='col-12 md:col-6 lg:col-3'>
        <Card className='text-center shadow-3 border-round-2xl'>
          <div className='text-900 font-medium mb-2'>Active Embeds</div>
          <div className='text-5xl font-bold text-purple-500'>
            {loading ? '...' : userEmbeds.filter((e) => e.isActive).length}
          </div>
        </Card>
      </div>

      <div className='col-12 md:col-6 lg:col-3'>
        <Card className='text-center shadow-3 border-round-2xl'>
          <div className='text-900 font-medium mb-2'>Account Status</div>
          <div className='text-5xl font-bold text-orange-500'>
            <i className='pi pi-check-circle'></i>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
