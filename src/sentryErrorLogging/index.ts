import ENV_KEYS from '@/utils/envKeys';
import { getLocalStorageUser } from '@/utils/helpers/localStorage';
import { W_LOCATION } from '@/utils/helpers/windowLocation';
import { init, replayIntegration, User } from '@sentry/react';

const sentryInit = async () => {
  let sentryEnvironment = ENV_KEYS.sentryEnvironment;
  if (window && !ENV_KEYS.sentryEnvironment) {
    sentryEnvironment = W_LOCATION.GET_HOST();
  }

  const integrations: ReturnType<typeof replayIntegration>[] = [
    replayIntegration({
      maskAllInputs: true,
      blockAllMedia: true,
    }),
  ];

  const user = await getLocalStorageUser();

  init({
    dsn: ENV_KEYS.sentryDsn,
    integrations,
    tracesSampleRate: 0.7,
    debug: false,
    initialScope: {
      user: user as User | undefined,
      tags: { sentryEnvironment },
    },
    environment: ENV_KEYS.sentryEnvironment,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    ignoreErrors: [], // Add custom default/dev errors to ignore here
  });
};

export default sentryInit;
