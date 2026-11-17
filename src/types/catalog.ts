export type FittingSide = 'SX' | 'DX' | 'Bilaterale' | '';

export interface CatalogItem {
  id: string;
  car_brand: string;
  car_model: string;
  oem_code: string;
  cross_reference: string;
  fitting_side: FittingSide;
  attributes: string;
}

export interface ParsingStats {
  totalRawLines: number;
  uniqueRows: number;
  duplicatesRemoved: number;
}

export type CsvDelimiter = ',' | ';';
