import type maplibregl from 'maplibre-gl';
import type {
  BasemapMode,
  FixedPartyKey,
  PointFeatureCollection,
  PrecisionCoord,
} from './types';

export const SOURCE_ID = 'serie9-locales-source';
export const LAYER_ID = 'serie9-locales-layer';
export const OUTLINE_LAYER_ID = 'serie9-locales-outline-layer';
export const SELECTED_SOURCE_ID = 'serie9-local-seleccionado-source';
export const SELECTED_HALO_LAYER_ID = 'serie9-local-seleccionado-halo-layer';

export const PRECISION_OPTIONS: PrecisionCoord[] = ['ALTA', 'MEDIA', 'APROXIMADA', 'REVISAR'];

export const FIXED_PARTIES: Array<{
  key: FixedPartyKey;
  label: string;
  column: string;
  color: string;
}> = [
  {
    key: 'juntos_por_el_peru',
    label: 'Juntos por el Peru',
    column: 'presidencial_juntos_por_el_peru',
    color: '#2563eb',
  },
  {
    key: 'fuerza_popular',
    label: 'Fuerza Popular',
    column: 'presidencial_fuerza_popular',
    color: '#f97316',
  },
  {
    key: 'partido_del_buen_gobierno',
    label: 'Buen Gobierno',
    column: 'presidencial_partido_del_buen_gobierno',
    color: '#16a34a',
  },
  {
    key: 'renovacion_popular',
    label: 'Renovacion Popular',
    column: 'presidencial_renovacion_popular',
    color: '#7c3aed',
  },
  {
    key: 'partido_civico_obras',
    label: 'Partido Civico Obras',
    column: 'presidencial_partido_civico_obras',
    color: '#b45309',
  },
  {
    key: 'ahora_nacion',
    label: 'Ahora Nacion',
    column: 'presidencial_ahora_nacion_an',
    color: '#db2777',
  },
  {
    key: 'partido_pais_para_todos',
    label: 'Pais para Todos',
    column: 'presidencial_partido_pais_para_todos',
    color: '#0f766e',
  },
];

export const FIXED_PARTY_COLOR_MAP: Record<FixedPartyKey, string> = FIXED_PARTIES.reduce(
  (accumulator, party) => {
    accumulator[party.key] = party.color;
    return accumulator;
  },
  {} as Record<FixedPartyKey, string>,
);

export const PRESIDENTIAL_BLANCO_COLUMN = 'presidencial_votos_blanco';
export const PRESIDENTIAL_NULO_COLUMN = 'presidencial_votos_nulos';
export const PRESIDENTIAL_IMPUGNADO_COLUMN = 'presidencial_votos_impugnados';

export const CROQUIS_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

export const SATELLITE_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'raster-tiles': {
      type: 'raster',
      tiles: [
        'https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        'https://mt2.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        'https://mt3.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      ],
      tileSize: 256,
    },
  },
  layers: [
    {
      id: 'raster-layer',
      type: 'raster',
      source: 'raster-tiles',
    },
  ],
};

export const PRECISION_META: Record<PrecisionCoord, { label: string; color: string }> = {
  ALTA: { label: 'Alta', color: '#0f9f6e' },
  MEDIA: { label: 'Media', color: '#2563eb' },
  APROXIMADA: { label: 'Aprox.', color: '#f59e0b' },
  REVISAR: { label: 'Revisar', color: '#dc2626' },
};

export const EMPTY_FEATURE_COLLECTION: PointFeatureCollection = {
  type: 'FeatureCollection',
  features: [],
};

export const getBasemapStyle = (
  mode: BasemapMode,
): string | maplibregl.StyleSpecification => (mode === 'satelite' ? SATELLITE_STYLE : CROQUIS_STYLE);
