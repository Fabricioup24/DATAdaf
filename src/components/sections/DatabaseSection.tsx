import React from 'react';
import LogoMarquee from '../LogoMarquee';
import DataOrderAnimation from '../DataOrderAnimation';

interface DatabaseSectionProps {
  scrollDirection: 'up' | 'down';
  scrollVelocity: number;
}

export default function DatabaseSection({ scrollDirection, scrollVelocity }: DatabaseSectionProps) {
  return (
    <section id="database" data-scroll-class="is-inview">
      <div className="database-container">
        <h2>Bases de Datos</h2>
        <p className="section-subtitle">Trabajamos con todas las fuentes de datos públicas</p>
        <LogoMarquee scrollDirection={scrollDirection} scrollVelocity={scrollVelocity} />
        <p className="section-subtitle-bottom"><span className="highlight">Web scraping</span> para extraer datos de páginas web</p>
      </div>
      <DataOrderAnimation />
    </section>
  );
}
