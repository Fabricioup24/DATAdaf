import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

import Lobby from './Lobby';
import HeroSection from './sections/HeroSection';
import AboutSection from './sections/AboutSection';
import ServicesSection from './sections/ServicesSection';
import DatabaseSection from './sections/DatabaseSection';
import VisualizationSection from './sections/VisualizationSection';
import TestimonialsSection from './sections/TestimonialsSection';
import ContactSection from './sections/ContactSection';

const AboutMePage = lazy(() => import('./AboutMePage'));

const testimonials = [
  {
    stars: '★★★★★',
    text: 'La culminación de mi tesis doctoral fue posible gracias a un acompañamiento excepcional. El soporte brindado no solo garantizó una corrección de estilo pulcra y profesional, sino que fue determinante en la estructuración y ejecución metodológica, aportando la solidez técnica necesaria para mi grado en Negocios Globales.',
    author: 'Ivan D.',
    role: 'Doctor en Negocios Globales, Universidad Ricardo Palma',
  },
  {
    stars: '★★★★★',
    text: 'Gracias a DATAdaf, logré materializar el diseño de investigación que tenía proyectado para mi tesis de licenciatura. Pude realizar la detección de rejas viales en toda Lima Metropolitana utilizando el modelo YOLO26 y técnicas de visión artificial. Recomiendo ampliamente a DATAdaf porque su enfoque logra trascender las metodologías tradicionales.',
    author: 'Antonio U.',
    role: 'Bachiller en Ciencias Políticas por la UPC',
  },
  {
    stars: '★★★★★',
    text: 'El año pasado quise trabajar en un proyecto personal orientado a la visualización de datos de corte transversal y me sirvió mucho la ayuda con los gráficos, la codificación y sus buenas prácticas. Recomiendo DATAdaf a todo aquel que esté interesado en el mundo de los datos.',
    author: 'Mia T.',
    role: 'B.S. in Political Science, Universidad de Arizona',
  },
  {
    stars: '★★★★★',
    text: 'Trabajé con DATAdaf para aterrizar el análisis de datos de un proyecto inmobiliario y los resultados cumplieron totalmente mis expectativas. Me ayudaron a organizar variables complejas y a traducirlas en una infografía técnica clara, resolviendo dudas puntuales sobre el procesamiento de la información. Es una opción práctica y profesional para quienes necesitan rigor en la visualización de datos aplicados a la arquitectura.',
    author: 'Jimena T.',
    role: 'Estudiante de arquitectura, Universidad de Lima',
  },
];

type LenisController = {
  scrollTo?: (target: string | Element | number, options?: Record<string, unknown>) => void;
  start?: () => void;
  stop?: () => void;
};

