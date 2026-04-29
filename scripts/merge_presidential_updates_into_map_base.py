from __future__ import annotations

import csv
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BASE_PATH = ROOT / "public" / "pdfs" / "01_base_4703_mesas_serie9_clasificacion_oficial_urbano_rural.csv"
UPDATES_PATH = ROOT / "public" / "pdfs" / "resultados_presidenciales_pendientes_jee_wide.csv"
AUDIT_PATH = ROOT / "public" / "pdfs" / "actualizacion_presidencial_pendientes_jee_auditoria.csv"


def main() -> None:
    with BASE_PATH.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        base_rows = list(reader)
        if not reader.fieldnames:
            raise SystemExit("La base principal no tiene encabezados.")
        base_headers = reader.fieldnames

    with UPDATES_PATH.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        update_rows = list(reader)
        if not reader.fieldnames:
            raise SystemExit("La base de actualizaciones no tiene encabezados.")
        update_headers = reader.fieldnames

    update_columns = [header for header in update_headers if header.startswith("presidencial_")]
    updates_by_mesa = {
        (row.get("numero_mesa") or "").strip(): row
        for row in update_rows
        if (row.get("numero_mesa") or "").strip()
    }

    changed_rows: list[dict[str, str]] = []
    merged = 0

    for row in base_rows:
        numero_mesa = (row.get("numero_mesa") or "").strip()
        update = updates_by_mesa.get(numero_mesa)
        if not update:
            continue

        before_status = row.get("presidencial_estado_acta", "")
        before_emitidos = row.get("presidencial_votos_emitidos", "")
        before_validos = row.get("presidencial_votos_validos", "")

        for column in update_columns:
            if column in row:
                row[column] = update.get(column, "")

        merged += 1
        changed_rows.append(
            {
                "numero_mesa": numero_mesa,
                "before_estado_acta": before_status,
                "after_estado_acta": row.get("presidencial_estado_acta", ""),
                "before_votos_emitidos": before_emitidos,
                "after_votos_emitidos": row.get("presidencial_votos_emitidos", ""),
                "before_votos_validos": before_validos,
                "after_votos_validos": row.get("presidencial_votos_validos", ""),
            }
        )

    with BASE_PATH.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=base_headers)
        writer.writeheader()
        writer.writerows(base_rows)

    with AUDIT_PATH.open("w", encoding="utf-8-sig", newline="") as handle:
        audit_headers = [
            "numero_mesa",
            "before_estado_acta",
            "after_estado_acta",
            "before_votos_emitidos",
            "after_votos_emitidos",
            "before_votos_validos",
            "after_votos_validos",
        ]
        writer = csv.DictWriter(handle, fieldnames=audit_headers)
        writer.writeheader()
        writer.writerows(changed_rows)

    print(f"mesas_actualizadas={merged}")
    print(f"auditoria={AUDIT_PATH}")


if __name__ == "__main__":
    main()
