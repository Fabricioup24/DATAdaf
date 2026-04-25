import React, { useEffect, useRef } from 'react';

const DataOrderAnimation = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const buffer = { x: 100, y: 50 }; // Margen extra para evitar cortes

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let animationFrameId: number;

        const resize = () => {
            const container = canvas.parentElement;
            if (container) {
                // Hacemos el canvas más grande que el contenedor para que las partículas
                // puedan salir de los bordes visuales sin cortarse abruptamente.
                canvas.width = container.offsetWidth + (buffer.x * 2);
                canvas.height = 350 + (buffer.y * 2);
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        const handleMouseLeave = () => {
            mouseRef.current = { x: -1000, y: -1000 };
        };

        const numParticles = 160;
        const particles: Particle[] = [];
        const channels = 6;
        const channelGap = 45;
        const palette = ['#0055ff'];

        class Particle {
            x!: number;
            y!: number;
            baseX!: number;
            baseY!: number;
            size!: number;
            speed!: number;
            state!: string;
            channelIndex!: number;
            noiseShift!: number;
            opacity!: number;
            targetOpacity!: number;
            color!: string;
            isColored!: boolean;
            vx!: number;
            vy!: number;

            constructor() {
                this.init(true);
            }

            init(firstTime = false) {
                this.x = firstTime ? Math.random() * canvas.width : -20 - Math.random() * 100;
                // Centramos verticalmente las partículas en el área visible inicial
                this.y = buffer.y + (Math.random() * (canvas.height - (buffer.y * 2)));
                this.baseX = this.x;
                this.baseY = this.y;

                this.size = 1.2 + Math.random() * 2;
                this.speed = 1.0 + Math.random() * 1.8;

                this.state = 'dispersed';
                this.channelIndex = Math.floor(Math.random() * channels);
                this.noiseShift = Math.random() * 100;

                this.opacity = 0;
                this.targetOpacity = 0.3 + Math.random() * 0.4;
                this.color = palette[Math.floor(Math.random() * palette.length)];
                this.isColored = false;

                this.vx = 0;
                this.vy = 0;
            }

            update(time: number, mouse: { x: number, y: number }) {
                const startStreaming = buffer.x + (canvas.width - buffer.x * 2) * 0.25;
                const startArchitecture = buffer.x + (canvas.width - buffer.x * 2) * 0.7;

                if (this.state === 'dispersed') {
                    this.x += this.speed;
                    this.y += Math.sin(time + this.noiseShift) * 0.8;
                    this.opacity = Math.min(this.targetOpacity * 0.5, this.opacity + 0.01);
                    if (this.x > startStreaming) this.state = 'streaming';
                }
                else if (this.state === 'streaming') {
                    this.x += this.speed * 1.3;
                    const targetY = (canvas.height / 2) - ((channels / 2) * channelGap) + (this.channelIndex * channelGap) + (channelGap / 2);
                    this.y += (targetY - this.y) * 0.07;
                    this.opacity = Math.min(this.targetOpacity, this.opacity + 0.02);
                    if (this.x > startArchitecture) this.state = 'architected';
                }
                else if (this.state === 'architected') {
                    this.x += this.speed * 1.1;
                    const targetY = (canvas.height / 2) - ((channels / 2) * channelGap) + (this.channelIndex * channelGap) + (channelGap / 2);
                    this.y += (targetY - this.y) * 0.15;
                    this.opacity = Math.max(0.1, this.opacity - 0.003);
                }

                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const forceRadius = 60;

                if (distance < forceRadius) {
                    this.isColored = true;
                    const force = (forceRadius - distance) / forceRadius;
                    const angle = Math.atan2(dy, dx);
                    this.vx -= Math.cos(angle) * force * 4;
                    this.vy -= Math.sin(angle) * force * 4;
                }

                this.x += this.vx;
                this.y += this.vy;
                this.vx *= 0.9;
                this.vy *= 0.9;

                // Reiniciar si salen por el borde derecho (contando el buffer)
                if (this.x > canvas.width + 10) this.init();
            }

            draw() {
                if (!ctx) return;
                if (this.isColored) {
                    ctx.globalAlpha = 1.0;
                    ctx.fillStyle = this.color;
                    if (this.state === 'architected') {
                        ctx.shadowBlur = 15;
                        ctx.shadowColor = this.color;
                        ctx.fillRect(this.x - 2.5, this.y - 2.5, 5, 5);
                        ctx.shadowBlur = 0;
                    } else {
                        ctx.shadowBlur = 10;
                        ctx.shadowColor = this.color;
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    }
                } else {
                    ctx.globalAlpha = this.opacity;
                    ctx.fillStyle = '#121212';
                    if (this.state === 'architected') {
                        ctx.fillRect(this.x - 1.5, this.y - 1.5, 3, 3);
                    } else {
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        }

        const setup = () => {
            resize();
            particles.length = 0;
            for (let i = 0; i < numParticles; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const time = Date.now() * 0.002;
            particles.forEach(p => {
                p.update(time, mouseRef.current);
                p.draw();
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', setup);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        setup();
        animate();

        return () => {
            window.removeEventListener('resize', setup);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="absolute bottom-[20px] left-0 w-full h-[350px] pointer-events-auto z-10 overflow-hidden">
            <canvas
                ref={canvasRef}
                className="block cursor-default"
                style={{
                    width: `calc(100% + ${buffer.x * 2}px)`,
                    height: `calc(100% + ${buffer.y * 2}px)`,
                    marginLeft: `-${buffer.x}px`,
                    marginTop: `-${buffer.y}px`
                }}
            />
        </div>
    );
};

export default DataOrderAnimation;
