import { DashboardPageWrapper } from '@/components/common';
import { useAsyncData } from '@/hooks';
import { ChatService } from '@/services/chatService';
import { EmbedConfig, EmbedService } from '@/services/embedService';
import { PAGE_TITLES, TOOLTIP_LABELS } from '@/utils/constants/generic/labels';
import { useUserDataZState } from '@/zustandStates/userState';
import { Card } from 'primereact/card';
import React, { useMemo } from 'react';

const DashboardOverview: React.FC = () => {
  const userData = useUserDataZState((state) => state.data);
  const chatService = new ChatService();
  const embedService = new EmbedService();

  // Load user data using the shared hook
  const fetchDashboardData = async () => {
    if (!userData?.id) return { chats: [], embeds: [] };

    const conversations = await chatService.getUserConversations(userData.id);
    // const embeds = await embedService.getUserEmbeds(userData.id);
    const embeds: EmbedConfig[] = []; // Placeholder until getUserEmbeds is implemented

    return { chats: conversations, embeds };
  };

  const { data, loading, refresh, refreshing } = useAsyncData(
    fetchDashboardData,
    {
      entityName: 'dashboard data',
      dependencies: [userData?.id],
    }
  );

  const stats = useMemo(() => {
    if (!data) return { chats: 0, embeds: 0, activeEmbeds: 0 };

    return {
      chats: data.chats.length,
      embeds: data.embeds.length,
      activeEmbeds: data.embeds.filter((e) => e.isActive).length,
    };
  }, [data]);

  const statisticsCards = [
    {
      title: 'Active Chats',
      value: stats.chats,
      color: 'text-blue-500',
    },
    {
      title: 'Chat Embeds',
      value: stats.embeds,
      color: 'text-green-500',
    },
    {
      title: 'Active Embeds',
      value: stats.activeEmbeds,
      color: 'text-purple-500',
    },
    {
      title: 'Account Status',
      value: <i className='pi pi-check-circle'></i>,
      color: 'text-orange-500',
    },
  ];

  return (
    <DashboardPageWrapper
      title={PAGE_TITLES.DASHBOARD_OVERVIEW}
      onRefresh={refresh}
      refreshing={refreshing}
      refreshTooltip={TOOLTIP_LABELS.REFRESH_DASHBOARD}
    >
      <div className='grid'>
        {/* Statistics Cards */}
        {statisticsCards.map((stat, index) => (
          <div
            key={index}
            className='col-12 md:col-6 lg:col-3'
          >
            <Card className='text-center shadow-3 border-round-2xl'>
              <div className='text-900 font-medium mb-2'>{stat.title}</div>
              <div className={`text-5xl font-bold ${stat.color}`}>
                {loading ? '...' : stat.value}
              </div>
            </Card>
          </div>
        ))}
      </div>
    </DashboardPageWrapper>
  );
};

export default DashboardOverview;
