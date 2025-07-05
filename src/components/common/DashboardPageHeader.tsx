import { RefreshButton } from '@/components/common';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';

export interface DashboardPageHeaderProps {
  title: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  refreshTooltip?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

const DashboardPageHeader: React.FC<DashboardPageHeaderProps> = ({
  title,
  onRefresh,
  refreshing = false,
  refreshTooltip = 'Refresh Data',
  actions,
  children,
}) => {
  const { theme } = useTheme();

  return (
    <div className='flex align-items-center justify-content-between mb-4'>
      <h2
        className='text-2xl font-bold m-0'
        style={{ color: theme.textPrimary }}
      >
        {title}
      </h2>
      <div className='flex align-items-center gap-2'>
        {onRefresh && (
          <RefreshButton
            onRefresh={onRefresh}
            loading={refreshing}
            tooltip={refreshTooltip}
          />
        )}
        {actions}
        {children}
      </div>
    </div>
  );
};

export default DashboardPageHeader;
