import { useEffect, useState } from 'react';
import { useToast } from './useToast';

interface UseAsyncDataOptions<T> {
  autoLoad?: boolean;
  dependencies?: React.DependencyList;
}

export const useAsyncData = <T = unknown>(
  loadData: () => Promise<T>,
  options: UseAsyncDataOptions<T> = {}
) => {
  const { autoLoad = true, dependencies = [] } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(autoLoad);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { showRefreshSuccess, showLoadError } = useToast();

  const refresh = useCallback(() => {
    loadData(true);
  }, [loadData]);

  const reload = useCallback(() => {
    loadData(false);
  }, [loadData]);

  useEffect(() => {
    if (autoLoad) {
      loadData(false);
    }
  }, dependencies);

  return {
    data,
    loading,
    refreshing,
    error,
    loadData,
    refresh,
    reload,
    setData,
  };
};
