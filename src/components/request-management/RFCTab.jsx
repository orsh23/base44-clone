
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguageHook } from '@/components/useLanguageHook';
import { useToast } from "@/components/ui/use-toast";
import { RequestForCommitment } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/ui/loading-spinner';
import EmptyState from '@/components/ui/empty-state';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';

import RFCDialog from './RFCDialog';
import RFCCard from './RFCCard';
// import RFCDetailsDrawer from './RFCDetailsDrawer'; // Assuming a details drawer might exist
import ViewSwitcher from '@/components/common/ViewSwitcher';
import GlobalActionButton from '@/components/common/GlobalActionButton';
import DataTable from '@/components/shared/DataTable';
import RFCFilterBar from './RFCFilterBar';
import ImportDialog from '@/components/common/ImportDialog';

// Assuming these are new imports for related entities used in filters
import { Provider } from '@/api/entities';
import { Doctor } from '@/api/entities';
import { InsuredPerson } from '@/api/entities';

import {
    Plus, UploadCloud, RefreshCw, AlertTriangle, ClipboardCheck
} from 'lucide-react';

import { format, parseISO, isValid } from 'date-fns';
import { enUS, he } from 'date-fns/locale';

const getLocaleObject = (languageCode) => (languageCode === 'he' ? he : enUS);

