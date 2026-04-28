import React, { useEffect, useState } from 'react';

type LenisController = {
  start?: () => void;
  stop?: () => void;
};

declare global {
  interface Window {
    lenis?: LenisController;
  }
}

type SheetMode = 'methodology' | 'missing';

const precisionItems = [
  {
    label: 'ALTA',
    description:
      'Local compatible por código o nombre y contexto geográfico. En muchos casos la fuente reportada es MED-GPS.',
  },
  {
    label: 'MEDIA',
    description:
      'Coincidencia fuerte, pero con alguna diferencia menor en centro poblado, dirección o denominación.',
  },
  {
    label: 'APROXIMADA',
    description:
      'Punto útil para ubicar la zona o centro poblado, no necesariamente el local exacto.',
  },
  {
    label: 'REVISAR',
    description:
      'Existe un candidato, pero la evidencia no alcanza para aceptarlo sin verificación manual.',
  },
];

const missingRegionRows = [
  ['ANCASH', '8'],
  ['AYACUCHO', '8'],
  ['PUNO', '8'],
  ['HUANUCO', '7'],
  ['APURIMAC', '6'],
  ['JUNIN', '6'],
];

const missingLocalRows = [
  ['7 mesas', '2951', 'IE 41 FE Y ALEGRIA CALASANZ', 'VIRGEN DEL CARMEN LA ERA ÑAÑA, LURIGANCHO, LIMA'],
  ['5 mesas', '1081', 'IE GRAN MARISCAL LUIS JOSE DE ORBEGOSO', 'SAN MIGUEL DE ALGAMARCA, CACHACHI, CAJABAMBA'],
  ['5 mesas', '55354', 'LOCAL MUNICIPAL DE CHOQUEPATA', 'CHOQUEPATA, OROPESA, QUISPICANCHI'],
  ['5 mesas', '7339', 'IE 0740 SAN JUAN DE TALLIQUIHUI', 'SAN JUAN DE TALLIQUIHUI, SANTA ROSA, EL DORADO'],
  ['4 mesas', '0111', 'IE 16714 SUWIKAI TSAKIM MIYAN', 'PAANTAM, NIEVA, CONDORCANQUI'],
  ['4 mesas', '51440', 'IE JOSE OLAYA - PUTAQA', 'PUTACCA, VINCHOS, HUAMANGA'],
];

const missingMesaRows = [
  ['900046', '53854', 'IE 16676 NAJAIM PARAISO', 'SAWIT, IMAZA, BAGUA, AMAZONAS'],
  ['900058', '0111', 'IE 16714 SUWIKAI TSAKIM MIYAN', 'PAANTAM, NIEVA, CONDORCANQUI, AMAZONAS'],
  ['900289', '54337', 'TAMBO ATAQUERO', 'ATAQUERO, COCHABAMBA, HUARAZ, ANCASH'],
  ['900401', '0395', 'IE 86201 VIRGEN DEL ROSARIO', 'SAN PEDRO DE UCHUPATA, ACZO, ANTONIO RAIMONDI, ANCASH'],
  ['900403', '7511', 'IE MARIANO MELGAR Y VALDIVIESO', 'SAN MARTIN DE PARAS, MIRGAS, ANTONIO RAIMONDI, ANCASH'],
];

