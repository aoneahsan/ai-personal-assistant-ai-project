import React from 'react';
import { createRoot } from 'react-dom/client';
import AppHocWrapper from './AppHocWrapper';

import { consoleLog } from '@/utils/helpers/consoleHelper';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

// required for capacitor pwa elements, like toast, camera, etc.
defineCustomElements(window);

// Register Service Worker for PWA (no caching)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        consoleLog(
          'PWA: Service Worker registered successfully:',
          registration.scope
        );

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          consoleLog('PWA: New service worker version found');
        });
      })
      .catch((error) => {
        consoleLog('PWA: Service Worker registration failed:', error);
      });
  });

  // Listen for install prompt
  let deferredPrompt: any;
  window.addEventListener('beforeinstallprompt', (e) => {
    consoleLog('PWA: Install prompt available');
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;

    // Optionally show your own install button here
    // You can trigger the install prompt with: deferredPrompt.prompt()
  });

  // Listen for successful app install
  window.addEventListener('appinstalled', (evt) => {
    consoleLog('PWA: App was successfully installed');
  });
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container!);
  root.render(
    <React.StrictMode>
      <AppHocWrapper />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found');
}

async function startApp() {
  // PWA Service Worker registration
  if ('serviceWorker' in navigator) {
    try {
      consoleLog(
        'PWA: Service Worker support detected, starting registration...'
      );

      window.addEventListener('beforeinstallprompt', () => {
        consoleLog('PWA: New service worker version found');
      });
    } catch (error) {
      consoleLog('PWA: Service Worker registration failed:', error);
    }
  }

  // ... rest of function ...
}
