
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguageHook } from '@/components/useLanguageHook';
import { Contract } from '@/api/entities';
import { Provider } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Plus, Search, FilterX, ScrollText, RefreshCw, AlertTriangle, Calendar, Building2, Edit, Trash2 } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import EmptyState from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/use-toast';
import { format, parseISO, isValid } from 'date-fns';
import ContractDialog from './contract-dialog';
import { useEntityModule } from '@/hooks/useEntityModule'; // New import
import GlobalActionButton from '@/components/common/GlobalActionButton'; // New import
import ViewSwitcher from '@/components/common/ViewSwitcher'; // New import

// Sample contracts data for fallback
const sampleContracts = [
  {
    id: "contract-1",
    provider_id: "provider-1",
    contract_number: "CTR-2024-001",
    name_en: "General Services Contract",
    name_he: "חוזה שירותים כללי",
    valid_from: "2024-01-01",
    valid_to: "2024-12-31",
    status: "active"
  },
  {
    id: "contract-2",
    provider_id: "provider-2",
    contract_number: "CTR-2024-002",
    name_en: "Specialized Care Agreement",
    name_he: "הסכם טיפול מיוחד",
    valid_from: "2024-03-01",
    valid_to: "2025-02-28",
    status: "draft"
  }
];

const sampleProviders = [
  { id: "provider-1", name: { en: "City Medical Center", he: "מרכז רפואי העיר" } },
  { id: "provider-2", name: { en: "Regional Hospital", he: "בית חולים אזורי" } }
];

const statusFilterOptions = [
  { value: 'all', labelKey: 'filters.allStatuses', defaultValue: 'All Statuses' },
  { value: 'draft', labelKey: 'status.draft', defaultValue: 'Draft' },
  { value: 'active', labelKey: 'status.active', defaultValue: 'Active' },
  { value: 'expired', labelKey: 'status.expired', defaultValue: 'Expired' },
  { value: 'terminated', labelKey: 'status.terminated', defaultValue: 'Terminated' },
];

