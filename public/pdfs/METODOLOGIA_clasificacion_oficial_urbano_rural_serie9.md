# Metodologia de clasificacion oficial urbano/rural para mesas serie 9

## Objetivo

Clasificar las mesas de la base serie 9 en `urbano` o `rural` usando una fuente cartografica oficial y un criterio espacial reproducible. Adicionalmente, para los casos `urbano`, generar una segunda columna con la subclasificacion `urbano_central` o `urbano_periferico`.

## Archivos generados

Archivo principal:

- `01_base_4703_mesas_serie9_clasificacion_oficial_urbano_rural.csv`

Archivos complementarios:

- `serie9_locales_clasificacion_oficial_urbano_rural.csv`
- `resumen_clasificacion_oficial_urbano_rural.csv`

## Fuente oficial usada

Se uso la capa oficial `Casco urbano` del geoportal del INEI.

Portal:

- `https://ide.inei.gob.pe/`

Capa identificada:

- `Interoperabilidad:ig_casco_urbano`

Servicio WFS usado:

- `https://geoespacial.inei.gob.pe/geoserver/Interoperabilidad/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Interoperabilidad:ig_casco_urbano&outputFormat=application/json`

La capa descargada devolvio 1884 poligonos urbanos.

## Principio metodologico

La clasificacion principal no se hizo por distrito ni por heuristicas de Google. Se hizo por ubicacion exacta del punto respecto de la geometria oficial del INEI.

Regla principal:

- si la coordenada cae dentro de un poligono de `casco urbano`, la mesa se clasifica como `urbano`
- si la coordenada cae fuera de todos los poligonos de `casco urbano`, la mesa se clasifica como `rural`

Esto corresponde a un cruce espacial `point-in-polygon`.

## Insumos usados

### 1. Base de mesas serie 9 con coordenadas

Archivo:

- `01_base_4703_mesas_serie9_con_coordenadas.csv`

Campos relevantes:

- `numero_mesa`
- `numero_local`
- `region`
- `provincia`
- `distrito`
- `lat`
- `lng`

### 2. Capa oficial de casco urbano del INEI

Archivo descargado:

- `inei_casco_urbano_full.geojson`

Campos relevantes observados:

- `ubigeo`
- `nombdist`
- `descrpcion`
- `geometry`

## Procedimiento

### Paso 1. Base de entrada

Se partio de la base serie 9 con 4703 mesas.

Distribucion inicial:

- 4562 mesas con coordenadas
- 141 mesas sin coordenadas

### Paso 2. Reduccion a local unico

La clasificacion se aplico primero a `numero_local` unico porque varias mesas comparten el mismo local y el mismo punto.

Resultado:

- 1871 locales unicos con coordenadas

Luego la clasificacion del local se propago a todas las mesas del mismo `numero_local`.

### Paso 3. Cruce espacial oficial

Para cada local con coordenadas se verifico si el punto cae dentro de algun poligono de `casco urbano`.

Regla:

- `within = True` -> `urbano`
- `within = False` -> `rural`

### Paso 4. Propagacion a nivel mesa

La clasificacion del local unico se traslado a todas las mesas asociadas.

## Columnas generadas

### Columna principal

- `clasificacion_oficial_urbano_rural`

Valores posibles:

- `urbano`
- `rural`
- vacio cuando no existe coordenada

### Columnas de trazabilidad

- `fuente_clasificacion_oficial`
- `codigo_casco_urbano_inei`
- `distrito_casco_urbano_inei`
- `descripcion_casco_urbano_inei`

Interpretacion:

- si el punto cae dentro de un casco urbano, se registra el identificador y el distrito del poligono INEI
- si el punto cae fuera, la fuente queda como `Fuera de casco urbano INEI`
- si no hay coordenada, la fuente queda como `Sin coordenadas`

## Resultados de la clasificacion principal

### A nivel mesa

- `urbano`: 1673 mesas
- `rural`: 2889 mesas
- `sin_coordenadas`: 141 mesas

### A nivel local unico

- `urbano`: 519 locales
- `rural`: 1352 locales

## Segunda columna: subclasificacion urbana

