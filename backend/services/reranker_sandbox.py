# Copyright (C) 2024 Oliver Schneider
#
# This file is part of Pipeline Player.
# SPDX-License-Identifier: GPL-3.0-or-later
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <https://www.gnu.org/licenses/>.

"""
Reranker Sandbox
----------------
Runs a user-written Python reranker that fuses the text (hybrid) hits and
the ColPali (MaxSim) hits of the Fusion Retriever.

Contract (user code):

    def rerank(text_hits: list[dict], colpali_hits: list[dict], k: int) -> list[dict]:
        ...

The function returns the chosen hits in order (only the first k are used).
Each returned hit may carry the optional keys "fused_score" and "reason",
which are shown in the UI.

WHY a subprocess: the code is arbitrary Python. Running it in a separate
interpreter with a hard timeout means an infinite loop, a crash or a stray
sys.exit() can never take down the backend. This is NOT a security sandbox —
Pipeline Player is a local tool and the code runs with the user's rights.

Saved scripts live in configs/reranker/<name>.py.
"""

from __future__ import annotations

import json
import subprocess
import sys
import time
from pathlib import Path
from typing import Any, Dict, List

from services.config_manager import CONFIGS_DIR
from services.profile_store import _validate_name

SCRIPTS_DIR = CONFIGS_DIR / "reranker"

# Hard limit for one reranker execution (incl. interpreter start, ~30 ms)
TIMEOUT_SECONDS = 3.0

# ---------------------------------------------------------------------------
# Built-in default script: Reciprocal Rank Fusion
# ---------------------------------------------------------------------------
DEFAULT_SCRIPT = '''"""
Fusion reranker — fuses text (hybrid) chunks and ColPali pages.

Each hit is a dict with:
  source       "text" | "colpali"
  rank         1-based rank within its own list
  score        raw score (text: Qdrant RRF of dense+sparse, colpali: MaxSim)
  score_norm   min-max normalised score within its own list (0..1)
  doc_name, file_path, page (int), pages (list), text (chunks only), metadata
  text hits additionally: dense_rank, dense_score, sparse_rank, sparse_score

Return the chosen hits in order. Optional keys per hit:
  fused_score  number shown in the UI
  reason       short explanation shown in the UI
print() output is shown below the editor (handy for debugging).
"""

RRF_K = 60            # standard RRF constant (Cormack et al., 2009)
TEXT_WEIGHT = 1.0     # weight of the text (hybrid) list
COLPALI_WEIGHT = 1.0  # weight of the ColPali (MaxSim) list


def rerank(text_hits, colpali_hits, k):
    fused = []
    for hit, weight in [(h, TEXT_WEIGHT) for h in text_hits] + [(h, COLPALI_WEIGHT) for h in colpali_hits]:
        score = weight / (RRF_K + hit["rank"])
        fused.append({**hit, "fused_score": round(score, 5),
                      "reason": f"RRF {hit['source']} #{hit['rank']}"})
    fused.sort(key=lambda h: h["fused_score"], reverse=True)

    # ── Example rule (uncomment to try) ─────────────────────────────────
    # If ColPali #1 is at least 30 % better than ColPali #2, the visual
    # match is very confident → put it on position 1 (before text #1).
    # if len(colpali_hits) >= 2 and colpali_hits[0]["score"] >= 1.3 * colpali_hits[1]["score"]:
    #     top = next(h for h in fused if h["source"] == "colpali" and h["rank"] == 1)
    #     fused.remove(top)
    #     fused.insert(0, {**top, "reason": "ColPali #1 ≥ 30 % above #2 → forced to #1"})

    return fused[:k]
'''

