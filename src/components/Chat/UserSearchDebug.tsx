import { db } from '@/services/firebase';
import { IPCAUser } from '@/types/user';
import { PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS } from '@/utils/constants/generic/firebase';
import { consoleError, consoleLog } from '@/utils/helpers/consoleHelper';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface UserDebugInfo extends IPCAUser {
  hasEmailIssue?: boolean;
  normalizedEmail?: string;
}

const UserSearchDebug: React.FC = () => {
  const [users, setUsers] = useState<UserDebugInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [fixing, setFixing] = useState(false);

  const USERS_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_users`;

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const usersCollection = collection(db, USERS_COLLECTION);
      const querySnapshot = await getDocs(usersCollection);

      const loadedUsers: UserDebugInfo[] = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data() as IPCAUser;
        const normalizedEmail = userData.email?.toLowerCase();
        const hasEmailIssue = userData.email !== normalizedEmail;

        loadedUsers.push({
          ...userData,
          id: doc.id,
          normalizedEmail,
          hasEmailIssue,
        });
      });

      // Sort by creation date (newest first) or by email if no date
      loadedUsers.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          // Handle both Date objects and Firestore timestamps
          const aTime =
            a.createdAt &&
            typeof a.createdAt === 'object' &&
            'seconds' in a.createdAt
              ? (a.createdAt as { seconds: number }).seconds * 1000
              : a.createdAt && a.createdAt instanceof Date
                ? a.createdAt.getTime()
                : 0;
          const bTime =
            b.createdAt &&
            typeof b.createdAt === 'object' &&
            'seconds' in b.createdAt
              ? (b.createdAt as { seconds: number }).seconds * 1000
              : b.createdAt && b.createdAt instanceof Date
                ? b.createdAt.getTime()
                : 0;
          return bTime - aTime;
        }
        return (a.email || '').localeCompare(b.email || '');
      });

      setUsers(loadedUsers);
      consoleLog(`📊 Loaded ${loadedUsers.length} users from database`);
    } catch (error) {
      consoleError('❌ Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  const fixEmailCasing = async () => {
    setFixing(true);
    try {
      const usersToFix = users.filter((user) => user.hasEmailIssue);

      if (usersToFix.length === 0) {
        toast.info('No email casing issues found!');
        return;
      }

      consoleLog(
        '🔧 Fixing email casing for users:',
        usersToFix.map((u) => u.email)
      );

      for (const user of usersToFix) {
        if (user.id && user.normalizedEmail) {
          const userRef = doc(db, USERS_COLLECTION, user.id);
          await updateDoc(userRef, {
            email: user.normalizedEmail,
          });
          consoleLog(
            `✅ Fixed email casing for user: ${user.email} -> ${user.normalizedEmail}`
          );
        }
      }

      toast.success(`Fixed email casing for ${usersToFix.length} users!`);
      await loadUsers(); // Reload to show updated data
    } catch (error) {
      consoleError('❌ Error fixing email casing:', error);
      toast.error('Failed to fix email casing');
    } finally {
      setFixing(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadUsers();
    }
  }, [visible, loadUsers]);

  const emailTemplate = (rowData: UserDebugInfo) => {
    return (
      <div>
        <div
          className={rowData.hasEmailIssue ? 'text-red-500' : 'text-green-600'}
        >
          {rowData.email}
        </div>
        {rowData.hasEmailIssue && (
          <div className='text-xs text-500 mt-1'>
            Should be: {rowData.normalizedEmail}
          </div>
        )}
      </div>
    );
  };

  const statusTemplate = (rowData: UserDebugInfo) => {
    return (
      <div className='flex align-items-center gap-2'>
        <i
          className={`pi ${rowData.hasEmailIssue ? 'pi-exclamation-triangle text-orange-500' : 'pi-check-circle text-green-500'}`}
        ></i>
        <span
          className={
            rowData.hasEmailIssue ? 'text-orange-600' : 'text-green-600'
          }
        >
          {rowData.hasEmailIssue ? 'Needs Fix' : 'OK'}
        </span>
      </div>
    );
  };

  // Only show in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  const emailIssueCount = users.filter((u) => u.hasEmailIssue).length;

  return (
    <>
      <Button
        icon='pi pi-bug'
        label='Debug User Search'
        onClick={() => setVisible(true)}
        className='p-button-outlined p-button-secondary'
        size='small'
      />

      <Dialog
        header='🐛 User Search Debug'
        visible={visible}
        style={{ width: '90vw', maxWidth: '800px' }}
        onHide={() => setVisible(false)}
        maximizable
      >
        <div className='flex flex-column gap-4'>
          <Card>
            <div className='flex justify-content-between align-items-center mb-3'>
              <div>
                <h3 className='mt-0 mb-2'>Database Users ({users.length})</h3>
                <p className='text-600 m-0'>
                  This shows all users in your Firestore database
                </p>
              </div>
              <div className='flex gap-2'>
                <Button
                  icon='pi pi-refresh'
                  label='Reload'
                  onClick={loadUsers}
                  loading={loading}
                  className='p-button-outlined'
                  size='small'
                />
                {emailIssueCount > 0 && (
                  <Button
                    icon='pi pi-wrench'
                    label={`Fix ${emailIssueCount} Email${emailIssueCount > 1 ? 's' : ''}`}
                    onClick={fixEmailCasing}
                    loading={fixing}
                    className='p-button-warning'
                    size='small'
                  />
                )}
              </div>
            </div>

            {emailIssueCount > 0 && (
              <div className='bg-orange-50 border-left-3 border-orange-500 p-3 mb-3'>
                <div className='flex align-items-center gap-2 mb-2'>
                  <i className='pi pi-exclamation-triangle text-orange-500'></i>
                  <strong className='text-orange-800'>
                    Email Casing Issues Found
                  </strong>
                </div>
                <p className='text-orange-700 m-0 text-sm'>
                  {emailIssueCount} user
                  {emailIssueCount > 1 ? 's have' : ' has'} email casing that
                  doesn't match the normalized lowercase format. This can cause
                  search issues.
                </p>
              </div>
            )}

            <DataTable
              value={users}
              loading={loading}
              emptyMessage='No users found in database'
              size='small'
              stripedRows
            >
              <Column
                field='id'
                header='User ID'
                style={{ width: '200px' }}
              />
              <Column
                field='email'
                header='Email'
                body={emailTemplate}
              />
              <Column
                field='name'
                header='Name'
              />
              <Column
                field='type'
                header='Type'
              />
              <Column
                header='Status'
                body={statusTemplate}
                style={{ width: '120px' }}
              />
            </DataTable>
          </Card>

          <Card>
            <h3 className='mt-0 mb-3'>Troubleshooting Tips</h3>
            <div className='flex flex-column gap-3'>
              <div className='flex align-items-start gap-2'>
                <i className='pi pi-info-circle text-blue-500 mt-1'></i>
                <div>
                  <strong>Email Case Sensitivity:</strong> All emails should be
                  stored in lowercase for consistent searching. Use the "Fix
                  Emails" button to normalize them.
                </div>
              </div>
              <div className='flex align-items-start gap-2'>
                <i className='pi pi-user text-green-500 mt-1'></i>
                <div>
                  <strong>Missing Users:</strong> If a user isn't listed here,
                  they might not have a Firestore document. Ask them to sign out
                  and sign back in.
                </div>
              </div>
              <div className='flex align-items-start gap-2'>
                <i className='pi pi-search text-purple-500 mt-1'></i>
                <div>
                  <strong>Search Issues:</strong> Make sure you're entering the
                  exact email address as shown in the Email column above.
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Dialog>
    </>
  );
};

export default UserSearchDebug;
