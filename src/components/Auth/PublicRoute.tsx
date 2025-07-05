import { CSS_CLASSES } from '@/utils/constants/generic/styles';
import { UI_ICONS } from '@/utils/constants/generic/ui';
import { ROUTES } from '@/utils/constants/routingConstants';
import { useUserDataZState } from '@/zustandStates/userState';
import { useNavigate } from '@tanstack/react-router';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import React from 'react';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
  requireGuest?: boolean;
}

const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = ROUTES.DASHBOARD,
  fallback,
  requireGuest = false,
}) => {
  const user = useUserDataZState((state) => state.data);
  const navigate = useNavigate();

  // If guest is not required, always render children
  if (!requireGuest) {
    return <>{children}</>;
  }

  // If user is authenticated and we require guest
  if (user && requireGuest) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div
        className={`${CSS_CLASSES.FLEX.FLEX} ${CSS_CLASSES.FLEX.ITEMS_CENTER} ${CSS_CLASSES.FLEX.JUSTIFY_CENTER} ${CSS_CLASSES.LAYOUT.FULL_HEIGHT}`}
      >
        <Card>
          <div className={CSS_CLASSES.TYPOGRAPHY.TEXT_CENTER}>
            <h3
              className={`${CSS_CLASSES.TYPOGRAPHY.HEADING_MEDIUM} ${CSS_CLASSES.SPACING.MB_2}`}
            >
              Already Logged In
            </h3>
            <p className={CSS_CLASSES.SPACING.MB_4}>
              You are already logged in. Redirecting to dashboard...
            </p>
            <Button
              label='Go to Dashboard'
              icon={UI_ICONS.DASHBOARD}
              onClick={() => navigate({ to: redirectTo })}
            />
          </div>
        </Card>
      </div>
    );
  }

  // If user is not authenticated or guest is allowed, render children
  return <>{children}</>;
};

export default PublicRoute;
