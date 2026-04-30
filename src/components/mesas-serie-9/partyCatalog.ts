const PARTY_DEFINITIONS = [
  {
    column: 'presidencial_partido_democratico_somos_peru',
    color: '#001F54',
    label: 'Somos Peru',
    logoFile: 'SOMOS_PERU_LOGO.jpg',
  },
  {
    column: 'presidencial_juntos_por_el_peru',
    color: '#C62828',
    label: 'Juntos por el Peru',
    logoFile: 'JUNTOS_POR_EL_PERU_LOGO.jpg',
  },
  {
    column: 'presidencial_partido_civico_obras',
    color: '#FF9800',
    label: 'Partido Civico Obras',
    logoFile: 'OBRAS_LOGO.jpg',
  },
  {
    column: 'presidencial_fuerza_popular',
    color: '#FF6B00',
    label: 'Fuerza Popular',
    logoFile: 'FUERZA_POPULAR_LOGO.jpg',
  },
  {
    column: 'presidencial_partido_sicreo',
    color: '#673AB7',
    label: 'Sicreo',
    logoFile: 'SICREO_LOGO.jpg',
  },
  {
    column: 'presidencial_podemos_peru',
    color: '#E91E63',
    label: 'Podemos Peru',
    logoFile: 'PODEMOS_PERU_LOGO.jpg',
  },
  {
    column: 'presidencial_partido_patriotico_del_peru',
    color: '#8BC34A',
    label: 'Partido Patriotico del Peru',
    logoFile: 'PARTIDO_PATRIOTICO_DEL_PERU_LOGO.jpg',
  },
  {
    column: 'presidencial_partido_frente_de_la_esperanza_2021',
    color: '#8D6E63',
    label: 'Frente de la Esperanza 2021',
    logoFile: 'FRENTE_DE_LA_ESPERANZA_LOGO.jpg',
  },
  {
    column: 'presidencial_ahora_nacion_an',
    color: '#D32F2F',
    label: 'Ahora Nacion',
    logoFile: 'AHORA_NACION_LOGO.jpg',
  },
  {
    column: 'presidencial_un_camino_diferente',
    color: '#26A69A',
    label: 'Un Camino Diferente',
    logoFile: 'UN_CAMINO_DIFERENTE_LOGO.jpg',
  },
  {
    column: 'presidencial_alianza_electoral_venceremos',
    color: '#C62828',
    label: 'Alianza Electoral Venceremos',
    logoFile: 'VENCEREMOS_LOGO.png',
  },
  {
    column: 'presidencial_frente_popular_agricola_fia_del_peru',
    color: '#94A3B8',
    label: 'Frente Popular Agricola FIA del Peru',
    logoFile: null,
  },
  {
    column: 'presidencial_partido_democrata_verde',
    color: '#43A047',
    label: 'Partido Democrata Verde',
    logoFile: 'DEMOCRATA_VERDE_LOGO.jpg',
  },
  {
    column: 'presidencial_partido_del_buen_gobierno',
    color: '#00796B',
    label: 'Partido del Buen Gobierno',
    logoFile: 'BUEN_GOBIERNO_LOGO.jpg',
  },
  {
    column: 'presidencial_partido_politico_peru_accion',
    color: '#F57C00',
    label: 'Partido Politico Peru Accion',
    logoFile: 'PERU_ACCION_LOGO.jpg',
  },
  {
    column: 'presidencial_partido_politico_prin',
    color: '#795548',
    label: 'PRIN',
    logoFile: 'PRIN_LOGO.jpg',
  },
  {
    column: 'presidencial_progresemos',
    color: '#9C27B0',
    label: 'Progresemos',
    logoFile: 'PROGRESEMOS_LOGO.jpg',
  },
  {
    column: 'presidencial_partido_pais_para_todos',
    color: '#FFC107',
    label: 'Pais para Todos',
    logoFile: 'PAIS_PARA_TODOS_LOGO.jpg',
  },
  {
    column: 'presidencial_partido_politico_nacional_peru_libre',
    color: '#B71C1C',
    label: 'Partido Politico Nacional Peru Libre',
    logoFile: 'PERU_LIBRE_LOGO.jpg',
  },
  {
    column: 'presidencial_partido_ciudadanos_por_el_peru',
    color: '#94A3B8',
    label: 'Ciudadanos por el Peru',
    logoFile: null,
  },
  {
    column: 'presidencial_primero_la_gente_comunidad_ecologia_libertad_y_progreso',
    color: '#94A3B8',
    label: 'Primero la Gente',
    logoFile: null,
  },
  {
    column: 'presidencial_partido_democratico_federal',
    color: '#607D8B',
    label: 'Partido Democratico Federal',
    logoFile: 'PERU_FEDERAL_LOGO.jpg',
  },
  {
    column: 'presidencial_fe_en_el_peru',
    color: '#FFD700',
    label: 'Fe en el Peru',
    logoFile: 'FE_EN_EL_PERU_LOGO.jpg',
  },
  {
    column: 'presidencial_partido_politico_integridad_democratica',
    color: '#5D4037',
    label: 'Partido Integridad Democratica',
    logoFile: 'INTEGRIDAD_DEMOCRATICA_LOGO.jpg',
  },
  {
    column: 'presidencial_alianza_para_el_progreso',
    color: '#0066CC',
    label: 'Alianza para el Progreso',
    logoFile: 'ALIANZA_PARA_EL_PROGRESO_LOGO.bmp',
  },
  {
    column: 'presidencial_partido_politico_cooperacion_popular',
    color: '#212121',
    label: 'Partido Politico Cooperacion Popular',
    logoFile: 'COOPERACION_POPULAR_LOGO.jpg',
  },
  {
    column: 'presidencial_libertad_popular',
    color: '#4A148C',
    label: 'Libertad Popular',
    logoFile: 'LIBERTAD_POPULAR_LOGO.jpg',
  },
  {
    column: 'presidencial_avanza_pais_partido_de_integracion_social',
    color: '#1565C0',
    label: 'Avanza Pais - Partido de Integracion Social',
    logoFile: 'AVANZA_PAIS_LOGO.jpg',
  },
  {
    column: 'presidencial_peru_moderno',
    color: '#03A9F4',
    label: 'Peru Moderno',
    logoFile: 'PERU_MODERNO_LOGO.jpg',
  },
  {
    column: 'presidencial_partido_politico_peru_primero',
    color: '#1976D2',
    label: 'Peru Primero',
    logoFile: 'PERU_PRIMERO_LOGO.jpg',
  },
  {
    column: 'presidencial_salvemos_al_peru',
    color: '#009688',
    label: 'Salvemos al Peru',
    logoFile: 'SALVEMOS_AL_PERU_LOGO.jpg',
  },
  {
    column: 'presidencial_partido_aprista_peruano',
    color: '#D32F2F',
    label: 'Partido Aprista Peruano',
    logoFile: 'APRA_LOGO.jpg',
  },
  {
    column: 'presidencial_renovacion_popular',
    color: '#00BCD4',
    label: 'Renovacion Popular',
    logoFile: 'RENOVACION_POPULAR_LOGO.jpg',
  },
  {
    column: 'presidencial_partido_democrata_unido_peru',
    color: '#4CAF50',
    label: 'Partido Democrata Unido Peru',
    logoFile: 'UNIDO_PERU_LOGO.jpg',
  },
  {
    column: 'presidencial_fuerza_y_libertad',
    color: '#2E7D32',
    label: 'Alianza Fuerza y Libertad',
    logoFile: 'FUERZA_Y_LIBERTAD_LOGO.png',
  },
  {
    column: 'presidencial_partido_de_los_trabajadores_y_emprendedores_pte_peru',
    color: '#FF5722',
    label: 'Partido de los Trabajadores y Emprendedores PTE - Peru',
    logoFile: 'PARTIDO_DE_LOS_TRABAJADORES_Y_EMPRENDEDORES_LOGO.jpg',
  },
  {
    column: 'presidencial_unidad_nacional',
    color: '#3F51B5',
    label: 'Alianza Unidad Nacional',
    logoFile: 'UNIDAD_NACIONAL_LOGO.png',
  },
  {
    column: 'presidencial_partido_morado',
    color: '#7B1FA2',
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
  (party) => ({
    ...party,
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
