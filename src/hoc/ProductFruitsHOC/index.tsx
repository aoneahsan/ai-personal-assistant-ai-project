import ENV_KEYS from '@/utils/envKeys';
import { useUserDataZState } from '@/zustandStates/userState';
import { useEffect } from 'react';
import { isFunction } from 'zaions-tool-kit';

// Type definition for ProductFruits global object
interface ProductFruitsWindow extends Window {
  $productFruits?: {
    push: (data: [string, string, string, { username: string }]) => void;
  };
}

const ProductFruitsHOC: React.FC = () => {
  const userData = useUserDataZState((state) => state.data);
  const userId = userData?.id;

  useEffect(() => {
    if (!ENV_KEYS.productFruitsAppId) return;

    let intervalRef: string | number | NodeJS.Timeout | undefined;
    try {
      let productFruitsIsInitialized = false;

      intervalRef = setInterval(() => {
        const productFruitsWindow = window as ProductFruitsWindow;
        if (
          userId &&
          !productFruitsIsInitialized &&
          window &&
          productFruitsWindow.$productFruits &&
          isFunction(productFruitsWindow.$productFruits.push)
        ) {
          productFruitsWindow.$productFruits.push([
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
    } catch {
      // Silently handle initialization errors
    }

    return () => {
      if (intervalRef) {
        clearInterval(intervalRef);
      }
    };
  }, [userId]);

  return <></>;
};

export default ProductFruitsHOC;
