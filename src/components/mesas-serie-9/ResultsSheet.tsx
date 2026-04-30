import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { PARTY_COLOR_MAP } from './constants';
import { formatNumber } from './data';
import type { VoteSummary, VotingLocal } from './types';

type ResultsSheetProps = {
  local: VotingLocal | null;
  onClose: () => void;
};

const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
const normalizeStatus = (value?: string) =>
  (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const isMesaContabilizada = (estadoActa?: string) => normalizeStatus(estadoActa) === 'contabilizada';

const getMesaSecondaryLabel = (estadoActa?: string, participacionPct?: string) => {
  if (estadoActa && !isMesaContabilizada(estadoActa)) {
    return estadoActa;
  }

  if (participacionPct) {
    return `Participacion ${participacionPct}%`;
  }

  return estadoActa || 'Abrir detalle';
};

const getMesaPrimaryLabel = (estadoActa: string | undefined, summary: VoteSummary) => {
  if (estadoActa && !isMesaContabilizada(estadoActa)) {
    return estadoActa;
  }

  return summary.topOverallParty?.label ?? 'Sin partido destacado';
};

const MesaPendingState = ({
  mesaNumero,
  estadoActa,
}: {
  mesaNumero: string;
  estadoActa?: string;
}) => (
  <section className="serie9-results__panel serie9-results__panel--mesa-detail serie9-results__panel--status">
    <div className="serie9-results__panel-head">
      <div>
        <p className="serie9-results__eyebrow">Mesa {mesaNumero}</p>
        <h4 className="serie9-results__panel-title">{estadoActa || 'Acta pendiente'}</h4>
      </div>
      <div className="serie9-results__leader is-empty">
        <strong>Sin comparativo disponible</strong>
        <span>La mesa aun no esta contabilizada</span>
      </div>
    </div>

    <div className="serie9-results__status-note">
      <strong>Resultados pendientes</strong>
      <p>
        Esta mesa figura como <strong>{estadoActa || 'pendiente'}</strong>. Hasta que el acta pase a
        estado <strong>Contabilizada</strong>, no mostramos ranking, barras ni calculos de votos para
        evitar interpretaciones equivocadas.
      </p>
    </div>
  </section>
);

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
      [...summary.allParties]
        .filter((party) => party.votes > 0)
        .sort((first, second) => {
        if (second.votes !== first.votes) return second.votes - first.votes;
        return first.label.localeCompare(second.label, 'es');
      }),
    [summary.allParties],
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
        {summary.topOverallParty ? (
          <div className="serie9-results__leader">
            <strong>{summary.topOverallParty.label}</strong>
            <span>{formatPercentage(summary.topOverallParty.share)}</span>
          </div>
        ) : (
          <div className="serie9-results__leader is-empty">
            <strong>Sin liderazgo destacado</strong>
            <span>Solo agrupado en Otros</span>
          </div>
        )}
      </div>

      <div className="serie9-results__rank-summary">
        {summary.topOverallParty ? (
          <div className="serie9-results__rank-card">
            <span>1er lugar</span>
            <strong>{summary.topOverallParty.label}</strong>
            <small>
              {formatNumber(summary.topOverallParty.votes)} votos ·{' '}
              {formatPercentage(summary.topOverallParty.share)}
            </small>
          </div>
        ) : null}

        {summary.secondOverallParty ? (
          <div className="serie9-results__rank-card">
            <span>2do lugar</span>
            <strong>{summary.secondOverallParty.label}</strong>
            <small>
              {formatNumber(summary.secondOverallParty.votes)} votos ·{' '}
              {formatPercentage(summary.secondOverallParty.share)}
            </small>
          </div>
        ) : null}

        <div className="serie9-results__rank-card">
          <span>Margen</span>
          <strong>{formatNumber(summary.overallMarginVotes)} votos</strong>
          <small>{formatPercentage(summary.overallMarginShare)}</small>
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
                  backgroundColor: PARTY_COLOR_MAP[party.key] ?? '#94a3b8',
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
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

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

  if (!local || !portalTarget) return null;

  const selectedMesa =
    local.mesas.find((mesa) => mesa.numeroMesa === activeMesa) ?? local.mesas[0] ?? null;

  return createPortal(
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
            subtitle="Todos los partidos presidenciales contabilizados, mas extras de Blanco/Nulo"
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
                  <strong>{getMesaPrimaryLabel(mesa.estadoActa, mesa.results)}</strong>
                  <small>
                    {mesa.estadoActa && !isMesaContabilizada(mesa.estadoActa)
                      ? 'Acta pendiente de contabilizacion'
                      : mesa.results.topOverallParty
                      ? `${formatNumber(mesa.results.topOverallParty.votes)} votos · ${formatPercentage(
                          mesa.results.topOverallParty.share,
                        )}`
                      : mesa.estadoActa || 'Sin votos validos'}
                  </small>
                  <em>{getMesaSecondaryLabel(mesa.estadoActa, mesa.participacionPct)}</em>
                </button>
              ))}
            </div>

            {selectedMesa ? (
              isMesaContabilizada(selectedMesa.estadoActa) ? (
                <VoteComparison
                  key={selectedMesa.numeroMesa}
                  summary={selectedMesa.results}
                  title={`Mesa ${selectedMesa.numeroMesa}`}
                  className="serie9-results__panel--mesa-detail"
                  subtitle={getMesaSecondaryLabel(selectedMesa.estadoActa, selectedMesa.participacionPct)}
                />
              ) : (
                <MesaPendingState
                  mesaNumero={selectedMesa.numeroMesa}
                  estadoActa={selectedMesa.estadoActa}
                />
              )
            ) : null}
          </section>
        </div>
      </div>
    </div>,
    portalTarget,
  );
};

export default ResultsSheet;
