
// Provider-related constants
export const PROVIDER_TYPES = [
    { value: 'hospital', labelKey: 'providers.types.hospital', defaultValue: 'Hospital' },
    { value: 'clinic', labelKey: 'providers.types.clinic', defaultValue: 'Clinic' },
    { value: 'imaging_center', labelKey: 'providers.types.imaging_center', defaultValue: 'Imaging Center' },
    { value: 'laboratory', labelKey: 'providers.types.laboratory', defaultValue: 'Laboratory' },
    { value: 'other', labelKey: 'providers.types.other', defaultValue: 'Other' }
];

export const PROVIDER_LEGAL_TYPES = [
    { value: 'company', labelKey: 'providers.legalTypes.company', defaultValue: 'Company' },
    { value: 'licensed_dealer', labelKey: 'providers.legalTypes.licensed_dealer', defaultValue: 'Licensed Dealer' },
    { value: 'registered_association', labelKey: 'providers.legalTypes.registered_association', defaultValue: 'Registered Association' }
];

export const PROVIDER_STATUSES = [
    { value: 'active', labelKey: 'common.status.active', defaultValue: 'Active' },
    { value: 'inactive', labelKey: 'common.status.inactive', defaultValue: 'Inactive' }
];

// Doctor-related constants
export const DOCTOR_SPECIALTIES = [
    { value: 'general_practice', labelKey: 'doctors.specialties.general_practice', defaultValue: 'General Practice' },
    { value: 'cardiology', labelKey: 'doctors.specialties.cardiology', defaultValue: 'Cardiology' },
    { value: 'dermatology', labelKey: 'doctors.specialties.dermatology', defaultValue: 'Dermatology' },
    { value: 'endocrinology', labelKey: 'doctors.specialties.endocrinology', defaultValue: 'Endocrinology' },
    { value: 'gastroenterology', labelKey: 'doctors.specialties.gastroenterology', defaultValue: 'Gastroenterology' },
    { value: 'neurology', labelKey: 'doctors.specialties.neurology', defaultValue: 'Neurology' },
    { value: 'oncology', labelKey: 'doctors.specialties.oncology', defaultValue: 'Oncology' },
    { value: 'ophthalmology', labelKey: 'doctors.specialties.ophthalmology', defaultValue: 'Ophthalmology' },
    { value: 'orthopedics', labelKey: 'doctors.specialties.orthopedics', defaultValue: 'Orthopedics' },
    { value: 'pediatrics', labelKey: 'doctors.specialties.pediatrics', defaultValue: 'Pediatrics' },
    { value: 'psychiatry', labelKey: 'doctors.specialties.psychiatry', defaultValue: 'Psychiatry' },
    { value: 'radiology', labelKey: 'doctors.specialties.radiology', defaultValue: 'Radiology' },
    { value: 'other', labelKey: 'doctors.specialties.other', defaultValue: 'Other' }
];

// Common constants
export const CITIES = [
    { value: 'tel_aviv', labelKey: 'cities.tel_aviv', defaultValue: 'Tel Aviv' },
    { value: 'jerusalem', labelKey: 'cities.jerusalem', defaultValue: 'Jerusalem' },
    { value: 'haifa', labelKey: 'cities.haifa', defaultValue: 'Haifa' },
    { value: 'beer_sheva', labelKey: 'cities.beer_sheva', defaultValue: 'Beer Sheva' },
    { value: 'ashdod', labelKey: 'cities.ashdod', defaultValue: 'Ashdod' },
    { value: 'netanya', labelKey: 'cities.netanya', defaultValue: 'Netanya' },
    { value: 'other', labelKey: 'cities.other', defaultValue: 'Other' }
];

export const LANGUAGES = [
    { value: 'en', labelKey: 'languages.en', defaultValue: 'English' },
    { value: 'he', labelKey: 'languages.he', defaultValue: 'Hebrew' },
    { value: 'ar', labelKey: 'languages.ar', defaultValue: 'Arabic' },
    { value: 'ru', labelKey: 'languages.ru', defaultValue: 'Russian' },
    { value: 'fr', labelKey: 'languages.fr', defaultValue: 'French' }
];

