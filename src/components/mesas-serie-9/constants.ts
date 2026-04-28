import type maplibregl from 'maplibre-gl';
import type { BasemapMode, PointFeatureCollection, PrecisionCoord } from './types';

export const SOURCE_ID = 'serie9-locales-source';
export const LAYER_ID = 'serie9-locales-layer';
export const OUTLINE_LAYER_ID = 'serie9-locales-outline-layer';
export const SELECTED_SOURCE_ID = 'serie9-local-seleccionado-source';
export const SELECTED_HALO_LAYER_ID = 'serie9-local-seleccionado-halo-layer';

export const PRECISION_OPTIONS: PrecisionCoord[] = ['ALTA', 'MEDIA', 'APROXIMADA', 'REVISAR'];

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

export const TOOLTIP_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 22 22" aria-hidden="true" focusable="false">
    <title>tooltip-start-alert</title>
    <path fill="currentColor" d="M8 15h2v-2H8zm0-3h2V7H8zM1 2v18h1v1h14v-1h1v-5h1v-1h1v-1h1v-1h1v-2h-1V9h-1V8h-1V7h-1V2h-1V1H2v1zm2 1h12v5h1v1h1v1h1v2h-1v1h-1v1h-1v5H3z"/>
  </svg>
`;

export const getBasemapStyle = (
  mode: BasemapMode,
): string | maplibregl.StyleSpecification => (mode === 'satelite' ? SATELLITE_STYLE : CROQUIS_STYLE);
