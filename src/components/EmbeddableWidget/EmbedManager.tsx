import { EmbedConfig, embedService } from '@/services/embedService';
import { consoleError } from '@/utils/helpers/consoleHelper';
import { useUserDataZState } from '@/zustandStates/userState';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Chip } from 'primereact/chip';
import { ColorPicker } from 'primereact/colorpicker';
import { Column } from 'primereact/column';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Panel } from 'primereact/panel';
import { TabPanel, TabView } from 'primereact/tabview';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FaCopy, FaEdit, FaEye, FaPlus, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './EmbedManager.scss';

interface EmbedManagerProps {
  visible: boolean;
  onHide: () => void;
}

interface EmbedFormData {
  title: string;
  description: string;
  allowedDomains: string[];
  style: EmbedConfig['style'];
  behavior: EmbedConfig['behavior'];
}

type DateType =
  | Date
  | { toDate: () => Date }
  | string
  | number
  | null
  | undefined;

const EmbedManager: React.FC<EmbedManagerProps> = ({ visible, onHide }) => {
  const currentUser = useUserDataZState((state) => state.data);
  const [embeds, setEmbeds] = useState<EmbedConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedEmbed, setSelectedEmbed] = useState<EmbedConfig | null>(null);
  const [formData, setFormData] = useState<EmbedFormData>({
    title: '',
    description: '',
    allowedDomains: [],
    style: {
      primaryColor: '#3b82f6',
      secondaryColor: '#f8fafc',
      textColor: '#1f2937',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      position: 'bottom-right',
      width: '350px',
      height: '500px',
    },
    behavior: {
      autoOpen: false,
      showOnlineStatus: true,
      enableFileUpload: true,
      enableAudioMessages: true,
      enableVideoMessages: true,
      maxFileSize: 10,
      welcomeMessage: 'Hi! How can I help you today?',
    },
  });
  const [domainInput, setDomainInput] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const toastRef = useRef<Toast>(null);

  const positionOptions = [
    { label: 'Bottom Right', value: 'bottom-right' },
    { label: 'Bottom Left', value: 'bottom-left' },
    { label: 'Top Right', value: 'top-right' },
    { label: 'Top Left', value: 'top-left' },
  ];

  const loadEmbeds = useCallback(async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const userEmbeds = await embedService.getUserEmbedConfigs(
        currentUser.id!
      );
      setEmbeds(userEmbeds);
    } catch (error) {
      consoleError('Error loading embeds:', error);
      toast.error('Failed to load embeds');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (visible && currentUser) {
      loadEmbeds();
    }
  }, [visible, currentUser, loadEmbeds]);

  const handleCreateEmbed = async () => {
    if (!currentUser) return;

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (formData.allowedDomains.length === 0) {
      toast.error('At least one domain is required');
      return;
    }

    setLoading(true);
    try {
      const newEmbed = await embedService.createEmbedConfig(
        currentUser.id!,
        currentUser.email!,
        formData.title,
        formData.allowedDomains,
        {
          description: formData.description,
          style: formData.style,
          behavior: formData.behavior,
        }
      );

      setEmbeds([newEmbed, ...embeds]);
      setShowCreateDialog(false);
      resetForm();
      toast.success('Embed created successfully!');
    } catch (error) {
      consoleError('Error creating embed:', error);
      toast.error('Failed to create embed');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmbed = async () => {
    if (!selectedEmbed) return;

    setLoading(true);
    try {
      await embedService.updateEmbedConfig(selectedEmbed.id!, {
        title: formData.title,
        description: formData.description,
        allowedDomains: formData.allowedDomains,
        style: formData.style,
        behavior: formData.behavior,
      });

      await loadEmbeds();
      setShowEditDialog(false);
      resetForm();
      toast.success('Embed updated successfully!');
    } catch (error) {
      consoleError('Error updating embed:', error);
      toast.error('Failed to update embed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmbed = (embed: EmbedConfig) => {
    confirmDialog({
      message: `Are you sure you want to delete "${embed.title}"? This will disable the embed on all websites.`,
      header: 'Delete Embed',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await embedService.deleteEmbedConfig(embed.id!);
          await loadEmbeds();
          toast.success('Embed deleted successfully!');
        } catch (error) {
          consoleError('Error deleting embed:', error);
          toast.error('Failed to delete embed');
        }
      },
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      allowedDomains: [],
      style: {
        primaryColor: '#3b82f6',
        secondaryColor: '#f8fafc',
        textColor: '#1f2937',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        position: 'bottom-right',
        width: '350px',
        height: '500px',
      },
      behavior: {
        autoOpen: false,
        showOnlineStatus: true,
        enableFileUpload: true,
        enableAudioMessages: true,
        enableVideoMessages: true,
        maxFileSize: 10,
        welcomeMessage: 'Hi! How can I help you today?',
      },
    });
    setDomainInput('');
    setActiveTab(0);
  };

  const openCreateDialog = () => {
    resetForm();
    setShowCreateDialog(true);
  };

  const openEditDialog = (embed: EmbedConfig) => {
    setSelectedEmbed(embed);
    setFormData({
      title: embed.title,
      description: embed.description || '',
      allowedDomains: embed.allowedDomains,
      style: embed.style || formData.style,
      behavior: embed.behavior || formData.behavior,
    });
    setShowEditDialog(true);
  };

  const openPreviewDialog = (embed: EmbedConfig) => {
    setSelectedEmbed(embed);
    setShowPreviewDialog(true);
  };

  const copyEmbedCode = (embedCode: string) => {
    navigator.clipboard.writeText(embedCode);
    toast.success('Embed code copied to clipboard!');
  };

  const addDomain = () => {
    if (
      domainInput.trim() &&
      !formData.allowedDomains.includes(domainInput.trim())
    ) {
      setFormData({
        ...formData,
        allowedDomains: [...formData.allowedDomains, domainInput.trim()],
      });
      setDomainInput('');
    }
  };

  const removeDomain = (domain: string) => {
    setFormData({
      ...formData,
      allowedDomains: formData.allowedDomains.filter((d) => d !== domain),
    });
  };

  const formatDate = (date: DateType): string => {
    if (!date) return 'N/A';
    let d: Date;
    if (typeof date === 'object' && date !== null && 'toDate' in date) {
      d = date.toDate();
    } else if (date instanceof Date) {
      d = date;
    } else {
      d = new Date(date);
    }
    return d.toLocaleDateString();
  };

  const statusBodyTemplate = (embed: EmbedConfig) => {
    return (
      <Tag
        severity={embed.isActive ? 'success' : 'danger'}
        value={embed.isActive ? 'Active' : 'Inactive'}
      />
    );
  };

  const domainsBodyTemplate = (embed: EmbedConfig) => {
    return (
      <div className='domains-list'>
        {embed.allowedDomains.slice(0, 2).map((domain, index) => (
          <Chip
            key={index}
            label={domain}
            className='domain-chip'
          />
        ))}
        {embed.allowedDomains.length > 2 && (
          <Chip
            label={`+${embed.allowedDomains.length - 2} more`}
            className='domain-chip'
          />
        )}
      </div>
    );
  };

  const actionsBodyTemplate = (embed: EmbedConfig) => {
    return (
      <div className='actions-buttons'>
        <Button
          icon={<FaEye />}
          className='p-button-text'
          tooltip='Preview'
          onClick={() => openPreviewDialog(embed)}
        />
        <Button
          icon={<FaEdit />}
          className='p-button-text'
          tooltip='Edit'
          onClick={() => openEditDialog(embed)}
        />
        <Button
          icon={<FaCopy />}
          className='p-button-text'
          tooltip='Copy Code'
          onClick={() => copyEmbedCode(embed.embedCode)}
        />
        <Button
          icon={<FaTrash />}
          className='p-button-text p-button-danger'
          tooltip='Delete'
          onClick={() => handleDeleteEmbed(embed)}
        />
      </div>
    );
  };

  const renderFormTabs = () => (
    <TabView
      activeIndex={activeTab}
      onTabChange={(e) => setActiveTab(e.index)}
    >
      <TabPanel header='Basic Info'>
        <div className='form-grid'>
          <div className='form-field'>
            <label htmlFor='title'>Title *</label>
            <InputText
              id='title'
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder='e.g., Customer Support Chat'
            />
          </div>

          <div className='form-field'>
            <label htmlFor='description'>Description</label>
            <InputTextarea
              id='description'
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder='Brief description of this embed'
              rows={3}
            />
          </div>

          <div className='form-field'>
            <label>Allowed Domains *</label>
            <div className='domain-input-group'>
              <InputText
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder='example.com'
                onKeyPress={(e) => e.key === 'Enter' && addDomain()}
              />
              <Button
                label='Add'
                onClick={addDomain}
                disabled={!domainInput.trim()}
              />
            </div>
            <div className='domains-list'>
              {formData.allowedDomains.map((domain, index) => (
                <Chip
                  key={index}
                  label={domain}
                  removable
                  onRemove={() => {
                    removeDomain(domain);
                    return true;
                  }}
                  className='domain-chip'
                />
              ))}
            </div>
          </div>
        </div>
      </TabPanel>

      <TabPanel header='Appearance'>
        <div className='form-grid'>
          <div className='form-field'>
            <label>Primary Color</label>
            <ColorPicker
              value={formData.style?.primaryColor}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  style: { ...formData.style, primaryColor: `#${e.value}` },
                })
              }
            />
          </div>

          <div className='form-field'>
            <label>Background Color</label>
            <ColorPicker
              value={formData.style?.backgroundColor}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  style: { ...formData.style, backgroundColor: `#${e.value}` },
                })
              }
            />
          </div>

          <div className='form-field'>
            <label>Position</label>
            <Dropdown
              value={formData.style?.position}
              options={positionOptions}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  style: { ...formData.style, position: e.value },
                })
              }
            />
          </div>

          <div className='form-field'>
            <label>Width</label>
            <InputText
              value={formData.style?.width}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  style: { ...formData.style, width: e.target.value },
                })
              }
              placeholder='350px'
            />
          </div>

          <div className='form-field'>
            <label>Height</label>
            <InputText
              value={formData.style?.height}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  style: { ...formData.style, height: e.target.value },
                })
              }
              placeholder='500px'
            />
          </div>
        </div>
      </TabPanel>

      <TabPanel header='Behavior'>
        <div className='form-grid'>
          <div className='form-field'>
            <label>Welcome Message</label>
            <InputTextarea
              value={formData.behavior?.welcomeMessage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  behavior: {
                    ...formData.behavior,
                    welcomeMessage: e.target.value,
                  },
                })
              }
              placeholder='Hi! How can I help you today?'
              rows={3}
            />
          </div>

          <div className='form-field'>
            <label>Max File Size (MB)</label>
            <InputNumber
              value={formData.behavior?.maxFileSize}
              onValueChange={(e) =>
                setFormData({
                  ...formData,
                  behavior: {
                    ...formData.behavior,
                    maxFileSize: e.value || 10,
                  },
                })
              }
              min={1}
              max={100}
            />
          </div>

          <div className='form-field-switch'>
            <InputSwitch
              checked={formData.behavior?.autoOpen ?? false}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  behavior: { ...formData.behavior, autoOpen: e.value },
                })
              }
            />
            <label>Auto-open widget</label>
          </div>

          <div className='form-field-switch'>
            <InputSwitch
              checked={formData.behavior?.showOnlineStatus ?? false}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  behavior: { ...formData.behavior, showOnlineStatus: e.value },
                })
              }
            />
            <label>Show online status</label>
          </div>

          <div className='form-field-switch'>
            <InputSwitch
              checked={formData.behavior?.enableFileUpload ?? false}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  behavior: { ...formData.behavior, enableFileUpload: e.value },
                })
              }
            />
            <label>Enable file upload</label>
          </div>

          <div className='form-field-switch'>
            <InputSwitch
              checked={formData.behavior?.enableAudioMessages ?? false}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  behavior: {
                    ...formData.behavior,
                    enableAudioMessages: e.value,
                  },
                })
              }
            />
            <label>Enable audio messages</label>
          </div>

          <div className='form-field-switch'>
            <InputSwitch
              checked={formData.behavior?.enableVideoMessages ?? false}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  behavior: {
                    ...formData.behavior,
                    enableVideoMessages: e.value,
                  },
                })
              }
            />
            <label>Enable video messages</label>
          </div>
        </div>
      </TabPanel>
    </TabView>
  );

  return (
    <>
      <Dialog
        visible={visible}
        onHide={onHide}
        header='Embed Manager'
        style={{ width: '90vw', maxWidth: '1200px' }}
        className='embed-manager-dialog'
        maximizable
      >
        <div className='embed-manager-content'>
          <div className='embed-manager-header'>
            <h3>Manage Your Chat Embeds</h3>
            <Button
              icon={<FaPlus />}
              label='Create New Embed'
              onClick={openCreateDialog}
              className='p-button-primary'
            />
          </div>

          <Card className='embeds-table-card'>
            <DataTable
              value={embeds}
              loading={loading}
              emptyMessage='No embeds found. Create your first embed to get started!'
              paginator
              rows={10}
              className='embeds-table'
            >
              <Column
                field='title'
                header='Title'
                sortable
              />
              <Column
                field='description'
                header='Description'
              />
              <Column
                field='isActive'
                header='Status'
                body={statusBodyTemplate}
                sortable
              />
              <Column
                field='allowedDomains'
                header='Domains'
                body={domainsBodyTemplate}
              />
              <Column
                field='createdAt'
                header='Created'
                body={(embed) => formatDate(embed.createdAt)}
                sortable
              />
              <Column
                body={actionsBodyTemplate}
                header='Actions'
                style={{ width: '180px' }}
              />
            </DataTable>
          </Card>
        </div>
      </Dialog>

      {/* Create Embed Dialog */}
      <Dialog
        visible={showCreateDialog}
        onHide={() => setShowCreateDialog(false)}
        header='Create New Embed'
        style={{ width: '800px' }}
        className='embed-form-dialog'
      >
        {renderFormTabs()}
        <Divider />
        <div className='dialog-footer'>
          <Button
            label='Cancel'
            className='p-button-text'
            onClick={() => setShowCreateDialog(false)}
          />
          <Button
            label='Create Embed'
            onClick={handleCreateEmbed}
            loading={loading}
            className='p-button-primary'
          />
        </div>
      </Dialog>

      {/* Edit Embed Dialog */}
      <Dialog
        visible={showEditDialog}
        onHide={() => setShowEditDialog(false)}
        header='Edit Embed'
        style={{ width: '800px' }}
        className='embed-form-dialog'
      >
        {renderFormTabs()}
        <Divider />
        <div className='dialog-footer'>
          <Button
            label='Cancel'
            className='p-button-text'
            onClick={() => setShowEditDialog(false)}
          />
          <Button
            label='Update Embed'
            onClick={handleEditEmbed}
            loading={loading}
            className='p-button-primary'
          />
        </div>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        visible={showPreviewDialog}
        onHide={() => setShowPreviewDialog(false)}
        header='Embed Preview & Code'
        style={{ width: '900px' }}
        className='embed-preview-dialog'
      >
        {selectedEmbed && (
          <div className='embed-preview-content'>
            <Panel
              header='Embed Code'
              className='embed-code-panel'
            >
              <div className='embed-code-container'>
                <pre className='embed-code'>{selectedEmbed.embedCode}</pre>
                <Button
                  icon={<FaCopy />}
                  label='Copy Code'
                  onClick={() => copyEmbedCode(selectedEmbed.embedCode)}
                  className='copy-button'
                />
              </div>
            </Panel>

            <Panel
              header='Configuration'
              className='embed-config-panel'
            >
              <div className='config-grid'>
                <div className='config-item'>
                  <strong>Title:</strong> {selectedEmbed.title}
                </div>
                <div className='config-item'>
                  <strong>Domains:</strong>{' '}
                  {selectedEmbed.allowedDomains.join(', ')}
                </div>
                <div className='config-item'>
                  <strong>Position:</strong> {selectedEmbed.style?.position}
                </div>
                <div className='config-item'>
                  <strong>Size:</strong> {selectedEmbed.style?.width} ×{' '}
                  {selectedEmbed.style?.height}
                </div>
                <div className='config-item'>
                  <strong>Auto-open:</strong>{' '}
                  {selectedEmbed.behavior?.autoOpen ? 'Yes' : 'No'}
                </div>
                <div className='config-item'>
                  <strong>Welcome Message:</strong>{' '}
                  {selectedEmbed.behavior?.welcomeMessage}
                </div>
              </div>
            </Panel>
          </div>
        )}
      </Dialog>

      <ConfirmDialog />
      <Toast ref={toastRef} />
    </>
  );
};

export default EmbedManager;
