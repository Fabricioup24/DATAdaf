import React from 'react';

interface Testimonial {
  stars: string;
  text: string;
  author: string;
  role: string;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  activeTestimonial: number;
  setActiveTestimonial: (index: number) => void;
}

export default function TestimonialsSection({ testimonials, activeTestimonial, setActiveTestimonial }: TestimonialsSectionProps) {
  return (
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
              <button
                type="button"
                key={index}
                className={`testimonial-dot ${index === activeTestimonial ? 'active' : ''}`}
                onClick={() => setActiveTestimonial(index)}
                aria-label={`Ver testimonio ${index + 1}`}
                aria-pressed={index === activeTestimonial}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