declare global {
  interface Window {
    lenis?: LenisController;
  }
}

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HomeClient() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLobby, setShowLobby] = useState(true);
  const [showAboutMePage, setShowAboutMePage] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const contactRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const copyrightFooterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showLobby) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [showLobby]);

  useEffect(() => {
    if (showAboutMePage) {
      document.body.style.overflow = 'hidden';
      window.lenis?.stop?.();
      return;
    }

    document.body.style.overflow = '';
    window.lenis?.start?.();
  }, [showAboutMePage]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setShowAboutMePage(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    if (showLobby) {
      return;
    }

    let lastY = window.scrollY;
    let lastTime = performance.now();
    let velocityReset: number | undefined;

    const updateScrollMetrics = () => {
      const currentY = window.scrollY;
      const now = performance.now();
      const delta = currentY - lastY;
      const elapsed = Math.max(16, now - lastTime);

      if (delta !== 0) {
        setScrollDirection(delta > 0 ? 'down' : 'up');
        setScrollVelocity(Math.min(1, Math.abs(delta) / elapsed));
      }

      window.clearTimeout(velocityReset);
      velocityReset = window.setTimeout(() => setScrollVelocity(0), 120);

      lastY = currentY;
      lastTime = now;
    };

    window.addEventListener('scroll', updateScrollMetrics, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateScrollMetrics);
      window.clearTimeout(velocityReset);
    };
  }, [showLobby]);

  useEffect(() => {
    if (showLobby) {
      return;
    }

    const triggers: ScrollTrigger[] = [];
    const sections = document.querySelectorAll<HTMLElement>('[data-scroll-class]');
    sections.forEach((section) => {
      const cls = section.getAttribute('data-scroll-class');
      if (!cls) {
        return;
      }

      triggers.push(
        ScrollTrigger.create({
          trigger: section,
          start: 'top 80%',
          toggleClass: cls,
        }),
      );
    });

    const aboutContent = document.querySelector('.about-content');
    let aboutObserver: IntersectionObserver | undefined;
    if (aboutContent) {
      aboutObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-inview');
              aboutObserver?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3, rootMargin: '-100px 0px -100px 0px' },
      );
      aboutObserver.observe(aboutContent);
    }

    const contactSection = contactRef.current;
    const waveCurtain = curtainRef.current;
    const handleScrollCurtain = () => {
      if (!contactSection || !waveCurtain) {
        return;
      }

      const rect = contactSection.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (viewportHeight - rect.top) / viewportHeight));

      waveCurtain.style.transform = `translateY(${-progress * 105}%) translateZ(0)`;
      if (progress > 0.95) {
        waveCurtain.style.opacity = '0';
        waveCurtain.style.visibility = 'hidden';
      } else {
        waveCurtain.style.opacity = '1';
        waveCurtain.style.visibility = 'visible';
      }
    };

    handleScrollCurtain();
    window.addEventListener('scroll', handleScrollCurtain, { passive: true });

    const projectsSection = document.querySelector('#database');
    let centerCardTimer: number | undefined;
    if (projectsSection) {
      triggers.push(
        ScrollTrigger.create({
          trigger: projectsSection,
          start: 'top 70%',
          onEnter: () => {
            projectsSection.classList.add('cards-visible');
            centerCardTimer = window.setTimeout(() => {
              const centerCard = projectsSection.querySelector('.card-center');
              centerCard?.classList.add('appeared');
            }, 7000);
          },
          onLeaveBack: () => {
            projectsSection.classList.remove('cards-visible');
          },
        }),
      );
    }

    const services2Section = document.querySelector('#services-2');
    if (services2Section) {
      triggers.push(
        ScrollTrigger.create({
          trigger: services2Section,
          start: 'top bottom',
          onEnter: () => services2Section.classList.add('cards-visible'),
        }),
      );
    }

    return () => {
      aboutObserver?.disconnect();
      window.removeEventListener('scroll', handleScrollCurtain);
      window.clearTimeout(centerCardTimer);
      triggers.forEach((trigger) => trigger.kill());
    };
  }, [showLobby]);

  useEffect(() => {
    const signature = copyrightFooterRef.current;
    if (!signature) {
      return;
    }

    const handleMouseEnter = () => signature.classList.add('copyright-rotating');
    const handleMouseLeave = () => signature.classList.remove('copyright-rotating');

    signature.addEventListener('mouseenter', handleMouseEnter);
    signature.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      signature.removeEventListener('mouseenter', handleMouseEnter);
      signature.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleLobbyComplete = () => {
    setShowLobby(false);
    document.documentElement.classList.add('page-ready');
    document.body.classList.add('page-ready');
    ScrollTrigger.refresh();
  };

  const handleScrollTo = (event: React.MouseEvent, targetId: string) => {
    event.preventDefault();
    setMenuOpen(false);

    const target = document.querySelector(targetId);
    if (!target) {
      return;
    }

    if (window.lenis?.scrollTo) {
      window.lenis.scrollTo(target, { duration: 1 });
      return;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleScrollTop = (event: React.MouseEvent) => {
    event.preventDefault();
    setMenuOpen(false);

    if (window.lenis?.scrollTo) {
      window.lenis.scrollTo(0, { duration: 1 });
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenMetodologias = (event: React.MouseEvent) => {
    event.preventDefault();
    setMenuOpen(false);
    setShowAboutMePage(true);
  };

  return (
    <>
      {showLobby && <Lobby onComplete={handleLobbyComplete} />}

      {showAboutMePage && (
        <Suspense fallback={null}>
          <AboutMePage onClose={() => setShowAboutMePage(false)} />
        </Suspense>
      )}

      <div id="site-menu" className={`side-menu ${menuOpen ? 'open' : ''} ${!showLobby ? 'page-ready' : ''}`} aria-hidden={!menuOpen}>
        <svg className="wave-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,0 Q30,50 0,100 L100,100 L100,0 Z" fill="#ffffff" />
        </svg>
        <nav className="side-menu-nav" aria-label="Navegacion principal">
          <ul>
            <li>
              <a href="#metodologias" onClick={handleOpenMetodologias}>Metodologias</a>
            </li>
            <li>
              <a href="#database" onClick={(event) => handleScrollTo(event, '#database')}>Base de Datos</a>
            </li>
            <li>
              <a href="#visualizacion" onClick={(event) => handleScrollTo(event, '#visualizacion')}>Visualizacion de Datos</a>
            </li>
            <li>
              <a href="#contact" onClick={(event) => handleScrollTo(event, '#contact')}>Contacto</a>
            </li>
            <li>
              <a href="/blog" onClick={() => setMenuOpen(false)}>Blog</a>
            </li>
          </ul>
        </nav>
      </div>

      <div
        className={`menu-overlay ${menuOpen ? 'visible' : ''}`}
        onClick={toggleMenu}
        aria-hidden={!menuOpen}
      />

      <div id="main-wrapper" className={`${!showLobby ? 'page-ready' : ''}`}>
        <main>
          <HeroSection
            showLobby={showLobby}
            onMenuToggle={toggleMenu}
            menuOpen={menuOpen}
            handleScrollTop={handleScrollTop}
          />

          <AboutSection
            handleOpenMetodologias={handleOpenMetodologias}
            handleScrollTo={handleScrollTo}
          />

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
            handleScrollTop={handleScrollTop}
          />
        </main>
      </div>
    </>
  );
}