// Status constants
export const GENERAL_STATUSES = [
    { value: 'active', labelKey: 'common.status.active', defaultValue: 'Active' },
    { value: 'inactive', labelKey: 'common.status.inactive', defaultValue: 'Inactive' },
    { value: 'pending', labelKey: 'common.status.pending', defaultValue: 'Pending' },
    { value: 'archived', labelKey: 'common.status.archived', defaultValue: 'Archived' }
];

// Basic City Options
export const CITIES_OLD = [
    { value: 'tel_aviv', labelKey: 'cities.tel_aviv', defaultValue: 'Tel Aviv' },
    { value: 'jerusalem', labelKey: 'cities.jerusalem', defaultValue: 'Jerusalem' },
    { value: 'haifa', labelKey: 'cities.haifa', defaultValue: 'Haifa' },
    { value: 'rishon_lezion', labelKey: 'cities.rishon_lezion', defaultValue: 'Rishon LeZion' },
    { value: 'petah_tikva', labelKey: 'cities.petah_tikva', defaultValue: 'Petah Tikva' },
    { value: 'ashdod', labelKey: 'cities.ashdod', defaultValue: 'Ashdod' },
    { value: 'netanya', labelKey: 'cities.netanya', defaultValue: 'Netanya' },
    { value: 'beer_sheva', labelKey: 'cities.beer_sheva', defaultValue: 'Beer Sheva' },
    { value: 'holon', labelKey: 'cities.holon', defaultValue: 'Holon' },
    { value: 'bnei_brak', labelKey: 'cities.bnei_brak', defaultValue: 'Bnei Brak' },
    // Add more as needed
];

// Doctor Specialties
export const DOCTOR_SPECIALTIES_OLD = [
    { value: 'cardiology', labelKey: 'doctors.specialty.cardiology', defaultValue: 'Cardiology' },
    { value: 'dermatology', labelKey: 'doctors.specialty.dermatology', defaultValue: 'Dermatology' },
    { value: 'endocrinology', labelKey: 'doctors.specialty.endocrinology', defaultValue: 'Endocrinology' },
    { value: 'gastroenterology', labelKey: 'doctors.specialty.gastroenterology', defaultValue: 'Gastroenterology' },
    { value: 'hematology', labelKey: 'doctors.specialty.hematology', defaultValue: 'Hematology' },
    { value: 'infectious_disease', labelKey: 'doctors.specialty.infectious_disease', defaultValue: 'Infectious Disease' },
    { value: 'internal_medicine', labelKey: 'doctors.specialty.internal_medicine', defaultValue: 'Internal Medicine' },
    { value: 'nephrology', labelKey: 'doctors.specialty.nephrology', defaultValue: 'Nephrology' },
    { value: 'neurology', labelKey: 'doctors.specialty.neurology', defaultValue: 'Neurology' },
    { value: 'oncology', labelKey: 'doctors.specialty.oncology', defaultValue: 'Oncology' },
    { value: 'ophthalmology', labelKey: 'doctors.specialty.ophthalmology', defaultValue: 'Ophthalmology' },
    { value: 'orthopedics', labelKey: 'doctors.specialty.orthopedics', defaultValue: 'Orthopedics' },
    { value: 'otolaryngology', labelKey: 'doctors.specialty.otolaryngology', defaultValue: 'Otolaryngology (ENT)' },
    { value: 'pediatrics', labelKey: 'doctors.specialty.pediatrics', defaultValue: 'Pediatrics' },
    { value: 'psychiatry', labelKey: 'doctors.specialty.psychiatry', defaultValue: 'Psychiatry' },
    { value: 'pulmonology', labelKey: 'doctors.specialty.pulmonology', defaultValue: 'Pulmonology' },
    { value: 'radiology', labelKey: 'doctors.specialty.radiology', defaultValue: 'Radiology' },
    { value: 'rheumatology', labelKey: 'doctors.specialty.rheumatology', defaultValue: 'Rheumatology' },
    { value: 'surgery_general', labelKey: 'doctors.specialty.surgery_general', defaultValue: 'Surgery (General)' },
    { value: 'urology', labelKey: 'doctors.specialty.urology', defaultValue: 'Urology' },
    { value: 'gynecology', labelKey: 'doctors.specialty.gynecology', defaultValue: 'Gynecology & Obstetrics' },
    { value: 'family_medicine', labelKey: 'doctors.specialty.family_medicine', defaultValue: 'Family Medicine' },
    { value: 'anesthesiology', labelKey: 'doctors.specialty.anesthesiology', defaultValue: 'Anesthesiology' },
    { value: 'emergency_medicine', labelKey: 'doctors.specialty.emergency_medicine', defaultValue: 'Emergency Medicine' },
    { value: 'pathology', labelKey: 'doctors.specialty.pathology', defaultValue: 'Pathology' },
    { value: 'physical_medicine', labelKey: 'doctors.specialty.physical_medicine', defaultValue: 'Physical Medicine & Rehabilitation' },
    { value: 'plastic_surgery', labelKey: 'doctors.specialty.plastic_surgery', defaultValue: 'Plastic Surgery' },
    { value: 'allergy_immunology', labelKey: 'doctors.specialty.allergy_immunology', defaultValue: 'Allergy & Immunology' },
    { value: 'other', labelKey: 'doctors.specialty.other', defaultValue: 'Other' }
];

