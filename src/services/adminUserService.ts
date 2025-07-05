// Admin User Service

import { IPCAUser } from '@/types/user';
import { UserRole } from '@/types/user/roles';
import {
  SUBSCRIPTION_FEATURES,
  SubscriptionPlan,
} from '@/types/user/subscription';
import { PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS } from '@/utils/constants/generic/firebase';
import { consoleError, consoleLog } from '@/utils/helpers/consoleHelper';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { roleService } from './roleService';

export interface CreateAdminUserRequest {
  email: string;
  password: string;
  displayName: string;
  role?: UserRole;
  isDefaultAdmin?: boolean;
}

export interface CreateAdminUserResponse {
  success: boolean;
  message: string;
  user?: IPCAUser;
  error?: string;
}

export class AdminUserService {
  private static instance: AdminUserService;
  private readonly USERS_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_users`;

  private constructor() {}

  public static getInstance(): AdminUserService {
    if (!AdminUserService.instance) {
      AdminUserService.instance = new AdminUserService();
    }
    return AdminUserService.instance;
  }

  /**
   * Create an admin user with specified role and permissions
   */
  public async createAdminUser(
    request: CreateAdminUserRequest
  ): Promise<CreateAdminUserResponse> {
    try {
      consoleLog('🔧 Creating admin user:', {
        email: request.email,
        role: request.role,
      });

      // Check if user already exists
      const existingUser = await this.checkUserExists(request.email);
      if (existingUser) {
        return {
          success: false,
          message: 'User already exists',
          error: 'A user with this email already exists',
        };
      }

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        request.email,
        request.password
      );

      const firebaseUser = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(firebaseUser, {
        displayName: request.displayName,
      });

      // Create user document in Firestore
      const userData: IPCAUser = {
        id: firebaseUser.uid,
        email: request.email,
        displayName: request.displayName,
        photoURL: firebaseUser.photoURL || null,
        role: request.role || UserRole.ADMIN,
        isActive: true,
        isEmailVerified: firebaseUser.emailVerified,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        lastActiveAt: new Date(),
        subscription: {
          plan: SubscriptionPlan.ENTERPRISE,
          startDate: new Date(),
          endDate: undefined,
          isActive: true,
          trialEndDate: undefined,
          features: SUBSCRIPTION_FEATURES[SubscriptionPlan.ENTERPRISE],
          downgradePlan: undefined,
          autoDowngradeDate: undefined,
          setBy: undefined,
          setAt: undefined,
          notes: undefined,
          paymentMethod: undefined,
          transactionId: undefined,
        },
        roleAssignment: {
          userId: firebaseUser.uid,
          role: request.role || UserRole.ADMIN,
          assignedBy: 'SYSTEM',
          assignedAt: new Date(),
          reason: request.isDefaultAdmin
            ? 'Default admin user created during system initialization'
            : 'Admin user created by system administrator',
          isActive: true,
        },
        adminNotes: request.isDefaultAdmin
          ? 'Default system administrator account'
          : 'Admin user created via admin service',
        tags: request.isDefaultAdmin
          ? ['default-admin', 'system-admin']
          : ['admin'],
        profileCompletionPercentage: 100,
        isProfileComplete: true,
      };

      // Save user to Firestore
      await setDoc(doc(db, this.USERS_COLLECTION, firebaseUser.uid), userData);

      // Log role assignment in audit trail
      await roleService.assignRole(
        {
          userId: firebaseUser.uid,
          newRole: request.role || UserRole.ADMIN,
          reason: userData.roleAssignment?.reason || 'No reason provided',
        },
        'SYSTEM'
      );

      consoleLog('✅ Admin user created successfully:', {
        userId: firebaseUser.uid,
        email: request.email,
        role: request.role || UserRole.ADMIN,
      });

      return {
        success: true,
        message: 'Admin user created successfully',
        user: userData,
      };
    } catch (error: unknown) {
      consoleError('❌ Error creating admin user:', error);

      return {
        success: false,
        message: 'Failed to create admin user',
        error: (error as Error).message || 'Unknown error occurred',
      };
    }
  }

  /**
   * Create the default admin user for system initialization
   */
  public async createDefaultAdminUser(
    email: string = 'aoneahsan@gmail.com'
  ): Promise<CreateAdminUserResponse> {
    const defaultPassword = this.generateSecurePassword();

    const result = await this.createAdminUser({
      email,
      password: defaultPassword,
      displayName: 'System Administrator',
      role: UserRole.SUPER_ADMIN,
      isDefaultAdmin: true,
    });

    if (result.success) {
      consoleLog('🎉 Default admin user created:', {
        email,
        password: defaultPassword,
        role: UserRole.SUPER_ADMIN,
        message: 'IMPORTANT: Please change the password after first login!',
      });

      // Return the password in the response for initial setup
      result.message = `Default admin user created successfully. 
      
      📧 Email: ${email}
      🔑 Password: ${defaultPassword}
      
