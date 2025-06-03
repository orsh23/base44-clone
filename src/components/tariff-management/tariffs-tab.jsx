
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguageHook } from '@/components/useLanguageHook';
import { Tariff } from '@/api/entities';
import { Contract } from '@/api/entities';
import { InsuranceCode } from '@/api/entities';
import { Doctor } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, FilterX, FileText, RefreshCw, AlertTriangle, DollarSign, Users, Settings, Briefcase, TagIcon, Coins } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import EmptyState from '@/components/ui/empty-state';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import TariffDialog from './tariff-dialog';
import { useToast } from '@/components/ui/use-toast';
import useEntityModule from '@/lib/hooks/useEntityModule'; // Assuming this path for useEntityModule
import GlobalActionButton from '@/components/GlobalActionButton'; // Assuming this path for GlobalActionButton

// Sample Data
const sampleTariffs = [
  { id: "tariff-1", contract_id: "contract-1", insurance_code: "INS-0001-GEN", doctor_id: null, base_price: 250, currency: "ILS", finalization_type: "Claim", composition: [{ component_type: "Base", pricing_model:"Fixed", amount: 250}], validation_rules: [] },
  { id: "tariff-2", contract_id: "contract-2", insurance_code: "INS-0025-CARDIO", doctor_id: "doctor-1", base_price: 1200, currency: "ILS", finalization_type: "RFC", composition: [{ component_type: "Base", pricing_model:"Fixed", amount: 1000}, {component_type: "DoctorFee", pricing_model:"Fixed", amount: 200}], validation_rules: [{rule_type: "age_limit", rule_value: "18+"}] },
  { id: "tariff-3", contract_id: "contract-1", insurance_code: "INS-0010-ORTHO", doctor_id: "doctor-2", base_price: 800, currency: "USD", finalization_type: "Hybrid", composition: [], validation_rules: [] },
];
const sampleContracts = [
  { id: "contract-1", contract_number: "CTR-2023-001", name_en: "General Services Agreement" },
  { id: "contract-2", contract_number: "CTR-2024-SPECIAL-A", name_en: "Special Cardiology Services" },
];
const sampleInsuranceCodes = [
  { id: "icode-1", code: "INS-0001-GEN", name_en: "General Consultation", name_he: "ייעוץ כללי" },
  { id: "icode-2", code: "INS-0025-CARDIO", name_en: "Cardiology Procedure Package", name_he: "חבילת פרוצדורות קרדיולוגיות" },
  { id: "icode-3", code: "INS-0010-ORTHO", name_en: "Orthopedic Surgery Basic", name_he: "ניתוח אורטופדי בסיסי"},
];
const sampleDoctors = [
  { id: "doctor-1", first_name_en: "Avi", last_name_en: "Cohen", specialties: ["Cardiology"] },
  { id: "doctor-2", first_name_en: "Sara", last_name_en: "Levi", specialties: ["Orthopedics"] },
];

// Cache for auxiliary data
const tariffsApiCache = {
  contracts: { data: null, timestamp: null, loading: false, error: null },
  insuranceCodes: { data: null, timestamp: null, loading: false, error: null },
  doctors: { data: null, timestamp: null, loading: false, error: null },
  expirationTime: 5 * 60 * 1000,
};

const isCacheValid = (cacheKey) => {
  const entry = tariffsApiCache[cacheKey];
  return entry && entry.data && entry.timestamp && (Date.now() - entry.timestamp) < tariffsApiCache.expirationTime;
};
const updateCache = (cacheKey, data, error = null) => {
  if (tariffsApiCache[cacheKey]) tariffsApiCache[cacheKey] = { data, timestamp: Date.now(), loading: false, error };
};
const setCacheLoading = (cacheKey, isLoading) => {
  if (tariffsApiCache[cacheKey]) {
    tariffsApiCache[cacheKey].loading = isLoading;
    if (isLoading) tariffsApiCache[cacheKey].error = null;
  }
};

