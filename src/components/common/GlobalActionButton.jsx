import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, AlertTriangle } from 'lucide-react';

export default function GlobalActionButton({
  actionsConfig = [], 
  onStartSelectionMode, // New prop: (mode: 'edit' | 'delete') => void
  itemTypeForActions, // e.g., "Provider"
  t,
  isRTL
}) {
  if (!actionsConfig || actionsConfig.length === 0) {
    return null;
  }

  return (
    <DropdownMenu dir={isRTL ? 'rtl' : 'ltr'}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-1.5 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
          {t('common.actions', { defaultValue: 'Actions' })}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isRTL ? "start" : "end"} className="dark:bg-gray-800 dark:border-gray-700 w-56">
        {actionsConfig.map((action, index) => {
          if (action.isSeparator) {
            return <DropdownMenuSeparator key={`sep-${index}`} className="dark:bg-gray-700" />;
          }

          const Icon = action.icon || AlertTriangle;
          const label = t(action.labelKey, { defaultValue: action.defaultLabel || 'Unnamed Action' });
          
          const handleActionClick = () => {
            if ((action.type === 'edit' || action.type === 'delete') && onStartSelectionMode) {
              onStartSelectionMode(action.type);
            } else if (action.action) {
              action.action();
            } else {
              console.warn('No action defined for:', label);
            }
          };

          return (
            <DropdownMenuItem
              key={action.labelKey || `action-${index}`}
              onClick={handleActionClick}
              disabled={action.disabled}
              className="flex items-center gap-2 text-sm cursor-pointer dark:text-gray-200 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
            >
              <Icon className={`h-4 w-4 ${action.type === 'delete' ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`} />
              <span>{label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}