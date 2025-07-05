import { useCallback, useEffect, useState } from 'react';
import { useToast } from './useToast';

export interface AsyncDataOptions {
  entityName?: string;
  showSuccessOnRefresh?: boolean;
  autoLoad?: boolean;
  dependencies?: any[];
}

export const useAsyncData = <T>(
  fetchFunction: () => Promise<T>,
  options: AsyncDataOptions = {}
) => {
  const {
    entityName = 'data',
    showSuccessOnRefresh = true,
    autoLoad = true,
    dependencies = [],
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(autoLoad);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { showRefreshSuccess, showLoadError } = useToast();

  const loadData = useCallback(
    async (isRefresh = false) => {
      try {
        setError(null);

        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const result = await fetchFunction();
        setData(result);

        if (isRefresh && showSuccessOnRefresh) {
          showRefreshSuccess(entityName);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error(`Error loading ${entityName}:`, err);
        showLoadError(entityName);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      fetchFunction,
      entityName,
      showSuccessOnRefresh,
      showRefreshSuccess,
      showLoadError,
    ]
  );

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
