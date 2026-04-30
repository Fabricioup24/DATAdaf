import {
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
} from 'react';
import maplibregl from 'maplibre-gl';

import {
  LAYER_ID,
  OUTLINE_LAYER_ID,
  PARTY_COLOR_MAP,
  SELECTED_HALO_LAYER_ID,
  SELECTED_SOURCE_ID,
  SOURCE_ID,
  getBasemapStyle,
} from '../constants';
import { createSelectedFeatureCollection } from '../data';
import { createPopupContent } from '../popup';
import type {
  AnalysisMode,
  BasemapMode,
  GeoJsonSourceLike,
  PointFeatureCollection,
  VotingLocal,
} from '../types';

type UseSerie9MapParams = {
  analysisMode: AnalysisMode;
  analysisPartyKeys: string[];
  basemapMode: BasemapMode;
  featureCollection: PointFeatureCollection;
  initialCenter: [number, number];
  initialZoom: number;
  localsByIdRef: MutableRefObject<Map<string, VotingLocal>>;
  maxBounds: [[number, number], [number, number]];
  onViewResults: (local: VotingLocal) => void;
};

type UseSerie9MapResult = {
  focusLocalOnMap: (local: VotingLocal, shouldZoom?: boolean) => void;
  handleResetView: () => void;
  isMapReady: boolean;
  mapContainerRef: MutableRefObject<HTMLDivElement | null>;
};

