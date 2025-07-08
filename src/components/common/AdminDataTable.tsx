import {
  adminTableDefaults,
  getAdminSearchHeaderConfig,
} from '@/utils/helpers/adminDataUtils';
import { DataTable, DataTableProps } from 'primereact/datatable';
import { Toolbar } from 'primereact/toolbar';
import React, { useState } from 'react';

export interface AdminTableFilters {
  global: { value: string };
  [key: string]: { value: string | number | boolean };
}

export interface AdminDataTableProps extends Omit<DataTableProps, 'filters'> {
  title: string;
  searchPlaceholder?: string;
  filters?: AdminTableFilters;
  onFiltersChange?: (filters: AdminTableFilters) => void;
  leftToolbar?: React.ReactNode;
  rightToolbar?: React.ReactNode;
  showToolbar?: boolean;
  showSearch?: boolean;
  children?: React.ReactNode;
}

const AdminDataTable: React.FC<AdminDataTableProps> = ({
  title,
  searchPlaceholder = 'Search...',
  filters,
  onFiltersChange,
  leftToolbar,
  rightToolbar,
  showToolbar = true,
  showSearch = true,
  children,
  ...dataTableProps
}) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');

  const handleSearchChange = (value: string) => {
    setGlobalFilterValue(value);
    if (filters && onFiltersChange) {
      const newFilters = { ...filters };
      newFilters.global.value = value;
      onFiltersChange(newFilters);
    }
  };

  const renderHeader = () => {
    if (!showSearch) return null;

    const config = getAdminSearchHeaderConfig(
      title,
      globalFilterValue,
      searchPlaceholder
    );

    return (
      <div className={config.wrapperClassName}>
        <h4 className={config.titleClassName}>{config.title}</h4>
        <span className={config.searchClassName}>
          <i className={config.iconClassName} />
          <input
            type='text'
            value={config.searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={config.placeholder}
            className={config.inputClassName}
          />
        </span>
      </div>
    );
  };

  const renderToolbar = () => {
    if (!showToolbar || (!leftToolbar && !rightToolbar)) return null;

    return (
      <Toolbar
        className='mb-4'
        left={leftToolbar}
        right={rightToolbar}
      />
    );
  };

  return (
    <div className='admin-data-table'>
      {renderToolbar()}
      <DataTable
        {...adminTableDefaults}
        {...dataTableProps}
        header={renderHeader()}
        filters={filters}
        globalFilterFields={['name', 'email', 'displayName', 'title']}
        emptyMessage='No records found'
      >
        {children}
      </DataTable>
    </div>
  );
};

export default AdminDataTable;
