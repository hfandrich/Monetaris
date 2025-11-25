
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { CollectionCase, Tenant } from '../types';
import { Button, MonetarisLogo } from '../components/UI';
import { CheckCircle2, ShieldCheck, Calendar, CreditCard, Smartphone, ArrowRight, AlertCircle, ChevronDown, ChevronUp, Lock } from 'lucide-react';

export const Pay: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const [claim, setClaim] = useState<CollectionCase | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'HOME' | 'PLAN' | 'SUCCESS'>('HOME');
  
  // Installment State
  const [months, setMonths] = useState(3);
  const interestRate = 0.05; // 5% fixed for demo

  useEffect(() => {
    const load = async () => {
      const cases = await dataService.getCases();
      const c = cases.find(x => x.id === caseId) || cases[0]; // Fallback for demo
      if (c) {
        setClaim(c);
        const t = await dataService.getTenantById(c.tenantId);
        setTenant(t?.tenant || null);
      }
      setLoading(false);
    };
    load();
  }, [caseId]);

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-pulse text-slate-400 font-bold">Secure Loading...</div></div>;
  if (!claim) return <div>Case not found</div>;

  const calculateInstallment = (months: number) => {
      const total = claim.totalAmount * (1 + (interestRate * (months/12)));
      return {
          monthly: total / months,
          total: total,
          interest: total - claim.totalAmount
      };
  };

  const plan = calculateInstallment(months);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100">
      
      {/* Trust Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-20">
          <div className="max-w-lg mx-auto px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2 opacity-80">
                  <MonetarisLogo className="h-6 w-auto" />
                  <span className="font-display font-bold text-slate-700">Pay</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                  <Lock size={10} /> SECURE 256-BIT
              </div>
          </div>
      </div>

      <div className="max-w-lg mx-auto p-6 pb-20">
        
        {view === 'HOME' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                
                {/* Greeting */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 mx-auto mb-4 flex items-center justify-center">
                        <Building2 size={32} className="text-slate-900" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 mb-2">{tenant?.name || 'Der Gläubiger'} bittet um Zahlung.</h1>
                    <p className="text-slate-500 text-sm">Rechnungsnummer: <span className="font-mono font-bold">{claim.invoiceNumber}</span></p>
                </div>

                {/* Amount Hero */}
                <div className="bg-white rounded-3xl p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] text-center border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Offener Gesamtbetrag</p>
                    <div className="text-5xl font-display font-bold text-slate-900 mb-2">
                        {claim.totalAmount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </div>
                    <p className="text-sm text-red-500 font-medium flex items-center justify-center gap-1">
                        <AlertCircle size={14} /> Fällig seit {new Date(claim.dueDate).toLocaleDateString()}
                    </p>
                </div>

                {/* Actions */}
                <div className="grid gap-4">
                    <button onClick={() => setView('SUCCESS')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <span>Jetzt bezahlen</span>
                        <ArrowRight size={20} />
                    </button>
                    
                    <button onClick={() => setView('PLAN')} className="w-full py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold text-lg shadow-sm hover:border-monetaris-500 hover:text-monetaris-600 transition-all flex items-center justify-center gap-3">
                        <Calendar size={20} />
                        <span>Ratenzahlung vereinbaren</span>
                    </button>
                </div>

                {/* Payment Methods */}
                <div className="flex justify-center gap-6 opacity-40 grayscale">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-6" alt="PayPal" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_Logo.svg" className="h-6" alt="Apple Pay" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" alt="Mastercard" />
                </div>
            </div>
        )}

        {view === 'PLAN' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <button onClick={() => setView('HOME')} className="text-sm font-bold text-slate-400 hover:text-slate-900 flex items-center gap-1">
                    <ChevronDown className="rotate-90" size={16} /> Zurück
                </button>

                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Ratenplan konfigurieren</h2>
                    <p className="text-slate-500 text-sm">Wählen Sie eine Laufzeit, die zu Ihnen passt.</p>
                </div>

                {/* Interactive Slider Card */}
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
                    <div className="flex justify-between items-baseline mb-8">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Monatliche Rate</p>
                            <p className="text-4xl font-bold text-emerald-600">{plan.monthly.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-400 uppercase">Laufzeit</p>
                            <p className="text-xl font-bold text-slate-900">{months} Monate</p>
                        </div>
                    </div>

                    <input 
                        type="range" 
                        min="3" 
                        max="24" 
                        step="3" 
                        value={months} 
                        onChange={(e) => setMonths(Number(e.target.value))}
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500 mb-8"
                    />
                    <div className="flex justify-between text-xs font-bold text-slate-400 px-1">
                        <span>3 Mon.</span>
                        <span>12 Mon.</span>
                        <span>24 Mon.</span>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Ursprungsbetrag</span>
                            <span className="font-bold text-slate-900">{claim.totalAmount.toLocaleString('de-DE')} €</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Zinsen & Gebühren</span>
                            <span className="font-bold text-slate-900">+ {plan.interest.toLocaleString('de-DE', {minimumFractionDigits: 2})} €</span>
                        </div>
                        <div className="flex justify-between text-base font-bold pt-2">
                            <span className="text-slate-900">Gesamtkosten</span>
                            <span className="text-emerald-600">{plan.total.toLocaleString('de-DE', {minimumFractionDigits: 2})} €</span>
                        </div>
                    </div>
                </div>

                <button onClick={() => setView('SUCCESS')} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-500/30 hover:brightness-110 transition-all flex items-center justify-center gap-3">
                    Plan aktivieren <CheckCircle2 size={20} />
                </button>
            </div>
        )}

        {view === 'SUCCESS' && (
            <div className="flex flex-col items-center justify-center text-center pt-12 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/20 animate-bounce">
                    <CheckCircle2 size={48} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Vielen Dank!</h2>
                <p className="text-slate-500 max-w-xs mx-auto mb-8">
                    Ihre Zahlung wurde erfolgreich autorisiert. Sie erhalten in Kürze eine Bestätigung per E-Mail.
                </p>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm w-full mb-8">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Transaktions-ID</p>
                    <p className="font-mono text-sm text-slate-900">TX-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                </div>
                <button onClick={() => window.close()} className="text-slate-400 font-bold hover:text-slate-900">
                    Fenster schließen
                </button>
            </div>
        )}

      </div>
      
      {/* Trust Footer */}
      <div className="fixed bottom-0 w-full bg-white border-t border-slate-100 py-4 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Powered by Monetaris • Secure Payments
      </div>
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