// Spoken Languages
export const LANGUAGES_OLD = [
    { value: 'en', labelKey: 'languages.en', defaultValue: 'English' },
    { value: 'he', labelKey: 'languages.he', defaultValue: 'Hebrew' },
    { value: 'ar', labelKey: 'languages.ar', defaultValue: 'Arabic' },
    { value: 'ru', labelKey: 'languages.ru', defaultValue: 'Russian' },
    { value: 'fr', labelKey: 'languages.fr', defaultValue: 'French' },
    { value: 'es', labelKey: 'languages.es', defaultValue: 'Spanish' },
    { value: 'de', labelKey: 'languages.de', defaultValue: 'German' },
    { value: 'am', labelKey: 'languages.am', defaultValue: 'Amharic' },
    // Add more as needed
];

// Doctor Statuses (used in dialogs typically)
export const DOCTOR_STATUSES = [
    { value: 'active', labelKey: 'doctors.status.active', defaultValue: 'Active' },
    { value: 'inactive', labelKey: 'doctors.status.inactive', defaultValue: 'Inactive' },
    // { value: 'pending', labelKey: 'doctors.status.pending', defaultValue: 'Pending Approval' } // Example
];

// Experience Years (used in dialogs and can be used for filters)
export const EXPERIENCE_YEARS = [
    { value: 'less_than_5', labelKey: 'doctors.experienceYears.lessThan5', defaultLabel: 'Less than 5 years' },
    { value: '5_to_10', labelKey: 'doctors.experienceYears.5to10', defaultLabel: '5-10 years' },
    { value: '10_to_20', labelKey: 'doctors.experienceYears.10to20', defaultLabel: '10-20 years' },
    { value: 'more_than_20', labelKey: 'doctors.experienceYears.moreThan20', defaultLabel: 'More than 20 years' }
];


// Provider Types
export const PROVIDER_TYPES_OLD = [
    { value: 'hospital', labelKey: 'providers.types.hospital', defaultValue: 'Hospital' },
    { value: 'clinic', labelKey: 'providers.types.clinic', defaultValue: 'Clinic' },
    { value: 'imaging_center', labelKey: 'providers.types.imaging_center', defaultValue: 'Imaging Center' },
    { value: 'laboratory', labelKey: 'providers.types.laboratory', defaultValue: 'Laboratory' },
    { value: 'pharmacy', labelKey: 'providers.types.pharmacy', defaultValue: 'Pharmacy' },
    { value: 'rehabilitation_center', labelKey: 'providers.types.rehabilitation_center', defaultValue: 'Rehabilitation Center' },
    { value: 'home_health_agency', labelKey: 'providers.types.home_health_agency', defaultValue: 'Home Health Agency' },
    { value: 'other', labelKey: 'providers.types.other', defaultValue: 'Other' },
];