const finalizationTypeOptions = [
  { value: 'all', labelKey: 'filters.allFinalizationTypes', defaultValue: 'All Finalization Types' },
  { value: 'RFC', labelKey: 'finalizationTypes.rfc', defaultValue: 'RFC' },
  { value: 'Claim', labelKey: 'finalizationTypes.claim', defaultValue: 'Claim' },
  { value: 'Hybrid', labelKey: 'finalizationTypes.hybrid', defaultValue: 'Hybrid' },
];

export default function TariffsTab({ globalActionsConfig: externalActionsConfig, currentView: passedView }) {
  const { t, language, isRTL } = useLanguageHook();
  const { toast } = useToast();

  const [allContracts, setAllContracts] = useState([]);
  const [allInsuranceCodes, setAllInsuranceCodes] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);

  // Auxiliary data fetching (Contracts, Insurance Codes, Doctors)
  const fetchAuxiliaryData = useCallback(async (forceRefresh = false) => {
    const fetchWithCache = async (cacheKey, apiCall, setData, entityName, sampleDataFallback) => {
      if (!forceRefresh && isCacheValid(cacheKey) && tariffsApiCache[cacheKey].data) {
        setData(tariffsApiCache[cacheKey].data); return;
      }
      if (tariffsApiCache[cacheKey].loading && !forceRefresh) return;
      setCacheLoading(cacheKey, true);
      try {
        let data;
        try { data = await apiCall(); }
        catch (apiError) {
          console.warn(`API call failed for ${entityName}, using sample data:`, apiError);
          data = sampleDataFallback;
        }
        const validData = Array.isArray(data) ? data : [];
        setData(validData); updateCache(cacheKey, validData);
      } catch (err) {
        console.error(`Error fetching ${entityName}:`, err);
        setData(sampleDataFallback); updateCache(cacheKey, sampleDataFallback, `Using sample data for ${entityName}`);
      } finally {
        setCacheLoading(cacheKey, false);
      }
    };

    await Promise.all([
      fetchWithCache('contracts', () => Contract.list(), setAllContracts, 'Contracts', sampleContracts),
      fetchWithCache('insuranceCodes', () => InsuranceCode.list(), setAllInsuranceCodes, 'Insurance Codes', sampleInsuranceCodes),
      fetchWithCache('doctors', () => Doctor.list(), setAllDoctors, 'Doctors', sampleDoctors),
    ]);
  }, []);

  useEffect(() => {
    fetchAuxiliaryData();
  }, [fetchAuxiliaryData]);

  const entityConfig = useMemo(() => ({
    entitySDK: Tariff,
    entityName: t('tariffs.itemTitleSingular', { defaultValue: 'Tariff' }),
    entityNamePlural: t('tariffs.itemTitlePlural', { defaultValue: 'Tariffs' }),
    DialogComponent: TariffDialog,
    FormComponent: null,
    initialFilters: {
      searchTerm: '',
      contractId: 'all',
      insuranceCode: 'all',
      doctorId: 'all',
      finalizationType: 'all',
      page: 1,
      pageSize: 10,
    },
    filterFunction: (tariff, filters) => {
        const searchTermLower = filters.searchTerm.toLowerCase();
        const contract = allContracts.find(c => c.id === tariff.contract_id);
        const insCode = allInsuranceCodes.find(ic => ic.code === tariff.insurance_code);
        const doctor = allDoctors.find(d => d.id === tariff.doctor_id);

        const matchesSearch = !filters.searchTerm ||
            (contract && contract.contract_number.toLowerCase().includes(searchTermLower)) ||
            (contract && contract.name_en?.toLowerCase().includes(searchTermLower)) ||
            (contract && contract.name_he?.toLowerCase().includes(searchTermLower)) ||
            (insCode && insCode.code.toLowerCase().includes(searchTermLower)) ||
            (insCode && insCode.name_en?.toLowerCase().includes(searchTermLower)) ||
            (insCode && insCode.name_he?.toLowerCase().includes(searchTermLower)) ||
            (doctor && `${doctor.first_name_en} ${doctor.last_name_en}`.toLowerCase().includes(searchTermLower)) ||
            (doctor && `${doctor.first_name_he} ${doctor.last_name_he}`.toLowerCase().includes(searchTermLower)) ||
            (tariff.base_price?.toString().includes(searchTermLower));

        const matchesContract = filters.contractId === 'all' || tariff.contract_id === filters.contractId;
        const matchesInsuranceCode = filters.insuranceCode === 'all' || tariff.insurance_code === filters.insuranceCode;
        const matchesDoctor = filters.doctorId === 'all' || tariff.doctor_id === filters.doctorId || (filters.doctorId === 'none' && !tariff.doctor_id);
        const matchesFinalization = filters.finalizationType === 'all' || tariff.finalization_type === filters.finalizationType;

        return matchesSearch && matchesContract && matchesInsuranceCode && matchesDoctor && matchesFinalization;
    },
    storageKey: 'tariffsView',
    defaultSort: { key: 'insurance_code', direction: 'asc' },
  }), [t, allContracts, allInsuranceCodes, allDoctors]);

  const {
    items: filteredAndSortedItems,
    loading, error, filters, setFilters,
    selectedItems, setSelectedItems, isDialogOpen, setIsDialogOpen, currentItem, setCurrentItem,
    handleRefresh: refreshTariffs, handleFilterChange,
    handleAddNew, handleEdit, handleDelete,
    handleBulkDelete, isSelectionModeActive, setIsSelectionModeActive,
    handleToggleSelection, handleSelectAll, handleSelfSubmittingDialogClose,
  } = useEntityModule(entityConfig);

  const getContractDisplay = useCallback((contractId) => {
    const contract = allContracts.find(c => c.id === contractId);
    return contract ? `${contract.contract_number} (${language === 'he' && contract.name_he ? contract.name_he : contract.name_en || ''})` : t('common.unknownContract');
  }, [allContracts, language, t]);

  const getInsuranceCodeDisplay = useCallback((codeValue) => {
    const insCode = allInsuranceCodes.find(ic => ic.code === codeValue);
    return insCode ? `${insCode.code} (${language === 'he' && insCode.name_he ? insCode.name_he : insCode.name_en || ''})` : codeValue || t('common.unknownCode');
  }, [allInsuranceCodes, language, t]);

  const getDoctorName = useCallback((doctorId) => {
    const doctor = allDoctors.find(d => d.id === doctorId);
    if (!doctor) return t('common.notApplicable');
    const firstName = language === 'he' && doctor.first_name_he ? doctor.first_name_he : doctor.first_name_en;
    const lastName = language === 'he' && doctor.last_name_he ? doctor.last_name_he : doctor.last_name_en;
    return `${firstName || ''} ${lastName || ''}`.trim() || t('common.unknownDoctor');
  }, [allDoctors, language, t]);

  const contractOptions = [{ value: 'all', label: t('filters.allContracts', {defaultValue: 'All Contracts'}) }, ...allContracts.map(c => ({ value: c.id, label: `${c.contract_number} (${language === 'he' && c.name_he ? c.name_he : c.name_en})` }))];
  const insuranceCodeOptions = [{ value: 'all', label: t('filters.allInsuranceCodes', {defaultValue: 'All Insurance Codes'}) }, ...allInsuranceCodes.map(ic => ({ value: ic.code, label: `${ic.code} (${language === 'he' && ic.name_he ? ic.name_he : ic.name_en})` }))];
  const doctorOptions = [{ value: 'all', label: t('filters.allDoctors', {defaultValue: 'All Doctors'}) }, ...allDoctors.map(d => ({ value: d.id, label: `${language === 'he' && d.first_name_he ? d.first_name_he : d.first_name_en} ${language === 'he' && d.last_name_he ? d.last_name_he : d.last_name_en}`.trim() }))];

  const getCompositionSummary = (composition) => {
    if (!Array.isArray(composition) || composition.length === 0) return t('common.notSet');
    return t('tariffs.compositionComponents', { count: composition.length, defaultValue: `${composition.length} components`});
  };

  const getValidationSummary = (rules) => {
    if (!Array.isArray(rules) || rules.length === 0) return t('common.noRules');
    return t('tariffs.validationRulesCount', { count: rules.length, defaultValue: `${rules.length} rules`});
  };

  const memoizedGlobalActionsConfig = useMemo(() => [
    { labelKey: 'tariffs.addTariff', defaultLabel: 'Add Tariff', icon: Plus, action: handleAddNew, type: 'add'},
    ...(externalActionsConfig || [])
  ], [handleAddNew, externalActionsConfig, t]);

  const handleEditWithSelectionCheck = useCallback(() => {
    if (selectedItems.length === 1) {
      handleEdit(selectedItems[0]);
      setIsSelectionModeActive(false);
      setSelectedItems([]);
    } else if (selectedItems.length > 1) {
      toast({
        title: t('common.error'),
        description: t('messages.selectOneItemToEdit'),
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('common.error'),
        description: t('messages.noItemsSelectedForEdit'),
        variant: 'destructive',
      });
    }
  }, [selectedItems, handleEdit, setIsSelectionModeActive, setSelectedItems, t, toast]);

  const handleDeleteWithSelectionCheck = useCallback(() => {
    if (selectedItems.length > 0) {
      handleBulkDelete();
    } else {
      toast({
        title: t('common.error'),
        description: t('messages.noItemsSelectedForDelete'),
        variant: 'destructive',
      });
    }
    setIsSelectionModeActive(false);
    setSelectedItems([]);
  }, [selectedItems, handleBulkDelete, setIsSelectionModeActive, setSelectedItems, t, toast]);

  const handleCancelSelectionMode = useCallback(() => {
    setIsSelectionModeActive(false);
    setSelectedItems([]);
  }, [setIsSelectionModeActive, setSelectedItems]);

  if (loading && filteredAndSortedItems.length === 0) {
    return <LoadingSpinner className="mt-20" message={t('messages.loadingData', { item: t('pageTitles.tariffs', { defaultValue: 'Tariffs'}) })} />;
  }
  if (error && filteredAndSortedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-700 mb-2">{t('errors.dataLoadErrorTitle', { defaultValue: 'Error Loading Data' })}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <Button onClick={() => refreshTariffs(true)} variant="outline" className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" /> {t('buttons.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sticky top-[var(--subheader-height,0px)] bg-background dark:bg-gray-900 py-3 z-10 -mx-1 px-1 md:mx-0 md:px-0 border-b dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <Coins className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-600 dark:text-gray-400`} />
          {t('pageTitles.tariffManagement', { defaultValue: 'Tariff Management' })} ({filteredAndSortedItems?.length || 0})
        </h3>
        <div className="flex items-center gap-2">
            <GlobalActionButton
                actionsConfig={memoizedGlobalActionsConfig}
                onEditItems={handleEditWithSelectionCheck}
                onDeleteItems={handleDeleteWithSelectionCheck}
                isSelectionModeActive={isSelectionModeActive}
                onCancelSelectionMode={handleCancelSelectionMode}
                selectedItemCount={selectedItems.length}
                itemTypeForActions={t('tariffs.itemTitleSingular', { defaultValue: 'Tariff' })}
                t={t}
              />
            <Button onClick={() => refreshTariffs(true)} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} ${loading ? 'animate-spin' : ''}`} />{t('buttons.refresh')}
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>{t('tariffs.filtersTitle', {defaultValue: 'Filter Tariffs'})}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
            <Input
              placeholder={t('search.placeholderTariffs', {defaultValue: 'Search tariffs...'})}
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="lg:col-span-1 xl:col-span-1"
            />
            <Select value={filters.contractId} onValueChange={(value) => handleFilterChange('contractId', value)}>
              <SelectTrigger><SelectValue placeholder={t('filters.selectContract')}/></SelectTrigger>
              <SelectContent>{contractOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filters.insuranceCode} onValueChange={(value) => handleFilterChange('insuranceCode', value)}>
              <SelectTrigger><SelectValue placeholder={t('filters.selectInsuranceCode')}/></SelectTrigger>
              <SelectContent>{insuranceCodeOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
            </Select>
             <Select value={filters.doctorId} onValueChange={(value) => handleFilterChange('doctorId', value)}>
              <SelectTrigger><SelectValue placeholder={t('filters.selectDoctor')}/></SelectTrigger>
              <SelectContent>
                {doctorOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                <SelectItem value="none">{t('common.notApplicableShort', {defaultValue: 'N/A'})}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.finalizationType} onValueChange={(value) => handleFilterChange('finalizationType', value)}>
              <SelectTrigger><SelectValue placeholder={t('filters.selectFinalizationType')}/></SelectTrigger>
              <SelectContent>{finalizationTypeOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{t(opt.labelKey, {defaultValue: opt.defaultValue})}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2 rtl:space-x-reverse">
            <Button variant="outline" onClick={() => setFilters(entityConfig.initialFilters)}><FilterX className="h-4 w-4 mr-2 rtl:ml-2" />{t('buttons.resetFilters')}</Button>
          </div>
        </CardContent>
      </Card>

      {loading && filteredAndSortedItems.length > 0 && <LoadingSpinner message={t('messages.updatingData', { item: t('pageTitles.tariffs') })} />}

      {!loading && filteredAndSortedItems.length === 0 ? (
        <EmptyState icon={FileText} title={t('tariffs.noTariffsMatchFilters', {defaultValue: 'No Tariffs Match Filters'})} description={t('tariffs.tryAdjustingFiltersOrAdd', {defaultValue:'Try adjusting filters or add a new tariff.'})} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedItems.map(tariff => (
            <Card key={tariff.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-semibold truncate" title={getInsuranceCodeDisplay(tariff.insurance_code)}>
                    {getInsuranceCodeDisplay(tariff.insurance_code)}
                  </CardTitle>
                  <Badge variant="secondary">{tariff.currency} {tariff.base_price?.toFixed(2)}</Badge>
                </div>
                <CardDescription className="text-xs text-gray-500 truncate" title={getContractDisplay(tariff.contract_id)}>
                  <Briefcase className="inline-block h-3 w-3 mr-1 rtl:ml-1" /> {getContractDisplay(tariff.contract_id)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-1.5 text-sm">
                <div className="flex items-center text-xs text-gray-600">
                  <Users className="h-3.5 w-3.5 mr-1.5 rtl:ml-1.5 text-gray-400" />
                  <strong>{t('fields.doctor', {defaultValue:'Doctor'})}:</strong> <span className="ml-1 rtl:mr-1 truncate">{getDoctorName(tariff.doctor_id)}</span>
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <Settings className="h-3.5 w-3.5 mr-1.5 rtl:ml-1.5 text-gray-400" />
                  <strong>{t('fields.finalizationType', {defaultValue:'Finalization'})}:</strong> <span className="ml-1 rtl:mr-1">{tariff.finalization_type}</span>
                </div>
                <div className="flex items-center text-xs text-gray-600">
                    <TagIcon className="h-3.5 w-3.5 mr-1.5 rtl:ml-1.5 text-gray-400" />
                    <strong>{t('fields.composition', {defaultValue:'Composition'})}:</strong> <span className="ml-1 rtl:mr-1">{getCompositionSummary(tariff.composition)}</span>
                </div>
                 <div className="flex items-center text-xs text-gray-600">
                    <TagIcon className="h-3.5 w-3.5 mr-1.5 rtl:ml-1.5 text-gray-400" />
                    <strong>{t('fields.validationRules', {defaultValue:'Validation'})}:</strong> <span className="ml-1 rtl:mr-1">{getValidationSummary(tariff.validation_rules)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isDialogOpen && (
        <TariffDialog
          isOpen={isDialogOpen}
          onClose={handleSelfSubmittingDialogClose}
          tariff={currentItem}
          onSaveSuccess={refreshTariffs}
          t={t}
        />
      )}
    </div>
  );
}
