import { UserSubscriptionRequest } from '@/components/SubscriptionManagement/UserSubscriptionRequest';
import { useTheme } from '@/hooks/useTheme';
import { BUTTON_LABELS, PAGE_TITLES } from '@/utils/constants/generic/labels';
import { CSS_CLASSES } from '@/utils/constants/generic/styles';
import { ROUTES } from '@/utils/constants/routingConstants';
import { useUserDataZState } from '@/zustandStates/userState';
import { useNavigate } from '@tanstack/react-router';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import React from 'react';

const SubscriptionRequestPage: React.FC = () => {
  const user = useUserDataZState((state) => state.data);
  const navigate = useNavigate();
  const { theme } = useTheme();

  if (!user) {
    return (
      <div
        className={`${CSS_CLASSES.LAYOUT.FULL_HEIGHT} ${CSS_CLASSES.FLEX.FLEX} ${CSS_CLASSES.FLEX.ITEMS_CENTER} ${CSS_CLASSES.FLEX.JUSTIFY_CENTER}`}
        style={{ background: theme.background }}
      >
        <Card
          className={`${CSS_CLASSES.LAYOUT.MAX_WIDTH_MD} ${CSS_CLASSES.LAYOUT.FULL_WIDTH} ${CSS_CLASSES.SPACING.MX_4}`}
        >
          <div className={CSS_CLASSES.TYPOGRAPHY.TEXT_CENTER}>
            <h2
              className={`${CSS_CLASSES.TYPOGRAPHY.HEADING_MEDIUM} ${CSS_CLASSES.SPACING.MB_4}`}
            >
              {PAGE_TITLES.SUBSCRIPTION_REQUEST}
            </h2>
            <p className={CSS_CLASSES.SPACING.MB_4}>
              Please log in to request a subscription upgrade. Once logged in,
              you can access the subscription management features in your
              dashboard.
            </p>
            <div
              className={`${CSS_CLASSES.FLEX.FLEX} ${CSS_CLASSES.FLEX.FLEX_COL} ${CSS_CLASSES.GRID.GAP_3} sm:flex-row sm:justify-content-center`}
            >
              <Button
                label={BUTTON_LABELS.SIGN_IN}
                icon='pi pi-sign-in'
                onClick={() => navigate({ to: ROUTES.AUTH })}
              />
              <Button
                label='Go to Dashboard'
                icon='pi pi-home'
                severity='secondary'
                onClick={() => navigate({ to: ROUTES.DASHBOARD })}
              />
            </div>
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
            onClick={() => navigate({ to: ROUTES.DASHBOARD })}
          />
        </div>
      </Card>

      {/* User Subscription Request Component */}
      <UserSubscriptionRequest />
    </div>
  );
};

export default SubscriptionRequestPage;
