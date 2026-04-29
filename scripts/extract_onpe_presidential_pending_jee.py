from __future__ import annotations

import argparse
import concurrent.futures
import csv
import json
import re
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path


BASE_URL = "https://resultadoelectoral.onpe.gob.pe/presentacion-backend"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"
)
REQUEST_HEADERS = {
    "sec-ch-ua-platform": '"Windows"',
    "Referer": "https://resultadoelectoral.onpe.gob.pe/main/actas",
    "User-Agent": USER_AGENT,
    "Accept": "*/*",
    "sec-ch-ua": '"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
    "Content-Type": "application/json",
    "sec-ch-ua-mobile": "?0",
    "Accept-Language": "es-419,es;q=0.9",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "priority": "u=1, i",
}
PRESIDENTIAL_ELECTION_ID = 10
PRESIDENTIAL_PREFIX = "presidencial"
TOTALES_ESPECIALES = {
    "VOTOS EN BLANCO": "votos_blanco",
    "VOTOS NULOS": "votos_nulos",
    "VOTOS IMPUGNADOS": "votos_impugnados",
}
BASE_COLUMNS = [
    "ambito",
    "region",
    "provincia",
    "distrito",
    "numero_local",
    "nombre_local",
    "estado_mesa_pdf",
    "numero_mesa",
]


def normalize_text(value: str) -> str:
    return (
        unicodedata.normalize("NFD", value or "")
        .encode("ascii", "ignore")
        .decode("ascii")
        .strip()
        .lower()
    )


def slugify(value: str) -> str:
    ascii_text = normalize_text(value)
    ascii_text = re.sub(r"[^a-z0-9]+", "_", ascii_text)
    return ascii_text.strip("_")


def fetch_json(url: str, pause: float = 0.0, retries: int = 3) -> dict:
    last_error: Exception | None = None

    for attempt in range(1, retries + 1):
        request = urllib.request.Request(url, headers=REQUEST_HEADERS)
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                body = response.read()
                content_type = response.headers.get("Content-Type", "")

            if "json" not in content_type.lower():
                sample = body[:200].decode("utf-8", errors="replace").replace("\n", " ")
                raise ValueError(f"ONPE devolvio {content_type}, no JSON: {sample}")

            payload = json.loads(body.decode("utf-8"))
            if pause:
                time.sleep(pause)
            return payload
        except (
            json.JSONDecodeError,
            urllib.error.HTTPError,
            urllib.error.URLError,
            TimeoutError,
            ValueError,
        ) as exc:
            last_error = exc
            if attempt < retries:
                time.sleep(1.5 * attempt)
                continue
            raise

    if pause:
        time.sleep(pause)
    raise RuntimeError(f"No se pudo obtener JSON desde ONPE: {last_error}")


def buscar_mesa(codigo_mesa: str, pause: float) -> list[dict]:
    query = urllib.parse.urlencode({"codigoMesa": codigo_mesa})
    url = f"{BASE_URL}/actas/buscar/mesa?{query}"
    payload = fetch_json(url, pause=pause)
    return payload.get("data") or []


def detalle_acta(acta_id: int, pause: float) -> dict:
    url = f"{BASE_URL}/actas/{acta_id}"
    payload = fetch_json(url, pause=pause)
    return payload.get("data") or {}


def filter_pending_presidential_rows(rows: list[dict]) -> list[dict]:
    selected: list[dict] = []
    for row in rows:
        status = normalize_text(row.get("presidencial_estado_acta", ""))
        mesa = (row.get("numero_mesa") or "").strip()
        if status == "para envio al jee" and mesa:
            selected.append({column: row.get(column, "") for column in BASE_COLUMNS})
    return selected


