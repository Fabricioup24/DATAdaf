import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { gsap } from 'gsap';
import Marquee from '../components/Marquee';
import Lobby from '../components/Lobby';
import LocationTag from '../components/LocationTag';
import AboutMePage from '../components/AboutMePage';
import LogoMarquee from '../components/LogoMarquee';
import CylinderCarousel from '../components/CylinderCarousel';
import HeroAnimation from '../components/HeroAnimation';
import ScrapingAnimation from '../components/ScrapingAnimation';
import DataOrderAnimation from '../components/DataOrderAnimation';

export default function Home() {
  const scrollRef = useRef(null);
  const [scrollDirection, setScrollDirection] = useState('up');
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLobby, setShowLobby] = useState(true);
  const [showAboutMePage, setShowAboutMePage] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      stars: '★★★★★',
      text: "La culminación de mi tesis doctoral fue posible gracias a un acompañamiento excepcional. El soporte brindado no solo garantizó una corrección de estilo pulcra y profesional, sino que fue determinante en la estructuración y ejecución metodológica, aportando la solidez técnica necesaria para mi grado en Negocios Globales.",
      author: "Ivan D.",
      role: "Doctor en Negocios Globales"
    },
    {
      stars: '★★★★★',
      text: "Gracias a DATAcore, logré materializar el diseño de investigación que tenía proyectado para mi tesis de licenciatura. Pude realizar la detección de rejas viales en toda Lima Metropolitana utilizando el modelo YOLO26 y técnicas de visión artificial. Recomiendo ampliamente a DATAcore porque su enfoque logra trascender las metodologías tradicionales.",
      author: "Antonio U.",
      role: "Bachiller en Ciencias Políticas por la UPC"
    },
    {
      stars: '★★★★★',
      text: "El año pasado quise trabajar en un proyecto personal orientado a la visualización de datos de corte transversal y me sirvió mucho la ayuda con los gráficos, la codificación y sus buenas prácticas. Recomiendo DATAcore a todo aquel que esté interesado en el mundo de los datos.",
      author: "Mia T.",
      role: "B.S. in Political Science, Universidad de Arizona"
    },
    {
      stars: '★★★★★',
      text: "Trabajé con DATAcore para aterrizar el análisis de datos de un proyecto inmobiliario y los resultados cumplieron totalmente mis expectativas. Me ayudaron a organizar variables complejas y a traducirlas en una infografía técnica clara, resolviendo dudas puntuales sobre el procesamiento de la información. Es una opción práctica y profesional para quienes necesitan rigor en la visualización de datos aplicados a la arquitectura.",
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

  const copyrightRef = useRef(null);
  const copyrightFooterRef = useRef(null);
  const locomotiveScrollRef = useRef(null);
  const contactRef = useRef(null);
  const curtainRef = useRef(null);





  // Manejar el bloqueo de scroll cuando el modal está abierto
  useEffect(() => {
    if (showAboutMePage) {
      document.body.style.overflow = 'hidden';
      if (locomotiveScrollRef.current) locomotiveScrollRef.current.stop();
    } else {
      document.body.style.overflow = '';
      if (locomotiveScrollRef.current) locomotiveScrollRef.current.start();
    }
  }, [showAboutMePage]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLobbyComplete = () => {
    setShowLobby(false);
    // Activar scroll después del lobby
    document.documentElement.classList.add('page-ready');
    document.body.classList.add('page-ready');

    // Forzar actualización de Locomotive Scroll
    setTimeout(() => {
      if (window.locomotiveScrollInstance) {
        window.locomotiveScrollInstance.update();
      }
    }, 100);
  };

  const handleReload = (e) => {
    e.preventDefault();
    window.location.reload();
  };

  // Función para navegar suavemente a las secciones
  const handleScrollTo = (e, targetId) => {
    e.preventDefault();
    if (menuOpen) toggleMenu();

    if (locomotiveScrollRef.current) {
      locomotiveScrollRef.current.scrollTo(targetId, {
        duration: 1.5,
        easing: [0.25, 0.00, 0.35, 1.00]
      });
    }
  };

  const handleOpenMetodologias = (e) => {
    e.preventDefault();
    if (menuOpen) toggleMenu();
    setShowAboutMePage(true);
  };



  useEffect(() => {
    if (showLobby) return; // No inicializar scroll hasta que el lobby termine

    const LocomotiveScroll = require('locomotive-scroll').default;
    const scroll = new LocomotiveScroll({
      el: scrollRef.current,
      smooth: true,
      tablet: { smooth: true },
      smartphone: { smooth: true }
    });

    // Guardar instancia en ref y window para uso externo
    locomotiveScrollRef.current = scroll;
    window.locomotiveScrollInstance = scroll;

    // Forzar actualización inicial después de un breve delay para asegurar que el DOM esté listo
    setTimeout(() => {
      scroll.update();
    }, 500);

    // Observer para actualizar scroll cuando cambia el tamaño del contenido
    const resizeObserver = new ResizeObserver(() => {
      scroll.update();
    });

    if (scrollRef.current) {
      resizeObserver.observe(scrollRef.current);
    }

    let lastScroll = 0;
    let lastTime = Date.now();

    scroll.on('scroll', (instance) => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTime;
      const deltaScroll = instance.scroll.y - lastScroll;

      // Calcular velocidad del scroll
      const velocity = Math.abs(deltaScroll / deltaTime);
      setScrollVelocity(velocity);

      const currentScrollY = instance.scroll.y;

      if (currentScrollY > lastScroll) {
        setScrollDirection('down'); // Scroll hacia abajo: derecha a izquierda
      } else {
        setScrollDirection('up'); // Scroll hacia arriba: izquierda a derecha
      }


      // Efecto de cortina ondulada que revela la sección de contacto
      const contactSection = contactRef.current;
      const waveCurtain = curtainRef.current;

      if (contactSection && waveCurtain) {
        const rect = contactSection.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Cálculo basado en la posición relativa al viewport
        const progress = Math.min(1, Math.max(0, (viewportHeight - rect.top) / viewportHeight));

        // Usamos transform para mejor rendimiento y subimos un poco más del 100% para asegurar el revelado
        waveCurtain.style.transform = `translateY(${-progress * 105}%) translateZ(0)`;

        if (progress > 0.95) {
          waveCurtain.style.opacity = '0';
          waveCurtain.style.visibility = 'hidden';
        } else {
          waveCurtain.style.opacity = '1';
          waveCurtain.style.visibility = 'visible';
        }
      }

      lastScroll = currentScrollY;
      lastTime = currentTime;
    });

    // Observador de intersección para la sección "Sobre mí"
    const aboutContent = document.querySelector('.about-content');
    const observerOptions = {
      threshold: 0.3,
      rootMargin: '-200px 0px -200px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-inview');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    if (aboutContent) {
      observer.observe(aboutContent);
    }

    // Observador para la sección de proyectos (efecto de cartas)
    const projectsSection = document.querySelector('#database');
    const projectsObserverOptions = {
      threshold: 0.5,
      rootMargin: '-150px 0px -150px 0px'
    };

    const projectsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('cards-visible');
          setTimeout(() => {
            const centerCard = entry.target.querySelector('.card-center');
            if (centerCard) {
              centerCard.classList.add('appeared');
            }
          }, 7000);
        } else {
          entry.target.classList.remove('cards-visible');
        }
      });
    }, projectsObserverOptions);

    if (projectsSection) {
      projectsObserver.observe(projectsSection);
    }

    return () => {
      resizeObserver.disconnect();
      if (scroll) scroll.destroy();
      if (aboutContent) observer.unobserve(aboutContent);
      if (projectsSection) projectsObserver.unobserve(projectsSection);
    };
  }, [showLobby]);


  // Efecto para rotar el símbolo © al hacer hover
  useEffect(() => {
    const handleMouseEnter = (e) => {
      e.currentTarget.classList.add('copyright-rotating');
    };

    const handleMouseLeave = (e) => {
      e.currentTarget.classList.remove('copyright-rotating');
    };

    const sigs = [copyrightRef.current, copyrightFooterRef.current].filter(Boolean);

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
      <Head>
        <title>Fabricio Urruchi - Portafolio</title>
        <meta name="description" content="Portafolio de Fabricio Urruchi" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="dns-prefetch" href="https://www.linkedin.com" />
        <link rel="preconnect" href="https://www.linkedin.com" />
        <link rel="dns-prefetch" href="https://www.instagram.com" />
        <link rel="preconnect" href="https://www.instagram.com" />
      </Head>

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
              <Link href="/blog" onClick={toggleMenu}>Blog</Link>
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
        data-scroll-container
      >
        <main>
          <section id="hero" data-scroll-section>
            <header>
              <div className="header-signature">
                <a href="/" className="signature-link" onClick={handleReload}>
                  <img
                    src="/graficos/datacoreblanco.png"
                    alt="DATAcore Logo"
                    className="header-logo"
                  />
                </a>
              </div>
            </header>



            {!showLobby && <LocationTag />}

            {/* Nueva descripción */}
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

          <section id="about" data-scroll-section>
            <div className="about-content">
              <h3 className="about-pre-subtitle">
                Te ayudamos a estructurar y procesar tus datos para dar solidez<br />y autoridad técnica a tu investigación científica.
              </h3>
              <a href="#contact" className="about-cta-button" onClick={(e) => handleScrollTo(e, '#contact')}>
                No te quedes atrás, transformamos datos complejos en <span className="highlight">rigor metodológico y decisiones estratégicas</span>
              </a>
              <p className="about-description">
                En DATAcore somos un equipo de científicos de datos listos para estructurar, analizar y rentabilizar tu información. No importa si necesitas blindar la metodología de tu tesis de pregrado, maestría o doctorado, o si buscas optimizar los procesos de tu empresa: le damos a tu proyecto el respaldo técnico que la realidad exige.
              </p>
              <p className="about-description">
                Nos encargamos del trabajo pesado. Dominamos la extracción masiva de datos con web scraping, construimos datasets a medida, aplicamos estadística avanzada y diseñamos reportes visuales.
              </p>
              <p className="about-description">
                Tú pones el objetivo. Nosotros construimos la arquitectura de datos para que lo alcances con seguridad y precisión.
              </p>
            </div>
          </section>

          <section id="services" data-scroll-section>
            {/* Animación de fondo idéntica al Hero */}
            <div className="services-bg-animation">
              <HeroAnimation showShadow={false} />
              {/* Gradiente sutil para asegurar legibilidad del texto */}
              <div className="animation-overlay-gradient"></div>
            </div>

            <div className="services-container">
              <h2 className="section-title">Metodologías</h2>
              <p className="section-subtitle">Herramientas analíticas de vanguardia para el rigor científico.</p>

              <div className="services-grid">
                <div className="service-item">
                  <h3>Modelos VAR</h3>
                  <p>Vectores Autorregresivos para el análisis de interdependencias múltiples en series de tiempo dinámicas.</p>
                </div>
                <div className="service-item">
                  <h3>Análisis de Regresión</h3>
                  <p>Modelamiento de relaciones causales mediante regresiones lineales, múltiples y no lineales con rigor estadístico.</p>
                </div>
                <div className="service-item">
                  <h3>Logit & Probit</h3>
                  <p>Modelos de respuesta cualitativa y elección discreta para el análisis de variables dependientes binarias.</p>
                </div>
                <div className="service-item">
                  <h3>Series de Tiempo</h3>
                  <p>Modelos ARIMA, GARCH y análisis de estacionalidad para predicción y estudio de tendencias temporales.</p>
                </div>
                <div className="service-item">
                  <h3>Embeddings & NLP</h3>
                  <p>Transformación de texto en vectores matemáticos para análisis semántico y procesamiento de lenguaje natural.</p>
                </div>
                <div className="service-item">
                  <h3>Computer Vision</h3>
                  <p>Detección de objetos y procesamiento de imágenes computacionales para la extracción de datos visuales.</p>
                </div>
              </div>
            </div>
          </section>


          <section id="database" data-scroll-section data-scroll data-scroll-class="is-inview">
            <div className="database-container">
              <h2>Bases de Datos</h2>
              <p className="section-subtitle">Trabajamos con todas las fuentes de datos públicas</p>
              <LogoMarquee scrollDirection={scrollDirection} scrollVelocity={scrollVelocity} />
              <p className="section-subtitle-bottom"><span className="highlight">Web scraping</span> para extraer datos de páginas web</p>
            </div>
            <DataOrderAnimation />
          </section>

          <section id="visualizacion" data-scroll-section data-scroll data-scroll-class="is-inview">
            {/* Animación de fondo idéntica al Hero */}
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

          <section id="testimonios" data-scroll-section data-scroll data-scroll-class="is-inview">
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

          <section id="contact" data-scroll-section ref={contactRef}>
            {/* Wave overlay that covers contact section */}
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

            {/* Contact bubbles */}
            <div className="contact-bubbles-container">

              <a
                href="https://www.linkedin.com/in/fabricioaurruchi/"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-bubble contact-bubble-name"
              >
                <span>DATAcore</span>
              </a>
              <a
                href="https://www.instagram.com/fabricio.urruchi/?hl=es"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-bubble contact-bubble-instagram"
              >
                <span>@datacore</span>
              </a>
            </div>
            <div className="footer-signature-container">
              <div className="signature-text" ref={copyrightFooterRef}>
                <div className="signature-pure-text">
                  <span>Copyright</span>
                </div>
                <span className="signature-separator"> | </span>
                <a href="/" className="signature-logo-link" onClick={handleReload}>
                  <img src="/graficos/datacoreblanco.png" alt="DATAcore" className="footer-logo" />
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