# ---------------------------------------------------------------------------
# Harness executed in the child interpreter
# ---------------------------------------------------------------------------
# Reads {"code", "text_hits", "colpali_hits", "k"} from stdin, executes the
# user code, calls rerank() and writes one JSON line prefixed with a marker
# to stdout. The user's print() output is captured separately.
_HARNESS = r'''
import io, json, sys, traceback, contextlib
MARK = "__RERANK_RESULT__="
data = json.loads(sys.stdin.read())
buf = io.StringIO()
out = {"ok": False}
try:
    with contextlib.redirect_stdout(buf):
        ns = {"__name__": "reranker"}
        exec(compile(data["code"], "<reranker>", "exec"), ns)
        fn = ns.get("rerank")
        if not callable(fn):
            raise NameError("Define a function: def rerank(text_hits, colpali_hits, k)")
        res = fn(data["text_hits"], data["colpali_hits"], data["k"])
    if not isinstance(res, (list, tuple)):
        raise TypeError(f"rerank() must return a list, got {type(res).__name__}")
    picked = []
    for item in res:
        if not isinstance(item, dict) or "source" not in item or "id" not in item:
            raise TypeError("Every returned item must be a hit dict (with 'source' and 'id')")
        picked.append({
            "source": item["source"], "id": str(item["id"]),
            "fused_score": item.get("fused_score"),
            "reason": str(item["reason"]) if item.get("reason") is not None else None,
        })
    out = {"ok": True, "selected": picked}
except BaseException as exc:  # incl. SystemExit from user code
    tb = traceback.extract_tb(exc.__traceback__)
    user_lines = [f.lineno for f in tb if f.filename == "<reranker>"]
    if isinstance(exc, SyntaxError) and exc.filename == "<reranker>":
        user_lines.append(exc.lineno)
    out = {
        "ok": False,
        "error": f"{type(exc).__name__}: {exc}",
        "line": user_lines[-1] if user_lines else None,
        "traceback": "".join(traceback.format_exception(exc)),
    }
out["stdout"] = buf.getvalue()[-4000:]
sys.__stdout__.write(MARK + json.dumps(out, default=str) + "\n")
'''

_MARK = "__RERANK_RESULT__="


def run_reranker(code: str, text_hits: List[Dict[str, Any]], colpali_hits: List[Dict[str, Any]], k: int) -> Dict[str, Any]:
    """
    Execute the user reranker in a child Python process.

    Returns {"ok", "selected"|"error", "line", "stdout", "elapsed_ms"}.
    "selected" contains the FULL hit dicts (looked up by source+id) plus
    fused_score / reason, limited to k items.
    """
    t0 = time.time()
    payload = json.dumps({"code": code, "text_hits": text_hits, "colpali_hits": colpali_hits, "k": k})
    try:
        proc = subprocess.run(
            # -I: isolated mode (ignores PYTHON* env vars and the user site dir)
            [sys.executable, "-I", "-c", _HARNESS],
            input=payload, capture_output=True, text=True, timeout=TIMEOUT_SECONDS,
        )
    except subprocess.TimeoutExpired:
        return {"ok": False, "error": f"Timeout: reranker did not finish within {TIMEOUT_SECONDS:.0f}s "
                                      f"(infinite loop?)", "line": None, "stdout": "",
                "elapsed_ms": round((time.time() - t0) * 1000)}

    elapsed = round((time.time() - t0) * 1000)
    line = next((ln for ln in proc.stdout.splitlines() if ln.startswith(_MARK)), None)
    if line is None:
        # The child died before writing a result (e.g. os._exit, segfault)
        return {"ok": False, "error": f"Reranker process exited with code {proc.returncode}. "
                                      f"{proc.stderr.strip()[-500:]}", "line": None,
                "stdout": proc.stdout[-2000:], "elapsed_ms": elapsed}

    result = json.loads(line[len(_MARK):])
    result["elapsed_ms"] = elapsed
    if not result.get("ok"):
        return result

    # Map the returned ids back to the full hit dicts; ignore unknown/duplicate ids
    by_key = {(h["source"], str(h["id"])): h for h in text_hits + colpali_hits}
    selected, seen = [], set()
    for item in result["selected"]:
        key = (item["source"], item["id"])
        if key in by_key and key not in seen:
            seen.add(key)
            selected.append({**by_key[key], "fused_score": item.get("fused_score"), "reason": item.get("reason")})
        if len(selected) >= k:
            break
    result["selected"] = selected
    return result


# ---------------------------------------------------------------------------
# Saved scripts (configs/reranker/<name>.py)
# ---------------------------------------------------------------------------

def _script_path(name: str) -> Path:
    SCRIPTS_DIR.mkdir(parents=True, exist_ok=True)
    return SCRIPTS_DIR / f"{_validate_name(name)}.py"


def list_scripts() -> List[str]:
    """Names of all saved reranker scripts, sorted."""
    SCRIPTS_DIR.mkdir(parents=True, exist_ok=True)
    return sorted(p.stem for p in SCRIPTS_DIR.glob("*.py"))


def load_script(name: str) -> str:
    path = _script_path(name)
    if not path.exists():
        raise FileNotFoundError(f"Reranker script '{name}' not found.")
    return path.read_text("utf-8")


def save_script(name: str, code: str) -> None:
    # Syntax check before saving so broken scripts are not persisted silently
    compile(code, f"<{name}>", "exec")
    _script_path(name).write_text(code, encoding="utf-8")


def delete_script(name: str) -> None:
    path = _script_path(name)
    if not path.exists():
        raise FileNotFoundError(f"Reranker script '{name}' not found.")
    path.unlink()
