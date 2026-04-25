import { useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Articles from '../components/Articles';

export default function Politica() {
  const scrollRef = useRef(null);

  useEffect(() => {
    const LocomotiveScroll = require('locomotive-scroll').default;
    const scroll = new LocomotiveScroll({
      el: scrollRef.current,
      smooth: true,
    });

    return () => {
      scroll.destroy();
    };
  }, []);

  return (
    <>
      <Head>
        <title>Política - Fabricio Urruchi</title>
        <meta name="description" content="Artículos de opinión política por Fabricio Urruchi" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div id="main-wrapper" ref={scrollRef} data-scroll-container>
        <header>
          <div className="header-signature">
            <span className="signature-text">
              <span data-text="© code by Fabricio" data-hover="© Fabricio Urruchi"></span>
            </span>
          </div>
          <nav>
            <ul>
              <li>
                <Link href="/">Inicio</Link>
              </li>
              <li>
                <Link href="/#about">Sobre mí</Link>
              </li>
              <li>
                <Link href="/#projects">Proyectos</Link>
              </li>
              <li>
                <Link href="/politica">Política</Link>
              </li>
              <li>
                <Link href="/#contact">Contacto</Link>
              </li>
            </ul>
          </nav>
        </header>

        <main>
          <section id="politica-hero" style={{ paddingTop: '8rem' }}>
            <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>Política</h1>
            <p style={{ fontSize: '1.25rem', color: '#a0a0a0', maxWidth: '800px' }}>
              Artículos de opinión y análisis político desde la perspectiva de un politólogo.
            </p>
          </section>

          <section id="articles-list">
            <Articles />
          </section>
        </main>

        <footer>
          <p>&copy; 2025 Fabricio Urruchi</p>
        </footer>
      </div>
    </>
  );
}