function ModalShell({
  title,
  eyebrow,
  onClose,
  children,
}: {
  title: string;
  eyebrow: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center px-4 py-6 md:py-8"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Cerrar modal"
        onClick={onClose}
        className="absolute inset-0 bg-[#121212]/55 backdrop-blur-[2px]"
      />

      <div className="relative z-[1] w-full max-w-4xl max-h-[calc(100vh-3rem)] overflow-hidden rounded-[1.6rem] bg-white text-[#121212] shadow-[0_30px_80px_rgba(0,0,0,0.28)] border border-[#121212]/10 flex flex-col">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 px-6 md:px-8 py-5 border-b border-[#121212]/8 bg-white/95 backdrop-blur-md shrink-0">
          <div>
            <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#121212]/42 mb-2">
              {eyebrow}
            </p>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight leading-none">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center size-10 rounded-full border border-[#121212]/10 text-[#121212]/72 text-xl font-medium"
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto px-6 md:px-8 py-6 md:py-8 space-y-10"
          data-lenis-prevent
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default function MethodologySheet() {
  const [openSheet, setOpenSheet] = useState<null | SheetMode>(null);

  useEffect(() => {
    if (!openSheet) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.lenis?.stop?.();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenSheet(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.lenis?.start?.();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openSheet]);

  return (
    <>
      <div className="glass-card p-8 my-8 border border-[#121212]/10 bg-white/80">
        <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#121212]/45 mb-3">
          Ficha metodológica
        </p>
        <h3 className="text-2xl md:text-3xl font-black tracking-tight text-[#121212] mb-3">
          Cómo se construyó la base georreferenciada de la Serie 9
        </h3>
        <p className="text-[#121212]/68 text-base md:text-lg leading-relaxed max-w-3xl mb-6">
          La geocodificación se hizo a nivel de local de votación, no de mesa individual. Se
          priorizó SIGMED/MINEDU como fuente principal y cada coordenada se clasificó por nivel de
          confianza antes de pasar al mapa.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setOpenSheet('methodology')}
            className="inline-flex items-center justify-center min-h-11 px-5 rounded-full bg-[#121212] text-white text-sm font-black uppercase tracking-[0.12em] transition-transform duration-200 hover:translate-y-[-1px]"
          >
            Ver metodología
          </button>
          <button
            type="button"
            onClick={() => setOpenSheet('missing')}
            className="inline-flex items-center justify-center min-h-11 px-5 rounded-full border border-[#121212]/12 bg-white text-[#121212] text-sm font-black uppercase tracking-[0.12em] transition-transform duration-200 hover:translate-y-[-1px]"
          >
            Lista de Mesas sin Coordenadas
          </button>
        </div>
      </div>

      {openSheet === 'methodology' ? (
        <ModalShell
          title="Geocodificación de mesas Serie 9"
          eyebrow="Ficha metodológica"
          onClose={() => setOpenSheet(null)}
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-[#f8fafc] border border-[#121212]/6 p-5">
              <p className="text-[0.66rem] font-black uppercase tracking-[0.14em] text-[#121212]/42 mb-2">
                Universo
              </p>
              <p className="text-2xl font-black tracking-tight">4,703 mesas</p>
              <p className="text-sm leading-relaxed text-[#121212]/65 mt-2">
                Mesas cuyo número comienza con 9, agrupadas en 1,939 locales únicos.
              </p>
            </div>
            <div className="rounded-2xl bg-[#f8fafc] border border-[#121212]/6 p-5">
              <p className="text-[0.66rem] font-black uppercase tracking-[0.14em] text-[#121212]/42 mb-2">
                Cobertura
              </p>
              <p className="text-2xl font-black tracking-tight">4,562 con coordenada</p>
              <p className="text-sm leading-relaxed text-[#121212]/65 mt-2">
                141 mesas quedaron sin latitud o longitud defendible bajo los criterios usados.
              </p>
            </div>
            <div className="rounded-2xl bg-[#f8fafc] border border-[#121212]/6 p-5">
              <p className="text-[0.66rem] font-black uppercase tracking-[0.14em] text-[#121212]/42 mb-2">
                Fuente principal
              </p>
              <p className="text-2xl font-black tracking-tight">SIGMED / MINEDU</p>
              <p className="text-sm leading-relaxed text-[#121212]/65 mt-2">
                Se priorizó por devolver registros educativos estructurados y, en muchos casos,
                coordenadas MED-GPS.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-black tracking-tight">Cómo se hizo</h4>
            <div className="space-y-3 text-[0.98rem] leading-relaxed text-[#121212]/76">
              <p>
                La base original de 4,703 mesas se trabajó junto con el documento
                <strong>
                  {' '}
                  Listado de Mesas por Estado de Mesa correspondiente a las Elecciones Generales y
                  Parlamento Andino 2026
                </strong>
                , elaborado por la
                <strong> Oficina Nacional de Procesos Electorales (ONPE)</strong>. A partir de ese
                insumo se recuperaron dirección, descriptor del local y validaciones de estado.
              </p>
              <p>
                Después, las mesas se agruparon por <strong>Número de local</strong> para trabajar
                a nivel de local de votación en lugar de hacerlo mesa por mesa.
              </p>
              <p>
                Para cada local único se consultó SIGMED/MINEDU combinando departamento,
                provincia, distrito, nombre del local, descriptor del PDF, código de institución y
                centro poblado reportado por los resultados.
              </p>
              <p>
                La coordenada final se asignó al local seleccionado y desde ahí se heredó a las
                mesas asociadas. Por eso en el mapa cada punto representa un local y el popup lista
                sus mesas relacionadas.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-black tracking-tight">Cómo leer la confianza</h4>
            <div className="grid gap-3">
              {precisionItems.map((item) => (
                <div key={item.label} className="rounded-2xl border border-[#121212]/8 bg-white p-4">
                  <p className="text-[0.7rem] font-black uppercase tracking-[0.14em] text-[#121212]/45 mb-1">
                    {item.label}
                  </p>
                  <p className="text-sm leading-relaxed text-[#121212]/72">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-black tracking-tight">Qué significa el puntaje de coincidencia</h4>
            <p className="text-[0.98rem] leading-relaxed text-[#121212]/76">
              El <strong>puntaje de coincidencia</strong> resume la fuerza de la coincidencia
              encontrada en SIGMED. Un valor más alto suele indicar mejor consistencia entre
              código, nombre del local, centro poblado y fuente GPS. En términos simples:
              mientras más alto, más razones encontró el sistema para pensar que ese punto sí
              corresponde al local buscado.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-black tracking-tight">Límites de la base</h4>
            <div className="space-y-3 text-[0.98rem] leading-relaxed text-[#121212]/76">
              <p>
                No todos los locales aparecen en SIGMED con el mismo nombre del PDF. Algunos son
                casas comunales, tambos o instituciones con variantes ortográficas.
              </p>
              <p>
                Por eso los casos <strong>REVISAR</strong> y <strong>SIN COORDENADA</strong> no se
                tratan como ubicaciones definitivas: requieren una segunda pasada de revisión
                manual o contraste adicional.
              </p>
            </div>
          </div>
        </ModalShell>
      ) : null}

      {openSheet === 'missing' ? (
        <ModalShell
          title="Mesas y locales sin coordenadas"
          eyebrow="Casos pendientes"
          onClose={() => setOpenSheet(null)}
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-[#f8fafc] border border-[#121212]/6 p-5">
              <p className="text-[0.66rem] font-black uppercase tracking-[0.14em] text-[#121212]/42 mb-2">
                Mesas sin coordenada
              </p>
              <p className="text-2xl font-black tracking-tight">141</p>
              <p className="text-sm leading-relaxed text-[#121212]/65 mt-2">
                Mesas que no pudieron recibir una ubicación defendible con los criterios aplicados.
              </p>
            </div>
            <div className="rounded-2xl bg-[#f8fafc] border border-[#121212]/6 p-5">
              <p className="text-[0.66rem] font-black uppercase tracking-[0.14em] text-[#121212]/42 mb-2">
                Locales sin coordenada
              </p>
              <p className="text-2xl font-black tracking-tight">68</p>
              <p className="text-sm leading-relaxed text-[#121212]/65 mt-2">
                Locales que explican esos casos pendientes dentro de la base final.
              </p>
            </div>
            <div className="rounded-2xl bg-[#f8fafc] border border-[#121212]/6 p-5">
              <p className="text-[0.66rem] font-black uppercase tracking-[0.14em] text-[#121212]/42 mb-2">
                Cobertura territorial
              </p>
              <p className="text-2xl font-black tracking-tight">17 regiones</p>
              <p className="text-sm leading-relaxed text-[#121212]/65 mt-2">
                49 provincias y 58 distritos concentran los casos pendientes de geocodificación.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-black tracking-tight">Qué significa esta lista</h4>
            <p className="text-[0.98rem] leading-relaxed text-[#121212]/76">
              Que una mesa aparezca aquí no significa que no exista. Significa que no se encontró
              una coordenada suficientemente defendible en SIGMED/MINEDU para ubicarla sin riesgo
              de señalar el punto equivocado.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-black tracking-tight">Regiones con más locales pendientes</h4>
            <div className="grid gap-3 md:grid-cols-2">
              {missingRegionRows.map(([region, total]) => (
                <div key={region} className="rounded-2xl border border-[#121212]/8 bg-white p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[0.7rem] font-black uppercase tracking-[0.14em] text-[#121212]/45 mb-1">
                      Region
                    </p>
                    <p className="text-base font-black tracking-tight text-[#121212]">{region}</p>
                  </div>
                  <p className="text-xl font-black tracking-tight text-[#121212]">{total}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-black tracking-tight">Locales con más mesas pendientes</h4>
            <div className="space-y-3">
              {missingLocalRows.map(([mesas, numeroLocal, nombre, ubicacion]) => (
                <div key={`${numeroLocal}-${nombre}`} className="rounded-2xl border border-[#121212]/8 bg-white p-4">
                  <div className="flex flex-wrap items-center gap-3 justify-between">
                    <div>
                      <p className="text-[0.7rem] font-black uppercase tracking-[0.14em] text-[#121212]/45 mb-1">
                        {mesas} · <strong>Número de local {numeroLocal}</strong>
                      </p>
                      <p className="text-base md:text-lg font-black tracking-tight text-[#121212]">
                        {nombre}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-[#121212]/68 mt-2">{ubicacion}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-black tracking-tight">Ejemplos de mesas sin coordenada</h4>
            <div className="space-y-3">
              {missingMesaRows.map(([mesa, local, nombre, ubicacion]) => (
                <div key={mesa} className="rounded-2xl border border-[#121212]/8 bg-white p-4">
                  <p className="text-[0.7rem] font-black uppercase tracking-[0.14em] text-[#121212]/45 mb-1">
                    Mesa {mesa} · <strong>Número de local {local}</strong>
                  </p>
                  <p className="text-base font-black tracking-tight text-[#121212]">{nombre}</p>
                  <p className="text-sm leading-relaxed text-[#121212]/68 mt-2">{ubicacion}</p>
                </div>
              ))}
            </div>
          </div>
        </ModalShell>
      ) : null}
    </>
  );
}
