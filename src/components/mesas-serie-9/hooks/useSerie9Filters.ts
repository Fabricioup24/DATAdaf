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

import { FIXED_PARTIES } from '../constants';
import { aggregateVoteSummaries, buildFeatureCollection } from '../data';
import type { MesaSearchResult, VoteSummary, VotingLocal } from '../types';

type UseSerie9FiltersParams = {
  locals: VotingLocal[];
  localsByIdRef: MutableRefObject<Map<string, VotingLocal>>;
  onLocalSearchMatch: (local: VotingLocal, shouldZoom?: boolean) => void;
};

type UseSerie9FiltersResult = {
  basemapMode: 'croquis' | 'satelite';
  distritoOptions: string[];
  featureCollection: ReturnType<typeof buildFeatureCollection>;
  filteredLocals: VotingLocal[];
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
  handleUrbanRuralChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  handleUrbanSubtypeChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  mesaError: string | null;
  mesaQuery: string;
  mesaSuggestions: MesaSearchResult[];
  mesaSuggestionsOpen: boolean;
  presidentialPartyOptions: Array<{ key: string; label: string }>;
  provinciaOptions: string[];
  regionOptions: string[];
  selectedDistrito: string;
  selectedPartyKeys: string[];
  selectedPartyResults: Array<VoteSummary['allParties'][number]>;
  selectedProvincia: string;
  selectedRegion: string;
  selectedUrbanRural: string;
  selectedUrbanSubtype: string;
  setBasemapMode: Dispatch<SetStateAction<'croquis' | 'satelite'>>;
  visibleMesaCount: number;
  visiblePresidentialSummary: VoteSummary | null;
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
  const [selectedPartyKeys, setSelectedPartyKeys] = useState(['', '', '', '']);

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
        const firstFixedIndex = FIXED_PARTIES.findIndex((party) => party.column === first.key);
        const secondFixedIndex = FIXED_PARTIES.findIndex((party) => party.column === second.key);

        if (firstFixedIndex >= 0 && secondFixedIndex >= 0) {
          return firstFixedIndex - secondFixedIndex;
        }
        if (firstFixedIndex >= 0) return -1;
        if (secondFixedIndex >= 0) return 1;
        return first.label.localeCompare(second.label, 'es');
      });
  }, [visiblePresidentialSummary]);

  const selectedPartyResults = useMemo(
    () =>
      selectedPartyKeys.flatMap((selectedKey) => {
        if (!selectedKey) return [];
        const party = visiblePresidentialSummary?.allParties.find((item) => item.key === selectedKey);
        return party ? [party] : [];
      }),
    [selectedPartyKeys, visiblePresidentialSummary],
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
    setSelectedPartyKeys((currentKeys) =>
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
    setSelectedPartyKeys(['', '', '', '']);
    setMesaQuery('');
    setMesaError(null);
    setMesaSuggestionsOpen(false);
  };

  const handlePartyChange = (slotIndex: number, event: ChangeEvent<HTMLSelectElement>) => {
    const nextValue = event.target.value;
    setSelectedPartyKeys((currentKeys) =>
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
    basemapMode,
    distritoOptions,
    featureCollection,
    filteredLocals,
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
    handleUrbanRuralChange,
    handleUrbanSubtypeChange,
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
    setBasemapMode,
    visibleMesaCount,
    visiblePresidentialSummary,
  };
};
