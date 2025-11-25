
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Card, Button, Badge, CreationWizard } from '../components/UI';
import { dataService } from '../services/dataService';
import { authService } from '../services/authService';
import { CollectionCase, CaseStatus } from '../types';
import { UploadCloud, FileText, TrendingUp, Wallet, Plus, CheckCircle2, FileSpreadsheet, Database, ArrowRight, PieChart, Activity, Clock, AlertTriangle, Download, ChevronRight, Shield } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip, BarChart, Bar, Cell } from 'recharts';

export const ClientPortal: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<CollectionCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const { user } = authService.checkSession();

  const loadData = async () => {
    if (!user?.tenantId) return;
    
    const allCases = await dataService.getCases();
    // Strict filtering for the logged-in client
    const clientCases = allCases.filter(c => c.tenantId === user.tenantId);
    
    // Sort by date desc
    clientCases.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
    
    setCases(clientCases);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // --- KPIs ---
  const stats = {
      volume: cases.reduce((acc, c) => acc + c.totalAmount, 0),
      active: cases.filter(c => c.status !== CaseStatus.PAID && c.status !== CaseStatus.UNCOLLECTIBLE).length,
      recovered: cases.filter(c => c.status === CaseStatus.PAID).reduce((acc, c) => acc + c.totalAmount, 0), // Calculated amount
      recoveredCount: cases.filter(c => c.status === CaseStatus.PAID).length,
      successRate: cases.length > 0 ? Math.round((cases.filter(c => c.status === CaseStatus.PAID).length / cases.length) * 100) : 0
  };

  const recoveryPercentage = stats.volume > 0 ? (stats.recovered / stats.volume) * 100 : 0;

  // Mock data for charts
  const cashflowData = [
      { name: 'W1', value: 4000 }, { name: 'W2', value: 3000 }, 
      { name: 'W3', value: 5000 }, { name: 'W4', value: 2780 }, 
  ];

  const workflowStages = [
      { name: 'Mahnwesen', value: cases.filter(c => [CaseStatus.NEW, CaseStatus.REMINDER_1, CaseStatus.REMINDER_2].includes(c.status)).length, color: '#F59E0B' },
      { name: 'Gerichtlich', value: cases.filter(c => [CaseStatus.MB_REQUESTED, CaseStatus.MB_ISSUED, CaseStatus.TITLE_OBTAINED].includes(c.status)).length, color: '#8B5CF6' },
      { name: 'Vollstreckung', value: cases.filter(c => [CaseStatus.GV_MANDATED, CaseStatus.EV_TAKEN].includes(c.status)).length, color: '#EF4444' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <PageHeader 
        kicker={user?.name || "Unternehmensportal"}
        title="Forderungsmanagement" 
        subtitle="Live-Überwachung Ihrer Außenstände und automatisierte Prozesssteuerung." 
      />

      {/* --- Top Section: Financial Health & Action Center --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Financial Health Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-[#0F172A] to-[#1E293B] dark:from-[#0A0A0A] dark:to-[#111] rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl border border-slate-800 dark:border-white/10 group">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 group-hover:bg-emerald-500/20 transition-colors duration-1000"></div>
              
              <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                      <div>
                          <p className="text-emerald-400 font-bold uppercase tracking-widest text-[10px] mb-2 flex items-center gap-2">
                              <Wallet size={14}/> Liquiditäts-Status
                          </p>
                          <h3 className="text-4xl md:text-5xl font-display font-bold mb-1 tracking-tight">€ {(stats.volume / 1000).toFixed(1)}k</h3>
                          <p className="text-slate-400 text-sm">Gesamtvolumen in Bearbeitung</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-right min-w-[120px]">
                          <p className="text-xs text-slate-400 uppercase font-bold mb-1">Realisiert</p>
                          <p className="text-xl font-bold text-emerald-400">+ € {(stats.recovered / 1000).toFixed(1)}k</p>
                      </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                      <div className="flex justify-between text-xs font-bold mb-2">
                          <span className="text-emerald-400">Realisierungsquote {stats.successRate}%</span>
                          <span className="text-slate-500">Ziel: 85%</span>
                      </div>
                      <div className="h-3 w-full bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full relative overflow-hidden" 
                            style={{ width: `${stats.successRate}%` }}
                          >
                              <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] -skew-x-12"></div>
                          </div>
                      </div>
                  </div>

                  <div className="flex gap-6 pt-6 border-t border-white/10">
                      <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400"><Clock size={18}/></div>
                          <div>
                              <p className="text-lg font-bold">{stats.active}</p>
                              <p className="text-[10px] text-slate-400 uppercase font-bold">Laufend</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400"><CheckCircle2 size={18}/></div>
                          <div>
                              <p className="text-lg font-bold">{stats.recoveredCount}</p>
                              <p className="text-[10px] text-slate-400 uppercase font-bold">Abgeschlossen</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* Action Center (Right Column) */}
          <div className="flex flex-col gap-4">
              {/* Primary Action */}
              <button 
                onClick={() => setIsWizardOpen(true)}
                className="flex-1 bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 hover:border-monetaris-500 dark:hover:border-monetaris-500 p-6 rounded-[24px] shadow-sm hover:shadow-xl transition-all group relative overflow-hidden text-left"
              >
                  <div className="absolute inset-0 bg-gradient-to-r from-monetaris-50 to-transparent dark:from-monetaris-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                      <div className="w-12 h-12 bg-monetaris-100 dark:bg-monetaris-900/20 text-monetaris-600 dark:text-monetaris-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Plus size={24} />
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Forderung anlegen</h3>
                          <p className="text-xs text-slate-500 mt-1">Manuell oder via Formular</p>
                      </div>
                      <div className="absolute bottom-6 right-6 text-slate-300 group-hover:text-monetaris-500 transition-colors">
                          <ArrowRight size={24} />
                      </div>
                  </div>
              </button>

              {/* Secondary Actions */}
              <div className="flex-1 grid grid-cols-2 gap-4">
                  <button onClick={() => navigate('/import')} className="bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-[#202020] transition-colors text-left flex flex-col justify-between group">
                      <UploadCloud className="text-blue-500 mb-2 group-hover:scale-110 transition-transform" size={24} />
                      <span className="text-sm font-bold text-slate-900 dark:text-white">CSV Import</span>
                  </button>
                  <button className="bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-[#202020] transition-colors text-left flex flex-col justify-between group">
                      <Database className="text-purple-500 mb-2 group-hover:scale-110 transition-transform" size={24} />
                      <span className="text-sm font-bold text-slate-900 dark:text-white">DATEV Connect</span>
                  </button>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Live Feed & Status */}
          <div className="lg:col-span-2 space-y-8">
              
              {/* "Requires Attention" Block */}
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-6 flex items-start gap-4">
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400 shrink-0">
                      <AlertTriangle size={24} />
                  </div>
                  <div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1">Entscheidung erforderlich</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                          Für 2 Akten liegen Rückfragen vor oder es wird eine Freigabe für gerichtliche Schritte benötigt.
                      </p>
                      <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white border-none shadow-lg shadow-amber-500/20">
                          Jetzt prüfen
                      </Button>
                  </div>
              </div>

              {/* Data Table */}
              <Card className="dark:bg-[#0A0A0A] overflow-hidden border-none shadow-lg" noPadding>
                  <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white dark:bg-[#101010]">
                      <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Activity size={18} className="text-monetaris-500"/> Aktive Übergaben
                      </h3>
                      <Button variant="ghost" size="sm" onClick={() => navigate('/claims')}>Alle ansehen</Button>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-100 dark:divide-white/5">
                          <thead className="bg-slate-50/50 dark:bg-[#050505]">
                              <tr>
                                  <th className="px-6 py-4 text-left text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">Rechnung</th>
                                  <th className="px-6 py-4 text-left text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">Schuldner</th>
                                  <th className="px-6 py-4 text-left text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                  <th className="px-6 py-4 text-right text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">Betrag</th>
                                  <th className="px-6 py-4"></th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-[#0A0A0A]">
                              {loading ? (
                                  <tr><td colSpan={5} className="p-8 text-center text-slate-400 animate-pulse">Synchronisiere Daten...</td></tr>
                              ) : cases.length === 0 ? (
                                  <tr><td colSpan={5} className="p-12 text-center text-slate-400 italic">Keine aktiven Forderungen gefunden.</td></tr>
                              ) : (
                                  cases.slice(0, 5).map(c => (
                                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-[#151515] transition-colors group">
                                          <td className="px-6 py-4">
                                              <div className="font-bold font-mono text-xs text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 px-2 py-1 rounded inline-block">
                                                  {c.invoiceNumber}
                                              </div>
                                              <div className="text-[10px] text-slate-400 mt-1">{new Date(c.invoiceDate).toLocaleDateString()}</div>
                                          </td>
                                          <td className="px-6 py-4">
                                              <p className="text-sm font-bold text-slate-900 dark:text-white">{c.debtorName}</p>
                                          </td>
                                          <td className="px-6 py-4">
                                              <Badge color={c.status === 'PAID' ? 'green' : c.status.includes('MB') ? 'purple' : 'yellow'}>
                                                  {c.status}
                                              </Badge>
                                          </td>
                                          <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">
                                              € {c.totalAmount.toLocaleString()}
                                          </td>
                                          <td className="px-6 py-4 text-right">
                                              <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                                  <ChevronRight size={16} />
                                              </button>
                                          </td>
                                      </tr>
                                  ))
                              )}
                          </tbody>
                      </table>
                  </div>
              </Card>
          </div>

          {/* Right: Insights & Reports */}
          <div className="space-y-6">
              
              {/* Stage Distribution Chart */}
              <Card className="dark:bg-[#0A0A0A] border-none shadow-lg">
                  <div className="mb-6">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                          <PieChart size={16} className="text-blue-500"/> Prozess-Status
                      </h3>
                      <p className="text-xs text-slate-500">Verteilung der offenen Akten</p>
                  </div>
                  <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={workflowStages} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
                              <XAxis type="number" hide />
                              <Tooltip 
                                  contentStyle={{backgroundColor: '#111', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#fff'}}
                                  cursor={{fill: 'transparent'}}
                              />
                              <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]} background={{ fill: '#f1f5f9' }}>
                                  {workflowStages.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                              </Bar>
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
                  <div className="space-y-3 mt-2">
                      {workflowStages.map((stage, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }}></div>
                                  <span className="font-bold text-slate-700 dark:text-slate-300">{stage.name}</span>
                              </div>
                              <span className="font-mono text-slate-500">{stage.value} Akten</span>
                          </div>
                      ))}
                  </div>
              </Card>

              {/* Monthly Report Card */}
              <div className="bg-slate-900 dark:bg-[#151515] text-white rounded-2xl p-6 relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <FileText size={80} />
                  </div>
                  <div className="relative z-10">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4 backdrop-blur-md">
                          <Download size={20} />
                      </div>
                      <h4 className="font-bold text-lg mb-1">Monatsabschluss</h4>
                      <p className="text-xs text-slate-400 mb-4">Download für Buchhaltung (PDF/CSV)</p>
                      <button className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-emerald-400">
                          Herunterladen <ArrowRight size={12} />
                      </button>
                  </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0A0A0A] text-center">
                  <p className="text-xs text-slate-400 mb-2">Ihr Account Manager</p>
                  <div className="flex items-center justify-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-xs font-bold">SC</div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">Sarah Connor</span>
                  </div>
                  <button className="text-xs text-monetaris-600 dark:text-monetaris-400 hover:underline">Kontakt aufnehmen</button>
              </div>

          </div>
      </div>

      <CreationWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
        type="CLAIM" 
        onSuccess={loadData}
      />
    </div>
  );
};
