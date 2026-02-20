import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import styles from './CylinderCarousel.module.css';

const CylinderCarousel = () => {
    const containerRef = useRef(null);
    const rotationRef = useRef({ y: 0 });
    const isDraggingRef = useRef(false);
    const startXRef = useRef(0);
    const startYRef = useRef(0);
    const totalDistRef = useRef(0);
    const speedRef = useRef(0); // Representa solo la velocidad adicional de inercia
    const [selectedImage, setSelectedImage] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const images = [
        '/graficos/1.webp', '/graficos/2.webp', '/graficos/3.webp',
        '/graficos/4.webp', '/graficos/5.webp', '/graficos/6.webp',
        '/graficos/7.webp', '/graficos/8.webp', '/graficos/9.webp',
        '/graficos/10.webp', '/graficos/11.webp',
    ];

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let animId;
        const rotate = () => {
            // Sumamos una base de 0.1 siempre, más la inercia (speedRef)
            rotationRef.current.y += 0.1 + speedRef.current;
            gsap.set(container, { rotationY: rotationRef.current.y });
            animId = requestAnimationFrame(rotate);
        };
        animId = requestAnimationFrame(rotate);

        const handleMouseDown = (e) => {
            if (selectedImage) return;
            isDraggingRef.current = true;
            const x = e.clientX || e.touches?.[0].clientX;
            const y = e.clientY || e.touches?.[0].clientY;
            startXRef.current = x;
            startYRef.current = y;
            totalDistRef.current = 0;
            container.style.cursor = 'grabbing';
        };

        const handleMouseMove = (e) => {
            if (!isDraggingRef.current) return;
            const currentX = e.clientX || e.touches?.[0].clientX;
            const currentY = e.clientY || e.touches?.[0].clientY;
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
        container.addEventListener('mousedown', handleMouseDown);
        container.addEventListener('touchstart', handleMouseDown, { passive: true });

        // El movimiento y fin se escuchan en window para mayor robustez
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleMouseMove, { passive: true });
        window.addEventListener('touchend', handleMouseUp);

        return () => {
            cancelAnimationFrame(animId);
            container.removeEventListener('mousedown', handleMouseDown);
            container.removeEventListener('touchstart', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [selectedImage]);

    const handleImageClick = (src) => {
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

        const lightboxStyle = {
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

        const contentStyle = {
            position: 'relative',
            width: isMobile ? '95vw' : '90vw',
            height: isMobile ? '95vh' : '90vh',
            display: 'flex',
            flexDirection: 'column', // Orientación vertical para apilar botón e imagen
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? '15px' : '0' // Espacio entre botón e imagen
        };

        const imageStyle = {
            maxWidth: '100%',
            maxHeight: isMobile ? '80vh' : '100%',
            objectFit: 'contain',
            borderRadius: '12px',
            boxShadow: '0 40px 80px rgba(0, 0, 0, 0.2)'
        };

        const closeBtnStyle = {
            // En móvil se comporta como un elemento del flujo alineado a la derecha
            position: isMobile ? 'static' : 'absolute',
            alignSelf: isMobile ? 'flex-end' : 'auto', // Alinear a la derecha en móviles
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
                    <img src={selectedImage} alt="Gráfico" style={imageStyle} />
                </div>
            </div>,
            document.body
        );
    };

    return (
        <div className={styles.sceneOuterWrapper}>
            <div className={styles.scene}>
                <div
                    className={styles.carousel}
                    ref={containerRef}
                >
                    {images.map((src, index) => {
                        const angle = (index / images.length) * 360;
                        const translateZ = typeof window !== 'undefined' && window.innerWidth < 768 ? 700 : 750;
                        return (
                            <div
                                key={index}
                                className={styles.item}
                                onClick={() => handleImageClick(src)}
                                style={{
                                    '--item-angle': `${angle}deg`,
                                    '--item-translateZ': `${translateZ}px`
                                }}
                            >
                                <div className={styles.imageWrapper}>
                                    <img
                                        src={src}
                                        alt={`Gráfico ${index + 1}`}
                                        className={styles.image}
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
