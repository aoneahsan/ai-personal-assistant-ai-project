import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Tour, TourStep } from '../../types';
import './TourPreview.scss';

interface TourPreviewProps {
  tour: Partial<Tour>;
  onClose: () => void;
  startStepIndex?: number;
}

export const TourPreview: React.FC<TourPreviewProps> = ({
  tour,
  onClose,
  startStepIndex = 0,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(startStepIndex);
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const currentStep = tour.steps?.[currentStepIndex];
  const totalSteps = tour.steps?.length || 0;
  const progress = totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0;

  useEffect(() => {
    setIsVisible(true);
    positionTooltip();
    
    return () => {
      // Cleanup any highlighted elements
      document.querySelectorAll('.tour-preview-highlight').forEach(el => {
        el.classList.remove('tour-preview-highlight');
      });
    };
  }, []);

  useEffect(() => {
    positionTooltip();
  }, [currentStepIndex]);

  const positionTooltip = () => {
    if (!currentStep || !tooltipRef.current) return;

    // Remove previous highlights
    document.querySelectorAll('.tour-preview-highlight').forEach(el => {
      el.classList.remove('tour-preview-highlight');
    });

    if (currentStep.target) {
      try {
        const targetElement = document.querySelector(currentStep.target) as HTMLElement;
        if (targetElement) {
          targetElement.classList.add('tour-preview-highlight');
          
          const rect = targetElement.getBoundingClientRect();
          const tooltip = tooltipRef.current;
          const tooltipRect = tooltip.getBoundingClientRect();
          
          let top = 0;
          let left = 0;
          
          switch (currentStep.placement) {
            case 'top':
              top = rect.top - tooltipRect.height - 10;
              left = rect.left + (rect.width - tooltipRect.width) / 2;
              break;
            case 'bottom':
              top = rect.bottom + 10;
              left = rect.left + (rect.width - tooltipRect.width) / 2;
              break;
            case 'left':
              top = rect.top + (rect.height - tooltipRect.height) / 2;
              left = rect.left - tooltipRect.width - 10;
              break;
            case 'right':
              top = rect.top + (rect.height - tooltipRect.height) / 2;
              left = rect.right + 10;
              break;
            default:
              // Center
              top = (window.innerHeight - tooltipRect.height) / 2;
              left = (window.innerWidth - tooltipRect.width) / 2;
          }
          
          // Ensure tooltip stays within viewport
          top = Math.max(10, Math.min(top, window.innerHeight - tooltipRect.height - 10));
          left = Math.max(10, Math.min(left, window.innerWidth - tooltipRect.width - 10));
          
          tooltip.style.top = `${top}px`;
          tooltip.style.left = `${left}px`;
          
          // Scroll target into view if needed
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Create spotlight effect
          if (overlayRef.current) {
            const padding = currentStep.spotlightPadding || 10;
            const spotlightPath = `
              M 0 0 
              L ${window.innerWidth} 0 
              L ${window.innerWidth} ${window.innerHeight} 
              L 0 ${window.innerHeight} 
              Z 
              M ${rect.left - padding} ${rect.top - padding} 
              L ${rect.right + padding} ${rect.top - padding} 
              L ${rect.right + padding} ${rect.bottom + padding} 
              L ${rect.left - padding} ${rect.bottom + padding} 
              Z
            `;
            
            overlayRef.current.innerHTML = `
              <svg width="${window.innerWidth}" height="${window.innerHeight}" style="position: fixed; top: 0; left: 0; pointer-events: none;">
                <path d="${spotlightPath}" fill="rgba(0, 0, 0, ${tour.settings?.theme?.overlayOpacity || 0.5})" fill-rule="evenodd" />
              </svg>
            `;
          }
        } else {
          // No target element found, center the tooltip
          centerTooltip();
        }
      } catch (error) {
        console.error('Error positioning tooltip:', error);
        centerTooltip();
      }
    } else {
      // No target specified, center the tooltip
      centerTooltip();
    }
  };

  const centerTooltip = () => {
    if (!tooltipRef.current) return;
    
    const tooltip = tooltipRef.current;
    const tooltipRect = tooltip.getBoundingClientRect();
    
    tooltip.style.top = `${(window.innerHeight - tooltipRect.height) / 2}px`;
    tooltip.style.left = `${(window.innerWidth - tooltipRect.width) / 2}px`;
    
    // Clear spotlight for centered tooltips
    if (overlayRef.current) {
      overlayRef.current.innerHTML = '';
    }
  };

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleComplete = () => {
    if (tour.settings?.completion?.showCompletionMessage) {
      // Show completion message
      alert(tour.settings.completion.completionMessage || 'Tour completed!');
    }
    onClose();
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'next':
        handleNext();
        break;
      case 'previous':
        handlePrevious();
        break;
      case 'close':
        onClose();
        break;
      default:
        console.log('Custom action:', action);
    }
  };

  const renderContent = (content: string) => {
    // Replace variables with sample data
    return content
      .replace(/\{\{user\.name\}\}/g, 'John Doe')
      .replace(/\{\{user\.email\}\}/g, 'john@example.com')
      .replace(/\{\{company\.name\}\}/g, 'Acme Corp')
      .replace(/\{\{date\.current\}\}/g, new Date().toLocaleDateString())
      .replace(/\{\{step\.number\}\}/g, String(currentStepIndex + 1))
      .replace(/\{\{step\.total\}\}/g, String(totalSteps));
  };

  if (!currentStep || !tour.steps || tour.steps.length === 0) {
    return null;
  }

  const theme = tour.settings?.theme || {};
  const navigation = tour.settings?.navigation || {};

  return (
    <div className={`tour-preview ${isVisible ? 'visible' : ''}`}>
      <div 
        ref={overlayRef}
        className="tour-overlay"
        style={{
          backgroundColor: currentStep.target ? 'transparent' : `rgba(0, 0, 0, ${theme.overlayOpacity || 0.5})`,
        }}
        onClick={() => onClose()}
      />
      
      <div
        ref={tooltipRef}
        className="tour-tooltip"
        style={{
          backgroundColor: theme.backgroundColor || '#ffffff',
          color: theme.textColor || '#333333',
          borderRadius: `${theme.borderRadius || 8}px`,
          zIndex: theme.zIndex || 9999,
          fontFamily: theme.fontFamily,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {navigation.showCloseButton && (
          <Button
            icon="pi pi-times"
            className="p-button-text p-button-sm tour-close-btn"
            onClick={onClose}
          />
        )}
        
        {navigation.showProgressBar && (
          <div className="tour-progress">
            <ProgressBar value={progress} showValue={false} />
            {navigation.showStepNumbers && (
              <span className="step-counter">
                {currentStepIndex + 1} / {totalSteps}
              </span>
            )}
          </div>
        )}
        
        <div className="tour-content">
          <h3 style={{ color: theme.primaryColor || '#1976d2' }}>
            {currentStep.title}
          </h3>
          <div 
            className="tour-description"
            dangerouslySetInnerHTML={{ __html: renderContent(currentStep.content) }}
          />
        </div>
        
        <div className="tour-actions">
          {currentStep.actions?.map((action, index) => (
            <Button
              key={index}
              label={action.label}
              className={`p-button-${action.style || 'secondary'}`}
              onClick={() => handleAction(action.action)}
              disabled={
                (action.action === 'previous' && currentStepIndex === 0) ||
                (action.action === 'next' && currentStepIndex === totalSteps - 1 && !tour.settings?.completion?.showCompletionMessage)
              }
            />
          ))}
          
          {navigation.showSkipButton && currentStep.skipable && (
            <Button
              label="Skip Tour"
              className="p-button-link"
              onClick={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};