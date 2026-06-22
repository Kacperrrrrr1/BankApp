"""Thread-safe JSON file storage for the bank account."""

import json
import threading
from pathlib import Path
from typing import Any

DB_PATH = Path(__file__).parent / "data" / "bank.json"

_lock = threading.Lock()

DEFAULT: dict[str, Any] = {
    "owner": "Jan Kowalski",
    "balance": 1500.0,
    "loans": [],
    "transactions": [],
}


def load() -> dict[str, Any]:
    """Load and return the current account state. Returns DEFAULT if file is missing/corrupt."""
    with _lock:
        if DB_PATH.exists():
            try:
                with open(DB_PATH, encoding="utf-8") as f:
                    data = json.load(f)
                # Ensure all expected keys exist (forward-compat)
                for key, val in DEFAULT.items():
                    data.setdefault(key, val)
                return data
            except (json.JSONDecodeError, OSError):
                pass
        return dict(DEFAULT)


def save(state: dict[str, Any]) -> None:
    """Persist the account state to disk."""
    with _lock:
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(DB_PATH, "w", encoding="utf-8") as f:
            json.dump(state, f, indent=2, ensure_ascii=False)
