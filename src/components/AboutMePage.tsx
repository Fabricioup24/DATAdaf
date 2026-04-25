import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';

// Componente interno para la animación "con vida"
function MethodologyAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    const mouse = { x: null as number | null, y: null as number | null, radius: 200 };
    let config = {
      isMobile: false,
      color: 'rgba(255, 255, 255, 0.9)',
      lineColor: 'rgba(255, 255, 255, 0.6)',
      shadowBlur: 12,
      particleCount: 70,
      connectionDistance: 140,
      lineWidth: 0.5,
      mouseRadius: 200,
      palette: null as string[] | null
    };

    const init = () => {
      particles = [];
      const particleCount = config.particleCount;
      mouse.radius = config.mouseRadius;

      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const resize = () => {
      if (canvas && canvas.parentElement) {
        const rect = canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const isMobile = window.innerWidth < 768;

        // Configuración dinámica basada en dispositivo
        config.isMobile = isMobile;
        if (isMobile) {
          // Configuración MÓVIL: Estilo HERO (Negro, sutil)
          config.color = '#000000';
          config.palette = ['#000000', '#1a1a1a', '#2b2b2b', '#333333']; // Paleta oscura
          config.lineColor = 'rgb(0, 0, 0)';
          config.shadowBlur = 0;
          config.particleCount = 40;
          config.connectionDistance = 110;
          config.lineWidth = 0.5; // Fino, igual que Hero
          config.mouseRadius = 0;
        } else {
          // Configuración ESCRITORIO: Blanco, Sombras, Suave
          config.color = 'rgba(255, 255, 255, 0.9)';
          config.palette = null;
          config.lineColor = 'rgba(255, 255, 255, 0.6)';
          config.shadowBlur = 12;
          config.particleCount = 70;
          config.connectionDistance = 160;
          config.lineWidth = 0.5;
          config.mouseRadius = 200;
        }

        // HiDPI Scaling
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        ctx.resetTransform();
        ctx.scale(dpr, dpr);

        width = rect.width;
        height = rect.height;

        init();
      }
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
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        const speedFactor = config.isMobile ? 0.2 : 0.5;
        this.vx = (Math.random() - 0.5) * speedFactor;
        this.vy = (Math.random() - 0.5) * speedFactor;
        this.radius = Math.random() * 2 + 1; // Radio variable 1-3

        // Color y Opacidad
        if (config.isMobile && config.palette) {
          this.color = config.palette[Math.floor(Math.random() * config.palette.length)];
          this.opacity = Math.random() * 0.3 + 0.7; // Opacidad variable (0.7 - 1.0)
        } else {
          this.color = config.color;
          this.opacity = 1;
        }
      }

      update() {
        if (mouse.x !== null && mouse.y !== null && mouse.radius > 0) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            const directionX = dx / distance;
            const directionY = dy / distance;

            this.x -= directionX * force * 2;
            this.y -= directionY * force * 2;
          }
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity; // Usar opacidad de partícula
        ctx.shadowBlur = config.shadowBlur;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
    }

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
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Observer
    const resizeObserver = new ResizeObserver(() => resize());
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    resize();

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.lineWidth = config.lineWidth;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < config.connectionDistance) {
            ctx.beginPath();

            // Factor de opacidad diferenciado (Hero style vs Desktop style)
            const opacityFactor = config.isMobile ? 0.35 : 0.8;
            const alpha = (1 - (dist / config.connectionDistance)) * opacityFactor;

            if (config.isMobile) {
              ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
            } else {
              ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`; // Usando el alpha calculado
            }

            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }

        if (mouse.x !== null && mouse.y !== null && mouse.radius > 0) {
          const mdx = particles[i].x - mouse.x;
          const mdy = particles[i].y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mdist < mouse.radius) {
            ctx.beginPath();
            ctx.strokeStyle = config.lineColor;
            ctx.globalAlpha = (1 - (mdist / mouse.radius));
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(particles[i].x, particles[i].y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
}

interface AboutMePageProps {
  onClose?: () => void;
  onBeforeUnmount?: () => void;
  onExitStart?: () => void;
}

export default function AboutMePage({ onClose, onBeforeUnmount, onExitStart }: AboutMePageProps) {
  const [entryCurtainPhase, setEntryCurtainPhase] = useState('initial'); // 'initial', 'covering', 'revealing'
  const [exitPhase, setExitPhase] = useState('initial'); // 'initial', 'covering', 'revealing'
  const [showContent, setShowContent] = useState(false); // Visibilidad del contenedor (fondo negro)
  const [startAnimations, setStartAnimations] = useState(false); // Inicio de animaciones de texto
  const textContainerRef = useRef<HTMLDivElement>(null); // Ref para el contenedor de texto

  // Ocultar elementos inmediatamente al montar
  useEffect(() => {
    if (textContainerRef.current) {
      const elements = textContainerRef.current.children;
      gsap.set(elements, { opacity: 0, y: 50 });
    }
  }, []);

  useEffect(() => {
    // Fase 1: Subir la cortina desde abajo para cubrir la pantalla
    setTimeout(() => {
      setEntryCurtainPhase('covering');
    }, 50);

    // Fase 2: Cortina sube para revelar el contenido (antes 1100ms, ahora 650ms)
    setTimeout(() => {
      setShowContent(true);
      setEntryCurtainPhase('revealing');
    }, 650);

    // Iniciar animaciones de texto
    setTimeout(() => {
      setStartAnimations(true);
    }, 850);

    return () => { };
  }, []);

  // Efecto GSAP para animar los textos
  useEffect(() => {
    if (startAnimations && textContainerRef.current) {
      const elements = textContainerRef.current.children;

      gsap.to(elements, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power3.out"
      });
    }
  }, [startAnimations]);

  const handleClose = () => {
    // Fase 1: Cubrir la pantalla
    setExitPhase('covering');
    if (onExitStart) onExitStart(); // Notificar al padre que la pantalla se está cubriendo

    setTimeout(() => {
      // Fase 2: Levantar la persiana (reveal de salida)
      setExitPhase('revealing');
      setShowContent(false); // <--- OCULTAR contenido antes de levantar la persiana

      // Notificar al padre que el contenido se va a revelar
      if (onBeforeUnmount) {
        onBeforeUnmount();
      }
    }, 850); // Un pequeño margen para asegurar cobertura total

    setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 2200); // Buffer de seguridad para que la animación termine en reposo total
  };

  return (
    <>
      <div className={`fixed top-0 left-0 w-screen h-screen bg-[#121212] z-[9997] flex items-center justify-center overflow-hidden transition-all ${showContent ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <button className="fixed top-8 right-8 w-[60px] h-[60px] rounded-full bg-white border-none text-3xl cursor-pointer z-[9999] flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 hover:bg-[#f0f0f0] max-md:top-4 max-md:right-4 max-md:w-12 max-md:h-12 max-md:text-2xl text-[#121212]" onClick={handleClose}>
          ✕
        </button>
        <div className="relative z-[2] flex w-full h-full items-center max-md:flex-col max-md:overflow-y-auto">
          <div
            className="flex-1 text-white text-left px-16 py-8 max-w-[55%] z-[5] max-md:max-w-full max-md:px-6 max-md:py-4 max-md:text-center max-md:order-1"
            ref={textContainerRef}
          >
            <h1 className="text-[3.5rem] font-bold text-white tracking-[-0.02em] m-0 mb-2 max-md:text-[1.6rem] max-md:mt-0 max-md:leading-[1.2]">Metodologías</h1>
            <p className="text-[1.2rem] text-gray-300 mb-[1.5rem] max-md:text-[1rem] max-md:mb-[1rem]">Herramientas analíticas de vanguardia para el rigor científico.</p>

            <div className="grid grid-cols-2 gap-4 mt-6 max-md:grid-cols-1 max-md:gap-3 max-md:mt-4">
              {[
                { title: "Análisis Correlacional", desc: "Identificación de relaciones significativas entre múltiples variables para entender la interdependencia en sistemas complejos." },
                { title: "Pruebas Estadísticas", desc: "Validación de hipótesis mediante el uso de modelos de probabilidad, asegurando resultados con validez y autoridad matemática." },
                { title: "Series de Tiempo", desc: "Análisis de datos secuenciales para identificar patrones estacionales y proyectar tendencias futuras con alta precisión." },
                { title: "Modelos Econométricos", desc: "Aplicación de herramientas matemáticas y estadísticas para cuantificar teorías económicas y evaluar el impacto de variables específicas." },
              ].map((method, idx) => (
                <div key={idx} className="group relative overflow-hidden bg-black/5 backdrop-blur-md border border-black/10 p-5 rounded-xl transition-all duration-400 ease-[cubic-bezier(0.165,0.84,0.44,1)] hover:bg-black/10 hover:border-[#1a2a44]/30 hover:-translate-y-[10px] hover:scale-[1.02] max-md:p-3 max-md:hover:transform-none">
                  <div className="absolute top-0 left-0 w-[2px] h-0 bg-[#1a2a44] transition-all duration-400 ease-out group-hover:h-full"></div>
                  <h3 className="text-[1.1rem] font-bold m-0 mb-3 text-[#1a2a44] tracking-[0.05em] uppercase transition-colors duration-300 ease-out group-hover:text-[#0d1b2a] max-md:text-[1.05rem] max-md:mb-1">{method.title}</h3>
                  <p className="text-[0.9rem] leading-[1.5] m-0 text-[#4a4a4a] transition-colors duration-300 ease-out group-hover:text-[#121212] max-md:text-[0.85rem] max-md:leading-[1.3]">{method.desc}</p>
                </div>
              ))}
            </div>

            <p className="text-[0.9rem] text-gray-400 mt-[1.5rem] font-medium tracking-[0.05em] max-md:mt-4 max-md:text-[0.85rem]">📍 Metodologías más usadas e innovadoras | Rigor Técnico</p>
          </div>
          <div className="flex-1 flex items-center justify-center h-full overflow-hidden relative max-md:w-full max-md:h-[40vh] max-md:min-h-[300px] max-md:order-2 after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-gradient-to-r after:from-[#121212] after:to-transparent after:pointer-events-none after:z-[1] max-md:after:bg-gradient-to-t max-md:after:from-[#121212] max-md:after:to-transparent">
            <MethodologyAnimation />
          </div>
        </div>
      </div>

      {/* Cortina de entrada (sube en 2 fases: cubre, luego sigue subiendo) */}
      <div className={`fixed bottom-0 left-0 w-screen h-screen z-[10001] bg-white translate-y-[100vh] transition-transform duration-600 ease-[cubic-bezier(0.165,0.84,0.44,1)] pointer-events-none ${entryCurtainPhase === 'covering' ? 'translate-y-0' : ''} ${entryCurtainPhase === 'revealing' ? '-translate-y-[100vh]' : ''}`}>
      </div>

      {/* Cortina de salida (sube desde abajo para cubrir todo, luego sigue subiendo) */}
      <div className={`fixed bottom-0 left-0 w-screen h-screen z-[10002] translate-y-full transition-transform duration-800 ease-[cubic-bezier(0.77,0,0.175,1)] pointer-events-none flex flex-col ${exitPhase === 'covering' ? 'translate-y-0' : ''} ${exitPhase === 'revealing' ? '-translate-y-[100vh]' : ''}`}>
        <div className="w-full h-full bg-white"></div>
      </div>
    </>
  );
}
