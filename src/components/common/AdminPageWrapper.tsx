import { useToast } from '@/hooks/useToast';
import { Toast } from 'primereact/toast';
import React from 'react';

export interface AdminPageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const AdminPageWrapper: React.FC<AdminPageWrapperProps> = ({
  children,
  className = '',
}) => {
  const { toast } = useToast();

  return (
    <div className={`admin-page-wrapper ${className}`}>
      <Toast ref={toast} />
      {children}
    </div>
  );
};

export default AdminPageWrapper;
