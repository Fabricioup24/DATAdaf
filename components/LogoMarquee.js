import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import styles from './LogoMarquee.module.css';

const LogoMarquee = ({ scrollDirection, scrollVelocity }) => {
    const marqueeRef = useRef(null);
    const xRef = useRef(0);
    const animationFrameRef = useRef(null);
    const speedRef = useRef(1.5);
    const targetSpeedRef = useRef(1.5);
    const transitionSpeedRef = useRef(0.05);
    const groupWidthRef = useRef(0);

    const logos = [
        '/graficos/Banco-Mundial.webp',
        '/graficos/BCRP.webp',
        '/graficos/CEPALSTAT.webp',
        '/graficos/FAOUN.webp',
        '/graficos/INEI.webp',
        '/graficos/JNE.webp',
        '/graficos/OECD.webp',
        '/graficos/portal_de_transparencia.webp'
    ];

    useEffect(() => {
        const marqueeContent = marqueeRef.current;
        if (!marqueeContent) return;

        const updateWidth = () => {
            const firstGroup = marqueeContent.firstElementChild;
            if (firstGroup) {
                // Usamos getBoundingClientRect para precisión de subpíxeles
                groupWidthRef.current = firstGroup.getBoundingClientRect().width;
            }
        };

        // Medir inicialmente y después de un tiempo para asegurar carga de imágenes
        updateWidth();
        const timer1 = setTimeout(updateWidth, 500);
        const timer2 = setTimeout(updateWidth, 2000);

        const animate = () => {
            const transition = transitionSpeedRef.current || 0.08;
            speedRef.current += (targetSpeedRef.current - speedRef.current) * transition;

            // Invertimos la lógica si queremos que se mueva hacia la izquierda por defecto (estándar)
            // O mantenemos la dirección actual si el usuario la prefiere.
            // Según el código original, sumaba 1.5, moviéndose a la derecha.
            xRef.current += speedRef.current;

            const groupWidth = groupWidthRef.current;
            if (groupWidth > 0) {
                // Loop infinito sin saltos visibles
                // Si se mueve a la derecha (x aumenta)
                if (speedRef.current > 0) {
                    if (xRef.current >= 0) {
                        xRef.current -= groupWidth;
                    }
                }
                // Si se mueve a la izquierda (x disminuye)
                else {
                    if (xRef.current <= -groupWidth) {
                        xRef.current += groupWidth;
                    }
                }
            }

            gsap.set(marqueeContent, { x: xRef.current });
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        window.addEventListener('resize', updateWidth);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            clearTimeout(timer1);
            clearTimeout(timer2);
            window.removeEventListener('resize', updateWidth);
        };
    }, []);

    useEffect(() => {
        targetSpeedRef.current = 1.5;
    }, []);

    useEffect(() => {
        if (scrollVelocity > 0) {
            const transitionSpeed = Math.min(0.5, Math.max(0.08, 0.05 + scrollVelocity * 2));
            transitionSpeedRef.current = transitionSpeed;
            setTimeout(() => {
                transitionSpeedRef.current = 0.08;
            }, 100);
        }
    }, [scrollVelocity]);

    return (
        <div className={styles.marquee}>
            <div className={styles.marqueeContent} ref={marqueeRef}>
                {[1, 2, 3].map((groupNum) => (
                    <div key={`group-${groupNum}`} className={styles.marqueeGroup}>
                        {logos.map((logo, index) => (
                            <div key={`logo-${groupNum}-${index}`} className={styles.logoItem}>
                                <img src={logo} alt={`Logo ${index}`} className={styles.logoImage} />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LogoMarquee;
