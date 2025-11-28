import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ArrowRight,
  Check,
  Users,
  Building2,
  FileText,
  ArrowLeft,
  Shield,
  AlertCircle,
  Search,
  ChevronRight,
  ChevronsUpDown,
  Mic,
  Loader2,
  Sparkles,
  StopCircle,
  UserPlus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button, Input, Badge } from './UI';
import {
  Debtor,
  Kreditor,
  CollectionCase,
  AddressStatus,
  RiskScore,
  CaseStatus,
  UserRole,
  EntityType,
  Gender,
  DoorPosition,
} from '../types';
import { kreditorenApi, debtorsApi, casesApi } from '../services/api/apiClient';
import { authService } from '../services/authService';
// TODO: Migrate voice transcription to backend API
// import { GoogleGenAI } from '@google/genai';
import { logger } from '../utils/logger';

export type WizardType = 'DEBTOR' | 'CLIENT' | 'CLAIM';

interface CreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  type: WizardType;
  onSuccess?: () => void;
}

// --- Internal Component: Searchable Dropdown ---
interface SearchableSelectProps {
  label: string;
  placeholder: string;
  options: { id: string; title: string; subtitle?: string }[];
  value: string;
  onChange: (val: string) => void;
  error?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  placeholder,
  options,
  value,
  onChange,
  error,
  icon: Icon,
  action,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(
    (opt) =>
      opt.title.toLowerCase().includes(search.toLowerCase()) ||
      (opt.subtitle && opt.subtitle.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedOption = options.find((o) => o.id === value);

  return (
    <div className="w-full group relative" ref={wrapperRef}>
      <div className="flex justify-between items-center mb-2 ml-1">
        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 group-focus-within:text-monetaris-600 dark:group-focus-within:text-monetaris-accent transition-colors">
          {label}
        </label>
        {action}
      </div>

      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 border rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-between cursor-pointer transition-all
                ${error ? 'border-red-500/50' : isOpen ? 'border-monetaris-500 ring-4 ring-monetaris-500/10 bg-white dark:bg-[#101010]' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'}
                `}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {Icon && (
            <Icon
              size={16}
              className={`shrink-0 ${selectedOption ? 'text-monetaris-600 dark:text-monetaris-400' : 'text-slate-400'}`}
            />
          )}
          {selectedOption ? (
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {selectedOption.title}
              </span>
              {selectedOption.subtitle && (
                <span className="text-[10px] text-slate-500 truncate">
                  {selectedOption.subtitle}
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm text-slate-400 font-medium truncate">{placeholder}</span>
          )}
        </div>
        <ChevronsUpDown size={14} className="text-slate-400 shrink-0 ml-2" />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 border-b border-slate-100 dark:border-white/5 sticky top-0 bg-white dark:bg-[#151515]">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                autoFocus
                type="text"
                placeholder="Suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#0A0A0A] rounded-lg text-xs font-medium text-slate-900 dark:text-white border-none focus:ring-2 focus:ring-monetaris-500/50 placeholder:text-slate-400 outline-none"
              />
            </div>
          </div>
          <div className="max-h-[200px] overflow-y-auto custom-scrollbar p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-500">Keine Ergebnisse.</div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between group transition-colors ${value === opt.id ? 'bg-monetaris-50 dark:bg-monetaris-500/20' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                >
                  <div>
                    <p
                      className={`text-sm font-bold ${value === opt.id ? 'text-monetaris-700 dark:text-monetaris-400' : 'text-slate-700 dark:text-slate-300'}`}
                    >
                      {opt.title}
                    </p>
                    {opt.subtitle && <p className="text-[10px] text-slate-400">{opt.subtitle}</p>}
                  </div>
                  {value === opt.id && (
                    <Check size={14} className="text-monetaris-600 dark:text-monetaris-400" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-red-500 font-medium ml-1 flex items-center">
          <span className="w-1 h-1 rounded-full bg-red-500 mr-1.5"></span>
          {error}
        </p>
      )}
    </div>
  );
};

// --- Internal Component: Simple Select Dropdown ---
interface SelectDropdownProps {
  label: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

const SelectDropdown: React.FC<SelectDropdownProps> = ({
  label,
  placeholder,
  options,
  value,
  onChange,
  error,
}) => {
  return (
    <div className="w-full group">
      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2 ml-1 group-focus-within:text-monetaris-600 dark:group-focus-within:text-monetaris-accent transition-colors">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 border rounded-xl bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium transition-all text-sm
          focus:ring-4 focus:ring-monetaris-500/10 focus:border-monetaris-500 outline-none
          ${error ? 'border-red-500/50' : 'border-slate-200 dark:border-white/10'}
        `}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1.5 text-xs text-red-500 font-medium ml-1 flex items-center">
          <span className="w-1 h-1 rounded-full bg-red-500 mr-1.5"></span>
          {error}
        </p>
      )}
    </div>
  );
};

// --- Internal Component: Collapsible Section ---
interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  defaultOpen = false,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
      >
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          {title}
        </span>
        {isOpen ? (
          <ChevronUp size={16} className="text-slate-500" />
        ) : (
          <ChevronDown size={16} className="text-slate-500" />
        )}
      </button>
      {isOpen && <div className="p-4 space-y-4 bg-white dark:bg-[#0A0A0A]">{children}</div>}
    </div>
  );
};

