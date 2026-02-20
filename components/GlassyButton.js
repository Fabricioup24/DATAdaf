import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import styles from './GlassyButton.module.css';

const GlassyButton = ({ text = "Conoce más", onClick }) => {
  const buttonRef = useRef(null);
  const particlesRef = useRef([]);
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
    const button = buttonRef.current.querySelector(`.${styles.button}`);

    if (!button) return;

    // Obtener las dimensiones del botón
    const buttonRect = button.getBoundingClientRect();
    const buttonWidth = 280; // Ancho aproximado del botón
    const buttonHeight = 70; // Alto aproximado del botón
    const borderRadius = 35; // Radio de las esquinas redondeadas

    // Generar posiciones finales que formen el shape del botón
    const finalPositions = [];

    // Distribuir partículas en el área del botón (forma de píldora)
    particles.forEach((particle, index) => {
      if (!particle) return;

      // Generar posición aleatoria dentro de la forma del botón
      let x, y;
      const angle = (index / particles.length) * Math.PI * 2;
      const random = Math.random();

      // Mezcla de partículas en el borde y en el interior
      if (random < 0.4) {
        // 40% en el borde (contorno)
        const t = index / particles.length;
        const progress = t * 2 * Math.PI;

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
    <div className={styles.container} ref={buttonRef}>
      {/* Partículas */}
      <div className={styles.particlesContainer}>
        {[...Array(particleCount)].map((_, i) => (
          <div
            key={i}
            className={styles.particle}
            ref={(el) => (particlesRef.current[i] = el)}
          />
        ))}
      </div>

      {/* Botón glassy */}
      <button className={styles.button} onClick={onClick}>
        <span className={styles.buttonText}>{text}</span>
        <div className={styles.glassReflection}></div>
      </button>
    </div>
  );
};

export default GlassyButton;
