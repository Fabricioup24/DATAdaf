import React, { forwardRef } from 'react';

interface ContactSectionProps {
  curtainRef: React.RefObject<HTMLDivElement>;
  copyrightFooterRef: React.RefObject<HTMLDivElement>;
  handleReload: (e: React.MouseEvent) => void;
}

const ContactSection = forwardRef<HTMLDivElement, ContactSectionProps>(
  ({ curtainRef, copyrightFooterRef, handleReload }, ref) => {
    return (
      <section id="contact" ref={ref}>
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
    );
  }
);

ContactSection.displayName = 'ContactSection';

export default ContactSection;
