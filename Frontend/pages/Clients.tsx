
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Button, Badge, CreationWizard } from '../components/UI';
import { dataService } from '../services/dataService';
import { authService } from '../services/authService';
import { Tenant, CollectionCase, UserRole } from '../types';
import { Building2, Mail, CreditCard, Plus, MoreVertical, ArrowRight, Wallet, TrendingUp, Users, Search, Filter, User, Globe } from 'lucide-react';

interface ClientStats {
  totalCases: number;
  activeVolume: number;
  debtorCount: number;
}

export const Clients: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Tenant[]>([]);
  const [filteredClients, setFilteredClients] = useState<Tenant[]>([]);
  const [cases, setCases] = useState<CollectionCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  
  // Scope Toggle (for consistency mostly, as Agent only sees assigned)
  const [viewScope, setViewScope] = useState<'MINE' | 'ALL'>('ALL'); 
  const [currentUser, setCurrentUser] = useState<any>(null);

  const loadData = async () => {
      const { user } = authService.checkSession();
      setCurrentUser(user);
      const [clientData, caseData] = await Promise.all([
        dataService.getAccessibleTenants(user || undefined), // Already filtered by agent assignment
        dataService.getCases()
      ]);
      setClients(clientData);
      setCases(caseData);
      setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
      let result = clients;
      
      // If Agent/Admin selects MINE, technically for clients page this might mean "Clients assigned to me"
      // For simplicity in this mockup, AGENT access is already filtered by `getAccessibleTenants`.
      // So `ALL` vs `MINE` might not change much unless we have strict ownership per client (which is usually handled by access list).
      // However, we keep the UI for consistency.
      
      if (searchTerm) {
          const lowerTerm = searchTerm.toLowerCase();
          result = result.filter(t => 
            t.name.toLowerCase().includes(lowerTerm) || 
            t.registrationNumber.toLowerCase().includes(lowerTerm)
          );
      }
      setFilteredClients(result);
  }, [clients, searchTerm, viewScope]);

  const getClientStats = (tenantId: string): ClientStats => {
    const clientCases = cases.filter(c => c.tenantId === tenantId);
    const activeVolume = clientCases.reduce((sum, c) => sum + c.totalAmount, 0);
    const uniqueDebtors = new Set(clientCases.map(c => c.debtorId)).size;

    return {
      totalCases: clientCases.length,
      activeVolume,
      debtorCount: uniqueDebtors
    };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <PageHeader 
        title="Mandantenverwaltung" 
        subtitle="Firmenprofile, Abrechnungsdaten & Performance" 
        action={
            <div className="flex gap-3 items-center">
                {/* Scope Toggle for Agents & Admins */}
                {(currentUser?.role === UserRole.AGENT || currentUser?.role === UserRole.ADMIN) && (
                   <div className="bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 p-1 rounded-xl flex items-center h-10">
                        <button 
                            onClick={() => setViewScope('MINE')}
                            className={`px-3 h-full rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${viewScope === 'MINE' ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'}`}
                            title="Meine zugeordneten Mandanten"
                        >
                            <User size={14}/> Meine Ansicht
                        </button>
                        <button 
                            onClick={() => setViewScope('ALL')}
                            className={`px-3 h-full rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${viewScope === 'ALL' ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'}`}
                            title="Alle Mandanten"
                        >
                            <Globe size={14}/> Gesamt
                        </button>
                   </div>
                )}
                <Button variant="glow" onClick={() => setIsWizardOpen(true)} className="h-10"><Plus size={18} className="mr-2" /> Neuer Mandant</Button>
            </div>
        }
      />

      {/* Search Bar */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative flex-1 max-w-lg">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
           <input 
             type="text" 
             placeholder="Suche nach Firma, HRB-Nummer..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-monetaris-500 focus:ring-2 focus:ring-monetaris-500/20 transition-all
             dark:bg-[#151515] dark:border-white/10 dark:text-white dark:placeholder:text-slate-600 dark:focus:bg-[#1A1A1A] dark:focus:border-monetaris-400/50 dark:focus:ring-0"
           />
        </div>
        <Button variant="secondary" className="px-4"><Filter size={18} /></Button>
      </div>

      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1,2].map(i => (
                <div key={i} className="h-64 bg-slate-100 dark:bg-[#151515] rounded-[32px] animate-pulse"></div>
            ))}
         </div>
      ) : filteredClients.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-[32px] border-dashed border-2 border-slate-200 dark:border-white/10">
           <Building2 className="w-16 h-16 mx-auto text-slate-300 mb-4" />
           <p className="text-slate-500 font-bold">Keine Mandanten gefunden.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredClients.map((tenant) => {
            const stats = getClientStats(tenant.id);
            
            return (
              <div 
                key={tenant.id} 
                className="glass-panel p-8 rounded-[32px] border border-slate-200 dark:border-white/10 dark:bg-[#0A0A0A] group hover:border-monetaris-500/50 transition-all duration-300 hover:-translate-y-1 relative"
              >
                 <div className="flex justify-between items-start mb-8 cursor-pointer" onClick={() => navigate(`/clients/${tenant.id}`)}>
                    <div className="flex items-center gap-4">
                       <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/20 dark:shadow-black/50">
                          <Building2 size={32} />
                       </div>
                       <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display group-hover:text-monetaris-500 transition-colors">{tenant.name}</h3>
                          <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">{tenant.registrationNumber}</p>
                       </div>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-[#151515]">
                       <MoreVertical size={20} />
                    </button>
                 </div>

                 <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-50 dark:bg-[#151515] p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1"><Wallet size={10}/> Volumen</p>
                       <p className="text-lg font-bold text-slate-900 dark:text-white">€ {(stats.activeVolume / 1000).toFixed(1)}k</p>
                    </div>
                    <div 
                      className="bg-slate-50 dark:bg-[#151515] p-4 rounded-2xl border border-slate-100 dark:border-white/5 cursor-pointer hover:bg-slate-100 dark:hover:bg-[#202020] transition-colors"
                      onClick={() => navigate(`/clients/${tenant.id}`)}
                    >
                       <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1"><TrendingUp size={10}/> Akten</p>
                       <p className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {stats.totalCases} <ArrowRight size={12} className="text-slate-400"/>
                       </p>
                    </div>
                 </div>

                 <div className="space-y-3 mb-8">
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                       <Mail size={16} className="mr-3 text-slate-400" /> 
                       {tenant.contactEmail}
                    </div>
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                       <CreditCard size={16} className="mr-3 text-slate-400" /> 
                       <span className="font-mono text-xs">{tenant.bankAccountIBAN}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                       <Users size={16} className="mr-3 text-slate-400" /> 
                       {stats.debtorCount} Schuldner aktiv
                    </div>
                 </div>

                 <div className="flex items-center gap-3 pt-6 border-t border-slate-100 dark:border-white/5">
                    <Badge color="green">Aktiv</Badge>
                    <Badge color="blue">Premium Plan</Badge>
                    <Button onClick={() => navigate(`/clients/${tenant.id}`)} variant="ghost" size="sm" className="ml-auto text-monetaris-600 dark:text-monetaris-400 hover:bg-monetaris-50 dark:hover:bg-monetaris-500/10">
                       Akte öffnen <ArrowRight size={16} className="ml-2" />
                    </Button>
                 </div>
              </div>
            );
          })}
        </div>
      )}
      
      <CreationWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
        type="CLIENT" 
        onSuccess={loadData} 
      />
    </div>
  );
};
