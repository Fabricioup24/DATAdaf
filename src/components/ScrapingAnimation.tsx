import React, { useEffect, useRef } from 'react';

export default function ScrapingAnimation() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let animationFrameId: number;

        let particles: DataParticle[] = [];
        let streams: StreamPath[] = [];
        const palette = ['#00d4ff', '#00ffa2', '#4488ff', '#ffcc00', '#ff9900', '#ff4444'];

        const resize = () => {
            const container = canvas.parentElement;
            if (!container) return;
            const isMobile = window.innerWidth < 768;
            canvas.width = container.offsetWidth;
            canvas.height = isMobile ? 400 : 500;
            init();
        };

        class DataParticle {
            x: number;
            y: number;
            baseX: number;
            baseY: number;
            color: string;
            size: number;
            opacity: number;
            targetOpacity: number;
            state: string;
            velocity: { x: number, y: number };
            stream: StreamPath | null;
            progress: number;
            targetX?: number;
            targetY?: number;
            id?: number;

            constructor(x: number, y: number, color: string, size: number) {
                this.x = x;
                this.y = y;
                this.baseX = x;
                this.baseY = y;
                this.color = color;
                this.size = size;
                this.opacity = 0;
                this.targetOpacity = 0.6;
                this.state = 'chaotic'; // chaotic, flowing, ordered
                this.velocity = {
                    x: (Math.random() - 0.5) * 0.5,
                    y: (Math.random() - 0.5) * 0.5
                };
                this.stream = null;
                this.progress = 0;
            }

            update() {
                if (!canvas) return;
                if (this.opacity < this.targetOpacity) this.opacity += 0.01;

                if (this.state === 'chaotic') {
                    this.x += this.velocity.x;
                    this.y += this.velocity.y;

                    // Bound to left side, avoiding the very top for title clarity
                    const isMobile = window.innerWidth < 768;
                    const minX = isMobile ? canvas.width * 0.05 : 10;
                    const maxX = canvas.width * (isMobile ? 0.25 : 0.35);
                    if (this.x < minX || this.x > maxX) this.velocity.x *= -1;
                    if (this.y < (isMobile ? 40 : 80) || this.y > canvas.height - 50) this.velocity.y *= -1;
                }
                else if (this.state === 'flowing' && this.stream) {
                    this.progress += this.stream.speed;
                    if (this.progress >= 1) {
                        this.state = 'ordered';
                        this.progress = 1;
                        // Build vertical bars: find position in stream's grid
                        this.stream.particlesCount++;
                        const count = this.stream.particlesCount;
                        const isMobile = window.innerWidth < 768;
                        const colSize = isMobile ? 5 : 25; // Reducido a 5 en móvil para evitar desborde
                        const row = Math.floor((count - 1) / colSize);
                        const col = (count - 1) % colSize;

                        const spacing = this.size + 4;
                        this.targetX = this.stream.endX + (isMobile ? 10 : 25) + (col * spacing);
                        this.targetY = this.stream.endY - (isMobile ? 15 : 10) + (row * spacing); // Más alineado horizontalmente en escritorio

                        // Set specific color of the stream for the ordered state
                        this.color = this.stream.color;
                    } else {
                        const p = this.stream.getPathPoint(this.progress);
                        this.x = p.x;
                        this.y = p.y;
                        this.color = this.stream.color; // Match stream color while flowing
                    }
                }
                else if (this.state === 'ordered' && this.targetX !== undefined && this.targetY !== undefined) {
                    // Smooth transition to target position
                    this.x += (this.targetX - this.x) * 0.1;
                    this.y += (this.targetY - this.y) * 0.1;
                    this.opacity = 0.8;
                }
            }

            draw() {
                if (!ctx) return;
                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = this.color;
                ctx.shadowBlur = this.state === 'flowing' ? 10 : 0;
                ctx.shadowColor = this.color;
                ctx.fillRect(this.x, this.y, this.size, this.size);
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;
            }
        }

        class StreamPath {
            startY: number;
            endY: number;
            color: string;
            startX: number;
            endX: number;
            targetX: number;
            targetY: number;
            speed: number;
            cp1x: number;
            cp1y: number;
            cp2x: number;
            cp2y: number;
            particlesCount: number;

            constructor(startY: number, endY: number, color: string) {
                if (!canvas) {
                    throw new Error("Canvas is null");
                }
                this.startY = startY;
                this.endY = endY;
                this.color = color;
                const isMobile = window.innerWidth < 768;
                this.startX = canvas.width * (isMobile ? 0.12 : 0.1); // Más margen izquierdo en móvil
                this.endX = canvas.width * (isMobile ? 0.7 : 0.72);
                this.targetX = this.endX + (isMobile ? 10 : 25);
                this.targetY = endY;
                this.speed = isMobile ? 0.006 + Math.random() * 0.008 : 0.005 + Math.random() * 0.005;

                // Bezier control points con más recorrido para una curva 'S' majestuosa
                const curveIntensity = isMobile ? 0.4 : 0.6;
                this.cp1x = this.startX + (this.endX - this.startX) * curveIntensity;
                this.cp1y = startY;
                this.cp2x = this.startX + (this.endX - this.startX) * (1 - curveIntensity);
                this.cp2y = endY;
                this.particlesCount = 0;
            }

            getPathPoint(t: number) {
                const x = Math.pow(1 - t, 3) * this.startX +
                    3 * Math.pow(1 - t, 2) * t * this.cp1x +
                    3 * (1 - t) * Math.pow(t, 2) * this.cp2x +
                    Math.pow(t, 3) * this.endX;
                const y = Math.pow(1 - t, 3) * this.startY +
                    3 * Math.pow(1 - t, 2) * t * this.cp1y +
                    3 * (1 - t) * Math.pow(t, 2) * this.cp2y +
                    Math.pow(t, 3) * this.endY;
                return { x, y };
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.moveTo(this.startX, this.startY);
                ctx.bezierCurveTo(this.cp1x, this.cp1y, this.cp2x, this.cp2y, this.endX, this.endY);
                ctx.strokeStyle = this.color;
                ctx.globalAlpha = 0.15;
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        }

        const init = () => {
            particles = [];
            streams = [];

            // Create target streams (filas descentralizadas para más armonía)
            const isMobile = window.innerWidth < 768;
            const numStreams = isMobile ? 4 : 5; // Aumentado a 4 en móvil como solicitaste
            const verticalPadding = isMobile ? 60 : 85; // Empezamos más abajo para dejar espacio al título
            const availableHeight = canvas.height - (verticalPadding * 2);

            for (let i = 0; i < numStreams; i++) {
                const step = numStreams > 1 ? availableHeight / (numStreams - 1) : 0;
                // Variación sutil en el punto de inicio para que no sea una línea rígida
                const startY = verticalPadding + (i * step) + (Math.random() - 0.5) * 15;
                const endY = verticalPadding + (i * step);
                streams.push(new StreamPath(startY, endY, palette[i % palette.length]));
            }

            // Create chaotic particles
            const numParticles = isMobile ? 80 : 450; // Aumentado para verdadera abundancia en escritorio

            for (let i = 0; i < numParticles; i++) {
                const x = isMobile
                    ? (canvas.width * 0.08) + Math.random() * (canvas.width * 0.15) // Rango centrado a la izquierda pero con margen
                    : Math.random() * (canvas.width * 0.25);
                // Start below the title area (80px or 40px on mobile)
                const y = (isMobile ? 40 : 80) + Math.random() * (canvas.height - (isMobile ? 80 : 130));
                const color = palette[Math.floor(Math.random() * palette.length)];
                const size = (isMobile ? 4 : 5) + Math.random() * (isMobile ? 6 : 5);
                const p = new DataParticle(x, y, color, size);
                p.id = i;
                particles.push(p);
            }
        };

        window.addEventListener('resize', resize);
        resize();

        class Pulse {
            stream: StreamPath;
            progress: number;
            speed: number;

            constructor(stream: StreamPath) {
                this.stream = stream;
                this.progress = 0;
                this.speed = 0.008 + Math.random() * 0.012;
            }
            update() {
                this.progress += this.speed;
                return this.progress < 1;
            }
            draw() {
                if (!ctx) return;
                const p = this.stream.getPathPoint(this.progress);
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.shadowBlur = 15;
                ctx.shadowColor = this.stream.color;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        let pulses: Pulse[] = [];

        const animate = () => {
            if (!ctx || !canvas) return;
            const isMobile = window.innerWidth < 768;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw data strings background
            ctx.font = '10px monospace';
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 0.03;
            for (let i = 0; i < 12; i++) {
                ctx.fillText('0x' + Math.random().toString(16).substring(2, 10).toUpperCase(),
                    (i * 150) % canvas.width,
                    ((Date.now() * 0.05) + i * 50) % canvas.height);
            }

            streams.forEach(s => s.draw());

            particles.forEach((p) => {
                if (p.state === 'chaotic' && Math.random() < 0.003) {
                    p.state = 'flowing';
                    p.stream = streams[Math.floor(Math.random() * streams.length)];
                    p.targetOpacity = 1;
                }
                p.update();
                p.draw();
                if (p.state === 'ordered' && Math.random() < (isMobile ? 0.001 : 0.0008)) {
                    if (p.stream) p.stream.particlesCount = Math.max(0, p.stream.particlesCount - 1);
                    p.state = 'chaotic';
                    p.opacity = 0;
                    p.targetOpacity = 0.6; // Volver a la opacidad base de caos
                    p.progress = 0;
                    p.x = isMobile
                        ? (canvas.width * 0.08) + Math.random() * (canvas.width * 0.15)
                        : (canvas.width * 0.05) + Math.random() * (canvas.width * 0.2);
                    p.y = (isMobile ? 40 : 80) + Math.random() * (canvas.height - (isMobile ? 80 : 130));
                }
            });

            if (Math.random() < 0.05) {
                pulses.push(new Pulse(streams[Math.floor(Math.random() * streams.length)]));
            }

            pulses = pulses.filter(p => {
                const active = p.update();
                if (active) p.draw();
                return active;
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="w-full h-[400px] max-md:h-[400px] my-8 relative overflow-hidden flex justify-center items-center">
            <canvas ref={canvasRef} className="block max-w-full" />

            {/* Labels Desktop */}
            <div className="absolute text-[#888] text-[0.85rem] font-bold uppercase tracking-[2px] pointer-events-none z-10 top-[20px] left-[20px] max-md:hidden">
                Datos Dispersos - Webs del mundo
            </div>
            <div className="absolute text-[#888] text-[0.85rem] font-bold uppercase tracking-[2px] pointer-events-none z-10 top-[20px] right-[20px] max-md:hidden">
                Datos estructurados
            </div>

            {/* Labels Mobile */}
            <div className="absolute text-[#888] text-[0.85rem] font-bold uppercase tracking-[2px] pointer-events-none z-10 top-[20px] left-[20px] hidden max-md:block">
                Páginas webs
            </div>
            <div className="absolute text-[#888] text-[0.85rem] font-bold uppercase tracking-[2px] pointer-events-none z-10 top-[20px] right-[20px] hidden max-md:block">
                Datos estructurados
            </div>
        </div>
    );
}
