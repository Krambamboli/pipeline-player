#!/bin/zsh
# Recreates the .venv using the official Python 3.12 from python.org
# Run this AFTER the python-3.12.7-macos11.pkg installer has finished.
set -e

VENV_DIR="$(pwd)/.venv"
PYTHON="/usr/local/bin/python3.12"

echo ""
echo "══════════════════════════════════════════════════════"
echo "  Recreating .venv with official Python 3.12"
echo "══════════════════════════════════════════════════════"
echo ""

# Verify the official Python is installed and has lzma
if ! "$PYTHON" -c "import lzma; print('✅ lzma OK')" 2>/dev/null; then
  echo "❌ $PYTHON not found or lzma still broken."
  echo "   Make sure the pkg installer finished, then re-run this script."
  exit 1
fi

echo "Python version: $($PYTHON --version)"
echo ""

# Remove old venv
if [[ -d "$VENV_DIR" ]]; then
  echo "Removing old .venv..."
  rm -rf "$VENV_DIR"
fi

# Create fresh venv
echo "Creating new .venv..."
"$PYTHON" -m venv "$VENV_DIR"

# Install deps
echo "Installing dependencies..."
"$VENV_DIR/bin/pip" install --upgrade pip -q
"$VENV_DIR/bin/pip" install -r backend/requirements.txt

echo ""
echo "══════════════════════════════════════════════════════"
echo "  ✅ Done! Start the backend with:"
echo "     source .venv/bin/activate"
echo "     cd backend && uvicorn main:app --reload --port 8000"
echo "══════════════════════════════════════════════════════"
echo ""
