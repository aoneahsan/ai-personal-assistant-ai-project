import { RefreshButton } from '@/components/common';
import { useTheme } from '@/hooks/useTheme';
import { EmbedConfig, EmbedService } from '@/services/embedService';
import { ROUTES } from '@/utils/constants/routingConstants';
import { useUserDataZState } from '@/zustandStates/userState';
import { useNavigate } from '@tanstack/react-router';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Skeleton } from 'primereact/skeleton';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';

const DashboardChatEmbeds: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const toast = useRef<Toast>(null);
  const [userEmbeds, setUserEmbeds] = useState<EmbedConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const userData = useUserDataZState((state) => state.data);
  const embedService = new EmbedService();

  // Load user embeds
  const loadUserEmbeds = async (showFullLoader = false) => {
    try {
      if (showFullLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      if (userData?.id) {
        // const embeds = await embedService.getUserEmbeds(userData.id);
        const embeds: EmbedConfig[] = []; // Placeholder until getUserEmbeds is implemented
        setUserEmbeds(embeds);

        if (showFullLoader) {
          toast.current?.show({
            severity: 'success',
            summary: 'Embeds Refreshed',
            detail: 'Embed data has been successfully refreshed',
            life: 3000,
          });
        }
      }
    } catch (error) {
      console.error('Error loading user embeds:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load embeds. Please try again.',
        life: 5000,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUserEmbeds();
  }, [userData?.id]);

  // Handle refresh
  const handleRefresh = async () => {
    await loadUserEmbeds(true);
  };

  return (
    <div>
      <Toast ref={toast} />

      <div className='flex align-items-center justify-content-between mb-4'>
        <h2
          className='text-2xl font-bold m-0'
          style={{ color: theme.textPrimary }}
        >
          Chat Embeds
        </h2>
        <div className='flex align-items-center gap-2'>
          <RefreshButton
            onRefresh={handleRefresh}
            loading={refreshing}
            tooltip='Refresh Embeds'
          />
          <Button
            label='Create New Embed'
            icon='pi pi-plus'
            className='p-button-rounded'
            onClick={() => navigate({ to: ROUTES.EMBED_DEMO })}
          />
        </div>
      </div>

      <Card className='shadow-3 border-round-2xl'>
        {loading ? (
          <div className='space-y-3'>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className='flex align-items-center gap-3 p-3'
              >
                <Skeleton
                  shape='circle'
                  size='3rem'
                />
                <div className='flex-1'>
                  <Skeleton
                    width='200px'
                    height='1rem'
                    className='mb-2'
                  />
                  <Skeleton
                    width='150px'
                    height='0.8rem'
                  />
                </div>
              </div>
            ))}
          </div>
        ) : userEmbeds.length === 0 ? (
          <div
            className='text-center py-8'
            style={{ color: theme.textSecondary }}
          >
            <i
              className='pi pi-code text-6xl mb-3'
              style={{ color: theme.primary }}
            ></i>
            <h3
              className='text-xl font-bold mb-2'
              style={{ color: theme.textPrimary }}
            >
              No embeds created yet
            </h3>
            <p className='text-lg mb-4'>
              Create your first chat embed to get started
            </p>
            <Button
              label='Create New Embed'
              icon='pi pi-plus'
              className='p-button-rounded'
              onClick={() => navigate({ to: ROUTES.EMBED_DEMO })}
            />
          </div>
        ) : (
          <DataTable
            value={userEmbeds}
            paginator
            rows={10}
            rowHover
            className='p-datatable-customers'
          >
            <Column
              field='name'
              header='Name'
              body={(rowData) => (
                <div>
                  <div className='font-medium'>{rowData.name}</div>
                  <div className='text-sm text-500'>{rowData.description}</div>
                </div>
              )}
            />
            <Column
              field='isActive'
              header='Status'
              body={(rowData) => (
                <Tag
                  value={rowData.isActive ? 'Active' : 'Inactive'}
                  severity={rowData.isActive ? 'success' : 'danger'}
                />
              )}
            />
            <Column
              field='createdAt'
              header='Created'
              body={(rowData) =>
                new Date(rowData.createdAt).toLocaleDateString()
              }
            />
            <Column
              field='actions'
              header='Actions'
              body={(rowData) => (
                <div className='flex gap-2'>
                  <Button
                    icon='pi pi-copy'
                    className='p-button-rounded p-button-text'
                    onClick={() => {
                      const embedCode = `<script src="https://yoursite.com/embed/${rowData.id}"></script>`;
                      navigator.clipboard.writeText(embedCode);
                      toast.current?.show({
                        severity: 'success',
                        summary: 'Copied',
                        detail: 'Embed code copied to clipboard',
                        life: 3000,
                      });
                    }}
                    tooltip='Copy Embed Code'
                  />
                  <Button
                    icon='pi pi-external-link'
                    className='p-button-rounded p-button-text'
                    onClick={() => window.open(ROUTES.EMBED_DEMO, '_blank')}
                    tooltip='Preview Embed'
                  />
                </div>
              )}
            />
          </DataTable>
        )}
      </Card>
    </div>
  );
};

export default DashboardChatEmbeds;
