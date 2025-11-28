
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader, Card, Badge, Button, CreationWizard, SearchableSelect } from '../components/UI';
import { ClaimDetailModal } from '../components/ClaimDetailModal';
import { casesApi, kreditorenApi, debtorsApi } from '../services/api/apiClient';
import { authService } from '../services/authService';
import { CollectionCase, CaseStatus, UserRole, Kreditor, Debtor } from '../types';
import { Download, MoreVertical, Scale, Search, Send, Phone, Gavel, Archive, Mail, DollarSign, FileText, Plus, AlertCircle, LayoutGrid, List, Calendar, Filter, X, Building2, Users, Check, Smartphone, MapPin, Clock, ArrowRight, RotateCw, User, Globe } from 'lucide-react';
import { logger } from '../utils/logger';

export const Claims: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [cases, setCases] = useState<CollectionCase[]>([]);
  const [filteredCases, setFilteredCases] = useState<CollectionCase[]>([]);
  const [kreditoren, setKreditoren] = useState<Kreditor[]>([]);
  const [debtors, setDebtors] = useState<Debtor[]>([]);

  // Modal states
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [actionTarget, setActionTarget] = useState<CollectionCase | null>(null);
  const [noteText, setNoteText] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKreditorId, setSelectedKreditorId] = useState<string>('');
  const [selectedDebtorId, setSelectedDebtorId] = useState<string>('');
  
  // Scope Toggle
  const [viewScope, setViewScope] = useState<'MINE' | 'ALL'>('ALL'); // Default 'ALL' for lists usually, or 'MINE'

  const [userRole, setUserRole] = useState<UserRole>(UserRole.CLIENT);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  
  const [selectedClaim, setSelectedClaim] = useState<CollectionCase | null>(null);
  const [viewMode, setViewMode] = useState<'TABLE' | 'BOARD' | 'FIELD_AGENT'>('TABLE');

  // Field Agent State
  const [currentAgentIndex, setCurrentAgentIndex] = useState(0);

  // Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Context Menu State
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const isAgentOrAdmin = userRole === UserRole.AGENT || userRole === UserRole.ADMIN;

  // --- Load Data & Params ---
  const loadCases = async () => {
    setLoading(true);
    setError(null);

    try {
      const { user } = authService.checkSession();
      if (!user) return;

      setUserRole(user.role);
      setCurrentUserId(user.id);

      // Fetch data using API client with pagination
      // Use Promise.allSettled to handle partial failures gracefully
      const [caseResult, kreditorResult, debtorResult] = await Promise.allSettled([
        casesApi.getAll({ page: 1, pageSize: 1000 }),
        kreditorenApi.getAll({ page: 1, pageSize: 1000 }),
        debtorsApi.getAll({ page: 1, pageSize: 1000 })
      ]);

      // Extract data from paginated responses, using empty arrays as fallback
      const caseData = caseResult.status === 'fulfilled' ? (caseResult.value.data || []) : [];
      const kreditorData = kreditorResult.status === 'fulfilled' ? (kreditorResult.value.data || []) : [];
      const debtorData = debtorResult.status === 'fulfilled' ? (debtorResult.value.data || []) : [];

      // Log any failed requests for debugging
      if (caseResult.status === 'rejected') logger.warn('Failed to load cases:', caseResult.reason);
      if (kreditorResult.status === 'rejected') logger.warn('Failed to load kreditoren:', kreditorResult.reason);
      if (debtorResult.status === 'rejected') logger.warn('Failed to load debtors:', debtorResult.reason);

      // Sort by urgency/date
      caseData.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

      setCases(caseData);
      setKreditoren(kreditorData);
      setDebtors(debtorData);

      const paramKreditor = searchParams.get('kreditorId');
      const paramDebtor = searchParams.get('debtorId');
      const paramView = searchParams.get('view');

      if (paramKreditor) setSelectedKreditorId(paramKreditor);
      if (paramDebtor) setSelectedDebtorId(paramDebtor);
      if (paramView === 'BOARD') setViewMode('BOARD');

      if (!paramView && window.innerWidth < 768) {
        setViewMode('FIELD_AGENT');
      }
    } catch (err: any) {
      logger.error('Error loading cases:', err);
      setError(err.message || 'Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  // --- Filtering Logic ---
  useEffect(() => {
    let result = cases;

    // 0. Scope Filter - Enable for Agent AND Admin
    if (viewScope === 'MINE' && isAgentOrAdmin && currentUserId) {
        result = result.filter(c => c.agentId === currentUserId);
    }

    // 1. Global Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.invoiceNumber.toLowerCase().includes(lowerTerm) || 
        c.debtorName.toLowerCase().includes(lowerTerm)
      );
    }

    // 2. Status Filter (Tabs)
    if (filterStatus !== 'ALL') {
      if (filterStatus === 'LEGAL') {
         result = result.filter(c => [CaseStatus.MB_REQUESTED, CaseStatus.MB_ISSUED, CaseStatus.PREPARE_VB, CaseStatus.TITLE_OBTAINED, CaseStatus.GV_MANDATED].includes(c.status));
      } else {
         result = result.filter(c => c.status === filterStatus);
      }
    }

    // 3. Kreditor Filter
    if (selectedKreditorId) {
        result = result.filter(c => c.kreditorId === selectedKreditorId);
    }

    // 4. Debtor Filter
    if (selectedDebtorId) {
        result = result.filter(c => c.debtorId === selectedDebtorId);
    }

    setFilteredCases(result);
    setCurrentAgentIndex(0); 
  }, [filterStatus, searchTerm, cases, selectedKreditorId, selectedDebtorId, viewScope, userRole, currentUserId]);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Workflow Actions ---
  const handleNextStep = async (c: CollectionCase) => {
    try {
      let nextStatus = c.status;
      let note = "Triggered manually";

      if (c.status === CaseStatus.REMINDER_2) nextStatus = CaseStatus.PREPARE_MB;
      else if (c.status === CaseStatus.PREPARE_MB) nextStatus = CaseStatus.MB_REQUESTED;
      else if (c.status === CaseStatus.MB_REQUESTED) nextStatus = CaseStatus.MB_ISSUED;
      else if (c.status === CaseStatus.MB_ISSUED) nextStatus = CaseStatus.PREPARE_VB;
      else if (c.status === CaseStatus.PREPARE_VB) nextStatus = CaseStatus.VB_REQUESTED;

      await casesApi.advanceWorkflow(c.id, nextStatus, note);
      loadCases();
    } catch (err: any) {
      logger.error('Error advancing workflow:', err);
      alert(err.message || 'Fehler beim Fortschreiten des Workflows');
    }
  };

  const onDragStart = (e: React.DragEvent, caseId: string) => {
      e.dataTransfer.setData("caseId", caseId);
      e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent) => {
      e.preventDefault(); 
      e.dataTransfer.dropEffect = "move";
  };

  const onDrop = async (e: React.DragEvent, targetStatus: CaseStatus) => {
    e.preventDefault();
    const caseId = e.dataTransfer.getData("caseId");
    if (!caseId) return;

    const currentCase = cases.find(c => c.id === caseId);
    if (!currentCase || currentCase.status === targetStatus) return;

    // Optimistic update
    const updatedCases = cases.map(c => c.id === caseId ? { ...c, status: targetStatus } : c);
    setCases(updatedCases);

    try {
      // Use direct update API (no workflow validation) for drag & drop
      // This allows free movement between status columns
      await casesApi.update(caseId, { status: targetStatus });
      loadCases();
    } catch (err: any) {
      logger.error('Error updating status via drag:', err);
      // Revert optimistic update on error
      setCases(cases);
      alert(err.message || 'Fehler beim Aktualisieren des Status');
    }
  };

  const handleAgentAction = async (action: 'LATER' | 'DONE') => {
      if (action === 'DONE') {
          const currentCase = filteredCases[currentAgentIndex];
          if (currentCase) {
              await handleNextStep(currentCase);
          }
      }
      if (currentAgentIndex < filteredCases.length - 1) {
          setCurrentAgentIndex(currentAgentIndex + 1);
      } else {
          alert("Liste abgearbeitet!");
          setCurrentAgentIndex(0);
      }
  };

  const handleMenuClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const xPos = rect.left > window.innerWidth - 250 ? rect.left - 220 : rect.left;
    setMenuPosition({ x: xPos, y: rect.bottom + 5 });
    setMenuOpenId(menuOpenId === id ? null : id);
  };

  const getActionsForStatus = (status: CaseStatus, caseItem: CollectionCase) => {
    const actions = [];
    actions.push({
      label: 'Notiz erstellen',
      icon: FileText,
      action: () => {
        setActionTarget(caseItem);
        setShowNoteModal(true);
        setMenuOpenId(null);
      }
    });
    actions.push({
      label: 'E-Mail an Schuldner',
      icon: Mail,
      action: () => {
        setActionTarget(caseItem);
        setEmailSubject(`Forderung ${caseItem.invoiceNumber}`);
        setShowEmailModal(true);
        setMenuOpenId(null);
      }
    });
    return actions;
  };

  const handleCreateNote = () => {
    if (!actionTarget || !noteText.trim()) return;
    // In production, this would call the API
    logger.info('Note created for case', actionTarget.id, noteText);
    setShowNoteModal(false);
    setNoteText('');
    setActionTarget(null);
  };

  const handleSendEmail = () => {
    if (!actionTarget || !emailSubject.trim() || !emailBody.trim()) return;
    // In production, this would call the API
    logger.info('Email sent to debtor for case', actionTarget.id);
    setShowEmailModal(false);
    setEmailSubject('');
    setEmailBody('');
    setActionTarget(null);
  };

  const handleArchiveCase = async () => {
    if (!actionTarget) return;
    try {
      // In production, this would call the API to archive
      // await casesApi.archive(actionTarget.id);
      logger.info('Case archived:', actionTarget.id);
      setCases(prev => prev.filter(c => c.id !== actionTarget.id));
      setShowArchiveConfirm(false);
      setActionTarget(null);
      setMenuOpenId(null);
    } catch (err) {
      logger.error('Failed to archive case:', err);
    }
  };

  const exportToCsv = () => {
    try {
      // CSV Header (German)
      const headers = [
        'Rechnungsnummer',
        'Schuldner',
        'Mandant',
        'Status',
        'Hauptforderung',
        'Kosten',
        'Zinsen',
        'Gesamtforderung',
        'Währung',
        'Fälligkeitsdatum',
        'Rechnungsdatum',
        'Erstellt am',
        'Aktenzeichen'
      ];

      // Convert cases to CSV rows
      const rows = filteredCases.map(c => [
        c.invoiceNumber,
        c.debtorName,
        c.kreditorName || '',
        c.status,
        c.principalAmount.toFixed(2),
        c.costs.toFixed(2),
        c.interest.toFixed(2),
        c.totalAmount.toFixed(2),
        c.currency,
        new Date(c.dueDate).toLocaleDateString('de-DE'),
        new Date(c.invoiceDate).toLocaleDateString('de-DE'),
        new Date(c.createdAt || Date.now()).toLocaleDateString('de-DE'),
        c.courtFileNumber || ''
      ]);

      // Build CSV content with UTF-8 BOM for Excel compatibility
      const BOM = '\uFEFF';
      const csvContent = BOM + [
        headers.join(';'),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
      ].join('\n');

      // Create download blob
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `forderungen_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      logger.info('CSV export completed:', filteredCases.length, 'cases');
    } catch (err) {
      logger.error('CSV export failed:', err);
      alert('Fehler beim CSV-Export');
    }
  };

  const getStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case CaseStatus.NEW: return <Badge color="blue">Neu</Badge>;
      case CaseStatus.REMINDER_1: return <Badge color="yellow">1. Mahnung</Badge>;
      case CaseStatus.REMINDER_2: return <Badge color="yellow">Letzte Mahnung</Badge>;
      case CaseStatus.PREPARE_MB: return <Badge color="purple">Vorber. MB</Badge>;
      case CaseStatus.MB_REQUESTED: return <Badge color="purple">MB Beantragt</Badge>;
      case CaseStatus.MB_ISSUED: return <Badge color="purple">MB Erlassen</Badge>;
      case CaseStatus.PREPARE_VB: return <Badge color="red">Vorber. VB</Badge>;
      case CaseStatus.TITLE_OBTAINED: return <Badge color="red">Titel</Badge>;
      case CaseStatus.GV_MANDATED: return <Badge color="red">GV Beauf.</Badge>;
      case CaseStatus.PAID: return <Badge color="green">Bezahlt</Badge>;
      default: return <Badge color="gray">{status}</Badge>;
    }
  };

  const tabs = [
    { id: 'ALL', label: 'Alle Forderungen' },
    { id: CaseStatus.REMINDER_2, label: 'Aktion nötig' },
    { id: 'LEGAL', label: 'Gerichtl. Verfahren' },
    { id: CaseStatus.PAID, label: 'Bezahlt' },
  ];

  // --- Kanban Board Render Logic ---
  const renderKanbanBoard = () => {
      const columns = [
          { id: 'OPEN', title: 'Neu / Offen', statuses: [CaseStatus.NEW, CaseStatus.DRAFT], entryStatus: CaseStatus.NEW, color: 'border-blue-500' },
          { id: 'REMINDER', title: 'Mahnwesen', statuses: [CaseStatus.REMINDER_1, CaseStatus.REMINDER_2, CaseStatus.ADDRESS_RESEARCH], entryStatus: CaseStatus.REMINDER_1, color: 'border-yellow-500' },
          { id: 'LEGAL_PREP', title: 'Vorbereitung', statuses: [CaseStatus.PREPARE_MB, CaseStatus.PREPARE_VB], entryStatus: CaseStatus.PREPARE_MB, color: 'border-orange-500' },
          { id: 'LEGAL_ACTIVE', title: 'Gerichtlich', statuses: [CaseStatus.MB_REQUESTED, CaseStatus.MB_ISSUED, CaseStatus.VB_REQUESTED, CaseStatus.VB_ISSUED, CaseStatus.TITLE_OBTAINED, CaseStatus.GV_MANDATED, CaseStatus.MB_OBJECTION], entryStatus: CaseStatus.MB_REQUESTED, color: 'border-red-500' },
          { id: 'DONE', title: 'Erledigt', statuses: [CaseStatus.PAID, CaseStatus.SETTLED, CaseStatus.UNCOLLECTIBLE, CaseStatus.INSOLVENCY], entryStatus: CaseStatus.PAID, color: 'border-emerald-500' }
      ];

      return (
          <div className="flex overflow-x-auto gap-4 pb-6 h-[calc(100vh-320px)] min-w-full snap-x">
              {columns.map(col => {
                  const colCases = filteredCases.filter(c => col.statuses.includes(c.status));
                  const totalAmount = colCases.reduce((acc, curr) => acc + curr.totalAmount, 0);

                  return (
                      <div 
                        key={col.id} 
                        className="flex-shrink-0 w-80 snap-center flex flex-col bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 backdrop-blur-sm transition-colors"
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, col.entryStatus)}
                      >
                          <div className={`p-4 border-b-2 ${col.color} bg-white dark:bg-[#151515] rounded-t-2xl sticky top-0 z-10`}>
                              <div className="flex justify-between items-center mb-1">
                                  <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">{col.title}</h3>
                                  <span className="bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">{colCases.length}</span>
                              </div>
                              <p className="text-xs text-slate-500 font-mono">Vol: € {(totalAmount / 1000).toFixed(1)}k</p>
                          </div>

                          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                              {colCases.map(c => (
                                  <div 
                                    key={c.id} 
                                    draggable
                                    onDragStart={(e) => onDragStart(e, c.id)}
                                    onClick={() => setSelectedClaim(c)}
                                    className="bg-white dark:bg-[#0A0A0A] p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md hover:border-monetaris-400 dark:hover:border-monetaris-500/50 transition-all cursor-grab active:cursor-grabbing group relative"
                                  >
                                      <div className="flex justify-between items-start mb-2">
                                          <span className="text-[10px] font-bold font-mono text-slate-500 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded">{c.invoiceNumber}</span>
                                          {c.status === CaseStatus.REMINDER_2 && <AlertCircle size={14} className="text-red-500 animate-pulse" />}
                                      </div>
                                      <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1 mb-1">{c.debtorName}</h4>
                                      <p className="text-lg font-bold text-slate-900 dark:text-white mb-3">€ {c.totalAmount.toLocaleString('de-DE')}</p>
                                      
                                      <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 pt-2">
                                          <span className="flex items-center gap-1"><Calendar size={10}/> {new Date(c.dueDate).toLocaleDateString()}</span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )
              })}
          </div>
      );
  };

  // --- Field Agent View Render Logic ---
  const renderFieldAgentView = () => {
      const currentCase = filteredCases[currentAgentIndex];
      const progress = filteredCases.length > 0 ? ((currentAgentIndex + 1) / filteredCases.length) * 100 : 0;
      const debtorInfo = debtors.find(d => d.id === currentCase?.debtorId);

      if (!currentCase) {
          return (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
                  <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 animate-in zoom-in">
                      <Check size={48} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Alles erledigt!</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">Keine weiteren Aufgaben in diesem Filter.</p>
              </div>
          );
      }

      return (
          <div className="flex flex-col h-[calc(100vh-200px)] max-w-md mx-auto relative">
              <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full mb-6 overflow-hidden">
                  <div className="h-full bg-monetaris-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
              
              <div className="flex-1 relative perspective-[1000px]">
                  <div className="absolute inset-0 bg-white dark:bg-[#151515] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 p-6 flex flex-col justify-between animate-in slide-in-from-bottom-4 duration-500">
                      <div>
                          <div className="flex justify-between items-start mb-2">
                              <Badge color="purple">{currentCase.invoiceNumber}</Badge>
                              <span className="text-xs font-bold text-slate-400">{currentAgentIndex + 1} / {filteredCases.length}</span>
                          </div>
                          <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white leading-tight mb-1">{currentCase.debtorName}</h2>
                          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-6">
                              <MapPin size={14}/> {debtorInfo?.address.city || 'Unbekannt'}
                          </p>
                          <div className="bg-slate-50 dark:bg-black/20 rounded-2xl p-6 text-center mb-6 border border-slate-100 dark:border-white/5">
                              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Offener Betrag</p>
                              <p className="text-4xl font-bold text-slate-900 dark:text-white">€ {currentCase.totalAmount.toLocaleString()}</p>
                          </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-6">
                          <button onClick={() => handleAgentAction('LATER')} className="flex flex-col items-center justify-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-amber-600 dark:text-amber-400 hover:scale-105 transition-transform">
                              <RotateCw size={24} className="mb-1" /><span className="text-[10px] font-bold uppercase">Später</span>
                          </button>
                          <a href={`tel:${debtorInfo?.phone}`} className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400 hover:scale-105 transition-transform">
                              <Phone size={24} className="mb-1" /><span className="text-[10px] font-bold uppercase">Anrufen</span>
                          </a>
                          <button onClick={() => handleAgentAction('DONE')} className="flex flex-col items-center justify-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600 dark:text-emerald-400 hover:scale-105 transition-transform">
                              <Check size={24} className="mb-1" /><span className="text-[10px] font-bold uppercase">Erledigt</span>
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20 relative" onClick={() => setMenuOpenId(null)}>
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-900 dark:text-red-200">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <PageHeader
        title="Forderungen"
        subtitle={`${filteredCases.length} aktive Verfahren in Bearbeitung`}
        action={
          <div className="flex gap-3 w-full sm:w-auto items-center">
            {/* Agent/Admin Filter Toggle */}
            {isAgentOrAdmin && (
               <div className="bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 p-1 rounded-xl flex items-center h-10">
                    <button
                        onClick={() => setViewScope('MINE')}
                        className={`px-3 h-full rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${viewScope === 'MINE' ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'}`}
                        title="Nur Fälle, die mir direkt zugewiesen sind"
                    >
                        <User size={14}/> Meine Ansicht
                    </button>
                    <button
                        onClick={() => setViewScope('ALL')}
                        className={`px-3 h-full rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${viewScope === 'ALL' ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'}`}
                        title="Alle Mandanten, auf die ich Zugriff habe"
                    >
                        <Globe size={14}/> Gesamt
                    </button>
               </div>
            )}
            <Button variant="secondary" onClick={exportToCsv} className="h-10" title="Als CSV exportieren">
                <Download size={18} className="mr-2" /> Export
            </Button>
            <Button variant="glow" onClick={() => setIsWizardOpen(true)} className="w-full sm:w-auto h-10">
                <Plus size={18} className="mr-2" /> Neue Forderung
            </Button>
          </div>
        }
      />

      {/* Advanced Filter Bar */}
      <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col xl:flex-row gap-4 items-center">
              <div className="flex items-center gap-2 w-full xl:w-auto text-slate-500 shrink-0">
                  <Filter size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Filter:</span>
              </div>
              
              <div className="w-full xl:w-64">
                  <SearchableSelect
                        placeholder="Mandant wählen..."
                        options={kreditoren.map(t => ({ id: t.id, title: t.name, subtitle: t.registrationNumber }))}
                        value={selectedKreditorId}
                        onChange={setSelectedKreditorId}
                        icon={Building2}
                        clearable
                  />
              </div>

              <div className="w-full xl:w-64">
                  <SearchableSelect
                        placeholder="Schuldner suchen..."
                        options={debtors.map(d => ({ id: d.id, title: d.companyName || `${d.lastName}, ${d.firstName}`, subtitle: `${d.address?.city || 'Unbekannt'} • ID: ${d.id}` }))}
                        value={selectedDebtorId}
                        onChange={setSelectedDebtorId}
                        icon={Users}
                        clearable
                  />
              </div>

              <div className="w-full xl:w-64 relative">
                  <input
                    type="text"
                    placeholder="Rechnungsnummer..."
                    className="w-full p-2.5 pl-9 pr-8 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-monetaris-500/20 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                      title="Suche löschen"
                    >
                      <X size={14} />
                    </button>
                  )}
              </div>

              {/* Clear All Filters Button */}
              {(selectedKreditorId || selectedDebtorId || searchTerm) && (
                <button
                  onClick={() => {
                    setSelectedKreditorId('');
                    setSelectedDebtorId('');
                    setSearchTerm('');
                  }}
                  className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors shrink-0"
                >
                  <X size={14} /> Filter zurücksetzen
                </button>
              )}

              <div className="flex ml-auto bg-slate-100 dark:bg-white/5 p-1 rounded-xl shrink-0 overflow-x-auto max-w-full">
                <button onClick={() => setViewMode('TABLE')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'TABLE' ? 'bg-white dark:bg-[#202020] text-black dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><List size={14} /> Liste</button>
                <button onClick={() => setViewMode('BOARD')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'BOARD' ? 'bg-white dark:bg-[#202020] text-black dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><LayoutGrid size={14} /> Board</button>
                <button onClick={() => setViewMode('FIELD_AGENT')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'FIELD_AGENT' ? 'bg-white dark:bg-[#202020] text-black dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Smartphone size={14} /> Agent</button>
            </div>
          </div>
      </div>

      {viewMode !== 'FIELD_AGENT' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {tabs.map(tab => (
                <button key={tab.id} onClick={() => setFilterStatus(tab.id)} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex-shrink-0 border ${filterStatus === tab.id ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-black dark:border-white' : 'bg-white dark:bg-[#0A0A0A] text-slate-500 border-slate-200 dark:border-white/10 hover:border-slate-300'}`}>{tab.label}</button>
            ))}
          </div>
      )}

      {viewMode === 'TABLE' ? (
          <Card noPadding className="overflow-hidden dark:bg-[#0A0A0A]">
            <div className="w-full overflow-x-auto custom-scrollbar min-h-[400px]">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-white/5">
                <thead className="bg-slate-50 dark:bg-[#050505]">
                  <tr>
                    <th className="px-6 md:px-8 py-5 text-left text-[0.65rem] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest font-display whitespace-nowrap">Az. / Datum</th>
                    <th className="px-6 md:px-8 py-5 text-left text-[0.65rem] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest font-display whitespace-nowrap">Schuldner</th>
                    <th className="px-6 md:px-8 py-5 text-left text-[0.65rem] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest font-display whitespace-nowrap">Forderung</th>
                    <th className="px-6 md:px-8 py-5 text-left text-[0.65rem] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest font-display whitespace-nowrap">Status</th>
                    <th className="px-6 md:px-8 py-5 text-left text-[0.65rem] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest font-display whitespace-nowrap">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-500 dark:text-slate-400 font-mono font-bold">Lade Datenstream...</td></tr>
                  ) : filteredCases.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-500 dark:text-slate-400 font-bold">Keine Forderungen gefunden.</td></tr>
                  ) : filteredCases.map((c) => (
                    <tr key={c.id} className="transition-all duration-200 hover:bg-slate-50 dark:hover:bg-[#111111] hover:scale-[1.01] hover:shadow-lg relative hover:z-10 group cursor-pointer" onClick={() => setSelectedClaim(c)}>
                      <td className="px-6 md:px-8 py-5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-950 dark:text-white font-mono tracking-tight">{c.invoiceNumber}</span>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-500 mt-1">{new Date(c.invoiceDate).toLocaleDateString('de-DE')}</span>
                        </div>
                      </td>
                      <td className="px-6 md:px-8 py-5 whitespace-nowrap max-w-[180px] md:max-w-xs truncate">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{c.debtorName}</span>
                            {isAgentOrAdmin && c.kreditorName && <span className="text-[10px] font-bold uppercase tracking-widest text-monetaris-600 dark:text-monetaris-400 mt-1 truncate">{c.kreditorName}</span>}
                        </div>
                      </td>
                      <td className="px-6 md:px-8 py-5 whitespace-nowrap">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-950 dark:text-white">€ {c.totalAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</span>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-500">Haupt: € {c.principalAmount.toLocaleString('de-DE')}</span>
                        </div>
                      </td>
                      <td className="px-6 md:px-8 py-5 whitespace-nowrap">
                         <div className="flex items-center gap-3">
                            {getStatusBadge(c.status)}
                            {c.courtFileNumber && <span className="hidden md:inline-block text-xs font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#151515] px-2 py-1 rounded border border-slate-200 dark:border-white/10">{c.courtFileNumber}</span>}
                         </div>
                      </td>
                      <td className="px-6 md:px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                            {isAgentOrAdmin && c.status === CaseStatus.PREPARE_MB && (
                               <Button size="sm" className="bg-ai-purple hover:bg-ai-purple/80 text-white border-0 whitespace-nowrap mr-2" onClick={(e) => {e.stopPropagation(); handleNextStep(c);}}><Scale size={14} className="mr-2" /> MB</Button>
                            )}
                            <button className={`p-2 rounded-full transition-colors relative z-20 ${menuOpenId === c.id ? 'bg-slate-200 dark:bg-[#333] text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'}`} onClick={(e) => handleMenuClick(e, c.id)}><MoreVertical size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
      ) : viewMode === 'BOARD' ? (
          renderKanbanBoard()
      ) : (
          renderFieldAgentView()
      )}

      {/* ... (ContextMenu, Wizard, Modal) ... */}
      {menuOpenId && (
        <div ref={menuRef} style={{ position: 'fixed', top: menuPosition.y, left: menuPosition.x }} className="z-[100] w-56 bg-white dark:bg-[#1A1A1A] rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 p-2 animate-in fade-in zoom-in-95 duration-200">
            {(() => {
                const c = filteredCases.find(c => c.id === menuOpenId);
                if (!c) return null;
                return (
                    <div className="space-y-1">
                        <div className="px-3 py-2 text-xs font-bold text-slate-400 border-b border-slate-100 dark:border-white/5 mb-1">Akte {c.invoiceNumber}</div>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedClaim(c); setMenuOpenId(null); }} className="w-full flex items-center px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 text-sm text-slate-700 dark:text-slate-300 transition-colors">
                            <FileText size={16} className="mr-2 text-slate-400" /> Details öffnen
                        </button>
                        {getActionsForStatus(c.status, c).map((action, idx) => (
                            <button key={idx} onClick={(e) => { e.stopPropagation(); action.action(); }} className="w-full flex items-center px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 text-sm text-slate-700 dark:text-slate-300 transition-colors">
                                <action.icon size={16} className="mr-2 text-slate-400" /> {action.label}
                            </button>
                        ))}
                        <div className="border-t border-slate-100 dark:border-white/5 my-1"></div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setActionTarget(c); setShowArchiveConfirm(true); setMenuOpenId(null); }}
                          className="w-full flex items-center px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-sm text-red-600 dark:text-red-400 transition-colors"
                        >
                            <Archive size={16} className="mr-2" /> Archivieren
                        </button>
                    </div>
                );
            })()}
        </div>
      )}

      <CreationWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
        type="CLAIM" 
        onSuccess={loadCases}
      />

      <ClaimDetailModal
        isOpen={!!selectedClaim}
        onClose={() => setSelectedClaim(null)}
        claim={selectedClaim}
        onNavigateToDebtor={(id) => navigate(`/debtors/${id}`)}
      />

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowNoteModal(false)}>
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Notiz erstellen</h3>
            <p className="text-sm text-slate-500 mb-4">Akte: {actionTarget?.invoiceNumber}</p>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Notiz eingeben..."
              className="w-full h-32 p-3 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-monetaris-500"
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={() => { setShowNoteModal(false); setNoteText(''); }}>Abbrechen</Button>
              <Button variant="glow" onClick={handleCreateNote} disabled={!noteText.trim()}>Speichern</Button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowEmailModal(false)}>
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">E-Mail an Schuldner</h3>
            <p className="text-sm text-slate-500 mb-4">Schuldner: {actionTarget?.debtorName}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Betreff</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  className="w-full p-3 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white focus:ring-2 focus:ring-monetaris-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nachricht</label>
                <textarea
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  placeholder="Nachricht eingeben..."
                  className="w-full h-40 p-3 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-monetaris-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={() => { setShowEmailModal(false); setEmailSubject(''); setEmailBody(''); }}>Abbrechen</Button>
              <Button variant="glow" onClick={handleSendEmail} disabled={!emailSubject.trim() || !emailBody.trim()}>
                <Send size={14} className="mr-1" /> Senden
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowArchiveConfirm(false)}>
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
              <Archive size={20} /> Akte archivieren?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Möchten Sie die Akte <strong>{actionTarget?.invoiceNumber}</strong> wirklich archivieren?
              Die Akte wird aus der aktiven Liste entfernt.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => { setShowArchiveConfirm(false); setActionTarget(null); }}>Abbrechen</Button>
              <Button variant="danger" onClick={handleArchiveCase}>Archivieren</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
