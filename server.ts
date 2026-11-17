import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

const SYSTEM_INSTRUCTION = `Sei un motore esperto di normalizzazione cataloghi ricambi auto (database XPart / Supabase).
Analizza ogni riga grezza fornita (listini fornitori, estratti PDF, tabelle OE/Aftermarket) ed estrai un oggetto JSON strutturato per ciascuna riga valida (ignora eventuali righe di intestazione colonna).

Regole rigorose:
1. oem_code: Estrai il codice OEM originale pulito. Rimuovi TUTTI gli spazi, trattini, slash, punti e prefissi come "OEM:", "OE:", "Cod. Orig.". Converti in MAIUSCOLO alfanumerico puro (es. "5Q0-907-511-A" -> "5Q0907511A", "A 204 810 10 21" -> "A2048101021").
2. cross_reference: Identifica e separa tutti i codici aftermarket equivalenti (Bosch, Magneti Marelli, Valeo, Denso, Hella, Garrett, BorgWarner, Depo, TYC, Alkar, Continental, Delphi, Pierburg, SKF, ecc.). Formattali come "MARCA CODICEPULITO" separati da virgola (es. "BOSCH 0986049170, VALEO 439558"). Se non presenti, stringa vuota "".
3. car_brand: Normalizza la casa automobilistica in formato standard: Alfa Romeo, Audi, BMW, Citroen, Fiat, Ford, Iveco, Mercedes, Opel, Peugeot, Renault, Seat, Skoda, Toyota, VW (usa esattamente questi nomi, es. "Volkswagen" -> "VW", "Mercedes-Benz" -> "Mercedes", "Citroën" -> "Citroen"). Se deducibile dal modello (es. Giulietta -> Alfa Romeo, Daily -> Iveco, Golf -> VW), compilala automaticamente.
4. car_model: Nome modello e generazione/serie puliti (es. "Golf VII", "Grande Punto", "Classe C W204", "Serie 3 E90", "Daily 35C15"). Non includere gli anni qui se estratti in year_range.
5. year_range: Intervallo anni normalizzato (es. "2012-2019", "2016+"). Stringa vuota se assente.
6. part_name: Nome tecnico pulito del ricambio in italiano (es. "Specchietto Retrovisore Sinistro Elettrico", "Alternatore 14V 120A", "Turbocompressore Garrett GT1749V", "Filtro Olio Motore", "Centralina Clima").
7. category: Scegli ESATTAMENTE una tra queste categorie: "Retrovisori", "Alternatori", "Turbine", "Centraline", "Fari", "Filtri", "Motorini Avviamento", "Freni", "Sospensioni e Sterzo", "Raffreddamento e Clima", "Motore e Iniezione", "Carrozzeria", "Altro Ricambio".
8. raw_source: Copia esattamente la riga grezza originale corrispondente (supporta anche righe in formato tabella comparativa "Codice OE -> Codice Aftermarket / Modello Veicolo" estratte da PDF).`;

function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key || key === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '4mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, aiConfigured: Boolean(getGeminiClient()) });
  });

  app.post('/api/normalize', async (req, res) => {
    try {
      const { lines } = req.body as { lines?: string[] };
      if (!Array.isArray(lines) || lines.length === 0) {
        res.status(400).json({ error: 'Nessuna riga valida ricevuta per la normalizzazione.' });
        return;
      }

      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({
          fallbackRequired: true,
          error: 'Chiave Gemini API non configurata nel pannello Secrets. Esecuzione con motore Regex locale.',
        });
        return;
      }

      const numberedLines = lines
        .slice(0, 80)
        .map((line, i) => `[${i + 1}] ${line}`)
        .join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Normalizza le seguenti ${Math.min(lines.length, 80)} righe del catalogo ricambi auto:\n\n${numberedLines}`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                oem_code: { type: Type.STRING },
                cross_reference: { type: Type.STRING },
                car_brand: { type: Type.STRING },
                car_model: { type: Type.STRING },
                year_range: { type: Type.STRING },
                part_name: { type: Type.STRING },
                category: { type: Type.STRING },
                raw_source: { type: Type.STRING },
              },
              required: ['oem_code', 'cross_reference', 'car_brand', 'car_model', 'year_range', 'part_name', 'category', 'raw_source'],
            },
          },
        },
      });

      const rawText = (response.text ?? '[]').trim();
      const parsed = JSON.parse(rawText);
      if (!Array.isArray(parsed)) {
        res.status(502).json({
          fallbackRequired: true,
          error: 'Risposta AI non valida. Attivato fallback Regex locale.',
        });
        return;
      }

      res.json({ items: parsed });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Errore interno di elaborazione AI';
      const status =
        typeof err === 'object' && err !== null && 'status' in err && typeof (err as { status: unknown }).status === 'number'
          ? (err as { status: number }).status
          : 500;

      res.status(status >= 400 && status < 600 ? status : 500).json({
        fallbackRequired: true,
        error: message,
      });
    }
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`XPart Catalog Normalizer server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
