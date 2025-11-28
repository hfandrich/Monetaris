import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronsUpDown, Check, X } from 'lucide-react';

export interface SearchableSelectProps {
  label?: string;
  placeholder: string;
  options: { id: string; title: string; subtitle?: string }[];
  value: string;
  onChange: (val: string) => void;
  error?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
  clearable?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  placeholder,
  options,
  value,
  onChange,
  error,
  icon: Icon,
  action,
  clearable = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(
    (opt) =>
      opt.title.toLowerCase().includes(search.toLowerCase()) ||
      (opt.subtitle && opt.subtitle.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedOption = options.find((o) => o.id === value);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  return (
    <div className="w-full group relative" ref={wrapperRef}>
      {(label || action) && (
        <div className="flex justify-between items-center mb-2 ml-1">
          {label && (
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 group-focus-within:text-monetaris-600 dark:group-focus-within:text-monetaris-accent transition-colors">
              {label}
            </label>
          )}
          {action}
        </div>
      )}

      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 border rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-between cursor-pointer transition-all
                ${error ? 'border-red-500/50' : isOpen ? 'border-monetaris-500 ring-4 ring-monetaris-500/10 bg-white dark:bg-[#101010]' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'}
                `}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {Icon && (
            <Icon
              size={16}
              className={`shrink-0 ${selectedOption ? 'text-monetaris-600 dark:text-monetaris-400' : 'text-slate-400'}`}
            />
          )}
          {selectedOption ? (
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {selectedOption.title}
              </span>
              {selectedOption.subtitle && (
                <span className="text-[10px] text-slate-500 truncate">
                  {selectedOption.subtitle}
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm text-slate-400 font-medium truncate">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {clearable && selectedOption && (
            <button
              onClick={handleClear}
              className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              title="Filter entfernen"
            >
              <X size={14} />
            </button>
          )}
          <ChevronsUpDown size={14} className="text-slate-400" />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 border-b border-slate-100 dark:border-white/5 sticky top-0 bg-white dark:bg-[#151515]">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                autoFocus
                type="text"
                placeholder="Suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#0A0A0A] rounded-lg text-xs font-medium text-slate-900 dark:text-white border-none focus:ring-2 focus:ring-monetaris-500/50 placeholder:text-slate-400 outline-none"
              />
            </div>
          </div>
          <div className="max-h-[200px] overflow-y-auto custom-scrollbar p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-500">Keine Ergebnisse.</div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between group transition-colors ${value === opt.id ? 'bg-monetaris-50 dark:bg-monetaris-500/20' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                >
                  <div>
                    <p
                      className={`text-sm font-bold ${value === opt.id ? 'text-monetaris-700 dark:text-monetaris-400' : 'text-slate-700 dark:text-slate-300'}`}
                    >
                      {opt.title}
                    </p>
                    {opt.subtitle && <p className="text-[10px] text-slate-400">{opt.subtitle}</p>}
                  </div>
                  {value === opt.id && (
                    <Check size={14} className="text-monetaris-600 dark:text-monetaris-400" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-red-500 font-medium ml-1 flex items-center">
          <span className="w-1 h-1 rounded-full bg-red-500 mr-1.5"></span>
          {error}
        </p>
      )}
    </div>
  );
};
