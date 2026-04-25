import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface MarqueeProps {
  scrollDirection?: 'up' | 'down';
  scrollVelocity?: number;
}

const Marquee = ({ scrollDirection = 'up', scrollVelocity = 0 }: MarqueeProps) => {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const xRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const speedRef = useRef(-2); // Negativo = izquierda a derecha
  const targetSpeedRef = useRef(-2);
  const transitionSpeedRef = useRef(0.05);

  useEffect(() => {
    const marqueeContent = marqueeRef.current;
    if (!marqueeContent) return;
    const firstGroup = marqueeContent.firstElementChild as HTMLElement;
    if (!firstGroup) return;

    // Calcular el ancho de un grupo completo (la mitad del contenido)
    const groupWidth = firstGroup.offsetWidth;

    const animate = () => {
      // Suavizar el cambio de velocidad con transición dinámica
      const transition = transitionSpeedRef.current || 0.08;
      speedRef.current += (targetSpeedRef.current - speedRef.current) * transition;

      // Mover el contenido
      xRef.current += speedRef.current;

      // Loop infinito seamless bidireccional
      // Cuando se mueve hacia la izquierda (velocidad negativa) y completa un grupo
      if (xRef.current <= -groupWidth) {
        xRef.current = 0;
      }

      // Cuando se mueve hacia la derecha (velocidad positiva) y llega al inicio
      if (xRef.current >= 0 && speedRef.current > 0) {
        xRef.current = -groupWidth;
      }

      gsap.set(marqueeContent, { x: xRef.current });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Inicializar posición en -groupWidth/2 para que funcione en ambas direcciones
    xRef.current = -groupWidth / 2;
    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (scrollDirection === 'down') {
      // Derecha a izquierda (positivo)
      targetSpeedRef.current = 2;
    } else {
      // Izquierda a derecha (negativo)
      targetSpeedRef.current = -2;
    }
  }, [scrollDirection]);

  useEffect(() => {
    if (scrollVelocity > 0) {
      // Ajustar velocidad de transición basada en la velocidad del scroll
      // Cuanto más rápido scrolleas, más rápido cambia la dirección
      const transitionSpeed = Math.min(0.5, Math.max(0.08, 0.05 + scrollVelocity * 2));
      transitionSpeedRef.current = transitionSpeed;

      // Resetear a valor base después de un tiempo
      setTimeout(() => {
        transitionSpeedRef.current = 0.08;
      }, 100);
    }
  }, [scrollVelocity]);

  return (
    <div className="overflow-hidden whitespace-nowrap box-border w-full absolute bottom-0 left-0 right-0 z-[2] opacity-0 max-md:bottom-8">
      <div className="inline-flex" ref={marqueeRef}>
        <div className="inline-flex shrink-0">
          {[...Array(4)].map((_, i) => (
            <span key={`a-${i}`} className="flex items-center pr-[clamp(1.2rem,3vw,4rem)] whitespace-nowrap max-md:pr-[clamp(0.8rem,5vw,2rem)]">
              <span className="text-[clamp(2.6rem,9vw,10rem)] font-bold inline-block align-middle leading-none -translate-y-[0.1em] text-white max-md:text-[clamp(1.8rem,9vw,3.5rem)]">—</span>
              <span className="h-auto w-auto text-[clamp(2.2rem,7.2vw,8rem)] font-bold inline-block align-middle text-white normal-case leading-none max-md:text-[clamp(1.4rem,6.4vw,2rem)]">Soluciones de Datos</span>
            </span>
          ))}
        </div>
        <div className="inline-flex shrink-0">
          {[...Array(4)].map((_, i) => (
            <span key={`b-${i}`} className="flex items-center pr-[clamp(1.2rem,3vw,4rem)] whitespace-nowrap max-md:pr-[clamp(0.8rem,5vw,2rem)]">
              <span className="text-[clamp(2.6rem,9vw,10rem)] font-bold inline-block align-middle leading-none -translate-y-[0.1em] text-white max-md:text-[clamp(1.8rem,9vw,3.5rem)]">—</span>
              <span className="h-auto w-auto text-[clamp(2.2rem,7.2vw,8rem)] font-bold inline-block align-middle text-white normal-case leading-none max-md:text-[clamp(1.4rem,6.4vw,2rem)]">Soluciones de Datos</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marquee;
