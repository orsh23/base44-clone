import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Using Tabs for a segmented control look
import { LayoutGrid, List } from 'lucide-react';
import { useLanguageHook } from '@/components/useLanguageHook';

const ViewSwitcher = ({ availableViews = ['card', 'table'], currentView, onViewChange, entityName }) => {
  const { t } = useLanguageHook();

  const viewIcons = {
    card: LayoutGrid,
    table: List,
    // grid: GridIcon, // If you add a third 'grid' view distinct from 'card'
  };
  
  const viewLabels = {
    card: t('viewSwitcher.cardView', { defaultValue: 'Card View' }),
    table: t('viewSwitcher.tableView', { defaultValue: 'Table View' }),
  };

  const handleViewChange = (value) => {
    if (entityName) {
      try {
        localStorage.setItem(`${entityName}_view_preference`, value);
      } catch (e) {
        console.warn("Could not save view preference to localStorage", e);
      }
    }
    onViewChange(value);
  };

  return (
    <Tabs value={currentView} onValueChange={handleViewChange} className="w-auto">
      <TabsList className="h-9">
        {availableViews.map((view) => {
          const Icon = viewIcons[view];
          return (
            <TabsTrigger key={view} value={view} className="h-7 px-2 py-1 text-xs">
              {Icon && <Icon className="h-4 w-4 mr-1.5" />}
              {viewLabels[view] || view.charAt(0).toUpperCase() + view.slice(1)}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
};

export default ViewSwitcher;