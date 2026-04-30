import { useEffect, useRef, useState, type MutableRefObject } from 'react';

import { aggregateRows, parseCsvObjects } from '../data';
import type { MapStats, VotingLocal } from '../types';

type UseSerie9DataParams = {
  dataUrl: string;
};

type UseSerie9DataResult = {
  error: string | null;
  isLoading: boolean;
  locals: VotingLocal[];
  localsByIdRef: MutableRefObject<Map<string, VotingLocal>>;
  stats: MapStats | null;
};

export const useSerie9Data = ({ dataUrl }: UseSerie9DataParams): UseSerie9DataResult => {
  const localsByIdRef = useRef<Map<string, VotingLocal>>(new Map());
  const [locals, setLocals] = useState<VotingLocal[]>([]);
  const [stats, setStats] = useState<MapStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

        localsByIdRef.current = new Map(
          aggregated.locals.map((local) => [local.id, local] as const),
        );
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

  return {
    error,
    isLoading,
    locals,
    localsByIdRef,
    stats,
  };
};
