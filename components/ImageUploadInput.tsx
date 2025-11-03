"use client";
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { v4 as uuid } from "uuid";

type Props = {
  name?: string;                  // bv. "image_url" of "image_path"
  bucket?: string;                // standaard "recipe-images"
  outputMode?: "url" | "path";    // "url" = public URL, "path" = storage path
  buttonLabel?: string;
  defaultValue?: string;
  maxMb?: number;
  value?: string;                 // <-- maakt 'm een echte form field
  onChange?: (val: string) => void;
};

export default function ImageUploadInput({
  name = "image_url",
  bucket = "recipe-images",
  outputMode = "url",
  buttonLabel = "Choose image",
  defaultValue = "",
  maxMb = 5,
  value,
  onChange,
}: Props) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<string>(defaultValue);
  const current = isControlled ? (value as string) : internal;

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isControlled && defaultValue) setInternal(defaultValue);
  }, [defaultValue, isControlled]);

  function setVal(v: string) {
    if (isControlled) onChange?.(v);
    else setInternal(v);
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("File must be an image");
    if (file.size > maxMb * 1024 * 1024) return setError(`Image too large (max ${maxMb}MB)`);

    try {
      setBusy(true);
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${uuid()}.${ext}`;

      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      const publicUrl = data?.publicUrl || "";

      const nextValue = outputMode === "path" ? path : publicUrl;
      setVal(nextValue);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function clear() {
    setVal("");
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {name ? <input type="hidden" name={name} value={current || ""} /> : null}

      {current ? (
        <div style={{ display: "grid", gap: 8 }}>
          {current.startsWith("http") ? (
            <img src={current} alt="Preview" style={{ width: "100%", maxWidth: 320, borderRadius: 8, objectFit: "cover" }} />
          ) : (
            <div style={{ fontSize: 12, color: "#666" }}>Stored path: {current}</div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={clear} disabled={busy}>Remove</button>
            <label style={{ display: "inline-block" }}>
              <span style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer" }}>
                Replace image
              </span>
              <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} style={{ display: "none" }} />
            </label>
          </div>
        </div>
      ) : (
        <label style={{ display: "inline-block" }}>
          <span style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer" }}>
            {busy ? "Uploading..." : buttonLabel}
          </span>
          <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} style={{ display: "none" }} />
        </label>
      )}

      {error && <div style={{ color: "crimson" }}>❌ {error}</div>}
      {!current && <small>After upload, this field’s value is set automatically.</small>}
    </div>
  );
}
