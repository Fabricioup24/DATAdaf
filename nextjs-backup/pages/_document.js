import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        {/* Estilos críticos para ocultar scrollbar durante la carga inicial */}
        <style dangerouslySetInnerHTML={{
          __html: `
            html, body {
              overflow: hidden !important;
              scrollbar-width: none !important;
              -ms-overflow-style: none !important;
            }
            html::-webkit-scrollbar, body::-webkit-scrollbar {
              display: none !important;
              width: 0 !important;
            }
          `
        }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
