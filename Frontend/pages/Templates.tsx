
import React, { useState, useEffect, useRef } from 'react';
import { PageHeader, Button, Badge, Modal } from '../components/UI';
import { templatesApi, casesApi, debtorsApi, kreditorenApi } from '../services/api/apiClient';
import type { ApiError } from '../services/api/apiClient';
import { CommunicationTemplate, TemplateVariable, CollectionCase, Debtor, Kreditor } from '../types';
import { Plus, Save, Eye, EyeOff, FileText, Mail, Braces, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, Heading1, Heading2, Undo, Redo, Check, AlertTriangle, User, Printer, Wand2, Trash2 } from 'lucide-react';

// --- Variables Configuration ---
const VARIABLES: { category: string; items: TemplateVariable[] }[] = [
  {
    category: 'Schuldner',
    items: [
      { key: 'debtor.firstName', label: 'Vorname', category: 'Debtor', example: 'Max' },
      { key: 'debtor.lastName', label: 'Nachname', category: 'Debtor', example: 'Mustermann' },
      { key: 'debtor.companyName', label: 'Firmenname', category: 'Debtor', example: 'Musterfirma GmbH' },
      { key: 'debtor.address.street', label: 'Straße', category: 'Debtor', example: 'Hauptstr. 1' },
      { key: 'debtor.address.city', label: 'Stadt', category: 'Debtor', example: 'Berlin' },
      { key: 'debtor.address.zipCode', label: 'PLZ', category: 'Debtor', example: '10115' },
    ]
  },
  {
    category: 'Forderung (Akte)',
    items: [
      { key: 'case.invoiceNumber', label: 'Rechnungs-Nr.', category: 'Case', example: 'RE-2024-123' },
      { key: 'case.invoiceDate', label: 'Rechnungsdatum', category: 'Case', example: '12.01.2024' },
      { key: 'case.totalAmount', label: 'Gesamtbetrag', category: 'Case', example: '1.250,00 €' },
      { key: 'case.principalAmount', label: 'Hauptforderung', category: 'Case', example: '1.000,00 €' },
      { key: 'case.costs', label: 'Kosten', category: 'Case', example: '50,00 €' },
      { key: 'case.interest', label: 'Zinsen', category: 'Case', example: '200,00 €' },
      { key: 'case.dueDate', label: 'Fälligkeit', category: 'Case', example: '25.01.2024' },
      { key: 'case.id', label: 'Aktenzeichen', category: 'Case', example: 'C-99281' },
    ]
  },
  {
    category: 'Mandant (Gläubiger)',
    items: [
      { key: 'kreditor.name', label: 'Name', category: 'Kreditor', example: 'TechCorp AG' },
      { key: 'kreditor.bankAccountIBAN', label: 'IBAN', category: 'Kreditor', example: 'DE99 ...' },
      { key: 'kreditor.contactEmail', label: 'E-Mail', category: 'Kreditor', example: 'billing@techcorp.de' },
    ]
  },
  {
      category: 'System',
      items: [
          { key: 'currentDate', label: 'Aktuelles Datum', category: 'System', example: '24.10.2024' }
      ]
  }
];

// --- Helper: Dummy Data Generator ---
const generateDummyContext = () => ({
    debtor: {
        id: 'd-sample',
        firstName: 'Max',
        lastName: 'Mustermann',
        companyName: 'Musterfirma GmbH',
        email: 'max@muster.de',
        phone: '0123 456789',
        address: { street: 'Musterstraße 1', zipCode: '12345', city: 'Musterstadt', country: 'DE', status: 'CONFIRMED' },
        riskScore: 'B',
        totalDebt: 1500,
        openCases: 1,
        kreditorId: 't-sample'
    } as Debtor,
    case: {
        id: 'c-sample',
        invoiceNumber: 'RE-2024-999',
        invoiceDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 86400000 * 14).toISOString(),
        totalAmount: 1250.50,
        principalAmount: 1000.00,
        costs: 45.00,
        interest: 205.50,
        status: 'REMINDER_1',
        debtorId: 'd-sample',
        kreditorId: 't-sample',
        debtorName: 'Musterfirma GmbH',
        currency: 'EUR',
        history: []
    } as CollectionCase,
    kreditor: {
        id: 't-sample',
        name: 'Beispiel Mandant AG',
        registrationNumber: 'HRB 12345',
        contactEmail: 'buchhaltung@beispiel.de',
        bankAccountIBAN: 'DE99 1234 5678 9000 00'
    } as Kreditor
});

