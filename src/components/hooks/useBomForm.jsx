// Content of components/hooks/useBomForm.js
// This file was named useBoMForm.js in previous thoughts, using useBomForm.js as per actual file listing if different
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BillOfMaterial } from '@/api/entities';
import { useToast } from '@/components/ui/use-toast';
import { useLanguageHook } from '@/components/useLanguageHook';

const getBoMSchema = (t) => z.object({
  insurance_code_id: z.string().min(1, { message: t('validation.requiredField', { fieldName: t('fields.insuranceCode', { defaultValue: 'Insurance Code' }) }) }),
  material_id: z.string().min(1, { message: t('validation.requiredField', { fieldName: t('fields.material', { defaultValue: 'Material' }) }) }),
  variant_id: z.string().optional().nullable(),
  variant_label: z.string().optional().nullable(),
  variant_code: z.string().optional().nullable(),
  quantity_type: z.enum(['fixed', 'range', 'average']).default('fixed'),
  quantity_min: z.number().optional().nullable(),
  quantity_max: z.number().optional().nullable(),
  quantity_avg: z.number().optional().nullable(),
  quantity_fixed: z.number().min(0.001, { message: t('validation.positiveNumber', {fieldName: 'Quantity Fixed'}) }).default(1),
  quantity_unit: z.enum(['item', 'mg', 'ml', 'g', 'kg', 'box', 'pack']).default('item'),
  usage_type: z.enum(['required', 'optional', 'rare', 'conditional']).default('required'),
  usage_probability: z.number().min(0).max(100).default(100).optional().nullable(),
  reimbursable_flag: z.boolean().default(true),
  price_source_type: z.enum(['default', 'lowest', 'manual', 'range']).default('default'),
  price_manual: z.number().optional().nullable(),
  price_min: z.number().optional().nullable(),
  price_max: z.number().optional().nullable(),
  default_supplier_id: z.string().optional().nullable(),
  default_manufacturer_id: z.string().optional().nullable(),
  max_covered_price: z.number().optional().nullable(),
  currency: z.string().default('ILS'),
  notes: z.string().max(500, { message: t('validation.maxLength', { fieldName: t('fields.notes'), maxLength: 500 }) }).optional().nullable(),
});


export function useBoMForm(defaultValues, onSubmitSuccess) {
  const { t } = useLanguageHook();
  const { toast } = useToast();
  const bomSchema = getBoMSchema(t);

  const form = useForm({
    resolver: zodResolver(bomSchema),
    defaultValues: defaultValues || {
      quantity_type: 'fixed',
      quantity_fixed: 1,
      quantity_unit: 'item',
      usage_type: 'required',
      usage_probability: 100,
      reimbursable_flag: true,
      price_source_type: 'default',
      currency: 'ILS',
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      let result;
      const dataToSave = { ...data };
      // Ensure numbers are numbers
      ['quantity_min', 'quantity_max', 'quantity_avg', 'quantity_fixed', 'usage_probability', 'price_manual', 'price_min', 'price_max', 'max_covered_price'].forEach(key => {
        if (dataToSave[key] === '' || dataToSave[key] === null || dataToSave[key] === undefined) {
          dataToSave[key] = null; // Explicitly null for empty optional numbers
        } else if (typeof dataToSave[key] === 'string') {
          const num = parseFloat(dataToSave[key]);
          dataToSave[key] = isNaN(num) ? null : num;
        }
      });
      
      if (defaultValues?.id) {
        result = await BillOfMaterial.update(defaultValues.id, dataToSave);
        toast({ title: t('boms.updateSuccessTitle'), description: t('boms.updateSuccessDetail', { id: defaultValues.id }) });
      } else {
        result = await BillOfMaterial.create(dataToSave);
        toast({ title: t('boms.createSuccessTitle'), description: t('boms.createSuccessDetail', { id: result.id }) });
      }
      if (onSubmitSuccess) onSubmitSuccess(result);
      return result;
    } catch (error) {
      console.error("Error saving BoM:", error);
      toast({
        title: t('common.saveErrorTitle'),
        description: error.message || t('common.saveErrorDetail', { entity: t('boms.entityNameSingular') }),
        variant: 'destructive',
      });
      throw error; // Re-throw to indicate submission failure
    }
  });

  return { form, handleSubmit, isLoading: form.formState.isSubmitting };
}
