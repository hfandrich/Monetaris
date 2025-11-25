
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Card, Button, Badge, CreationWizard, WizardType } from '../components/UI';
import { dataService } from '../services/dataService';
import { authService } from '../services/authService';
import { DashboardStats, Inquiry, UserRole, CollectionCase, CaseStatus, DashboardWidgetConfig, WidgetType } from '../types';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, FunnelChart, Funnel, LabelList, Cell, ComposedChart, Line } from 'recharts';
import { TrendingUp, ArrowRight, Activity, Sparkles, MessageSquare, Zap, Shield, AlertTriangle, CheckCircle2, Clock, Briefcase, Wallet, Gavel, GripVertical, Eye, EyeOff, X, Plus, Send, Phone, AlertCircle, FilePlus, RotateCcw, LayoutTemplate, Users, Building2, Globe, User } from 'lucide-react';

const StatsOverviewWidget = ({ stats, userRole }: { stats: DashboardStats, userRole: UserRole }) => {
  const StatCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
    <div className="flex flex-col justify-between h-full p-6 rounded-2xl bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
       <div className={`absolute -right-10 -top-10 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${color.split(' ')[0]}`}></div>
       <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
             <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{title}</p>
             <h3 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white">{value}</h3>
          </div>
          <div className={`p-3 rounded-xl ${color} transition-transform group-hover:scale-110 duration-300`}>
             <Icon size={20} />
          </div>
       </div>
       {subtitle && (
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 relative z-10">
             {subtitle}
          </div>
       )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 h-full">
        <StatCard 
            title="Gesamtvolumen"
            value={`€ ${(stats.totalVolume / 1000).toFixed(1)}k`} 
            subtitle={<span className="text-emerald-500 font-bold flex items-center gap-1"><TrendingUp size={12}/> +12.5%</span>}
            icon={Wallet}
            color="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
        />
        <StatCard 
            title="Aktive Akten"
            value={stats.activeCases}
            subtitle="In Bearbeitung"
            icon={Activity}
            color="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
        />
        <StatCard 
            title="Erfolgsquote"
            value={`${stats.successRate}%`}
            subtitle="Performance"
            icon={Zap}
            color="bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
        />
        <StatCard 
            title="Prognose (Q4)"
            value={`€ ${(stats.projectedRecovery / 1000).toFixed(1)}k`}
            subtitle="AI Prediction"
            icon={Sparkles}
            color="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
        />
    </div>
  );
};

