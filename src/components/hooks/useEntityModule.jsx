
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebounce } from './useDebounce';
import { useToast } from '@/components/ui/use-toast';
import { useLanguageHook as useTranslation } from '@/components/useLanguageHook';
import { saveToStorage, loadFromStorage as loadJsonFromStorage } from '@/components/utils/storage';

export function useEntityModule({
  entitySDK,
  formHook,
  entityName,
  entityNamePlural = `${entityName}s`,
  filterFunction,
  initialFilters = {},
  storageKey = null, // This storageKey is for filters which ARE JSON
  defaultSort = '-updated_date', // Can be string like '-updated_date' or object { key: 'updated_date', direction: 'descending' }
  defaultPageSize = 10
}) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // For filters, loadJsonFromStorage (which uses JSON.parse) is correct.
  const loadedFilters = storageKey 
    ? loadJsonFromStorage(`${storageKey}_filters`, initialFilters) 
    : initialFilters;
  
  const [filters, setFilters] = useState(loadedFilters);

  const [selectedItems, setSelectedItems] = useState([]);
  
  const [sorting, setSorting] = useState(() => {
    let sortField;
    let sortDesc;
    if (typeof defaultSort === 'string') {
      sortField = defaultSort.startsWith('-') ? defaultSort.substring(1) : defaultSort;
      sortDesc = defaultSort.startsWith('-');
    } else if (typeof defaultSort === 'object' && defaultSort !== null && defaultSort.key) {
      sortField = defaultSort.key;
      sortDesc = defaultSort.direction === 'descending';
    } else { // Fallback if defaultSort is invalid
      console.warn(`Invalid defaultSort format: ${JSON.stringify(defaultSort)}. Falling back to '-updated_date'.`);
      sortField = 'updated_date';
      sortDesc = true;
    }
    return [{ id: sortField, desc: sortDesc }];
  });

  const [pagination, setPagination] = useState({ 
    pageIndex: 0, 
    pageSize: defaultPageSize 
  });
  
  const defaultFormMethods = {
    formData: currentItem || {},
    errors: {},
    isSubmitting: false,
    updateField: () => console.warn("useEntityModule: updateField called without a formHook."),
    updateNestedField: () => console.warn("useEntityModule: updateNestedField called without a formHook."),
    handleSubmit: async () => console.warn("useEntityModule: handleSubmit called without a formHook. Dialog should handle its own submission."),
    resetForm: () => console.warn("useEntityModule: resetForm called without a formHook."),
  };

  const formHookProvided = typeof formHook === 'function';

  const formMethods = formHookProvided
    ? formHook(currentItem, (savedItem) => {
        fetchItems();
        closeDialog();
        toast({
          title: currentItem
            ? t('common.updateSuccess', { entity: entityName })
            : t('common.createSuccess', { entity: entityName }),
          variant: 'success'
        });
      }, isDialogOpen)
    : defaultFormMethods;

  const {
    formData,
    errors: formErrors,
    isSubmitting,
    updateField,
    updateNestedField,
    handleSubmit: handleFormSubmit,
    resetForm,
    ...otherFormProps
  } = formMethods;
  
  const fetchItems = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const sortParam = sorting.length > 0 ? `${sorting[0].desc ? '-' : ''}${sorting[0].id}` : (
        typeof defaultSort === 'string' ? defaultSort : `${defaultSort.direction === 'descending' ? '-' : ''}${defaultSort.key}`
      );
      const fetchedItems = await entitySDK.list(sortParam);
      setItems(Array.isArray(fetchedItems) ? fetchedItems : []);
    } catch (err) {
      console.error(`Error fetching ${entityNamePlural}:`, err);
      setError(err);
      toast({
        variant: "destructive",
        title: t('common.fetchError', { entity: entityNamePlural }),
        description: err.message
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [entitySDK, entityNamePlural, defaultSort, toast, sorting, t]);
  
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openDialog = useCallback((item = null) => {
    setCurrentItem(item);
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setCurrentItem(null);
    if (formHookProvided) {
      resetForm();
    }
  }, [resetForm, formHookProvided]);
  
  const handleSelfSubmittingDialogClose = useCallback((refreshNeeded) => {
    if (refreshNeeded) {
      fetchItems(true);
    }
    closeDialog();
  }, [fetchItems, closeDialog]);

  useEffect(() => {
    // Only save filters if they differ from initial ones to avoid unnecessary storage writes
    if (storageKey && JSON.stringify(filters) !== JSON.stringify(initialFilters)) {
      saveToStorage(`${storageKey}_filters`, filters);
    }
  }, [filters, storageKey, initialFilters]);
  
  const handleFilterChangeCallback = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);
  
  const resetFiltersCallback = useCallback(() => {
    setSearchQuery('');
    setFilters(initialFilters);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
    if (storageKey) {
      saveToStorage(`${storageKey}_filters`, initialFilters);
    }
  }, [initialFilters, storageKey]);
  
  const handleDeleteCallback = useCallback(async (itemId) => {
    setLoading(true);
    try {
      await entitySDK.delete(itemId);
      toast({
        title: t('common.deleteSuccess', { entity: entityName }),
        variant: 'success'
      });
      fetchItems();
      setSelectedItems(prev => prev.filter(id => id !== itemId)); // Remove deleted item from selection
    } catch (err) {
      console.error(`Error deleting ${entityName}:`, err);
      toast({
        variant: "destructive",
        title: t('common.deleteError', { entity: entityName }),
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  }, [entitySDK, entityName, fetchItems, t, toast]);
  
  const handleBulkDeleteCallback = useCallback(async () => {
    if (selectedItems.length === 0) return;

    setLoading(true);
    try {
      await Promise.all(selectedItems.map(itemId => entitySDK.delete(itemId)));
      toast({
        title: t('common.bulkDeleteSuccess', { count: selectedItems.length, entityPlural: entityNamePlural }),
        variant: 'success'
      });
      setSelectedItems([]); // Clear selection
      fetchItems();
    } catch (err) {
      console.error(`Error bulk deleting ${entityNamePlural}:`, err);
      toast({
        variant: "destructive",
        title: t('common.bulkDeleteError', { entityPlural: entityNamePlural }),
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  }, [selectedItems, entitySDK, entityName, entityNamePlural, fetchItems, t, toast]);

  const handleSortChange = useCallback((columnId, directionOverride) => {
    setSorting(prevSorting => {
      const currentSort = prevSorting.length > 0 ? prevSorting[0] : {};
      let newDirection = 'asc'; // Default to ascending if no current sort or different column
      if (currentSort.id === columnId) {
        newDirection = currentSort.desc ? 'asc' : 'desc'; // Toggle if same column
      }
      if (directionOverride) { // Allow explicit direction setting
        newDirection = directionOverride;
      }
      return [{ id: columnId, desc: newDirection === 'desc' }];
    });
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  const filteredAndSortedItems = useMemo(() => {
    let sourceItems = Array.isArray(items) ? items : [];
    let processedItems = sourceItems;

    // Apply custom filter function if provided
    if (typeof filterFunction === 'function') {
      const customFiltered = filterFunction(sourceItems, filters, debouncedSearchQuery);
      processedItems = Array.isArray(customFiltered) ? customFiltered : sourceItems;
    } else {
      // Default filtering logic (combining search query and filters object)
      processedItems = sourceItems.filter(item => {
        const searchMatch = !debouncedSearchQuery ||
          Object.values(item).some(val =>
            val && String(val).toLowerCase().includes(debouncedSearchQuery.toLowerCase())
          );

        const otherFiltersMatch = Object.entries(filters).every(([key, value]) => {
          if (key === 'searchTerm' || value === null || value === undefined || value === '' || String(value).toLowerCase() === 'all') return true;

          const itemVal = item[key];
          if (itemVal === undefined || itemVal === null) return false;

          if (typeof itemVal === 'boolean') {
            return itemVal === (String(value).toLowerCase() === 'true');
          }
          return String(itemVal).toLowerCase().includes(String(value).toLowerCase());
        });
        return searchMatch && otherFiltersMatch;
      });
    }
    
    // Apply sorting (simplified, assumes sorting is an array with one object like TanStack Table)
    if (sorting.length > 0) {
      const sortKey = sorting[0].id;
      const sortDesc = sorting[0].desc;
      
      const sortableItems = [...processedItems]; // Create a shallow copy to sort

      sortableItems.sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];

        // Handle null/undefined values by placing them at the end (or beginning, depending on desc)
        if (valA === null || valA === undefined) return sortDesc ? -1 : 1; // Nulls go to the end for desc, start for asc
        if (valB === null || valB === undefined) return sortDesc ? 1 : -1; // Nulls go to the end for desc, start for asc

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
        } else if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDesc ? valB - valA : valA - valB;
        } else if (valA instanceof Date && valB instanceof Date) {
          return sortDesc ? valB.getTime() - valA.getTime() : valA.getTime() - valB.getTime();
        } else {
          // Fallback for mixed types or non-standard types: convert to string
          const strA = String(valA).toLowerCase();
          const strB = String(valB).toLowerCase();
          return sortDesc ? strB.localeCompare(strA) : strA.localeCompare(strB);
        }
      });
      processedItems = sortableItems;
    }
    return Array.isArray(processedItems) ? processedItems : [];
  }, [items, filters, debouncedSearchQuery, filterFunction, sorting]);


  const paginatedItems = useMemo(() => {
    const { pageIndex, pageSize } = pagination;
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return Array.isArray(filteredAndSortedItems) ? filteredAndSortedItems.slice(start, end) : [];
  }, [filteredAndSortedItems, pagination]);

  const totalFilteredItems = useMemo(() => {
    return Array.isArray(filteredAndSortedItems) ? filteredAndSortedItems.length : 0;
  }, [filteredAndSortedItems]);

  const handleAddNew = useCallback(() => openDialog(), [openDialog]);

  const handleEdit = useCallback((item) => openDialog(item), [openDialog]);

  const handleToggleSelection = useCallback((itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === paginatedItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedItems.map(item => item.id));
    }
  }, [paginatedItems, selectedItems]);
  
  return {
    items: paginatedItems, // Return paginated items
    rawItems: items, // Raw, unsorted, unfiltered items
    filteredAndSortedItems, // Items after filtering and sorting, before pagination
    loading, 
    error, 
    
    isDialogOpen, 
    currentItem, 
    openDialog, 
    closeDialog,
    
    // Form related (from formHook or default)
    formData, 
    formErrors, 
    isSubmitting, 
    updateField, 
    updateNestedField, 
    handleSubmit: handleFormSubmit, 
    resetForm, 
    ...otherFormProps,
    
    // Search and Filter specific
    searchQuery, 
    setSearchQuery,
    debouncedSearchQuery,
    filters, 
    setFilters,
    handleFilterChange: handleFilterChangeCallback, 
    resetFilters: resetFiltersCallback,
    
    // Selection specific
    selectedItems, 
    setSelectedItems, 
    hasSelectedItems: selectedItems.length > 0,
    selectedCount: selectedItems.length,
    isSelectionModeActive: selectedItems.length > 0,
    setIsSelectionModeActive: (active) => {
        if (!active) setSelectedItems([]);
    },
    handleToggleSelection,
    handleSelectAll,

    // Sorting and Pagination for DataTable
    sorting,
    setSorting, // Directly expose for TanStack Table
    sortConfig: sorting.length > 0 
        ? { key: sorting[0].id, direction: sorting[0].desc ? 'descending' : 'ascending' } 
        : { key: (typeof defaultSort === 'string' ? (defaultSort.startsWith('-') ? defaultSort.substring(1) : defaultSort) : defaultSort.key), 
            direction: (typeof defaultSort === 'string' ? (defaultSort.startsWith('-') ? 'descending' : 'ascending') : defaultSort.direction) },
    setSortConfig: (newSortConfig) => { // Adapt to {key, direction} object
      setSorting([{ id: newSortConfig.key, desc: newSortConfig.direction === 'descending' }]);
    },
    pagination: { // Adapt to TanStack Table like pagination object
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        totalItems: totalFilteredItems,
        totalPages: Math.ceil(totalFilteredItems / pagination.pageSize) || 1,
    },
    setPagination, // Allow direct setting for TanStack Table
    
    // CRUD Actions
    fetchItems, // Renamed from handleRefresh to be more generic
    handleRefresh: fetchItems, // Keep handleRefresh for backward compatibility if any tab uses it
    handleSearch: setSearchQuery, // Expose setSearchQuery as handleSearch for consistency
    handleSortChange, // This is the TanStack Table compatible sort changer
    handlePageChange: (newPageIndex) => setPagination(prev => ({ ...prev, pageIndex: newPageIndex })), // TanStack Table
    handlePageSizeChange: (newPageSize) => setPagination(prev => ({ ...prev, pageSize: newPageSize, pageIndex: 0 })), // TanStack Table
    handleAddNew,
    handleEdit,
    handleDelete: handleDeleteCallback, 
    handleBulkDelete: handleBulkDeleteCallback,
    handleSelfSubmittingDialogClose,
    totalFilteredItems, // expose total count after filtering
  };
}
