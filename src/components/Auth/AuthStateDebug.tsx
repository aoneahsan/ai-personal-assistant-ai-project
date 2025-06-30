import { auth } from '@/services/firebase';
import {
  useIsAuthenticatedZState,
  useUserDataZState,
} from '@/zustandStates/userState';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import React, { useEffect, useState } from 'react';

const AuthStateDebug: React.FC = () => {
  const userData = useUserDataZState((state) => state.data);
  const isAuthenticated = useIsAuthenticatedZState();
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-refresh every 2 seconds to show real-time state
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!import.meta.env.DEV) {
    return null; // Only show in development
  }

  const firebaseUser = auth.currentUser;

  return (
    <div
      className='fixed bottom-4 left-4 z-5 max-w-sm'
      style={{ fontSize: '12px' }}
    >
      <Card
        title='🔍 Auth Debug'
        className='border-2'
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '2px solid #e74c3c',
        }}
      >
        <div className='space-y-2'>
          <div className='flex justify-content-between'>
            <strong>Is Authenticated:</strong>
            <span
              className={isAuthenticated ? 'text-green-600' : 'text-red-600'}
            >
              {isAuthenticated ? '✅ Yes' : '❌ No'}
            </span>
          </div>

          <div className='flex justify-content-between'>
            <strong>Firebase User:</strong>
            <span className={firebaseUser ? 'text-green-600' : 'text-red-600'}>
              {firebaseUser ? '✅ Yes' : '❌ No'}
            </span>
          </div>

          <div className='flex justify-content-between'>
            <strong>Zustand User:</strong>
            <span className={userData ? 'text-green-600' : 'text-red-600'}>
              {userData ? '✅ Yes' : '❌ No'}
            </span>
          </div>

          {firebaseUser && (
            <div className='border-top-1 pt-2 mt-2'>
              <div>
                <strong>Firebase Email:</strong> {firebaseUser.email}
              </div>
              <div>
                <strong>Firebase UID:</strong>{' '}
                {firebaseUser.uid?.substring(0, 8)}...
              </div>
            </div>
          )}

          {userData && (
            <div className='border-top-1 pt-2 mt-2'>
              <div>
                <strong>Zustand Email:</strong> {userData.email}
              </div>
              <div>
                <strong>Zustand ID:</strong> {userData.id?.substring(0, 8)}...
              </div>
            </div>
          )}

          <div className='border-top-1 pt-2 mt-2 text-center'>
            <Button
              size='small'
              className='p-button-sm'
              onClick={() => setRefreshKey((prev) => prev + 1)}
            >
              🔄 Refresh ({refreshKey})
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AuthStateDebug;
