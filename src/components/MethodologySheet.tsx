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

type SheetMode = 'methodology';

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
          Esta visualización fue elaborada a partir de los locales de votación asociados a las
          mesas serie 900. Para ello, se tomó como referencia la información de la base electoral
          y se la contrastó con registros de SIGMED, que aportan datos de instituciones
          educativas, incluidos nombres y códigos de colegio, útiles para identificar los locales
          de votación, especialmente cuando estos funcionan en centros educativos. Posteriormente,
          se utilizó la API de Google Maps para obtener las coordenadas con las que esos puntos
          fueron representados en el mapa.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setOpenSheet('methodology')}
            className="inline-flex items-center justify-center min-h-11 px-5 rounded-full bg-[#121212] text-white text-sm font-black uppercase tracking-[0.12em] transition-transform duration-200 hover:translate-y-[-1px]"
          >
            Ver metodología
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
                Se identificaron, mediante la API de la ONPE, las mesas correspondientes a la
                serie 900 y los locales de votación a los que se encuentran asociadas. A partir de
                esa información, y en complemento con los registros de SIGMED, se obtuvieron las
                coordenadas utilizadas para representar esos puntos en el mapa. Por ello, cada
                punto de la visualización corresponde a un local de votación y agrupa las mesas
                vinculadas a ese lugar.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-black tracking-tight">Nivel de ubicación</h4>
            <div className="space-y-3 text-[0.98rem] leading-relaxed text-[#121212]/76">
              <p>
                <strong>84.3%</strong> de las mesas con coordenadas asignadas presentan un nivel
                <strong> ALTA</strong>.
              </p>
              <p>
                El porcentaje restante corresponde a ubicaciones <strong>MEDIA</strong> y
                <strong> APROXIMADA</strong>, que no invalidan la representación del mapa, sino
                que expresan distintos grados de cercanía respecto del local esperado,
                particularmente en ámbitos rurales donde la georreferenciación exacta puede ser más
                difícil.
              </p>
            </div>
          </div>

        </ModalShell>
      ) : null}
    </>
  );
}
