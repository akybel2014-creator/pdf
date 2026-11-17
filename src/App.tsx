/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useState } from 'react';
import { Header } from './components/Header';
import { CatalogInputPanel } from './components/CatalogInputPanel';
import { CatalogTablePanel } from './components/CatalogTablePanel';
import { ExportSupabasePanel } from './components/ExportSupabasePanel';
import { CatalogItem, CsvDelimiter, ParsingStats } from './types/catalog';
import { SAMPLE_CATALOG_TEXT, parseCatalogLines } from './lib/catalogEngine';
import { PdfExtractionProgress, extractTextFromPdf } from './lib/pdfExtractor';

export default function App() {
  const [rawText, setRawText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [stats, setStats] = useState<ParsingStats | null>(null);
  const [delimiter, setDelimiter] = useState<CsvDelimiter>(',');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<PdfExtractionProgress | null>(null);
  const [notice, setNotice] = useState<{
    type: 'warning' | 'error' | 'info';
    message: string;
  } | null>(null);

  const pdfAbortRef = useRef<AbortController | null>(null);

  const handleCancelPdf = () => {
    pdfAbortRef.current?.abort();
    pdfAbortRef.current = null;
    setPdfProgress(null);
  };

  const handleResetAll = () => {
    handleCancelPdf();
    setRawText('');
    setUploadedFileName(null);
    setItems([]);
    setStats(null);
    setNotice(null);
  };

  const handleClearInput = () => {
    handleCancelPdf();
    setRawText('');
    setUploadedFileName(null);
    setNotice(null);
  };

  const handleLoadSample = () => {
    setRawText(SAMPLE_CATALOG_TEXT);
    setUploadedFileName('esempio_catalogo.txt');
    setNotice(null);
  };

  const handleTextFileLoaded = (content: string, fileName: string) => {
    setRawText(content);
    setUploadedFileName(fileName);
    setNotice(null);
  };

  const runProcess = (textToProcess: string, prefix?: string) => {
    if (!textToProcess.trim()) return;
    setIsProcessing(true);
    const result = parseCatalogLines(textToProcess);
    setItems(result.items);
    setStats(result.stats);
    setIsProcessing(false);
    const head = prefix ? `${prefix} · ` : '';
    setNotice({
      type: 'info',
      message: `${head}${result.stats.uniqueRows} righe normalizzate (${result.stats.duplicatesRemoved} duplicati rimossi).`,
    });
  };

  const handlePdfFileSelected = async (file: File) => {
    handleCancelPdf();
    const controller = new AbortController();
    pdfAbortRef.current = controller;

    setUploadedFileName(file.name);
    setNotice(null);
    setPdfProgress({
      currentPage: 0,
      totalPages: 1,
      extractedLines: 0,
      fileName: file.name,
    });

    try {
      const { text, totalPages } = await extractTextFromPdf(
        file,
        (progress) => setPdfProgress(progress),
        controller.signal
      );

      setPdfProgress(null);
      pdfAbortRef.current = null;

      if (!text.trim()) {
        setNotice({
          type: 'warning',
          message: `Nessun testo selezionabile trovato in "${file.name}".`,
        });
        return;
      }

      setRawText(text);
      runProcess(text, `${totalPages} pagine PDF`);
    } catch (err: unknown) {
      setPdfProgress(null);
      pdfAbortRef.current = null;
      if (err instanceof DOMException && err.name === 'AbortError') {
        setNotice({ type: 'warning', message: 'Lettura PDF annullata.' });
        return;
      }
      const msg = err instanceof Error ? err.message : 'Errore lettura PDF.';
      setNotice({ type: 'error', message: msg });
    }
  };

  const handleUpdateItem = (id: string, updated: Partial<CatalogItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddEmptyRow = () => {
    setItems((prev) => [
      {
        id: `manual_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        car_brand: '',
        car_model: '',
        oem_code: '',
        cross_reference: '',
        fitting_side: '',
        attributes: '',
      },
      ...prev,
    ]);
  };

  const hasData =
    rawText.trim().length > 0 || items.length > 0 || uploadedFileName !== null;

  return (
    <div id="top" className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      <Header hasData={hasData} onReset={handleResetAll} />

      <main className="mx-auto w-full max-w-[1320px] flex-1 space-y-4 px-4 py-5 sm:px-6 lg:px-8">
        {/* Compact Status Strip */}
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-slate-800/80 bg-slate-800/70">
          <div className="bg-[#101622] px-3.5 py-2.5">
            <div className="text-[11px] text-slate-400">Righe Grezze</div>
            <div className="font-mono text-lg font-semibold tabular-nums text-slate-100">
              {stats?.totalRawLines ?? (rawText.trim() ? rawText.split(/\r?\n/).filter((l) => l.trim()).length : 0)}
            </div>
          </div>
          <div className="bg-[#101622] px-3.5 py-2.5">
            <div className="text-[11px] text-slate-400">Record Puliti</div>
            <div className="font-mono text-lg font-semibold tabular-nums text-sky-300">
              {items.length}
            </div>
          </div>
          <div className="bg-[#101622] px-3.5 py-2.5">
            <div className="text-[11px] text-slate-400">Duplicati Rimossi</div>
            <div className="font-mono text-lg font-semibold tabular-nums text-emerald-300">
              {stats?.duplicatesRemoved ?? 0}
            </div>
          </div>
        </div>

        <CatalogInputPanel
          rawText={rawText}
          onChangeRawText={setRawText}
          uploadedFileName={uploadedFileName}
          onTextFileLoaded={handleTextFileLoaded}
          onPdfFileSelected={handlePdfFileSelected}
          pdfProgress={pdfProgress}
          onCancelPdf={handleCancelPdf}
          onLoadSample={handleLoadSample}
          onClearInput={handleClearInput}
          onProcess={() => runProcess(rawText)}
          isProcessing={isProcessing}
          notice={notice}
        />

        <CatalogTablePanel
          items={items}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onAddEmptyRow={handleAddEmptyRow}
        />

        <ExportSupabasePanel
          items={items}
          delimiter={delimiter}
          onChangeDelimiter={setDelimiter}
        />
      </main>
    </div>
  );
}