export const CreationWizard: React.FC<CreationWizardProps> = ({
  isOpen,
  onClose,
  type,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdId, setCreatedId] = useState<string>('');

  // Form States
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Special State for Inline Debtor Creation in CLAIM flow
  const [isCreatingDebtor, setIsCreatingDebtor] = useState(false);

  // Data Lists for Claim Creation
  const [availableKreditoren, setAvailableKreditoren] = useState<Kreditor[]>([]);
  const [availableDebtors, setAvailableDebtors] = useState<Debtor[]>([]);

  // User Info
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Duplicate Check State
  const [duplicateCheckResult, setDuplicateCheckResult] = useState<{
    hasDuplicates: boolean;
    message: string;
    duplicates?: any[];
  } | null>(null);

  // Voice Input State
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Config based on type
  const getSteps = () => {
    switch (type) {
      case 'DEBTOR':
        return ['Identität', 'Adresse', 'Kontakt', 'Bank & Sonstiges'];
      case 'CLIENT':
        return ['Firmenprofil', 'Adresse', 'Kontakt', 'Bankverbindung'];
      case 'CLAIM':
        return ['Zuordnung', 'Forderungsdetails', 'Prüfung'];
      default:
        return ['Step 1'];
    }
  };
  const steps = getSteps();
  const totalSteps = steps.length;

  // Run duplicate check when reaching step 3 for CLAIM
  useEffect(() => {
    if (isOpen && type === 'CLAIM' && step === 3) {
      checkForDuplicates();
    }
  }, [step, isOpen, type]);

  // Fetch data when wizard opens
  useEffect(() => {
    if (isOpen) {
      const { user } = authService.checkSession();
      setCurrentUser(user);
      setStep(1);
      setIsSuccess(false);
      setLoading(false);
      setFormData({});
      setErrors({});
      setIsCreatingDebtor(false);
      setDuplicateCheckResult(null);

      // If User is Client, pre-set tenantId
      if (user?.role === UserRole.CLIENT && user.kreditorId) {
        setFormData((prev: any) => ({ ...prev, kreditorId: user.kreditorId }));
      }

      if (type === 'CLAIM') {
        const fetchData = async () => {
          try {
            const [kreditorenResult, debtorsResult] = await Promise.all([
              kreditorenApi.getAll(),
              debtorsApi.getAll(),
            ]);
            // Extract data arrays from paginated responses
            setAvailableKreditoren(kreditorenResult?.data || []);
            setAvailableDebtors(debtorsResult?.data || []);
          } catch (err) {
            logger.error('Error loading wizard data:', err);
            setAvailableKreditoren([]);
            setAvailableDebtors([]);
          }
        };
        fetchData();
      }
    }
  }, [isOpen, type]);

  // --- Voice Logic ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      logger.error('Error accessing microphone:', err);
      alert('Mikrofonzugriff verweigert oder nicht verfügbar.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        // Stop all tracks to release mic
        mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.readAsDataURL(blob);
    });
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessingVoice(true);
    try {
      // TODO: Migrate voice transcription to backend API endpoint
      // For now, show a message that this feature is temporarily unavailable
      alert('Spracherkennung wird derzeit migriert. Bitte verwenden Sie die manuelle Eingabe.');

      // Future implementation should call backend API like:
      // const token = authService.getToken();
      // const formData = new FormData();
      // formData.append('audio', audioBlob);
      // formData.append('type', type);
      //
      // const response = await fetch(API_ENDPOINTS.AI.TRANSCRIBE, {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${token}` },
      //   body: formData
      // });
      //
      // const data = await response.json();
      // setFormData((prev: any) => ({ ...prev, ...data }));
    } catch (e) {
      logger.error('Voice processing failed', e);
      alert('Spracherkennung fehlgeschlagen. Bitte versuchen Sie es erneut.');
    } finally {
      setIsProcessingVoice(false);
    }
  };

  if (!isOpen) return null;

  const handleInput = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleNestedInput = (parent: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [parent]: {
        ...(prev[parent] || {}),
        [field]: value,
      },
    }));
    if (errors[`${parent}.${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${parent}.${field}`];
        return newErrors;
      });
    }
  };

  const validateStep = (currentStep: number) => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validation for Inline Debtor Creation in Claim Step 1
    if (type === 'CLAIM' && currentStep === 1 && isCreatingDebtor) {
      if (!formData.firstName && !formData.lastName && !formData.companyName) {
        newErrors['lastName'] = 'Bitte Namen oder Firma angeben';
        isValid = false;
      }
      // Basic check for address parts
      if (!formData.city) {
        newErrors['city'] = 'Stadt fehlt';
        isValid = false;
      }

      // Don't validate debtorId here because we are creating one
    } else if (type === 'DEBTOR' || (type === 'CLAIM' && currentStep === 1 && isCreatingDebtor)) {
      // Standard Debtor Validation
      if (currentStep === 1) {
        if (!formData.entityType) {
          newErrors['entityType'] = 'Bitte Typ auswählen';
          isValid = false;
        }
        if (
          formData.entityType === EntityType.NATURAL_PERSON &&
          !formData.firstName &&
          !formData.lastName
        ) {
          newErrors['lastName'] = 'Name erforderlich für natürliche Person';
          isValid = false;
        }
        if (
          formData.entityType !== EntityType.NATURAL_PERSON &&
          !formData.companyName
        ) {
          newErrors['companyName'] = 'Firmenname erforderlich';
          isValid = false;
        }
      }
      if (currentStep === 2) {
        if (!formData.city) {
          newErrors['city'] = 'Stadt ist erforderlich';
          isValid = false;
        }
      }
      if (currentStep === 3) {
        if (formData.email && !emailRegex.test(formData.email)) {
          newErrors['email'] = 'Ungültiges E-Mail Format';
          isValid = false;
        }
      }
    } else if (type === 'CLIENT') {
      if (currentStep === 1) {
        if (!formData.entityType) {
          newErrors['entityType'] = 'Bitte Typ auswählen';
          isValid = false;
        }
        if (!formData.name) {
          newErrors['name'] = 'Firmenname ist erforderlich';
          isValid = false;
        }
      }
      if (currentStep === 2) {
        if (!formData.city) {
          newErrors['city'] = 'Stadt ist erforderlich';
          isValid = false;
        }
      }
      if (currentStep === 3) {
        if (formData.contactEmail && !emailRegex.test(formData.contactEmail)) {
          newErrors['contactEmail'] = 'Ungültiges E-Mail Format';
          isValid = false;
        }
      }
      if (currentStep === 4) {
        if (!formData.bankAccountIBAN) {
          newErrors['bankAccountIBAN'] = 'IBAN ist erforderlich';
          isValid = false;
        }
      }
    } else if (type === 'CLAIM') {
      if (currentStep === 1) {
        // Only validate tenant if user is not a client (who has it auto-set)
        if (currentUser?.role !== UserRole.CLIENT && !formData.kreditorId) {
          newErrors['tenantId'] = 'Bitte Mandant auswählen';
          isValid = false;
        }
        if (!formData.debtorId) {
          newErrors['debtorId'] = 'Bitte Schuldner auswählen';
          isValid = false;
        }
      }
      if (currentStep === 2) {
        if (!formData.invoiceNumber) {
          newErrors['invoiceNumber'] = 'Rechnungsnummer fehlt';
          isValid = false;
        }
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
          newErrors['amount'] = 'Betrag ungültig';
          isValid = false;
        }
        if (!formData.dueDate) {
          newErrors['dueDate'] = 'Datum fehlt';
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = async () => {
    // Special Handler for Inline Debtor Creation
    if (type === 'CLAIM' && step === 1 && isCreatingDebtor) {
      if (validateStep(1)) {
        setLoading(true);
        // Create Debtor immediately
        const newDebtor: Debtor = {
          id: `d-inline-${Date.now()}`,
          kreditorId: formData.kreditorId || 't1',
          entityType: formData.entityType || EntityType.NATURAL_PERSON,
          companyName: formData.companyName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          birthName: formData.birthName,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          birthPlace: formData.birthPlace,
          birthCountry: formData.birthCountry,
          email: formData.email || '',
          phoneLandline: formData.phoneLandline || '',
          phoneMobile: formData.phoneMobile || '',
          fax: formData.fax,
          street: formData.street || '',
          houseNumber: formData.houseNumber,
          floor: formData.floor,
          doorPosition: formData.doorPosition,
          additionalAddressInfo: formData.additionalAddressInfo,
          zipCode: formData.zipCode || '',
          city: formData.city || '',
          cityDistrict: formData.cityDistrict,
          country: formData.country || 'Deutschland',
          poBox: formData.poBox,
          poBoxZipCode: formData.poBoxZipCode,
          addressStatus: AddressStatus.CONFIRMED,
          eboAddress: formData.eboAddress,
          isDeceased: formData.isDeceased,
          placeOfDeath: formData.placeOfDeath,
          bankIBAN: formData.bankIBAN,
          bankBIC: formData.bankBIC,
          bankName: formData.bankName,
          registerCourt: formData.registerCourt,
          registerNumber: formData.registerNumber,
          vatId: formData.vatId,
          partners: formData.partners,
          representedBy: formData.representedBy,
          fileReference: formData.fileReference,
          riskScore: RiskScore.C,
          totalDebt: 0,
          openCases: 0,
          notes: formData.notes,
        };

        // Save debtor via API
        const createdDebtor = await debtorsApi.create(newDebtor);

        // Update state to select this new debtor and exit creation mode
        setAvailableDebtors((prev) => [createdDebtor || newDebtor, ...prev]);
        setFormData((prev) => ({ ...prev, debtorId: createdDebtor?.id || newDebtor.id }));
        setIsCreatingDebtor(false);
        setLoading(false);
        setStep(2); // Move to next step directly
      }
      return;
    }

    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const checkForDuplicates = async () => {
    setLoading(true);
    try {
      if (type === 'DEBTOR' && formData.email) {
        // Check for duplicate debtor by email
        const results = await debtorsApi.getAll({ email: formData.email });
        if (results.data && results.data.length > 0) {
          setDuplicateCheckResult({
            hasDuplicates: true,
            message: `${results.data.length} Schuldner mit dieser E-Mail-Adresse gefunden`,
            duplicates: results.data,
          });
        } else {
          setDuplicateCheckResult({
            hasDuplicates: false,
            message: 'Keine Duplikate gefunden',
          });
        }
      } else if (type === 'CLAIM' && formData.invoiceNumber) {
        // Check for duplicate case by invoice number
        const results = await casesApi.getAll({ invoiceNumber: formData.invoiceNumber });
        if (results.data && results.data.length > 0) {
          setDuplicateCheckResult({
            hasDuplicates: true,
            message: `${results.data.length} Fall mit dieser Rechnungsnummer gefunden`,
            duplicates: results.data,
          });
        } else {
          setDuplicateCheckResult({
            hasDuplicates: false,
            message: 'Keine Duplikate gefunden',
          });
        }
      } else {
        setDuplicateCheckResult({
          hasDuplicates: false,
          message: 'Keine Duplikate gefunden',
        });
      }
    } catch (error) {
      logger.error('Duplicate check failed', error);
      setDuplicateCheckResult({
        hasDuplicates: false,
        message: 'Duplikatprüfung fehlgeschlagen',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    setLoading(true);

    try {
      if (type === 'DEBTOR') {
        const newDebtor: Debtor = {
          id: `d-${Date.now()}`,
          kreditorId: 't1',
          entityType: formData.entityType || EntityType.NATURAL_PERSON,
          companyName: formData.companyName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          birthName: formData.birthName,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          birthPlace: formData.birthPlace,
          birthCountry: formData.birthCountry,
          email: formData.email || '',
          phoneLandline: formData.phoneLandline || '',
          phoneMobile: formData.phoneMobile || '',
          fax: formData.fax,
          street: formData.street || '',
          houseNumber: formData.houseNumber,
          floor: formData.floor,
          doorPosition: formData.doorPosition,
          additionalAddressInfo: formData.additionalAddressInfo,
          zipCode: formData.zipCode || '',
          city: formData.city || '',
          cityDistrict: formData.cityDistrict,
          country: formData.country || 'Deutschland',
          poBox: formData.poBox,
          poBoxZipCode: formData.poBoxZipCode,
          addressStatus: AddressStatus.CONFIRMED,
          eboAddress: formData.eboAddress,
          isDeceased: formData.isDeceased,
          placeOfDeath: formData.placeOfDeath,
          bankIBAN: formData.bankIBAN,
          bankBIC: formData.bankBIC,
          bankName: formData.bankName,
          registerCourt: formData.registerCourt,
          registerNumber: formData.registerNumber,
          vatId: formData.vatId,
          partners: formData.partners,
          representedBy: formData.representedBy,
          fileReference: formData.fileReference,
          riskScore: RiskScore.C,
          totalDebt: 0,
          openCases: 0,
          notes: formData.notes,
        };
        const createdDebtor = await debtorsApi.create(newDebtor);
        setCreatedId(createdDebtor?.id || newDebtor.id);
      } else if (type === 'CLIENT') {
        const newKreditor: Kreditor = {
          id: `t-${Date.now()}`,
          entityType: formData.entityType || EntityType.LEGAL_ENTITY,
          name: formData.name,
          firstName: formData.firstName,
          lastName: formData.lastName,
          birthName: formData.birthName,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          birthPlace: formData.birthPlace,
          birthCountry: formData.birthCountry,
          registrationNumber: formData.registrationNumber || '',
          registerCourt: formData.registerCourt,
          vatId: formData.vatId,
          contactEmail: formData.contactEmail || '',
          phoneLandline: formData.phoneLandline,
          phoneMobile: formData.phoneMobile,
          fax: formData.fax,
          eboAddress: formData.eboAddress,
          street: formData.street,
          houseNumber: formData.houseNumber,
          zipCode: formData.zipCode,
          city: formData.city,
          cityDistrict: formData.cityDistrict,
          floor: formData.floor,
          doorPosition: formData.doorPosition,
          additionalAddressInfo: formData.additionalAddressInfo,
          poBox: formData.poBox,
          poBoxZipCode: formData.poBoxZipCode,
          country: formData.country || 'Deutschland',
          representedBy: formData.representedBy,
          isDeceased: formData.isDeceased,
          placeOfDeath: formData.placeOfDeath,
          bankAccountIBAN: formData.bankAccountIBAN || '',
          bankBIC: formData.bankBIC,
          bankName: formData.bankName,
          partners: formData.partners,
          fileReference: formData.fileReference,
        };
        const createdKreditor = await kreditorenApi.create(newKreditor);
        setCreatedId(createdKreditor?.id || newKreditor.id);
      } else if (type === 'CLAIM') {
        const selectedDebtor = availableDebtors.find((d) => d.id === formData.debtorId);
        const selectedKreditor = availableKreditoren.find((t) => t.id === formData.kreditorId);

        const newCase: CollectionCase = {
          id: `c-${Date.now()}`,
          kreditorId: formData.kreditorId,
          kreditorName: selectedKreditor?.name,
          debtorId: formData.debtorId,
          debtorName:
            selectedDebtor?.companyName ||
            `${selectedDebtor?.lastName}, ${selectedDebtor?.firstName}`,
          principalAmount: parseFloat(formData.amount || '0'),
          costs: 5.0,
          interest: parseFloat(formData.interestRate || '0'),
          totalAmount: parseFloat(formData.amount || '0') + 5.0,
          currency: 'EUR',
          invoiceNumber: formData.invoiceNumber,
          invoiceDate: formData.invoiceDate || new Date().toISOString(),
          dueDate: formData.dueDate || new Date().toISOString(),
          status: CaseStatus.NEW,
          dateOfOrigin: formData.dateOfOrigin,
          claimDescription: formData.claimDescription,
          interestStartDate: formData.interestStartDate,
          interestRate: parseFloat(formData.interestRate || '0'),
          isVariableInterest: formData.isVariableInterest || false,
          interestEndDate: formData.interestEndDate,
          additionalCosts: parseFloat(formData.additionalCosts || '0'),
          procedureCosts: parseFloat(formData.procedureCosts || '0'),
          interestOnCosts: formData.interestOnCosts || false,
          statuteOfLimitationsDate: formData.statuteOfLimitationsDate,
          paymentAllocationNotes: formData.paymentAllocationNotes,
          history: [],
          aiAnalysis: 'Initial Assessment Pending',
        };
        const createdCase = await casesApi.create(newCase);
        setCreatedId(createdCase?.id || newCase.id);
      }

      setLoading(false);
      setIsSuccess(true);
      if (onSuccess) setTimeout(onSuccess, 1500);
    } catch (e) {
      setLoading(false);
      logger.error(e);
    }
  };

  const renderBreadcrumbs = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between relative z-10">
        {steps.map((label, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === step;
          const isCompleted = stepNum < step;

          return (
            <div
              key={i}
              className="flex flex-col items-center flex-1 relative group cursor-default"
            >
              {/* Connector Line */}
              {i !== 0 && (
                <div
                  className={`absolute top-4 right-[50%] w-full h-[2px] -z-10 -translate-y-1/2 ${isCompleted ? 'bg-monetaris-500' : 'bg-slate-200 dark:bg-white/10'}`}
                ></div>
              )}

              {/* Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 shadow-sm
                            ${
                              isActive
                                ? 'bg-monetaris-500 text-white ring-4 ring-monetaris-100 dark:ring-monetaris-900/40 scale-110'
                                : isCompleted
                                  ? 'bg-monetaris-500 text-white'
                                  : 'bg-slate-100 dark:bg-[#202020] text-slate-400 border border-slate-200 dark:border-white/10'
                            }`}
              >
                {isCompleted ? <Check size={14} /> : stepNum}
              </div>

              {/* Label */}
              <span
                className={`mt-3 text-[10px] uppercase tracking-wider font-bold transition-colors duration-300 hidden sm:block
                            ${isActive ? 'text-monetaris-600 dark:text-monetaris-400' : isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
      {/* Mobile Label only for active step */}
      <div className="sm:hidden text-center mt-4">
        <span className="text-xs font-bold uppercase tracking-wider text-monetaris-600 dark:text-monetaris-400">
          Schritt {step}: {steps[step - 1]}
        </span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-[#000000]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-5xl bg-white dark:bg-[#0A0A0A] sm:rounded-[32px] min-h-screen sm:min-h-[650px] flex flex-col md:flex-row shadow-2xl shadow-black ring-1 ring-white/10 animate-in zoom-in-95 duration-300 overflow-hidden">
        {/* LEFT SIDE: Art & Context */}
        <div className="hidden md:flex md:w-2/5 relative bg-slate-900 dark:bg-[#050505] p-8 md:p-12 flex-col justify-between overflow-hidden text-white">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-monetaris-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center mb-6 backdrop-blur-md shadow-lg">
              {type === 'DEBTOR' && <Users size={24} className="text-monetaris-400" />}
              {type === 'CLIENT' && <Building2 size={24} className="text-blue-400" />}
              {type === 'CLAIM' && <FileText size={24} className="text-purple-400" />}
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 tracking-tight">
              {type === 'DEBTOR' && 'Neuer Schuldner'}
              {type === 'CLIENT' && 'Neuer Mandant'}
              {type === 'CLAIM' && 'Forderung anlegen'}
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              {type === 'DEBTOR' &&
                'Erfassen Sie Stammdaten und Kontaktinformationen für eine effiziente Kommunikation im Inkassoprozess.'}
              {type === 'CLIENT' &&
                'Legen Sie ein neues Mandantenprofil an, um Forderungen zu gruppieren und Abrechnungen zu steuern.'}
              {type === 'CLAIM' &&
                'Starten Sie einen neuen Inkasso-Vorgang. Unser System prüft automatisch auf Dubletten und Bonität.'}
            </p>
          </div>

          <div className="relative z-10 space-y-4 mt-auto pt-8">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <Shield size={16} className="text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Secure Enclave
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                Datenbank verschlüsselt.
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Form Wizard */}
        <div className="w-full md:w-3/5 bg-white dark:bg-[#0A0A0A] p-6 sm:p-8 md:p-12 flex flex-col relative h-full overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors z-50"
          >
            <X size={24} />
          </button>


          {/* Mobile Header */}
          <div className="md:hidden mb-6 pr-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {type === 'DEBTOR' && 'Neuer Schuldner'}
              {type === 'CLIENT' && 'Neuer Mandant'}
              {type === 'CLAIM' && 'Forderung anlegen'}
            </h2>
          </div>

          {isSuccess ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500 py-12">
              <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/20">
                <Check size={48} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Erfolgreich!
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8">
                Der Datensatz wurde sicher gespeichert und der Workflow initiiert.
              </p>
              <div className="flex gap-4">
                <Button variant="secondary" onClick={onClose}>
                  Schließen
                </Button>
                {type === 'DEBTOR' && (
                  <Button
                    variant="glow"
                    onClick={() => {
                      navigate(`#/debtors/${createdId}`);
                      onClose();
                    }}
                  >
                    Akte öffnen
                  </Button>
                )}
                {type === 'CLIENT' && (
                  <Button
                    variant="glow"
                    onClick={() => {
                      navigate(`#/clients/${createdId}`);
                      onClose();
                    }}
                  >
                    Mandant öffnen
                  </Button>
                )}
                {type === 'CLAIM' && (
                  <Button
                    variant="glow"
                    onClick={() => {
                      navigate(`#/claims`);
                      onClose();
                    }}
                  >
                    Zur Übersicht
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              {renderBreadcrumbs()}

              <div className="flex-1 space-y-6 min-h-[300px]">
                {/* --- DEBTOR STEPS --- */}
                {(type === 'DEBTOR' || (type === 'CLAIM' && step === 1 && isCreatingDebtor)) && (
                  <>
                    {/* Step 1: Entity Type & Identity */}
                    {step === 1 && (
                      <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                        {isCreatingDebtor && (
                          <div className="flex items-center gap-2 mb-4 text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300 px-3 py-2 rounded-lg">
                            <UserPlus size={16} />
                            <span className="font-bold">Neuen Schuldner anlegen</span>
                          </div>
                        )}

                        <SelectDropdown
                          label="Rechtsform *"
                          placeholder="Bitte wählen..."
                          options={[
                            { value: EntityType.NATURAL_PERSON, label: 'Natürliche Person' },
                            { value: EntityType.LEGAL_ENTITY, label: 'Juristische Person (GmbH, AG, etc.)' },
                            { value: EntityType.PARTNERSHIP, label: 'Personengesellschaft (GbR, OHG, KG)' },
                          ]}
                          value={formData.entityType || ''}
                          onChange={(val) => handleInput('entityType', val)}
                          error={errors['entityType']}
                        />

                        {/* Natural Person Fields */}
                        {formData.entityType === EntityType.NATURAL_PERSON && (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <Input
                                label="Vorname *"
                                placeholder="Max"
                                value={formData.firstName || ''}
                                onChange={(e) => handleInput('firstName', e.target.value)}
                                error={errors['firstName']}
                              />
                              <Input
                                label="Nachname *"
                                placeholder="Mustermann"
                                value={formData.lastName || ''}
                                onChange={(e) => handleInput('lastName', e.target.value)}
                                error={errors['lastName']}
                              />
                            </div>

                            <CollapsibleSection title="Erweiterte Personendaten" defaultOpen={false}>
                              <Input
                                label="Geburtsname"
                                placeholder="Schmidt"
                                value={formData.birthName || ''}
                                onChange={(e) => handleInput('birthName', e.target.value)}
                              />
                              <SelectDropdown
                                label="Geschlecht"
                                placeholder="Bitte wählen..."
                                options={[
                                  { value: Gender.MALE, label: 'Männlich' },
                                  { value: Gender.FEMALE, label: 'Weiblich' },
                                  { value: Gender.DIVERSE, label: 'Divers' },
                                ]}
                                value={formData.gender || ''}
                                onChange={(val) => handleInput('gender', val)}
                              />
                              <div className="grid grid-cols-3 gap-4">
                                <Input
                                  label="Geburtsdatum"
                                  type="date"
                                  value={formData.dateOfBirth || ''}
                                  onChange={(e) => handleInput('dateOfBirth', e.target.value)}
                                />
                                <Input
                                  label="Geburtsort"
                                  placeholder="Berlin"
                                  value={formData.birthPlace || ''}
                                  onChange={(e) => handleInput('birthPlace', e.target.value)}
                                />
                                <Input
                                  label="Geburtsland"
                                  placeholder="Deutschland"
                                  value={formData.birthCountry || ''}
                                  onChange={(e) => handleInput('birthCountry', e.target.value)}
                                />
                              </div>
                            </CollapsibleSection>
                          </>
                        )}

                        {/* Legal Entity Fields */}
                        {formData.entityType === EntityType.LEGAL_ENTITY && (
                          <>
                            <Input
                              label="Firmenname *"
                              placeholder="Musterfirma GmbH"
                              value={formData.companyName || ''}
                              onChange={(e) => handleInput('companyName', e.target.value)}
                              error={errors['companyName']}
                            />
                            <div className="grid grid-cols-3 gap-4">
                              <Input
                                label="Handelsregister"
                                placeholder="Amtsgericht Berlin"
                                value={formData.registerCourt || ''}
                                onChange={(e) => handleInput('registerCourt', e.target.value)}
                              />
                              <Input
                                label="HRB-Nummer"
                                placeholder="HRB 12345"
                                value={formData.registerNumber || ''}
                                onChange={(e) => handleInput('registerNumber', e.target.value)}
                              />
                              <Input
                                label="USt-ID"
                                placeholder="DE123456789"
                                value={formData.vatId || ''}
                                onChange={(e) => handleInput('vatId', e.target.value)}
                              />
                            </div>
                          </>
                        )}

                        {/* Partnership Fields */}
                        {formData.entityType === EntityType.PARTNERSHIP && (
                          <>
                            <Input
                              label="Firmenname *"
                              placeholder="Musterfirma GbR"
                              value={formData.companyName || ''}
                              onChange={(e) => handleInput('companyName', e.target.value)}
                              error={errors['companyName']}
                            />
                            <div>
                              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2 ml-1">
                                Gesellschafter
                              </label>
                              <textarea
                                className="w-full px-4 py-3 border rounded-xl bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium transition-all text-sm focus:ring-4 focus:ring-monetaris-500/10 focus:border-monetaris-500 outline-none resize-none h-20 border-slate-200 dark:border-white/10"
                                placeholder="Max Mustermann, Erika Musterfrau"
                                value={formData.partners || ''}
                                onChange={(e) => handleInput('partners', e.target.value)}
                              ></textarea>
                            </div>
                          </>
                        )}

                        {/* Common Fields */}
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Vertreten durch"
                            placeholder="Name des Vertreters"
                            value={formData.representedBy || ''}
                            onChange={(e) => handleInput('representedBy', e.target.value)}
                          />
                          <Input
                            label="Aktenzeichen"
                            placeholder="AZ-2024-001"
                            value={formData.fileReference || ''}
                            onChange={(e) => handleInput('fileReference', e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 2: Address */}
                    {step === 2 && (
                      <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                        <h4 className="text-xs font-bold text-slate-500 uppercase">Hauptadresse</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-2">
                            <Input
                              label="Straße"
                              placeholder="Hauptstraße"
                              value={formData.street || ''}
                              onChange={(e) => handleInput('street', e.target.value)}
                            />
                          </div>
                          <Input
                            label="Hausnummer"
                            placeholder="1a"
                            value={formData.houseNumber || ''}
                            onChange={(e) => handleInput('houseNumber', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-1">
                            <Input
                              label="PLZ"
                              placeholder="12345"
                              value={formData.zipCode || ''}
                              onChange={(e) => handleInput('zipCode', e.target.value)}
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              label="Stadt *"
                              placeholder="Berlin"
                              value={formData.city || ''}
                              onChange={(e) => handleInput('city', e.target.value)}
                              error={errors['city']}
                            />
                          </div>
                        </div>

                        <CollapsibleSection title="Erweiterte Adressangaben" defaultOpen={false}>
                          <Input
                            label="Stadtteil / Ortsteil"
                            placeholder="Mitte"
                            value={formData.cityDistrict || ''}
                            onChange={(e) => handleInput('cityDistrict', e.target.value)}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <Input
                              label="Etage"
                              placeholder="3"
                              value={formData.floor || ''}
                              onChange={(e) => handleInput('floor', e.target.value)}
                            />
                            <SelectDropdown
                              label="Türlage"
                              placeholder="Bitte wählen..."
                              options={[
                                { value: DoorPosition.LEFT, label: 'Links' },
                                { value: DoorPosition.RIGHT, label: 'Rechts' },
                                { value: DoorPosition.MIDDLE, label: 'Mitte' },
                              ]}
                              value={formData.doorPosition || ''}
                              onChange={(val) => handleInput('doorPosition', val)}
                            />
                          </div>
                          <Input
                            label="Adresszusatz (c/o, bei, etc.)"
                            placeholder="c/o Müller"
                            value={formData.additionalAddressInfo || ''}
                            onChange={(e) => handleInput('additionalAddressInfo', e.target.value)}
                          />
                          <Input
                            label="Land"
                            placeholder="Deutschland"
                            value={formData.country || 'Deutschland'}
                            onChange={(e) => handleInput('country', e.target.value)}
                          />
                        </CollapsibleSection>

                        <CollapsibleSection title="Postfach-Adresse" defaultOpen={false}>
                          <div className="grid grid-cols-2 gap-4">
                            <Input
                              label="Postfach"
                              placeholder="Postfach 12 34 56"
                              value={formData.poBox || ''}
                              onChange={(e) => handleInput('poBox', e.target.value)}
                            />
                            <Input
                              label="Postfach PLZ"
                              placeholder="10001"
                              value={formData.poBoxZipCode || ''}
                              onChange={(e) => handleInput('poBoxZipCode', e.target.value)}
                            />
                          </div>
                        </CollapsibleSection>
                      </div>
                    )}

                    {/* Step 3: Contact */}
                    {step === 3 && (
                      <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                        <Input
                          label="E-Mail"
                          type="email"
                          placeholder="max@example.com"
                          value={formData.email || ''}
                          onChange={(e) => handleInput('email', e.target.value)}
                          error={errors['email']}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input
                            label="Telefon (Festnetz)"
                            type="tel"
                            placeholder="+49 30 12345678"
                            value={formData.phoneLandline || ''}
                            onChange={(e) => handleInput('phoneLandline', e.target.value)}
                          />
                          <Input
                            label="Telefon (Mobil)"
                            type="tel"
                            placeholder="+49 160 12345678"
                            value={formData.phoneMobile || ''}
                            onChange={(e) => handleInput('phoneMobile', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Fax"
                            type="tel"
                            placeholder="+49 30 12345679"
                            value={formData.fax || ''}
                            onChange={(e) => handleInput('fax', e.target.value)}
                          />
                          <Input
                            label="EBO-Adresse"
                            placeholder="EBO12345"
                            value={formData.eboAddress || ''}
                            onChange={(e) => handleInput('eboAddress', e.target.value)}
                          />
                        </div>

                        {formData.entityType === EntityType.NATURAL_PERSON && (
                          <CollapsibleSection title="Verstorben" defaultOpen={false}>
                            <div className="flex items-center gap-3 mb-4">
                              <input
                                type="checkbox"
                                id="isDeceased"
                                checked={formData.isDeceased || false}
                                onChange={(e) => handleInput('isDeceased', e.target.checked)}
                                className="w-4 h-4 text-monetaris-600 bg-slate-100 border-slate-300 rounded focus:ring-monetaris-500 dark:focus:ring-monetaris-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <label
                                htmlFor="isDeceased"
                                className="text-sm font-medium text-slate-700 dark:text-slate-300"
                              >
                                Person ist verstorben
                              </label>
                            </div>
                            {formData.isDeceased && (
                              <Input
                                label="Sterbeort"
                                placeholder="Berlin"
                                value={formData.placeOfDeath || ''}
                                onChange={(e) => handleInput('placeOfDeath', e.target.value)}
                              />
                            )}
                          </CollapsibleSection>
                        )}
                      </div>
                    )}

                    {/* Step 4: Banking & Notes */}
                    {step === 4 && (
                      <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                        <h4 className="text-xs font-bold text-slate-500 uppercase">Bankverbindung</h4>
                        <Input
                          label="IBAN"
                          placeholder="DE89 3704 0044 0532 0130 00"
                          value={formData.bankIBAN || ''}
                          onChange={(e) => handleInput('bankIBAN', e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="BIC"
                            placeholder="COBADEFFXXX"
                            value={formData.bankBIC || ''}
                            onChange={(e) => handleInput('bankBIC', e.target.value)}
                          />
                          <Input
                            label="Bank"
                            placeholder="Commerzbank AG"
                            value={formData.bankName || ''}
                            onChange={(e) => handleInput('bankName', e.target.value)}
                          />
                        </div>

                        <div className="border-t border-slate-100 dark:border-white/5 pt-4 mt-6">
                          <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2 ml-1">
                            Notizen
                          </label>
                          <textarea
                            className="w-full px-4 py-3 border rounded-xl bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium transition-all text-sm focus:ring-4 focus:ring-monetaris-500/10 focus:border-monetaris-500 outline-none resize-none h-24 border-slate-200 dark:border-white/10"
                            placeholder="Interne Anmerkungen zum Schuldner..."
                            value={formData.notes || ''}
                            onChange={(e) => handleInput('notes', e.target.value)}
                          ></textarea>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* --- CLIENT STEPS --- */}
                {type === 'CLIENT' && (
                  <>
                    {/* Step 1: Company Profile */}
                    {step === 1 && (
                      <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                        <SelectDropdown
                          label="Rechtsform *"
                          placeholder="Bitte wählen..."
                          options={[
                            { value: EntityType.NATURAL_PERSON, label: 'Natürliche Person' },
                            { value: EntityType.LEGAL_ENTITY, label: 'Juristische Person (GmbH, AG, etc.)' },
                            { value: EntityType.PARTNERSHIP, label: 'Personengesellschaft (GbR, OHG, KG)' },
                          ]}
                          value={formData.entityType || EntityType.LEGAL_ENTITY}
                          onChange={(val) => handleInput('entityType', val)}
                          error={errors['entityType']}
                        />

                        <Input
                          label="Firmenname *"
                          placeholder="TechCorp GmbH"
                          value={formData.name || ''}
                          onChange={(e) => handleInput('name', e.target.value)}
                          error={errors['name']}
                        />

                        {formData.entityType === EntityType.LEGAL_ENTITY && (
                          <div className="grid grid-cols-3 gap-4">
                            <Input
                              label="Handelsregister"
                              placeholder="Amtsgericht Berlin"
                              value={formData.registerCourt || ''}
                              onChange={(e) => handleInput('registerCourt', e.target.value)}
                            />
                            <Input
                              label="Registernummer"
                              placeholder="HRB 12345"
                              value={formData.registrationNumber || ''}
                              onChange={(e) => handleInput('registrationNumber', e.target.value)}
                            />
                            <Input
                              label="USt-ID"
                              placeholder="DE123456789"
                              value={formData.vatId || ''}
                              onChange={(e) => handleInput('vatId', e.target.value)}
                            />
                          </div>
                        )}

                        {formData.entityType === EntityType.PARTNERSHIP && (
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2 ml-1">
                              Gesellschafter
                            </label>
                            <textarea
                              className="w-full px-4 py-3 border rounded-xl bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium transition-all text-sm focus:ring-4 focus:ring-monetaris-500/10 focus:border-monetaris-500 outline-none resize-none h-20 border-slate-200 dark:border-white/10"
                              placeholder="Max Mustermann, Erika Musterfrau"
                              value={formData.partners || ''}
                              onChange={(e) => handleInput('partners', e.target.value)}
                            ></textarea>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 2: Address */}
                    {step === 2 && (
                      <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                        <h4 className="text-xs font-bold text-slate-500 uppercase">Firmensitz</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-2">
                            <Input
                              label="Straße"
                              placeholder="Hauptstraße"
                              value={formData.street || ''}
                              onChange={(e) => handleInput('street', e.target.value)}
                            />
                          </div>
                          <Input
                            label="Hausnummer"
                            placeholder="1"
                            value={formData.houseNumber || ''}
                            onChange={(e) => handleInput('houseNumber', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-1">
                            <Input
                              label="PLZ"
                              placeholder="12345"
                              value={formData.zipCode || ''}
                              onChange={(e) => handleInput('zipCode', e.target.value)}
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              label="Stadt *"
                              placeholder="Berlin"
                              value={formData.city || ''}
                              onChange={(e) => handleInput('city', e.target.value)}
                              error={errors['city']}
                            />
                          </div>
                        </div>

                        <CollapsibleSection title="Erweiterte Adressangaben" defaultOpen={false}>
                          <Input
                            label="Stadtteil"
                            placeholder="Mitte"
                            value={formData.cityDistrict || ''}
                            onChange={(e) => handleInput('cityDistrict', e.target.value)}
                          />
                          <Input
                            label="Adresszusatz"
                            placeholder="Gebäude A"
                            value={formData.additionalAddressInfo || ''}
                            onChange={(e) => handleInput('additionalAddressInfo', e.target.value)}
                          />
                          <Input
                            label="Land"
                            placeholder="Deutschland"
                            value={formData.country || 'Deutschland'}
                            onChange={(e) => handleInput('country', e.target.value)}
                          />
                        </CollapsibleSection>

                        <CollapsibleSection title="Postfach-Adresse" defaultOpen={false}>
                          <div className="grid grid-cols-2 gap-4">
                            <Input
                              label="Postfach"
                              placeholder="Postfach 12 34 56"
                              value={formData.poBox || ''}
                              onChange={(e) => handleInput('poBox', e.target.value)}
                            />
                            <Input
                              label="Postfach PLZ"
                              placeholder="10001"
                              value={formData.poBoxZipCode || ''}
                              onChange={(e) => handleInput('poBoxZipCode', e.target.value)}
                            />
                          </div>
                        </CollapsibleSection>
                      </div>
                    )}

                    {/* Step 3: Contact */}
                    {step === 3 && (
                      <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                        <Input
                          label="Kontakt E-Mail"
                          type="email"
                          placeholder="billing@firma.de"
                          value={formData.contactEmail || ''}
                          onChange={(e) => handleInput('contactEmail', e.target.value)}
                          error={errors['contactEmail']}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input
                            label="Telefon (Festnetz)"
                            type="tel"
                            placeholder="+49 30 12345678"
                            value={formData.phoneLandline || ''}
                            onChange={(e) => handleInput('phoneLandline', e.target.value)}
                          />
                          <Input
                            label="Telefon (Mobil)"
                            type="tel"
                            placeholder="+49 160 12345678"
                            value={formData.phoneMobile || ''}
                            onChange={(e) => handleInput('phoneMobile', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Fax"
                            type="tel"
                            placeholder="+49 30 12345679"
                            value={formData.fax || ''}
                            onChange={(e) => handleInput('fax', e.target.value)}
                          />
                          <Input
                            label="EBO-Adresse"
                            placeholder="EBO12345"
                            value={formData.eboAddress || ''}
                            onChange={(e) => handleInput('eboAddress', e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 4: Banking */}
                    {step === 4 && (
                      <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                        <Input
                          label="IBAN *"
                          placeholder="DE89 3704 0044 0532 0130 00"
                          value={formData.bankAccountIBAN || ''}
                          onChange={(e) => handleInput('bankAccountIBAN', e.target.value)}
                          error={errors['bankAccountIBAN']}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="BIC"
                            placeholder="COBADEFFXXX"
                            value={formData.bankBIC || ''}
                            onChange={(e) => handleInput('bankBIC', e.target.value)}
                          />
                          <Input
                            label="Bank"
                            placeholder="Commerzbank AG"
                            value={formData.bankName || ''}
                            onChange={(e) => handleInput('bankName', e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* --- CLAIM STEPS --- */}
                {type === 'CLAIM' && step === 1 && !isCreatingDebtor && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                    {/* Only show Tenant selection if NOT a Client user */}
                    {currentUser?.role !== UserRole.CLIENT && (
                      <div className="mb-4">
                        <SearchableSelect
                          label="Mandant (Gläubiger)"
                          placeholder="Mandant suchen..."
                          icon={Building2}
                          options={availableKreditoren.map((t) => ({
                            id: t.id,
                            title: t.name,
                            subtitle: `ID: ${t.id} • ${t.registrationNumber}`,
                          }))}
                          value={formData.kreditorId}
                          onChange={(val) => handleInput('kreditorId', val)}
                          error={errors['tenantId']}
                        />
                      </div>
                    )}

                    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-500/20 p-4 flex gap-3 items-start">
                      <AlertCircle className="text-blue-500 shrink-0" size={20} />
                      <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                        Wählen Sie einen existierenden Schuldner oder legen Sie direkt einen neuen
                        an.
                      </p>
                    </div>

                    <SearchableSelect
                      label="Schuldner"
                      placeholder="Schuldner suchen..."
                      icon={Users}
                      options={availableDebtors.map((d) => ({
                        id: d.id,
                        title: d.companyName || `${d.lastName}, ${d.firstName}`,
                        subtitle: `ID: ${d.id} • ${d.city}`,
                      }))}
                      value={formData.debtorId}
                      onChange={(val) => handleInput('debtorId', val)}
                      error={errors['debtorId']}
                      action={
                        <button
                          onClick={() => setIsCreatingDebtor(true)}
                          className="text-[10px] font-bold text-monetaris-600 dark:text-monetaris-400 hover:underline flex items-center gap-1"
                        >
                          <UserPlus size={12} /> Neu anlegen
                        </button>
                      }
                    />
                  </div>
                )}
                {type === 'CLAIM' && step === 2 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                    <h4 className="text-xs font-bold text-slate-500 uppercase">Basisdaten</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Rechnungs-Nr. *"
                        placeholder="RE-2024-001"
                        value={formData.invoiceNumber || ''}
                        onChange={(e) => handleInput('invoiceNumber', e.target.value)}
                        error={errors['invoiceNumber']}
                      />
                      <Input
                        label="Hauptforderung (€) *"
                        type="number"
                        placeholder="1000.00"
                        value={formData.amount || ''}
                        onChange={(e) => handleInput('amount', e.target.value)}
                        error={errors['amount']}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Rechnungsdatum"
                        type="date"
                        value={formData.invoiceDate || ''}
                        onChange={(e) => handleInput('invoiceDate', e.target.value)}
                      />
                      <Input
                        label="Fälligkeit *"
                        type="date"
                        value={formData.dueDate || ''}
                        onChange={(e) => handleInput('dueDate', e.target.value)}
                        error={errors['dueDate']}
                      />
                    </div>

                    <CollapsibleSection title="Forderungsdetails" defaultOpen={false}>
                      <Input
                        label="Entstehungsdatum"
                        type="date"
                        value={formData.dateOfOrigin || ''}
                        onChange={(e) => handleInput('dateOfOrigin', e.target.value)}
                      />
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2 ml-1">
                          Anspruchsgrund (Exakte Beschreibung)
                        </label>
                        <textarea
                          className="w-full px-4 py-3 border rounded-xl bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium transition-all text-sm focus:ring-4 focus:ring-monetaris-500/10 focus:border-monetaris-500 outline-none resize-none h-20 border-slate-200 dark:border-white/10"
                          placeholder="Lieferung von Waren gemäß Rechnung vom..."
                          value={formData.claimDescription || ''}
                          onChange={(e) => handleInput('claimDescription', e.target.value)}
                        ></textarea>
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Zinsen & Kosten" defaultOpen={false}>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Zinsbeginn"
                          type="date"
                          value={formData.interestStartDate || ''}
                          onChange={(e) => handleInput('interestStartDate', e.target.value)}
                        />
                        <Input
                          label="Zinssatz (%)"
                          type="number"
                          step="0.01"
                          placeholder="5.00"
                          value={formData.interestRate || ''}
                          onChange={(e) => handleInput('interestRate', e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <input
                          type="checkbox"
                          id="isVariableInterest"
                          checked={formData.isVariableInterest || false}
                          onChange={(e) => handleInput('isVariableInterest', e.target.checked)}
                          className="w-4 h-4 text-monetaris-600 bg-slate-100 border-slate-300 rounded focus:ring-monetaris-500"
                        />
                        <label htmlFor="isVariableInterest" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Variabler Zinssatz (Basiszins gekoppelt)
                        </label>
                      </div>
                      {!formData.isVariableInterest && (
                        <Input
                          label="Zinsende"
                          type="date"
                          value={formData.interestEndDate || ''}
                          onChange={(e) => handleInput('interestEndDate', e.target.value)}
                        />
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Nebenkosten (€)"
                          type="number"
                          step="0.01"
                          placeholder="50.00"
                          value={formData.additionalCosts || ''}
                          onChange={(e) => handleInput('additionalCosts', e.target.value)}
                        />
                        <Input
                          label="Verfahrenskosten (€)"
                          type="number"
                          step="0.01"
                          placeholder="100.00"
                          value={formData.procedureCosts || ''}
                          onChange={(e) => handleInput('procedureCosts', e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="interestOnCosts"
                          checked={formData.interestOnCosts || false}
                          onChange={(e) => handleInput('interestOnCosts', e.target.checked)}
                          className="w-4 h-4 text-monetaris-600 bg-slate-100 border-slate-300 rounded focus:ring-monetaris-500"
                        />
                        <label htmlFor="interestOnCosts" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Zinslauf auch auf Verfahrenskosten
                        </label>
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Rechtliche Hinweise" defaultOpen={false}>
                      <Input
                        label="Verjährungsdatum"
                        type="date"
                        value={formData.statuteOfLimitationsDate || ''}
                        onChange={(e) => handleInput('statuteOfLimitationsDate', e.target.value)}
                      />
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2 ml-1">
                          Tilgungsvereinbarung (§§ 366, 367 BGB)
                        </label>
                        <textarea
                          className="w-full px-4 py-3 border rounded-xl bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium transition-all text-sm focus:ring-4 focus:ring-monetaris-500/10 focus:border-monetaris-500 outline-none resize-none h-20 border-slate-200 dark:border-white/10"
                          placeholder="Vereinbarung zur Zahlungsverrechnung..."
                          value={formData.paymentAllocationNotes || ''}
                          onChange={(e) => handleInput('paymentAllocationNotes', e.target.value)}
                        ></textarea>
                      </div>
                    </CollapsibleSection>
                  </div>
                )}
                {type === 'CLAIM' && step === 3 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                    <div className="bg-slate-50 dark:bg-[#151515] p-6 rounded-2xl border border-slate-100 dark:border-white/5 space-y-4">
                      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-[#0A0A0A] flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-sm">
                          <FileText size={20} className="text-monetaris-500" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-bold uppercase">
                            Neue Forderung
                          </p>
                          <p className="font-bold dark:text-white text-lg">
                            {formData.invoiceNumber}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Mandant</span>
                          <span className="font-bold dark:text-white">
                            {availableKreditoren.find((t) => t.id === formData.kreditorId)?.name}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Schuldner</span>
                          <span className="font-bold dark:text-white">
                            {(() => {
                              const d = availableDebtors.find((db) => db.id === formData.debtorId);
                              return d ? d.companyName || `${d.lastName}, ${d.firstName}` : '-';
                            })()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Hauptforderung</span>
                          <span className="font-bold text-monetaris-600 dark:text-monetaris-400">
                            €{' '}
                            {Number(formData.amount).toLocaleString('de-DE', {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Fällig am</span>
                          <span className="font-bold dark:text-white">
                            {new Date(formData.dueDate).toLocaleDateString('de-DE')}
                          </span>
                        </div>
                      </div>
                    </div>
                    {duplicateCheckResult && (
                      <div
                        className={`flex items-start gap-3 p-4 rounded-xl border ${
                          duplicateCheckResult.hasDuplicates
                            ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20'
                            : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20'
                        }`}
                      >
                        {duplicateCheckResult.hasDuplicates ? (
                          <AlertCircle
                            size={16}
                            className="text-amber-600 dark:text-amber-400 mt-0.5"
                          />
                        ) : (
                          <Check
                            size={16}
                            className="text-emerald-600 dark:text-emerald-400 mt-0.5"
                          />
                        )}
                        <div className="flex-1">
                          <p
                            className={`text-xs font-medium ${
                              duplicateCheckResult.hasDuplicates
                                ? 'text-amber-800 dark:text-amber-300'
                                : 'text-emerald-800 dark:text-emerald-300'
                            }`}
                          >
                            {duplicateCheckResult.message}
                          </p>
                          {!duplicateCheckResult.hasDuplicates && (
                            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                              Bonitätsprüfung wird nach Erstellung initiiert.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {!duplicateCheckResult && loading && (
                      <div className="flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900/20 rounded-xl">
                        <Loader2 size={16} className="animate-spin mr-2 text-slate-500" />
                        <span className="text-xs text-slate-500">Prüfe auf Duplikate...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex justify-between sticky bottom-0 bg-white dark:bg-[#0A0A0A] pb-2 z-20">
                {step > 1 || isCreatingDebtor ? (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (isCreatingDebtor) setIsCreatingDebtor(false);
                      else setStep(step - 1);
                    }}
                  >
                    <ArrowLeft size={16} className="mr-2" /> Zurück
                  </Button>
                ) : (
                  <div></div>
                )}

                {step < totalSteps ? (
                  <Button variant="primary" onClick={handleNext} loading={loading}>
                    {isCreatingDebtor ? 'Schuldner speichern & Weiter' : 'Weiter'}{' '}
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                ) : (
                  <Button variant="glow" onClick={handleSubmit} loading={loading}>
                    Fertigstellen
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
