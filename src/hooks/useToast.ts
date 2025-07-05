import { Toast } from 'primereact/toast';
import { useRef } from 'react';

export interface ToastMessage {
  severity: 'success' | 'info' | 'warn' | 'error';
  summary: string;
  detail: string;
  life?: number;
}

export const useToast = () => {
  const toast = useRef<Toast>(null);

  const showToast = (message: ToastMessage) => {
    toast.current?.show({
      severity: message.severity,
      summary: message.summary,
      detail: message.detail,
      life: message.life || 3000,
    });
  };

  // Predefined common toast messages
  const showSuccess = (summary: string, detail: string, life?: number) => {
    showToast({ severity: 'success', summary, detail, life });
  };

  const showError = (summary: string, detail: string, life?: number) => {
    showToast({ severity: 'error', summary, detail, life: life || 5000 });
  };

  const showInfo = (summary: string, detail: string, life?: number) => {
    showToast({ severity: 'info', summary, detail, life });
  };

  const showWarning = (summary: string, detail: string, life?: number) => {
    showToast({ severity: 'warn', summary, detail, life });
  };

  // Common application-specific toast messages
  const showRefreshSuccess = (entity: string) => {
    showSuccess(
      'Data Refreshed',
      `${entity} data has been successfully refreshed`
    );
  };

  const showLoadError = (entity: string) => {
    showError('Error', `Failed to load ${entity}. Please try again.`);
  };

  const showSaveSuccess = (entity: string) => {
    showSuccess('Saved', `${entity} has been successfully saved`);
  };

  const showSaveError = (entity: string) => {
    showError('Save Failed', `Failed to save ${entity}. Please try again.`);
  };

  const showDeleteSuccess = (entity: string) => {
    showSuccess('Deleted', `${entity} has been successfully deleted`);
  };

  const showDeleteError = (entity: string) => {
    showError('Delete Failed', `Failed to delete ${entity}. Please try again.`);
  };

  const showCopySuccess = (item: string = 'Content') => {
    showSuccess('Copied', `${item} copied to clipboard`);
  };

  return {
    toast,
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showRefreshSuccess,
    showLoadError,
    showSaveSuccess,
    showSaveError,
    showDeleteSuccess,
    showDeleteError,
    showCopySuccess,
  };
};
