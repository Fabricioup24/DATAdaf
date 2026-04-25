import { useEffect, useState, useRef } from 'react';

interface LobbyProps {
  onComplete?: () => void;
}

export default function Lobby({ onComplete }: LobbyProps) {
  const targetWord = "DATAdaf";
  const [displayText, setDisplayText] = useState<string>("");
  const [showWave, setShowWave] = useState<boolean>(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&*";
    let iterations = 0;
    let interval: NodeJS.Timeout | null = null;

    // Efecto de Slot Machine / Decodificación
    interval = setInterval(() => {
      setDisplayText(() => {
        return targetWord
          .split("")
          .map((letter, index) => {
            if (index < iterations) {
              return targetWord[index]; // Letra ya "ganada"
            }
            return chars[Math.floor(Math.random() * chars.length)]; // Letra girando
          })
          .join("");
      });

      if (iterations >= targetWord.length) {
        if (interval) clearInterval(interval);

        // Iniciar salida después de completar la palabra
        setTimeout(() => {
          setShowWave(true);
        }, 800);

        setTimeout(() => {
          if (onCompleteRef.current) onCompleteRef.current();
        }, 2600); // 800ms espera + 1800ms ola
      }

      // Velocidad del "giro" de las letras no resueltas
      iterations += 1 / 3;
    }, 50); // Velocidad del frame (ms)

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <>
      <div className={`fixed inset-0 w-screen h-screen bg-white z-[9999] flex items-center justify-center overflow-hidden`}>
        <div className={`relative z-[2] transition-opacity duration-500 ease-in-out ${showWave ? 'opacity-0' : 'opacity-100'}`}>
          <h1 className="text-[8vw] font-bold text-[#121212] m-0 animate-fadeInScale transition-opacity duration-200 ease-in-out whitespace-nowrap max-md:text-[2.8rem] max-md:text-center max-md:w-[90%]">
            {displayText}
          </h1>
        </div>
      </div>

      {/* Wave reveal overlay */}
      <div 
        className={`fixed bottom-0 left-0 w-screen h-screen z-[10000] bg-[#121212] transition-transform duration-[2000ms] ease-[cubic-bezier(0.77,0,0.175,1)] pointer-events-none ${showWave ? 'translate-y-0' : 'translate-y-[calc(100%+130px)] max-md:translate-y-[calc(100%+80px)]'}`}
      >
        <svg 
          className="absolute -top-[121px] -left-[1px] w-[calc(100%+2px)] h-[152px] block max-md:-top-[76px] max-md:h-[106px]" 
          viewBox="0 0 1440 152" 
          preserveAspectRatio="none"
        >
          <path
            fill="#121212"
            stroke="#121212"
            strokeWidth="2"
            d="M-10,152 L-10,60 Q360,0 720,60 T1450,60 L1450,152 Z"
          />
        </svg>
      </div>
    </>
  );
}
