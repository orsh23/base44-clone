import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useLanguageHook } from '@/components/useLanguageHook';
import { cn } from '@/components/utils/cn';

/**
 * Unified ConfirmationDialog component
 * @param {boolean} open - Whether dialog is open
 * @param {function} onOpenChange - Dialog open state handler
 * @param {function} onConfirm - Confirmation handler
 * @param {string} [title] - Dialog title
 * @param {string} [description] - Dialog description
 * @param {string} [confirmText] - Confirm button text
 * @param {string} [cancelText] - Cancel button text
 * @param {boolean} [isDestructive] - Whether action is destructive
 * @param {boolean} [loading] - Loading state
 */
export default function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  isDestructive = false,
  loading = false
}) {
  const { t, isRTL } = useLanguageHook();

  const defaultTitle = title || t('common.confirmAction', { defaultValue: 'Confirm Action' });
  const defaultDescription = description || t('common.confirmActionDescription', { 
    defaultValue: 'This action cannot be undone. Are you sure you want to continue?' 
  });
  const defaultConfirmText = confirmText || (isDestructive ? 
    t('buttons.delete', { defaultValue: 'Delete' }) : 
    t('buttons.confirm', { defaultValue: 'Confirm' })
  );
  const defaultCancelText = cancelText || t('buttons.cancel', { defaultValue: 'Cancel' });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={cn(isRTL && 'text-right')}>
        <AlertDialogHeader>
          <AlertDialogTitle className={cn(isRTL && 'text-right')}>
            {defaultTitle}
          </AlertDialogTitle>
          <AlertDialogDescription className={cn(isRTL && 'text-right')}>
            {defaultDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={cn(isRTL && 'flex-row-reverse space-x-reverse')}>
          <AlertDialogCancel disabled={loading}>
            {defaultCancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              isDestructive && 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
            )}
          >
            {defaultConfirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}