"use client";
import React, { useState, useEffect } from "react";

type Props = {
  name: string;
  label?: string;
  options: string[];
  defaultValue?: string[];
  value?: string[]; // voor controlled component support via Plasmic
  onChange?: (val: string[]) => void;
};

export default function MultiSelectInput({
  name,
  label,
  options,
  defaultValue = [],
  value,
  onChange,
}: Props) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<string[]>(defaultValue);
  const selected = isControlled ? value : internal;

  useEffect(() => {
    onChange?.(selected);
  }, [selected]);

  function toggle(val: string) {
    const next = selected.includes(val)
      ? selected.filter((v) => v !== val)
      : [...selected, val];

    if (isControlled) {
      onChange?.(next);
    } else {
      setInternal(next);
    }
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {label && <label style={{ fontWeight: "bold" }}>{label}</label>}
      {options.map((opt) => (
        <label key={opt} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={() => toggle(opt)}
          />
          {opt}
        </label>
      ))}
      {/* Verborgen input zodat de waarde beschikbaar is bij form submit */}
      <input type="hidden" name={name} value={JSON.stringify(selected)} />
    </div>
  );
}