// Provider Legal Entity Types
export const PROVIDER_LEGAL_TYPES_OLD = [
    { value: 'company', labelKey: 'providers.legalTypes.company', defaultValue: 'Company (Ltd.)' },
    { value: 'licensed_dealer', labelKey: 'providers.legalTypes.licensed_dealer', defaultValue: 'Licensed Dealer (Osek Murshe)' },
    { value: 'exempt_dealer', labelKey: 'providers.legalTypes.exempt_dealer', defaultValue: 'Exempt Dealer (Osek Patur)' },
    { value: 'registered_association', labelKey: 'providers.legalTypes.registered_association', defaultValue: 'Registered Association (Amuta)' },
    { value: 'public_benefit_company', labelKey: 'providers.legalTypes.public_benefit_company', defaultValue: 'Public Benefit Company (Chevra LeToelet HaTzibur)' },
    { value: 'government_entity', labelKey: 'providers.legalTypes.government_entity', defaultValue: 'Government Entity' },
    { value: 'partnership', labelKey: 'providers.legalTypes.partnership', defaultValue: 'Partnership' },
    { value: 'other', labelKey: 'providers.legalTypes.other', defaultValue: 'Other' },
];

// Provider Statuses
export const PROVIDER_STATUSES_OLD = [
    { value: 'active', labelKey: 'providers.status.active', defaultValue: 'Active' },
    { value: 'inactive', labelKey: 'providers.status.inactive', defaultValue: 'Inactive' },
    { value: 'pending_approval', labelKey: 'providers.status.pending_approval', defaultValue: 'Pending Approval' },
    { value: 'suspended', labelKey: 'providers.status.suspended', defaultValue: 'Suspended' },
];

// General Statuses (can be used across entities)
export const GENERAL_STATUSES_OLD = [
    { value: 'active', labelKey: 'common.status.active', defaultValue: 'Active' },
    { value: 'inactive', labelKey: 'common.status.inactive', defaultValue: 'Inactive' },
    { value: 'pending', labelKey: 'common.status.pending', defaultValue: 'Pending' },
    { value: 'draft', labelKey: 'common.status.draft', defaultValue: 'Draft' },
    { value: 'approved', labelKey: 'common.status.approved', defaultValue: 'Approved' },
    { value: 'rejected', labelKey: 'common.status.rejected', defaultValue: 'Rejected' },
    { value: 'expired', labelKey: 'common.status.expired', defaultValue: 'Expired' },
    { value: 'terminated', labelKey: 'common.status.terminated', defaultValue: 'Terminated' },
];


// Code Systems
export const CODE_SYSTEMS = [
    { value: 'ICD9-DX', labelKey: 'codeSystems.icd9dx', defaultValue: 'ICD-9-DX (Diagnosis)' },
    { value: 'ICD9-PROC', labelKey: 'codeSystems.icd9proc', defaultValue: 'ICD-9-PROC (Procedure)' },
    { value: 'ICD10-CM', labelKey: 'codeSystems.icd10cm', defaultValue: 'ICD-10-CM (Diagnosis)' },
    { value: 'ICD10-PCS', labelKey: 'codeSystems.icd10pcs', defaultValue: 'ICD-10-PCS (Procedure)' },
    { value: 'CPT', labelKey: 'codeSystems.cpt', defaultValue: 'CPT (Current Procedural Terminology)' },
    { value: 'HCPCS', labelKey: 'codeSystems.hcpcs', defaultValue: 'HCPCS (Healthcare Common Procedure Coding System)' },
    { value: 'LOINC', labelKey: 'codeSystems.loinc', defaultValue: 'LOINC (Logical Observation Identifiers Names and Codes)' },
    { value: 'SNOMED-CT', labelKey: 'codeSystems.snomed_ct', defaultValue: 'SNOMED CT' },
    { value: 'RXNORM', labelKey: 'codeSystems.rxnorm', defaultValue: 'RxNorm' },
    { value: 'INTERNAL', labelKey: 'codeSystems.internal', defaultValue: 'Internal Codes' },
    { value: 'PROVIDER_INTERNAL', labelKey: 'codeSystems.provider_internal', defaultValue: 'Provider Internal Codes' },
    { value: 'OTHER', labelKey: 'codeSystems.other', defaultValue: 'Other' },
];

