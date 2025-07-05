import { useRoleCheck } from '@/components/common/RoleGuard';
import { auth, db } from '@/services/firebase';
import { Permission, UserRole } from '@/types/user/roles';
import { SubscriptionPlan } from '@/types/user/subscription';
import { PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS } from '@/utils/constants/generic/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';
import React, { useRef, useState } from 'react';

interface CreateAdminUserFormData {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
}

export const CreateAdminUser: React.FC = () => {
  const toast = useRef<Toast>(null);
  const { hasPermission } = useRoleCheck();

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateAdminUserFormData>({
    email: '',
    password: '',
    displayName: '',
    role: UserRole.ADMIN,
  });

  const roleOptions = [
    { label: 'Admin', value: UserRole.ADMIN },
    { label: 'Super Admin', value: UserRole.SUPER_ADMIN },
    { label: 'Moderator', value: UserRole.MODERATOR },
    { label: 'Support', value: UserRole.SUPPORT },
  ];

  const generateSecurePassword = (): string => {
    const length = 16;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
  };

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword();
    setFormData((prev) => ({ ...prev, password: newPassword }));

    toast.current?.show({
      severity: 'info',
      summary: 'Password Generated',
      detail: 'A secure password has been generated. Please save it securely.',
      life: 5000,
    });
  };

  const createDefaultAdmin = async () => {
    const email = 'aoneahsan@gmail.com';
    const password = generateSecurePassword();
    const displayName = 'System Administrator';

    setLoading(true);

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(firebaseUser, { displayName });

      // Create user document in Firestore
      const userData = {
        id: firebaseUser.uid,
        email: email,
        displayName: displayName,
        photoURL: firebaseUser.photoURL,
        role: UserRole.SUPER_ADMIN,
        isActive: true,
        isEmailVerified: firebaseUser.emailVerified,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        lastActiveAt: new Date(),
        subscription: {
          plan: SubscriptionPlan.ENTERPRISE,
          startDate: new Date(),
          isActive: true,
          features: [],
        },
        roleAssignment: {
          userId: firebaseUser.uid,
          role: UserRole.SUPER_ADMIN,
          assignedBy: 'SYSTEM',
          assignedAt: new Date(),
          reason: 'Default admin user created during system initialization',
          isActive: true,
        },
        adminNotes: 'Default system administrator account',
        tags: ['default-admin', 'system-admin'],
        profileCompletionPercentage: 100,
        isProfileComplete: true,
      };

      // Save user to Firestore
      await setDoc(
        doc(
          db,
          `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_users`,
          firebaseUser.uid
        ),
        userData
      );

      toast.current?.show({
        severity: 'success',
        summary: 'Default Admin Created',
        detail: `Default admin user created successfully!
        
Email: ${email}
Password: ${password}

IMPORTANT: Please save these credentials securely and change the password after first login!`,
        life: 0, // Keep visible until manually dismissed
      });
    } catch (error: unknown) {
      console.error('Error creating default admin:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: `Failed to create default admin user: ${errorMessage}`,
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!formData.email || !formData.password || !formData.displayName) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields',
        life: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const firebaseUser = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(firebaseUser, { displayName: formData.displayName });

      // Create user document in Firestore
      const userData = {
        id: firebaseUser.uid,
        email: formData.email,
        displayName: formData.displayName,
        photoURL: firebaseUser.photoURL,
        role: formData.role,
        isActive: true,
        isEmailVerified: firebaseUser.emailVerified,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        lastActiveAt: new Date(),
        subscription: {
          plan: SubscriptionPlan.ENTERPRISE,
          startDate: new Date(),
          isActive: true,
          features: [],
        },
        roleAssignment: {
          userId: firebaseUser.uid,
          role: formData.role,
          assignedBy: 'SYSTEM',
          assignedAt: new Date(),
          reason: 'Admin user created via admin panel',
          isActive: true,
        },
        adminNotes: 'Admin user created via admin panel',
        tags: ['admin'],
        profileCompletionPercentage: 100,
        isProfileComplete: true,
      };

      // Save user to Firestore
      await setDoc(
        doc(
          db,
          `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_users`,
          firebaseUser.uid
        ),
        userData
      );

      toast.current?.show({
        severity: 'success',
        summary: 'Admin User Created',
        detail: `Admin user ${formData.email} created successfully with role ${formData.role}`,
        life: 5000,
      });

      // Reset form and close dialog
      setFormData({
        email: '',
        password: '',
        displayName: '',
        role: UserRole.ADMIN,
      });
      setVisible(false);
    } catch (error: unknown) {
      console.error('Error creating admin user:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: `Failed to create admin user: ${errorMessage}`,
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!hasPermission(Permission.CREATE_USERS)) {
    return null;
  }

  return (
    <div className='create-admin-user'>
      <Toast ref={toast} />

      <Card
        title='Create Admin User'
        className='mb-4'
      >
        <div className='flex gap-3'>
          <Button
            label='Create Default Admin'
            icon='pi pi-user-plus'
            severity='info'
            onClick={createDefaultAdmin}
            loading={loading}
            tooltip='Creates default admin with email: aoneahsan@gmail.com'
          />

          <Button
            label='Create Custom Admin'
            icon='pi pi-plus'
            onClick={() => setVisible(true)}
            tooltip='Create admin user with custom details'
          />
        </div>
      </Card>

      <Dialog
        header='Create Admin User'
        visible={visible}
        onHide={() => setVisible(false)}
        style={{ width: '450px' }}
        modal
      >
        <div className='flex flex-column gap-3'>
          <div>
            <label
              htmlFor='email'
              className='block text-900 font-medium mb-2'
            >
              Email *
            </label>
            <InputText
              id='email'
              type='email'
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              className='w-full'
              placeholder='admin@example.com'
            />
          </div>

          <div>
            <label
              htmlFor='displayName'
              className='block text-900 font-medium mb-2'
            >
              Display Name *
            </label>
            <InputText
              id='displayName'
              value={formData.displayName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  displayName: e.target.value,
                }))
              }
              className='w-full'
              placeholder='Administrator Name'
            />
          </div>

          <div>
            <label
              htmlFor='role'
              className='block text-900 font-medium mb-2'
            >
              Role *
            </label>
            <Dropdown
              id='role'
              value={formData.role}
              options={roleOptions}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, role: e.value }))
              }
              className='w-full'
            />
          </div>

          <div>
            <label
              htmlFor='password'
              className='block text-900 font-medium mb-2'
            >
              Password *
            </label>
            <div className='flex gap-2'>
              <Password
                id='password'
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                className='flex-1'
                feedback={false}
                toggleMask
              />
              <Button
                icon='pi pi-refresh'
                onClick={handleGeneratePassword}
                tooltip='Generate secure password'
                type='button'
              />
            </div>
          </div>

          <div className='flex justify-content-end gap-2 mt-3'>
            <Button
              label='Cancel'
              severity='secondary'
              onClick={() => setVisible(false)}
            />
            <Button
              label='Create Admin'
              onClick={handleCreateAdmin}
              loading={loading}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default CreateAdminUser;
