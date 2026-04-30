import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type FormEvent,
  type MutableRefObject,
  type SetStateAction,
} from 'react';

import { PARTY_ORDER_INDEX_MAP } from '../constants';
import { aggregateVoteSummaries, buildFeatureCollection } from '../data';
import { getPartyMetaByColumn } from '../partyCatalog';
import type {
  AnalysisMode,
  MesaSearchResult,
  PartyAnalysisSummary,
  VoteSummary,
  VotingLocal,
} from '../types';

type UseSerie9FiltersParams = {
  locals: VotingLocal[];
  localsByIdRef: MutableRefObject<Map<string, VotingLocal>>;
  onLocalSearchMatch: (local: VotingLocal, shouldZoom?: boolean) => void;
};

type UseSerie9FiltersResult = {
  analysisLocalCount: number;
  analysisMode: AnalysisMode;
  analysisMesaCount: number;
  analysisPresidentialSummary: VoteSummary | null;
  basemapMode: 'croquis' | 'satelite';
  comparePartyResults: PartyAnalysisSummary[];
  comparePartySelection: string[];
  distritoOptions: string[];
  featureCollection: ReturnType<typeof buildFeatureCollection>;
  filteredLocals: VotingLocal[];
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
  handleUrbanRuralChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  handleUrbanSubtypeChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  handleWinnerPartyChange: (event: ChangeEvent<HTMLSelectElement>) => void;
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
  setBasemapMode: Dispatch<SetStateAction<'croquis' | 'satelite'>>;
  visibleAnalysisPartyKeys: string[];
  visibleMesaCount: number;
  visibleWinningPartyCount: number;
  winnerPartyResult: PartyAnalysisSummary | null;
};

