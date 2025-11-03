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
    ingredients,
    steps,
    image_path
  } = req.body;

  if (!title || !ingredients) {
    return res.status(400).json({ error: 'Missing title or ingredients' });
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

  // Process comma-separated ingredients
  const parsedIngredients = ingredients
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(str => {
      const parts = str.trim().split(' ');
      const amount = parseFloat(parts[0]) || null;
      const unit = parts.length > 2 ? parts[1] : null;
      const name = parts.slice(unit ? 2 : 1).join(' ').toLowerCase();
      return { amount, unit, name };
    });

  for (const ing of parsedIngredients) {
    // 1. Insert or get the ingredient
    const { data: existing, error: lookupError } = await supabase
      .from('ingredients')
      .select('id')
      .ilike('name', ing.name)
      .maybeSingle();

    let ingredient_id = existing?.id;

    if (!ingredient_id) {
      const { data: newIng, error: insertError } = await supabase
        .from('ingredients')
        .insert([{ name: ing.name }])
        .select()
        .single();
      if (insertError) {
        return res.status(500).json({ error: 'Failed to insert ingredient', details: insertError });
      }
      ingredient_id = newIng.id;
    }

    // 2. Insert into recipe_ingredients
    const { error: linkError } = await supabase.from('recipe_ingredients').insert([
      {
        recipe_id: recipe.id,
        ingredient_id,
        amount: ing.amount,
        unit: ing.unit
      }
    ]);

    if (linkError) {
      return res.status(500).json({ error: 'Failed to link ingredient', details: linkError });
    }
  }

  return res.status(200).json({ success: true, recipeId: recipe.id });
}
