import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!   // server-only!
);

const BUCKET = process.env.NEXT_PUBLIC_RECIPE_BUCKET || "recipe-images"; 
const EXPIRY_SECONDS = 60; // geldigheid van de signed URL

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const raw = req.query.path;
    const path = Array.isArray(raw) ? raw.join("/") : String(raw || "");

    if (!path) return res.status(400).send("Missing path");

    // 🔍 DEBUG BLOCK START
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" });
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return res.status(500).json({ error: "Missing NEXT_PUBLIC_SUPABASE_URL" });
    }
    console.log("IMG DEBUG", { BUCKET, path });
    // 🔍 DEBUG BLOCK END

    const { data, error } = await supabase
      .storage
      .from(BUCKET)
      .createSignedUrl(path, EXPIRY_SECONDS);


    if (error || !data?.signedUrl) {
      return res.status(404).send("Not found");
    }

    // 302 redirect naar de tijdelijke URL (browser / <img> volgt vanzelf)
    res.setHeader("Cache-Control", "no-store");
    return res.redirect(302, data.signedUrl);
  } catch (e: any) {
    return res.status(500).send(e.message || "Server error");
  }
}
