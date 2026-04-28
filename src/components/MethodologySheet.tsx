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

const precisionItems = [
  {
    label: 'ALTA',
    description:
      'Local compatible por codigo o nombre y contexto geografico. En muchos casos la fuente reportada es MED-GPS.',
  },
  {
    label: 'MEDIA',
    description:
      'Coincidencia fuerte, pero con alguna diferencia menor en centro poblado, direccion o denominacion.',
  },
  {
    label: 'APROXIMADA',
    description:
      'Punto util para ubicar la zona o centro poblado, no necesariamente el local exacto.',
  },
  {
    label: 'REVISAR',
    description:
      'Existe un candidato, pero la evidencia no alcanza para aceptarlo sin verificacion manual.',
  },
];

export default function MethodologySheet() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.lenis?.stop?.();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.lenis?.start?.();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <div className="glass-card p-8 my-8 border border-[#121212]/10 bg-white/80">
        <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#121212]/45 mb-3">
          Ficha metodologica
        </p>
        <h3 className="text-2xl md:text-3xl font-black tracking-tight text-[#121212] mb-3">
          Como se construyo la base georreferenciada de la Serie 9
        </h3>
        <p className="text-[#121212]/68 text-base md:text-lg leading-relaxed max-w-3xl mb-6">
          La geocodificacion se hizo a nivel de local de votacion, no de mesa individual. Se
          priorizo SIGMED/MINEDU como fuente principal y cada coordenada se clasifico por nivel de
          confianza antes de pasar al mapa.
        </p>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center min-h-11 px-5 rounded-full bg-[#121212] text-white text-sm font-black uppercase tracking-[0.12em] transition-transform duration-200 hover:translate-y-[-1px]"
        >
          Ver metodologia
        </button>
      </div>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-label="Ficha metodologica de geocodificacion"
        >
          <button
            type="button"
            aria-label="Cerrar metodologia"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-[#121212]/55 backdrop-blur-[2px]"
          />

          <div className="relative w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-[1.6rem] bg-white text-[#121212] shadow-[0_30px_80px_rgba(0,0,0,0.28)] border border-[#121212]/10">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 px-6 md:px-8 py-5 border-b border-[#121212]/8 bg-white/95 backdrop-blur-md">
              <div>
                <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#121212]/42 mb-2">
                  Ficha metodologica
                </p>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight leading-none">
                  Geocodificacion de mesas Serie 9
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center size-10 rounded-full border border-[#121212]/10 text-[#121212]/72 text-xl font-medium"
                aria-label="Cerrar modal"
              >
                ×
              </button>
            </div>

            <div className="px-6 md:px-8 py-6 md:py-8 space-y-8">
              <section className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-[#f8fafc] border border-[#121212]/6 p-5">
                  <p className="text-[0.66rem] font-black uppercase tracking-[0.14em] text-[#121212]/42 mb-2">
                    Universo
                  </p>
                  <p className="text-2xl font-black tracking-tight">4,703 mesas</p>
                  <p className="text-sm leading-relaxed text-[#121212]/65 mt-2">
                    Mesas cuyo numero comienza con 9, agrupadas en 1,939 locales unicos.
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
                    Se priorizo por devolver registros educativos estructurados y, en muchos casos,
                    coordenadas MED-GPS.
                  </p>
                </div>
              </section>

              <section>
                <h4 className="text-lg font-black tracking-tight mb-3">Como se hizo</h4>
                <div className="space-y-3 text-[0.98rem] leading-relaxed text-[#121212]/76">
                  <p>
                    La base original de 4,703 mesas se cotejo con el PDF para recuperar
                    direccion, descriptor del local y validaciones de estado. Luego se agrupo por
                    <strong> numero_local </strong>
                    para trabajar a nivel de local de votacion.
                  </p>
                  <p>
                    Para cada local unico se consulto SIGMED/MINEDU combinando departamento,
                    provincia, distrito, nombre del local, descriptor del PDF, codigo de
                    institucion y centro poblado reportado por los resultados.
                  </p>
                  <p>
                    La coordenada final se asigno al local seleccionado y desde ahi se heredo a las
                    mesas asociadas. Por eso en el mapa cada punto representa un local y el popup
                    lista sus mesas relacionadas.
                  </p>
                </div>
              </section>

              <section>
                <h4 className="text-lg font-black tracking-tight mb-3">Como leer la confianza</h4>
                <div className="grid gap-3">
                  {precisionItems.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-[#121212]/8 bg-white p-4"
                    >
                      <p className="text-[0.7rem] font-black uppercase tracking-[0.14em] text-[#121212]/45 mb-1">
                        {item.label}
                      </p>
                      <p className="text-sm leading-relaxed text-[#121212]/72">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h4 className="text-lg font-black tracking-tight mb-3">Que significa el score</h4>
                <p className="text-[0.98rem] leading-relaxed text-[#121212]/76">
                  El <strong>score_coord</strong> resume la fuerza de la coincidencia encontrada en
                  SIGMED. Un valor mas alto suele indicar mejor consistencia entre codigo, nombre
                  del local, centro poblado y fuente GPS. En terminos simples: mientras mas alto,
                  mas razones encontro el sistema para pensar que ese punto si corresponde al local
                  buscado.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-black tracking-tight mb-3">Limites de la base</h4>
                <div className="space-y-3 text-[0.98rem] leading-relaxed text-[#121212]/76">
                  <p>
                    No todos los locales aparecen en SIGMED con el mismo nombre del PDF. Algunos
                    son casas comunales, tambos o instituciones con variantes ortograficas.
                  </p>
                  <p>
                    Por eso los casos <strong>REVISAR</strong> y <strong>SIN_COORDENADA</strong> no
                    se tratan como ubicaciones definitivas: requieren una segunda pasada de
                    revision manual o contraste adicional.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
