import { Network } from '@capacitor/network';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import React, { useEffect, useState } from 'react';

interface NetworkStatus {
  connected: boolean;
  connectionType: string;
}

const NetworkStatusHOC: React.FC = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    connected: true,
    connectionType: 'unknown',
  });
  const [showOverlay, setShowOverlay] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Initialize network status
  useEffect(() => {
    const initializeNetworkStatus = async () => {
      try {
        const status = await Network.getStatus();
        setNetworkStatus({
          connected: status.connected,
          connectionType: status.connectionType,
        });
      } catch (error) {
        console.error('Failed to get network status:', error);
        // Use default network status on error
        setNetworkStatus({ connected: true, connectionType: 'unknown' });
      }
    };

    initializeNetworkStatus();
  }, []);

  // Handle online status changes
  useEffect(() => {
    const handleOnline = () => {
      console.log('App is back online');
      setNetworkStatus((prev) => ({ ...prev, connected: true }));
    };

    const handleOffline = () => {
      console.log('App is offline');
      setNetworkStatus((prev) => ({ ...prev, connected: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle overlay visibility with countdown
  useEffect(() => {
    let countdownTimer: NodeJS.Timeout;
    let overlayTimer: NodeJS.Timeout;

    if (!networkStatus.connected) {
      // User went offline - start countdown before showing overlay
      setIsTransitioning(true);
      setCountdown(3);

      countdownTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            setShowOverlay(true);
            setIsTransitioning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (networkStatus.connected && (showOverlay || isTransitioning)) {
      // User came back online - start countdown before hiding overlay
      setIsTransitioning(true);
      setCountdown(3);

      countdownTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            overlayTimer = setTimeout(() => {
              setShowOverlay(false);
              setIsTransitioning(false);
            }, 500); // Small delay for smooth transition
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownTimer) clearInterval(countdownTimer);
      if (overlayTimer) clearTimeout(overlayTimer);
    };
  }, [networkStatus.connected, showOverlay, isTransitioning]);

  // Manual retry function
  const handleRetry = async () => {
    try {
      const status = await Network.getStatus();
      setNetworkStatus({
        connected: status.connected,
        connectionType: status.connectionType,
      });
    } catch (error) {
      console.error('Failed to retry network status:', error);
      // Fallback check
      setNetworkStatus({
        connected: navigator.onLine,
        connectionType: 'unknown',
      });
    }
  };

  // Don't render anything if network is connected and overlay is not visible
  if (networkStatus.connected && !showOverlay && !isTransitioning) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 w-full h-full flex align-items-center justify-content-center p-4 transition-all duration-500 ${
        showOverlay ? 'opacity-100' : 'opacity-80'
      }`}
      style={{
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <Card className='max-w-md w-full shadow-8 border-round-2xl overflow-hidden'>
        <div className='text-center p-4'>
          {!networkStatus.connected ? (
            // Offline state
            <>
              <div className='mb-4'>
                <i
                  className='pi pi-wifi text-6xl text-red-500 mb-3'
                  style={{ transform: 'rotate(45deg)' }}
                ></i>
                <div className='relative'>
                  <i
                    className='pi pi-times absolute text-2xl text-red-500'
                    style={{ top: '-2rem', right: '1rem' }}
                  ></i>
                </div>
              </div>

              <h2 className='text-2xl font-bold text-color mb-2'>
                No Internet Connection
              </h2>
              <p className='text-color-secondary mb-4'>
                Please check your internet connection and try again.
              </p>

              {isTransitioning && (
                <div className='flex align-items-center justify-content-center gap-2 mb-3'>
                  <ProgressSpinner
                    style={{ width: '20px', height: '20px' }}
                    strokeWidth='4'
                    className='text-orange-500'
                  />
                  <span className='text-sm text-color-secondary'>
                    Checking connection in {countdown}s...
                  </span>
                </div>
              )}

              <div className='flex align-items-center justify-content-center gap-2 mb-4'>
                <Badge
                  value='OFFLINE'
                  severity='danger'
                  className='p-badge-lg'
                />
                <span className='text-xs text-color-secondary uppercase'>
                  {networkStatus.connectionType}
                </span>
              </div>

              {/* Retry button */}
              <Button
                label='Retry Connection'
                icon='pi pi-refresh'
                className='p-button-outlined p-button-rounded mb-4'
                onClick={handleRetry}
              />
            </>
          ) : (
            // Coming back online state
            <>
              <div className='mb-4'>
                <i className='pi pi-wifi text-6xl text-green-500 mb-3'></i>
              </div>

              <h2 className='text-2xl font-bold text-color mb-2'>
                Connection Restored!
              </h2>
              <p className='text-color-secondary mb-4'>
                Your internet connection has been restored.
              </p>

              <div className='flex align-items-center justify-content-center gap-2 mb-3'>
                <ProgressSpinner
                  style={{ width: '20px', height: '20px' }}
                  strokeWidth='4'
                  className='text-green-500'
                />
                <span className='text-sm text-color-secondary'>
                  Reconnecting in {countdown}s...
                </span>
              </div>

              <div className='flex align-items-center justify-content-center gap-2'>
                <Badge
                  value='ONLINE'
                  severity='success'
                  className='p-badge-lg'
                />
                <span className='text-xs text-color-secondary uppercase'>
                  {networkStatus.connectionType}
                </span>
              </div>
            </>
          )}

          {/* Connection tips */}
          <div className='mt-4 p-3 bg-gray-50 border-round-lg'>
            <div className='text-left'>
              <div className='flex align-items-center gap-2 mb-1'>
                <i className='pi pi-info-circle text-primary text-sm'></i>
                <span className='text-sm font-medium text-color'>
                  Quick Tips:
                </span>
              </div>
              <ul className='text-xs text-color-secondary m-0 pl-4'>
                <li>Check your WiFi or mobile data</li>
                <li>Try turning airplane mode on/off</li>
                <li>Move to an area with better signal</li>
                <li>Restart your router if using WiFi</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NetworkStatusHOC;
