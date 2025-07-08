import { captureException } from '@sentry/react';
import ENV_KEYS from './envKeys';
import { consoleError } from './helpers/consoleHelper';
import { getLocalStorageUser } from './helpers/localStorage';
import { W_LOCATION } from './helpers/windowLocation';

export class CustomError extends Error {
  metaData;
  sentryEnvironment;
  capturedAt;

  constructor(
    message = 'CustomError',
    metaData = {},
    sentryEnvironment = ENV_KEYS.sentryEnvironment,
    ...params: undefined[]
  ) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }

    this.name = `[CustomError] - [Environment]: ${sentryEnvironment} - [ErrorMessage]: ${message}`;
    this.message = message;
    this.metaData = metaData;
    this.sentryEnvironment = sentryEnvironment;
    this.capturedAt = new Date();
  }
}

export const reportError = async ({
  err,
  metaData = {},
  printToConsole = true,
  reportToSentry = false,
}: {
  err: Error | unknown;
  metaData?: Record<string, unknown>;
  printToConsole?: boolean;
  reportToSentry?: boolean;
}) => {
  try {
    if (err && typeof err === 'object' && 'message' in err) {
      const user = await getLocalStorageUser();

      let sentryEnvironment = ENV_KEYS.sentryEnvironment;
      if (window && !ENV_KEYS.sentryEnvironment) {
        sentryEnvironment = W_LOCATION.GET_HOST();
      }

      const errorToReport = new CustomError(
        String(err.message),
        {
          error: err,
          metaData,
          user,
          reportedError: true,
        },
        sentryEnvironment
      );

      if (reportToSentry) {
        // sending error info to sentry, to fire alarms and notifications
        captureException(errorToReport);
      }

      if (printToConsole) {
        consoleError(err);
      }
    }
  } catch {
    // some custom implementation, using DB & email/sms to alert
  }
};
