import { useRoleCheck } from '@/components/common/RoleGuard';
import {
  getAllSubscriptionRequests,
  getSubscriptionStats,
  reviewSubscriptionRequest,
  updateUserSubscription,
} from '@/services/subscriptionService';
import { Permission } from '@/types/user/roles';
import {
  SubscriptionPlan,
  SubscriptionRequest,
  SubscriptionRequestStatus,
  calculateUpgradeCost,
  getPlanDetails,
  isPlanUpgrade,
} from '@/types/user/subscription';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { TabPanel, TabView } from 'primereact/tabview';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';

interface AdminSubscriptionManagementProps {
  className?: string;
}

interface ReviewFormData {
  requestId: string;
  status: SubscriptionRequestStatus;
  adminNotes: string;
  rejectedReason: string;
  approvedDuration: number;
  approvedDowngradePlan: SubscriptionPlan;
}

interface DirectUpdateFormData {
  userId: string;
  userEmail: string;
  newPlan: SubscriptionPlan;
  duration: number;
  downgradePlan: SubscriptionPlan;
  notes: string;
  paymentMethod: string;
  transactionId: string;
}

const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const AdminSubscriptionManagement: React.FC<
  AdminSubscriptionManagementProps
> = ({ className }) => {
  const toast = useRef<Toast>(null);
  const { hasPermission, user: currentUser } = useRoleCheck();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Requests state
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [selectedRequest, setSelectedRequest] =
    useState<SubscriptionRequest | null>(null);
  const [reviewDialogVisible, setReviewDialogVisible] = useState(false);
  const [updateDialogVisible, setUpdateDialogVisible] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    planDistribution: {
      [SubscriptionPlan.FREE]: 0,
      [SubscriptionPlan.PRO]: 0,
      [SubscriptionPlan.PREMIUM]: 0,
      [SubscriptionPlan.ENTERPRISE]: 0,
    },
  });

  // Form data
  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    requestId: '',
    status: SubscriptionRequestStatus.APPROVED,
    adminNotes: '',
    rejectedReason: '',
    approvedDuration: 12,
    approvedDowngradePlan: SubscriptionPlan.FREE,
  });

  const [updateForm, setUpdateForm] = useState<DirectUpdateFormData>({
    userId: '',
    userEmail: '',
    newPlan: SubscriptionPlan.PRO,
    duration: 12,
    downgradePlan: SubscriptionPlan.FREE,
    notes: '',
    paymentMethod: '',
    transactionId: '',
  });

  // Filters
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<SubscriptionRequestStatus | null>(null);

  const statusOptions = [
    { label: 'All Statuses', value: null },
    { label: 'Pending', value: SubscriptionRequestStatus.PENDING },
    { label: 'Approved', value: SubscriptionRequestStatus.APPROVED },
    { label: 'Rejected', value: SubscriptionRequestStatus.REJECTED },
    { label: 'Cancelled', value: SubscriptionRequestStatus.CANCELLED },
  ];

  const planOptions = Object.values(SubscriptionPlan).map((plan) => ({
    label: getPlanDetails(plan).name,
    value: plan,
  }));

  const statusActionOptions = [
    { label: 'Approve', value: SubscriptionRequestStatus.APPROVED },
    { label: 'Reject', value: SubscriptionRequestStatus.REJECTED },
  ];

  useEffect(() => {
    loadRequests();
    loadStats();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const allRequests = await getAllSubscriptionRequests(
        statusFilter || undefined
      );
      setRequests(allRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load subscription requests',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getSubscriptionStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleReviewRequest = (request: SubscriptionRequest) => {
    setSelectedRequest(request);
    setReviewForm({
      requestId: request.id || '',
      status: SubscriptionRequestStatus.APPROVED,
      adminNotes: '',
      rejectedReason: '',
      approvedDuration: 12,
      approvedDowngradePlan: SubscriptionPlan.FREE,
    });
    setReviewDialogVisible(true);
  };

  const handleDirectUpdate = () => {
    setUpdateForm({
      userId: '',
      userEmail: '',
      newPlan: SubscriptionPlan.PRO,
      duration: 12,
      downgradePlan: SubscriptionPlan.FREE,
      notes: '',
      paymentMethod: '',
      transactionId: '',
    });
    setUpdateDialogVisible(true);
  };

  const submitReview = async () => {
    if (!currentUser?.id || !selectedRequest) return;

    if (
      reviewForm.status === SubscriptionRequestStatus.REJECTED &&
      !reviewForm.rejectedReason.trim()
    ) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please provide a reason for rejection',
        life: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const result = await reviewSubscriptionRequest({
        requestId: reviewForm.requestId,
        reviewedBy: currentUser.id,
        status: reviewForm.status,
        adminNotes: reviewForm.adminNotes,
        rejectedReason: reviewForm.rejectedReason,
        approvedDuration:
          reviewForm.status === SubscriptionRequestStatus.APPROVED
            ? reviewForm.approvedDuration
            : undefined,
        approvedDowngradePlan:
          reviewForm.status === SubscriptionRequestStatus.APPROVED
            ? reviewForm.approvedDowngradePlan
            : undefined,
      });

      if (result.success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Review Submitted',
          detail: result.message,
          life: 5000,
        });

        setReviewDialogVisible(false);
        await loadRequests();
        await loadStats();
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Review Failed',
          detail: result.message,
          life: 5000,
        });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to submit review',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const submitDirectUpdate = async () => {
    if (!currentUser?.id) return;

    if (!updateForm.userId.trim() || !updateForm.userEmail.trim()) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please provide user ID and email',
        life: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const result = await updateUserSubscription({
        userId: updateForm.userId,
        newPlan: updateForm.newPlan,
        duration: updateForm.duration,
        downgradePlan: updateForm.downgradePlan,
        setBy: currentUser.id,
        notes: updateForm.notes,
        paymentMethod: updateForm.paymentMethod,
        transactionId: updateForm.transactionId,
      });

      if (result.success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Subscription Updated',
          detail: result.message,
          life: 5000,
        });

        setUpdateDialogVisible(false);
        await loadStats();
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Update Failed',
          detail: result.message,
          life: 5000,
        });
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update subscription',
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

  // Table templates
  const statusBodyTemplate = (request: SubscriptionRequest) => (
    <Tag
      value={request.status}
      severity={getStatusSeverity(request.status)}
    />
  );

  const planBodyTemplate = (request: SubscriptionRequest) => {
    const currentPlanDetails = getPlanDetails(request.currentPlan);
    const requestedPlanDetails = getPlanDetails(request.requestedPlan);
    const isUpgrade = isPlanUpgrade(request.currentPlan, request.requestedPlan);

    return (
      <div className='flex flex-column gap-1'>
        <div className='flex items-center gap-2'>
          <i
            className={currentPlanDetails.icon}
            style={{ color: currentPlanDetails.color }}
          ></i>
          <span>{currentPlanDetails.name}</span>
          <i className={`pi pi-arrow-${isUpgrade ? 'up' : 'down'} text-sm`}></i>
          <i
            className={requestedPlanDetails.icon}
            style={{ color: requestedPlanDetails.color }}
          ></i>
          <span>{requestedPlanDetails.name}</span>
        </div>
        {isUpgrade && (
          <small className='text-green-600'>
            +${calculateUpgradeCost(request.currentPlan, request.requestedPlan)}
            /month
          </small>
        )}
      </div>
    );
  };

  const userBodyTemplate = (request: SubscriptionRequest) => (
    <div>
      <div className='font-semibold'>{request.userName}</div>
      <div className='text-sm text-600'>{request.userEmail}</div>
    </div>
  );

  const dateBodyTemplate = (request: SubscriptionRequest) =>
    formatDate(request.requestedAt);

  const urgencyBodyTemplate = (request: SubscriptionRequest) => {
    const severity =
      request.urgency === 'high'
        ? 'danger'
        : request.urgency === 'medium'
          ? 'warning'
          : 'info';
    return (
      <Badge
        value={request.urgency}
        severity={severity}
      />
    );
  };

  const actionBodyTemplate = (request: SubscriptionRequest) => (
    <div className='flex gap-2'>
      {request.status === SubscriptionRequestStatus.PENDING && (
        <Button
          icon='pi pi-eye'
          size='small'
          tooltip='Review Request'
          onClick={() => handleReviewRequest(request)}
        />
      )}
    </div>
  );

  if (!hasPermission(Permission.MANAGE_SUBSCRIPTIONS)) {
    return (
      <div className='text-center p-4'>
        <p>You don't have permission to manage subscriptions.</p>
      </div>
    );
  }

  return (
    <div className={`subscription-management ${className || ''}`}>
      <Toast ref={toast} />
      <ConfirmDialog />

      <TabView
        activeIndex={activeTab}
        onTabChange={(e) => setActiveTab(e.index)}
      >
        {/* Statistics Tab */}
        <TabPanel
          header='Statistics'
          leftIcon='pi pi-chart-bar'
        >
          <div className='grid'>
            <div className='col-12 md:col-3'>
              <Card>
                <div className='text-center'>
                  <i className='pi pi-list text-4xl text-blue-500 mb-3'></i>
                  <h3 className='text-2xl font-bold mb-1'>
                    {stats.totalRequests}
                  </h3>
                  <p className='text-600 m-0'>Total Requests</p>
                </div>
              </Card>
            </div>

            <div className='col-12 md:col-3'>
              <Card>
                <div className='text-center'>
                  <i className='pi pi-clock text-4xl text-orange-500 mb-3'></i>
                  <h3 className='text-2xl font-bold mb-1'>
                    {stats.pendingRequests}
                  </h3>
                  <p className='text-600 m-0'>Pending</p>
                </div>
              </Card>
            </div>

            <div className='col-12 md:col-3'>
              <Card>
                <div className='text-center'>
                  <i className='pi pi-check text-4xl text-green-500 mb-3'></i>
                  <h3 className='text-2xl font-bold mb-1'>
                    {stats.approvedRequests}
                  </h3>
                  <p className='text-600 m-0'>Approved</p>
                </div>
              </Card>
            </div>

            <div className='col-12 md:col-3'>
              <Card>
                <div className='text-center'>
                  <i className='pi pi-times text-4xl text-red-500 mb-3'></i>
                  <h3 className='text-2xl font-bold mb-1'>
                    {stats.rejectedRequests}
                  </h3>
                  <p className='text-600 m-0'>Rejected</p>
                </div>
              </Card>
            </div>
          </div>

          <Card
            title='Plan Distribution'
            className='mt-4'
          >
            <div className='grid'>
              {Object.entries(stats.planDistribution).map(([plan, count]) => {
                const planDetails = getPlanDetails(plan as SubscriptionPlan);
                return (
                  <div
                    key={plan}
                    className='col-12 md:col-3'
                  >
                    <div className='text-center p-3 border-round bg-gray-50'>
                      <i
                        className={`${planDetails.icon} text-2xl mb-2`}
                        style={{ color: planDetails.color }}
                      ></i>
                      <h4 className='m-0'>{count}</h4>
                      <p className='text-600 m-0'>{planDetails.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabPanel>

        {/* Requests Tab */}
        <TabPanel
          header='Requests'
          leftIcon='pi pi-inbox'
        >
          <Card>
            <div className='flex justify-content-between align-items-center mb-4'>
              <h3>Subscription Requests</h3>
              <div className='flex gap-3'>
                <InputText
                  placeholder='Search requests...'
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                />
                <Dropdown
                  value={statusFilter}
                  options={statusOptions}
                  onChange={(e) => {
                    setStatusFilter(e.value);
                    // Reload requests with new filter
                    setTimeout(() => loadRequests(), 100);
                  }}
                  placeholder='Filter by status'
                />
              </div>
            </div>

            <DataTable
              value={requests}
              loading={loading}
              paginator
              rows={20}
              globalFilter={globalFilter}
              emptyMessage='No subscription requests found'
              className='p-datatable-sm'
            >
              <Column
                body={userBodyTemplate}
                header='User'
                sortable
                sortField='userName'
              />
              <Column
                body={planBodyTemplate}
                header='Plan Change'
              />
              <Column
                body={statusBodyTemplate}
                header='Status'
                sortable
                sortField='status'
              />
              <Column
                body={urgencyBodyTemplate}
                header='Urgency'
                sortable
                sortField='urgency'
              />
              <Column
                body={dateBodyTemplate}
                header='Requested'
                sortable
                sortField='requestedAt'
              />
              <Column
                field='reason'
                header='Reason'
              />
              <Column
                body={actionBodyTemplate}
                header='Actions'
              />
            </DataTable>
          </Card>
        </TabPanel>

        {/* Direct Management Tab */}
        <TabPanel
          header='Direct Management'
          leftIcon='pi pi-cog'
        >
          <Card title='Direct Subscription Management'>
            <p className='text-600 mb-4'>
              Directly update user subscriptions without going through the
              request process.
            </p>

            <Button
              label='Update User Subscription'
              icon='pi pi-plus'
              onClick={handleDirectUpdate}
            />
          </Card>
        </TabPanel>
      </TabView>

      {/* Review Dialog */}
      <Dialog
        header={`Review Request - ${selectedRequest?.userName}`}
        visible={reviewDialogVisible}
        onHide={() => setReviewDialogVisible(false)}
        style={{ width: '600px' }}
        modal
      >
        {selectedRequest && (
          <div className='flex flex-column gap-4'>
            <div className='grid'>
              <div className='col-6'>
                <label className='block text-900 font-medium mb-2'>
                  Current Plan
                </label>
                <div className='flex items-center gap-2'>
                  <i
                    className={getPlanDetails(selectedRequest.currentPlan).icon}
                    style={{
                      color: getPlanDetails(selectedRequest.currentPlan).color,
                    }}
                  ></i>
                  <span>
                    {getPlanDetails(selectedRequest.currentPlan).name}
                  </span>
                </div>
              </div>
              <div className='col-6'>
                <label className='block text-900 font-medium mb-2'>
                  Requested Plan
                </label>
                <div className='flex items-center gap-2'>
                  <i
                    className={
                      getPlanDetails(selectedRequest.requestedPlan).icon
                    }
                    style={{
                      color: getPlanDetails(selectedRequest.requestedPlan)
                        .color,
                    }}
                  ></i>
                  <span>
                    {getPlanDetails(selectedRequest.requestedPlan).name}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className='block text-900 font-medium mb-2'>
                User's Reason
              </label>
              <p className='p-3 bg-gray-50 border-round'>
                {selectedRequest.reason}
              </p>
            </div>

            {selectedRequest.message && (
              <div>
                <label className='block text-900 font-medium mb-2'>
                  Additional Message
                </label>
                <p className='p-3 bg-gray-50 border-round'>
                  {selectedRequest.message}
                </p>
              </div>
            )}

            <div>
              <label className='block text-900 font-medium mb-2'>
                Action *
              </label>
              <Dropdown
                value={reviewForm.status}
                options={statusActionOptions}
                onChange={(e) =>
                  setReviewForm((prev) => ({ ...prev, status: e.value }))
                }
                className='w-full'
              />
            </div>

            {reviewForm.status === SubscriptionRequestStatus.APPROVED && (
              <>
                <div>
                  <label className='block text-900 font-medium mb-2'>
                    Subscription Duration (months) *
                  </label>
                  <InputNumber
                    value={reviewForm.approvedDuration}
                    onValueChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        approvedDuration: e.value || 1,
                      }))
                    }
                    min={1}
                    max={60}
                    className='w-full'
                  />
                </div>

                <div>
                  <label className='block text-900 font-medium mb-2'>
                    Downgrade Plan (after expiry)
                  </label>
                  <Dropdown
                    value={reviewForm.approvedDowngradePlan}
                    options={planOptions}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        approvedDowngradePlan: e.value,
                      }))
                    }
                    className='w-full'
                  />
                </div>
              </>
            )}

            {reviewForm.status === SubscriptionRequestStatus.REJECTED && (
              <div>
                <label className='block text-900 font-medium mb-2'>
                  Rejection Reason *
                </label>
                <InputTextarea
                  value={reviewForm.rejectedReason}
                  onChange={(e) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      rejectedReason: e.target.value,
                    }))
                  }
                  rows={3}
                  className='w-full'
                  placeholder='Please provide a reason for rejection...'
                />
              </div>
            )}

            <div>
              <label className='block text-900 font-medium mb-2'>
                Admin Notes
              </label>
              <InputTextarea
                value={reviewForm.adminNotes}
                onChange={(e) =>
                  setReviewForm((prev) => ({
                    ...prev,
                    adminNotes: e.target.value,
                  }))
                }
                rows={2}
                className='w-full'
                placeholder='Internal notes (not visible to user)...'
              />
            </div>

            <Divider />

            <div className='flex justify-content-end gap-2'>
              <Button
                label='Cancel'
                severity='secondary'
                onClick={() => setReviewDialogVisible(false)}
              />
              <Button
                label='Submit Review'
                icon='pi pi-check'
                onClick={submitReview}
                loading={loading}
              />
            </div>
          </div>
        )}
      </Dialog>

      {/* Direct Update Dialog */}
      <Dialog
        header='Update User Subscription'
        visible={updateDialogVisible}
        onHide={() => setUpdateDialogVisible(false)}
        style={{ width: '600px' }}
        modal
      >
        <div className='flex flex-column gap-4'>
          <div className='grid'>
            <div className='col-6'>
              <label className='block text-900 font-medium mb-2'>
                User ID *
              </label>
              <InputText
                value={updateForm.userId}
                onChange={(e) =>
                  setUpdateForm((prev) => ({ ...prev, userId: e.target.value }))
                }
                className='w-full'
                placeholder='Enter user ID'
              />
            </div>
            <div className='col-6'>
              <label className='block text-900 font-medium mb-2'>
                User Email *
              </label>
              <InputText
                value={updateForm.userEmail}
                onChange={(e) =>
                  setUpdateForm((prev) => ({
                    ...prev,
                    userEmail: e.target.value,
                  }))
                }
                className='w-full'
                placeholder='Enter user email'
              />
            </div>
          </div>

          <div className='grid'>
            <div className='col-6'>
              <label className='block text-900 font-medium mb-2'>
                New Plan *
              </label>
              <Dropdown
                value={updateForm.newPlan}
                options={planOptions}
                onChange={(e) =>
                  setUpdateForm((prev) => ({ ...prev, newPlan: e.value }))
                }
                className='w-full'
              />
            </div>
            <div className='col-6'>
              <label className='block text-900 font-medium mb-2'>
                Duration (months) *
              </label>
              <InputNumber
                value={updateForm.duration}
                onValueChange={(e) =>
                  setUpdateForm((prev) => ({ ...prev, duration: e.value || 1 }))
                }
                min={1}
                max={60}
                className='w-full'
              />
            </div>
          </div>

          <div>
            <label className='block text-900 font-medium mb-2'>
              Downgrade Plan (after expiry)
            </label>
            <Dropdown
              value={updateForm.downgradePlan}
              options={planOptions}
              onChange={(e) =>
                setUpdateForm((prev) => ({ ...prev, downgradePlan: e.value }))
              }
              className='w-full'
            />
          </div>

          <div className='grid'>
            <div className='col-6'>
              <label className='block text-900 font-medium mb-2'>
                Payment Method
              </label>
              <InputText
                value={updateForm.paymentMethod}
                onChange={(e) =>
                  setUpdateForm((prev) => ({
                    ...prev,
                    paymentMethod: e.target.value,
                  }))
                }
                className='w-full'
                placeholder='e.g., Credit Card, PayPal'
              />
            </div>
            <div className='col-6'>
              <label className='block text-900 font-medium mb-2'>
                Transaction ID
              </label>
              <InputText
                value={updateForm.transactionId}
                onChange={(e) =>
                  setUpdateForm((prev) => ({
                    ...prev,
                    transactionId: e.target.value,
                  }))
                }
                className='w-full'
                placeholder='Transaction reference'
              />
            </div>
          </div>

          <div>
            <label className='block text-900 font-medium mb-2'>Notes</label>
            <InputTextarea
              value={updateForm.notes}
              onChange={(e) =>
                setUpdateForm((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className='w-full'
              placeholder='Administrative notes...'
            />
          </div>

          <Divider />

          <div className='flex justify-content-end gap-2'>
            <Button
              label='Cancel'
              severity='secondary'
              onClick={() => setUpdateDialogVisible(false)}
            />
            <Button
              label='Update Subscription'
              icon='pi pi-check'
              onClick={submitDirectUpdate}
              loading={loading}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default AdminSubscriptionManagement;