Ademas de la clasificacion principal, se creo una segunda columna solo para los casos urbanos:

- `subclasificacion_urbana_oficial`

Valores:

- `urbano_central`
- `urbano_periferico`
- vacio para los casos `rural`

### Logica de esta segunda columna

Una vez que un punto ya fue clasificado como `urbano`, se midio que tan adentro del poligono urbano cae.

Se calcularon dos medidas:

- `distancia_borde_casco_urbano_m`
- `profundidad_relativa_casco_urbano`

#### `distancia_borde_casco_urbano_m`

Es la distancia en metros entre el punto y el borde del poligono de casco urbano al que pertenece.

Interpretacion:

- valor bajo: el punto esta cerca del borde del casco urbano
- valor alto: el punto esta mas metido dentro del casco urbano

#### `profundidad_relativa_casco_urbano`

Es una normalizacion de la distancia al borde segun el tamaño del poligono urbano, para no tratar igual a una ciudad grande y a un centro urbano pequeno.

### Regla usada

Solo para los puntos `urbano`:

- `urbano_central` si:
  - `distancia_borde_casco_urbano_m >= 90`
  - y `profundidad_relativa_casco_urbano >= 0.15`

- `urbano_periferico` en los demas casos urbanos

Para los puntos `rural`, la columna queda vacia.

## Resultados de la segunda columna

### A nivel mesa

- `urbano_central`: 507 mesas
- `urbano_periferico`: 1166 mesas

### A nivel local unico urbano

- `urbano_central`: 145 locales
- `urbano_periferico`: 374 locales

## Interpretacion correcta

La variable `clasificacion_oficial_urbano_rural` significa:

- `urbano`: la coordenada cae dentro de un casco urbano oficial del INEI
- `rural`: la coordenada cae fuera de los cascos urbanos oficiales del INEI

La variable `subclasificacion_urbana_oficial` significa:

- `urbano_central`: el punto urbano esta mas metido dentro del casco urbano
- `urbano_periferico`: el punto urbano esta mas proximo al borde del casco urbano

## Recomendacion de uso en mapas

### Filtro principal

Usar:

- `clasificacion_oficial_urbano_rural`

con dos categorias:

- `urbano`
- `rural`

### Filtro secundario

Usar:

- `subclasificacion_urbana_oficial`

solo dentro del subconjunto `urbano`:

- `urbano_central`
- `urbano_periferico`

## Ventajas de esta metodologia

- usa una fuente oficial del INEI
- clasifica el punto real y no el promedio del distrito
- es reproducible
- permite un filtro binario `urbano/rural` defendible
- separa la subclasificacion urbana en una segunda columna, como variable adicional y no como reemplazo de la principal

## Limitaciones

### 1. Depende de la calidad de la coordenada

Si la coordenada del local esta desplazada o es aproximada, la mesa podria caer fuera del casco urbano aunque operativamente se asocie a un entorno urbano.

### 2. Depende de la capa disponible

La clasificacion refleja el `casco urbano` publicado por el INEI. No implica que todo el exterior sea aislamiento extremo; solo significa que el punto esta fuera del poligono urbano oficial disponible.

### 3. No clasifica los casos sin coordenadas

Las 141 mesas sin `lat/lng` quedan sin clasificacion por esta metodologia.

## Script usado

Script principal:

- `scripts/classify_official_urban_rural.py`

Este script:

- lee la base serie 9 con coordenadas
- usa la capa vectorial de casco urbano del INEI
- hace el cruce espacial oficial
- genera la columna principal `clasificacion_oficial_urbano_rural`
- calcula la segunda columna `subclasificacion_urbana_oficial`
- exporta los CSV finales

## Conclusiones

1. La clasificacion principal de la base serie 9 debe apoyarse en la capa oficial `Casco urbano` del INEI.
2. La columna principal correcta para el mapa es `clasificacion_oficial_urbano_rural`.
3. La segunda columna `subclasificacion_urbana_oficial` solo aplica a los casos urbanos y permite distinguir `urbano_central` de `urbano_periferico`.
4. Las mesas sin coordenadas requieren una estrategia aparte si se desea clasificarlas territorialmente.
