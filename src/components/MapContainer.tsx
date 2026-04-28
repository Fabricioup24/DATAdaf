import React, { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

type PrecisionCoord = 'ALTA' | 'MEDIA' | 'APROXIMADA' | 'REVISAR';

interface VotingMesa {
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

interface MapStats {
  totalRows: number;
  plottedRows: number;
  localCount: number;
  missingRows: number;
}

interface MapContainerProps {
  /** Public CSV path served from /public. */
  dataUrl?: string;
  /** Initial map center [longitude, latitude]. */
  initialCenter?: [number, number];
  /** Initial zoom level. */
  initialZoom?: number;
  /** Height of the map container. */
  height?: string;
  /** Optional max bounds to constrain the visible area. */
  maxBounds?: [[number, number], [number, number]];
}

type LenisController = {
  start?: () => void;
  stop?: () => void;
};

declare global {
  interface Window {
    lenis?: LenisController;
  }
}

type CsvRow = Record<string, string>;
type BasemapMode = 'croquis' | 'satelite';

const SOURCE_ID = 'serie9-locales-source';
const LAYER_ID = 'serie9-locales-layer';
const OUTLINE_LAYER_ID = 'serie9-locales-outline-layer';
const SELECTED_SOURCE_ID = 'serie9-local-seleccionado-source';
const SELECTED_HALO_LAYER_ID = 'serie9-local-seleccionado-halo-layer';
const PRECISION_OPTIONS: PrecisionCoord[] = ['ALTA', 'MEDIA', 'APROXIMADA', 'REVISAR'];
const CROQUIS_STYLE = 'https://tiles.openfreemap.org/styles/liberty';
const SATELLITE_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    satellite: {
      type: 'raster',
      tiles: [
        'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/g/{z}/{y}/{x}.jpg',
      ],
      tileSize: 256,
      attribution:
        'Sentinel-2 cloudless by EOX IT Services GmbH (Contains modified Copernicus Sentinel data)',
    },
  },
  layers: [
    {
      id: 'satellite',
      type: 'raster',
      source: 'satellite',
      paint: {
        'raster-saturation': 0.05,
        'raster-contrast': 0.18,
        'raster-brightness-min': 0,
        'raster-brightness-max': 0.98,
      },
    },
  ],
};

const PRECISION_META: Record<PrecisionCoord, { label: string; color: string }> = {
  ALTA: { label: 'Alta', color: '#0f9f6e' },
  MEDIA: { label: 'Media', color: '#2563eb' },
  APROXIMADA: { label: 'Aprox.', color: '#f59e0b' },
  REVISAR: { label: 'Revisar', color: '#dc2626' },
};

const EMPTY_FEATURE_COLLECTION: GeoJSON.FeatureCollection<GeoJSON.Point> = {
  type: 'FeatureCollection',
  features: [],
};

const createSelectedFeatureCollection = (
  local: VotingLocal | null,
): GeoJSON.FeatureCollection<GeoJSON.Point> => ({
  type: 'FeatureCollection',
  features: local
    ? [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: local.coordinates,
          },
          properties: {
            id: local.id,
            mesaCount: local.mesas.length,
            precisionCoord: local.precisionCoord,
          },
        },
      ]
    : [],
});

const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentValue += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (char === ',' && !insideQuotes) {
      currentRow.push(currentValue);
      currentValue = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        index += 1;
      }

      currentRow.push(currentValue);
      if (currentRow.some((value) => value.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentValue = '';
      continue;
    }

    currentValue += char;
  }

  currentRow.push(currentValue);
  if (currentRow.some((value) => value.length > 0)) {
    rows.push(currentRow);
  }

  return rows;
};

const parseCsvObjects = (text: string): CsvRow[] => {
  const rows = parseCsv(text);
  const [rawHeaders, ...dataRows] = rows;

  if (!rawHeaders) return [];

  const headers = rawHeaders.map((header, index) =>
    index === 0 ? header.replace(/^\uFEFF/, '').trim() : header.trim(),
  );

  return dataRows.map((row) =>
    headers.reduce<CsvRow>((accumulator, header, index) => {
      accumulator[header] = row[index]?.trim() ?? '';
      return accumulator;
    }, {}),
  );
};

const toNumber = (value: string): number | null => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toPrecisionCoord = (value: string): PrecisionCoord | null => {
  if (PRECISION_OPTIONS.includes(value as PrecisionCoord)) {
    return value as PrecisionCoord;
  }
  return null;
};

