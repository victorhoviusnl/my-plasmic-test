import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-side key; do NOT expose
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { title, total_minutes, tags, ingredients, steps, image_path } = req.body ?? {};
    if (!title) return res.status(400).json({ error: "title required" });
    if (!image_path) return res.status(400).json({ error: "image_path required" });

    const { error } = await supabase.from("recipes").insert({
      title,
      total_minutes: total_minutes ? Number(total_minutes) : null,
      tags,
      ingredients,
      steps,
      image_path
    });
    if (error) throw error;

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || String(e) });
  }
}
