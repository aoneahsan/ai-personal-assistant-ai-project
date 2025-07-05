import { ROUTES } from '@/utils/constants/routingConstants';
import { Navigate } from '@tanstack/react-router';
import React from 'react';

// This component is deprecated - use the new nested dashboard routes instead
// Redirect to the dashboard overview page
const Dashboard: React.FC = () => {
  return <Navigate to={ROUTES.DASHBOARD} />;
};

export default Dashboard;
