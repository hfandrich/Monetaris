
import React, { useState } from 'react';
import { Button, Input, MonetarisLogo } from '../components/UI';
import { authService } from '../services/authService';
import { User, UserRole } from '../types';
import { ArrowRight, ShieldCheck, Mail, MessageCircleQuestion, Lock, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const LoginDebtor: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('max@muster.de');
  const [password, setPassword] = useState('debtor123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { user } = await authService.login(email, password);
      if (user && user.role === UserRole.DEBTOR) {
        onLogin(user);
      } else {
        setError('Kein Schuldner-Zugriff. Bitte nutzen Sie das Mitarbeiter-Login.');
        await authService.logout();
      }
    } catch (err: any) {
      setError(err.message || 'Zugang verweigert.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-slate-50 dark:bg-[#000000] transition-colors duration-700">
      
      {/* Left Column - Brand Experience */}
      <div className="relative hidden lg:flex flex-col justify-between p-16 bg-[#050505] overflow-hidden">
        {/* Branding Backgrounds - Emerald Theme for Resolution Center */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-[-20%] right-[-20%] w-[800px] h-[800px] bg-emerald-900/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-monetaris-800/20 rounded-full blur-[100px]"></div>

        {/* Content */}
        <div className="relative z-10">
           <div className="flex items-center gap-3">
              <MonetarisLogo className="h-10 w-auto" />
              <span className="text-xl font-display font-bold text-white tracking-tight">Resolution <span className="text-emerald-500">Center</span></span>
           </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-display font-bold text-white leading-[1.1] mb-8">
            Angelegenheit klären.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">Schnell & Diskret.</span>
           </h1>
           
           <div className="space-y-6">
               <div className="flex items-start gap-4 group">
                   <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-emerald-400 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-all"><ShieldCheck size={24}/></div>
                   <div>
                       <h3 className="text-white font-bold text-lg">Sicherer Bereich</h3>
                       <p className="text-slate-400 text-sm leading-relaxed">Ihre Daten sind durch Banken-Standard Verschlüsselung geschützt. Zugriff nur für Berechtigte.</p>
                   </div>
               </div>
               <div className="flex items-start gap-4 group">
                   <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-emerald-400 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-all"><HelpCircle size={24}/></div>
                   <div>
                       <h3 className="text-white font-bold text-lg">Lösungen finden</h3>
                       <p className="text-slate-400 text-sm leading-relaxed">Nutzen Sie unser Portal für Zahlungen, Ratenpläne oder um Rückfragen zu stellen.</p>
                   </div>
               </div>
           </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-slate-500 font-medium uppercase tracking-wider">
           <Lock size={14} className="text-emerald-500" />
           End-to-End Encrypted • DSGVO Konform
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex flex-col justify-center items-center p-6 relative">
        
        {/* Mobile Background Gradient */}
        <div className="absolute inset-0 lg:hidden bg-[#050505]">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
            <div className="absolute top-[-20%] right-[-20%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[80px]"></div>
        </div>

        <div className="w-full max-w-[420px] relative z-10">
          <div className="text-center mb-10 lg:hidden">
             <MonetarisLogo className="h-12 w-auto mx-auto mb-4" />
             <h2 className="text-2xl font-display font-bold text-white">Resolution Center</h2>
          </div>

          <div className="bg-white dark:bg-[#0A0A0A] p-8 md:p-10 rounded-[32px] border border-slate-200 dark:border-white/10 shadow-2xl dark:shadow-black/50">
             <div className="mb-8 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                    <MessageCircleQuestion size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Identifikation</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Bitte verifizieren Sie sich.</p>
                </div>
             </div>

             <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2 ml-1">E-Mail Adresse</label>
                    <div className="relative">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ihre@email.de"
                            className="w-full pl-12 pr-4 py-3 border rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 font-medium transition-all text-sm focus:bg-white focus:ring-4 focus:ring-slate-100 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-slate-600 dark:focus:bg-white/10 dark:focus:border-emerald-500/50 dark:focus:ring-emerald-500/10 outline-none"
                            required
                            autoFocus
                        />
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2 ml-1">Passwort</label>
                    <div className="relative">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Ihr Passwort"
                            className="w-full pl-12 pr-4 py-3 border rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 font-medium transition-all text-sm focus:bg-white focus:ring-4 focus:ring-slate-100 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-slate-600 dark:focus:bg-white/10 dark:focus:border-emerald-500/50 dark:focus:ring-emerald-500/10 outline-none"
                            required
                        />
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    {error}
                  </div>
                )}

                <Button variant="glow" type="submit" className="w-full py-4 text-base rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white border-transparent shadow-emerald-500/20" loading={loading}>
                  Anmelden <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
             </form>
          </div>
          
          <div className="mt-8 text-center">
             <p className="text-xs text-slate-500 dark:text-slate-400">
                Probleme beim Login? <Link to="/" className="font-bold text-slate-900 dark:text-white hover:text-emerald-500 transition-colors">Support kontaktieren</Link>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};