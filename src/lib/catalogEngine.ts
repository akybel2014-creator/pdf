import { CatalogItem, CsvDelimiter, FittingSide, ParsingStats } from '../types/catalog';

interface BrandDef {
  canonical: string;
  prefixRx: RegExp;
  inlineRx: RegExp;
}

const BRAND_DEFS: BrandDef[] = [
  {
    canonical: 'Alfa Romeo',
    prefixRx: /^alfa\s*romeo(?=\b|\d|[A-Z])/i,
    inlineRx: /\balfa\s*romeo\b/i,
  },
  {
    canonical: 'Land Rover',
    prefixRx: /^land\s*rover(?=\b|\d|[A-Z])/i,
    inlineRx: /\bland\s*rover\b/i,
  },
  {
    canonical: 'Mercedes',
    prefixRx: /^mercedes(?:-?\s*benz)?(?=\b|\d|[A-Z])/i,
    inlineRx: /\bmercedes(?:-?\s*benz)?\b/i,
  },
  {
    canonical: 'VW',
    prefixRx: /^(?:volkswagen|vw)(?=\b|\d|[A-Z])/i,
    inlineRx: /\b(?:volkswagen|vw)\b/i,
  },
  { canonical: 'Audi', prefixRx: /^audi(?=\b|\d|[A-Z])/i, inlineRx: /\baudi\b/i },
  { canonical: 'BMW', prefixRx: /^bmw(?=\b|\d|[A-Z])/i, inlineRx: /\bbmw\b/i },
  { canonical: 'Citroen', prefixRx: /^citro[eë]n(?=\b|\d|[A-Z])/i, inlineRx: /\bcitro[eë]n\b/i },
  { canonical: 'Dacia', prefixRx: /^dacia(?=\b|\d|[A-Z])/i, inlineRx: /\bdacia\b/i },
  { canonical: 'Fiat', prefixRx: /^fiat(?=\b|\d|[A-Z])/i, inlineRx: /\bfiat\b/i },
  { canonical: 'Ford', prefixRx: /^ford(?=\b|\d|[A-Z])/i, inlineRx: /\bford\b/i },
  { canonical: 'Honda', prefixRx: /^honda(?=\b|\d|[A-Z])/i, inlineRx: /\bhonda\b/i },
  { canonical: 'Hyundai', prefixRx: /^hyundai(?=\b|\d|[A-Z])/i, inlineRx: /\bhyundai\b/i },
  { canonical: 'Iveco', prefixRx: /^iveco(?=\b|\d|[A-Z])/i, inlineRx: /\biveco\b/i },
  { canonical: 'Jeep', prefixRx: /^jeep(?=\b|\d|[A-Z])/i, inlineRx: /\bjeep\b/i },
  { canonical: 'Kia', prefixRx: /^kia(?=\b|\d|[A-Z])/i, inlineRx: /\bkia\b/i },
  { canonical: 'Lancia', prefixRx: /^lancia(?=\b|\d|[A-Z])/i, inlineRx: /\blancia\b/i },
  { canonical: 'Mazda', prefixRx: /^mazda(?=\b|\d|[A-Z])/i, inlineRx: /\bmazda\b/i },
  { canonical: 'Mini', prefixRx: /^mini(?=\b|\d|[A-Z])/i, inlineRx: /\bmini\b/i },
  { canonical: 'Mitsubishi', prefixRx: /^mitsubishi(?=\b|\d|[A-Z])/i, inlineRx: /\bmitsubishi\b/i },
  { canonical: 'Nissan', prefixRx: /^nissan(?=\b|\d|[A-Z])/i, inlineRx: /\bnissan\b/i },
  { canonical: 'Opel', prefixRx: /^opel(?=\b|\d|[A-Z])/i, inlineRx: /\bopel\b/i },
  { canonical: 'Peugeot', prefixRx: /^peugeot(?=\b|\d|[A-Z])/i, inlineRx: /\bpeugeot\b/i },
  { canonical: 'Porsche', prefixRx: /^porsche(?=\b|\d|[A-Z])/i, inlineRx: /\bporsche\b/i },
  { canonical: 'Renault', prefixRx: /^renault(?=\b|\d|[A-Z])/i, inlineRx: /\brenault\b/i },
  { canonical: 'Seat', prefixRx: /^seat(?=\b|\d|[A-Z])/i, inlineRx: /\bseat\b/i },
  { canonical: 'Skoda', prefixRx: /^[sš]koda(?=\b|\d|[A-Z])/i, inlineRx: /\b[sš]koda\b/i },
  { canonical: 'Smart', prefixRx: /^smart(?=\b|\d|[A-Z])/i, inlineRx: /\bsmart\b/i },
  { canonical: 'Suzuki', prefixRx: /^suzuki(?=\b|\d|[A-Z])/i, inlineRx: /\bsuzuki\b/i },
  { canonical: 'Toyota', prefixRx: /^toyota(?=\b|\d|[A-Z])/i, inlineRx: /\btoyota\b/i },
  { canonical: 'Volvo', prefixRx: /^volvo(?=\b|\d|[A-Z])/i, inlineRx: /\bvolvo\b/i },
];

const AFTERMARKET_BRANDS = [
  'MAGNETI MARELLI',
  'MARELLI',
  'BOSCH',
  'VALEO',
  'DENSO',
  'HELLA',
  'DEPO',
  'TYC',
  'ALKAR',
  'PRASCO',
  'GARRETT',
  'BORGWARNER',
  'CONTINENTAL',
  'VDO',
  'DELPHI',
  'PIERBURG',
  'MAHLE',
  'BEHR',
  'MANN-FILTER',
  'MANN',
  'UFI',
  'PURFLUX',
  'KNECHT',
  'FILTRON',
  'SKF',
  'FEBI',
  'TRW',
  'BREMBO',
  'NISSENS',
  'NRF',
  'MEYLE',
  'VAN WEZEL',
  'RHIAG',
];

const GRAPHIC_SYMBOL_RX = /[üþ¨§•■□▪▫◆◇★☆✓✔✗✘✕✖✦✧❖➢➤➣➔➜➝➞→⇒»«©®™°†‡‰¶●○◐◑]/g;
const LEFT_ARROW_RX = /[◄◀◁◅]/g;
const RIGHT_ARROW_RX = /[►▶▷▻]/g;

