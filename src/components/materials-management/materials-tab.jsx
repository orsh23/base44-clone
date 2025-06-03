
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguageHook } from '@/components/useLanguageHook';
import { useToast } from "@/components/ui/use-toast";
import { Material } from '@/api/entities'; // Assuming Material is an SDK or ORM class
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import EmptyState from '@/components/ui/empty-state';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import { useEntityModule } from '@/hooks/useEntityModule'; // Assuming useEntityModule hook exists

import MaterialDialog from './material-dialog';
import MaterialCard from './MaterialCard';
import ViewSwitcher from '@/components/common/ViewSwitcher';
import GlobalActionButton from '@/components/common/GlobalActionButton';
import DataTable from '@/components/shared/DataTable';
import MaterialsFilterBar from './MaterialsFilterBar';
import ImportDialog from '@/components/common/ImportDialog';
import { Badge } from '@/components/ui/badge';

import {
    Package, Plus, UploadCloud, AlertTriangle, RefreshCw
} from 'lucide-react';

import { formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { enUS, he } from 'date-fns/locale';

const getLocaleObject = (languageCode) => (languageCode === 'he' ? he : enUS);

// Helper for localStorage
const loadFromStorage = (key, defaultValue) => {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue !== null ? storedValue : defaultValue;
  } catch (error) {
    console.error("Failed to load from localStorage", error);
    return defaultValue;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error("Failed to save to localStorage", error);
  }
};

