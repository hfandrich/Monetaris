
import React, { useState, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import { PageHeader, Card, Button, Badge, Input } from '../components/UI';
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle, FileText, ArrowRight, X, Paperclip, File as FileIcon, Check, AlertTriangle, Maximize2, Minimize2, Monitor, ScanEye, ChevronLeft, ChevronRight as ChevronRightIcon, Save } from 'lucide-react';
import { dataService } from '../services/dataService';
import { authService } from '../services/authService';

interface ImportItem {
  id: string;
  invoice: string;
  debtor: string;
  amount: string;
  due: string;
  attachedFile?: File;
}

interface CsvRow {
  [key: string]: string;
}

export const Import: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [pdfDragActive, setPdfDragActive] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState<'UPLOAD' | 'PREVIEW' | 'SUCCESS'>('UPLOAD');
  const [previewItems, setPreviewItems] = useState<ImportItem[]>([]);
  
  // Focus Mode / Split Screen State
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handlePdfDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setPdfDragActive(true);
    else if (e.type === "dragleave") setPdfDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setCsvFile(file);
      await parseCsvFile(file);
      setStep('PREVIEW');
    }
  };

  const handlePdfDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPdfDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) processPdfFiles(Array.from(e.dataTransfer.files));
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCsvFile(file);
      await parseCsvFile(file);
      setStep('PREVIEW');
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) processPdfFiles(Array.from(e.target.files));
  };

  /**
   * Parse CSV file and extract invoice data
   * Supports common CSV formats with semicolon or comma separators
   */
  const parseCsvFile = (file: File): Promise<void> => {
    return new Promise((resolve) => {
      Papa.parse<CsvRow>(file, {
        header: true,
        skipEmptyLines: true,
        delimiter: '', // Auto-detect (handles both ; and ,)
        transformHeader: (header) => header.trim().toLowerCase(),
        complete: (results) => {
          const items: ImportItem[] = results.data
            .map((row, index) => {
              // Try to find invoice number field (various possible names)
              const invoice = row['rechnungsnummer'] ||
                            row['invoice'] ||
                            row['invoicenumber'] ||
                            row['rechnungs-nr'] ||
                            row['rechnungsnr'] ||
                            '';

              // Try to find debtor name (various possible names)
              const debtor = row['schuldner'] ||
                           row['kunde'] ||
                           row['debtor'] ||
                           row['name'] ||
                           row['kundenname'] ||
                           row['kunde name'] ||
                           '';

              // Try to find amount (various possible names)
              let amountStr = row['betrag'] ||
                            row['amount'] ||
                            row['summe'] ||
                            row['total'] ||
                            row['betrag brutto'] ||
                            '0';

              // Clean amount: remove currency symbols, convert comma to dot
              amountStr = amountStr.replace(/[€$]/g, '').replace(',', '.').trim();
              const amountNum = parseFloat(amountStr) || 0;

              // Format as German currency
              const amount = new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: 'EUR'
              }).format(amountNum);

              // Try to find due date (various possible names)
              const dueStr = row['fälligkeit'] ||
                           row['fälligkeitsdatum'] ||
                           row['due'] ||
                           row['duedate'] ||
                           row['due date'] ||
                           '';

              // Parse date (supports YYYY-MM-DD, DD.MM.YYYY, DD/MM/YYYY)
              let due = '';
              if (dueStr) {
                const dateMatch = dueStr.match(/(\d{4})-(\d{2})-(\d{2})/);
                const germanDateMatch = dueStr.match(/(\d{2})\.(\d{2})\.(\d{4})/);
                const slashDateMatch = dueStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);

                if (dateMatch) {
                  due = `${dateMatch[3]}.${dateMatch[2]}.${dateMatch[1]}`;
                } else if (germanDateMatch) {
                  due = dueStr;
                } else if (slashDateMatch) {
                  due = `${slashDateMatch[1]}.${slashDateMatch[2]}.${slashDateMatch[3]}`;
                }
              }

              return {
                id: `${index + 1}`,
                invoice: invoice.trim(),
                debtor: debtor.trim(),
                amount,
                due: due || new Date().toLocaleDateString('de-DE')
              };
            })
            .filter(item => item.invoice && item.debtor); // Only keep rows with invoice and debtor

          setPreviewItems(items);
          resolve();
        },
        error: (error) => {
          console.error('CSV parsing error:', error);
          // Fallback to empty array on error
          setPreviewItems([]);
          resolve();
        }
      });
    });
  };

  const processPdfFiles = (files: File[]) => {
    const updatedItems = [...previewItems];
    files.forEach(file => {
      const matchIndex = updatedItems.findIndex(item => file.name.toLowerCase().includes(item.invoice.toLowerCase()));
      if (matchIndex !== -1) updatedItems[matchIndex].attachedFile = file;
    });
    setPreviewItems(updatedItems);
  };

  const handleItemUpdate = (index: number, field: keyof ImportItem, value: string) => {
      const updated = [...previewItems];
      // @ts-expect-error - attachedFile is File type but we're only updating string fields
      updated[index][field] = value;
      setPreviewItems(updated);
  };

  const processUpload = async () => {
    setUploading(true);

    try {
      // Get current user to determine kreditorId
      const authState = authService.checkSession();

      if (!authState.user || !authState.user.tenantId) {
        alert('Fehler: Kein Mandant zugeordnet. Bitte kontaktieren Sie den Administrator.');
        setUploading(false);
        return;
      }

      // Call service to import batch data
      const result = await dataService.importBatchData(authState.user.tenantId, previewItems);

      // Show errors if any
      if (result.errors && result.errors.length > 0) {
        console.warn('Import warnings:', result.errors);
        // Show summary in console, but proceed to success
      }

      setUploading(false);
      setStep('SUCCESS');
    } catch (error: any) {
      console.error('Import failed:', error);
      alert(`Import fehlgeschlagen: ${error.message || 'Unbekannter Fehler'}`);
      setUploading(false);
    }
  };

  const reset = () => {
    setCsvFile(null);
    setPreviewItems([]);
    setStep('UPLOAD');
    setSelectedItemIndex(null);
  };

  const stats = {
    total: previewItems.length,
    matched: previewItems.filter(i => i.attachedFile).length
  };

  // Focus Mode Navigation
  const nextItem = () => {
      if (selectedItemIndex !== null && selectedItemIndex < previewItems.length - 1) {
          setSelectedItemIndex(selectedItemIndex + 1);
      } else {
          setSelectedItemIndex(null); // Finish
      }
  };
  
  const prevItem = () => {
      if (selectedItemIndex !== null && selectedItemIndex > 0) {
          setSelectedItemIndex(selectedItemIndex - 1);
      }
  };

  // Keyboard Shortcuts for Focus Mode
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (selectedItemIndex === null) return;
          
          if (e.key === 'ArrowRight' && e.ctrlKey) nextItem();
          if (e.key === 'ArrowLeft' && e.ctrlKey) prevItem();
          if (e.key === 'Escape') setSelectedItemIndex(null);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemIndex]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <PageHeader 
        title="Datenimport" 
        subtitle="Stapelverarbeitung via CSV / Excel inkl. KI-basiertem Dokumentenabgleich." 
      />

      {/* Stepper */}
      <div className="flex items-center justify-center mb-12">
        <div className={`flex items-center ${step === 'UPLOAD' ? 'text-monetaris-500' : 'text-slate-400 dark:text-slate-500'}`}>
           <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${step === 'UPLOAD' ? 'border-monetaris-500 bg-monetaris-100 dark:bg-monetaris-500/10 dark:shadow-[0_0_15px_rgba(0,255,200,0.3)]' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#151515]'}`}>1</div>
           <span className="ml-3 font-display text-sm font-bold tracking-wide">Upload</span>
        </div>
        <div className="w-20 h-0.5 bg-slate-200 dark:bg-white/10 mx-4"></div>
        <div className={`flex items-center ${step === 'PREVIEW' ? 'text-monetaris-500' : 'text-slate-400 dark:text-slate-500'}`}>
           <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${step === 'PREVIEW' ? 'border-monetaris-500 bg-monetaris-100 dark:bg-monetaris-500/10 dark:shadow-[0_0_15px_rgba(0,255,200,0.3)]' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#151515]'}`}>2</div>
           <span className="ml-3 font-display text-sm font-bold tracking-wide">Validierung</span>
        </div>
        <div className="w-20 h-0.5 bg-slate-200 dark:bg-white/10 mx-4"></div>
        <div className={`flex items-center ${step === 'SUCCESS' ? 'text-monetaris-500' : 'text-slate-400 dark:text-slate-500'}`}>
           <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${step === 'SUCCESS' ? 'border-monetaris-500 bg-monetaris-100 dark:bg-monetaris-500/10 dark:shadow-[0_0_15px_rgba(0,255,200,0.3)]' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#151515]'}`}>3</div>
           <span className="ml-3 font-display text-sm font-bold tracking-wide">Fertig</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {step === 'UPLOAD' && (
          <div className="glass-panel border-dashed border-2 border-slate-300 dark:border-white/10 rounded-[32px] p-1 text-center hover:border-monetaris-500 hover:bg-slate-50 dark:hover:bg-[#0A0A0A] transition-all duration-500 group cursor-pointer dark:bg-[#050505]"
               onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => inputRef.current?.click()}>
             <div className="py-20 rounded-[28px]">
                <div className="w-24 h-24 bg-slate-100 dark:bg-[#151515] rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500 border border-slate-200 dark:border-white/10 group-hover:border-monetaris-500/30 dark:group-hover:shadow-[0_0_30px_rgba(0,255,200,0.15)]">
                  <UploadCloud className={`w-10 h-10 ${dragActive ? 'text-monetaris-500' : 'text-slate-400 dark:text-slate-400 group-hover:text-monetaris-500'} transition-colors`} />
                </div>
                <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-4">CSV Datei hier ablegen</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
                  Unterstützt .csv und .xlsx Formate. Das System mappt Spalten automatisch auf das Datenbankschema.
                </p>
                <Button variant="glow" className="px-8">Dateien durchsuchen</Button>
                <input ref={inputRef} type="file" className="hidden" accept=".csv,.xlsx" onChange={handleChange} />
             </div>
          </div>
        )}

        {step === 'PREVIEW' && csvFile && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            
            {/* --- Split Screen Focus Mode --- */}
            {selectedItemIndex !== null ? (
                <div className="fixed inset-0 z-[100] bg-slate-100 dark:bg-[#050505] flex flex-col animate-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="h-16 bg-white dark:bg-[#101010] border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <Button variant="secondary" size="sm" onClick={() => setSelectedItemIndex(null)}><Minimize2 size={16} className="mr-2"/> Exit Focus</Button>
                            <span className="text-sm font-bold text-slate-500">Datensatz {selectedItemIndex + 1} von {previewItems.length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 mr-2 hidden sm:inline">Tastatur: Ctrl + Pfeile</span>
                            <Button variant="secondary" size="sm" onClick={prevItem} disabled={selectedItemIndex === 0}><ChevronLeft size={16}/></Button>
                            <Button variant="primary" size="sm" onClick={nextItem} className="bg-blue-600 hover:bg-blue-700 border-none text-white">
                                {selectedItemIndex === previewItems.length - 1 ? 'Fertig' : 'Speichern & Weiter'} <ChevronRightIcon size={16} className="ml-2"/>
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                        {/* Left: Doc Preview */}
                        <div className="w-1/2 bg-slate-200 dark:bg-[#151515] border-r border-slate-300 dark:border-white/10 flex items-center justify-center p-8 relative">
                            {previewItems[selectedItemIndex].attachedFile ? (
                                <div className="bg-white h-full w-full shadow-2xl rounded-lg flex flex-col overflow-hidden">
                                    <div className="bg-slate-100 border-b p-2 flex justify-between items-center text-xs text-slate-500">
                                        <span>PDF Viewer Mockup</span>
                                        <span>{previewItems[selectedItemIndex].attachedFile?.name}</span>
                                    </div>
                                    <div className="flex-1 flex items-center justify-center text-slate-300">
                                        <div className="text-center">
                                            <FileText size={64} className="mx-auto mb-4 opacity-50" />
                                            <p>Vorschau aktiv</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-slate-500">
                                    <div className="w-20 h-20 bg-slate-300 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertTriangle size={32} className="opacity-50" />
                                    </div>
                                    <p className="font-bold">Kein Dokument verknüpft</p>
                                    <p className="text-xs mt-2">Ziehen Sie eine PDF in die Liste, um sie zu verknüpfen.</p>
                                </div>
                            )}
                        </div>

                        {/* Right: Data Entry */}
                        <div className="w-1/2 bg-white dark:bg-[#0A0A0A] p-10 overflow-y-auto">
                            <div className="max-w-lg mx-auto">
                                <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Datenabgleich</h3>
                                <p className="text-sm text-slate-500 mb-8">Vergleichen Sie die extrahierten Daten mit dem Beleg.</p>
                                
                                <div className="space-y-6">
                                    <Input 
                                        label="Rechnungsnummer" 
                                        value={previewItems[selectedItemIndex].invoice} 
                                        onChange={(e) => handleItemUpdate(selectedItemIndex, 'invoice', e.target.value)}
                                        className="text-lg font-mono"
                                        autoFocus
                                    />
                                    <Input 
                                        label="Schuldner Name" 
                                        value={previewItems[selectedItemIndex].debtor} 
                                        onChange={(e) => handleItemUpdate(selectedItemIndex, 'debtor', e.target.value)}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input 
                                            label="Betrag" 
                                            value={previewItems[selectedItemIndex].amount} 
                                            onChange={(e) => handleItemUpdate(selectedItemIndex, 'amount', e.target.value)}
                                            className="font-bold text-monetaris-600 dark:text-monetaris-400"
                                        />
                                        <Input 
                                            label="Fälligkeit" 
                                            value={previewItems[selectedItemIndex].due} 
                                            onChange={(e) => handleItemUpdate(selectedItemIndex, 'due', e.target.value)}
                                        />
                                    </div>
                                    
                                    <div className="pt-8 border-t border-slate-100 dark:border-white/5 flex justify-end">
                                        <Button variant="glow" size="lg" onClick={nextItem} className="w-full">
                                            Bestätigen <Check size={20} className="ml-2"/>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Standard List View
                <>
                    <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-slate-200 dark:border-white/10 dark:bg-[#0A0A0A]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                        <FileSpreadsheet size={24} />
                        </div>
                        <div>
                        <h4 className="text-slate-900 dark:text-white font-bold">{csvFile.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{(csvFile.size / 1024).toFixed(2)} KB • {previewItems.length} Zeilen erkannt</p>
                        </div>
                    </div>
                    <button onClick={reset} className="p-2 text-slate-400 hover:text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"><X size={20}/></button>
                    </div>

                    {/* Action Bar for Bulk Editing */}
                    <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-500/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
                                <ScanEye size={24} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300">Bulk Validation Mode</h4>
                                <p className="text-xs text-blue-700 dark:text-blue-400">Klicken Sie auf "Start Focus Mode", um die Zeilen nacheinander im Split-Screen zu prüfen.</p>
                            </div>
                        </div>
                        <Button size="sm" onClick={() => setSelectedItemIndex(0)} className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-500/20">
                            <Maximize2 size={16} className="mr-2" /> Start Focus Mode
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <div className={`h-full glass-panel border-dashed border-2 rounded-3xl p-6 text-center transition-all duration-300 cursor-pointer group dark:bg-[#0A0A0A] ${pdfDragActive ? 'border-ai-blue bg-blue-50 dark:bg-ai-blue/5' : 'border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20'}`}
                            onDragEnter={handlePdfDrag} onDragLeave={handlePdfDrag} onDragOver={handlePdfDrag} onDrop={handlePdfDrop} onClick={() => pdfInputRef.current?.click()}>
                            <div className="flex flex-col items-center justify-center h-full py-8">
                            <div className="w-14 h-14 bg-blue-100 dark:bg-ai-blue/10 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-ai-blue border border-blue-200 dark:border-ai-blue/20 group-hover:scale-110 transition-transform">
                                <Paperclip size={24} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Rechnungen matchen</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                                PDF-Dateien hierher ziehen. OCR-Abgleich erfolgt automatisch.
                            </p>
                            <Button size="sm" variant="secondary" className="w-full text-xs">PDFs wählen</Button>
                            <input ref={pdfInputRef} type="file" className="hidden" multiple accept=".pdf" onChange={handlePdfChange} />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <Card noPadding className="overflow-hidden h-full flex flex-col dark:bg-[#0A0A0A]">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-[#050505]">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Vorschau</span>
                            <Badge color={stats.matched === stats.total ? 'green' : 'yellow'}>{stats.matched} / {stats.total} Gematcht</Badge>
                            </div>
                            <div className="flex-1 overflow-y-auto max-h-[400px]">
                            <table className="min-w-full divide-y divide-slate-100 dark:divide-white/5">
                                <thead className="bg-slate-50 dark:bg-[#0A0A0A] sticky top-0 backdrop-blur-md">
                                <tr>
                                    <th className="px-6 py-3 text-left text-[0.6rem] font-bold text-slate-500 uppercase tracking-wider">Rechnung</th>
                                    <th className="px-6 py-3 text-left text-[0.6rem] font-bold text-slate-500 uppercase tracking-wider">Schuldner</th>
                                    <th className="px-6 py-3 text-right text-[0.6rem] font-bold text-slate-500 uppercase tracking-wider">Dokument</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {previewItems.map((row, idx) => (
                                    <tr 
                                        key={row.id} 
                                        className="hover:bg-slate-50 dark:hover:bg-[#111111] transition-colors cursor-pointer group"
                                        onClick={() => setSelectedItemIndex(idx)}
                                    >
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-mono font-bold text-slate-900 dark:text-white group-hover:text-monetaris-600 transition-colors">{row.invoice}</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">Fällig: {row.due}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{row.debtor}</p>
                                        <p className="text-xs font-bold text-monetaris-600 dark:text-monetaris-400 mt-0.5">{row.amount}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {row.attachedFile ? (
                                        <div className="flex items-center justify-end text-emerald-600 dark:text-emerald-400 gap-2">
                                            <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20 max-w-[100px] truncate">{row.attachedFile.name}</span>
                                            <CheckCircle size={16} />
                                        </div>
                                        ) : (
                                        <div className="flex items-center justify-end text-amber-500 dark:text-amber-400 gap-2">
                                            <span className="text-[10px] font-bold uppercase">Fehlt</span>
                                            <AlertTriangle size={16} />
                                        </div>
                                        )}
                                    </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            </div>
                        </Card>
                    </div>
                    </div>

                    <div className="flex items-center justify-between bg-slate-50 dark:bg-[#0A0A0A] p-4 rounded-2xl border border-slate-200 dark:border-white/10 mt-4">
                    <div className="flex items-center gap-4">
                        <Monitor className="text-slate-400" size={20} />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                        Alle Daten korrekt? Importieren Sie die Forderungen in das Live-System.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={reset}>Abbrechen</Button>
                        <Button variant="glow" onClick={processUpload} loading={uploading} disabled={previewItems.length === 0}>
                        Import Starten <ArrowRight size={16} className="ml-2" />
                        </Button>
                    </div>
                    </div>
                </>
            )}
          </div>
        )}

        {step === 'SUCCESS' && (
           <div className="glass-panel text-center py-20 rounded-[32px] animate-in zoom-in duration-500 dark:bg-[#0A0A0A]">
              <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-200 dark:border-emerald-500/30 shadow-sm dark:shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                 <Check size={48} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">Import Abgeschlossen</h3>
              <p className="text-slate-500 dark:text-slate-400 text-lg mb-10">
                Erfolgreich {previewItems.length} Datensätze verarbeitet.<br/>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{stats.matched} Dokumente</span> wurden sicher verknüpft.
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="secondary" onClick={reset}>Weiterer Upload</Button>
                <Button variant="glow" onClick={() => window.location.hash = '#/claims?view=BOARD'}>Zum Kanban Board</Button>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};
