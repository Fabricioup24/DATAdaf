import React from 'react';
import PointSphere from '../PointSphere';

interface AboutSectionProps {
  handleScrollTo: (e: React.MouseEvent, targetId: string) => void;
}

export default function AboutSection({ handleScrollTo }: AboutSectionProps) {
  return (
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
  );
}
