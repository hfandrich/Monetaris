
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader, Card, Badge, Button, Modal, FileIcon } from '../components/UI';
import { ClaimDetailModal } from '../components/ClaimDetailModal';
import { dataService } from '../services/dataService';
import { Debtor, CollectionCase, Document, CaseStatus, RiskScore } from '../types';
import { MapPin, Phone, Mail, Download, Eye, UploadCloud, ArrowLeft, Calendar, FileText, AlertTriangle, History, Calculator, Gavel, LayoutGrid } from 'lucide-react';

export const DebtorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [debtor, setDebtor] = useState<Debtor | null>(null);
  const [cases, setCases] = useState<CollectionCase[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState<'CLAIMS' | 'DOCUMENTS'>('CLAIMS');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<CollectionCase | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      if (id) {
        const data = await dataService.getDebtorById(id);
        if (data) {
          setDebtor(data.debtor);
          setCases(data.cases);
        }
        const docs = await dataService.getDebtorDocuments(id);
        setDocuments(docs);
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && debtor) {
      setUploading(true);
      const newDoc = await dataService.uploadDocument(debtor.id, e.target.files[0]);
      setDocuments([newDoc, ...documents]);
      setUploading(false);
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

  if (loading) return <div className="p-12 text-center text-slate-500 animate-pulse">Lade Schuldnerakte...</div>;
  if (!debtor) return <div className="p-12 text-center">Schuldner nicht gefunden.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <Button variant="ghost" onClick={() => navigate('/debtors')} className="mb-4 pl-0 hover:bg-transparent">
        <ArrowLeft size={18} className="mr-2" /> Zurück zur Übersicht
      </Button>

      {/* Header Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <PageHeader 
             kicker={`ID: ${debtor.id}`}
             title={debtor.companyName || `${debtor.lastName}, ${debtor.firstName}`}
             subtitle="Schuldner-Detailansicht"
           />
           
           <div className="glass-panel p-8 rounded-[32px] border border-slate-200 dark:border-white/10 dark:bg-[#0A0A0A]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                     <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Kontaktdaten</h4>
                     <div className="space-y-3">
                        <div className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                           <MapPin className="mt-1 text-slate-400" size={18} />
                           <span>{debtor.address.street}<br/>{debtor.address.zipCode} {debtor.address.city}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                           <Mail className="text-slate-400" size={18} />
                           <a href={`mailto:${debtor.email}`} className="hover:text-monetaris-500 transition-colors">{debtor.email}</a>
                        </div>
                        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                           <Phone className="text-slate-400" size={18} />
                           <span>{debtor.phone}</span>
                        </div>
                     </div>
                  </div>
                  <div>
                     <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Interne Notizen</h4>
                     <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-500/20">
                        <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{debtor.notes || 'Keine Notizen vorhanden.'}"</p>
                     </div>
                  </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-1">
           <Card className="h-full bg-slate-900 text-white dark:bg-[#111111] flex flex-col justify-between border-none relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-monetaris-500/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Bonität & Risiko</h4>
                <div className="flex items-center justify-between mb-8">
                    <div className="text-center">
                        <div className={`text-6xl font-display font-bold mb-2 ${
                            debtor.riskScore === RiskScore.E ? 'text-red-500' :
                            debtor.riskScore === RiskScore.D ? 'text-orange-500' :
                            'text-monetaris-500'
                        }`}>{debtor.riskScore}</div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Score</p>
                    </div>
                    <div className="h-16 w-[1px] bg-white/10"></div>
                    <div className="text-right">
                        <div className="text-3xl font-display font-bold text-white">€ {debtor.totalDebt.toLocaleString()}</div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Gesamtschuld</p>
                    </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/10">
                 <div className="flex items-start gap-3">
                    <AlertTriangle className="text-yellow-400 shrink-0" size={20} />
                    <p className="text-xs text-slate-300 leading-relaxed">
                        Systemwarnung: Erhöhtes Ausfallrisiko. Inkassoprozess beschleunigen empfohlen.
                    </p>
                 </div>
              </div>
           </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-white/10">
         <button 
            onClick={() => setActiveTab('CLAIMS')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'CLAIMS' ? 'border-monetaris-500 text-monetaris-600 dark:text-monetaris-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'}`}
         >
            Offene Forderungen ({cases.length})
         </button>
         <button 
            onClick={() => setActiveTab('DOCUMENTS')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'DOCUMENTS' ? 'border-monetaris-500 text-monetaris-600 dark:text-monetaris-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'}`}
         >
            Dokumentenablage ({documents.length})
         </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
         {activeTab === 'CLAIMS' && (
            <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
               
               {/* Direct Link to Main Board */}
               <div className="flex justify-end mb-4">
                   <Button size="sm" variant="secondary" onClick={() => navigate(`/claims?debtorId=${debtor.id}&view=BOARD`)} className="border-monetaris-200 bg-monetaris-50 text-monetaris-700 dark:bg-monetaris-500/10 dark:text-monetaris-400 dark:border-monetaris-500/30">
                       <LayoutGrid size={16} className="mr-2"/> Als Kanban Board öffnen
                   </Button>
               </div>

               {cases.map(c => (
                  <div key={c.id} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between hover:border-slate-300 dark:hover:border-white/20 transition-colors dark:bg-[#0A0A0A] cursor-pointer" onClick={() => setSelectedClaim(c)}>
                     <div className="flex items-center gap-4 mb-4 md:mb-0">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-[#151515] flex items-center justify-center text-slate-500">
                           <FileText size={20} />
                        </div>
                        <div>
                           <h4 className="text-lg font-bold text-slate-900 dark:text-white">{c.invoiceNumber}</h4>
                           <p className="text-xs text-slate-500 dark:text-slate-400">Vom {new Date(c.invoiceDate).toLocaleDateString()} • Fällig: {new Date(c.dueDate).toLocaleDateString()}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-6">
                        <div className="text-right">
                           <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">€ {c.totalAmount.toLocaleString()}</p>
                           {getStatusBadge(c.status)}
                        </div>
                        <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setSelectedClaim(c); }}>Details</Button>
                     </div>
                  </div>
               ))}
            </div>
         )}

         {activeTab === 'DOCUMENTS' && (
             <div className="animate-in slide-in-from-bottom-2 duration-300">
                {/* Upload Area */}
                <div 
                    className="mb-8 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-2xl p-8 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-[#111111] hover:border-monetaris-500 transition-colors group"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="w-12 h-12 bg-monetaris-100 dark:bg-monetaris-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-monetaris-600 dark:text-monetaris-400 group-hover:scale-110 transition-transform">
                        {uploading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div> : <UploadCloud size={24} />}
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Dokument hochladen</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Klicken zum Auswählen (PDF, JPG, PNG)</p>
                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
                </div>

                {/* Document Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {documents.map(doc => (
                        <div key={doc.id} className="glass-panel p-4 rounded-2xl group relative hover:-translate-y-1 transition-transform dark:bg-[#0A0A0A]">
                            <div className="aspect-square bg-slate-100 dark:bg-[#151515] rounded-xl mb-3 flex items-center justify-center relative overflow-hidden">
                                {doc.previewUrl ? (
                                    <img src={doc.previewUrl} alt="preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                    <FileIcon type={doc.type} className="w-12 h-12" />
                                )}
                                {/* Overlay Buttons */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                                    <button onClick={() => setPreviewDoc(doc)} className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors" title="Vorschau">
                                        <Eye size={16} />
                                    </button>
                                    <button className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors" title="Download">
                                        <Download size={16} />
                                    </button>
                                </div>
                            </div>
                            <h5 className="font-bold text-sm text-slate-900 dark:text-white truncate mb-1" title={doc.name}>{doc.name}</h5>
                            <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                <span>{(doc.size / 1024).toFixed(0)} KB</span>
                                <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
         )}
      </div>

      {/* Document Preview Modal */}
      <Modal isOpen={!!previewDoc} onClose={() => setPreviewDoc(null)} title={previewDoc?.name}>
          {previewDoc && (
              <div className="flex flex-col items-center">
                  {previewDoc.type === 'IMAGE' && previewDoc.previewUrl ? (
                      <img src={previewDoc.previewUrl} alt="Full Preview" className="max-w-full rounded-lg shadow-lg mb-6" />
                  ) : (
                      <div className="w-full h-64 bg-slate-100 dark:bg-[#151515] rounded-2xl flex flex-col items-center justify-center mb-6">
                          <FileIcon type={previewDoc.type} className="w-24 h-24 mb-4" />
                          <p className="text-slate-500">Vorschau für diesen Dateityp nicht verfügbar.</p>
                      </div>
                  )}
                  <div className="flex gap-4">
                      <Button variant="primary">
                          <Download size={18} className="mr-2" /> Datei Herunterladen
                      </Button>
                      <Button variant="secondary" onClick={() => setPreviewDoc(null)}>Schließen</Button>
                  </div>
              </div>
          )}
      </Modal>

      {/* Claim Detail Modal (Reusable) */}
      <ClaimDetailModal isOpen={!!selectedClaim} onClose={() => setSelectedClaim(null)} claim={selectedClaim} />
    </div>
  );
};