// --- Helper Component: Formatting Button ---
const FormatBtn = ({ icon: Icon, command, arg, title, active = false }: any) => (
    <button
        onMouseDown={(e) => {
            e.preventDefault(); // Prevent losing focus from editor
            document.execCommand(command, false, arg);
        }}
        className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-white/20 transition-colors ${active ? 'bg-slate-200 dark:bg-white/20 text-monetaris-600 dark:text-monetaris-400' : 'text-slate-600 dark:text-slate-300'}`}
        title={title}
    >
        <Icon size={16} />
    </button>
);

export const Templates: React.FC = () => {
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CommunicationTemplate | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVING' | 'SAVED'>('IDLE');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Context Selection
  const [showContextModal, setShowContextModal] = useState(false);
  const [availableCases, setAvailableCases] = useState<CollectionCase[]>([]);
  const [mockData, setMockData] = useState<{ debtor: Debtor, case: CollectionCase, kreditor: Kreditor } | null>(null);

  // Delete Confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<CommunicationTemplate | null>(null);

  // Validation
  const [missingVariables, setMissingVariables] = useState<string[]>([]);

  // Editor State
  const [subjectLine, setSubjectLine] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelection = useRef<Range | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch templates - API returns paginated result
        const templatesResult = await templatesApi.getAll();
        const tpls = templatesResult?.data || [];
        setTemplates(tpls);

        // Fetch cases - API returns paginated result
        const casesResult = await casesApi.getAll();
        const cases = casesResult?.data || [];
        setAvailableCases(cases);

        if (cases.length > 0) {
          // Load initial context from first available case
          await loadContext(cases[0]);
        } else {
          // Fallback to dummy data if no cases exist
          setMockData(generateDummyContext());
        }

        if (tpls.length > 0) {
          handleSelectTemplate(tpls[0]);
        }
      } catch (err) {
        const apiError = err as ApiError;
        console.error('Templates loading error:', err);
        setError(apiError.message || 'Failed to load templates');
        setToast({ msg: apiError.message || 'Failed to load templates', type: 'error' });
        setTimeout(() => setToast(null), 3000);

        // Fallback to empty arrays on error
        setTemplates([]);
        setAvailableCases([]);
        setMockData(generateDummyContext());
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const loadContext = async (c: CollectionCase) => {
     try {
       const debtor = await debtorsApi.getById(c.debtorId);
       const kreditor = await kreditorenApi.getById(c.kreditorId);
       if (debtor && kreditor) {
         setMockData({
           debtor,
           case: c,
           kreditor
         });
       }
     } catch (err) {
       const apiError = err as ApiError;
       console.error('Failed to load context:', apiError);
       setToast({ msg: 'Failed to load context data', type: 'error' });
       setTimeout(() => setToast(null), 3000);
     }
  };

  const handleSelectTemplate = (tpl: CommunicationTemplate) => {
      setSelectedTemplate(tpl);
      if (editorRef.current) {
          editorRef.current.innerHTML = tpl.content;
      }
      setSubjectLine(tpl.subject || '');
      setPreviewMode(false);
      setSaveStatus('IDLE');
      setMissingVariables([]);
  };

  const handleCreateNew = async (type: 'EMAIL' | 'LETTER') => {
      try {
        const newTpl = await templatesApi.create({
          name: `Neue Vorlage (${type === 'EMAIL' ? 'E-Mail' : 'Brief'})`,
          type,
          content: '',
          category: 'GENERAL',
          subject: type === 'EMAIL' ? '' : undefined
        });
        setTemplates([...templates, newTpl]);
        handleSelectTemplate(newTpl);
        setToast({ msg: 'Neue Vorlage erstellt', type: 'success' });
        setTimeout(() => setToast(null), 3000);
      } catch (err) {
        const apiError = err as ApiError;
        setToast({ msg: apiError.message || 'Failed to create template', type: 'error' });
        setTimeout(() => setToast(null), 3000);
      }
  };

  const handleSave = async () => {
      if (!selectedTemplate || !editorRef.current) return;
      setSaveStatus('SAVING');

      try {
        const content = editorRef.current.innerHTML;

        const updated = await templatesApi.update(selectedTemplate.id, {
          content: content,
          subject: selectedTemplate.type === 'EMAIL' ? subjectLine : undefined
        });

        const idx = templates.findIndex(t => t.id === updated.id);
        const newTemplates = [...templates];
        newTemplates[idx] = updated;
        setTemplates(newTemplates);
        setSelectedTemplate(updated);

        setTimeout(() => {
          setSaveStatus('SAVED');
          setToast({ msg: 'Vorlage erfolgreich gespeichert', type: 'success' });
          setTimeout(() => {
            setSaveStatus('IDLE');
            setToast(null);
          }, 2000);
        }, 600);
      } catch (err) {
        const apiError = err as ApiError;
        setSaveStatus('IDLE');
        setToast({ msg: apiError.message || 'Failed to save template', type: 'error' });
        setTimeout(() => setToast(null), 3000);
      }
  };

  const saveSelection = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
          savedSelection.current = sel.getRangeAt(0);
      }
  };

  const insertVariable = (key: string) => {
      const variableTag = `{{${key}}}`;
      if (!editorRef.current) return;
      editorRef.current.focus();
      
      if (savedSelection.current) {
          const sel = window.getSelection();
          if (sel) {
              sel.removeAllRanges();
              sel.addRange(savedSelection.current);
              document.execCommand('insertText', false, variableTag);
          }
      } else {
          document.execCommand('insertText', false, variableTag);
      }
  };

  // --- CORE ENGINE: Variable Replacement ---
  const renderPreview = (htmlContent: string, validate = false) => {
      // Use mockData or Fallback to Dummy
      const context = mockData || generateDummyContext();
      
      let rendered = htmlContent;
      const missing = new Set<string>();

      const getValue = (obj: any, path: string) => {
          try {
            return path.split('.').reduce((o, i) => (o !== undefined && o !== null ? o[i] : undefined), obj);
          } catch (e) {
            return undefined;
          }
      };

      // Formatters
      const formatCurrency = (val: number) => val.toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €';
      const formatDate = (dateStr: string) => {
          try { return new Date(dateStr).toLocaleDateString('de-DE'); } catch { return dateStr; }
      };

      // Regex to handle optional spaces: {{ variable }} or {{variable}}
      rendered = rendered.replace(/{{\s*([^}]+)\s*}}/g, (match, key) => {
          const cleanKey = key.trim();
          
          // System Placeholders
          if (cleanKey === 'currentDate') return new Date().toLocaleDateString('de-DE');

          // Data Lookup
          const rawValue = getValue(context, cleanKey);

          // Formatting Logic
          if (rawValue !== undefined && rawValue !== null && rawValue !== '') {
              if (cleanKey.includes('Amount') || cleanKey.includes('costs') || cleanKey.includes('interest') || cleanKey.includes('Debt')) {
                  return formatCurrency(Number(rawValue));
              }
              if (cleanKey.includes('Date') || cleanKey.includes('due') || cleanKey.includes('Check')) {
                  return formatDate(String(rawValue));
              }
              return String(rawValue);
          }
          
          // Handle Missing Data
          if (validate) {
              missing.add(cleanKey);
              return `<span style="background-color: #fee2e2; color: #991b1b; padding: 0 4px; border-radius: 2px; border: 1px solid #fecaca; font-weight: bold;">?? ${cleanKey}</span>`; 
          } else {
              // For Print: return empty string to avoid {{variable}} in final PDF
              return ''; 
          }
      });

      if (validate) {
          setMissingVariables(Array.from(missing));
      }

      return rendered;
  };

  const togglePreview = () => {
      if (!editorRef.current) return;
      
      if (!previewMode) {
          const rawHtml = editorRef.current.innerHTML;
          const previewHtml = renderPreview(rawHtml, true); // Validate = true for red highlights
          editorRef.current.innerHTML = previewHtml;
          editorRef.current.contentEditable = "false";
          setPreviewMode(true);
      } else {
          if (selectedTemplate) editorRef.current.innerHTML = selectedTemplate.content; 
          editorRef.current.contentEditable = "true";
          setPreviewMode(false);
          setMissingVariables([]);
      }
  };

  const handleOpenPrintWindow = () => {
    if (!selectedTemplate) return;
    
    const rawHtml = selectedTemplate.content;
    const printHtml = renderPreview(rawHtml, false); // Validate false -> no red marks
    const context = mockData || generateDummyContext();

    // Create a separate window
    const win = window.open('', '_blank', 'width=900,height=1200');
    if (!win) {
        setToast({ msg: 'Popup blockiert. Bitte erlauben.', type: 'error' });
        return;
    }

    const doc = win.document;
    
    // Standard "Briefpapier" (Letterhead) Structure
    const content = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${selectedTemplate.name} - Druckansicht</title>
            <meta charset="utf-8" />
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap');
                
                :root {
                    --primary: #10B981;
                    --text: #0F172A;
                    --text-light: #64748B;
                }

                body {
                    font-family: 'Manrope', sans-serif;
                    background-color: #f3f4f6; /* Gray background on screen */
                    margin: 0;
                    padding: 40px 0;
                    display: flex;
                    justify-content: center;
                }

                /* A4 Page Container */
                .page {
                    width: 210mm;
                    height: 297mm;
                    padding: 0; /* Header/Footer handles margins */
                    background: white;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    position: relative;
                    overflow: hidden; /* Ensures fixed headers don't bleed */
                    box-sizing: border-box;
                }

                /* Print Styles */
                @media print {
                    body {
                        background: none;
                        padding: 0;
                        margin: 0;
                    }
                    .page {
                        width: 100%;
                        height: 100%;
                        margin: 0;
                        box-shadow: none;
                        overflow: visible;
                    }
                    .no-print {
                        display: none !important;
                    }
                    
                    /* Fixed Positioning for Repeating Headers/Footers */
                    .header-fixed {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 40mm;
                        background: white;
                        z-index: 100;
                    }
                    .footer-fixed {
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        height: 30mm;
                        background: white;
                        z-index: 100;
                    }
                    
                    /* Page Break Safety */
                    .content-wrapper {
                        margin-top: 40mm;
                        margin-bottom: 30mm;
                        padding: 0 20mm;
                    }
                    
                    table { page-break-inside: auto; }
                    tr { page-break-inside: avoid; page-break-after: auto; }
                }
                
                /* Screen Simulation of Fixed Positions */
                @media screen {
                    .header-fixed {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 40mm;
                        border-bottom: 1px solid #f1f5f9;
                    }
                    .footer-fixed {
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        height: 30mm;
                        border-top: 1px solid #f1f5f9;
                    }
                    .content-wrapper {
                        margin-top: 45mm; /* Slight offset for screen viewing */
                        margin-bottom: 30mm;
                        padding: 0 20mm;
                        height: calc(297mm - 75mm);
                        overflow-y: auto; /* Scroll content on screen if too long */
                    }
                }

                /* Styling Inner Elements */
                .header-content {
                    padding: 15mm 20mm 0 20mm;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }
                .brand { font-size: 20px; font-weight: 800; color: var(--text); text-transform: uppercase; letter-spacing: -0.5px; }
                .brand span { color: var(--primary); }
                
                .meta-block {
                    font-size: 9pt;
                    color: var(--text);
                    text-align: right;
                    line-height: 1.4;
                }
                
                .footer-content {
                    padding: 10mm 20mm;
                    display: flex;
                    justify-content: space-between;
                    font-size: 8pt;
                    color: var(--text-light);
                    line-height: 1.5;
                }
                .footer-content strong { color: var(--text); }
                
                .address-zone {
                    font-size: 10pt;
                    color: var(--text);
                    margin-bottom: 15mm;
                }
                .sender-tiny {
                    font-size: 7pt;
                    text-decoration: underline;
                    color: var(--text-light);
                    margin-bottom: 5mm;
                }
                
                .main-text {
                    font-size: 10.5pt;
                    line-height: 1.5;
                    color: #334155;
                }
                .main-text table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 10pt; }
                .main-text th { text-align: left; border-bottom: 1px solid #cbd5e1; padding: 8px 4px; color: var(--text-light); font-size: 9pt; text-transform: uppercase; }
                .main-text td { border-bottom: 1px solid #f1f5f9; padding: 10px 4px; color: var(--text); }

                .action-bar {
                    position: fixed; top: 20px; right: 20px; background: white; padding: 10px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; gap: 10px; z-index: 1000;
                }
                .btn {
                    background: var(--primary); color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px;
                }
                .btn:hover { opacity: 0.9; }
            </style>
        </head>
        <body>
            <div class="action-bar no-print">
                <button class="btn" onclick="window.print()">🖨️ Drucken</button>
                <button class="btn" style="background: #ef4444;" onclick="window.close()">Schließen</button>
            </div>

            <div class="page">
                <div class="header-fixed">
                    <div class="header-content">
                        <div>
                            <div class="brand">Monetaris <span>Inc.</span></div>
                            <div style="font-size: 10px; font-weight: 600; color: #64748B; margin-top: 2px;">AI-Driven Debt Collection</div>
                        </div>
                        <div class="meta-block">
                            <strong>${context.kreditor.name}</strong><br>
                            Abteilung Recht & Inkasso<br>
                            Datum: ${new Date().toLocaleDateString('de-DE')}
                        </div>
                    </div>
                </div>

                <div class="content-wrapper">
                    ${selectedTemplate.type === 'LETTER' ? `
                    <div class="address-zone">
                        <div class="sender-tiny">${context.kreditor.name} • Postfach 101 • 10115 Berlin</div>
                        ${context.debtor.companyName ? `<strong>${context.debtor.companyName}</strong><br>` : ''}
                        ${context.debtor.firstName} ${context.debtor.lastName}<br>
                        ${context.debtor.address.street}<br>
                        <br>
                        <strong>${context.debtor.address.zipCode} ${context.debtor.address.city}</strong>
                    </div>
                    ` : ''}

                    <div class="main-text">
                        ${printHtml}
                    </div>
                </div>

                <div class="footer-fixed">
                    <div class="footer-content">
                        <div>
                            <strong>${context.kreditor.name}</strong><br>
                            ${context.kreditor.registrationNumber}<br>
                            Geschäftsführung: Dr. A. Monetaris
                        </div>
                        <div>
                            <strong>Kontakt</strong><br>
                            ${context.kreditor.contactEmail}<br>
                            www.monetaris.com
                        </div>
                        <div style="text-align: right;">
                            <strong>Bankverbindung</strong><br>
                            IBAN: ${context.kreditor.bankAccountIBAN}<br>
                            Bank: TechFin Bank AG
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    doc.open();
    doc.write(content);
    doc.close();
  };

  const handleContextSelect = async (c: CollectionCase) => {
      await loadContext(c);
      setShowContextModal(false);
      setToast({ msg: `Daten geladen: Akte ${c.invoiceNumber}`, type: 'success' });
      setTimeout(() => setToast(null), 2000);

      // Reset preview if active to reflect new data
      if (previewMode && selectedTemplate) {
          if (editorRef.current) editorRef.current.contentEditable = "true";
          setPreviewMode(false);
          if (editorRef.current) editorRef.current.innerHTML = selectedTemplate.content;
      }
  };

  const handleDeleteClick = (tpl: CommunicationTemplate) => {
      setTemplateToDelete(tpl);
      setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
      if (!templateToDelete) return;

      try {
        await templatesApi.delete(templateToDelete.id);

        // Remove from local state
        const updatedTemplates = templates.filter(t => t.id !== templateToDelete.id);
        setTemplates(updatedTemplates);

        // If deleted template was selected, clear selection
        if (selectedTemplate?.id === templateToDelete.id) {
          setSelectedTemplate(updatedTemplates.length > 0 ? updatedTemplates[0] : null);
          if (editorRef.current) {
            editorRef.current.innerHTML = updatedTemplates.length > 0 ? updatedTemplates[0].content : '';
          }
        }

        setToast({ msg: 'Vorlage erfolgreich gelöscht', type: 'success' });
        setTimeout(() => setToast(null), 3000);
      } catch (err) {
        const apiError = err as ApiError;
        setToast({ msg: apiError.message || 'Fehler beim Löschen', type: 'error' });
        setTimeout(() => setToast(null), 3000);
      } finally {
        setShowDeleteModal(false);
        setTemplateToDelete(null);
      }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-140px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-monetaris-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Lade Vorlagen...</p>
        </div>
      </div>
    );
  }

  if (error && templates.length === 0) {
    return (
      <div className="h-[calc(100vh-140px)] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Fehler beim Laden</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">Bitte stellen Sie sicher, dass das Backend unter der konfigurierten URL erreichbar ist.</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Neu laden
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10 h-[calc(100vh-140px)] flex flex-col">

       {toast && (
           <div className={`fixed bottom-10 right-10 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
               {toast.type === 'success' ? <Check size={20} /> : <AlertTriangle size={20} />}
               <span className="font-bold">{toast.msg}</span>
           </div>
       )}

       <div className="no-print">
            <PageHeader 
                title="Dokumenten-Center" 
                subtitle="Designen Sie professionelle Schreiben mit dem WYSIWYG-Editor." 
                action={
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => handleCreateNew('EMAIL')}><Plus size={16} className="mr-2"/> E-Mail</Button>
                        <Button variant="secondary" onClick={() => handleCreateNew('LETTER')}><Plus size={16} className="mr-2"/> Brief</Button>
                    </div>
                }
            />
       </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 no-print">
          
          {/* Sidebar: Template List */}
          <div className="lg:col-span-3 flex flex-col gap-4 h-full min-h-0">
              <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/10 flex-1 flex flex-col overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#101010]">
                      <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wide">Vorlagen</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                      {templates.map(tpl => (
                          <div
                            key={tpl.id}
                            className={`w-full text-left p-3 rounded-xl transition-all duration-200 group border ${
                                selectedTemplate?.id === tpl.id
                                ? 'bg-monetaris-50 dark:bg-monetaris-500/10 border-monetaris-200 dark:border-monetaris-500/30'
                                : 'hover:bg-slate-50 dark:hover:bg-[#151515] border-transparent'
                            }`}
                          >
                              <div className="flex items-start justify-between gap-2">
                                  <button
                                    onClick={() => handleSelectTemplate(tpl)}
                                    className="flex-1 min-w-0"
                                  >
                                      <div className="flex items-center justify-between mb-1">
                                          <span className={`text-sm font-bold ${selectedTemplate?.id === tpl.id ? 'text-monetaris-700 dark:text-monetaris-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                              {tpl.name}
                                          </span>
                                          {tpl.type === 'EMAIL' ? <Mail size={14} className="text-slate-400"/> : <FileText size={14} className="text-slate-400"/>}
                                      </div>
                                      <div className="flex items-center gap-2">
                                          <Badge color={tpl.category === 'LEGAL' ? 'red' : tpl.category === 'REMINDER' ? 'yellow' : 'gray'}>{tpl.category}</Badge>
                                      </div>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick(tpl);
                                    }}
                                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-all"
                                    title="Vorlage löschen"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          {/* Main Editor Area */}
          <div className="lg:col-span-6 flex flex-col h-full min-h-0 relative">
              {selectedTemplate ? (
                  <div className="flex flex-col h-full bg-slate-100 dark:bg-[#101010] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-xl">
                      
                      {/* WYSIWYG Toolbar */}
                      <div className="h-auto min-h-[3.5rem] flex flex-wrap items-center px-2 py-2 bg-white dark:bg-[#0A0A0A] border-b border-slate-200 dark:border-white/5 shrink-0 gap-1 z-20">
                           <div className="flex gap-1 pr-2 border-r border-slate-200 dark:border-white/10 mr-2">
                              <button 
                                onClick={togglePreview}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-colors ${previewMode ? 'bg-monetaris-100 text-monetaris-700 dark:bg-monetaris-500/20 dark:text-monetaris-400' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-[#202020]'}`}
                              >
                                  {previewMode ? <EyeOff size={14}/> : <Eye size={14}/>}
                                  {previewMode ? 'Editieren' : 'Vorschau'}
                              </button>
                           </div>

                           {!previewMode && (
                               <>
                                   <div className="flex gap-1 pr-2 border-r border-slate-200 dark:border-white/10 mr-2">
                                      <FormatBtn icon={Undo} command="undo" title="Rückgängig" />
                                      <FormatBtn icon={Redo} command="redo" title="Wiederholen" />
                                   </div>
                                   
                                   <div className="flex gap-1 pr-2 border-r border-slate-200 dark:border-white/10 mr-2">
                                      <FormatBtn icon={Bold} command="bold" title="Fett" />
                                      <FormatBtn icon={Italic} command="italic" title="Kursiv" />
                                      <FormatBtn icon={Underline} command="underline" title="Unterstrichen" />
                                   </div>

                                   <div className="flex gap-1 pr-2 border-r border-slate-200 dark:border-white/10 mr-2">
                                      <FormatBtn icon={AlignLeft} command="justifyLeft" title="Links" />
                                      <FormatBtn icon={AlignCenter} command="justifyCenter" title="Zentriert" />
                                      <FormatBtn icon={AlignRight} command="justifyRight" title="Rechts" />
                                   </div>

                                   <div className="flex gap-1 pr-2 border-r border-slate-200 dark:border-white/10 mr-2">
                                      <FormatBtn icon={Heading1} command="formatBlock" arg="H2" title="Überschrift 1" />
                                      <FormatBtn icon={Heading2} command="formatBlock" arg="H3" title="Überschrift 2" />
                                      <FormatBtn icon={List} command="insertUnorderedList" title="Liste" />
                                   </div>
                               </>
                           )}

                           <div className="ml-auto flex items-center gap-2">
                               <Button size="sm" variant="secondary" onClick={() => setShowContextModal(true)}>
                                    <User size={14} className="mr-2" /> Kontext
                               </Button>
                               <Button size="sm" variant="secondary" onClick={handleOpenPrintWindow}>
                                   <Printer size={14} className="mr-2"/> PDF Export
                               </Button>
                               <Button size="sm" variant="primary" onClick={handleSave} loading={saveStatus === 'SAVING'}>
                                    <Save size={14} className="mr-2" /> Speichern
                               </Button>
                           </div>
                      </div>

                      {/* Missing Variables Warning */}
                      {previewMode && missingVariables.length > 0 && (
                          <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30 px-4 py-2 flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-bold">
                              <AlertTriangle size={14} />
                              {missingVariables.length} Platzhalter nicht verfügbar. Bitte prüfen Sie den Akten-Kontext.
                          </div>
                      )}
                      
                      {/* Context Indicator */}
                      {previewMode && !mockData?.debtor.id.includes('sample') && (
                          <div className="bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-900/30 px-4 py-2 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                              <Check size={14} />
                              Vorschau aktiv für: {mockData?.debtor.companyName || mockData?.debtor.lastName} (Akte {mockData?.case.invoiceNumber})
                          </div>
                      )}

                      {/* Subject Line */}
                      {selectedTemplate.type === 'EMAIL' && !previewMode && (
                          <div className="px-6 py-3 bg-white dark:bg-[#0A0A0A] border-b border-slate-100 dark:border-white/5">
                              <input 
                                type="text" 
                                value={subjectLine}
                                onChange={(e) => setSubjectLine(e.target.value)}
                                placeholder="Betreffzeile..."
                                className="w-full text-base font-bold text-slate-900 dark:text-white bg-transparent border-none focus:ring-0 placeholder:text-slate-300 p-0"
                              />
                          </div>
                      )}

                      {/* Canvas Background */}
                      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 flex justify-center bg-slate-200/50 dark:bg-[#050505]">
                          
                          {/* Editor Canvas */}
                          <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-2xl dark:shadow-black/50 p-[20mm] md:p-[25mm] flex flex-col relative selection:bg-monetaris-200 selection:text-monetaris-900">
                              
                              {/* Letterhead Visualization (Not printed here, just for UI) */}
                              <div className="h-auto border-b-2 border-slate-900 mb-8 flex justify-between items-end pb-4 select-none opacity-50 hover:opacity-100 transition-opacity cursor-default">
                                   <div className="flex-1">
                                       <div className="flex items-center gap-2 text-slate-900 mb-2">
                                           <svg viewBox="0 0 200 80" className="h-8 w-auto text-monetaris-600">
                                               <path d="M20 60 L50 20 L80 50 L110 15 L140 40" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                                           </svg>
                                           <span className="font-bold font-display text-xl tracking-tight">Monetaris</span>
                                       </div>
                                       <div className="text-xs text-slate-500">
                                           <span className="font-bold">{mockData?.kreditor.name || 'Musterfirma GmbH'}</span> • Inkasso-Service
                                       </div>
                                   </div>
                                   <div className="text-right">
                                       <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">Datum</p>
                                       <p className="text-sm font-bold">{new Date().toLocaleDateString('de-DE')}</p>
                                   </div>
                              </div>

                              {/* Address Field Visualization */}
                              {selectedTemplate.type === 'LETTER' && (
                                  <div className="mb-12 text-sm relative select-none">
                                      <div className="w-[85mm] h-[40mm] mb-4 p-2 rounded hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                                        <p className="text-[8px] text-slate-400 underline mb-2">{mockData?.kreditor.name || 'Firma'} • Postfach 123 • 10115 Berlin</p>
                                        <div className="leading-relaxed">
                                            {previewMode 
                                                ? (mockData?.debtor.companyName ? <strong>{mockData.debtor.companyName}</strong> : '') 
                                                : '{{debtor.companyName}}'
                                            }
                                            <br/>
                                            {previewMode 
                                                ? (<span>{mockData?.debtor.firstName} {mockData?.debtor.lastName}</span>)
                                                : '{{debtor.firstName}} {{debtor.lastName}}'
                                            }
                                            <br/>
                                            {previewMode ? mockData?.debtor.address.street : '{{debtor.address.street}}'}<br/>
                                            <br/>
                                            <span className="font-bold">{previewMode ? `${mockData?.debtor.address.zipCode} ${mockData?.debtor.address.city}` : '{{debtor.address.zipCode}} {{debtor.address.city}}'}</span>
                                        </div>
                                      </div>
                                  </div>
                              )}

                              {/* Editable Content Area */}
                              <div 
                                ref={editorRef}
                                contentEditable={!previewMode}
                                onBlur={saveSelection}
                                onMouseUp={saveSelection}
                                onKeyUp={saveSelection}
                                className="flex-1 outline-none prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:font-display prose-headings:font-bold focus:prose-p:text-slate-900 empty:before:content-['Hier_tippen...'] empty:before:text-slate-300"
                              ></div>
                          </div>
                      </div>
                  </div>
              ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                      <FileText size={48} className="mb-4 opacity-50"/>
                      <p>Wählen Sie eine Vorlage aus oder erstellen Sie eine neue.</p>
                  </div>
              )}
          </div>

          {/* Sidebar: Variables */}
          <div className="lg:col-span-3 h-full min-h-0 flex flex-col">
             <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/10 h-full flex flex-col overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#101010] flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wide flex items-center gap-2">
                        <Braces size={14} className="text-monetaris-500"/> Variablen
                    </h3>
                    {mockData && (
                         <div className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] rounded font-bold flex items-center gap-1">
                             {mockData.case.id === 'c-sample' ? <Wand2 size={10}/> : <Check size={10}/>}
                             {mockData.case.invoiceNumber}
                         </div>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                    {!selectedTemplate ? (
                        <p className="text-xs text-slate-400 italic">Öffnen Sie eine Vorlage, um Variablen einzufügen.</p>
                    ) : previewMode ? (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-500/20 text-center">
                            <Eye size={24} className="mx-auto text-blue-500 mb-2"/>
                            <p className="text-xs text-blue-700 dark:text-blue-300 font-bold">Vorschau-Modus aktiv</p>
                            <p className="text-[10px] text-slate-500 mt-2 leading-snug">Variablen werden durch echte Daten oder Platzhalter ersetzt.</p>
                            <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={togglePreview}>Bearbeiten</Button>
                        </div>
                    ) : (
                        VARIABLES.map((group, i) => (
                            <div key={i}>
                                <h4 className="text-xs font-extrabold text-slate-400 uppercase mb-3">{group.category}</h4>
                                <div className="space-y-2">
                                    {group.items.map(variable => (
                                        <button
                                            key={variable.key}
                                            onClick={() => insertVariable(variable.key)}
                                            className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-white/5 hover:border-monetaris-300 dark:hover:border-monetaris-500/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group text-left"
                                        >
                                            <div>
                                                <span className="block text-xs font-bold text-slate-700 dark:text-slate-200 font-mono group-hover:text-monetaris-600 dark:group-hover:text-monetaris-400 transition-colors">
                                                    {`{{${variable.key}}}`}
                                                </span>
                                                <span className="text-[10px] text-slate-400">{variable.label}</span>
                                            </div>
                                            <Plus size={14} className="text-slate-300 group-hover:text-monetaris-500 opacity-0 group-hover:opacity-100 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
             </div>
          </div>
      </div>
      
      <Modal isOpen={showContextModal} onClose={() => setShowContextModal(false)} title="Daten-Kontext wählen">
           <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
               <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl text-sm text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-500/20">
                   Wählen Sie eine Akte, um die Vorlage mit echten Daten zu testen. Wenn keine Wahl getroffen wird, werden Beispieldaten verwendet.
               </div>
               <div className="space-y-2">
                   {availableCases.length === 0 ? (
                       <p className="text-center text-slate-500 py-8">Keine Akten verfügbar. System nutzt Dummy-Daten.</p>
                   ) : availableCases.map(c => (
                       <div
                         key={c.id}
                         onClick={() => handleContextSelect(c)}
                         className={`p-4 rounded-xl border cursor-pointer transition-colors flex justify-between items-center ${mockData?.case.id === c.id ? 'bg-monetaris-50 border-monetaris-500 dark:bg-monetaris-500/20' : 'bg-white border-slate-200 hover:bg-slate-50 dark:bg-[#151515] dark:border-white/10 dark:hover:bg-[#202020]'}`}
                       >
                           <div>
                               <p className="font-bold text-slate-900 dark:text-white text-sm">{c.debtorName}</p>
                               <p className="text-xs text-slate-500">Rechnung: {c.invoiceNumber} • {c.totalAmount.toLocaleString()} €</p>
                           </div>
                           {mockData?.case.id === c.id && <Check size={16} className="text-monetaris-500" />}
                       </div>
                   ))}
               </div>
           </div>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Vorlage löschen">
           <div className="space-y-4">
               <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-500/20">
                   <div className="flex items-start gap-3">
                       <AlertTriangle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
                       <div>
                           <p className="font-bold text-red-900 dark:text-red-100 mb-1">Achtung: Diese Aktion kann nicht rückgängig gemacht werden!</p>
                           <p className="text-sm text-red-700 dark:text-red-300">
                               Die Vorlage <strong>"{templateToDelete?.name}"</strong> wird permanent gelöscht.
                           </p>
                       </div>
                   </div>
               </div>
               <div className="flex gap-3 justify-end">
                   <Button
                       variant="secondary"
                       onClick={() => {
                           setShowDeleteModal(false);
                           setTemplateToDelete(null);
                       }}
                   >
                       Abbrechen
                   </Button>
                   <Button
                       variant="primary"
                       onClick={handleDeleteConfirm}
                       className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                   >
                       <Trash2 size={14} className="mr-2" />
                       Endgültig löschen
                   </Button>
               </div>
           </div>
      </Modal>
    </div>
  );
};
