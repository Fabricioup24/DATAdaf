import {
  EMPTY_FEATURE_COLLECTION,
  FIXED_PARTIES,
  PRECISION_OPTIONS,
  PRESIDENTIAL_BLANCO_COLUMN,
  PRESIDENTIAL_IMPUGNADO_COLUMN,
  PRESIDENTIAL_NULO_COLUMN,
} from './constants';
import type {
  CsvRow,
  FixedPartyKey,
  MapStats,
  PointFeatureCollection,
  PrecisionCoord,
  VoteSummary,
  VotingLocal,
  VotingMesa,
} from './types';

export const createSelectedFeatureCollection = (local: VotingLocal | null): PointFeatureCollection => ({
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
    : EMPTY_FEATURE_COLLECTION.features,
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

export const parseCsvObjects = (text: string): CsvRow[] => {
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

const toInt = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toPrecisionCoord = (value: string): PrecisionCoord | null => {
  if (PRECISION_OPTIONS.includes(value as PrecisionCoord)) {
    return value as PrecisionCoord;
  }
  return null;
};

const buildLocalId = (row: CsvRow): string => {
  const parts = [row.numero_local, row.region, row.provincia, row.distrito, row.lat, row.lng];
  return parts.join('|');
};

type VoteAccumulator = {
  emittedVotes: number;
  validVotes: number;
  otrosVotes: number;
  blancoVotes: number;
  nuloVotes: number;
  fixedVotes: Record<FixedPartyKey, number>;
};

const NON_PARTY_PRESIDENTIAL_COLUMNS = new Set([
  'presidencial_estado_acta',
  'presidencial_electores_habiles',
  'presidencial_votos_emitidos',
  'presidencial_votos_validos',
  'presidencial_participacion_pct',
  'presidencial_centro_poblado',
  'presidencial_local_web',
  PRESIDENTIAL_BLANCO_COLUMN,
  PRESIDENTIAL_NULO_COLUMN,
  PRESIDENTIAL_IMPUGNADO_COLUMN,
]);

const createVoteAccumulator = (): VoteAccumulator => ({
  emittedVotes: 0,
  validVotes: 0,
  otrosVotes: 0,
  blancoVotes: 0,
  nuloVotes: 0,
  fixedVotes: FIXED_PARTIES.reduce(
    (accumulator, party) => {
      accumulator[party.key] = 0;
      return accumulator;
    },
    {} as Record<FixedPartyKey, number>,
  ),
});

const sumVoteAccumulator = (target: VoteAccumulator, source: VoteAccumulator) => {
  target.emittedVotes += source.emittedVotes;
  target.validVotes += source.validVotes;
  target.otrosVotes += source.otrosVotes;
  target.blancoVotes += source.blancoVotes;
  target.nuloVotes += source.nuloVotes;

  FIXED_PARTIES.forEach((party) => {
    target.fixedVotes[party.key] += source.fixedVotes[party.key];
  });
};

const finalizeVoteAccumulator = (accumulator: VoteAccumulator): VoteSummary => {
  const validVotes = accumulator.validVotes;
  const emittedVotes = accumulator.emittedVotes;
  const parties = FIXED_PARTIES.map((party) => {
    const votes = accumulator.fixedVotes[party.key];
    return {
      key: party.key,
      label: party.label,
      votes,
      share: validVotes > 0 ? (votes / validVotes) * 100 : 0,
    };
  });

  const rankedParties = [...parties]
    .filter((party) => party.votes > 0)
    .sort((first, second) => {
      if (second.votes !== first.votes) return second.votes - first.votes;
      return first.label.localeCompare(second.label, 'es');
    });

  const topParty = rankedParties[0] ?? null;
  const secondParty = rankedParties[1] ?? null;
  const marginVotes =
    topParty && secondParty ? topParty.votes - secondParty.votes : topParty?.votes ?? 0;
  const marginShare =
    topParty && secondParty ? Math.max(0, topParty.share - secondParty.share) : topParty?.share ?? 0;

  return {
    parties,
    rankedParties,
    otrosVotes: accumulator.otrosVotes,
    otrosShare: validVotes > 0 ? (accumulator.otrosVotes / validVotes) * 100 : 0,
    extras: {
      blancoVotes: accumulator.blancoVotes,
      blancoShare: emittedVotes > 0 ? (accumulator.blancoVotes / emittedVotes) * 100 : 0,
      nuloVotes: accumulator.nuloVotes,
      nuloShare: emittedVotes > 0 ? (accumulator.nuloVotes / emittedVotes) * 100 : 0,
    },
    validVotes,
    emittedVotes,
    topParty,
    secondParty,
    marginVotes,
    marginShare,
  };
};

const buildVoteSummaryFromRow = (
  row: CsvRow,
  presidentialPartyColumns: string[],
  fixedPartyColumns: Set<string>,
): VoteSummary => {
  const accumulator = createVoteAccumulator();
  accumulator.emittedVotes = toInt(row.presidencial_votos_emitidos);
  accumulator.validVotes = toInt(row.presidencial_votos_validos);
  accumulator.blancoVotes = toInt(row[PRESIDENTIAL_BLANCO_COLUMN]);
  accumulator.nuloVotes = toInt(row[PRESIDENTIAL_NULO_COLUMN]);

  FIXED_PARTIES.forEach((party) => {
    accumulator.fixedVotes[party.key] = toInt(row[party.column]);
  });

  presidentialPartyColumns.forEach((column) => {
    if (fixedPartyColumns.has(column)) return;
    if (
      column === PRESIDENTIAL_BLANCO_COLUMN ||
      column === PRESIDENTIAL_NULO_COLUMN ||
      column === PRESIDENTIAL_IMPUGNADO_COLUMN
    ) {
      return;
    }

    accumulator.otrosVotes += toInt(row[column]);
  });

  return finalizeVoteAccumulator(accumulator);
};

export const aggregateRows = (rows: CsvRow[]): { locals: VotingLocal[]; stats: MapStats } => {
  const localsById = new Map<string, VotingLocal>();
  let plottedRows = 0;
  let missingRows = 0;
  const presidentialPartyColumns =
    rows[0] === undefined
      ? []
      : Object.keys(rows[0]).filter(
          (header) =>
            header.startsWith('presidencial_') && !NON_PARTY_PRESIDENTIAL_COLUMNS.has(header),
        );
  const fixedPartyColumns = new Set(FIXED_PARTIES.map((party) => party.column));

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
    const results = buildVoteSummaryFromRow(row, presidentialPartyColumns, fixedPartyColumns);
    const mesa: VotingMesa = {
      numeroMesa: row.numero_mesa,
      estadoActa: row.presidencial_estado_acta,
      electoresHabiles: row.presidencial_electores_habiles,
      votosEmitidos: row.presidencial_votos_emitidos,
      participacionPct: row.presidencial_participacion_pct,
      results,
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
      results,
      mesas: [mesa],
    });
  });

  const locals = Array.from(localsById.values()).map((local) => ({
    ...local,
    results: finalizeVoteAccumulator(
      local.mesas.reduce((accumulator, mesa) => {
        const mesaAccumulator = createVoteAccumulator();
        mesaAccumulator.emittedVotes = mesa.results.emittedVotes;
        mesaAccumulator.validVotes = mesa.results.validVotes;
        mesaAccumulator.otrosVotes = mesa.results.otrosVotes;
        mesaAccumulator.blancoVotes = mesa.results.extras.blancoVotes;
        mesaAccumulator.nuloVotes = mesa.results.extras.nuloVotes;

        mesa.results.parties.forEach((party) => {
          mesaAccumulator.fixedVotes[party.key] = party.votes;
        });

        sumVoteAccumulator(accumulator, mesaAccumulator);
        return accumulator;
      }, createVoteAccumulator()),
    ),
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

export const buildFeatureCollection = (
  locals: VotingLocal[],
): PointFeatureCollection => ({
  type: 'FeatureCollection',
  features: locals.map((local) => ({
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

export const formatNumber = (value: number): string => new Intl.NumberFormat('es-PE').format(value);
