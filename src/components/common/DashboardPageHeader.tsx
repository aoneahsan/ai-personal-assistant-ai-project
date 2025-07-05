import { RefreshButton } from '@/components/common';
import { useTheme } from '@/hooks/useTheme';
import { TOOLTIP_LABELS } from '@/utils/constants/generic/labels';
import { CSS_CLASSES } from '@/utils/constants/generic/styles';
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
  refreshTooltip = TOOLTIP_LABELS.REFRESH_DATA,
  actions,
  children,
}) => {
  const { theme } = useTheme();

  return (
    <div className='flex align-items-center justify-content-between mb-4'>
      <h2
        className={`${CSS_CLASSES.TYPOGRAPHY.HEADING_MEDIUM} ${CSS_CLASSES.SPACING.M_0}`}
        style={{ color: theme.textPrimary }}
      >
        {title}
      </h2>
      <div className={`flex align-items-center ${CSS_CLASSES.GRID.GAP_2}`}>
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
