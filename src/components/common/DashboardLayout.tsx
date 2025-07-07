import { useRoleCheck } from '@/components/common/RoleGuard';
import { useTheme } from '@/hooks/useTheme';
import { Permission } from '@/types/user/roles';
import { ROUTES } from '@/utils/constants/routingConstants';
import { Link, Outlet, useLocation } from '@tanstack/react-router';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import React, { useState } from 'react';

const DashboardLayout: React.FC = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const { hasPermission } = useRoleCheck();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Determine active section based on current route
  const getActiveSection = () => {
    const path = location.pathname;
    if (path === ROUTES.DASHBOARD_CHATS) return 'chats';
    if (path === ROUTES.DASHBOARD_CHAT_EMBEDS) return 'embeds';
    if (path === ROUTES.DASHBOARD_FEEDBACK_EMBEDS) return 'feedback-embeds';
    if (path === ROUTES.DASHBOARD_ACCOUNT) return 'account';
    if (path === ROUTES.EDIT_PROFILE) return 'profile';
    if (path.startsWith('/dashboard/chats/view/')) return 'chats';
    return 'overview';
  };

  const activeSection = getActiveSection();

  const sidebarItems = [
    {
      key: 'overview',
      label: 'Overview',
      icon: 'pi pi-home',
      route: ROUTES.DASHBOARD,
    },
    {
      key: 'chats',
      label: 'Chats',
      icon: 'pi pi-comments',
      route: ROUTES.DASHBOARD_CHATS,
    },
    {
      key: 'embeds',
      label: 'Chat Embeds',
      icon: 'pi pi-code',
      route: ROUTES.DASHBOARD_CHAT_EMBEDS,
    },
    {
      key: 'feedback-embeds',
      label: 'Feedback Embeds',
      icon: 'pi pi-comment',
      route: ROUTES.DASHBOARD_FEEDBACK_EMBEDS,
    },
    {
      key: 'account',
      label: 'Account',
      icon: 'pi pi-user',
      route: ROUTES.DASHBOARD_ACCOUNT,
    },
    {
      key: 'profile',
      label: 'Profile',
      icon: 'pi pi-user-edit',
      route: ROUTES.EDIT_PROFILE,
    },
    ...(hasPermission(Permission.ACCESS_ADMIN_PANEL)
      ? [
          {
            key: 'admin',
            label: 'Admin Panel',
            icon: 'pi pi-cog',
            route: ROUTES.ADMIN,
          },
        ]
      : []),
  ];

  return (
    <div
      className='min-h-screen'
      style={{ backgroundColor: theme.surface || '#f8f9fa' }}
    >
      {/* Mobile Header */}
      <div className='lg:hidden flex align-items-center justify-content-between p-3 border-bottom-1 surface-border'>
        <Button
          icon='pi pi-bars'
          className='p-button-text p-button-rounded'
          onClick={() => setSidebarVisible(true)}
        />
        <div
          className='font-bold text-lg'
          style={{ color: theme.textPrimary }}
        >
          Dashboard
        </div>
        <div className='w-3rem'></div>
      </div>

      {/* Desktop Layout */}
      <div className='flex'>
        {/* Desktop Sidebar */}
        <div className='hidden lg:flex flex-column w-16rem border-right-1 surface-border min-h-screen'>
          <div className='p-4 border-bottom-1 surface-border'>
            <div
              className='font-bold text-xl'
              style={{ color: theme.textPrimary }}
            >
              Dashboard
            </div>
          </div>
          <div className='flex-1 p-3'>
            {sidebarItems.map((item) => (
              <Link
                key={item.key}
                to={item.route}
                className='block no-underline'
              >
                <div
                  className={`flex align-items-center gap-3 p-3 border-round-lg cursor-pointer mb-2 ${
                    activeSection === item.key
                      ? 'bg-primary-50 border-primary'
                      : 'hover:bg-gray-50'
                  }`}
                  style={{
                    color:
                      activeSection === item.key
                        ? theme.primary
                        : theme.textPrimary,
                    backgroundColor:
                      activeSection === item.key
                        ? `${theme.primary}15`
                        : 'transparent',
                  }}
                >
                  <i className={item.icon}></i>
                  <span className='font-medium'>{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Content Area - Router Outlet */}
        <div className='flex-1 p-4'>
          <Outlet />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sidebar
        visible={sidebarVisible}
        onHide={() => setSidebarVisible(false)}
        className='w-16rem'
        position='left'
      >
        <div className='p-4 border-bottom-1 surface-border'>
          <div
            className='font-bold text-xl'
            style={{ color: theme.textPrimary }}
          >
            Dashboard
          </div>
        </div>
        <div className='p-3'>
          {sidebarItems.map((item) => (
            <Link
              key={item.key}
              to={item.route}
              className='block no-underline'
              onClick={() => setSidebarVisible(false)}
            >
              <div
                className={`flex align-items-center gap-3 p-3 border-round-lg cursor-pointer mb-2 ${
                  activeSection === item.key
                    ? 'bg-primary-50 border-primary'
                    : 'hover:bg-gray-50'
                }`}
                style={{
                  color:
                    activeSection === item.key
                      ? theme.primary
                      : theme.textPrimary,
                  backgroundColor:
                    activeSection === item.key
                      ? `${theme.primary}15`
                      : 'transparent',
                }}
              >
                <i className={item.icon}></i>
                <span className='font-medium'>{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </Sidebar>
    </div>
  );
};

export default DashboardLayout;
