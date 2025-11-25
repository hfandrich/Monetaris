
import React, { useState } from 'react';
import { PageHeader, Card, Button, Input, Badge } from '../components/UI';
import { User, UserRole } from '../types';
import { authService } from '../services/authService';
import { User as UserIcon, Shield, Bell, Lock, LogOut, Check, Mail, Smartphone } from 'lucide-react';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'SECURITY' | 'NOTIFICATIONS'>('PROFILE');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const { user } = authService.checkSession();

  const handleSave = () => {
    setLoading(true);
    // Simulate API Call
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg('Einstellungen erfolgreich gespeichert.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }, 800);
  };

  const tabs = [
    { id: 'PROFILE', label: 'Profil & Firma', icon: UserIcon },
    { id: 'SECURITY', label: 'Sicherheit', icon: Shield },
    { id: 'NOTIFICATIONS', label: 'Benachrichtigungen', icon: Bell },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <PageHeader 
        title="Einstellungen" 
        subtitle="Verwalten Sie Ihren Account und Systempräferenzen." 
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-3 space-y-2">
           {/* Mobile: Horizontal Scroll or Grid? Stacking buttons is fine for 3 items */}
           <div className="flex flex-col gap-2">
            {tabs.map(tab => (
                <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                    activeTab === tab.id 
                    ? 'bg-slate-900 text-white shadow-lg dark:bg-white dark:text-black' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
                }`}
                >
                <tab.icon size={18} className="mr-3" />
                {tab.label}
                </button>
            ))}
           </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
           <Card className="min-h-[500px] dark:bg-[#0A0A0A]">
              {successMsg && (
                <div className="mb-6 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl flex items-center text-sm font-bold animate-in slide-in-from-top-2">
                  <Check size={16} className="mr-2" /> {successMsg}
                </div>
              )}

              {activeTab === 'PROFILE' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                   <div>
                      <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-1">Persönliche Daten</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Diese Informationen sind für Ihr Team sichtbar.</p>
                   </div>
                   
                   <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-[#151515] flex items-center justify-center text-slate-400 text-2xl font-bold border-2 border-dashed border-slate-300 dark:border-white/10 shrink-0">
                         {user?.name.charAt(0)}
                      </div>
                      <div>
                         <Button variant="secondary" size="sm">Bild ändern</Button>
                         <p className="text-xs text-slate-400 mt-2">Empfohlen: 400x400px, JPG oder PNG.</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="Vollständiger Name" defaultValue={user?.name} />
                      <Input label="E-Mail Adresse" defaultValue={user?.email} disabled />
                      <Input label="Rolle" defaultValue={user?.role} disabled />
                      <Input label="Abteilung / Team" defaultValue="Finance & Legal" />
                   </div>
                </div>
              )}

              {activeTab === 'SECURITY' && (
                 <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div>
                      <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-1">Sicherheit</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Passwort ändern und 2-Faktor-Authentifizierung.</p>
                   </div>

                   <div className="space-y-6 max-w-md">
                      <Input label="Aktuelles Passwort" type="password" placeholder="••••••••" />
                      <Input label="Neues Passwort" type="password" placeholder="••••••••" />
                      <Input label="Passwort bestätigen" type="password" placeholder="••••••••" />
                   </div>

                   <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                      <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Smartphone size={18} /> 2-Faktor-Authentifizierung
                      </h4>
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#151515] rounded-xl border border-slate-100 dark:border-white/5">
                         <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">Authenticator App</p>
                            <p className="text-xs text-slate-500 mt-1">Sichern Sie Ihren Account mit Google Authenticator.</p>
                         </div>
                         <Badge color="gray">Inaktiv</Badge>
                      </div>
                   </div>
                 </div>
              )}

              {activeTab === 'NOTIFICATIONS' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div>
                      <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-1">Benachrichtigungen</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Wählen Sie, worüber Sie informiert werden möchten.</p>
                   </div>

                   <div className="space-y-4">
                      {[
                        { title: "Neue Aktenübergabe", desc: "Wenn ein Mandant eine neue Forderung einstellt." },
                        { title: "Status-Updates", desc: "Bei Änderungen im Mahnstatus (z.B. Fristablauf)." },
                        { title: "Zahlungseingang", desc: "Sobald eine Teil- oder Vollzahlung verbucht wurde." },
                        { title: "Systemnachrichten", desc: "Wartungsarbeiten und wichtige Sicherheitsupdates." }
                      ].map((setting, i) => (
                        <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-[#151515] rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-white/5">
                           <div className="flex items-center gap-4">
                              <div className="p-2 bg-monetaris-100 dark:bg-monetaris-500/10 text-monetaris-600 dark:text-monetaris-400 rounded-lg shrink-0">
                                <Mail size={18} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{setting.title}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{setting.desc}</p>
                              </div>
                           </div>
                           {/* Custom Toggle Switch Mock */}
                           <div className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${i < 3 ? 'bg-monetaris-500' : 'bg-slate-200 dark:bg-[#202020]'}`}>
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${i < 3 ? 'left-7' : 'left-1'}`}></div>
                           </div>
                        </div>
                      ))}
                   </div>
                  </div>
              )}

              <div className="mt-10 pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row justify-end gap-4">
                 <Button variant="ghost" className="w-full sm:w-auto">Abbrechen</Button>
                 <Button onClick={handleSave} loading={loading} variant="glow" className="w-full sm:w-auto">Änderungen speichern</Button>
              </div>
           </Card>

           {/* Danger Zone */}
           {activeTab === 'SECURITY' && (
             <div className="mt-8 border border-red-200 dark:border-red-900/30 rounded-3xl p-8 bg-red-50 dark:bg-red-900/10">
                <h4 className="text-red-700 dark:text-red-400 font-bold mb-2 flex items-center gap-2">
                  <LogOut size={18} /> Gefahrenzone
                </h4>
                <p className="text-sm text-red-600/80 dark:text-red-400/70 mb-6">
                  Das Löschen des Accounts ist unwiderruflich. Alle zugehörigen Daten werden gemäß DSGVO entfernt.
                </p>
                <Button variant="danger" size="sm">Account löschen</Button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
