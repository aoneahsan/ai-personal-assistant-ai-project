import { PAGE_REFRESHED_ONCE_LOCALSTORAGE_KEY } from '@perkforce/tool-kit';
import { lazy } from 'react';
import { STORAGE } from './helpers/localStorage';
import { W_LOCATION } from './helpers/windowLocation';

const lazyWithRetry = (componentImport: any) => {
  return lazy(async () => {
    const res = await STORAGE.GET(PAGE_REFRESHED_ONCE_LOCALSTORAGE_KEY);
    const pageHasAlreadyBeenForceRefreshed = res === 'true';

    try {
      const component = await componentImport();

      await STORAGE.REMOVE(PAGE_REFRESHED_ONCE_LOCALSTORAGE_KEY);

      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        // Assuming that the user is not on the latest version of the application.
        // Let's refresh the page immediately.
        await STORAGE.SET(PAGE_REFRESHED_ONCE_LOCALSTORAGE_KEY, 'true');

        // reload page
        W_LOCATION.RELOAD();
      }

      // The page has already been reloaded
      // Assuming that user is already using the latest version of the application.
      // Let's let the application crash and raise the error.
      throw error;
    }
  });
};

export default lazyWithRetry;
