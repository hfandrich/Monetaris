import React, { useState } from 'react';
import { Modal, Button, Badge } from './UI';
import { CollectionCase, CaseStatus } from '../types';
import {
  Calculator,
  History,
  Gavel,
  Calendar,
  User,
  CreditCard,
  ExternalLink,
  FileText,
  SplitSquareHorizontal,
  X,
  Maximize2,
  Copy,
  QrCode,
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowRightLeft,
  MessageSquare,
  Smartphone,
  Send,
  Phone,
  BookOpen,
  StickyNote,
  Plus,
} from 'lucide-react';

interface ClaimDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: CollectionCase | null;
  onNavigateToDebtor?: (debtorId: string) => void;
}

export const ClaimDetailModal: React.FC<ClaimDetailModalProps> = ({
  isOpen,
  onClose,
  claim,
  onNavigateToDebtor,
}) => {
  const [splitView, setSplitView] = useState(false);
  const [showSharePopover, setShowSharePopover] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!claim) return null;

  const paymentLink = `${window.location.origin}/#/pay/${claim.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case CaseStatus.NEW:
        return <Badge color="blue">Neu</Badge>;
      case CaseStatus.REMINDER_1:
        return <Badge color="yellow">1. Mahnung</Badge>;
      case CaseStatus.REMINDER_2:
        return <Badge color="yellow">Letzte Mahnung</Badge>;
      case CaseStatus.PREPARE_MB:
        return <Badge color="purple">Vorber. MB</Badge>;
      case CaseStatus.MB_REQUESTED:
        return <Badge color="purple">MB Beantragt</Badge>;
      case CaseStatus.MB_ISSUED:
        return <Badge color="purple">MB Erlassen</Badge>;
      case CaseStatus.PREPARE_VB:
        return <Badge color="red">Vorber. VB</Badge>;
      case CaseStatus.TITLE_OBTAINED:
        return <Badge color="red">Titel</Badge>;
      case CaseStatus.GV_MANDATED:
        return <Badge color="red">GV Beauf.</Badge>;
      case CaseStatus.PAID:
        return <Badge color="green">Bezahlt</Badge>;
      default:
        return <Badge color="gray">{status}</Badge>;
    }
  };

  const getEventColor = (action: string) => {
    const lower = action.toLowerCase();
    if (lower.includes('payment') || lower.includes('zahlung') || lower.includes('paid'))
      return 'emerald';
    if (lower.includes('due') || lower.includes('frist') || lower.includes('alert')) return 'red';
    if (
      lower.includes('mb') ||
      lower.includes('vb') ||
      lower.includes('court') ||
      lower.includes('legal')
    )
      return 'purple';
    if (
      lower.includes('email') ||
      lower.includes('message') ||
      lower.includes('reminder') ||
      lower.includes('call') ||
      lower.includes('note') ||
      lower.includes('letter')
    )
      return 'blue';
    return 'slate';
  };

  const getActionIcon = (action: string, color: string) => {
    const lower = action.toLowerCase();
    const className = `text-${color}-500`;

    if (lower.includes('email') || lower.includes('mailer'))
      return <Mail size={14} className={className} />;
    if (lower.includes('phone') || lower.includes('call') || lower.includes('anruf'))
      return <Phone size={14} className={className} />;
    if (lower.includes('letter') || lower.includes('brief'))
      return <BookOpen size={14} className={className} />;
    if (lower.includes('note') || lower.includes('notiz'))
      return <StickyNote size={14} className={className} />;
    if (lower.includes('status')) return <ArrowRightLeft size={14} className={className} />;
    if (lower.includes('payment') || lower.includes('zahlung'))
      return <CheckCircle2 size={14} className={className} />;
    if (lower.includes('due') || lower.includes('frist'))
      return <AlertCircle size={14} className={className} />;
    if (lower.includes('invoice')) return <FileText size={14} className={className} />;
    return <MessageSquare size={14} className={className} />;
  };

  // Wrapper for Full Screen Modal Logic if SplitView is on
  if (splitView && isOpen) {
    return (
      <div className="fixed inset-0 z-[100] bg-white dark:bg-[#050505] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Toolbar */}
        <div className="h-16 border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-6 bg-slate-50 dark:bg-[#101010]">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText size={18} className="text-monetaris-500" />
              Akte: {claim.invoiceNumber}
            </h3>
            {getStatusBadge(claim.status)}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => setSplitView(false)}>
              <Maximize2 size={16} className="mr-2" /> Standardansicht
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onClose}
              className="bg-red-500 border-none text-white hover:bg-red-600"
            >
              <X size={16} className="mr-2" /> Schließen
            </Button>
          </div>
        </div>

        {/* Split Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Data */}
          <div className="w-1/2 border-r border-slate-200 dark:border-white/10 overflow-y-auto p-8 bg-white dark:bg-[#0A0A0A]">
            <div className="max-w-2xl mx-auto">
              <h4 className="text-xs font-bold uppercase text-slate-500 mb-6 tracking-widest">
                Stammdaten & Forderung
              </h4>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Schuldner</label>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {claim.debtorName}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">
                      Rechnungsnummer
                    </label>
                    <div className="font-mono text-slate-700 dark:text-slate-300">
                      {claim.invoiceNumber}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">
                      Fälligkeitsdatum
                    </label>
                    <div className="font-mono text-slate-700 dark:text-slate-300">
                      {new Date(claim.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#151515] border border-slate-100 dark:border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-500">Hauptforderung</span>
                    <span className="font-bold dark:text-white">
                      € {claim.principalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-500">Kosten & Zinsen</span>
                    <span className="font-bold dark:text-white">
                      € {(claim.costs + claim.interest).toFixed(2)}
                    </span>
                  </div>
                  <div className="h-px bg-slate-200 dark:bg-white/10 my-3"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      Gesamtsumme
                    </span>
                    <span className="text-xl font-bold text-monetaris-600 dark:text-monetaris-400">
                      € {claim.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Document Viewer */}
          <div className="w-1/2 bg-slate-100 dark:bg-[#121212] flex flex-col">
            <div className="h-10 bg-slate-200 dark:bg-[#1A1A1A] flex items-center px-4 text-xs font-bold text-slate-500 justify-between border-b border-slate-300 dark:border-white/10">
              <span>Originalbeleg.pdf</span>
              <span>Seite 1 / 1</span>
            </div>
            <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
              {/* Simulated PDF Viewer */}
              <div className="bg-white shadow-2xl w-[400px] h-[560px] flex flex-col p-8 relative group cursor-zoom-in transition-transform hover:scale-105">
                <div className="absolute top-0 left-0 w-full h-2 bg-blue-500"></div>
                <div className="mt-4 mb-8 flex justify-between">
                  <div className="w-24 h-8 bg-slate-200 rounded"></div>
                  <div className="text-right">
                    <div className="w-32 h-4 bg-slate-100 rounded mb-2"></div>
                    <div className="w-24 h-3 bg-slate-100 rounded ml-auto"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="w-full h-px bg-slate-100"></div>
                  <div className="w-3/4 h-4 bg-slate-100 rounded"></div>
                  <div className="w-1/2 h-4 bg-slate-100 rounded"></div>
                  <div className="w-full h-32 bg-slate-50 rounded border border-slate-100"></div>
                  <div className="flex justify-end mt-8">
                    <div className="w-32 h-8 bg-slate-200 rounded"></div>
                  </div>
                </div>

                {/* Overlay Badge for "Verified" */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Badge color="green">Dokument OK</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Akte ${claim.invoiceNumber}`}>
      <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300 relative">
        {/* Header Status */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
              Aktueller Status
            </p>
            <div className="flex items-center gap-3">
              {getStatusBadge(claim.status)}
              {claim.courtFileNumber && (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#151515] px-2 py-1 rounded border border-slate-200 dark:border-white/10">
                  <Gavel size={14} />
                  Az: {claim.courtFileNumber}
                </div>
              )}
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Calendar size={14} />
              <span>Fällig am: {new Date(claim.dueDate).toLocaleDateString('de-DE')}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
              Gesamtforderung
            </p>
            <p className="text-4xl font-display font-bold text-slate-900 dark:text-white">
              € {claim.totalAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex gap-3 overflow-x-auto pb-2 relative">
          <div className="relative">
            <Button variant="glow" size="sm" onClick={() => setShowSharePopover(!showSharePopover)}>
              <CreditCard size={16} className="mr-2" /> Payment Portal
            </Button>

            {/* Magic Link Popover */}
            {showSharePopover && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-[#151515] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 p-4 z-50 animate-in slide-in-from-top-2 duration-200">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                    <QrCode size={12} /> Magic Link
                  </h4>
                  <button onClick={() => setShowSharePopover(false)}>
                    <X size={14} className="text-slate-400 hover:text-slate-900" />
                  </button>
                </div>

                {/* QR Code Mock */}
                <div
                  className="bg-white p-4 rounded-xl border border-slate-100 flex justify-center mb-4 shadow-inner relative group cursor-pointer"
                  onClick={() => window.open(paymentLink, '_blank')}
                >
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(paymentLink)}&color=10-15-20`}
                    alt="Payment QR"
                    className="w-32 h-32 mix-blend-multiply"
                  />
                  <div className="absolute inset-0 bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <ExternalLink size={12} /> Öffnen
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    readOnly
                    value={paymentLink}
                    className="flex-1 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-lg px-2 text-[10px] text-slate-500 truncate focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-2 bg-slate-100 dark:bg-[#202020] hover:bg-slate-200 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
                    title="Kopieren"
                  >
                    {copied ? (
                      <CheckCircle2 size={14} className="text-green-500" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>

                <button className="w-full py-2 bg-slate-50 dark:bg-[#202020] hover:bg-slate-100 dark:hover:bg-[#252525] text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                  <Smartphone size={12} /> Via SMS senden (Mock)
                </button>
              </div>
            )}
          </div>

          <Button variant="secondary" size="sm" onClick={() => setSplitView(true)}>
            <SplitSquareHorizontal size={16} className="mr-2" /> Aktenprüfung
          </Button>
          {onNavigateToDebtor && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigateToDebtor(claim.debtorId)}
            >
              <User size={16} className="mr-2" /> Schuldnerakte
            </Button>
          )}
        </div>

        {/* Financial Breakdown */}
        <div className="glass-panel p-6 rounded-2xl bg-slate-50 dark:bg-[#151515] border border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <Calculator size={18} className="text-monetaris-500" />
            <h4 className="font-bold text-slate-900 dark:text-white">Forderungsaufstellung</h4>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">Hauptforderung</span>
              <span className="font-bold text-slate-900 dark:text-white">
                € {claim.principalAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">Mahn- & Gerichtskosten</span>
              <span className="font-bold text-slate-900 dark:text-white">
                € {claim.costs.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">Zinsen (5% p.a.)</span>
              <span className="font-bold text-slate-900 dark:text-white">
                € {claim.interest.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="h-px bg-slate-200 dark:bg-white/10 my-2"></div>
            <div className="flex justify-between items-center text-base font-bold">
              <span className="text-slate-900 dark:text-white">Gesamt</span>
              <span className="text-monetaris-600 dark:text-monetaris-400">
                € {claim.totalAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Timeline (Metro Style) */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <History size={18} className="text-slate-400" />
              <h4 className="font-bold text-slate-900 dark:text-white">Kommunikation & Historie</h4>
            </div>
            <div className="flex gap-2">
              <button
                className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:scale-110 transition-transform"
                title="E-Mail senden"
              >
                <Mail size={16} />
              </button>
              <button
                className="p-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:scale-110 transition-transform"
                title="Anruf loggen"
              >
                <Phone size={16} />
              </button>
              <button
                className="p-2 rounded-full bg-slate-100 dark:bg-[#202020] text-slate-600 dark:text-slate-300 hover:scale-110 transition-transform"
                title="Notiz hinzufügen"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="relative pl-2 space-y-0">
            {claim.history
              .slice()
              .reverse()
              .map((entry, i, arr) => {
                const color = getEventColor(entry.action);
                const icon = getActionIcon(entry.action, color);

                return (
                  <div key={entry.id} className="relative pl-8 pb-8 group">
                    {/* Connecting Line - Dynamic Color */}
                    {i !== arr.length - 1 && (
                      <div
                        className={`absolute left-[11px] top-8 bottom-0 w-[2px] transition-colors ${
                          color === 'emerald'
                            ? 'bg-emerald-200 dark:bg-emerald-900/50'
                            : color === 'red'
                              ? 'bg-red-200 dark:bg-red-900/50'
                              : color === 'purple'
                                ? 'bg-purple-200 dark:bg-purple-900/50'
                                : color === 'blue'
                                  ? 'bg-blue-200 dark:bg-blue-900/50'
                                  : 'bg-slate-200 dark:bg-white/10'
                        }`}
                      ></div>
                    )}

                    {/* Icon Node */}
                    <div
                      className={`absolute left-0 top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white dark:bg-[#0A0A0A] z-10 transition-all duration-300
                      ${i === 0 ? `border-${color}-500 shadow-[0_0_15px_rgba(var(--color-${color}-500),0.4)] scale-110` : `border-slate-200 dark:border-white/20`}`}
                    >
                      {icon}
                    </div>

                    {/* Content Card */}
                    <div
                      className={`p-4 rounded-xl border transition-all duration-300 ${i === 0 ? `bg-${color}-50 dark:bg-${color}-900/10 border-${color}-200 dark:border-${color}-500/30` : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-100'}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider ${i === 0 ? `text-${color}-700 dark:text-${color}-400` : 'text-slate-500'}`}
                        >
                          {entry.action.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(entry.date).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                        {entry.details}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                        <User size={10} /> {entry.actor}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-white/5">
          <Button variant="secondary" onClick={onClose}>
            Schließen
          </Button>
        </div>
      </div>
    </Modal>
  );
};
