import React, { useEffect, useRef } from 'react';

interface HeroAnimationProps {
  isLight?: boolean;
  showGradient?: boolean;
  showShadow?: boolean;
}

export default function HeroAnimation({ isLight = false, showGradient = true, showShadow = true }: HeroAnimationProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let animationFrameId: number;

        let particles: Particle[] = [];
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        const particleCount = isMobile ? 30 : 120; // Reducido en móvil para quitar saturación
        const connectionDistance = isMobile ? 90 : 180; // Menor distancia de conexión en móvil
        const mouseRadius = isMobile ? 0 : 250; // Interacción desactivada en móvil

        const palette = isLight
            ? ['#e0e0e0', '#f0f0f0', '#d0d0d0', '#e5e5e5']
            : ['#1a2a44', '#0d1b2a', '#1b263b', '#415a77'];

        const mouse = {
            x: null as number | null,
            y: null as number | null,
        };

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        };

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            radius: number;
            color: string;
            opacity: number;

            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = Math.random() * 2 + 1;
                this.color = palette[Math.floor(Math.random() * palette.length)];

                // Opacidad base ajustada
                this.opacity = isLight ? Math.random() * 0.2 + 0.1 : Math.random() * 0.3 + 0.7;
            }

            update() {
                // Interacción con el mouse
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < mouseRadius) {
                        const force = (mouseRadius - distance) / mouseRadius;
                        const directionX = dx / distance;
                        const directionY = dy / distance;

                        // Las partículas orbitan o se sienten atraídas sutilmente en vez de solo huir
                        this.x -= directionX * force * 1.5;
                        this.y -= directionY * force * 1.5;
                    }
                }

                this.x += this.vx;
                this.y += this.vy;

                // Rebote en bordes
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.opacity;
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }

        const init = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };

        const handleMouseLeave = () => {
            mouse.x = null;
            mouse.y = null;
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        resize();

        const animate = () => {
            // Fondo blanco
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (showGradient) {
                // Resplandor ambiental suave azulino sutil
                const grad = ctx.createRadialGradient(
                    canvas.width / 2, canvas.height / 2, 0,
                    canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 1.5
                );

                const gradAlpha = isLight ? 0.01 : 0.03;
                grad.addColorStop(0, `rgba(26, 42, 68, ${gradAlpha})`);
                grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // Conexiones de malla
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectionDistance) {
                        ctx.beginPath();
                        ctx.lineWidth = 0.5;
                        const baseAlpha = isLight ? 0.15 : 0.35;
                        const alpha = (1 - (dist / connectionDistance)) * baseAlpha;
                        ctx.strokeStyle = isLight ? `rgba(180, 180, 180, ${alpha})` : `rgba(13, 27, 42, ${alpha})`;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }

                // Conexión del Mouse a partículas cercanas
                if (mouse.x !== null && mouse.y !== null) {
                    const mdx = particles[i].x - mouse.x;
                    const mdy = particles[i].y - mouse.y;
                    const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

                    if (mdist < mouseRadius) {
                        ctx.beginPath();
                        const mBaseAlpha = isLight ? 0.2 : 0.5;
                        const mAlpha = (1 - (mdist / mouseRadius)) * mBaseAlpha;
                        ctx.strokeStyle = isLight ? `rgba(180, 180, 180, ${mAlpha})` : `rgba(65, 90, 119, ${mAlpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.moveTo(mouse.x, mouse.y);
                        ctx.lineTo(particles[i].x, particles[i].y);
                        ctx.stroke();
                    }
                }

                particles[i].update();
                particles[i].draw();
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isLight, showGradient, showShadow]);

    return (
        <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden bg-white opacity-0 transition-opacity duration-1000 ease-in-out group-[.page-ready]:opacity-100 max-md:transform-none max-md:rounded-none max-md:shadow-none hero-background">
            <canvas ref={canvasRef} className="w-full h-full block" />
            {showShadow && <div className="absolute bottom-0 left-0 w-full h-[30%] bg-gradient-to-t from-white to-transparent pointer-events-none z-[1]"></div>}
        </div>
    );
}
