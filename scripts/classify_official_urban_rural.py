import csv
import math
from pathlib import Path

import geopandas as gpd
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
PDFS_PATH = ROOT / "public" / "pdfs"

BASE_PATH = PDFS_PATH / "01_base_4703_mesas_serie9_con_coordenadas.csv"
URBAN_GEOJSON_PATH = PDFS_PATH / "inei_casco_urbano_full.geojson"
OUTPUT_PATH = PDFS_PATH / "01_base_4703_mesas_serie9_clasificacion_oficial_urbano_rural.csv"
SUMMARY_PATH = PDFS_PATH / "resumen_clasificacion_oficial_urbano_rural.csv"
LOCALES_PATH = PDFS_PATH / "serie9_locales_clasificacion_oficial_urbano_rural.csv"


def main():
    base = pd.read_csv(BASE_PATH)
    urban = gpd.read_file(URBAN_GEOJSON_PATH)

    with_coords = base[base["lat"].notna() & base["lng"].notna()].copy()
    locales = with_coords.sort_values("numero_local").drop_duplicates("numero_local").copy()

    locales_gdf = gpd.GeoDataFrame(
        locales,
        geometry=gpd.points_from_xy(locales["lng"], locales["lat"]),
        crs="EPSG:4326",
    )

    urban = urban.to_crs("EPSG:4326")
    urban = urban[["ubigeo", "nombdist", "descrpcion", "geometry"]].copy()

    locales_metric = locales_gdf.to_crs("EPSG:3857")
    urban_metric = urban.to_crs("EPSG:3857").copy()
    urban_metric["casco_boundary_geom"] = urban_metric.geometry.boundary
    urban_metric["casco_area_m2"] = urban_metric.geometry.area

    joined = gpd.sjoin(locales_metric, urban_metric, how="left", predicate="within")
    joined["clasificacion_oficial_urbano_rural"] = joined["ubigeo"].notna().map(
        {True: "urbano", False: "rural"}
    )
    joined["fuente_clasificacion_oficial"] = joined["ubigeo"].notna().map(
        {True: "INEI casco urbano WFS", False: "Fuera de casco urbano INEI"}
    )
    joined["codigo_casco_urbano_inei"] = joined["ubigeo"].fillna("")
    joined["distrito_casco_urbano_inei"] = joined["nombdist"].fillna("")
    joined["descripcion_casco_urbano_inei"] = joined["descrpcion"].fillna("")

    def compute_urban_depth(row):
        if pd.isna(row["ubigeo"]):
            return pd.Series(
                {
                    "distancia_borde_casco_urbano_m": pd.NA,
                    "profundidad_relativa_casco_urbano": pd.NA,
                    "subclasificacion_urbana_oficial": "",
                }
            )

        distance_m = float(row.geometry.distance(row["casco_boundary_geom"]))
        area_m2 = float(row["casco_area_m2"])
        eq_radius_m = math.sqrt(area_m2 / math.pi) if area_m2 > 0 else pd.NA
        relative_depth = distance_m / eq_radius_m if eq_radius_m and eq_radius_m > 0 else pd.NA

        if pd.notna(relative_depth) and relative_depth >= 0.15 and distance_m >= 90:
            subclass = "urbano_central"
        else:
            subclass = "urbano_periferico"

        return pd.Series(
            {
                "distancia_borde_casco_urbano_m": round(distance_m, 2),
                "profundidad_relativa_casco_urbano": round(float(relative_depth), 4)
                if pd.notna(relative_depth)
                else pd.NA,
                "subclasificacion_urbana_oficial": subclass,
            }
        )

    joined[
        [
            "distancia_borde_casco_urbano_m",
            "profundidad_relativa_casco_urbano",
            "subclasificacion_urbana_oficial",
        ]
    ] = joined.apply(compute_urban_depth, axis=1)

    local_cols = [
        "numero_local",
        "region",
        "provincia",
        "distrito",
        "lat",
        "lng",
        "clasificacion_oficial_urbano_rural",
        "fuente_clasificacion_oficial",
        "codigo_casco_urbano_inei",
        "distrito_casco_urbano_inei",
        "descripcion_casco_urbano_inei",
        "distancia_borde_casco_urbano_m",
        "profundidad_relativa_casco_urbano",
        "subclasificacion_urbana_oficial",
    ]
    local_rows = joined[local_cols].copy()
    LOCALES_PATH.parent.mkdir(parents=True, exist_ok=True)
    local_rows.to_csv(LOCALES_PATH, index=False, encoding="utf-8-sig")

    local_map = (
        local_rows.set_index("numero_local")[
            [
                "clasificacion_oficial_urbano_rural",
                "fuente_clasificacion_oficial",
                "codigo_casco_urbano_inei",
                "distrito_casco_urbano_inei",
                "descripcion_casco_urbano_inei",
                "distancia_borde_casco_urbano_m",
                "profundidad_relativa_casco_urbano",
                "subclasificacion_urbana_oficial",
            ]
        ]
        .to_dict(orient="index")
    )

    enriched_rows = []
    for row in base.to_dict(orient="records"):
        payload = dict(row)
        info = local_map.get(row["numero_local"])
        if info:
            payload.update(info)
        else:
            payload["clasificacion_oficial_urbano_rural"] = ""
            payload["fuente_clasificacion_oficial"] = "Sin coordenadas"
            payload["codigo_casco_urbano_inei"] = ""
            payload["distrito_casco_urbano_inei"] = ""
            payload["descripcion_casco_urbano_inei"] = ""
            payload["distancia_borde_casco_urbano_m"] = pd.NA
            payload["profundidad_relativa_casco_urbano"] = pd.NA
            payload["subclasificacion_urbana_oficial"] = ""
        enriched_rows.append(payload)

    pd.DataFrame(enriched_rows).to_csv(OUTPUT_PATH, index=False, encoding="utf-8-sig")

    summary = (
        pd.DataFrame(enriched_rows)["clasificacion_oficial_urbano_rural"]
        .fillna("")
        .replace({"": "sin_coordenadas"})
        .value_counts()
        .rename_axis("categoria")
        .reset_index(name="mesas")
    )
    summary.to_csv(SUMMARY_PATH, index=False, encoding="utf-8-sig")

    print(f"locales_total={len(local_rows)}")
    print(local_rows["clasificacion_oficial_urbano_rural"].value_counts().to_string())
    print(local_rows["subclasificacion_urbana_oficial"].replace({"": pd.NA}).value_counts(dropna=True).to_string())
    print(summary.to_string(index=False))


if __name__ == "__main__":
    main()
