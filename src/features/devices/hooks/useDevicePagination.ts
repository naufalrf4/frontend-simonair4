import { useState, useCallback, useMemo, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import type { PaginationState, GetDevicesParams } from '../types';

interface UseDevicePaginationOptions {
  defaultLimit?: number;
  enableUrlSync?: boolean;
}

interface UseDevicePaginationReturn {
  pagination: PaginationState;
  queryParams: GetDevicesParams;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
  resetPagination: () => void;
  updatePaginationFromResponse: (response: { pagination: Omit<PaginationState, 'search'> }) => void;
}

/**
 * Custom hook for managing device pagination and search
 */
export function useDevicePagination(options: UseDevicePaginationOptions = {}): UseDevicePaginationReturn {
  const { defaultLimit = 10 } = options;
  
  // Initialize state with defaults
  const [pagination, setPagination] = useState<PaginationState>(() => ({
    page: 1,
    limit: defaultLimit,
    total: 0,
    totalPages: 0,
    search: '',
  }));

  // Debounce search input to avoid excessive API calls
  const debouncedSearch = useDebounce(pagination.search, 300);

  // Create query parameters for API calls
  const queryParams: GetDevicesParams = useMemo(() => ({
    page: pagination.page,
    limit: pagination.limit,
    search: debouncedSearch,
  }), [pagination.page, pagination.limit, debouncedSearch]);

  // Reset to page 1 when search changes
  useEffect(() => {
    if (pagination.search !== debouncedSearch && pagination.page > 1) {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [debouncedSearch, pagination.search, pagination.page]);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page: Math.max(1, page) }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination(prev => ({ 
      ...prev, 
      limit: Math.max(1, limit),
      page: 1, // Reset to first page when changing limit
    }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setPagination(prev => ({ 
      ...prev, 
      search,
      page: 1, // Reset to first page when searching
    }));
  }, []);

  const resetPagination = useCallback(() => {
    setPagination({
      page: 1,
      limit: defaultLimit,
      total: 0,
      totalPages: 0,
      search: '',
    });
  }, [defaultLimit]);

  const updatePaginationFromResponse = useCallback((response: { pagination: Omit<PaginationState, 'search'> }) => {
    setPagination(prev => ({
      ...prev,
      total: response.pagination.total,
      totalPages: response.pagination.totalPages,
      // Keep current page and limit from state, but ensure page doesn't exceed totalPages
      page: Math.min(prev.page, Math.max(1, response.pagination.totalPages)),
    }));
  }, []);

  return {
    pagination,
    queryParams,
    setPage,
    setLimit,
    setSearch,
    resetPagination,
    updatePaginationFromResponse,
  };
}