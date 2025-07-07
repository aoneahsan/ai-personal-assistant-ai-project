import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Checkbox } from 'primereact/checkbox';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Chip } from 'primereact/chip';
import { TourTargeting as TourTargetingType, UserSegment, SegmentCondition } from '../../types';
import './TourTargeting.scss';

interface TourTargetingProps {
  targeting: TourTargetingType;
  onChange: (targeting: TourTargetingType) => void;
}

export const TourTargeting: React.FC<TourTargetingProps> = ({
  targeting,
  onChange,
}) => {
  const [showSegmentBuilder, setShowSegmentBuilder] = useState(false);
  const [editingSegment, setEditingSegment] = useState<UserSegment | null>(null);

  const updateTargeting = (updates: Partial<TourTargetingType>) => {
    onChange({ ...targeting, ...updates });
  };

  const handleAddSegment = () => {
    setEditingSegment({
      id: `segment_${Date.now()}`,
      name: 'New Segment',
      conditions: [],
      operator: 'AND',
    });
    setShowSegmentBuilder(true);
  };

  const handleSaveSegment = (segment: UserSegment) => {
    const segments = [...targeting.segments];
    const existingIndex = segments.findIndex((s) => s.id === segment.id);
    
    if (existingIndex >= 0) {
      segments[existingIndex] = segment;
    } else {
      segments.push(segment);
    }
    
    updateTargeting({ segments });
    setShowSegmentBuilder(false);
    setEditingSegment(null);
  };

  const handleRemoveSegment = (segmentId: string) => {
    const segments = targeting.segments.filter((s) => s.id !== segmentId);
    updateTargeting({ segments });
  };

  return (
    <div className="tour-targeting">
      <Card title="Audience Settings" className="targeting-card">
        <div className="p-field-checkbox">
          <Checkbox
            inputId="include-anonymous"
            checked={targeting.includeAnonymous}
            onChange={(e) => updateTargeting({ includeAnonymous: e.checked })}
          />
          <label htmlFor="include-anonymous">Include Anonymous Users</label>
        </div>
        
        <div className="p-field-checkbox">
          <Checkbox
            inputId="exclude-completed"
            checked={targeting.excludeCompletedUsers}
            onChange={(e) => updateTargeting({ excludeCompletedUsers: e.checked })}
          />
          <label htmlFor="exclude-completed">Exclude Users Who Completed This Tour</label>
        </div>

        <div className="p-field">
          <label htmlFor="max-display">Maximum Display Count (per user)</label>
          <InputNumber
            id="max-display"
            value={targeting.maxDisplayCount}
            onChange={(e) => updateTargeting({ maxDisplayCount: e.value || undefined })}
            min={1}
            placeholder="Unlimited"
          />
        </div>
      </Card>

      <Card title="User Segments" className="targeting-card">
        <div className="segments-section">
          <div className="segments-header">
            <p>Define specific user groups who should see this tour</p>
            <Button
              label="Add Segment"
              icon="pi pi-plus"
              className="p-button-sm"
              onClick={handleAddSegment}
            />
          </div>

          {targeting.segments.length > 0 ? (
            <div className="segments-list">
              {targeting.segments.map((segment) => (
                <div key={segment.id} className="segment-item">
                  <div className="segment-info">
                    <h4>{segment.name}</h4>
                    <p>
                      {segment.conditions.length} condition{segment.conditions.length !== 1 ? 's' : ''} 
                      {' '}({segment.operator})
                    </p>
                  </div>
                  <div className="segment-actions">
                    <Button
                      icon="pi pi-pencil"
                      className="p-button-text p-button-sm"
                      onClick={() => {
                        setEditingSegment(segment);
                        setShowSegmentBuilder(true);
                      }}
                    />
                    <Button
                      icon="pi pi-trash"
                      className="p-button-text p-button-danger p-button-sm"
                      onClick={() => handleRemoveSegment(segment.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-segments">
              <i className="pi pi-users" />
              <p>No segments defined. Tour will be shown to all users.</p>
            </div>
          )}
        </div>
      </Card>

      <Card title="Date Range" className="targeting-card">
        <div className="p-grid">
          <div className="p-col-6">
            <div className="p-field">
              <label htmlFor="start-date">Start Date</label>
              <Calendar
                id="start-date"
                value={targeting.dateRange?.start}
                onChange={(e) => updateTargeting({
                  dateRange: {
                    ...targeting.dateRange,
                    start: e.value as Date | undefined,
                  },
                })}
                showTime
                placeholder="No start date"
              />
            </div>
          </div>
          <div className="p-col-6">
            <div className="p-field">
              <label htmlFor="end-date">End Date</label>
              <Calendar
                id="end-date"
                value={targeting.dateRange?.end}
                onChange={(e) => updateTargeting({
                  dateRange: {
                    ...targeting.dateRange,
                    end: e.value as Date | undefined,
                  },
                })}
                showTime
                placeholder="No end date"
                minDate={targeting.dateRange?.start}
              />
            </div>
          </div>
        </div>
      </Card>

      {showSegmentBuilder && editingSegment && (
        <SegmentBuilder
          segment={editingSegment}
          onSave={handleSaveSegment}
          onCancel={() => {
            setShowSegmentBuilder(false);
            setEditingSegment(null);
          }}
        />
      )}
    </div>
  );
};

interface SegmentBuilderProps {
  segment: UserSegment;
  onSave: (segment: UserSegment) => void;
  onCancel: () => void;
}

const SegmentBuilder: React.FC<SegmentBuilderProps> = ({
  segment,
  onSave,
  onCancel,
}) => {
  const [localSegment, setLocalSegment] = useState<UserSegment>(segment);

  const propertyOptions = [
    { label: 'Email', value: 'email' },
    { label: 'Name', value: 'name' },
    { label: 'Role', value: 'role' },
    { label: 'Subscription Plan', value: 'subscription.plan' },
    { label: 'Created Date', value: 'createdAt' },
    { label: 'Last Login', value: 'lastLoginAt' },
    { label: 'Custom Property', value: 'custom' },
  ];

  const operatorOptions = [
    { label: 'Equals', value: 'equals' },
    { label: 'Not Equals', value: 'not-equals' },
    { label: 'Contains', value: 'contains' },
    { label: 'Greater Than', value: 'greater-than' },
    { label: 'Less Than', value: 'less-than' },
  ];

  const handleAddCondition = () => {
    const newCondition: SegmentCondition = {
      property: 'email',
      operator: 'equals',
      value: '',
    };
    setLocalSegment({
      ...localSegment,
      conditions: [...localSegment.conditions, newCondition],
    });
  };

  const handleUpdateCondition = (index: number, updates: Partial<SegmentCondition>) => {
    const conditions = [...localSegment.conditions];
    conditions[index] = { ...conditions[index], ...updates };
    setLocalSegment({ ...localSegment, conditions });
  };

  const handleRemoveCondition = (index: number) => {
    const conditions = localSegment.conditions.filter((_, i) => i !== index);
    setLocalSegment({ ...localSegment, conditions });
  };

  return (
    <div className="segment-builder-overlay">
      <div className="segment-builder">
        <div className="segment-builder-header">
          <h3>Configure Segment</h3>
        </div>

        <div className="segment-builder-content">
          <div className="p-field">
            <label htmlFor="segment-name">Segment Name</label>
            <InputText
              id="segment-name"
              value={localSegment.name}
              onChange={(e) => setLocalSegment({ ...localSegment, name: e.target.value })}
              placeholder="Enter segment name"
            />
          </div>

          <div className="p-field">
            <label>Condition Operator</label>
            <div className="operator-toggle">
              <Button
                label="AND"
                className={localSegment.operator === 'AND' ? '' : 'p-button-outlined'}
                onClick={() => setLocalSegment({ ...localSegment, operator: 'AND' })}
              />
              <Button
                label="OR"
                className={localSegment.operator === 'OR' ? '' : 'p-button-outlined'}
                onClick={() => setLocalSegment({ ...localSegment, operator: 'OR' })}
              />
            </div>
          </div>

          <div className="conditions-section">
            <div className="conditions-header">
              <label>Conditions</label>
              <Button
                icon="pi pi-plus"
                label="Add Condition"
                className="p-button-sm p-button-text"
                onClick={handleAddCondition}
              />
            </div>

            {localSegment.conditions.map((condition, index) => (
              <div key={index} className="condition-row">
                <Dropdown
                  value={condition.property}
                  options={propertyOptions}
                  onChange={(e) => handleUpdateCondition(index, { property: e.value })}
                  placeholder="Select property"
                />
                <Dropdown
                  value={condition.operator}
                  options={operatorOptions}
                  onChange={(e) => handleUpdateCondition(index, { operator: e.value })}
                />
                <InputText
                  value={condition.value}
                  onChange={(e) => handleUpdateCondition(index, { value: e.target.value })}
                  placeholder="Enter value"
                />
                <Button
                  icon="pi pi-trash"
                  className="p-button-text p-button-danger"
                  onClick={() => handleRemoveCondition(index)}
                />
              </div>
            ))}

            {localSegment.conditions.length === 0 && (
              <div className="empty-conditions">
                <p>No conditions added yet. Add conditions to define your segment.</p>
              </div>
            )}
          </div>
        </div>

        <div className="segment-builder-footer">
          <Button
            label="Cancel"
            className="p-button-text"
            onClick={onCancel}
          />
          <Button
            label="Save Segment"
            onClick={() => onSave(localSegment)}
            disabled={!localSegment.name || localSegment.conditions.length === 0}
          />
        </div>
      </div>
    </div>
  );
};