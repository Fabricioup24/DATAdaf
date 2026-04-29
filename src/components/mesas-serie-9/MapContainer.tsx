import React, { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import {
  EMPTY_FEATURE_COLLECTION,
  FIXED_PARTIES,
  LAYER_ID,
  OUTLINE_LAYER_ID,
  SELECTED_HALO_LAYER_ID,
  SELECTED_SOURCE_ID,
  SOURCE_ID,
  getBasemapStyle,
} from './constants';
import {
  aggregateVoteSummaries,
  aggregateRows,
  buildFeatureCollection,
  createSelectedFeatureCollection,
  formatNumber,
  parseCsvObjects,
} from './data';
import { createPopupContent } from './popup';
import ResultsSheet from './ResultsSheet';
import type {
  BasemapMode,
  GeoJsonSourceLike,
  MapContainerProps,
  MapStats,
  PointFeatureCollection,
  VotingLocal,
} from './types';

type MesaSearchResult = {
  numeroMesa: string;
  localId: string;
  localNombre: string;
  region: string;
  provincia: string;
  distrito: string;
};

const MapContainer = ({
  dataUrl = '/pdfs/01_base_4703_mesas_serie9_clasificacion_oficial_urbano_rural.csv',
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
  const openLocalPopupRef = useRef<((local: VotingLocal, shouldZoom?: boolean) => void) | null>(null);
  const pendingSearchLocalRef = useRef<VotingLocal | null>(null);
  const blurSearchTimeoutRef = useRef<number | null>(null);

  const [locals, setLocals] = useState<VotingLocal[]>([]);
  const [stats, setStats] = useState<MapStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  const [basemapMode, setBasemapMode] = useState<BasemapMode>('croquis');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProvincia, setSelectedProvincia] = useState('');
  const [selectedDistrito, setSelectedDistrito] = useState('');
  const [selectedUrbanRural, setSelectedUrbanRural] = useState('');
  const [selectedUrbanSubtype, setSelectedUrbanSubtype] = useState('');
  const [mesaQuery, setMesaQuery] = useState('');
  const [mesaSuggestionsOpen, setMesaSuggestionsOpen] = useState(false);
  const [mesaError, setMesaError] = useState<string | null>(null);
  const [resultsLocal, setResultsLocal] = useState<VotingLocal | null>(null);
  const [selectedPartyOne, setSelectedPartyOne] = useState('');
  const [selectedPartyTwo, setSelectedPartyTwo] = useState('');

  const mesaSearchIndex = useMemo(
    () =>
      locals
        .flatMap((local) =>
          local.mesas.map<MesaSearchResult>((mesa) => ({
            numeroMesa: mesa.numeroMesa,
            localId: local.id,
            localNombre: local.nombreLocal,
            region: local.region,
            provincia: local.provincia,
            distrito: local.distrito,
          })),
        )
        .sort((first, second) =>
          first.numeroMesa.localeCompare(second.numeroMesa, 'es', { numeric: true }),
        ),
    [locals],
  );

  const mesaSuggestions = useMemo(() => {
    const query = mesaQuery.trim();
    if (!query) return [];

    const exactMatches = mesaSearchIndex.filter((item) => item.numeroMesa === query);
    const startsWithMatches = mesaSearchIndex.filter(
      (item) => item.numeroMesa !== query && item.numeroMesa.startsWith(query),
    );
    const includesMatches = mesaSearchIndex.filter(
      (item) =>
        item.numeroMesa !== query &&
        !item.numeroMesa.startsWith(query) &&
        item.numeroMesa.includes(query),
    );

    return [...exactMatches, ...startsWithMatches, ...includesMatches].slice(0, 8);
  }, [mesaQuery, mesaSearchIndex]);

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
        if (
          selectedUrbanRural &&
          local.clasificacionOficialUrbanoRural !== selectedUrbanRural
        ) {
          return false;
        }
        if (
          selectedUrbanSubtype &&
          local.clasificacionOficialUrbanoRural === 'urbano' &&
          local.subclasificacionUrbanaOficial !== selectedUrbanSubtype
        ) {
          return false;
        }
        return true;
      }),
    [locals, selectedDistrito, selectedProvincia, selectedRegion, selectedUrbanRural, selectedUrbanSubtype],
  );

  const visiblePresidentialSummary = useMemo(
    () => aggregateVoteSummaries(filteredLocals.map((local) => local.results)),
    [filteredLocals],
  );

  const presidentialPartyOptions = useMemo(() => {
    const parties = visiblePresidentialSummary?.allParties ?? [];

    return parties
      .filter((party) => party.votes > 0)
      .map((party) => ({ key: party.key, label: party.label }))
      .sort((first, second) => {
        const firstFixedIndex = FIXED_PARTIES.findIndex((party) => party.column === first.key);
        const secondFixedIndex = FIXED_PARTIES.findIndex((party) => party.column === second.key);

        if (firstFixedIndex >= 0 && secondFixedIndex >= 0) return firstFixedIndex - secondFixedIndex;
        if (firstFixedIndex >= 0) return -1;
        if (secondFixedIndex >= 0) return 1;
        return first.label.localeCompare(second.label, 'es');
      });
  }, [visiblePresidentialSummary]);

  const selectedPartyOneResult = useMemo(
    () =>
      selectedPartyOne
        ? visiblePresidentialSummary?.allParties.find((party) => party.key === selectedPartyOne) ?? null
        : null,
    [selectedPartyOne, visiblePresidentialSummary],
  );

  const selectedPartyTwoResult = useMemo(
    () =>
      selectedPartyTwo
        ? visiblePresidentialSummary?.allParties.find((party) => party.key === selectedPartyTwo) ?? null
        : null,
    [selectedPartyTwo, visiblePresidentialSummary],
  );

  const featureCollection = useMemo(() => buildFeatureCollection(filteredLocals), [filteredLocals]);

  const visibleMesaCount = useMemo(
    () => filteredLocals.reduce((total, local) => total + local.mesas.length, 0),
    [filteredLocals],
  );

  useEffect(() => {
    featureCollectionRef.current = featureCollection;
  }, [featureCollection]);

  useEffect(() => {
    return () => {
      if (blurSearchTimeoutRef.current !== null) {
        window.clearTimeout(blurSearchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedPartyOne && !selectedPartyTwo) return;

    const availableKeys = new Set(presidentialPartyOptions.map((party) => party.key));

    if (selectedPartyOne && !availableKeys.has(selectedPartyOne)) {
      setSelectedPartyOne('');
    }

    if (selectedPartyTwo && !availableKeys.has(selectedPartyTwo)) {
      setSelectedPartyTwo('');
    }
  }, [presidentialPartyOptions, selectedPartyOne, selectedPartyTwo]);

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
            'circle-color': '#a8792a',
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
            'circle-opacity': 0.88,
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
      const resultsButton = popupContent.querySelector('.serie9-popup__results-button');
      const zoomButton = popupContent.querySelector('.serie9-popup__zoom-button');
      resultsButton?.addEventListener('click', () => {
        setResultsLocal(local);
      });
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

    const focusLocalOnMap = (local: VotingLocal, shouldZoom = false) => {
      if (shouldZoom) {
        mapInstance.flyTo({
          center: local.coordinates,
          zoom: Math.max(mapInstance.getZoom(), 15.2),
          speed: 1.15,
          curve: 1.42,
          essential: true,
        });
      }

      openLocalPopup(mapInstance, local);
    };

    openLocalPopupRef.current = focusLocalOnMap;

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
      openLocalPopupRef.current = null;
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
    const pendingLocal = pendingSearchLocalRef.current;
    if (!pendingLocal || !isMapReady) return;

    const isVisible = filteredLocals.some((local) => local.id === pendingLocal.id);
    if (!isVisible) return;

    openLocalPopupRef.current?.(pendingLocal, true);
    pendingSearchLocalRef.current = null;
  }, [filteredLocals, isMapReady]);

  useEffect(() => {
    if (!map.current) return;
    activePopup.current?.remove();
    activePopup.current = null;
    map.current.setStyle(getBasemapStyle(basemapMode));
  }, [basemapMode]);

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

  const handleUrbanRuralChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextValue = event.target.value;
    setSelectedUrbanRural(nextValue);
    if (nextValue !== 'urbano') {
      setSelectedUrbanSubtype('');
    }
  };

  const handleUrbanSubtypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUrbanSubtype(event.target.value);
  };

  const handleResetFilters = () => {
    setSelectedRegion('');
    setSelectedProvincia('');
    setSelectedDistrito('');
    setSelectedUrbanRural('');
    setSelectedUrbanSubtype('');
    setMesaQuery('');
    setMesaError(null);
    setMesaSuggestionsOpen(false);
  };

  const handlePartyOneChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextValue = event.target.value;
    setSelectedPartyOne(nextValue);

    if (nextValue && nextValue === selectedPartyTwo) {
      setSelectedPartyTwo('');
    }
  };

  const handlePartyTwoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextValue = event.target.value;

    if (nextValue && nextValue === selectedPartyOne) {
      setSelectedPartyTwo('');
      return;
    }

    setSelectedPartyTwo(nextValue);
  };

  const resolveMesaSearch = (term: string) => {
    const query = term.trim();
    if (!query) return null;

    return (
      mesaSearchIndex.find((item) => item.numeroMesa === query) ??
      mesaSuggestions.find((item) => item.numeroMesa === query) ??
      mesaSuggestions[0] ??
      null
    );
  };

  const executeMesaSearch = (term: string) => {
    const match = resolveMesaSearch(term);

    if (!match) {
      setMesaError('No se encontro una mesa con ese numero.');
      setMesaSuggestionsOpen(false);
      return;
    }

    const local = localsById.current.get(match.localId);
    if (!local) {
      setMesaError('No se pudo ubicar el local asociado a esa mesa.');
      setMesaSuggestionsOpen(false);
      return;
    }

    setMesaQuery(match.numeroMesa);
    setMesaError(null);
    setMesaSuggestionsOpen(false);
    pendingSearchLocalRef.current = local;

    const sameFilters =
      selectedRegion === local.region &&
      selectedProvincia === local.provincia &&
      selectedDistrito === local.distrito &&
      selectedUrbanRural === local.clasificacionOficialUrbanoRural &&
      selectedUrbanSubtype ===
        (local.clasificacionOficialUrbanoRural === 'urbano'
          ? local.subclasificacionUrbanaOficial
          : '');

    setSelectedRegion(local.region);
    setSelectedProvincia(local.provincia);
    setSelectedDistrito(local.distrito);
    setSelectedUrbanRural(local.clasificacionOficialUrbanoRural);
    setSelectedUrbanSubtype(
      local.clasificacionOficialUrbanoRural === 'urbano'
        ? local.subclasificacionUrbanaOficial
        : '',
    );

    if (sameFilters) {
      openLocalPopupRef.current?.(local, true);
      pendingSearchLocalRef.current = null;
    }
  };

  const handleMesaSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    executeMesaSearch(mesaQuery);
  };

  const handleMesaInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMesaQuery(event.target.value);
    setMesaError(null);
    setMesaSuggestionsOpen(true);
  };

  const handleMesaInputFocus = () => {
    if (blurSearchTimeoutRef.current !== null) {
      window.clearTimeout(blurSearchTimeoutRef.current);
      blurSearchTimeoutRef.current = null;
    }
    if (mesaQuery.trim()) {
      setMesaSuggestionsOpen(true);
    }
  };

  const handleMesaInputBlur = () => {
    blurSearchTimeoutRef.current = window.setTimeout(() => {
      setMesaSuggestionsOpen(false);
      blurSearchTimeoutRef.current = null;
    }, 120);
  };

  const handleMesaSuggestionSelect = (numeroMesa: string) => {
    executeMesaSearch(numeroMesa);
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
    <div className={`map-premium-wrapper serie9-map${resultsLocal ? ' is-results-open' : ''}`}>
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

              <div className="serie9-map__actions">
                <button type="button" className="serie9-map__ghost-action" onClick={handleResetFilters}>
                  Restablecer filtros
                </button>
                <button type="button" className="serie9-map__reset" onClick={handleResetView}>
                  Restablecer
                </button>
              </div>
            </div>

            <div className="serie9-map__geo-filters" aria-label="Filtrar por ubicacion">
              <form className="serie9-map__mesa-search" onSubmit={handleMesaSubmit}>
                <label className="serie9-map__search-field">
                  <span>Buscar mesa</span>
                  <div className="serie9-map__search-input-wrap">
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="Ej. 900001"
                      value={mesaQuery}
                      onChange={handleMesaInputChange}
                      onFocus={handleMesaInputFocus}
                      onBlur={handleMesaInputBlur}
                    />
                    <button type="submit" className="serie9-map__search-button">
                      Buscar
                    </button>
                  </div>
                </label>

                {mesaSuggestionsOpen && mesaSuggestions.length > 0 ? (
                  <div className="serie9-map__search-suggestions" role="listbox">
                    {mesaSuggestions.map((item) => (
                      <button
                        key={`${item.numeroMesa}-${item.localId}`}
                        type="button"
                        className="serie9-map__search-suggestion"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          handleMesaSuggestionSelect(item.numeroMesa);
                        }}
                      >
                        <strong>{item.numeroMesa}</strong>
                        <span>
                          {item.localNombre} · {item.distrito}, {item.provincia}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}

                {mesaError ? <p className="serie9-map__search-error">{mesaError}</p> : null}
              </form>

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

              <label className="serie9-map__select-field">
                <span>Clasificacion</span>
                <select value={selectedUrbanRural} onChange={handleUrbanRuralChange}>
                  <option value="">Todas</option>
                  <option value="urbano">Urbano</option>
                  <option value="rural">Rural</option>
                </select>
              </label>

              {selectedUrbanRural === 'urbano' ? (
                <label className="serie9-map__select-field">
                  <span>Tipo urbano</span>
                  <select value={selectedUrbanSubtype} onChange={handleUrbanSubtypeChange}>
                    <option value="">Todos</option>
                    <option value="urbano_central">Urbano central</option>
                    <option value="urbano_periferico">Urbano periferico</option>
                  </select>
                </label>
              ) : null}

              <div className="serie9-map__presidential-selectors">
                <label className="serie9-map__select-field">
                  <span>Partido 1</span>
                  <select
                    value={selectedPartyOne}
                    onChange={handlePartyOneChange}
                    disabled={presidentialPartyOptions.length === 0}
                  >
                    <option value="">
                      {presidentialPartyOptions.length === 0
                        ? 'Sin votos visibles'
                        : 'Selecciona un partido'}
                    </option>
                    {presidentialPartyOptions.map((party) => (
                      <option key={party.key} value={party.key}>
                        {party.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="serie9-map__select-field">
                  <span>Partido 2</span>
                  <select
                    value={selectedPartyTwo}
                    onChange={handlePartyTwoChange}
                    disabled={presidentialPartyOptions.length === 0}
                  >
                    <option value="">
                      {presidentialPartyOptions.length === 0
                        ? 'Sin votos visibles'
                        : 'Selecciona un segundo partido'}
                    </option>
                    {presidentialPartyOptions.map((party) => (
                      <option
                        key={party.key}
                        value={party.key}
                        disabled={party.key === selectedPartyOne}
                      >
                        {party.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <section className="serie9-map__presidential-panel" aria-label="Resultados presidenciales del subconjunto visible">
              <div className="serie9-map__presidential-head">
                <div>
                  <p className="serie9-map__presidential-eyebrow">Solo Presidencia</p>
                  <h3 className="serie9-map__presidential-title">Resultados del subconjunto visible</h3>
                </div>
                <span className="serie9-map__presidential-note">
                  {formatNumber(featureCollection.features.length)} locales y {formatNumber(visibleMesaCount)} mesas segun los filtros activos. El ausentismo se calcula solo con {formatNumber(visiblePresidentialSummary?.countedMesas ?? 0)} mesas contabilizadas.
                </span>
              </div>

              <div className="serie9-map__presidential-metrics">
                <div className="serie9-map__stat-card">
                  <strong>{visiblePresidentialSummary ? formatNumber(visiblePresidentialSummary.emittedVotes) : '0'}</strong>
                  <span>Emitidos</span>
                </div>
                <div className="serie9-map__stat-card">
                  <strong>{visiblePresidentialSummary ? formatNumber(visiblePresidentialSummary.validVotes) : '0'}</strong>
                  <span>Validos</span>
                </div>
                <div className="serie9-map__stat-card">
                  <strong>
                    {visiblePresidentialSummary
                      ? formatNumber(visiblePresidentialSummary.extras.blancoVotes)
                      : '0'}
                  </strong>
                  <span>Blancos</span>
                </div>
                <div className="serie9-map__stat-card">
                  <strong>
                    {visiblePresidentialSummary
                      ? formatNumber(visiblePresidentialSummary.eligibleVoters)
                      : '0'}
                  </strong>
                  <span>Habiles</span>
                </div>
                <div className="serie9-map__stat-card">
                  <strong>
                    {visiblePresidentialSummary
                      ? formatNumber(visiblePresidentialSummary.abstentionVotes)
                      : '0'}
                  </strong>
                  <span>Ausentes</span>
                  <small>
                    {visiblePresidentialSummary
                      ? `${visiblePresidentialSummary.abstentionShare.toFixed(1)}% de habiles`
                      : '0.0% de habiles'}
                  </small>
                </div>
                <div className="serie9-map__stat-card">
                  <strong>
                    {visiblePresidentialSummary
                      ? formatNumber(visiblePresidentialSummary.pendingMesas)
                      : '0'}
                  </strong>
                  <span>Enviadas al JEE</span>
                </div>
              </div>

              <div className="serie9-map__presidential-party-cards">
                {selectedPartyOneResult ? (
                  <article className="serie9-map__party-card">
                    <p>{selectedPartyOneResult.label}</p>
                    <strong>{formatNumber(selectedPartyOneResult.votes)}</strong>
                    <span>
                      {selectedPartyOneResult.share.toFixed(1)}% de votos validos
                    </span>
                  </article>
                ) : null}

                {selectedPartyTwoResult ? (
                  <article className="serie9-map__party-card">
                    <p>{selectedPartyTwoResult.label}</p>
                    <strong>{formatNumber(selectedPartyTwoResult.votes)}</strong>
                    <span>
                      {selectedPartyTwoResult.share.toFixed(1)}% de votos validos
                    </span>
                  </article>
                ) : null}
              </div>

              {!selectedPartyOne && !selectedPartyTwo ? (
                <p className="serie9-map__presidential-hint">
                  Selecciona uno o dos partidos para calcular sus votos dentro del subconjunto visible.
                </p>
              ) : null}

              {visiblePresidentialSummary?.pendingMesas ? (
                <p className="serie9-map__presidential-hint">
                  {formatNumber(visiblePresidentialSummary.pendingMesas)} mesas enviadas al JEE no se incluyen en el calculo de ausentismo ni en los totales presidenciales.
                </p>
              ) : null}
            </section>
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

      <ResultsSheet local={resultsLocal} onClose={() => setResultsLocal(null)} />
    </div>
  );
};

export default MapContainer;
