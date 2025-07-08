import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { TabPanel, TabView } from 'primereact/tabview';
import React, { useEffect, useState } from 'react';
import { Tour, TourStep } from '../../types';
import { TourPreview } from '../TourPreview';
import { StepEditor } from './StepEditor';
import './TourBuilder.scss';
import { TourSettings as TourSettingsComponent } from './TourSettings';
import { TourTargeting as TourTargetingComponent } from './TourTargeting';
import { TourTriggers } from './TourTriggers';

interface TourBuilderProps {
  tour?: Tour;
  onSave: (tour: Partial<Tour>) => void;
  onCancel: () => void;
}

export const TourBuilder: React.FC<TourBuilderProps> = ({
  tour,
  onSave,
  onCancel,
}) => {
  const [tourData, setTourData] = useState<Partial<Tour>>({
    name: '',
    description: '',
    steps: [],
    trigger: {
      type: 'manual',
    },
    targeting: {
      segments: [],
      includeAnonymous: false,
      excludeCompletedUsers: true,
    },
    settings: {
      theme: {
        primaryColor: '#1976d2',
        textColor: '#333333',
        backgroundColor: '#ffffff',
        overlayColor: '#000000',
        overlayOpacity: 0.5,
        borderRadius: 8,
        zIndex: 9999,
      },
      navigation: {
        showProgressBar: true,
        showStepNumbers: true,
        allowKeyboardNavigation: true,
        showCloseButton: true,
        showSkipButton: true,
      },
      completion: {
        showCompletionMessage: true,
        completionMessage: 'Tour completed!',
        trackCompletion: true,
      },
    },
    ...tour,
  });

  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewStartStep, setPreviewStartStep] = useState(0);

  useEffect(() => {
    if (tour) {
      setTourData(tour);
    }
  }, [tour]);

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const steps = [...(tourData.steps || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < steps.length) {
      [steps[index], steps[newIndex]] = [steps[newIndex], steps[index]];
      setTourData({ ...tourData, steps });
    }
  };

  const handleAddStep = () => {
    const newStep: TourStep = {
      id: `step_${Date.now()}`,
      title: 'New Step',
      content: 'Enter step content here',
      target: '',
      placement: 'bottom',
      actions: [
        { label: 'Next', action: 'next', style: 'primary' },
        { label: 'Skip', action: 'close', style: 'link' },
      ],
    };

    setTourData({
      ...tourData,
      steps: [...(tourData.steps || []), newStep],
    });
    setSelectedStepId(newStep.id);
  };

  const handleUpdateStep = (stepId: string, updates: Partial<TourStep>) => {
    const steps = (tourData.steps || []).map((step) =>
      step.id === stepId ? { ...step, ...updates } : step
    );
    setTourData({ ...tourData, steps });
  };

  const handleDeleteStep = (stepId: string) => {
    const steps = (tourData.steps || []).filter((step) => step.id !== stepId);
    setTourData({ ...tourData, steps });
    if (selectedStepId === stepId) {
      setSelectedStepId(null);
    }
  };

  const handleSave = () => {
    if (isValid()) {
      onSave(tourData);
    }
  };

  const handlePreview = (startStep: number = 0) => {
    setPreviewStartStep(startStep);
    setShowPreview(true);
  };

  const handleDuplicateStep = (stepId: string) => {
    const stepToDuplicate = tourData.steps?.find((s) => s.id === stepId);
    if (stepToDuplicate) {
      const newStep: TourStep = {
        ...stepToDuplicate,
        id: `step_${Date.now()}`,
        title: `${stepToDuplicate.title} (Copy)`,
      };
      const stepIndex = tourData.steps!.findIndex((s) => s.id === stepId);
      const newSteps = [...tourData.steps!];
      newSteps.splice(stepIndex + 1, 0, newStep);
      setTourData({ ...tourData, steps: newSteps });
      setSelectedStepId(newStep.id);
    }
  };

  const isValid = () => {
    return (
      tourData.name &&
      tourData.steps &&
      tourData.steps.length > 0 &&
      tourData.steps.every((step) => step.title && step.content)
    );
  };

  return (
    <div className='tour-builder'>
      <div className='tour-builder-header'>
        <h2>{tour ? 'Edit Tour' : 'Create New Tour'}</h2>
        <div className='tour-builder-actions'>
          <Button
            label='Preview Tour'
            icon='pi pi-eye'
            className='p-button-outlined'
            onClick={() => handlePreview()}
            disabled={!tourData.steps || tourData.steps.length === 0}
          />
          <Button
            label='Cancel'
            className='p-button-text'
            onClick={onCancel}
          />
          <Button
            label='Save Tour'
            icon='pi pi-save'
            onClick={handleSave}
            disabled={!isValid()}
          />
        </div>
      </div>

      <div className='tour-builder-content'>
        <Card className='tour-info-card'>
          <div className='p-fluid'>
            <div className='p-field'>
              <label htmlFor='tour-name'>Tour Name</label>
              <InputText
                id='tour-name'
                value={tourData.name}
                onChange={(e) =>
                  setTourData({ ...tourData, name: e.target.value })
                }
                placeholder='Enter tour name'
              />
            </div>
            <div className='p-field'>
              <label htmlFor='tour-description'>Description</label>
              <InputTextarea
                id='tour-description'
                value={tourData.description}
                onChange={(e) =>
                  setTourData({ ...tourData, description: e.target.value })
                }
                rows={3}
                placeholder='Enter tour description'
              />
            </div>
            <div className='p-field'>
              <label htmlFor='tour-status'>Status</label>
              <Dropdown
                id='tour-status'
                value={tourData.status}
                options={[
                  { label: 'Draft', value: 'draft' },
                  { label: 'Active', value: 'active' },
                  { label: 'Paused', value: 'paused' },
                  { label: 'Archived', value: 'archived' },
                ]}
                onChange={(e) => setTourData({ ...tourData, status: e.value })}
              />
            </div>
          </div>
        </Card>

        <TabView
          activeIndex={activeTab}
          onTabChange={(e) => setActiveTab(e.index)}
        >
          <TabPanel
            header='Steps'
            leftIcon='pi pi-list'
          >
            <div className='tour-steps-container'>
              <div className='steps-list'>
                <div className='steps-list-header'>
                  <h3>Tour Steps</h3>
                  <Button
                    label='Add Step'
                    icon='pi pi-plus'
                    className='p-button-sm'
                    onClick={handleAddStep}
                  />
                </div>

                <div className='steps-list-content'>
                  {(tourData.steps || []).map((step, index) => (
                    <div
                      key={step.id}
                      className={`step-item ${selectedStepId === step.id ? 'selected' : ''}`}
                      onClick={() => setSelectedStepId(step.id)}
                    >
                      <div className='step-item-header'>
                        <span className='step-number'>{index + 1}</span>
                        <span className='step-title'>{step.title}</span>
                        <div className='step-item-actions'>
                          <Button
                            icon='pi pi-arrow-up'
                            className='p-button-text p-button-sm'
                            onClick={(e) => {
                              e.stopPropagation();
                              moveStep(index, 'up');
                            }}
                            disabled={index === 0}
                          />
                          <Button
                            icon='pi pi-arrow-down'
                            className='p-button-text p-button-sm'
                            onClick={(e) => {
                              e.stopPropagation();
                              moveStep(index, 'down');
                            }}
                            disabled={
                              index === (tourData.steps?.length || 0) - 1
                            }
                          />
                          <Button
                            icon='pi pi-copy'
                            className='p-button-text p-button-sm'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateStep(step.id);
                            }}
                            tooltip='Duplicate'
                          />
                          <Button
                            icon='pi pi-eye'
                            className='p-button-text p-button-sm'
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreview(index);
                            }}
                            tooltip='Preview from this step'
                          />
                          <Button
                            icon='pi pi-trash'
                            className='p-button-text p-button-sm p-button-danger'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteStep(step.id);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!tourData.steps || tourData.steps.length === 0) && (
                    <div className='empty-state'>
                      <i className='pi pi-info-circle' />
                      <p>No steps added yet. Click "Add Step" to begin.</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedStepId && (
                <div className='step-editor-container'>
                  {(() => {
                    const selectedStep = tourData.steps?.find(
                      (s) => s.id === selectedStepId
                    );
                    if (!selectedStep) return null;
                    return (
                      <StepEditor
                        step={selectedStep}
                        onChange={(updates) =>
                          handleUpdateStep(selectedStepId, updates)
                        }
                      />
                    );
                  })()}
                </div>
              )}
            </div>
          </TabPanel>

          <TabPanel
            header='Triggers'
            leftIcon='pi pi-bolt'
          >
            <TourTriggers
              trigger={tourData.trigger || { type: 'manual' }}
              onChange={(trigger) => setTourData({ ...tourData, trigger })}
            />
          </TabPanel>

          <TabPanel
            header='Targeting'
            leftIcon='pi pi-users'
          >
            <TourTargetingComponent
              targeting={tourData.targeting!}
              onChange={(targeting) => setTourData({ ...tourData, targeting })}
            />
          </TabPanel>

          <TabPanel
            header='Settings'
            leftIcon='pi pi-cog'
          >
            <TourSettingsComponent
              settings={tourData.settings!}
              onChange={(settings) => setTourData({ ...tourData, settings })}
            />
          </TabPanel>
        </TabView>
      </div>

      <Dialog
        visible={showPreview}
        onHide={() => setShowPreview(false)}
        maximizable
        modal
        style={{ width: '90vw', height: '90vh' }}
        header='Tour Preview'
      >
        {showPreview && tourData.steps && tourData.steps.length > 0 && (
          <TourPreview
            tour={tourData as Tour}
            startStepIndex={previewStartStep}
            onClose={() => setShowPreview(false)}
          />
        )}
      </Dialog>
    </div>
  );
};