const buildLocalId = (row: CsvRow): string => {
  const parts = [
    row.numero_local,
    row.region,
    row.provincia,
    row.distrito,
    row.lat,
    row.lng,
  ];

  return parts.join('|');
};

const aggregateRows = (rows: CsvRow[]): { locals: VotingLocal[]; stats: MapStats } => {
  const localsById = new Map<string, VotingLocal>();
  let plottedRows = 0;
  let missingRows = 0;

  rows.forEach((row) => {
    const lat = toNumber(row.lat);
    const lng = toNumber(row.lng);
    const precisionCoord = toPrecisionCoord(row.precision_coord);

    if (lat === null || lng === null || precisionCoord === null) {
      missingRows += 1;
      return;
    }

    plottedRows += 1;
    const id = buildLocalId(row);
    const currentLocal = localsById.get(id);
    const mesa: VotingMesa = {
      numeroMesa: row.numero_mesa,
      estadoActa: row.presidencial_estado_acta,
      electoresHabiles: row.presidencial_electores_habiles,
      votosEmitidos: row.presidencial_votos_emitidos,
      participacionPct: row.presidencial_participacion_pct,
    };

    if (currentLocal) {
      currentLocal.mesas.push(mesa);
      return;
    }

    localsById.set(id, {
      id,
      numeroLocal: row.numero_local,
      nombreLocal: row.nombre_local || row.presidencial_local_web || row.sigmed_nombre,
      region: row.region,
      provincia: row.provincia,
      distrito: row.distrito,
      centroPoblado:
        row.presidencial_centro_poblado ||
        row.diputados_centro_poblado ||
        row.sigmed_centro_poblado,
      direccion: row.direccion_pdf || row.sigmed_direccion || row.descriptor_local_pdf,
      coordinates: [lng, lat],
      precisionCoord,
      confianzaSigmed: row.confianza_sigmed,
      sigmedFuente: row.sigmed_fuente,
      sigmedNombre: row.sigmed_nombre,
      scoreCoord: row.score_coord,
      requiereRevision: row.requiere_revision_coord === 'True',
      mesas: [mesa],
    });
  });

  const locals = Array.from(localsById.values()).map((local) => ({
    ...local,
    mesas: local.mesas.sort((first, second) =>
      first.numeroMesa.localeCompare(second.numeroMesa, 'es', { numeric: true }),
    ),
  }));

  return {
    locals,
    stats: {
      totalRows: rows.length,
      plottedRows,
      localCount: locals.length,
      missingRows,
    },
  };
};

const formatNumber = (value: number): string => new Intl.NumberFormat('es-PE').format(value);

const TOOLTIP_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 22 22" aria-hidden="true" focusable="false">
    <title>tooltip-start-alert</title>
    <path fill="currentColor" d="M8 15h2v-2H8zm0-3h2V7H8zM1 2v18h1v1h14v-1h1v-5h1v-1h1v-1h1v-1h1v-2h-1V9h-1V8h-1V7h-1V2h-1V1H2v1zm2 1h12v5h1v1h1v1h1v2h-1v1h-1v1h-1v5H3z"/>
  </svg>
