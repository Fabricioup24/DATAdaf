import type maplibregl from 'maplibre-gl';

export type PrecisionCoord = 'ALTA' | 'MEDIA' | 'APROXIMADA' | 'REVISAR';
export type UrbanRuralClassification = 'urbano' | 'rural';
export type UrbanSubclass = 'urbano_central' | 'urbano_periferico';
export type FixedPartyKey =
  | 'juntos_por_el_peru'
  | 'fuerza_popular'
  | 'partido_del_buen_gobierno'
  | 'renovacion_popular'
  | 'partido_civico_obras'
  | 'ahora_nacion'
  | 'partido_pais_para_todos';

export interface FixedPartyResult {
  key: FixedPartyKey;
  label: string;
  votes: number;
  share: number;
}

export interface PartyResult {
  key: string;
  label: string;
  votes: number;
  share: number;
}

export interface VoteExtras {
  blancoVotes: number;
  blancoShare: number;
  nuloVotes: number;
  nuloShare: number;
}

export interface VoteSummary {
  parties: FixedPartyResult[];
  allParties: PartyResult[];
  rankedParties: FixedPartyResult[];
  otrosVotes: number;
  otrosShare: number;
  extras: VoteExtras;
  eligibleVoters: number;
  validVotes: number;
  emittedVotes: number;
  abstentionVotes: number;
  abstentionShare: number;
  countedMesas: number;
  pendingMesas: number;
  topParty: FixedPartyResult | null;
  secondParty: FixedPartyResult | null;
  marginVotes: number;
  marginShare: number;
}

export interface VotingMesa {
  numeroMesa: string;
  estadoActa?: string;
  electoresHabiles?: string;
  votosEmitidos?: string;
  participacionPct?: string;
  results: VoteSummary;
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
  clasificacionOficialUrbanoRural: UrbanRuralClassification | '';
  subclasificacionUrbanaOficial: UrbanSubclass | '';
  results: VoteSummary;
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
