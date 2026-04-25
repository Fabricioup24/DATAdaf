import { useEffect, useState } from 'react';

/**
 * Component that displays a floating location tag alternating between a globe and a map of Peru.
 * Used on the hero section.
 */
const LocationTag = () => {
  const [showPeruMap, setShowPeruMap] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowPeruMap((prev) => !prev);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute left-0 top-[65%] -translate-y-1/2 bg-[#0d1b2a]/5 backdrop-blur-md border border-[#0d1b2a]/10 border-l-0 rounded-r-[50px] p-[1.2rem] pr-[1.8rem] flex items-center gap-6 z-10 shadow-[0_4px_16px_rgba(0,0,0,0.05)] animate-slideInFromLeft max-xl:top-auto max-xl:bottom-5 max-xl:transform-none max-xl:max-w-[calc(100vw-1rem)] max-xl:p-3 max-xl:pr-4 max-xl:gap-[0.9rem] max-md:bottom-4 max-md:left-2 max-md:border-l max-md:rounded-[50px] max-[420px]:p-2 max-[420px]:gap-2">
      <div className="flex flex-col gap-[0.1rem] items-start">
        <span className="text-[1.1rem] font-semibold text-[#0d1b2a] whitespace-nowrap tracking-[0.5px] leading-[1.3] max-xl:text-[0.92rem] max-md:text-[0.85rem] max-[420px]:text-[0.78rem] max-[420px]:tracking-[0.2px]">Located in</span>
        <span className="text-[1.1rem] font-semibold text-[#0d1b2a] whitespace-nowrap tracking-[0.5px] leading-[1.3] max-xl:text-[0.92rem] max-md:text-[0.85rem] max-[420px]:text-[0.78rem] max-[420px]:tracking-[0.2px]">Peru</span>
      </div>
      <div className="relative size-10 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.15)] shrink-0 max-xl:size-[34px] max-md:size-[35px] group">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white/30 to-transparent animate-shimmer" />
        
        <div className={`absolute size-[30px] flex items-center justify-center max-xl:size-[24px] max-md:size-[26px] ${!showPeruMap ? 'animate-bounceIn opacity-0' : 'animate-scaleOut'}`}>
          <img
            src="/graficos/globo.png"
            alt="Mapa Mundi"
            width={30}
            height={30}
            className="size-full object-contain -scale-x-100"
          />
        </div>
        <div className={`absolute size-[30px] flex items-center justify-center max-xl:size-[24px] max-md:size-[26px] ${showPeruMap ? 'animate-bounceIn opacity-0' : 'animate-scaleOut'}`}>
          <img
            src="/graficos/peru.png"
            alt="Mapa de Perú"
            width={30}
            height={30}
            className="size-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default LocationTag;
