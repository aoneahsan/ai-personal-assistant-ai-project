import { auth, db } from '@/services/firebase';
import { UserRole } from '@/types/user/roles';
import { SubscriptionPlan } from '@/types/user/subscription';
import { PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS } from '@/utils/constants/generic/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

/**
 * Create the default admin user
 */
export async function createDefaultAdmin() {
  const email = 'aoneahsan@gmail.com';
  const password = generateSecurePassword();
  const displayName = 'System Administrator';

  try {
    console.log('🔧 Creating default admin user...');

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

    console.log('✅ Default admin user created successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log(
      '⚠️  IMPORTANT: Please change this password after first login!'
    );

    return {
      success: true,
      email,
      password,
      userId: firebaseUser.uid,
    };
  } catch (error: any) {
    console.error('❌ Error creating default admin user:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Generate a secure random password
 */
function generateSecurePassword(): string {
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
 * Helper function to create admin user
 */
export async function createAdminUser(
  email: string,
  password: string,
  displayName: string,
  role: UserRole = UserRole.ADMIN
) {
  try {
    console.log('🔧 Creating admin user:', email);

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
      role: role,
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
        role: role,
        assignedBy: 'SYSTEM',
        assignedAt: new Date(),
        reason: 'Admin user created via admin service',
        isActive: true,
      },
      adminNotes: 'Admin user created via admin service',
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

    console.log('✅ Admin user created successfully:', email);

    return {
      success: true,
      email,
      userId: firebaseUser.uid,
      role,
    };
  } catch (error: any) {
    console.error('❌ Error creating admin user:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Export for use in other files
export { UserRole };
