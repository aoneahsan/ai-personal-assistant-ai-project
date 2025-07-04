import {
  createDefaultAdminUser,
  initializeSystem,
} from '@/services/adminUserService';
import { consoleError, consoleLog } from '@/utils/helpers/consoleHelper';

/**
 * Initialize the system with default admin user
 * This script can be run to create the default admin user if none exists
 */
export async function initializeAdminUser(): Promise<void> {
  try {
    consoleLog('🚀 Starting admin user initialization...');

    // Initialize system - creates default admin if no admins exist
    const result = await initializeSystem();

    if (result.success) {
      consoleLog('✅ Admin initialization completed:', result.message);

      if (result.user) {
        consoleLog('📋 Admin user details:', {
          email: result.user.email,
          displayName: result.user.displayName,
          role: result.user.role,
          id: result.user.id,
        });
      }
    } else {
      consoleError('❌ Admin initialization failed:', result.error);
    }
  } catch (error) {
    consoleError('❌ Error during admin initialization:', error);
  }
}

/**
 * Force create the default admin user
 * This will create the admin user even if others already exist
 */
export async function forceCreateDefaultAdmin(
  email: string = 'aoneahsan@gmail.com'
): Promise<void> {
  try {
    consoleLog('🔧 Force creating default admin user...');

    const result = await createDefaultAdminUser(email);

    if (result.success) {
      consoleLog('✅ Default admin user created successfully!');
      consoleLog('📧 Login credentials:');
      consoleLog(result.message);
    } else {
      consoleError('❌ Failed to create default admin user:', result.error);
    }
  } catch (error) {
    consoleError('❌ Error creating default admin user:', error);
  }
}

// Auto-run if this script is executed directly
if (typeof window === 'undefined') {
  // Running in Node.js environment
  initializeAdminUser();
}