// MOCK FOR useEntityModule - In a real application, this would be a sophisticated reusable hook
// that encapsulates common CRUD, pagination, filtering, sorting, and selection logic for entities.
// This mock provides the necessary structure and behavior to make the `RFCTab` component compile and run
// according to the outline's use of `useEntityModule`.
const useEntityModule = (config) => {
    const {
        entitySDK,
        entityName,
        entityNamePlural,
        initialFilters,
        filterFunction,
        storageKey, // For view preference, e.g. 'card' or 'table'
    } = config;

    const { t: i18n_t } = useLanguageHook(); // For accessing language hook translations
    const { toast } = useToast();

    const [items, setItems] = useState([]); // Raw data fetched from API
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState(initialFilters);
    const [sortConfig, setSortConfig] = useState({ key: 'submitted_at', direction: 'descending' });
    const [pagination, setPagination] = useState({ currentPage: initialFilters.page, pageSize: initialFilters.pageSize, totalItems: 0, totalPages: 0 });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null); // Item being edited/viewed in dialog

    const [isSelectionModeActive, setIsSelectionModeActive] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]); // Array of selected item IDs

    const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
    const [confirmationDialogDetails, setConfirmationDialogDetails] = useState({
        itemIds: null,
        itemName: '',
        message: '',
        onConfirm: null, // Callback for when confirm button is pressed
    });

    // Simple in-memory cache for entity data
    const entityCache = useMemo(() => ({
        data: null,
        timestamp: null,
        loading: false,
        error: null,
        expirationTime: 3 * 60 * 1000, // 3 minutes
    }), []);

    const isCacheValid = useCallback(() => {
        return entityCache.data && entityCache.timestamp && (Date.now() - entityCache.timestamp) < entityCache.expirationTime;
    }, [entityCache]);

    const updateCache = useCallback((data, error = null) => {
        entityCache.data = data;
        entityCache.timestamp = Date.now();
        entityCache.loading = false;
        entityCache.error = error;
    }, [entityCache]);

    const setCacheLoading = useCallback((isLoading) => {
        entityCache.loading = isLoading;
        if(isLoading) entityCache.error = null; // Clear error when starting a new load
    }, [entityCache]);

    const handleRefresh = useCallback(async (forceRefresh = false) => {
        setLoading(true);
        setError(null);

        if (!forceRefresh && isCacheValid() && entityCache.data) {
            setItems(entityCache.data);
            if (entityCache.error) setError(entityCache.error); // Restore previous error if cache was valid but had error
            setLoading(false);
            return;
        }

        if (entityCache.loading && !forceRefresh) {
            // If another fetch is in progress, wait for it to complete and then use its result
            await new Promise(resolve => {
                const checkCompletion = () => {
                    if (!entityCache.loading) resolve();
                    else setTimeout(checkCompletion, 100);
                };
                checkCompletion();
            });
            if (isCacheValid() && entityCache.data) {
                setItems(entityCache.data);
                if (entityCache.error) setError(entityCache.error);
            } else if (!entityCache.loading && entityCache.error) {
                setError(entityCache.error);
            }
            setLoading(false);
            return;
        }

        setCacheLoading(true);
        try {
            const fetchedItems = await entitySDK.list('-updated_date'); // Assuming a default sort order
            const validData = Array.isArray(fetchedItems) ? fetchedItems : [];
            setItems(validData);
            updateCache(validData);
            setError(null); // Clear errors on successful fetch
        } catch (err) {
            console.error(`Error fetching ${entityNamePlural}:`, err);
            let errorMessage = i18n_t('errors.fetchFailedGeneral', { item: entityNamePlural});
            if (err.response?.status === 429 || err.message?.includes("429")) {
                errorMessage = i18n_t('errors.rateLimitExceededShort');
            } else if (err.message?.toLowerCase().includes('network error') || err.message?.toLowerCase().includes('failed to fetch')) {
                errorMessage = i18n_t('errors.networkErrorGeneral');
            } else {
                errorMessage = err.response?.data?.message || err.message || errorMessage;
            }
            setError(errorMessage);
            if (isCacheValid() && entityCache.data) {
                updateCache(entityCache.data, errorMessage); // Keep old data but update error status
            } else {
                updateCache([], errorMessage); // No data, store empty array and error
            }
        } finally {
            setCacheLoading(false);
            setLoading(false);
        }
    }, [entitySDK, entityNamePlural, isCacheValid, updateCache, setCacheLoading, i18n_t, entityCache]);

    useEffect(() => {
        handleRefresh();
    }, [handleRefresh]);

    const filteredAndSortedItems = useMemo(() => {
        let processedItems = Array.isArray(items) ? items.filter(Boolean) : [];

        // Apply filters if a filter function is provided
        if (filterFunction) {
            processedItems = processedItems.filter(item => filterFunction(item, filters));
        }

        // Apply sorting if a sort key is defined
        if (sortConfig.key) {
            processedItems.sort((a, b) => {
                let valA, valB;
                // Handle different data types for sorting
                if (['submitted_at', 'procedure_date', 'updated_date'].includes(sortConfig.key)) {
                    valA = a[sortConfig.key] && isValid(parseISO(a[sortConfig.key])) ? parseISO(a[sortConfig.key]).getTime() : (sortConfig.direction === 'ascending' ? Infinity : -Infinity);
                    valB = b[sortConfig.key] && isValid(parseISO(b[sortConfig.key])) ? parseISO(b[sortConfig.key]).getTime() : (sortConfig.direction === 'ascending' ? Infinity : -Infinity);
                } else if (typeof a[sortConfig.key] === 'number') {
                    valA = a[sortConfig.key] || 0;
                    valB = b[sortConfig.key] || 0;
                } else {
                    valA = a[sortConfig.key] || '';
                    valB = b[sortConfig.key] || '';
                    if (typeof valA === 'string') valA = valA.toLowerCase();
                    if (typeof valB === 'string') valB = valB.toLowerCase();
                }
                
                // Handle null/undefined values for sorting (push them to the end)
                if (valA === undefined || valA === null) valA = sortConfig.direction === 'ascending' ? Infinity : -Infinity;
                if (valB === undefined || valB === null) valB = sortConfig.direction === 'ascending' ? Infinity : -Infinity;
        
                if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return processedItems;
    }, [items, filters, sortConfig, filterFunction]);

    const paginatedItems = useMemo(() => {
        const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
        return filteredAndSortedItems.slice(startIndex, startIndex + pagination.pageSize);
    }, [filteredAndSortedItems, pagination.currentPage, pagination.pageSize]);

    useEffect(() => {
        setPagination(prev => ({
            ...prev,
            totalItems: filteredAndSortedItems.length,
            totalPages: Math.ceil(filteredAndSortedItems.length / prev.pageSize)
        }));
    }, [filteredAndSortedItems, pagination.pageSize]);

    const handlePageChange = useCallback((newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
        setPagination(prev => ({ ...prev, currentPage: newPage }));
    }, []);

    const handlePageSizeChange = useCallback((newPageSize) => {
        setFilters(prev => ({ ...prev, pageSize: newPageSize, page: 1 }));
        setPagination(prev => ({ ...prev, pageSize: newPageSize, currentPage: 1 }));
    }, []);

    const handleFilterChange = useCallback((newFiltersObj) => {
        setFilters(prev => ({ ...prev, ...newFiltersObj, page: 1 }));
    }, []);

    const handleSortChange = useCallback((newSortState) => {
        if (newSortState && newSortState.length > 0) {
            const { id, desc } = newSortState[0];
            setSortConfig({ key: id, direction: desc ? 'descending' : 'ascending' });
        } else {
            setSortConfig({ key: 'submitted_at', direction: 'descending' }); // Default sort if none specified
        }
    }, []);

    const handleAddNew = useCallback(() => {
        setCurrentItem(null); // No data for new item
        setIsDialogOpen(true);
    }, []);

    const handleEdit = useCallback((item) => {
        setCurrentItem(item);
        setIsDialogOpen(true);
    }, []);

    const handleBulkDelete = useCallback(async (idsToDelete) => {
        if (!idsToDelete || idsToDelete.length === 0) return;
        setLoading(true);
        let successCount = 0;
        let errorCount = 0;

        for (const id of idsToDelete) {
            try {
                await entitySDK.delete(id);
                successCount++;
            } catch (err) {
                console.error(`Error deleting ${entityName} ${id}:`, err);
                toast({
                    title: i18n_t('errors.deleteFailedTitle'),
                    description: i18n_t('errors.deleteError', { name: `${entityName} #${id?.slice(-6) || 'N/A'}`, error: err.message }),
                    variant: "destructive",
                });
                errorCount++;
            }
        }
        setLoading(false);
        if (successCount > 0) {
            toast({
                title: i18n_t('messages.success'),
                description: i18n_t('bulkActions.bulkDeleteSuccess', { count: successCount, entity: entityNamePlural }),
            });
            handleRefresh(true); // Refresh data after successful deletions
        }
        setIsConfirmationDialogOpen(false); // Close confirmation dialog
        setSelectedItems([]); // Clear selection after deletion
        setIsSelectionModeActive(false); // Exit selection mode
    }, [entitySDK, entityName, entityNamePlural, handleRefresh, toast, i18n_t]);


    const handleDelete = useCallback((itemIds, itemName) => {
        // Prepare and open the confirmation dialog
        setIsConfirmationDialogOpen(true);
        setConfirmationDialogDetails({
            itemIds: itemIds,
            itemName: itemName,
            message: i18n_t('bulkActions.deleteConfirmMessage', { count: itemIds.length, itemName: itemName.toLowerCase() }),
            onConfirm: () => handleBulkDelete(itemIds), // Set the actual delete action as callback
        });
    }, [handleBulkDelete, i18n_t]);

    const handleToggleSelection = useCallback((itemId) => {
        setSelectedItems(prevIds => {
            const newSelectedIds = new Set(prevIds);
            if (newSelectedIds.has(itemId)) newSelectedIds.delete(itemId);
            else newSelectedIds.add(itemId);
            return Array.from(newSelectedIds); // Convert Set back to Array for state
        });
    }, []);

    const handleSelectAll = useCallback(() => {
        // Select/deselect all items on the current paginated view
        const allVisibleValidItems = paginatedItems.filter(item => item && item.id != null);
        setSelectedItems(prevIds => {
            const currentIds = new Set(prevIds);
            const allCurrentlySelectedOnPage = allVisibleValidItems.length > 0 && allVisibleValidItems.every(item => currentIds.has(item.id));
            if (allCurrentlySelectedOnPage) {
                // If all are selected, deselect them
                allVisibleValidItems.forEach(item => currentIds.delete(item.id));
            } else {
                // Otherwise, select all
                allVisibleValidItems.forEach(item => currentIds.add(item.id));
            }
            return Array.from(currentIds);
        });
    }, [paginatedItems]);

    const handleSelfSubmittingDialogClose = useCallback((refreshNeeded, operationType = null, itemIdParam = '') => {
        setIsDialogOpen(false);
        setCurrentItem(null); // Clear item after dialog close
        if (refreshNeeded) {
            handleRefresh(true); // Force refresh if data was changed
            const nameToDisplay = itemIdParam || i18n_t('common.item');
            if (operationType === 'create') {
                toast({ title: i18n_t('messages.success'), description: i18n_t('common.createSuccess', { name: nameToDisplay }) });
            } else if (operationType === 'update') {
                toast({ title: i18n_t('messages.success'), description: i18n_t('common.updateSuccess', { name: nameToDisplay }) });
            }
        }
    }, [handleRefresh, i18n_t, toast]);


    return {
        items: paginatedItems, // Items for the current page, ready for display
        filteredAndSortedItems, // All items after filtering and sorting (for total count)
        loading,
        error,
        filters,
        setFilters,
        sortConfig,
        setSortConfig,
        pagination,
        setPagination, // Potentially less used if pagination is managed internally
        selectedItems,
        setSelectedItems,
        isDialogOpen,
        setIsDialogOpen,
        currentItem,
        setCurrentItem,
        handleRefresh,
        handleFilterChange,
        handleSortChange,
        handlePageChange,
        handlePageSizeChange,
        handleAddNew,
        handleEdit,
        // The handleBulkDelete returned here triggers the confirmation dialog
        handleBulkDelete: (ids) => {
            if (ids.length > 0) {
                const firstItemName = ids.length > 0 ? `${entityName} #${items.find(r => r.id === ids[0])?.id?.slice(-6) || 'N/A'}` : entityName;
                const displayItemName = ids.length === 1 ? firstItemName : entityNamePlural;
                handleDelete(ids, displayItemName);
            }
        },
        isSelectionModeActive,
        setIsSelectionModeActive,
        handleToggleSelection,
        handleSelectAll,
        handleSelfSubmittingDialogClose,
        isConfirmationDialogOpen,
        setIsConfirmationDialogOpen,
        confirmationDialogDetails,
        setConfirmationDialogDetails,
    };
};
// END MOCK useEntityModule

export default function RFCTab({ globalActionsConfig: externalActionsConfig, currentView: passedView }) {
  const { t, language, isRTL } = useLanguageHook();
  const { toast } = useToast();

  const entityConfig = useMemo(() => ({
    entitySDK: RequestForCommitment,
    entityName: t('rfc.itemTitleSingular'),
    entityNamePlural: t('rfc.titleMultiple'), // Using 'titleMultiple' from original code for consistency
    DialogComponent: RFCDialog, // Component to open for adding/editing
    FormComponent: null, // Not used directly in this file, but part of generic module config
    initialFilters: {
      searchTerm: '',
      status: 'all',
      provider_id: 'all', 
      doctor_id: 'all',
      insured_id: 'all',
      procedureDateFrom: '', 
      procedureDateTo: '', 
      page: 1,
      pageSize: 10,
    },
    filterFunction: (rfc, filters) => {
        const { searchTerm, status, provider_id, procedureDateFrom, procedureDateTo } = filters;
        let match = true;

        if (searchTerm) {
            const termLower = searchTerm.toLowerCase();
            match = match && (
                (rfc.insured_name && rfc.insured_name.toLowerCase().includes(termLower)) ||
                (rfc.provider_name && rfc.provider_name.toLowerCase().includes(termLower)) ||
                (rfc.doctor_name && rfc.doctor_name.toLowerCase().includes(termLower)) ||
                (rfc.policy_number && rfc.policy_number.toLowerCase().includes(termLower)) ||
                (Array.isArray(rfc.procedure_codes) && rfc.procedure_codes.some(code => code.toLowerCase().includes(termLower)))
            );
        }
        if (status !== 'all') match = match && (rfc.status === status);
        // Assuming provider_id is the correct filter key for the RFC object
        if (provider_id !== 'all') match = match && (rfc.provider_id === provider_id); 
        
        // Date filtering
        if (procedureDateFrom) {
            match = match && rfc.procedure_date && rfc.procedure_date >= procedureDateFrom;
        }
        if (procedureDateTo) {
            match = match && rfc.procedure_date && rfc.procedure_date <= procedureDateTo;
        }

        return match;
    },
    storageKey: 'rfcs_view_preference', // Key for localStorage to remember view preference
  }), [t]);

  const {
    items: paginatedRFCs, // Data for the current page
    filteredAndSortedItems, // All data after filtering/sorting (used for total count)
    loading,
    error,
    filters,
    setFilters,
    sortConfig,
    setSortConfig,
    pagination,
    selectedItems,
    setSelectedItems, 
    isDialogOpen: isRFCDialogOpen, // Renamed for component-specific usage
    setIsDialogOpen: setIsRFCDialogOpen, // Renamed for component-specific usage
    currentItem: currentRFC, // Renamed for component-specific usage
    setCurrentItem: setCurrentRFC, // Renamed for component-specific usage
    handleRefresh: refreshRFCs, // Renamed for component-specific usage
    handleFilterChange, // Used by RFCFilterBar
    handleSortChange: handleDataTableSortChange, // Renamed to match DataTable prop
    handlePageChange,
    handlePageSizeChange,
    handleAddNew, // For 'New RFC' button
    handleEdit, // For editing a single RFC
    handleBulkDelete, // Triggers confirmation dialog and bulk deletion
    isSelectionModeActive,
    setIsSelectionModeActive,
    handleToggleSelection, // For individual row/card selection
    handleSelectAll: handleSelectAllVisible, // Renamed for component-specific usage
    handleSelfSubmittingDialogClose, // For closing the RFC dialog after create/update
    isConfirmationDialogOpen,
    setIsConfirmationDialogOpen,
    confirmationDialogDetails,
    // setConfirmationDialogDetails, // Not directly exposed, managed by handleDelete
  } = useEntityModule(entityConfig);
  
  const [allProviders, setAllProviders] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [allInsuredPersons, setAllInsuredPersons] = useState([]);
  
  const currentLocale = getLocaleObject(language);
  const totalItems = filteredAndSortedItems.length; // Total items after filtering/sorting
  const totalPages = pagination.totalPages; // Total pages for current pagination state

  // Fetch related entities for filter dropdowns (e.g., providers, doctors, insured persons)
  useEffect(() => {
    const fetchRelatedEntities = async () => {
      try {
        const providers = await Provider.list();
        setAllProviders(Array.isArray(providers) ? providers : []);
        const doctors = await Doctor.list();
        setAllDoctors(Array.isArray(doctors) ? doctors : []);
        const insuredPersons = await InsuredPerson.list();
        setAllInsuredPersons(Array.isArray(insuredPersons) ? insuredPersons : []);
      } catch (err) {
        console.error("Error fetching related entities:", err);
        toast({
          title: t('errors.fetchFailedGeneral', { item: t('common.relatedData') }),
          description: err.message || t('errors.unknown'),
          variant: "destructive"
        });
      }
    };
    fetchRelatedEntities();
  }, [t, toast]); // Dependencies for useEffect

  // State for current view (card/table)
  const [currentView, setCurrentView] = useState(localStorage.getItem(entityConfig.storageKey) || 'card');

  // If `currentView` is passed as a prop, synchronize it (optional)
  useEffect(() => {
    if (passedView && passedView !== currentView) {
      setCurrentView(passedView);
    }
  }, [passedView, currentView]);

  // Memoized actions config for GlobalActionButton
  const memoizedGlobalActionsConfig = useMemo(() => [
    { labelKey: 'buttons.addNewRFC', defaultLabel: 'New RFC', icon: Plus, action: handleAddNew, type: 'add'},
    { isSeparator: true },
    { labelKey: 'buttons.import', defaultLabel: 'Import', icon: UploadCloud, action: () => setIsImportDialogOpen(true) },
    ...(externalActionsConfig || []) // Allow external actions to be passed in
  ], [handleAddNew, externalActionsConfig, t]);

  // Handlers for edit/delete actions, integrated with selection mode
  const handleEditWithSelectionCheck = useCallback(() => {
    if (selectedItems.length === 1) {
      const rfcIdToEdit = selectedItems[0];
      const rfcToEdit = filteredAndSortedItems.find(r => r.id === rfcIdToEdit);
      if (rfcToEdit) {
        handleEdit(rfcToEdit);
      }
    } else if (selectedItems.length === 0) {
      setIsSelectionModeActive(true);
      toast({ title: t('bulkActions.selectionModeEnabledTitle'), description: t('bulkActions.selectItemToEditDesc', { entity: t('rfc.itemTitleSingular') }) });
    } else {
      toast({ title: t('bulkActions.selectOneToEditTitle'), description: t('bulkActions.selectOneToEditDesc', {entity: t('rfc.titleMultiple')}), variant: 'info' });
    }
  }, [selectedItems, handleEdit, setIsSelectionModeActive, t, toast, filteredAndSortedItems]);

  const handleDeleteWithSelectionCheck = useCallback(() => {
    if (selectedItems.length > 0) {
      handleBulkDelete(selectedItems); // This will trigger the confirmation dialog via useEntityModule
    } else {
      setIsSelectionModeActive(true);
      toast({ title: t('bulkActions.selectionModeEnabledTitle'), description: t('bulkActions.selectItemsToDeleteDesc', { entity: t('rfc.titleMultiple') }) });
    }
  }, [selectedItems, handleBulkDelete, setIsSelectionModeActive, t, toast]);

  const handleCancelSelectionMode = useCallback(() => {
    setIsSelectionModeActive(false);
    setSelectedItems([]); // Clear selected items when canceling selection mode
  }, [setIsSelectionModeActive, setSelectedItems]);

  // This handles the actual confirmation from the dialog (which then calls the onConfirm from useEntityModule)
  const handleConfirmDelete = useCallback(() => {
      confirmationDialogDetails.onConfirm(); 
  }, [confirmationDialogDetails]);


  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false); // Managed separately as it's not a core entity CRUD operation

  const handleImportSubmit = async (records) => {
    setIsImportDialogOpen(false);
    if (!records || records.length === 0) {
      toast({ title: t('import.noRecordsTitle'), description: t('import.noRecordsDesc'), variant: "warning" });
      return;
    }
    
    // Basic mapping from CSV/Excel headers to RFC entity properties
    const rfcsToCreate = records.map(rec => ({
        provider_id: rec['Provider ID'] || rec['provider_id'],
        doctor_id: rec['Doctor ID'] || rec['doctor_id'],
        insured_id: rec['Insured ID'] || rec['insured_id'],
        policy_id: rec['Policy ID'] || rec['policy_id'],
        procedure_date: rec['Procedure Date'] || rec['procedure_date'],
        procedure_codes: (rec['Procedure Codes'] || rec['procedure_codes'])?.split(',').map(s => s.trim()).filter(Boolean) || [],
        diagnosis_codes: (rec['Diagnosis Codes'] || rec['diagnosis_codes'])?.split(',').map(s => s.trim()).filter(Boolean) || [],
        notes: rec['Notes'] || rec['notes'],
        status: rec['Status']?.toLowerCase() || rec['status']?.toLowerCase() || 'draft',
    })).filter(r => r.provider_id && r.insured_id && r.procedure_date && r.procedure_codes?.length > 0);

    if(rfcsToCreate.length === 0) {
        toast({title: t('import.noValidRecordsTitle'), description: t('import.noValidRecordsDesc', {entity: t('rfc.titleMultiple')}), variant: 'warning'});
        return;
    }

    // Set loading state from useEntityModule
    setLoading(true); 
    let successCount = 0; let errorCount = 0;
    for (const rfcData of rfcsToCreate) {
        try { await RequestForCommitment.create(rfcData); successCount++; }
        catch (err) { console.error("Error creating RFC from import:", err, rfcData); errorCount++; }
    }
    setLoading(false); 
    toast({
        title: t('import.completedTitle'),
        description: t('import.completedDesc', {successCount, errorCount, entity: t('rfc.titleMultiple')}),
    });
    if (successCount > 0) refreshRFCs(true); // Force refresh of main RFC list
  };

  const rfcColumns = useMemo(() => [
    { 
      accessorKey: 'id', 
      header: t('rfc.fields.rfcId'),
      cell: ({ row }) => `RFC #${row.original.id?.slice(-6) || 'N/A'}`,
      enableSorting: true,
    },
    { 
      accessorKey: 'insured_name', 
      header: t('rfc.fields.insuredPerson'),
      cell: ({ row }) => row.original.insured_name || t('common.notSet'),
      enableSorting: true,
    },
    { 
      accessorKey: 'provider_name', 
      header: t('rfc.fields.provider'),
      cell: ({ row }) => row.original.provider_name || t('common.notSet'),
      enableSorting: true,
    },
    { 
      accessorKey: 'procedure_date', 
      header: t('rfc.fields.procedureDate'),
      cell: ({ row }) => (row.original.procedure_date && isValid(parseISO(row.original.procedure_date))
        ? format(parseISO(row.original.procedure_date), 'PP', { locale: currentLocale })
        : t('common.notSet')
      ),
      enableSorting: true,
    },
    { 
      accessorKey: 'status', 
      header: t('common.status'),
      cell: ({ row }) => {
        const status = row.original.status;
        let variant = 'secondary';
        if (status === 'approved') variant = 'success';
        else if (status === 'rejected') variant = 'destructive';
        else if (status === 'in_review') variant = 'warning';
        else if (status === 'submitted') variant = 'info';
        else if (status === 'draft') variant = 'outline';
        return <Badge variant={variant}>{t(`rfcStatus.${status?.toLowerCase()}`, {defaultValue: status})}</Badge>;
      },
      enableSorting: true,
    },
    { 
      accessorKey: 'approved_amount', 
      header: t('rfc.fields.approvedAmount'),
      cell: ({ row }) => {
        const amount = row.original.approved_amount;
        const currency = row.original.currency || 'ILS';
        return amount && amount > 0 ? `${amount.toLocaleString()} ${currency}` : t('common.notSet');
      },
      enableSorting: true,
    },
    { 
      accessorKey: 'submitted_at', 
      header: t('rfc.fields.submittedAt'),
      cell: ({ row }) => (row.original.submitted_at && isValid(parseISO(row.original.submitted_at))
        ? format(parseISO(row.original.submitted_at), 'PP', { locale: currentLocale })
        : t('common.notSubmitted')
      ),
      enableSorting: true,
    },
  ], [t, currentLocale]);

  // Show loading spinner only on initial load if no data is present
  if (loading && !filteredAndSortedItems.length && !error) { 
    return <div className="flex justify-center items-center h-64"><LoadingSpinner message={t('messages.loadingData', {item: t('rfc.titleMultiple')})} /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sticky top-[var(--subheader-height,0px)] bg-background dark:bg-gray-900 py-3 z-10 -mx-1 px-1 md:mx-0 md:px-0 border-b dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <ClipboardCheck className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-600 dark:text-gray-400`} />
          {t('rfc.titleMultiple')} ({totalItems}) {/* Display total items after filtering/sorting */}
        </h3>
        <div className="flex items-center gap-2">
            <GlobalActionButton
                actionsConfig={memoizedGlobalActionsConfig}
                onEditItems={handleEditWithSelectionCheck}
                onDeleteItems={handleDeleteWithSelectionCheck}
                isSelectionModeActive={isSelectionModeActive}
                onCancelSelectionMode={handleCancelSelectionMode}
                selectedItemCount={selectedItems.length}
                itemTypeForActions={t('rfc.itemTitleSingular', {defaultValue: 'RFC'})}
                t={t} {/* ADDED t PROP as per the change outline */}
            />
            <Button variant="outline" size="sm" onClick={() => refreshRFCs(true)} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''} ${isRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                {t('buttons.refresh')}
            </Button>
            <ViewSwitcher
                currentView={currentView}
                onViewChange={(view) => { setCurrentView(view); handleCancelSelectionMode(); localStorage.setItem(entityConfig.storageKey, view);}}
                availableViews={['card', 'table']}
                entityName={t('rfc.titleMultiple')}
                t={t} isRTL={isRTL}
            />
        </div>
      </div>

      <RFCFilterBar
        filters={filters}
        // Use setFilters from useEntityModule, which will also reset page to 1
        onFiltersChange={(newFiltersObj) => setFilters(prev => ({...prev, ...newFiltersObj, page: 1}))}
        onResetFilters={() => {
          setFilters({ searchTerm: '', status: 'all', provider_id: 'all', doctor_id: 'all', insured_id: 'all', procedureDateFrom: '', procedureDateTo: '', page: 1, pageSize: filters.pageSize });
          setSortConfig({ key: 'submitted_at', direction: 'descending' });
          handleCancelSelectionMode();
          toast({
              title: t('filters.clearedTitle'),
              description: t('filters.filtersReset', { item: t('rfc.titleMultiple') }),
          });
        }}
        sortConfig={sortConfig}
        onSortChange={(key) => {
            let direction = 'ascending';
            if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
            else if (sortConfig.key === key && sortConfig.direction === 'descending') direction = 'ascending';
            setSortConfig({ key, direction });
        }}
        // Provide the full filtered list (not paginated) to the filter bar for context
        allRFCs={filteredAndSortedItems} 
        allProviders={allProviders}
        allDoctors={allDoctors}
        allInsuredPersons={allInsuredPersons}
        t={t} language={language} isRTL={isRTL}
      />
      
      {/* Error display card, appears if there's an error and no items currently loaded (or initial error) */}
      {error && (filteredAndSortedItems.length === 0) && ( 
         <Card className="border-destructive bg-destructive/10 dark:border-red-700 dark:bg-red-900/20">
            <CardHeader>
                <CardTitle className="text-destructive dark:text-red-300 flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    {t('common.errorOccurred')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-destructive dark:text-red-300">{error}</p>
                { (error.includes(t('errors.networkErrorGeneral')) || error.includes(t('errors.rateLimitExceededShort'))) &&
                    <p className="text-sm text-destructive dark:text-red-300 mt-1">{t('errors.retryingSoon')}</p>
                }
                <Button variant="outline" size="sm" onClick={() => refreshRFCs(true)} className="mt-3 border-destructive text-destructive hover:bg-destructive/20 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-700/30">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t('buttons.retryNow')}
                </Button>
            </CardContent>
        </Card>  
      )}

      {/* Empty State display */}
      {!loading && !error && filteredAndSortedItems.length === 0 && (
        <EmptyState
          icon={ClipboardCheck} {/* Updated icon */}
          title={t('rfc.noRFCsMatchTitle')}
          message={t('rfc.noRFCsDesc')}
          actionButton={
            <Button onClick={() => handleAddNew()}> {/* Using handleAddNew from useEntityModule */}
              <Plus className={`h-4 w-4 ${isRTL ? 'ml-1.5' : 'mr-1.5'}`} />
              {t('buttons.addNewRFC', {defaultValue: 'New RFC'})}
            </Button>
          }
          t={t} isRTL={isRTL}
        />
      )}

      {/* Display content if there are items or if loading with existing items */}
      {(!error || filteredAndSortedItems.length > 0) && (paginatedRFCs.length > 0 || (loading && filteredAndSortedItems.length > 0)) && (
        <>
          {currentView === 'card' && paginatedRFCs.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedRFCs.map((rfc) => (
                <RFCCard
                  key={rfc.id}
                  rfc={rfc}
                  currentLocale={currentLocale}
                  t={t} isRTL={isRTL}
                  isSelectionModeActive={isSelectionModeActive}
                  isSelected={selectedItems.includes(rfc.id)} {/* Check if RFC ID is in selectedItems array */}
                  onToggleSelection={() => handleToggleSelection(rfc.id)}
                  onCardClick={() => !isSelectionModeActive /* && openDetailsDrawer(rfc.id) */} 
                />
              ))}
            </div>
          )}

          {currentView === 'table' && (
            <DataTable
              columns={rfcColumns}
              data={paginatedRFCs} {/* DataTable expects paginated data */}
              loading={loading && paginatedRFCs.length === 0} // Show loading state for table specific to paginated data
              error={null} 
              entityName={t('rfc.titleMultiple')}
              pagination={{
                currentPage: pagination.currentPage,
                pageSize: pagination.pageSize,
                totalItems: totalItems, // Total filtered/sorted items
                totalPages: totalPages,
                onPageChange: handlePageChange,
                onPageSizeChange: handlePageSizeChange,
              }}
              onSortChange={handleDataTableSortChange}
              currentSort={[{ id: sortConfig.key, desc: sortConfig.direction === 'descending' }]}
              isSelectionModeActive={isSelectionModeActive}
              selectedRowIds={new Set(selectedItems)} // DataTable expects a Set of selected IDs
              onRowSelectionChange={handleToggleSelection}
              onSelectAllRows={handleSelectAllVisible} // Uses the memoized handleSelectAll from useEntityModule
              onRowClick={({original: item}) => !isSelectionModeActive && item?.id /* && openDetailsDrawer(item.id) */}
              t={t} language={language} isRTL={isRTL}
            />
          )}
          
          {/* Card view specific pagination controls */}
          {currentView === 'card' && totalPages > 1 && (
             <div className="flex justify-center items-center pt-4 space-x-2 rtl:space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {t('buttons.previous')}
              </Button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('dataTable.pageInfo', { page: pagination.currentPage, totalPages: totalPages })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= totalPages}
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {t('buttons.next')}
              </Button>
            </div>
          )}
        </>
      )}

      {/* RFC Create/Edit Dialog */}
      {isRFCDialogOpen && (
        <RFCDialog
          isOpen={isRFCDialogOpen}
          onClose={handleSelfSubmittingDialogClose}
          rfcData={currentRFC}
          t={t} language={language} isRTL={isRTL}
        />
      )}

      {/* Import Dialog */}
      {isImportDialogOpen && (
        <ImportDialog
          isOpen={isImportDialogOpen}
          onOpenChange={setIsImportDialogOpen}  
          entityName={t('rfc.titleMultiple')}
          onImport={handleImportSubmit}
          sampleHeaders={['Provider ID', 'Doctor ID', 'Insured ID', 'Policy ID', 'Procedure Date (YYYY-MM-DD)', 'Procedure Codes (comma-separated)', 'Diagnosis Codes (comma-separated)', 'Notes', 'Status (draft/submitted/in_review/approved/rejected)']}
          language={language}
        />
      )}

      {/* Confirmation Dialog for deletions */}
      <ConfirmationDialog
        open={isConfirmationDialogOpen}
        onOpenChange={setIsConfirmationDialogOpen}
        onConfirm={handleConfirmDelete} {/* Calls the onConfirm function set in useEntityModule */}
        title={t('common.confirmDeleteTitle', { item: confirmationDialogDetails.itemName || t('rfc.itemTitleSingular'), count: confirmationDialogDetails.itemIds?.length || 1})}
        description={confirmationDialogDetails.message}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        loading={loading && isConfirmationDialogOpen} {/* Use general loading state for confirmation dialog */}
        t={t} isRTL={isRTL}
      />
    </div>
  );
}
