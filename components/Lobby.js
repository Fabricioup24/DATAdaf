import { useEffect, useState, useRef } from 'react';

export default function Lobby({ onComplete }) {
  const targetWord = "DATAcore";
  const [displayText, setDisplayText] = useState("");
  const [showWave, setShowWave] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&*";
    let iterations = 0;
    let interval = null;

    // Efecto de Slot Machine / Decodificación
    interval = setInterval(() => {
      setDisplayText((prev) => {
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
        clearInterval(interval);

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

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className={`lobby ${showWave ? 'wave-exit' : ''}`}>
        <div className="lobby-content">
          <h1 className="lobby-word">
            {displayText}
          </h1>
        </div>
      </div>

      {/* Wave reveal overlay */}
      <div className={`lobby-wave-reveal ${showWave ? 'active' : ''}`}>
        <svg className="wave-reveal-svg" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path
            fill="#121212"
            d="M0,120 L0,60 Q360,0 720,60 T1440,60 L1440,120 Z"
          />
        </svg>
      </div>
    </>
  );
}
