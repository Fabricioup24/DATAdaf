import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';

interface CarouselImage {
  src: string;
  alt: string;
}

const CylinderCarousel = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rotationRef = useRef({ y: 0 });
    const isDraggingRef = useRef(false);
    const startXRef = useRef(0);
    const startYRef = useRef(0);
    const totalDistRef = useRef(0);
    const speedRef = useRef(0); // Representa solo la velocidad adicional de inercia
    const [selectedImage, setSelectedImage] = useState<CarouselImage | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const images: CarouselImage[] = [
        { src: '/graficos/1.webp', alt: 'Dashboard de análisis demográfico interactivo' },
        { src: '/graficos/2.webp', alt: 'Visualización de datos geoespaciales - Mapa de calor' },
        { src: '/graficos/3.webp', alt: 'Gráfico de dispersión para análisis de correlación' },
        { src: '/graficos/4.webp', alt: 'Reporte ejecutivo con indicadores KPI' },
        { src: '/graficos/5.webp', alt: 'Diagrama de flujo de datos y procesos' },
        { src: '/graficos/6.webp', alt: 'Visualización de redes complejas' },
        { src: '/graficos/7.webp', alt: 'Análisis de series de tiempo financiero' },
        { src: '/graficos/8.webp', alt: 'Infografía estadística para tesis' },
        { src: '/graficos/9.webp', alt: 'Dashboard corporativo de ventas' },
        { src: '/graficos/10.webp', alt: 'Modelado predictivo y visualización de machine learning' },
        { src: '/graficos/11.webp', alt: 'Estructura de datos y arquitectura de información' },
    ];

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let animId: number;
        const rotate = () => {
            // Sumamos una base de 0.1 siempre, más la inercia (speedRef)
            rotationRef.current.y += 0.1 + speedRef.current;
            gsap.set(container, { rotationY: rotationRef.current.y });
            animId = requestAnimationFrame(rotate);
        };
        animId = requestAnimationFrame(rotate);

        const handleMouseDown = (e: MouseEvent | TouchEvent) => {
            if (selectedImage) return;
            isDraggingRef.current = true;
            const x = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
            const y = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
            startXRef.current = x;
            startYRef.current = y;
            totalDistRef.current = 0;
            container.style.cursor = 'grabbing';
        };

        const handleMouseMove = (e: MouseEvent | TouchEvent) => {
            if (!isDraggingRef.current) return;
            const currentX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
            const currentY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
            const deltaX = currentX - startXRef.current;
            const deltaY = currentY - startYRef.current;
            totalDistRef.current += Math.abs(deltaX) + Math.abs(deltaY);

            // Solo afectamos la rotación si hay arrastre real
            rotationRef.current.y += deltaX * 0.2;
            startXRef.current = currentX;
            startYRef.current = currentY;

            // Ajustamos la velocidad para el efecto de inercia posterior
            speedRef.current = deltaX * 0.1;
        };

        const handleMouseUp = () => {
            isDraggingRef.current = false;
            container.style.cursor = 'grab';
            // Volvemos la inercia a 0 suavemente
            gsap.to(speedRef, {
                duration: 2,
                current: 0,
                ease: "power2.out"
            });
        };

        // Escuchar inicio de interacción solo en el contenedor del carrusel
        container.addEventListener('mousedown', handleMouseDown as EventListener);
        container.addEventListener('touchstart', handleMouseDown as EventListener, { passive: true });

        // El movimiento y fin se escuchan en window para mayor robustez
        window.addEventListener('mousemove', handleMouseMove as EventListener);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleMouseMove as EventListener, { passive: true });
        window.addEventListener('touchend', handleMouseUp);

        return () => {
            cancelAnimationFrame(animId);
            container.removeEventListener('mousedown', handleMouseDown as EventListener);
            container.removeEventListener('touchstart', handleMouseDown as EventListener);
            window.removeEventListener('mousemove', handleMouseMove as EventListener);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMouseMove as EventListener);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [selectedImage]);

    const handleImageClick = (src: CarouselImage) => {
        if (totalDistRef.current < 10) {
            setSelectedImage(src);
        }
    };

    const closeLightbox = () => {
        setSelectedImage(null);
    };

    const renderLightbox = () => {
        if (!selectedImage || !mounted) return null;

        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

        const lightboxStyle: React.CSSProperties = {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            zIndex: 9999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            margin: 0
        };

        const contentStyle: React.CSSProperties = {
            position: 'relative',
            width: isMobile ? '95vw' : '90vw',
            height: isMobile ? '95vh' : '90vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? '15px' : '0'
        };

        const imageStyle: React.CSSProperties = {
            maxWidth: '100%',
            maxHeight: isMobile ? '80vh' : '100%',
            objectFit: 'contain',
            borderRadius: '12px',
            boxShadow: '0 40px 80px rgba(0, 0, 0, 0.2)'
        };

        const closeBtnStyle: React.CSSProperties = {
            position: isMobile ? 'static' : 'absolute',
            alignSelf: isMobile ? 'flex-end' : 'auto',
            top: isMobile ? 'auto' : '20px',
            right: isMobile ? 'auto' : '2vw',
            background: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '45px',
            height: '45px',
            fontSize: '28px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
            zIndex: 10000000,
            color: '#121212',
            fontWeight: '700',
            flexShrink: 0
        };

        return createPortal(
            <div style={lightboxStyle} onClick={closeLightbox}>
                <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
                    <button style={closeBtnStyle} onClick={closeLightbox}>&times;</button>
                    <img src={selectedImage.src} alt={selectedImage.alt} style={imageStyle} />
                </div>
            </div>,
            document.body
        );
    };

    return (
        <div className="w-full relative">
            <div className="w-full h-[500px] perspective-[3000px] flex items-center justify-center -mt-[5rem] overflow-visible max-md:h-[320px] max-md:mt-0 lg:max-xl:h-[420px] lg:max-xl:-mt-[1.8rem]">
                <div
                    className="relative w-[350px] h-[220px] transform-style-3d cursor-grab -translate-z-[200px] hover:*:brightness-70 max-md:w-[300px] max-md:h-[180px] max-md:-translate-z-[280px] lg:max-xl:w-[320px] lg:max-xl:h-[200px] lg:max-xl:-translate-z-[240px]"
                    ref={containerRef}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {images.map((image, index) => {
                        const angle = (index / images.length) * 360;
                        const translateZ = typeof window !== 'undefined' && window.innerWidth < 768 ? 700 : 750;
                        return (
                            <div
                                key={index}
                                className="absolute w-[350px] h-[220px] left-0 top-0 rounded-[15px] overflow-hidden bg-white border border-black/10 shadow-[0_10px_25px_rgba(0,0,0,0.1)] backface-hidden flex items-center justify-center select-none transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:!transform-[rotateY(var(--item-angle))_translateZ(calc(var(--item-translateZ)+60px))_scale(1.15)] hover:border-[#0077ff] hover:z-[100] hover:!brightness-100 hover:shadow-[0_0_45px_rgba(0,119,255,0.6),0_25px_50px_rgba(0,0,0,0.3)] group max-md:w-[300px] max-md:h-[180px] lg:max-xl:w-[320px] lg:max-xl:h-[200px]"
                                onClick={() => handleImageClick(image)}
                                style={{
                                    transform: `rotateY(${angle}deg) translateZ(${translateZ}px)`,
                                    WebkitUserDrag: 'none',
                                    backfaceVisibility: 'hidden',
                                    ['--item-angle' as any]: `${angle}deg`,
                                    ['--item-translateZ' as any]: `${translateZ}px`
                                }}
                            >
                                <div className="w-[92%] h-[92%] flex items-center justify-center overflow-hidden">
                                    <img
                                        src={image.src}
                                        alt={image.alt}
                                        width={350}
                                        height={220}
                                        loading="lazy"
                                        className="max-w-full max-h-full object-contain transition-transform duration-[600ms] ease-in-out group-hover:scale-105"
                                        onDragStart={(e) => e.preventDefault()}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {renderLightbox()}
        </div>
    );
};

export default CylinderCarousel;
