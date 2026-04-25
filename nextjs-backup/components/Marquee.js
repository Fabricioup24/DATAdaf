import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import styles from './Marquee.module.css';

const Marquee = ({ scrollDirection, scrollVelocity }) => {
  const marqueeRef = useRef(null);
  const xRef = useRef(0);
  const animationFrameRef = useRef(null);
  const speedRef = useRef(-2); // Negativo = izquierda a derecha
  const targetSpeedRef = useRef(-2);
  const transitionSpeedRef = useRef(0.05);

  useEffect(() => {
    const marqueeContent = marqueeRef.current;
    const firstGroup = marqueeContent.firstElementChild;
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
    <div className={styles.marquee}>
      <div className={styles.marqueeContent} ref={marqueeRef}>
        <div className={styles.marqueeGroup}>
          <span className={styles.marqueeItem}>
            <span className={styles.dash}>—</span>
            <span className={styles.marqueeText}>Soluciones de Datos</span>
          </span>
          <span className={styles.marqueeItem}>
            <span className={styles.dash}>—</span>
            <span className={styles.marqueeText}>Soluciones de Datos</span>
          </span>
          <span className={styles.marqueeItem}>
            <span className={styles.dash}>—</span>
            <span className={styles.marqueeText}>Soluciones de Datos</span>
          </span>
          <span className={styles.marqueeItem}>
            <span className={styles.dash}>—</span>
            <span className={styles.marqueeText}>Soluciones de Datos</span>
          </span>
        </div>
        <div className={styles.marqueeGroup}>
          <span className={styles.marqueeItem}>
            <span className={styles.dash}>—</span>
            <span className={styles.marqueeText}>Soluciones de Datos</span>
          </span>
          <span className={styles.marqueeItem}>
            <span className={styles.dash}>—</span>
            <span className={styles.marqueeText}>Soluciones de Datos</span>
          </span>
          <span className={styles.marqueeItem}>
            <span className={styles.dash}>—</span>
            <span className={styles.marqueeText}>Soluciones de Datos</span>
          </span>
          <span className={styles.marqueeItem}>
            <span className={styles.dash}>—</span>
            <span className={styles.marqueeText}>Soluciones de Datos</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Marquee;