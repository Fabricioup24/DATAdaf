import React, { useRef, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';

import MapToolbar from './MapToolbar';
import ResultsSheet from './ResultsSheet';
import { useSerie9Data } from './hooks/useSerie9Data';
import { useSerie9Filters } from './hooks/useSerie9Filters';
import { useSerie9Map } from './hooks/useSerie9Map';
import type { MapContainerProps, VotingLocal } from './types';

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
  const [resultsLocal, setResultsLocal] = useState<VotingLocal | null>(null);
  const focusLocalOnMapRef = useRef<(local: VotingLocal, shouldZoom?: boolean) => void>(() => undefined);
  const { error, isLoading, locals, localsByIdRef, stats } = useSerie9Data({ dataUrl });

  const filters = useSerie9Filters({
    locals,
    localsByIdRef,
    onLocalSearchMatch: (local, shouldZoom) => focusLocalOnMapRef.current(local, shouldZoom),
  });

  const { focusLocalOnMap, handleMapWheelCapture, handleResetView, mapContainerRef } =
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

  return (
    <div className={`map-premium-wrapper serie9-map${resultsLocal ? ' is-results-open' : ''}`}>
      <MapToolbar
        basemapMode={filters.basemapMode}
        distritoOptions={filters.distritoOptions}
        handleDistritoChange={filters.handleDistritoChange}
        handleMesaInputBlur={filters.handleMesaInputBlur}
        handleMesaInputChange={filters.handleMesaInputChange}
        handleMesaInputFocus={filters.handleMesaInputFocus}
        handleMesaSubmit={filters.handleMesaSubmit}
        handleMesaSuggestionSelect={filters.handleMesaSuggestionSelect}
        handlePartyOneChange={filters.handlePartyOneChange}
        handlePartyTwoChange={filters.handlePartyTwoChange}
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
        selectedPartyOne={filters.selectedPartyOne}
        selectedPartyOneResult={filters.selectedPartyOneResult}
        selectedPartyTwo={filters.selectedPartyTwo}
        selectedPartyTwoResult={filters.selectedPartyTwoResult}
        selectedProvincia={filters.selectedProvincia}
        selectedRegion={filters.selectedRegion}
        selectedUrbanRural={filters.selectedUrbanRural}
        selectedUrbanSubtype={filters.selectedUrbanSubtype}
        setBasemapMode={filters.setBasemapMode}
        visibleMesaCount={filters.visibleMesaCount}
        visiblePresidentialSummary={filters.visiblePresidentialSummary}
      />

      <div
        ref={mapContainerRef}
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