export function cleanOemCode(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/\b(?:cod\.?\s*orig\.?|cod\.?\s*oem|oem|oe|rif\.?|p\/n)\s*[:=#-]?\s*/gi, '')
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase();
}

export function cleanGraphicAndGlitches(text: string): string {
  return text
    .replace(GRAPHIC_SYMBOL_RX, ' ')
    .replace(/\b((?:19|20)\d{2})\s*(?:--+|–|—|−|~|»|›|>|[àáâãäåāăą])\s*((?:19|20)\d{2})\b/g, '$1-$2')
    .replace(/\b((?:19|20)\d{2})\s*(?:--+|–|—|−|~|»|›|>|[àáâãäåāăą])(?=\s|\)|$)/g, '$1->')
    .replace(/--+/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function separateGluedBrands(text: string): string {
  let out = text;
  out = out.replace(/\bAlfaRomeo\b/gi, 'Alfa Romeo');
  out = out.replace(/\bLandRover\b/gi, 'Land Rover');
  out = out.replace(/\bMercedesBenz\b/gi, 'Mercedes-Benz');
  for (const def of BRAND_DEFS) {
    out = out.replace(new RegExp(`(${def.inlineRx.source})([A-Z0-9])`, 'gi'), '$1 $2');
  }
  return out.replace(/\s+/g, ' ').trim();
}

function isPureMultiBrandHeader(line: string): boolean {
  let residual = separateGluedBrands(line).replace(/[|/\\,;:\-–—]+/g, ' ').trim();
  let matchedBrands = 0;

  for (const def of BRAND_DEFS) {
    const rx = new RegExp(def.inlineRx.source, 'gi');
    const matches = residual.match(rx);
    if (matches) {
      matchedBrands += matches.length;
      residual = residual.replace(rx, ' ');
    }
  }

  return matchedBrands >= 1 && residual.replace(/\s+/g, '').trim().length === 0;
}

function extractLeadingOrInlineBrand(text: string): { brand: string; remainder: string } {
  const spaced = separateGluedBrands(text);

  for (const def of BRAND_DEFS) {
    const m = spaced.match(def.prefixRx);
    if (m) {
      const afterFirst = spaced.slice(m[0].length).trim();
      const nested = extractLeadingOrInlineBrand(afterFirst);
      if (nested.brand && !/^\d/.test(afterFirst)) {
        return nested;
      }
      return {
        brand: def.canonical,
        remainder: afterFirst.replace(/^[\s|/\\,;:\-–—]+/, '').trim(),
      };
    }
  }

  for (const def of BRAND_DEFS) {
    const m = spaced.match(def.inlineRx);
    if (m) {
      return {
        brand: def.canonical,
        remainder: spaced.replace(def.inlineRx, ' ').replace(/\s+/g, ' ').trim(),
      };
    }
  }

  return { brand: '', remainder: spaced };
}

function extractFittingSide(rawLine: string): { side: FittingSide; textWithoutSide: string } {
  let working = rawLine;
  let side: FittingSide = '';

  const hasLeftArrow = LEFT_ARROW_RX.test(working);
  const hasRightArrow = RIGHT_ARROW_RX.test(working);
  LEFT_ARROW_RX.lastIndex = 0;
  RIGHT_ARROW_RX.lastIndex = 0;

  if (/\bbilateral[ei]?\b|\bambos\b|\bentrambi\b|\bsx\s*\/\s*dx\b/i.test(working)) {
    side = 'Bilaterale';
    working = working.replace(/\bbilateral[ei]?\b|\bambos\b|\bentrambi\b|\bsx\s*\/\s*dx\b/gi, ' ');
  } else if (hasLeftArrow) {
    side = 'SX';
  } else if (hasRightArrow) {
    side = 'DX';
  }

  if (!side) {
    if (/\b(?:izquierdo|izq\.?|sinistro|sx|left|lh)\b/i.test(working)) {
      side = 'SX';
    } else if (/\b(?:derecho|der\.?|destro|dx|right|rh)\b/i.test(working)) {
      side = 'DX';
    }
  }

  working = working
    .replace(/\b(?:izquierdo|izq\.?|sinistro|sx|left|lh|derecho|der\.?|destro|dx|right|rh)\b/gi, ' ')
    .replace(/[◄◀◁◅►▶▷▻]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return { side, textWithoutSide: working };
}

function isLikelyCodeToken(token: string): boolean {
  const compact = token.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (compact.length < 5 || compact.length > 18) return false;
  if (!/\d/.test(compact)) return false;
  if (/^(?:19|20)\d{2}$/.test(compact)) return false;
  if (/^(?:19|20)\d{4}$/.test(compact)) return false;
  if (/^(?:19|20)\d{2}(?:19|20)\d{2}$/.test(compact)) return false;
  return true;
}

function isShortCatalogCrossRef(compactCode: string): boolean {
  // Short supplier catalog codes like RV30004, RV90018, AU90105, BM90018, FT90210, LPA012
  return /^[A-Z]{2,3}\d{3,6}$/i.test(compactCode);
}

function isLongMarelliCatalogCode(compactCode: string): boolean {
  // Magneti Marelli 12-digit aftermarket codes (714..., 350..., 063..., etc.)
  return /^(?:71|350|351|352|359|063|064|089|098|430|519|644|940)\d{7,10}$/.test(compactCode);
}

function extractCodesForSingleRow(
  rawSegment: string,
  ignoreParenthesized: boolean
): {
  oemCode: string;
  crossRefs: string[];
  residualText: string;
} {
  const placeholders: string[] = [];
  let working = rawSegment;

  if (ignoreParenthesized) {
    working = working.replace(/\([^)]*\)/g, (m) => {
      const idx = placeholders.length;
      placeholders.push(m);
      return `__PAREN_${idx}__`;
    });
  }

  let explicitOem = '';
  const crossRefs: string[] = [];
  const unmarkedCodes: string[] = [];

  // 1. Explicit OEM label
  const explicitOemRx =
    /\b(?:cod\.?\s*orig\.?|cod\.?\s*oem|oem|oe|rif\.?|p\/n)\s*[:=#-]?\s*([A-Z0-9]{2,6}(?:[-\/\.][A-Z0-9]{1,6}){1,4}|[A-Z0-9]{5,18})/gi;
  working = working.replace(explicitOemRx, (_full, code: string) => {
    const clean = cleanOemCode(code);
    if (isLikelyCodeToken(clean)) {
      if (!explicitOem) {
        explicitOem = clean;
      } else if (!crossRefs.includes(clean)) {
        crossRefs.push(clean);
      }
      return ' ';
    }
    return _full;
  });

  // 2. Explicit aftermarket brand + code
  const amAlternation = AFTERMARKET_BRANDS.join('|').replace(/\s+/g, '\\s+');
  const amRx = new RegExp(
    `\\b(${amAlternation})\\b\\s*[:=#-]?\\s*([A-Z0-9]{1,14}(?:[.\\/-][A-Z0-9]{1,8}|\\s+(?:[0-9]{2,4}(?:\\/[0-9]{1,4})?|[A-Z0-9]{1,4}(?=\\s|$|[,;|/\\(]))){0,4})`,
    'gi'
  );
  working = working.replace(amRx, (_full, brand: string, code: string) => {
    const cleanBrand =
      brand.trim().toUpperCase() === 'MARELLI' ? 'MAGNETI MARELLI' : brand.trim().toUpperCase();
    const cleanCode = code.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (cleanCode.length >= 4 && /\d/.test(cleanCode)) {
      const formatted = `${cleanBrand} ${cleanCode}`;
      if (!crossRefs.includes(formatted)) crossRefs.push(formatted);
      return ' ';
    }
    return _full;
  });

  // 3. Remaining unmarked tokens on THIS line only
  const tokenRx =
    /\b[A-Z0-9]{2,6}(?:[-\/\.][A-Z0-9]{1,6}){1,4}\b|\b[A-Z0-9]{5,18}\b/gi;
  const matches = working.match(tokenRx) || [];
  for (const rawToken of matches) {
    if (rawToken.startsWith('__PAREN_')) continue;
    if (!isLikelyCodeToken(rawToken)) continue;
    const clean = rawToken.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (!unmarkedCodes.includes(clean)) {
      unmarkedCodes.push(clean);
    }
    working = working.replace(rawToken, ' ');
  }

  // Classify unmarked codes into primary oem_code vs cross_reference
  let finalOem = explicitOem;
  for (const code of unmarkedCodes) {
    const looksLikeCrossRef = isShortCatalogCrossRef(code) || isLongMarelliCatalogCode(code);
    if (!finalOem && !looksLikeCrossRef) {
      finalOem = code;
    } else if (code !== finalOem && !crossRefs.includes(code)) {
      crossRefs.push(code);
    }
  }

  if (ignoreParenthesized && placeholders.length > 0) {
    working = working.replace(/__PAREN_(\d+)__/g, (_m, idx) => placeholders[Number(idx)] || '');
  }

  const residualText = working
    .replace(/^[\s|/\\,;:\-–—]+|[\s|/\\,;:\-–—]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    oemCode: finalOem,
    crossRefs,
    residualText,
  };
}

const LEGAL_DISCLAIMER_RX =
  /(?:\b(?:all\s+rights?\s+reserved|tutti\s+i\s+diritti\s+riservati|todos\s+(?:os|los)\s+direitos?\s+reservad[oa]s?|todos\s+los\s+derechos\s+reservados|tous\s+droits\s+r[eé]serv[eé]s|alle\s+rechte\s+vorbehalten|copyright|riproduzione\s+(?:vietata|riservata)|reproduction\s+(?:prohibited|forbidden)|proibida\s+a\s+reprodu[cç][aã]o|prohibida\s+su\s+reproducci[oó]n|subject\s+to\s+change\s+without\s+notice|salvo\s+errori|con\s+riserva\s+di\s+modifiche|disclaimer|for\s+reference\s+only|solo\s+(?:a\s+)?scopo\s+informativo|after\s*market\s+parts(?:\s+and\s+services)?|parts\s+and\s+services|marelli\s+after\s*market|magneti\s+marelli\s+(?:after\s*market|s\.?p\.?a\.?)|s\.p\.a\.?(?=\s|$|[,;|])|s\.r\.l\.?(?=\s|$|[,;|])|gmbh(?=\s|$|[,;|])|s\.a\.s\.?(?=\s|$|[,;|])|cap\.?\s*soc\.?|p\.?\s*iva|part\.?\s*iva|cod\.?\s*fisc\.?|r\.e\.a\.?|tribunale\s+di|registered\s+trademark|marchi\s+registrati|sede\s+legale|registered\s+office)\b|(?:©|®|™)|\b(?:https?:\/\/|www\.)\S+|\S+@\S+\.\S+)/i;

const CATALOG_HEADER_LEGEND_RX =
  /\b(?:product\s+type|tipo\s+di\s+[a-zà-ÿ]+|regulation\s+type|adjustment\s+type|mirror\s+type|glass\s+type|fitting\s+position|mounting\s+(?:position|side)|posizione(?:\s+di)?\s+montaggio|lato\s+(?:di\s+)?montaggio|part\s+type|part\s+number|part\s+description|spare\s+part(?:s)?|vehicle\s+application(?:s)?|car\s+application(?:s)?|applicazioni|cross[\s-]+reference(?:s)?|oe\s+(?:code|number|ref(?:erence)?)|oem\s+(?:code|number|ref(?:erence)?)|codice\s+(?:oe|oem|articolo|prodotto|ricambio|fornitore)|legenda|legend|simboli|symbols|abbreviazioni|abbreviations|indice|index|sommario|table\s+of\s+contents|technical\s+features|caratteristiche\s+tecniche|(?:product|regulation|adjustment|mirror|glass|lamp|bulb|connector|plug|housing|cover|fitting|mounting|body|drive)\s+type)\b/i;

function isLegalDisclaimerLine(text: string): boolean {
  return LEGAL_DISCLAIMER_RX.test(text);
}

function isCatalogHeaderOrLegend(text: string): boolean {
  return CATALOG_HEADER_LEGEND_RX.test(text);
}

function stripNoiseAndDisclaimerSegments(rawLine: string): string {
  if (!rawLine.includes('|')) {
    return isLegalDisclaimerLine(rawLine) || isCatalogHeaderOrLegend(rawLine) ? '' : rawLine;
  }
  const kept = rawLine
    .split('|')
    .map((seg) => seg.trim())
    .filter((seg) => seg.length > 0 && !isLegalDisclaimerLine(seg) && !isCatalogHeaderOrLegend(seg));
  return kept.join(' | ');
}

function isNoiseLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return true;
  if (/^(?:pagina|page|pag\.?)\s*\d+(?:\s*(?:di|of|\/)\s*\d+)?$/i.test(trimmed)) return true;

  // Keep standalone arrows / side words so they can merge into pending component!
  if (
    LEFT_ARROW_RX.test(trimmed) ||
    RIGHT_ARROW_RX.test(trimmed) ||
    /^(?:sx|dx|sinistro|destro|izquierdo|derecho|bilateral[ei]?)$/i.test(trimmed)
  ) {
    LEFT_ARROW_RX.lastIndex = 0;
    RIGHT_ARROW_RX.lastIndex = 0;
    return false;
  }
  LEFT_ARROW_RX.lastIndex = 0;
  RIGHT_ARROW_RX.lastIndex = 0;

  if (isLegalDisclaimerLine(trimmed) || isCatalogHeaderOrLegend(trimmed)) return true;

  if (trimmed.replace(/[^A-Za-z0-9]/g, '').length < 2) return true;

  const lower = trimmed.toLowerCase();
  if (
    (lower.includes('oem') || lower.includes('codice')) &&
    (lower.includes('marca') || lower.includes('modello') || lower.includes('cross') || lower.includes('lato'))
  ) {
    return true;
  }
  return false;
}

const PART_ATTRIBUTE_PHRASE_RX =
  /\b(?:long\s+short|short\s+long|lane\s+change|blind\s+spot|small\s+glass|big\s+glass|large\s+glass|cover\s+with\s+comfort|with\s+comfort|with\s+antenna|without\s+antenna|with\s+blinker|without\s+blinker|with\s+light|without\s+light|with\s+lane|with\s+memory|with\s+camera|with\s+sensor|with\s+warning|power\s+fold(?:ing)?|manual\s+fold(?:ing)?|electric\s+fold(?:ing)?|auto[\s-]?dimming|puddle\s+light|courtesy\s+light|angolo\s+cieco|guida\s+destra|guida\s+sinistra|da\s+verniciare|complete\s+mirror)\b/i;

const PART_ATTRIBUTE_WORD_RX =
  /\b(?:long|short|small|large|big|wide|convex|convesso|aspheric|aspherical|asferico|flat|piano|tinted|blue|blu|chrome|chromed|cromato|glass|vetro|mirror|specchio|retrovisore|cover|cap|calotta|housing|frame|cornice|arm|braccio|lungo|corto|blinker|indicator|freccia|light|lamp|led|halogen|xenon|bulb|lampadina|warning|allarme|spia|antenna|aerial|rhd|lhd|comfort|memory|memoria|folding|foldable|ripiegabile|electric|elettrico|manual|manuale|heated|riscaldato|termico|sensor|sensore|temp|temperature|temperatura|camera|telecamera|dimming|elettrocromico|primed|primer|black|nero|textured|goffrato|satin|satinato|with|without|con|senza|pin|pins|poli|wires|cavi|plug|connector|connettore|motor|motorino|puddle|courtesy|cortesia|upper|lower|superiore|inferiore|note|notes|attributes|description|descrizione)\b/i;

const TECH_SPEC_TOKEN_RX = /\b\d+\s*(?:w|v|pins?|poli|wires?)\b/i;

const KNOWN_VEHICLE_MODEL_RX =
  /\b(?:serie\s*\d+|series\s*\d+|class[e]?\s*[a-z0-9]+|golf|polo|passat|bora|jetta|scirocco|sharan|eos|phaeton|lupo|fox|taigo|tiguan|touran|touareg|up!?|caddy|transporter|crafter|amarok|arteon|t-roc|t-cross|panda|punto|bravo|tipo(?!\s+di\b)|doblo|ducato|fiorino|scudo|500[lx]?|giulia|giulietta|mito|stelvio|tonale|ypsilon|delta|musa|a[1-8]|q[2-8]|s[1-8]|rs[2-8]|tt|avant|sportback|allroad|cabriolet|coupe|touring|sedan|variant|berlina|station\s*wagon|x[1-7]|z[34]|clio|megane|scenic|captur|kadjar|twingo|kangoo|master|trafic|laguna|talisman|espace|20[56789]|30[6789]|40[678]|50[08]|2008|3008|5008|partner|boxer|expert|rifter|c[1-8]|ds[3457]|berlingo|jumper|jumpy|picasso|corsa|astra|insignia|mokka|zafira|meriva|vectra|vivaro|movano|fiesta|focus|mondeo|kuga|puma|ecosport|transit|tourneo|ka|s-max|c-max|galaxy|ranger|ibiza|leon|arona|ateca|tarraco|alhambra|altea|toledo|fabia|octavia|superb|kodiaq|karoq|kamiq|scala|rapid|yeti|yaris|corolla|auris|avensis|rav\s*4|aygo|c-hr|hilux|proace|qashqai|juke|micra|x-trail|navara|civic|jazz|cr-v|hr-v|swift|vitara|ignis|jimny|s-cross|i10|i20|i30|i40|tucson|kona|santa\s*fe|sportage|ceed|picanto|stonic|niro|sorento|xc40|xc60|xc90|v40|v60|v90|s40|s60|sprinter|vito|viano|citan|actros|daily|stralis|eurocargo|duster|sandero|logan|jogger|defender|discovery|freelander|evoque|velar|cooper|countryman|clubman|fortwo|forfour|cherokee|renegade|compass|wrangler|cx-[3579]|mazda\s*[236]|cayenne|macan|panamera|boxster|cayman|911)\b/i;

function isYearOrChassisParen(parenContent: string): boolean {
  const inner = parenContent.trim();
  if (/^(?:19|20)\d{2}/.test(inner)) return true;
  if (/^(?:16w|5w|21w|12v|24v|rhd|lhd|led|sx|dx|primed|heated|electric|manual)$/i.test(inner)) {
    return false;
  }
  return /^[A-Z0-9][A-Z0-9_,\s\/-]{1,14}$/i.test(inner) && !PART_ATTRIBUTE_WORD_RX.test(inner);
}

function hasValidChassisOrYear(text: string): boolean {
  if (/\((?:19|20)\d{2}/.test(text)) return true;
  const parens = text.match(/\(([^)]+)\)/g) || [];
  return parens.some((p) => isYearOrChassisParen(p.slice(1, -1)));
}

function isPartAttributeOrNoteSegment(segment: string): boolean {
  const trimmed = segment.trim();
  if (!trimmed) return false;
  if (PART_ATTRIBUTE_PHRASE_RX.test(trimmed)) return true;
  if (TECH_SPEC_TOKEN_RX.test(trimmed) && !hasValidChassisOrYear(trimmed)) return true;

  const words = trimmed
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^A-Za-zÀ-ÿ0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return false;
  const attrMatches = words.filter((w) => PART_ATTRIBUTE_WORD_RX.test(w) || TECH_SPEC_TOKEN_RX.test(w)).length;
  if (attrMatches === 0) return false;

  // If no valid vehicle chassis/year or known vehicle model is present, any attribute keyword marks it as an attribute segment
  if (!hasValidChassisOrYear(trimmed) && !KNOWN_VEHICLE_MODEL_RX.test(trimmed)) {
    return true;
  }

  // If majority of words are attribute terms, treat as attribute segment
  return attrMatches >= Math.ceil(words.length / 2);
}

function splitTrailingAttributesFromModel(text: string): { modelPart: string; attrPart: string } {
  // Scan outside parentheses for the first attribute phrase/token
  let inParen = 0;
  let splitIdx = -1;
  const tokens = text.split(/(\s+)/);
  let pos = 0;

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    for (const ch of tok) {
      if (ch === '(') inParen++;
      else if (ch === ')' && inParen > 0) inParen--;
    }

    if (inParen === 0 && !/^\s+$/.test(tok)) {
      const cleanTok = tok.replace(/^[,;|/-]+|[,;|/-]+$/g, '');
      const restFromHere = text.slice(pos).trim();
      const startsWithAttrPhrase = new RegExp(`^(?:${PART_ATTRIBUTE_PHRASE_RX.source})`, 'i').test(restFromHere);
      if (
        cleanTok &&
        (PART_ATTRIBUTE_WORD_RX.test(cleanTok) ||
          TECH_SPEC_TOKEN_RX.test(cleanTok) ||
          startsWithAttrPhrase)
      ) {
        // Ensure we don't split a known trim word
        if (!KNOWN_VEHICLE_MODEL_RX.test(cleanTok)) {
          splitIdx = pos;
          break;
        }
      }
    }
    pos += tok.length;
  }

  if (splitIdx > 0) {
    return {
      modelPart: text.slice(0, splitIdx).replace(/[\s|,/;-]+$/, '').trim(),
      attrPart: text.slice(splitIdx).replace(/^[\s|,/;-]+/, '').trim(),
    };
  }

  return { modelPart: text.trim(), attrPart: '' };
}

function looksLikeValidVehicleModel(text: string, hasBrandOnLine: boolean): boolean {
  const cleaned = text.trim();
  if (!cleaned) return false;
  if (isLegalDisclaimerLine(cleaned) || isCatalogHeaderOrLegend(cleaned)) return false;
  if (isPartAttributeOrNoteSegment(cleaned)) return false;

  if (hasValidChassisOrYear(cleaned)) return true;
  if (KNOWN_VEHICLE_MODEL_RX.test(cleaned)) return true;

  if (hasBrandOnLine) {
    // When preceded by a recognized brand (e.g. "Alfa Romeo 147", "Fiat 500", "BMW Serie 3"),
    // accept non-attribute alphanumeric model strings
    const alphaNumTokens = cleaned.split(/\s+/).filter((t) => /[A-Za-z0-9]/.test(t));
    return alphaNumTokens.length >= 1 && cleaned.length >= 2;
  }

  return false;
}

function extractModelAndAttributes(
  residualText: string,
  hasBrandOnLine: boolean
): {
  carModel: string;
  attributes: string;
} {
  if (!residualText) return { carModel: '', attributes: '' };

  const segments = residualText
    .split(/\s*\|\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

  let carModel = '';
  const attrs: string[] = [];

  for (let idx = 0; idx < segments.length; idx++) {
    const seg = segments[idx];
    if (isLegalDisclaimerLine(seg) || isCatalogHeaderOrLegend(seg)) continue;
    const { modelPart, attrPart } = splitTrailingAttributesFromModel(seg);

    if (
      modelPart &&
      !isPartAttributeOrNoteSegment(modelPart) &&
      looksLikeValidVehicleModel(modelPart, hasBrandOnLine && idx === 0)
    ) {
      if (!carModel) {
        carModel = modelPart;
      }
      if (attrPart) attrs.push(attrPart);
    } else if (
      isPartAttributeOrNoteSegment(seg) ||
      attrPart ||
      PART_ATTRIBUTE_WORD_RX.test(seg) ||
      TECH_SPEC_TOKEN_RX.test(seg)
    ) {
      attrs.push(seg);
    }
  }

  return {
    carModel,
    attributes: mergeTextList('', attrs.join(', ')),
  };
}

function mergeTextList(existing: string, incoming: string): string {
  const parts: string[] = [];
  for (const raw of [...existing.split(','), ...incoming.split(',')]) {
    const clean = raw.trim();
    if (clean && !parts.some((p) => p.toLowerCase() === clean.toLowerCase())) {
      parts.push(clean);
    }
  }
  return parts.join(', ');
}

interface PendingComponent {
  car_brand: string;
  car_model: string;
  oem_code: string;
  cross_reference: string;
  fitting_side: FittingSide;
  attributes: string;
}

interface ParsedLineInfo {
  rawLine: string;
  isBrandHeader: boolean;
  singleHeaderBrand: string;
  isMultiSideSplit: boolean;
  side: FittingSide;
  lineBrand: string;
  oemCode: string;
  lineCross: string;
  carModel: string;
  lineAttributes: string;
  hasModelDesc: boolean;
}

function preParseLine(rawLine: string): ParsedLineInfo {
  if (isPureMultiBrandHeader(rawLine)) {
    const brandCount = BRAND_DEFS.filter((d) =>
      new RegExp(d.inlineRx.source, 'i').test(separateGluedBrands(rawLine))
    ).length;
    const singleHeaderBrand = brandCount === 1 ? extractLeadingOrInlineBrand(rawLine).brand : '';
    return {
      rawLine,
      isBrandHeader: true,
      singleHeaderBrand,
      isMultiSideSplit: false,
      side: '',
      lineBrand: singleHeaderBrand,
      oemCode: '',
      lineCross: '',
      carModel: '',
      lineAttributes: '',
      hasModelDesc: false,
    };
  }

  const hasBothSxAndDx =
    /\b(?:sx|sinistro|izquierdo)\b/i.test(rawLine) &&
    /\b(?:dx|destro|derecho)\b/i.test(rawLine) &&
    !/[◄►]/.test(rawLine);

  if (hasBothSxAndDx && rawLine.includes('/')) {
    return {
      rawLine,
      isBrandHeader: false,
      singleHeaderBrand: '',
      isMultiSideSplit: true,
      side: '',
      lineBrand: '',
      oemCode: '',
      lineCross: '',
      carModel: '',
      lineAttributes: '',
      hasModelDesc: false,
    };
  }

  const hasArrow = LEFT_ARROW_RX.test(rawLine) || RIGHT_ARROW_RX.test(rawLine);
  LEFT_ARROW_RX.lastIndex = 0;
  RIGHT_ARROW_RX.lastIndex = 0;

  // For arrow rows like "RV90018 ◄ ü RV90017 | Small glass", codes on the right of the arrow are the opposite side,
  // while descriptive attribute columns on the right are kept for `attributes`.
  const arrowParts = hasArrow ? rawLine.split(/[◄◀◁◅►▶▷▻]/) : [rawLine];
  const lineForCodes = arrowParts[0] || '';
  const postArrowText = arrowParts.slice(1).join(' ');

  const { side } = extractFittingSide(rawLine);
  const cleanedForBrand = extractFittingSide(lineForCodes).textWithoutSide;
  const { brand: lineBrand, remainder: afterBrand } = extractLeadingOrInlineBrand(cleanedForBrand);
  const pipeNormalized = afterBrand
    .replace(/\s*\|\s*/g, ' | ')
    .replace(/(?:\|\s*)+/g, ' | ')
    .replace(/\s+/g, ' ')
    .trim();

  const { oemCode, crossRefs, residualText } = extractCodesForSingleRow(pipeNormalized, true);
  const { carModel, attributes: leftAttributes } = extractModelAndAttributes(residualText, Boolean(lineBrand));

  let rightAttributes = '';
  if (postArrowText.trim()) {
    const cleanedRight = extractFittingSide(postArrowText).textWithoutSide;
    const { residualText: rightResidual } = extractCodesForSingleRow(cleanedRight, true);
    rightAttributes = extractModelAndAttributes(rightResidual, false).attributes;
  }

  const attributes = mergeTextList(leftAttributes, rightAttributes);

  return {
    rawLine,
    isBrandHeader: false,
    singleHeaderBrand: '',
    isMultiSideSplit: false,
    side,
    lineBrand,
    oemCode,
    lineCross: crossRefs.join(', '),
    carModel,
    lineAttributes: attributes,
    hasModelDesc: Boolean(carModel),
  };
}

function isAftermarketOrShortCode(code: string): boolean {
  const clean = code.trim();
  if (!clean) return false;
  if (clean.includes(' ')) return true;
  return isShortCatalogCrossRef(clean) || isLongMarelliCatalogCode(clean);
}

function isOrphanComponentRow(row: CatalogItem, nextRow?: CatalogItem, prevRow?: CatalogItem): boolean {
  const hasBrandAndModel = Boolean(row.car_brand && row.car_model);
  const hasOem = Boolean(row.oem_code);
  const hasCross = Boolean(row.cross_reference);
  const hasSide = Boolean(row.fitting_side);

  // Rule 1: Missing brand/model without a full (oem + side) pair
  if (!hasBrandAndModel && !(hasOem && hasSide)) {
    return true;
  }

  // Rule 2: Only cross-reference / aftermarket code with neither main OEM nor fitting side
  if (!hasOem && hasCross && !hasSide) {
    return true;
  }

  // Rule 3: Short supplier code / Marelli code alone without cross_reference or fitting_side
  if (hasOem && !hasCross && !hasSide && isAftermarketOrShortCode(row.oem_code)) {
    return true;
  }

  // Rule 4: Single OEM code alone without cross_ref and side when an adjacent row of the same component needs an OEM
  if (hasOem && !hasCross && !hasSide) {
    const matchesNext =
      nextRow &&
      (!row.car_brand || nextRow.car_brand === row.car_brand) &&
      (!row.car_model || nextRow.car_model === row.car_model) &&
      !nextRow.oem_code;
    const matchesPrev =
      prevRow &&
      (!row.car_brand || prevRow.car_brand === row.car_brand) &&
      (!row.car_model || prevRow.car_model === row.car_model) &&
      !prevRow.oem_code;
    if (matchesNext || matchesPrev) {
      return true;
    }
  }

  return false;
}

function compactOrphanRows(rows: CatalogItem[]): CatalogItem[] {
  const working = rows.map((r) => ({ ...r }));
  const result: CatalogItem[] = [];

  for (let i = 0; i < working.length; i++) {
    const curr = working[i];
    const prev = result[result.length - 1];
    const next = i + 1 < working.length ? working[i + 1] : undefined;

    if (!isOrphanComponentRow(curr, next, prev)) {
      result.push(curr);
      continue;
    }

    const orphanCross =
      curr.cross_reference ||
      (curr.oem_code && isAftermarketOrShortCode(curr.oem_code) ? curr.oem_code : '');
    const orphanOem =
      curr.oem_code && !isAftermarketOrShortCode(curr.oem_code) ? curr.oem_code : '';

    // Try merging immediately with the NEXT row if it shares vehicle context
    if (
      next &&
      (!curr.car_brand || next.car_brand === curr.car_brand) &&
      (!curr.car_model || next.car_model === curr.car_model)
    ) {
      if (orphanCross && !next.cross_reference) {
        next.cross_reference = orphanCross;
        if (!next.fitting_side && curr.fitting_side) next.fitting_side = curr.fitting_side;
        if (curr.attributes) next.attributes = mergeTextList(curr.attributes, next.attributes);
        continue;
      }
      if (orphanOem && !next.oem_code) {
        next.oem_code = orphanOem;
        if (!next.fitting_side && curr.fitting_side) next.fitting_side = curr.fitting_side;
        if (curr.attributes) next.attributes = mergeTextList(curr.attributes, next.attributes);
        continue;
      }
    }

    // Try merging immediately into the PREVIOUS compacted row of the same vehicle
    if (
      prev &&
      (!curr.car_brand || prev.car_brand === curr.car_brand) &&
      (!curr.car_model || prev.car_model === curr.car_model)
    ) {
      if (orphanCross) {
        prev.cross_reference = mergeTextList(prev.cross_reference, orphanCross);
        if (!prev.fitting_side && curr.fitting_side) prev.fitting_side = curr.fitting_side;
        if (curr.attributes) prev.attributes = mergeTextList(prev.attributes, curr.attributes);
        continue;
      }
      if (orphanOem) {
        if (!prev.oem_code) {
          prev.oem_code = orphanOem;
        } else {
          prev.cross_reference = mergeTextList(prev.cross_reference, orphanOem);
        }
        if (!prev.fitting_side && curr.fitting_side) prev.fitting_side = curr.fitting_side;
        if (curr.attributes) prev.attributes = mergeTextList(prev.attributes, curr.attributes);
        continue;
      }
    }
  }

  return result;
}

export function parseCatalogLines(rawInput: string): {
  items: CatalogItem[];
  stats: ParsingStats;
} {
  const rawLines = rawInput
    .split(/\r?\n/)
    .map((raw) => stripNoiseAndDisclaimerSegments(raw))
    .filter((l) => Boolean(l))
    .map((l) => cleanGraphicAndGlitches(l))
    .filter((l) => !isNoiseLine(l));

  const parsedLines = rawLines.map(preParseLine);

  let currentBrand = '';
  let currentModel = '';
  let modelHeaderOem = '';
  let modelHeaderAttributes = '';
  let pending: PendingComponent | null = null;

  const emitted: CatalogItem[] = [];

  const emitComponent = (comp: PendingComponent | null) => {
    if (!comp) return;
    let finalOem = comp.oem_code;
    let finalCross = comp.cross_reference;

    // Pair with modelHeaderOem when component carries side or is the only part for that model
    if (!finalOem && modelHeaderOem && (comp.fitting_side || emitted.every((e) => e.car_model !== comp.car_model))) {
      finalOem = modelHeaderOem;
    } else if (!finalOem && finalCross && !finalCross.includes(' ') && comp.fitting_side) {
      finalOem = finalCross;
      finalCross = '';
    }

    if (!finalOem && !finalCross) return;

    const mergedAttributes = mergeTextList(modelHeaderAttributes, comp.attributes);

    // If this is a pure cross-reference fragment with no OEM and no side, merge into previous row of same vehicle
    if (!finalOem && finalCross && !comp.fitting_side && emitted.length > 0) {
      const last = emitted[emitted.length - 1];
      if (
        (!comp.car_brand || last.car_brand === comp.car_brand) &&
        (!comp.car_model || last.car_model === comp.car_model)
      ) {
        last.cross_reference = mergeTextList(last.cross_reference, finalCross);
        if (mergedAttributes) last.attributes = mergeTextList(last.attributes, mergedAttributes);
        return;
      }
    }

    emitted.push({
      id: `row_${emitted.length}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      car_brand: comp.car_brand,
      car_model: comp.car_model,
      oem_code: finalOem,
      cross_reference: finalCross,
      fitting_side: comp.fitting_side,
      attributes: mergedAttributes,
    });
  };

  const flushPending = () => {
    if (pending) {
      emitComponent(pending);
      pending = null;
    }
  };

  const isPendingComplete = (comp: PendingComponent) =>
    Boolean(comp.oem_code && comp.cross_reference && comp.fitting_side);

  // Checks whether the immediately upcoming component (before any header/side/next-OEM boundary) needs a cross_reference slot
  const upcomingComponentNeedsCrossRef = (startIndex: number): boolean => {
    let sawOem = false;
    let sawSide = false;
    for (let j = startIndex + 1; j < Math.min(parsedLines.length, startIndex + 4); j++) {
      const nxt = parsedLines[j];
      if (nxt.isBrandHeader || nxt.hasModelDesc || nxt.isMultiSideSplit) break;
      if (nxt.oemCode && sawOem) break;
      if (nxt.lineCross) return false;
      if (nxt.oemCode) sawOem = true;
      if (nxt.side) {
        sawSide = true;
        break;
      }
    }
    return sawOem || sawSide;
  };

  for (let i = 0; i < parsedLines.length; i++) {
    const info = parsedLines[i];

    // 1. Standalone brand or multi-brand index line
    if (info.isBrandHeader) {
      if (info.singleHeaderBrand) {
        flushPending();
        if (currentModel && modelHeaderOem && emitted.every((e) => e.car_model !== currentModel)) {
          emitComponent({
            car_brand: currentBrand,
            car_model: currentModel,
            oem_code: modelHeaderOem,
            cross_reference: '',
            fitting_side: '',
            attributes: '',
          });
        }
        currentBrand = info.singleHeaderBrand;
        currentModel = '';
        modelHeaderOem = '';
        modelHeaderAttributes = '';
      }
      continue;
    }

    // 2. Multi-side single line split (e.g. "1K1-941-005-G SX / 1K1-941-006-G DX")
    if (info.isMultiSideSplit) {
      flushPending();
      const segments = info.rawLine.split('/').map((s) => s.trim()).filter(Boolean);
      if (segments.length >= 2) {
        let localBrand = currentBrand;
        let localModel = currentModel;
        for (const seg of segments) {
          const { brand, remainder: afterBrand } = extractLeadingOrInlineBrand(seg);
          if (brand) localBrand = brand;
          const { side, textWithoutSide } = extractFittingSide(afterBrand);
          const { oemCode, crossRefs, residualText } = extractCodesForSingleRow(textWithoutSide, true);
          const { carModel, attributes } = extractModelAndAttributes(residualText, Boolean(brand));
          if (carModel) {
            localModel = carModel;
          }
          if (oemCode || crossRefs.length > 0) {
            emitComponent({
              car_brand: localBrand,
              car_model: localModel,
              oem_code: oemCode,
              cross_reference: crossRefs.join(', '),
              fitting_side: side,
              attributes,
            });
          }
        }
        currentBrand = localBrand;
        currentModel = localModel;
        modelHeaderOem = '';
        modelHeaderAttributes = '';
        continue;
      }
    }

    const { side, lineBrand, oemCode, lineCross, carModel, lineAttributes, hasModelDesc } = info;

    // Case A: Vehicle Model Header Line (no side, no cross-refs, optional single OEM)
    if (hasModelDesc && !side && !lineCross) {
      flushPending();
      if (currentModel && modelHeaderOem && emitted.every((e) => e.car_model !== currentModel)) {
        emitComponent({
          car_brand: currentBrand,
          car_model: currentModel,
          oem_code: modelHeaderOem,
          cross_reference: '',
          fitting_side: '',
          attributes: '',
        });
      }
      if (lineBrand) currentBrand = lineBrand;
      currentModel = carModel;
      modelHeaderOem = oemCode;
      modelHeaderAttributes = lineAttributes;
      continue;
    }

    // Case B: Complete Single-Line Row (Model + Codes/Side together on one line)
    if (hasModelDesc && (side || oemCode || lineCross)) {
      flushPending();
      if (lineBrand) currentBrand = lineBrand;
      currentModel = carModel;
      modelHeaderOem = '';
      modelHeaderAttributes = '';

      emitComponent({
        car_brand: currentBrand,
        car_model: currentModel,
        oem_code: oemCode,
        cross_reference: lineCross,
        fitting_side: side,
        attributes: lineAttributes,
      });
      continue;
    }

    // Case C: Component fragment or complete component line under currentBrand + currentModel
    const effectiveBrand = lineBrand || currentBrand;

    // Standalone part-attribute / note line with NO codes and NO fitting_side:
    // Never overwrite car_model and never create a row; attach cleanly to pending or last component!
    if (!oemCode && !lineCross && !side && lineAttributes) {
      if (pending !== null) {
        pending.attributes = mergeTextList(pending.attributes, lineAttributes);
      } else if (emitted.length > 0) {
        const last = emitted[emitted.length - 1];
        if (
          (!effectiveBrand || last.car_brand === effectiveBrand) &&
          (!currentModel || last.car_model === currentModel)
        ) {
          last.attributes = mergeTextList(last.attributes, lineAttributes);
        }
      }
      continue;
    }

    // Fill empty slots of active `pending` component
    if (
      pending !== null &&
      pending.car_brand === effectiveBrand &&
      pending.car_model === currentModel
    ) {
      const canMergeOem = !oemCode || !pending.oem_code;
      const canMergeCross = !lineCross || !pending.cross_reference;
      const canMergeSide = !side || !pending.fitting_side;

      if (canMergeOem && canMergeCross && canMergeSide && (oemCode || lineCross || side)) {
        pending = {
          car_brand: pending.car_brand,
          car_model: pending.car_model,
          oem_code: pending.oem_code || oemCode,
          cross_reference: pending.cross_reference || lineCross,
          fitting_side: pending.fitting_side || side,
          attributes: mergeTextList(pending.attributes, lineAttributes),
        };
        if (isPendingComplete(pending)) {
          flushPending();
        }
        continue;
      }
    }

    // Cannot merge into `pending` -> flush previous component
    flushPending();

    // Standalone cross-ref / aftermarket code with no OEM and no side:
    if (!oemCode && !side && lineCross) {
      if (effectiveBrand && currentModel && upcomingComponentNeedsCrossRef(i)) {
        pending = {
          car_brand: effectiveBrand,
          car_model: currentModel,
          oem_code: '',
          cross_reference: lineCross,
          fitting_side: '',
          attributes: lineAttributes,
        };
      } else if (emitted.length > 0) {
        const last = emitted[emitted.length - 1];
        if (
          (!effectiveBrand || last.car_brand === effectiveBrand) &&
          (!currentModel || last.car_model === currentModel)
        ) {
          last.cross_reference = mergeTextList(last.cross_reference, lineCross);
          if (lineAttributes) {
            last.attributes = mergeTextList(last.attributes, lineAttributes);
          }
        }
      }
      continue;
    }

    if (oemCode || lineCross || side) {
      pending = {
        car_brand: effectiveBrand,
        car_model: currentModel,
        oem_code: oemCode,
        cross_reference: lineCross,
        fitting_side: side,
        attributes: lineAttributes,
      };

      if (isPendingComplete(pending)) {
        flushPending();
      }
    }
  }

  flushPending();

  if (currentModel && modelHeaderOem && emitted.every((e) => e.car_model !== currentModel)) {
    emitComponent({
      car_brand: currentBrand,
      car_model: currentModel,
      oem_code: modelHeaderOem,
      cross_reference: '',
      fitting_side: '',
      attributes: '',
    });
  }

  const compacted = compactOrphanRows(emitted);
  return deduplicateItems(compacted, rawLines.length);
}

export function deduplicateItems(
  items: CatalogItem[],
  totalRawLines: number
): { items: CatalogItem[]; stats: ParsingStats } {
  const seen = new Map<string, CatalogItem>();
  let duplicatesRemoved = 0;

  for (const item of items) {
    const key = [
      item.car_brand.trim().toUpperCase(),
      item.car_model.trim().toUpperCase(),
      cleanOemCode(item.oem_code),
      cleanOemCode(item.cross_reference),
      item.fitting_side,
    ].join('|');

    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, item);
    } else {
      if (item.attributes) {
        existing.attributes = mergeTextList(existing.attributes, item.attributes);
      }
      duplicatesRemoved += 1;
    }
  }

  const unique = Array.from(seen.values());
  return {
    items: unique,
    stats: {
      totalRawLines,
      uniqueRows: unique.length,
      duplicatesRemoved,
    },
  };
}

function escapeCsvField(value: string, delimiter: CsvDelimiter): string {
  const str = (value ?? '').toString().replace(/\r?\n/g, ' ').trim();
  if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateSupabaseCsv(items: CatalogItem[], delimiter: CsvDelimiter = ','): string {
  const headers = [
    'car_brand',
    'car_model',
    'oem_code',
    'cross_reference',
    'fitting_side',
    'attributes',
  ];

  const rows = items.map((item) =>
    [
      item.car_brand,
      item.car_model,
      cleanOemCode(item.oem_code),
      item.cross_reference,
      item.fitting_side,
      item.attributes,
    ]
      .map((field) => escapeCsvField(field, delimiter))
      .join(delimiter)
  );

  return [headers.join(delimiter), ...rows].join('\n');
}

export const SAMPLE_CATALOG_TEXT = `VW Alfa Romeo AUDI
Alfa Romeo 147 (937_) (2001à2010)
182203000400 | RV30004 | ◄ | With antenna
182203000500
RV30005
►
Blinker 16W
714021190701 | OEM 46812345 | IZQUIERDO ü | RHD
714021190801 | OEM 46812346 | DERECHO ü | With lane change
Audi A4 Avant (8E5, B6)
8E0-857-507-A | AU90105 | ◄ | Cover with comfort
BMW Serie 3 (E90)
182209001800 | RV90018 ◄ ü RV90017 | Small glass
182209001800 | RV90017 ► ü RV90018`;
