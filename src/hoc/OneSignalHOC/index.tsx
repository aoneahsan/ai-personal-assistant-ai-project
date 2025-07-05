import { UserRole } from '@/types/user';
import { isHybrid, isWebBrowser } from '@/utils/constants/capacitorConstants';
import ENV_KEYS from '@/utils/envKeys';
import { consoleInfo } from '@/utils/helpers/consoleHelper';
import { useOneSignalZState } from '@/zustandStates/oneSignal';
import { useUserDataZState } from '@/zustandStates/userState';
import OneSignalMobile from 'onesignal-cordova-plugin';
import { useEffect } from 'react';
import OneSignalWeb from 'react-onesignal';

let _isInitialized = false;
let _oneSignaUserDataSet = false;

const OneSignalHOC: React.FC = () => {
  const oneSignalZState = useOneSignalZState();
  const userDataZState = useUserDataZState((state) => state.data);

  useEffect(() => {
    (async () => {
      if (
        oneSignalZState?.isInitialized ||
        _isInitialized ||
        !ENV_KEYS.oneSignalAppId
      ) {
        return;
      } else {
        if (isWebBrowser) {
          OneSignalWeb.init({
            appId: ENV_KEYS.oneSignalAppId,

            allowLocalhostAsSecureOrigin: true,
            autoRegister: true,
            autoResubscribe: true,
            path: '/',
            serviceWorkerPath:
              'push-notifications/one-signal/OneSignalSDKWorker.js',
            serviceWorkerParam: {
              scope: '/push-notifications/one-signal/',
            }, // Changed scope
            // Enable for debugging
            enableLogs: true,
          });
        } else if (isHybrid) {
          OneSignalMobile.initialize(ENV_KEYS.oneSignalAppId);
        }

        _isInitialized = true;
        oneSignalZState?.setIsInitialized();
      }
    })();
  }, [isWebBrowser, oneSignalZState?.isInitialized]);

  useEffect(() => {
    (async () => {
      const _currentUser = useUserDataZState.getState().data;
      if (_isInitialized && !_oneSignaUserDataSet && _currentUser?.id) {
        _oneSignaUserDataSet = true;

        const _currentUserData = {
          id: _currentUser?.id ?? '',
          email: _currentUser?.email ?? '',
          role: _currentUser?.role ?? null,
          displayName: _currentUser?.displayName ?? null,
        };

        const _currentUserIsEmployee =
          _currentUserData.role &&
          [
            UserRole.SUPPORT,
            UserRole.MODERATOR,
            UserRole.ADMIN,
            UserRole.SUPER_ADMIN,
          ].includes(_currentUserData.role);

        if (_currentUserData.id && _currentUserData.email) {
          if (isWebBrowser) {
            try {
              await OneSignalWeb.logout();
            } catch {
              // Intentionally ignore logout errors
            }

            try {
              await OneSignalWeb.login(_currentUserData.id);
            } catch {
              // Intentionally ignore login errors
            }

            try {
              await OneSignalWeb.Notifications.requestPermission();
            } catch {
              // Intentionally ignore permission request errors
            }

            try {
              OneSignalWeb.User.addEmail(_currentUserData.email);
              OneSignalWeb.User.addAlias('email', _currentUserData.email);
              OneSignalWeb.User.addAlias('userId', _currentUserData.id);

              try {
                if (_currentUserData.role) {
                  OneSignalWeb.User.addTag('role', _currentUserData.role);
                }
                if (_currentUserIsEmployee) {
                  OneSignalWeb.User.addTag('email', _currentUserData.email);
                } else {
                  OneSignalWeb.User.addTag('email', _currentUserData.email);
                }
              } catch {
                // Intentionally ignore tag setting errors
              }
            } catch {
              // Intentionally ignore user data setting errors
            }

            try {
              await OneSignalWeb.User.PushSubscription.optIn();

              OneSignalWeb.User.PushSubscription.addEventListener(
                'change',
                (event) => {
                  consoleInfo(
                    'OneSignalWeb.User.PushSubscription.addEventListener - event',
                    event
                  );
                }
              );
            } catch {
              // Intentionally ignore push subscription errors
            }
          } else if (isHybrid) {
            try {
              try {
                OneSignalMobile.logout();
              } catch {
                // Intentionally ignore logout errors
              }

              setTimeout(async () => {
                try {
                  OneSignalMobile.login(_currentUserData.id);
                } catch {
                  // Intentionally ignore login errors
                }

                try {
                  const requestPermission =
                    await OneSignalMobile.Notifications.requestPermission(true);

                  consoleInfo('requestPermission', requestPermission);
                } catch {
                  // Intentionally ignore permission request errors
                }

                try {
                  const permissionNative =
                    await OneSignalMobile.Notifications.permissionNative();

                  consoleInfo('permissionNative', permissionNative);
                } catch {
                  // Intentionally ignore permission native errors
                }

                try {
                  const getPermissionAsync =
                    await OneSignalMobile.Notifications.getPermissionAsync();

                  consoleInfo('getPermissionAsync', getPermissionAsync);
                } catch {
                  // Intentionally ignore get permission async errors
                }

                try {
                  OneSignalMobile.setConsentGiven(true);
                  OneSignalMobile.InAppMessages.setPaused(false);
                } catch {
                  // Intentionally ignore consent setting errors
                }

                try {
                  OneSignalMobile.User.addEmail(_currentUserData.email);
                  OneSignalMobile.User.addAlias(
                    'email',
                    _currentUserData.email
                  );
                  OneSignalMobile.User.addAlias('userId', _currentUserData.id);

                  try {
                    if (_currentUserData.role) {
                      OneSignalMobile.User.addTag(
                        'role',
                        _currentUserData.role
                      );
                    }
                    if (_currentUserIsEmployee) {
                      OneSignalMobile.User.addTag(
                        'organizationOwnerEmail',
                        _currentUserData.email
                      );
                    } else {
                      OneSignalMobile.User.addTag(
                        'email',
                        _currentUserData.email
                      );
                    }
                  } catch {
                    // Intentionally ignore tag setting errors
                  }
                } catch {
                  // Intentionally ignore user data setting errors
                }

                try {
                  OneSignalMobile.User.pushSubscription.optIn();
                  OneSignalMobile.User.setLanguage('en');

                  OneSignalMobile.User.pushSubscription.addEventListener(
                    'change',
                    (event) => {
                      consoleInfo(
                        'OneSignalMobile.User.pushSubscription.addEventListener - event',
                        event
                      );
                    }
                  );
                } catch {
                  // Intentionally ignore push subscription errors
                }

                try {
                  const getOptedInAsync =
                    await OneSignalMobile.User.pushSubscription.getOptedInAsync();

                  consoleInfo('getOptedInAsync', getOptedInAsync);
                } catch {
                  // Intentionally ignore get opted in async errors
                }
              }, 1000);
            } catch {
              // Intentionally ignore hybrid initialization errors
            }
          }
        }
      }
    })();
  }, [isWebBrowser, userDataZState?.id]);

  return <></>;
};

export default OneSignalHOC;
