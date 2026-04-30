import type { ChangeEvent, FormEvent } from 'react';

import { formatNumber } from './data';
import type { MesaSearchResult, VoteSummary } from './types';

const PARTY_SLOT_LABELS = [
  'Selecciona un partido',
  'Selecciona un segundo partido',
  'Selecciona un tercer partido',
  'Selecciona un cuarto partido',
];

type MapToolbarProps = {
  handleDistritoChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  handleMesaInputBlur: () => void;
  handleMesaInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleMesaInputFocus: () => void;
  handleMesaSubmit: (event: FormEvent<HTMLFormElement>) => void;
  handleMesaSuggestionSelect: (numeroMesa: string) => void;
  handlePartyChange: (slotIndex: number, event: ChangeEvent<HTMLSelectElement>) => void;
  handleProvinciaChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  handleRegionChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  handleResetFilters: () => void;
  handleResetView: () => void;
  handleUrbanRuralChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  handleUrbanSubtypeChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  isLoadingStats: boolean;
  localCount: number;
  mesaError: string | null;
  mesaQuery: string;
  mesaSuggestions: MesaSearchResult[];
  mesaSuggestionsOpen: boolean;
  presidentialPartyOptions: Array<{ key: string; label: string }>;
  selectedDistrito: string;
  selectedPartyKeys: string[];
  selectedPartyResults: Array<VoteSummary['allParties'][number]>;
  selectedProvincia: string;
  selectedRegion: string;
  selectedUrbanRural: string;
  selectedUrbanSubtype: string;
  provinciaOptions: string[];
  regionOptions: string[];
  distritoOptions: string[];
  visibleMesaCount: number;
  visiblePresidentialSummary: VoteSummary | null;
};

const MapToolbar = ({
  distritoOptions,
  handleDistritoChange,
  handleMesaInputBlur,
  handleMesaInputChange,
  handleMesaInputFocus,
  handleMesaSubmit,
  handleMesaSuggestionSelect,
  handlePartyChange,
  handleProvinciaChange,
  handleRegionChange,
  handleResetFilters,
  handleResetView,
  handleUrbanRuralChange,
  handleUrbanSubtypeChange,
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
  selectedPartyKeys,
  selectedPartyResults,
  selectedProvincia,
  selectedRegion,
  selectedUrbanRural,
  selectedUrbanSubtype,
  visibleMesaCount,
  visiblePresidentialSummary,
}: MapToolbarProps) => (
  <div className="serie9-map__toolbar" aria-label="Controles del mapa de locales">
    <div className="serie9-map__toolbar-main">
      <div className="serie9-map__column serie9-map__column--interactions">
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
      </div>

      <div className="serie9-map__column serie9-map__column--filters">
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

        <div className="serie9-map__presidential-selectors">
          {selectedPartyKeys.map((selectedPartyKey, slotIndex) => (
            <label key={`party-slot-${slotIndex + 1}`} className="serie9-map__select-field">
              <span>{`Partido ${slotIndex + 1}`}</span>
              <select
                value={selectedPartyKey}
                onChange={(event) => handlePartyChange(slotIndex, event)}
                disabled={presidentialPartyOptions.length === 0}
              >
                <option value="">
                  {presidentialPartyOptions.length === 0
                    ? 'Sin votos visibles'
                    : PARTY_SLOT_LABELS[slotIndex] ?? 'Selecciona un partido'}
                </option>
                {presidentialPartyOptions.map((party) => (
                  <option
                    key={party.key}
                    value={party.key}
                    disabled={
                      selectedPartyKeys.includes(party.key) && selectedPartyKey !== party.key
                    }
                  >
                    {party.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>

      <div className="serie9-map__column serie9-map__column--summary">
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
              {formatNumber(localCount)} locales y {formatNumber(visibleMesaCount)} mesas segun los
              filtros activos. El ausentismo se calcula solo con{' '}
              {formatNumber(visiblePresidentialSummary?.countedMesas ?? 0)} mesas contabilizadas.
            </span>
          </div>

          <div className="serie9-map__presidential-metrics">
            <div className="serie9-map__stat-card">
              <strong>
                {visiblePresidentialSummary
                  ? formatNumber(visiblePresidentialSummary.emittedVotes)
                  : '0'}
              </strong>
              <span>Emitidos</span>
            </div>
            <div className="serie9-map__stat-card">
              <strong>
                {visiblePresidentialSummary
                  ? formatNumber(visiblePresidentialSummary.validVotes)
                  : '0'}
              </strong>
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
            {selectedPartyResults.map((partyResult) => (
              <article key={partyResult.key} className="serie9-map__party-card">
                <p>{partyResult.label}</p>
                <strong>{formatNumber(partyResult.votes)}</strong>
                <span>{partyResult.share.toFixed(1)}% de votos validos</span>
              </article>
            ))}
          </div>

          {selectedPartyResults.length === 0 ? (
            <p className="serie9-map__presidential-hint">
              Selecciona entre uno y cuatro partidos para calcular sus votos dentro del subconjunto visible.
            </p>
          ) : null}

          {visiblePresidentialSummary?.pendingMesas ? (
            <p className="serie9-map__presidential-hint">
              {formatNumber(visiblePresidentialSummary.pendingMesas)} mesas enviadas al JEE no se
              incluyen en el calculo de ausentismo ni en los totales presidenciales.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  </div>
);

export default MapToolbar;
