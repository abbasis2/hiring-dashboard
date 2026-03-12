from __future__ import annotations

import importlib
import sys
import types
from pathlib import Path


def _load_app():
    # Ensure `backend` is importable as a package even when this folder is the
    # runtime root (for example, Vercel project root = `backend`).
    if "backend" not in sys.modules:
        backend_pkg = types.ModuleType("backend")
        backend_pkg.__path__ = [str(Path(__file__).resolve().parent)]
        sys.modules["backend"] = backend_pkg
    return importlib.import_module("backend.main").app


app = _load_app()
