import { PermissionGuard } from '@/components/common/RoleGuard';
import { logError } from '@/sentryErrorLogging';
import {
  Integration,
  integrationManagementService,
  IntegrationTemplate,
  IntegrationTestResults,
} from '@/services/integrationManagementService';
import { Permission } from '@/types/user/roles';
import { useUserDataZState } from '@/zustandStates/userState';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Chip } from 'primereact/chip';
import { Column } from 'primereact/column';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Password } from 'primereact/password';
import { TabPanel, TabView } from 'primereact/tabview';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';

// Use interfaces from the service

export const IntegrationManagement: React.FC = () => {
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(false);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [templates, setTemplates] = useState<IntegrationTemplate[]>([]);
  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<IntegrationTemplate | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<
    Partial<Integration>
  >({});
  const [testResults, setTestResults] = useState<IntegrationTestResults | null>(
    null
  );

  // Get current user for creating integrations
  const userData = useUserDataZState((state) => state.data);

  useEffect(() => {
    loadIntegrations();
    loadTemplates();
  }, []);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const integrations = await integrationManagementService.getIntegrations();
      setIntegrations(integrations);
    } catch (error) {
      console.error('Error loading integrations:', error);
      logError(
        error instanceof Error
          ? error
          : new Error('Failed to load integrations')
      );
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load integrations',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const templates =
        await integrationManagementService.getIntegrationTemplates();
      setTemplates(templates);
    } catch (error) {
      console.error('Error loading templates:', error);
      logError(
        error instanceof Error
          ? error
          : new Error('Failed to load integration templates')
      );
    }
  };

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'error':
        return 'danger';
      case 'pending':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getTypeColor = (type: Integration['type']) => {
    switch (type) {
      case 'oauth':
        return 'secondary';
      case 'api_key':
        return 'info';
      case 'webhook':
        return 'warning';
      case 'database':
        return 'secondary';
      case 'storage':
        return 'info';
      case 'notification':
        return 'success';
      default:
        return 'info';
    }
  };

  const renderIntegrationStatus = (integration: Integration) => {
    return (
      <div className='flex items-center gap-2'>
        <Tag
          value={integration.status.toUpperCase()}
          severity={getStatusColor(integration.status)}
        />
        {integration.status === 'error' && (
          <i
            className='pi pi-exclamation-triangle text-red-500'
            title={integration.lastError}
          />
        )}
      </div>
    );
  };

  const renderIntegrationType = (integration: Integration) => {
    return (
      <Tag
        value={integration.type.toUpperCase()}
        severity={getTypeColor(integration.type)}
      />
    );
  };

  const renderLastSync = (integration: Integration) => {
    const timeDiff = Date.now() - integration.lastSync.getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  };

  const renderMetrics = (integration: Integration) => {
    return (
      <div className='text-sm'>
        <div>Requests: {integration.metrics.requestsToday}</div>
        <div>
          Error Rate: {(integration.metrics.errorRate * 100).toFixed(1)}%
        </div>
      </div>
    );
  };

  const renderActions = (integration: Integration) => {
    return (
      <div className='flex gap-2'>
        <Button
          icon='pi pi-cog'
          className='p-button-sm p-button-outlined'
          tooltip='Configure'
          onClick={() => {
            setSelectedIntegration(integration);
            setEditingIntegration(integration);
            setShowConfigDialog(true);
          }}
        />

        <Button
          icon='pi pi-play'
          className='p-button-sm p-button-outlined'
          tooltip='Test Connection'
          onClick={() => {
            setSelectedIntegration(integration);
            setShowTestDialog(true);
          }}
        />

        <PermissionGuard permission={Permission.MANAGE_INTEGRATIONS}>
          <Button
            icon={
              integration.status === 'active' ? 'pi pi-pause' : 'pi pi-play'
            }
            className={`p-button-sm p-button-outlined ${
              integration.status === 'active'
                ? 'p-button-warning'
                : 'p-button-success'
            }`}
            tooltip={integration.status === 'active' ? 'Disable' : 'Enable'}
            onClick={() => toggleIntegration(integration)}
          />
        </PermissionGuard>
      </div>
    );
  };

  const toggleIntegration = async (integration: Integration) => {
    if (!integration.id) return;

    try {
      const newStatus: Integration['status'] =
        integration.status === 'active' ? 'inactive' : 'active';

      await integrationManagementService.updateIntegration(integration.id, {
        status: newStatus,
      });

      // Update local state
      setIntegrations(
        integrations.map((i) =>
          i.id === integration.id ? { ...i, status: newStatus } : i
        )
      );

      toast.current?.show({
        severity: 'success',
        summary: 'Integration Updated',
        detail: `${integration.name} has been ${newStatus}`,
      });
    } catch (error) {
      console.error('Error toggling integration:', error);
      logError(
        error instanceof Error
          ? error
          : new Error('Failed to toggle integration')
      );
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update integration',
      });
    }
  };

  const testIntegration = async (integration: Integration) => {
    try {
      const results =
        await integrationManagementService.testIntegration(integration);
      setTestResults(results);

      // Update integration status based on test results
      if (integration.id) {
        const newStatus = results.success ? 'active' : 'error';
        if (newStatus !== integration.status) {
          await integrationManagementService.updateIntegration(integration.id, {
            status: newStatus,
            ...(results.error && { lastError: results.error }),
          });

          // Update local state
          setIntegrations(
            integrations.map((i) =>
              i.id === integration.id
                ? { ...i, status: newStatus, lastError: results.error }
                : i
            )
          );
        }
      }
    } catch (error: unknown) {
      const errorResult: IntegrationTestResults = {
        success: false,
        message: 'Test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
      setTestResults(errorResult);
      logError(
        error instanceof Error ? error : new Error('Failed to test integration')
      );
    }
  };

  const saveIntegration = async () => {
    if (!selectedIntegration?.id || !editingIntegration) return;

    try {
      await integrationManagementService.updateIntegration(
        selectedIntegration.id,
        editingIntegration
      );

      // Update local state
      setIntegrations(
        integrations.map((i) =>
          i.id === selectedIntegration.id
            ? { ...i, ...editingIntegration, updatedAt: new Date() }
            : i
        )
      );

      setShowConfigDialog(false);
      setSelectedIntegration(null);
      setEditingIntegration({});

      toast.current?.show({
        severity: 'success',
        summary: 'Integration Saved',
        detail: 'Integration configuration updated successfully',
      });
    } catch (error) {
      console.error('Error saving integration:', error);
      logError(
        error instanceof Error ? error : new Error('Failed to save integration')
      );
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save integration',
      });
    }
  };

  const addIntegration = async () => {
    if (!selectedTemplate) return;

    try {
      const integrationData = {
        name: selectedTemplate.name,
        type: selectedTemplate.type,
        status: 'pending' as const,
        description: selectedTemplate.description,
        provider: selectedTemplate.provider,
        version: '1.0',
        config: {},
        metrics: {
          requestsToday: 0,
          requestsTotal: 0,
          errorRate: 0,
          avgResponseTime: 0,
        },
        limits: {
          dailyRequests: 1000,
          rateLimit: 10,
        },
        createdBy: userData?.email || 'admin@example.com',
      };

      await integrationManagementService.createIntegration(integrationData);

      // Reload integrations to get the updated list
      await loadIntegrations();

      setShowTemplateDialog(false);
      setSelectedTemplate(null);

      toast.current?.show({
        severity: 'success',
        summary: 'Integration Added',
        detail: `${selectedTemplate.name} integration added successfully`,
      });
    } catch (error) {
      console.error('Error adding integration:', error);
      logError(
        error instanceof Error ? error : new Error('Failed to add integration')
      );
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to add integration',
      });
    }
  };

  return (
    <div className='integration-management'>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6'>
        <Card className='text-center'>
          <div className='flex flex-col items-center'>
            <i className='pi pi-link text-4xl text-blue-500 mb-2' />
            <h3 className='text-2xl font-bold'>{integrations.length}</h3>
            <p className='text-gray-600'>Total Integrations</p>
          </div>
        </Card>

        <Card className='text-center'>
          <div className='flex flex-col items-center'>
            <i className='pi pi-check-circle text-4xl text-green-500 mb-2' />
            <h3 className='text-2xl font-bold'>
              {integrations.filter((i) => i.status === 'active').length}
            </h3>
            <p className='text-gray-600'>Active</p>
          </div>
        </Card>

        <Card className='text-center'>
          <div className='flex flex-col items-center'>
            <i className='pi pi-exclamation-triangle text-4xl text-red-500 mb-2' />
            <h3 className='text-2xl font-bold'>
              {integrations.filter((i) => i.status === 'error').length}
            </h3>
            <p className='text-gray-600'>Errors</p>
          </div>
        </Card>

        <Card className='text-center'>
          <div className='flex flex-col items-center'>
            <i className='pi pi-chart-bar text-4xl text-purple-500 mb-2' />
            <h3 className='text-2xl font-bold'>
              {integrations.reduce(
                (sum, i) => sum + i.metrics.requestsToday,
                0
              )}
            </h3>
            <p className='text-gray-600'>Requests Today</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className='flex justify-between items-center mb-4'>
          <h3>Integrations</h3>
          <PermissionGuard permission={Permission.MANAGE_INTEGRATIONS}>
            <Button
              label='Add Integration'
              icon='pi pi-plus'
              onClick={() => setShowTemplateDialog(true)}
            />
          </PermissionGuard>
        </div>

        <DataTable
          value={integrations}
          loading={loading}
          paginator
          rows={10}
          className='p-datatable-striped'
        >
          <Column
            field='name'
            header='Name'
            body={(integration) => (
              <div>
                <div className='font-medium'>{integration.name}</div>
                <div className='text-sm text-gray-500'>
                  {integration.provider}
                </div>
              </div>
            )}
          />
          <Column
            field='type'
            header='Type'
            body={renderIntegrationType}
          />
          <Column
            field='status'
            header='Status'
            body={renderIntegrationStatus}
          />
          <Column
            field='lastSync'
            header='Last Sync'
            body={renderLastSync}
          />
          <Column
            field='metrics'
            header='Metrics'
            body={renderMetrics}
          />
          <Column
            body={renderActions}
            style={{ minWidth: '150px' }}
          />
        </DataTable>
      </Card>

      {/* Add Integration Dialog */}
      <Dialog
        visible={showTemplateDialog}
        onHide={() => setShowTemplateDialog(false)}
        header='Add Integration'
        style={{ width: '70vw' }}
      >
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all ${
                selectedTemplate?.id === template.id
                  ? 'ring-2 ring-blue-500'
                  : ''
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <div className='text-center'>
                <i className={`${template.icon} text-4xl mb-3`} />
                <h4 className='font-medium'>{template.name}</h4>
                <p className='text-sm text-gray-600 mb-2'>
                  {template.description}
                </p>
                <Chip
                  label={template.category}
                  className='text-xs'
                />
              </div>
            </Card>
          ))}
        </div>

        <div className='flex justify-end gap-2 mt-4'>
          <Button
            label='Cancel'
            icon='pi pi-times'
            onClick={() => setShowTemplateDialog(false)}
            className='p-button-text'
          />
          <Button
            label='Add Integration'
            icon='pi pi-plus'
            onClick={addIntegration}
            disabled={!selectedTemplate}
          />
        </div>
      </Dialog>

      {/* Configure Integration Dialog */}
      <Dialog
        visible={showConfigDialog}
        onHide={() => setShowConfigDialog(false)}
        header={`Configure ${selectedIntegration?.name}`}
        style={{ width: '60vw' }}
      >
        {selectedIntegration && (
          <TabView>
            <TabPanel
              header='Configuration'
              leftIcon='pi pi-cog'
            >
              <div className='space-y-4'>
                <div>
                  <label className='block mb-2'>Name</label>
                  <InputText
                    value={editingIntegration.name || selectedIntegration.name}
                    onChange={(e) =>
                      setEditingIntegration({
                        ...editingIntegration,
                        name: e.target.value,
                      })
                    }
                    className='w-full'
                  />
                </div>

                <div>
                  <label className='block mb-2'>Description</label>
                  <InputTextarea
                    value={
                      editingIntegration.description ||
                      selectedIntegration.description
                    }
                    onChange={(e) =>
                      setEditingIntegration({
                        ...editingIntegration,
                        description: e.target.value,
                      })
                    }
                    className='w-full'
                    rows={3}
                  />
                </div>

                {selectedIntegration.type === 'api_key' && (
                  <div>
                    <label className='block mb-2'>API Key</label>
                    <Password
                      value={
                        editingIntegration.apiKey || selectedIntegration.apiKey
                      }
                      onChange={(e) =>
                        setEditingIntegration({
                          ...editingIntegration,
                          apiKey: e.target.value,
                        })
                      }
                      className='w-full'
                      feedback={false}
                    />
                  </div>
                )}

                {selectedIntegration.webhookUrl && (
                  <div>
                    <label className='block mb-2'>Webhook URL</label>
                    <InputText
                      value={
                        editingIntegration.webhookUrl ||
                        selectedIntegration.webhookUrl
                      }
                      onChange={(e) =>
                        setEditingIntegration({
                          ...editingIntegration,
                          webhookUrl: e.target.value,
                        })
                      }
                      className='w-full'
                    />
                  </div>
                )}
              </div>
            </TabPanel>

            <TabPanel
              header='Metrics'
              leftIcon='pi pi-chart-bar'
            >
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <h5>Request Statistics</h5>
                  <div className='space-y-2'>
                    <div>
                      Today: {selectedIntegration.metrics.requestsToday}
                    </div>
                    <div>
                      Total: {selectedIntegration.metrics.requestsTotal}
                    </div>
                    <div>
                      Error Rate:{' '}
                      {(selectedIntegration.metrics.errorRate * 100).toFixed(2)}
                      %
                    </div>
                    <div>
                      Avg Response:{' '}
                      {selectedIntegration.metrics.avgResponseTime}ms
                    </div>
                  </div>
                </div>

                <div>
                  <h5>Limits</h5>
                  <div className='space-y-2'>
                    <div>
                      Daily Limit: {selectedIntegration.limits.dailyRequests}
                    </div>
                    <div>
                      Rate Limit: {selectedIntegration.limits.rateLimit}/min
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>
          </TabView>
        )}

        <div className='flex justify-end gap-2 mt-4'>
          <Button
            label='Cancel'
            icon='pi pi-times'
            onClick={() => setShowConfigDialog(false)}
            className='p-button-text'
          />
          <Button
            label='Save'
            icon='pi pi-check'
            onClick={saveIntegration}
          />
        </div>
      </Dialog>

      {/* Test Integration Dialog */}
      <Dialog
        visible={showTestDialog}
        onHide={() => {
          setShowTestDialog(false);
          setTestResults(null);
        }}
        header={`Test ${selectedIntegration?.name}`}
        style={{ width: '50vw' }}
      >
        <div className='space-y-4'>
          <p>Test the connection to {selectedIntegration?.name}</p>

          {testResults && (
            <Card>
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <Tag
                    value={testResults.success ? 'SUCCESS' : 'FAILURE'}
                    severity={testResults.success ? 'success' : 'danger'}
                  />
                  <span>{testResults.message}</span>
                </div>

                {testResults.responseTime && (
                  <div>Response Time: {testResults.responseTime}ms</div>
                )}

                {testResults.statusCode && (
                  <div>Status Code: {testResults.statusCode}</div>
                )}

                {testResults.details && (
                  <pre className='text-sm bg-gray-50 p-3 rounded'>
                    {JSON.stringify(testResults.details, null, 2)}
                  </pre>
                )}
              </div>
            </Card>
          )}
        </div>

        <div className='flex justify-end gap-2 mt-4'>
          <Button
            label='Close'
            icon='pi pi-times'
            onClick={() => {
              setShowTestDialog(false);
              setTestResults(null);
            }}
            className='p-button-text'
          />
          <Button
            label='Test Connection'
            icon='pi pi-play'
            onClick={() => testIntegration(selectedIntegration!)}
            disabled={!selectedIntegration}
          />
        </div>
      </Dialog>
    </div>
  );
};
