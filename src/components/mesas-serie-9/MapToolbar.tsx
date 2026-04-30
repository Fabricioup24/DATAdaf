import type { CSSProperties, ChangeEvent, FormEvent } from 'react';

import PartyLogo from './PartyLogo';
import { formatNumber } from './data';
import type {
  AnalysisMode,
  MesaSearchResult,
  PartyAnalysisSummary,
  VoteSummary,
} from './types';

type MapToolbarProps = {
  analysisLocalCount: number;
  analysisMode: AnalysisMode;
  analysisMesaCount: number;
  analysisPresidentialSummary: VoteSummary | null;
  comparePartyResults: PartyAnalysisSummary[];
  comparePartySelection: string[];
  distritoOptions: string[];
  handleAnalysisModeChange: (mode: AnalysisMode) => void;
  handleComparePartyChange: (slotIndex: number, event: ChangeEvent<HTMLSelectElement>) => void;
  handleDistritoChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  handleMesaInputBlur: () => void;
  handleMesaInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleMesaInputFocus: () => void;
  handleMesaSubmit: (event: FormEvent<HTMLFormElement>) => void;
  handleMesaSuggestionSelect: (numeroMesa: string) => void;
  handleProvinciaChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  handleRegionChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  handleResetFilters: () => void;
  handleResetView: () => void;
  handleUrbanRuralChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  handleUrbanSubtypeChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  handleWinnerPartyChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  isLoadingStats: boolean;
  localCount: number;
  mesaError: string | null;
  mesaQuery: string;
  mesaSuggestions: MesaSearchResult[];
  mesaSuggestionsOpen: boolean;
  presidentialPartyOptions: Array<{ key: string; label: string }>;
  provinciaOptions: string[];
  regionOptions: string[];
  selectedDistrito: string;
  selectedProvincia: string;
  selectedRegion: string;
  selectedUrbanRural: string;
  selectedUrbanSubtype: string;
  selectedWinnerPartyKey: string;
  visibleMesaCount: number;
  visibleWinningPartyCount: number;
  winnerPartyResult: PartyAnalysisSummary | null;
};

const ComparePartyCard = ({
  party,
}: {
  party: PartyAnalysisSummary;
}) => (
  <article
    className="serie9-map__party-card"
    style={{ '--party-color': party.color } as CSSProperties}
  >
    <div className="serie9-map__party-card-header">
      <PartyLogo color={party.color} label={party.label} logoPath={party.logoPath} size="sm" />
      <div className="serie9-map__party-card-copy">
        <p>{party.label}</p>
        <small>{formatNumber(party.localWins)} locales ganados</small>
      </div>
    </div>
    <strong>{formatNumber(party.votes)}</strong>
    <span>{party.share.toFixed(1)}% de votos validos</span>
    <em>{formatNumber(party.mesaWins)} mesas lideradas</em>
  </article>
);

