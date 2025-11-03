import { useState } from "react";
import Link from "next/link";              // ✅ use Next.js Link
import { supabase } from "../../lib/supabaseClient";
import { v4 as uuid } from "uuid";

export default function NewRecipe() {
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState<number | "">("");
  const [tags, setTags] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!title) return setMessage("Title is required.");
    if (!file) return setMessage("Please choose an image.");

    // Simple guardrails
    if (!file.type.startsWith("image/")) return setMessage("File must be an image.");
    if (file.size > 5 * 1024 * 1024) return setMessage("Image too large (max 5MB).");

    try {
      setSaving(true);

      // 1️⃣ Upload image to Supabase Storage
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${uuid()}.${ext}`;  // store only filename in DB
      const { error: upErr } = await supabase.storage
        .from("recipe-images")
        .upload(path, file, { upsert: false });
      if (upErr) throw upErr;

      // 2️⃣ Insert recipe row into Supabase DB
      const { error: insErr } = await supabase.from("recipes").insert({
        title,
        total_minutes: minutes === "" ? null : Number(minutes),
        tags,
        ingredients,
        steps,
        image_path: path,
      });
      if (insErr) throw insErr;

      setMessage("✅ Saved! Open /recipes to see it.");
      setTitle("");
      setMinutes("");
      setTags("");
      setIngredients("");
      setSteps("");
      setFile(null);
    } catch (err: any) {
      setMessage(`❌ ${err.message || String(err)}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main style={{ maxWidth: 760, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>New Recipe</h1>

      <form onSubmit={handleSave} style={{ display: "grid", gap: 12 }}>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>

        <label>
          Total minutes
          <input
            type="number"
            value={minutes}
            onChange={(e) =>
              setMinutes(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </label>

        <label>
          Tags (comma separated)
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="vegan,quick"
          />
        </label>

        <label>
          Ingredients
          <textarea
            rows={5}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder={"1 cup flour\n2 eggs\n..."}
          />
        </label>

        <label>
          Steps
          <textarea
            rows={6}
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            placeholder={"Preheat oven...\nMix...\nBake..."}
          />
        </label>

        <label>
          Image
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>

        <button disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </form>

      {message && <p style={{ marginTop: 12 }}>{message}</p>}

      {/* ✅ Fixed: use Next <Link> instead of <a> */}
      <p style={{ marginTop: 16 }}>
        <Link href="/recipes">Go to /recipes →</Link>
      </p>
    </main>
  );
}
