import React, { useState } from 'react';
import { Button, Input, MonetarisLogo } from '../components/UI';
import { authService } from '../services/authService';
import { User } from '../types';
import { ArrowRight, ShieldCheck, Globe, TrendingUp } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { user } = await authService.login(email, password);
      if (user) onLogin(user);
    } catch (err) {
      setError('Ungültige Zugangsdaten.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-slate-50 dark:bg-[#000000] transition-colors duration-700">
      
      {/* Left Column - The Brand Experience */}
      <div className="relative hidden lg:flex flex-col justify-between p-16 bg-[#050505] overflow-hidden">
        {/* Dynamic Backgrounds */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-[-20%] right-[-20%] w-[800px] h-[800px] bg-monetaris-accent/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-ai-blue/10 rounded-full blur-[100px] animate-blob"></div>

        {/* 3D Floating Card Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border-[1px] border-white/5 rounded-full animate-[spin_60s_linear_infinite] opacity-20 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] border-[1px] border-white/5 rounded-full animate-[spin_40s_linear_infinite_reverse] opacity-20 pointer-events-none"></div>

        {/* Content */}
        <div className="relative z-10">
           <div className="flex items-center gap-3">
              <MonetarisLogo className="h-12 w-auto" />
              <span className="text-2xl font-display font-bold text-white tracking-tight">Monetaris</span>
           </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-6xl font-display font-bold text-white leading-[1.1] mb-6">
            Die Zukunft des <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-monetaris-accent to-ai-blue animate-text">intelligenten Inkassos.</span>
          </h1>
          <p className="text-xl text-slate-400 font-light leading-relaxed mb-10">
            Enterprise-Forderungsmanagement angetrieben durch prädiktive KI. 
            Automatisieren Sie Workflows, bewerten Sie Risiken in Echtzeit und maximieren Sie Ihre Liquidität.
          </p>
          
          <div className="flex gap-6">
             <div className="glass-panel bg-white/5 border-white/10 p-4 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-monetaris-accent/20 flex items-center justify-center text-monetaris-accent">
                   <ShieldCheck size={20} />
                </div>
                <div>
                   <p className="text-white font-bold text-sm">Banken-Level</p>
                   <p className="text-slate-500 text-xs">Sicherheit</p>
                </div>
             </div>
             <div className="glass-panel bg-white/5 border-white/10 p-4 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-ai-blue/20 flex items-center justify-center text-ai-blue">
                   <Globe size={20} />
                </div>
                <div>
                   <p className="text-white font-bold text-sm">Global</p>
                   <p className="text-slate-500 text-xs">Compliance</p>
                </div>
             </div>
          </div>
        </div>

        <div className="relative z-10 flex justify-between items-center text-xs text-slate-500 font-medium tracking-wider uppercase">
           <span>© 2024 Monetaris Inc.</span>
           <div className="flex gap-4">
              <span>Datenschutz</span>
              <span>AGB</span>
              <span>Status: <span className="text-monetaris-accent">Operational</span></span>
           </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex flex-col justify-center items-center p-6 relative">
        {/* Mobile Background Elements */}
        <div className="absolute inset-0 lg:hidden bg-slate-900">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            <div className="absolute top-[-20%] right-[-20%] w-[400px] h-[400px] bg-monetaris-accent/20 rounded-full blur-[80px]"></div>
        </div>

        <div className="w-full max-w-[440px] relative z-10">
          <div className="mb-12 lg:hidden text-center">
             <MonetarisLogo className="h-16 w-auto mx-auto mb-6" />
             <h1 className="text-3xl font-display font-bold text-white">Monetaris</h1>
          </div>

          <div className="bg-white dark:bg-[#0A0A0A] backdrop-blur-xl border border-slate-200 dark:border-white/5 p-10 rounded-[32px] shadow-2xl dark:shadow-black/80">
             <div className="mb-8">
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Terminal Anmeldung</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Geben Sie Ihre Sicherheitsdaten ein.</p>
             </div>

             <form className="space-y-6" onSubmit={handleSubmit}>
                <Input 
                  label="E-Mail Adresse"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@firma.de"
                  required
                  autoFocus
                />
                
                <div className="relative group">
                  <div className="flex justify-between items-center mb-2.5 ml-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-focus-within:text-monetaris-600 dark:group-focus-within:text-monetaris-accent transition-colors">Passwort</label>
                      <a href="#/passwort-vergessen" className="text-xs font-bold text-monetaris-600 dark:text-monetaris-accent hover:underline">Vergessen?</a>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-5 py-4 border border-slate-200 rounded-2xl bg-white text-slate-900 focus:border-monetaris-600 focus:ring-2 focus:ring-monetaris-600/20 transition-all dark:bg-[#151515] dark:border-white/10 dark:text-white dark:focus:border-monetaris-accent"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-500/20">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    {error}
                  </div>
                )}

                <Button variant="glow" type="submit" className="w-full py-4 text-base rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all" loading={loading}>
                  <span className="font-bold">Authentifizieren</span> <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
             </form>

          </div>
          
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-600">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
             System Operational • v2.4.0-rc
          </div>
        </div>
      </div>
    </div>
  );
};