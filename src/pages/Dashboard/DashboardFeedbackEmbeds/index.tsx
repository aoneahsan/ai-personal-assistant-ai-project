import DashboardPageWrapper from '@/components/common/DashboardPageWrapper';
import {
  FeedbackEmbedConfig,
  feedbackEmbedService,
  FeedbackEmbedSubmission,
} from '@/services/feedbackEmbedService';
import { consoleError, consoleLog } from '@/utils/helpers/consoleHelper';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { ProgressSpinner } from 'primereact/progressspinner';
import { TabPanel, TabView } from 'primereact/tabview';
import { ToggleButton } from 'primereact/togglebutton';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import './DashboardFeedbackEmbeds.scss';

interface EmbedForm {
  name: string;
  description: string;
  theme: 'light' | 'dark' | 'auto';
  position:
    | 'bottom-right'
    | 'bottom-left'
    | 'top-right'
    | 'top-left'
    | 'center';
  widgetText: string;
  step1Title: string;
  step1Subtitle: string;
  step2Title: string;
  step2Subtitle: string;
  step3Title: string;
  step3Message: string;
  continueButtonText: string;
  placeholderText: string;
  showStep2: boolean;
  requireMessage: boolean;
  hideAfterSubmit: boolean;
  isActive: boolean;
  domains?: string[];
}

