import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, X, ArrowUpNarrowWide, ArrowDownWideNarrow } from 'lucide-react';
import FilterBarCard from '@/components/common/FilterBarCard';
import SearchInput from '@/components/common/SearchInput';
import SimpleSelect from '@/components/common/SimpleSelect';
import { Label } from '@/components/ui/label';

export default function TaskFilterBar({
  filters,
  onFiltersChange,
  onResetFilters,
  sortConfig,
  onSortChange,
  allTasks,
  t, language, isRTL,
  currentView
}) {

  const statusOptions = useMemo(() => [
    { value: 'all', label: t('filters.allStatuses', { defaultValue: 'All Statuses' }) },
    { value: 'todo', label: t('status.todo', { defaultValue: 'Todo' }) },
    { value: 'in_progress', label: t('status.in_progress', { defaultValue: 'In Progress' }) },
    { value: 'done', label: t('status.done', { defaultValue: 'Done' }) },
    { value: 'cancelled', label: t('status.cancelled', { defaultValue: 'Cancelled' }) },
  ], [t]);

  const priorityOptions = useMemo(() => [
    { value: 'all', label: t('filters.allPriorities', { defaultValue: 'All Priorities' }) },
    { value: 'low', label: t('priority.low', { defaultValue: 'Low' }) },
    { value: 'medium', label: t('priority.medium', { defaultValue: 'Medium' }) },
    { value: 'high', label: t('priority.high', { defaultValue: 'High' }) },
    { value: 'urgent', label: t('priority.urgent', { defaultValue: 'Urgent' }) },
  ], [t]);

  const categoryOptions = useMemo(() => [
    { value: 'all', label: t('filters.allCategories', { defaultValue: 'All Categories' }) },
    { value: 'claim_review', label: t('category.claim_review', { defaultValue: 'Claim Review' }) },
    { value: 'provider_onboarding', label: t('category.provider_onboarding', { defaultValue: 'Provider Onboarding' }) },
    { value: 'contract_negotiation', label: t('category.contract_negotiation', { defaultValue: 'Contract Negotiation' }) },
    { value: 'compliance_check', label: t('category.compliance_check', { defaultValue: 'Compliance Check' }) },
    { value: 'data_validation', label: t('category.data_validation', { defaultValue: 'Data Validation' }) },
    { value: 'system_maintenance', label: t('category.system_maintenance', { defaultValue: 'System Maintenance' }) },
    { value: 'training', label: t('category.training', { defaultValue: 'Training' }) },
    { value: 'general', label: t('category.general', { defaultValue: 'General' }) },
  ], [t]);

  const sortableFields = useMemo(() => [
    { key: 'title', label: t('tasks.fields.title', {defaultValue: 'Title'}) },
    { key: 'status', label: t('common.status', {defaultValue: 'Status'}) },
    { key: 'priority', label: t('tasks.fields.priority', {defaultValue: 'Priority'}) },
    { key: 'category', label: t('tasks.fields.category', {defaultValue: 'Category'}) },
    { key: 'due_date', label: t('tasks.fields.dueDate', {defaultValue: 'Due Date'}) },
    { key: 'created_date', label: t('common.created', {defaultValue: 'Created'}) },
  ], [t]);

  const SortIcon = sortConfig.direction === 'ascending' ? ArrowUpNarrowWide : ArrowDownWideNarrow;

  return (
    <FilterBarCard
      title={t('common.filtersAndSort', {defaultValue: 'Filters & Sort'})}
      onResetFilters={onResetFilters}
      t={t} isRTL={isRTL}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
        <div>
          <Label htmlFor="taskSearchTerm" className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {t('common.search', {defaultValue: "Search"})}:
          </Label>
          <SearchInput
            id="taskSearchTerm"
            value={filters.searchTerm}
            onChange={(e) => onFiltersChange({searchTerm: e.target.value})}
            placeholder={t('tasks.searchPlaceholder', {defaultValue: "Search tasks..."})}
            aria-label={t('tasks.searchPlaceholder', {defaultValue: "Search tasks by title or description"})}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="taskStatusFilter" className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {t('common.status', {defaultValue: "Status"})}:
          </Label>
          <SimpleSelect
            id="taskStatusFilter"
            value={filters.status}
            onValueChange={(value) => onFiltersChange({status: value})}
            options={statusOptions}
            placeholder={t('filters.selectStatus', {defaultValue: "Select Status"})}
            aria-label={t('filters.selectStatus', {defaultValue: "Filter by status"})}
            className="mt-1 w-full"
          />
        </div>
        <div>
          <Label htmlFor="taskPriorityFilter" className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {t('tasks.fields.priority', {defaultValue: "Priority"})}:
          </Label>
          <SimpleSelect
            id="taskPriorityFilter"
            value={filters.priority}
            onValueChange={(value) => onFiltersChange({priority: value})}
            options={priorityOptions}
            placeholder={t('filters.selectPriority', {defaultValue: "Select Priority"})}
            aria-label={t('filters.selectPriority', {defaultValue: "Filter by priority"})}
            className="mt-1 w-full"
          />
        </div>
        <div>
          <Label htmlFor="taskCategoryFilter" className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {t('tasks.fields.category', {defaultValue: "Category"})}:
          </Label>
          <SimpleSelect
            id="taskCategoryFilter"
            value={filters.category}
            onValueChange={(value) => onFiltersChange({category: value})}
            options={categoryOptions}
            placeholder={t('filters.selectCategory', {defaultValue: "Select Category"})}
            aria-label={t('filters.selectCategory', {defaultValue: "Filter by category"})}
            className="mt-1 w-full"
          />
        </div>

        {/* Sort controls - only show in card view */}
        {currentView !== 'table' && (
          <div>
            <Label htmlFor="taskSortSelect" className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {t('common.sortBy', {defaultValue: "Sort By"})}:
            </Label>
            <div className="flex items-center gap-1 mt-1">
              <SimpleSelect
                id="taskSortSelect"
                value={sortConfig.key}
                onValueChange={(value) => onSortChange(value)}
                options={sortableFields}
                placeholder={t('common.sortBy', {defaultValue: "Sort By"})}
                aria-label={t('common.sortBy', {defaultValue: "Sort by field"})}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSortChange(sortConfig.key)} // Toggle direction
                className="p-2"
                aria-label={t('common.toggleSortDirection', {defaultValue: "Toggle sort direction"})}
              >
                <SortIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </FilterBarCard>
  );
}