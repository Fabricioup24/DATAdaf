import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

import AboutMePage from './AboutMePage';
import Lobby from './Lobby';
import HeroSection from './sections/HeroSection';
import AboutSection from './sections/AboutSection';
import ServicesSection from './sections/ServicesSection';
import DatabaseSection from './sections/DatabaseSection';
import VisualizationSection from './sections/VisualizationSection';
import TestimonialsSection from './sections/TestimonialsSection';
import ContactSection from './sections/ContactSection';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HomeClient() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLobby, setShowLobby] = useState(true);
  const [showAboutMePage, setShowAboutMePage] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [, setModalClosing] = useState(false);
  const [, setModalRevealing] = useState(false);

  const testimonials = [
    {
      stars: '★★★★★',
      text: "La culminación de mi tesis doctoral fue posible gracias a un acompañamiento excepcional. El soporte brindado no solo garantizó una corrección de estilo pulcra y profesional, sino que fue determinante en la estructuración y ejecución metodológica, aportando la solidez técnica necesaria para mi grado en Negocios Globales.",
      author: "Ivan D.",
      role: "Doctor en Negocios Globales, Universidad Ricardo Palma"
    },
    {
      stars: '★★★★★',
      text: "Gracias a DATAdaf, logré materializar el diseño de investigación que tenía proyectado para mi tesis de licenciatura. Pude realizar la detección de rejas viales en toda Lima Metropolitana utilizando el modelo YOLO26 y técnicas de visión artificial. Recomiendo ampliamente a DATAdaf porque su enfoque logra trascender las metodologías tradicionales.",
      author: "Antonio U.",
      role: "Bachiller en Ciencias Políticas por la UPC"
    },
    {
      stars: '★★★★★',
      text: "El año pasado quise trabajar en un proyecto personal orientado a la visualización de datos de corte transversal y me sirvió mucho la ayuda con los gráficos, la codificación y sus buenas prácticas. Recomiendo DATAdaf a todo aquel que esté interesado en el mundo de los datos.",
      author: "Mia T.",
      role: "B.S. in Political Science, Universidad de Arizona"
    },
    {
      stars: '★★★★★',
      text: "Trabajé con DATAdaf para aterrizar el análisis de datos de un proyecto inmobiliario y los resultados cumplieron totalmente mis expectativas. Me ayudaron a organizar variables complejas y a traducirlas en una infografía técnica clara, resolviendo dudas puntuales sobre el procesamiento de la información. Es una opción práctica y profesional para quienes necesitan rigor en la visualización de datos aplicados a la arquitectura.",
      author: "Jimena T.",
      role: "Estudiante de arquitectura, Universidad de Lima"
    }
  ];

  // Rotación automática de testimonios
  useEffect(() => {
    if (showLobby) return;
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Rota cada 5 segundos
    return () => clearInterval(interval);
  }, [showLobby, testimonials.length]);

  const contactRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const copyrightRef = useRef<HTMLDivElement>(null);
  const copyrightFooterRef = useRef<HTMLDivElement>(null);

  // Manejar el bloqueo de scroll cuando el modal está abierto
  useEffect(() => {
    if (showAboutMePage) {
      document.body.style.overflow = 'hidden';
      // Si usamos lenis global, se puede pausar despachando evento o accediendo a window.lenis si existiese
      // pero overflow hidden detiene lenis de scrollear el body
    } else {
      document.body.style.overflow = '';
    }
  }, [showAboutMePage]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLobbyComplete = () => {
    setShowLobby(false);
    document.documentElement.classList.add('page-ready');
    document.body.classList.add('page-ready');
    ScrollTrigger.refresh();
  };

  const handleReload = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.reload();
  };

  const handleScrollTo = (e: React.MouseEvent, targetId: string) => {
    e.preventDefault();
    if (menuOpen) toggleMenu();
    // Reemplazamos locomotive scroll por lenis global scrollTo si fuese necesario
    // Aquí implementamos un scroll suave genérico nativo o GSAP
    const target = document.querySelector(targetId);
    if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenMetodologias = (e: React.MouseEvent) => {
    e.preventDefault();
    if (menuOpen) toggleMenu();
    setShowAboutMePage(true);
  };

  // Reemplazar LocomotiveScroll con ScrollTrigger
  useEffect(() => {
    if (showLobby) return;

    const sections = document.querySelectorAll('[data-scroll-class]');
    sections.forEach(section => {
        const cls = section.getAttribute('data-scroll-class');
        if (cls) {
            ScrollTrigger.create({
                trigger: section,
                start: "top 80%",
                toggleClass: cls,
                once: false
            });
        }
    });

    // Observer dedicado para .about-content (requiere is-inview en el propio div)
    const aboutContent = document.querySelector('.about-content');
    if (aboutContent) {
        const aboutObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-inview');
                    aboutObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3, rootMargin: '-100px 0px -100px 0px' });
        aboutObserver.observe(aboutContent);
    }

    // Efecto de cortina ondulada que revela la sección de contacto
    // Usa scroll listener directo como en el original (Locomotive Scroll)
    const contactSection = contactRef.current;
    const waveCurtain = curtainRef.current;

    const handleScrollCurtain = () => {
        if (contactSection && waveCurtain) {
            const rect = contactSection.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // Cálculo basado en la posición relativa al viewport
            const progress = Math.min(1, Math.max(0, (viewportHeight - rect.top) / viewportHeight));

            waveCurtain.style.transform = `translateY(${-progress * 105}%) translateZ(0)`;

            if (progress > 0.95) {
                waveCurtain.style.opacity = '0';
                waveCurtain.style.visibility = 'hidden';
            } else {
                waveCurtain.style.opacity = '1';
                waveCurtain.style.visibility = 'visible';
            }
        }
    };

    window.addEventListener('scroll', handleScrollCurtain, { passive: true });

    // Efecto de las cartas en la DB
    const projectsSection = document.querySelector('#database');
    if (projectsSection) {
        ScrollTrigger.create({
            trigger: projectsSection,
            start: "top 70%",
            onEnter: () => {
                projectsSection.classList.add('cards-visible');
                setTimeout(() => {
                    const centerCard = projectsSection.querySelector('.card-center');
                    if (centerCard) {
                        centerCard.classList.add('appeared');
                    }
                }, 7000);
            },
            onLeaveBack: () => {
                projectsSection.classList.remove('cards-visible');
            }
        });
    }

    // Observer para #services-2
    const services2Section = document.querySelector('#services-2');
    if (services2Section) {
        ScrollTrigger.create({
            trigger: services2Section,
            start: "top bottom",
            onEnter: () => services2Section.classList.add('cards-visible')
        });
    }

    return () => {
        ScrollTrigger.getAll().forEach(t => t.kill());
        window.removeEventListener('scroll', handleScrollCurtain);
    };
  }, [showLobby]);

  useEffect(() => {
    const handleMouseEnter = (e: MouseEvent) => {
      (e.currentTarget as HTMLElement).classList.add('copyright-rotating');
    };

    const handleMouseLeave = (e: MouseEvent) => {
      (e.currentTarget as HTMLElement).classList.remove('copyright-rotating');
    };

    const sigs = [copyrightRef.current, copyrightFooterRef.current].filter(Boolean) as HTMLElement[];

    sigs.forEach(sig => {
      sig.addEventListener('mouseenter', handleMouseEnter);
      sig.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      sigs.forEach(sig => {
        sig.removeEventListener('mouseenter', handleMouseEnter);
        sig.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <>
      {showLobby && <Lobby onComplete={handleLobbyComplete} />}

      {showAboutMePage && (
        <AboutMePage
          onExitStart={() => setModalClosing(true)}
          onBeforeUnmount={() => {
            setModalRevealing(true);
            setModalClosing(false); // Ya se cubrió, ahora se revela
          }}
          onClose={() => {
            setShowAboutMePage(false);
            setModalRevealing(false);
            setModalClosing(false);
          }}
        />
      )}

      {/* Side Menu with Wave Effect */}
      <div className={`side-menu ${menuOpen ? 'open' : ''} ${!showLobby ? 'page-ready' : ''}`}>
        <svg className="wave-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,0 Q30,50 0,100 L100,100 L100,0 Z" fill="#ffffff" />
        </svg>
        <nav className="side-menu-nav">
          <ul>
            <li>
              <a href="#metodologias" onClick={handleOpenMetodologias}>Metodologías</a>
            </li>
            <li>
              <a href="#database" onClick={(e) => handleScrollTo(e, '#database')}>Base de Datos</a>
            </li>
            <li>
              <a href="#visualizacion" onClick={(e) => handleScrollTo(e, '#visualizacion')}>Visualización de Datos</a>
            </li>
            <li>
              <a href="/blog" onClick={toggleMenu}>Blog</a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Overlay */}
      <div
        className={`menu-overlay ${menuOpen ? 'visible' : ''}`}
        onClick={toggleMenu}
      ></div>

      <div
        id="main-wrapper"
        className={`${!showLobby ? 'page-ready' : ''}`}
        ref={scrollRef}
      >
        <main>
          <HeroSection showLobby={showLobby} handleReload={handleReload} />
          
          <AboutSection handleScrollTo={handleScrollTo} />

          <ServicesSection />

          <DatabaseSection scrollDirection={scrollDirection} scrollVelocity={scrollVelocity} />

          <VisualizationSection />

          <TestimonialsSection 
            testimonials={testimonials} 
            activeTestimonial={activeTestimonial} 
            setActiveTestimonial={setActiveTestimonial} 
          />

          <ContactSection 
            ref={contactRef} 
            curtainRef={curtainRef} 
            copyrightFooterRef={copyrightFooterRef} 
            handleReload={handleReload} 
          />
        </main>
      </div>
    </>
  );
}
