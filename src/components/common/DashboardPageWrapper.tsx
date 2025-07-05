import { useToast } from '@/hooks/useToast';
import { Toast } from 'primereact/toast';
import React from 'react';
import DashboardPageHeader, {
  DashboardPageHeaderProps,
} from './DashboardPageHeader';

export interface DashboardPageWrapperProps extends DashboardPageHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const DashboardPageWrapper: React.FC<DashboardPageWrapperProps> = ({
  children,
  className = '',
  ...headerProps
}) => {
  const { toast } = useToast();

  return (
    <div className={className}>
      <Toast ref={toast} />
      <DashboardPageHeader {...headerProps} />
      {children}
    </div>
  );
};

export default DashboardPageWrapper;
