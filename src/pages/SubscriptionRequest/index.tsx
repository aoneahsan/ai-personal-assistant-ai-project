import { UserSubscriptionRequest } from '@/components/SubscriptionManagement/UserSubscriptionRequest';
import { useUserDataZState } from '@/zustandStates/userState';
import { useNavigate } from '@tanstack/react-router';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import React from 'react';

const SubscriptionRequestPage: React.FC = () => {
  const user = useUserDataZState((state) => state.data);
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Card>
          <div className='text-center p-4'>
            <h2 className='text-2xl font-bold mb-4'>Please Log In</h2>
            <p className='text-gray-600 mb-4'>
              You need to be logged in to manage your subscription.
            </p>
            <Button
              label='Go to Login'
              icon='pi pi-sign-in'
              onClick={() => navigate({ to: '/auth' })}
            />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className='subscription-request-page p-4 max-w-7xl mx-auto'>
      {/* Header */}
      <Card className='mb-6'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-3xl font-bold text-gray-800 mb-2'>
              Subscription Management
            </h1>
            <p className='text-gray-600'>
              Manage your subscription plan and submit upgrade requests
            </p>
          </div>
          <Button
            label='Back to Dashboard'
            icon='pi pi-arrow-left'
            severity='secondary'
            onClick={() => navigate({ to: '/dashboard' })}
          />
        </div>
      </Card>

      {/* User Subscription Request Component */}
      <UserSubscriptionRequest />
    </div>
  );
};

export default SubscriptionRequestPage;
