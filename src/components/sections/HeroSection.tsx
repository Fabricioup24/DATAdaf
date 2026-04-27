import React from 'react';
import LocationTag from '../LocationTag';
import HeroAnimation from '../HeroAnimation';
import Navbar from '../Navbar';

interface HeroSectionProps {
  showLobby: boolean;
  menuOpen: boolean;
  onMenuToggle: () => void;
  handleScrollTop: (e: React.MouseEvent) => void;
}

export default function HeroSection({ showLobby, menuOpen, onMenuToggle, handleScrollTop }: HeroSectionProps) {
  return (
    <section id="hero" className="relative">
      <Navbar 
        menuOpen={menuOpen} 
        onMenuToggle={onMenuToggle} 
        handleScrollTop={handleScrollTop}
        pageReady={!showLobby}
      />

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
