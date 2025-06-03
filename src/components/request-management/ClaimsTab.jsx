
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Claim } from '@/api/entities';
import { Provider } from '@/api/entities';
import { Doctor } from '@/api/entities';
import { InsuredPerson } from '@/api/entities';
import { useLanguageHook } from '@/components/useLanguageHook';
import { useToast } from '@/components/ui/use-toast';
import useEntityModule from '@/components/hooks/useEntityModule'; // Changed from useCrudPage
import ClaimDialog from './ClaimDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Plus, DollarSign } from 'lucide-react'; // New import for icons
import GlobalActionButton from '@/components/shared/GlobalActionButton'; // New import
import RefreshButton from '@/components/shared/RefreshButton'; // New import
import ViewSwitcher from '@/components/shared/ViewSwitcher'; // New import
import FilterBar from '@/components/shared/FilterBar'; // New import
import ErrorDisplay from '@/components/shared/ErrorDisplay'; // New import
import LoadingSpinner from '@/components/shared/LoadingSpinner'; // New import
import Table from '@/components/shared/Table'; // New import

export default function ClaimsTab({ globalActionsConfig: externalActionsConfig, currentView: passedView }) {
  const { t, language, isRTL } = useLanguageHook();
  const { toast } = useToast();

  const [allProviders, setAllProviders] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [allInsuredPersons, setAllInsuredPersons] = useState([]);

  // Helper functions for names, memoized for stability
  const getProviderName = useCallback((id) => {
    const provider = allProviders.find(p => p.id === id);
    return provider?.name?.en || provider?.name?.he || String(id);
  }, [allProviders]);

  const getDoctorName = useCallback((id) => {
    const doctor = doctors.find(d => d.id === id);
    return doctor ? `${doctor.first_name_en} ${doctor.last_name_en}` : String(id);
  }, [doctors]);

  const getInsuredName = useCallback((id) => {
    const insured = allInsuredPersons.find(i => i.id === id);
    return insured?.full_name || String(id);
  }, [allInsuredPersons]);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'paid_in_full':
      case 'approved_for_payment':
        return 'default';
      case 'in_review':
      case 'pending_information':
        return 'secondary';
      case 'rejected':
      case 'denied':
        return 'destructive';
      case 'draft':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const entityConfig = useMemo(() => ({
    entitySDK: Claim,
    entityName: t('claims.itemTitleSingular', { defaultValue: 'Claim' }),
    entityNamePlural: t('claims.itemTitlePlural', { defaultValue: 'Claims' }),
    DialogComponent: ClaimDialog,
    FormComponent: null, // ClaimsTab uses ClaimDialog directly for add/edit
    initialFilters: {
      searchTerm: '', // For invoice number, insured name, provider name
      status: 'all',
      provider_id: 'all',
      insured_id: 'all',
      service_date_range: { from: null, to: null },
      page: 1,
      pageSize: 10,
    },
    filterFunction: (item, filters) => {
      // Search term (invoice number, insured name, provider name)
      if (filters.searchTerm) {
        const lowerCaseSearchTerm = filters.searchTerm.toLowerCase();
        const invoiceNumberMatch = item.invoice_number?.toLowerCase().includes(lowerCaseSearchTerm);
        const providerNameMatch = getProviderName(item.provider_id).toLowerCase().includes(lowerCaseSearchTerm);
        const insuredNameMatch = getInsuredName(item.insured_id).toLowerCase().includes(lowerCaseSearchTerm);

        if (!invoiceNumberMatch && !providerNameMatch && !insuredNameMatch) {
          return false;
        }
      }

      // Status filter
      if (filters.status && filters.status !== 'all' && item.status !== filters.status) {
        return false;
      }

      // Provider filter
      if (filters.provider_id && filters.provider_id !== 'all' && item.provider_id !== filters.provider_id) {
        return false;
      }

      // Insured filter
      if (filters.insured_id && filters.insured_id !== 'all' && item.insured_id !== filters.insured_id) {
        return false;
      }

      // Service date range filter
      if (filters.service_date_range && (filters.service_date_range.from || filters.service_date_range.to)) {
        const serviceDate = item.service_date_from ? new Date(item.service_date_from) : null;
        const fromDate = filters.service_date_range.from ? new Date(filters.service_date_range.from) : null;
        const toDate = filters.service_date_range.to ? new Date(filters.service_date_range.to) : null;

        if (!serviceDate) return false;

        // Normalize dates to start of day for comparison
        const normalizeDate = (d) => d ? new Date(d.getFullYear(), d.getMonth(), d.getDate()) : null;
        const normalizedServiceDate = normalizeDate(serviceDate);
        const normalizedFromDate = normalizeDate(fromDate);
        const normalizedToDate = normalizeDate(toDate);

        if (normalizedFromDate && normalizedServiceDate < normalizedFromDate) return false;
        if (normalizedToDate && normalizedServiceDate > normalizedToDate) return false;
      }

      return true;
    },
    storageKey: 'claimsView',
    defaultSort: '-created_date',
  }), [t, getProviderName, getInsuredName]); // Dependencies for entityConfig

  const {
    items: claims,
    loading,
    error,
    filters, setFilters,
    sortConfig, setSortConfig,
    pagination, setPagination,
    selectedItems, setSelectedItems,
    isDialogOpen, setIsDialogOpen,
    currentItem, setCurrentItem,
    handleRefresh: refreshClaims,
    handleSearch,
    handleFilterChange,
    handleSortChange,
    handlePageChange,
    handlePageSizeChange,
    handleAddNew,
    handleEdit,
    handleDelete,
    handleBulkDelete,
    isSelectionModeActive, setIsSelectionModeActive,
    handleToggleSelection, handleSelectAll,
  } = useEntityModule(entityConfig);

  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        const [fetchedProviders, fetchedDoctors, fetchedInsured] = await Promise.all([
          Provider.list(),
          Doctor.list(),
          InsuredPerson.list()
        ]);
        setAllProviders(Array.isArray(fetchedProviders) ? fetchedProviders : []);
        setDoctors(Array.isArray(fetchedDoctors) ? fetchedDoctors : []);
        setAllInsuredPersons(Array.isArray(fetchedInsured) ? fetchedInsured : []);
      } catch (err) {
        console.error("Failed to fetch related data for Claims tab", err);
        toast({
          title: t('errors.fetchDropdownError', { defaultValue: 'Failed to load options' }),
          description: err.message,
          variant: 'destructive'
        });
      }
    };
    fetchRelatedData();
  }, [t, toast]);

  const columns = useMemo(() => [
    {
      accessorKey: 'invoice_number',
      header: t('fields.invoiceNumber', { defaultValue: 'Invoice #' }),
      sortable: true
    },
    {
      accessorKey: 'provider_id',
      header: t('fields.provider', { defaultValue: 'Provider' }),
      cell: ({ row }) => getProviderName(row.original.provider_id),
      sortable: true
    },
    {
      accessorKey: 'doctor_id',
      header: t('fields.doctor', { defaultValue: 'Doctor' }),
      cell: ({ row }) => getDoctorName(row.original.doctor_id)
    },
    {
      accessorKey: 'insured_id',
      header: t('fields.insured', { defaultValue: 'Insured' }),
      cell: ({ row }) => getInsuredName(row.original.insured_id)
    },
    {
      accessorKey: 'service_date_from',
      header: t('fields.serviceDate', { defaultValue: 'Service Date' }),
      cell: ({ row }) => {
        const date = row.original.service_date_from;
        return date ? format(new Date(date), 'MMM dd, yyyy') : '-';
      },
      sortable: true
    },
    {
      accessorKey: 'total_submitted_amount',
      header: t('fields.submittedAmount', { defaultValue: 'Submitted' }),
      cell: ({ row }) => `${row.original.total_submitted_amount || 0} ${row.original.currency || 'ILS'}`
    },
    {
      accessorKey: 'total_paid_amount',
      header: t('fields.paidAmount', { defaultValue: 'Paid' }),
      cell: ({ row }) => `${row.original.total_paid_amount || 0} ${row.original.currency || 'ILS'}`
    },
    {
      accessorKey: 'status',
      header: t('fields.status', { defaultValue: 'Status' }),
      cell: ({ row }) => (
        <Badge variant={getStatusBadgeVariant(row.original.status)}>
          {t(`claimStatus.${row.original.status}`, { defaultValue: row.original.status })}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: t('common.actions', { defaultValue: 'Actions' }),
      cell: ({ row }) => (
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(row.original)}>
            {t('buttons.edit', { defaultValue: 'Edit' })}
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleDelete(row.original.id)}>
            {t('buttons.delete', { defaultValue: 'Delete' })}
          </Button>
        </div>
      ),
    },
  ], [t, handleEdit, handleDelete, getProviderName, getDoctorName, getInsuredName]);

  const memoizedGlobalActionsConfig = useMemo(() => [
    { labelKey: 'claims.addNewClaim', defaultLabel: 'Add New Claim', icon: Plus, action: handleAddNew, type: 'add' },
    ...(externalActionsConfig || [])
  ], [handleAddNew, externalActionsConfig, t]);

  const handleEditWithSelectionCheck = useCallback(() => {
    if (selectedItems.length === 1) {
      handleEdit(selectedItems[0]);
      setIsSelectionModeActive(false);
      setSelectedItems([]);
    } else if (selectedItems.length > 1) {
      toast({
        title: t('common.selectOneItemToEdit', { defaultValue: 'Please select only one item to edit.' }),
        variant: 'warning',
      });
    } else {
      toast({
        title: t('common.noItemsSelected', { defaultValue: 'No items selected for editing.' }),
        variant: 'warning',
      });
    }
  }, [selectedItems, handleEdit, setIsSelectionModeActive, setSelectedItems, t, toast]);

  const handleDeleteWithSelectionCheck = useCallback(() => {
    if (selectedItems.length > 0) {
      handleBulkDelete(selectedItems.map(item => item.id));
      setIsSelectionModeActive(false);
      setSelectedItems([]);
    } else {
      toast({
        title: t('common.noItemsSelected', { defaultValue: 'No items selected for deletion.' }),
        variant: 'warning',
      });
    }
  }, [selectedItems, handleBulkDelete, setIsSelectionModeActive, setSelectedItems, t, toast]);

  const handleCancelSelectionMode = useCallback(() => {
    setIsSelectionModeActive(false);
    setSelectedItems([]);
  }, [setIsSelectionModeActive, setSelectedItems]);

  const filterFields = useMemo(() => [
    {
      name: 'provider_id',
      label: t('fields.provider', { defaultValue: 'Provider' }),
      type: 'select',
      options: [
        { value: 'all', label: t('filters.allProviders', { defaultValue: 'All Providers' }) },
        ...allProviders.map(p => ({
          label: p.name?.en || p.name?.he || p.id,
          value: p.id
        }))
      ]
    },
    {
      name: 'status',
      label: t('fields.status', { defaultValue: 'Status' }),
      type: 'select',
      options: [
        { value: 'all', label: t('filters.allStatuses', { defaultValue: 'All Statuses' }) },
        { value: 'draft', label: t('claimStatus.draft', { defaultValue: 'Draft' }) },
        { value: 'submitted', label: t('claimStatus.submitted', { defaultValue: 'Submitted' }) },
        { value: 'in_review', label: t('claimStatus.in_review', { defaultValue: 'In Review' }) },
        { value: 'approved_for_payment', label: t('claimStatus.approved_for_payment', { defaultValue: 'Approved for Payment' }) },
        { value: 'paid_in_full', label: t('claimStatus.paid_in_full', { defaultValue: 'Paid in Full' }) },
        { value: 'rejected', label: t('claimStatus.rejected', { defaultValue: 'Rejected' }) },
        { value: 'denied', label: t('claimStatus.denied', { defaultValue: 'Denied' }) }
      ]
    },
    {
      name: 'insured_id',
      label: t('fields.insured', { defaultValue: 'Insured Person' }),
      type: 'select',
      options: [
        { value: 'all', label: t('filters.allInsuredPersons', { defaultValue: 'All Insured Persons' }) },
        ...allInsuredPersons.map(i => ({
          label: i.full_name || i.id,
          value: i.id
        }))
      ]
    },
    {
      name: 'service_date_range',
      label: t('fields.serviceDateRange', { defaultValue: 'Service Date Range' }),
      type: 'date_range'
    },
  ], [t, allProviders, allInsuredPersons]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sticky top-[var(--subheader-height,0px)] bg-background dark:bg-gray-900 py-3 z-10 -mx-1 px-1 md:mx-0 md:px-0 border-b dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <DollarSign className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-600 dark:text-gray-400`} />
          {t('claims.titleMultiple', { defaultValue: 'Claims' })} ({claims?.length || 0})
        </h3>
        <div className="flex items-center gap-2">
            <GlobalActionButton
                actionsConfig={memoizedGlobalActionsConfig}
                onEditItems={handleEditWithSelectionCheck}
                onDeleteItems={handleDeleteWithSelectionCheck}
                isSelectionModeActive={isSelectionModeActive}
                onCancelSelectionMode={handleCancelSelectionMode}
                selectedItemCount={selectedItems.length}
                itemTypeForActions={t('claims.itemTitleSingular', { defaultValue: 'Claim' })}
                t={t} {/* ADDED t PROP */}
              />
          <RefreshButton
            onClick={refreshClaims}
            isLoading={loading}
            tooltipContent={t('common.refresh', { defaultValue: 'Refresh' })}
          />
          <ViewSwitcher currentView={passedView} onViewChange={() => { /* Implement view change logic */ }} t={t} />
        </div>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        searchPlaceholder={t('search.placeholderClaims', { defaultValue: 'Search claims by invoice #, provider, or insured' })}
        filterFields={filterFields}
        t={t}
      />

      <ErrorDisplay error={error} onRetry={refreshClaims} t={t} />
      <LoadingSpinner isLoading={loading} t={t} />

      {!(loading || error) && (
        <Table
          data={claims}
          columns={columns}
          sortConfig={sortConfig}
          onSortChange={setSortConfig}
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          selectedItems={selectedItems}
          onToggleSelection={handleToggleSelection}
          onSelectAll={handleSelectAll}
          isSelectionModeActive={isSelectionModeActive}
          totalItems={pagination.totalItems}
          entityNamePlural={entityConfig.entityNamePlural}
          t={t}
        />
      )}

      {isDialogOpen && (
        <ClaimDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          claimData={currentItem}
          providers={allProviders}
          doctors={doctors}
          insuredPersons={allInsuredPersons}
        />
      )}
    </div>
  );
}
