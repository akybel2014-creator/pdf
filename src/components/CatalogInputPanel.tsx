import React, { useRef, useState } from 'react';
import { AlertTriangle, FileText, FileUp, Play, RotateCcw, X } from 'lucide-react';
import { PdfExtractionProgress } from '../lib/pdfExtractor';

interface CatalogInputPanelProps {
  rawText: string;
  onChangeRawText: (value: string) => void;
  uploadedFileName: string | null;
  onTextFileLoaded: (content: string, fileName: string) => void;
  onPdfFileSelected: (file: File) => void;
  pdfProgress: PdfExtractionProgress | null;
  onCancelPdf: () => void;
  onLoadSample: () => void;
  onClearInput: () => void;
  onProcess: () => void;
  isProcessing: boolean;
  notice: { type: 'warning' | 'error' | 'info'; message: string } | null;
}

export const CatalogInputPanel: React.FC<CatalogInputPanelProps> = ({
  rawText,
  onChangeRawText,
  uploadedFileName,
  onTextFileLoaded,
  onPdfFileSelected,
  pdfProgress,
  onCancelPdf,
  onLoadSample,
  onClearInput,
  onProcess,
  isProcessing,
  notice,
}) => {
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const lineCount = rawText
    ? rawText
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean).length
    : 0;

  const isReadingPdf = pdfProgress !== null;
  const pdfPercent =
    pdfProgress && pdfProgress.totalPages > 0
      ? Math.min(100, Math.round((pdfProgress.currentPage / pdfProgress.totalPages) * 100))
      : 0;

  const dispatchFile = (file: File | undefined) => {
    if (!file) return;
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      onPdfFileSelected(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = typeof e.target?.result === 'string' ? e.target.result : '';
      onTextFileLoaded(content, file.name);
    };
    reader.readAsText(file, 'UTF-8');
  };

  return (
    <section
      aria-label="Ingresso Catalogo"
      className="rounded-xl border border-slate-800/80 bg-[#101622] p-4 sm:p-5 space-y-3.5"
    >
      {/* Compact Command Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="font-mono tabular-nums text-slate-200">{lineCount} righe</span>
          {uploadedFileName && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-sky-300 truncate max-w-[220px]">
                {uploadedFileName}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={pdfInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="sr-only"
            onChange={(e) => {
              dispatchFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <input
            ref={textInputRef}
            type="file"
            accept=".txt,.csv,.tsv,text/plain,text/csv"
            className="sr-only"
            onChange={(e) => {
              dispatchFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />

          <button
            type="button"
            disabled={isReadingPdf}
            onClick={() => pdfInputRef.current?.click()}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-amber-500/50 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/20 disabled:opacity-45 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Carica PDF</span>
          </button>

          <button
            type="button"
            disabled={isReadingPdf}
            onClick={() => textInputRef.current?.click()}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-700/80 bg-[#151D2E] px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800 disabled:opacity-45 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <FileUp className="h-3.5 w-3.5 text-sky-400 shrink-0" aria-hidden="true" />
            <span>TXT / CSV</span>
          </button>

          <button
            type="button"
            disabled={isReadingPdf}
            onClick={onLoadSample}
            className="inline-flex min-h-[40px] items-center rounded-lg border border-slate-700/80 bg-[#151D2E] px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100 disabled:opacity-45 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            Carica Esempio
          </button>

          {rawText.length > 0 && (
            <button
              type="button"
              disabled={isReadingPdf}
              onClick={onClearInput}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-800 px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:border-slate-700 hover:text-slate-200 disabled:opacity-45 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Pulisci</span>
            </button>
          )}
        </div>
      </div>

      {/* Live PDF Extraction Progress Bar */}
      {isReadingPdf && pdfProgress && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-lg border border-amber-500/40 bg-[#0A0E17] p-3.5 space-y-2"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-medium text-amber-300">
              Lettura pagina <span className="font-mono tabular-nums">{pdfProgress.currentPage}</span> di{' '}
              <span className="font-mono tabular-nums">{pdfProgress.totalPages}</span>...
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono tabular-nums text-slate-300">{pdfPercent}%</span>
              <button
                type="button"
                onClick={onCancelPdf}
                className="inline-flex min-h-[32px] items-center gap-1 rounded border border-rose-500/40 bg-rose-950/30 px-2.5 py-1 text-xs font-medium text-rose-200 hover:bg-rose-900/40"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Annulla</span>
              </button>
            </div>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-amber-500 transition-[width] duration-150 ease-out"
              style={{ width: `${pdfPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Raw Textarea + Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          dispatchFile(e.dataTransfer.files?.[0]);
        }}
        className={`rounded-lg border transition-colors ${
          isDragging
            ? 'border-amber-400 bg-amber-950/15'
            : 'border-slate-800 bg-[#0A0E17] focus-within:border-amber-500/70'
        }`}
      >
        <label htmlFor="raw-catalog-textarea" className="sr-only">
          Testo grezzo catalogo
        </label>
        <textarea
          id="raw-catalog-textarea"
          value={rawText}
          onChange={(e) => onChangeRawText(e.target.value)}
          rows={7}
          spellCheck={false}
          placeholder={`Trascina qui un file .pdf / .csv / .txt oppure incolla il testo grezzo:\n\nAlfa Romeo 147 (937_) (2001à2010)\n714021190701 | OEM 46812345 | IZQUIERDO ü`}
          className="block w-full resize-y rounded-t-lg bg-transparent p-3.5 font-mono text-xs sm:text-[13px] leading-relaxed text-slate-200 placeholder:text-slate-500 focus:outline-none"
        />

        <div className="flex flex-col gap-2.5 border-t border-slate-800/80 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onProcess}
            disabled={isProcessing || isReadingPdf || lineCount === 0}
            className="inline-flex w-full sm:w-auto min-h-[44px] items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <Play className="h-4 w-4 fill-current shrink-0" aria-hidden="true" />
            <span>{isProcessing ? 'Elaborazione...' : 'Elabora e Normalizza'}</span>
          </button>
        </div>
      </div>

      {notice && (
        <div
          role="status"
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
            notice.type === 'error'
              ? 'border-rose-500/40 bg-rose-950/30 text-rose-200'
              : notice.type === 'warning'
                ? 'border-amber-500/40 bg-amber-950/30 text-amber-200'
                : 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
          }`}
        >
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{notice.message}</span>
        </div>
      )}
    </section>
  );
};
