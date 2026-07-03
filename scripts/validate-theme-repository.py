from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path


JSON_ROOTS = (
    Path("config"),
    Path("templates"),
    Path("sections"),
    Path("locales"),
)

FORBIDDEN_TRACKED_PARTS = {
    ".idea",
    ".shopify",
    "node_modules",
    "coverage",
    "test-results",
    "__pycache__",
}

FORBIDDEN_TRACKED_NAMES = {
    ".DS_Store",
    "Thumbs.db",
    ".env",
}


def validate_json() -> list[str]:
    errors: list[str] = []

    for root in JSON_ROOTS:
        if not root.exists():
            continue

        for path in sorted(root.rglob("*.json")):
            try:
                with path.open("r", encoding="utf-8-sig") as file:
                    json.load(file)
            except json.JSONDecodeError as exc:
                errors.append(
                    f"{path}:{exc.lineno}:{exc.colno}: invalid JSON: {exc.msg}"
                )
            except OSError as exc:
                errors.append(f"{path}: unable to read file: {exc}")

    return errors


def get_tracked_files() -> list[Path]:
    result = subprocess.run(
        ["git", "ls-files"],
        check=True,
        capture_output=True,
        text=True,
    )

    return [
        Path(line)
        for line in result.stdout.splitlines()
        if line.strip()
    ]


def validate_repository_hygiene() -> list[str]:
    errors: list[str] = []

    for path in get_tracked_files():
        if path.name in FORBIDDEN_TRACKED_NAMES:
            errors.append(f"{path}: local-only file must not be tracked")

        if any(part in FORBIDDEN_TRACKED_PARTS for part in path.parts):
            errors.append(f"{path}: local/generated directory must not be tracked")

        if path.suffix == ".log":
            errors.append(f"{path}: log files must not be tracked")

    return errors


def main() -> int:
    errors = [
        *validate_json(),
        *validate_repository_hygiene(),
    ]

    if errors:
        print("Repository validation failed:", file=sys.stderr)

        for error in errors:
            print(f"  - {error}", file=sys.stderr)

        return 1

    print("JSON and repository hygiene validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())