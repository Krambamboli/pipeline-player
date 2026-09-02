#!/bin/zsh
# ─────────────────────────────────────────────────────────────────────────────
# Pipeline Player — Backend Setup Script
# Downloads Python 3.12 (if needed), creates a venv, and installs deps.
# Usage:  zsh scripts/setup_backend.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

PYTHON_VERSION="3.12.7"
VENV_DIR="$(pwd)/.venv"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║       Pipeline Player — Backend Environment Setup           ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ── Step 1: Find a Python 3.10+ interpreter ──────────────────────────────────
# Also check pyenv-managed versions in ~/.pyenv/versions/
PYTHON=""
SEARCH_CANDIDATES=(python3.13 python3.12 python3.11 python3.10)

# Add pyenv-managed binaries if pyenv is installed
if [[ -d "$HOME/.pyenv/versions" ]]; then
  for pyenv_ver in $(ls -r "$HOME/.pyenv/versions" 2>/dev/null); do
    SEARCH_CANDIDATES+=("$HOME/.pyenv/versions/$pyenv_ver/bin/python3")
  done
fi

for candidate in "${SEARCH_CANDIDATES[@]}"; do
  if command -v "$candidate" &>/dev/null || [[ -x "$candidate" ]]; then
    ver=$("$candidate" -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')" 2>/dev/null) || continue
    major=$(echo "$ver" | cut -d. -f1)
    minor=$(echo "$ver" | cut -d. -f2)
    if [[ $major -ge 3 && $minor -ge 10 ]]; then
      PYTHON="$candidate"
      echo "✅ Found compatible Python: $PYTHON ($("$PYTHON" --version))"
      break
    fi
  fi
done

if [[ -z "$PYTHON" ]]; then
  echo ""
  echo "❌ No Python 3.10+ found on this system."
  echo ""
  echo "   Docling requires Python 3.10 or newer. Your system Python is 3.9"
  echo "   (bundled with Xcode) and cannot be upgraded in place."
  echo ""
  echo "   ➜ Install Python 3.12 from the official installer:"
  echo "     https://www.python.org/ftp/python/${PYTHON_VERSION}/python-${PYTHON_VERSION}-macos11.pkg"
  echo ""
  echo "   After installing, re-run this script:"
  echo "     zsh scripts/setup_backend.sh"
  echo ""
  echo "   Alternatively, install via Homebrew:"
  echo "     /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
  echo "     brew install python@3.12"
  echo ""
  exit 1
fi

# ── Step 2: Remove stale venv if it was created with a wrong Python ───────────
if [[ -d "$VENV_DIR" ]]; then
  existing=$("$VENV_DIR/bin/python" -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')" 2>/dev/null || echo "0.0")
  major=$(echo "$existing" | cut -d. -f1)
  minor=$(echo "$existing" | cut -d. -f2)
  if [[ $major -lt 3 || ($major -eq 3 && $minor -lt 10) ]]; then
    echo "⚠️  Existing .venv uses Python $existing (too old). Removing it..."
    rm -rf "$VENV_DIR"
  else
    echo "✅ Existing .venv uses Python $existing — keeping it."
  fi
fi

# ── Step 3: Create venv ────────────────────────────────────────────────────────
if [[ ! -d "$VENV_DIR" ]]; then
  echo ""
  echo "Creating virtual environment with $PYTHON..."
  "$PYTHON" -m venv "$VENV_DIR"
  echo "✅ .venv created at $VENV_DIR"
fi

# ── Step 4: Install dependencies ──────────────────────────────────────────────
echo ""
echo "Installing Python dependencies (this may take a few minutes on first run"
echo "as Docling downloads its model weights ~1-2 GB)..."
echo ""

"$VENV_DIR/bin/pip" install --upgrade pip --quiet
"$VENV_DIR/bin/pip" install -r backend/requirements.txt

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    Setup complete! ✅                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "To start the backend:"
echo "  source .venv/bin/activate"
echo "  cd backend && uvicorn main:app --reload --port 8000"
echo ""
echo "To start the frontend (separate terminal):"
echo "  cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""
