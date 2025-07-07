import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { RadioButton } from 'primereact/radiobutton';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { TourTrigger, TriggerCondition } from '../../types';
import './TourTriggers.scss';

interface TourTriggersProps {
  trigger: TourTrigger;
  onChange: (trigger: TourTrigger) => void;
}

export const TourTriggers: React.FC<TourTriggersProps> = ({
  trigger,
  onChange,
}) => {
  const triggerTypes = [
    {
      value: 'manual',
      label: 'Manual',
      description: 'Triggered programmatically via API',
      icon: 'pi-code',
    },
    {
      value: 'auto',
      label: 'Automatic',
      description: 'Triggered automatically when conditions are met',
      icon: 'pi-play',
    },
    {
      value: 'event',
      label: 'Event-based',
      description: 'Triggered by specific user events',
      icon: 'pi-bolt',
    },
  ];

  const conditionTypes = [
    { label: 'URL Match', value: 'url' },
    { label: 'User Property', value: 'user-property' },
    { label: 'Custom Function', value: 'custom' },
  ];

  const urlOperators = [
    { label: 'Equals', value: 'equals' },
    { label: 'Contains', value: 'contains' },
    { label: 'Starts With', value: 'starts-with' },
    { label: 'Ends With', value: 'ends-with' },
    { label: 'Regex Match', value: 'regex' },
  ];

  const handleAddCondition = () => {
    const newCondition: TriggerCondition = {
      type: 'url',
      operator: 'equals',
      value: '',
    };
    onChange({
      ...trigger,
      conditions: [...(trigger.conditions || []), newCondition],
    });
  };

  const handleUpdateCondition = (index: number, updates: Partial<TriggerCondition>) => {
    const conditions = [...(trigger.conditions || [])];
    conditions[index] = { ...conditions[index], ...updates };
    onChange({ ...trigger, conditions });
  };

  const handleRemoveCondition = (index: number) => {
    const conditions = (trigger.conditions || []).filter((_, i) => i !== index);
    onChange({ ...trigger, conditions });
  };

  return (
    <div className="tour-triggers">
      <Card title="Trigger Type" className="trigger-card">
        <div className="trigger-types">
          {triggerTypes.map((type) => (
            <div key={type.value} className="trigger-type-option">
              <RadioButton
                inputId={`trigger-${type.value}`}
                value={type.value}
                onChange={(e) => onChange({ ...trigger, type: e.value })}
                checked={trigger.type === type.value}
              />
              <label htmlFor={`trigger-${type.value}`} className="trigger-type-label">
                <i className={`pi ${type.icon}`} />
                <div>
                  <h4>{type.label}</h4>
                  <p>{type.description}</p>
                </div>
              </label>
            </div>
          ))}
        </div>
      </Card>

      {trigger.type === 'auto' && (
        <Card title="Auto-trigger Settings" className="trigger-card">
          <div className="p-field">
            <label htmlFor="trigger-delay">Delay (milliseconds)</label>
            <InputNumber
              id="trigger-delay"
              value={trigger.delay || 0}
              onChange={(e) => onChange({ ...trigger, delay: e.value || 0 })}
              min={0}
              step={100}
              suffix=" ms"
            />
            <small>Time to wait after page load before showing the tour</small>
          </div>

          <div className="conditions-section">
            <div className="conditions-header">
              <h4>Trigger Conditions</h4>
              <Button
                icon="pi pi-plus"
                label="Add Condition"
                className="p-button-sm p-button-text"
                onClick={handleAddCondition}
              />
            </div>

            {(trigger.conditions || []).map((condition, index) => (
              <div key={index} className="condition-item">
                <div className="condition-type">
                  <Dropdown
                    value={condition.type}
                    options={conditionTypes}
                    onChange={(e) => handleUpdateCondition(index, { type: e.value })}
                  />
                </div>

                {condition.type === 'url' && (
                  <>
                    <Dropdown
                      value={condition.operator}
                      options={urlOperators}
                      onChange={(e) => handleUpdateCondition(index, { operator: e.value })}
                    />
                    <InputText
                      value={condition.value}
                      onChange={(e) => handleUpdateCondition(index, { value: e.target.value })}
                      placeholder="Enter URL pattern"
                    />
                  </>
                )}

                {condition.type === 'user-property' && (
                  <>
                    <InputText
                      value={condition.value}
                      onChange={(e) => handleUpdateCondition(index, { value: e.target.value })}
                      placeholder="property.path"
                    />
                    <InputText
                      placeholder="Expected value"
                    />
                  </>
                )}

                {condition.type === 'custom' && (
                  <div className="custom-function-info">
                    <i className="pi pi-info-circle" />
                    <span>Custom function will be defined in code</span>
                  </div>
                )}

                <Button
                  icon="pi pi-trash"
                  className="p-button-text p-button-danger p-button-sm"
                  onClick={() => handleRemoveCondition(index)}
                />
              </div>
            ))}

            {(!trigger.conditions || trigger.conditions.length === 0) && (
              <div className="empty-conditions">
                <p>No conditions defined. Tour will trigger on all pages after delay.</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {trigger.type === 'event' && (
        <Card title="Event Settings" className="trigger-card">
          <div className="p-field">
            <label htmlFor="event-name">Event Name</label>
            <InputText
              id="event-name"
              value={trigger.event || ''}
              onChange={(e) => onChange({ ...trigger, event: e.target.value })}
              placeholder="e.g., button-click, form-submit"
            />
            <small>The custom event name that will trigger this tour</small>
          </div>

          <div className="event-examples">
            <h4>Common Events:</h4>
            <div className="event-chips">
              <Button
                label="Feature Used"
                className="p-button-outlined p-button-sm"
                onClick={() => onChange({ ...trigger, event: 'feature-used' })}
              />
              <Button
                label="Page View"
                className="p-button-outlined p-button-sm"
                onClick={() => onChange({ ...trigger, event: 'page-view' })}
              />
              <Button
                label="User Sign Up"
                className="p-button-outlined p-button-sm"
                onClick={() => onChange({ ...trigger, event: 'user-signup' })}
              />
              <Button
                label="First Login"
                className="p-button-outlined p-button-sm"
                onClick={() => onChange({ ...trigger, event: 'first-login' })}
              />
            </div>
          </div>
        </Card>
      )}

      {trigger.type === 'manual' && (
        <Card title="Manual Trigger" className="trigger-card">
          <div className="manual-trigger-info">
            <i className="pi pi-info-circle" />
            <div>
              <h4>API Integration</h4>
              <p>This tour will only be triggered when called via the JavaScript API:</p>
              <pre>
                <code>
{`// Start tour programmatically
ProductAdoption.startTour('${trigger.event || 'tour-id'}');

// Start tour for specific user
ProductAdoption.startTour('${trigger.event || 'tour-id'}', {
  userId: 'user123',
  properties: { ... }
});`}
                </code>
              </pre>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};