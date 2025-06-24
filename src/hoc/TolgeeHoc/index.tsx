import ENV_KEYS from '@/utils/envKeys';
import { DevTools, FormatSimple, Tolgee, TolgeeProvider } from '@tolgee/react';

const tolgeeKeysFound = ENV_KEYS.tolgeeApiUrl && ENV_KEYS.tolgeeApiKey;

const tolgee = tolgeeKeysFound
  ? Tolgee()
      .use(DevTools())
      .use(FormatSimple())
      // replace with .use(FormatIcu()) for rendering plurals, foramatted numbers, etc.
      .init({
        language: 'en',

        // for development
        apiUrl: ENV_KEYS.tolgeeApiUrl,
        apiKey: ENV_KEYS.tolgeeApiKey,

        // for production
        // staticData: {},
      })
  : null;

const TolgeeHoc: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return tolgee ? (
    <TolgeeProvider
      tolgee={tolgee}
      fallback='Loading...' // loading fallback
    >
      {children}
    </TolgeeProvider>
  ) : (
    <>{children}</>
  );
};

export default TolgeeHoc;
