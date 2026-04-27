import React from 'react';

/**
 * Props for the Navbar component
 */
interface NavbarProps {
  /** Whether the menu is currently open */
  menuOpen: boolean;
  /** Function to call when the menu toggle button is clicked */
  onMenuToggle: () => void;
  /** Function to call when the logo is clicked to scroll to top (on landing) */
  handleScrollTop?: (e: React.MouseEvent) => void;
  /** Whether the landing page is in the ready state (to handle animations) */
  pageReady?: boolean;
  /** Visual variant of the navbar */
  variant?: 'light' | 'dark';
}

/**
 * Navbar component shared across the site.
 * Handles the logo and the mobile menu toggle.
 * 
 * @param {NavbarProps} props - The component props
 * @returns {JSX.Element} The rendered Navbar
 */
const Navbar = ({ menuOpen, onMenuToggle, handleScrollTop, pageReady = true, variant = 'light' }: NavbarProps) => {
  const isDark = variant === 'dark';
  const textColor = isDark ? 'text-white' : 'text-[#121212]';
  const logoSrc = isDark ? '/graficos/datadafblanco.png' : '/graficos/datadafnegro.png';

  return (
    <header className={`${pageReady ? 'page-ready' : ''} ${isDark ? 'navbar-dark' : ''}`}>
      <div className="header-signature">
        <a
          href="/"
          className="signature-link"
          onClick={handleScrollTop}
        >
          <img
            src={logoSrc}
            alt="DATAdaf Logo - Consultoría de Ciencia de Datos y Metodología"
            className="header-logo"
            width={196}
            height={55}
            loading="eager"
          />
        </a>
      </div>

      <nav className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <ul className="flex gap-12 list-none m-0 p-0">
          <li>
            <a href="/" className={`${textColor} no-underline font-bold text-base transition-transform hover:scale-110 block uppercase tracking-widest`}>
              Inicio
            </a>
          </li>
          <li>
            <a href="/blog" className={`${textColor} no-underline font-bold text-base transition-transform hover:scale-110 block uppercase tracking-widest`}>
              Blog
            </a>
          </li>
        </ul>
      </nav>

      <button
        type="button"
        className={`menu-toggle ${menuOpen ? 'open' : ''} ${isDark ? '!bg-white/10 !border-white/10' : ''}`}
        onClick={onMenuToggle}
        aria-expanded={menuOpen}
        aria-controls="site-menu"
        aria-label={menuOpen ? 'Cerrar menu' : 'Abrir menu'}
      >
        <span className={isDark ? '!bg-white' : ''}></span>
        <span className={isDark ? '!bg-white' : ''}></span>
        <span className={isDark ? '!bg-white' : ''}></span>
      </button>
    </header>
  );
};

export default Navbar;
