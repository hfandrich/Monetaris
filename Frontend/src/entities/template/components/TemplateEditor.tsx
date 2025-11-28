/**
 * TemplateEditor Component
 * Feature-Sliced Design - Entity Layer
 */

import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, Heading1, Heading2, Undo, Redo } from 'lucide-react';
import type { CommunicationTemplate } from '../types/template.types';

interface TemplateEditorProps {
  template: CommunicationTemplate | null;
  onContentChange?: (content: string) => void;
  onSubjectChange?: (subject: string) => void;
  readOnly?: boolean;
}

const FormatButton = ({
  icon: Icon,
  command,
  arg,
  title
}: {
  icon: React.ElementType;
  command: string;
  arg?: string;
  title: string;
}) => (
  <button
    type="button"
    onMouseDown={(e) => {
      e.preventDefault();
      document.execCommand(command, false, arg);
    }}
    className="p-2 rounded hover:bg-slate-200 dark:hover:bg-white/20 transition-colors text-slate-600 dark:text-slate-300"
    title={title}
  >
    <Icon size={16} />
  </button>
);

export function TemplateEditor({ template, onContentChange, onSubjectChange, readOnly = false }: TemplateEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const subjectInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (template && editorRef.current) {
      editorRef.current.innerHTML = template.body || '';
    }
  }, [template]);

  useEffect(() => {
    if (template?.subject && subjectInputRef.current) {
      subjectInputRef.current.value = template.subject;
    }
  }, [template?.subject]);

  const handleContentBlur = () => {
    if (editorRef.current && onContentChange) {
      onContentChange(editorRef.current.innerHTML);
    }
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSubjectChange) {
      onSubjectChange(e.target.value);
    }
  };

  if (!template) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
        <p>Wählen Sie eine Vorlage zum Bearbeiten</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
      {/* Toolbar */}
      {!readOnly && (
        <div className="flex flex-wrap items-center px-2 py-2 bg-white dark:bg-[#0A0A0A] border-b border-slate-200 dark:border-white/5 gap-1">
          <div className="flex gap-1 pr-2 border-r border-slate-200 dark:border-white/10 mr-2">
            <FormatButton icon={Undo} command="undo" title="Rückgängig" />
            <FormatButton icon={Redo} command="redo" title="Wiederholen" />
          </div>

          <div className="flex gap-1 pr-2 border-r border-slate-200 dark:border-white/10 mr-2">
            <FormatButton icon={Bold} command="bold" title="Fett" />
            <FormatButton icon={Italic} command="italic" title="Kursiv" />
            <FormatButton icon={Underline} command="underline" title="Unterstrichen" />
          </div>

          <div className="flex gap-1 pr-2 border-r border-slate-200 dark:border-white/10 mr-2">
            <FormatButton icon={AlignLeft} command="justifyLeft" title="Links" />
            <FormatButton icon={AlignCenter} command="justifyCenter" title="Zentriert" />
            <FormatButton icon={AlignRight} command="justifyRight" title="Rechts" />
          </div>

          <div className="flex gap-1">
            <FormatButton icon={Heading1} command="formatBlock" arg="H2" title="Überschrift 1" />
            <FormatButton icon={Heading2} command="formatBlock" arg="H3" title="Überschrift 2" />
            <FormatButton icon={List} command="insertUnorderedList" title="Liste" />
          </div>
        </div>
      )}

      {/* Subject Line for Email Templates */}
      {template.type === 'EMAIL' && !readOnly && (
        <div className="px-6 py-3 bg-white dark:bg-[#0A0A0A] border-b border-slate-100 dark:border-white/5">
          <input
            ref={subjectInputRef}
            type="text"
            defaultValue={template.subject || ''}
            onChange={handleSubjectChange}
            placeholder="Betreffzeile..."
            className="w-full text-base font-bold text-slate-900 dark:text-white bg-transparent border-none focus:ring-0 placeholder:text-slate-300 p-0"
          />
        </div>
      )}

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div
          ref={editorRef}
          contentEditable={!readOnly}
          onBlur={handleContentBlur}
          className="outline-none prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:font-display prose-headings:font-bold focus:prose-p:text-slate-900 dark:prose-invert empty:before:content-['Hier_tippen...'] empty:before:text-slate-300"
        />
      </div>
    </div>
  );
}
