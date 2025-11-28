
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader, Card, Badge, Button, Modal, Input } from '../components/UI';
import { ClaimDetailModal } from '../components/ClaimDetailModal';
import { tenantsApi, casesApi } from '../services/api/apiClient';
import type { ApiError } from '../services/api/apiClient';
import { dataService } from '../services/dataService';
import { Tenant, CollectionCase, User, CaseStatus, ImportProviderType, ImportMapping } from '../types';
import { ArrowLeft, Building2, Mail, CreditCard, Users, TrendingUp, Wallet, Settings, Shield, FileText, Gavel, Filter, UploadCloud, FileSpreadsheet, Check, AlertCircle, ArrowRight, Sparkles, Database, FileCode } from 'lucide-react';

export const TenantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [cases, setCases] = useState<CollectionCase[]>([]);
  const [filteredCases, setFilteredCases] = useState<CollectionCase[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CLAIMS'>('OVERVIEW');
  const [selectedClaim, setSelectedClaim] = useState<CollectionCase | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'OPEN' | 'LEGAL'>('ALL');

  // Import Wizard State
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importStep, setImportStep] = useState<'PROVIDER' | 'UPLOAD' | 'MAPPING' | 'SUCCESS'>('PROVIDER');
  const [importProvider, setImportProvider] = useState<ImportProviderType>('CUSTOM');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<ImportMapping[]>([
      { systemField: 'invoiceNumber', label: 'Rechnungsnummer', required: true, csvHeader: null },
      { systemField: 'debtorName', label: 'Schuldner Name', required: true, csvHeader: null },
      { systemField: 'debtorEmail', label: 'E-Mail', required: false, csvHeader: null },
      { systemField: 'amount', label: 'Betrag', required: true, csvHeader: null },
      { systemField: 'dueDate', label: 'Fälligkeitsdatum', required: true, csvHeader: null },
      { systemField: 'iban', label: 'IBAN', required: false, csvHeader: null },
  ]);
  const [isImporting, setIsImporting] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      if (id) {
        try {
          setLoading(true);
          setError(null);
          const tenantData = await tenantsApi.getById(id);
          const casesData = await casesApi.getAll({ tenantId: id });

          // For users, we still use dataService as there's no users API yet
          const fullData = await dataService.getTenantById(id);

          setTenant(tenantData);
          setCases(casesData.data);
          setFilteredCases(casesData.data);
          setUsers(fullData?.users || []);
        } catch (err) {
          const apiError = err as ApiError;
          setError(apiError.message || 'Failed to load tenant data');
          console.error('Error loading tenant:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    load();
  }, [id]);

  // Apply filters when filterType changes
  useEffect(() => {
      if (filterType === 'ALL') {
          setFilteredCases(cases);
      } else if (filterType === 'OPEN') {
          setFilteredCases(cases.filter(c => c.status !== CaseStatus.PAID && c.status !== CaseStatus.UNCOLLECTIBLE));
      } else if (filterType === 'LEGAL') {
          setFilteredCases(cases.filter(c => [CaseStatus.MB_REQUESTED, CaseStatus.MB_ISSUED, CaseStatus.TITLE_OBTAINED, CaseStatus.GV_MANDATED, CaseStatus.PREPARE_VB].includes(c.status)));
      }
  }, [filterType, cases]);

  const handleStatClick = (type: 'ALL' | 'OPEN' | 'LEGAL') => {
      setActiveTab('CLAIMS');
      setFilterType(type);
  };

  // --- Import Handlers ---
  const handleImportFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setImportFile(file);
          // Simulate analyzing file
          const headers = await dataService.parseCsvHeaders(file);
          setCsvHeaders(headers);
          
          // Auto-Map if possible
          if (importProvider !== 'CUSTOM') {
              // Fake auto-mapping based on provider
              const newMappings = [...mappings];
              newMappings.forEach(m => {
                  // Simple heuristic for demo
                  const match = headers.find(h => h.toLowerCase().includes(m.label.split(' ')[0].toLowerCase()));
                  if (match) m.csvHeader = match;
              });
              setMappings(newMappings);
          }
          
          setImportStep('MAPPING');
      }
  };

  const handleAutoMap = () => {
      // Simulate AI Mapping
      const newMappings = [...mappings];
      newMappings.forEach(m => {
          const match = csvHeaders.find(h => 
              h.toLowerCase().includes(m.systemField.toLowerCase()) || 
              h.toLowerCase().includes(m.label.toLowerCase()) ||
              (m.systemField === 'amount' && h.includes('Betrag')) ||
              (m.systemField === 'invoiceNumber' && h.includes('Rechnung'))
          );
          if (match) m.csvHeader = match;
      });
      setMappings(newMappings);
  };

  const executeImport = async () => {
      if(!tenant) return;
      setIsImporting(true);
      await dataService.processImport(tenant.id, mappings, importProvider);
      setIsImporting(false);
      setImportStep('SUCCESS');
  };

  const resetImport = () => {
      setIsImportOpen(false);
      setTimeout(() => {
        setImportStep('PROVIDER');
        setImportFile(null);
        setImportProvider('CUSTOM');
        setMappings(mappings.map(m => ({...m, csvHeader: null})));
      }, 300);
  };

  if (loading) return <div className="p-12 text-center text-slate-500 animate-pulse">Lade Mandantenakte...</div>;
  if (error) return (
    <div className="p-12 text-center">
      <div className="glass-panel p-12 rounded-[32px] border-2 border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 max-w-2xl mx-auto">
        <p className="text-red-600 dark:text-red-400 font-bold mb-2">Fehler beim Laden</p>
        <p className="text-red-500 dark:text-red-400 text-sm mb-4">{error}</p>
        <Button variant="secondary" onClick={() => navigate('/tenants')}>
          <ArrowLeft size={18} className="mr-2" /> Zurück zur Übersicht
        </Button>
      </div>
    </div>
  );
  if (!tenant) return <div className="p-12 text-center">Mandant nicht gefunden.</div>;

  const stats = {
      volume: cases.reduce((sum, c) => sum + c.totalAmount, 0),
      openCases: cases.filter(c => c.status !== CaseStatus.PAID && c.status !== CaseStatus.UNCOLLECTIBLE).length,
      legal: cases.filter(c => [CaseStatus.MB_REQUESTED, CaseStatus.MB_ISSUED, CaseStatus.TITLE_OBTAINED, CaseStatus.GV_MANDATED].includes(c.status)).length,
  };

  const getStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case CaseStatus.NEW: return <Badge color="blue">Neu</Badge>;
      case CaseStatus.PAID: return <Badge color="green">Bezahlt</Badge>;
      case CaseStatus.MB_REQUESTED: 
      case CaseStatus.MB_ISSUED:
      case CaseStatus.TITLE_OBTAINED: return <Badge color="purple">Gerichtlich</Badge>;
      default: return <Badge color="yellow">Offen</Badge>;
    }
  };

  const ProviderCard = ({ type, label, icon: Icon, color }: any) => (
      <div 
        onClick={() => { setImportProvider(type); setImportStep('UPLOAD'); }}
        className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col items-center gap-4 group
            ${importProvider === type 
                ? 'bg-monetaris-50 border-monetaris-500 ring-2 ring-monetaris-500/20 dark:bg-monetaris-500/10 dark:border-monetaris-400' 
                : 'bg-white dark:bg-[#151515] border-slate-200 dark:border-white/10 hover:border-monetaris-300 dark:hover:border-monetaris-500/50 hover:shadow-lg'}`}
      >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg group-hover:scale-110 transition-transform ${color}`}>
             <Icon size={24} />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">{label}</span>
      </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <Button variant="ghost" onClick={() => navigate('/tenants')} className="mb-4 pl-0 hover:bg-transparent">
        <ArrowLeft size={18} className="mr-2" /> Zurück zur Übersicht
      </Button>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
             <div className="flex items-start md:items-center gap-4 mb-4">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shrink-0">
                    <Building2 size={32} />
                </div>
                <div>
                    <h1 className="text-2xl md:text-4xl font-display font-bold text-slate-900 dark:text-white break-all">{tenant.name}</h1>
                    <div className="flex items-center gap-3 mt-2">
                         <Badge color="green">Aktiv</Badge>
                         <span className="font-mono text-xs text-slate-500">{tenant.registrationNumber}</span>
                    </div>
                </div>
             </div>
        </div>
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <Button variant="secondary" onClick={() => navigate('/settings')} className="flex-1 lg:flex-none"><Settings size={18} className="mr-2"/> Einstellungen</Button>
            <Button variant="glow" className="flex-1 lg:flex-none">Bericht erstellen</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div onClick={() => handleStatClick('ALL')} className="cursor-pointer hover:scale-[1.02] transition-transform duration-300">
            <Card className="bg-gradient-to-br from-monetaris-600 to-emerald-600 text-white border-none relative overflow-hidden h-full" noPadding>
                <div className="p-6 md:p-8 relative z-10">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                    <p className="text-white/80 font-bold uppercase tracking-widest text-[10px] mb-2 flex items-center gap-1">
                        <Wallet size={12}/> Gesamtvolumen
                    </p>
                    <h3 className="text-3xl font-display font-bold">€ {(stats.volume / 1000).toFixed(1)}k</h3>
                    <p className="text-xs text-white/60 mt-2 font-bold flex items-center"><Filter size={10} className="mr-1"/> Alle anzeigen</p>
                </div>
            </Card>
          </div>

          <div onClick={() => handleStatClick('OPEN')} className="cursor-pointer hover:scale-[1.02] transition-transform duration-300">
            <Card className="dark:bg-[#0A0A0A] h-full border border-slate-200 dark:border-white/10 hover:border-monetaris-500 dark:hover:border-monetaris-500/50 transition-colors">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2 flex items-center gap-1">
                    <FileText size={12}/> Offene Akten
                </p>
                <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white">{stats.openCases}</h3>
                <p className="text-xs text-slate-400 mt-2 font-bold flex items-center group-hover:text-monetaris-500"><Filter size={10} className="mr-1"/> Filtern</p>
            </Card>
          </div>

          <div onClick={() => handleStatClick('LEGAL')} className="cursor-pointer hover:scale-[1.02] transition-transform duration-300">
            <Card className="dark:bg-[#0A0A0A] h-full border border-slate-200 dark:border-white/10 hover:border-monetaris-500 dark:hover:border-monetaris-500/50 transition-colors">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2 flex items-center gap-1">
                    <Gavel size={12}/> Gerichtliche Verfahren
                </p>
                <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white">{stats.legal}</h3>
                 <p className="text-xs text-slate-400 mt-2 font-bold flex items-center group-hover:text-monetaris-500"><Filter size={10} className="mr-1"/> Filtern</p>
            </Card>
          </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-white/10 overflow-x-auto custom-scrollbar">
         <button 
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'OVERVIEW' ? 'border-monetaris-500 text-monetaris-600 dark:text-monetaris-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'}`}
         >
            Übersicht & Zugang
         </button>
         <button 
            onClick={() => setActiveTab('CLAIMS')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'CLAIMS' ? 'border-monetaris-500 text-monetaris-600 dark:text-monetaris-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'}`}
         >
            Aktenverzeichnis ({filteredCases.length})
         </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
          {activeTab === 'OVERVIEW' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-2">
                 <Card className="dark:bg-[#0A0A0A]">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Building2 className="text-monetaris-500" size={20} /> Stammdaten
                    </h3>
                    <div className="space-y-6">
                         <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-slate-100 dark:border-white/5 gap-1">
                             <span className="text-sm text-slate-500">Firmenname</span>
                             <span className="text-sm font-bold text-slate-900 dark:text-white">{tenant.name}</span>
                         </div>
                         <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-slate-100 dark:border-white/5 gap-1">
                             <span className="text-sm text-slate-500">Handelsregister</span>
                             <span className="text-sm font-bold text-slate-900 dark:text-white">{tenant.registrationNumber}</span>
                         </div>
                         <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-slate-100 dark:border-white/5 gap-1">
                             <span className="text-sm text-slate-500">Kontakt E-Mail</span>
                             <span className="text-sm font-bold text-slate-900 dark:text-white">{tenant.contactEmail}</span>
                         </div>
                         <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-slate-100 dark:border-white/5 gap-1">
                             <span className="text-sm text-slate-500">Auszahlungskonto (IBAN)</span>
                             <span className="text-sm font-mono font-bold text-slate-900 dark:text-white break-all">{tenant.bankAccountIBAN}</span>
                         </div>
                    </div>
                 </Card>

                 <Card className="dark:bg-[#0A0A0A]">
                     <div className="flex justify-between items-center mb-6">
                         <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                             <Shield className="text-monetaris-500" size={20} /> Zugriffsberechtigte
                         </h3>
                         <Button size="sm" variant="secondary">User Einladen</Button>
                     </div>
                     <div className="space-y-4">
                         {users.length === 0 ? (
                             <p className="text-slate-500 text-sm">Keine Benutzer zugeordnet.</p>
                         ) : (
                             users.map(u => (
                                 <div key={u.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#151515] border border-slate-100 dark:border-white/5">
                                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-[#202020] dark:to-[#252525] flex items-center justify-center text-slate-700 dark:text-white font-bold text-xs shrink-0">
                                         {u.name.charAt(0)}
                                     </div>
                                     <div className="flex-1 min-w-0">
                                         <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{u.name}</p>
                                         <p className="text-xs text-slate-500 truncate">{u.email}</p>
                                     </div>
                                     <Badge color="gray">{u.role}</Badge>
                                 </div>
                             ))
                         )}
                     </div>
                 </Card>
             </div>
          )}

          {activeTab === 'CLAIMS' && (
              <div className="animate-in slide-in-from-bottom-2 space-y-6">
                  {/* Actions Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-[#0A0A0A] p-2 rounded-2xl border border-slate-200 dark:border-white/10">
                      <div className="flex gap-2 px-2">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide pt-2">Ansicht:</span>
                          <div className="flex gap-1">
                            <button onClick={() => setFilterType('ALL')} className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${filterType === 'ALL' ? 'bg-white dark:bg-[#202020] shadow text-slate-900 dark:text-white' : 'text-slate-500'}`}>Alle</button>
                            <button onClick={() => setFilterType('OPEN')} className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${filterType === 'OPEN' ? 'bg-white dark:bg-[#202020] shadow text-slate-900 dark:text-white' : 'text-slate-500'}`}>Offen</button>
                            <button onClick={() => setFilterType('LEGAL')} className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${filterType === 'LEGAL' ? 'bg-white dark:bg-[#202020] shadow text-slate-900 dark:text-white' : 'text-slate-500'}`}>Gericht</button>
                          </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                          <Button variant="secondary" size="sm" className="flex-1 sm:flex-none" onClick={() => setIsImportOpen(true)}>
                              <FileSpreadsheet size={16} className="mr-2" /> CSV Import
                          </Button>
                          <Button variant="glow" size="sm" className="flex-1 sm:flex-none">
                              Neuanlage
                          </Button>
                      </div>
                  </div>

                  {filteredCases.length === 0 ? (
                      <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                          <p className="text-slate-500 font-bold">Keine Akten mit diesem Filter gefunden.</p>
                          <Button variant="ghost" onClick={() => setFilterType('ALL')} className="mt-4">Filter zurücksetzen</Button>
                      </div>
                  ) : (
                    <Card noPadding className="overflow-hidden dark:bg-[#0A0A0A]">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-white/5">
                                <thead className="bg-slate-50 dark:bg-[#050505]">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Az.</th>
                                        <th className="px-6 py-4 text-left text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Schuldner</th>
                                        <th className="px-6 py-4 text-left text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Betrag</th>
                                        <th className="px-6 py-4 text-left text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                                        <th className="px-6 py-4 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                    {filteredCases.map(c => (
                                        <tr 
                                            key={c.id} 
                                            onClick={() => setSelectedClaim(c)}
                                            className="hover:bg-slate-50 dark:hover:bg-[#111111] transition-colors cursor-pointer group"
                                        >
                                            <td className="px-6 py-4 text-sm font-mono font-bold text-slate-900 dark:text-white group-hover:text-monetaris-600 transition-colors whitespace-nowrap">{c.invoiceNumber}</td>
                                            <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">{c.debtorName}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">€ {c.totalAmount.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(c.status)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Settings size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                  )}
              </div>
          )}
      </div>

      {/* --- Intelligent Import Modal --- */}
      <Modal isOpen={isImportOpen} onClose={resetImport} title="Forderungs-Import Assistent">
        <div className="space-y-8 min-h-[400px] animate-in fade-in duration-300">
            
            {/* Stepper */}
            <div className="flex items-center justify-between px-4 md:px-12 relative">
                <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-100 dark:bg-white/10 -z-10"></div>
                {['Provider', 'Upload', 'Mapping', 'Finish'].map((step, idx) => {
                    const isActive = (importStep === 'PROVIDER' && idx === 0) || 
                                   (importStep === 'UPLOAD' && idx <= 1) || 
                                   (importStep === 'MAPPING' && idx <= 2) || 
                                   (importStep === 'SUCCESS');
                    const isCurrent = (importStep === 'PROVIDER' && idx === 0) || 
                                    (importStep === 'UPLOAD' && idx === 1) || 
                                    (importStep === 'MAPPING' && idx === 2) || 
                                    (importStep === 'SUCCESS' && idx === 3);
                    
                    return (
                        <div key={step} className={`flex flex-col items-center bg-white dark:bg-[#0A0A0A] px-2`}>
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500
                                ${isActive ? 'bg-monetaris-500 text-white shadow-lg shadow-monetaris-500/30' : 'bg-slate-100 dark:bg-[#202020] text-slate-400'}`}>
                                {idx + 1}
                             </div>
                             <span className={`text-[10px] font-bold uppercase mt-2 tracking-wider ${isCurrent ? 'text-monetaris-600 dark:text-monetaris-400' : 'text-slate-400'}`}>{step}</span>
                        </div>
                    );
                })}
            </div>

            {/* Step 1: Provider Selection */}
            {importStep === 'PROVIDER' && (
                <div className="animate-in slide-in-from-right-4 duration-500">
                    <h3 className="text-center text-xl font-display font-bold text-slate-900 dark:text-white mb-2">Quelle wählen</h3>
                    <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-8">Wählen Sie Ihr Buchhaltungssystem für automatische Feldzuordnung.</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <ProviderCard type="DATEV" label="DATEV" icon={Database} color="bg-[#0A5B32]" />
                        <ProviderCard type="SAP" label="SAP" icon={Database} color="bg-[#008FD3]" />
                        <ProviderCard type="SEVDESK" label="SevDesk" icon={FileText} color="bg-[#FF5F00]" />
                        <ProviderCard type="LEXWARE" label="Lexware" icon={Database} color="bg-[#C80A3C]" />
                        <ProviderCard type="CUSTOM" label="Manuell / CSV" icon={FileSpreadsheet} color="bg-slate-800" />
                    </div>
                </div>
            )}

            {/* Step 2: Upload */}
            {importStep === 'UPLOAD' && (
                <div className="animate-in slide-in-from-right-4 duration-500 text-center">
                     <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-8">
                         {importProvider === 'CUSTOM' ? 'CSV Datei hochladen' : `${importProvider} Export hochladen`}
                     </h3>
                     
                     <div 
                        className="border-2 border-dashed border-slate-300 dark:border-white/10 rounded-3xl p-10 hover:border-monetaris-500 dark:hover:border-monetaris-500/50 hover:bg-slate-50 dark:hover:bg-[#111111] transition-all cursor-pointer group"
                        onClick={() => importFileRef.current?.click()}
                     >
                         <div className="w-20 h-20 bg-slate-100 dark:bg-[#151515] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform text-slate-400 group-hover:text-monetaris-500">
                             <UploadCloud size={40} />
                         </div>
                         <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">Datei hier ablegen oder klicken</p>
                         <p className="text-sm text-slate-500 dark:text-slate-400">Unterstützt .csv, .xlsx (Max 10MB)</p>
                         <input ref={importFileRef} type="file" className="hidden" accept=".csv,.xlsx" onChange={handleImportFileSelect} />
                     </div>
                     
                     <Button variant="ghost" className="mt-6" onClick={() => setImportStep('PROVIDER')}>Zurück zur Auswahl</Button>
                </div>
            )}

            {/* Step 3: Mapping */}
            {importStep === 'MAPPING' && (
                <div className="animate-in slide-in-from-right-4 duration-500">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                           <h3 className="text-lg font-bold text-slate-900 dark:text-white">Feldzuordnung</h3>
                           <p className="text-xs text-slate-500 dark:text-slate-400">Verbinden Sie die Spalten Ihrer CSV mit dem System.</p>
                        </div>
                        <Button size="sm" variant="glow" onClick={handleAutoMap}>
                           <Sparkles size={14} className="mr-2" /> AI Auto-Match
                        </Button>
                    </div>

                    <div className="bg-slate-50 dark:bg-[#151515] rounded-2xl p-4 border border-slate-200 dark:border-white/5 max-h-[300px] overflow-y-auto custom-scrollbar space-y-3">
                         {mappings.map((mapping, idx) => (
                             <div key={mapping.systemField} className="flex items-center justify-between gap-4 p-3 bg-white dark:bg-[#0A0A0A] rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
                                 <div className="flex-1">
                                     <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-500 mb-1">Systemfeld</p>
                                     <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                         {mapping.label} 
                                         {mapping.required && <span className="text-red-500">*</span>}
                                     </p>
                                 </div>
                                 <div className="text-slate-300 dark:text-slate-600">
                                     <ArrowRight size={16} />
                                 </div>
                                 <div className="flex-1">
                                     <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-500 mb-1">CSV Spalte</p>
                                     <select 
                                        className="w-full text-sm p-2 rounded-lg bg-slate-50 dark:bg-[#151515] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-monetaris-500 outline-none"
                                        value={mapping.csvHeader || ''}
                                        onChange={(e) => {
                                            const newM = [...mappings];
                                            newM[idx].csvHeader = e.target.value;
                                            setMappings(newM);
                                        }}
                                     >
                                         <option value="">-- Wählen --</option>
                                         {csvHeaders.map(h => (
                                             <option key={h} value={h}>{h}</option>
                                         ))}
                                     </select>
                                 </div>
                             </div>
                         ))}
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-6">
                         <Button variant="ghost" onClick={() => setImportStep('UPLOAD')}>Zurück</Button>
                         <Button 
                            variant="primary" 
                            onClick={executeImport} 
                            loading={isImporting}
                            disabled={mappings.some(m => m.required && !m.csvHeader)}
                         >
                            Import Starten
                         </Button>
                    </div>
                </div>
            )}

            {/* Step 4: Success */}
            {importStep === 'SUCCESS' && (
                <div className="animate-in zoom-in duration-500 text-center py-10">
                     <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400">
                         <Check size={40} />
                     </div>
                     <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-2">Import erfolgreich!</h3>
                     <p className="text-slate-500 dark:text-slate-400 mb-8">Die Forderungen wurden importiert und befinden sich im Status "Neu".</p>
                     <Button variant="glow" onClick={resetImport}>Abschließen</Button>
                </div>
            )}

        </div>
      </Modal>

      {/* Existing Claim Detail Modal */}
      <ClaimDetailModal 
        isOpen={!!selectedClaim} 
        onClose={() => setSelectedClaim(null)} 
        claim={selectedClaim}
        onNavigateToDebtor={(id) => navigate(`/debtors/${id}`)} 
      />
    </div>
  );
};