// pages/api/recipes/create.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    title,
    total_minutes,
    tags,
    steps,
    image_path,
    ingredients_list
  } = req.body;

  if (!title || !Array.isArray(ingredients_list) || ingredients_list.length === 0) {
    return res.status(400).json({ error: 'Missing title or ingredients_list' });
  }

  // Insert the main recipe
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .insert([
      {
        title,
        total_minutes,
        tags,
        steps,
        image_path
      }
    ])
    .select()
    .single();

  if (recipeError) {
    return res.status(500).json({ error: 'Failed to insert recipe', details: recipeError });
  }

  for (const ing of ingredients_list) {
    const name = (ing.name || '').trim().toLowerCase();
    const unit = ing.unit?.trim() || null;
    const amount = ing.amount?.trim() || null;

    if (!name) continue;

    // 1. Insert or get the ingredient by name (case-insensitive)
    const { data: existing, error: lookupError } = await supabase
      .from('ingredients')
      .select('id')
      .ilike('name', name)
      .maybeSingle();

    let ingredient_id = existing?.id;

    if (!ingredient_id) {
      const { data: newIng, error: insertError } = await supabase
        .from('ingredients')
        .insert([{ name }])
        .select()
        .single();
      if (insertError) {
        return res.status(500).json({ error: 'Failed to insert ingredient', details: insertError });
      }
      ingredient_id = newIng.id;
    }

    // 2. Link ingredient to recipe
    const { error: linkError } = await supabase.from('recipe_ingredients').insert([
      {
        recipe_id: recipe.id,
        ingredient_id,
        amount,
        unit
      }
    ]);

    if (linkError) {
      return res.status(500).json({ error: 'Failed to link ingredient', details: linkError });
    }
  }

  return res.status(200).json({ success: true, recipeId: recipe.id });
}
