import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Menu } from 'primereact/menu';
import { useTours } from '../../hooks';
import { Tour } from '../../types';
import { formatNumber, formatPercentage } from '../../utils';
import './TourManagement.scss';

interface TourManagementProps {
  onCreateTour: () => void;
  onEditTour: (tour: Tour) => void;
  onViewAnalytics: (tourId: string) => void;
}

export const TourManagement: React.FC<TourManagementProps> = ({
  onCreateTour,
  onEditTour,
  onViewAnalytics,
}) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const menuRef = React.useRef<Menu>(null);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);

  const {
    tours,
    isLoading,
    deleteTour,
    duplicateTour,
    updateTour,
    isDeleting,
    isDuplicating,
  } = useTours();

  const statusOptions = [
    { label: 'All', value: null },
    { label: 'Draft', value: 'draft' },
    { label: 'Active', value: 'active' },
    { label: 'Paused', value: 'paused' },
    { label: 'Archived', value: 'archived' },
  ];

  const menuItems = [
    {
      label: 'Edit',
      icon: 'pi pi-pencil',
      command: () => selectedTour && onEditTour(selectedTour),
    },
    {
      label: 'Duplicate',
      icon: 'pi pi-copy',
      command: () => selectedTour && handleDuplicate(selectedTour),
    },
    {
      label: 'View Analytics',
      icon: 'pi pi-chart-line',
      command: () => selectedTour && onViewAnalytics(selectedTour.id),
    },
    {
      separator: true,
    },
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      className: 'p-menuitem-danger',
      command: () => selectedTour && handleDelete(selectedTour),
    },
  ];

  const handleDelete = (tour: Tour) => {
    confirmDialog({
      message: `Are you sure you want to delete "${tour.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => deleteTour(tour.id),
    });
  };

  const handleDuplicate = (tour: Tour) => {
    const newName = prompt('Enter name for duplicated tour:', `${tour.name} (Copy)`);
    if (newName) {
      duplicateTour({ tourId: tour.id, newName });
    }
  };

  const handleStatusChange = (tour: Tour, newStatus: string) => {
    updateTour({ id: tour.id, updates: { status: newStatus as any } });
  };

  const statusBodyTemplate = (tour: Tour) => {
    const getSeverity = (status: string) => {
      switch (status) {
        case 'active':
          return 'success';
        case 'draft':
          return 'info';
        case 'paused':
          return 'warning';
        case 'archived':
          return 'danger';
        default:
          return null;
      }
    };

    return (
      <Tag value={tour.status} severity={getSeverity(tour.status)} />
    );
  };

  const metricsBodyTemplate = (tour: Tour) => {
    const completionRate = tour.analytics.starts > 0
      ? (tour.analytics.completions / tour.analytics.starts) * 100
      : 0;

    return (
      <div className="tour-metrics">
        <div className="metric">
          <span className="metric-label">Starts:</span>
          <span className="metric-value">{formatNumber(tour.analytics.starts)}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Completion:</span>
          <span className="metric-value">{formatPercentage(completionRate)}</span>
        </div>
      </div>
    );
  };

  const actionsBodyTemplate = (tour: Tour) => {
    return (
      <div className="tour-actions">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text"
          onClick={() => onEditTour(tour)}
        />
        <Button
          icon="pi pi-chart-line"
          className="p-button-rounded p-button-text"
          onClick={() => onViewAnalytics(tour.id)}
        />
        <Button
          icon="pi pi-ellipsis-v"
          className="p-button-rounded p-button-text"
          onClick={(e) => {
            setSelectedTour(tour);
            menuRef.current?.toggle(e);
          }}
        />
      </div>
    );
  };

  const header = (
    <div className="table-header">
      <div className="table-header-left">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search tours..."
          />
        </span>
        <Dropdown
          value={statusFilter}
          options={statusOptions}
          onChange={(e) => setStatusFilter(e.value)}
          placeholder="Filter by status"
        />
      </div>
      <Button
        label="Create Tour"
        icon="pi pi-plus"
        onClick={onCreateTour}
      />
    </div>
  );

  const filteredTours = tours.filter((tour) => {
    if (statusFilter && tour.status !== statusFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="tour-management">
      <ConfirmDialog />
      <Menu ref={menuRef} model={menuItems} popup />

      <DataTable
        value={filteredTours}
        paginator
        rows={10}
        dataKey="id"
        loading={isLoading}
        globalFilter={globalFilter}
        header={header}
        emptyMessage="No tours found"
        className="p-datatable-customers"
      >
        <Column field="name" header="Tour Name" sortable />
        <Column
          field="status"
          header="Status"
          body={statusBodyTemplate}
          sortable
        />
        <Column
          field="steps.length"
          header="Steps"
          body={(tour) => tour.steps.length}
          sortable
        />
        <Column
          header="Performance"
          body={metricsBodyTemplate}
        />
        <Column
          field="createdAt"
          header="Created"
          body={(tour) => new Date(tour.createdAt).toLocaleDateString()}
          sortable
        />
        <Column
          body={actionsBodyTemplate}
          exportable={false}
          style={{ minWidth: '8rem' }}
        />
      </DataTable>
    </div>
  );
};