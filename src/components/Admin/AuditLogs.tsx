import { PermissionGuard } from '@/components/common/RoleGuard';
import { Permission, UserRole } from '@/types/user/roles';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Timeline } from 'primereact/timeline';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import React, { useEffect, useRef, useState } from 'react';

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userEmail: string;
  userRole: UserRole;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'auth' | 'user' | 'role' | 'system' | 'data' | 'security';
  result: 'success' | 'failure' | 'warning';
  metadata?: Record<string, unknown>;
}

export const AuditLogs: React.FC = () => {
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [dateRange, setDateRange] = useState<Date[]>([
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    new Date(),
  ]);

  const [filters, setFilters] = useState({
    global: { value: '', matchMode: FilterMatchMode.CONTAINS },
    action: { value: null, matchMode: FilterMatchMode.EQUALS },
    category: { value: null, matchMode: FilterMatchMode.EQUALS },
    severity: { value: null, matchMode: FilterMatchMode.EQUALS },
    result: { value: null, matchMode: FilterMatchMode.EQUALS },
    userRole: { value: null, matchMode: FilterMatchMode.EQUALS },
  });

  useEffect(() => {
    loadAuditLogs();
  }, [dateRange]);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      // Simulate API call to get audit logs
      const mockLogs: AuditLogEntry[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          userId: 'admin-1',
          userEmail: 'admin@example.com',
          userRole: UserRole.ADMIN,
          action: 'ROLE_ASSIGNED',
          resource: 'user',
          resourceId: 'user-123',
          details: 'Assigned MODERATOR role to user john.doe@example.com',
          ipAddress: '192.168.1.100',
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          severity: 'medium',
          category: 'role',
          result: 'success',
          metadata: {
            previousRole: 'USER',
            newRole: 'MODERATOR',
            reason: 'Promoted for excellent community management',
          },
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          userId: 'admin-1',
          userEmail: 'admin@example.com',
          userRole: UserRole.ADMIN,
          action: 'USER_BANNED',
          resource: 'user',
          resourceId: 'user-456',
          details: 'Banned user spam.bot@example.com for 7 days',
          ipAddress: '192.168.1.100',
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          severity: 'high',
          category: 'security',
          result: 'success',
          metadata: {
            banDuration: '7 days',
            reason: 'Spam and inappropriate content',
          },
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          userId: 'moderator-1',
          userEmail: 'moderator@example.com',
          userRole: UserRole.MODERATOR,
          action: 'MESSAGE_DELETED',
          resource: 'message',
          resourceId: 'msg-789',
          details: 'Deleted inappropriate message in chat room #general',
          ipAddress: '192.168.1.200',
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          severity: 'medium',
          category: 'user',
          result: 'success',
          metadata: {
            chatRoomId: 'room-123',
            messageContent: '[REDACTED]',
            violationType: 'inappropriate_language',
          },
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
          userId: 'admin-1',
          userEmail: 'admin@example.com',
          userRole: UserRole.ADMIN,
          action: 'SETTINGS_UPDATED',
          resource: 'system',
          details: 'Updated system settings: maintenance mode enabled',
          ipAddress: '192.168.1.100',
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          severity: 'high',
          category: 'system',
          result: 'success',
          metadata: {
            settingsChanged: ['system.maintenanceMode'],
            previousValues: { maintenanceMode: false },
            newValues: { maintenanceMode: true },
          },
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          userId: 'user-999',
          userEmail: 'suspicious@example.com',
          userRole: UserRole.USER,
          action: 'LOGIN_FAILED',
          resource: 'auth',
          details: 'Failed login attempt with invalid credentials',
          ipAddress: '10.0.0.1',
          userAgent: 'curl/7.68.0',
          severity: 'medium',
          category: 'auth',
          result: 'failure',
          metadata: {
            attemptCount: 5,
            reason: 'invalid_credentials',
            blocked: true,
          },
        },
      ];

      setLogs(mockLogs);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load audit logs',
      });
    } finally {
      setLoading(false);
    }
  };

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newFilters = { ...filters };
    newFilters['global'].value = value;
    setFilters(newFilters);
    setGlobalFilterValue(value);
  };

  const getSeverityColor = (severity: AuditLogEntry['severity']) => {
    switch (severity) {
      case 'low':
        return 'info';
      case 'medium':
        return 'warning';
      case 'high':
        return 'danger';
      case 'critical':
        return 'danger';
      default:
        return 'info';
    }
  };

  const getCategoryColor = (category: AuditLogEntry['category']) => {
    switch (category) {
      case 'auth':
        return 'info';
      case 'user':
        return 'secondary';
      case 'role':
        return 'warning';
      case 'system':
        return 'secondary';
      case 'data':
        return 'info';
      case 'security':
        return 'danger';
      default:
        return 'info';
    }
  };

  const getResultColor = (result: AuditLogEntry['result']) => {
    switch (result) {
      case 'success':
        return 'success';
      case 'failure':
        return 'danger';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  const renderTimestamp = (log: AuditLogEntry) => {
    return (
      <div>
        <div className='font-medium'>{log.timestamp.toLocaleDateString()}</div>
        <div className='text-sm text-gray-500'>
          {log.timestamp.toLocaleTimeString()}
        </div>
      </div>
    );
  };

  const renderUser = (log: AuditLogEntry) => {
    return (
      <div>
        <div className='font-medium'>{log.userEmail}</div>
        <div className='text-sm'>
          <Tag
            value={log.userRole}
            severity={getCategoryColor('role')}
          />
        </div>
      </div>
    );
  };

  const renderAction = (log: AuditLogEntry) => {
    return (
      <div>
        <div className='font-medium'>{log.action}</div>
        <div className='text-sm text-gray-500'>{log.resource}</div>
      </div>
    );
  };

  const renderSeverity = (log: AuditLogEntry) => {
    return (
      <Tag
        value={log.severity.toUpperCase()}
        severity={getSeverityColor(log.severity)}
      />
    );
  };

  const renderCategory = (log: AuditLogEntry) => {
    return (
      <Tag
        value={log.category.toUpperCase()}
        severity={getCategoryColor(log.category)}
      />
    );
  };

  const renderResult = (log: AuditLogEntry) => {
    return (
      <Tag
        value={log.result.toUpperCase()}
        severity={getResultColor(log.result)}
      />
    );
  };

  const renderActions = (log: AuditLogEntry) => {
    return (
      <Button
        icon='pi pi-eye'
        className='p-button-sm p-button-outlined'
        tooltip='View Details'
        onClick={() => {
          setSelectedLog(log);
          setShowDetailsDialog(true);
        }}
      />
    );
  };

  const renderHeader = () => {
    return (
      <div className='flex flex-wrap gap-2 align-items-center justify-content-between'>
        <h4 className='m-0'>Audit Logs</h4>
        <span className='p-input-icon-left'>
          <i className='pi pi-search' />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder='Search logs...'
            className='p-inputtext-sm'
          />
        </span>
      </div>
    );
  };

  const leftToolbarTemplate = () => {
    return (
      <div className='flex flex-wrap gap-2'>
        <div>
          <label className='block mb-1 text-sm'>Date Range</label>
          <Calendar
            value={dateRange}
            onChange={(e) => setDateRange(e.value as Date[])}
            selectionMode='range'
            readOnlyInput
            showButtonBar
          />
        </div>

        <div>
          <label className='block mb-1 text-sm'>Category</label>
          <Dropdown
            value={filters.category.value}
            options={[
              { label: 'All Categories', value: null },
              { label: 'Authentication', value: 'auth' },
              { label: 'User Management', value: 'user' },
              { label: 'Role Management', value: 'role' },
              { label: 'System', value: 'system' },
              { label: 'Data', value: 'data' },
              { label: 'Security', value: 'security' },
            ]}
            onChange={(e) => {
              const newFilters = { ...filters };
              newFilters.category.value = e.value;
              setFilters(newFilters);
            }}
            placeholder='All Categories'
            className='w-40'
          />
        </div>

        <div>
          <label className='block mb-1 text-sm'>Severity</label>
          <Dropdown
            value={filters.severity.value}
            options={[
              { label: 'All Severities', value: null },
              { label: 'Low', value: 'low' },
              { label: 'Medium', value: 'medium' },
              { label: 'High', value: 'high' },
              { label: 'Critical', value: 'critical' },
            ]}
            onChange={(e) => {
              const newFilters = { ...filters };
              newFilters.severity.value = e.value;
              setFilters(newFilters);
            }}
            placeholder='All Severities'
            className='w-32'
          />
        </div>
      </div>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <div className='flex flex-wrap gap-2'>
        <Button
          label='Refresh'
          icon='pi pi-refresh'
          onClick={loadAuditLogs}
          loading={loading}
        />

        <PermissionGuard permission={Permission.VIEW_LOGS}>
          <Button
            label='Export'
            icon='pi pi-download'
            className='p-button-outlined'
            onClick={() => {
              toast.current?.show({
                severity: 'info',
                summary: 'Export',
                detail: 'Audit log export would be implemented here',
              });
            }}
          />
        </PermissionGuard>
      </div>
    );
  };

  const renderLogDetails = () => {
    if (!selectedLog) return null;

    const timelineEvents = [
      {
        status: 'Event Occurred',
        date: selectedLog.timestamp.toLocaleString(),
        icon: 'pi pi-clock',
        color: '#9C27B0',
      },
      {
        status: 'Action Executed',
        date: selectedLog.action,
        icon: 'pi pi-cog',
        color: '#673AB7',
      },
      {
        status: 'Result',
        date: selectedLog.result.toUpperCase(),
        icon: selectedLog.result === 'success' ? 'pi pi-check' : 'pi pi-times',
        color: selectedLog.result === 'success' ? '#4CAF50' : '#F44336',
      },
    ];

    return (
      <div className='grid gap-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <h5>Event Information</h5>
            <div className='space-y-2'>
              <div>
                <strong>Action:</strong> {selectedLog.action}
              </div>
              <div>
                <strong>Resource:</strong> {selectedLog.resource}
              </div>
              {selectedLog.resourceId && (
                <div>
                  <strong>Resource ID:</strong> {selectedLog.resourceId}
                </div>
              )}
              <div>
                <strong>Details:</strong> {selectedLog.details}
              </div>
            </div>
          </div>

          <div>
            <h5>User Information</h5>
            <div className='space-y-2'>
              <div>
                <strong>Email:</strong> {selectedLog.userEmail}
              </div>
              <div>
                <strong>Role:</strong> <Tag value={selectedLog.userRole} />
              </div>
              <div>
                <strong>IP Address:</strong> {selectedLog.ipAddress}
              </div>
              <div>
                <strong>User Agent:</strong>{' '}
                <code className='text-xs'>{selectedLog.userAgent}</code>
              </div>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <h5>Classification</h5>
            <div className='space-y-2'>
              <div>
                <strong>Category:</strong>{' '}
                <Tag
                  value={selectedLog.category}
                  severity={getCategoryColor(selectedLog.category)}
                />
              </div>
              <div>
                <strong>Severity:</strong>{' '}
                <Tag
                  value={selectedLog.severity}
                  severity={getSeverityColor(selectedLog.severity)}
                />
              </div>
              <div>
                <strong>Result:</strong>{' '}
                <Tag
                  value={selectedLog.result}
                  severity={getResultColor(selectedLog.result)}
                />
              </div>
            </div>
          </div>

          <div className='md:col-span-2'>
            <h5>Timeline</h5>
            <Timeline
              value={timelineEvents}
              align='alternate'
              className='customized-timeline'
            />
          </div>
        </div>

        {selectedLog.metadata && (
          <div>
            <h5>Metadata</h5>
            <Card>
              <pre className='text-sm bg-gray-50 p-3 rounded overflow-auto'>
                {JSON.stringify(selectedLog.metadata, null, 2)}
              </pre>
            </Card>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='audit-logs'>
      <Toast ref={toast} />

      <Card>
        <Toolbar
          className='mb-4'
          left={leftToolbarTemplate}
          right={rightToolbarTemplate}
        />

        <DataTable
          value={logs}
          loading={loading}
          paginator
          rows={25}
          rowsPerPageOptions={[10, 25, 50]}
          filters={filters}
          filterDisplay='menu'
          globalFilterFields={['action', 'userEmail', 'details', 'ipAddress']}
          header={renderHeader()}
          emptyMessage='No audit logs found.'
          className='p-datatable-striped'
          sortMode='multiple'
          removableSort
        >
          <Column
            field='timestamp'
            header='Timestamp'
            body={renderTimestamp}
            sortable
            style={{ minWidth: '150px' }}
          />
          <Column
            field='userEmail'
            header='User'
            body={renderUser}
            sortable
            style={{ minWidth: '200px' }}
          />
          <Column
            field='action'
            header='Action'
            body={renderAction}
            sortable
            style={{ minWidth: '200px' }}
          />
          <Column
            field='category'
            header='Category'
            body={renderCategory}
            sortable
            style={{ minWidth: '120px' }}
          />
          <Column
            field='severity'
            header='Severity'
            body={renderSeverity}
            sortable
            style={{ minWidth: '100px' }}
          />
          <Column
            field='result'
            header='Result'
            body={renderResult}
            sortable
            style={{ minWidth: '100px' }}
          />
          <Column
            field='ipAddress'
            header='IP Address'
            sortable
            style={{ minWidth: '120px' }}
          />
          <Column
            body={renderActions}
            exportable={false}
            style={{ minWidth: '80px' }}
          />
        </DataTable>
      </Card>

      {/* Log Details Dialog */}
      <Dialog
        visible={showDetailsDialog}
        onHide={() => {
          setShowDetailsDialog(false);
          setSelectedLog(null);
        }}
        header='Audit Log Details'
        style={{ width: '80vw' }}
        maximizable
        modal
      >
        {renderLogDetails()}
      </Dialog>
    </div>
  );
};
