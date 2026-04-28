import type maplibregl from 'maplibre-gl';

export type PrecisionCoord = 'ALTA' | 'MEDIA' | 'APROXIMADA' | 'REVISAR';

export interface VotingMesa {
  numeroMesa: string;
  estadoActa?: string;
  electoresHabiles?: string;
  votosEmitidos?: string;
  participacionPct?: string;
}

export interface VotingLocal {
  id: string;
  numeroLocal: string;
  nombreLocal: string;
  region: string;
  provincia: string;
  distrito: string;
  centroPoblado: string;
  direccion: string;
  coordinates: [number, number];
  precisionCoord: PrecisionCoord;
  confianzaSigmed: string;
  sigmedFuente: string;
  sigmedNombre: string;
  scoreCoord: string;
  requiereRevision: boolean;
  mesas: VotingMesa[];
}

export interface MapStats {
  totalRows: number;
  plottedRows: number;
  localCount: number;
  missingRows: number;
}

export interface MapContainerProps {
  dataUrl?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  height?: string;
  maxBounds?: [[number, number], [number, number]];
}

export type CsvRow = Record<string, string>;
export type BasemapMode = 'croquis' | 'satelite';

export type LenisController = {
  start?: () => void;
  stop?: () => void;
};

export type PointFeatureCollection = GeoJSON.FeatureCollection<GeoJSON.Point>;
export type GeoJsonSourceLike = maplibregl.GeoJSONSource | undefined;

declare global {
  interface Window {
    lenis?: LenisController;
  }
}
