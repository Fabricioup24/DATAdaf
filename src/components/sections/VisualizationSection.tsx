import React from 'react';
import HeroAnimation from '../HeroAnimation';
import CylinderCarousel from '../CylinderCarousel';

export default function VisualizationSection() {
  return (
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
  );
}
