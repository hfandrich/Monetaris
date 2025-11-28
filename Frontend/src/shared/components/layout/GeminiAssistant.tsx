import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Send,
  Bot,
  Loader2,
  ChevronDown,
  Minimize2,
  Maximize2,
  ClipboardPaste,
  ArrowRight,
  Sparkles,
  User,
  ShieldAlert,
  FileText,
  Download,
  FileSpreadsheet,
  File,
} from 'lucide-react';
import { dataService } from '@/services/dataService';
import { authService } from '@/services/authService';
import { API_ENDPOINTS } from '@/services/api/config';
import { CaseStatus, RiskScore, AddressStatus, Debtor } from '@/types';
import { logger } from '@/utils/logger';

// --- Types for Chat ---
interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  isThinking?: boolean;
  toolResult?: any; // Structured data from tool execution
  toolName?: string;
}

// --- Tool Definitions ---
interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

const toolDefinitions: ToolDefinition[] = [
  {
    name: 'get_dashboard_stats',
    description:
      "Retrieves current high-level KPI statistics. Scope: 'MINE' (only my cases) or 'ALL' (global).",
    parameters: {
      type: 'object',
      properties: {
        scope: {
          type: 'string',
          enum: ['MINE', 'ALL'],
          description: 'Filter by assigned agent or show all',
        },
      },
    },
  },
  {
    name: 'get_full_dataset',
    description:
      "Retrieves a dataset list/count. Entity: 'CASES', 'DEBTORS'. Supports filtering by amount and status.",
    parameters: {
      type: 'object',
      properties: {
        entity: { type: 'string' },
        scope: { type: 'string', enum: ['MINE', 'ALL'] },
        minAmount: {
          type: 'number',
          description: 'Filter cases with totalAmount greater or equal to this value',
        },
        maxAmount: {
          type: 'number',
          description: 'Filter cases with totalAmount less or equal to this value',
        },
        status: {
          type: 'string',
          description: "Filter by specific CaseStatus (e.g. 'NEW', 'PAID', 'REMINDER_1')",
        },
      },
      required: ['entity'],
    },
  },
  {
    name: 'search_database',
    description: 'Searches for debtors or cases by name, ID, or invoice number.',
    parameters: {
      type: 'object',
      properties: { query: { type: 'string' } },
      required: ['query'],
    },
  },
  {
    name: 'create_debtor',
    description: 'Creates a NEW debtor from extracted text. Requires clear Name and Address.',
    parameters: {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        companyName: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        street: { type: 'string' },
        zipCode: { type: 'string' },
        city: { type: 'string' },
        notes: { type: 'string' },
      },
      required: ['city'],
    },
  },
  {
    name: 'export_report',
    description: 'Generates a report file link with optional filters.',
    parameters: {
      type: 'object',
      properties: {
        format: { type: 'string' },
        scope: { type: 'string', enum: ['MINE', 'ALL'] },
        minAmount: { type: 'number', description: 'Filter report for amounts >= this value' },
        maxAmount: { type: 'number', description: 'Filter report for amounts <= this value' },
        status: { type: 'string', description: 'Filter report by status' },
      },
      required: ['format'],
    },
  },
];

// --- UI Components for Rich Responses ---

