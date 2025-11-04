// components/MultiSelectInput.tsx
"use client";
import React, { useState, useEffect } from "react";

type Props = {
  name: string;
  label?: string;
  options: string[];
  defaultValue?: string[];
  onChange?: (val: string[]) => void;
};

export default function MultiSelectInput({
  name,
  label,
  options,
  defaultValue = [],
  onChange,
}: Props) {
  const [selected, setSelected] = useState<string[]>(defaultValue);

  useEffect(() => {
    onChange?.(selected);
  }, [selected]);

  function toggle(val: string) {
    if (selected.includes(val)) {
      setSelected(selected.filter(v => v !== val));
    } else {
      setSelected([...selected, val]);
    }
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <label style={{ fontWeight: "bold" }}>{label}</label>
      {options.map(opt => (
        <label key={opt} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={() => toggle(opt)}
          />
          {opt}
        </label>
      ))}
      <input type="hidden" name={name} value={JSON.stringify(selected)} />
    </div>
  );
}
