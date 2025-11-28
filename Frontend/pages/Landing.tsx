import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MonetarisLogo, Button } from '../components/UI';
import { ArrowRight, Shield, Zap, Globe, Play, Hexagon, Sun, Moon, CheckCircle2, TrendingUp, Activity, Code, Terminal, Server, Lock, Key, Database, FileJson, Share2, LogIn, ChevronDown, Briefcase, CreditCard, Cpu, Smartphone, Mail, MessageSquare, Gavel, BarChart3 } from 'lucide-react';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false); 
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);
  const [visibleCodeLines, setVisibleCodeLines] = useState(0);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('theme-barbie');
    
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');

    const handleScroll = () => setScrolled(window.scrollY > 50);
    const handleMouseMove = (e: MouseEvent) => {
      // Throttled requestAnimationFrame for smoother parallax
      requestAnimationFrame(() => {
        setMousePos({
            x: (e.clientX / window.innerWidth) * 15 - 7.5,
            y: (e.clientY / window.innerHeight) * 15 - 7.5
        });
      });
    };

    // Faster, smoother typing effect
    const typingInterval = setInterval(() => {
        setVisibleCodeLines(prev => prev < 12 ? prev + 1 : prev);
    }, 150);

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(typingInterval);
    };
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#020408] text-slate-900 dark:text-white overflow-x-hidden font-sans transition-colors duration-700 selection:bg-monetaris-500 selection:text-white">
      
      {/* --- Dynamic Background Layer --- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-100 dark:opacity-20 transform perspective-[1000px] rotate-x-12 scale-150"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-emerald-500/5 dark:bg-monetaris-500/10 rounded-full blur-[120px] animate-pulse-slow mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/5 dark:bg-ai-purple/10 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen"></div>
      </div>

      {/* --- Navigation --- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 dark:bg-[#020408]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 py-4 shadow-sm' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.scrollTo(0, 0)}>
             <MonetarisLogo className="h-8 w-auto text-slate-900 dark:text-white" />
             <span className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">Monetaris</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500 dark:text-slate-400">
             <a href="#features" className="hover:text-monetaris-600 dark:hover:text-white transition-colors">Features</a>
             <a href="#technology" className="hover:text-monetaris-600 dark:hover:text-white transition-colors">Technologie</a>
             <a href="#security" className="hover:text-monetaris-600 dark:hover:text-white transition-colors">Sicherheit</a>
          </div>

          <div className="flex items-center gap-4">
             <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white hover:scale-110 transition-transform">
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
             </button>
             <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-1"></div>
             
             <div className="relative">
                 <Button variant="glow" size="sm" onClick={() => setLoginMenuOpen(!loginMenuOpen)} className="rounded-full px-6 shadow-lg shadow-monetaris-500/20 flex items-center gap-2">
                    Login <ChevronDown size={14} />
                 </Button>
                 
                 {loginMenuOpen && (
                     <div className="absolute top-full right-0 mt-4 w-64 bg-white dark:bg-[#151515] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col p-2 ring-1 ring-black/5">
                         <button 
                            onClick={() => navigate('/client-login')} 
                            className="text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all group flex items-center gap-3"
                         >
                             <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                <Briefcase size={16} />
                             </div>
                             <div>
                                 <span className="block text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Mandanten</span>
                                 <span className="block text-[10px] text-slate-500">Für Gläubiger & Firmen</span>
                             </div>
                         </button>
                         
                         <button 
                            onClick={() => navigate('/resolve')} 
                            className="text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all group flex items-center gap-3 mt-1"
                         >
                             <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                                <CreditCard size={16} />
                             </div>
                             <div>
                                 <span className="block text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Resolution Center</span>
                                 <span className="block text-[10px] text-slate-500">Für Zahlungspflichtige</span>
                             </div>
                         </button>

                         <div className="h-px bg-slate-100 dark:bg-white/5 my-2 mx-2"></div>
                         
                         <button onClick={() => navigate('/login')} className="text-center px-4 py-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white">
                             Mitarbeiter Login
                         </button>
                     </div>
                 )}
             </div>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative z-10 pt-40 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-1000 relative z-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
               <span className="text-xs font-bold text-slate-600 dark:text-monetaris-400 tracking-wide uppercase">System Operational v2.5</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold leading-[1.05] tracking-tight text-slate-900 dark:text-white">
              Liquidität.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-monetaris-600 to-blue-600 dark:from-monetaris-400 dark:to-blue-400">Global & Digital.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
              Die erste Inkasso-Plattform, die KI-gesteuerte Verhaltensanalyse mit juristischer Präzision verbindet. 
              <span className="block mt-2 font-medium text-slate-900 dark:text-white">Automatisieren Sie Forderungen weltweit per API.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
               <Button variant="primary" onClick={() => navigate('/client-login')} className="rounded-full h-14 px-8 text-lg group shadow-xl shadow-slate-200 dark:shadow-none">
                  Als Mandant starten <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </Button>
               <button onClick={() => navigate('/resolve')} className="h-14 px-8 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white flex items-center justify-center gap-2 font-bold transition-all hover:scale-105 shadow-sm">
                  Forderung begleichen
               </button>
            </div>

            <div className="pt-8 flex flex-wrap items-center gap-x-8 gap-y-4 text-slate-500 dark:text-slate-500 border-t border-slate-200 dark:border-white/10">
               <div className="flex items-center gap-2 group">
                  <Globe size={18} className="group-hover:text-monetaris-500 transition-colors" />
                  <span className="text-xs font-bold uppercase tracking-wider">Vertreten in 140+ Ländern</span>
               </div>
               <div className="flex items-center gap-2 group">
                  <Zap size={18} className="group-hover:text-monetaris-500 transition-colors" />
                  <span className="text-xs font-bold uppercase tracking-wider">Instant REST API</span>
               </div>
               <div className="flex items-center gap-2 group">
                  <Shield size={18} className="group-hover:text-monetaris-500 transition-colors" />
                  <span className="text-xs font-bold uppercase tracking-wider">DSGVO Konform</span>
               </div>
            </div>
          </div>

          {/* Visual "Nano Banana" Effect (CSS Generative Art) */}
          <div className="relative perspective-[2000px] hidden lg:block z-10 h-[600px]">
             {/* Floating Glass Cards with Parallax */}
             <div className="relative w-full h-full" style={{ transform: `rotateY(${mousePos.x}deg) rotateX(${mousePos.y * -1}deg)`, transition: 'transform 0.1s ease-out' }}>
                
                {/* Central Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-blue-500/20 to-emerald-500/20 rounded-full blur-[80px]"></div>

                {/* Main Dashboard Card */}
                <div className="absolute top-[15%] left-[10%] right-[10%] bottom-[15%] bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl dark:shadow-black/50 p-6 flex flex-col animate-[float_6s_ease-in-out_infinite] overflow-hidden" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
                   {/* Card Header */}
                   <div className="flex justify-between items-center mb-8 border-b border-slate-100 dark:border-white/5 pb-4">
                      <div className="flex gap-2">
                         <div className="w-3 h-3 rounded-full bg-red-400"></div>
                         <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                         <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                      </div>
                      <div className="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                         <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> API_CONNECTED
                      </div>
                   </div>
                   
                   {/* Mock Data Rows */}
                   <div className="space-y-3 flex-1">
                      {[
                        { label: 'Global Collection', val: '142 Countries', color: 'text-blue-600 dark:text-blue-400' },
                        { label: 'API Throughput', val: '98.4%', color: 'text-emerald-600 dark:text-emerald-400' },
                        { label: 'Legal Claims', val: 'Automated', color: 'text-slate-600 dark:text-slate-400' }
                      ].map((item, i) => (
                         <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-3">
                               <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                               <div className="text-xs font-bold text-slate-500 dark:text-slate-400">{item.label}</div>
                            </div>
                            <div className={`text-xs font-mono font-bold ${item.color}`}>{item.val}</div>
                         </div>
                      ))}
                   </div>

                   {/* Animated Graph */}
                   <div className="mt-6 h-32 flex items-end justify-between gap-1.5 px-2">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                         <div key={i} className="w-full bg-slate-900 dark:bg-monetaris-500 rounded-t-[2px] opacity-20 dark:opacity-80" style={{ height: `${h}%`, transitionDelay: `${i * 50}ms` }}></div>
                      ))}
                   </div>
                </div>

                {/* Floating Widget 1 */}
                <div className="absolute top-[5%] right-[-5%] bg-white dark:bg-[#111] border border-slate-200 dark:border-white/20 p-4 rounded-2xl shadow-xl animate-[float_5s_ease-in-out_infinite] animation-delay-1000 w-48" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
                   <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                         <Shield size={16} />
                      </div>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Security</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[94%] bg-emerald-500 rounded-full"></div>
                   </div>
                   <p className="text-right text-[10px] font-bold mt-1 text-emerald-600 dark:text-emerald-400">ISO 27001</p>
                </div>

                {/* Floating Widget 2 */}
                <div className="absolute bottom-[20%] left-[-5%] bg-white dark:bg-[#111] border border-slate-200 dark:border-white/20 p-4 rounded-2xl shadow-xl animate-[float_7s_ease-in-out_infinite] animation-delay-500 flex items-center gap-3" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
                   <div className="relative">
                      <div className="absolute inset-0 bg-monetaris-500 blur-md opacity-20 animate-pulse"></div>
                      <Hexagon className="text-slate-900 dark:text-monetaris-400 relative z-10" size={32} />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">API Latency</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">24ms</p>
                   </div>
                </div>

             </div>
          </div>
        </div>
      </section>

      {/* --- Features Ticker --- */}
      <div className="border-y border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
         <div className="max-w-7xl mx-auto flex overflow-hidden py-6 lg:py-8 group">
            <div className="flex gap-12 animate-[shimmer_30s_linear_infinite] hover:pause">
               {["Global Network (140 Countries)", "Developer API", "Automated Workflows", "Predictive AI Scoring", "Whitelabel Solution", "Instant Bank Payments", "Legal Tech Integration"].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 shrink-0 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                     <CheckCircle2 size={18} className="text-monetaris-600 dark:text-monetaris-500" />
                     <span className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">{item}</span>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* --- Features Section --- */}
      <section id="features" className="py-24 lg:py-32 relative">
          <div className="max-w-7xl mx-auto px-6">
              <div className="mb-20">
                  <span className="text-monetaris-600 dark:text-monetaris-400 font-bold uppercase tracking-widest text-xs mb-2 block">Die Plattform</span>
                  <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white">Inkasso neu gedacht.</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                      {
                          icon: Cpu, title: "AI Scoring", 
                          desc: "Unsere Algorithmen analysieren Zahlungsverhalten in Echtzeit und wählen automatisch die erfolgreichste Ansprache – von der E-Mail bis zum Anruf.",
                          color: "text-purple-500"
                      },
                      {
                          icon: Zap, title: "Workflow Automation", 
                          desc: "Definieren Sie komplexe Wenn-Dann-Szenarien. Mahnstufen, gerichtliche Schritte und Ratenpläne werden vollautomatisch exekutiert.",
                          color: "text-amber-500"
                      },
                      {
                          icon: MessageSquare, title: "Omnichannel", 
                          desc: "Erreichen Sie Schuldner dort, wo sie sind. Via WhatsApp, SMS, E-Mail oder klassischem Brief. Alles in einem Dashboard.",
                          color: "text-blue-500"
                      },
                      {
                          icon: Gavel, title: "Legal Tech", 
                          desc: "Direkte Anbindung an Mahngerichte via EGVP. Beantragung von Mahnbescheiden und Vollstreckungstiteln per Klick.",
                          color: "text-red-500"
                      },
                      {
                          icon: CreditCard, title: "Instant Payments", 
                          desc: "Integrierte Bezahllinks in jeder Nachricht. Unterstützt Apple Pay, Google Pay, PayPal und SEPA Instant für sofortige Liquidität.",
                          color: "text-emerald-500"
                      },
                      {
                          icon: BarChart3, title: "Live Analytics", 
                          desc: "Verfolgen Sie jeden Cent. Echtzeit-Berichte über Cashflow, Erfolgsquoten und Prozesskosten. Exportierbar für DATEV.",
                          color: "text-cyan-500"
                      }
                  ].map((f, i) => (
                      <div key={i} className="p-8 rounded-[32px] bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all group hover:-translate-y-1 shadow-sm hover:shadow-xl dark:shadow-black/50">
                          <div className={`w-14 h-14 rounded-2xl bg-slate-50 dark:bg-[#151515] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${f.color}`}>
                              <f.icon size={28} />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{f.title}</h3>
                          <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">{f.desc}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* --- Technology / API Section --- */}
      <section id="technology" className="py-24 bg-slate-900 dark:bg-[#050505] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
          {/* Glowing Orbs */}
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[150px]"></div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 mb-6">
                          <Terminal size={14} className="text-emerald-400" />
                          <span className="text-xs font-bold uppercase tracking-widest">Developer First</span>
                      </div>
                      <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
                          Integrieren Sie Inkasso <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-100 to-cyan-400 bg-[length:200%_100%] animate-shimmer">in Minuten.</span>
                      </h2>
                      <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                          Unsere REST API ermöglicht die nahtlose Anbindung an Ihr ERP, CRM oder Shopsystem. 
                          Webhooks informieren Sie in Echtzeit über Statusänderungen.
                      </p>
                      
                      <div className="space-y-4">
                          {[
                              { icon: Zap, label: "Real-time Events", sub: "Webhooks für jeden Schritt" },
                              { icon: Lock, label: "Bank-Level Security", sub: "TLS 1.3 & AES-256" },
                              { icon: Code, label: "Typed SDKs", sub: "TypeScript, Python, Go" }
                          ].map((item, i) => (
                              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                                  <div className="p-2 bg-white/10 rounded-lg">
                                      <item.icon size={20} className="text-emerald-400" />
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-sm">{item.label}</h4>
                                      <p className="text-xs text-slate-500">{item.sub}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Code Block Visual */}
                  <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-500 animate-pulse-slow"></div>
                      <div className="relative bg-[#0A0A0A] rounded-2xl border border-white/10 shadow-2xl overflow-hidden font-mono text-sm animate-float" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
                          <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/5">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                              <span className="ml-2 text-xs text-slate-500">POST /v1/claims</span>
                          </div>
                          <div className="p-6 text-slate-300 overflow-x-auto relative h-[240px]">
                              {/* Code Lines with Sequential Reveal */}
                              <div className={`transition-opacity duration-200 ${visibleCodeLines >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                                <span className="text-purple-400">const</span> <span className="text-blue-400">response</span> = <span className="text-purple-400">await</span> monetaris.claims.<span className="text-yellow-400">create</span>({'{'}
                              </div>
                              
                              <div className={`transition-opacity duration-200 pl-4 ${visibleCodeLines >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                                <span className="text-emerald-400">amount</span>: <span className="text-orange-400">1250.00</span>,
                              </div>
                              
                              <div className={`transition-opacity duration-200 pl-4 ${visibleCodeLines >= 3 ? 'opacity-100' : 'opacity-0'}`}>
                                <span className="text-emerald-400">currency</span>: <span className="text-green-400">'EUR'</span>,
                              </div>
                              
                              <div className={`transition-opacity duration-200 pl-4 ${visibleCodeLines >= 4 ? 'opacity-100' : 'opacity-0'}`}>
                                <span className="text-emerald-400">debtor</span>: {'{'}
                              </div>
                              
                              <div className={`transition-opacity duration-200 pl-8 ${visibleCodeLines >= 5 ? 'opacity-100' : 'opacity-0'}`}>
                                <span className="text-emerald-400">name</span>: <span className="text-green-400">'TechCorp GmbH'</span>,
                              </div>
                              
                              <div className={`transition-opacity duration-200 pl-8 ${visibleCodeLines >= 6 ? 'opacity-100' : 'opacity-0'}`}>
                                <span className="text-emerald-400">email</span>: <span className="text-green-400">'billing@techcorp.com'</span>
                              </div>
                              
                              <div className={`transition-opacity duration-200 pl-4 ${visibleCodeLines >= 7 ? 'opacity-100' : 'opacity-0'}`}>
                                {'}'},
                              </div>
                              
                              <div className={`transition-opacity duration-200 pl-4 ${visibleCodeLines >= 8 ? 'opacity-100' : 'opacity-0'}`}>
                                <span className="text-emerald-400">strategy</span>: <span className="text-green-400">'AGGRESSIVE_LEGAL'</span>
                              </div>
                              
                              <div className={`transition-opacity duration-200 ${visibleCodeLines >= 9 ? 'opacity-100' : 'opacity-0'}`}>
                                {'}'});
                              </div>
                              
                              <div className={`transition-opacity duration-200 mt-4 ${visibleCodeLines >= 10 ? 'opacity-100' : 'opacity-0'}`}>
                                console.<span className="text-yellow-400">log</span>(<span className="text-green-400">'Claim ID:'</span>, response.id);
                                <span className="inline-block w-1.5 h-4 bg-emerald-500 ml-0.5 align-middle animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* --- Security Section --- */}
      <section id="security" className="py-24 bg-white dark:bg-[#020408]">
          <div className="max-w-7xl mx-auto px-6 text-center">
              <div className="inline-block p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-6">
                  <Shield size={32} />
              </div>
              <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-6">Sicherheit ohne Kompromisse.</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-16 text-lg">
                  Wir verarbeiten sensible Finanzdaten. Deshalb setzen wir auf die höchsten Sicherheitsstandards der Branche.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="p-8 rounded-[32px] bg-slate-50 dark:bg-[#0A0A0A] border border-slate-100 dark:border-white/5 flex flex-col items-center">
                      <div className="mb-4 font-display font-bold text-5xl text-slate-200 dark:text-white/10">ISO</div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">ISO 27001 Zertifiziert</h3>
                      <p className="text-sm text-slate-500">Unser Informationssicherheits-Management wird jährlich auditiert.</p>
                  </div>
                  <div className="p-8 rounded-[32px] bg-slate-50 dark:bg-[#0A0A0A] border border-slate-100 dark:border-white/5 flex flex-col items-center">
                      <div className="mb-4 font-display font-bold text-5xl text-slate-200 dark:text-white/10">GDPR</div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">DSGVO Konform</h3>
                      <p className="text-sm text-slate-500">Serverstandort Deutschland. Vollständige Löschkonzepte und AV-Verträge.</p>
                  </div>
                  <div className="p-8 rounded-[32px] bg-slate-50 dark:bg-[#0A0A0A] border border-slate-100 dark:border-white/5 flex flex-col items-center">
                      <div className="mb-4 font-display font-bold text-5xl text-slate-200 dark:text-white/10">256</div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">End-to-End Verschlüsselung</h3>
                      <p className="text-sm text-slate-500">AES-256 für Daten im Ruhezustand. TLS 1.3 für alle Übertragungen.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-12 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#020408] text-slate-500 text-sm">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
               <MonetarisLogo className="h-6 w-auto grayscale" />
               <span>© 2024 Monetaris Inc.</span>
            </div>
            <div className="flex gap-8 font-medium">
               <a href="#/datenschutz" className="hover:text-slate-900 dark:hover:text-white transition-colors">Datenschutz</a>
               <a href="#/impressum" className="hover:text-slate-900 dark:hover:text-white transition-colors">Impressum</a>
               <a href="#/agb" className="hover:text-slate-900 dark:hover:text-white transition-colors">AGB</a>
            </div>
         </div>
      </footer>

    </div>
  );
};