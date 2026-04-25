import React, { useEffect, useRef } from 'react';

const SpiderWebAnimation = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let animationFrameId: number;

        const resize = () => {
            const container = canvas.parentElement;
            if (!container) return;
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
        };

        // Biología de la tela en esquina (Bottom-Right)
        const numSpokeLines = 8;
        const spokes: { angle: number, length: number, phase: number }[] = [];

        // Puntos de anclaje irregulares en los márgenes
        const generateSpokes = () => {
            spokes.length = 0;
            for (let i = 0; i < numSpokeLines; i++) {
                // Generamos ángulos que se abren desde la esquina hacia el centro (de 180 a 270 grados aprox)
                const baseAngle = Math.PI + (i / (numSpokeLines - 1)) * (Math.PI / 2);
                const angleVariation = (Math.random() - 0.5) * 0.15;
                spokes.push({
                    angle: baseAngle + angleVariation,
                    length: 0.85 + Math.random() * 0.3, // Longitud para cubrir gran parte del área
                    phase: Math.random() * Math.PI
                });
            }
        };

        let time = 0;
        const speed = 0.004; // Un poco más lento para apreciar el tejido

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            time += speed;
            if (time > 3.5) { // Ciclo más largo para pausa al final
                time = 0;
                generateSpokes();
            }

            // Origen en la esquina inferior derecha
            const originX = canvas.width;
            const originY = canvas.height;
            const maxRadius = Math.max(canvas.width, canvas.height) * 0.7;

            ctx.strokeStyle = '#ffffff';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // ETAPA 1: Construcción de los Radios de Anclaje
            const spokeConstructionTime = 1.0;
            spokes.forEach((spoke, i) => {
                const startTime = (i / numSpokeLines) * spokeConstructionTime;
                const endTime = ((i + 1) / numSpokeLines) * spokeConstructionTime;

                if (time < startTime) return;

                const progress = Math.min(1, (time - startTime) / (endTime - startTime));
                const length = maxRadius * spoke.length * progress;

                ctx.beginPath();
                ctx.lineWidth = 0.6;
                ctx.globalAlpha = 0.1 + (Math.sin(Date.now() * 0.001 + i) * 0.05); // Sutil vibración visual
                ctx.moveTo(originX, originY);
                const targetX = originX + Math.cos(spoke.angle) * length;
                const targetY = originY + Math.sin(spoke.angle) * length;
                ctx.lineTo(targetX, targetY);
                ctx.stroke();
            });

            // ETAPA 2: Tejido de la red (Capture Spiral)
            const spiralStartTime = 0.8;
            if (time > spiralStartTime) {
                const spiralProgress = (time - spiralStartTime) / 2.0;
                const maxTurns = 14;
                const currentTurns = Math.min(maxTurns, spiralProgress * maxTurns);

                ctx.beginPath();
                ctx.lineWidth = 0.8;
                ctx.globalAlpha = 0.35;

                const stepsPerTurn = numSpokeLines;
                const totalSteps = Math.floor(currentTurns * stepsPerTurn);

                let lastX: number | undefined, lastY: number | undefined;

                for (let j = 0; j <= totalSteps; j++) {
                    const stepProgress = j / stepsPerTurn;
                    const spokeIndex = j % numSpokeLines;

                    const spoke = spokes[spokeIndex];
                    const currentR = (stepProgress / maxTurns) * maxRadius * 0.8;

                    const px = originX + Math.cos(spoke.angle) * currentR;
                    const py = originY + Math.sin(spoke.angle) * currentR;

                    if (j === 0) {
                        ctx.moveTo(px, py);
                    } else {
                        const prevSpokeIndex = (j - 1) % numSpokeLines;
                        const prevSpoke = spokes[prevSpokeIndex];
                        const prevStepProgress = (j - 1) / stepsPerTurn;
                        const prevR = (prevStepProgress / maxTurns) * maxRadius * 0.8;

                        const pPrevX = originX + Math.cos(prevSpoke.angle) * prevR;
                        const pPrevY = originY + Math.sin(prevSpoke.angle) * prevR;

                        // Punto de control para la catenaria
                        const midAngle = (prevSpoke.angle + spoke.angle) / 2;
                        const midR = ((currentR + prevR) / 2) * 0.96;
                        const cpX = originX + Math.cos(midAngle) * midR;
                        const cpY = originY + Math.sin(midAngle) * midR;

                        ctx.quadraticCurveTo(cpX, cpY, px, py);
                    }
                    lastX = px;
                    lastY = py;
                }
                ctx.stroke();

                // El rastro de la araña
                if (spiralProgress < 1.1 && lastX !== undefined && lastY !== undefined) {
                    ctx.beginPath();
                    ctx.arc(lastX, lastY, 1.2, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.globalAlpha = 0.6;
                    ctx.fill();
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        resize();
        generateSpokes();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-[1] overflow-hidden">
            <canvas ref={canvasRef} className="block" />
        </div>
    );
};

export default SpiderWebAnimation;
