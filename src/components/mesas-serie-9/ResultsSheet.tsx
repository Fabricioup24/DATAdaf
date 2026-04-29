import React, { useEffect, useMemo, useState } from 'react';

import { FIXED_PARTY_COLOR_MAP } from './constants';
import { formatNumber } from './data';
import type { VoteSummary, VotingLocal } from './types';

type ResultsSheetProps = {
  local: VotingLocal | null;
  onClose: () => void;
};

const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

const VoteComparison = ({
  summary,
  title,
  subtitle,
  className,
}: {
  summary: VoteSummary;
  title: string;
  subtitle?: string;
  className?: string;
}) => {
  const sortedParties = useMemo(
    () =>
      [...summary.parties].sort((first, second) => {
        if (second.votes !== first.votes) return second.votes - first.votes;
        return first.label.localeCompare(second.label, 'es');
      }),
    [summary.parties],
  );

  const maxVotes = useMemo(
    () => Math.max(1, ...sortedParties.map((party) => party.votes), summary.otrosVotes),
    [sortedParties, summary.otrosVotes],
  );

  return (
    <section className={`serie9-results__panel${className ? ` ${className}` : ''}`}>
      <div className="serie9-results__panel-head">
        <div>
          <p className="serie9-results__eyebrow">{title}</p>
          {subtitle ? <h4 className="serie9-results__panel-title">{subtitle}</h4> : null}
        </div>
        {summary.topParty ? (
          <div className="serie9-results__leader">
            <strong>{summary.topParty.label}</strong>
            <span>{formatPercentage(summary.topParty.share)}</span>
          </div>
        ) : (
          <div className="serie9-results__leader is-empty">
            <strong>Sin liderazgo destacado</strong>
            <span>Solo agrupado en Otros</span>
          </div>
        )}
      </div>

      <div className="serie9-results__rank-summary">
        {summary.topParty ? (
          <div className="serie9-results__rank-card">
            <span>1er lugar</span>
            <strong>{summary.topParty.label}</strong>
            <small>
              {formatNumber(summary.topParty.votes)} votos · {formatPercentage(summary.topParty.share)}
            </small>
          </div>
        ) : null}

        {summary.secondParty ? (
          <div className="serie9-results__rank-card">
            <span>2do lugar</span>
            <strong>{summary.secondParty.label}</strong>
            <small>
              {formatNumber(summary.secondParty.votes)} votos · {formatPercentage(summary.secondParty.share)}
            </small>
          </div>
        ) : null}

        <div className="serie9-results__rank-card">
          <span>Margen</span>
          <strong>{formatNumber(summary.marginVotes)} votos</strong>
          <small>{formatPercentage(summary.marginShare)}</small>
        </div>
      </div>

      <div className="serie9-results__comparison">
        {sortedParties.map((party) => (
          <div key={party.key} className="serie9-results__row">
            <div className="serie9-results__row-copy">
              <strong>{party.label}</strong>
              <span>
                {formatNumber(party.votes)} votos · {formatPercentage(party.share)}
              </span>
            </div>
            <div className="serie9-results__bar-track" aria-hidden="true">
              <div
                className="serie9-results__bar-fill"
                style={{
                  width: `${(party.votes / maxVotes) * 100}%`,
                  backgroundColor: FIXED_PARTY_COLOR_MAP[party.key],
                }}
              />
            </div>
          </div>
        ))}

        <div className="serie9-results__row serie9-results__row--other">
          <div className="serie9-results__row-copy">
            <strong>Otros</strong>
            <span>
              {formatNumber(summary.otrosVotes)} votos · {formatPercentage(summary.otrosShare)}
            </span>
          </div>
          <div className="serie9-results__bar-track" aria-hidden="true">
            <div
              className="serie9-results__bar-fill serie9-results__bar-fill--other"
              style={{ width: `${(summary.otrosVotes / maxVotes) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="serie9-results__extras">
        <div className="serie9-results__extra-pill">
          <span>Blanco</span>
          <strong>{formatNumber(summary.extras.blancoVotes)}</strong>
          <small>{formatPercentage(summary.extras.blancoShare)}</small>
        </div>
        <div className="serie9-results__extra-pill">
          <span>Nulo</span>
          <strong>{formatNumber(summary.extras.nuloVotes)}</strong>
          <small>{formatPercentage(summary.extras.nuloShare)}</small>
        </div>
      </div>
    </section>
  );
};

const ResultsSheet = ({ local, onClose }: ResultsSheetProps) => {
  const [activeMesa, setActiveMesa] = useState<string | null>(null);

  useEffect(() => {
    if (!local) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.lenis?.stop?.();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.lenis?.start?.();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [local, onClose]);

  useEffect(() => {
    setActiveMesa(local?.mesas[0]?.numeroMesa ?? null);
  }, [local]);

  if (!local) return null;

  const selectedMesa =
    local.mesas.find((mesa) => mesa.numeroMesa === activeMesa) ?? local.mesas[0] ?? null;

  return (
    <div
      className="serie9-results-sheet"
      role="dialog"
      aria-modal="true"
      aria-label={`Resultados del local ${local.nombreLocal || local.numeroLocal}`}
    >
      <button
        type="button"
        className="serie9-results-sheet__backdrop"
        aria-label="Cerrar panel de resultados"
        onClick={onClose}
      />

      <div className="serie9-results-sheet__card">
        <div className="serie9-results-sheet__header">
          <div>
            <p className="serie9-results__eyebrow">Resultados presidenciales</p>
            <h3 className="serie9-results-sheet__title">
              {local.nombreLocal || `Local ${local.numeroLocal}`}
            </h3>
            <p className="serie9-results-sheet__location">
              {[local.centroPoblado, local.distrito, local.provincia, local.region]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>

          <button
            type="button"
            className="serie9-results-sheet__close"
            onClick={onClose}
            aria-label="Cerrar panel de resultados"
          >
            ×
          </button>
        </div>

        <div className="serie9-results-sheet__body" data-lenis-prevent>
          <div className="serie9-results-sheet__stats">
            <div className="serie9-results-sheet__stat">
              <span>Local</span>
              <strong>{local.numeroLocal}</strong>
            </div>
            <div className="serie9-results-sheet__stat">
              <span>Mesas</span>
              <strong>{formatNumber(local.mesas.length)}</strong>
            </div>
            <div className="serie9-results-sheet__stat">
              <span>Validos</span>
              <strong>{formatNumber(local.results.validVotes)}</strong>
            </div>
            <div className="serie9-results-sheet__stat">
              <span>Emitidos</span>
              <strong>{formatNumber(local.results.emittedVotes)}</strong>
            </div>
          </div>

          <VoteComparison
            summary={local.results}
            title="Comparativo del local"
            subtitle="Siete partidos editoriales, Otros residual y extras de Blanco/Nulo"
          />

          <section className="serie9-results-sheet__mesa-block">
            <div className="serie9-results-sheet__section-head">
              <div>
                <p className="serie9-results__eyebrow">Desagregado por mesa</p>
                <h4 className="serie9-results-sheet__section-title">Explora cada mesa</h4>
              </div>
              <span className="serie9-results-sheet__section-note">
                Presiona una tarjeta para abrir su calculo. Otros siempre aparece al final y no entra al ranking.
              </span>
            </div>

            <div className="serie9-results-sheet__mesa-cards" role="tablist" aria-label="Mesas del local">
              {local.mesas.map((mesa) => (
                <button
                  key={mesa.numeroMesa}
                  type="button"
                  role="tab"
                  aria-selected={selectedMesa?.numeroMesa === mesa.numeroMesa}
                  className={`serie9-results-sheet__mesa-card${
                    selectedMesa?.numeroMesa === mesa.numeroMesa ? ' is-active' : ''
                  }`}
                  onClick={() => setActiveMesa(mesa.numeroMesa)}
                >
                  <span className="serie9-results-sheet__mesa-card-label">Mesa {mesa.numeroMesa}</span>
                  <strong>
                    {mesa.results.topParty?.label ?? 'Sin partido destacado'}
                  </strong>
                  <small>
                    {mesa.results.topParty
                      ? `${formatNumber(mesa.results.topParty.votes)} votos · ${formatPercentage(
                          mesa.results.topParty.share,
                        )}`
                      : mesa.estadoActa || 'Sin votos validos'}
                  </small>
                  <em>
                    {mesa.participacionPct
                      ? `Participacion ${mesa.participacionPct}%`
                      : mesa.estadoActa || 'Abrir detalle'}
                  </em>
                </button>
              ))}
            </div>

            {selectedMesa ? (
              <VoteComparison
                key={selectedMesa.numeroMesa}
                summary={selectedMesa.results}
                title={`Mesa ${selectedMesa.numeroMesa}`}
                className="serie9-results__panel--mesa-detail"
                subtitle={
                  selectedMesa.participacionPct
                    ? `Participacion ${selectedMesa.participacionPct}%`
                    : selectedMesa.estadoActa || undefined
                }
              />
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ResultsSheet;
