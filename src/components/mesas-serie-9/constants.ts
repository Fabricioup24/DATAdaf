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

export const getBasemapStyle = (
  mode: BasemapMode,
): string | maplibregl.StyleSpecification => (mode === 'satelite' ? SATELLITE_STYLE : CROQUIS_STYLE);
