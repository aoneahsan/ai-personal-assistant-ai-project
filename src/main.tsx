import React from 'react';
import { createRoot } from 'react-dom/client';
import AppHocWrapper from './AppHocWrapper';

import { defineCustomElements } from '@ionic/pwa-elements/loader';

// required for capacitor pwa elements, like toast, camera, etc.
defineCustomElements(window);

// Register Service Worker for PWA (no caching)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log(
          'PWA: Service Worker registered successfully:',
          registration.scope
        );

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          console.log('PWA: New service worker version found');
        });
      })
      .catch((error) => {
        console.log('PWA: Service Worker registration failed:', error);
      });
  });

  // Listen for install prompt
  let deferredPrompt: any;
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('PWA: Install prompt available');
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;

    // Optionally show your own install button here
    // You can trigger the install prompt with: deferredPrompt.prompt()
  });

  // Listen for successful app install
  window.addEventListener('appinstalled', (evt) => {
    console.log('PWA: App was successfully installed');
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
