"use client";

// Copyright (C) 2026 olischn
//
// This file is part of Pipeline Player.
// SPDX-License-Identifier: GPL-3.0-or-later
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

/**
 * PythonEditor
 * ------------
 * Minimal React wrapper around CodeMirror 6 (official packages only,
 * see https://codemirror.net/docs/): Python syntax highlighting, line
 * numbers, bracket matching, autocomplete (basicSetup), Tab indentation
 * and a red highlight for the line that raised an error.
 *
 * The editor is created once; external `value` changes (e.g. loading a
 * saved script) replace the document only if it actually differs.
 */

import { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { Decoration, DecorationSet, keymap } from "@codemirror/view";
import { EditorState, StateEffect, StateField } from "@codemirror/state";
import { indentWithTab } from "@codemirror/commands";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";

/** Effect + field that mark one line (1-based) as erroneous; null clears it. */
const setErrorLine = StateEffect.define<number | null>();
const errorLineField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(deco, tr) {
    deco = deco.map(tr.changes);
    for (const effect of tr.effects) {
      if (!effect.is(setErrorLine)) continue;
      const n = effect.value;
      if (n == null || n < 1 || n > tr.state.doc.lines) {
        deco = Decoration.none;
      } else {
        const line = tr.state.doc.line(n);
        deco = Decoration.set([Decoration.line({ class: "cm-error-line" }).range(line.from)]);
      }
    }
    return deco;
  },
  provide: (field) => EditorView.decorations.from(field),
});

/** Layout tweaks so the editor fills its container and matches the app fonts. */
const layoutTheme = EditorView.theme({
  "&": { height: "100%", fontSize: "12.5px", backgroundColor: "transparent" },
  ".cm-scroller": { fontFamily: "var(--font-mono)", lineHeight: "1.55" },
  ".cm-gutters": { backgroundColor: "transparent", borderRight: "1px solid var(--c-border)" },
  ".cm-error-line": { backgroundColor: "rgba(248, 113, 113, 0.18)" },
});

/**
 * Props received by `PythonEditor` from the Fusion Retriever page (`app/fusion/page.tsx`).
 * Provides the Python script `value`, `onChange` callback, optional 1-based `errorLine` to highlight, and `readOnly` flag.
 */
interface Props {
  value: string;
  onChange: (code: string) => void;
  /** 1-based line to highlight as error (null = none). */
  errorLine?: number | null;
  readOnly?: boolean;
}

/**
 * CodeMirror 6 Python editor component for editing the custom fusion reranker script.
 * Receives `Props` (`value`, `onChange`, `errorLine`, `readOnly`) from the `/fusion` page (`app/fusion/page.tsx`).
 * Renders a syntax-highlighted Python editor with One Dark theme and line-level error highlighting, emitting code edits via `onChange`.
 */
export default function PythonEditor({ value, onChange, errorLine = null, readOnly = false }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  // Keep the latest callback without re-creating the editor
  // (updated after render, as React forbids writing refs during render)
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Create the editor once
  useEffect(() => {
    if (!hostRef.current) return;
    const view = new EditorView({
      parent: hostRef.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          keymap.of([indentWithTab]),
          python(),
          oneDark,
          layoutTheme,
          errorLineField,
          EditorState.readOnly.of(readOnly),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) onChangeRef.current(u.state.doc.toString());
          }),
        ],
      }),
    });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply external value changes (loading a script / reset)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: value } });
    }
  }, [value]);

  // Update the error-line marker
  useEffect(() => {
    viewRef.current?.dispatch({ effects: setErrorLine.of(errorLine ?? null) });
  }, [errorLine]);

  return <div ref={hostRef} className="python-editor" />;
}