const FinancialChartWidget = () => {
    const chartData = [
        { name: 'Jan', actual: 4000, projected: 4200 }, { name: 'Feb', actual: 3000, projected: 3500 }, 
        { name: 'Mär', actual: 5500, projected: 5000 }, { name: 'Apr', actual: 4800, projected: 5200 }, 
        { name: 'Mai', actual: 7200, projected: 6800 }, { name: 'Jun', actual: 6100, projected: 6500 }, 
        { name: 'Jul', actual: 8900, projected: 8500 }, { name: 'Aug', actual: 9500, projected: 9000 }, 
    ];
    return (
        <Card className="h-full dark:bg-[#0A0A0A]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="text-emerald-500" size={18}/> Cashflow Pulse
                </h3>
                <div className="flex gap-4 text-xs font-bold">
                   <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Ist</span>
                   <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div> Soll (AI)</span>
                </div>
            </div>
            <div className="h-[300px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-white/5" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#64748B', fontSize: 12}} 
                            dy={10} 
                            minTickGap={20}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} tickFormatter={(val) => `€${val/1000}k`} />
                        <Tooltip 
                            contentStyle={{backgroundColor: '#0F172A', border: 'none', borderRadius: '12px', color: '#fff'}}
                            itemStyle={{color: '#10B981'}}
                        />
                        <Area type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                        <Line type="monotone" dataKey="projected" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

const QuickActionsWidget = ({ onAction }: { onAction: (type: WizardType | string) => void }) => {
    const actions = [
        { label: "Neue Akte", icon: FilePlus, action: 'CLAIM', color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" },
        { label: "Neuer Schuldner", icon: Users, action: 'DEBTOR', color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" },
        { label: "Neuer Mandant", icon: Building2, action: 'CLIENT', color: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" },
        { label: "Mahnlauf", icon: Send, action: 'RUN', color: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" },
    ];
    return (
        <Card className="h-full dark:bg-[#0A0A0A]">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                 <Zap className="text-amber-500" size={18}/> Schnellauswahl
             </h3>
             <div className="grid grid-cols-2 gap-3">
                 {actions.map((a, i) => (
                     <button 
                        key={i} 
                        onClick={() => onAction(a.action)}
                        className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-[#151515] transition-colors group"
                     >
                         <div className={`p-3 rounded-full mb-2 ${a.color} transition-transform group-hover:scale-110`}>
                             <a.icon size={20} />
                         </div>
                         <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{a.label}</span>
                     </button>
                 ))}
             </div>
        </Card>
    );
};

const InquiriesWidget = ({ inquiries }: { inquiries: Inquiry[] }) => (
    <Card className="h-full dark:bg-[#0A0A0A]">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare size={18} className="text-monetaris-500" /> Rückfragen
            </h3>
            <Badge color="yellow">{inquiries.length}</Badge>
        </div>
        <div className="space-y-4 overflow-y-auto max-h-[320px] pr-2 custom-scrollbar">
            {inquiries.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm border-2 border-dashed border-slate-100 dark:border-white/5 rounded-xl">Keine offenen Aufgaben.</div>
            ) : (
                inquiries.map(item => (
                    <div key={item.id} className="p-4 rounded-xl bg-slate-50 dark:bg-[#151515] border border-slate-100 dark:border-white/5 hover:border-monetaris-200 dark:hover:border-monetaris-500/30 transition-all cursor-pointer group">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-mono font-bold text-slate-500">{item.caseNumber}</span>
                            <span className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-800 dark:text-white line-clamp-2 mb-2">"{item.question}"</p>
                        <p className="text-xs font-bold text-monetaris-600 dark:text-monetaris-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Antworten <ArrowRight size={12}/>
                        </p>
                    </div>
                ))
            )}
        </div>
    </Card>
);

const UrgentTasksWidget = ({ urgentCases, navigate }: { urgentCases: CollectionCase[], navigate: any }) => (
    <Card className="h-full dark:bg-[#0A0A0A]">
         <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                 <Clock size={18} className="text-red-500" /> Dringend
             </h3>
             <Badge color="red">{urgentCases.length}</Badge>
         </div>
         <div className="space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
             {urgentCases.length === 0 ? (
                 <div className="text-center py-8 text-slate-500 text-sm border-2 border-dashed border-slate-100 dark:border-white/5 rounded-xl">Alles erledigt.</div>
             ) : (
                 urgentCases.map((c) => (
                     <div key={c.id} className="p-3 bg-white dark:bg-[#151515] rounded-xl border border-slate-200 dark:border-white/5 hover:border-red-300 dark:hover:border-red-500/50 transition-colors cursor-pointer group" onClick={() => navigate('/claims')}>
                         <div className="flex justify-between items-center mb-1">
                             <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">{c.invoiceNumber}</span>
                             <Badge color="red">Fällig</Badge>
                         </div>
                         <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{c.debtorName}</p>
                         <div className="flex justify-between items-center mt-2">
                             <span className="text-xs text-slate-500">€ {c.totalAmount.toLocaleString()}</span>
                             <ArrowRight size={14} className="text-slate-300 group-hover:text-red-500 transition-colors" />
                         </div>
                     </div>
                 ))
             )}
         </div>
    </Card>
);

const RiskRadarWidget = () => {
    const data = [
        { subject: 'Score A', A: 120, fullMark: 150 },
        { subject: 'Score B', A: 98, fullMark: 150 },
        { subject: 'Score C', A: 86, fullMark: 150 },
        { subject: 'Score D', A: 99, fullMark: 150 },
        { subject: 'Score E', A: 65, fullMark: 150 },
    ];
    return (
        <Card className="h-full dark:bg-[#0A0A0A]">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                 <Shield className="text-blue-500" size={18}/> Portfolio Risiko DNA
             </h3>
             <div className="h-[300px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#e2e8f0" className="dark:stroke-white/10" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                    <Radar name="Debtors" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.4} />
                    <Tooltip contentStyle={{backgroundColor: '#0F172A', border: 'none', borderRadius: '12px', color: '#fff'}} />
                    </RadarChart>
                </ResponsiveContainer>
             </div>
        </Card>
    );
};

const FunnelWidget = () => {
    const data = [
        { "value": 100, "name": "Neue Akten", fill: "#3B82F6" },
        { "value": 80, "name": "Kontakt", fill: "#6366F1" },
        { "value": 50, "name": "Zahlungsplan", fill: "#8B5CF6" },
        { "value": 40, "name": "Erledigt", fill: "#10B981" }
    ];
    return (
        <Card className="h-full dark:bg-[#0A0A0A]">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                 <TrendingUp className="text-purple-500" size={18}/> Conversion Funnel
             </h3>
             <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <FunnelChart>
                        <Tooltip contentStyle={{backgroundColor: '#0F172A', border: 'none', borderRadius: '12px', color: '#fff'}} />
                        <Funnel
                            dataKey="value"
                            data={data}
                            isAnimationActive
                        >
                            <LabelList position="right" fill="#94a3b8" stroke="none" dataKey="name" />
                        </Funnel>
                    </FunnelChart>
                 </ResponsiveContainer>
             </div>
        </Card>
    );
};

// --- DASHBOARD ---

const DEFAULT_LAYOUT: DashboardWidgetConfig[] = [
    { id: 'stats', type: 'STATS_OVERVIEW', visible: true, order: 0, colSpan: 4 },
    { id: 'finance', type: 'FINANCIAL_CHART', visible: true, order: 1, colSpan: 2 },
    { id: 'radar', type: 'RISK_RADAR', visible: true, order: 2, colSpan: 1 },
    { id: 'funnel', type: 'CONVERSION_FUNNEL', visible: true, order: 3, colSpan: 1 },
    { id: 'inquiries', type: 'INQUIRIES_LIST', visible: true, order: 4, colSpan: 2 },
    { id: 'urgent', type: 'URGENT_TASKS', visible: true, order: 5, colSpan: 2 },
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({ totalVolume: 0, activeCases: 0, legalCases: 0, successRate: 0, projectedRecovery: 0 });
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [urgentCases, setUrgentCases] = useState<CollectionCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.CLIENT);
  
  // View Scope: MINE (Assigned to me directly) vs ALL (All assigned tenants for Agent, or Global for Admin)
  // Default ALL for admin to see big picture, but can switch to MINE
  const [viewScope, setViewScope] = useState<'MINE' | 'ALL'>('ALL');

  // Dashboard Customization State
  const [isEditing, setIsEditing] = useState(false);
  const [widgetLayout, setWidgetLayout] = useState<DashboardWidgetConfig[]>(DEFAULT_LAYOUT);
  
  // Wizard State
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardType, setWizardType] = useState<WizardType>('CLAIM');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { user } = authService.checkSession();
      setUserRole(user?.role || UserRole.CLIENT);
      
      // Use new scoped methods
      let filteredCases: CollectionCase[] = [];
      
      if (user) {
          // Fetch all cases accessible to the user first
          const all = await dataService.getAccessibleCases(user);
          
          if (viewScope === 'MINE' && (user.role === UserRole.AGENT || user.role === UserRole.ADMIN)) {
              // Filter to only cases directly assigned to this user
              filteredCases = all.filter(c => c.agentId === user.id);
          } else {
              // Show all accessible cases
              filteredCases = all;
          }
      }

      // Calculate stats based on filtered data
      const totalVolume = filteredCases.reduce((acc, curr) => acc + curr.totalAmount, 0);
      const activeCases = filteredCases.filter(c => c.status !== CaseStatus.PAID && c.status !== CaseStatus.UNCOLLECTIBLE).length;
      const legalCases = filteredCases.filter(c => [CaseStatus.MB_REQUESTED, CaseStatus.MB_ISSUED, CaseStatus.TITLE_OBTAINED].includes(c.status)).length;
      const successRate = 68; // Mock
      const projectedRecovery = totalVolume * 0.45;

      setStats({ totalVolume, activeCases, legalCases, successRate, projectedRecovery });
      
      // Inquiries Mock (fetch all for now, filtering could be added)
      setInquiries(await dataService.getInquiries());
      
      // Urgent Tasks (from filtered cases)
      const urgent = filteredCases.filter(c => 
        c.status === CaseStatus.REMINDER_2 || 
        c.status === CaseStatus.PREPARE_MB ||
        (c.nextActionDate && new Date(c.nextActionDate) <= new Date())
      ).slice(0, 5);
      setUrgentCases(urgent);

      setLoading(false);
    };
    fetchData();
  }, [viewScope]); // Re-run when scope changes

  // ... (Widget Handlers - toggleWidgetVisibility, moveWidget, etc.) ...
  const saveLayout = (newLayout: DashboardWidgetConfig[]) => setWidgetLayout(newLayout);
  const toggleWidgetVisibility = (id: string) => {
      const newLayout = widgetLayout.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
      saveLayout(newLayout);
  };
  const moveWidget = (id: string, direction: 'UP' | 'DOWN') => {
      const visibleWidgets = widgetLayout.filter(w => w.visible).sort((a,b) => a.order - b.order);
      const currentIndex = visibleWidgets.findIndex(w => w.id === id);
      
      if (currentIndex === -1) return;
      if (direction === 'UP' && currentIndex > 0) {
          const prevWidget = visibleWidgets[currentIndex - 1];
          const currentWidget = visibleWidgets[currentIndex];
          const newLayout = widgetLayout.map(w => {
              if (w.id === currentWidget.id) return { ...w, order: prevWidget.order };
              if (w.id === prevWidget.id) return { ...w, order: currentWidget.order };
              return w;
          });
          saveLayout(newLayout);
      } else if (direction === 'DOWN' && currentIndex < visibleWidgets.length - 1) {
          const nextWidget = visibleWidgets[currentIndex + 1];
          const currentWidget = visibleWidgets[currentIndex];
          const newLayout = widgetLayout.map(w => {
              if (w.id === currentWidget.id) return { ...w, order: nextWidget.order };
              if (w.id === nextWidget.id) return { ...w, order: currentWidget.order };
              return w;
          });
          saveLayout(newLayout);
      }
  };
  const handleQuickAction = (action: string) => {
      if (action === 'CLAIM' || action === 'DEBTOR' || action === 'CLIENT') {
          setWizardType(action as WizardType);
          setWizardOpen(true);
      } else if (action === 'RUN') {
          alert('Mahnlauf Simulation gestartet...');
      }
  };
  const renderWidgetContent = (type: WidgetType) => {
      switch(type) {
          case 'STATS_OVERVIEW': return <StatsOverviewWidget stats={stats} userRole={userRole} />;
          case 'FINANCIAL_CHART': return <FinancialChartWidget />;
          case 'INQUIRIES_LIST': return <InquiriesWidget inquiries={inquiries} />;
          case 'URGENT_TASKS': return <UrgentTasksWidget urgentCases={urgentCases} navigate={navigate} />;
          case 'QUICK_ACTIONS': return <QuickActionsWidget onAction={handleQuickAction} />;
          case 'RISK_RADAR': return <RiskRadarWidget />;
          case 'CONVERSION_FUNNEL': return <FunnelWidget />;
          default: return null;
      }
  };
  const sortedWidgets = [...widgetLayout].sort((a, b) => a.order - b.order);
  const getColSpanClass = (span: number) => {
    switch(span) { case 2: return 'lg:col-span-2'; case 3: return 'lg:col-span-3'; case 4: return 'lg:col-span-4'; default: return 'lg:col-span-1'; }
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-700">
      <PageHeader 
         kicker={userRole === UserRole.AGENT ? "Operations" : "Dashboard"}
         title="Cockpit" 
         subtitle="Übersicht Ihrer wichtigsten Kennzahlen."
         action={
            <div className="flex gap-3">
                {/* Scope Toggle - Functional for Agents AND Admins */}
                {(userRole === UserRole.AGENT || userRole === UserRole.ADMIN) && (
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

                {isEditing ? (
                    <Button variant="primary" onClick={() => setIsEditing(false)} className="bg-emerald-500 hover:bg-emerald-600 border-none text-white">
                        <CheckCircle2 size={16} className="mr-2" /> Speichern
                    </Button>
                ) : (
                    <>
                        <Button variant="secondary" onClick={() => setIsEditing(true)}>
                            <LayoutTemplate size={16} className="mr-2" /> Layout
                        </Button>
                        <Button variant="glow" onClick={() => navigate('/claims')}>
                            <Briefcase size={16} className="mr-2"/> Workspace
                        </Button>
                    </>
                )}
            </div>
         }
      />

      {/* ... (Customization Toolbar & Grid Logic - same as before) ... */}
      {isEditing && (
          <div className="p-4 bg-white dark:bg-[#151515] rounded-2xl mb-6 border-2 border-dashed border-slate-300 dark:border-white/10 animate-in slide-in-from-top-2 shadow-lg">
              <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2"><RotateCcw size={12} /> Widget-Verwaltung</h4>
              </div>
              <div className="flex flex-wrap gap-3">
                  {widgetLayout.map(w => (
                      <button key={w.id} onClick={() => toggleWidgetVisibility(w.id)} className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${w.visible ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md' : 'bg-slate-100 text-slate-400 dark:bg-[#202020]'}`}>{w.visible ? <Eye size={14} /> : <EyeOff size={14} />}{w.type.replace('_', ' ')}</button>
                  ))}
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {sortedWidgets.filter(w => w.visible).map((widget, idx) => (
              <div key={widget.id} className={`relative transition-all duration-500 ease-out col-span-1 ${getColSpanClass(widget.colSpan)} ${isEditing ? 'ring-2 ring-monetaris-500/50 ring-dashed rounded-[24px] p-1 bg-slate-50/50 dark:bg-white/5 scale-[0.99] z-10' : ''}`}>
                  {isEditing && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1 z-50 bg-slate-900 text-white rounded-full px-3 py-1.5 shadow-xl scale-90 hover:scale-100 transition-transform">
                          <button onClick={() => moveWidget(widget.id, 'UP')} disabled={idx === 0} className="p-1 hover:text-monetaris-400 disabled:opacity-30"><ArrowRight className="-rotate-180" size={16}/></button>
                          <GripVertical size={16} className="text-slate-500 mx-1" />
                          <button onClick={() => moveWidget(widget.id, 'DOWN')} disabled={idx === sortedWidgets.filter(x => x.visible).length - 1} className="p-1 hover:text-monetaris-400 disabled:opacity-30"><ArrowRight className="" size={16}/></button>
                          <div className="w-px h-4 bg-white/20 mx-2 self-center"></div>
                          <button onClick={() => toggleWidgetVisibility(widget.id)} className="p-1 hover:text-red-400" title="Ausblenden"><X size={16}/></button>
                      </div>
                  )}
                  <div className={`h-full ${isEditing ? 'pointer-events-none opacity-60 blur-[1px]' : ''}`}>
                      {renderWidgetContent(widget.type)}
                  </div>
              </div>
          ))}
      </div>

      <CreationWizard 
        isOpen={wizardOpen} 
        onClose={() => setWizardOpen(false)} 
        type={wizardType} 
        onSuccess={() => window.location.reload()} 
      />
    </div>
  );
};
