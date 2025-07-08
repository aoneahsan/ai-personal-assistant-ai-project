import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { TabPanel, TabView } from 'primereact/tabview';
import React, { useState } from 'react';
import { TourAction, TourStep } from '../../types';
import { ElementSelector } from './ElementSelector';
import { RichTextEditor } from './RichTextEditor';
import './StepEditor.scss';

interface StepEditorProps {
  step: TourStep;
  onChange: (updates: Partial<TourStep>) => void;
}

export const StepEditor: React.FC<StepEditorProps> = ({ step, onChange }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [useRichText, setUseRichText] = useState(false);
  const placementOptions = [
    { label: 'Top', value: 'top' },
    { label: 'Bottom', value: 'bottom' },
    { label: 'Left', value: 'left' },
    { label: 'Right', value: 'right' },
    { label: 'Center', value: 'center' },
  ];

  const handleActionChange = (index: number, updates: Partial<TourAction>) => {
    const actions = [...(step.actions || [])];
    actions[index] = { ...actions[index], ...updates };
    onChange({ actions });
  };

  const handleAddAction = () => {
    const newAction: TourAction = {
      label: 'New Action',
      action: 'next',
      style: 'secondary',
    };
    onChange({ actions: [...(step.actions || []), newAction] });
  };

  const handleRemoveAction = (index: number) => {
    const actions = [...(step.actions || [])];
    actions.splice(index, 1);
    onChange({ actions });
  };

  return (
    <div className='step-editor'>
      <div className='step-editor-header'>
        <h3>Edit Step</h3>
      </div>

      <div className='step-editor-content'>
        <TabView
          activeIndex={activeTab}
          onTabChange={(e) => setActiveTab(e.index)}
        >
          <TabPanel
            header='Content'
            leftIcon='pi pi-file-edit'
          >
            <div className='p-fluid'>
              <div className='p-field'>
                <label htmlFor='step-title'>Title</label>
                <InputText
                  id='step-title'
                  value={step.title}
                  onChange={(e) => onChange({ title: e.target.value })}
                  placeholder='Enter step title'
                />
              </div>

              <div className='p-field'>
                <div className='content-editor-header'>
                  <label htmlFor='step-content'>Content</label>
                  <Checkbox
                    inputId='use-rich-text'
                    checked={useRichText}
                    onChange={(e) => setUseRichText(e.checked)}
                  />
                  <label
                    htmlFor='use-rich-text'
                    className='rich-text-toggle'
                  >
                    Use Rich Text Editor
                  </label>
                </div>
                {useRichText ? (
                  <RichTextEditor
                    value={step.content}
                    onChange={(value) => onChange({ content: value })}
                    placeholder='Enter step content with formatting...'
                    height='250px'
                  />
                ) : (
                  <InputTextarea
                    id='step-content'
                    value={step.content}
                    onChange={(e) => onChange({ content: e.target.value })}
                    rows={6}
                    placeholder='Enter step content'
                  />
                )}
              </div>
            </div>
          </TabPanel>

          <TabPanel
            header='Targeting'
            leftIcon='pi pi-crosshairs'
          >
            <div className='p-fluid'>
              <div className='p-field'>
                <label>Target Element</label>
                <ElementSelector
                  currentSelector={step.target}
                  onSelect={(selector) => onChange({ target: selector })}
                />
                <small className='p-text-secondary mt-2'>
                  Select an element on the page or enter a CSS selector. Leave
                  empty for centered modal.
                </small>
              </div>

              <div className='p-grid'>
                <div className='p-col-6'>
                  <div className='p-field'>
                    <label htmlFor='step-placement'>Placement</label>
                    <Dropdown
                      id='step-placement'
                      value={step.placement}
                      options={placementOptions}
                      onChange={(e) => onChange({ placement: e.value })}
                    />
                  </div>
                </div>

                <div className='p-col-6'>
                  <div className='p-field'>
                    <label htmlFor='step-delay'>Delay (ms)</label>
                    <InputNumber
                      id='step-delay'
                      value={step.delay || 0}
                      onChange={(e) => onChange({ delay: e.value || 0 })}
                      min={0}
                      step={100}
                    />
                  </div>
                </div>
              </div>

              <div className='spotlight-settings'>
                <h4>Spotlight Settings</h4>
                <div className='p-grid'>
                  <div className='p-col-6'>
                    <div className='p-field'>
                      <label htmlFor='spotlight-radius'>Radius</label>
                      <InputNumber
                        id='spotlight-radius'
                        value={step.spotlightRadius || 0}
                        onChange={(e) =>
                          onChange({ spotlightRadius: e.value || 0 })
                        }
                        min={0}
                        suffix=' px'
                      />
                    </div>
                  </div>
                  <div className='p-col-6'>
                    <div className='p-field'>
                      <label htmlFor='spotlight-padding'>Padding</label>
                      <InputNumber
                        id='spotlight-padding'
                        value={step.spotlightPadding || 10}
                        onChange={(e) =>
                          onChange({ spotlightPadding: e.value || 0 })
                        }
                        min={0}
                        suffix=' px'
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          <TabPanel
            header='Actions'
            leftIcon='pi pi-directions'
          >
            <div className='p-fluid'>
              <div className='p-field'>
                <div className='p-field-checkbox'>
                  <Checkbox
                    inputId='step-skipable'
                    checked={step.skipable || false}
                    onChange={(e) => onChange({ skipable: e.checked })}
                  />
                  <label htmlFor='step-skipable'>
                    Allow users to skip this step
                  </label>
                </div>
              </div>

              <div className='step-actions-section'>
                <div className='section-header'>
                  <h4>Step Actions</h4>
                  <Button
                    icon='pi pi-plus'
                    className='p-button-sm p-button-text'
                    onClick={handleAddAction}
                    tooltip='Add new action button'
                  />
                </div>

                {(step.actions || []).map((action, index) => (
                  <div
                    key={index}
                    className='action-item'
                  >
                    <div className='p-grid'>
                      <div className='p-col-4'>
                        <label>Label</label>
                        <InputText
                          value={action.label}
                          onChange={(e) =>
                            handleActionChange(index, { label: e.target.value })
                          }
                          placeholder='Button label'
                        />
                      </div>
                      <div className='p-col-3'>
                        <label>Action Type</label>
                        <Dropdown
                          value={action.action}
                          options={[
                            { label: 'Next Step', value: 'next' },
                            { label: 'Previous Step', value: 'previous' },
                            { label: 'Close Tour', value: 'close' },
                            { label: 'Custom Action', value: 'custom' },
                          ]}
                          onChange={(e) =>
                            handleActionChange(index, { action: e.value })
                          }
                        />
                      </div>
                      <div className='p-col-3'>
                        <label>Button Style</label>
                        <Dropdown
                          value={action.style}
                          options={[
                            { label: 'Primary', value: 'primary' },
                            { label: 'Secondary', value: 'secondary' },
                            { label: 'Text Link', value: 'link' },
                          ]}
                          onChange={(e) =>
                            handleActionChange(index, { style: e.value })
                          }
                        />
                      </div>
                      <div className='p-col-2'>
                        <label>&nbsp;</label>
                        <Button
                          icon='pi pi-trash'
                          className='p-button-text p-button-danger action-delete-btn'
                          onClick={() => handleRemoveAction(index)}
                          tooltip='Remove action'
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabPanel>

          <TabPanel
            header='Styling'
            leftIcon='pi pi-palette'
          >
            <div className='p-fluid'>
              <div className='p-field'>
                <label>Custom Styles (Advanced)</label>
                <InputTextarea
                  value={
                    step.customStyles
                      ? JSON.stringify(step.customStyles, null, 2)
                      : ''
                  }
                  onChange={(e) => {
                    try {
                      const styles = e.target.value
                        ? JSON.parse(e.target.value)
                        : undefined;
                      onChange({ customStyles: styles });
                    } catch (error) {
                      // Invalid JSON, don't update
                    }
                  }}
                  rows={8}
                  placeholder='{
  "backgroundColor": "#f0f0f0",
  "borderColor": "#333",
  "fontSize": "16px"
}'
                />
                <small className='p-text-secondary'>
                  Enter valid JSON for custom CSS properties
                </small>
              </div>
            </div>
          </TabPanel>

          <TabPanel
            header='Conditions'
            leftIcon='pi pi-filter'
          >
            <div className='p-fluid'>
              <div className='p-field'>
                <label>Display Condition</label>
                <Dropdown
                  value={step.condition?.type || 'always'}
                  options={[
                    { label: 'Always Show', value: 'always' },
                    { label: 'Element Exists', value: 'element-exists' },
                    { label: 'Data Attribute', value: 'data-attribute' },
                    { label: 'Custom Function', value: 'custom' },
                  ]}
                  onChange={(e) => {
                    if (e.value === 'always') {
                      onChange({ condition: undefined });
                    } else {
                      onChange({
                        condition: {
                          type: e.value,
                          selector: step.condition?.selector || '',
                        },
                      });
                    }
                  }}
                />
              </div>

              {step.condition?.type === 'element-exists' && (
                <div className='p-field'>
                  <label>Element Selector</label>
                  <InputText
                    value={step.condition.selector || ''}
                    onChange={(e) =>
                      onChange({
                        condition: {
                          ...step.condition!,
                          selector: e.target.value,
                        },
                      })
                    }
                    placeholder='CSS selector to check'
                  />
                </div>
              )}

              {step.condition?.type === 'data-attribute' && (
                <div>
                  <div className='p-field'>
                    <label>Attribute Name</label>
                    <InputText
                      value={step.condition.dataAttribute?.name || ''}
                      onChange={(e) =>
                        onChange({
                          condition: {
                            ...step.condition!,
                            dataAttribute: {
                              name: e.target.value,
                              value: step.condition?.dataAttribute?.value || '',
                            },
                          },
                        })
                      }
                      placeholder='data-attribute-name'
                    />
                  </div>
                  <div className='p-field'>
                    <label>Expected Value</label>
                    <InputText
                      value={step.condition.dataAttribute?.value || ''}
                      onChange={(e) =>
                        onChange({
                          condition: {
                            ...step.condition!,
                            dataAttribute: {
                              name: step.condition?.dataAttribute?.name || '',
                              value: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder='expected-value'
                    />
                  </div>
                </div>
              )}
            </div>
          </TabPanel>
        </TabView>
      </div>
    </div>
  );
};
