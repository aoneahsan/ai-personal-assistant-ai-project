import {
  cancelSubscriptionRequest,
  createSubscriptionRequest,
  getUserPendingRequest,
  getUserRequestHistory,
} from '@/services/subscriptionService';
import {
  SubscriptionPlan,
  SubscriptionRequest,
  SubscriptionRequestStatus,
  calculateUpgradeCost,
  getPlanDetails,
  isPlanUpgrade,
} from '@/types/user/subscription';
import { useUserDataZState } from '@/zustandStates/userState';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';

interface UserSubscriptionRequestProps {
  className?: string;
}

const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const UserSubscriptionRequest: React.FC<
  UserSubscriptionRequestProps
> = ({ className }) => {
  const toast = useRef<Toast>(null);
  const { data: user } = useUserDataZState();

  const [loading, setLoading] = useState(false);
  const [requestDialogVisible, setRequestDialogVisible] = useState(false);
  const [historyDialogVisible, setHistoryDialogVisible] = useState(false);
  const [pendingRequest, setPendingRequest] =
    useState<SubscriptionRequest | null>(null);
  const [requestHistory, setRequestHistory] = useState<SubscriptionRequest[]>(
    []
  );

  const [formData, setFormData] = useState({
    requestedPlan: SubscriptionPlan.PRO,
    reason: '',
    message: '',
    urgency: 'medium' as 'low' | 'medium' | 'high',
  });

  const currentPlan = user?.subscription?.plan || SubscriptionPlan.FREE;

  const availablePlans = Object.values(SubscriptionPlan)
    .filter((plan) => plan !== currentPlan)
    .map((plan) => ({
      label: getPlanDetails(plan).name,
      value: plan,
    }));

  const urgencyOptions = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
  ];

  useEffect(() => {
    if (user?.id) {
      loadPendingRequest();
    }
  }, [user?.id]);

  const loadPendingRequest = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const pending = await getUserPendingRequest(user.id);
      setPendingRequest(pending);
    } catch (error) {
      console.error('Error loading pending request:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRequestHistory = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const history = await getUserRequestHistory(user.id);
      setRequestHistory(history);
    } catch (error) {
      console.error('Error loading request history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!user?.id || !user.email || !user.displayName) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'User information is incomplete',
        life: 3000,
      });
      return;
    }

    if (!formData.reason.trim()) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please provide a reason for the subscription request',
        life: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const result = await createSubscriptionRequest({
        userId: user.id,
        userEmail: user.email,
        userName: user.displayName,
        currentPlan,
        requestedPlan: formData.requestedPlan,
        reason: formData.reason,
        message: formData.message,
        urgency: formData.urgency,
      });

      if (result.success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Request Submitted',
          detail: result.message,
          life: 5000,
        });

        // Reset form and close dialog
        setFormData({
          requestedPlan: SubscriptionPlan.PRO,
          reason: '',
          message: '',
          urgency: 'medium',
        });
        setRequestDialogVisible(false);

        // Reload pending request
        await loadPendingRequest();
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Request Failed',
          detail: result.message,
          life: 5000,
        });
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to submit subscription request',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!pendingRequest?.id || !user?.id) return;

    setLoading(true);

    try {
      const result = await cancelSubscriptionRequest(
        pendingRequest.id,
        user.id
      );

      if (result.success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Request Cancelled',
          detail: result.message,
          life: 5000,
        });

        // Reload pending request
        await loadPendingRequest();
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Cancellation Failed',
          detail: result.message,
          life: 5000,
        });
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to cancel subscription request',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusSeverity = (status: SubscriptionRequestStatus) => {
    switch (status) {
      case SubscriptionRequestStatus.PENDING:
        return 'warning';
      case SubscriptionRequestStatus.APPROVED:
        return 'success';
      case SubscriptionRequestStatus.REJECTED:
        return 'danger';
      case SubscriptionRequestStatus.CANCELLED:
        return 'secondary';
      default:
        return 'info';
    }
  };

  const statusBodyTemplate = (request: SubscriptionRequest) => {
    return (
      <Tag
        value={request.status}
        severity={getStatusSeverity(request.status)}
        className='text-sm'
      />
    );
  };

  const planBodyTemplate = (request: SubscriptionRequest) => {
    const planDetails = getPlanDetails(request.requestedPlan);
    return (
      <div className='flex items-center gap-2'>
        <i
          className={`${planDetails.icon} text-lg`}
          style={{ color: planDetails.color }}
        ></i>
        <span>{planDetails.name}</span>
      </div>
    );
  };

  const dateBodyTemplate = (request: SubscriptionRequest) => {
    return formatDate(request.requestedAt);
  };

  const showRequestHistory = () => {
    loadRequestHistory();
    setHistoryDialogVisible(true);
  };

  if (loading && !pendingRequest) {
    return (
      <div className='flex justify-content-center align-items-center p-4'>
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className={`subscription-request ${className || ''}`}>
      <Toast ref={toast} />

      {/* Current Subscription */}
      <Card
        title='Current Subscription'
        className='mb-4'
      >
        <div className='flex justify-content-between align-items-center'>
          <div className='flex items-center gap-3'>
            <i
              className={`${getPlanDetails(currentPlan).icon} text-2xl`}
              style={{ color: getPlanDetails(currentPlan).color }}
            ></i>
            <div>
              <h4 className='m-0'>{getPlanDetails(currentPlan).name}</h4>
              <p className='text-600 m-0'>
                {getPlanDetails(currentPlan).description}
              </p>
            </div>
          </div>
          <Badge
            value={currentPlan.toUpperCase()}
            severity={
              currentPlan === SubscriptionPlan.FREE ? 'secondary' : 'success'
            }
            size='large'
          />
        </div>

        {user?.subscription?.endDate && (
          <div className='mt-3 p-3 bg-yellow-50 border-round'>
            <i className='pi pi-clock text-yellow-600 mr-2'></i>
            <span className='text-yellow-700'>
              Expires on {formatDate(user.subscription.endDate)}
            </span>
          </div>
        )}
      </Card>

      {/* Pending Request */}
      {pendingRequest && (
        <Card
          title='Pending Request'
          className='mb-4'
        >
          <div className='flex justify-content-between align-items-start'>
            <div className='flex-1'>
              <div className='flex items-center gap-2 mb-2'>
                <Tag
                  value={pendingRequest.requestType}
                  severity='info'
                />
                <span className='text-lg font-semibold'>
                  {getPlanDetails(pendingRequest.requestedPlan).name}
                </span>
              </div>
              <p className='text-600 mb-2'>{pendingRequest.reason}</p>
              <small className='text-500'>
                Requested on {formatDate(pendingRequest.requestedAt)}
              </small>
            </div>
            <div className='flex flex-column gap-2'>
              <Tag
                value={pendingRequest.status}
                severity={getStatusSeverity(pendingRequest.status)}
              />
              <Button
                label='Cancel Request'
                icon='pi pi-times'
                size='small'
                severity='danger'
                outlined
                onClick={handleCancelRequest}
                loading={loading}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Available Plans */}
      <Card
        title='Available Plans'
        className='mb-4'
      >
        <div className='grid'>
          {Object.values(SubscriptionPlan)
            .filter((plan) => plan !== currentPlan)
            .map((plan) => {
              const planDetails = getPlanDetails(plan);
              const isUpgrade = isPlanUpgrade(currentPlan, plan);
              const cost = calculateUpgradeCost(currentPlan, plan);

              return (
                <div
                  key={plan}
                  className='col-12 md:col-6 lg:col-4'
                >
                  <Card className='h-full'>
                    <div className='text-center'>
                      <i
                        className={`${planDetails.icon} text-4xl mb-3`}
                        style={{ color: planDetails.color }}
                      ></i>
                      <h3 className='mb-2'>{planDetails.name}</h3>
                      <p className='text-600 mb-3'>{planDetails.description}</p>

                      <div className='mb-3'>
                        <span className='text-2xl font-bold'>
                          ${planDetails.price.monthly}
                        </span>
                        <span className='text-600'>/month</span>
                      </div>

                      {isUpgrade && cost > 0 && (
                        <div className='mb-3 p-2 bg-green-50 border-round'>
                          <span className='text-green-700'>
                            Upgrade cost: ${cost}/month
                          </span>
                        </div>
                      )}

                      <ul className='text-left text-sm mb-3'>
                        {planDetails.benefits
                          .slice(0, 3)
                          .map((benefit, index) => (
                            <li
                              key={index}
                              className='mb-1'
                            >
                              <i className='pi pi-check text-green-600 mr-2'></i>
                              {benefit}
                            </li>
                          ))}
                      </ul>

                      <Button
                        label={isUpgrade ? 'Request Upgrade' : 'Request Plan'}
                        icon='pi pi-arrow-up'
                        className='w-full'
                        severity={isUpgrade ? 'success' : 'info'}
                        disabled={!!pendingRequest}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            requestedPlan: plan,
                          }));
                          setRequestDialogVisible(true);
                        }}
                      />
                    </div>
                  </Card>
                </div>
              );
            })}
        </div>
      </Card>

      {/* Actions */}
      <Card>
        <div className='flex gap-3'>
          <Button
            label='View Request History'
            icon='pi pi-history'
            severity='info'
            outlined
            onClick={showRequestHistory}
          />
        </div>
      </Card>

      {/* Request Dialog */}
      <Dialog
        header='Submit Subscription Request'
        visible={requestDialogVisible}
        onHide={() => setRequestDialogVisible(false)}
        style={{ width: '500px' }}
        modal
      >
        <div className='flex flex-column gap-4'>
          <div>
            <label className='block text-900 font-medium mb-2'>
              Requested Plan
            </label>
            <Dropdown
              value={formData.requestedPlan}
              options={availablePlans}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, requestedPlan: e.value }))
              }
              className='w-full'
            />
          </div>

          <div>
            <label className='block text-900 font-medium mb-2'>
              Reason for Request *
            </label>
            <InputTextarea
              value={formData.reason}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, reason: e.target.value }))
              }
              rows={3}
              className='w-full'
              placeholder='Please explain why you need this subscription plan...'
            />
          </div>

          <div>
            <label className='block text-900 font-medium mb-2'>
              Additional Message
            </label>
            <InputTextarea
              value={formData.message}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
              rows={2}
              className='w-full'
              placeholder='Any additional information...'
            />
          </div>

          <div>
            <label className='block text-900 font-medium mb-2'>
              Urgency Level
            </label>
            <Dropdown
              value={formData.urgency}
              options={urgencyOptions}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, urgency: e.value }))
              }
              className='w-full'
            />
          </div>

          <Divider />

          <div className='flex justify-content-end gap-2'>
            <Button
              label='Cancel'
              severity='secondary'
              onClick={() => setRequestDialogVisible(false)}
            />
            <Button
              label='Submit Request'
              icon='pi pi-send'
              onClick={handleSubmitRequest}
              loading={loading}
            />
          </div>
        </div>
      </Dialog>

      {/* History Dialog */}
      <Dialog
        header='Request History'
        visible={historyDialogVisible}
        onHide={() => setHistoryDialogVisible(false)}
        style={{ width: '800px' }}
        modal
        maximizable
      >
        <DataTable
          value={requestHistory}
          loading={loading}
          emptyMessage='No subscription requests found'
          paginator
          rows={10}
          className='p-datatable-sm'
        >
          <Column
            field='requestType'
            header='Type'
          />
          <Column
            body={planBodyTemplate}
            header='Plan'
          />
          <Column
            body={statusBodyTemplate}
            header='Status'
          />
          <Column
            body={dateBodyTemplate}
            header='Requested'
          />
          <Column
            field='reason'
            header='Reason'
          />
        </DataTable>
      </Dialog>
    </div>
  );
};

export default UserSubscriptionRequest;
