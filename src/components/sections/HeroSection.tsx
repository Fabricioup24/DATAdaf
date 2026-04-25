import React from 'react';
import LocationTag from '../LocationTag';
import HeroAnimation from '../HeroAnimation';

interface HeroSectionProps {
  showLobby: boolean;
  menuOpen: boolean;
  onMenuToggle: () => void;
  handleScrollTop: (e: React.MouseEvent) => void;
}

export default function HeroSection({ showLobby, menuOpen, onMenuToggle, handleScrollTop }: HeroSectionProps) {
  return (
    <section id="hero" className="relative">
      <header>
        <div className="header-signature">
          <a href="#hero" className="signature-link" onClick={handleScrollTop}>
            <img
              src="/graficos/datadafblanco.png"
              alt="DATAdaf Logo - Consultoría de Ciencia de Datos y Metodología"
              className="header-logo"
              width={196}
              height={55}
              loading="eager"
            />
          </a>
        </div>
        <button
          type="button"
          className={`menu-toggle ${menuOpen ? 'open' : ''}`}
          onClick={onMenuToggle}
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          aria-label={menuOpen ? 'Cerrar menu' : 'Abrir menu'}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
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
  );
}