// Material Units of Measure
export const MATERIAL_UNITS = [
    { value: 'unit', labelKey: 'materials.units.unit', defaultValue: 'Unit' },
    { value: 'item', labelKey: 'materials.units.item', defaultValue: 'Item' },
    { value: 'mg', labelKey: 'materials.units.mg', defaultValue: 'Milligram (mg)' },
    { value: 'ml', labelKey: 'materials.units.ml', defaultValue: 'Milliliter (ml)' },
    { value: 'g', labelKey: 'materials.units.g', defaultValue: 'Gram (g)' },
    { value: 'kg', labelKey: 'materials.units.kg', defaultValue: 'Kilogram (kg)' },
    { value: 'l', labelKey: 'materials.units.l', defaultValue: 'Liter (l)' },
    { value: 'box', labelKey: 'materials.units.box', defaultValue: 'Box' },
    { value: 'pack', labelKey: 'materials.units.pack', defaultValue: 'Pack' },
    { value: 'kit', labelKey: 'materials.units.kit', defaultValue: 'Kit' },
    { value: 'set', labelKey: 'materials.units.set', defaultValue: 'Set' },
    { value: 'each', labelKey: 'materials.units.each', defaultValue: 'Each' },
    { value: 'pair', labelKey: 'materials.units.pair', defaultValue: 'Pair' },
    { value: 'package', labelKey: 'materials.units.package', defaultValue: 'Package' },
    { value: 'roll', labelKey: 'materials.units.roll', defaultValue: 'Roll' },
    { value: 'cm', labelKey: 'materials.units.cm', defaultValue: 'Centimeter (cm)' },
    { value: 'm', labelKey: 'materials.units.m', defaultValue: 'Meter (m)' },
];

// Currencies
export const CURRENCIES = [
    { value: 'ILS', labelKey: 'currencies.ils', defaultValue: 'ILS (₪)' },
    { value: 'USD', labelKey: 'currencies.usd', defaultValue: 'USD ($)' },
    { value: 'EUR', labelKey: 'currencies.eur', defaultValue: 'EUR (€)' },
    { value: 'GBP', labelKey: 'currencies.gbp', defaultValue: 'GBP (£)' },
];

// Task Statuses
export const TASK_STATUSES = [
    { value: 'todo', labelKey: 'tasks.status.todo', defaultValue: 'To Do' },
    { value: 'in_progress', labelKey: 'tasks.status.in_progress', defaultValue: 'In Progress' },
    { value: 'done', labelKey: 'tasks.status.done', defaultValue: 'Done' },
];

// Adding this constant specifically for the Kanban view
export const TASK_STATUS_OPTIONS = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' }
];

// Task Priorities
export const TASK_PRIORITIES = [
    { value: 'low', labelKey: 'tasks.priority.low', defaultValue: 'Low' },
    { value: 'medium', labelKey: 'tasks.priority.medium', defaultValue: 'Medium' },
    { value: 'high', labelKey: 'tasks.priority.high', defaultValue: 'High' },
];

