import { useEffect, useState } from 'react';

interface UseAsyncDataOptions {
  autoLoad?: boolean;
  dependencies?: React.DependencyList;
}

interface UseAsyncDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
}

export const useAsyncData = <T>(
  loadData: () => Promise<T>,
  options: UseAsyncDataOptions = {}
): UseAsyncDataReturn<T> => {
  const { autoLoad = true, dependencies = [] } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<Error | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loadData();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) {
      load();
    }
  }, [autoLoad, loadData, ...dependencies]);

  return { data, loading, error, reload: load };
};