const DashboardFeedbackEmbeds: React.FC = () => {
  const [configs, setConfigs] = useState<FeedbackEmbedConfig[]>([]);
  const [submissions, setSubmissions] = useState<FeedbackEmbedSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showSubmissionsDialog, setShowSubmissionsDialog] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [selectedConfig, setSelectedConfig] =
    useState<FeedbackEmbedConfig | null>(null);
  const [embedCode, setEmbedCode] = useState('');
  const [formData, setFormData] = useState<EmbedForm>({
    name: '',
    description: '',
    theme: 'auto',
    position: 'bottom-right',
    widgetText: 'Share Feedback',
    step1Title: 'How was your experience?',
    step1Subtitle: 'Your rating helps us improve',
    step2Title: 'Tell us more',
    step2Subtitle: 'Share your thoughts with us (optional)',
    step3Title: 'Thank you!',
    step3Message:
      'We appreciate your feedback and will use it to make things better!',
    continueButtonText: 'Continue',
    placeholderText: 'What can we do better? Your thoughts matter to us...',
    showStep2: true,
    requireMessage: false,
    hideAfterSubmit: true,
    isActive: true,
    domains: [],
  });

  const themeOptions = [
    { label: 'Auto (System)', value: 'auto' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ];

  const positionOptions = [
    { label: 'Bottom Right', value: 'bottom-right' },
    { label: 'Bottom Left', value: 'bottom-left' },
    { label: 'Top Right', value: 'top-right' },
    { label: 'Top Left', value: 'top-left' },
    { label: 'Center', value: 'center' },
  ];

  // Load embed configurations
  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const data = await feedbackEmbedService.getUserEmbedConfigs();
      setConfigs(data);
      consoleLog('Loaded feedback embed configs:', data);
    } catch (error) {
      consoleError('Error loading embed configs:', error);
      toast.error('Failed to load feedback embeds');
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async (embedId: string) => {
    try {
      setSubmissionsLoading(true);
      const data = await feedbackEmbedService.getEmbedSubmissions(embedId);
      setSubmissions(data);
      consoleLog('Loaded submissions for embed:', embedId, data);
    } catch (error) {
      consoleError('Error loading submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Please enter a name for your feedback embed');
        return;
      }

      // Create config object - service will handle adding userId, userEmail, etc.
      const config = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
      };

      const configId = await feedbackEmbedService.createEmbedConfig(config);
      toast.success('Feedback embed created successfully!');
      setShowCreateDialog(false);
      resetForm();
      loadConfigs();
      consoleLog('Created embed config:', configId);
    } catch (error) {
      consoleError('Error creating embed config:', error);
      toast.error('Failed to create feedback embed');
    }
  };

  const handleEdit = async () => {
    try {
      if (!selectedConfig || !formData.name.trim()) {
        toast.error('Please enter a name for your feedback embed');
        return;
      }

      await feedbackEmbedService.updateEmbedConfig(selectedConfig.id!, {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
      });

      toast.success('Feedback embed updated successfully!');
      setShowEditDialog(false);
      setSelectedConfig(null);
      resetForm();
      loadConfigs();
    } catch (error) {
      consoleError('Error updating embed config:', error);
      toast.error('Failed to update feedback embed');
    }
  };

  const handleDelete = (config: FeedbackEmbedConfig) => {
    confirmDialog({
      message: `Are you sure you want to delete "${config.name}"? This action cannot be undone.`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await feedbackEmbedService.deleteEmbedConfig(config.id!);
          toast.success('Feedback embed deleted successfully');
          loadConfigs();
        } catch (error) {
          consoleError('Error deleting embed config:', error);
          toast.error('Failed to delete feedback embed');
        }
      },
    });
  };

  const handleViewSubmissions = (config: FeedbackEmbedConfig) => {
    setSelectedConfig(config);
    setShowSubmissionsDialog(true);
    loadSubmissions(config.embedId);
  };

  const handleShowCode = (config: FeedbackEmbedConfig) => {
    const code = feedbackEmbedService.generateEmbedCode(config.embedId, {
      position: config.position,
      theme: config.theme,
      autoShow: false,
    });
    setEmbedCode(code);
    setSelectedConfig(config);
    setShowCodeDialog(true);
  };

  const openEditDialog = (config: FeedbackEmbedConfig) => {
    setSelectedConfig(config);
    setFormData({
      name: config.name,
      description: config.description || '',
      theme: config.theme || 'auto',
      position: config.position || 'bottom-right',
      widgetText: config.widgetText || 'Share Feedback',
      step1Title: config.step1Title || 'How was your experience?',
      step1Subtitle: config.step1Subtitle || 'Your rating helps us improve',
      step2Title: config.step2Title || 'Tell us more',
      step2Subtitle:
        config.step2Subtitle || 'Share your thoughts with us (optional)',
      step3Title: config.step3Title || 'Thank you!',
      step3Message:
        config.step3Message ||
        'We appreciate your feedback and will use it to make things better!',
      continueButtonText: config.continueButtonText || 'Continue',
      placeholderText:
        config.placeholderText ||
        'What can we do better? Your thoughts matter to us...',
      showStep2: config.showStep2 ?? true,
      requireMessage: config.requireMessage ?? false,
      hideAfterSubmit: config.hideAfterSubmit ?? true,
      isActive: config.isActive,
      domains: config.domains || [],
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      theme: 'auto',
      position: 'bottom-right',
      widgetText: 'Share Feedback',
      step1Title: 'How was your experience?',
      step1Subtitle: 'Your rating helps us improve',
      step2Title: 'Tell us more',
      step2Subtitle: 'Share your thoughts with us (optional)',
      step3Title: 'Thank you!',
      step3Message:
        'We appreciate your feedback and will use it to make things better!',
      continueButtonText: 'Continue',
      placeholderText: 'What can we do better? Your thoughts matter to us...',
      showStep2: true,
      requireMessage: false,
      hideAfterSubmit: true,
      isActive: true,
      domains: [],
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  // Table columns
  const nameBodyTemplate = (rowData: FeedbackEmbedConfig) => (
    <div>
      <div className='font-semibold'>{rowData.name}</div>
      {rowData.description && (
        <div className='text-sm text-gray-500 mt-1'>{rowData.description}</div>
      )}
    </div>
  );

  const statusBodyTemplate = (rowData: FeedbackEmbedConfig) => (
    <Badge
      value={rowData.isActive ? 'Active' : 'Inactive'}
      severity={rowData.isActive ? 'success' : 'warning'}
    />
  );

  const analyticsBodyTemplate = (rowData: FeedbackEmbedConfig) => (
    <div className='text-sm'>
      <div>Views: {rowData.totalViews || 0}</div>
      <div>Submissions: {rowData.totalSubmissions || 0}</div>
      {rowData.averageRating ? (
        <div>Avg Rating: {rowData.averageRating.toFixed(1)}/10</div>
      ) : null}
    </div>
  );

  const actionsBodyTemplate = (rowData: FeedbackEmbedConfig) => (
    <div className='flex gap-2'>
      <Button
        icon='pi pi-eye'
        className='p-button-rounded p-button-text p-button-sm'
        onClick={() => handleViewSubmissions(rowData)}
        tooltip='View Submissions'
      />
      <Button
        icon='pi pi-code'
        className='p-button-rounded p-button-text p-button-sm'
        onClick={() => handleShowCode(rowData)}
        tooltip='Get Embed Code'
      />
      <Button
        icon='pi pi-pencil'
        className='p-button-rounded p-button-text p-button-sm'
        onClick={() => openEditDialog(rowData)}
        tooltip='Edit'
      />
      <Button
        icon='pi pi-trash'
        className='p-button-rounded p-button-text p-button-sm p-button-danger'
        onClick={() => handleDelete(rowData)}
        tooltip='Delete'
      />
    </div>
  );

  // Submissions table columns
  const ratingBodyTemplate = (rowData: FeedbackEmbedSubmission) => (
    <div className='flex align-items-center gap-2'>
      <span>{rowData.emoji}</span>
      <span>{rowData.rating}/10</span>
    </div>
  );

  const messageBodyTemplate = (rowData: FeedbackEmbedSubmission) => (
    <div className='max-w-300 white-space-nowrap overflow-hidden text-overflow-ellipsis'>
      {rowData.message || <span className='text-gray-400'>No message</span>}
    </div>
  );

  const dateBodyTemplate = (rowData: FeedbackEmbedSubmission) => (
    <div className='text-sm'>
      {new Date(rowData.createdAt).toLocaleDateString()}
      <br />
      {new Date(rowData.createdAt).toLocaleTimeString()}
    </div>
  );

  const sourceBodyTemplate = (rowData: FeedbackEmbedSubmission) => (
    <div className='text-sm'>
      <div
        className='font-semibold truncate'
        style={{ maxWidth: '200px' }}
      >
        {new URL(rowData.websiteUrl).hostname}
      </div>
      <div
        className='text-gray-500 truncate'
        style={{ maxWidth: '200px' }}
      >
        {rowData.websiteUrl}
      </div>
    </div>
  );

  if (loading) {
    return (
      <DashboardPageWrapper title='Feedback Embeds'>
        <div className='mb-4'>
          <p className='text-gray-600'>
            Create and manage feedback widgets for your websites
          </p>
        </div>
        <div className='flex justify-center items-center h-64'>
          <ProgressSpinner />
        </div>
      </DashboardPageWrapper>
    );
  }

  return (
    <DashboardPageWrapper
      title='Feedback Embeds'
      actions={
        <Button
          label='Create New Embed'
          icon='pi pi-plus'
          onClick={() => setShowCreateDialog(true)}
        />
      }
    >
      <div className='mb-4'>
        <p className='text-gray-600'>
          Create and manage feedback widgets for your websites
        </p>
      </div>
      <div className='feedback-embeds-dashboard'>
        {configs.length === 0 ? (
          <Card className='text-center p-6'>
            <div className='text-6xl mb-4'>📝</div>
            <h3 className='text-xl font-semibold mb-2'>
              No Feedback Embeds Yet
            </h3>
            <p className='text-gray-600 mb-4'>
              Create your first feedback embed to start collecting user feedback
              on your websites.
            </p>
            <Button
              label='Create Your First Embed'
              icon='pi pi-plus'
              onClick={() => setShowCreateDialog(true)}
            />
          </Card>
        ) : (
          <Card>
            <DataTable
              value={configs}
              responsiveLayout='scroll'
              paginator
              rows={10}
              className='p-datatable-sm'
            >
              <Column
                field='name'
                header='Name'
                body={nameBodyTemplate}
                style={{ minWidth: '200px' }}
              />
              <Column
                field='isActive'
                header='Status'
                body={statusBodyTemplate}
                style={{ minWidth: '100px' }}
              />
              <Column
                header='Analytics'
                body={analyticsBodyTemplate}
                style={{ minWidth: '120px' }}
              />
              <Column
                field='createdAt'
                header='Created'
                body={(rowData) =>
                  new Date(rowData.createdAt).toLocaleDateString()
                }
                style={{ minWidth: '120px' }}
              />
              <Column
                header='Actions'
                body={actionsBodyTemplate}
                style={{ minWidth: '180px' }}
              />
            </DataTable>
          </Card>
        )}

        {/* Create/Edit Dialog */}
        <Dialog
          header={
            selectedConfig ? 'Edit Feedback Embed' : 'Create Feedback Embed'
          }
          visible={showCreateDialog || showEditDialog}
          onHide={() => {
            setShowCreateDialog(false);
            setShowEditDialog(false);
            setSelectedConfig(null);
            resetForm();
          }}
          style={{ width: '650px' }}
          modal
        >
          <TabView>
            <TabPanel header='Basic Settings'>
              <div className='grid formgrid p-fluid'>
                <div className='field col-12'>
                  <label htmlFor='name'>Name *</label>
                  <InputText
                    id='name'
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder='My Website Feedback'
                  />
                </div>

                <div className='field col-12'>
                  <label htmlFor='description'>Description</label>
                  <InputTextarea
                    id='description'
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder='Feedback widget for the main website'
                    rows={2}
                  />
                </div>

                <div className='field col-6'>
                  <label htmlFor='theme'>Theme</label>
                  <Dropdown
                    id='theme'
                    value={formData.theme}
                    options={themeOptions}
                    onChange={(e) =>
                      setFormData({ ...formData, theme: e.value })
                    }
                  />
                </div>

                <div className='field col-6'>
                  <label htmlFor='position'>Position</label>
                  <Dropdown
                    id='position'
                    value={formData.position}
                    options={positionOptions}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.value })
                    }
                  />
                </div>

                <div className='field col-12'>
                  <label htmlFor='widgetText'>Widget Button Text</label>
                  <InputText
                    id='widgetText'
                    value={formData.widgetText}
                    onChange={(e) =>
                      setFormData({ ...formData, widgetText: e.target.value })
                    }
                  />
                </div>
              </div>
            </TabPanel>

            <TabPanel header='Content'>
              <div className='grid formgrid p-fluid'>
                <div className='field col-6'>
                  <label htmlFor='step1Title'>Step 1 Title</label>
                  <InputText
                    id='step1Title'
                    value={formData.step1Title}
                    onChange={(e) =>
                      setFormData({ ...formData, step1Title: e.target.value })
                    }
                  />
                </div>

                <div className='field col-6'>
                  <label htmlFor='step1Subtitle'>Step 1 Subtitle</label>
                  <InputText
                    id='step1Subtitle'
                    value={formData.step1Subtitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        step1Subtitle: e.target.value,
                      })
                    }
                  />
                </div>

                <div className='field col-6'>
                  <label htmlFor='step2Title'>Step 2 Title</label>
                  <InputText
                    id='step2Title'
                    value={formData.step2Title}
                    onChange={(e) =>
                      setFormData({ ...formData, step2Title: e.target.value })
                    }
                  />
                </div>

                <div className='field col-6'>
                  <label htmlFor='step2Subtitle'>Step 2 Subtitle</label>
                  <InputText
                    id='step2Subtitle'
                    value={formData.step2Subtitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        step2Subtitle: e.target.value,
                      })
                    }
                  />
                </div>

                <div className='field col-6'>
                  <label htmlFor='step3Title'>Thank You Title</label>
                  <InputText
                    id='step3Title'
                    value={formData.step3Title}
                    onChange={(e) =>
                      setFormData({ ...formData, step3Title: e.target.value })
                    }
                  />
                </div>

                <div className='field col-6'>
                  <label htmlFor='continueButtonText'>
                    Continue Button Text
                  </label>
                  <InputText
                    id='continueButtonText'
                    value={formData.continueButtonText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        continueButtonText: e.target.value,
                      })
                    }
                  />
                </div>

                <div className='field col-12'>
                  <label htmlFor='step3Message'>Thank You Message</label>
                  <InputTextarea
                    id='step3Message'
                    value={formData.step3Message}
                    onChange={(e) =>
                      setFormData({ ...formData, step3Message: e.target.value })
                    }
                    rows={2}
                  />
                </div>

                <div className='field col-12'>
                  <label htmlFor='placeholderText'>Message Placeholder</label>
                  <InputTextarea
                    id='placeholderText'
                    value={formData.placeholderText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        placeholderText: e.target.value,
                      })
                    }
                    rows={2}
                  />
                </div>
              </div>
            </TabPanel>

            <TabPanel header='Behavior'>
              <div className='grid formgrid p-fluid'>
                <div className='field col-12'>
                  <div className='flex align-items-center'>
                    <ToggleButton
                      checked={formData.showStep2}
                      onChange={(e) =>
                        setFormData({ ...formData, showStep2: e.value })
                      }
                      onLabel='Message step enabled'
                      offLabel='Skip message step'
                    />
                  </div>
                  <small className='text-gray-600'>
                    Whether to show the text feedback step or skip directly to
                    submission
                  </small>
                </div>

                <div className='field col-12'>
                  <div className='flex align-items-center'>
                    <ToggleButton
                      checked={formData.requireMessage}
                      onChange={(e) =>
                        setFormData({ ...formData, requireMessage: e.value })
                      }
                      onLabel='Message required'
                      offLabel='Message optional'
                    />
                  </div>
                  <small className='text-gray-600'>
                    Whether users must provide a text message
                  </small>
                </div>

                <div className='field col-12'>
                  <div className='flex align-items-center'>
                    <ToggleButton
                      checked={formData.hideAfterSubmit}
                      onChange={(e) =>
                        setFormData({ ...formData, hideAfterSubmit: e.value })
                      }
                      onLabel='Hide after submit'
                      offLabel='Keep visible after submit'
                    />
                  </div>
                  <small className='text-gray-600'>
                    Whether to hide the widget after successful submission
                  </small>
                </div>

                <div className='field col-12'>
                  <div className='flex align-items-center'>
                    <ToggleButton
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.value })
                      }
                      onLabel='Active'
                      offLabel='Inactive'
                    />
                  </div>
                  <small className='text-gray-600'>
                    Whether this embed is currently active and accepting
                    feedback
                  </small>
                </div>
              </div>
            </TabPanel>
          </TabView>

          <div className='flex justify-end gap-2 mt-4'>
            <Button
              label='Cancel'
              icon='pi pi-times'
              className='p-button-text'
              onClick={() => {
                setShowCreateDialog(false);
                setShowEditDialog(false);
                setSelectedConfig(null);
                resetForm();
              }}
            />
            <Button
              label={selectedConfig ? 'Update' : 'Create'}
              icon='pi pi-check'
              onClick={selectedConfig ? handleEdit : handleCreate}
            />
          </div>
        </Dialog>

        {/* Embed Code Dialog */}
        <Dialog
          header='Embed Code'
          visible={showCodeDialog}
          onHide={() => setShowCodeDialog(false)}
          style={{ width: '600px' }}
          modal
        >
          <div className='mb-3'>
            <p className='text-gray-600 mb-3'>
              Copy this code and paste it into your website's HTML to embed the
              feedback widget:
            </p>
            <div className='p-3 bg-gray-100 border-round'>
              <pre
                className='text-sm overflow-auto'
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {embedCode}
              </pre>
            </div>
            <div className='flex justify-end mt-3'>
              <Button
                label='Copy Code'
                icon='pi pi-copy'
                onClick={() => copyToClipboard(embedCode)}
              />
            </div>
          </div>
        </Dialog>

        {/* Submissions Dialog */}
        <Dialog
          header={`Feedback Submissions - ${selectedConfig?.name}`}
          visible={showSubmissionsDialog}
          onHide={() => setShowSubmissionsDialog(false)}
          style={{ width: '90vw', height: '80vh' }}
          maximizable
          modal
        >
          {submissionsLoading ? (
            <div className='flex justify-center items-center h-64'>
              <ProgressSpinner />
            </div>
          ) : submissions.length === 0 ? (
            <div className='text-center p-6'>
              <div className='text-4xl mb-3'>📭</div>
              <h3 className='text-lg font-semibold mb-2'>No Submissions Yet</h3>
              <p className='text-gray-600'>
                Once users start providing feedback, their responses will appear
                here.
              </p>
            </div>
          ) : (
            <DataTable
              value={submissions}
              responsiveLayout='scroll'
              paginator
              rows={25}
              className='p-datatable-sm'
            >
              <Column
                header='Rating'
                body={ratingBodyTemplate}
                style={{ minWidth: '100px' }}
              />
              <Column
                header='Message'
                body={messageBodyTemplate}
                style={{ minWidth: '200px' }}
              />
              <Column
                header='Source'
                body={sourceBodyTemplate}
                style={{ minWidth: '200px' }}
              />
              <Column
                header='Date'
                body={dateBodyTemplate}
                style={{ minWidth: '140px' }}
              />
            </DataTable>
          )}
        </Dialog>

        <ConfirmDialog />
      </div>
    </DashboardPageWrapper>
  );
};

export default DashboardFeedbackEmbeds;
