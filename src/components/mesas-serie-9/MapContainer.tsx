import React, { useEffect, useRef, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';

import MapToolbar from './MapToolbar';
import ResultsSheet from './ResultsSheet';
import { useSerie9Data } from './hooks/useSerie9Data';
import { useSerie9Filters } from './hooks/useSerie9Filters';
import { useSerie9Map } from './hooks/useSerie9Map';
import type { BasemapMode, MapContainerProps, VotingLocal } from './types';

const DEFAULT_INITIAL_CENTER: [number, number] = [-75.0152, -9.19];
const DEFAULT_MAX_BOUNDS: [[number, number], [number, number]] = [
  [-97.0, -29.0],
  [-53.0, 12.0],
];
const BASEMAP_LABELS: Record<BasemapMode, string> = {
  croquis: 'Croquis',
  satelite: 'Satelite',
};

const MapContainer = ({
  dataUrl = '/pdfs/01_base_4703_mesas_serie9_clasificacion_oficial_urbano_rural.csv',
  initialCenter = DEFAULT_INITIAL_CENTER,
  initialZoom = 5,
  height = '860px',
  maxBounds = DEFAULT_MAX_BOUNDS,
}: MapContainerProps) => {
  const [resultsLocal, setResultsLocal] = useState<VotingLocal | null>(null);
  const [isBasemapMenuOpen, setIsBasemapMenuOpen] = useState(false);
  const basemapControlRef = useRef<HTMLDivElement | null>(null);
  const focusLocalOnMapRef = useRef<(local: VotingLocal, shouldZoom?: boolean) => void>(() => undefined);
  const { error, isLoading, locals, localsByIdRef, stats } = useSerie9Data({ dataUrl });

  const filters = useSerie9Filters({
    locals,
    localsByIdRef,
    onLocalSearchMatch: (local, shouldZoom) => focusLocalOnMapRef.current(local, shouldZoom),
  });

  const { focusLocalOnMap, handleResetView, mapContainerRef } =
    useSerie9Map({
      basemapMode: filters.basemapMode,
      featureCollection: filters.featureCollection,
      initialCenter,
      initialZoom,
      localsByIdRef,
      maxBounds,
      onViewResults: setResultsLocal,
    });

  focusLocalOnMapRef.current = focusLocalOnMap;

  useEffect(() => {
    if (!isBasemapMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (
        basemapControlRef.current &&
        target instanceof Node &&
        !basemapControlRef.current.contains(target)
      ) {
        setIsBasemapMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsBasemapMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isBasemapMenuOpen]);

  return (
    <div className="map-premium-wrapper serie9-map">
      <MapToolbar
        distritoOptions={filters.distritoOptions}
        handleDistritoChange={filters.handleDistritoChange}
        handleMesaInputBlur={filters.handleMesaInputBlur}
        handleMesaInputChange={filters.handleMesaInputChange}
        handleMesaInputFocus={filters.handleMesaInputFocus}
        handleMesaSubmit={filters.handleMesaSubmit}
        handleMesaSuggestionSelect={filters.handleMesaSuggestionSelect}
        handlePartyChange={filters.handlePartyChange}
        handleProvinciaChange={filters.handleProvinciaChange}
        handleRegionChange={filters.handleRegionChange}
        handleResetFilters={filters.handleResetFilters}
        handleResetView={handleResetView}
        handleUrbanRuralChange={filters.handleUrbanRuralChange}
        handleUrbanSubtypeChange={filters.handleUrbanSubtypeChange}
        isLoadingStats={!stats}
        localCount={filters.featureCollection.features.length}
        mesaError={filters.mesaError}
        mesaQuery={filters.mesaQuery}
        mesaSuggestions={filters.mesaSuggestions}
        mesaSuggestionsOpen={filters.mesaSuggestionsOpen}
        presidentialPartyOptions={filters.presidentialPartyOptions}
        provinciaOptions={filters.provinciaOptions}
        regionOptions={filters.regionOptions}
        selectedDistrito={filters.selectedDistrito}
        selectedPartyKeys={filters.selectedPartyKeys}
        selectedPartyResults={filters.selectedPartyResults}
        selectedProvincia={filters.selectedProvincia}
        selectedRegion={filters.selectedRegion}
        selectedUrbanRural={filters.selectedUrbanRural}
        selectedUrbanSubtype={filters.selectedUrbanSubtype}
        visibleMesaCount={filters.visibleMesaCount}
        visiblePresidentialSummary={filters.visiblePresidentialSummary}
      />

      <div className="serie9-map__canvas-shell">
        <div
          className="serie9-map__floating-basemap"
          ref={basemapControlRef}
          role="group"
          aria-label="Cambiar capa base del mapa"
        >
          <button
            type="button"
            className="serie9-map__floating-basemap-button"
            onClick={() => setIsBasemapMenuOpen((currentValue) => !currentValue)}
            aria-expanded={isBasemapMenuOpen}
            aria-controls="serie9-basemap-menu"
            aria-label="Abrir selector de capas del mapa"
          >
            <span
              className={`serie9-map__floating-basemap-preview serie9-map__floating-basemap-preview--${filters.basemapMode}`}
              aria-hidden="true"
            >
              <span className="serie9-map__floating-basemap-preview-grid" />
            </span>
            <span className="serie9-map__floating-basemap-copy">
              <strong>Capas</strong>
              <small>{BASEMAP_LABELS[filters.basemapMode]}</small>
            </span>
          </button>

          <div
            id="serie9-basemap-menu"
            className={`serie9-map__floating-basemap-menu${isBasemapMenuOpen ? ' is-open' : ''}`}
          >
            {(['croquis', 'satelite'] as BasemapMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                className={filters.basemapMode === mode ? 'is-active' : ''}
                onClick={() => {
                  filters.setBasemapMode(mode);
                  setIsBasemapMenuOpen(false);
                }}
              >
                {BASEMAP_LABELS[mode]}
              </button>
            ))}
          </div>
        </div>

        <div
          ref={mapContainerRef}
          style={{ height }}
          className="serie9-map__canvas w-full bg-gray-100"
          data-lenis-prevent
        />
      </div>

      {(isLoading || error) && (
        <div className="serie9-map__status">{isLoading ? 'Cargando coordenadas...' : error}</div>
      )}

      <ResultsSheet local={resultsLocal} onClose={() => setResultsLocal(null)} />
    </div>
  );
};

export default MapContainer;
