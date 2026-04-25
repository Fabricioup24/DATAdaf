import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface LogoMarqueeProps {
  scrollDirection?: 'up' | 'down';
  scrollVelocity?: number;
}

const LogoMarquee = ({ scrollDirection = 'up', scrollVelocity = 0 }: LogoMarqueeProps) => {
    const marqueeRef = useRef<HTMLDivElement>(null);
    const xRef = useRef(0);
    const animationFrameRef = useRef<number | null>(null);
    const speedRef = useRef(1.5);
    const targetSpeedRef = useRef(1.5);
    const transitionSpeedRef = useRef(0.05);
    const groupWidthRef = useRef(0);

    const logos = [
        { src: '/graficos/Banco-Mundial.webp', alt: 'Banco Mundial' },
        { src: '/graficos/BCRP.webp', alt: 'Banco Central de Reserva del Perú (BCRP)' },
        { src: '/graficos/CEPALSTAT.webp', alt: 'CEPALSTAT - Comisión Económica para América Latina y el Caribe' },
        { src: '/graficos/FAOUN.webp', alt: 'FAO - Organización de las Naciones Unidas para la Alimentación y la Agricultura' },
        { src: '/graficos/INEI.webp', alt: 'INEI - Instituto Nacional de Estadística e Informática' },
        { src: '/graficos/JNE.webp', alt: 'JNE - Jurado Nacional de Elecciones' },
        { src: '/graficos/OECD.webp', alt: 'OCDE - Organización para la Cooperación y el Desarrollo Económicos' },
        { src: '/graficos/portal_de_transparencia.webp', alt: 'Portal de Transparencia Estándar Perú' }
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
        <div className="overflow-hidden whitespace-nowrap box-border w-full relative z-[2] shrink-0 my-[clamp(0.4rem,1.2vw,1rem)] max-md:!mt-0">
            <div className="inline-flex" ref={marqueeRef}>
                {[1, 2, 3].map((groupNum) => (
                    <div key={`group-${groupNum}`} className="inline-flex shrink-0 items-center">
                        {logos.map((logo, index) => (
                            <div key={`logo-${groupNum}-${index}`} className="flex items-center px-[clamp(1rem,3vw,4rem)] h-[clamp(70px,7vw,100px)] group max-md:px-[clamp(0.8rem,4vw,2rem)] max-md:h-[clamp(72px,18vw,100px)]">
                                <img 
                                  src={logo.src} 
                                  alt={logo.alt} 
                                  className="h-[clamp(42px,4.2vw,60px)] w-auto max-w-[clamp(140px,18vw,250px)] object-contain transition-all duration-300 ease-in-out group-hover:scale-110 max-md:h-[clamp(44px,12vw,65px)]" 
                                />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LogoMarquee;
