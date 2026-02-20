import { useEffect, useState, useRef } from 'react';

export default function Lobby({ onComplete }) {
  const words = ['Hola', 'Hello', 'Olá', 'Ciao', 'Bonjour', ':)'];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showWave, setShowWave] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (currentWordIndex < words.length) {
      // Iniciar fade out antes de cambiar la palabra
      const fadeTimer = setTimeout(() => {
        setFadeOut(true);
      }, 300); // Fade out después de 300ms

      // Cambiar palabra después del fade out
      const changeTimer = setTimeout(() => {
        setFadeOut(false);
        setCurrentWordIndex(currentWordIndex + 1);
      }, 400); // Total 400ms entre palabras

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(changeTimer);
      };
    } else if (currentWordIndex === words.length) {
      // Todas las palabras han aparecido, iniciar transición de ola
      const waveTimer = setTimeout(() => {
        setShowWave(true);
      }, 300);

      // Llamar onComplete justo cuando la ola está por terminar
      const completeTimer = setTimeout(() => {
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }, 2100); // 300ms + 1800ms de la animación de ola

      return () => {
        clearTimeout(waveTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [currentWordIndex, words.length]);

  return (
    <>
      <div className={`lobby ${showWave ? 'wave-exit' : ''}`}>
        <div className="lobby-content">
          {currentWordIndex > 0 && (
            <h1 className={`lobby-word ${fadeOut ? 'fade-out' : ''}`}>
              {words[currentWordIndex - 1]}
            </h1>
          )}
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
