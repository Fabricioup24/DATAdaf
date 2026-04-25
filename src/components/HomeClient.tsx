import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Marquee from './Marquee';
import Lobby from './Lobby';
import LocationTag from './LocationTag';
import AboutMePage from './AboutMePage';
import LogoMarquee from './LogoMarquee';
import CylinderCarousel from './CylinderCarousel';
import HeroAnimation from './HeroAnimation';

import DataOrderAnimation from './DataOrderAnimation';
import PointSphere from './PointSphere';

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
          <section id="hero" className="relative">
            <header>
              <div className="header-signature">
                <a href="/" className="signature-link" onClick={handleReload}>
                  <img
                    src="/graficos/datadafblanco.png"
                    alt="DATAdaf Logo - Consultoría de Ciencia de Datos y Metodología"
                    className="header-logo"
                  />
                </a>
              </div>
            </header>

            {!showLobby && <LocationTag />}

            <div className="hero-description">
              <div className="description-text">
                <h1 className="hero-main-title">
                  Arquitectura de datos<br />
                  para la toma de decisiones
                </h1>
                <p className="hero-main-subtitle">
                  Preparación y procesamiento de datos
                </p>
              </div>
            </div>

            <HeroAnimation showGradient={false} showShadow={false} />
          </section>

          <section id="about" data-scroll-class="is-inview">
            <div className="about-content">
              <h3 className="about-pre-subtitle">
                Te ayudamos a estructurar y procesar tus datos para dar solidez<br />y autoridad técnica a tu investigación científica.
              </h3>
              <a href="#contact" className="about-cta-button" onClick={(e) => handleScrollTo(e, '#contact')}>
                No te quedes atrás, transformamos datos complejos en <span className="highlight">rigor metodológico y decisiones estratégicas</span>
              </a>
              <p className="about-description">
                En DATAdaf somos un equipo de científicos de datos listos para estructurar, analizar y rentabilizar tu información. No importa si necesitas blindar la metodología de tu tesis de pregrado, maestría o doctorado, o si buscas optimizar los procesos de tu empresa: le damos a tu proyecto el respaldo técnico que la realidad exige.
              </p>
              <p className="about-description">
                Nos encargamos del trabajo pesado. Dominamos la extracción masiva de datos con web scraping, construimos datasets a medida, aplicamos estadística avanzada y diseñamos reportes visuales.
              </p>
              <p className="about-description">
                Tú pones el objetivo. Nosotros construimos la arquitectura de datos para que lo alcances con seguridad y precisión.
              </p>
            </div>
            <div className="point-sphere-wrapper">
              <PointSphere />
            </div>
          </section>

          {/* ── Metodologías · Parte 1/2 ── */}
          <section id="services">
            <div className="services-bg-animation">
              <HeroAnimation showShadow={false} />
              <div className="animation-overlay-gradient"></div>
            </div>

            <div className="services-container">
              <div className="met-header">
                <h2 className="section-title">Metodologías</h2>
                <p className="section-subtitle">Herramientas analíticas de vanguardia para el rigor científico.</p>
              </div>

              <div className="metodologias-grid">

                <div className="metodologia-familia">
                  <h3 className="metodologia-titulo">Diseño de Estudios e Inferencia Causal</h3>
                  <ul className="metodologia-lista">
                    <li>Diseños experimentales y cuasi-experimentales (Grupos de control, aleatorización y grupos intactos)</li>
                    <li>Diseños observacionales y longitudinales (Transversales, trend, cohortes y panel)</li>
                    <li>Diseños ex post facto y análisis causal-comparativo</li>
                    <li>Análisis de series de tiempo interrumpidas (Evaluación de impacto)</li>
                  </ul>
                </div>

                <div className="metodologia-familia">
                  <h3 className="metodologia-titulo">Estadística Inferencial y Pruebas de Hipótesis</h3>
                  <ul className="metodologia-lista">
                    <li>Pruebas de comparación de medias (T de Student para muestras independientes y relacionadas, Z-test)</li>
                    <li>Pruebas no paramétricas y de distribución libre (U de Mann-Whitney, Wilcoxon, Kruskal-Wallis)</li>
                    <li>Análisis de varianza y covarianza (ANOVA)</li>
                    <li>Pruebas de asociación, correlación y proporciones (Pearson, Spearman, Chi-cuadrado y Exacta de Fisher)</li>
                  </ul>
                </div>

                <div className="metodologia-familia">
                  <h3 className="metodologia-titulo">Modelos Lineales y Multivariados</h3>
                  <ul className="metodologia-lista">
                    <li>Modelos de regresión (Lineal, logística múltiple y Poisson)</li>
                    <li>Reducción de dimensionalidad y variables latentes (PCA, Análisis Factorial Exploratorio y Confirmatorio)</li>
                    <li>Modelado de Ecuaciones Estructurales (SEM)</li>
                  </ul>
                </div>

                <div className="metodologia-familia">
                  <h3 className="metodologia-titulo">Análisis de Series de Tiempo y Pronóstico</h3>
                  <ul className="metodologia-lista">
                    <li>Modelos autorregresivos y de medias móviles (ARIMA, SARIMA, ARIMAX)</li>
                    <li>Suavizado exponencial y modelos aditivos de predicción (Prophet, Holt-Winters)</li>
                    <li>Modelos de heterocedasticidad condicional para volatilidad (ARCH / GARCH)</li>
                    <li>Vectores Autorregresivos (VAR) y análisis de cointegración</li>
                  </ul>
                </div>

              </div>
            </div>
          </section>

          {/* ── Metodologías · Parte 2/2 ── */}
          <section id="services-2">
            <div className="services-bg-animation">
              <HeroAnimation showShadow={false} />
              <div className="animation-overlay-gradient"></div>
            </div>

            <div className="services-container services-container--continuation">

              <div className="metodologias-grid">

                <div className="metodologia-familia">
                  <h3 className="metodologia-titulo">Aprendizaje Automático (Machine Learning)</h3>
                  <ul className="metodologia-lista">
                    <li>Algoritmos de clasificación y regresión avanzada (Random Forest, XGBoost, Máquinas de Vectores de Soporte - SVM)</li>
                    <li>Métodos de agrupamiento o clustering (K-Means, DBSCAN, Clustering Jerárquico)</li>
                    <li>Reducción de dimensionalidad no lineal (t-SNE, UMAP)</li>
                  </ul>
                </div>

                <div className="metodologia-familia">
                  <h3 className="metodologia-titulo">Análisis de Datos No Estructurados (Texto y Visión Computacional)</h3>
                  <ul className="metodologia-lista">
                    <li>Procesamiento de Lenguaje Natural (NLP), minería de texto y análisis de sentimiento</li>
                    <li>Modelado de tópicos (Latent Dirichlet Allocation) y extracción de entidades</li>
                    <li>Embeddings de texto para análisis semántico vectorial</li>
                    <li>Visión artificial, detección de objetos en tiempo real (YOLO) y extracción cuantitativa de datos en video</li>
                    <li>Segmentación semántica de imágenes y reconocimiento algorítmico de patrones visuales</li>
                  </ul>
                </div>

                <div className="metodologia-familia">
                  <h3 className="metodologia-titulo">Estadística Espacial y Análisis de Redes Complejas</h3>
                  <ul className="metodologia-lista">
                    <li>Geoestadística y autocorrelación espacial (I de Moran / LISA)</li>
                    <li>Modelos de regresión geográficamente ponderada (GWR)</li>
                    <li>Análisis de hotspots y estimación de densidad de Kernel</li>
                    <li>Análisis de Redes Sociales y Complejas (SNA), métricas de centralidad e intermediación topológica</li>
                  </ul>
                </div>

                <div className="metodologia-familia">
                  <h3 className="metodologia-titulo">Minería de Datos y Análisis de Sentimiento</h3>
                  <ul className="metodologia-lista">
                    <li>Análisis de Sentimiento</li>
                    <li>Minería de Datos</li>
                  </ul>
                </div>

              </div>
            </div>
          </section>

          <section id="database" data-scroll-class="is-inview">
            <div className="database-container">
              <h2>Bases de Datos</h2>
              <p className="section-subtitle">Trabajamos con todas las fuentes de datos públicas</p>
              <LogoMarquee scrollDirection={scrollDirection} scrollVelocity={scrollVelocity} />
              <p className="section-subtitle-bottom"><span className="highlight">Web scraping</span> para extraer datos de páginas web</p>
            </div>
            <DataOrderAnimation />
          </section>

          <section id="visualizacion" data-scroll-class="is-inview">
            <div className="visualizacion-bg-animation">
              <HeroAnimation showGradient={false} showShadow={false} />
            </div>

            <div className="section-content">
              <h2>Visualización de Datos</h2>
              <p className="section-pre-subtitle">
                Te ofrecemos soluciones visuales que expresan lo que tus datos quieren decir.
              </p>
              <p className="section-subtitle-bottom">
                <span className="highlight">Supera la rigidez</span> de los gráficos comunes
              </p>

              <div className="visualization-container">
                <CylinderCarousel />
              </div>
            </div>
          </section>

          <section id="testimonios" data-scroll-class="is-inview">
            <div className="section-content">
              <h2>Testimonios</h2>
              <p className="section-subtitle">Lo que dicen quienes confían en nuestra arquitectura de datos</p>

              <div className="testimonials-grid-desktop">
                {testimonials.map((t, index) => (
                  <div key={index} className="testimonial-card">
                    <div className="testimonial-stars">{t.stars}</div>
                    <p className="testimonial-text">"{t.text}"</p>
                    <div className="testimonial-author">
                      <span className="author-name">{t.author}</span>
                      <span className="author-role">{t.role}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="testimonial-single-wrapper-mobile">
                {testimonials.map((t, index) => (
                  <div
                    key={index}
                    className={`testimonial-single-card ${index === activeTestimonial ? 'active' : ''}`}
                  >
                    <div className="testimonial-stars">{t.stars}</div>
                    <p className="testimonial-text">"{t.text}"</p>
                    <div className="testimonial-author">
                      <span className="author-name">{t.author}</span>
                      <span className="author-role">{t.role}</span>
                    </div>
                  </div>
                ))}

                <div className="testimonial-dots">
                  {testimonials.map((_, index) => (
                    <div
                      key={index}
                      className={`dot ${index === activeTestimonial ? 'active' : ''}`}
                      onClick={() => setActiveTestimonial(index)}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="contact" ref={contactRef}>
            <div className="contact-wave-curtain" ref={curtainRef}>
              <div className="wave-fill"></div>
              <svg className="wave-bottom" viewBox="0 0 1440 120" preserveAspectRatio="none">
                <path
                  fill="#ffffff"
                  stroke="#ffffff"
                  strokeWidth="1"
                  d="M0,0 L1440,0 L1440,60 Q1080,120 720,60 T0,60 L0,0 Z"
                />
              </svg>
            </div>
            <div className="contact-heading">
              <h2 className="contact-subtitle">Let's Work</h2>
              <h1 className="contact-title"><span className="highlight">Together</span></h1>
            </div>

            <div className="contact-bubbles-container">
              <a
                href="https://www.linkedin.com/company/datadaf/about/?viewAsMember=true"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-bubble contact-bubble-name"
              >
                <span>DATAdaf</span>
              </a>
              <a
                href="https://www.instagram.com/datadaf?igsh=djljNjJ3YTcyamw%3D&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-bubble contact-bubble-instagram"
              >
                <span>@datadaf</span>
              </a>
            </div>
            <div className="footer-signature-container">
              <div className="signature-text" ref={copyrightFooterRef}>
                <div className="signature-pure-text">
                  <span>Copyright</span>
                </div>
                <span className="signature-separator"> | </span>
                <a href="/" className="signature-logo-link" onClick={handleReload}>
                  <img src="/graficos/datadafblanco.png" alt="DATAdaf" className="footer-logo" />
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