const MapToolbar = ({
  analysisLocalCount,
  analysisMode,
  analysisMesaCount,
  analysisPresidentialSummary,
  comparePartyResults,
  comparePartySelection,
  distritoOptions,
  handleAnalysisModeChange,
  handleComparePartyChange,
  handleDistritoChange,
  handleMesaInputBlur,
  handleMesaInputChange,
  handleMesaInputFocus,
  handleMesaSubmit,
  handleMesaSuggestionSelect,
  handleProvinciaChange,
  handleRegionChange,
  handleResetFilters,
  handleResetView,
  handleUrbanRuralChange,
  handleUrbanSubtypeChange,
  handleWinnerPartyChange,
  isLoadingStats,
  localCount,
  mesaError,
  mesaQuery,
  mesaSuggestions,
  mesaSuggestionsOpen,
  presidentialPartyOptions,
  provinciaOptions,
  regionOptions,
  selectedDistrito,
  selectedProvincia,
  selectedRegion,
  selectedUrbanRural,
  selectedUrbanSubtype,
  selectedWinnerPartyKey,
  visibleMesaCount,
  visibleWinningPartyCount,
  winnerPartyResult,
}: MapToolbarProps) => (
  <div className="serie9-map__toolbar" aria-label="Controles del mapa de locales">
    <div className="serie9-map__toolbar-main">
      <div className="serie9-map__sidebar">
        <section className="serie9-map__control-panel serie9-map__control-panel--territorial">
          <div className="serie9-map__stats">
            <div className="serie9-map__stat-card">
              <strong>{isLoadingStats ? '...' : formatNumber(localCount)}</strong>
              <span>Locales visibles</span>
            </div>
            <div className="serie9-map__stat-card">
              <strong>{isLoadingStats ? '...' : formatNumber(visibleMesaCount)}</strong>
              <span>Mesas representadas</span>
            </div>
          </div>

          <div className="serie9-map__actions">
            <button type="button" className="serie9-map__ghost-action" onClick={handleResetFilters}>
              Restablecer filtros
            </button>
            <button type="button" className="serie9-map__reset" onClick={handleResetView}>
              Restablecer
            </button>
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
          </div>
        </section>

        <section className="serie9-map__control-panel serie9-map__control-panel--analysis">
          <div className="serie9-map__analysis-mode">
            <p className="serie9-map__analysis-label">Modo de análisis</p>
            <div
              className="serie9-map__analysis-toggle"
              role="tablist"
              aria-label="Modo de análisis"
            >
              <button
                type="button"
                role="tab"
                aria-selected={analysisMode === 'winner'}
                className={analysisMode === 'winner' ? 'is-active' : ''}
                onClick={() => handleAnalysisModeChange('winner')}
              >
                Ganador
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={analysisMode === 'compare'}
                className={analysisMode === 'compare' ? 'is-active' : ''}
                onClick={() => handleAnalysisModeChange('compare')}
              >
                Comparar
              </button>
            </div>
          </div>

          {analysisMode === 'winner' ? (
            <div className="serie9-map__analysis-picker">
              <label className="serie9-map__select-field">
                <span>¿Cómo le fue al partido de?</span>
                <select
                  value={selectedWinnerPartyKey}
                  onChange={handleWinnerPartyChange}
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
            </div>
          ) : (
            <div className="serie9-map__analysis-compare-grid">
              {comparePartySelection.map((selectedKey, slotIndex) => (
                <label key={`compare-party-${slotIndex + 1}`} className="serie9-map__select-field">
                  <span>{slotIndex === 0 ? 'Partido 1' : 'Partido 2'}</span>
                  <select
                    value={selectedKey}
                    onChange={(event) => handleComparePartyChange(slotIndex, event)}
                    disabled={presidentialPartyOptions.length === 0}
                  >
                    <option value="">
                      {presidentialPartyOptions.length === 0
                        ? 'Sin votos visibles'
                        : slotIndex === 0
                          ? 'Selecciona un partido'
                          : 'Selecciona un segundo partido'}
                    </option>
                    {presidentialPartyOptions.map((party) => (
                      <option
                        key={party.key}
                        value={party.key}
                        disabled={
                          comparePartySelection.includes(party.key) && selectedKey !== party.key
                        }
                      >
                        {party.label}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="serie9-map__results-column">
        <section
          className="serie9-map__presidential-panel"
          aria-label="Resultados presidenciales del subconjunto visible"
        >
          <div className="serie9-map__presidential-head">
            <div>
              <p className="serie9-map__presidential-eyebrow">Solo Presidencia</p>
              <h3 className="serie9-map__presidential-title">
                Resultados del subconjunto visible
              </h3>
            </div>
            <span className="serie9-map__presidential-note">
              {formatNumber(analysisLocalCount)} locales y {formatNumber(analysisMesaCount)} mesas
              segun los filtros activos. El ausentismo se calcula solo con{' '}
              {formatNumber(analysisPresidentialSummary?.countedMesas ?? 0)} mesas contabilizadas.
            </span>
          </div>

          <div className="serie9-map__presidential-metrics">
            <div className="serie9-map__stat-card">
              <strong>
                {analysisPresidentialSummary
                  ? formatNumber(analysisPresidentialSummary.emittedVotes)
                  : '0'}
              </strong>
              <span>Emitidos</span>
            </div>
            <div className="serie9-map__stat-card">
              <strong>
                {analysisPresidentialSummary
                  ? formatNumber(analysisPresidentialSummary.validVotes)
                  : '0'}
              </strong>
              <span>Validos</span>
            </div>
            <div className="serie9-map__stat-card">
              <strong>
                {analysisPresidentialSummary
                  ? formatNumber(analysisPresidentialSummary.extras.blancoVotes)
                  : '0'}
              </strong>
              <span>Blancos</span>
            </div>
            <div className="serie9-map__stat-card">
              <strong>
                {analysisPresidentialSummary
                  ? formatNumber(analysisPresidentialSummary.eligibleVoters)
                  : '0'}
              </strong>
              <span>Habiles</span>
            </div>
            <div className="serie9-map__stat-card">
              <strong>
                {analysisPresidentialSummary
                  ? formatNumber(analysisPresidentialSummary.abstentionVotes)
                  : '0'}
              </strong>
              <span>Ausentes</span>
              <small>
                {analysisPresidentialSummary
                  ? `${analysisPresidentialSummary.abstentionShare.toFixed(1)}% de habiles`
                  : '0.0% de habiles'}
              </small>
            </div>
            <div className="serie9-map__stat-card">
              <strong>
                {analysisPresidentialSummary
                  ? formatNumber(analysisPresidentialSummary.pendingMesas)
                  : '0'}
              </strong>
              <span>Enviadas al JEE</span>
            </div>
          </div>

          {analysisMode === 'winner' ? (
            <div className="serie9-map__presidential-party-cards">
              {winnerPartyResult ? (
                <ComparePartyCard party={winnerPartyResult} />
              ) : (
                <p className="serie9-map__presidential-hint">
                  Selecciona un partido para pintar los locales donde fue ganador y revisar su desempeño dentro del subconjunto visible.
                </p>
              )}
            </div>
          ) : (
            <div className="serie9-map__presidential-party-cards">
              {comparePartyResults.length > 0 ? (
                comparePartyResults.map((party) => (
                  <ComparePartyCard key={party.key} party={party} />
                ))
              ) : (
                <p className="serie9-map__presidential-hint">
                  Selecciona dos partidos para comparar en que locales gano cada uno dentro del subconjunto visible.
                </p>
              )}
            </div>
          )}

          {(winnerPartyResult || comparePartyResults.length > 0) && (
            <p className="serie9-map__presidential-hint">
              {formatNumber(visibleWinningPartyCount)} locales del subconjunto visible tienen como
              ganador a{' '}
              {analysisMode === 'winner' ? 'ese partido' : 'uno de los partidos seleccionados'}.
            </p>
          )}

          {analysisPresidentialSummary?.pendingMesas ? (
            <p className="serie9-map__presidential-hint">
              {formatNumber(analysisPresidentialSummary.pendingMesas)} mesas enviadas al JEE no se
              incluyen en el calculo de ausentismo ni en los totales presidenciales.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  </div>
);

export default MapToolbar;
