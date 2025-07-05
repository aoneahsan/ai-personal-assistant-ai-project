import { BUTTON_LABELS } from '@/utils/constants/generic/labels';
import { CSS_CLASSES } from '@/utils/constants/generic/styles';
import { UI_ICONS } from '@/utils/constants/generic/ui';
import { ROUTES } from '@/utils/constants/routingConstants';
import { useUserDataZState } from '@/zustandStates/userState';
import { useNavigate } from '@tanstack/react-router';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = ROUTES.AUTH,
  fallback,
  requireAuth = true,
}) => {
  const user = useUserDataZState((state) => state.data);
  const navigate = useNavigate();

  // If auth is not required, always render children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // If user is not authenticated
  if (!user) {
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
              Authentication Required
            </h3>
            <p className={CSS_CLASSES.SPACING.MB_4}>
              You need to be logged in to access this page.
            </p>
            <Button
              label={BUTTON_LABELS.SIGN_IN}
              icon={UI_ICONS.LOGIN}
              onClick={() => navigate({ to: redirectTo })}
            />
          </div>
        </Card>
      </div>
    );
  }

  // If user is authenticated, render children
  return <>{children}</>;
};

export default ProtectedRoute;
