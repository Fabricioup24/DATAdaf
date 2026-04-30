const PARTY_COLOR_PALETTE = [
  '#16a34a',
  '#f97316',
  '#2b6011',
  '#dc2626',
  '#7c3aed',
  '#0f766e',
  '#2563eb',
  '#9333ea',
  '#ca8a04',
  '#e11d48',
  '#0284c7',
  '#15803d',
  '#ea580c',
  '#b91c1c',
  '#1d4ed8',
  '#0f766e',
  '#7e22ce',
  '#be123c',
  '#0891b2',
  '#65a30d',
  '#f59e0b',
  '#4f46e5',
  '#059669',
  '#db2777',
  '#0369a1',
  '#84cc16',
  '#c2410c',
  '#8b5cf6',
  '#0d9488',
  '#ef4444',
  '#f43f5e',
  '#3b82f6',
  '#22c55e',
  '#a855f7',
  '#d97706',
  '#14b8a6',
  '#6366f1',
  '#64748b',
  '#10b981',
  '#f97316',
];

const PARTY_DEFINITIONS = [
  {
    column: 'presidencial_partido_democratico_somos_peru',
    label: 'Somos Peru',
    logoFile: 'SOMOS_PERU_LOGO.jpg',
  },
  {
    column: 'presidencial_juntos_por_el_peru',
    label: 'Juntos por el Peru',
    logoFile: 'JUNTOS_POR_EL_PERU_LOGO.jpg',
  },
  {
    column: 'presidencial_partido_civico_obras',
    label: 'Partido Civico Obras',
    logoFile: 'OBRAS_LOGO.jpg',
  },
  {
    column: 'presidencial_fuerza_popular',
    label: 'Fuerza Popular',
    logoFile: 'FUERZA_POPULAR_LOGO.jpg',
  },
  {
    column: 'presidencial_partido_sicreo',
    label: 'Sicreo',
    logoFile: 'SICREO_LOGO.jpg',
  },
  {
    column: 'presidencial_podemos_peru',
    label: 'Podemos Peru',
    logoFile: 'PODEMOS_PERU_LOGO.jpg',
  },
  {
    column: 'presidencial_partido_patriotico_del_peru',
    label: 'Partido Patriotico del Peru',
    logoFile: 'PARTIDO_PATRIOTICO_DEL_PERU_LOGO.jpg',
  },
  {
    column: 'presidencial_partido_frente_de_la_esperanza_2021',
    label: 'Frente de la Esperanza 2021',
    logoFile: 'FRENTE_DE_LA_ESPERANZA_LOGO.jpg',
  },
  {
    column: 'presidencial_ahora_nacion_an',
    label: 'Ahora Nacion',
    logoFile: 'AHORA_NACION_LOGO.jpg',
  },
  {
    column: 'presidencial_un_camino_diferente',
    label: 'Un Camino Diferente',
    logoFile: 'UN_CAMINO_DIFERENTE_LOGO.jpg',
  },
  {
    column: 'presidencial_alianza_electoral_venceremos',
    label: 'Alianza Electoral Venceremos',
    logoFile: 'VENCEREMOS_LOGO.png',
  },
  {
    column: 'presidencial_frente_popular_agricola_fia_del_peru',
    label: 'Frente Popular Agricola FIA del Peru',
    logoFile: null,
  },
  {
    column: 'presidencial_partido_democrata_verde',
    label: 'Partido Democrata Verde',
    logoFile: 'DEMOCRATA_VERDE_LOGO.jpg',
  },
  {
    column: 'presidencial_partido_del_buen_gobierno',
    label: 'Partido del Buen Gobierno',
    logoFile: 'BUEN_GOBIERNO_LOGO.jpg',
  },
  {
    column: 'presidencial_partido_politico_peru_accion',
    label: 'Peru Accion',
    logoFile: 'PERU_ACCION_LOGO.jpg',
  },
  {
    column: 'presidencial_partido_politico_prin',
    label: 'PRIN',
    logoFile: 'PRIN_LOGO.jpg',
  },
  {
    column: 'presidencial_progresemos',
    label: 'Progresemos',
    logoFile: 'PROGRESEMOS_LOGO.jpg',
  },
  {
    column: 'presidencial_partido_pais_para_todos',
    label: 'Pais para Todos',
    logoFile: 'PAIS_PARA_TODOS_LOGO.jpg',
  },
  {
    column: 'presidencial_partido_politico_nacional_peru_libre',
    label: 'Peru Libre',
    logoFile: 'PERU_LIBRE_LOGO.jpg',
  },
  {
    column: 'presidencial_partido_ciudadanos_por_el_peru',
    label: 'Ciudadanos por el Peru',
    logoFile: null,
  },
  {
    column: 'presidencial_primero_la_gente_comunidad_ecologia_libertad_y_progreso',
    label: 'Primero la Gente',
    logoFile: null,
  },
  {
    column: 'presidencial_partido_democratico_federal',
    label: 'Partido Democratico Federal',
    logoFile: 'PERU_FEDERAL_LOGO.jpg',
  },
  {
    column: 'presidencial_fe_en_el_peru',
    label: 'Fe en el Peru',
    logoFile: 'FE_EN_EL_PERU_LOGO.jpg',
  },
  {
    column: 'presidencial_partido_politico_integridad_democratica',
    label: 'Integridad Democratica',
    logoFile: 'INTEGRIDAD_DEMOCRATICA_LOGO.jpg',
  },
  {
    column: 'presidencial_alianza_para_el_progreso',
    label: 'Alianza para el Progreso',
    logoFile: 'ALIANZA_PARA_EL_PROGRESO_LOGO.bmp',
  },
  {
    column: 'presidencial_partido_politico_cooperacion_popular',
    label: 'Cooperacion Popular',
    logoFile: 'COOPERACION_POPULAR_LOGO.jpg',
  },
  {
    column: 'presidencial_libertad_popular',
    label: 'Libertad Popular',
    logoFile: 'LIBERTAD_POPULAR_LOGO.jpg',
  },
  {
    column: 'presidencial_avanza_pais_partido_de_integracion_social',
    label: 'Avanza Pais',
    logoFile: 'AVANZA_PAIS_LOGO.jpg',
  },
  {
    column: 'presidencial_peru_moderno',
    label: 'Peru Moderno',
    logoFile: 'PERU_MODERNO_LOGO.jpg',
  },
  {
    column: 'presidencial_partido_politico_peru_primero',
    label: 'Peru Primero',
    logoFile: 'PERU_PRIMERO_LOGO.jpg',
  },
  {
    column: 'presidencial_salvemos_al_peru',
    label: 'Salvemos al Peru',
    logoFile: 'SALVEMOS_AL_PERU_LOGO.jpg',
  },
  {
    column: 'presidencial_partido_aprista_peruano',
    label: 'Partido Aprista Peruano',
    logoFile: 'APRA_LOGO.jpg',
  },
  {
    column: 'presidencial_renovacion_popular',
    label: 'Renovacion Popular',
    logoFile: 'RENOVACION_POPULAR_LOGO.jpg',
  },
  {
    column: 'presidencial_partido_democrata_unido_peru',
    label: 'Partido Democrata Unido Peru',
    logoFile: 'UNIDO_PERU_LOGO.jpg',
  },
  {
    column: 'presidencial_fuerza_y_libertad',
    label: 'Fuerza y Libertad',
    logoFile: 'FUERZA_Y_LIBERTAD_LOGO.png',
  },
  {
    column: 'presidencial_partido_de_los_trabajadores_y_emprendedores_pte_peru',
    label: 'Partido de los Trabajadores y Emprendedores',
    logoFile: 'PARTIDO_DE_LOS_TRABAJADORES_Y_EMPRENDEDORES_LOGO.jpg',
  },
  {
    column: 'presidencial_unidad_nacional',
    label: 'Unidad Nacional',
    logoFile: 'UNIDAD_NACIONAL_LOGO.png',
  },
  {
    column: 'presidencial_partido_morado',
    label: 'Partido Morado',
    logoFile: 'PARTIDO_MORADO_LOGO.jpg',
  },
] as const;

export type PartyCatalogEntry = {
  column: string;
  color: string;
  label: string;
  logoFile: string | null;
  logoPath: string | null;
};

export const PRESIDENTIAL_PARTY_CATALOG: PartyCatalogEntry[] = PARTY_DEFINITIONS.map(
  (party, index) => ({
    ...party,
    color: PARTY_COLOR_PALETTE[index % PARTY_COLOR_PALETTE.length],
    logoPath: party.logoFile ? `/partidos-2026/${party.logoFile}` : null,
  }),
);

export const PARTY_METADATA_BY_COLUMN: Record<string, PartyCatalogEntry> =
  PRESIDENTIAL_PARTY_CATALOG.reduce(
    (accumulator, party) => {
      accumulator[party.column] = party;
      return accumulator;
    },
    {} as Record<string, PartyCatalogEntry>,
  );

export const getPartyMetaByColumn = (column: string): PartyCatalogEntry => {
  const directMatch = PARTY_METADATA_BY_COLUMN[column];
  if (directMatch) return directMatch;

  return {
    column,
    color: '#94a3b8',
    label: column
      .replace(/^presidencial_/, '')
      .replace(/_/g, ' ')
      .replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
      .trim(),
    logoFile: null,
    logoPath: null,
  };
};