      ⚠️ IMPORTANT: Please change this password after first login!`;
    }

    return result;
  }

  /**
   * Promote an existing user to admin
   */
  public async promoteToAdmin(
    userId: string,
    newRole: UserRole = UserRole.ADMIN,
    promotedBy: string,
    reason: string = 'Promoted to admin via admin service'
  ): Promise<CreateAdminUserResponse> {
    try {
      consoleLog('🔧 Promoting user to admin:', {
        userId,
        newRole,
        promotedBy,
      });

      // Check if user exists
      const userDoc = await getDoc(doc(db, this.USERS_COLLECTION, userId));
      if (!userDoc.exists()) {
        return {
          success: false,
          message: 'User not found',
          error: 'User does not exist',
        };
      }

      // Assign admin role
      const roleResult = await roleService.assignRole(
        {
          userId,
          newRole,
          reason,
        },
        promotedBy
      );

      if (roleResult.success) {
        const userData = userDoc.data() as IPCAUser;

        // Update user document with admin privileges
        const updatedUser: Partial<IPCAUser> = {
          role: newRole,
          adminNotes: `Promoted to ${newRole} - ${reason}`,
          tags: [...(userData.tags || []), 'admin'],
          subscription: {
            plan: SubscriptionPlan.ENTERPRISE,
            startDate: new Date(),
            isActive: true,
            features: SUBSCRIPTION_FEATURES[SubscriptionPlan.ENTERPRISE],
            setBy: promotedBy,
            setAt: new Date(),
            notes: `Promoted to ${newRole} - ${reason}`,
          },
        };

        await setDoc(doc(db, this.USERS_COLLECTION, userId), updatedUser, {
          merge: true,
        });

        consoleLog('✅ User promoted to admin successfully:', {
          userId,
          newRole,
        });

        return {
          success: true,
          message: `User promoted to ${newRole} successfully`,
          user: { ...userData, ...updatedUser },
        };
      }

      return {
        success: false,
        message: 'Failed to promote user',
        error: roleResult.message,
      };
    } catch (error: unknown) {
      consoleError('❌ Error promoting user to admin:', error);

      return {
        success: false,
        message: 'Failed to promote user to admin',
        error: (error as Error).message || 'Unknown error occurred',
      };
    }
  }

  /**
   * Check if a user exists by email
   */
  private async checkUserExists(email: string): Promise<boolean> {
    try {
      // Try to sign in with a dummy password to check if user exists
      // This is a Firebase limitation - there's no direct way to check if email exists
      await signInWithEmailAndPassword(auth, email, 'dummy-password');
      return true;
    } catch (error: unknown) {
      // If the error is about wrong password, user exists
      if ((error as { code?: string }).code === 'auth/wrong-password') {
        return true;
      }
      // If user not found, user doesn't exist
      if ((error as { code?: string }).code === 'auth/user-not-found') {
        return false;
      }
      // For other errors, assume user doesn't exist
      return false;
    }
  }

  /**
   * Generate a secure random password
   */
  private generateSecurePassword(): string {
    const length = 16;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
  }

  /**
   * Get all admin users
   */
  public async getAllAdminUsers(): Promise<IPCAUser[]> {
    try {
      const adminRoles = [UserRole.ADMIN, UserRole.SUPER_ADMIN];
      const adminUsers: IPCAUser[] = [];

      for (const role of adminRoles) {
        const users = await roleService.getUsersByRole(role);
        adminUsers.push(...users);
      }

      return adminUsers;
    } catch (error: any) {
      consoleError('❌ Error getting admin users:', error);
      return [];
    }
  }

  /**
   * Initialize system with default admin user if no admins exist
   */
  public async initializeSystem(): Promise<CreateAdminUserResponse> {
    try {
      consoleLog('🔧 Initializing system - checking for existing admins...');

      const adminUsers = await this.getAllAdminUsers();

      if (adminUsers.length === 0) {
        consoleLog('📋 No admin users found, creating default admin user...');
        return await this.createDefaultAdminUser();
      } else {
        consoleLog('✅ Admin users already exist, skipping initialization');
        return {
          success: true,
          message: `System already initialized with ${adminUsers.length} admin user(s)`,
        };
      }
    } catch (error: any) {
      consoleError('❌ Error initializing system:', error);
      return {
        success: false,
        message: 'Failed to initialize system',
        error: error.message || 'Unknown error occurred',
      };
    }
  }
}

// Export singleton instance
export const adminUserService = AdminUserService.getInstance();

// Export helper functions for direct use
export const createAdminUser = (request: CreateAdminUserRequest) =>
  adminUserService.createAdminUser(request);

export const createDefaultAdminUser = (email?: string) =>
  adminUserService.createDefaultAdminUser(email);

export const promoteToAdmin = (
  userId: string,
  newRole: UserRole,
  promotedBy: string,
  reason?: string
) => adminUserService.promoteToAdmin(userId, newRole, promotedBy, reason);

export const initializeSystem = () => adminUserService.initializeSystem();
