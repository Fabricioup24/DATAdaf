import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';

// Componente interno para la animación "con vida"
function MethodologyAnimation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let particles = [];
    let config = {
      isMobile: false,
      color: 'rgba(255, 255, 255, 0.9)',
      lineColor: 'rgba(255, 255, 255, 0.6)',
      shadowBlur: 12,
      particleCount: 70,
      connectionDistance: 140,
      lineWidth: 0.5,
      mouseRadius: 200,
      palette: null
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
        if (mouse.x !== null && mouse.radius > 0) {
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

    const handleMouseMove = (e) => {
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

        if (mouse.x !== null && mouse.radius > 0) {
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

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

export default function AboutMePage({ onClose, onBeforeUnmount, onExitStart }) {
  const [entryCurtainPhase, setEntryCurtainPhase] = useState('initial'); // 'initial', 'covering', 'revealing'
  const [exitPhase, setExitPhase] = useState('initial'); // 'initial', 'covering', 'revealing'
  const [showContent, setShowContent] = useState(false); // Visibilidad del contenedor (fondo negro)
  const [startAnimations, setStartAnimations] = useState(false); // Inicio de animaciones de texto
  const textContainerRef = useRef(null); // Ref para el contenedor de texto

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
      <div className={`about-me-page ${showContent ? 'visible' : 'hidden'}`}>
        <button className="close-button" onClick={handleClose}>
          ✕
        </button>
        <div className="about-me-layout">
          <div
            className="about-me-text"
            ref={textContainerRef}
            style={typeof window !== 'undefined' && window.innerWidth < 768 ? {
              padding: '0.5rem 1.5rem 1.5rem 1.5rem'
            } : {}}
          >
            <h1 style={typeof window !== 'undefined' && window.innerWidth < 768 ? {
              fontSize: '1.6rem',
              marginTop: '0',
              lineHeight: '1.2'
            } : {}}>Metodologías</h1>
            <p className="about-subtitle">Herramientas analíticas de vanguardia para el rigor científico.</p>

            <div className="methods-grid">
              <div className="method-pillar">
                <h3>Análisis Correlacional</h3>
                <p>Identificación de relaciones significativas entre múltiples variables para entender la interdependencia en sistemas complejos.</p>
              </div>

              <div className="method-pillar">
                <h3>Pruebas Estadísticas</h3>
                <p>Validación de hipótesis mediante el uso de modelos de probabilidad, asegurando resultados con validez y autoridad matemática.</p>
              </div>

              <div className="method-pillar">
                <h3>Series de Tiempo</h3>
                <p>Análisis de datos secuenciales para identificar patrones estacionales y proyectar tendencias futuras con alta precisión.</p>
              </div>

              <div className="method-pillar">
                <h3>Modelos Econométricos</h3>
                <p>Aplicación de herramientas matemáticas y estadísticas para cuantificar teorías económicas y evaluar el impacto de variables específicas.</p>
              </div>
            </div>

            <p className="about-location">📍 Metodologías más usadas e innovadoras | Rigor Técnico</p>
          </div>
          <div className="about-me-image">
            <MethodologyAnimation />
          </div>
        </div>
      </div>

      {/* Cortina de entrada (sube en 2 fases: cubre, luego sigue subiendo) */}
      <div className={`about-curtain-entry ${entryCurtainPhase === 'covering' ? 'covering' : ''} ${entryCurtainPhase === 'revealing' ? 'revealing' : ''}`}>
      </div>

      {/* Cortina de salida (sube desde abajo para cubrir todo, luego sigue subiendo) */}
      <div className={`about-curtain-exit ${exitPhase === 'covering' ? 'active' : ''} ${exitPhase === 'revealing' ? 'revealing' : ''}`}>
        <div className="curtain-fill"></div>
      </div>
    </>
  );
}
