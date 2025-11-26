import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { Button, Input, Badge } from './UI';
import {
  Debtor,
  Tenant,
  CollectionCase,
  AddressStatus,
  RiskScore,
  CaseStatus,
  UserRole,
} from '../types';
import { tenantsApi, debtorsApi, casesApi } from '../services/api/apiClient';
import { authService } from '../services/authService';
import { GoogleGenAI } from '@google/genai';

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

export const CreationWizard: React.FC<CreationWizardProps> = ({
  isOpen,
  onClose,
  type,
  onSuccess,
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form States
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Special State for Inline Debtor Creation in CLAIM flow
  const [isCreatingDebtor, setIsCreatingDebtor] = useState(false);

  // Data Lists for Claim Creation
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  const [availableDebtors, setAvailableDebtors] = useState<Debtor[]>([]);

  // User Info
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Voice Input State
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Config based on type
  const getSteps = () => {
    switch (type) {
      case 'DEBTOR':
        return ['Identität', 'Kontakt & Adresse'];
      case 'CLIENT':
        return ['Firmenprofil', 'Bankverbindung'];
      case 'CLAIM':
        return ['Zuordnung', 'Rechnungsdaten', 'Prüfung'];
      default:
        return ['Step 1'];
    }
  };
  const steps = getSteps();
  const totalSteps = steps.length;

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

      // If User is Client, pre-set tenantId
      if (user?.role === UserRole.CLIENT && user.tenantId) {
        setFormData((prev: any) => ({ ...prev, tenantId: user.tenantId }));
      }

      if (type === 'CLAIM') {
        const fetchData = async () => {
          try {
            const [tenantsResult, debtorsResult] = await Promise.all([
              tenantsApi.getAll(),
              debtorsApi.getAll(),
            ]);
            // Extract data arrays from paginated responses
            setAvailableTenants(tenantsResult?.data || []);
            setAvailableDebtors(debtorsResult?.data || []);
          } catch (err) {
            console.error('Error loading wizard data:', err);
            setAvailableTenants([]);
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
      console.error('Error accessing microphone:', err);
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
      const base64Audio = await blobToBase64(audioBlob);

      if (!process.env.API_KEY) throw new Error('API Key missing');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      let prompt = '';
      // Adjust prompt based on context (including inline debtor creation)
      if (type === 'DEBTOR' || isCreatingDebtor) {
        prompt = `
              Listen to the audio. It contains details about a debtor. 
              Extract the following fields into a JSON object: 
              firstName, lastName, companyName, email, phone, street, zipCode, city, notes.
              If a field is missing, exclude it or set to null. 
              Treat 'Musterfirma GmbH' as companyName.
              Address might be spoken like "Musterstrasse 1 in 10115 Berlin".
              `;
      } else if (type === 'CLIENT') {
        prompt = `
              Listen to the audio. It contains details about a client (tenant). 
              Extract: name (company name), regNumber (Handelsregister), email, iban.
              Return JSON.
              `;
      } else if (type === 'CLAIM') {
        prompt = `
              Listen to the audio. It contains details about a collection claim.
              Extract: invoiceNumber, amount (number), dueDate (YYYY-MM-DD), invoiceDate (YYYY-MM-DD).
              Return JSON.
              `;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { mimeType: 'audio/webm', data: base64Audio } },
              { text: prompt },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const jsonText = response.text;
      if (jsonText) {
        const data = JSON.parse(jsonText);

        // Merge into form data
        setFormData((prev: any) => {
          const updates: any = { ...prev, ...data };

          // Handle nested address manually if flat structure returned for debtor
          if (
            (type === 'DEBTOR' || isCreatingDebtor) &&
            (data.street || data.zipCode || data.city)
          ) {
            updates.address = {
              ...prev.address,
              street: data.street || prev.address?.street,
              zipCode: data.zipCode || prev.address?.zipCode,
              city: data.city || prev.address?.city,
            };
          }
          return updates;
        });
      }
    } catch (e) {
      console.error('Voice processing failed', e);
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
      if (!formData.address?.city) {
        newErrors['address.city'] = 'Stadt fehlt';
        isValid = false;
      }

      // Don't validate debtorId here because we are creating one
    } else if (type === 'DEBTOR' || (type === 'CLAIM' && currentStep === 1 && isCreatingDebtor)) {
      // Standard Debtor Validation
      if (currentStep === 1) {
        if (!formData.firstName && !formData.lastName && !formData.companyName) {
          newErrors['lastName'] = 'Bitte Namen oder Firma angeben';
          isValid = false;
        }
        if (formData.email && !emailRegex.test(formData.email)) {
          newErrors['email'] = 'Ungültiges E-Mail Format';
          isValid = false;
        }
      }
    } else if (type === 'CLIENT') {
      if (currentStep === 1) {
        if (!formData.name) {
          newErrors['name'] = 'Firmenname ist erforderlich';
          isValid = false;
        }
      }
      if (currentStep === 2) {
        if (!formData.email) {
          newErrors['email'] = 'E-Mail ist erforderlich';
          isValid = false;
        }
        if (!formData.iban) {
          newErrors['iban'] = 'IBAN ist erforderlich';
          isValid = false;
        }
      }
    } else if (type === 'CLAIM') {
      if (currentStep === 1) {
        // Only validate tenant if user is not a client (who has it auto-set)
        if (currentUser?.role !== UserRole.CLIENT && !formData.tenantId) {
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
          tenantId: formData.tenantId || 't1',
          isCompany: !!formData.companyName,
          companyName: formData.companyName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email || '',
          phone: formData.phone || '',
          address: {
            street: formData.address?.street || '',
            zipCode: formData.address?.zipCode || '',
            city: formData.address?.city || '',
            country: 'Deutschland',
            status: AddressStatus.CONFIRMED,
          },
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

  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    setLoading(true);

    try {
      if (type === 'DEBTOR') {
        const newDebtor: Debtor = {
          id: `d-${Date.now()}`,
          tenantId: 't1',
          isCompany: !!formData.companyName,
          companyName: formData.companyName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email || '',
          phone: formData.phone || '',
          address: {
            street: formData.address?.street || '',
            zipCode: formData.address?.zipCode || '',
            city: formData.address?.city || '',
            country: 'Deutschland',
            status: AddressStatus.CONFIRMED,
          },
          riskScore: RiskScore.C,
          totalDebt: 0,
          openCases: 0,
          notes: formData.notes,
        };
        await debtorsApi.create(newDebtor);
      } else if (type === 'CLIENT') {
        const newTenant: Tenant = {
          id: `t-${Date.now()}`,
          name: formData.name,
          registrationNumber: formData.regNumber || '',
          contactEmail: formData.email,
          bankAccountIBAN: formData.iban,
        };
        await tenantsApi.create(newTenant);
      } else if (type === 'CLAIM') {
        const selectedDebtor = availableDebtors.find((d) => d.id === formData.debtorId);
        const selectedTenant = availableTenants.find((t) => t.id === formData.tenantId);

        const newCase: CollectionCase = {
          id: `c-${Date.now()}`,
          tenantId: formData.tenantId,
          tenantName: selectedTenant?.name,
          debtorId: formData.debtorId,
          debtorName:
            selectedDebtor?.companyName ||
            `${selectedDebtor?.lastName}, ${selectedDebtor?.firstName}`,
          principalAmount: parseFloat(formData.amount || '0'),
          costs: 5.0,
          interest: 0,
          totalAmount: parseFloat(formData.amount || '0') + 5.0,
          currency: 'EUR',
          invoiceNumber: formData.invoiceNumber,
          invoiceDate: formData.invoiceDate || new Date().toISOString(),
          dueDate: formData.dueDate || new Date().toISOString(),
          status: CaseStatus.NEW,
          history: [],
          aiAnalysis: 'Initial Assessment Pending',
        };
        await casesApi.create(newCase);
      }

      setLoading(false);
      setIsSuccess(true);
      if (onSuccess) setTimeout(onSuccess, 1500);
    } catch (e) {
      setLoading(false);
      console.error(e);
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

          {/* Voice Fill Trigger - Top Right */}
          {!isSuccess && (
            <div className="absolute top-6 right-16 z-50">
              <Button
                size="sm"
                variant="glow"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessingVoice}
                className={`rounded-full px-4 transition-all duration-300 ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-red-500/50' : ''}`}
              >
                {isProcessingVoice ? (
                  <Loader2 size={14} className="animate-spin mr-2" />
                ) : isRecording ? (
                  <StopCircle size={14} className="mr-2" />
                ) : (
                  <Mic size={14} className="mr-2" />
                )}
                {isProcessingVoice ? 'Verarbeite...' : isRecording ? 'Stop' : 'AI Voice Fill'}
              </Button>
            </div>
          )}

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
                {type === 'DEBTOR' && <Button variant="glow">Akte öffnen</Button>}
              </div>
            </div>
          ) : (
            <>
              {renderBreadcrumbs()}

              <div className="flex-1 space-y-6 min-h-[300px]">
                {/* --- DEBTOR STEPS --- */}
                {(type === 'DEBTOR' || (type === 'CLAIM' && step === 1 && isCreatingDebtor)) && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                    {isCreatingDebtor && (
                      <div className="flex items-center gap-2 mb-4 text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300 px-3 py-2 rounded-lg">
                        <UserPlus size={16} />
                        <span className="font-bold">Neuen Schuldner anlegen</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Vorname"
                        placeholder="Max"
                        value={formData.firstName || ''}
                        onChange={(e) => handleInput('firstName', e.target.value)}
                        error={errors['firstName']}
                      />
                      <Input
                        label="Nachname"
                        placeholder="Mustermann"
                        value={formData.lastName || ''}
                        onChange={(e) => handleInput('lastName', e.target.value)}
                        error={errors['lastName']}
                      />
                    </div>
                    <Input
                      label="Firma (Optional)"
                      placeholder="Musterfirma GmbH"
                      value={formData.companyName || ''}
                      onChange={(e) => handleInput('companyName', e.target.value)}
                      error={errors['companyName']}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="E-Mail"
                        type="email"
                        placeholder="max@example.com"
                        value={formData.email || ''}
                        onChange={(e) => handleInput('email', e.target.value)}
                        error={errors['email']}
                      />
                      <Input
                        label="Telefon"
                        type="tel"
                        placeholder="+49 ..."
                        value={formData.phone || ''}
                        onChange={(e) => handleInput('phone', e.target.value)}
                      />
                    </div>

                    {/* Address Part - Merged for simplicity in inline mode */}
                    <div className="border-t border-slate-100 dark:border-white/5 pt-4 mt-2">
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Anschrift</h4>
                      <Input
                        label="Straße & Hausnummer"
                        placeholder="Hauptstraße 1"
                        value={formData.address?.street || ''}
                        onChange={(e) => handleNestedInput('address', 'street', e.target.value)}
                        className="mb-4"
                      />
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                          <Input
                            label="PLZ"
                            placeholder="12345"
                            value={formData.address?.zipCode || ''}
                            onChange={(e) =>
                              handleNestedInput('address', 'zipCode', e.target.value)
                            }
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            label="Stadt"
                            placeholder="Berlin"
                            value={formData.address?.city || ''}
                            onChange={(e) => handleNestedInput('address', 'city', e.target.value)}
                            error={errors['address.city']}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {type === 'DEBTOR' && step === 2 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2 ml-1">
                        Notizen
                      </label>
                      <textarea
                        className="w-full px-4 py-3 border rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 font-medium transition-all text-sm dark:bg-white/5 dark:border-white/10 dark:text-white focus:ring-4 focus:ring-slate-100 dark:focus:ring-white/5 outline-none resize-none h-24 border-slate-200 dark:border-white/10"
                        placeholder="Interne Anmerkungen zum Schuldner..."
                        value={formData.notes || ''}
                        onChange={(e) => handleInput('notes', e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                )}

                {/* --- CLIENT STEPS --- */}
                {type === 'CLIENT' && step === 1 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                    <Input
                      label="Firmenname"
                      placeholder="TechCorp GmbH"
                      value={formData.name || ''}
                      onChange={(e) => handleInput('name', e.target.value)}
                      error={errors['name']}
                    />
                    <Input
                      label="Handelsregister"
                      placeholder="HRB 12345"
                      value={formData.regNumber || ''}
                      onChange={(e) => handleInput('regNumber', e.target.value)}
                    />
                  </div>
                )}
                {type === 'CLIENT' && step === 2 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                    <Input
                      label="Kontakt E-Mail"
                      type="email"
                      placeholder="billing@firma.de"
                      value={formData.email || ''}
                      onChange={(e) => handleInput('email', e.target.value)}
                      error={errors['email']}
                    />
                    <Input
                      label="IBAN"
                      placeholder="DE00 0000 ..."
                      value={formData.iban || ''}
                      onChange={(e) => handleInput('iban', e.target.value)}
                      error={errors['iban']}
                    />
                  </div>
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
                          options={availableTenants.map((t) => ({
                            id: t.id,
                            title: t.name,
                            subtitle: `ID: ${t.id} • ${t.registrationNumber}`,
                          }))}
                          value={formData.tenantId}
                          onChange={(val) => handleInput('tenantId', val)}
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
                        subtitle: `ID: ${d.id} • ${d.address.city}`,
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
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Rechnungs-Nr."
                        placeholder="RE-2024-001"
                        value={formData.invoiceNumber || ''}
                        onChange={(e) => handleInput('invoiceNumber', e.target.value)}
                        error={errors['invoiceNumber']}
                      />
                      <Input
                        label="Betrag (€)"
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
                        label="Fälligkeit"
                        type="date"
                        value={formData.dueDate || ''}
                        onChange={(e) => handleInput('dueDate', e.target.value)}
                        error={errors['dueDate']}
                      />
                    </div>
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
                            {availableTenants.find((t) => t.id === formData.tenantId)?.name}
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
                    <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                      <Check size={16} className="text-emerald-600 dark:text-emerald-400 mt-0.5" />
                      <p className="text-xs text-emerald-800 dark:text-emerald-300">
                        Systemprüfung erfolgreich. Keine Duplikate gefunden. Bonitätsprüfung wird
                        nach Erstellung initiiert.
                      </p>
                    </div>
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
