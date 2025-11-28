import React from 'react';
import { FileText, Image as ImageIcon, File } from 'lucide-react';

// --- File Icon ---
export const FileIcon: React.FC<{ type: string; className?: string }> = ({
  type,
  className = 'w-6 h-6',
}) => {
  if (type === 'PDF') return <FileText className={`text-red-500 ${className}`} />;
  if (type === 'IMAGE') return <ImageIcon className={`text-blue-500 ${className}`} />;
  if (type === 'EXCEL') return <File className={`text-emerald-500 ${className}`} />;
  return <File className={`text-slate-400 ${className}`} />;
};
