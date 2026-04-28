# Metodologia de geocodificacion para mesas serie 9

## Objetivo

Asignar coordenadas geograficas a los locales de votacion asociados a las 4703 mesas cuyo numero de mesa comienza con 9, manteniendo trazabilidad y una columna de confiabilidad para distinguir coordenadas precisas, medias, aproximadas y pendientes.

## Insumos usados

| Insumo | Uso |
| --- | --- |
| `cotejo_pdf_mesas_serie9_direcciones.csv` | Base de trabajo con 4703 mesas, geografia, local, direccion extraida del PDF y validacion contra el PDF. |
| `Mesas por estado de mesas.pdf` | Fuente de direcciones y descriptores de locales de votacion. |
| SIGMED/MINEDU | Fuente principal de coordenadas de instituciones educativas/locales escolares. |
| Google Geocoding/Places | Usado solo en pruebas exploratorias para evaluar precision; no fue la fuente principal de la base final. |

## Por que no se uso Google como fuente principal

Se hicieron pruebas con Google Geocoding y Places. Los resultados mostraron problemas importantes:

- Algunas consultas devolvian calles completas, no locales exactos.
- Varios resultados tenian `partial_match=True`.
- En zonas rurales, Google podia devolver una escuela cercana con codigo parecido, pero no el local correcto.
- Places podia devolver coincidencias en otra provincia o ciudad si el nombre era comun.

Por ese motivo, Google no fue usado para asignar masivamente coordenadas de alta precision. Se priorizo SIGMED/MINEDU porque devuelve registros educativos con campos estructurados y coordenadas asociadas a servicios/locales escolares.

## Flujo de trabajo

1. Se partio de la base de 4703 mesas serie 9.
2. Se cotejaron las mesas contra el PDF de estado de mesas para recuperar `direccion_pdf`, `descriptor_local_pdf`, `numero_local_pdf` y validaciones de local/estado.
3. Se agruparon las 4703 mesas por `numero_local`, obteniendo 1939 locales unicos.
4. Para cada local unico, se consulto SIGMED/MINEDU usando combinaciones de:
   - departamento, provincia y distrito para ubicar el `ubigeo`;
   - codigo o numero de institucion educativa cuando existia;
   - nombre del local;
   - descriptor del PDF;
   - centro poblado reportado en resultados ONPE.
5. Se evaluaron los candidatos devueltos por SIGMED.
6. Se selecciono el mejor candidato por local.
7. La coordenada del local seleccionado se asigno a todas las mesas asociadas a ese `numero_local`.
8. Se genero la columna `precision_coord` para indicar el nivel de confiabilidad.

## Criterios de busqueda en SIGMED

Para cada local se probaron variantes como:

- codigo de institucion + centro poblado;
- nombre limpio del local + centro poblado;
- descriptor del PDF + centro poblado;
- solo centro poblado;
- codigo o nombre sin centro poblado cuando las busquedas anteriores no encontraban resultado.

Tambien se aplicaron variantes de centro poblado para mejorar coincidencias, por ejemplo:

- eliminar prefijos como `VILLA` o `CCPP`;
- separar nombres compuestos por guion;
- aceptar diferencias menores de escritura, como `CHONZA` vs `CHOMZA` o `SANTA MARTHA` vs `SANTA MARTA`.

## Seleccion del mejor candidato

Cada candidato SIGMED fue evaluado con los siguientes criterios:

- existencia de `LATITUD_DEC` y `LONGITUD_DEC`;
- fuente de la coordenada, especialmente `MED-GPS`;
- coincidencia de codigo numerico del local o institucion educativa;
- coincidencia de centro poblado;
- coincidencia textual o difusa del nombre del local;
- ausencia de conflicto de codigo.

Cuando un candidato tenia coordenadas, codigo compatible y centro poblado compatible, se considero de alta confianza.

## Clasificacion de precision

La columna principal es `precision_coord`.

| Valor | Significado |
| --- | --- |
| `ALTA` | SIGMED encontro un candidato compatible por codigo/nombre y contexto geografico. En muchos casos la fuente es `MED-GPS`. |
| `MEDIA` | SIGMED encontro un candidato fuerte por codigo o nombre, pero existe alguna diferencia en centro poblado, direccion o denominacion. |
| `APROXIMADA` | No se confirma el local exacto, pero hay un punto GPS util del centro poblado o zona cercana. Sirve para visualizacion territorial, no para afirmar ubicacion exacta del local. |
| `REVISAR` | Existe candidato, pero la evidencia no alcanza para aceptarlo automaticamente. |
| `SIN_COORDENADA` | No se encontro una coordenada defendible bajo las reglas usadas. |

## Resultado final

Sobre 1939 locales unicos:

| precision_coord | Locales |
| --- | ---: |
| ALTA | 1614 |
| MEDIA | 122 |
| APROXIMADA | 125 |
| REVISAR | 10 |
| SIN_COORDENADA | 68 |

Sobre 4703 mesas:

| precision_coord | Mesas |
| --- | ---: |
| ALTA | 3846 |
| MEDIA | 372 |
| APROXIMADA | 318 |
| REVISAR | 26 |
| SIN_COORDENADA | 141 |

## Interpretacion para mapas

Para visualizacion cartografica:

- `ALTA`: usar como punto principal.
- `MEDIA`: usar, pero con color o icono que indique advertencia leve.
- `APROXIMADA`: usar solo como aproximacion territorial; no mezclar visualmente con puntos exactos.
- `REVISAR`: mostrar en capa de auditoria o dejar fuera del mapa principal.
- `SIN_COORDENADA`: no graficar como punto; listar en tabla de pendientes.

## Limitaciones

La geocodificacion no puede garantizar precision absoluta porque:

- algunos locales del PDF no aparecen con el mismo nombre en SIGMED;
- algunos locales de votacion no son instituciones educativas, por ejemplo casas comunales o tambos;
- algunas direcciones son `S/N` o descripciones de centro poblado;
- algunos centros poblados tienen variantes ortograficas;
- SIGMED puede no tener coordenadas para ciertos locales o servicios.

Por eso la base final conserva columnas de trazabilidad:

- `precision_coord`;
- `confianza_sigmed`;
- `sigmed_fuente`;
- `sigmed_nombre`;
- `sigmed_direccion`;
- `sigmed_centro_poblado`;
- `score_coord`;
- `motivo_precision`;
- `requiere_revision_coord`;
- `motivo_revision_coord`.

## Recomendacion para los pendientes

Los casos `SIN_COORDENADA` y `REVISAR` deben pasar a una segunda etapa de revision:

1. busqueda manual en SIGMED/Mapa de Escuelas;
2. busqueda con Google como respaldo;
3. revision visual del punto;
4. asignacion con una etiqueta separada, por ejemplo `APROXIMADA_GOOGLE` o `REVISAR_GOOGLE`, nunca como `ALTA` salvo confirmacion documental.
