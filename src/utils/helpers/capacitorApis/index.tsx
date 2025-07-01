import { consoleError } from '@/utils/helpers/consoleHelper';
import { Clipboard } from '@capacitor/clipboard';
import { ShowOptions, Toast } from '@capacitor/toast';

export const showCapacitorToastMessage = async (args: ShowOptions) => {
  await Toast.show({
    position: 'bottom',
    ...args,
  });
};

export interface CopyToClipboardOptions {
  value: string;
  successMessage?: string;
  errorMessage?: string;
}

export const copyToClipboardWithToast = async ({
  value,
  successMessage = 'Copied to clipboard!',
  errorMessage = 'Failed to copy to clipboard',
}: CopyToClipboardOptions): Promise<boolean> => {
  try {
    await Clipboard.write({
      string: value,
    });

    // Show success toast
    await showCapacitorToastMessage({
      text: successMessage,
      duration: 'short',
      position: 'bottom',
    });

    return true;
  } catch (error) {
    consoleError('Clipboard copy failed:', error);

    // Show error toast
    await showCapacitorToastMessage({
      text: errorMessage,
      duration: 'short',
      position: 'bottom',
    });

    return false;
  }
};

export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await Clipboard.write({
      string: text,
    });
  } catch (error) {
    consoleError('Clipboard copy failed:', error);
    throw error;
  }
};