// Task Categories
export const TASK_CATEGORIES = [
    { value: 'work', labelKey: 'tasks.category.work', defaultValue: 'Work' },
    { value: 'personal', labelKey: 'tasks.category.personal', defaultValue: 'Personal' },
    { value: 'admin', labelKey: 'tasks.category.admin', defaultValue: 'Administrative' },
    { value: 'follow_up', labelKey: 'tasks.category.follow_up', defaultValue: 'Follow Up' },
    { value: 'data_entry', labelKey: 'tasks.category.data_entry', defaultValue: 'Data Entry' },
    { value: 'review', labelKey: 'tasks.category.review', defaultValue: 'Review' },
    { value: 'system_update', labelKey: 'tasks.category.system_update', defaultValue: 'System Update' },
];

// Affiliation Statuses (Doctor-Provider Linkage)
export const AFFILIATION_STATUSES = [
    { value: 'active', labelKey: 'affiliations.status.active', defaultValue: 'Active' },
    { value: 'inactive', labelKey: 'affiliations.status.inactive', defaultValue: 'Inactive' },
    { value: 'pending_approval', labelKey: 'affiliations.status.pending_approval', defaultValue: 'Pending Approval' },
    { value: 'expired', labelKey: 'affiliations.status.expired', defaultValue: 'Expired' },
];

// Contract Statuses
export const CONTRACT_STATUSES = [
    { value: 'draft', labelKey: 'contracts.status.draft', defaultValue: 'Draft' },
    { value: 'active', labelKey: 'contracts.status.active', defaultValue: 'Active' },
    { value: 'expired', labelKey: 'contracts.status.expired', defaultValue: 'Expired' },
    { value: 'terminated', labelKey: 'contracts.status.terminated', defaultValue: 'Terminated' },
    { value: 'pending_review', labelKey: 'contracts.status.pending_review', defaultValue: 'Pending Review' },
    { value: 'archived', labelKey: 'contracts.status.archived', defaultValue: 'Archived' },
];

// Request For Commitment (RFC) Statuses
export const RFC_STATUSES = [
    { value: 'draft', labelKey: 'rfc.status.draft', defaultValue: 'Draft' },
    { value: 'submitted', labelKey: 'rfc.status.submitted', defaultValue: 'Submitted' },
    { value: 'in_review', labelKey: 'rfc.status.in_review', defaultValue: 'In Review' },
    { value: 'approved', labelKey: 'rfc.status.approved', defaultValue: 'Approved' },
    { value: 'partially_approved', labelKey: 'rfc.status.partially_approved', defaultValue: 'Partially Approved' },
    { value: 'rejected', labelKey: 'rfc.status.rejected', defaultValue: 'Rejected' },
    { value: 'cancelled', labelKey: 'rfc.status.cancelled', defaultValue: 'Cancelled' },
    { value: 'pending_information', labelKey: 'rfc.status.pending_information', defaultValue: 'Pending Information' },
];

// Claim Statuses
export const CLAIM_STATUSES = [
    { value: 'draft', labelKey: 'claims.status.draft', defaultValue: 'Draft' },
    { value: 'submitted', labelKey: 'claims.status.submitted', defaultValue: 'Submitted' },
    { value: 'in_review', labelKey: 'claims.status.in_review', defaultValue: 'In Review' },
    { value: 'pending_information', labelKey: 'claims.status.pending_information', defaultValue: 'Pending Information' },
    { value: 'approved_for_payment', labelKey: 'claims.status.approved_for_payment', defaultValue: 'Approved for Payment' },
    { value: 'partially_paid', labelKey: 'claims.status.partially_paid', defaultValue: 'Partially Paid' },
    { value: 'paid_in_full', labelKey: 'claims.status.paid_in_full', defaultValue: 'Paid in Full' },
    { value: 'rejected', labelKey: 'claims.status.rejected', defaultValue: 'Rejected' },
    { value: 'denied', labelKey: 'claims.status.denied', defaultValue: 'Denied' }, // Often similar to rejected but can have specific legal/policy implications
    { value: 'appealed', labelKey: 'claims.status.appealed', defaultValue: 'Appealed' },
];

