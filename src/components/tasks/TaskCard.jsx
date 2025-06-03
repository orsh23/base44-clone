import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarIcon, Clock, User, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { he, enUS } from 'date-fns/locale';

const getLocaleObject = (languageCode) => (languageCode === 'he' ? he : enUS);

export default function TaskCard({
  task,
  t,
  isRTL,
  language,
  isSelectionModeActive,
  isSelected,
  onToggleSelection,
  onCardClick
}) {
  const currentLocale = getLocaleObject(language);

  if (!task) {
    return (
      <Card className="border-red-500 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
        <CardHeader>
          <CardTitle className="text-red-700 dark:text-red-300 flex items-center">
            <AlertTriangle className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('errors.invalidDataTitle', { defaultValue: 'Invalid Task Data' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600 dark:text-red-400">
            {t('errors.taskDataMissing', { defaultValue: 'Task data could not be loaded or is incomplete.' })}
          </p>
        </CardContent>
      </Card>
    );
  }

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-700/30 dark:text-blue-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700/30 dark:text-yellow-200',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-700/30 dark:text-orange-200',
    urgent: 'bg-red-100 text-red-800 dark:bg-red-700/30 dark:text-red-200'
  };

  const statusColors = {
    todo: 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-200',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-700/30 dark:text-blue-200',
    done: 'bg-green-100 text-green-800 dark:bg-green-700/30 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-700/30 dark:text-red-200'
  };

  const categoryColors = {
    claim_review: 'bg-purple-100 text-purple-800 dark:bg-purple-700/30 dark:text-purple-200',
    provider_onboarding: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-700/30 dark:text-indigo-200',
    contract_negotiation: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-700/30 dark:text-cyan-200',
    compliance_check: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-700/30 dark:text-emerald-200',
    data_validation: 'bg-teal-100 text-teal-800 dark:bg-teal-700/30 dark:text-teal-200',
    system_maintenance: 'bg-slate-100 text-slate-800 dark:bg-slate-700/30 dark:text-slate-200',
    training: 'bg-amber-100 text-amber-800 dark:bg-amber-700/30 dark:text-amber-200',
    general: 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-200'
  };

  const handleCardInteraction = (e) => {
    // Prevent action if clicking on checkbox
    if (e.target.closest('[role="checkbox"]') || e.target.type === 'checkbox') {
      return;
    }

    if (isSelectionModeActive) {
      onToggleSelection(task.id);
    } else {
      onCardClick(task.id);
    }
  };

  const handleCheckboxChange = (checked) => {
    onToggleSelection(task.id);
  };

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md ${
        isSelectionModeActive 
          ? `cursor-pointer ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}` 
          : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
      onClick={handleCardInteraction}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {isSelectionModeActive && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={handleCheckboxChange}
                aria-label={t('bulkActions.selectRow', { defaultValue: 'Select task' })}
                className="mt-1"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                {task.title}
              </CardTitle>
              {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge className={statusColors[task.status] || statusColors.todo}>
            {t(`status.${task.status}`, { defaultValue: task.status })}
          </Badge>
          <Badge className={priorityColors[task.priority] || priorityColors.medium}>
            {t(`priority.${task.priority}`, { defaultValue: task.priority })}
          </Badge>
          <Badge className={categoryColors[task.category] || categoryColors.general}>
            {t(`category.${task.category}`, { defaultValue: task.category })}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          {task.due_date && (
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              <span>{format(new Date(task.due_date), 'MMM d, yyyy', { locale: currentLocale })}</span>
            </div>
          )}
          {task.assigned_to && (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span className="truncate">{task.assigned_to}</span>
            </div>
          )}
          {task.estimated_hours && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{task.estimated_hours}h est.</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}