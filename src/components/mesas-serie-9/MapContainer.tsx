import React, { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import {
  EMPTY_FEATURE_COLLECTION,
  LAYER_ID,
  OUTLINE_LAYER_ID,
  PRECISION_META,
  PRECISION_OPTIONS,
  SELECTED_HALO_LAYER_ID,
  SELECTED_SOURCE_ID,
  SOURCE_ID,
  getBasemapStyle,
} from './constants';
import {
  aggregateRows,
  buildFeatureCollection,
  createSelectedFeatureCollection,
  formatNumber,
  parseCsvObjects,
} from './data';
import { createPopupContent } from './popup';
import type {
  BasemapMode,
  GeoJsonSourceLike,
  MapContainerProps,
  MapStats,
  PointFeatureCollection,
  PrecisionCoord,
  VotingLocal,
} from './types';

const MapContainer = ({
  dataUrl = '/pdfs/01_base_4703_mesas_serie9_con_coordenadas.csv',
  initialCenter = [-75.0152, -9.19],
  initialZoom = 5,
  height = '860px',
  maxBounds = [
    [-97.0, -29.0],
    [-53.0, 12.0],
  ],
}: MapContainerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const activePopup = useRef<maplibregl.Popup | null>(null);
  const localsById = useRef<Map<string, VotingLocal>>(new Map());
  const featureCollectionRef = useRef<PointFeatureCollection>(EMPTY_FEATURE_COLLECTION);
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
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProvincia, setSelectedProvincia] = useState('');
  const [selectedDistrito, setSelectedDistrito] = useState('');

  const regionOptions = useMemo(
    () => Array.from(new Set(locals.map((local) => local.region).filter(Boolean))).sort(),
    [locals],
  );

  const provinciaOptions = useMemo(
    () =>
      Array.from(
        new Set(
          locals
            .filter((local) => !selectedRegion || local.region === selectedRegion)
            .map((local) => local.provincia)
            .filter(Boolean),
        ),
      ).sort(),
    [locals, selectedRegion],
  );

  const distritoOptions = useMemo(
    () =>
      Array.from(
        new Set(
          locals
            .filter((local) => !selectedRegion || local.region === selectedRegion)
            .filter((local) => !selectedProvincia || local.provincia === selectedProvincia)
            .map((local) => local.distrito)
            .filter(Boolean),
        ),
      ).sort(),
    [locals, selectedRegion, selectedProvincia],
  );

  const filteredLocals = useMemo(
    () =>
      locals.filter((local) => {
        if (selectedRegion && local.region !== selectedRegion) return false;
        if (selectedProvincia && local.provincia !== selectedProvincia) return false;
        if (selectedDistrito && local.distrito !== selectedDistrito) return false;
        return true;
      }),
    [locals, selectedDistrito, selectedProvincia, selectedRegion],
  );

  const featureCollection = useMemo(
    () => buildFeatureCollection(filteredLocals, selectedPrecisions),
    [filteredLocals, selectedPrecisions],
  );

  const visibleMesaCount = useMemo(
    () =>
      filteredLocals
        .filter((local) => selectedPrecisions.has(local.precisionCoord))
        .reduce((total, local) => total + local.mesas.length, 0),
    [filteredLocals, selectedPrecisions],
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

        localsById.current = new Map(aggregated.locals.map((local) => [local.id, local] as const));
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
      const selectedSource = mapInstance.getSource(SELECTED_SOURCE_ID) as GeoJsonSourceLike;
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
      const source = mapInstance.getSource(SOURCE_ID) as GeoJsonSourceLike;

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

      const selectedSource = mapInstance.getSource(SELECTED_SOURCE_ID) as GeoJsonSourceLike;

      if (!selectedSource) {
        mapInstance.addSource(SELECTED_SOURCE_ID, {
          type: 'geojson',
          data: createSelectedFeatureCollection(selectedLocalRef.current),
        });
      } else {
        selectedSource.setData(createSelectedFeatureCollection(selectedLocalRef.current));
      }

      if (!mapInstance.getLayer(SELECTED_HALO_LAYER_ID)) {
        mapInstance.addLayer(
          {
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
          },
          LAYER_ID,
        );
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

    const getPopupPlacement = (mapInstance: maplibregl.Map, local: VotingLocal) => {
      const projectedPoint = mapInstance.project(local.coordinates);
      const canvas = mapInstance.getCanvas();
      const isRightHalf = projectedPoint.x > canvas.width * 0.55;
      const isLowerZone = projectedPoint.y > canvas.height * 0.72;

      if (isLowerZone) {
        return {
          anchor: isRightHalf ? 'bottom-right' : 'bottom-left',
          offset: 18,
        } as const;
      }

      return {
        anchor: isRightHalf ? 'right' : 'left',
        offset: 20,
      } as const;
    };

    const openLocalPopup = (mapInstance: maplibregl.Map, local: VotingLocal) => {
      activePopup.current?.remove();
      setSelectedLocal(mapInstance, local);

      const popupContent = createPopupContent(local);
      const zoomButton = popupContent.querySelector('.serie9-popup__zoom-button');
      zoomButton?.addEventListener('click', () => {
        mapInstance.flyTo({
          center: local.coordinates,
          zoom: Math.max(mapInstance.getZoom(), 15.2),
          speed: 1.15,
          curve: 1.42,
          essential: true,
        });
      });

      const popupPlacement = getPopupPlacement(mapInstance, local);
      const popup = new maplibregl.Popup({
        anchor: popupPlacement.anchor,
        closeButton: true,
        maxWidth: '360px',
        offset: popupPlacement.offset,
      })
        .setLngLat(local.coordinates)
        .setDOMContent(popupContent)
        .addTo(mapInstance);

      popup.on('close', () => {
        activePopup.current = null;
        setSelectedLocal(mapInstance, null);
      });

      activePopup.current = popup;
    };

    const handlePointClick = (
      event: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] },
    ) => {
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
      minZoom: 1.7,
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
              ? { top: 24, right: 14, bottom: 34, left: 14 }
              : { top: 40, right: 28, bottom: 52, left: 28 },
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
    const source = map.current.getSource(SOURCE_ID) as GeoJsonSourceLike;

    if (source) {
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

  const handleRegionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextRegion = event.target.value;
    setSelectedRegion(nextRegion);
    setSelectedProvincia('');
    setSelectedDistrito('');
  };

  const handleProvinciaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextProvincia = event.target.value;
    setSelectedProvincia(nextProvincia);
    setSelectedDistrito('');
  };

  const handleDistritoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDistrito(event.target.value);
  };

  const handleMapWheelCapture = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!map.current) return;
    event.preventDefault();
  };

  const handleResetView = () => {
    if (!map.current) return;
    activePopup.current?.remove();
    activePopup.current = null;
    const center: [number, number] = [
      (maxBounds[0][0] + maxBounds[1][0]) / 2,
      (maxBounds[0][1] + maxBounds[1][1]) / 2,
    ];
    map.current.easeTo({
      center,
      zoom: 1.7,
      duration: 900,
      offset: window.matchMedia('(max-width: 720px)').matches ? [0, 10] : [0, 0],
      essential: true,
    });
  };

  return (
    <div className="map-premium-wrapper serie9-map">
      <div className="serie9-map__toolbar" aria-label="Controles del mapa de locales">
        <div className="serie9-map__toolbar-main">
          <div className="serie9-map__stats">
            <div className="serie9-map__stat-card">
              <strong>{stats ? formatNumber(featureCollection.features.length) : '...'}</strong>
              <span>Locales visibles</span>
            </div>
            <div className="serie9-map__stat-card">
              <strong>{stats ? formatNumber(visibleMesaCount) : '...'}</strong>
              <span>Mesas representadas</span>
            </div>
            <div className="serie9-map__stat-card">
              <strong>{stats ? formatNumber(stats.missingRows) : '...'}</strong>
              <span>Sin coordenada</span>
            </div>
          </div>

          <div className="serie9-map__controls">
            <div className="serie9-map__toolbar-top">
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

              <button type="button" className="serie9-map__reset" onClick={handleResetView}>
                Restablecer
              </button>
            </div>

            <div className="serie9-map__geo-filters" aria-label="Filtrar por ubicacion">
              <label className="serie9-map__select-field">
                <span>Region</span>
                <select value={selectedRegion} onChange={handleRegionChange}>
                  <option value="">Todas</option>
                  {regionOptions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </label>

              <label className="serie9-map__select-field">
                <span>Provincia</span>
                <select
                  value={selectedProvincia}
                  onChange={handleProvinciaChange}
                  disabled={provinciaOptions.length === 0}
                >
                  <option value="">Todas</option>
                  {provinciaOptions.map((provincia) => (
                    <option key={provincia} value={provincia}>
                      {provincia}
                    </option>
                  ))}
                </select>
              </label>

              <label className="serie9-map__select-field">
                <span>Distrito</span>
                <select
                  value={selectedDistrito}
                  onChange={handleDistritoChange}
                  disabled={distritoOptions.length === 0}
                >
                  <option value="">Todos</option>
                  {distritoOptions.map((distrito) => (
                    <option key={distrito} value={distrito}>
                      {distrito}
                    </option>
                  ))}
                </select>
              </label>
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

      </div>

      <div
        ref={mapContainer}
        style={{ height }}
        className="serie9-map__canvas w-full bg-gray-100"
        data-lenis-prevent
        onWheelCapture={handleMapWheelCapture}
      />

      {(isLoading || error) && (
        <div className="serie9-map__status">{isLoading ? 'Cargando coordenadas...' : error}</div>
      )}
    </div>
  );
};

export default MapContainer;