def normalize_wide_row(base_row: dict, detalle: dict) -> dict:
    row = {column: base_row.get(column, "") for column in BASE_COLUMNS}
    row[f"{PRESIDENTIAL_PREFIX}_estado_acta"] = detalle.get("descripcionEstadoActa", "")
    row[f"{PRESIDENTIAL_PREFIX}_electores_habiles"] = detalle.get("totalElectoresHabiles", "")
    row[f"{PRESIDENTIAL_PREFIX}_votos_emitidos"] = detalle.get("totalVotosEmitidos", "")
    row[f"{PRESIDENTIAL_PREFIX}_votos_validos"] = detalle.get("totalVotosValidos", "")
    row[f"{PRESIDENTIAL_PREFIX}_participacion_pct"] = detalle.get(
        "porcentajeParticipacionCiudadana", ""
    )
    row[f"{PRESIDENTIAL_PREFIX}_centro_poblado"] = detalle.get("centroPoblado", "")
    row[f"{PRESIDENTIAL_PREFIX}_local_web"] = detalle.get("nombreLocalVotacion", "")

    for item in detalle.get("detalle", []):
        descripcion = item.get("descripcion", "")
        votos = item.get("nvotos", "")
        if descripcion in TOTALES_ESPECIALES:
            row[f"{PRESIDENTIAL_PREFIX}_{TOTALES_ESPECIALES[descripcion]}"] = votos
            continue
        if item.get("grafico") == 1:
            row[f"{PRESIDENTIAL_PREFIX}_{slugify(descripcion)}"] = votos

    return row


def normalize_long_rows(base_row: dict, detalle: dict) -> list[dict]:
    common = {
        "numero_mesa": base_row.get("numero_mesa", ""),
        "ambito": base_row.get("ambito", ""),
        "region": base_row.get("region", ""),
        "provincia": base_row.get("provincia", ""),
        "distrito": base_row.get("distrito", ""),
        "numero_local": base_row.get("numero_local", ""),
        "nombre_local": base_row.get("nombre_local", ""),
        "eleccion": PRESIDENTIAL_PREFIX,
        "estado_acta": detalle.get("descripcionEstadoActa", ""),
        "electores_habiles": detalle.get("totalElectoresHabiles", ""),
        "votos_emitidos": detalle.get("totalVotosEmitidos", ""),
        "votos_validos": detalle.get("totalVotosValidos", ""),
    }
    rows: list[dict] = []

    for item in detalle.get("detalle", []):
        rows.append(
            {
                **common,
                "descripcion": item.get("descripcion", ""),
                "grafico": item.get("grafico", ""),
                "estado_item": item.get("estado", ""),
                "codigo_partido": item.get("ccodigo", ""),
                "nagrupacion_politica": item.get("nagrupacionPolitica", ""),
                "total_candidatos": item.get("totalCandidatos", ""),
                "votos": item.get("nvotos", ""),
                "porcentaje_validos": item.get("nporcentajeVotosValidos", ""),
                "porcentaje_emitidos": item.get("nporcentajeVotosEmitidos", ""),
            }
        )

    return rows


def process_row(
    index: int, total: int, base_row: dict, pause: float
) -> tuple[int, dict, list[dict], dict | None]:
    codigo_mesa = (base_row.get("numero_mesa") or "").strip()
    print(f"[{index}/{total}] Mesa {codigo_mesa}", flush=True)

    detalle: dict = {}
    error_row: dict | None = None

    try:
        actas = buscar_mesa(codigo_mesa, pause=pause)
        acta_id = next(
            (
                item.get("id")
                for item in actas
                if item.get("idEleccion") == PRESIDENTIAL_ELECTION_ID
            ),
            None,
        )
        if acta_id is None:
            raise ValueError("No se encontro acta presidencial para la mesa")
        detalle = detalle_acta(acta_id, pause=pause)
    except urllib.error.HTTPError as exc:
        print(f"  Error HTTP en mesa {codigo_mesa}: {exc}", flush=True)
        error_row = {"numero_mesa": codigo_mesa, "error": repr(exc)}
    except urllib.error.URLError as exc:
        print(f"  Error de red en mesa {codigo_mesa}: {exc}", flush=True)
        error_row = {"numero_mesa": codigo_mesa, "error": repr(exc)}
    except (json.JSONDecodeError, ValueError, RuntimeError) as exc:
        print(f"  Error de respuesta en mesa {codigo_mesa}: {exc}", flush=True)
        error_row = {"numero_mesa": codigo_mesa, "error": repr(exc)}

    return (
        index,
        normalize_wide_row(base_row, detalle),
        normalize_long_rows(base_row, detalle),
        error_row,
    )


