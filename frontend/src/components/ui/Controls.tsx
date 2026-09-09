"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/** Labelled toggle switch with tooltip. */
export function ToggleRow({
  id,
  label,
  paramKey,
  checked,
  onChange,
  tooltip,
}: {
  id: string;
  label: string;
  paramKey: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  tooltip: string;
}) {
  return (
    <div className="toggle-row">
      <div className="toggle-row__info">
        <div className="toggle-row__label">
          <span>{label}</span>
          <code className="toggle-row__key">{paramKey}</code>
          <Tooltip text={tooltip} />
        </div>
      </div>
      <label className="toggle-switch" htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="toggle-switch__track" />
        <div className="toggle-switch__thumb" />
      </label>
    </div>
  );
}

/** Dropdown select with label and tooltip. */
export function SelectField({
  id,
  label,
  paramKey,
  value,
  options,
  onChange,
  tooltip,
}: {
  id: string;
  label: string;
  paramKey: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  tooltip: string;
}) {
  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {label} <code>{paramKey}</code>
        <Tooltip text={tooltip} />
      </label>
      <select
        id={id}
        className="select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Numeric range slider with live value display. */
export function SliderField({
  id,
  label,
  paramKey,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  tooltip,
}: {
  id: string;
  label: string;
  paramKey: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
  tooltip: string;
}) {
  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {label} <code>{paramKey}</code>
        <Tooltip text={tooltip} />
      </label>
      <div className="slider-row">
        <input
          id={id}
          type="range"
          className="slider"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
        <span className="slider-value">
          {value}
          {unit}
        </span>
      </div>
    </div>
  );
}

/** Plain number input. */
export function NumberField({
  id,
  label,
  paramKey,
  value,
  min,
  max,
  onChange,
  tooltip,
  nullable,
}: {
  id: string;
  label: string;
  paramKey: string;
  value: number | null;
  min?: number;
  max?: number;
  onChange: (value: number | null) => void;
  tooltip: string;
  nullable?: boolean;
}) {
  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {label} <code>{paramKey}</code>
        <Tooltip text={tooltip} />
      </label>
      <input
        id={id}
        type="number"
        className="input"
        value={value ?? ""}
        min={min}
        max={max}
        placeholder={nullable ? "null (no limit)" : ""}
        onChange={(e) => {
          const raw = e.target.value;
          if (nullable && raw === "") onChange(null);
          else onChange(parseFloat(raw));
        }}
      />
    </div>
  );
}

/** Plain text input. */
export function TextField({
  id,
  label,
  paramKey,
  value,
  placeholder,
  onChange,
  tooltip,
}: {
  id: string;
  label: string;
  paramKey: string;
  value: string | null;
  placeholder?: string;
  onChange: (value: string | null) => void;
  tooltip: string;
}) {
  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {label} <code>{paramKey}</code>
        <Tooltip text={tooltip} />
      </label>
      <input
        id={id}
        type="text"
        className="input"
        value={value ?? ""}
        placeholder={placeholder ?? "null"}
        onChange={(e) => onChange(e.target.value || null)}
      />
    </div>
  );
}

/** Textarea for multi-line strings like prompts. */
export function TextareaField({
  id,
  label,
  paramKey,
  value,
  onChange,
  tooltip,
}: {
  id: string;
  label: string;
  paramKey: string;
  value: string;
  onChange: (value: string) => void;
  tooltip: string;
}) {
  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {label} <code>{paramKey}</code>
        <Tooltip text={tooltip} />
      </label>
      <textarea
        id={id}
        className="textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/** Tag-based list input (e.g., OCR language codes). */
export function TagListField({
  id,
  label,
  paramKey,
  values,
  onChange,
  tooltip,
}: {
  id: string;
  label: string;
  paramKey: string;
  values: string[];
  onChange: (values: string[]) => void;
  tooltip: string;
}) {
  const [inputVal, setInputVal] = useState("");

  const addTag = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setInputVal("");
  };

  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {label} <code>{paramKey}</code>
        <Tooltip text={tooltip} />
      </label>
      <div
        className="tag-input input"
        style={{ minHeight: 36, cursor: "text" }}
        onClick={() => document.getElementById(id)?.focus()}
      >
        {values.map((v) => (
          <span key={v} className="tag">
            {v}
            <button
              className="tag__remove"
              onClick={(e) => {
                e.stopPropagation();
                onChange(values.filter((x) => x !== v));
              }}
            >
              ×
            </button>
          </span>
        ))}
        <input
          id={id}
          className="tag-input__field"
          value={inputVal}
          placeholder="Add language…"
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag(inputVal);
            } else if (e.key === "Backspace" && !inputVal && values.length > 0) {
              onChange(values.slice(0, -1));
            }
          }}
          onBlur={() => { if (inputVal) addTag(inputVal); }}
        />
      </div>
    </div>
  );
}

