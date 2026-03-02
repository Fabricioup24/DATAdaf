import React, { useEffect, useRef } from 'react';

export default function ScrapingAnimation() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let particles = [];
        let streams = [];
        const palette = ['#00d4ff', '#00ffa2', '#4488ff', '#ffcc00', '#ff9900', '#ff4444'];

        const resize = () => {
            const container = canvas.parentElement;
            const isMobile = window.innerWidth < 768;
            canvas.width = container.offsetWidth;
            canvas.height = isMobile ? 400 : 500;
            init();
        };

        class DataParticle {
            constructor(x, y, color, size) {
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
                else if (this.state === 'ordered') {
                    // Smooth transition to target position
                    this.x += (this.targetX - this.x) * 0.1;
                    this.y += (this.targetY - this.y) * 0.1;
                    this.opacity = 0.8;
                }
            }

            draw() {
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
            constructor(startY, endY, color) {
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

            getPathPoint(t) {
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
            constructor(stream) {
                this.stream = stream;
                this.progress = 0;
                this.speed = 0.008 + Math.random() * 0.012;
            }
            update() {
                this.progress += this.speed;
                return this.progress < 1;
            }
            draw() {
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

        let pulses = [];

        const animate = () => {
            const isMobile = window.innerWidth < 768;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw data strings background
            ctx.font = '10px monospace';
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 0.03;
            for (let i = 0; i < 12; i++) {
                ctx.fillText('0x' + Math.random().toString(16).substr(2, 8).toUpperCase(),
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
        <div className="scraping-animation-container">
            <canvas ref={canvasRef} />

            {/* Labels Desktop */}
            <div className="animation-label label-left desktop-only">
                Datos Dispersos - Webs del mundo
            </div>
            <div className="animation-label label-right desktop-only">
                Datos estructurados
            </div>

            {/* Labels Mobile */}
            <div className="animation-label label-left mobile-only">
                Páginas webs
            </div>
            <div className="animation-label label-right mobile-only">
                Datos estructurados
            </div>
        </div>
    );
}
