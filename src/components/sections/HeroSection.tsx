import React from 'react';
import LocationTag from '../LocationTag';
import HeroAnimation from '../HeroAnimation';

interface HeroSectionProps {
  showLobby: boolean;
  handleReload: (e: React.MouseEvent) => void;
}

export default function HeroSection({ showLobby, handleReload }: HeroSectionProps) {
  return (
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
  );
}
