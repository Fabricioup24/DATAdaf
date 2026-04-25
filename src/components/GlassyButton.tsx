import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface GlassyButtonProps {
  text?: string;
  onClick?: () => void;
}

const GlassyButton = ({ text = "Conoce más", onClick }: GlassyButtonProps) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<(HTMLDivElement | null)[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            animateParticles();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (buttonRef.current) {
      observer.observe(buttonRef.current);
    }

    return () => {
      if (buttonRef.current) {
        observer.unobserve(buttonRef.current);
      }
    };
  }, [isVisible]);

  const animateParticles = () => {
    const particles = particlesRef.current;
    if (!buttonRef.current) return;
    const button = buttonRef.current.querySelector<HTMLButtonElement>('.glassy-btn');

    if (!button) return;

    // Obtener las dimensiones del botón
    const buttonWidth = 280; // Ancho aproximado del botón
    const buttonHeight = 70; // Alto aproximado del botón
    const borderRadius = 35; // Radio de las esquinas redondeadas

    // Generar posiciones finales que formen el shape del botón
    const finalPositions: {x: number, y: number}[] = [];

    // Distribuir partículas en el área del botón (forma de píldora)
    particles.forEach((particle, index) => {
      if (!particle) return;

      // Generar posición aleatoria dentro de la forma del botón
      let x = 0, y = 0;
      const random = Math.random();

      // Mezcla de partículas en el borde y en el interior
      if (random < 0.4) {
        // 40% en el borde (contorno)
        const t = index / particles.length;
        
        // Crear forma de píldora (rectángulo con bordes redondeados)
        if (t < 0.25) {
          // Borde superior
          x = gsap.utils.mapRange(0, 0.25, -buttonWidth/2 + borderRadius, buttonWidth/2 - borderRadius, t);
          y = -buttonHeight/2;
        } else if (t < 0.5) {
          // Borde derecho (semicírculo)
          const circleProgress = gsap.utils.mapRange(0.25, 0.5, 0, Math.PI, t);
          x = buttonWidth/2 - borderRadius + Math.cos(circleProgress - Math.PI/2) * borderRadius;
          y = Math.sin(circleProgress - Math.PI/2) * borderRadius;
        } else if (t < 0.75) {
          // Borde inferior
          x = gsap.utils.mapRange(0.75, 0.5, -buttonWidth/2 + borderRadius, buttonWidth/2 - borderRadius, t);
          y = buttonHeight/2;
        } else {
          // Borde izquierdo (semicírculo)
          const circleProgress = gsap.utils.mapRange(0.75, 1, Math.PI, Math.PI * 2, t);
          x = -buttonWidth/2 + borderRadius + Math.cos(circleProgress - Math.PI/2) * borderRadius;
          y = Math.sin(circleProgress - Math.PI/2) * borderRadius;
        }
      } else {
        // 60% distribuidas en el interior
        x = gsap.utils.random(-buttonWidth/2 + borderRadius, buttonWidth/2 - borderRadius);
        y = gsap.utils.random(-buttonHeight/2 + 10, buttonHeight/2 - 10);
      }

      finalPositions.push({ x, y });
    });

    // Animar cada partícula desde posiciones aleatorias hacia su posición final
    particles.forEach((particle, index) => {
      if (!particle) return;

      const finalPos = finalPositions[index];

      gsap.fromTo(
        particle,
        {
          x: gsap.utils.random(-400, 400),
          y: gsap.utils.random(-400, 400),
          opacity: 0,
          scale: 0,
        },
        {
          x: finalPos.x,
          y: finalPos.y,
          opacity: 1,
          scale: 1,
          duration: 1.8,
          delay: index * 0.008,
          ease: 'power2.out',
          onComplete: () => {
            // Cuando todas las partículas llegaron, fundirlas con el botón
            if (index === particles.length - 1) {
              // Esperar un momento para que se vea la forma completa
              gsap.to(particles, {
                opacity: 0,
                scale: 1.5,
                duration: 0.4,
                delay: 0.3,
                ease: 'power2.in',
                stagger: 0.002,
                onComplete: () => {
                  // Mostrar el botón real con efecto
                  gsap.fromTo(
                    button,
                    { scale: 0.95, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
                  );
                },
              });
            }
          },
        }
      );
    });
  };

  // Crear 150 partículas para mejor definición
  const particleCount = 150;

  return (
    <div className="relative flex justify-center items-center min-h-[200px] w-full" ref={buttonRef}>
      {/* Partículas */}
      <div className="absolute w-full h-full top-0 left-0 pointer-events-none">
        {[...Array(particleCount)].map((_, i) => (
          <div
            key={i}
            className="absolute size-[6px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 will-change-transform shadow-[0_0_6px_rgba(255,255,255,0.6),0_0_12px_rgba(255,255,255,0.3)] bg-[radial-gradient(circle,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.4)_100%)]"
            ref={(el) => (particlesRef.current[i] = el)}
          />
        ))}
      </div>

      {/* Botón glassy */}
      <button 
        className="glassy-btn relative px-[3.5rem] py-[1.5rem] text-[1.2rem] font-bold text-white bg-white/10 border border-white/20 rounded-[50px] backdrop-blur-[10px] shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] cursor-pointer overflow-hidden transition-all duration-300 opacity-0 z-[1] max-md:py-[1.2rem] max-md:px-[2.5rem] max-md:text-[1rem] hover:bg-white/15 hover:border-white/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.3)] hover:-translate-y-[2px] active:translate-y-0 active:shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] group before:content-[''] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] before:transition-[left] before:duration-500 hover:before:left-full after:content-[''] after:absolute after:-top-1/2 after:-left-1/2 after:w-[200%] after:h-[200%] after:bg-[linear-gradient(45deg,transparent_30%,rgba(255,255,255,0.1)_50%,transparent_70%)] after:bg-[length:200%_200%] after:animate-[shimmer_3s_linear_infinite] after:pointer-events-none after:opacity-50" 
        onClick={onClick}
      >
        <span className="relative z-[2] font-sans tracking-[0.5px]">{text}</span>
        <div className="absolute top-0 left-0 w-full h-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,0.15)_0%,rgba(255,255,255,0)_100%)] rounded-t-[50px] pointer-events-none z-[1]"></div>
      </button>
    </div>
  );
};

export default GlassyButton;
