import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import React, { useCallback, useEffect, useState } from 'react';
import './ElementSelector.scss';

interface ElementSelectorProps {
  onSelect: (selector: string) => void;
  currentSelector: string;
}

export const ElementSelector: React.FC<ElementSelectorProps> = ({
  onSelect,
  currentSelector,
}) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(
    null
  );
  const [selectedSelector, setSelectedSelector] = useState(currentSelector);
  const [selectorHistory, setSelectorHistory] = useState<string[]>([]);
  const [isValidSelector, setIsValidSelector] = useState(true);

  const generateSelector = (element: HTMLElement): string => {
    // Generate a unique CSS selector for the element
    const path: string[] = [];
    let currentElement: HTMLElement | null = element;

    while (currentElement && currentElement.tagName !== 'HTML') {
      let selector = currentElement.tagName.toLowerCase();

      // Add ID if available
      if (currentElement.id) {
        selector = `#${currentElement.id}`;
        path.unshift(selector);
        break; // ID is unique, no need to go further
      }

      // Add classes
      if (
        currentElement.className &&
        typeof currentElement.className === 'string'
      ) {
        const classes = currentElement.className.trim().split(/\s+/);
        if (classes.length > 0 && classes[0]) {
          selector += `.${classes.join('.')}`;
        }
      }

      // Add nth-child if needed
      const parent = currentElement.parentElement;
      if (parent && currentElement) {
        const siblings = Array.from(parent.children);
        const index = siblings.indexOf(currentElement) + 1;
        if (
          siblings.filter((s) => s.tagName === currentElement!.tagName).length >
          1
        ) {
          selector += `:nth-child(${index})`;
        }
      }

      path.unshift(selector);
      currentElement = currentElement.parentElement as HTMLElement;
    }

    return path.join(' > ');
  };

  const validateSelector = (selector: string): boolean => {
    try {
      const elements = document.querySelectorAll(selector);
      return elements.length > 0;
    } catch {
      return false;
    }
  };

  const highlightElement = useCallback((element: HTMLElement) => {
    // Remove previous highlight
    document.querySelectorAll('.tour-selector-highlight').forEach((el) => {
      el.classList.remove('tour-selector-highlight');
    });

    // Add highlight to current element
    element.classList.add('tour-selector-highlight');
    setHoveredElement(element);
  }, []);

  const removeHighlight = useCallback(() => {
    document.querySelectorAll('.tour-selector-highlight').forEach((el) => {
      el.classList.remove('tour-selector-highlight');
    });
    setHoveredElement(null);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isSelecting) return;

      const element = document.elementFromPoint(
        e.clientX,
        e.clientY
      ) as HTMLElement;
      if (element && !element.closest('.element-selector-panel')) {
        highlightElement(element);
      }
    },
    [isSelecting, highlightElement]
  );

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!isSelecting) return;

      e.preventDefault();
      e.stopPropagation();

      const element = document.elementFromPoint(
        e.clientX,
        e.clientY
      ) as HTMLElement;
      if (element && !element.closest('.element-selector-panel')) {
        const selector = generateSelector(element);
        setSelectedSelector(selector);
        setSelectorHistory((prev) => [...prev.slice(-4), selector]);
        onSelect(selector);
        setIsSelecting(false);
        removeHighlight();
      }
    },
    [isSelecting, onSelect, removeHighlight]
  );

  const handleSelectorChange = (value: string) => {
    setSelectedSelector(value);
    const isValid = validateSelector(value);
    setIsValidSelector(isValid);

    if (isValid) {
      // Highlight elements matching the selector
      removeHighlight();
      const elements = document.querySelectorAll(value);
      elements.forEach((el) => el.classList.add('tour-selector-highlight'));
      onSelect(value);
    }
  };

  const startSelecting = () => {
    setIsSelecting(true);
    document.body.style.cursor = 'crosshair';
  };

  const stopSelecting = () => {
    setIsSelecting(false);
    document.body.style.cursor = 'default';
    removeHighlight();
  };

  useEffect(() => {
    if (isSelecting) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('click', handleClick);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('click', handleClick);
        stopSelecting();
      };
    }
  }, [isSelecting, handleMouseMove, handleClick]);

  useEffect(() => {
    setSelectedSelector(currentSelector);
  }, [currentSelector]);

  return (
    <div className='element-selector-panel'>
      <Card className='element-selector-card'>
        <div className='element-selector-header'>
          <h4>Element Selector</h4>
          <Button
            icon={isSelecting ? 'pi pi-times' : 'pi pi-eye-slash'}
            className='p-button-text p-button-sm'
            onClick={isSelecting ? stopSelecting : startSelecting}
            tooltip={
              isSelecting ? 'Cancel Selection' : 'Start Visual Selection'
            }
          />
        </div>

        <div className='selector-input-group'>
          <InputText
            value={selectedSelector}
            onChange={(e) => handleSelectorChange(e.target.value)}
            placeholder='Enter CSS selector or use visual selector'
            className={!isValidSelector ? 'p-invalid' : ''}
          />
          {!isValidSelector && selectedSelector && (
            <small className='p-error'>Invalid CSS selector</small>
          )}
        </div>

        {isSelecting && (
          <Message
            severity='info'
            text='Click on any element on the page to select it'
            className='selector-message'
          />
        )}

        {hoveredElement && (
          <div className='element-info'>
            <div className='element-info-item'>
              <span className='label'>Tag:</span>
              <span className='value'>
                {hoveredElement.tagName.toLowerCase()}
              </span>
            </div>
            {hoveredElement.id && (
              <div className='element-info-item'>
                <span className='label'>ID:</span>
                <span className='value'>#{hoveredElement.id}</span>
              </div>
            )}
            {hoveredElement.className && (
              <div className='element-info-item'>
                <span className='label'>Classes:</span>
                <span className='value'>
                  .{hoveredElement.className.split(' ').join('.')}
                </span>
              </div>
            )}
          </div>
        )}

        {selectorHistory.length > 0 && (
          <div className='selector-history'>
            <h5>Recent Selections</h5>
            <div className='history-items'>
              {selectorHistory.map((selector, index) => (
                <div
                  key={index}
                  className='history-item'
                  onClick={() => handleSelectorChange(selector)}
                >
                  <i className='pi pi-history' />
                  <span>{selector}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className='selector-tips'>
          <h5>Quick Tips</h5>
          <ul>
            <li>Click the eye icon to start visual selection</li>
            <li>Hover over elements to preview selection</li>
            <li>Use IDs for unique elements (#my-id)</li>
            <li>Use classes for multiple elements (.my-class)</li>
            <li>Combine selectors for specificity (.parent &gt; .child)</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};
