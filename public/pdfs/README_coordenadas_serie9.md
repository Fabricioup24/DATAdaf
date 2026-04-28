# Entrega de coordenadas para mesas serie 9

## Alcance

Esta carpeta contiene la base final de las 4703 mesas cuyo numero de mesa comienza con 9, enriquecida con geografia, direccion extraida del PDF, resultados electorales y coordenadas cuando fue posible asignarlas.

La fuente principal de coordenadas fue SIGMED/MINEDU, porque ofrece coordenadas de locales/servicios educativos y en muchos casos la fuente reportada es MED-GPS. Google se uso solo para pruebas previas; no es la fuente principal de esta entrega.

## Archivos incluidos

| Archivo | Contenido |
| --- | --- |
| 01_base_4703_mesas_serie9_con_coordenadas.csv | Copia completa de las 4703 mesas con columnas de coordenadas y confiabilidad. |
| 02_mesas_sin_coordenadas_141.csv | Extraccion de las 141 mesas que quedaron sin latitud/longitud. |
| 02_mesas_sin_coordenadas_141.xlsx | Excel con resumen, las 141 mesas sin coordenadas y los 68 locales que las explican. |
| 03_locales_sin_coordenadas_68.csv | Resumen por local de votacion sin coordenadas. |
| README_coordenadas_serie9.md | Este documento explicativo. |

## Resumen de cobertura

- Mesas totales serie 9: 4703
- Locales unicos: 1939
- Mesas con latitud/longitud: 4562
- Mesas sin coordenada: 141
- Locales sin coordenada: 68

## Mesas por nivel de precision

| precision_coord | Mesas |
| --- | ---: |
| ALTA | 3846 |
| APROXIMADA | 318 |
| MEDIA | 372 |
| REVISAR | 26 |
| SIN_COORDENADA | 141 |

## Locales por nivel de precision

| precision_coord | Locales |
| --- | ---: |
| ALTA | 1614 |
| APROXIMADA | 125 |
| MEDIA | 122 |
| REVISAR | 10 |
| SIN_COORDENADA | 68 |

## Definicion de la columna precision_coord

- ALTA: SIGMED encontro un local o servicio educativo compatible por codigo/nombre y contexto geografico; usualmente incluye coordenadas MED-GPS.
- MEDIA: SIGMED encontro un candidato fuerte por codigo o nombre, pero existe alguna diferencia de centro poblado, direccion o denominacion.
- APROXIMADA: no se confirma el local exacto, pero existe un punto GPS util del centro poblado o zona cercana.
- REVISAR: hay candidato, pero la evidencia no alcanza para usarlo sin revision manual.
- SIN_COORDENADA: no se encontro una coordenada defendible con SIGMED bajo las reglas usadas.

## Que significan las 141 mesas sin coordenada

Las 141 mesas sin coordenada no significan que la mesa o el local no existan. Significan que no se obtuvo una coincidencia suficientemente defendible en SIGMED/MINEDU para asignar lat y lng sin riesgo de ubicar el punto equivocado.

Estas 141 mesas corresponden a 68 locales de votacion. La mayoria son locales rurales, centros poblados, casas comunales, tambos o instituciones con denominaciones que no aparecieron en SIGMED con coordenadas recuperables bajo las consultas realizadas.

## Locales sin coordenada por region

| Region | Locales sin coordenada |
| --- | ---: |
| ANCASH | 8 |
| AYACUCHO | 8 |
| PUNO | 8 |
| HUANUCO | 7 |
| APURIMAC | 6 |
| JUNIN | 6 |
| CAJAMARCA | 5 |
| PIURA | 4 |
| CUSCO | 4 |
| LORETO | 2 |
| HUANCAVELICA | 2 |
| SAN MARTIN | 2 |
| AMAZONAS | 2 |
| UCAYALI | 1 |
| AREQUIPA | 1 |
| LIMA | 1 |
| ICA | 1 |

## Locales sin coordenada con mas mesas

| Mesas | Numero local | Local | Centro poblado | Distrito | Provincia | Region |
| ---: | --- | --- | --- | --- | --- | --- |
| 7 | 2951 | IE 41 FE Y ALEGRIA CALASANZ | VIRGEN DEL CARMEN LA ERA ÑAÑA | LURIGANCHO | LIMA | LIMA |
| 5 | 7339 | IE 0740 SAN JUAN DE TALLIQUIHUI | SAN JUAN DE TALLIQUIHUI | SANTA ROSA | EL DORADO | SAN MARTIN |
| 5 | 55354 | LOCAL MUNICIPAL DE CHOQUEPATA | CHOQUEPATA | OROPESA | QUISPICANCHI | CUSCO |
| 5 | 1081 | IE GRAN MARISCAL LUIS JOSE DE ORBEGOSO | SAN MIGUEL DE ALGAMARCA | CACHACHI | CAJABAMBA | CAJAMARCA |
| 4 | 51967 | IE NUESTRO SEÑOR DE LOS MILAGROS | AMBATO TAMBORAPA | BELLAVISTA | JAEN | CAJAMARCA |
| 4 | 50219 | IE CAÑICUTO | VILLA HERMOSA DE CAÑICUTO | SAN ANTON | AZANGARO | PUNO |
| 4 | 0111 | IE 16714 SUWIKAI TSAKIM MIYAN | PAANTAM | NIEVA | CONDORCANQUI | AMAZONAS |
| 4 | 51440 | IE JOSE OLAYA - PUTAQA | PUTACCA | VINCHOS | HUAMANGA | AYACUCHO |
| 3 | 7184 | IE GRAL JUAN VELASCO ALVARADO | LOS CANIZALES | LA UNION | PIURA | PIURA |
| 3 | 50217 | IE 14100 | LA TORTUGA | VICE | SECHURA | PIURA |
| 3 | 54961 | IES AGROINDUSTRIAL YACANGO | KANCCORA YACANGO | ILAVE | EL COLLAO | PUNO |
| 3 | 6868 | IE SEÑOR CAUTIVO | VALLE NOR PACIFICO TUNAS | HUARMACA | HUANCABAMBA | PIURA |
| 3 | 54935 | IE RICARDO PALMA - COLEGIO INDUSTRIAL | CHUPARO | ANCO HUALLO | CHINCHEROS | APURIMAC |
| 3 | 52615 | IE TUÑAD | TUÑAD | SAN BERNARDINO | SAN PABLO | CAJAMARCA |
| 3 | 55119 | IE HUAYNA CCAPAC - HUATTA GRANDE | HUAYNA CCAPAC DE HUATTA GRANDE | HUANCARANI | PAUCARTAMBO | CUSCO |

## Criterio para mapa

Para representar visualmente el mapa se recomienda colorear por precision_coord:

- ALTA: marcador principal, ubicacion confiable.
- MEDIA: marcador util, con advertencia de diferencia menor.
- APROXIMADA: marcador diferenciado; representa zona o centro poblado, no necesariamente local exacto.
- REVISAR: mostrar si se desea auditoria, no usar como punto definitivo.
- SIN_COORDENADA: no graficar como punto; listar en panel o tabla de pendientes.

## Siguiente paso recomendado

Para las 141 mesas sin coordenada, hacer una segunda pasada especifica con Google y/o revision manual, pero cualquier resultado debe etiquetarse como APROXIMADA_GOOGLE o REVISAR_GOOGLE, no como precision alta.
