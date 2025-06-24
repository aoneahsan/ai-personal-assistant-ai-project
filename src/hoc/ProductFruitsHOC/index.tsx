import ENV_KEYS from '@/utils/envKeys';
import { useUserDataZState } from '@/zustandStates/userState';
import { useEffect } from 'react';
import { isFunction } from 'zaions-tool-kit';

const ProductFruitsHOC: React.FC = () => {
  const userData = useUserDataZState((state) => state.data);
  const userId = userData?.id;

  useEffect(() => {
    if (!ENV_KEYS.productFruitsAppId) return;

    let intervalRef: string | number | NodeJS.Timeout | undefined;
    try {
      let productFruitsIsInitialized = false;

      intervalRef = setInterval(() => {
        if (
          userId &&
          !productFruitsIsInitialized &&
          window &&
          (window as any)?.$productFruits &&
          isFunction((window as any)?.$productFruits?.push)
        ) {
          (window as any)?.$productFruits?.push([
            'init',
            ENV_KEYS.productFruitsAppId,
            'en',
            { username: userId },
          ]);

          productFruitsIsInitialized = true;
        } else if (productFruitsIsInitialized && intervalRef) {
          clearInterval(intervalRef);
        }
      }, 2000);
    } catch (_) {}

    return () => {
      if (intervalRef) {
        clearInterval(intervalRef);
      }
    };
  }, [userId]);

  return <></>;
};

export default ProductFruitsHOC;
