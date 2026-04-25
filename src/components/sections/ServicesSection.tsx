import React from 'react';
import HeroAnimation from '../HeroAnimation';

export default function ServicesSection() {
  return (
    <>
      {/* ── Metodologías · Parte 1/2 ── */}
      <section id="services">
        <div className="services-bg-animation">
          <HeroAnimation showShadow={false} />
          <div className="animation-overlay-gradient"></div>
        </div>

        <div className="services-container">
          <div className="met-header">
            <h2 className="section-title">Metodologías</h2>
            <p className="section-subtitle">Herramientas analíticas de vanguardia para el rigor científico.</p>
          </div>

          <div className="metodologias-grid">
            <div className="metodologia-familia">
              <h3 className="metodologia-titulo">Diseño de Estudios e Inferencia Causal</h3>
              <ul className="metodologia-lista">
                <li>Diseños experimentales y cuasi-experimentales (Grupos de control, aleatorización y grupos intactos)</li>
                <li>Diseños observacionales y longitudinales (Transversales, trend, cohortes y panel)</li>
                <li>Diseños ex post facto y análisis causal-comparativo</li>
                <li>Análisis de series de tiempo interrumpidas (Evaluación de impacto)</li>
              </ul>
            </div>

            <div className="metodologia-familia">
              <h3 className="metodologia-titulo">Estadística Inferencial y Pruebas de Hipótesis</h3>
              <ul className="metodologia-lista">
                <li>Pruebas de comparación de medias (T de Student para muestras independientes y relacionadas, Z-test)</li>
                <li>Pruebas no paramétricas y de distribución libre (U de Mann-Whitney, Wilcoxon, Kruskal-Wallis)</li>
                <li>Análisis de varianza y covarianza (ANOVA)</li>
                <li>Pruebas de asociación, correlación y proporciones (Pearson, Spearman, Chi-cuadrado y Exacta de Fisher)</li>
              </ul>
            </div>

            <div className="metodologia-familia">
              <h3 className="metodologia-titulo">Modelos Lineales y Multivariados</h3>
              <ul className="metodologia-lista">
                <li>Modelos de regresión (Lineal, logística múltiple y Poisson)</li>
                <li>Reducción de dimensionalidad y variables latentes (PCA, Análisis Factorial Exploratorio y Confirmatorio)</li>
                <li>Modelado de Ecuaciones Estructurales (SEM)</li>
              </ul>
            </div>

            <div className="metodologia-familia">
              <h3 className="metodologia-titulo">Análisis de Series de Tiempo y Pronóstico</h3>
              <ul className="metodologia-lista">
                <li>Modelos autorregresivos y de medias móviles (ARIMA, SARIMA, ARIMAX)</li>
                <li>Suavizado exponencial y modelos aditivos de predicción (Prophet, Holt-Winters)</li>
                <li>Modelos de heterocedasticidad condicional para volatilidad (ARCH / GARCH)</li>
                <li>Vectores Autorregresivos (VAR) y análisis de cointegración</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Metodologías · Parte 2/2 ── */}
      <section id="services-2">
        <div className="services-bg-animation">
          <HeroAnimation showShadow={false} />
          <div className="animation-overlay-gradient"></div>
        </div>

        <div className="services-container services-container--continuation">
          <div className="metodologias-grid">
            <div className="metodologia-familia">
              <h3 className="metodologia-titulo">Aprendizaje Automático (Machine Learning)</h3>
              <ul className="metodologia-lista">
                <li>Algoritmos de clasificación y regresión avanzada (Random Forest, XGBoost, Máquinas de Vectores de Soporte - SVM)</li>
                <li>Métodos de agrupamiento o clustering (K-Means, DBSCAN, Clustering Jerárquico)</li>
                <li>Reducción de dimensionalidad no lineal (t-SNE, UMAP)</li>
              </ul>
            </div>

            <div className="metodologia-familia">
              <h3 className="metodologia-titulo">Análisis de Datos No Estructurados (Texto y Visión Computacional)</h3>
              <ul className="metodologia-lista">
                <li>Procesamiento de Lenguaje Natural (NLP), minería de texto y análisis de sentimiento</li>
                <li>Modelado de tópicos (Latent Dirichlet Allocation) y extracción de entidades</li>
                <li>Embeddings de texto para análisis semántico vectorial</li>
                <li>Visión artificial, detección de objetos en tiempo real (YOLO) y extracción cuantitativa de datos en video</li>
                <li>Segmentación semántica de imágenes y reconocimiento algorítmico de patrones visuales</li>
              </ul>
            </div>

            <div className="metodologia-familia">
              <h3 className="metodologia-titulo">Estadística Espacial y Análisis de Redes Complejas</h3>
              <ul className="metodologia-lista">
                <li>Geoestadística y autocorrelación espacial (I de Moran / LISA)</li>
                <li>Modelos de regresión geográficamente ponderada (GWR)</li>
                <li>Análisis de hotspots y estimación de densidad de Kernel</li>
                <li>Análisis de Redes Sociales y Complejas (SNA), métricas de centralidad e intermediación topológica</li>
              </ul>
            </div>

            <div className="metodologia-familia">
              <h3 className="metodologia-titulo">Minería de Datos y Análisis de Sentimiento</h3>
              <ul className="metodologia-lista">
                <li>Análisis de Sentimiento</li>
                <li>Minería de Datos</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