def write_csv(path: Path, rows: list[dict]) -> None:
    fieldnames: list[str] = []
    seen: set[str] = set()

    for row in rows:
        for key in row:
            if key not in seen:
                seen.add(key)
                fieldnames.append(key)

    with path.open("w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def write_errors(path: Path, rows: list[dict]) -> None:
    with path.open("w", newline="", encoding="utf-8-sig") as handle:
        fieldnames = ["numero_mesa", "error"]
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Extrae desde ONPE solo resultados presidenciales para mesas serie 9 "
            "que figuran como 'Para envio al JEE'."
        )
    )
    parser.add_argument(
        "--input",
        default="public/pdfs/01_base_4703_mesas_serie9_clasificacion_oficial_urbano_rural.csv",
        help="CSV base enriquecido serie 9.",
    )
    parser.add_argument(
        "--output-wide",
        default="public/pdfs/resultados_presidenciales_pendientes_jee_wide.csv",
        help="Salida una fila por mesa.",
    )
    parser.add_argument(
        "--output-long",
        default="public/pdfs/resultados_presidenciales_pendientes_jee_detalle.csv",
        help="Salida detalle una fila por mesa-descripcion.",
    )
    parser.add_argument(
        "--output-errors",
        default="public/pdfs/resultados_presidenciales_pendientes_jee_errores.csv",
        help="Salida con errores de consulta.",
    )
    parser.add_argument(
        "--output-input-subset",
        default="public/pdfs/mesas_presidenciales_para_envio_jee_171.csv",
        help="Copia del subconjunto de entrada filtrado.",
    )
    parser.add_argument(
        "--sleep",
        type=float,
        default=0.05,
        help="Pausa en segundos entre requests.",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=8,
        help="Cantidad de consultas paralelas.",
    )
    parser.add_argument(
        "--checkpoint-every",
        type=int,
        default=50,
        help="Cada cuantas mesas reescribir salidas parciales.",
    )
    args = parser.parse_args()

    root = Path(__file__).resolve().parents[1]
    input_path = (root / args.input).resolve()
    wide_path = (root / args.output_wide).resolve()
    long_path = (root / args.output_long).resolve()
    errors_path = (root / args.output_errors).resolve()
    subset_path = (root / args.output_input_subset).resolve()

    with input_path.open("r", encoding="utf-8-sig", newline="") as handle:
        source_rows = list(csv.DictReader(handle))

    selected_rows = filter_pending_presidential_rows(source_rows)
    if not selected_rows:
        raise SystemExit("No se encontraron mesas con estado presidencial 'Para envio al JEE'.")

    subset_path.parent.mkdir(parents=True, exist_ok=True)
    write_csv(subset_path, selected_rows)

    wide_results: dict[int, dict] = {}
    long_results: dict[int, list[dict]] = {}
    error_rows: list[dict] = []

    total = len(selected_rows)
    print(f"Mesas seleccionadas para consulta presidencial: {total}", flush=True)

    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, args.workers)) as executor:
        futures = [
            executor.submit(process_row, index, total, base_row, args.sleep)
            for index, base_row in enumerate(selected_rows, start=1)
        ]

        for completed, future in enumerate(concurrent.futures.as_completed(futures), start=1):
            index, wide_row, long_rows_for_mesa, error_row = future.result()
            wide_results[index] = wide_row
            long_results[index] = long_rows_for_mesa
            if error_row:
                error_rows.append(error_row)

            if args.checkpoint_every and completed % args.checkpoint_every == 0:
                ordered_wide = [wide_results[i] for i in sorted(wide_results)]
                ordered_long = [row for i in sorted(long_results) for row in long_results[i]]
                write_csv(wide_path, ordered_wide)
                write_csv(long_path, ordered_long)
                write_errors(errors_path, error_rows)
                print(f"  Checkpoint escrito: {completed} mesas completadas", flush=True)

    wide_rows = [wide_results[i] for i in sorted(wide_results)]
    long_rows = [row for i in sorted(long_results) for row in long_results[i]]

    write_csv(wide_path, wide_rows)
    write_csv(long_path, long_rows)
    write_errors(errors_path, error_rows)

    print(f"Subconjunto de entrada: {subset_path}")
    print(f"Salida wide: {wide_path}")
    print(f"Salida detalle: {long_path}")
    print(f"Errores: {errors_path} ({len(error_rows)})")


if __name__ == "__main__":
    main()