`;

const createPopupContent = (local: VotingLocal): HTMLElement => {
  const root = document.createElement('div');
  root.className = 'serie9-popup';

  const precision = PRECISION_META[local.precisionCoord];
  const header = document.createElement('div');
  header.className = 'serie9-popup__header';

  const title = document.createElement('h3');
  title.textContent = local.nombreLocal || `Local ${local.numeroLocal}`;
  header.appendChild(title);

  const badge = document.createElement('span');
  badge.className = 'serie9-popup__badge';
  badge.style.backgroundColor = precision.color;
  badge.textContent = precision.label;
  header.appendChild(badge);
  root.appendChild(header);

  const location = document.createElement('p');
  location.className = 'serie9-popup__location';
  location.textContent = [
    local.centroPoblado,
    local.distrito,
    local.provincia,
    local.region,
  ].filter(Boolean).join(' · ');
  root.appendChild(location);

  const meta = document.createElement('dl');
  meta.className = 'serie9-popup__meta';

  [
    ['Local', local.numeroLocal],
    ['Mesas', String(local.mesas.length)],
    ['Dirección', local.direccion],
    ['Fuente', local.sigmedFuente || local.confianzaSigmed],
    ['Score', local.scoreCoord],
  ].forEach(([label, value]) => {
    if (!value) return;
    const item = document.createElement('div');
    const term = document.createElement('dt');
    const description = document.createElement('dd');
    term.textContent = label;
    description.textContent = value;
    item.append(term, description);
    meta.appendChild(item);
  });

  root.appendChild(meta);

  const tableTitle = document.createElement('p');
  tableTitle.className = 'serie9-popup__section-title';
  tableTitle.textContent = 'Mesas asociadas';
  root.appendChild(tableTitle);

  const list = document.createElement('div');
  list.className = 'serie9-popup__mesas';
  local.mesas.slice(0, 24).forEach((mesa) => {
    const item = document.createElement('span');
    item.textContent = mesa.numeroMesa;
    list.appendChild(item);
  });
  root.appendChild(list);

  if (local.mesas.length > 24) {
    const remaining = document.createElement('p');
    remaining.className = 'serie9-popup__remaining';
    remaining.textContent = `+ ${local.mesas.length - 24} mesas adicionales`;
    root.appendChild(remaining);
  }

  const tooltip = document.createElement('div');
  tooltip.className = 'serie9-popup__tooltip';

  const tooltipHeader = document.createElement('div');
  tooltipHeader.className = 'serie9-popup__tooltip-header';

  const tooltipIcon = document.createElement('span');
  tooltipIcon.className = 'serie9-popup__tooltip-icon';
  tooltipIcon.innerHTML = TOOLTIP_ICON;
  tooltipHeader.appendChild(tooltipIcon);

  const tooltipTitle = document.createElement('strong');
  tooltipTitle.textContent = 'Como leer este punto';
  tooltipHeader.appendChild(tooltipTitle);
  tooltip.appendChild(tooltipHeader);

  const tooltipBody = document.createElement('div');
  tooltipBody.className = 'serie9-popup__tooltip-body';
  tooltipBody.innerHTML = `
    <p><strong>Score</strong>: resume la fuerza de la coincidencia en SIGMED. Un valor mas alto suele indicar mejor consistencia entre codigo, nombre, centro poblado y fuente GPS. En otros terminos, es como si el sistema dijera: "este local si se parece bastante al que buscamos".</p>
    <p><strong>ALTA</strong>: local compatible por codigo o nombre y contexto geografico. <strong>MEDIA</strong>: buena coincidencia con diferencias menores. <strong>APROXIMADA</strong>: punto util de la zona, no necesariamente del local exacto. <strong>REVISAR</strong>: requiere verificacion manual.</p>
  `;
  tooltip.appendChild(tooltipBody);
  root.appendChild(tooltip);

  return root;
};

const buildFeatureCollection = (
  locals: VotingLocal[],
  selectedPrecisions: Set<PrecisionCoord>,
): GeoJSON.FeatureCollection<GeoJSON.Point> => ({
  type: 'FeatureCollection',
  features: locals
    .filter((local) => selectedPrecisions.has(local.precisionCoord))
    .map((local) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: local.coordinates,
      },
      properties: {
        id: local.id,
        precisionCoord: local.precisionCoord,
        mesaCount: local.mesas.length,
        nombreLocal: local.nombreLocal,
      },
    })),
});

const getBasemapStyle = (mode: BasemapMode): string | maplibregl.StyleSpecification =>
  mode === 'satelite' ? SATELLITE_STYLE : CROQUIS_STYLE;

const MapContainer = ({
  dataUrl = '/pdfs/01_base_4703_mesas_serie9_con_coordenadas.csv',
  initialCenter = [-75.0152, -9.19],
  initialZoom = 5,
  height = '860px',
  maxBounds = [
    [-92.0, -24.5],
    [-58.0, 8.5],
  ],
}: MapContainerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const activePopup = useRef<maplibregl.Popup | null>(null);
  const localsById = useRef<Map<string, VotingLocal>>(new Map());
  const featureCollectionRef = useRef<GeoJSON.FeatureCollection<GeoJSON.Point>>(EMPTY_FEATURE_COLLECTION);
  const selectedLocalRef = useRef<VotingLocal | null>(null);
  const pulseFrameRef = useRef<number | null>(null);
  const lenisResumeTimeout = useRef<number | null>(null);
  const hasAppliedInitialView = useRef(false);
  const [locals, setLocals] = useState<VotingLocal[]>([]);
  const [stats, setStats] = useState<MapStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  const [basemapMode, setBasemapMode] = useState<BasemapMode>('croquis');
  const [selectedPrecisions, setSelectedPrecisions] = useState<Set<PrecisionCoord>>(
    () => new Set(PRECISION_OPTIONS),
  );

  const featureCollection = useMemo(
    () => buildFeatureCollection(locals, selectedPrecisions),
    [locals, selectedPrecisions],
  );

  const visibleMesaCount = useMemo(
    () =>
      locals
        .filter((local) => selectedPrecisions.has(local.precisionCoord))
        .reduce((total, local) => total + local.mesas.length, 0),
    [locals, selectedPrecisions],
  );

  useEffect(() => {
    featureCollectionRef.current = featureCollection;
  }, [featureCollection]);

  useEffect(() => {
    let isCancelled = false;

    const loadCsv = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(dataUrl);
        if (!response.ok) {
          throw new Error(`No se pudo cargar el CSV (${response.status})`);
        }

        const text = await response.text();
        const rows = parseCsvObjects(text);
        const aggregated = aggregateRows(rows);

        if (isCancelled) return;

        localsById.current = new Map(
          aggregated.locals.map((local) => [local.id, local] as const),
        );
        setLocals(aggregated.locals);
        setStats(aggregated.stats);
      } catch (loadError) {
        if (isCancelled) return;
        setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el mapa');
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadCsv();

    return () => {
      isCancelled = true;
    };
  }, [dataUrl]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const stopSelectionPulse = () => {
      if (pulseFrameRef.current !== null) {
        window.cancelAnimationFrame(pulseFrameRef.current);
        pulseFrameRef.current = null;
      }
    };

    const syncSelectedSource = (mapInstance: maplibregl.Map, local: VotingLocal | null) => {
      const selectedSource = mapInstance.getSource(SELECTED_SOURCE_ID) as
        | maplibregl.GeoJSONSource
        | undefined;

      if (selectedSource) {
        selectedSource.setData(createSelectedFeatureCollection(local));
      }
    };

    const startSelectionPulse = (mapInstance: maplibregl.Map) => {
      stopSelectionPulse();

      const animatePulse = (timestamp: number) => {
        if (!mapInstance.getLayer(SELECTED_HALO_LAYER_ID) || !selectedLocalRef.current) {
          pulseFrameRef.current = null;
          return;
        }

        const wave = (Math.sin(timestamp / 260) + 1) / 2;
        const haloRadius = 15 + wave * 9;
        const haloOpacity = 0.18 + wave * 0.26;

        mapInstance.setPaintProperty(SELECTED_HALO_LAYER_ID, 'circle-radius', haloRadius);
        mapInstance.setPaintProperty(
          SELECTED_HALO_LAYER_ID,
          'circle-stroke-opacity',
          haloOpacity,
        );
        pulseFrameRef.current = window.requestAnimationFrame(animatePulse);
      };

      pulseFrameRef.current = window.requestAnimationFrame(animatePulse);
    };

    const setSelectedLocal = (mapInstance: maplibregl.Map, local: VotingLocal | null) => {
      selectedLocalRef.current = local;
      syncSelectedSource(mapInstance, local);

      if (local) {
        startSelectionPulse(mapInstance);
      } else {
        stopSelectionPulse();
      }
    };

    const ensureDataLayers = (mapInstance: maplibregl.Map) => {
      const source = mapInstance.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;

      if (!source) {
        mapInstance.addSource(SOURCE_ID, {
          type: 'geojson',
          data: featureCollectionRef.current,
        });
      } else {
        source.setData(featureCollectionRef.current);
      }

      if (!mapInstance.getLayer(LAYER_ID)) {
        mapInstance.addLayer({
          id: LAYER_ID,
          type: 'circle',
          source: SOURCE_ID,
          paint: {
            'circle-color': [
              'match',
              ['get', 'precisionCoord'],
              'ALTA',
              PRECISION_META.ALTA.color,
              'MEDIA',
              PRECISION_META.MEDIA.color,
              'APROXIMADA',
              PRECISION_META.APROXIMADA.color,
              'REVISAR',
              PRECISION_META.REVISAR.color,
              '#64748b',
            ],
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'mesaCount'],
              1,
              5,
              5,
              7,
              12,
              10,
              20,
              13,
            ],
            'circle-opacity': 0.82,
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 1.4,
          },
        });
      }

      if (!mapInstance.getLayer(OUTLINE_LAYER_ID)) {
        mapInstance.addLayer({
          id: OUTLINE_LAYER_ID,
          type: 'circle',
          source: SOURCE_ID,
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'mesaCount'],
              1,
              7,
              5,
              9,
              12,
              12,
              20,
              15,
            ],
            'circle-color': 'rgba(255, 255, 255, 0)',
            'circle-stroke-color': '#121212',
            'circle-stroke-opacity': 0.14,
            'circle-stroke-width': 1,
          },
        });
      }

      const selectedSource = mapInstance.getSource(SELECTED_SOURCE_ID) as
        | maplibregl.GeoJSONSource
        | undefined;

      if (!selectedSource) {
        mapInstance.addSource(SELECTED_SOURCE_ID, {
          type: 'geojson',
          data: createSelectedFeatureCollection(selectedLocalRef.current),
        });
      } else {
        selectedSource.setData(createSelectedFeatureCollection(selectedLocalRef.current));
      }

      if (!mapInstance.getLayer(SELECTED_HALO_LAYER_ID)) {
        mapInstance.addLayer({
          id: SELECTED_HALO_LAYER_ID,
          type: 'circle',
          source: SELECTED_SOURCE_ID,
          paint: {
            'circle-radius': 18,
            'circle-color': 'rgba(255, 255, 255, 0)',
            'circle-opacity': 0,
            'circle-stroke-color': '#2563eb',
            'circle-stroke-opacity': 0.32,
            'circle-stroke-width': 2.2,
          },
        }, LAYER_ID);
      }

      if (selectedLocalRef.current) {
        startSelectionPulse(mapInstance);
      }
    };

    const handleMouseEnter = () => {
      mapInstance.getCanvas().style.cursor = 'pointer';
    };

    const handleMouseLeave = () => {
      mapInstance.getCanvas().style.cursor = '';
    };

    const openLocalPopup = (mapInstance: maplibregl.Map, local: VotingLocal) => {
      activePopup.current?.remove();
      setSelectedLocal(mapInstance, local);

      const popup = new maplibregl.Popup({
        closeButton: true,
        maxWidth: '360px',
        offset: 18,
      })
        .setLngLat(local.coordinates)
        .setDOMContent(createPopupContent(local))
        .addTo(mapInstance);

      popup.on('close', () => {
        activePopup.current = null;
        setSelectedLocal(mapInstance, null);
      });

      activePopup.current = popup;
    };

    const handlePointClick = (event: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
      const feature = event.features?.[0];
      const localId = feature?.properties?.id;
      const local = typeof localId === 'string' ? localsById.current.get(localId) : null;

      if (!local) return;

      openLocalPopup(mapInstance, local);
    };

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: getBasemapStyle('croquis'),
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: true,
      minZoom: 2.2,
      maxBounds,
    });

    map.current = mapInstance;
    mapInstance.scrollZoom.setWheelZoomRate(1 / 300);
    mapInstance.scrollZoom.setZoomRate(1 / 80);
    mapInstance.addControl(new maplibregl.NavigationControl(), 'top-right');

    const bindPointInteractions = () => {
      mapInstance.off('mouseenter', LAYER_ID, handleMouseEnter);
      mapInstance.off('mouseleave', LAYER_ID, handleMouseLeave);
      mapInstance.off('click', LAYER_ID, handlePointClick);
      mapInstance.on('mouseenter', LAYER_ID, handleMouseEnter);
      mapInstance.on('mouseleave', LAYER_ID, handleMouseLeave);
      mapInstance.on('click', LAYER_ID, handlePointClick);
    };

    const handleStyleReady = () => {
      ensureDataLayers(mapInstance);
      bindPointInteractions();

      if (!hasAppliedInitialView.current) {
        const isCompactViewport = window.matchMedia('(max-width: 720px)').matches;
        mapInstance.fitBounds(
          [
            [-84.75, -21.5],
            [-65.5, 2.4],
          ],
          {
            padding: isCompactViewport
              ? {
                  top: 24,
                  right: 14,
                  bottom: 34,
                  left: 14,
                }
              : {
                  top: 40,
                  right: 28,
                  bottom: 52,
                  left: 28,
                },
            duration: 0,
            maxZoom: isCompactViewport ? 5.15 : 5.2,
          },
        );
        hasAppliedInitialView.current = true;
      }

      setIsMapReady(true);
    };

    mapInstance.on('load', handleStyleReady);
    mapInstance.on('style.load', handleStyleReady);

    return () => {
      mapInstance.off('load', handleStyleReady);
      mapInstance.off('style.load', handleStyleReady);
      mapInstance.off('mouseenter', LAYER_ID, handleMouseEnter);
      mapInstance.off('mouseleave', LAYER_ID, handleMouseLeave);
      mapInstance.off('click', LAYER_ID, handlePointClick);
      mapInstance.remove();
      stopSelectionPulse();
      map.current = null;
    };
  }, [initialCenter, initialZoom]);

  useEffect(() => {
    const container = mapContainer.current;
    if (!container || typeof window === 'undefined') return;

    const clearLenisResumeTimeout = () => {
      if (lenisResumeTimeout.current !== null) {
        window.clearTimeout(lenisResumeTimeout.current);
        lenisResumeTimeout.current = null;
      }
    };

    const pauseLenis = () => {
      window.lenis?.stop?.();
      clearLenisResumeTimeout();
      lenisResumeTimeout.current = window.setTimeout(() => {
        window.lenis?.start?.();
        lenisResumeTimeout.current = null;
      }, 180);
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      pauseLenis();
    };

    const handlePointerLeave = () => {
      clearLenisResumeTimeout();
      window.lenis?.start?.();
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('mouseleave', handlePointerLeave);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('mouseleave', handlePointerLeave);
      clearLenisResumeTimeout();
      window.lenis?.start?.();
    };
  }, []);

  useEffect(() => {
    if (!isMapReady || !map.current) return;
    const source = map.current.getSource(SOURCE_ID);

    if (source && 'setData' in source) {
      activePopup.current?.remove();
      activePopup.current = null;
      source.setData(featureCollection);
    }
  }, [featureCollection, isMapReady]);

  useEffect(() => {
    if (!map.current) return;
    activePopup.current?.remove();
    activePopup.current = null;
    map.current.setStyle(getBasemapStyle(basemapMode));
  }, [basemapMode]);

  const togglePrecision = (precision: PrecisionCoord) => {
    setSelectedPrecisions((current) => {
      const next = new Set(current);
      if (next.has(precision)) {
        next.delete(precision);
      } else {
        next.add(precision);
      }
      return next.size > 0 ? next : current;
    });
  };

  const handleMapWheelCapture = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!map.current) return;
    event.preventDefault();
  };

  return (
    <div className="map-premium-wrapper serie9-map">
      <div className="serie9-map__toolbar" aria-label="Controles del mapa de locales">
        <div className="serie9-map__stats">
          <strong>{stats ? formatNumber(featureCollection.features.length) : '...'}</strong>
          <span>locales visibles</span>
          <strong>{stats ? formatNumber(visibleMesaCount) : '...'}</strong>
          <span>mesas representadas</span>
          {stats ? (
            <>
              <strong>{formatNumber(stats.missingRows)}</strong>
              <span>sin coordenada</span>
            </>
          ) : null}
        </div>

        <div className="serie9-map__controls">
          <div className="serie9-map__basemap" aria-label="Cambiar capa base del mapa">
            <button
              type="button"
              className={basemapMode === 'croquis' ? 'is-active' : ''}
              onClick={() => setBasemapMode('croquis')}
            >
              Croquis
            </button>
            <button
              type="button"
              className={basemapMode === 'satelite' ? 'is-active' : ''}
              onClick={() => setBasemapMode('satelite')}
            >
              Satelite
            </button>
          </div>

          <div className="serie9-map__filters" aria-label="Filtrar por precisión">
            {PRECISION_OPTIONS.map((precision) => (
              <button
                key={precision}
                type="button"
                className={selectedPrecisions.has(precision) ? 'is-active' : ''}
                onClick={() => togglePrecision(precision)}
              >
                <span style={{ backgroundColor: PRECISION_META[precision].color }} />
                {PRECISION_META[precision].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={mapContainer}
        style={{ height }}
        className="serie9-map__canvas w-full bg-gray-100"
        data-lenis-prevent
        onWheelCapture={handleMapWheelCapture}
      />

      {(isLoading || error) && (
        <div className="serie9-map__status">
          {isLoading ? 'Cargando coordenadas...' : error}
        </div>
      )}
    </div>
  );
};

export default MapContainer;