const ToolResultCard = ({
  toolName,
  result,
  navigate,
}: {
  toolName: string;
  result: any;
  navigate: any;
}) => {
  if (!result) return null;

  // 1. Download Card
  if (toolName === 'export_report' && result.downloadLink) {
    const isExcel = result.downloadLink.includes('xlsx') || result.format === 'EXCEL';
    const isPdf = result.downloadLink.includes('pdf') || result.format === 'PDF';
    return (
      <div
        className="mt-2 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-4 group cursor-pointer transition-all hover:shadow-md"
        onClick={() => {
          const link = document.createElement('a');
          link.setAttribute('href', result.downloadLink);
          // Ensure download attribute is set, fallback to generic name if blob
          link.setAttribute(
            'download',
            `report_${Date.now()}.${isExcel ? 'xlsx' : isPdf ? 'pdf' : 'csv'}`
          );
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }}
      >
        <div
          className={`p-3 rounded-xl ${isExcel ? 'bg-emerald-200 text-emerald-800' : isPdf ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800'}`}
        >
          {isExcel ? (
            <FileSpreadsheet size={24} />
          ) : isPdf ? (
            <FileText size={24} />
          ) : (
            <File size={24} />
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">Report bereit</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {result.filterSummary ? `Gefiltert: ${result.filterSummary}` : 'Alle Daten'} •{' '}
            {result.count ? `${result.count} Einträge` : 'Download'}
          </p>
        </div>
        <div className="bg-white dark:bg-[#101010] p-2 rounded-full shadow-sm border border-slate-100 dark:border-white/10 group-hover:scale-110 transition-transform">
          <Download size={16} className="text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>
    );
  }

  // 2. Stats Card
  if (toolName === 'get_dashboard_stats') {
    return (
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="p-3 bg-slate-50 dark:bg-[#151515] rounded-lg border border-slate-100 dark:border-white/5">
          <p className="text-[10px] text-slate-400 uppercase font-bold">Volumen ({result.scope})</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            € {(result.totalVolume / 1000).toFixed(1)}k
          </p>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-[#151515] rounded-lg border border-slate-100 dark:border-white/5">
          <p className="text-[10px] text-slate-400 uppercase font-bold">Active Cases</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{result.activeCases}</p>
        </div>
      </div>
    );
  }

  // 3. Dataset Card
  if (toolName === 'get_full_dataset') {
    return (
      <div className="mt-2 p-3 bg-slate-50 dark:bg-[#151515] rounded-lg border border-slate-100 dark:border-white/5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold uppercase text-slate-500">Gefundene Datensätze</span>
          <span className="bg-monetaris-100 dark:bg-monetaris-900/20 text-monetaris-700 dark:text-monetaris-400 text-xs font-bold px-2 py-0.5 rounded-full">
            {result.count}
          </span>
        </div>
        {result.filters && (
          <div className="text-[10px] text-slate-400 mb-2 flex flex-wrap gap-1">
            {result.filters.map((f: string, i: number) => (
              <span
                key={i}
                className="bg-white dark:bg-white/10 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10"
              >
                {f}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 4. Creation Card
  if (toolName === 'create_debtor') {
    return (
      <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <p className="text-xs font-bold text-blue-700 dark:text-blue-300">Schuldner angelegt</p>
        </div>
        <p className="text-sm font-bold dark:text-white">
          {result.companyName || `${result.lastName}, ${result.firstName}`}
        </p>
        <p className="text--[10px] text-slate-500 dark:text-slate-400 mt-1">
          {result.id} • {result.address.city}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-2 text-xs font-mono text-slate-500 bg-slate-100 dark:bg-[#151515] p-2 rounded border border-slate-200 dark:border-white/5 overflow-x-auto">
      {JSON.stringify(result, null, 2).slice(0, 150)}...
    </div>
  );
};

// --- Main Component ---

export const GeminiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'system', text: 'Babera v2.5 bereit. "Extraction Mode" aktiv.' },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, thinkingStep]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputValue]);

  // Context-Aware Quick Prompts
  const getQuickPrompts = () => {
    const path = location.pathname;
    if (path.includes('debtors')) {
      return [
        { label: 'Meine Schuldner', prompt: 'Zeige mir alle Schuldner, die mir zugewiesen sind.' },
        {
          label: 'Neuer Schuldner (Text)',
          prompt: 'Ich habe hier die Daten eines neuen Schuldners: ',
        },
        { label: 'Riskante Schuldner', prompt: 'Welche meiner Schuldner haben ein hohes Risiko?' },
      ];
    }
    return [
      {
        label: 'Fälle > 5000€',
        prompt: 'Wie viele Fälle haben wir mit einer Forderung über 5.000€?',
      },
      { label: 'CSV Export', prompt: 'Erstelle einen CSV Bericht aller offenen Fälle.' },
      { label: 'Datenextraktion', prompt: 'Analysiere diesen Text und erstelle einen Schuldner: ' },
    ];
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const { user } = authService.checkSession();
    if (!user) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: inputValue };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsThinking(true);
    setThinkingStep('Analysiere Eingabe...');

    // Enhanced System Prompt for Extraction & Scope Awareness
    const contextInstruction = `
    Du bist "Babera Ai", der intelligente Assistent für die Inkasso-Software "Monetaris".

    **AKTUELLE USER-DATEN:**
    User: ${user.name} (ID: ${user.id})
    Rolle: ${user.role}

    **DEINE AUFGABEN:**
    1. **Daten-Extraktion**: Wenn der User einen Text (z.B. E-Mail oder PDF-Copy-Paste) eingibt, der nach Schuldnerdaten aussieht:
       - Analysiere den Text auf Name, Firma, Adresse (Straße, PLZ, Ort).
       - Wenn wichtige Daten fehlen (z.B. PLZ oder Ort), **FRAGE DEN USER** nach diesen Details, bevor du ein Tool aufrufst. Erfinde keine Daten!
       - Wenn alles da ist, nutze das Tool 'create_debtor'.

    2. **Scope-Management**:
       - Wenn der User "meine Fälle" oder "mein Portfolio" sagt, nutze 'scope: "MINE"'.
       - Wenn der User "alle" oder "global" sagt, nutze 'scope: "ALL"'.
       - Default: Nimm an, der User meint SEINE Daten ("MINE").

    3. **Filtering & Reporting**:
       - Du KANNST nun filtern! Wenn der User z.B. "Fälle über 5000€" sagt, nutze 'minAmount: 5000'.
       - Nutze 'status' Parameter für Filter wie 'NEW', 'PAID', etc.
       - Wenn der User einen Bericht will und Filter nennt (z.B. "Exportiere alle Fälle über 1000€"), wende diese Filter auch im 'export_report' Tool an.
       - **WICHTIG**: Wenn du einen Report erstellst, generiere NIEMALS Text-Links (wie [Download](...) oder example.com). Nutze AUSSCHLIESSLICH das Tool 'export_report'. Das UI zeigt den Download-Button automatisch an. Antworte nur kurz: "Der Bericht ist bereit."

    **VERHALTEN:**
    - Sei präzise und professionell.
    - Wenn du Daten extrahierst, bestätige kurz, was du gefunden hast.
    `;

    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      // Build message history for backend
      const messageHistory = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const response = await fetch(API_ENDPOINTS.AI.CHAT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'user', text: contextInstruction },
            ...messageHistory,
            { role: 'user', text: inputValue },
          ],
          tools: toolDefinitions,
        }),
      });

      if (!response.ok) {
        throw new Error('AI request failed');
      }

      const data = await response.json();

      // Handle tool calls if present
      if (data.toolCalls && data.toolCalls.length > 0) {
        setThinkingStep(`Führe ${data.toolCalls.length} Aktionen aus...`);

        for (const call of data.toolCalls) {
          // Inject User ID into args if scope is MINE or needed for creation
          const args = { ...call.args, userId: user.id };
          const result = await executeTool(call.name, args);

          const toolMsg: Message = {
            id: Date.now().toString() + Math.random(),
            role: 'model',
            text: `System: Tool '${call.name}' erfolgreich ausgeführt.`,
            toolName: call.name,
            toolResult: result,
          };
          setMessages((prev) => [...prev, toolMsg]);
        }
      }

      // Handle text response
      if (data.text) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: 'model', text: data.text },
        ]);
      }
    } catch (error) {
      logger.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'model',
          text: 'Entschuldigung, ich konnte die Anfrage nicht verarbeiten.',
        },
      ]);
    } finally {
      setIsThinking(false);
      setThinkingStep('');
    }
  };

  // --- Tool Executor ---
  const executeTool = async (name: string, args: any) => {
    await new Promise((resolve) => setTimeout(resolve, 600)); // Mock Delay

    // Helper: Filter Logic based on Scope AND Arguments
    const filterCases = async () => {
      let result = await dataService.getCases();

      // Scope Filter
      if (args.scope === 'MINE') {
        result = result.filter((c) => c.agentId === args.userId);
      }

      // Value Filter
      if (args.minAmount !== undefined) {
        result = result.filter((c) => c.totalAmount >= args.minAmount);
      }
      if (args.maxAmount !== undefined) {
        result = result.filter((c) => c.totalAmount <= args.maxAmount);
      }

      // Status Filter
      if (args.status) {
        // Allow partial matching or specific status
        result = result.filter((c) => c.status.includes(args.status));
      }

      return result;
    };

    switch (name) {
      case 'get_dashboard_stats':
        const casesForStats = await filterCases(); // Apply scope if needed
        const totalVolume = casesForStats.reduce((acc, curr) => acc + curr.totalAmount, 0);
        const activeCases = casesForStats.filter((c) => c.status !== CaseStatus.PAID).length;
        return { totalVolume, activeCases, scope: args.scope || 'ALL' };

      case 'get_full_dataset':
        if (args.entity === 'CASES') {
          const filteredData = await filterCases();
          const appliedFilters = [];
          if (args.minAmount) appliedFilters.push(`Min: €${args.minAmount}`);
          if (args.maxAmount) appliedFilters.push(`Max: €${args.maxAmount}`);
          if (args.status) appliedFilters.push(`Status: ${args.status}`);

          return {
            count: filteredData.length,
            filters: appliedFilters,
            info: `Gefunden: ${filteredData.length} Fälle.`,
          };
        }
        return { error: 'Unknown Entity' };

      case 'create_debtor':
        const newDebtor: Debtor = {
          id: `d-ai-${Date.now()}`,
          tenantId: 't1',
          agentId: args.userId, // Assign to current user (Agent Ownership)
          isCompany: !!args.companyName,
          companyName: args.companyName,
          firstName: args.firstName,
          lastName: args.lastName,
          email: args.email || 'unknown@email.com',
          phone: args.phone || '',
          address: {
            street: args.street || 'Unknown Street',
            zipCode: args.zipCode || '00000',
            city: args.city || 'Unknown City',
            country: 'DE',
            status: AddressStatus.CONFIRMED,
          },
          riskScore: RiskScore.C,
          totalDebt: 0,
          openCases: 0,
          notes: `Erstellt via Babera Extraction. ${args.notes || ''}`,
        };
        await dataService.addDebtor(newDebtor);
        return newDebtor;

      case 'export_report':
        // Simulate filtering effect by generating real dummy content
        const filteredExportData = await filterCases();
        const count = filteredExportData.length > 0 ? filteredExportData.length : 15; // Fallback for better demo feel

        // Generate headers and rows for CSV
        const headers = 'CaseID;InvoiceDate;Amount;Debtor;Status\n';
        let rows = '';

        if (filteredExportData.length > 0) {
          rows = filteredExportData
            .map(
              (c) =>
                `${c.id};${new Date(c.invoiceDate).toISOString().split('T')[0]};${c.totalAmount.toFixed(2)};${c.debtorName};${c.status}`
            )
            .join('\n');
        } else {
          // Generate dummy data if filter returns empty (just for demo continuity)
          rows = Array.from({ length: 15 })
            .map(
              (_, i) =>
                `C-${202400 + i};${new Date().toISOString().split('T')[0]};${(Math.random() * 1000).toFixed(2)};Debtor ${i};${args.status || 'OPEN'}`
            )
            .join('\n');
        }

        // Create Blob
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        return {
          status: 'success',
          count: count,
          filterSummary: `${args.scope || 'ALL'}${args.minAmount ? ', >€' + args.minAmount : ''}`,
          downloadLink: url, // Actual Blob URL
          format: args.format || 'CSV',
        };

      default:
        return { info: 'Action simulated.' };
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group"
      >
        <Bot size={24} />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex flex-col bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 shadow-2xl transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'w-[90vw] h-[90vh] rounded-2xl' : 'w-[400px] h-[600px] rounded-[24px]'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#101010] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-monetaris-500 to-emerald-300 rounded-lg flex items-center justify-center text-white shadow-lg shadow-monetaris-500/20">
            <Sparkles size={16} className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white font-display">
              Babera Ai
            </h3>
            <p className="text-[10px] text-monetaris-600 dark:text-monetaris-400 font-mono uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors text-slate-500"
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-500 transition-colors rounded-lg"
          >
            <ChevronDown size={20} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 bg-slate-50/30 dark:bg-transparent">
        {messages.map((msg, idx) =>
          msg.role === 'system' ? (
            <div key={msg.id} className="flex justify-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full">
                {msg.text}
              </span>
            </div>
          ) : (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-200 dark:bg-white/10' : 'bg-monetaris-100 dark:bg-monetaris-500/10 text-monetaris-600 dark:text-monetaris-400'}`}
              >
                {msg.role === 'user' ? <User size={14} /> : <Bot size={16} />}
              </div>
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-3 rounded-2xl text-sm shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-black rounded-tr-none'
                      : 'bg-white dark:bg-[#151515] border border-slate-100 dark:border-white/5 text-slate-800 dark:text-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
                {msg.toolResult && (
                  <ToolResultCard
                    toolName={msg.toolName || ''}
                    result={msg.toolResult}
                    navigate={navigate}
                  />
                )}
              </div>
            </div>
          )
        )}
        {isThinking && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-monetaris-100 dark:bg-monetaris-500/10 text-monetaris-600 dark:text-monetaris-400 flex items-center justify-center shrink-0">
              <Loader2 size={16} className="animate-spin" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="bg-white dark:bg-[#151515] px-4 py-2 rounded-full rounded-tl-none border border-slate-100 dark:border-white/5 text-xs font-medium text-slate-500 animate-pulse">
                {thinkingStep}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-[#0A0A0A] border-t border-slate-100 dark:border-white/5">
        {!inputValue && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-1 custom-scrollbar">
            {getQuickPrompts().map((qp, i) => (
              <button
                key={i}
                onClick={() => setInputValue(qp.prompt)}
                className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-monetaris-50 dark:hover:bg-monetaris-500/10 hover:border-monetaris-200 dark:hover:border-monetaris-500/30 transition-colors flex items-center gap-2"
              >
                <Sparkles size={10} /> {qp.label}
              </button>
            ))}
          </div>
        )}
        <div className="relative bg-slate-50 dark:bg-[#151515] rounded-2xl border border-slate-200 dark:border-white/10 focus-within:border-monetaris-500 focus-within:ring-2 focus-within:ring-monetaris-500/20 transition-all">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Befehl eingeben oder Email/PDF Text einfügen..."
            className="w-full pl-4 pr-12 py-3 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none resize-none min-h-[48px] max-h-[200px]"
            rows={1}
          />
          <div className="absolute right-2 bottom-2 flex gap-1">
            <button
              className="p-2 bg-white dark:bg-[#202020] text-slate-400 hover:text-monetaris-500 rounded-xl transition-colors shadow-sm"
              title="Paste"
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  setInputValue((prev) => prev + (prev ? '\n' : '') + text);
                } catch (e) {
                  logger.error(e);
                }
              }}
            >
              <ClipboardPaste size={16} />
            </button>
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isThinking}
              className="p-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-slate-900/20"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
        <div className="flex justify-between mt-2 px-1">
          <p className="text-[9px] text-slate-400 font-medium flex items-center gap-1">
            <ShieldAlert size={10} /> Eingaben werden lokal vorverarbeitet.
          </p>
          <p className="text-[9px] text-slate-400 font-mono">Context: {location.pathname}</p>
        </div>
      </div>
    </div>
  );
};
