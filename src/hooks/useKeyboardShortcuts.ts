import { useCallback, useEffect } from 'react';

interface KeyboardShortcutOptions {
  onSubmit?: () => void;
  onReset?: () => void;
  onCancel?: () => void;
  onShowHelp?: () => void;
  onSectionChange?: (sectionIndex: number) => void;
  sections?: string[];
}

export const useKeyboardShortcuts = (options: KeyboardShortcutOptions) => {
  const {
    onSubmit,
    onReset,
    onCancel,
    onShowHelp,
    onSectionChange,
    sections = [],
  } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore shortcuts when user is typing in input fields
      const activeElement = document.activeElement;
      const isInputField =
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.tagName === 'SELECT' ||
          activeElement.getAttribute('contenteditable') === 'true');

      // Allow some shortcuts even in input fields
      const allowInInputs = ['F2', 'F1'];
      const key = event.key;

      if (isInputField && !allowInInputs.includes(key) && !event.ctrlKey) {
        return;
      }

      // F2: Submit form
      if (key === 'F2') {
        event.preventDefault();
        onSubmit?.();
        return;
      }

      // F1: Show help
      if (key === 'F1') {
        event.preventDefault();
        onShowHelp?.();
        return;
      }

      // Ctrl + S: Save (same as submit)
      if (event.ctrlKey && key === 's') {
        event.preventDefault();
        onSubmit?.();
        return;
      }

      // Ctrl + R: Reset form
      if (event.ctrlKey && key === 'r') {
        event.preventDefault();
        onReset?.();
        return;
      }

      // Ctrl + Z: Cancel/Go back
      if (event.ctrlKey && key === 'z') {
        event.preventDefault();
        onCancel?.();
        return;
      }

      // Ctrl + H: Show help
      if (event.ctrlKey && key === 'h') {
        event.preventDefault();
        onShowHelp?.();
        return;
      }

      // Ctrl + Number keys: Change sections
      if (event.ctrlKey && /^[1-9]$/.test(key)) {
        event.preventDefault();
        const sectionIndex = parseInt(key) - 1;
        if (sectionIndex < sections.length) {
          onSectionChange?.(sectionIndex);
        }
        return;
      }

      // Escape: Close modals or cancel
      if (key === 'Escape') {
        // Let the modal handle escape key
        return;
      }
    },
    [onSubmit, onReset, onCancel, onShowHelp, onSectionChange, sections]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    shortcuts: {
      submit: 'F2 or Ctrl+S',
      reset: 'Ctrl+R',
      cancel: 'Ctrl+Z',
      help: 'F1 or Ctrl+H',
      sections: 'Ctrl+1-9',
    },
  };
};
