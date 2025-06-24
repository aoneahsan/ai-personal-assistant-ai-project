import { isHybrid, isWebBrowser } from '@/utils/constants/capacitorConstants';
import ENV_KEYS from '@/utils/envKeys';
import { consoleInfo } from '@/utils/helpers/consoleHelper';
import { useOneSignalZState } from '@/zustandStates/oneSignal';
import { useUserDataZState } from '@/zustandStates/userState';
import { UserTypeEnum } from '@perkforce/tool-kit';
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
          type: _currentUser?.type ?? null,
          name: _currentUser?.name ?? null,
        };

        const _currentUserIsEmployee =
          _currentUserData.type === UserTypeEnum.employee;

        if (_currentUserData.id && _currentUserData.email) {
          if (isWebBrowser) {
            try {
              await OneSignalWeb.logout();
            } catch (_) {}

            try {
              await OneSignalWeb.login(_currentUserData.id);
            } catch (_) {}

            try {
              await OneSignalWeb.Notifications.requestPermission();
            } catch (_) {}

            try {
              OneSignalWeb.User.addEmail(_currentUserData.email);
              OneSignalWeb.User.addAlias('email', _currentUserData.email);
              OneSignalWeb.User.addAlias('userId', _currentUserData.id);

              try {
                if (_currentUserData.type) {
                  OneSignalWeb.User.addTag('type', _currentUserData.type);
                }
                if (_currentUserIsEmployee) {
                  OneSignalWeb.User.addTag('email', _currentUserData.email);
                } else {
                  OneSignalWeb.User.addTag('email', _currentUserData.email);
                }
              } catch (_) {}
            } catch (_) {}

            try {
              await OneSignalWeb.User.PushSubscription.optIn();

              OneSignalWeb.User.PushSubscription.addEventListener(
                'change',
                (event) => {
                  consoleInfo({
                    message:
                      'OneSignalWeb.User.PushSubscription.addEventListener - event',
                    event,
                  });
                }
              );
            } catch (_) {}
          } else if (isHybrid) {
            try {
              try {
                OneSignalMobile.logout();
              } catch (_) {}

              setTimeout(async () => {
                try {
                  OneSignalMobile.login(_currentUserData.id);
                } catch (_) {}

                try {
                  const requestPermission =
                    await OneSignalMobile.Notifications.requestPermission(true);

                  consoleInfo({
                    message: 'requestPermission',
                    requestPermission,
                  });
                } catch (_) {}

                try {
                  const permissionNative =
                    await OneSignalMobile.Notifications.permissionNative();

                  consoleInfo({
                    message: 'permissionNative',
                    permissionNative,
                  });
                } catch (_) {}

                try {
                  const getPermissionAsync =
                    await OneSignalMobile.Notifications.getPermissionAsync();

                  consoleInfo({
                    message: 'getPermissionAsync',
                    getPermissionAsync,
                  });
                } catch (_) {}

                try {
                  OneSignalMobile.setConsentGiven(true);
                  OneSignalMobile.InAppMessages.setPaused(false);
                } catch (_) {}

                try {
                  OneSignalMobile.User.addEmail(_currentUserData.email);
                  OneSignalMobile.User.addAlias(
                    'email',
                    _currentUserData.email
                  );
                  OneSignalMobile.User.addAlias('userId', _currentUserData.id);

                  try {
                    if (_currentUserData.type) {
                      OneSignalMobile.User.addTag(
                        'type',
                        _currentUserData.type
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
                  } catch (_) {}
                } catch (_) {}

                try {
                  OneSignalMobile.User.pushSubscription.optIn();
                  OneSignalMobile.User.setLanguage('en');

                  OneSignalMobile.User.pushSubscription.addEventListener(
                    'change',
                    (event) => {
                      consoleInfo({
                        message:
                          'OneSignalMobile.User.pushSubscription.addEventListener - event',
                        event,
                      });
                    }
                  );
                } catch (_) {}

                try {
                  const getOptedInAsync =
                    await OneSignalMobile.User.pushSubscription.getOptedInAsync();

                  consoleInfo({
                    message: 'getOptedInAsync',
                    getOptedInAsync,
                  });
                } catch (_) {}
              }, 1000);
            } catch (_) {}
          }
        }
      }
    })();
  }, [isWebBrowser, userDataZState?.id]);

  return <></>;
};

export default OneSignalHOC;
