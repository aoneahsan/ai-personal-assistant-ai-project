import ENV_KEYS from '@/utils/envKeys';
import * as amplitude from '@amplitude/analytics-browser';
import { useEffect } from 'react';

let _isInitialized = false;

const AmplitudeHoc = () => {
  useEffect(() => {
    if (_isInitialized || !ENV_KEYS.amplitudeApiKey) return;

    amplitude.init(ENV_KEYS.amplitudeApiKey, { autocapture: true });

    _isInitialized = true;
  }, []);

  return <></>;
};

export default AmplitudeHoc;
