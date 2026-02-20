

# Portafolio Personal de Fabricio Urruchi

Este es el repositorio de mi portafolio personal, una web interactiva diseñada para mostrar mis habilidades en desarrollo frontend y presentar mis mejores trabajos de una manera moderna y elegante.


## 🧭 Brújula del Proyecto (Visión)

La intención de este proyecto es crear una experiencia digital que no solo funcione como un CV interactivo, sino que también refleje mi pasión por la estética, la funcionalidad y las microinteracciones.

* **Inspiración Principal:** El diseño se inspira en portafolios minimalistas y de alto impacto, como el de [Dennis Snellenberg](https://dennissnellenberg.com/), enfocándose en la tipografía, el espacio negativo y las animaciones fluidas.
* **Objetivo Principal:** Presentar mis proyectos de forma clara y atractiva, demostrando mis capacidades técnicas y mi sensibilidad para el diseño. El objetivo final es atraer a potenciales clientes o empleadores.
* **Sensación Deseada:** Quiero que el usuario sienta que está navegando por un espacio cuidado, profesional e innovador. La navegación debe ser intuitiva pero también sorprendente y agradable.

---

## ✨ Características Principales

* **Diseño Minimalista y Oscuro:** Una interfaz limpia que pone el foco en el contenido.
* **Animaciones con Scroll:** Elementos que aparecen y se mueven sutilmente a medida que el usuario navega.
* **Lista de Proyectos Interactiva:** Efecto hover que muestra una vista previa visual de cada proyecto.
* **Botones Magnéticos:** Microinteracción que mejora la experiencia de usuario en los llamados a la acción.
* **Totalmente Responsivo:** Perfecta visualización en dispositivos de escritorio, tablets y móviles.

---

## 🛠️ Tecnologías Utilizadas

Este proyecto está construido utilizando tecnologías web modernas y librerías de animación de alto rendimiento.

* **HTML5:** Para la estructura semántica del contenido.
* **CSS3:** Para el diseño, layout (Flexbox/Grid) y estilos visuales.
* **JavaScript (ES6+):** Para la interactividad y la manipulación del DOM.
* **Librerías Planeadas:**
    * [**GSAP (GreenSock Animation Platform):**](https://greensock.com/gsap/) Para crear animaciones complejas y de alto rendimiento.
    * [**Locomotive Scroll:**](https://locomotivemtl.github.io/locomotive-scroll/) Para implementar el "smooth scroll" y efectos parallax.

**Adicional:** No seran las unicas librerias ni herramientas que se utilizara, pues a lo largo del desarrollo propondré algunas adicionales.

---

## 📅 Historial de Desarrollo

### 24 de Enero de 2026

**Sección Hero - Imagen de Fondo**

Se implementó la imagen personal `Fabricio.webp` como fondo de la sección hero:

| Cambio | Descripción |
|--------|-------------|
| **Desktop** | Imagen como fondo completo que cubre toda la sección hero |
| **Móvil** | Imagen encapsulada en círculo de 220x220px, centrada |
| **Marquee** | Ajustado z-index para que el texto "Fabricio Urruchi -" esté visible sobre la imagen |
| **Overflow** | Corregido overflow horizontal que causaba scroll en móvil |

**Archivos modificados:**
- `pages/index.js` - Agregado componente `hero-background`
- `styles/globals.css` - Estilos para fondo del hero y responsive
- `components/Marquee.module.css` - Ajuste de z-index
- `public/graficos/Fabricio.webp` - Imagen copiada al directorio público

**Pendiente:**
- [ ] Reorganizar posición de elementos en versión móvil (cápsula, descripción, LocationTag)

---

### Mejoras de Navegación y Animaciones "About Me"

Se refinó la experiencia de usuario en la navegación y la presentación de la sección "Sobre Mí":

| Área | Cambio | Descripción |
|------|--------|-------------|
| **About Me** | **Animación "Noble"** | Implementación de efecto "scroll reveal" vertical escalonado para los textos, reemplazando la entrada lateral. |
| **About Me** | **Timing & FOUC** | Corrección de parpadeos y pantallas blancas al abrir la cortina (ajuste de tiempos: carga 900ms, animación 1200ms). |
| **About Me** | **Enlace Directo** | Configuración de los botones "Sobre Mí" (Header y Menú) para abrir directamente el overlay en lugar de hacer scroll. |
| **Navegación** | **Smooth Scroll** | Integración de `locomotive-scroll` en los enlaces de "Proyectos" y "Contacto" para evitar saltos bruscos. |
| **Navegación** | **Offset** | Ajuste de margen superior (80px) al navegar a "Proyectos" para evitar que el título quede cortado. |

**Archivos modificados:**
- `pages/index.js` - Lógica de navegación `handleScrollTo` y triggers del overlay.
- `components/AboutMePage.js` - Refactorización completa de animación con GSAP y lógica de montaje.
---

### 11 de Febrero de 2026

**Hero Dinámico y Refinamiento de Experiencia (UX)**

Se elevó la calidad visual del portafolio mediante la implementación de animaciones generativas y el pulido de las micro-interacciones de transición.

| Área | Cambio | Descripción |
|------|--------|-------------|
| **Hero** | **Animación "Neural"** | Reemplazo de imagen estática por una animación interactiva en `Canvas` de una red de datos ramificada (basada en referencia técnica). |
| **Metodologías** | **Transición de Salida** | Optimización total de la "persiana" de salida para eliminar saltos de scroll y asegurar un posicionamiento perfecto al regresar al contenido principal. |
| **Interacción** | **Burbuja Latente** | Implementación de un efecto de pulso de color azul cian en la burbuja de Metodologías con desvanecimiento armonioso al hacer hover. |
| **UX Global** | **App-like Feel** | Deshabilitación de la selección de texto en todo el sitio para reforzar la sensación de aplicación premium y evitar accidentes visuales. |

**Archivos modificados:**
- `components/HeroAnimation.js` - Creación del motor de animación generativa para el Hero.
- `pages/index.js` - Integración de `HeroAnimation` y refinamiento de callbacks de scroll.
- `components/AboutMePage.js` - Ajuste de tiempos de buffer (2.2s) para estabilidad de salida.
- `styles/globals.css` - Estilos de pulso (`bubblePulse`), deshabilitación de `user-select` y correcciones de saltos visuales.

---
### 13-14 de Febrero de 2026

**Optimización de Componentes Visuales y Testimonios Reales**

Se consolidó la experiencia de usuario centrada en la visualización de datos y se implementaron testimonios reales, asegurando una respuesta robusta en dispositivos móviles mediante el uso de Portals y refinamientos de layout.

| Área | Cambio | Descripción |
|------|--------|-------------|
| **Lightbox** | **Portals & Centering** | Implementación de `React Portals` para renderizar el lightbox directamente en `document.body`, aislando las imágenes ampliadas de las transformaciones 3D del carrusel para garantizar un centrado absoluto. |
| **Lightbox** | **Scroll Control** | Lógica de bloqueo de scroll (`overflow: hidden`) y pausa automática de `Locomotive Scroll` al abrir gráficos, restaurándose al cerrar la ventana. |
| **Carrusel** | **Separación Móvil** | Aumento del radio del cilindro en móviles (700px) para evitar traslapes entre imágenes, asegurando una navegación visual clara. |
| **Testimonios** | **Contenido Real** | Actualización del primer testimonio con el perfil de **Ivan D.** (Doctor en Negocios Globales) e integración de un sistema de calificación de 5 estrellas doradas. |
| **UX/UI** | **Hero Cleanup** | Eliminación del Marquee superior para un diseño más limpio y ajuste de posición del tag "Located in Peru" (65% Desktop / 85% Mobile). |
| **Responsive** | **Title Consistency** | Unificación de tamaños de títulos de sección a 2rem en móviles y reducción de brechas de espacio innecesarias. |

**Archivos modificados:**
- `components/CylinderCarousel.js` - Implementación de Portals, estados de montado y lógica de centrado inline.
- `components/CylinderCarousel.module.css` - Optimización de escala móvil y profundidad de perspectiva.
- `pages/index.js` - Actualización de sección de testimonios, eliminación de Marquee y refinamiento de scroll.
- `styles/globals.css` - Unificación de tipografías móviles, estilos de estrellas y ajustes de posicionamiento.
- `components/LocationTag.module.css` - Reubicación vertical para despejar el centro del Hero.

---
### 18 de Febrero de 2026

**Refinamiento de Secciones, Jerarquía Tipográfica y Estabilidad Visual**

Se completó una fase intensiva de pulido estético y funcional, enfocada en la consistencia de diseño entre las secciones de Bases de Datos, Gráficos y Testimonios, asegurando un encuadre perfecto y una lectura fluida.

| Área | Cambio | Descripción |
|------|--------|-------------|
| **Gráficos** | **Armonía de Contenido** | Rediseño de la jerarquía de texto con un pre-subtítulo elegante (1.25rem gris) y un mensaje de impacto con efecto de color líquido ("Supera la rigidez"). |
| **Gráficos** | **Corrección Técnica** | Eliminación de recortes en letras con trazos descendentes (como la 'g') mediante el ajuste de `line-height` a 1.4 y la adición de padding vertical de seguridad. |
| **Carrusel** | **Glide Elegante** | Reducción del 66% en la velocidad de rotación automática (de 0.3 a 0.1) para una experiencia de visualización contemplativa y premium. |
| **Bases de Datos** | **Equilibrio Proporcional** | Descenso estratégico del título y logos mientras se mantiene el mensaje central ("Web scraping") fijo, mejorando el flujo visual del scroll. |
| **Testimonios** | **Unificación de Marca** | Estandarización del tamaño de título a 3rem y ajuste de posición (8vh padding-top) para un encuadre centrado y profesional. |
| **UI/UX** | **Consistencia Global** | Sincronización de márgenes y espacios entre secciones para evitar saltos visuales y reforzar la identidad de marca tecnológica. |

**Archivos modificados:**
- `styles/globals.css` - Centralización de estilos para títulos, ajustes de márgenes proporcionales y corrección de clipping.
- `pages/index.js` - Reestructuración de la sección de Gráficos (Visualización) y Testimonios.
- `components/CylinderCarousel.js` - Optimización de la inercia y velocidad de rotación.
- `components/DataOrderAnimation.js` - Ajuste de paleta de colores para alineación con el branding (Deep Blue).

---