export const useSerie9Filters = ({
  locals,
  localsByIdRef,
  onLocalSearchMatch,
}: UseSerie9FiltersParams): UseSerie9FiltersResult => {
  const blurSearchTimeoutRef = useRef<number | null>(null);
  const pendingSearchLocalRef = useRef<VotingLocal | null>(null);

  const [basemapMode, setBasemapMode] = useState<'croquis' | 'satelite'>('croquis');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProvincia, setSelectedProvincia] = useState('');
  const [selectedDistrito, setSelectedDistrito] = useState('');
  const [selectedUrbanRural, setSelectedUrbanRural] = useState('');
  const [selectedUrbanSubtype, setSelectedUrbanSubtype] = useState('');
  const [mesaQuery, setMesaQuery] = useState('');
  const [mesaSuggestionsOpen, setMesaSuggestionsOpen] = useState(false);
  const [mesaError, setMesaError] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('winner');
  const [selectedWinnerPartyKey, setSelectedWinnerPartyKey] = useState('');
  const [comparePartySelection, setComparePartySelection] = useState(['', '']);

  const mesaSearchIndex = useMemo(
    () =>
      locals
        .flatMap((local) =>
          local.mesas.map<MesaSearchResult>((mesa) => ({
            numeroMesa: mesa.numeroMesa,
            localId: local.id,
            localNombre: local.nombreLocal,
            region: local.region,
            provincia: local.provincia,
            distrito: local.distrito,
          })),
        )
        .sort((first, second) =>
          first.numeroMesa.localeCompare(second.numeroMesa, 'es', { numeric: true }),
        ),
    [locals],
  );

  const mesaSuggestions = useMemo(() => {
    const query = mesaQuery.trim();
    if (!query) return [];

    const exactMatches = mesaSearchIndex.filter((item) => item.numeroMesa === query);
    const startsWithMatches = mesaSearchIndex.filter(
      (item) => item.numeroMesa !== query && item.numeroMesa.startsWith(query),
    );
    const includesMatches = mesaSearchIndex.filter(
      (item) =>
        item.numeroMesa !== query &&
        !item.numeroMesa.startsWith(query) &&
        item.numeroMesa.includes(query),
    );

    return [...exactMatches, ...startsWithMatches, ...includesMatches].slice(0, 8);
  }, [mesaQuery, mesaSearchIndex]);

  const regionOptions = useMemo(
    () => Array.from(new Set(locals.map((local) => local.region).filter(Boolean))).sort(),
    [locals],
  );

  const provinciaOptions = useMemo(
    () =>
      Array.from(
        new Set(
          locals
            .filter((local) => !selectedRegion || local.region === selectedRegion)
            .map((local) => local.provincia)
            .filter(Boolean),
        ),
      ).sort(),
    [locals, selectedRegion],
  );

  const distritoOptions = useMemo(
    () =>
      Array.from(
        new Set(
          locals
            .filter((local) => !selectedRegion || local.region === selectedRegion)
            .filter((local) => !selectedProvincia || local.provincia === selectedProvincia)
            .map((local) => local.distrito)
            .filter(Boolean),
        ),
      ).sort(),
    [locals, selectedProvincia, selectedRegion],
  );

  const filteredLocals = useMemo(
    () =>
      locals.filter((local) => {
        if (selectedRegion && local.region !== selectedRegion) return false;
        if (selectedProvincia && local.provincia !== selectedProvincia) return false;
        if (selectedDistrito && local.distrito !== selectedDistrito) return false;
        if (
          selectedUrbanRural &&
          local.clasificacionOficialUrbanoRural !== selectedUrbanRural
        ) {
          return false;
        }
        if (
          selectedUrbanSubtype &&
          local.clasificacionOficialUrbanoRural === 'urbano' &&
          local.subclasificacionUrbanaOficial !== selectedUrbanSubtype
        ) {
          return false;
        }
        return true;
      }),
    [
      locals,
      selectedDistrito,
      selectedProvincia,
      selectedRegion,
      selectedUrbanRural,
      selectedUrbanSubtype,
    ],
  );

  const visiblePresidentialSummary = useMemo(
    () => aggregateVoteSummaries(filteredLocals.map((local) => local.results)),
    [filteredLocals],
  );

  const presidentialPartyOptions = useMemo(() => {
    const parties = visiblePresidentialSummary?.allParties ?? [];

    return parties
      .filter((party) => party.votes > 0)
      .map((party) => ({ key: party.key, label: party.label }))
      .sort((first, second) => {
        const firstIndex = PARTY_ORDER_INDEX_MAP[first.key];
        const secondIndex = PARTY_ORDER_INDEX_MAP[second.key];

        if (firstIndex !== undefined && secondIndex !== undefined) {
          return firstIndex - secondIndex;
        }
        if (firstIndex !== undefined) return -1;
        if (secondIndex !== undefined) return 1;
        return first.label.localeCompare(second.label, 'es');
      });
  }, [visiblePresidentialSummary]);

  const buildAnalysisSummary = (party: VoteSummary['allParties'][number]): PartyAnalysisSummary => {
    const partyMeta = getPartyMetaByColumn(party.key);
    const localWins = filteredLocals.filter(
      (local) => local.results.winningPartyKey === party.key,
    ).length;
    const mesaWins = filteredLocals.reduce(
      (total, local) =>
        total +
        local.mesas.filter((mesa) => mesa.results.winningPartyKey === party.key).length,
      0,
    );

    return {
      ...party,
      color: partyMeta.color,
      localWins,
      logoPath: partyMeta.logoPath,
      mesaWins,
    };
  };

  const visibleAnalysisPartyKeys = useMemo(() => {
    if (analysisMode === 'winner') {
      return selectedWinnerPartyKey ? [selectedWinnerPartyKey] : [];
    }
    return comparePartySelection.filter(Boolean);
  }, [analysisMode, comparePartySelection, selectedWinnerPartyKey]);

  const analysisLocals = useMemo(() => {
    if (analysisMode === 'winner' && selectedWinnerPartyKey) {
      return filteredLocals.filter(
        (local) => local.results.winningPartyKey === selectedWinnerPartyKey,
      );
    }

    if (analysisMode === 'compare' && comparePartySelection.every(Boolean)) {
      return filteredLocals.filter((local) =>
        comparePartySelection.includes(local.results.winningPartyKey ?? ''),
      );
    }

    return filteredLocals;
  }, [analysisMode, comparePartySelection, filteredLocals, selectedWinnerPartyKey]);

  const analysisPresidentialSummary = useMemo(
    () => aggregateVoteSummaries(analysisLocals.map((local) => local.results)),
    [analysisLocals],
  );

  const analysisMesaCount = useMemo(
    () => analysisLocals.reduce((total, local) => total + local.mesas.length, 0),
    [analysisLocals],
  );

  const winnerPartyResult = useMemo(() => {
    if (!selectedWinnerPartyKey) return null;
    const party = analysisPresidentialSummary?.allParties.find(
      (item) => item.key === selectedWinnerPartyKey,
    );
    return party ? buildAnalysisSummary(party) : null;
  }, [analysisPresidentialSummary, filteredLocals, selectedWinnerPartyKey]);

  const comparePartyResults = useMemo(
    () => {
      if (!comparePartySelection.every(Boolean)) return [];

      return comparePartySelection.flatMap((selectedKey) => {
        if (!selectedKey) return [];
        const party = analysisPresidentialSummary?.allParties.find(
          (item) => item.key === selectedKey,
        );
        return party ? [buildAnalysisSummary(party)] : [];
      });
    },
    [analysisPresidentialSummary, comparePartySelection, filteredLocals],
  );

  const visibleWinningPartyCount = useMemo(
    () => analysisLocals.length,
    [analysisLocals],
  );

  const featureCollection = useMemo(() => buildFeatureCollection(filteredLocals), [filteredLocals]);

  const visibleMesaCount = useMemo(
    () => filteredLocals.reduce((total, local) => total + local.mesas.length, 0),
    [filteredLocals],
  );

  useEffect(() => {
    return () => {
      if (blurSearchTimeoutRef.current !== null) {
        window.clearTimeout(blurSearchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const availableKeys = new Set(presidentialPartyOptions.map((party) => party.key));
    setSelectedWinnerPartyKey((currentKey) =>
      currentKey && !availableKeys.has(currentKey) ? '' : currentKey,
    );
    setComparePartySelection((currentKeys) =>
      currentKeys.map((key) => (key && !availableKeys.has(key) ? '' : key)),
    );
  }, [presidentialPartyOptions]);

  useEffect(() => {
    const pendingLocal = pendingSearchLocalRef.current;
    if (!pendingLocal) return;

    const isVisible = filteredLocals.some((local) => local.id === pendingLocal.id);
    if (!isVisible) return;

    onLocalSearchMatch(pendingLocal, true);
    pendingSearchLocalRef.current = null;
  }, [filteredLocals, onLocalSearchMatch]);

  const handleRegionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextRegion = event.target.value;
    setSelectedRegion(nextRegion);
    setSelectedProvincia('');
    setSelectedDistrito('');
  };

  const handleProvinciaChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextProvincia = event.target.value;
    setSelectedProvincia(nextProvincia);
    setSelectedDistrito('');
  };

  const handleDistritoChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedDistrito(event.target.value);
  };

  const handleUrbanRuralChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextValue = event.target.value;
    setSelectedUrbanRural(nextValue);
    if (nextValue !== 'urbano') {
      setSelectedUrbanSubtype('');
    }
  };

  const handleUrbanSubtypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedUrbanSubtype(event.target.value);
  };

  const handleResetFilters = () => {
    setSelectedRegion('');
    setSelectedProvincia('');
    setSelectedDistrito('');
    setSelectedUrbanRural('');
    setSelectedUrbanSubtype('');
    setSelectedWinnerPartyKey('');
    setComparePartySelection(['', '']);
    setMesaQuery('');
    setMesaError(null);
    setMesaSuggestionsOpen(false);
  };

  const handleAnalysisModeChange = (mode: AnalysisMode) => {
    setAnalysisMode(mode);
  };

  const handleWinnerPartyChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedWinnerPartyKey(event.target.value);
  };

  const handleComparePartyChange = (slotIndex: number, event: ChangeEvent<HTMLSelectElement>) => {
    const nextValue = event.target.value;
    setComparePartySelection((currentKeys) =>
      currentKeys.map((currentValue, currentIndex) => {
        if (currentIndex === slotIndex) return nextValue;
        if (nextValue && currentValue === nextValue) return '';
        return currentValue;
      }),
    );
  };

  const resolveMesaSearch = (term: string) => {
    const query = term.trim();
    if (!query) return null;

    return (
      mesaSearchIndex.find((item) => item.numeroMesa === query) ??
      mesaSuggestions.find((item) => item.numeroMesa === query) ??
      mesaSuggestions[0] ??
      null
    );
  };

  const executeMesaSearch = (term: string) => {
    const match = resolveMesaSearch(term);

    if (!match) {
      setMesaError('No se encontro una mesa con ese numero.');
      setMesaSuggestionsOpen(false);
      return;
    }

    const local = localsByIdRef.current.get(match.localId);
    if (!local) {
      setMesaError('No se pudo ubicar el local asociado a esa mesa.');
      setMesaSuggestionsOpen(false);
      return;
    }

    setMesaQuery(match.numeroMesa);
    setMesaError(null);
    setMesaSuggestionsOpen(false);
    pendingSearchLocalRef.current = local;

    const nextRegion = local.region;
    const nextProvincia = local.provincia;
    const nextDistrito = local.distrito;
    const nextUrbanRural = local.clasificacionOficialUrbanoRural;
    const nextUrbanSubtype =
      local.clasificacionOficialUrbanoRural === 'urbano'
        ? local.subclasificacionUrbanaOficial
        : '';

    const sameFilters =
      selectedRegion === nextRegion &&
      selectedProvincia === nextProvincia &&
      selectedDistrito === nextDistrito &&
      selectedUrbanRural === nextUrbanRural &&
      selectedUrbanSubtype === nextUrbanSubtype;

    setSelectedRegion(nextRegion);
    setSelectedProvincia(nextProvincia);
    setSelectedDistrito(nextDistrito);
    setSelectedUrbanRural(nextUrbanRural);
    setSelectedUrbanSubtype(nextUrbanSubtype);

    if (sameFilters) {
      onLocalSearchMatch(local, true);
      pendingSearchLocalRef.current = null;
      return;
    }
  };

  const handleMesaSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    executeMesaSearch(mesaQuery);
  };

  const handleMesaInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMesaQuery(event.target.value);
    setMesaError(null);
    setMesaSuggestionsOpen(true);
  };

  const handleMesaInputFocus = () => {
    if (blurSearchTimeoutRef.current !== null) {
      window.clearTimeout(blurSearchTimeoutRef.current);
      blurSearchTimeoutRef.current = null;
    }
    if (mesaQuery.trim()) {
      setMesaSuggestionsOpen(true);
    }
  };

  const handleMesaInputBlur = () => {
    blurSearchTimeoutRef.current = window.setTimeout(() => {
      setMesaSuggestionsOpen(false);
      blurSearchTimeoutRef.current = null;
    }, 120);
  };

  const handleMesaSuggestionSelect = (numeroMesa: string) => {
    executeMesaSearch(numeroMesa);
  };

  return {
    analysisLocalCount: analysisLocals.length,
    analysisMode,
    analysisMesaCount,
    analysisPresidentialSummary,
    basemapMode,
    comparePartyResults,
    comparePartySelection,
    distritoOptions,
    featureCollection,
    filteredLocals,
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
    handleUrbanRuralChange,
    handleUrbanSubtypeChange,
    handleWinnerPartyChange,
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
    setBasemapMode,
    visibleAnalysisPartyKeys,
    visibleMesaCount,
    visibleWinningPartyCount,
    winnerPartyResult,
  };
};
