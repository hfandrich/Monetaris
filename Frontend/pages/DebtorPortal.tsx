
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Card, Button, Badge, Modal, Input } from '../components/UI';
import { debtorsApi, casesApi } from '../services/api/apiClient';
import { authService } from '../services/authService';
import { CollectionCase, Debtor, Document, CaseStatus } from '../types';
import { 
  CheckCircle2, Clock, FileText, ShieldCheck, Phone, CreditCard, ArrowRight, 
  MessageSquare, Wallet, Download, X, Calendar, HelpCircle, ChevronLeft, 
  PieChart, Activity, AlertTriangle, Send, Paperclip, File, MoreVertical, ChevronDown, ArrowDown
} from 'lucide-react';

// --- Sub-Components ---

const ChatWidget = ({ isOpen, onClose, caseId }: { isOpen: boolean; onClose: () => void; caseId?: string }) => {
    const [msg, setMsg] = useState('');
    const [history, setHistory] = useState<{text: string, isUser: boolean}[]>([
        { text: "Willkommen im Support-Chat. Wie können wir Ihnen helfen?", isUser: false }
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [history]);

    const send = () => {
        if(!msg.trim()) return;
        setHistory([...history, { text: msg, isUser: true }]);
        setMsg('');
        // Mock Response
        setTimeout(() => {
            setHistory(prev => [...prev, { text: "Vielen Dank. Ein Sachbearbeiter prüft Ihr Anliegen und meldet sich in Kürze.", isUser: false }]);
        }, 1000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-4 right-4 w-80 md:w-96 bg-white dark:bg-[#151515] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-10 fade-in h-[500px]">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-xs font-bold">S</div>
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-slate-900 rounded-full"></div>
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">Support</h4>
                        <p className="text-[10px] text-slate-400">{caseId ? `Betrifft: ${caseId}` : 'Allgemeine Frage'}</p>
                    </div>
                </div>
                <button onClick={onClose}><X size={18} className="text-slate-400 hover:text-white"/></button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-[#0A0A0A] space-y-3" ref={scrollRef}>
                {history.map((h, i) => (
                    <div key={i} className={`flex ${h.isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium ${h.isUser ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white dark:bg-[#202020] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/5 rounded-tl-sm'}`}>
                            {h.text}
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-3 bg-white dark:bg-[#151515] border-t border-slate-100 dark:border-white/5 flex gap-2">
                <input 
                    className="flex-1 bg-slate-100 dark:bg-[#0A0A0A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
                    placeholder="Nachricht schreiben..."
                    value={msg}
                    onChange={e => setMsg(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && send()}
                />
                <button onClick={send} className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
};

export const DebtorPortal: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<CollectionCase[]>([]);
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<'DASHBOARD' | 'DETAIL'>('DASHBOARD');
  const [selectedCase, setSelectedCase] = useState<CollectionCase | null>(null);
  
  // Modals
  const [installmentsOpen, setInstallmentsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  
  // Installment Logic
  const [planMonths, setPlanMonths] = useState(6);

  // Refs for Scrolling
  const casesListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const session = authService.checkSession();
    if (session.user) {
        setUser(session.user);
        loadData(session.user);
    }
  }, []);

  const loadData = async (currentUser: any) => {
       try {
         // For debtor login, the user has a debtorId that matches their debtor record
         // The backend debtor login should associate the user with their debtor record

         // First try to find debtor by user email
         const debtorsResult = await debtorsApi.getAll({ email: currentUser.email });
         const allDebtors = debtorsResult?.data || [];
         const me = allDebtors.find(d => d.email === currentUser.email);

         if (me) {
             // Fetch cases for this debtor
             const casesResult = await casesApi.getAll({ debtorId: me.id });
             setCases(casesResult?.data || []);
             console.log('DebtorPortal loaded by email:', {
               debtorId: me.id,
               casesCount: casesResult?.data?.length || 0
             });
         } else if (currentUser.id) {
             // If the user ID is the debtor ID (from debtor login), use it directly
             const casesResult = await casesApi.getAll({ debtorId: currentUser.id });
             setCases(casesResult?.data || []);
             console.log('DebtorPortal loaded by user ID:', {
               userId: currentUser.id,
               casesCount: casesResult?.data?.length || 0
             });
         } else {
             // Fallback: try to load all cases the user has access to
             const casesResult = await casesApi.getAll();
             setCases(casesResult?.data || []);
             console.log('DebtorPortal loaded all cases:', {
               casesCount: casesResult?.data?.length || 0
             });
         }
       } catch (err) {
         console.error('Error loading debtor portal data:', err);
         setCases([]);
       }
  };

  const openDetail = (c: CollectionCase) => {
      setSelectedCase(c);
      setView('DETAIL');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePayment = (caseId: string) => {
      navigate(`/pay/${caseId}`);
  };

  const scrollToCases = () => {
      if (casesListRef.current) {
          casesListRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  };

  // --- Stats Calculation ---
  const openCases = cases.filter(c => c.status !== 'PAID');
  const totalDebt = openCases.reduce((acc, c) => acc + c.totalAmount, 0);
  const multipleCases = openCases.length > 1;

  // --- Views ---

  const renderDashboard = () => (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Welcome Hero */}
          <div className="relative overflow-hidden bg-slate-900 dark:bg-[#101010] rounded-[32px] p-8 md:p-12 text-white shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                  <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider mb-4">
                          <ShieldCheck size={12} className="text-emerald-400" />
                          Sicherer Bereich
                      </div>
                      <h1 className="text-3xl md:text-5xl font-display font-bold mb-2">Guten Tag, {user?.name.split(' ')[0]}.</h1>
                      <p className="text-slate-400 text-lg">Hier ist Ihre aktuelle Übersicht.</p>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl min-w-[200px]">
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Offener Gesamtsaldo</p>
                      <div className="text-3xl font-mono font-bold text-emerald-400">€ {totalDebt.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
                  </div>
              </div>
          </div>

          {/* Action Cards */}
          {totalDebt > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => multipleCases ? scrollToCases() : openDetail(openCases[0])} 
                    className="group p-6 bg-white dark:bg-[#151515] rounded-3xl border border-slate-200 dark:border-white/5 hover:border-emerald-500 dark:hover:border-emerald-500/50 transition-all shadow-sm hover:shadow-lg text-left relative overflow-hidden"
                  >
                      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                          <CreditCard size={24} />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                          {multipleCases ? 'Zahlung tätigen' : 'Jetzt zahlen'}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                          {multipleCases ? 'Bitte Akte auswählen.' : 'Direkt & sicher begleichen.'}
                      </p>
                      {multipleCases && (
                          <div className="absolute top-4 right-4 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-1 rounded-full">
                              {openCases.length} Offen
                          </div>
                      )}
                  </button>

                  <button 
                    onClick={() => { 
                        if (multipleCases) {
                            scrollToCases(); 
                        } else if (openCases[0]) { 
                            setSelectedCase(openCases[0]); 
                            setInstallmentsOpen(true); 
                        } 
                    }}
                    className="group p-6 bg-white dark:bg-[#151515] rounded-3xl border border-slate-200 dark:border-white/5 hover:border-blue-500 dark:hover:border-blue-500/50 transition-all shadow-sm hover:shadow-lg text-left relative overflow-hidden"
                  >
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                          <Calendar size={24} />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg">Ratenplan</h3>
                      <p className="text-sm text-slate-500 mt-1">Monatliche Raten anpassen.</p>
                      {multipleCases && (
                          <div className="absolute top-4 right-4 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                              <ArrowDown size={10} /> Wählen
                          </div>
                      )}
                  </button>

                  <button 
                    onClick={() => setChatOpen(true)}
                    className="group p-6 bg-white dark:bg-[#151515] rounded-3xl border border-slate-200 dark:border-white/5 hover:border-purple-500 dark:hover:border-purple-500/50 transition-all shadow-sm hover:shadow-lg text-left"
                  >
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                          <HelpCircle size={24} />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg">Hilfe & Kontakt</h3>
                      <p className="text-sm text-slate-500 mt-1">Fragen zur Forderung?</p>
                  </button>
              </div>
          )}

          {/* Case List */}
          <div ref={casesListRef}>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 px-2 flex items-center gap-2">
                  Ihre Akten <span className="bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs">{cases.length}</span>
              </h2>
              <div className="space-y-4">
                  {cases.map(c => (
                      <div 
                        key={c.id} 
                        onClick={() => openDetail(c)}
                        className="group relative bg-white dark:bg-[#151515] p-6 rounded-3xl border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      >
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div className="flex items-center gap-4">
                                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold ${c.status === 'PAID' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20' : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400'}`}>
                                      {c.status === 'PAID' ? <CheckCircle2 /> : <FileText />}
                                  </div>
                                  <div>
                                      <div className="flex items-center gap-2 mb-1">
                                          <h3 className="font-bold text-slate-900 dark:text-white">{c.tenantName || 'Unbekannter Gläubiger'}</h3>
                                          {c.status === 'PAID' && <Badge color="green">Erledigt</Badge>}
                                          {c.status !== 'PAID' && <Badge color="red">Offen</Badge>}
                                      </div>
                                      <p className="text-sm text-slate-500 font-medium">Rechnung {c.invoiceNumber} • {new Date(c.invoiceDate).toLocaleDateString()}</p>
                                  </div>
                              </div>
                              
                              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end pl-18 md:pl-0">
                                  <div className="text-right">
                                      <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Betrag</p>
                                      <p className={`text-xl font-mono font-bold ${c.status === 'PAID' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                          € {c.totalAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                                      </p>
                                  </div>
                                  <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                                      <ArrowRight size={18} />
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  const renderDetail = () => {
      if (!selectedCase) return null;

      // Mock Documents linked to this case (since data is random)
      const mockDocs: Document[] = [
          { id: 'doc1', debtorId: selectedCase.debtorId, name: `Originalrechnung ${selectedCase.invoiceNumber}.pdf`, type: 'PDF', size: 102400, uploadedAt: selectedCase.invoiceDate, url: '#' },
          { id: 'doc2', debtorId: selectedCase.debtorId, name: 'Mahnung_1.pdf', type: 'PDF', size: 54000, uploadedAt: new Date(Date.now() - 86400000 * 7).toISOString(), url: '#' },
      ];

      return (
          <div className="animate-in slide-in-from-right-8 duration-500 pb-20">
              <button 
                onClick={() => setView('DASHBOARD')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-6 font-bold"
              >
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm">
                    <ChevronLeft size={16} />
                  </div>
                  Zurück zur Übersicht
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-8">
                      
                      {/* Header Card */}
                      <div className="bg-white dark:bg-[#151515] rounded-[32px] p-8 border border-slate-200 dark:border-white/5 shadow-xl relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-monetaris-500 to-blue-500"></div>
                          <div className="flex justify-between items-start mb-6">
                              <div>
                                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Forderung {selectedCase.invoiceNumber}</h1>
                                  <p className="text-slate-500 flex items-center gap-2">
                                      <Building2 size={16}/> {selectedCase.tenantName}
                                  </p>
                              </div>
                              <Badge color={selectedCase.status === 'PAID' ? 'green' : 'red'} >
                                  {selectedCase.status === 'PAID' ? 'Bezahlt' : 'Offen'}
                              </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-t border-slate-100 dark:border-white/5">
                              <div>
                                  <p className="text-xs text-slate-400 uppercase font-bold">Rechnungsdatum</p>
                                  <p className="font-bold text-slate-900 dark:text-white mt-1">{new Date(selectedCase.invoiceDate).toLocaleDateString()}</p>
                              </div>
                              <div>
                                  <p className="text-xs text-slate-400 uppercase font-bold">Fällig Seit</p>
                                  <p className="font-bold text-red-500 mt-1">{new Date(selectedCase.dueDate).toLocaleDateString()}</p>
                              </div>
                              <div>
                                  <p className="text-xs text-slate-400 uppercase font-bold">Hauptforderung</p>
                                  <p className="font-bold text-slate-900 dark:text-white mt-1">€ {selectedCase.principalAmount.toLocaleString()}</p>
                              </div>
                              <div>
                                  <p className="text-xs text-slate-400 uppercase font-bold">Mahnkosten</p>
                                  <p className="font-bold text-slate-900 dark:text-white mt-1">€ {selectedCase.costs.toLocaleString()}</p>
                              </div>
                          </div>

                          <div className="bg-slate-50 dark:bg-[#101010] rounded-2xl p-4 flex justify-between items-center">
                              <span className="font-bold text-slate-700 dark:text-slate-300">Gesamtsumme</span>
                              <span className="text-2xl font-mono font-bold text-slate-900 dark:text-white">€ {selectedCase.totalAmount.toLocaleString()}</span>
                          </div>
                      </div>

                      {/* Documents Section */}
                      <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                              <Paperclip size={18} className="text-monetaris-500" /> Dokumente zur Akte
                          </h3>
                          <div className="space-y-3">
                              {mockDocs.map(doc => (
                                  <div key={doc.id} className="group flex items-center justify-between p-4 bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/5 rounded-2xl hover:shadow-md transition-all">
                                      <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 bg-red-50 dark:bg-red-900/10 rounded-xl flex items-center justify-center text-red-500">
                                              <FileText size={20} />
                                          </div>
                                          <div>
                                              <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-monetaris-600 transition-colors">{doc.name}</p>
                                              <p className="text-xs text-slate-500">{new Date(doc.uploadedAt).toLocaleDateString()} • {(doc.size/1024).toFixed(0)} KB</p>
                                          </div>
                                      </div>
                                      <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                          <Download size={18} />
                                      </button>
                                  </div>
                              ))}
                          </div>
                      </div>

                      {/* Timeline / History */}
                      <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                              <Activity size={18} className="text-blue-500" /> Verlauf
                          </h3>
                          <div className="relative pl-4 border-l-2 border-slate-200 dark:border-white/10 space-y-6">
                              <div className="relative">
                                  <div className="absolute -left-[21px] top-0 w-4 h-4 bg-blue-500 rounded-full border-4 border-white dark:border-[#0A0A0A]"></div>
                                  <p className="text-sm font-bold text-slate-900 dark:text-white">Akte an Inkasso übergeben</p>
                                  <p className="text-xs text-slate-500 mt-1">{new Date().toLocaleDateString()}</p>
                              </div>
                              <div className="relative">
                                  <div className="absolute -left-[21px] top-0 w-4 h-4 bg-slate-300 dark:bg-white/20 rounded-full border-4 border-white dark:border-[#0A0A0A]"></div>
                                  <p className="text-sm font-bold text-slate-900 dark:text-white">Rechnung erstellt</p>
                                  <p className="text-xs text-slate-500 mt-1">{new Date(selectedCase.invoiceDate).toLocaleDateString()}</p>
                              </div>
                          </div>
                      </div>

                  </div>

                  {/* Sidebar Actions */}
                  <div className="space-y-6">
                      {selectedCase.status !== 'PAID' && (
                          <div className="bg-white dark:bg-[#151515] p-6 rounded-[32px] border border-slate-200 dark:border-white/5 shadow-lg sticky top-6">
                              <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Aktionen</h3>
                              
                              <Button variant="glow" className="w-full mb-3 h-12 text-base" onClick={() => handlePayment(selectedCase.id)}>
                                  <CreditCard size={18} className="mr-2"/> Jetzt bezahlen
                              </Button>
                              
                              <Button variant="secondary" className="w-full mb-3 h-12" onClick={() => setInstallmentsOpen(true)}>
                                  <PieChart size={18} className="mr-2"/> Ratenzahlung
                              </Button>
                              
                              <Button variant="outline" className="w-full h-12" onClick={() => setChatOpen(true)}>
                                  <MessageSquare size={18} className="mr-2"/> Frage stellen
                              </Button>

                              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 text-center">
                                  <p className="text-xs text-slate-400 mb-2">Problem mit der Forderung?</p>
                                  <button className="text-xs font-bold text-red-500 hover:underline flex items-center justify-center gap-1 w-full">
                                      <AlertTriangle size={12} /> Widerspruch einlegen
                                  </button>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      );
  };

  // --- Function for Installment Calculation ---
  const calculatePlan = () => {
      if(!selectedCase) return { rate: 0, total: 0, fee: 0 };
      const interest = selectedCase.totalAmount * 0.05; // 5% flat fee
      const total = selectedCase.totalAmount + interest;
      return {
          rate: total / planMonths,
          total: total,
          fee: interest
      };
  };
  const plan = calculatePlan();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#050505] font-sans text-slate-900 dark:text-white transition-colors duration-500">
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            {view === 'DASHBOARD' ? renderDashboard() : renderDetail()}
        </div>

        {/* Chat Widget */}
        <ChatWidget isOpen={chatOpen} onClose={() => setChatOpen(false)} caseId={selectedCase?.invoiceNumber} />

        {/* Installment Modal */}
        <Modal isOpen={installmentsOpen} onClose={() => setInstallmentsOpen(false)} title="Ratenplan konfigurieren">
            <div className="space-y-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-500/20 flex gap-3">
                    <Clock className="text-blue-500 shrink-0" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">Wählen Sie eine Laufzeit zwischen 3 und 24 Monaten. Eine einmalige Gebühr von 5% wird erhoben.</p>
                </div>

                <div className="py-8 px-4">
                    <input 
                        type="range" 
                        min="3" 
                        max="24" 
                        step="1" 
                        value={planMonths}
                        onChange={(e) => setPlanMonths(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-monetaris-500 mb-4"
                    />
                    <div className="flex justify-between font-bold text-slate-500 text-xs">
                        <span>3 Monate</span>
                        <span className="text-monetaris-600 text-base">{planMonths} Monate</span>
                        <span>24 Monate</span>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-[#151515] rounded-2xl p-6 space-y-3 border border-slate-100 dark:border-white/5">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Ursprungsbetrag</span>
                        <span className="font-bold">€ {selectedCase?.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Gebühren & Zinsen</span>
                        <span className="font-bold text-slate-900 dark:text-white">+ € {plan.fee.toLocaleString(undefined, {maximumFractionDigits:2})}</span>
                    </div>
                    <div className="h-px bg-slate-200 dark:bg-white/10 my-2"></div>
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-lg">Monatliche Rate</span>
                        <span className="font-bold text-2xl text-monetaris-600 dark:text-monetaris-400">€ {plan.rate.toLocaleString(undefined, {maximumFractionDigits:2})}</span>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setInstallmentsOpen(false)}>Abbrechen</Button>
                    <Button variant="glow" onClick={() => { alert('Plan beantragt!'); setInstallmentsOpen(false); }}>Plan verbindlich beantragen</Button>
                </div>
            </div>
        </Modal>

    </div>
  );
};

function Building2(props: any) {
    return (
        <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M8 10h.01" />
      <path d="M16 10h.01" />
      <path d="M8 14h.01" />
      <path d="M16 14h.01" />
    </svg>
    )
}
