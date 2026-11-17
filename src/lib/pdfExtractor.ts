import pdfWorkerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';

export interface PdfExtractionProgress {
  currentPage: number;
  totalPages: number;
  extractedLines: number;
  fileName: string;
}

interface PositionedTextItem {
  str: string;
  x: number;
  y: number;
  width: number;
}

function reconstructPageLines(items: unknown[]): string[] {
  const positioned: PositionedTextItem[] = [];

  for (const raw of items) {
    if (
      typeof raw === 'object' &&
      raw !== null &&
      'str' in raw &&
      'transform' in raw
    ) {
      const item = raw as { str: string; transform: number[]; width?: number };
      const text = item.str.replace(/\s+/g, ' ').trim();
      if (!text) continue;

      const x = Array.isArray(item.transform) ? Number(item.transform[4]) || 0 : 0;
      const y = Array.isArray(item.transform) ? Number(item.transform[5]) || 0 : 0;
      const width = typeof item.width === 'number' ? item.width : text.length * 4.5;

      positioned.push({ str: text, x, y, width });
    }
  }

  if (positioned.length === 0) return [];

  // Sort top-to-bottom (higher Y first in PDF coordinate space), then left-to-right
  positioned.sort((a, b) => {
    if (Math.abs(b.y - a.y) > 4.5) {
      return b.y - a.y;
    }
    return a.x - b.x;
  });

  // Cluster into horizontal table rows by Y coordinate
  const rows: PositionedTextItem[][] = [];
  let currentRow: PositionedTextItem[] = [positioned[0]];
  let currentY = positioned[0].y;

  for (let i = 1; i < positioned.length; i++) {
    const item = positioned[i];
    if (Math.abs(item.y - currentY) <= 4.5) {
      currentRow.push(item);
    } else {
      rows.push(currentRow);
      currentRow = [item];
      currentY = item.y;
    }
  }
  rows.push(currentRow);

  // Reconstruct each row preserving table column gaps as " | "
  const lines: string[] = [];
  for (const row of rows) {
    row.sort((a, b) => a.x - b.x);
    let line = row[0].str;
    let prevRight = row[0].x + row[0].width;

    for (let i = 1; i < row.length; i++) {
      const curr = row[i];
      const gap = curr.x - prevRight;
      if (gap >= 14) {
        line += ` | ${curr.str}`;
      } else {
        line += ` ${curr.str}`;
      }
      prevRight = Math.max(prevRight, curr.x + curr.width);
    }

    const normalizedLine = line.replace(/\s+\|\s+\|\s+/g, ' | ').trim();
    if (normalizedLine.length > 0) {
      lines.push(normalizedLine);
    }
  }

  return lines;
}

export async function extractTextFromPdf(
  file: File,
  onProgress: (progress: PdfExtractionProgress) => void,
  signal?: AbortSignal
): Promise<{ text: string; totalPages: number; totalLines: number }> {
  // Dynamic import of polyfilled legacy build prevents ES2025 feature crashes (e.g. Map.getOrInsertComputed)
  // on standard browsers and keeps initial app render non-blocking.
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

  const arrayBuffer = await file.arrayBuffer();
  if (signal?.aborted) {
    throw new DOMException('Lettura PDF annullata.', 'AbortError');
  }

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
  });

  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;
  const allLines: string[] = [];

  try {
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      if (signal?.aborted) {
        throw new DOMException('Lettura PDF annullata.', 'AbortError');
      }

      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageLines = reconstructPageLines(textContent.items);
      allLines.push(...pageLines);
      page.cleanup();

      onProgress({
        currentPage: pageNum,
        totalPages,
        extractedLines: allLines.length,
        fileName: file.name,
      });

      // Yield briefly to keep progress bar rendering smooth on large 300+ page catalogs
      if (pageNum % 2 === 0 || pageNum === totalPages) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
  } finally {
    await pdfDoc.cleanup();
    await loadingTask.destroy();
  }

  return {
    text: allLines.join('\n'),
    totalPages,
    totalLines: allLines.length,
  };
}
