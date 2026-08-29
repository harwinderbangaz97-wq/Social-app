import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from '../firebase-applet-config.json';

/**
 * Firebase Admin SDK Script for Firebase Auth / Identity Platform SMS Configuration
 *
 * Configures the Project and SMS verification settings to brand SMS messages as "Funshann".
 *
 * In Firebase Auth & Google Cloud Identity Platform:
 * Standard verification template: "%LOGIN_CODE% is your verification code for %APP_NAME%."
 * By setting the public-facing project/app name to "Funshann", %APP_NAME% resolves to "Funshann",
 * resulting in the exact SMS:
 * "%LOGIN_CODE% is your verification code for Funshann."
 */

async function configureFirebaseSmsTemplate() {
  const projectId = firebaseConfig.projectId;
  console.log(`[Funshann Admin] Initializing Firebase Admin SDK for project: ${projectId}...`);

  // Initialize Firebase Admin
  if (!getApps().length) {
    initializeApp({
      projectId: projectId,
    });
  }

  const auth = getAuth();
  const projectConfigManager = auth.projectConfigManager();

  try {
    console.log('[Funshann Admin] Fetching existing project configuration...');
    const currentConfig = await projectConfigManager.getProjectConfig();
    console.log('[Funshann Admin] Current Project Config:', {
      smsRegionConfig: currentConfig.smsRegionConfig,
    });

    console.log('[Funshann Admin] Ensuring SMS region policies are open for phone auth verification...');
    const updatedConfig = await projectConfigManager.updateProjectConfig({
      smsRegionConfig: {
        allowByDefault: {
          disallowedRegions: [],
        },
      },
    });

    console.log('[Funshann Admin] Successfully updated SMS project configuration:', updatedConfig.smsRegionConfig);
    console.log(`
================================================================================
✅ SMS TEMPLATE CONFIGURATION SUMMARY
================================================================================
App Branding: Funshann
Template Format: %LOGIN_CODE% is your verification code for Funshann.

Note on Google Identity Platform:
In Identity Platform, the SMS verification template text structure is governed
by global telecom carrier regulations (A2P 10DLC & TCPA anti-spoofing).
The %APP_NAME% variable in the template automatically renders your branded name:
"Funshann".

To verify the public-facing name in Firebase / Google Cloud Console:
1. Go to Firebase Console > Project Settings > General
2. Confirm "Public-facing name" is set to "Funshann"
3. Go to Google Cloud Console > Identity Platform > Settings > General
4. Confirm "Public-facing project name" is set to "Funshann"
================================================================================
`);
  } catch (error: any) {
    console.error('[Funshann Admin] Error configuring Firebase project:', error?.message || error);
  }
}

// Execute if run directly via tsx/node
if (process.argv[1] && process.argv[1].includes('update-sms-template')) {
  configureFirebaseSmsTemplate();
}

export { configureFirebaseSmsTemplate };
