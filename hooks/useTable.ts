import { useState, useMemo, useCallback } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface UseTableOptions<T> {
  data: T[];
  pageSize?: number;
  initialSortKey?: keyof T;
  initialSortDirection?: SortDirection;
}

export interface UseTableReturn<T> {
  // Pagination
  currentPage: number;
  totalPages: number;
  pageSize: number;
  paginatedData: T[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;

  // Sorting
  sortKey: keyof T | null;
  sortDirection: SortDirection;
  sortBy: (key: keyof T) => void;
  sortedData: T[];

  // Selection
  selectedRows: Set<number>;
  toggleRow: (index: number) => void;
  toggleAll: () => void;
  clearSelection: () => void;
  isAllSelected: boolean;
}

export const useTable = <T extends Record<string, any>>({
  data,
  pageSize: initialPageSize = 10,
  initialSortKey = null,
  initialSortDirection = null,
}: UseTableOptions<T>): UseTableReturn<T> => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortKey, setSortKey] = useState<keyof T | null>(initialSortKey);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize]);

  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  const sortBy = useCallback((key: keyof T) => {
    if (sortKey === key) {
      // Toggle direction or clear sort
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  }, [sortKey, sortDirection]);

  // Selection
  const toggleRow = useCallback((index: number) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map((_, index) => index)));
    }
  }, [paginatedData, selectedRows.size]);

  const clearSelection = useCallback(() => {
    setSelectedRows(new Set());
  }, []);

  const isAllSelected = selectedRows.size === paginatedData.length && paginatedData.length > 0;

  return {
    // Pagination
    currentPage,
    totalPages,
    pageSize,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    setPageSize: handleSetPageSize,

    // Sorting
    sortKey,
    sortDirection,
    sortBy,
    sortedData,

    // Selection
    selectedRows,
    toggleRow,
    toggleAll,
    clearSelection,
    isAllSelected,
  };
};
