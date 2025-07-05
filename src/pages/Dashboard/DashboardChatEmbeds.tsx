import {
  DashboardPageWrapper,
  EmptyState,
  SkeletonLoader,
} from '@/components/common';
import { useAsyncData, useToast } from '@/hooks';
import { EmbedConfig, EmbedService } from '@/services/embedService';
import {
  BUTTON_LABELS,
  EMPTY_STATE_MESSAGES,
  PAGE_TITLES,
  TOOLTIP_LABELS,
} from '@/utils/constants/generic/labels';
import { UI_ICONS } from '@/utils/constants/generic/ui';
import { ROUTES } from '@/utils/constants/routingConstants';
import { useUserDataZState } from '@/zustandStates/userState';
import { useNavigate } from '@tanstack/react-router';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Tag } from 'primereact/tag';
import React from 'react';

const DashboardChatEmbeds: React.FC = () => {
  const navigate = useNavigate();
  const { showCopySuccess } = useToast();

  const userData = useUserDataZState((state) => state.data);
  const embedService = new EmbedService();

  // Load user embeds using the shared hook
  const fetchUserEmbeds = async (): Promise<EmbedConfig[]> => {
    if (!userData?.id) return [];
    // const embeds = await embedService.getUserEmbeds(userData.id);
    return []; // Placeholder until getUserEmbeds is implemented
  };

  const {
    data: userEmbeds,
    loading,
    refresh,
    refreshing,
  } = useAsyncData(fetchUserEmbeds, {
    entityName: 'embeds',
    dependencies: [userData?.id],
  });

  const handleCopyEmbedCode = (embedId: string | undefined) => {
    if (!embedId) return;
    const embedCode = `<script src="https://yoursite.com/embed/${embedId}"></script>`;
    navigator.clipboard.writeText(embedCode);
    showCopySuccess('Embed code');
  };

  const renderName = (rowData: EmbedConfig) => (
    <div>
      <div className='font-medium'>{rowData.title || 'Untitled Embed'}</div>
      <div className='text-sm text-500'>
        {rowData.description || 'No description'}
      </div>
    </div>
  );

  const renderStatus = (rowData: EmbedConfig) => (
    <Tag
      value={rowData.isActive ? 'Active' : 'Inactive'}
      severity={rowData.isActive ? 'success' : 'danger'}
    />
  );

  const renderCreatedAt = (rowData: EmbedConfig) =>
    new Date(rowData.createdAt || Date.now()).toLocaleDateString();

  const renderActions = (rowData: EmbedConfig) => (
    <div className='flex gap-2'>
      <Button
        icon={UI_ICONS.COPY}
        className='p-button-rounded p-button-text'
        onClick={() => handleCopyEmbedCode(rowData.id)}
        tooltip={TOOLTIP_LABELS.COPY_ITEM}
      />
      <Button
        icon={UI_ICONS.EMBED}
        className='p-button-rounded p-button-text'
        onClick={() => window.open(ROUTES.EMBED_DEMO, '_blank')}
        tooltip='Preview Embed'
      />
    </div>
  );

  const createNewEmbedAction = (
    <Button
      label={BUTTON_LABELS.CREATE_NEW_EMBED}
      icon={UI_ICONS.CODE}
      className='p-button-rounded'
      onClick={() => navigate({ to: ROUTES.EMBED_DEMO })}
    />
  );

  const renderContent = () => {
    if (loading) {
      return (
        <Card className='shadow-3 border-round-2xl'>
          <SkeletonLoader
            type='list'
            count={3}
          />
        </Card>
      );
    }

    if (!userEmbeds || userEmbeds.length === 0) {
      return (
        <Card className='shadow-3 border-round-2xl'>
          <EmptyState
            icon={UI_ICONS.CODE}
            title={EMPTY_STATE_MESSAGES.NO_EMBEDS}
            description={EMPTY_STATE_MESSAGES.CREATE_FIRST_EMBED}
            actionLabel={BUTTON_LABELS.CREATE_NEW_EMBED}
            onAction={() => navigate({ to: ROUTES.EMBED_DEMO })}
          />
        </Card>
      );
    }

    return (
      <Card className='shadow-3 border-round-2xl'>
        <DataTable
          value={userEmbeds}
          paginator
          rows={10}
          rowHover
          className='p-datatable-customers'
        >
          <Column
            field='title'
            header='Name'
            body={renderName}
          />
          <Column
            field='isActive'
            header='Status'
            body={renderStatus}
          />
          <Column
            field='createdAt'
            header='Created'
            body={renderCreatedAt}
          />
          <Column
            field='actions'
            header='Actions'
            body={renderActions}
          />
        </DataTable>
      </Card>
    );
  };

  return (
    <DashboardPageWrapper
      title={PAGE_TITLES.DASHBOARD_CHAT_EMBEDS}
      onRefresh={refresh}
      refreshing={refreshing}
      refreshTooltip={TOOLTIP_LABELS.REFRESH_EMBEDS}
      actions={createNewEmbedAction}
    >
      {renderContent()}
    </DashboardPageWrapper>
  );
};

export default DashboardChatEmbeds;
