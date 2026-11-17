import React from 'react';
import { Download } from 'lucide-react';
import { CatalogItem, CsvDelimiter } from '../types/catalog';
import { generateSupabaseCsv } from '../lib/catalogEngine';

interface ExportSupabasePanelProps {
  items: CatalogItem[];
  delimiter: CsvDelimiter;
  onChangeDelimiter: (delimiter: CsvDelimiter) => void;
}

export const ExportSupabasePanel: React.FC<ExportSupabasePanelProps> = ({
  items,
  delimiter,
  onChangeDelimiter,
}) => {
  const handleDownloadCsv = () => {
    if (items.length === 0) return;
    const csvContent = generateSupabaseCsv(items, delimiter);
    const payload = delimiter === ';' ? `\uFEFF${csvContent}` : csvContent;
    const blob = new Blob([payload], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `xpart_supabase_clean_${dateStamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section
      aria-label="Esportazione CSV"
      className="flex flex-col gap-3 rounded-xl border border-slate-800/80 bg-[#101622] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-xs tabular-nums text-slate-300">
          {items.length} record pronti
        </span>

        <div
          role="group"
          aria-label="Delimitatore CSV"
          className="inline-flex items-center rounded-lg border border-slate-800 bg-[#0A0E17] p-1"
        >
          <button
            type="button"
            onClick={() => onChangeDelimiter(',')}
            className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
              delimiter === ','
                ? 'bg-slate-800 text-emerald-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CSV (,)
          </button>
          <button
            type="button"
            onClick={() => onChangeDelimiter(';')}
            className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
              delimiter === ';'
                ? 'bg-slate-800 text-sky-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CSV (;)
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDownloadCsv}
        disabled={items.length === 0}
        className="inline-flex w-full sm:w-auto min-h-[44px] items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
      >
        <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>Scarica CSV per Supabase</span>
      </button>
    </section>
  );
};
