import React from 'react';
import { cn } from '@/components/utils/cn';
import { Button } from '@/components/ui/button';
import { useLanguageHook } from '@/components/useLanguageHook';

/**
 * Unified EmptyState component
 * @param {React.ComponentType} [icon] - Icon component to display
 * @param {string} title - Main title text
 * @param {string} [description] - Description text
 * @param {React.ReactNode} [actionButton] - Action button or custom content
 * @param {string} [className] - Additional CSS classes
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionButton,
  className
}) {
  const { isRTL } = useLanguageHook();

  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      isRTL && 'text-right',
      className
    )}>
      {Icon && (
        <div className="mb-4 p-3 rounded-full bg-muted">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {description}
        </p>
      )}
      {actionButton}
    </div>
  );
}