// Regulation Types
export const REGULATION_TYPES = [
    { value: 'insurance', labelKey: 'regulations.type.insurance', defaultValue: 'Insurance Regulation' },
    { value: 'healthcare', labelKey: 'regulations.type.healthcare', defaultValue: 'Healthcare Standard/Guideline' },
    { value: 'internal_policy', labelKey: 'regulations.type.internal_policy', defaultValue: 'Internal Company Policy' },
    { value: 'legal_compliance', labelKey: 'regulations.type.legal_compliance', defaultValue: 'Legal & Compliance' },
    { value: 'financial', labelKey: 'regulations.type.financial', defaultValue: 'Financial Regulation' },
    { value: 'data_privacy', labelKey: 'regulations.type.data_privacy', defaultValue: 'Data Privacy (e.g., GDPR, HIPAA-like)' },
    { value: 'other', labelKey: 'regulations.type.other', defaultValue: 'Other' },
];

// Import Modules (for Import History)
export const IMPORT_MODULES = [
    { value: 'doctors', labelKey: 'importModules.doctors', defaultValue: 'Doctors' },
    { value: 'providers', labelKey: 'importModules.providers', defaultValue: 'Providers' },
    { value: 'medical_codes', labelKey: 'importModules.medical_codes', defaultValue: 'Medical Codes' },
    { value: 'internal_codes', labelKey: 'importModules.internal_codes', defaultValue: 'Internal Codes' },
    { value: 'materials', labelKey: 'importModules.materials', defaultValue: 'Materials' },
    { value: 'boms', labelKey: 'importModules.boms', defaultValue: 'Bills of Material' },
    { value: 'contracts', labelKey: 'importModules.contracts', defaultValue: 'Contracts' },
    { value: 'tariffs', labelKey: 'importModules.tariffs', defaultValue: 'Tariffs' },
    { value: 'insured_persons', labelKey: 'importModules.insured_persons', defaultValue: 'Insured Persons' },
    { value: 'policies', labelKey: 'importModules.policies', defaultValue: 'Policies' },
];

// Insurance Policy Statuses
export const POLICY_STATUSES = [
    { value: 'active', labelKey: 'policies.status.active', defaultValue: 'Active' },
    { value: 'inactive', labelKey: 'policies.status.inactive', defaultValue: 'Inactive' }, // General inactive state
    { value: 'pending_activation', labelKey: 'policies.status.pending_activation', defaultValue: 'Pending Activation' },
    { value: 'suspended', labelKey: 'policies.status.suspended', defaultValue: 'Suspended' },
    { value: 'terminated', labelKey: 'policies.status.terminated', defaultValue: 'Terminated' },
    { value: 'expired', labelKey: 'policies.status.expired', defaultValue: 'Expired' },
    { value: 'lapsed', labelKey: 'policies.status.lapsed', defaultValue: 'Lapsed (e.g. non-payment)' },
];

export const GENDERS = [
    { value: 'male', labelKey: 'genders.male', defaultValue: 'Male' },
    { value: 'female', labelKey: 'genders.female', defaultValue: 'Female' },
    { value: 'other', labelKey: 'genders.other', defaultValue: 'Other' },
    { value: 'prefer_not_to_say', labelKey: 'genders.prefer_not_to_say', defaultValue: 'Prefer not to say' },
];

export const IDENTIFICATION_TYPES = [
    { value: 'national_id', labelKey: 'idTypes.national_id', defaultValue: 'National ID (Teudat Zehut)' },
    { value: 'passport', labelKey: 'idTypes.passport', defaultValue: 'Passport' },
    { value: 'driver_license', labelKey: 'idTypes.driver_license', defaultValue: 'Driver\'s License' },
    { value: 'insurance_member_id', labelKey: 'idTypes.insurance_member_id', defaultValue: 'Insurance Member ID' },
    { value: 'employee_id', labelKey: 'idTypes.employee_id', defaultValue: 'Employee ID' },
    { value: 'other', labelKey: 'idTypes.other', defaultValue: 'Other' },
];
