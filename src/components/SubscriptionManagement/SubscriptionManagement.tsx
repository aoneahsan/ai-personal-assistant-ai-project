import { featureFlagService } from '@/services/featureFlagService';
import { SubscriptionPlan, UserSubscription } from '@/types/user/subscription';
import { consoleLog } from '@/utils/helpers/consoleHelper';
import { useUserDataZState } from '@/zustandStates/userState';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Panel } from 'primereact/panel';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import React, { useRef, useState } from 'react';
import './SubscriptionManagement.scss';

interface SubscriptionManagementProps {
  visible: boolean;
  onHide: () => void;
}

interface PlanFeature {
  name: string;
  description: string;
  icon: string;
  available: boolean;
}

interface BillingHistoryItem {
  id: string;
  date: Date;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl?: string;
}

const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({
  visible,
  onHide,
}) => {
  const currentUser = useUserDataZState((state) => state.data);
  const toast = useRef<Toast>(null);

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const [showUpgradeConfirm, setShowUpgradeConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get current subscription (mock data for now)
  const currentSubscription: UserSubscription = currentUser?.subscription || {
    plan: SubscriptionPlan.FREE,
    isActive: true,
    startDate: new Date(),
    endDate: undefined,
    features: featureFlagService.getAvailableFeatures(SubscriptionPlan.FREE),
  };

  // Plan configurations
  const planConfigs = {
    [SubscriptionPlan.FREE]: {
      name: 'Free Plan',
      price: 0,
      billing: 'Forever',
      description: 'Perfect for getting started',
      color: '#6B7280',
      features: [
        {
          name: 'Basic Chat',
          description: 'Send and receive messages',
          icon: 'pi-comments',
          available: true,
        },
        {
          name: 'File Sharing',
          description: 'Share images and documents',
          icon: 'pi-file',
          available: true,
        },
        {
          name: 'Message Editing',
          description: 'Edit your messages',
          icon: 'pi-pencil',
          available: false,
        },
        {
          name: 'Message History',
          description: 'View edit history',
          icon: 'pi-history',
          available: false,
        },
        {
          name: 'Message Deletion',
          description: 'Delete messages',
          icon: 'pi-trash',
          available: false,
        },
        {
          name: 'Advanced Search',
          description: 'Search through messages',
          icon: 'pi-search',
          available: false,
        },
        {
          name: 'File Backup',
          description: 'Cloud file backup',
          icon: 'pi-cloud-upload',
          available: false,
        },
        {
          name: 'Priority Support',
          description: '24/7 customer support',
          icon: 'pi-headphones',
          available: false,
        },
      ] as PlanFeature[],
    },
    [SubscriptionPlan.PRO]: {
      name: 'Pro Plan',
      price: 9.99,
      billing: 'per month',
      description: 'For power users who need more',
      color: '#3B82F6',
      features: [
        {
          name: 'Basic Chat',
          description: 'Send and receive messages',
          icon: 'pi-comments',
          available: true,
        },
        {
          name: 'File Sharing',
          description: 'Share images and documents',
          icon: 'pi-file',
          available: true,
        },
        {
          name: 'Message Editing',
          description: 'Edit your messages',
          icon: 'pi-pencil',
          available: true,
        },
        {
          name: 'Message History',
          description: 'View edit history',
          icon: 'pi-history',
          available: true,
        },
        {
          name: 'Message Deletion',
          description: 'Delete messages',
          icon: 'pi-trash',
          available: true,
        },
        {
          name: 'Advanced Search',
          description: 'Search through messages',
          icon: 'pi-search',
          available: true,
        },
        {
          name: 'File Backup',
          description: 'Cloud file backup',
          icon: 'pi-cloud-upload',
          available: false,
        },
        {
          name: 'Priority Support',
          description: '24/7 customer support',
          icon: 'pi-headphones',
          available: false,
        },
      ] as PlanFeature[],
    },
    [SubscriptionPlan.PREMIUM]: {
      name: 'Premium Plan',
      price: 19.99,
      billing: 'per month',
      description: 'Everything you need for professional use',
      color: '#8B5CF6',
      features: [
        {
          name: 'Basic Chat',
          description: 'Send and receive messages',
          icon: 'pi-comments',
          available: true,
        },
        {
          name: 'File Sharing',
          description: 'Share images and documents',
          icon: 'pi-file',
          available: true,
        },
        {
          name: 'Message Editing',
          description: 'Edit your messages',
          icon: 'pi-pencil',
          available: true,
        },
        {
          name: 'Message History',
          description: 'View edit history',
          icon: 'pi-history',
          available: true,
        },
        {
          name: 'Message Deletion',
          description: 'Delete messages',
          icon: 'pi-trash',
          available: true,
        },
        {
          name: 'Advanced Search',
          description: 'Search through messages',
          icon: 'pi-search',
          available: true,
        },
        {
          name: 'File Backup',
          description: 'Cloud file backup',
          icon: 'pi-cloud-upload',
          available: true,
        },
        {
          name: 'Priority Support',
          description: '24/7 customer support',
          icon: 'pi-headphones',
          available: true,
        },
      ] as PlanFeature[],
    },
    [SubscriptionPlan.ENTERPRISE]: {
      name: 'Enterprise Plan',
      price: 49.99,
      billing: 'per month',
      description: 'Advanced features for teams and organizations',
      color: '#EF4444',
      features: [
        {
          name: 'Basic Chat',
          description: 'Send and receive messages',
          icon: 'pi-comments',
          available: true,
        },
        {
          name: 'File Sharing',
          description: 'Share images and documents',
          icon: 'pi-file',
          available: true,
        },
        {
          name: 'Message Editing',
          description: 'Edit your messages',
          icon: 'pi-pencil',
          available: true,
        },
        {
          name: 'Message History',
          description: 'View edit history',
          icon: 'pi-history',
          available: true,
        },
        {
          name: 'Message Deletion',
          description: 'Delete messages',
          icon: 'pi-trash',
          available: true,
        },
        {
          name: 'Advanced Search',
          description: 'Search through messages',
          icon: 'pi-search',
          available: true,
        },
        {
          name: 'File Backup',
          description: 'Cloud file backup',
          icon: 'pi-cloud-upload',
          available: true,
        },
        {
          name: 'Priority Support',
          description: '24/7 customer support',
          icon: 'pi-headphones',
          available: true,
        },
      ] as PlanFeature[],
    },
  };

  // Mock billing history
  const billingHistory: BillingHistoryItem[] = [
    {
      id: '1',
      date: new Date(2024, 11, 1),
      description: 'Pro Plan - Monthly Subscription',
      amount: 9.99,
      status: 'paid',
      downloadUrl: '#',
    },
    {
      id: '2',
      date: new Date(2024, 10, 1),
      description: 'Pro Plan - Monthly Subscription',
      amount: 9.99,
      status: 'paid',
      downloadUrl: '#',
    },
    {
      id: '3',
      date: new Date(2024, 9, 1),
      description: 'Pro Plan - Monthly Subscription',
      amount: 9.99,
      status: 'paid',
      downloadUrl: '#',
    },
  ];

  const handlePlanUpgrade = async (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowUpgradeConfirm(true);
  };

  const confirmUpgrade = async () => {
    if (!selectedPlan) return;

    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.current?.show({
        severity: 'success',
        summary: 'Plan Updated',
        detail: `Successfully upgraded to ${planConfigs[selectedPlan].name}`,
        life: 5000,
      });

      consoleLog('Plan upgraded to:', selectedPlan);
      setShowUpgradeConfirm(false);

      // In real app, this would update the user's subscription in the backend
      // and refresh the user data
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Upgrade Failed',
        detail: 'Failed to upgrade plan. Please try again.',
        life: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancelSubscription = async () => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.current?.show({
        severity: 'success',
        summary: 'Subscription Cancelled',
        detail: 'Your subscription has been cancelled successfully.',
        life: 5000,
      });

      setShowCancelConfirm(false);

      // In real app, this would cancel the subscription in the backend
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Cancellation Failed',
        detail: 'Failed to cancel subscription. Please try again.',
        life: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusTag = (status: string) => {
    const severity =
      status === 'active'
        ? 'success'
        : status === 'cancelled'
          ? 'danger'
          : status === 'pending'
            ? 'warning'
            : 'info';

    return (
      <Tag
        value={status.toUpperCase()}
        severity={severity}
      />
    );
  };

  const getBillingStatusTag = (status: string) => {
    const severity =
      status === 'paid'
        ? 'success'
        : status === 'pending'
          ? 'warning'
          : 'danger';

    return (
      <Tag
        value={status.toUpperCase()}
        severity={severity}
      />
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderPlanCard = (planKey: SubscriptionPlan) => {
    const plan = planConfigs[planKey];
    const isCurrentPlan = currentSubscription.plan === planKey;
    const isUpgrade =
      planKey !== SubscriptionPlan.FREE &&
      (currentSubscription.plan === SubscriptionPlan.FREE ||
        (currentSubscription.plan === SubscriptionPlan.PRO &&
          (planKey === SubscriptionPlan.PREMIUM ||
            planKey === SubscriptionPlan.ENTERPRISE)) ||
        (currentSubscription.plan === SubscriptionPlan.PREMIUM &&
          planKey === SubscriptionPlan.ENTERPRISE));

    return (
      <Card
        key={planKey}
        className={`plan-card ${isCurrentPlan ? 'current-plan' : ''}`}
        style={{ borderTop: `4px solid ${plan.color}` }}
      >
        <div className='plan-header'>
          <div className='flex justify-content-between align-items-start mb-3'>
            <div>
              <h3
                className='plan-name'
                style={{ color: plan.color }}
              >
                {plan.name}
                {isCurrentPlan && (
                  <Badge
                    value='Current'
                    className='ml-2'
                    severity='info'
                  />
                )}
              </h3>
              <p className='plan-description text-600'>{plan.description}</p>
            </div>
            <div className='plan-price text-right'>
              <div
                className='price-amount'
                style={{ color: plan.color }}
              >
                {plan.price === 0 ? 'Free' : formatCurrency(plan.price)}
              </div>
              <div className='price-billing text-500 text-sm'>
                {plan.billing}
              </div>
            </div>
          </div>

          <Divider />

          <div className='plan-features'>
            <h4 className='mb-3'>Features Included</h4>
            <div className='feature-list'>
              {plan.features.map((feature, index) => (
                <div
                  key={index}
                  className='feature-item flex align-items-center mb-2'
                >
                  <i
                    className={`${feature.icon} mr-2 ${feature.available ? 'text-green-500' : 'text-gray-400'}`}
                  />
                  <div className='flex-1'>
                    <span
                      className={feature.available ? 'text-900' : 'text-500'}
                    >
                      {feature.name}
                    </span>
                    <div className='text-sm text-600'>
                      {feature.description}
                    </div>
                  </div>
                  {feature.available ? (
                    <i className='pi pi-check text-green-500' />
                  ) : (
                    <i className='pi pi-times text-red-500' />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Divider />

          <div className='plan-actions'>
            {isCurrentPlan ? (
              <div className='text-center'>
                <Tag
                  value='Your Current Plan'
                  severity='info'
                  className='mb-2'
                />
                {planKey !== SubscriptionPlan.FREE && (
                  <div>
                    <Button
                      label='Cancel Subscription'
                      icon='pi pi-times'
                      className='p-button-outlined p-button-danger mt-2'
                      onClick={handleCancelSubscription}
                      size='small'
                    />
                  </div>
                )}
              </div>
            ) : (
              <Button
                label={isUpgrade ? 'Upgrade' : 'Downgrade'}
                icon={isUpgrade ? 'pi pi-arrow-up' : 'pi pi-arrow-down'}
                className={
                  isUpgrade
                    ? 'p-button-success w-full'
                    : 'p-button-outlined w-full'
                }
                onClick={() => handlePlanUpgrade(planKey)}
                disabled={
                  planKey === SubscriptionPlan.FREE &&
                  currentSubscription.plan === SubscriptionPlan.FREE
                }
              />
            )}
          </div>
        </div>
      </Card>
    );
  };

  const billingColumns = [
    {
      field: 'date',
      header: 'Date',
      body: (rowData: BillingHistoryItem) => formatDate(rowData.date),
    },
    {
      field: 'description',
      header: 'Description',
    },
    {
      field: 'amount',
      header: 'Amount',
      body: (rowData: BillingHistoryItem) => formatCurrency(rowData.amount),
    },
    {
      field: 'status',
      header: 'Status',
      body: (rowData: BillingHistoryItem) =>
        getBillingStatusTag(rowData.status),
    },
    {
      field: 'actions',
      header: 'Actions',
      body: (rowData: BillingHistoryItem) => (
        <Button
          icon='pi pi-download'
          className='p-button-text p-button-sm'
          onClick={() => consoleLog('Download invoice:', rowData.id)}
          tooltip='Download Invoice'
        />
      ),
    },
  ];

  return (
    <>
      <Dialog
        header='Subscription Management'
        visible={visible}
        style={{ width: '95vw', maxWidth: '1200px' }}
        onHide={onHide}
        maximizable
        modal
        className='subscription-management-dialog'
      >
        <div className='subscription-content'>
          {/* Current Subscription Overview */}
          <Panel
            header='Current Subscription'
            className='mb-4'
          >
            <div className='current-subscription-info'>
              <div className='grid'>
                <div className='col-12 md:col-6'>
                  <div className='subscription-detail'>
                    <h4>Plan Details</h4>
                    <div className='flex align-items-center gap-2 mb-2'>
                      <strong>
                        {planConfigs[currentSubscription.plan].name}
                      </strong>
                      {getStatusTag(
                        currentSubscription.isActive ? 'active' : 'inactive'
                      )}
                    </div>
                    <p className='text-600'>
                      {planConfigs[currentSubscription.plan].description}
                    </p>
                    <div className='billing-info'>
                      <div className='text-sm text-500'>
                        <i className='pi pi-calendar mr-1' />
                        Started: {formatDate(currentSubscription.startDate)}
                      </div>
                      {currentSubscription.endDate && (
                        <div className='text-sm text-500 mt-1'>
                          <i className='pi pi-clock mr-1' />
                          Ends: {formatDate(currentSubscription.endDate)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className='col-12 md:col-6'>
                  <div className='subscription-stats'>
                    <h4>Usage Summary</h4>
                    <div className='stats-grid'>
                      <div className='stat-item'>
                        <i className='pi pi-comments text-blue-500' />
                        <div>
                          <div className='stat-value'>1,234</div>
                          <div className='stat-label'>Messages Sent</div>
                        </div>
                      </div>
                      <div className='stat-item'>
                        <i className='pi pi-pencil text-green-500' />
                        <div>
                          <div className='stat-value'>56</div>
                          <div className='stat-label'>Messages Edited</div>
                        </div>
                      </div>
                      <div className='stat-item'>
                        <i className='pi pi-file text-purple-500' />
                        <div>
                          <div className='stat-value'>89</div>
                          <div className='stat-label'>Files Shared</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          {/* Available Plans */}
          <Panel
            header='Available Plans'
            className='mb-4'
          >
            <div className='plans-grid'>
              <div className='grid'>
                {(Object.keys(planConfigs) as SubscriptionPlan[]).map(
                  (planKey) => (
                    <div
                      key={planKey}
                      className='col-12 lg:col-6 xl:col-3'
                    >
                      {renderPlanCard(planKey)}
                    </div>
                  )
                )}
              </div>
            </div>
          </Panel>

          {/* Billing History */}
          <Panel
            header='Billing History'
            className='mb-4'
          >
            <DataTable
              value={billingHistory}
              paginator
              rows={5}
              className='billing-history-table'
              emptyMessage='No billing history available'
            >
              {billingColumns.map((col) => (
                <Column
                  key={col.field}
                  {...col}
                />
              ))}
            </DataTable>
          </Panel>
        </div>
      </Dialog>

      {/* Upgrade Confirmation Dialog */}
      <Dialog
        header='Confirm Plan Change'
        visible={showUpgradeConfirm}
        style={{ width: '400px' }}
        onHide={() => setShowUpgradeConfirm(false)}
        footer={
          <div className='flex justify-content-end gap-2'>
            <Button
              label='Cancel'
              icon='pi pi-times'
              className='p-button-text'
              onClick={() => setShowUpgradeConfirm(false)}
              disabled={isProcessing}
            />
            <Button
              label='Confirm'
              icon='pi pi-check'
              onClick={confirmUpgrade}
              loading={isProcessing}
            />
          </div>
        }
      >
        {selectedPlan && (
          <div className='upgrade-confirmation'>
            <div className='text-center mb-3'>
              <i className='pi pi-info-circle text-blue-500 text-4xl mb-2' />
              <h4>Plan Change Confirmation</h4>
            </div>
            <p>
              Are you sure you want to change your plan to{' '}
              <strong>
                {planConfigs[selectedPlan as keyof typeof planConfigs].name}
              </strong>
              ?
            </p>
            <div className='plan-change-summary bg-gray-50 p-3 border-round mt-3'>
              <div className='flex justify-content-between'>
                <span>New Plan:</span>
                <strong>
                  {planConfigs[selectedPlan as keyof typeof planConfigs].name}
                </strong>
              </div>
              <div className='flex justify-content-between'>
                <span>Price:</span>
                <strong>
                  {planConfigs[selectedPlan as keyof typeof planConfigs]
                    .price === 0
                    ? 'Free'
                    : `${formatCurrency(planConfigs[selectedPlan as keyof typeof planConfigs].price)} ${planConfigs[selectedPlan as keyof typeof planConfigs].billing}`}
                </strong>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <Dialog
        header='Cancel Subscription'
        visible={showCancelConfirm}
        style={{ width: '400px' }}
        onHide={() => setShowCancelConfirm(false)}
        footer={
          <div className='flex justify-content-end gap-2'>
            <Button
              label='Keep Subscription'
              icon='pi pi-times'
              className='p-button-text'
              onClick={() => setShowCancelConfirm(false)}
              disabled={isProcessing}
            />
            <Button
              label='Cancel Subscription'
              icon='pi pi-trash'
              className='p-button-danger'
              onClick={confirmCancelSubscription}
              loading={isProcessing}
            />
          </div>
        }
      >
        <div className='cancel-confirmation text-center'>
          <i className='pi pi-exclamation-triangle text-orange-500 text-4xl mb-3' />
          <h4>Are you sure?</h4>
          <p className='text-600'>
            Your subscription will be cancelled at the end of the current
            billing period. You'll still have access to premium features until
            then.
          </p>
          <div className='bg-orange-50 p-3 border-round mt-3'>
            <strong>Note:</strong> This action cannot be undone. You'll need to
            re-subscribe to regain access to premium features.
          </div>
        </div>
      </Dialog>

      <Toast ref={toast} />
    </>
  );
};

export default SubscriptionManagement;
