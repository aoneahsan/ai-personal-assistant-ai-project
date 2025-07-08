import { Tour, TourAction, TourAction, TourStep, TourTheme } from '../types';
import {
  createOverlay,
  createSpotlight,
  isElementVisible,
  scrollToElement,
} from './helpers';

export class TourRenderer {
  private tour: Tour;
  private currentStep: TourStep | null = null;
  private overlay: HTMLDivElement | null = null;
  private spotlight: HTMLDivElement | null = null;
  private tooltip: HTMLDivElement | null = null;
  private container: HTMLDivElement | null = null;

  constructor(tour: Tour) {
    this.tour = tour;
    this.createContainer();
  }

  private createContainer(): void {
    this.container = document.createElement('div');
    this.container.className = 'product-adoption-tour-container';
    this.container.setAttribute('role', 'dialog');
    this.container.setAttribute('aria-label', 'Product tour');
    document.body.appendChild(this.container);
  }

  public renderStep(
    step: TourStep,
    stepIndex: number,
    totalSteps: number
  ): void {
    this.currentStep = step;
    this.clearPreviousStep();

    // Create overlay
    if (step.target) {
      this.overlay = createOverlay(this.tour.settings.theme.overlayOpacity);
      this.container?.appendChild(this.overlay);
    }

    // Create spotlight if target exists
    if (step.target && isElementVisible(step.target)) {
      this.spotlight = createSpotlight(
        step.target,
        step.spotlightPadding,
        step.spotlightRadius
      );
      if (this.spotlight) {
        this.container?.appendChild(this.spotlight);
      }

      // Scroll to element
      scrollToElement(step.target);
    }

    // Create tooltip
    this.tooltip = this.createTooltip(step, stepIndex, totalSteps);
    this.container?.appendChild(this.tooltip);

    // Position tooltip
    this.positionTooltip(step);

    // Apply animations
    this.applyEntranceAnimation();
  }

  private createTooltip(
    step: TourStep,
    stepIndex: number,
    totalSteps: number
  ): HTMLDivElement {
    const tooltip = document.createElement('div');
    tooltip.className = 'product-adoption-tooltip';
    tooltip.style.cssText = this.getTooltipStyles();

    // Header with progress
    if (this.tour.settings.navigation.showProgressBar) {
      const header = document.createElement('div');
      header.className = 'tooltip-header';
      header.innerHTML = `
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${((stepIndex + 1) / totalSteps) * 100}%"></div>
        </div>
        ${
          this.tour.settings.navigation.showStepNumbers
            ? `<span class="step-counter">${stepIndex + 1} / ${totalSteps}</span>`
            : ''
        }
      `;
      tooltip.appendChild(header);
    }

    // Close button
    if (this.tour.settings.navigation.showCloseButton) {
      const closeButton = document.createElement('button');
      closeButton.className = 'close-button';
      closeButton.innerHTML = '×';
      closeButton.setAttribute('aria-label', 'Close tour');
      closeButton.onclick = () => this.onClose();
      tooltip.appendChild(closeButton);
    }

    // Content
    const content = document.createElement('div');
    content.className = 'tooltip-content';

    const title = document.createElement('h3');
    title.textContent = step.title;
    content.appendChild(title);

    const message = document.createElement('p');
    message.innerHTML = step.content;
    content.appendChild(message);

    tooltip.appendChild(content);

    // Actions
    if (step.actions && step.actions.length > 0) {
      const actions = document.createElement('div');
      actions.className = 'tooltip-actions';

      step.actions.forEach((action) => {
        const button = document.createElement('button');
        button.className = `action-button action-${action.style}`;
        button.textContent = action.label;
        button.onclick = () => this.handleAction(action);
        actions.appendChild(button);
      });

      tooltip.appendChild(actions);
    }

    return tooltip;
  }

  private getTooltipStyles(): string {
    const theme = this.tour.settings.theme;
    return `
      position: fixed;
      z-index: ${theme.zIndex + 1};
      background-color: ${theme.backgroundColor};
      color: ${theme.textColor};
      border-radius: ${theme.borderRadius}px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      padding: 20px;
      max-width: 400px;
      font-family: ${theme.fontFamily || 'inherit'};
    `;
  }

  private positionTooltip(step: TourStep): void {
    if (!this.tooltip) return;

    if (!step.target || step.placement === 'center') {
      // Center positioning
      this.tooltip.style.top = '50%';
      this.tooltip.style.left = '50%';
      this.tooltip.style.transform = 'translate(-50%, -50%)';
      return;
    }

    const targetElement = document.querySelector(step.target);
    if (!targetElement) {
      this.positionTooltip({ ...step, target: '', placement: 'center' });
      return;
    }

    const targetRect = targetElement.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();
    const spacing = 10;

    let top = 0;
    let left = 0;

    switch (step.placement) {
      case 'top':
        top = targetRect.top - tooltipRect.height - spacing;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + spacing;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.left - tooltipRect.width - spacing;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.right + spacing;
        break;
    }

    // Ensure tooltip stays within viewport
    top = Math.max(
      10,
      Math.min(top, window.innerHeight - tooltipRect.height - 10)
    );
    left = Math.max(
      10,
      Math.min(left, window.innerWidth - tooltipRect.width - 10)
    );

    this.tooltip.style.top = `${top}px`;
    this.tooltip.style.left = `${left}px`;
  }

  private applyEntranceAnimation(): void {
    if (!this.tooltip) return;

    this.tooltip.style.opacity = '0';
    this.tooltip.style.transform += ' scale(0.9)';

    requestAnimationFrame(() => {
      if (this.tooltip) {
        this.tooltip.style.transition = 'all 0.3s ease-out';
        this.tooltip.style.opacity = '1';
        this.tooltip.style.transform = this.tooltip.style.transform.replace(
          'scale(0.9)',
          'scale(1)'
        );
      }
    });
  }

  private clearPreviousStep(): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    if (this.spotlight) {
      this.spotlight.remove();
      this.spotlight = null;
    }
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }
  }

  private handleAction(action: TourAction): void {
    if (action.customHandler) {
      action.customHandler();
    }
    // Action handling will be implemented by the parent component
  }

  private onClose(): void {
    this.destroy();
    // Close handling will be implemented by the parent component
  }

  public destroy(): void {
    this.clearPreviousStep();
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }

  public updateTheme(theme: TourTheme): void {
    this.tour.settings.theme = theme;
    if (this.currentStep && this.tooltip) {
      this.tooltip.style.cssText = this.getTooltipStyles();
    }
  }
}
