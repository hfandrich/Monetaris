
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Card, Badge, Button, Input, CreationWizard } from '../components/UI';
import { dataService } from '../services/dataService';
import { authService } from '../services/authService';
import { Debtor, RiskScore, UserRole } from '../types';
import { MapPin, Phone, Mail, MoreHorizontal, Plus, Search, Filter, ArrowRight, User, Globe } from 'lucide-react';

export const Debtors: React.FC = () => {
  const navigate = useNavigate();
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [filteredDebtors, setFilteredDebtors] = useState<Debtor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  
  // Scope Toggle
  const [viewScope, setViewScope] = useState<'MINE' | 'ALL'>('ALL');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const load = async () => {
      const { user } = authService.checkSession();
      setCurrentUser(user);
      // Get all accessible debtors
      const data = await dataService.getAccessibleDebtors(user || undefined);
      setDebtors(data);
      setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
      let result = debtors;

      // Filter by Scope (Agent/Admin Only)
      if ((currentUser?.role === UserRole.AGENT || currentUser?.role === UserRole.ADMIN) && viewScope === 'MINE') {
          result = result.filter(d => d.agentId === currentUser.id);
      }

      // Filter by Search
      if (searchTerm) {
          const lowerTerm = searchTerm.toLowerCase();
          result = result.filter(d => 
            (d.companyName || d.lastName || '').toLowerCase().includes(lowerTerm) ||
            d.id.toLowerCase().includes(lowerTerm)
          );
      }

      setFilteredDebtors(result);
  }, [debtors, searchTerm, viewScope, currentUser]);

  const getRiskBadge = (score: RiskScore) => {
    const colors = {
      [RiskScore.A]: 'bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800/50',
      [RiskScore.B]: 'bg-emerald-50 text-emerald-500 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/30',
      [RiskScore.C]: 'bg-amber-50 text-amber-500 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/30',
      [RiskScore.D]: 'bg-orange-50 text-orange-500 border-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800/30',
      [RiskScore.E]: 'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800/50',
    };
    return (
      <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold font-display text-lg border ${colors[score]}`}>
        {score}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <PageHeader 
        title="Schuldnerkartei" 
        subtitle="Datenbank & Bonitätsprüfung" 
        action={
            <div className="flex gap-3 items-center">
                {/* Scope Toggle for Agents & Admins */}
                {(currentUser?.role === UserRole.AGENT || currentUser?.role === UserRole.ADMIN) && (
                   <div className="bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 p-1 rounded-xl flex items-center h-10">
                        <button 
                            onClick={() => setViewScope('MINE')}
                            className={`px-3 h-full rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${viewScope === 'MINE' ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'}`}
                            title="Nur Schuldner, für die ich zuständig bin"
                        >
                            <User size={14}/> Meine Ansicht
                        </button>
                        <button 
                            onClick={() => setViewScope('ALL')}
                            className={`px-3 h-full rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${viewScope === 'ALL' ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'}`}
                            title="Alle Schuldner im System (mit Zugriff)"
                        >
                            <Globe size={14}/> Gesamt
                        </button>
                   </div>
                )}
                <Button variant="glow" onClick={() => setIsWizardOpen(true)} className="h-10"><Plus size={18} className="mr-2" /> Neuer Eintrag</Button>
            </div>
        }
      />

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <div className="relative flex-1 max-w-lg w-full">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
           <input 
             type="text" 
             placeholder="Suche nach Namen oder ID..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-monetaris-500 focus:ring-2 focus:ring-monetaris-500/20 transition-all
             dark:bg-[#151515] dark:border-white/10 dark:text-white dark:placeholder:text-slate-600 dark:focus:bg-[#1A1A1A] dark:focus:border-monetaris-400/50 dark:focus:ring-0"
           />
        </div>
        <Button variant="secondary" className="px-4 w-full md:w-auto"><Filter size={18} /></Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-20 text-slate-500 font-mono animate-pulse">Zugriff auf sichere Datenbank...</div>
        ) : filteredDebtors.length === 0 ? (
            <div className="text-center py-20 text-slate-500">Keine Schuldner gefunden.</div>
        ) : filteredDebtors.map((debtor) => (
          <div 
            key={debtor.id} 
            onClick={() => navigate(`/debtors/${debtor.id}`)}
            className="glass-panel rounded-3xl overflow-hidden hover:border-slate-300 dark:hover:bg-[#111111] transition-all duration-300 group border border-slate-200 dark:border-white/10 dark:bg-[#0A0A0A] cursor-pointer hover:scale-[1.01] hover:shadow-xl"
          >
            <div className="flex flex-col md:flex-row">
              {/* Left Color Strip based on Risk */}
              <div className={`w-full h-2 md:h-auto md:w-1.5 ${
                debtor.riskScore === RiskScore.E ? 'bg-red-500' : 
                debtor.riskScore === RiskScore.D ? 'bg-orange-500' : 
                debtor.riskScore === RiskScore.C ? 'bg-amber-500' :
                'bg-monetaris-500'
              }`}></div>
              
              <div className="p-5 md:p-6 flex-1 flex flex-col lg:flex-row items-start lg:items-center gap-6">
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display tracking-tight truncate">
                      {debtor.companyName || `${debtor.lastName}, ${debtor.firstName}`}
                    </h3>
                    {debtor.companyName && <Badge color="blue">FIRMA</Badge>}
                    {debtor.address.status === 'RESEARCH_PENDING' && <Badge color="yellow">Prüfung</Badge>}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-y-2 gap-x-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <div className="flex items-center hover:text-slate-900 dark:hover:text-white transition-colors"><MapPin size={12} className="mr-2 text-slate-400 dark:text-slate-500" /> {debtor.address.street}, {debtor.address.zipCode} {debtor.address.city}</div>
                    <div className="flex items-center hover:text-slate-900 dark:hover:text-white transition-colors"><Mail size={12} className="mr-2 text-slate-400 dark:text-slate-500" /> {debtor.email}</div>
                    <div className="flex items-center hover:text-slate-900 dark:hover:text-white transition-colors"><Phone size={12} className="mr-2 text-slate-400 dark:text-slate-500" /> {debtor.phone}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full lg:w-auto lg:gap-8 border-t lg:border-t-0 border-slate-100 dark:border-white/5 pt-4 lg:pt-0 lg:pl-8">
                  <div className="text-left lg:text-right">
                    <p className="text-[0.6rem] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1">Offen</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">€ {debtor.totalDebt.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="text-center hidden sm:block">
                     <p className="text-[0.6rem] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1">Akten</p>
                     <p className="text-lg font-bold text-slate-600 dark:text-slate-400">{debtor.openCases}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-[0.6rem] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1">Score</p>
                    {getRiskBadge(debtor.riskScore)}
                  </div>
                  <button className="p-3 text-slate-400 group-hover:text-monetaris-500 dark:text-slate-500 transition-colors rounded-full">
                    <ArrowRight size={24} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CreationWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
        type="DEBTOR" 
        onSuccess={load}
      />
    </div>
  );
};