export default function MaterialsTab({ globalActionsConfig: externalActionsConfig, currentView: passedView }) {
  const { t, language, isRTL } = useLanguageHook();
  const { toast } = useToast();

  const getLocalizedMaterialName = useCallback((material) => {
    if (!material) return t('common.unknownMaterial', {defaultValue: 'Unknown Material'});
    const lang = t('common.langCode', {defaultValue: 'en'});
    return lang === 'he' ? (material.name_he || material.name_en) : (material.name_en || material.name_he);
  }, [t]);

  const entityConfig = useMemo(() => ({
    entitySDK: Material,
    entityNameSingular: t('pageTitles.materialsSingular', { defaultValue: 'Material' }),
    entityNamePlural: t('pageTitles.materialsManagement'),
    DialogComponent: MaterialDialog,
    FormComponent: null, // MaterialDialog acts as both
    initialFilters: {
      searchTerm: '',
      status: 'all', // 'active', 'inactive'
      hasVariants: 'all', // 'yes', 'no'
      page: 1,
      pageSize: 10,
    },
    // filterFunction applies client-side filtering *after* data is fetched
    filterFunction: (item, currentFilters) => {
        const { searchTerm, status, hasVariants: hasVariantsFilter } = currentFilters;
        let matches = true;

        if (searchTerm) {
            const termLower = searchTerm.toLowerCase();
            const localizedName = getLocalizedMaterialName(item)?.toLowerCase() || '';
            const descriptionEn = item.description_en?.toLowerCase() || '';
            const descriptionHe = item.description_he?.toLowerCase() || '';

            matches = matches && (
                localizedName.includes(termLower) ||
                descriptionEn.includes(termLower) ||
                descriptionHe.includes(termLower)
            );
        }
        if (status !== 'all') {
            matches = matches && (status === 'active' ? item.is_active : !item.is_active);
        }
        if (hasVariantsFilter !== 'all') {
            matches = matches && (hasVariantsFilter === 'yes' ? item.has_variants : !item.has_variants);
        }
        return matches;
    },
    // sortFunction applies client-side sorting *after* data is filtered
    sortFunction: (items, sortConfig) => {
        if (!sortConfig || !sortConfig.key) return items;
        const sortedItems = [...items];
        sortedItems.sort((a, b) => {
            let valA, valB;
            if (sortConfig.key === 'name') { // 'name' accessor in columns
                valA = getLocalizedMaterialName(a)?.toLowerCase() || '';
                valB = getLocalizedMaterialName(b)?.toLowerCase() || '';
            } else if (sortConfig.key === 'updated_date') {
                valA = a.updated_date && isValid(parseISO(a.updated_date)) ? parseISO(a.updated_date).getTime() : (sortConfig.direction === 'ascending' ? Infinity : -Infinity);
                valB = b.updated_date && isValid(parseISO(b.updated_date)) ? parseISO(b.updated_date).getTime() : (sortConfig.direction === 'ascending' ? Infinity : -Infinity);
            } else {
                valA = a[sortConfig.key];
                valB = b[sortConfig.key];
            }
            
            // Handle undefined/null values for sorting
            if (valA === undefined || valA === null) valA = sortConfig.direction === 'ascending' ? Infinity : -Infinity;
            if (valB === undefined || valB === null) valB = sortConfig.direction === 'ascending' ? Infinity : -Infinity;
            
            if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
        return sortedItems;
    },
    storageKey: 'materialsView',
    // Custom messages for toasts and dialogs
    messages: {
        createSuccess: (name) => t('materials.createSuccess', { name }),
        updateSuccess: (name) => t('materials.updateSuccess', { name }),
        deleteSuccess: (count) => t('materials.bulkDeleteSuccess', { count }),
        deleteConfirm: (count, itemName) => t('materials.bulkDeleteConfirmMessage', { count, itemName: itemName.toLowerCase() }),
        deleteError: (name, error) => t('materials.deleteError', { name, error }),
        fetchError: (item) => t('errors.fetchFailedGeneral', { item }),
        rateLimitError: () => t('errors.rateLimitExceededShort'),
        networkError: () => t('errors.networkErrorGeneral'),
    }
  }), [t, getLocalizedMaterialName]);

  const {
    items: materials, // Renamed from 'items' to 'materials' for existing code compatibility
    loading, error, filters, setFilters, sortConfig, setSortConfig, pagination,
    selectedItems, setSelectedItems, isDialogOpen, setIsDialogOpen, currentItem, setCurrentItem,
    handleRefresh, handleFilterChange, handleSortChange,
    handlePageChange, handlePageSizeChange, handleAddNew, handleEdit, handleDelete,
    handleBulkDelete, isSelectionModeActive, setIsSelectionModeActive,
    handleToggleSelection, handleSelectAll, handleSelfSubmittingDialogClose,
    filteredAndSortedItems, // This is the fully processed list before pagination
    paginatedItems, // This is the list for the current page
    totalItems: totalFilteredItems, // Total items after filtering/sorting
  } = useEntityModule(entityConfig);

  const [currentView, setCurrentView] = useState(passedView || loadFromStorage('materialsView_view_preference', 'card'));
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [deleteDialogState, setDeleteDialogState] = useState({ isOpen: false, itemIds: null, itemName: '', message: '' });

  const currentLocale = getLocaleObject(language);

  // Effect to save view preference to localStorage
  useEffect(() => {
    saveToStorage('materialsView_view_preference', currentView);
  }, [currentView]);

  const memoizedGlobalActionsConfig = useMemo(() => [
    { labelKey: 'materials.addNewMaterial', defaultLabel: 'Add New Material', icon: Plus, action: handleAddNew, type: 'add'},
    ...(externalActionsConfig || []),
    { isSeparator: true },
    { labelKey: 'buttons.import', defaultLabel: 'Import', icon: UploadCloud, action: () => setIsImportDialogOpen(true), type: 'import' },
  ], [handleAddNew, externalActionsConfig, t]);

  const handleEditWithSelectionCheck = useCallback(() => {
    if (selectedItems.length === 1) {
      const materialToEdit = materials.find(m => m.id === selectedItems[0]); // materials is the full list
      if (materialToEdit) {
        handleEdit(materialToEdit);
      }
    } else if (selectedItems.length === 0) {
      setIsSelectionModeActive(true);
      toast({ title: t('bulkActions.selectionModeEnabledTitle'), description: t('bulkActions.selectItemToEditDesc', { entity: t('pageTitles.materialsSingular', {defaultValue: 'Material'})}) });
    } else {
      toast({ title: t('bulkActions.selectOneToEditTitle'), description: t('bulkActions.selectOneToEditDesc', {entity: t('pageTitles.materialsManagement')}), variant: 'info' });
    }
  }, [selectedItems, materials, handleEdit, setIsSelectionModeActive, t, toast]);

  const handleDeleteWithSelectionCheck = useCallback(() => {
    if (selectedItems.length > 0) {
      const idsToDelete = Array.from(selectedItems);
      const firstItemName = idsToDelete.length > 0 ? getLocalizedMaterialName(materials.find(m => m.id === idsToDelete[0])) : t('pageTitles.materialsSingular', {defaultValue: 'Material'});
      const itemName = idsToDelete.length === 1 ? firstItemName : t('pageTitles.materialsManagement');

      setDeleteDialogState({
          isOpen: true,
          itemIds: idsToDelete,
          itemName: itemName,
          message: t('materials.bulkDeleteConfirmMessage', { count: idsToDelete.length, itemName: itemName.toLowerCase() })
      });
    } else {
      setIsSelectionModeActive(true);
      toast({ title: t('bulkActions.selectionModeEnabledTitle'), description: t('bulkActions.selectItemsToDeleteDesc', { entity: t('pageTitles.materialsManagement')}) });
    }
  }, [selectedItems, materials, getLocalizedMaterialName, setIsSelectionModeActive, t, toast]);

  const handleConfirmDelete = async () => {
    if (!deleteDialogState.itemIds || deleteDialogState.itemIds.length === 0) return;
    await handleBulkDelete(deleteDialogState.itemIds);
    setDeleteDialogState({ isOpen: false, itemIds: null, itemName: '', message: '' });
    handleCancelSelectionMode();
  };

  const handleCancelSelectionMode = useCallback(() => {
    setIsSelectionModeActive(false);
    setSelectedItems([]);
  }, [setIsSelectionModeActive, setSelectedItems]);

  const handleImportSubmit = async (records) => {
    setIsImportDialogOpen(false);
    if (!records || records.length === 0) {
      toast({ title: t('import.noRecordsTitle'), description: t('import.noRecordsDesc'), variant: "warning" });
      return;
    }
    
    const materialsToCreate = records.map(rec => ({
        name_en: rec['Name EN'] || rec['name_en'],
        name_he: rec['Name HE'] || rec['name_he'],
        description_en: rec['Description EN'] || rec['description_en'],
        description_he: rec['Description HE'] || rec['description_he'],
        unit_of_measure: rec['Unit']?.toLowerCase() || rec['unit_of_measure']?.toLowerCase() || 'unit',
        base_price: parseFloat(rec['Price'] || rec['base_price']) || 0,
        currency: rec['Currency'] || rec['currency'] || 'ILS',
        has_variants: (rec['Has Variants'] || rec['has_variants'])?.toLowerCase() === 'true',
        is_active: (rec['Active'] || rec['is_active'])?.toLowerCase() !== 'false',
    })).filter(m => m.name_en || m.name_he);

    if(materialsToCreate.length === 0) {
        toast({title: t('import.noValidRecordsTitle'), description: t('import.noValidRecordsDesc', {entity: t('pageTitles.materialsManagement')}), variant: 'warning'});
        return;
    }
    
    let successCount = 0; let errorCount = 0;
    // Set a temporary loading state for the import process
    toast({
      title: t('import.inProgressTitle'),
      description: t('import.inProgressDesc', { entity: t('pageTitles.materialsManagement') }),
      duration: 3000,
    });
    
    // Simulate a global loading spinner if useEntityModule doesn't handle this
    // For now, rely on individual toasts for success/failure
    
    for (const materialData of materialsToCreate) {
        try { await Material.create(materialData); successCount++; }
        catch (err) { console.error("Error creating material from import:", err, materialData); errorCount++; }
    }
    
    toast({
        title: t('import.completedTitle'),
        description: t('import.completedDesc', {successCount, errorCount, entity: t('pageTitles.materialsManagement')}),
    });
    if (successCount > 0) handleRefresh();
  };

  const materialColumns = useMemo(() => [
    { 
      accessorKey: 'name', // This accessorKey is for sorting/filtering. Cell uses localized name.
      header: t('materials.fields.name'),
      cell: ({ row }) => getLocalizedMaterialName(row.original) || t('common.notSet'),
      enableSorting: true,
    },
    { 
      accessorKey: 'unit_of_measure', 
      header: t('materials.fields.unitOfMeasure'),
      cell: ({ row }) => row.original.unit_of_measure ? t(`materialUnits.${row.original.unit_of_measure.toLowerCase()}`, {defaultValue: row.original.unit_of_measure}) : t('common.notSet'),
      enableSorting: true,
    },
    { 
      accessorKey: 'base_price', 
      header: t('materials.fields.basePrice'),
      cell: ({ row }) => `${row.original.base_price || 0} ${row.original.currency || 'ILS'}`,
      enableSorting: true,
    },
    {
      accessorKey: 'has_variants',
      header: t('materials.fields.hasVariants'),
      cell: ({ row }) => (
        <Badge variant={row.original.has_variants ? "default" : "outline"} className="text-xs">
          {row.original.has_variants ? t('common.yes') : t('common.no')}
        </Badge>
      ),
      enableSorting: true,
    },
    { 
      accessorKey: 'is_active', 
      header: t('materials.fields.status'),
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? "success" : "secondary"} className="text-xs">
          {row.original.is_active ? t('status.active') : t('status.inactive')}
        </Badge>
      ),
      enableSorting: true,
    },
    { 
      accessorKey: 'updated_date', 
      header: t('common.lastUpdated'),
      cell: ({ row }) => (row.original.updated_date && isValid(parseISO(row.original.updated_date))
        ? formatDistanceToNow(parseISO(row.original.updated_date), { addSuffix: true, locale: currentLocale })
        : t('common.unknown')
      ),
      enableSorting: true,
    },
  ], [t, currentLocale, getLocalizedMaterialName]);

  if (loading && totalFilteredItems === 0 && !error) { // Initial loading state
    return <div className="flex justify-center items-center h-64"><LoadingSpinner message={t('messages.loadingData', {item: t('pageTitles.materialsManagement')})} /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sticky top-[calc(var(--header-height,0px)+var(--subheader-height,0px))] bg-background dark:bg-gray-900 py-3 z-10 -mx-1 px-1 md:mx-0 md:px-0 border-b dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <Package className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-600 dark:text-gray-400`} />
          {t('pageTitles.materialsManagement')} ({totalFilteredItems})
        </h3>
        <div className="flex items-center gap-2">
            <GlobalActionButton
                actionsConfig={memoizedGlobalActionsConfig}
                onEditItems={handleEditWithSelectionCheck}
                onDeleteItems={handleDeleteWithSelectionCheck}
                isSelectionModeActive={isSelectionModeActive}
                onCancelSelectionMode={handleCancelSelectionMode}
                selectedItemCount={selectedItems.length}
                itemTypeForActions={t('pageTitles.materialsSingular', {defaultValue: 'Material'})}
                t={t}
              />
            <Button variant="outline" size="sm" onClick={() => handleRefresh(true)} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''} ${isRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                {t('buttons.refresh')}
            </Button>
            <ViewSwitcher
                currentView={currentView}
                onViewChange={(view) => { setCurrentView(view); handleCancelSelectionMode(); }}
                availableViews={['card', 'table']}
                entityName={t('pageTitles.materialsManagement')}
                t={t} isRTL={isRTL}
            />
        </div>
      </div>

      <MaterialsFilterBar
        filters={filters}
        onFiltersChange={handleFilterChange}
        onResetFilters={() => {
          setFilters(entityConfig.initialFilters); // Reset to initial filters
          setSortConfig({ key: 'name', direction: 'ascending' }); // Reset sort
          handleCancelSelectionMode();
           toast({
              title: t('filters.clearedTitle'),
              description: t('filters.filtersReset', { item: t('pageTitles.materialsManagement') }),
          });
        }}
        sortConfig={sortConfig}
        // MaterialsFilterBar expects a single key, then toggle logic.
        // Adapt it to use useEntityModule's setSortConfig
        onSortChange={(key) => {
            let direction = 'ascending';
            if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
            else if (sortConfig.key === key && sortConfig.direction === 'descending') direction = 'ascending';
            setSortConfig({ key, direction });
        }}
        t={t} language={language} isRTL={isRTL}
      />
      
      {error && (totalFilteredItems === 0) && ( // Show error if no data or initial fetch failed
         <Card className="border-destructive bg-destructive/10 dark:border-red-700 dark:bg-red-900/20">
            <CardHeader>
                <CardTitle className="text-destructive dark:text-red-300 flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    {t('common.errorOccurred')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-destructive dark:text-red-300">{error}</p>
                <Button variant="outline" size="sm" onClick={() => handleRefresh(true)} className="mt-3 border-destructive text-destructive hover:bg-destructive/20 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-700/30">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t('buttons.retryNow')}
                </Button>
            </CardContent>
        </Card>
      )}

      {!loading && !error && totalFilteredItems === 0 && (
        <EmptyState
          icon={Package}
          title={t('materials.noMaterialsFilterDesc')}
          message={t('materials.noMaterialsDesc')}
          actionButton={
            <Button onClick={handleAddNew}>
              <Plus className={`h-4 w-4 ${isRTL ? 'ml-1.5' : 'mr-1.5'}`} />
              {t('buttons.addNewMaterial', {defaultValue: 'Add New Material'})}
            </Button>
          }
          t={t} isRTL={isRTL}
        />
      )}

      {(!error || totalFilteredItems > 0) && (totalFilteredItems > 0 || (loading && materials.length > 0)) && (
        <>
          {currentView === 'card' && paginatedItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedItems.map((material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  currentLocale={currentLocale}
                  t={t} isRTL={isRTL}
                  isSelectionModeActive={isSelectionModeActive}
                  isSelected={selectedItems.includes(material.id)}
                  onToggleSelection={() => handleToggleSelection(material.id)}
                  onCardClick={() => !isSelectionModeActive && handleEdit(material)}
                />
              ))}
            </div>
          )}

          {currentView === 'table' && (
            <DataTable
              columns={materialColumns}
              data={paginatedItems} // DataTable displays paginated items
              loading={loading}
              error={null} // Error handled separately above
              entityName={t('pageTitles.materialsManagement')}
              pagination={{
                currentPage: pagination.currentPage,
                pageSize: pagination.pageSize,
                totalItems: pagination.totalItems, // Total items *after* filtering/sorting
                totalPages: pagination.totalPages,
                onPageChange: handlePageChange,
                onPageSizeChange: handlePageSizeChange,
              }}
              onSortChange={handleSortChange} // This expects {id, desc} array
              currentSort={sortConfig.key ? [{ id: sortConfig.key, desc: sortConfig.direction === 'descending' }] : []}
              isSelectionModeActive={isSelectionModeActive}
              selectedRowIds={new Set(selectedItems)} // DataTable expects Set
              onRowSelectionChange={(id) => handleToggleSelection(id)}
              onSelectAllRows={() => handleSelectAll(paginatedItems.map(item => item.id))} // Select all on current page
              onRowClick={({original: item}) => !isSelectionModeActive && item?.id && handleEdit(item)}
              t={t} language={language} isRTL={isRTL}
            />
          )}

          {currentView === 'card' && pagination.totalPages > 1 && (
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
                {t('dataTable.pageInfo', { page: pagination.currentPage, totalPages: pagination.totalPages })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {t('buttons.next')}
              </Button>
            </div>
          )}
        </>
      )}

      {isDialogOpen && (
        <MaterialDialog
          isOpen={isDialogOpen}
          onClose={handleSelfSubmittingDialogClose}
          materialData={currentItem}
          t={t} language={language} isRTL={isRTL}
        />
      )}
      
      {isImportDialogOpen && (
        <ImportDialog
          isOpen={isImportDialogOpen}
          onOpenChange={setIsImportDialogOpen}
          entityName={t('pageTitles.materialsManagement')}
          onImport={handleImportSubmit}
          language={language}
        />
      )}

      <ConfirmationDialog
        open={deleteDialogState.isOpen}
        onOpenChange={(open) => setDeleteDialogState(prev => ({ ...prev, isOpen: open }))}
        onConfirm={handleConfirmDelete}
        title={t('common.confirmDeleteTitle', {item: deleteDialogState.itemName || t('pageTitles.materialsSingular', {defaultValue:'Material'}), count: deleteDialogState.itemIds?.length || 1})}
        description={deleteDialogState.message}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        loading={loading}
        t={t} isRTL={isRTL}
      />
    </div>
  );
}
