import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserCircle, Phone, Mail, Briefcase, CalendarDays, MapPin, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from '@/components/utils/cn';

export default function DoctorCard({
  doctor,
  currentLocale,
  t, isRTL, language,
  isSelectionModeActive, // To control checkbox visibility
  isSelected,
  onToggleSelection, // To handle selection
  onCardClick // To handle click for details view when not in selection mode
}) {
  if (!doctor) {
    return (
      <Card className="border-red-500 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
        <CardHeader>
          <CardTitle className="text-red-700 dark:text-red-300 flex items-center">
            <AlertTriangle className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('errors.invalidDataTitle', { defaultValue: 'Invalid Doctor Data' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600 dark:text-red-400">
            {t('errors.doctorDataMissing', { defaultValue: 'Doctor data could not be loaded or is incomplete.' })}
          </p>
        </CardContent>
      </Card>
    );
  }

  const getLocalizedDoctorName = (doc) => {
    if (!doc) return t('common.unknownDoctor');
    const langToUse = language || t('common.langCode', {defaultValue: 'en'});
    const fName = langToUse === 'he' ? doc.first_name_he : doc.first_name_en;
    const lName = langToUse === 'he' ? doc.last_name_he : doc.last_name_en;
    const altFName = langToUse === 'he' ? doc.first_name_en : doc.first_name_he;
    const altLName = langToUse === 'he' ? doc.last_name_en : doc.last_name_he;
    return `${fName || altFName || ''} ${lName || altLName || ''}`.trim() || t('common.unknownDoctor');
  };
  
  const doctorName = getLocalizedDoctorName(doctor);

  const lastUpdated = doctor.updated_date && isValid(parseISO(doctor.updated_date))
    ? formatDistanceToNow(parseISO(doctor.updated_date), { addSuffix: true, locale: currentLocale })
    : t('common.unknown', { defaultValue: 'Unknown' });
  
  const handleCardInteraction = (e) => {
    if (e.target.closest('[data-no-card-click="true"]')) return;

    if (isSelectionModeActive) {
      onToggleSelection?.(doctor.id);
    } else {
      onCardClick?.(doctor.id);
    }
  };

  const specialtiesDisplay = Array.isArray(doctor.specialties) && doctor.specialties.length > 0
    ? doctor.specialties.map(s => t(`doctorSpecialties.${s.replace(/\s+/g, '_')}`, {defaultValue: s})).join(', ')
    : t('common.notSet', { defaultValue: 'N/A' });

  return (
    <Card
      className={cn(
        "relative transition-all duration-200 ease-in-out hover:shadow-lg dark:bg-gray-800 dark:border-gray-700 group",
        isSelected && isSelectionModeActive ? 'ring-2 ring-blue-500 dark:ring-blue-400 shadow-blue-200 dark:shadow-blue-900/50' : 'border-gray-200 dark:border-gray-600',
        (onCardClick || (isSelectionModeActive && onToggleSelection)) ? 'cursor-pointer' : ''
      )}
      onClick={handleCardInteraction}
      aria-selected={isSelectionModeActive && isSelected}
    >
      {isSelectionModeActive && onToggleSelection && (
        <div data-no-card-click="true" className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} z-10 p-1 bg-background/70 dark:bg-gray-900/70 rounded-full`}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelection(doctor.id)}
            aria-label={t('bulkActions.selectItem', { item: doctorName, defaultValue: `Select ${doctorName}` })}
            className="h-5 w-5 border-gray-400 dark:border-gray-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
                <UserCircle className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                <div>
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {doctorName}
                    </CardTitle>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('doctors.fields.licenseNumber')}: {doctor.license_number || t('common.notSet')}
                    </p>
                </div>
            </div>
             <Badge variant={doctor.status === 'active' ? 'default' : 'outline'} 
                className={cn(
                    "text-xs capitalize", 
                    doctor.status === 'active' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-700/30 dark:text-green-200 dark:border-green-600' 
                                           : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700/30 dark:text-gray-300 dark:border-gray-600'
                )}>
                {t(`status.${doctor.status}`, {defaultValue: doctor.status})}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5 text-sm">
        <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
          <Briefcase className="h-4 w-4 mt-0.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <span className="truncate" title={specialtiesDisplay}>{specialtiesDisplay}</span>
        </div>
        {doctor.city && (
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <span>{doctor.city}</span>
          </div>
        )}
        {doctor.phone && (
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <span>{doctor.phone}</span>
          </div>
        )}
        {doctor.email && (
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <span className="truncate" title={doctor.email}>{doctor.email}</span>
          </div>
        )}
         <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700/50 mt-3">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>{t('common.lastUpdated', { defaultValue: 'Updated' })}: {lastUpdated}</span>
        </div>
      </CardContent>
    </Card>
  );
}