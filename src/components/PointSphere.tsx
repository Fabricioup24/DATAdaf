import { useEffect, useRef } from 'react';

const PointSphere = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let animationFrameId: number;

        let width = canvas.offsetWidth;
        let height = canvas.offsetHeight;

        // Configuración
        const dotCount = 1200;
        let sphereRadius = Math.min(width, height) * 0.4;
        const dots: {x: number, y: number, z: number}[] = [];

        // Rotación
        let rotationX = 0;
        let rotationY = 0;
        const rotationSpeedX = 0.002;
        const rotationSpeedY = 0.003;

        // Crear puntos
        for (let i = 0; i < dotCount; i++) {
            const phi = Math.acos(-1 + (2 * i) / dotCount);
            const theta = Math.sqrt(dotCount * Math.PI) * phi;

            dots.push({
                x: Math.cos(theta) * Math.sin(phi),
                y: Math.sin(theta) * Math.sin(phi),
                z: Math.cos(phi)
            });
        }

        const resize = () => {
            if (!canvas.parentElement) return;
            width = canvas.parentElement.clientWidth;
            height = canvas.parentElement.clientHeight;
            sphereRadius = Math.min(width, height) * 0.4;
            canvas.width = width * window.devicePixelRatio;
            canvas.height = height * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };

        window.addEventListener('resize', resize);
        resize();

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            rotationX += rotationSpeedX;
            rotationY += rotationSpeedY;

            const cosX = Math.cos(rotationX);
            const sinX = Math.sin(rotationX);
            const cosY = Math.cos(rotationY);
            const sinY = Math.sin(rotationY);

            ctx.fillStyle = '#121212';

            // Dibujar puntos
            dots.forEach(dot => {
                // Rotación en X
                let y1 = dot.y * cosX - dot.z * sinX;
                let z1 = dot.y * sinX + dot.z * cosX;

                // Rotación en Y
                let x2 = dot.x * cosY + z1 * sinY;
                let z2 = -dot.x * sinY + z1 * cosY;

                // Proyección simple
                const perspective = 600 / (600 - z2 * sphereRadius);
                const x = x2 * sphereRadius * perspective + width / 2;
                const y = y1 * sphereRadius * perspective + height / 2;

                // Solo dibujar si está al frente (opcional para estilo, pero el usuario quiere algo como el planeta)
                // Aquí dibujamos todos pero con tamaño/opacidad variable por profundidad
                const size = (z2 + 1) * 1.5;
                const opacity = (z2 + 1) / 2 + 0.1;

                if (z2 > -0.8) { // Clipping suave
                    ctx.beginPath();
                    ctx.globalAlpha = opacity;
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full block"
        />
    );
};

export default PointSphere;
