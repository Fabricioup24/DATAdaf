import { EMPTY_FEATURE_COLLECTION, PRECISION_OPTIONS } from './constants';
import type { CsvRow, MapStats, PointFeatureCollection, PrecisionCoord, VotingLocal, VotingMesa } from './types';

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

export const aggregateRows = (rows: CsvRow[]): { locals: VotingLocal[]; stats: MapStats } => {
  const localsById = new Map<string, VotingLocal>();
  let plottedRows = 0;
  let missingRows = 0;

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
    const mesa: VotingMesa = {
      numeroMesa: row.numero_mesa,
      estadoActa: row.presidencial_estado_acta,
      electoresHabiles: row.presidencial_electores_habiles,
      votosEmitidos: row.presidencial_votos_emitidos,
      participacionPct: row.presidencial_participacion_pct,
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
      mesas: [mesa],
    });
  });

  const locals = Array.from(localsById.values()).map((local) => ({
    ...local,
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
  selectedPrecisions: Set<PrecisionCoord>,
): PointFeatureCollection => ({
  type: 'FeatureCollection',
  features: locals
    .filter((local) => selectedPrecisions.has(local.precisionCoord))
    .map((local) => ({
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