export const useSerie9Map = ({
  analysisMode,
  analysisPartyKeys,
  basemapMode,
  featureCollection,
  initialCenter,
  initialZoom,
  localsByIdRef,
  maxBounds,
  onViewResults,
}: UseSerie9MapParams): UseSerie9MapResult => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const activePopupRef = useRef<maplibregl.Popup | null>(null);
  const featureCollectionRef = useRef<PointFeatureCollection>(featureCollection);
  const selectedLocalRef = useRef<VotingLocal | null>(null);
  const pulseFrameRef = useRef<number | null>(null);
  const lenisResumeTimeoutRef = useRef<number | null>(null);
  const hasAppliedInitialViewRef = useRef(false);
  const focusLocalRef = useRef<(local: VotingLocal, shouldZoom?: boolean) => void>(() => undefined);
  const [isMapReady, setIsMapReady] = useState(false);

  const isMapOperational = (mapInstance: maplibregl.Map | null | undefined) =>
    !!mapInstance && mapRef.current === mapInstance;

  useEffect(() => {
    featureCollectionRef.current = featureCollection;
  }, [featureCollection]);

  const syncAnalysisPaint = (mapInstance: maplibregl.Map) => {
    if (!isMapOperational(mapInstance) || !mapInstance.getLayer(LAYER_ID)) return;

    const defaultColor = '#a8792a';
    const mutedColor = '#d7dde8';
    const mutedOpacity = 0.42;

    if (analysisMode === 'winner' && analysisPartyKeys[0]) {
      const winningKey = analysisPartyKeys[0];
      mapInstance.setPaintProperty(LAYER_ID, 'circle-color', [
        'case',
        ['==', ['get', 'winnerPartyKey'], winningKey],
        PARTY_COLOR_MAP[winningKey] ?? defaultColor,
        mutedColor,
      ]);
      mapInstance.setPaintProperty(LAYER_ID, 'circle-opacity', [
        'case',
        ['==', ['get', 'winnerPartyKey'], winningKey],
        0.94,
        mutedOpacity,
      ]);
      return;
    }

    if (analysisMode === 'compare' && analysisPartyKeys.length >= 2) {
      const [firstKey, secondKey] = analysisPartyKeys;
      mapInstance.setPaintProperty(LAYER_ID, 'circle-color', [
        'case',
        ['==', ['get', 'winnerPartyKey'], firstKey],
        PARTY_COLOR_MAP[firstKey] ?? defaultColor,
        ['==', ['get', 'winnerPartyKey'], secondKey],
        PARTY_COLOR_MAP[secondKey] ?? defaultColor,
        mutedColor,
      ]);
      mapInstance.setPaintProperty(LAYER_ID, 'circle-opacity', [
        'case',
        [
          'any',
          ['==', ['get', 'winnerPartyKey'], firstKey],
          ['==', ['get', 'winnerPartyKey'], secondKey],
        ],
        0.94,
        mutedOpacity,
      ]);
      return;
    }

    mapInstance.setPaintProperty(LAYER_ID, 'circle-color', defaultColor);
    mapInstance.setPaintProperty(LAYER_ID, 'circle-opacity', 0.88);
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const stopSelectionPulse = () => {
      if (pulseFrameRef.current !== null) {
        window.cancelAnimationFrame(pulseFrameRef.current);
        pulseFrameRef.current = null;
      }
    };

    const syncSelectedSource = (mapInstance: maplibregl.Map, local: VotingLocal | null) => {
      if (!isMapOperational(mapInstance)) return;
      const selectedSource = mapInstance.getSource(SELECTED_SOURCE_ID) as GeoJsonSourceLike;
      if (selectedSource) {
        selectedSource.setData(createSelectedFeatureCollection(local));
      }
    };

    const startSelectionPulse = (mapInstance: maplibregl.Map) => {
      stopSelectionPulse();

      const animatePulse = (timestamp: number) => {
        if (!isMapOperational(mapInstance) || !mapInstance.getLayer(SELECTED_HALO_LAYER_ID) || !selectedLocalRef.current) {
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
      if (!isMapOperational(mapInstance)) return;
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
            'circle-radius': ['interpolate', ['linear'], ['get', 'mesaCount'], 1, 5, 5, 7, 12, 10, 20, 13],
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
            'circle-radius': ['interpolate', ['linear'], ['get', 'mesaCount'], 1, 7, 5, 9, 12, 12, 20, 15],
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

      syncAnalysisPaint(mapInstance);
    };

    const handleMouseEnter = () => {
      if (!isMapOperational(mapInstance)) return;
      mapInstance.getCanvas().style.cursor = 'pointer';
    };

    const handleMouseLeave = () => {
      if (!isMapOperational(mapInstance)) return;
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
      if (!isMapOperational(mapInstance)) return;
      activePopupRef.current?.remove();
      setSelectedLocal(mapInstance, local);

      const popupContent = createPopupContent(local, {
        onResults: () => onViewResults(local),
        onZoom: () => {
          mapInstance.flyTo({
            center: local.coordinates,
            zoom: Math.max(mapInstance.getZoom(), 15.2),
            speed: 1.15,
            curve: 1.42,
            essential: true,
          });
        },
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
        activePopupRef.current = null;
        if (!isMapOperational(mapInstance)) return;
        setSelectedLocal(mapInstance, null);
      });

      activePopupRef.current = popup;
    };

    const focusLocalOnMap = (local: VotingLocal, shouldZoom = false) => {
      if (!isMapOperational(mapInstance)) return;
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

    focusLocalRef.current = focusLocalOnMap;

    const handlePointClick = (
      event: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] },
    ) => {
      const feature = event.features?.[0];
      const localId = feature?.properties?.id;
      const local = typeof localId === 'string' ? localsByIdRef.current.get(localId) ?? null : null;

      if (!local) return;
      openLocalPopup(mapInstance, local);
    };

    const mapInstance = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getBasemapStyle('croquis'),
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: true,
      minZoom: 1.7,
      maxBounds,
    });

    mapRef.current = mapInstance;
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
      if (!isMapOperational(mapInstance)) return;
      ensureDataLayers(mapInstance);
      bindPointInteractions();

      if (!hasAppliedInitialViewRef.current) {
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
        hasAppliedInitialViewRef.current = true;
      }

      setIsMapReady(true);
    };

    mapInstance.on('load', handleStyleReady);
    mapInstance.on('style.load', handleStyleReady);

    return () => {
      setIsMapReady(false);
      activePopupRef.current?.remove();
      activePopupRef.current = null;
      selectedLocalRef.current = null;
      mapRef.current = null;
      mapInstance.off('load', handleStyleReady);
      mapInstance.off('style.load', handleStyleReady);
      mapInstance.off('mouseenter', LAYER_ID, handleMouseEnter);
      mapInstance.off('mouseleave', LAYER_ID, handleMouseLeave);
      mapInstance.off('click', LAYER_ID, handlePointClick);
      stopSelectionPulse();
      mapInstance.remove();
      focusLocalRef.current = () => undefined;
    };
  }, [initialCenter, initialZoom, localsByIdRef, maxBounds, onViewResults]);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || typeof window === 'undefined') return;

    const clearLenisResumeTimeout = () => {
      if (lenisResumeTimeoutRef.current !== null) {
        window.clearTimeout(lenisResumeTimeoutRef.current);
        lenisResumeTimeoutRef.current = null;
      }
    };

    const pauseLenis = () => {
      window.lenis?.stop?.();
      clearLenisResumeTimeout();
      lenisResumeTimeoutRef.current = window.setTimeout(() => {
        window.lenis?.start?.();
        lenisResumeTimeoutRef.current = null;
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
    if (!isMapReady || !mapRef.current) return;
    const source = mapRef.current.getSource(SOURCE_ID) as GeoJsonSourceLike;

    if (source) {
      activePopupRef.current?.remove();
      activePopupRef.current = null;
      source.setData(featureCollection);
      syncAnalysisPaint(mapRef.current);
    }
  }, [featureCollection, isMapReady]);

  useEffect(() => {
    if (!mapRef.current) return;
    activePopupRef.current?.remove();
    activePopupRef.current = null;
    mapRef.current.setStyle(getBasemapStyle(basemapMode));
  }, [basemapMode]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;
    syncAnalysisPaint(mapRef.current);
  }, [analysisMode, analysisPartyKeys, isMapReady]);

  const handleResetView = () => {
    if (!mapRef.current) return;
    activePopupRef.current?.remove();
    activePopupRef.current = null;

    const center: [number, number] = [
      (maxBounds[0][0] + maxBounds[1][0]) / 2,
      (maxBounds[0][1] + maxBounds[1][1]) / 2,
    ];

    mapRef.current.easeTo({
      center,
      zoom: 1.7,
      duration: 900,
      offset: window.matchMedia('(max-width: 720px)').matches ? [0, 10] : [0, 0],
      essential: true,
    });
  };

  return {
    focusLocalOnMap: (local, shouldZoom) => focusLocalRef.current(local, shouldZoom),
    handleResetView,
    isMapReady,
    mapContainerRef,
  };
};
