
import React, { useState } from 'react';
import { Button, Input, MonetarisLogo } from '../components/UI';
import { authService } from '../services/authService';
import { User, UserRole } from '../types';
import { ArrowRight, Building2, BarChart3, Globe, Lock, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const LoginClient: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('client@techsolutions.de');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { user } = await authService.login(email, password);
      if (user && user.role === UserRole.CLIENT) {
          onLogin(user);
      } else {
          setError('Kein Mandanten-Zugriff. Bitte nutzen Sie das Mitarbeiter-Login.');
          await authService.logout();
      }
    } catch (err) {
      setError('Ungültige Zugangsdaten.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-slate-50 dark:bg-[#000000] transition-colors duration-700">
      
      {/* Left Column - Brand Experience (Aligned with Corporate Design) */}
      <div className="relative hidden lg:flex flex-col justify-between p-16 bg-[#050505] overflow-hidden">
        {/* Branding Backgrounds */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-[-20%] right-[-20%] w-[800px] h-[800px] bg-monetaris-800/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[100px]"></div>

        {/* Content */}
        <div className="relative z-10">
           <div className="flex items-center gap-3">
              <MonetarisLogo className="h-10 w-auto" />
              <span className="text-xl font-display font-bold text-white tracking-tight">Monetaris <span className="text-monetaris-500">Client</span></span>
           </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-display font-bold text-white leading-[1.1] mb-8">
            Liquidität steuern.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-monetaris-400 to-emerald-200">In Echtzeit.</span>
           </h1>
           
           <div className="space-y-5">
               <div className="flex items-start gap-4 group">
                   <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-monetaris-400 group-hover:bg-monetaris-500/10 group-hover:border-monetaris-500/30 transition-all"><BarChart3 size={24}/></div>
                   <div>
                       <h3 className="text-white font-bold text-lg">Transparenz</h3>
                       <p className="text-slate-400 text-sm leading-relaxed">Live-Einsicht in alle laufenden Inkasso-Verfahren und Zahlungsströme.</p>
                   </div>
               </div>
               <div className="flex items-start gap-4 group">
                   <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-monetaris-400 group-hover:bg-monetaris-500/10 group-hover:border-monetaris-500/30 transition-all"><Globe size={24}/></div>
                   <div>
                       <h3 className="text-white font-bold text-lg">Globales Netzwerk</h3>
                       <p className="text-slate-400 text-sm leading-relaxed">Rechtskonformes Forderungsmanagement in über 140 Ländern.</p>
                   </div>
               </div>
           </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-slate-500 font-medium uppercase tracking-wider">
           <ShieldCheck size={14} className="text-monetaris-500" />
           Secure Enterprise Gateway • TLS 1.3 Encrypted
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex flex-col justify-center items-center p-6 relative">
        
        {/* Mobile Background Gradient */}
        <div className="absolute inset-0 lg:hidden bg-[#050505]">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
            <div className="absolute top-[-20%] right-[-20%] w-[400px] h-[400px] bg-monetaris-500/10 rounded-full blur-[80px]"></div>
        </div>

        <div className="w-full max-w-[420px] relative z-10">
          <div className="text-center mb-10 lg:hidden">
             <MonetarisLogo className="h-12 w-auto mx-auto mb-4" />
             <h2 className="text-2xl font-display font-bold text-white">Mandantenportal</h2>
          </div>

          <div className="bg-white dark:bg-[#0A0A0A] p-8 md:p-10 rounded-[32px] border border-slate-200 dark:border-white/10 shadow-2xl dark:shadow-black/50">
             <div className="mb-8 flex items-center gap-4">
                <div className="w-12 h-12 bg-monetaris-50 dark:bg-monetaris-500/10 rounded-2xl flex items-center justify-center text-monetaris-600 dark:text-monetaris-400 border border-monetaris-100 dark:border-monetaris-500/20">
                    <Building2 size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Willkommen</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Login für registrierte Mandanten</p>
                </div>
             </div>

             <form className="space-y-6" onSubmit={handleSubmit}>
                <Input 
                  label="Firmen E-Mail"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="finance@firma.de"
                  required
                  autoFocus
                />
                
                <div>
                  <Input
                    label="Passwort"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className="flex justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                          <span className="text-[10px] text-slate-400">System Operational</span>
                      </div>
                      <p className="text-[10px] text-right text-monetaris-600 dark:text-monetaris-400 hover:underline cursor-pointer font-bold">Passwort vergessen?</p>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    {error}
                  </div>
                )}

                <Button variant="glow" type="submit" className="w-full py-4 text-base rounded-2xl" loading={loading}>
                  Secure Login <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
             </form>
          </div>
          
          <div className="mt-8 text-center">
             <p className="text-xs text-slate-500 dark:text-slate-400">
                Sie sind Mitarbeiter? <Link to="/login" className="font-bold text-slate-900 dark:text-white hover:text-monetaris-500 transition-colors">Zum Agent Terminal</Link>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
