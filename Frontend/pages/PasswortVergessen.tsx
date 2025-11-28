import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MonetarisLogo, Button, Input } from '../components/UI';
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { authApi } from '../services/api/apiClient';
import { logger } from '../utils/logger';

export const PasswortVergessen: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate email format
      if (!email.includes('@')) {
        throw new Error('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      }

      // Call real API endpoint
      const response = await authApi.forgotPassword(email);

      if (response.success) {
        setSuccess(true);
        logger.info('Password reset email sent successfully', { email });
      } else {
        throw new Error('Fehler beim Senden der E-Mail. Bitte versuchen Sie es später erneut.');
      }
    } catch (err) {
      logger.error('Password reset request failed', err);
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#000000] transition-colors duration-700">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-monetaris-accent/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-ai-blue/10 rounded-full blur-[100px] animate-blob"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-monetaris-600 dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Zurück</span>
            </button>
            <div className="flex items-center gap-2">
              <MonetarisLogo className="h-6 w-auto" />
              <span className="font-display font-bold text-slate-900 dark:text-white">Monetaris</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="bg-white dark:bg-[#0A0A0A] backdrop-blur-xl border border-slate-200 dark:border-white/5 p-10 rounded-[32px] shadow-2xl dark:shadow-black/80">

              {!success ? (
                <>
                  <div className="mb-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-monetaris-100 dark:bg-monetaris-900/30 flex items-center justify-center mx-auto mb-6">
                      <Mail className="text-monetaris-600 dark:text-monetaris-400" size={28} />
                    </div>
                    <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                      Passwort vergessen?
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                      Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                      label="E-Mail Adresse"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@firma.de"
                      required
                      autoFocus
                    />

                    {error && (
                      <div className="flex items-center gap-2 text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-500/20">
                        <AlertCircle size={16} />
                        {error}
                      </div>
                    )}

                    <Button
                      variant="glow"
                      type="submit"
                      className="w-full py-4 text-base rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
                      loading={loading}
                    >
                      <span className="font-bold">Link anfordern</span>
                    </Button>
                  </form>

                  <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Passwort wieder eingefallen?{' '}
                      <button
                        onClick={() => navigate('#/login')}
                        className="font-bold text-slate-900 dark:text-white hover:text-monetaris-600 dark:hover:text-monetaris-accent transition-colors"
                      >
                        Zurück zum Login
                      </button>
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={28} />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">
                    E-Mail gesendet!
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 mb-8">
                    Wir haben einen Link zum Zurücksetzen Ihres Passworts an{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>{' '}
                    gesendet. Bitte überprüfen Sie auch Ihren Spam-Ordner.
                  </p>

                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      onClick={() => navigate('#/login')}
                      className="w-full py-3 rounded-2xl"
                    >
                      Zurück zum Login
                    </Button>

                    <button
                      onClick={() => {
                        setSuccess(false);
                        setEmail('');
                      }}
                      className="text-sm text-slate-500 dark:text-slate-400 hover:text-monetaris-600 dark:hover:text-monetaris-accent transition-colors"
                    >
                      Andere E-Mail verwenden
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-600">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              System Operational • v2.4.0-rc
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
