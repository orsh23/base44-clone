
    import React, { useState, useEffect, useMemo, useCallback } from 'react';
    import { MaterialsBoM } from '@/api/entities'; 
    import { MedicalCode } from '@/api/entities';
    import { Material } from '@/api/entities'; 
    import { useLanguageHook } from '@/components/useLanguageHook';
    import { useToast } from '@/components/ui/use-toast';
    import useEntityModule from '@/components/hooks/useEntityModule'; // New hook for entity management
    import DataTable from '@/components/shared/DataTable';
    import MaterialsBoMDialog from './bom-dialog'; 
    import FilterBar from '@/components/shared/FilterBar'; // Replaces SearchFilterBar
    import GlobalActionButton from '@/components/shared/GlobalActionButton'; // New component for actions
    import ViewSwitcher from '@/components/shared/ViewSwitcher'; // New component for view switching
    import LoadingSpinner from '@/components/shared/LoadingSpinner'; // New component for loading state
    import ErrorDisplay from '@/components/shared/ErrorDisplay'; // New component for error state
    import { Button } from '@/components/ui/button';
    import { format } from 'date-fns';
    import { Plus, Boxes, RefreshCcw } from 'lucide-react'; // Icons

    // Utility functions (assuming they exist in @/lib/utils or similar)
    const loadFromStorage = (key, defaultValue) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error loading from storage for key "${key}":`, error);
            return defaultValue;
        }
    };

    const saveToStorage = (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error saving to storage for key "${key}":`, error);
        }
    };

    export default function MaterialsBoMsTab({ globalActionsConfig: externalActionsConfig, currentView: passedView }) {
      const { t, language, isRTL } = useLanguageHook();
      const { toast } = useToast();
      const [procedureCodesMap, setProcedureCodesMap] = useState({});
      const [materialsMap, setMaterialsMap] = useState({}); // For displaying material names


      useEffect(() => {
        const fetchRelatedData = async () => {
          try {
            const [codes, fetchedMaterials] = await Promise.all([
                MedicalCode.list(),
                Material.list()
            ]);
            
            const pCodesMap = {};
            (Array.isArray(codes) ? codes : []).forEach(code => {
              pCodesMap[code.code] = `${code.code} (${code.description_en?.substring(0,30) || 'N/A'}...)`;
            });
            setProcedureCodesMap(pCodesMap);

            const matsMap = {};
            (Array.isArray(fetchedMaterials) ? fetchedMaterials : []).forEach(mat => {
              matsMap[mat.id] = mat.name_en || mat.name_he || mat.id;
            });
            setMaterialsMap(matsMap);

          } catch (err) {
            console.error("Failed to fetch related data for Materials BoM tab", err);
            toast({ title: t('errors.fetchDropdownError', {defaultValue: 'Failed to load options'}), description: err.message, variant: 'destructive'});
          }
        };
        fetchRelatedData();
      }, [t, toast]);
      
      const getProcedureCodeDisplay = (code) => procedureCodesMap[code] || code;
      const getMaterialDisplay = (materialId) => {
        const material = materialsMap[materialId];
        return material || materialId;
      };

      const entityConfig = useMemo(() => ({
        entitySDK: MaterialsBoM, 
        entityName: t('materialsBoMs.itemTitleSingular', {defaultValue: "Material BoM"}),
        entityNamePlural: t('materialsBoMs.itemTitlePlural', {defaultValue: "Material BoMs"}),
        DialogComponent: MaterialsBoMDialog,
        FormComponent: null, // No specific FormComponent, dialog handles form directly
        initialFilters: {
          searchTerm: '', 
          page: 1,
          pageSize: 10,
          procedure_code_filter: '',
          status: '',
        },
        filterFunction: (item, filters) => {
            const { searchTerm, procedure_code_filter, status } = filters;

            // Search term logic (case-insensitive)
            if (searchTerm) {
                const lowerCaseSearchTerm = searchTerm.toLowerCase();
                const matchesProcedureCode = item.procedure_code?.toLowerCase().includes(lowerCaseSearchTerm);
                const matchesVersion = item.version?.toLowerCase().includes(lowerCaseSearchTerm);
                const matchesMaterials = item.materials?.some(mat => {
                    const materialName = materialsMap[mat.material_id]?.toLowerCase() || ''; 
                    return materialName.includes(lowerCaseSearchTerm) || String(mat.quantity).includes(lowerCaseSearchTerm);
                });
                if (!matchesProcedureCode && !matchesVersion && !matchesMaterials) {
                    return false;
                }
            }

            // Filter by procedure_code_filter
            if (procedure_code_filter && item.procedure_code !== procedure_code_filter) {
                return false;
            }

            // Filter by status
            if (status && item.status !== status) {
                return false;
            }

            return true;
        },
        storageKey: 'materialsBoMsView',
      }), [t, materialsMap]);

      const {
        items: boms, // Renamed for clarity if different from codeBoMs
        loading, error, filters, setFilters, sortConfig, setSortConfig, pagination, setPagination,
        selectedItems, setSelectedItems, isDialogOpen, setIsDialogOpen, currentItem, setCurrentItem,
        handleRefresh: refreshBoMs, handleSearch, handleFilterChange, handleSortChange,
        handlePageChange, handlePageSizeChange, handleAddNew, handleEdit, handleDelete,
        handleBulkDelete, isSelectionModeActive, setIsSelectionModeActive,
        handleToggleSelection, handleSelectAll, handleSelfSubmittingDialogClose,
      } = useEntityModule(entityConfig);

      const [currentView, setCurrentView] = useState(passedView || loadFromStorage('materialsBoMsView_viewPreference', 'table'));

      useEffect(() => {
        saveToStorage('materialsBoMsView_viewPreference', currentView);
      }, [currentView]);

      const memoizedGlobalActionsConfig = useMemo(() => [
        { labelKey: 'materialsBoMs.addBoM', defaultLabel: 'Add Material BoM', icon: Plus, action: handleAddNew, type: 'add'},
        ...(externalActionsConfig || [])
      ], [handleAddNew, externalActionsConfig, t]);

      const handleEditWithSelectionCheck = useCallback(() => {
        if (selectedItems.length === 1) {
          handleEdit(selectedItems[0]);
          setIsSelectionModeActive(false); // Exit selection mode after action
        } else if (selectedItems.length > 1) {
          toast({
            title: t('common.editErrorTitle', { defaultValue: 'Edit Error' }),
            description: t('common.selectOneItemEdit', { defaultValue: 'Please select only one item to edit.' }),
            variant: 'destructive',
          });
        } else {
            toast({
                title: t('common.editErrorTitle', { defaultValue: 'Edit Error' }),
                description: t('common.selectItemEdit', { defaultValue: 'Please select an item to edit.' }),
                variant: 'destructive',
            });
        }
      }, [selectedItems, handleEdit, setIsSelectionModeActive, t, toast]);
    
      const handleDeleteWithSelectionCheck = useCallback(() => {
        if (selectedItems.length > 0) {
            const itemIds = selectedItems.map(item => item.id);
            handleBulkDelete(itemIds);
            setIsSelectionModeActive(false); // Exit selection mode after action
        } else {
            toast({
                title: t('common.deleteErrorTitle', { defaultValue: 'Delete Error' }),
                description: t('common.selectItemDelete', { defaultValue: 'Please select items to delete.' }),
                variant: 'destructive',
            });
        }
      }, [selectedItems, handleBulkDelete, setIsSelectionModeActive, t, toast]);
    
      const handleCancelSelectionMode = useCallback(() => {
        setIsSelectionModeActive(false);
        setSelectedItems([]);
      }, [setIsSelectionModeActive, setSelectedItems]);

      const columns = useMemo(() => [
        {
          id: 'select',
          header: ({ table }) => (
            <input
              type="checkbox"
              checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
              onChange={(event) => table.toggleAllPageRowsSelected(!!event.target.checked)}
              aria-label="Select all"
              className="accent-primary"
            />
          ),
          cell: ({ row }) => (
            <input
              type="checkbox"
              checked={row.getIsSelected()}
              onChange={(event) => row.toggleSelected(!!event.target.checked)}
              aria-label="Select row"
              className="accent-primary"
            />
          ),
          enableSorting: false,
          enableHiding: false,
        },
        { accessorKey: 'procedure_code', header: t('fields.procedureCode', {defaultValue: 'Procedure Code'}), cell: ({row}) => getProcedureCodeDisplay(row.original.procedure_code), sortable: true },
        { 
            accessorKey: 'materials', 
            header: t('fields.numMaterials', {defaultValue: '# Materials'}), 
            cell: ({row}) => {
                if (!row.original.materials || !Array.isArray(row.original.materials)) return 0;
                const materialNames = row.original.materials.slice(0, 2).map(m => `${getMaterialDisplay(m.material_id)} (Qty: ${m.quantity})`).join(', ');
                return row.original.materials.length > 2 ? `${materialNames}... (+${row.original.materials.length - 2})` : materialNames || 'None';
            },
            sortable: false, // Materials array is complex to sort
        },
        { accessorKey: 'version', header: t('fields.version', {defaultValue: 'Version'}), sortable: true },
        { 
          accessorKey: 'effective_date', 
          header: t('fields.effectiveDate', {defaultValue: 'Effective Date'}), 
          cell: ({ row }) => row.original.effective_date ? format(new Date(row.original.effective_date), 'PP') : 'N/A',
          sortable: true 
        },
        { 
          accessorKey: 'status', 
          header: t('fields.status', {defaultValue: 'Status'}),
          cell: ({ row }) => t(`status.${row.original.status}`, {defaultValue: row.original.status}),
          sortable: true
        },
        {
          id: 'actions',
          header: t('common.actions', {defaultValue: 'Actions'}),
          cell: ({ row }) => (
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(row.original)}>{t('buttons.edit', {defaultValue: 'Edit'})}</Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(row.original.id)}>{t('buttons.delete', {defaultValue: 'Delete'})}</Button>
            </div>
          ),
          enableSorting: false,
          enableHiding: false,
        },
      ], [t, handleEdit, handleDelete, language, procedureCodesMap, materialsMap]);

      const filterFields = useMemo(() => [
        { name: 'procedure_code_filter', label: t('fields.procedureCode', {defaultValue: 'Procedure Code'}), type: 'select', options: Object.entries(procedureCodesMap).map(([value,label])=>({value,label})) },
        { name: 'status', label: t('fields.status', {defaultValue: 'Status'}), type: 'select', options: [
            { value: '', label: t('filters.allStatuses', {defaultValue: 'All Statuses'}) },
            { value: 'draft', label: t('status.draft', {defaultValue: 'Draft'}) },
            { value: 'active', label: t('status.active', {defaultValue: 'Active'}) },
            { value: 'deprecated', label: t('status.deprecated', {defaultValue: 'Deprecated'}) },
        ]},
      ], [t, procedureCodesMap]);

      const renderContent = () => {
        if (loading) {
          return <LoadingSpinner />;
        }
        if (error) {
          return <ErrorDisplay message={error.message} onRetry={refreshBoMs} />;
        }
        if (!boms || boms.length === 0) {
          return <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t('common.noItemsFound', {defaultValue: 'No items found.'})}</div>;
        }
    
        switch (currentView) {
          case 'table':
          default:
            return (
              <DataTable
                columns={columns}
                data={boms}
                pagination={pagination}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                sortConfig={sortConfig}
                onSortChange={handleSortChange}
                selectedItems={selectedItems}
                onToggleSelection={handleToggleSelection}
                onSelectAll={handleSelectAll}
                isSelectionModeActive={isSelectionModeActive}
                setIsSelectionModeActive={setIsSelectionModeActive}
                entityName={t('materialsBoMs.titlePlural', {defaultValue: 'Materials Bills of Material'})}
              />
            );
        }
      };

      return (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sticky top-[calc(var(--header-height,0px)+var(--subheader-height,0px))] bg-background dark:bg-gray-900 py-3 z-10 -mx-1 px-1 md:mx-0 md:px-0 border-b dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
              <Boxes className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-600 dark:text-gray-400`} />
              {t('materialsBoMs.title', {defaultValue: 'Material Bills of Material'})} ({boms?.length || 0})
            </h3>
            <div className="flex items-center gap-2">
                <GlobalActionButton
                    actionsConfig={memoizedGlobalActionsConfig}
                    onEditItems={handleEditWithSelectionCheck}
                    onDeleteItems={handleDeleteWithSelectionCheck}
                    isSelectionModeActive={isSelectionModeActive}
                    onCancelSelectionMode={handleCancelSelectionMode}
                    selectedItemCount={selectedItems.length}
                    itemTypeForActions={t('materialsBoMs.itemTitleSingular', {defaultValue: "Material BoM"})}
                    t={t}
                  />
                <Button variant="outline" size="sm" onClick={refreshBoMs} disabled={loading}>
                  <RefreshCcw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} ${loading ? 'animate-spin' : ''}`} />
                  {t('common.refresh', {defaultValue: 'Refresh'})}
                </Button>
                <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} views={[
                  { id: 'table', label: t('common.table', { defaultValue: 'Table' }) },
                  // { id: 'card', label: t('common.card', { defaultValue: 'Card' }) }, // Add card view if implemented
                ]} />
            </div>
          </div>
          <FilterBar
            filterFields={filterFields}
            filters={filters}
            setFilters={setFilters}
            onSearch={handleSearch}
            isLoading={loading}
          />
          {renderContent()}
          {isDialogOpen && (
            <MaterialsBoMDialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen} // Set to false when dialog wants to close
              bomData={currentItem}
              onSubmit={handleSelfSubmittingDialogClose}
              isLoading={loading} 
              materials={Object.entries(materialsMap).map(([id, name_en])=>({id, name_en}))} 
              procedureCodes={Object.entries(procedureCodesMap).map(([code, name])=>({code, name}))}
            />
          )}
        </div>
      );
    }
