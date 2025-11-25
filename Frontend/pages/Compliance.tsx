import React from 'react';
import { PageHeader, Card, Badge } from '../components/UI';
import { Shield, Database, Eye, Trash2, Lock, FileCheck, CheckCircle2, Server, Activity } from 'lucide-react';

export const Compliance: React.FC = () => {
  // Mock Audit Log
  const logs = [
    { id: 1, action: 'DATA_ACCESS', user: 'Sarah Connor', role: 'Agent', target: 'Schuldner D-1023', time: '24. Okt, 14:30:05' },
    { id: 2, action: 'PAYMENT_AUTO', user: 'AI System', role: 'Bot', target: 'Akte C-992', time: '24. Okt, 14:15:22' },
    { id: 3, action: 'AUTH_LOGIN', user: 'Maximilian Müller', role: 'Admin', target: 'Dashboard', time: '24. Okt, 09:00:12' },
    { id: 4, action: 'EXPORT_CSV', user: 'Sarah Connor', role: 'Agent', target: 'Report_Q3', time: '23. Okt, 16:45:00' },
  ];

  const Feature = ({ icon: Icon, title, desc, color }: any) => {
    const colors: any = {
      green: "text-monetaris-600 bg-monetaris-100 border-monetaris-200 dark:text-monetaris-400 dark:bg-monetaris-900/20 dark:border-monetaris-800/30",
      purple: "text-purple-600 bg-purple-100 border-purple-200 dark:text-ai-purple dark:bg-ai-purple/10 dark:border-ai-purple/20",
      blue: "text-blue-600 bg-blue-100 border-blue-200 dark:text-ai-blue dark:bg-ai-blue/10 dark:border-ai-blue/20",
      red: "text-red-600 bg-red-100 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800/30"
    };

    return (
      <div className="glass-panel p-6 rounded-3xl hover:bg-white/50 dark:hover:bg-[#111111] transition-all duration-300 hover:-translate-y-1 group dark:bg-[#0A0A0A]">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${colors[color]}`}>
          <Icon size={24} />
        </div>
        <h4 className="text-lg font-bold text-slate-900 dark:text-white font-display mb-2 group-hover:text-monetaris-500 dark:group-hover:text-monetaris-400 transition-colors">{title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <PageHeader 
        title="Sicherheit & Compliance" 
        subtitle="DSGVO Governance, Löschkonzepte & Revisionssicheres Protokoll" 
        action={<Badge color="green"><Shield size={12} className="mr-1.5 inline" /> DSGVO Konform</Badge>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Feature color="green" icon={Database} title="Datenminimierung" desc="Nur essentielle Schuldnerdaten werden gespeichert. Automatische Maskierung inaktiver Akten." />
        <Feature color="red" icon={Trash2} title="Löschkonzept" desc="Automatische Löschroutinen gemäß GoBD & DSGVO Standards (3/10 Jahre)." />
        <Feature color="purple" icon={Lock} title="Verschlüsselung" desc="AES-256 at Rest. TLS 1.3 in Transit. Argon2id Hashing. Zero-Knowledge Prinzipien." />
        <Feature color="blue" icon={Eye} title="Zugriffskontrolle" desc="Striktes RBAC auf allen API Endpunkten. MFA erzwungen für alle Sachbearbeiter-Accounts." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Server Status */}
        <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel p-6 rounded-3xl relative overflow-hidden dark:bg-[#0A0A0A]">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Server size={100} className="text-slate-900 dark:text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                   <Activity size={18} className="text-monetaris-500" /> System Status
                </h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">API Latenz</span>
                        <span className="text-monetaris-600 dark:text-monetaris-400 font-mono text-sm">24ms</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-[#151515] rounded-full h-1">
                        <div className="bg-monetaris-500 h-1 rounded-full w-[15%] shadow-sm"></div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">DB Last</span>
                        <span className="text-blue-600 dark:text-ai-blue font-mono text-sm">12%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-[#151515] rounded-full h-1">
                        <div className="bg-blue-500 dark:bg-ai-blue h-1 rounded-full w-[12%]"></div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Verschlüsselung</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono text-xs">AKTIV</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Audit Log */}
        <div className="lg:col-span-2">
            <Card className="h-full dark:bg-[#0A0A0A]" noPadding>
                <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-monetaris-100 dark:bg-monetaris-500/10 rounded-lg text-monetaris-600 dark:text-monetaris-400 border border-monetaris-200 dark:border-monetaris-500/20">
                        <FileCheck size={18} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Audit Protokoll</h3>
                </div>
                <Badge color="purple">Revisionssicher</Badge>
                </div>
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 dark:divide-white/5">
                    <thead className="bg-slate-50 dark:bg-[#050505]">
                    <tr>
                        <th className="px-6 py-4 text-left text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">Zeitstempel</th>
                        <th className="px-6 py-4 text-left text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">Event</th>
                        <th className="px-6 py-4 text-left text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">Akteur</th>
                        <th className="px-6 py-4 text-left text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">Ressource</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-[#111111] transition-colors">
                        <td className="px-6 py-4 text-xs text-slate-500 font-mono">{log.time}</td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${log.action.includes('ACCESS') ? 'bg-amber-400' : 'bg-monetaris-500'}`}></div>
                            {log.action}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">
                            <span className="block text-slate-900 dark:text-white font-medium">{log.user}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">{log.role}</span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
                            <span className="bg-slate-100 dark:bg-[#151515] px-2 py-1 rounded border border-slate-200 dark:border-white/5">{log.target}</span>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};