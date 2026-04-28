import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import BlogCard from './BlogCard';
import HeroAnimation from './HeroAnimation';

/**
 * Client component for the Blog page.
 * Manages the side menu state and renders blog content.
 * 
 * @returns {JSX.Element} The rendered Blog page content
 */
const BlogClient = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    // Ensure Lenis and GSAP are ready if needed
    if (typeof window !== 'undefined') {
      document.documentElement.classList.add('page-ready');
      document.body.classList.add('page-ready');
    }
  }, []);

  return (
    <>
      <div id="main-wrapper" className="page-ready group bg-white min-h-screen text-[#121212]">
        <Navbar
          menuOpen={menuOpen}
          onMenuToggle={toggleMenu}
          pageReady={true}
          variant="light"
        />

        <div
          className={`menu-overlay ${menuOpen ? 'visible' : ''}`}
          onClick={toggleMenu}
        />

        {/* Reusing side-menu structure from HomeClient */}
        <div id="site-menu" className={`side-menu ${menuOpen ? 'open' : ''} page-ready`}>
          <svg className="wave-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,0 Q30,50 0,100 L100,100 L100,0 Z" fill="#ffffff" />
          </svg>
          <nav className="side-menu-nav">
            <ul>
              <li><a href="/">Inicio</a></li>
              <li><a href="/blog">Blog</a></li>
              <li><a href="/#contact">Contacto</a></li>
            </ul>
          </nav>
        </div>

        <section className="blog-index-section relative flex flex-col items-center">
          <HeroAnimation showGradient={false} showShadow={false} />

          <div className="blog-hero-description z-10">
            <div className="description-text">
              <h1 className="hero-main-title">
                Blog
              </h1>
              <p className="hero-main-subtitle">
                Ciencia de datos y metodología aplicada
              </p>
            </div>
          </div>

          <div className="blog-grid-shell max-w-7xl mx-auto px-8 pb-24 z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              <BlogCard
                title="Ubicación de las mesas de la serie 900"
                excerpt="Geolocalización y análisis territorial de los locales de votación asociados a la serie 900."
                date="27 de Abril, 2026"
                category="metodologia"
                slug="mesas-serie-9"
                imageUrl="/graficos/portada_geolocalizacion_serie_900.webp"
                variant="light"
              />

              <div className="opacity-10 border-2 border-dashed border-[#121212] rounded-3xl aspect-[4/5] flex items-center justify-center p-12 text-center transition-all hover:opacity-20 hover:scale-[0.98]">
                <p className="text-[#121212] font-bold uppercase tracking-widest text-sm">Próximamente más contenido</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default BlogClient;