/** Multi-select checkboxes (for output formats). */
export function MultiCheckField({
  label,
  paramKey,
  options,
  selected,
  onChange,
  tooltip,
}: {
  label: string;
  paramKey: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
  tooltip: string;
}) {
  const toggle = (v: string) => {
    if (selected.includes(v)) onChange(selected.filter((x) => x !== v));
    else onChange([...selected, v]);
  };

  return (
    <div className="field">
      <div className="field__label">
        {label} <code>{paramKey}</code>
        <Tooltip text={tooltip} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {options.map((o) => (
          <label
            key={o.value}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 6,
              border: `1px solid ${selected.includes(o.value) ? "var(--c-accent)" : "var(--c-border)"}`,
              background: selected.includes(o.value) ? "var(--c-accent-glow)" : "var(--c-surface)",
              cursor: "pointer",
              fontSize: "0.78rem",
              color: selected.includes(o.value) ? "var(--c-accent)" : "var(--c-text-2)",
              transition: "all 120ms ease",
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              checked={selected.includes(o.value)}
              onChange={() => toggle(o.value)}
              style={{ display: "none" }}
            />
            {o.label}
          </label>
        ))}
      </div>
    </div>
  );
}

/** Collapsible section wrapper. */
export function ConfigSection({
  icon,
  title,
  badge,
  defaultOpen = false,
  children,
}: {
  icon: string;
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="config-section">
      <button className="config-section__trigger" onClick={() => setOpen((p) => !p)}>
        <span className="config-section__trigger-icon">{icon}</span>
        {title}
        {badge && <span className="config-section__badge">{badge}</span>}
        <span className={`config-section__chevron ${open ? "open" : ""}`}>▼</span>
      </button>
      {open && <div className="config-section__content">{children}</div>}
    </div>
  );
}

/**
 * Inline tooltip with hover bubble.
 *
 * Renders the bubble via a React portal at `document.body` with
 * `position: fixed` coordinates derived from getBoundingClientRect.
 * This escapes any parent overflow-y:auto clipping context (e.g. the
 * left config panel) so the bubble is never hidden behind adjacent panels.
 */
export function Tooltip({ text }: { text: string }) {
  const iconRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  // Only use portals after hydration (avoids SSR mismatch)
  useEffect(() => { setMounted(true); }, []);

  const show = useCallback(() => {
    if (!iconRef.current) return;
    const rect = iconRef.current.getBoundingClientRect();

    const bubbleWidth = 260;
    const bubbleEstimatedHeight = 120; // conservative estimate to avoid bottom overflow
    const gap = 10;
    const margin = 12; // min distance from viewport edges

    // --- Horizontal: prefer right of icon, flip left if it overflows ---
    let left = rect.right + gap;
    if (left + bubbleWidth > window.innerWidth - margin) {
      // Flip: appear to the left of the icon
      left = rect.left - bubbleWidth - gap;
    }
    // Final clamp: ensure bubble never escapes either horizontal edge
    left = Math.max(margin, Math.min(left, window.innerWidth - bubbleWidth - margin));

    // --- Vertical: centre on icon, clamp so bubble stays in viewport ---
    let top = rect.top + rect.height / 2;
    // Clamp so bubble doesn't overflow bottom
    if (top + bubbleEstimatedHeight / 2 > window.innerHeight - margin) {
      top = window.innerHeight - bubbleEstimatedHeight / 2 - margin;
    }
    // Clamp so bubble doesn't overflow top
    if (top - bubbleEstimatedHeight / 2 < margin) {
      top = bubbleEstimatedHeight / 2 + margin;
    }

    setPos({ top, left });
    setVisible(true);
  }, []);


  const hide = useCallback(() => setVisible(false), []);

  const bubble = visible && mounted ? createPortal(
    <div
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        transform: "translateY(-50%)",
        width: 260,
        padding: "10px 12px",
        background: "var(--c-surface-2)",
        border: "1px solid var(--c-border)",
        borderRadius: "var(--r-md)",
        fontSize: "0.75rem",
        color: "var(--c-text-2)",
        lineHeight: 1.55,
        zIndex: 9999,
        boxShadow: "var(--shadow-lg)",
        pointerEvents: "none",
        whiteSpace: "normal",
        wordBreak: "break-word",
      }}
    >
      {text}
    </div>,
    document.body
  ) : null;

  return (
    <>
      <span
        ref={iconRef}
        className="tooltip-icon"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        tabIndex={0}
        aria-label="More information"
        role="button"
      >
        ?
      </span>
      {bubble}
    </>
  );
}