export default function ContractsTab({ globalActionsConfig: externalActionsConfig, currentView: passedView }) {
  const { t, language, isRTL } = useLanguageHook();
  const { toast } = useToast();

  const [allProviders, setAllProviders] = useState([]); // Renamed from 'providers' to avoid conflict with useEntityModule

  // Fetch all providers for filter options, done once
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const data = await Provider.list();
        setAllProviders(Array.isArray(data) ? data : sampleProviders); // Use sample as fallback
      } catch (err) {
        console.error("Failed to fetch providers:", err);
        setAllProviders(sampleProviders); // Fallback to sample
      }
    };
    fetchProviders();
  }, []);

  const getProviderName = useCallback((providerId) => {
    const provider = allProviders.find(p => p.id === providerId);
    if (!provider) return t('common.unknownProvider', { defaultValue: 'Unknown Provider' });
    return language === 'he' ? (provider.name?.he || provider.name?.en) : (provider.name?.en || provider.name?.he);
  }, [allProviders, language, t]);

  const entityConfig = useMemo(() => ({
    entitySDK: Contract,
    entityName: t('contracts.itemTitleSingular', { defaultValue: 'Contract' }),
    entityNamePlural: t('contracts.itemTitlePlural', { defaultValue: 'Contracts' }),
    DialogComponent: ContractDialog,
    FormComponent: null, // Not used for this dialog flow
    initialFilters: {
      searchTerm: '', // For contract number or name
      provider_id: 'all',
      status: 'all',
      valid_from_range: { from: null, to: null },
      valid_to_range: { from: null, to: null },
      page: 1,
      pageSize: 10,
    },
    filterFunction: (item, filters) => {
      const searchTermLower = (filters.searchTerm || '').toLowerCase();
      const contractName = language === 'he' ? (item.name_he || item.name_en) : (item.name_en || item.name_he);
      const providerName = getProviderName(item.provider_id);

      const matchesSearch = !filters.searchTerm ||
        item.contract_number.toLowerCase().includes(searchTermLower) ||
        contractName.toLowerCase().includes(searchTermLower) ||
        providerName.toLowerCase().includes(searchTermLower);

      const matchesProvider = filters.provider_id === 'all' || item.provider_id === filters.provider_id;
      const matchesStatus = filters.status === 'all' || item.status === filters.status;

      // Date range filtering (if implemented in filters)
      const validFrom = item.valid_from ? parseISO(item.valid_from) : null;
      const validTo = item.valid_to ? parseISO(item.valid_to) : null;

      const matchesValidFrom = !filters.valid_from_range?.from || 
        (validFrom && validFrom >= parseISO(filters.valid_from_range.from));
      const matchesValidTo = !filters.valid_to_range?.to ||
        (validTo && validTo <= parseISO(filters.valid_to_range.to));

      return matchesSearch && matchesProvider && matchesStatus && matchesValidFrom && matchesValidTo;
    },
    storageKey: 'contractsView',
    sampleData: sampleContracts, // Pass sample data to useEntityModule
  }), [t, language, getProviderName]);

  const {
    items: contracts,
    loading,
    error,
    filters,
    setFilters,
    pagination,
    setPagination,
    selectedItems,
    setSelectedItems,
    isDialogOpen,
    setIsDialogOpen,
    currentItem,
    setCurrentItem,
    handleRefresh: refreshContracts,
    handleSearch,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    handleAddNew,
    handleEdit,
    handleDelete,
    handleBulkDelete,
    isSelectionModeActive,
    setIsSelectionModeActive,
    handleToggleSelection,
    handleSelectAll,
    handleSelfSubmittingDialogClose,
    filteredAndSortedItems, // from useEntityModule
  } = useEntityModule(entityConfig);

  const memoizedGlobalActionsConfig = useMemo(() => [
    { labelKey: 'contracts.addContract', defaultLabel: 'Add Contract', icon: Plus, action: handleAddNew, type: 'add' },
    ...(externalActionsConfig || [])
  ], [handleAddNew, externalActionsConfig, t]);

  const handleEditWithSelectionCheck = useCallback(() => {
    if (selectedItems.length === 1) {
      handleEdit(selectedItems[0]);
      setIsSelectionModeActive(false);
      setSelectedItems([]);
    } else {
      toast({
        title: t('common.selectionError', { defaultValue: 'Selection Error' }),
        description: t('common.selectOneToEdit', { defaultValue: 'Please select exactly one item to edit.' }),
        variant: 'destructive',
      });
    }
  }, [selectedItems, handleEdit, setIsSelectionModeActive, setSelectedItems, t, toast]);

  const handleDeleteWithSelectionCheck = useCallback(async () => {
    if (selectedItems.length > 0) {
      if (confirm(t('common.confirmDelete', { count: selectedItems.length, defaultValue: 'Are you sure you want to delete the selected items?' }))) {
        await handleBulkDelete(); // useEntityModule handles the actual deletion based on selectedItems
        setIsSelectionModeActive(false);
        setSelectedItems([]);
        toast({
          title: t('common.success', { defaultValue: 'Success' }),
          description: t('common.deleteSuccess', { defaultValue: 'Selected items deleted successfully.' }),
        });
      }
    } else {
      toast({
        title: t('common.selectionError', { defaultValue: 'Selection Error' }),
        description: t('common.selectToDelete', { defaultValue: 'Please select items to delete.' }),
        variant: 'destructive',
      });
    }
  }, [selectedItems, handleBulkDelete, setIsSelectionModeActive, setSelectedItems, t, toast]);

  const handleCancelSelectionMode = useCallback(() => {
    setIsSelectionModeActive(false);
    setSelectedItems([]);
  }, [setIsSelectionModeActive, setSelectedItems]);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'active': return 'default';
      case 'draft': return 'secondary';
      case 'expired': return 'destructive';
      case 'terminated': return 'outline';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('common.notSet', { defaultValue: 'N/A' });
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return t('common.invalidDate', { defaultValue: 'Invalid Date' });
      return format(date, 'PP');
    } catch (e) {
      return t('common.invalidDate', { defaultValue: 'Invalid Date' });
    }
  };

  const providerOptions = [
    { value: 'all', label: t('filters.allProviders', { defaultValue: 'All Providers' }) },
    ...allProviders.map(provider => ({
      value: provider.id,
      label: getProviderName(provider.id)
    }))
  ];

  if (loading && contracts.length === 0 && allProviders.length === 0) {
    return <LoadingSpinner message={t('messages.loadingData', { item: t('pageTitles.contracts', { defaultValue: 'Contracts' }) })} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sticky top-[var(--subheader-height,0px)] bg-background dark:bg-gray-900 py-3 z-10 -mx-1 px-1 md:mx-0 md:px-0 border-b dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <ScrollText className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-600 dark:text-gray-400`} />
          {t('pageTitles.contracts')} ({filteredAndSortedItems?.length || 0})
        </h3>
        <div className="flex items-center gap-2">
          <GlobalActionButton
            actionsConfig={memoizedGlobalActionsConfig}
            onEditItems={handleEditWithSelectionCheck}
            onDeleteItems={handleDeleteWithSelectionCheck}
            isSelectionModeActive={isSelectionModeActive}
            onCancelSelectionMode={handleCancelSelectionMode}
            selectedItemCount={selectedItems.length}
            itemTypeForActions={t('contracts.itemTitleSingular', { defaultValue: 'Contract' })}
            t={t}
          />
          <Button onClick={() => refreshContracts(true)} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''} ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('buttons.refresh', { defaultValue: 'Refresh' })}
          </Button>
          <ViewSwitcher currentView={passedView} />
        </div>
      </div>

      {error && (
        <div className="p-4 mb-4 bg-red-50 dark:bg-red-900/30 border border-red-500 dark:border-red-600 text-red-700 dark:text-red-200 rounded-md flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('contracts.filtersTitle', { defaultValue: 'Filter Contracts' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder={t('contracts.searchPlaceholder', { defaultValue: 'Search contracts...' })}
              value={filters.searchTerm || ''}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            />
            <Select value={filters.provider_id} onValueChange={(value) => handleFilterChange('provider_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('filters.selectProvider', { defaultValue: 'Select Provider' })} />
              </SelectTrigger>
              <SelectContent>
                {providerOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('filters.selectStatus', { defaultValue: 'Select Status' })} />
              </SelectTrigger>
              <SelectContent>
                {statusFilterOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(option.labelKey, { defaultValue: option.defaultValue })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2 rtl:space-x-reverse">
            <Button variant="outline" onClick={() => setFilters(entityConfig.initialFilters)}>
              <FilterX className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('buttons.resetFilters', { defaultValue: 'Reset Filters' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && filteredAndSortedItems.length > 0 && <LoadingSpinner message={t('messages.updatingData', { item: t('pageTitles.contracts') })} />}

      {!loading && filteredAndSortedItems.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title={filters.searchTerm || filters.provider_id !== 'all' || filters.status !== 'all'
            ? t('contracts.noContractsMatchFilters', { defaultValue: 'No Contracts Match Filters' })
            : t('contracts.noContractsTitle', { defaultValue: 'No Contracts Found' })
          }
          description={filters.searchTerm || filters.provider_id !== 'all' || filters.status !== 'all'
            ? t('contracts.tryAdjustingFilters', { defaultValue: 'Try adjusting your search or filter criteria.' })
            : t('contracts.getStarted', { defaultValue: 'Get started by adding a new contract.' })
          }
          actionButton={!(filters.searchTerm || filters.provider_id !== 'all' || filters.status !== 'all') && (
            <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
              <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('contracts.addFirstContract', { defaultValue: 'Add First Contract' })}
            </Button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedItems.map(contract => {
            const contractName = language === 'he' ? (contract.name_he || contract.name_en) : (contract.name_en || contract.name_he);
            return (
              <Card key={contract.id} className="flex flex-col hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base flex items-center">
                      <ScrollText className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-blue-600`} />
                      {contract.contract_number}
                    </CardTitle>
                    <Badge variant={getStatusBadgeVariant(contract.status)}>
                      {t(`status.${contract.status}`, { defaultValue: contract.status })}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {contractName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-2 text-sm">
                  <div className="flex items-center">
                    <Building2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-400`} />
                    <span>{getProviderName(contract.provider_id)}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-400`} />
                    <span>
                      {formatDate(contract.valid_from)} - {formatDate(contract.valid_to)}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-3">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(contract)} className="w-full">
                    <Edit className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('buttons.edit', { defaultValue: 'Edit' })}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {isDialogOpen && (
        <ContractDialog
          contract={currentItem}
          isOpen={isDialogOpen}
          onClose={handleSelfSubmittingDialogClose}
          providers={allProviders}
        />
      )}
    </div>
  );
}
